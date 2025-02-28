from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
import os

# Load environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize FastAPI app
app = FastAPI()

# Получаем абсолютный путь к текущей папке (где находится main.py)
current_directory = os.path.dirname(os.path.abspath(__file__))

# Enable CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any domain (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model
class ChatRequest(BaseModel):
    messages: list  # Expecting a list of messages (chat history)

# Endpoint to handle chat messages
@app.post("/ask")
async def ask_openai(chat_request: ChatRequest):
    """
    Receives chat history, sends it to OpenAI, and returns the AI response.
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=chat_request.messages
        )
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Раздаем статические файлы (HTML, CSS, JS) из той же папки, где лежит main.py
app.mount("/", StaticFiles(directory=current_directory, html=True), name="static")
