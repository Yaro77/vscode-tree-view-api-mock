<template>
  <div class="item-container">
    <span v-if="item.collapsibleState === CollapsibleState.Collapsed" @click="expand" class="ltv-expansion">▸
    </span>
    <span v-if="item.collapsibleState === CollapsibleState.Expanded" @click="collapse" class="ltv-expansion">▾
    </span>
    <span v-if="item.collapsibleState === CollapsibleState.None">&nbsp;</span>
    <FlagIcon v-if="selectableItem.type === LocationNodeType.Location" width="16" height="16" />
    <span v-if="selectableItem.selectionState === SelectionState.Selected" @click="deselect" class="label">
      [{{ item.label }}]
    </span>
    <span v-else @click="select" class="label">{{ item.label }}</span>
  </div>
</template>

<script lang="ts" setup>
import FlagIcon from "@/common/icons/FlagIcon.vue";
import { CollapsibleState, SelectionState, Selectable, TreeItem } from '@/common/treeView/types';
import { LocationNode, LocationNodeType } from './dataProvider';
import { computed } from "vue";

export interface Props {
  item: TreeItem;
  select: (e: Event) => void;
  deselect: (e: Event) => void;
  expand: () => void;
  collapse: () => void;
}

const { item } = defineProps<Props>();

const selectableItem = computed(() => item as Selectable<LocationNode>)
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
