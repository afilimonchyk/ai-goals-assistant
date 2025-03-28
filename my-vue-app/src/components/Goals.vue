<template>
  <div class="goals space-y-6">
    <h2
      class="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2"
    >
      🎯 My Goals
    </h2>

    <!-- Toggle form -->
    <button
      @click="showForm = !showForm"
      class="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm"
    >
      <span class="text-lg">➕</span>
      <span v-if="!showForm">New Goal</span>
      <span v-else>Cancel</span>
    </button>

    <!-- Add goal form -->
    <form
      v-if="showForm"
      @submit.prevent="addGoal"
      class="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200"
    >
      <input
        v-model="newGoal.title"
        placeholder="Goal title"
        required
        class="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            v-model="newGoal.isMeasurable"
            class="form-checkbox text-blue-600"
          />
          <span class="select-none">📏 Measurable</span>
        </label>
        <input
          v-if="newGoal.isMeasurable"
          v-model.number="newGoal.target"
          type="number"
          min="1"
          placeholder="Target"
          required
          class="w-32 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition"
      >
        Create
      </button>
    </form>

    <!-- Goal list -->
    <div v-if="goals.length" class="space-y-4">
      <div
        v-for="goal in goals"
        :key="goal.id"
        class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 transition duration-300"
        :class="{ 'bg-green-50 border-green-200': goal.completed }"
      >
        <div class="flex justify-between items-center mb-2">
          <input
            v-model="goal.title"
            class="text-lg font-medium text-gray-900 bg-transparent border-none w-full focus:outline-none"
          />
          <button
            v-if="!goal.isMeasurable"
            @click="toggleCompleted(goal)"
            :class="[
              'ml-4 w-6 h-6 flex items-center justify-center rounded-full border transition',
              goal.completed
                ? 'bg-green-500 border-green-500 text-white rotate-45'
                : 'bg-white border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500',
            ]"
          >
            <span v-if="goal.completed">✔</span>
            <span v-else>✓</span>
          </button>
        </div>

        <!-- Measurable goal -->
        <template v-if="goal.isMeasurable">
          <p class="text-sm text-gray-500 mt-1">
            {{ goal.progress }} / {{ goal.target }} ({{ getPercentage(goal) }}%)
          </p>
          <progress
            :value="goal.progress"
            :max="goal.target"
            class="w-full h-2 rounded bg-gray-200"
          ></progress>
          <input
            v-model.number="goal.newProgress"
            type="number"
            min="0"
            :max="goal.target"
            class="mt-3 w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </template>

        <!-- Subtasks -->
        <div class="mt-4 space-y-2">
          <div class="flex items-center gap-2">
            <input
              v-model="goal.newSubtask"
              placeholder="Add subtask"
              class="flex-1 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="addSubtask(goal)"
              class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              ➕
            </button>
          </div>
          <ul class="pl-4 list-disc text-sm text-gray-700">
            <li
              v-for="(sub, i) in goal.subtasks"
              :key="i"
              :class="{ 'line-through text-gray-400': sub.done }"
            >
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  v-model="sub.done"
                  @change="saveGoals"
                  class="form-checkbox text-blue-600"
                />
                {{ sub.text }}
              </label>
            </li>
          </ul>
        </div>

        <!-- Suggested Subtasks -->
        <div v-if="goal.aiSubtasks?.length" class="mt-4">
          <p class="text-sm font-medium text-gray-700 mb-1">
            Suggested subtasks:
          </p>
          <ul class="list-disc text-sm pl-5 text-gray-600 space-y-1">
            <li v-for="(subtask, i) in goal.aiSubtasks" :key="i">
              {{ subtask }}
              <button
                @click="addSuggestedSubtask(goal, subtask)"
                class="ml-2 text-xs text-blue-500 hover:underline"
              >
                Add
              </button>
            </li>
          </ul>
        </div>

        <!-- Motivation -->
        <p v-if="goal.motivation" class="text-sm text-yellow-700 mt-3 italic">
          💬 {{ goal.motivation }}
        </p>

        <!-- Buttons -->
        <div class="flex flex-wrap gap-2 mt-4">
          <button
            @click="updateGoal(goal)"
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
          >
            Update
          </button>
          <button
            @click="suggestNextStep(goal)"
            class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg"
          >
            💡 Suggest
          </button>
          <button
            @click="deleteGoal(goal.id)"
            class="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-400 text-sm text-center">No goals yet 😕</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      goals: [],
      newGoal: {
        title: "",
        isMeasurable: false,
        target: 0,
      },
      nextId: 1,
      showForm: false,
    };
  },
  methods: {
    getPercentage(goal) {
      return goal.target ? Math.round((goal.progress / goal.target) * 100) : 0;
    },
    saveGoals() {
      localStorage.setItem("goals", JSON.stringify(this.goals));
    },
    fetchGoals() {
      const saved = localStorage.getItem("goals");
      if (saved) {
        this.goals = JSON.parse(saved);
        this.goals.forEach((g) => {
          g.newProgress = g.progress || 0;
          g.newSubtask = "";
          g.suggestion = "";
          g.aiSubtasks = [];
          g.motivation = "";
        });
      }
    },
    addGoal() {
      const goal = {
        id: this.nextId++,
        title: this.newGoal.title,
        isMeasurable: this.newGoal.isMeasurable,
        target: this.newGoal.isMeasurable ? this.newGoal.target : 0,
        progress: 0,
        newProgress: 0,
        completed: false,
        subtasks: [],
        newSubtask: "",
        suggestion: "",
        aiSubtasks: [],
        motivation: "",
      };
      this.goals.push(goal);
      this.saveGoals();
      this.newGoal.title = "";
      this.newGoal.target = 0;
      this.newGoal.isMeasurable = false;
      this.showForm = false;
    },
    updateGoal(goal) {
      goal.progress = goal.newProgress;
      this.saveGoals();
    },
    deleteGoal(id) {
      this.goals = this.goals.filter((g) => g.id !== id);
      this.saveGoals();
    },
    toggleCompleted(goal) {
      goal.completed = !goal.completed;
      this.saveGoals();
    },
    addSubtask(goal) {
      if (goal.newSubtask && goal.newSubtask.trim()) {
        goal.subtasks.push({ text: goal.newSubtask, done: false });
        goal.newSubtask = "";
        this.saveGoals();
      }
    },
    addSuggestedSubtask(goal, text) {
      goal.subtasks.push({ text, done: false });
      this.saveGoals();
    },
    async suggestNextStep(goal) {
      const response = await fetch("http://localhost:8000/goals/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goal.title,
          progress: goal.progress,
          target: goal.target,
        }),
      });
      const data = await response.json();
      goal.aiSubtasks = data.subtasks || [];
      goal.motivation = data.motivation || "";
      this.saveGoals();
    },
  },
  mounted() {
    this.fetchGoals();
  },
};
</script>

<style scoped>
.goals {
  max-width: 700px;
  margin: auto;
  padding: 24px;
  background-color: #f9fafb;
  border-radius: 16px;
}
</style>
