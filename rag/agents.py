"""
agents.py
---------
Multi-Agent System (MAS) definitions for the AI Student Companion.
Defines specialized agents for OCR, Documents, Retrieval, Tutoring, and Assessment.
"""

import asyncio
from typing import List, Dict, Any, Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from pydantic import ValidationError
import json
import re
from pathlib import Path
from rag.llm_engine import get_llm, with_retry, QuizResponse, FlashcardResponse
from rag.ocr_engine import ocr_process
from rag.document_loader import load_document
from rag.text_splitter import split_documents
from rag.vector_store import similarity_search, add_documents

# ─── Base Agent Class ───────────────────────────────────────────────────────

class BaseAgent:
    def __init__(self, name: str, persona: str):
        self.name = name
        self.persona = persona

    @with_retry(max_retries=3)
    async def _call_llm(self, prompt: str, variables: Dict[str, Any], parser: Any = StrOutputParser()) -> Any:
        llm = get_llm()
        if llm is None:
            from rag.llm_engine import MOCK_RESPONSES
            if "quiz" in self.name.lower(): return MOCK_RESPONSES["quiz"]
            if "flashcard" in self.name.lower(): return MOCK_RESPONSES["flashcards"]
            return f"💡 **DEMO MODE**: {self.persona[:50]}... [Response for {variables.get('question', 'query')}]"

        chat_prompt = ChatPromptTemplate.from_messages([
            ("system", self.persona),
            ("user", prompt)
        ])
        
        # Inject format instructions if parser is a JsonOutputParser
        format_instructions = ""
        if isinstance(parser, JsonOutputParser):
            format_instructions = parser.get_format_instructions()
            variables["format_instructions"] = format_instructions

        chain = chat_prompt | llm | parser
        return await chain.ainvoke(variables)


# ─── Specialized Agents ─────────────────────────────────────────────────────

class OCRAgent(BaseAgent):
    """Extracts text from images and scanned documents."""
    def __init__(self):
        super().__init__(
            name="OCR Agent",
            persona="You are an expert in text recognition and extraction from images."
        )

    async def process(self, file_path: str) -> List[Any]:
        # Offload CPU-bound OCR to a thread to avoid blocking the event loop
        return await asyncio.to_thread(ocr_process, file_path)


class DocumentAgent(BaseAgent):
    """Handles preprocessing, chunking, and document normalization."""
    def __init__(self):
        super().__init__(
            name="Document Agent",
            persona="You are a document processing specialist. You clean, normalize, and split text into meaningful semantic chunks."
        )

    async def ingest(self, file_path: str) -> List[Any]:
        # Offload I/O and CPU-bound loading/chunking
        docs = await asyncio.to_thread(load_document, file_path)
        chunks = await asyncio.to_thread(split_documents, docs)
        return chunks


class RetrievalAgent(BaseAgent):
    """Performs FAISS vector similarity search."""
    def __init__(self):
        super().__init__(
            name="Retrieval Agent",
            persona="You are a search specialist. You find the most relevant pieces of information from the knowledge base using vector similarity."
        )

    async def search(self, query: str, k: int = 5, source_filter: Optional[str] = None, user_id: Optional[str] = None) -> List[Any]:
        # Offload vector similarity search
        return await asyncio.to_thread(similarity_search, query, k=k, source_filter=source_filter, user_id=user_id)


class TutorAgent(BaseAgent):
    """Generates contextual explanations using retrieved information or general knowledge."""
    def __init__(self):
        super().__init__(
            name="Tutor Agent",
            persona=(
                "You are an expert, highly accurate AI Study Tutor (acting like ChatGPT or Gemini). "
                "Your primary directive is to answer ANY question clearly and accurately in any domain. "
                "If relevant study material context is provided, incorporate it. If no context is provided or it lacks the answer, "
                "use your vast general knowledge to provide a comprehensive and accurate answer."
            )
        )

    async def explain(self, question: str, context: str = "") -> str:
        prompt = (
            "Provide a clear, accurate, and relevant answer to the question below.\n"
            "If relevant 'Context' is provided, use it. Otherwise, rely on your general knowledge to answer.\n\n"
            "Context (Optional):\n{context}\n\n"
            "Question: {question}"
        )
        return await self._call_llm(prompt, {"question": question, "context": context})


