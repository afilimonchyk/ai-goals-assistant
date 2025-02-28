/**
 * Модуль для управления чатом и отображения сообщений
 */

/**
 * Добавляет сообщение в окно чата
 *
 * @param {string} text - Текст сообщения
 * @param {string} sender - Отправитель (user или bot)
 * @param {string} timestamp - Временная метка
 */
function addMessage(text, sender, timestamp) {
  const chat = document.getElementById("chat");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  // Создаем содержимое сообщения с таймстемпом
  messageDiv.innerHTML = `
      <div class="message-text">${text}</div>
      <div class="timestamp">${timestamp}</div>
    `;

  // Добавляем возможность копирования сообщения
  messageDiv.addEventListener("dblclick", function () {
    copyToClipboard(text);
  });

  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight; // Автоматическая прокрутка
}

/**
 * Отображает сохраненную историю чата
 *
 * @param {Array} chatHistory - Массив сообщений для отображения
 */
function displayChatHistory(chatHistory) {
  chatHistory.forEach((msg) => {
    // Проверяем, есть ли у сообщения таймстемп, если нет - добавляем текущее время
    const timestamp = msg.timestamp || getCurrentTimestamp();
    addMessage(
      formatMessage(msg.content),
      msg.role === "user" ? "user" : "bot",
      timestamp
    );
  });
}

/**
 * Копирует текст в буфер обмена
 *
 * @param {string} text - Текст для копирования
 */
function copyToClipboard(text) {
  // Удаляем HTML-теги для получения чистого текста
  const plainText = text.replace(/<\/?[^>]+(>|$)/g, "");

  navigator.clipboard.writeText(plainText).then(
    function () {
      // Показываем уведомление об успешном копировании
      alert("Текст скопирован в буфер обмена");
    },
    function (err) {
      console.error("Не удалось скопировать текст: ", err);
    }
  );
}

/**
 * Получает текущее время в формате ЧЧ:ММ
 *
 * @returns {string} Текущее время в формате ЧЧ:ММ
 */
function getCurrentTimestamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Добавляет индикатор набора текста
 *
 * @returns {HTMLElement} Элемент индикатора
 */
function addTypingIndicator() {
  const chat = document.getElementById("chat");
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "typing");
  typingDiv.innerText = "Arfi is typing...";
  chat.appendChild(typingDiv);
  chat.scrollTop = chat.scrollHeight; // Автоматическая прокрутка
  return typingDiv;
}

/**
 * Удаляет индикатор набора текста
 *
 * @param {HTMLElement} typingDiv - Элемент индикатора
 */
function removeTypingIndicator(typingDiv) {
  if (typingDiv) {
    typingDiv.remove();
  }
}
