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
  <div class="w-full flex justify-center px-4 mt-6">
    <div
      class="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 flex flex-col"
    >
      <!-- Chat messages -->
      <div
        ref="chatContainer"
        class="flex flex-col gap-4 overflow-y-auto max-h-[500px] mb-4"
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="[
            'p-3 rounded-xl max-w-[80%] relative',
            msg.sender === 'user'
              ? 'bg-blue-500 text-white self-end'
              : 'bg-gray-200 text-gray-800 self-start',
          ]"
        >
          <p v-if="msg.isTyping" class="flex gap-1 animate-pulse">
            <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
            <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
            <span class="w-2 h-2 bg-gray-500 rounded-full"></span>
          </p>
          <p v-else class="whitespace-pre-wrap">
            {{ msg.text }}
            <span
              class="ml-2 cursor-pointer opacity-50 hover:opacity-100"
              @click="copyMessage(msg.text)"
              title="Copy"
            >
              📋
            </span>
          </p>
          <span
            class="text-xs absolute bottom-[-18px] right-2 text-gray-500"
            v-if="msg.timestamp"
          >
            {{ msg.timestamp }}
          </span>
        </div>
      </div>

      <!-- Input field -->
      <InputForm @send-message="addMessage" />

      <!-- Clear chat button -->
      <button
        @click="clearChat"
        class="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md self-end"
      >
        Clear Chat
      </button>
    </div>
  </div>
</template>
