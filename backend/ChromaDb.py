# ChromaDb.py
import chromadb
from chromadb.utils import embedding_functions

# Initialize ChromaDB client and collection
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("html_docs")

# Use a simple embedding function (replace with your own for production)
embedding_fn = embedding_functions.DefaultEmbeddingFunction()

def store_html_in_chromadb(html_content: str, doc_id: str, metadata: dict = None):
    """
    Stores HTML content in ChromaDB as a vector.
    """
    if metadata is None:
        metadata = {}
    collection.add(
        documents=[html_content],
        metadatas=[metadata],
        ids=[doc_id],
        embeddings=[embedding_fn([html_content])[0]]
    )
    return {"status": "success", "id": doc_id}

def retrieve_html_from_chromadb(query: str, n_results: int = 3):
    """
    Retrieves relevant HTML/content from ChromaDB based on a query string.
    """
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    docs = results.get('documents', [[]])[0]
    metadatas = results.get('metadatas', [[]])[0]
    return {"documents": docs, "metadatas": metadatas}