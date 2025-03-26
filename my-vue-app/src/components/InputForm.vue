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
  <form @submit.prevent="sendMessage" class="flex gap-2 mt-2 w-full">
    <input
      v-model="message"
      type="text"
      placeholder="Type a message..."
      class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800"
      autocomplete="off"
    />
    <button
      type="submit"
      :disabled="!message.trim()"
      class="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
    >
      Send
    </button>
  </form>
</template>
