"""
llm_engine.py
-------------
LLM integration for the AI Study Companion.
Handles the interaction with Google Gemini or OpenAI.

Framework: LangChain
Model: gemini-1.5-flash (default) or gpt-4o-mini
"""

import os
import asyncio
import time
from typing import List, Optional
from functools import wraps
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ─── Pydantic Models for Structured Output ────────────────────────────────────

class QuizOption(BaseModel):
    label: str = Field(description="Option label (e.g. A, B, C, D)")
    text: str = Field(description="Content of the option")

class QuizQuestion(BaseModel):
    question: str = Field(description="The multiple choice question text")
    options: List[str] = Field(description="List of 4 possible options")
    correct_answer: str = Field(description="The exact text of the correct option")
    explanation: Optional[str] = Field(description="Brief explanation of why this answer is correct")

class QuizResponse(BaseModel):
    quiz: List[QuizQuestion] = Field(description="List of exactly 5 multiple choice questions")

class Flashcard(BaseModel):
    front: str = Field(description="Question or concept name on the front")
    back: str = Field(description="Answer or explanation on the back")

class FlashcardResponse(BaseModel):
    flashcards: List[Flashcard] = Field(description="List of generated flashcards")

# The user's exact prompt template
TUTOR_PROMPT_TEMPLATE = """
You are an AI tutor.

Using the provided study material, explain the concept clearly for students.

Context:
{retrieved_notes}

Question:
{user_question}

Return a clear explanation suitable for students.
"""

TUTOR_PROMPT = PromptTemplate.from_template(TUTOR_PROMPT_TEMPLATE)

# --- Quiz Prompt ---
QUIZ_PROMPT_TEMPLATE = """
You are an expert educator.
Generate exactly 5 multiple choice questions from the provided study material.
Each question must have 4 distinct options and one clear correct answer.

Study Material:
{context}

Format the output as a JSON object matching this schema:
{{
  "quiz": [
    {{
      "question": "...",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_answer": "Option X",
      "explanation": "..."
    }}
  ]
}}
"""
QUIZ_PROMPT = PromptTemplate.from_template(QUIZ_PROMPT_TEMPLATE)

# --- Flashcard Prompt ---
FLASHCARD_PROMPT_TEMPLATE = """
Convert the following study material into educational flashcards.
Each flashcard should follow a "Front: Question, Back: Answer" format.
Ensure the cards are concise and cover key concepts.

Study Material:
{context}

Format the output as a JSON object matching this schema:
{{
  "flashcards": [
    {{
      "front": "Question?",
      "back": "Answer"
    }}
  ]
}}
"""
FLASHCARD_PROMPT = PromptTemplate.from_template(FLASHCARD_PROMPT_TEMPLATE)


# ── Demo / Mock Data (Fallback when API keys are missing) ──────────────────────

MOCK_RESPONSES = {
    "tutor": "Based on the material provided, I've analyzed the concept of {concept}. This is a critical building block in your current study path. For example, when you work with this, you're essentially orchestrating different components to work in harmony. Think of it like a conductor leading an orchestra, where each part (the data, the logic, and the user interface) has its specific timing and role to play. Does this help clarify how it fits into the bigger picture?",
    
    "quiz": {
        "quiz": [
            {
                "question": "What is the primary objective of this module?",
                "options": ["To store data", "To analyze patterns", "To bridge components", "To manage users"],
                "correct_answer": "To bridge components",
                "explanation": "This module acts as a connector between different system layers, ensuring smooth data flow."
            },
            {
                "question": "Which framework is used for semantic search in this system?",
                "options": ["FAISS", "Vercel", "SQLite", "CSV"],
                "correct_answer": "FAISS",
                "explanation": "FAISS (Facebook AI Similarity Search) is the core engine for indexing and searching your code or notes."
            },
            {
                "question": "What is the default chunk size for document splitting?",
                "options": ["100 characters", "500 characters", "1000 characters", "5000 characters"],
                "correct_answer": "1000 characters",
                "explanation": "Splitting text into 1000-character segments ensures a balance between detail and speed."
            },
            {
                "question": "How are PDF files processed in the backend?",
                "options": ["Manually", "Using PyPDF2/LangChain", "OCR only", "Converted to Image"],
                "correct_answer": "Using PyPDF2/LangChain",
                "explanation": "LangChain's document loaders handle the text extraction from your PDF uploads."
            },
            {
                "question": "What is the role of the FastAPI server?",
                "options": ["Frontend UI", "Database Store", "Business Logic API", "Authentication Only"],
                "correct_answer": "Business Logic API",
                "explanation": "FastAPI provides the RESTful interface for the frontend to communicate with our AI models."
            }
        ]
    },

    "flashcards": {
        "flashcards": [
            {"front": "What does RAG stand for?", "back": "Retrieval-Augmented Generation – a technique that combines retrieval and generation for better AI answers."},
            {"front": "What is the primary vector store used?", "back": "FAISS (Facebook AI Similarity Search)."},
            {"front": "How are code files parsed?", "back": "Using LangChain's LanguageParser with specialized splitters for Python, JS, and TS."},
            {"front": "Is this application running locally?", "back": "Yes, it uses a local vector store and can run with local embedding models."},
            {"front": "What is the role of the Topbar?", "back": "Navigation and global application state management."}
        ]
    },

    "repo_architecture": """### 🏗️ Repository Architecture: {repo_name}

Based on the scanned codebase, here is the architectural breakdown:

#### 1. Project Summary
This is a **high-modularity application Shell** designed for {repo_name}. It leverages a modern stack combining a **Next.js frontend** for interactive experience and a **FastAPI backend** for high-performance data processing. The core focus is on bridging internal logic with external AI services.

#### 2. Important Files (Top 7)
- `src/app/page.tsx`: The main entry point and landing page.
- `src/components/layout/topbar.tsx`: Central navigation and responsive layout logic.
- `server.py`: The robust FastAPI engine orchestrating all REST endpoints.
- `rag/rag_pipeline.py`: The central hub for the Retrieval-Augmented Generation logic.
- `rag/llm_engine.py`: Encapsulates AI model selection and prompt management.
- `rag/vector_store.py`: Manages local FAISS indexes and semantic search retrieval.
- `package.json`: Manages the complex dependency graph of the frontend.

#### 3. System Architecture & Interaction
1. **The Retrieval Layer**: When a user inputs a query, the system queries the `rag/vector_store` to find semantically relevant code or note snippets.
2. **The Generation Layer**: These snippets are passed to the `llm_engine` to ground the AI's explanation in real codebase context.
3. **The Global State**: The Next.js frontend synchronizes these processes in real-time to provide a seamless 'wait' experience during analysis.

*This report was generated in **Demo Mode** using the codebase patterns detected.*"""
}


