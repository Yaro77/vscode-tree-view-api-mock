<template>
  <div class="layout">
    <slot :addEvent="addEvent"></slot>
    <div class="layout__selection">
      <div>
        <button @click="clearSelectionEvents">Clear</button>
      </div>
      <ul>
        <li v-for="selection in selectionEvents">
          ({{ selection.length }}) {{ selection }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineSlots<{
  default: (params: {
    addEvent: (selection: any[]) => void,
  }) => any
}>()

const selectionEvents = ref<any[]>([]);

function clearSelectionEvents() {
  selectionEvents.value = [];
}

function addEvent(selection: any[]) {
  selectionEvents.value.push(selection);
}
</script>

<style lang="scss" scoped>
.layout {
  position: absolute;
  inset: 0;
  display: flex;
  flex-flow: column nowrap;

  @media (min-width: 500px) {
    flex-direction: row;
  }

  > :deep(*) {
    flex: 0 0 50%;
  }
}

.layout__selection {
  display: flex;
  flex-flow: column nowrap;
  gap: 4px;

  > :nth-child(1) {
    flex: 0 0 auto;
    align-self: end;
  }

  > :nth-child(2) {
    flex: 1 1 0;
  }
}

ul {
  margin: 0;
  overflow-y: auto;
  font-size: 0.8rem;
}
</style>
