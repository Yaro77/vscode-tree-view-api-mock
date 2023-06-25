<template>
  <div class="location-tree-view">
    <div><button @click="clearSelection">Clear</button></div>
    <TreeView
      :data-provider="dataProvider"
      :selection-controller="selectionController"
      node-key="id"
    >
      <template v-slot:empty-tree>No locations</template>
      <template v-slot:node-collapsible-state="{ item, expand, collapse }">
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
        <span v-if="item.collapsibleState === CollapsibleState.None"
          >&nbsp;</span
        >
      </template>
      <template v-slot:node-selection-state="{ item, select, deselect }">
        <span
          v-if="item.selectionState === SelectionState.Unselected"
          @click="select(item)"
          class="ltv-selection"
          >[ ]
        </span>
        <span
          v-if="item.selectionState === SelectionState.Selected"
          @click="deselect(item)"
          class="ltv-selection"
          >[✔]
        </span>
        <span
          v-if="item.selectionState === SelectionState.Intermediate"
          @click="select(item)"
          class="ltv-selection"
          >[▪]
        </span>
      </template>
      <template v-slot:node-label="{ item, toggleCollapsibleState }"
        ><span>{{ item.label }}</span></template
      >
    </TreeView>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue';
import TreeView from '@/common/treeView/TreeView.vue';
import { CollapsibleState, SelectionState } from '@/common/treeView/types';
import {
  LocationTreeViewDataProvider,
  LocationTreeViewItem,
  LocationNode,
} from './dataProvider';
import { EagerSelectionController } from '@/common/treeView/eagerSelectionController';

export interface Props {
  referenceDescription?: RefDescription;
}

const emit = defineEmits<{
  'selection-changed': [selection: any[]];
}>();

const props = defineProps<Props>();

const { referenceDescription } = toRefs(props);

const dataProvider = ref<LocationTreeViewDataProvider | undefined>();
const selectionController = ref<
  LocationTreeViewSelectionController | undefined
>();

watch(
  referenceDescription,
  (rd) => {
    let sc = selectionController.value;
    if (!!sc) {
      sc.onSelectionDidChange.removeEventListener(
        'change',
        onSelectionDidChange
      );
    }
    if (!!rd) {
      dataProvider.value = new LocationTreeViewDataProvider(rd);
      sc = new EagerSelectionController(dataProvider.value);
      sc.onSelectionDidChange.addEventListener('change', onSelectionDidChange);
      selectionController.value = sc;
    }
  },
  { immediate: true }
);

function cloneLocationNode(n: LocationNode) {
  return new LocationNode(n.label, n.collapsibleState, n.id, n.type);
}

function onSelectionDidChange(e: any) {
  emit('selection-changed', e.detail.map(cloneLocationNode));
}

function clearSelection() {
  const sc = selectionController.value;
  if (!sc) {
    return;
  }

  sc.clear();
}
</script>

<style lang="scss" scoped>
.location-tree-view {
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
.tree-view {
  font-family: monospace;
  height: 100%;
  overflow-y: auto;
}
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
</style>
