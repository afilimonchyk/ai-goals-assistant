<template>
  <form class="input-form" @submit.prevent="sendMessage">
    <input v-model="message" type="text" placeholder="Type a message..." />
    <button type="submit">Send</button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { defineEmits } from "vue";

// Input field state
const message = ref("");
const emit = defineEmits(["send-message"]);

// Function to send a message
const sendMessage = () => {
  if (message.value.trim() === "") return;
  emit("send-message", message.value); // Emit event to parent component
  message.value = ""; // Clear input field
};
</script>

<style scoped>
.input-form {
  display: flex;
  margin-top: 10px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
}

button {
  background-color: #0078ff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
  transition: background 0.2s ease-in-out;
}

button:hover {
  background-color: #0056b3;
}
</style>
