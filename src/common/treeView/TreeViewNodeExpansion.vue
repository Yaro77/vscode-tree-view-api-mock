<template>
  <span v-if="filterAwareCollapsibleState === CollapsibleState.Collapsed" @click="expand" class="expansion">▸
  </span>
  <span v-if="filterAwareCollapsibleState === CollapsibleState.Expanded" @click="collapse" class="expansion">▾ </span>
  <span v-if="filterAwareCollapsibleState === CollapsibleState.None">&nbsp;&nbsp;</span>
</template>

<script lang="ts" setup>
import { CollapsibleState, CollapsibleStateSlotProps } from './types';

export interface Props extends CollapsibleStateSlotProps {
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
@use './treeView';

.expansion {
  @include treeView.control();
}
</style>
