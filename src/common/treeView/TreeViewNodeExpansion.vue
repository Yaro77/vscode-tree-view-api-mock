<template>
  <span
    v-if="item.collapsibleState === CollapsibleState.Collapsed"
    @click="expand"
    class="expansion"
    >▸
  </span>
  <span
    v-if="item.collapsibleState === CollapsibleState.Expanded"
    @click="collapse"
    class="expansion"
    >▾
  </span>
  <span v-if="item.collapsibleState === CollapsibleState.None">&nbsp;</span>
</template>

<script lang="ts" setup>
import { TreeItem, CollapsibleState } from './types';

export interface Props {
  item: TreeItem;
  expand: () => void;
  collapse: () => void;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
@use './treeView';
.expansion {
  @include treeView.control();
}
</style>
