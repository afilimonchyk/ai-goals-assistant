<template>
  <div class="goals space-y-6">
    <!-- Title -->
    <h2 class="text-2xl font-semibold text-gray-800 flex items-center gap-2">
      🎯 My Goals
    </h2>

    <!-- Add goal form -->
    <form @submit.prevent="addGoal" class="flex flex-col md:flex-row gap-4">
      <input
        v-model="newGoal.title"
        placeholder="Goal title"
        required
        class="flex-1 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <input
        v-model.number="newGoal.target"
        type="number"
        min="1"
        placeholder="Target (e.g., 100)"
        required
        class="w-28 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        class="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Add Goal
      </button>
    </form>

    <!-- Goal list -->
    <div v-if="goals.length" class="space-y-4">
      <div
        v-for="goal in goals"
        :key="goal.id"
        class="bg-white p-4 rounded-lg shadow-md border border-gray-100"
      >
        <div class="flex items-center justify-between mb-2">
          <input
            v-model="goal.title"
            class="text-lg font-semibold text-gray-800 bg-transparent border-none w-full focus:outline-none"
          />
          <p class="text-sm text-gray-500">
            {{ goal.progress }} / {{ goal.target }} ({{ getPercentage(goal) }}%)
          </p>
        </div>

        <!-- Progress bar -->
        <progress
          :value="goal.progress"
          :max="goal.target"
          class="w-full h-3 accent-blue-500 rounded-full bg-gray-200"
        />

        <!-- Update section -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
          <input
            v-model.number="goal.newProgress"
            type="number"
            min="0"
            :max="goal.target"
            class="flex-1 px-3 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div class="flex gap-2">
            <button
              @click="updateGoal(goal)"
              class="bg-green-500 text-white px-4 py-1.5 rounded-md hover:bg-green-600 transition"
            >
              Update
            </button>
            <button
              @click="suggestNextStep(goal)"
              class="bg-purple-500 text-white px-4 py-1.5 rounded-md hover:bg-purple-600 transition"
            >
              💡 Suggest
            </button>
            <button
              @click="deleteGoal(goal.id)"
              class="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>

        <p v-if="goal.suggestion" class="text-sm text-gray-700 mt-2 italic">
          👉 {{ goal.suggestion }}
        </p>
      </div>
    </div>

    <!-- No goals message -->
    <div v-else class="text-gray-500 text-sm">No goals yet 😕</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      goals: [],
      newGoal: {
        title: "",
        target: 0,
      },
      nextId: 1,
    };
  },
  methods: {
    getPercentage(goal) {
      return Math.round((goal.progress / goal.target) * 100);
    },
    saveGoals() {
      localStorage.setItem("goals", JSON.stringify(this.goals));
    },
    fetchGoals() {
      const saved = localStorage.getItem("goals");
      if (saved) {
        this.goals = JSON.parse(saved);
        this.goals.forEach((g) => {
          g.newProgress = g.progress;
          g.suggestion = "";
        });
      }
    },
    addGoal() {
      const goal = {
        id: this.nextId++,
        title: this.newGoal.title,
        target: this.newGoal.target,
        progress: 0,
        newProgress: 0,
        suggestion: "",
      };
      this.goals.push(goal);
      this.saveGoals();
      this.newGoal.title = "";
      this.newGoal.target = 0;
    },
    updateGoal(goal) {
      goal.progress = goal.newProgress;
      this.saveGoals();
    },
    deleteGoal(id) {
      this.goals = this.goals.filter((g) => g.id !== id);
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
      goal.suggestion = data.suggestion || "No suggestion available.";
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
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
