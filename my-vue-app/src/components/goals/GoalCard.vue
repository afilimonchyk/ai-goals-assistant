<template>
  <div
    class="relative bg-white p-6 rounded-2xl shadow-md border border-gray-100 transition duration-300"
    :class="{
      'bg-green-50 border-green-200 opacity-80 scale-[0.98]': goal.completed,
    }"
  >
    <!-- Header with title, category, completion and actions -->
    <div class="flex justify-between items-start mb-3 goal-handle cursor-move">
      <div class="flex items-center gap-3">
        <!-- Completion button -->
        <button
          @click="toggleCompleted"
          :class="[
            'transition-all duration-300 ease-in-out transform',
            'rounded-full w-8 h-8 flex items-center justify-center',
            goal.completed
              ? 'bg-green-500 text-white scale-110 hover:bg-green-600'
              : 'bg-gray-100 text-gray-400 hover:text-green-500 hover:bg-green-50',
          ]"
          title="Mark as completed"
        >
          <span v-if="goal.completed">✔</span>
          <span v-else>✓</span>
        </button>

        <!-- Title and category -->
        <div>
          <input
            v-model="goal.title"
            :readonly="goal.completed"
            :class="[
              'text-lg font-medium bg-transparent border-none focus:outline-none',
              goal.completed ? 'text-gray-400 line-through' : 'text-gray-900',
            ]"
          />
          <div v-if="goal.category" class="mt-1">
            <span
              :class="[
                'inline-block text-xs px-2 py-1 rounded-full font-medium',
                categoryColors[goal.category.toLowerCase()] ||
                  'bg-gray-100 text-gray-600',
              ]"
            >
              {{ goal.category }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right-side actions: AI Suggest and Delete -->
      <div class="flex items-center gap-2">
        <!-- AI badge button -->
        <button
          @click="$emit('suggest', goal)"
          class="bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded-md text-xs font-bold tracking-wide transition"
          title="Generate subtasks with AI"
        >
          AI
        </button>

        <!-- Delete button -->
        <button
          @click="$emit('delete', goal.id)"
          class="text-red-500 hover:text-red-700 transition"
          title="Delete goal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M6 7a1 1 0 011-1h10a1 1 0 011 1v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7zm3 3a1 1 0 012 0v6a1 1 0 11-2 0v-6zm4 0a1 1 0 112 0v6a1 1 0 11-2 0v-6z"
              clip-rule="evenodd"
            />
            <path d="M4 7h16M10 3h4a1 1 0 011 1v1H9V4a1 1 0 011-1z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Progress section -->
    <div v-if="goal.isMeasurable">
      <p class="text-sm text-gray-500 mt-1">
        {{ goal.progress }} / {{ goal.target }} ({{ getPercentage(goal) }}%)
      </p>
      <progress
        :value="goal.progress"
        :max="goal.target"
        class="w-full h-2 rounded bg-gray-200"
      ></progress>

      <div v-if="!goal.completed">
        <input
          v-model.number="goal.newProgress"
          type="number"
          min="0"
          :max="goal.target"
          class="mt-3 w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @change="$emit('update', goal)"
        />
      </div>
    </div>

    <!-- Subtask input -->
    <div class="mt-4 space-y-2">
      <div class="flex items-center gap-2">
        <input
          v-model="goal.newSubtask"
          placeholder="Add subtask"
          class="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="goal.completed"
        />
        <button
          @click="$emit('add-subtask', goal)"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          :disabled="goal.completed"
        >
          ➕
        </button>
      </div>

      <!-- Subtask list -->
      <SubtaskList
        :subtasks="goal.subtasks"
        @update:subtasks="goal.subtasks = $event"
      />
    </div>

    <!-- AI suggested subtasks -->
    <div v-if="goal.aiSubtasks?.length" class="mt-4">
      <p class="text-sm font-medium text-gray-700 mb-1">Suggested subtasks:</p>
      <ul class="list-disc text-sm pl-5 text-gray-600 space-y-1">
        <li v-for="(subtask, i) in goal.aiSubtasks" :key="i">
          {{ subtask }}
          <button
            @click="$emit('add-suggested-subtask', goal, subtask)"
            class="ml-2 text-xs text-blue-500 hover:underline"
            :disabled="goal.completed"
          >
            Add
          </button>
        </li>
      </ul>
    </div>

    <!-- Motivation message -->
    <p v-if="goal.motivation" class="text-sm text-yellow-700 mt-3 italic">
      💬 {{ goal.motivation }}
    </p>
  </div>
</template>

<script>
import SubtaskList from "@/components/goals/SubtaskList.vue";

export default {
  props: {
    goal: Object,
    categoryColors: Object,
  },
  components: { SubtaskList },
  methods: {
    getPercentage(goal) {
      return goal.target ? Math.round((goal.progress / goal.target) * 100) : 0;
    },
    toggleCompleted() {
      this.$emit("toggle-complete", this.goal);
    },
  },
};
</script>
