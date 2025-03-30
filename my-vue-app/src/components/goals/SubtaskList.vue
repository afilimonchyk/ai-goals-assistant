<template>
  <draggable
    :list="localSubtasks"
    item-key="text"
    handle=".handle"
    class="pl-2 space-y-2"
    ghost-class="opacity-50"
    @end="emitUpdate"
  >
    <template #item="{ element, index }">
      <div
        class="flex items-center justify-between p-2 bg-gray-50 rounded-lg shadow-sm hover:bg-white transition"
        :class="{ 'opacity-60 line-through': element.done }"
      >
        <!-- Left side: drag + checkbox + text -->
        <div class="flex items-center gap-3">
          <span class="handle cursor-move text-gray-400 hover:text-gray-600"
            >☰</span
          >

          <!-- Custom styled checkbox -->
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="element.done"
              @change="emitUpdate"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="text-sm text-gray-700">{{ element.text }}</span>
          </label>
        </div>

        <!-- Delete button -->
        <button
          @click="removeSubtask(index)"
          class="text-gray-300 hover:text-red-500 transition"
          title="Delete subtask"
        >
          🗑
        </button>
      </div>
    </template>
  </draggable>
</template>

<script>
import draggable from "vuedraggable";

export default {
  props: {
    subtasks: {
      type: Array,
      required: true,
    },
  },
  components: { draggable },
  data() {
    return {
      localSubtasks: [...this.subtasks],
    };
  },
  watch: {
    subtasks(newValue) {
      this.localSubtasks = [...newValue];
    },
  },
  methods: {
    emitUpdate() {
      this.$emit("update:subtasks", this.localSubtasks);
    },
    removeSubtask(index) {
      this.localSubtasks.splice(index, 1);
      this.emitUpdate();
    },
  },
};
</script>
