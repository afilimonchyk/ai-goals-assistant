<script setup>
import { ref, onMounted, watch, onUpdated } from "vue";
import InputForm from "./InputForm.vue";
import { useChatAPI } from "../composables/useChatAPI";

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
const { sendMessageToAPI } = useChatAPI();

function getCurrentTimestamp() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const addMessage = async (messageText) => {
  if (!messageText.trim()) return;

  messages.value.push({
    text: messageText,
    sender: "user",
    timestamp: getCurrentTimestamp(),
  });

  messages.value.push({ isTyping: true, sender: "bot" });

  const response = await sendMessageToAPI(messages.value);
  messages.value.pop();

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

const copyMessage = (text) => {
  navigator.clipboard.writeText(text);
};

onUpdated(() => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
});

watch(
  messages,
  (newMessages) => {
    localStorage.setItem("chatMessages", JSON.stringify(newMessages));
  },
  { deep: true }
);

onMounted(() => {
  const savedMessages = localStorage.getItem("chatMessages");
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages);
  }
});
</script>

<template>
  <div class="w-full flex justify-center px-4 py-6">
    <div
      class="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6 flex flex-col"
    >
      <!-- Сообщения -->
      <div
        ref="chatContainer"
        class="flex flex-col gap-4 overflow-y-auto h-[60vh] mb-4 pr-2"
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="[
            'p-3 rounded-xl max-w-[80%] relative',
            msg.sender === 'user'
              ? 'bg-blue-500 text-white self-end'
              : 'bg-gray-100 text-gray-800 self-start',
          ]"
        >
          <p v-if="msg.isTyping" class="flex gap-1 animate-pulse">
            <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
          </p>
          <p v-else class="whitespace-pre-wrap flex items-center">
            {{ msg.text }}
            <button
              @click="copyMessage(msg.text)"
              title="Copy message"
              class="ml-2 text-gray-400 hover:text-gray-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m0 4h2a2 2 0 012 2v6a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2"
                />
              </svg>
            </button>
          </p>
          <span
            class="text-xs absolute bottom-[-18px] right-2 text-gray-400"
            v-if="msg.timestamp"
          >
            {{ msg.timestamp }}
          </span>
        </div>
      </div>

      <!-- Поле ввода -->
      <InputForm @send-message="addMessage" />

      <!-- Кнопка очистки -->
      <button
        @click="clearChat"
        class="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md self-end"
      >
        Clear Chat
      </button>
    </div>
  </div>
</template>
