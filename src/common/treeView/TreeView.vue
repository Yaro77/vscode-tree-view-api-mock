<template>
  <div class="tree-view">
    <slot v-if="isEmptyTree" name="empty-tree" />
    <ul v-else>
      <TreeViewNode v-for="node in rootNodes" :key="getKey(node)" :get-key="getKey" :item="node">
        <template v-slot:default="defaultSlot">
          <slot name="node" v-bind="defaultSlot" />
        </template>
        <template v-slot:collapsible-state="collapsibleStateSlot">
          <slot name="node-collapsible-state" v-bind="collapsibleStateSlot" />
        </template>

        <template v-slot:selection-state="selectionStateSlot">
          <slot name="node-selection-state" v-bind="selectionStateSlot" />
        </template>

        <template v-slot:label="labelSlot">
          <slot name="node-label" v-bind="labelSlot" />
        </template>
      </TreeViewNode>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch, computed, provide } from 'vue';
import { } from 'vue';
import {
  TreeItem,
  TreeViewDataProvider,
  TreeViewSelectionController,
  TreeItemComparer,
} from './types';
import {
  DataProviderKey,
  SelectionControllerKey,
  TreeItemComparerKey,
} from "./constants"
import TreeViewNode from './TreeViewNode.vue';

export interface Props {
  dataProvider: TreeViewDataProvider<any>;
  selectionController: TreeViewSelectionController<any> | undefined;
  nodeComparer: TreeItemComparer | undefined;
  getKey: (item: TreeItem) => any;
}

const props = defineProps<Props>();

const { dataProvider, selectionController, nodeComparer } =
  toRefs(props);
const rootNodes = ref<TreeItem[]>([]);

provide(DataProviderKey, dataProvider);
provide(SelectionControllerKey, selectionController);
provide(TreeItemComparerKey, nodeComparer);

watch(
  dataProvider,
  (provider) => {
    if (!provider) {
      rootNodes.value = [];
      return;
    }
    const roots = provider.getChildren();
    let nodes = roots.map((n: any) => provider.getTreeItem(n));
    if (nodeComparer.value) {
      nodes.sort(nodeComparer.value);
    }
    if (selectionController.value) {
      nodes = nodes.map((n) => selectionController.value!.getSelectable(n));
    }
    rootNodes.value = nodes;
  },
  { immediate: true }
);

const isEmptyTree = computed<boolean>(() => rootNodes.value.length === 0);
</script>

<style lang="scss" scoped>
.tree-view {
  color: magenta;

  :deep(ul) {
    list-style-type: none;
    padding-left: 20px;
    margin: 0;
  }
}
</style>
