<template>
  <div class="location-tree-view">
    <div><button @click="clearSelection">Clear</button></div>
    <TreeView :data-provider="dataProvider" :selection-controller="selectionController" :node-comparer="labelAscComparer"
      :get-key="getLocationNodeKey">
      <template v-slot:empty-tree>No locations</template>
      <template v-slot:node="nodeObj">
        <TreeViewNodeLayoutExample v-bind="nodeObj" />
      </template>
      <!-- <template v-slot:node-selection-state="selectionStateObj">
        <TreeViewNodeCheckMarkExample v-bind="selectionStateObj" />
      </template> -->
    </TreeView>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue';
import TreeView from '@/common/treeView/TreeView.vue';
import {
  TreeItem,
  TreeItemComparer,
  TreeViewSelectionController,
} from '@/common/treeView/types';
import { RefDescription } from "@/common/types"
import {
  LocationTreeViewDataProvider,
  LocationNode,
} from './dataProvider';
// import SubtreeSelectionController from '@/common/treeView/subtreeSelectionController';
import ClassicSelectionController from '@/common/treeView/classicSelectionController';
import TreeViewNodeLayoutExample from './TreeViewNodeLayoutExample.vue';
// import TreeViewNodeCheckMarkExample from './TreeViewNodeCheckMarkExample.vue';

export interface Props {
  referenceDescription: RefDescription;
}

const emit = defineEmits<{
  'selection-changed': [selection: any[]];
}>();

const props = defineProps<Props>();

const { referenceDescription } = toRefs(props);

const dataProvider = ref<LocationTreeViewDataProvider>(new LocationTreeViewDataProvider(referenceDescription.value));
const selectionController = ref<TreeViewSelectionController | undefined>();

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
      // sc = new SubtreeSelectionController(dataProvider.value);
      sc = new ClassicSelectionController(dataProvider.value);
      sc.onSelectionDidChange.addEventListener('change', onSelectionDidChange);
      selectionController.value = sc;
    }
  },
  { immediate: true }
);

function getLocationNodeKey(node: TreeItem): any {
  return (node as LocationNode).id
}

function labelAscComparer(a: TreeItem, b: TreeItem): number {
  if (a.label < b.label) {
    return -1;
  }
  if (a.label > b.label) {
    return 1;
  }
  return 0;
}


// @ts-ignore unused
function invert(comparer: TreeItemComparer) {
  return (a: TreeItem, b: TreeItem) => {
    return -comparer(a, b);
  };
}

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

.label {
  user-select: none;
}

.item-container {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
