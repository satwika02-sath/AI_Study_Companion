"""
test_mas_coordinated.py
-----------------------
Test script to verify the 7-agent Multi-Agent System (MAS) in the 
AI Student Companion.
"""

import asyncio
import os
from rag.agents import CoordinatorAgent

async def test_coordinated_pipeline():
    coordinator = CoordinatorAgent()
    
    print("\n" + "="*60)
    print("  MAS COORDINATED PIPELINE TEST")
    print("="*60)

    # 1. Test Retrieval & Tutor Agent
    print("\n[Step 1] Testing Tutor Agent via Coordinator...")
    # Mocking some context for the search (simulating find)
    results = await coordinator.handle_ask("What is a Multi-Agent System?", k=1)
    print(f"Explanation Preview: {results['explanation'][:200]}...")
    
    # 2. Test Quiz Agent
    print("\n[Step 2] Testing Quiz Agent via Coordinator...")
    quiz = await coordinator.handle_quiz("AI Architecture")
    if "quiz" in quiz:
        print(f"Quiz generated with {len(quiz['quiz'])} questions.")
        print(f"First Question: {quiz['quiz'][0]['question']}")
    else:
        print(f"Quiz Error: {quiz.get('error', 'Unknown error')}")

    # 3. Test Flashcard Agent
    print("\n[Step 3] Testing Flashcard Agent via Coordinator...")
    flashcards = await coordinator.handle_flashcards("Software Engineering")
    if "flashcards" in flashcards:
        print(f"Flashcards generated: {len(flashcards['flashcards'])}")
        print(f"First Card Front: {flashcards['flashcards'][0]['front']}")

    print("\n" + "="*60)
    print("  TEST COMPLETED")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(test_coordinated_pipeline())
