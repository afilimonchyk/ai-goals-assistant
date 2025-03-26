<script setup>
import { ref } from "vue";
import Header from "./components/Header.vue";
import ChatWindow from "./components/ChatWindow.vue";
import Goals from "./components/Goals.vue";

const currentView = ref("chat");
</script>

<template>
  <div class="app-container">
    <Header />

    <!-- Navigation buttons -->
    <div class="nav-buttons">
      <button
        :class="{ active: currentView === 'chat' }"
        @click="currentView = 'chat'"
      >
        💬 Chat
      </button>
      <button
        :class="{ active: currentView === 'goals' }"
        @click="currentView = 'goals'"
      >
        🎯 Goals
      </button>
    </div>

    <!-- View content -->
    <div class="content">
      <ChatWindow v-if="currentView === 'chat'" />
      <Goals v-else />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Navigation buttons container */
.nav-buttons {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0 16px;
}

/* Individual buttons */
.nav-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
}

.nav-buttons button:hover {
  background-color: #0056b3;
}

.nav-buttons .active {
  background-color: #0056b3;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #007bff;
}

/* Content area */
.content {
  width: 100%;
  max-width: 800px;
  padding: 24px;
  box-sizing: border-box;
}
</style>
