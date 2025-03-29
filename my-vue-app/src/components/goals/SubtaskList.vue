<template>
  <draggable
    v-model="localSubtasks"
    item-key="text"
    handle=".handle"
    class="pl-4 space-y-1"
    ghost-class="opacity-40"
    @end="emitUpdate"
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
            @change="emitUpdate"
            class="form-checkbox text-blue-600"
          />
          {{ element.text }}
        </label>
      </li>
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
  },
};
</script>