class QuizAgent(BaseAgent):
    """Creates MCQ assessments from retrieved context or general knowledge."""
    def __init__(self):
        super().__init__(
            name="Quiz Agent", 
            persona=(
                "You are a strict academic assessment expert. Your job is to create highly accurate multiple-choice questions "
                "based on the provided study material, or your general knowledge if the material is omitted/insufficient."
            )
        )

    async def generate(self, context: str = "", topic: str = "General Topic") -> Dict[str, Any]:
        prompt = (
            "Generate exactly 5 high-quality, relevant multiple-choice questions based on the topic below.\n"
            "If 'Material' is provided and relevant, use it to form the questions. Otherwise, rely on your general knowledge.\n\n"
            "{format_instructions}\n\n"
            "Topic: {topic}\n\n"
            "Material (Optional):\n{context}"
        )
        return await self._call_llm(prompt, {"context": context, "topic": topic}, parser=JsonOutputParser(pydantic_object=QuizResponse))


class FlashcardAgent(BaseAgent):
    """Generates study flashcards from context or general knowledge."""
    def __init__(self):
        super().__init__(
            name="Flashcard Agent", 
            persona=(
                "You are an expert memory specialist. Your task is to extract factual, relevant key terms and concepts "
                "from the provided material, or use your general knowledge, to create highly accurate flashcards."
            )
        )

    async def generate(self, context: str = "", topic: str = "General Topic") -> Dict[str, Any]:
        prompt = (
            "Create accurate, bite-sized educational flashcards (Front/Back format) on the topic below.\n"
            "If 'Material' is provided and relevant, extract concepts from it. Otherwise, use your general knowledge.\n\n"
            "{format_instructions}\n\n"
            "Topic: {topic}\n\n"
            "Material (Optional):\n{context}"
        )
        return await self._call_llm(prompt, {"context": context, "topic": topic}, parser=JsonOutputParser(pydantic_object=FlashcardResponse))


# ─── Coordinator Agent ───────────────────────────────────────────────────────

class CoordinatorAgent:
    """The orchestrator that routes tasks between specialized agents."""
    def __init__(self):
        self.ocr_agent = OCRAgent()
        self.doc_agent = DocumentAgent()
        self.retrieval_agent = RetrievalAgent()
        self.tutor_agent = TutorAgent()
        self.quiz_agent = QuizAgent()
        self.flashcard_agent = FlashcardAgent()

    async def handle_ingestion(self, file_path: str, user_id: Optional[str] = None):
        # 1. Check if OCR is needed (only for images)
        from rag.ocr_engine import SUPPORTED_IMAGE_EXTENSIONS
        suffix = Path(file_path).suffix.lower()
        
        chunks = []
        if suffix in SUPPORTED_IMAGE_EXTENSIONS:
            print(f"[Coordinator] Image detected ({suffix}), attempting OCR...")
            chunks = await self.ocr_agent.process(file_path)
        
        # 2. Otherwise use standard document loading
        if not chunks:
            if suffix in SUPPORTED_IMAGE_EXTENSIONS:
                print(f"[Coordinator] OCR failed or returned no text for image.")
            chunks = await self.doc_agent.ingest(file_path)
        
        # 3. Store in Vector Database (offloaded)
        if chunks:
            await asyncio.to_thread(add_documents, chunks, user_id=user_id)
            
        preview = ""
        if chunks:
            # Use a larger window for a richer UI card
            content = chunks[0].page_content
            limit = 500
            if len(content) > limit:
                # Try to end on a space to avoid cutting words
                snippet = content[:limit]
                last_space = snippet.rfind(' ')
                preview = snippet[:last_space].strip() + "..." if last_space > 0 else snippet + "..."
            else:
                preview = content
            
        return len(chunks), preview

    async def handle_ask(self, question: str, k: int = 3, source_filter: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        # 1. Retrieve
        docs = await self.retrieval_agent.search(question, k=k, source_filter=source_filter, user_id=user_id)
        context = "\n\n".join([d.page_content for d in docs])
        
        # 2. Generate
        explanation = await self.tutor_agent.explain(question, context)
        
        return {
            "explanation": explanation,
            "sources": [{"content": d.page_content, "metadata": d.metadata} for d in docs]
        }

    async def handle_quiz(self, topic: str, k: int = 5, user_id: Optional[str] = None) -> Dict[str, Any]:
        docs = await self.retrieval_agent.search(topic, k=k, user_id=user_id)
        context = "\n\n".join([d.page_content for d in docs])
        quiz = await self.quiz_agent.generate(context, topic=topic)
        quiz["sources"] = list(set([d.metadata.get("source_file") for d in docs])) if docs else []
        return quiz

    async def handle_flashcards(self, topic: str, k: int = 5, user_id: Optional[str] = None) -> Dict[str, Any]:
        docs = await self.retrieval_agent.search(topic, k=k, user_id=user_id)
        context = "\n\n".join([d.page_content for d in docs])
        cards = await self.flashcard_agent.generate(context, topic=topic)
        return cards
