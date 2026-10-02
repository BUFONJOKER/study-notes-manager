# 📚 Study Notes Manager

Study Notes Manager is an application for creating, organizing, and studying notes with AI-assisted quiz generation. It allows users to create notes and generate quizzes based on them.

## 📊 Project Status

- **Backend:** 🟡 Almost complete
- **Frontend:** 🔴 Not started yet

## 🧩 Main Parts

- `backend/` - ⚙️ FastAPI backend, database models, and AI workflow
- `docs/` - 📝 Project documentation and UI design files

## ⚙️ Backend Development

The backend uses Python, FastAPI, PostgreSQL, SQLAlchemy, and LangChain.

```bash
cd backend
uv venv
uv sync
python -m main
```

### 🤖 AI Workflow

The backend uses AI to process notes through these steps:

```text
Note content
   ↓
AI analysis
   ↓
AI summary
   ↓
Key concepts
   ↓
Quiz questions
```

The AI generates:

- 🧠 Analysis of the note
- 📝 Summary
- 🔑 Key concepts
- ❓ 8–12 quiz questions

The generated quiz is saved with the note in the database.

## 🎨 Frontend

Frontend development is planned but has not started yet.
