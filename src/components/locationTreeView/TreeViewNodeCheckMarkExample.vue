<template>
  <span
    v-if="item.selectionState === SelectionState.Unselected"
    @click="select(item)"
    class="selection"
    >[ ]
  </span>
  <span
    v-if="item.selectionState === SelectionState.Selected"
    @click="deselect(item)"
    class="selection"
    >[✔]
  </span>
  <span
    v-if="item.selectionState === SelectionState.Intermediate"
    @click="select(item)"
    class="selection"
    >[▪]
  </span>
</template>

<script lang="ts" setup>
import { TreeItem, SelectionState } from '@/common/treeView/types';

export interface Props {
  item: TreeItem;
  select: (item: TreeItem) => void;
  deselect: (item: TreeItem) => void;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
@use '@/common/treeView/treeView.scss';
.selection {
  @include treeView.control();
}
</style>
