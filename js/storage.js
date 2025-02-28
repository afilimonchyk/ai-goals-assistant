console.log("storage.js загружен!"); // Отладочное сообщение

function loadChatHistory() {
  console.log("Функция loadChatHistory вызвана!"); // Отладка
  const savedHistory = localStorage.getItem("chatHistory");
  return savedHistory ? JSON.parse(savedHistory) : [];
}

/**
 * Сохраняет историю чата в локальное хранилище
 *
 * @param {Array} chatHistory - Массив сообщений для сохранения
 */
function saveChatHistory(chatHistory) {
  // Проверяем размер данных перед сохранением
  const historyString = JSON.stringify(chatHistory);
  const sizeInMB = historyString.length / (1024 * 1024);

  // Если размер превышает 4.5 МБ (близко к лимиту localStorage в 5 МБ),
  // удаляем старые сообщения
  if (sizeInMB > 4.5) {
    // Оставляем только последние 50 сообщений
    chatHistory = chatHistory.slice(-50);
    console.warn(
      "Chat history was truncated to prevent exceeding localStorage limits"
    );
  }

  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

/**
 * Очищает историю чата из локального хранилища
 */
function clearChatHistory() {
  localStorage.removeItem("chatHistory");
}
