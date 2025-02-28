/**
 * Модуль для взаимодействия с API
 */

/**
 * Отправляет запрос к API с сообщениями пользователя
 *
 * @param {Array} messages - Массив сообщений для отправки
 * @returns {Promise} Промис с ответом от API
 */
async function sendMessageToAPI(messages) {
  try {
    const response = await fetch("http://127.0.0.1:8000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
