<script setup>
import Header from "./components/Header.vue";
import ChatWindow from "./components/ChatWindow.vue";
</script>

<template>
  <div class="app-container">
    <Header />
    <ChatWindow />
  </div>
</template>

<style scoped>
/* Ensure the whole app has a clean background */
.app-container {
  background-color: #f8f9fa; /* Light Gray */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 20px;
}
</style>
