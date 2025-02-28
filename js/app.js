/**
 * Основной модуль приложения
 */

// Глобальная переменная для хранения истории чата
let chatHistory = [];

// Инициализация приложения при загрузке страницы
document.addEventListener("DOMContentLoaded", function () {
  // Загружаем историю чата
  chatHistory = loadChatHistory();

  // Отображаем историю чата
  displayChatHistory(chatHistory);

  // Обработчик для кнопки очистки чата
  setupClearButtonHandler();

  // Обработчик для формы отправки сообщений
  setupMessageFormHandler();

  // Обработчик нажатия Enter для отправки сообщений
  setupEnterKeyHandler();
});

/**
 * Настраивает обработчик нажатия клавиши Enter для поля ввода
 */
function setupEnterKeyHandler() {
  document
    .getElementById("userInput")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Предотвращаем стандартное поведение
        document.getElementById("inputForm").dispatchEvent(new Event("submit"));
      }
    });
}

/**
 * Настраивает обработчик для кнопки очистки чата
 */
function setupClearButtonHandler() {
  document.getElementById("clearChat").addEventListener("click", function () {
    if (confirm("Вы уверены, что хотите очистить чат?")) {
      clearChatHistory(); // Очищаем историю в localStorage
      chatHistory = []; // Сбрасываем массив истории
      document.getElementById("chat").innerHTML = ""; // Очищаем UI
    }
  });
}

/**
 * Настраивает обработчик отправки формы
 */
function setupMessageFormHandler() {
  document
    .getElementById("inputForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault(); // Предотвращаем перезагрузку страницы

      const userInput = document.getElementById("userInput").value; // Получаем ввод пользователя
      if (!userInput.trim()) return; // Игнорируем пустые сообщения

      // Получаем текущее время
      const timestamp = getCurrentTimestamp();

      // Отображаем сообщение пользователя
      addMessage(userInput, "user", timestamp);

      // Добавляем сообщение в историю
      chatHistory.push({
        role: "user",
        content: userInput,
        timestamp: timestamp,
      });

      // Сохраняем историю
      saveChatHistory(chatHistory);

      // Очищаем поле ввода
      document.getElementById("userInput").value = "";

      // Показываем индикатор набора текста
      const typingIndicator = addTypingIndicator();

      try {
        // Отправляем запрос к API
        const data = await sendMessageToAPI(chatHistory);

        // Удаляем индикатор набора текста
        removeTypingIndicator(typingIndicator);

        // Получаем новый таймстемп для ответа бота
        const botTimestamp = getCurrentTimestamp();

        // Отображаем ответ бота
        addMessage(
          formatMessage(data.answer || "Ответ не получен"),
          "bot",
          botTimestamp
        );

        // Добавляем ответ бота в историю
        chatHistory.push({
          role: "assistant",
          content: data.answer,
          timestamp: botTimestamp,
        });

        // Сохраняем обновленную историю
        saveChatHistory(chatHistory);
      } catch (error) {
        // Удаляем индикатор набора текста
        removeTypingIndicator(typingIndicator);

        // Отображаем сообщение об ошибке
        const errorTimestamp = getCurrentTimestamp();
        addMessage("Ошибка: " + error.message, "bot", errorTimestamp);
      }
    });
}
