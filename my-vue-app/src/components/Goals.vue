<template>
  <div class="goals">
    <h2>🎯 My Goals</h2>

    <!-- Form to add a new goal -->
    <form @submit.prevent="addGoal" class="goal-form">
      <input v-model="newGoal.title" placeholder="Goal title" required />
      <input
        v-model.number="newGoal.target"
        type="number"
        placeholder="Target (e.g., 100)"
        required
      />
      <button type="submit">Add Goal</button>
    </form>

    <!-- Goal list -->
    <div v-if="goals.length">
      <div v-for="goal in goals" :key="goal.id" class="goal">
        <h3>{{ goal.title }}</h3>
        <progress :value="goal.progress" :max="goal.target"></progress>
        <p>{{ goal.progress }} / {{ goal.target }}</p>

        <!-- Input and button to update progress -->
        <input
          v-model.number="goal.newProgress"
          type="number"
          :placeholder="goal.progress"
        />
        <button @click="updateGoal(goal)">Update Progress</button>
      </div>
    </div>

    <div v-else>
      <p>No goals yet 😕</p>
    </div>
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
      nextId: 1, // simple ID generator (in place of database)
    };
  },
  methods: {
    // Load goals from backend
    async fetchGoals() {
      try {
        const res = await fetch("http://localhost:8000/goals");
        this.goals = await res.json();
        this.goals.forEach((goal) => (goal.newProgress = goal.progress));
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      }
    },

    // Add a new goal
    async addGoal() {
      const goal = {
        id: this.nextId++,
        title: this.newGoal.title,
        target: this.newGoal.target,
        progress: 0,
      };
      const res = await fetch("http://localhost:8000/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      const data = await res.json();
      data.newProgress = 0;
      this.goals.push(data);
      this.newGoal.title = "";
      this.newGoal.target = 0;
    },

    // Update progress for a specific goal
    async updateGoal(goal) {
      const res = await fetch(
        `http://localhost:8000/goals/${goal.id}?progress=${goal.newProgress}`,
        {
          method: "PUT",
        }
      );
      const updated = await res.json();
      goal.progress = updated.progress;
    },
  },

  // Load goals when component is mounted
  mounted() {
    this.fetchGoals();
  },
};
</script>

<style scoped>
.goals {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.goal-form {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.goal-form input {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.goal-form button {
  padding: 8px 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.goal-form button:hover {
  background-color: #0056b3;
}

.goal {
  border: 1px solid #ddd;
  padding: 12px;
  margin-top: 10px;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>
