from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
import os

# Load environment variables from .env
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize FastAPI app
app = FastAPI()

# Get the absolute path to the current directory (where main.py is located)
current_directory = os.path.dirname(os.path.abspath(__file__))

# Enable CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any domain (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model; messages are expected in the format:
# { role: "user"|"assistant", content: "message text" }
class ChatRequest(BaseModel):
    messages: list

@app.post("/ask")
async def ask_openai(chat_request: ChatRequest):
    """
    Receives chat messages in the proper format and sends them to OpenAI.
    """
    try:
        # Directly pass the already formatted messages to OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=chat_request.messages
        )
        # Return the AI's response to the frontend
        return {"answer": response.choices[0].message.content}
    except Exception as e:
        # Return error details with HTTP 500 if something goes wrong
        raise HTTPException(status_code=500, detail=str(e))

# Serve static files (HTML, CSS, JS) from the same directory as main.py
app.mount("/", StaticFiles(directory=current_directory, html=True), name="static")
