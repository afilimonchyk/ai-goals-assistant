from fastapi import FastAPI, HTTPException  # Импортируем FastAPI и HTTPException для обработки ошибок
from fastapi.middleware.cors import CORSMiddleware  # Импортируем CORSMiddleware для поддержки CORS
from pydantic import BaseModel            # Импортируем BaseModel для описания структуры входных данных
import openai                             # Импортируем библиотеку openai
from dotenv import load_dotenv            # Импортируем функцию загрузки переменных окружения
import os                                 # Импортируем модуль os для работы с переменными окружения

# Загружаем переменные окружения из файла .env
load_dotenv()

# Получаем API-ключ из переменной окружения
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()  # Создаем экземпляр приложения

# Добавляем поддержку CORS, чтобы разрешить предварительные запросы (OPTIONS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # разрешает запросы с любого источника; для продакшена укажи конкретные адреса
    allow_credentials=True,
    allow_methods=["*"],  # разрешены все методы (GET, POST, OPTIONS и т.д.)
    allow_headers=["*"],
)

# Модель данных для входящего запроса
class Prompt(BaseModel):
    prompt: str  # Ожидается, что пользователь пришлет строку с запросом

# Маршрут для отправки запроса к OpenAI
@app.post("/ask")
async def ask_openai(prompt: Prompt):
    """
    Эта функция принимает запрос с полем prompt, отправляет его к OpenAI и возвращает ответ модели.
    """
    try:
        # Отправляем запрос к API OpenAI, используя модель GPT-3.5 Turbo
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt.prompt}
            ]
        )
        # Извлекаем текст ответа
        answer = response.choices[0].message.content
        return {"answer": answer}
    except Exception as e:
        # Если что-то пошло не так, возвращаем ошибку
        raise HTTPException(status_code=500, detail=str(e))
