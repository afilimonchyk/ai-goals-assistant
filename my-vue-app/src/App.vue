<script setup>
import { ref } from "vue";
import Header from "./components/Header.vue";
import ChatWindow from "./components/ChatWindow.vue";
import Goals from "./views/GoalsView.vue";

// текущее состояние
const currentView = ref("chat");
// для анимации направления
const slideDirection = ref("left");

// смена экрана с определением направления
function switchView(target) {
  if (target === currentView.value) return;
  slideDirection.value = target === "chat" ? "right" : "left";
  currentView.value = target;
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center">
    <Header />

    <!-- Navigation buttons -->
    <div class="mt-6 flex gap-4 flex-wrap justify-center px-4">
      <button
        :class="[
          'px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm',
          currentView === 'chat'
            ? 'bg-blue-700 text-white shadow-md'
            : 'bg-white text-blue-600 border border-blue-500 hover:bg-blue-50',
        ]"
        @click="switchView('chat')"
      >
        💬 Chat
      </button>

      <button
        :class="[
          'px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm',
          currentView === 'goals'
            ? 'bg-blue-700 text-white shadow-md'
            : 'bg-white text-blue-600 border border-blue-500 hover:bg-blue-50',
        ]"
        @click="switchView('goals')"
      >
        🎯 Goals
      </button>
    </div>

    <!-- Animated content -->
    <div
      class="w-full max-w-4xl px-4 py-6 relative overflow-hidden min-h-[300px]"
    >
      <transition :name="`slide-${slideDirection}`" mode="out-in">
        <component
          :is="currentView === 'chat' ? ChatWindow : Goals"
          :key="currentView"
        />
      </transition>
    </div>
  </div>
</template>

<style>
/* Базовая стилизация для обеих анимаций */
[class^="slide-"]-enter-active,
[class^="slide-"]-leave-active {
  transition: all 0.4s ease;
  position: absolute;
  width: 100%;
}

/* Анимация "влево" */
.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Анимация "вправо" */
.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
