<template>
  <span v-if="selectableItem.selectionState === SelectionState.Unselected" @click="select" class="selection">[ ]
  </span>
  <span v-if="selectableItem.selectionState === SelectionState.Selected" @click="deselect" class="selection">[✔]
  </span>
  <span v-if="selectableItem.selectionState === SelectionState.Intermediate" @click="select" class="selection">[▪]
  </span>
</template>

<script lang="ts" setup>
import { TreeItem, SelectionState, Selectable, SelectionStateSlotProps } from '@/common/treeView/types';
import { computed } from 'vue';

export interface Props extends SelectionStateSlotProps {
}

const { item } = defineProps<Props>();

const selectableItem = computed(() => item as Selectable<TreeItem>)
</script>

<style lang="scss" scoped>
@use '@/common/treeView/treeView.scss';

.selection {
  @include treeView.control();
}
</style>
