<script setup>
// Import necessary modules and components
import { ref, onMounted, watch, onUpdated } from "vue";
import InputForm from "./InputForm.vue";
import { useChatAPI } from "../composables/useChatAPI";

// Refs for messages and chat container
const messages = ref(
  JSON.parse(localStorage.getItem("chatMessages")) || [
    {
      text: "Hello! How can I help you?",
      sender: "bot",
      timestamp: getCurrentTimestamp(),
    },
  ]
);
const chatContainer = ref(null);

// Destructure the API function and loading state
const { sendMessageToAPI, isLoading } = useChatAPI();

// Returns current time in HH:MM format
function getCurrentTimestamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Adds a new message to the chat
const addMessage = async (messageText) => {
  if (!messageText.trim()) return;

  // Push user's message
  messages.value.push({
    text: messageText,
    sender: "user",
    timestamp: getCurrentTimestamp(),
  });

  // Show typing indicator
  messages.value.push({ isTyping: true, sender: "bot" });

  // Send request to the API
  const response = await sendMessageToAPI(messages.value);

  // Remove typing indicator
  messages.value.pop();

  // Check the response and add bot's message
  if (response && response.answer) {
    messages.value.push({
      text: response.answer,
      sender: "bot",
      timestamp: getCurrentTimestamp(),
    });
  } else {
    messages.value.push({
      text: "Error: Invalid response from server",
      sender: "bot",
      timestamp: getCurrentTimestamp(),
    });
  }
};

// Clears the chat and removes stored messages
const clearChat = () => {
  messages.value = [
    {
      text: "Hello! How can I help you?",
      sender: "bot",
      timestamp: getCurrentTimestamp(),
    },
  ];
  localStorage.removeItem("chatMessages");
};

// Copies a message to the clipboard
const copyMessage = (text) => {
  navigator.clipboard.writeText(text);
};

// Auto-scroll to the bottom when messages update
onUpdated(() => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
});

// Watch messages and save them to localStorage
watch(
  messages,
  (newMessages) => {
    localStorage.setItem("chatMessages", JSON.stringify(newMessages));
  },
  { deep: true }
);

// Load messages from localStorage on mount
onMounted(() => {
  const savedMessages = localStorage.getItem("chatMessages");
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages);
  }
});
</script>

<template>
  <div class="chat-wrapper">
    <div class="chat-container">
      <!-- УДАЛЁН ВНУТРЕННИЙ ЗАГОЛОВОК, ЧТОБЫ НЕ ДУБЛИРОВАТЬ -->

      <!-- Chat messages area -->
      <div ref="chatContainer" class="chat-messages">
        <!-- Transition group for smooth entering/leaving of messages -->
        <transition-group name="fade" tag="div" class="messages-list">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-container', msg.sender]"
          >
            <!-- Typing indicator -->
            <p v-if="msg.isTyping" class="typing-animation">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </p>

            <!-- Normal message -->
            <p v-else class="message">
              {{ msg.text }}
              <span class="copy-icon" @click="copyMessage(msg.text)">
                <!-- Copy icon SVG -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path
                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                  ></path>
                </svg>
              </span>
            </p>

            <!-- Timestamp -->
            <span class="timestamp">{{ msg.timestamp }}</span>
          </div>
        </transition-group>
      </div>

      <!-- Input form for user messages -->
      <InputForm @send-message="addMessage" />

      <!-- Clear chat button -->
      <button @click="clearChat" class="clear-btn">Clear Chat</button>
    </div>
  </div>
</template>

<style scoped>
/* Wrapper that covers the entire screen */
.chat-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Убираем дублирующийся фон, т.к. фон может задаваться в App.vue или Header.vue */
  background: none;
}

/* Main container with rounded corners and shadow */
.chat-container {
  width: 85vw;
  max-width: 1200px;
  height: 90vh;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Удалили стили .chat-header, так как заголовок убран */

/* Chat messages area */
.chat-messages {
  flex-grow: 1;
  width: 100%;
  border-radius: 10px;
  overflow-y: auto;
  background: #ffffff;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

/* Container for the transition-group items */
.messages-list {
  display: flex;
  flex-direction: column;
}

/* Individual message container */
.message-container {
  display: flex;
  flex-direction: column;
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 16px;
  margin: 6px 0;
  word-wrap: break-word;
  position: relative;
}

/* User message style */
.message-container.user {
  align-self: flex-end;
  background: #0078ff;
  color: #fff;
  border-top-right-radius: 6px;
}

/* Bot message style */
.message-container.bot {
  align-self: flex-start;
  background: #f1f1f1;
  color: #333;
  border-top-left-radius: 6px;
}

/* Timestamp style */
.timestamp {
  font-size: 12px;
  margin-top: 5px;
  text-align: right;
  opacity: 0.7;
}

/* Typing animation container */
.typing-animation {
  display: flex;
  gap: 3px;
  padding: 8px;
}

/* Dots for typing animation */
.dot {
  width: 6px;
  height: 6px;
  background-color: gray;
  border-radius: 50%;
  animation: blink 1.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

/* Copy icon style */
.copy-icon {
  cursor: pointer;
  margin-left: 10px;
  opacity: 0.6;
  transition: opacity 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
}

.copy-icon:hover {
  opacity: 1;
}

/* Clear chat button */
.clear-btn {
  margin-top: 10px;
  background: #ff5c5c;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

.clear-btn:hover {
  background: #d64545;
}

/* Fade transition for messages */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chat-container {
    width: 95vw;
    height: 95vh;
    padding: 15px;
  }
}
</style>
