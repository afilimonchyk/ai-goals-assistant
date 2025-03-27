<script setup>
import { ref } from "vue";
const emit = defineEmits(["send-message"]);
const message = ref("");

// Send message to parent component
const sendMessage = () => {
  if (message.value.trim() === "") return;
  emit("send-message", message.value);
  message.value = "";
};
</script>

<template>
  <form @submit.prevent="sendMessage" class="flex items-center gap-2 w-full">
    <!-- Поле ввода -->
    <input
      v-model="message"
      type="text"
      placeholder="Type a message..."
      class="flex-1 rounded-full px-4 py-2 border border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      autocomplete="off"
    />

    <!-- Кнопка отправки -->
    <button
      type="submit"
      :disabled="!message.trim()"
      class="rounded-full px-5 py-2 bg-blue-500 text-white font-semibold hover:bg-blue-600 transition disabled:opacity-50 shadow-md"
    >
      Send
    </button>
  </form>
</template>
