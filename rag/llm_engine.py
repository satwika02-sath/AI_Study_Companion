"""
llm_engine.py
-------------
LLM integration for the AI Study Companion.
Handles the interaction with Google Gemini or OpenAI.

Framework: LangChain
Model: gemini-1.5-flash (default) or gpt-4o-mini
"""

import os
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser

# Load environment variables (API keys)
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


def get_llm(model_name: str = "gemini-1.5-flash", temperature: float = 0.2):
    """
    Initialize and return a LangChain ChatModel.
    """
    google_api_key = os.getenv("GOOGLE_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")

    if google_api_key:
        print(f"[LLMEngine] Using Google Gemini model: {model_name}")
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=google_api_key,
            temperature=temperature,
        )
    elif openai_api_key:
        print(f"[LLMEngine] Using OpenAI model: gpt-4o-mini")
        return ChatOpenAI(
            model="gpt-4o-mini",
            openai_api_key=openai_api_key,
            temperature=temperature,
        )
    else:
        return None


def explain_with_context(
    question: str, 
    context: str, 
    model_name: str = "gemini-1.5-flash"
) -> str:
    """
    Explains a concept based on retrieved context.
    """
    llm = get_llm(model_name=model_name)
    if llm is None:
        return "⚠️ Error: AI API keys missing."

    chain = TUTOR_PROMPT | llm | StrOutputParser()
    try:
        return chain.invoke({"user_question": question, "retrieved_notes": context})
    except Exception as e:
        print(f"[LLMEngine] Error in tutor mode: {e}")
        return f"⚠️ Error consulting the AI: {str(e)}"


def generate_quiz_response(context: str) -> dict:
    """
    Generate 5 MCQs from the given context using JsonOutputParser.
    """
    llm = get_llm(temperature=0.7)
    if llm is None:
        return {"error": "API Key missing"}

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
    Generate flashcards from the given context using JsonOutputParser.
    """
    llm = get_llm(temperature=0.4)
    if llm is None:
        return {"error": "API Key missing"}

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
