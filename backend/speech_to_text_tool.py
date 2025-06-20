import os
from langchain.chat_models import init_chat_model
import re

def clean_transcription(raw_text: str) -> str:
    """
    Cleans and structures the transcribed text:
    - Removes filler words, background noise artifacts, and non-speech tokens
    - Normalizes whitespace and punctuation
    - Extracts likely command phrasing
    """
    # Remove common filler words (expand as needed)
    fillers = [r"\buh\b", r"\bum\b", r"\ber\b", r"\bah\b", r"\bhmm\b", r"\blike\b", r"\byou know\b", r"\bokay\b", r"\bso\b", r"\bwell\b"]
    text = raw_text.lower()
    for filler in fillers:
        text = re.sub(filler, '', text)
    # Remove non-speech tokens (e.g., [noise], (laughter))
    text = re.sub(r"\[.*?\]|\(.*?\)", '', text)
    # Remove extra whitespace and normalize
    text = re.sub(r"\s+", ' ', text).strip()
    # Capitalize first letter, add period if missing
    if text and not text.endswith('.'):
        text += '.'
    text = text.capitalize()
    return text

def transcribe_audio(audio_file_path: str) -> str:
    """
    Speech-to-Text Agent:
    - Converts spoken input into clean, structured text by filtering background noise and identifying command phrasing.
    - Handles diverse accents and speech styles.
    - Produces clean, readable output.
    Input: Raw voice command (audio file path)
    Output: Clean command text
    """
    os.environ["GOOGLE_API_KEY"] = os.environ.get("GOOGLE_API_KEY", "AIzaSyCU0w3DGO7aoT0g_TVPiM79gFHfc_51M1o")
    llm = init_chat_model("google_genai:gemini-1.5-flash")
    with open(audio_file_path, "rb") as audio_file:
        audio_content = audio_file.read()
        response = llm.invoke({"file": audio_content, "type": "audio"})
        raw_text = response.content if hasattr(response, 'content') else str(response)
        clean_text = clean_transcription(raw_text)
        return clean_text 