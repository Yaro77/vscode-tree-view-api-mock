<template>
  <div class="item-container">
    <span v-if="item.collapsibleState === CollapsibleState.Collapsed" @click="expand" class="ltv-expansion">▸
    </span>
    <span v-if="item.collapsibleState === CollapsibleState.Expanded" @click="collapse" class="ltv-expansion">▾
    </span>
    <span v-if="item.collapsibleState === CollapsibleState.None">&nbsp;</span>
    <FlagIcon v-if="isLocation" width="16" height="16" />
    <span v-if="item.selectionState === SelectionState.Selected" @click="deselect" class="label">
      [{{ item.label }}]
    </span>
    <span v-else @click="select" class="label">{{ item.label }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import FlagIcon from "@/common/icons/FlagIcon.vue";
import { CollapsibleState, SelectionState, DefaultSlotProps } from '@/common/treeView/types';
import { LocationNode, LocationNodeType } from './dataProvider';

export interface Props extends DefaultSlotProps {
}

const props = defineProps<Props>();
const { item } = toRefs(props)

const isLocation = computed(() => (item.value as LocationNode).type === LocationNodeType.Location)
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
