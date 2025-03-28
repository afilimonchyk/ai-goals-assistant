<template>
  <div class="goals space-y-6">
    <!-- Page title -->
    <h2
      class="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2"
    >
      🎯 My Goals
    </h2>

    <!-- Toggle new goal form -->
    <button
      @click="showForm = !showForm"
      class="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm"
    >
      <span class="text-lg">➕</span>
      <span v-if="!showForm">New Goal</span>
      <span v-else>Cancel</span>
    </button>

    <!-- New goal form -->
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

    <!-- Goals list -->
    <draggable
      v-model="goals"
      item-key="id"
      handle=".goal-handle"
      ghost-class="opacity-40"
      class="space-y-4"
    >
      <template #item="{ element: goal }">
        <div
          class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 transition duration-300"
          :class="{ 'bg-green-50 border-green-200': goal.completed }"
        >
          <!-- Goal header -->
          <div
            class="flex justify-between items-center mb-2 goal-handle cursor-move"
          >
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

          <!-- Measurable goal progress -->
          <template v-if="goal.isMeasurable">
            <p class="text-sm text-gray-500 mt-1">
              {{ goal.progress }} / {{ goal.target }} ({{
                getPercentage(goal)
              }}%)
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

          <!-- Subtasks with drag support -->
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
            <draggable
              v-model="goal.subtasks"
              item-key="text"
              handle=".handle"
              class="pl-4 space-y-1"
              ghost-class="opacity-40"
            >
              <template #item="{ element }">
                <li
                  :class="{ 'line-through text-gray-400': element.done }"
                  class="list-disc text-sm text-gray-700"
                >
                  <label class="flex items-center gap-2">
                    <span class="handle cursor-move">☰</span>
                    <input
                      type="checkbox"
                      v-model="element.done"
                      @change="saveGoals"
                      class="form-checkbox text-blue-600"
                    />
                    {{ element.text }}
                  </label>
                </li>
              </template>
            </draggable>
          </div>

          <!-- AI suggestions -->
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

          <!-- AI motivation -->
          <p v-if="goal.motivation" class="text-sm text-yellow-700 mt-3 italic">
            💬 {{ goal.motivation }}
          </p>

          <!-- Action buttons -->
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
      </template>
    </draggable>

    <!-- No goals message -->
    <div v-if="!goals.length" class="text-gray-400 text-sm text-center">
      No goals yet 😕
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  components: { draggable },
  data() {
    return {
      goals: [],
      newGoal: {
        title: "",
        isMeasurable: false,
        target: 0,
      },
      showForm: false,
    };
  },
  methods: {
    getPercentage(goal) {
      return goal.target ? Math.round((goal.progress / goal.target) * 100) : 0;
    },

    async fetchGoals() {
      try {
        const res = await fetch("http://localhost:8000/goals");
        const data = await res.json();
        this.goals = data.map((g) => ({
          ...g,
          newProgress: g.progress || 0,
          newSubtask: "",
          aiSubtasks: [],
          motivation: "",
        }));
      } catch (err) {
        console.error("Failed to load goals:", err);
      }
    },

    async addGoal() {
      const payload = {
        id: Date.now(),
        title: this.newGoal.title,
        isMeasurable: this.newGoal.isMeasurable,
        target: this.newGoal.isMeasurable ? this.newGoal.target : 0,
        progress: 0,
        completed: false,
        subtasks: [],
        suggestion: "",
      };
      try {
        const res = await fetch("http://localhost:8000/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        this.goals.push({
          ...created,
          newProgress: 0,
          newSubtask: "",
          aiSubtasks: [],
          motivation: "",
        });
        this.newGoal = { title: "", isMeasurable: false, target: 0 };
        this.showForm = false;
        this.saveOrder(); // Save updated order
      } catch (err) {
        console.error("Failed to create goal:", err);
      }
    },

    async updateGoal(goal) {
      goal.progress = goal.newProgress;
      try {
        await fetch(`http://localhost:8000/goals/${goal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goal),
        });
      } catch (err) {
        console.error("Failed to update goal:", err);
      }
    },

    async deleteGoal(id) {
      try {
        await fetch(`http://localhost:8000/goals/${id}`, {
          method: "DELETE",
        });
        this.goals = this.goals.filter((g) => g.id !== id);
        this.saveOrder(); // Save updated order
      } catch (error) {
        console.error("Failed to delete goal:", error);
      }
    },

    toggleCompleted(goal) {
      goal.completed = !goal.completed;
    },

    addSubtask(goal) {
      if (goal.newSubtask && goal.newSubtask.trim()) {
        goal.subtasks.push({ text: goal.newSubtask, done: false });
        goal.newSubtask = "";
      }
    },

    addSuggestedSubtask(goal, text) {
      goal.subtasks.push({ text, done: false });
    },

    async suggestNextStep(goal) {
      try {
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
      } catch (err) {
        console.error("AI suggestion failed:", err);
      }
    },

    async saveOrder() {
      try {
        await fetch("http://localhost:8000/goals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.goals),
        });
      } catch (err) {
        console.error("Failed to save order:", err);
      }
    },

    async onGoalReorder() {
      await this.saveOrder();
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
