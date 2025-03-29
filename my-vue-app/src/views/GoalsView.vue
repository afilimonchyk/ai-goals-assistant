<template>
  <div class="goals space-y-6">
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

    <!-- New goal form component -->
    <NewGoalForm v-if="showForm" @goal-added="addGoal" />

    <!-- Draggable goals list -->
    <draggable
      v-model="goals"
      item-key="id"
      handle=".goal-handle"
      ghost-class="opacity-40"
      class="space-y-4"
      @end="saveOrder"
    >
      <template #item="{ element: goal }">
        <GoalCard
          :goal="goal"
          :categoryColors="categoryColors"
          @update="updateGoal"
          @delete="deleteGoal"
          @suggest="suggestNextStep"
          @add-subtask="addSubtask"
          @add-suggested-subtask="addSuggestedSubtask"
          @toggle-complete="toggleGoalCompleted"
        />
      </template>
    </draggable>

    <div v-if="!goals.length" class="text-gray-400 text-sm text-center">
      No goals yet 😕
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import NewGoalForm from "@/components/goals/NewGoalForm.vue";
import GoalCard from "@/components/goals/GoalCard.vue";

export default {
  components: { draggable, NewGoalForm, GoalCard },
  data() {
    return {
      showForm: false,
      goals: [],
      categoryColors: {
        health: "bg-green-100 text-green-800",
        career: "bg-blue-100 text-blue-800",
        learning: "bg-yellow-100 text-yellow-800",
        fitness: "bg-pink-100 text-pink-800",
        finance: "bg-purple-100 text-purple-800",
      },
    };
  },
  methods: {
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
    async addGoal(newGoalData) {
      try {
        const res = await fetch("http://localhost:8000/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newGoalData),
        });
        const created = await res.json();
        this.goals.push({
          ...created,
          newProgress: 0,
          newSubtask: "",
          aiSubtasks: [],
          motivation: "",
        });
        this.showForm = false;
        this.saveOrder();
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
        this.saveOrder();
      } catch (err) {
        console.error("Failed to delete goal:", err);
      }
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
    addSubtask(goal) {
      if (goal.newSubtask && goal.newSubtask.trim()) {
        goal.subtasks.push({ text: goal.newSubtask, done: false });
        goal.newSubtask = "";
      }
    },
    addSuggestedSubtask(goal, text) {
      goal.subtasks.push({ text, done: false });
    },
    async toggleGoalCompleted(goal) {
      goal.completed = !goal.completed;
      try {
        await fetch(`http://localhost:8000/goals/${goal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(goal),
        });
      } catch (err) {
        console.error("Failed to update goal status:", err);
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
