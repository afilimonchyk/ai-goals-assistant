<script setup>
import { ref, onMounted, watch, onUpdated } from "vue";
import InputForm from "./InputForm.vue";
import { useChatAPI } from "../composables/useChatAPI";

// Load messages from localStorage or use default bot greeting
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
const { sendMessageToAPI, isLoading } = useChatAPI();

// Function to get the current timestamp in HH:MM format
function getCurrentTimestamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Function to add a new message
const addMessage = async (messageText) => {
  if (!messageText.trim()) return;

  // Add user's message with timestamp
  messages.value.push({
    text: messageText,
    sender: "user",
    timestamp: getCurrentTimestamp(),
  });

  // Show typing indicator
  messages.value.push({ isTyping: true, sender: "bot" });

  // Send request to API
  const response = await sendMessageToAPI(messages.value);

  // Remove typing indicator
  messages.value.pop();

  // Ensure we extract the correct field from API response
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

// Function to clear the chat
const clearChat = () => {
  messages.value = [
    {
      text: "Hello! How can I help you?",
      sender: "bot",
      timestamp: getCurrentTimestamp(),
    },
  ];
  localStorage.removeItem("chatMessages"); // Remove stored chat history
};

// Function to copy a message to the clipboard
const copyMessage = (text) => {
  navigator.clipboard.writeText(text);
};

// Auto-scroll to the latest message
onUpdated(() => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
});

// Watch for changes in messages and save them to localStorage
watch(
  messages,
  (newMessages) => {
    localStorage.setItem("chatMessages", JSON.stringify(newMessages));
  },
  { deep: true }
);

// Load messages when the component mounts
onMounted(() => {
  const savedMessages = localStorage.getItem("chatMessages");
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages);
  }
});
</script>

<template>
  <div class="container">
    <!-- Chat messages -->
    <div id="chat" ref="chatContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message-container', msg.sender]"
      >
        <p v-if="msg.isTyping" class="typing-animation">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </p>
        <p v-else class="message">
          {{ msg.text }}
          <span class="copy-icon" @click="copyMessage(msg.text)">
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
        <span class="timestamp">{{ msg.timestamp }}</span>
      </div>
    </div>

    <!-- Input field -->
    <InputForm @send-message="addMessage" />

    <!-- Clear Chat button -->
    <button @click="clearChat" class="clear-btn">Clear Chat</button>
  </div>
</template>

<style scoped>
/* Chat Container */
.container {
  margin: 20px auto;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 85%;
  max-width: 650px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Chat messages area */
#chat {
  border: none;
  border-radius: 10px;
  padding: 15px;
  height: 350px;
  overflow-y: auto;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Message container */
.message-container {
  display: flex;
  flex-direction: column;
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 16px;
  margin: 6px;
  word-wrap: break-word;
  position: relative;
}

/* User messages */
.message-container.user {
  align-self: flex-end;
  background: #0078ff;
  color: white;
  border-top-right-radius: 6px;
}

/* Bot messages */
.message-container.bot {
  align-self: flex-start;
  background: #f1f1f1;
  color: #333;
  border-top-left-radius: 6px;
}

/* Timestamp */
.timestamp {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
  margin-top: 5px;
}

.message-container.bot .timestamp {
  color: rgba(0, 0, 0, 0.5);
}

/* Typing animation */
.typing-animation {
  display: flex;
  gap: 3px;
  padding: 8px;
}

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

/* Copy Icon */
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

/* Clear Chat Button */
.clear-btn {
  background: #ff5c5c;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  margin-top: 10px;
}

.clear-btn:hover {
  background: #d64545;
}
</style>
