# 🤖 Agentic AI-Based Conversational Website Builder

A fully autonomous, voice-driven website editor. Users issue natural language or voice commands (e.g. “Add a testimonials section before the footer”), and the system dynamically maps the intent to DOM-level operations, executes changes, and logs all updates in real-time.

---

## 🏗️ Project Structure

```
/backend      # FastAPI, agent workflow, ChromaDB, speech-to-text, etc.
/talkable     # Next.js frontend, live editor, changelog viewer
```

---

## ✨ Features

* 🎙 **Voice Command Support** — Transcribe audio to actionable commands.
* 🧬 **DOM Manipulation** — Insert, delete, replace, and style HTML elements via natural language.
* 🧠 **ChromaDB RAG** — Store and retrieve HTML patterns for context-aware editing.
* 📝 **Changelog Generation** — Human-readable logs for transparency and undo support.
* 🧰 **Feedback & Repair** — Automatic detection and repair of layout issues.
* 🚀 **Live Editor Frontend** — Real-time preview and changelog viewer.
* 🔥 **FastAPI Backend** — Easy integration with any frontend.

---

## ⚙️ Backend (`/backend`)

### 🔧 Setup

1. Install dependencies:

   ```bash
   pip install fastapi uvicorn chromadb bs4 langchain langgraph
   ```
2. Configure your Google Gemini API key:

   * Edit `app.py` and `speech_to_text_tool.py`.
   * Set your `GOOGLE_API_KEY` as an environment variable or hardcode directly.

---

### 🏃 Run

Run the backend server:

```bash
uvicorn app:app --reload
```

✅ The FastAPI server will be available at:
**[http://localhost:8000](http://localhost:8000)**

---

### 📡 API Endpoints

| Endpoint           | Description                                       |
| ------------------ | ------------------------------------------------- |
| `POST /chat`       | Main endpoint for user messages and agent replies |
| `POST /store_html` | Store HTML content in ChromaDB for RAG            |

---

### 🧰 Tools Available to the Agent

* `speech_to_text`
* `store_html_in_chromadb`
* `retrieve_html_from_chromadb`
* `execute_dom_operation`
* `generate_changelog_entry`
* `feedback_and_repair`

---

## 🎨 Frontend (`/talkable`)

### 🔧 Setup

1. Install dependencies:

   ```bash
   npm install
   ```
2. Configure any environment variables if required.

---

### 🏃 Run

Run the frontend:

```bash
npm run dev
```

✅ The frontend will be available at:
**[http://localhost:3000](http://localhost:3000)**

---

### ✨ Features Recap

✅ Voice input interface
✅ Live preview of the edited site
✅ Real-time changelog viewer
✅ Responsive design for all screen sizes

---

## Architecture Overview



## 🔄 Example Workflow

1. User sends a voice or text command via the frontend.
2. Backend transcribes (if audio), retrieves context, plans, and executes DOM operations.
3. Backend validates and repairs the DOM if needed.
4. Backend generates a changelog entry and returns updated DOM and logs.
5. Frontend updates the live preview and changelog viewer.

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.

---

## 🎉 Happy Building!

Feel free to contribute, raise issues, or suggest enhancements!
