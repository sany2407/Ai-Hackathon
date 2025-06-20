from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain.tools import Tool
from speech_to_text_tool import transcribe_audio
from dotenv import load_dotenv
import os
from typing import List, Optional, Dict, Any
from langchain.chat_models import init_chat_model
from langchain_core.messages import BaseMessage
from executor import executor_tool
from summary import summary_tool
from repair import repair_tool
from ChromaDb import store_html_in_chromadb, retrieve_html_from_chromadb
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
load_dotenv()
# Set up environment and LLM
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
llm = init_chat_model("google_genai:gemini-1.5-flash")

# Define the speech-to-text tool
speech_to_text = Tool(
    name="speech_to_text",
    description="Transcribes an audio file to text. Input is the path to an audio file.",
    func=transcribe_audio
)

# Define the store_html tool for RAG
store_html_tool = Tool(
    name="store_html_in_chromadb",
    description="Stores HTML content in ChromaDB for retrieval-augmented generation. Input: html_content (str), doc_id (str), metadata (dict, optional).",
    func=lambda html_content, doc_id, metadata=None: store_html_in_chromadb(html_content, doc_id, metadata)
)

# Define the retrieve_html tool for RAG
retrieve_html_tool = Tool(
    name="retrieve_html_from_chromadb",
    description="Retrieves relevant HTML/content from ChromaDB based on a query string. Input: query (str), n_results (int, optional).",
    func=lambda query, n_results=3: retrieve_html_from_chromadb(query, n_results)
)

# Add all tools
tools = [speech_to_text, store_html_tool, retrieve_html_tool, executor_tool, summary_tool, repair_tool]
llm_with_tools = llm.bind_tools(tools)

# System prompt for the LLM
SYSTEM_PROMPT = (
    "You are an agentic website builder assistant. "
    "If you receive an audio file, use the speech_to_text tool to transcribe it before responding. "
    "If you need context or examples from previous HTML or commands, use the retrieve_html_from_chromadb tool. "
    "Use tools as needed to answer user requests. "
    "You have access to the following tools: "
    "- speech_to_text: Transcribe audio files. "
    "- store_html_in_chromadb: Store HTML for RAG. "
    "- retrieve_html_from_chromadb: Retrieve HTML for context. "
    "- execute_dom_operation: Edit the DOM. "
    "- generate_changelog_entry: Log changes. "
    "- feedback_and_repair: Check and repair layout issues. "
    "Always use the most appropriate tool for the user's request before replying."
)

# Define State and graph_builder before usage
class State(TypedDict):
    messages: Annotated[list, add_messages]

graph_builder = StateGraph(State)

def chatbot(state: State):
    # Always prepend the system prompt if not present
    messages = state["messages"]
    # Check if the first message is a dict or a BaseMessage
    first_message = messages[0] if messages else None
    is_system = False
    if first_message:
        if isinstance(first_message, dict):
            is_system = first_message.get("role") == "system"
        elif isinstance(first_message, BaseMessage):
            is_system = getattr(first_message, "role", None) == "system"
    if not messages or not is_system:
        # Prepend system prompt as a dict
        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
    return {"messages": [llm_with_tools.invoke(messages)]}

# Add chatbot node to the graph
graph_builder.add_node("chatbot", chatbot)
# Add entrypoint edge from START to chatbot
graph_builder.add_edge(START, "chatbot")

# Add tools node and conditional edges
from langgraph.prebuilt import ToolNode, tools_condition
tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)
graph_builder.add_conditional_edges("chatbot", tools_condition)
graph_builder.add_edge("tools", "chatbot")

graph = graph_builder.compile()

def stream_graph_updates(user_input: str):
    for event in graph.stream({"messages": [{"role": "user", "content": user_input}]}):
        for value in event.values():
            print("Assistant:", value["messages"][-1].content)

# --- FastAPI app for LangGraph chatbot ---
app = FastAPI()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

class StoreHtmlRequest(BaseModel):
    html_content: str
    doc_id: str
    metadata: Optional[Dict[str, Any]] = None

@app.post("/chat")
async def chat(request: ChatRequest):
    inputs = {"messages": [m.dict() for m in request.messages]}
    assistant_replies = []
    tool_results = []
    for event in graph.stream(inputs):
        for value in event.values():
            msg = value["messages"][-1]
            # If the message is a tool result, collect it
            if hasattr(msg, 'tool_call_id') or (isinstance(msg, dict) and msg.get('tool_call_id')):
                content = msg.content if hasattr(msg, 'content') else msg.get('content')
                tool_results.append(content)
            else:
                content = msg.content if hasattr(msg, 'content') else msg.get('content')
                assistant_replies.append(content)
    return {"reply": assistant_replies[-1] if assistant_replies else "", "tool_results": tool_results}

@app.post("/store_html")
async def store_html(request: StoreHtmlRequest):
    result = store_html_in_chromadb(request.html_content, request.doc_id, request.metadata)
    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "serve":
        uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
    else:
        while True:
            try:
                user_input = input("User: ")
                if user_input.lower() in ["quit", "exit", "q"]:
                    print("Goodbye!")
                    break
                stream_graph_updates(user_input)
            except Exception as e:
                # fallback if input() is not available
                user_input = "What do you know about LangGraph?"
                print("User: " + user_input)
                stream_graph_updates(user_input)
                break