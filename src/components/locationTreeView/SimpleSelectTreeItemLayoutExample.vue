<template>
  <div class="item-container">
    <span
      v-if="item.collapsibleState === CollapsibleState.Collapsed"
      @click="expand"
      class="ltv-expansion"
      >▸
    </span>
    <span
      v-if="item.collapsibleState === CollapsibleState.Expanded"
      @click="collapse"
      class="ltv-expansion"
      >▾
    </span>
    <span v-if="item.collapsibleState === CollapsibleState.None">&nbsp;</span>
    <FlagIcon
      v-if="item.type === LocationNodeType.Location"
      width="16"
      height="16"
    />
    <span
      v-if="item.selectionState === SelectionState.Selected"
      @click="deselect"
      class="label"
    >
      [{{ item.label }}]
    </span>
    <span v-else @click="select" class="label">{{ item.label }}</span>
  </div>
</template>

<script lang="ts" setup>
import FlagIcon from '@/common/icons/FlagIcon.vue';
import { CollapsibleState, SelectionState } from '@/common/treeView/types';
import { LocationNode, LocationNodeType } from './dataProvider';

export interface Props {
  item: LocationNode;
  select: (e: Event) => void;
  deselect: (e: Event) => void;
  expand: () => void;
  collapse: () => void;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
@mixin control {
  cursor: pointer;
  user-select: none;
}
.ltv-expansion {
  @include control();
}

.ltv-selection {
  @include control();
}

.label {
  user-select: none;
}

.item-container {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
