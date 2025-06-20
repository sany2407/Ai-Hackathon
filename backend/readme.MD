# Agentic Website Builder

A fully autonomous, voice-driven website editor powered by LangGraph, LangChain, and ChromaDB. Users can issue natural language or voice commands (e.g., "Add a testimonials section before the footer"), and the system dynamically maps the intent to DOM-level operations, executes changes, and logs all updates in real-time.

## Features

- **Voice Command Support:** Transcribe audio to actionable commands.
- **DOM Manipulation:** Insert, delete, replace, and style HTML elements via natural language.
- **ChromaDB RAG:** Store and retrieve HTML patterns for context-aware editing.
- **Changelog Generation:** Human-readable logs for transparency and undo support.
- **Feedback & Repair:** Automatic detection and repair of layout issues.
- **FastAPI Backend:** Easy integration with any frontend.

## Project Structure

```
backend/
  app.py                # Main FastAPI app and agent workflow
  executor.py           # DOM operation tool
  repair.py             # Feedback & repair tool
  summary.py            # Changelog tool
  speech_to_text_tool.py# Speech-to-text tool
  ChromaDb.py           # ChromaDB storage/retrieval tools
  audio.mp3             # Example audio file
  chroma_db/            # ChromaDB persistent storage
```

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   (Make sure you have `langchain`, `langgraph`, `chromadb`, `fastapi`, `uvicorn`, `bs4`, etc.)
3. **Set your Google Gemini API key**
   - Edit `app.py` and `speech_to_text_tool.py` to set your `GOOGLE_API_KEY`.
4. **Run the backend server**
   ```bash
   python app.py serve
   ```
   The FastAPI server will be available at `http://localhost:8000`.

## API Usage

### `/chat` (POST)

- **Description:** Main endpoint for sending user messages and receiving agent replies.
- **Request Body:**
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "Add a testimonials section before the footer"
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "reply": "...agent's response...",
    "tool_results": ["...tool outputs..."]
  }
  ```

### `/store_html` (POST)

- **Description:** Store HTML content in ChromaDB for RAG.
- **Request Body:**
  ```json
  {
    "html_content": "<html>...</html>",
    "doc_id": "unique_id",
    "metadata": { "user": "alice" }
  }
  ```
- **Response:**
  ```json
  { "status": "success", "id": "unique_id" }
  ```

## Tools Available to the Agent

- **speech_to_text:** Transcribe audio files to text.
- **store_html_in_chromadb:** Store HTML for retrieval-augmented generation.
- **retrieve_html_from_chromadb:** Retrieve HTML for context and RAG.
- **execute_dom_operation:** Edit the DOM (insert, delete, replace, style, etc.).
- **generate_changelog_entry:** Log changes for transparency and undo.
- **feedback_and_repair:** Check and repair layout issues in the DOM.

## Example Workflow

1. User sends a voice or text command to `/chat`.
2. Agent transcribes (if audio), retrieves context, plans, and executes DOM operations.
3. Agent validates and repairs the DOM if needed.
4. Agent generates a changelog entry and returns the updated DOM and logs.

## License

MIT
