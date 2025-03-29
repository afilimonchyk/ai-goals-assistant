<template>
  <form
    @submit.prevent="handleSubmit"
    class="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200"
  >
    <input
      v-model="goal.title"
      placeholder="Goal title"
      required
      class="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <input
      v-model="goal.category"
      placeholder="Category (e.g. Health, Career)"
      class="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <div class="flex items-center justify-between">
      <label class="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          v-model="goal.isMeasurable"
          class="form-checkbox text-blue-600"
        />
        <span class="select-none">📏 Measurable</span>
      </label>

      <input
        v-if="goal.isMeasurable"
        v-model.number="goal.target"
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
</template>

<script>
export default {
  emits: ["goal-added"],
  data() {
    return {
      goal: {
        title: "",
        category: "",
        isMeasurable: false,
        target: 0,
      },
    };
  },
  methods: {
    handleSubmit() {
      const payload = {
        id: Date.now(),
        title: this.goal.title,
        category: this.goal.category,
        isMeasurable: this.goal.isMeasurable,
        target: this.goal.isMeasurable ? this.goal.target : 0,
        progress: 0,
        completed: false,
        subtasks: [],
        suggestion: "",
      };

      this.$emit("goal-added", payload);

      // Reset form fields
      this.goal = {
        title: "",
        category: "",
        isMeasurable: false,
        target: 0,
      };
    },
  },
};
</script>
