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
/* 
  Main application container. 
  A light gray background, taking up the full viewport height.
*/
.app-container {
  background-color: #f8f9fa; /* Light Gray */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  /* No extra padding-top needed since header is not fixed */
}
</style>
