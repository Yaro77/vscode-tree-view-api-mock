<template>
  <span v-if="item.selectionState === SelectionState.Unselected" @click="select" class="selection">[ ]
  </span>
  <span v-if="item.selectionState === SelectionState.Selected" @click="deselect" class="selection">[✔]
  </span>
  <span v-if="item.selectionState === SelectionState.Intermediate" @click="select" class="selection">[▪]
  </span>
</template>

<script lang="ts" setup>
import { SelectionState, SelectionStateSlotProps } from '@/common/treeView/types';

export interface Props extends SelectionStateSlotProps {
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
@use '@/common/treeView/treeView.scss';

.selection {
  @include treeView.control();
}
</style>