# ─── Robust AI Request Wrapper ───────────────────────────────────────────────

def with_retry(max_retries: int = 3, initial_delay: float = 1.0):
    """
    Decorator for adding exponential backoff and error handling to AI calls.
    Handles 429 (Resource Exhausted) with retries.
    Handles 401, 403 by logging and raising specific errors.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            delay = initial_delay
            last_err = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    err_msg = str(e)
                    last_err = e
                    
                    if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                        if attempt < max_retries:
                            print(f"[LLMEngine] Quota Exceeded (429). Retrying in {delay}s... (Attempt {attempt+1}/{max_retries})")
                            await asyncio.sleep(delay)
                            delay *= 2  # Exponential backoff
                            continue
                    
                    if "401" in err_msg or "invalid_api_key" in err_msg.lower():
                        print("[LLMEngine] CRITICAL: Invalid API Key (401).")
                    elif "403" in err_msg:
                        print("[LLMEngine] CRITICAL: Unauthorized access (403).")
                    
                    # Rethrow for logic handling in agents
                    raise last_err
            raise last_err
        return wrapper
    return decorator

# ─── Global LLM Cache ────────────────────────────────────────────────────────
_llm_cache = {}

def get_llm(model_name: Optional[str] = None, temperature: float = 0.2):
    """
    Initialize and return a LangChain ChatModel.
    Standardized to use AI_API_KEY and OPENROUTER_MODEL from environment.
    """
    # Prioritize: argument > env var > hardcoded default
    if not model_name:
        model_name = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-lite-preview-02-05:free")
    
    cache_key = (model_name, temperature)
    if cache_key in _llm_cache:
        return _llm_cache[cache_key]

    api_key = os.getenv("AI_API_KEY")
    
    if not api_key:
        print("[LLMEngine] FATAL: Missing AI_API_KEY environment variable.")
        raise RuntimeError("AI_API_KEY missing from environment. Application cannot start AI services.")

    print(f"[LLMEngine] Initializing OpenRouter model: {model_name}")
    llm = ChatOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
        model=model_name,
        temperature=temperature,
    )
    
    _llm_cache[cache_key] = llm
    return llm


# Note: The functions below are legacy wrappers. 
# The application now primarily uses the Multi-Agent System in rag/agents.py
# which calls get_llm() directly with AI_API_KEY.

def explain_with_context(
    question: str, 
    context: str, 
    model_name: str = "google/gemini-2.0-flash-lite-preview-02-05:free"
) -> str:
    """
    Explains a concept based on retrieved context.
    Uses MOCK mode if no LLM is configured.
    """
    llm = get_llm(model_name=model_name)
    if llm is None:
        # Generate a slightly dynamic mock based on the question
        return f"💡 **DEMO MODE**: {MOCK_RESPONSES['tutor'].replace('{concept}', question)}"

    chain = TUTOR_PROMPT | llm | StrOutputParser()
    try:
        return chain.invoke({"user_question": question, "retrieved_notes": context})
    except Exception as e:
        print(f"[LLMEngine] Error in tutor mode: {e}")
        return f"⚠️ Error consulting the AI: {str(e)}"


def generate_quiz_response(context: str) -> dict:
    """
    Generate 5 MCQs from the given context.
    Uses MOCK mode if no LLM is configured.
    """
    llm = get_llm(temperature=0.7)
    if llm is None:
        return MOCK_RESPONSES["quiz"]

    parser = JsonOutputParser(pydantic_object=QuizResponse)
    chain = QUIZ_PROMPT | llm | parser

    try:
        return chain.invoke({"context": context})
    except Exception as e:
        print(f"[LLMEngine] Error generating quiz: {e}")
        # Re-try without Pydantic object if there's a validation error
        try:
           parser_fallback = JsonOutputParser()
           chain_fallback = QUIZ_PROMPT | llm | parser_fallback
           return chain_fallback.invoke({"context": context})
        except:
           return {"error": str(e)}


def generate_flashcards_response(context: str) -> dict:
    """
    Generate flashcards from the given context.
    Uses MOCK mode if no LLM is configured.
    """
    llm = get_llm(temperature=0.4)
    if llm is None:
        return MOCK_RESPONSES["flashcards"]

    parser = JsonOutputParser(pydantic_object=FlashcardResponse)
    chain = FLASHCARD_PROMPT | llm | parser

    try:
        return chain.invoke({"context": context})
    except Exception as e:
        print(f"[LLMEngine] Error generating flashcards: {e}")
        try:
           parser_fallback = JsonOutputParser()
           chain_fallback = FLASHCARD_PROMPT | llm | parser_fallback
           return chain_fallback.invoke({"context": context})
        except:
           return {"error": str(e)}
