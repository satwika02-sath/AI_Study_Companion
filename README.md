# AI Student Companion 🧠✨

A powerful, agentic AI study platform designed to transform your learning experience. This application uses a Multi-Agent System (MAS) and Retrieval-Augmented Generation (RAG) to provide an intelligent tutor, quiz generator, and flashcard creator.

## 🚀 Key Features

- **🎓 Agentic AI Tutor**: Get clear, accurate explanations for any topic. The tutor leverages both your uploaded study materials and its own general knowledge.
- **📚 Topic-Based Flashcards**: Generate powerful active-recall flashcards simply by entering a topic. No notes required!
- **📝 Smart MCQ Quizzes**: Create challenging multiple-choice questions on any subject to test your knowledge.
- **📂 Repository Explainer**: Clone and analyze entire GitHub repositories. Perform semantic searches over codebases to understand complex logic.
- **🔍 Intelligent RAG Pipeline**: High-performance local vector indexing using **FAISS** for fast and private document retrieval.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS with a premium, modern aesthetic
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Authentication**: Firebase Auth (with robust Windows SSL retry logic)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **AI Orchestration**: LangChain & Custom Multi-Agent System
- **LLM**: Gemini / OpenAI (via OpenRouter)
- **Vector Store**: FAISS
- **OCR**: Tesseract OCR (for image processing)

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Tesseract OCR (installed on your system PATH)

### 2. Environment Setup
Create a `.env.local` file in the root directory with the following variables. 

> [!TIP]
> Use `http://localhost:8000` for `RAG_BACKEND_URL` during local development.

```env
# AI Configuration
AI_API_KEY=your_openrouter_or_gemini_key
OPENROUTER_MODEL=openai/gpt-3.5-turbo

# Firebase Frontend
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Backend Connection
RAG_BACKEND_URL=http://localhost:8000
```

### 3. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python server.py
```
*Note: Ensure you have `firebase-service-account.json` in the root for authenticated backend access.*

### 4. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start studying!

---

## 🔒 Security Note
This project uses Firebase Authentication. Backend endpoints are secured via JWT token verification. Ensure your Service Account credentials are kept private and never committed to version control.

---

## 🛠️ Troubleshooting

### SSL Errors (Windows)
If you encounter `UNEXPECTED_EOF_WHILE_READING` errors during authentication, the backend now includes an automatic retry mechanism to handle these transient network blips.

### Upload Failures
Ensure `docx2txt` is installed in your Python environment for `.docx` support. This is included in `requirements.txt`.
