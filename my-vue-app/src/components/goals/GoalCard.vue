<template>
  <div
    class="relative bg-white p-6 rounded-2xl shadow-md border border-gray-100 transition duration-300"
    :class="{
      'bg-green-50 border-green-200 opacity-80 scale-[0.98]': goal.completed,
    }"
  >
    <!-- Header -->
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

        <!-- Title + Category -->
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

      <!-- AI + Delete -->
      <div class="flex items-center gap-2">
        <button
          @click="$emit('suggest', goal)"
          class="bg-purple-100 text-purple-700 hover:bg-purple-200 px-2 py-1 rounded-md text-xs font-bold tracking-wide transition"
          title="Generate subtasks with AI"
        >
          AI
        </button>

        <button
          @click="$emit('delete', goal.id)"
          class="text-red-500 hover:text-red-700 transition"
          title="Delete goal"
        >
          🗑
        </button>
      </div>
    </div>

    <!-- Progress -->
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

    <!-- Add subtask -->
    <div class="mt-4">
      <div v-if="showSubtaskInput" class="flex items-center gap-2">
        <input
          v-model="goal.newSubtask"
          placeholder="Enter subtask"
          class="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="goal.completed"
        />
        <button
          @click="$emit('add-subtask', goal)"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          :disabled="goal.completed"
        >
          Add
        </button>
        <button
          @click="showSubtaskInput = false"
          class="text-sm text-gray-400 hover:text-red-500"
        >
          ✕
        </button>
      </div>

      <button
        v-else
        @click="showSubtaskInput = true"
        class="ml-auto flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
      >
        <span class="text-base">➕</span>
        <span>Add subtask</span>
      </button>
    </div>

    <!-- Subtask list -->
    <div class="mt-3 space-y-2">
      <ul>
        <li
          v-for="(sub, index) in goal.subtasks"
          :key="index"
          class="bg-gray-50 hover:bg-gray-100 transition px-3 py-2 rounded-md flex items-center justify-between gap-2 text-sm"
        >
          <label class="flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              v-model="sub.done"
              @change="$emit('update', goal)"
              class="form-checkbox text-blue-600"
            />
            <span :class="{ 'line-through text-gray-400': sub.done }">
              {{ sub.text }}
            </span>
          </label>

          <button
            @click="removeSubtask(index)"
            class="text-gray-400 hover:text-red-500 text-xs"
            title="Remove"
          >
            🗑
          </button>
        </li>
      </ul>
    </div>

    <!-- AI Suggestions toggle -->
    <div v-if="goal.aiSubtasks?.length" class="mt-4 space-y-2">
      <div
        class="flex items-center justify-between text-sm font-medium text-gray-700 mb-1"
      >
        <span>💡 Suggested subtasks:</span>
        <button
          @click="goal.showSuggestions = !goal.showSuggestions"
          class="text-xs text-gray-500 hover:text-gray-800 transition"
        >
          {{ goal.showSuggestions ? "Hide suggestions" : "Show suggestions" }}
        </button>
      </div>

      <div v-if="goal.showSuggestions" class="space-y-2">
        <div
          v-for="(subtask, i) in goal.aiSubtasks"
          :key="i"
          class="bg-yellow-50 border border-yellow-300 rounded-md px-4 py-2 text-sm flex justify-between items-center"
        >
          <span class="text-gray-800">{{ subtask }}</span>
          <button
            @click="$emit('add-suggested-subtask', goal, subtask)"
            class="text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md font-semibold transition w-16 text-center"
            :disabled="goal.completed"
          >
            + Add
          </button>
        </div>
      </div>
    </div>

    <!-- Motivation -->
    <div
      v-if="goal.motivation"
      class="mt-4 bg-orange-50 border border-orange-200 text-orange-700 text-sm italic px-4 py-3 rounded-md flex items-start gap-2"
    >
      <span class="text-xl leading-none">💬</span>
      <span>{{ goal.motivation.replace(/^💬\s*/, "") }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    goal: Object,
    categoryColors: Object,
  },
  data() {
    return {
      showSubtaskInput: false,
    };
  },
  methods: {
    getPercentage(goal) {
      return goal.target ? Math.round((goal.progress / goal.target) * 100) : 0;
    },
    toggleCompleted() {
      this.$emit("toggle-complete", this.goal);
    },
    removeSubtask(index) {
      this.goal.subtasks.splice(index, 1);
      this.$emit("update", this.goal);
    },
  },
  mounted() {
    // Ensure visibility toggle is initialized
    if (this.goal.showSuggestions === undefined) {
      this.goal.showSuggestions = true;
    }
  },
};
</script>
