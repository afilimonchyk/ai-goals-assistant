/**
 * Chat module for managing chat messages and UI interactions
 */

/**
 * Adds a message to the chat window with UI enhancements
 */
function addMessage(text, sender, timestamp) {
  const chat = document.getElementById("chat");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);

  messageDiv.innerHTML = `
      <div class="message-content">
        <span class="message-text">${text}</span>
        <span class="copy-icon" title="Copy">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
</span>
      </div>
      <div class="timestamp">${timestamp}</div>
    `;

  messageDiv.querySelector(".copy-icon").addEventListener("click", function () {
    copyToClipboard(text, messageDiv);
  });

  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight; // Auto-scroll to the latest message

  setTimeout(() => {
    messageDiv.classList.add("visible"); // Smooth message appearance
  }, 10);
}

/**
 * Displays saved chat history with UI improvements
 */
function displayChatHistory(chatHistory) {
  chatHistory.forEach((msg) => {
    const timestamp = msg.timestamp || getCurrentTimestamp();
    addMessage(
      formatMessage(msg.content),
      msg.role === "user" ? "user" : "bot",
      timestamp
    );
  });
}

// Делаем функцию глобальной
window.displayChatHistory = displayChatHistory;

/**
 * Copies message text to clipboard with notification
 */
function copyToClipboard(text, messageDiv) {
  const plainText = text.replace(/<\/?[^>]+(>|$)/g, "");
  navigator.clipboard.writeText(plainText).then(
    function () {
      showCopyNotification(messageDiv);
    },
    function (err) {
      console.error("Copy failed: ", err);
    }
  );
}

/**
 * Shows a notification when text is copied
 */
function showCopyNotification(messageDiv) {
  const notification = document.createElement("div");
  notification.classList.add("copy-notification");
  notification.innerText = "Copied!";
  messageDiv.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 500);
  }, 1000);
}

/**
 * Gets the current time in HH:MM format
 */
function getCurrentTimestamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Adds a typing indicator to the chat with smooth animation
 */
function addTypingIndicator() {
  const chat = document.getElementById("chat");
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("message", "typing");
  typingDiv.innerHTML = `<span class="typing-dots">...</span>`;
  chat.appendChild(typingDiv);
  chat.scrollTop = chat.scrollHeight;
  return typingDiv;
}

/**
 * Removes the typing indicator
 */
function removeTypingIndicator(typingDiv) {
  if (typingDiv) {
    typingDiv.remove();
  }
}
