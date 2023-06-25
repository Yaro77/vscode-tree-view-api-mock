<template>
  <div class="tree-view">
    <slot v-if="isEmptyTree" name="empty-tree" />
    <ul v-else>
      <TreeViewNode
        v-for="node in rootNodes"
        :key="node[nodeKey]"
        :node-key="nodeKey"
        :item="node"
      >
        <template v-slot:collapsible-state="collapsibleState">
          <slot name="node-collapsible-state" v-bind="collapsibleState" />
        </template>

        <template v-slot:selection-state="selectionState">
          <slot name="node-selection-state" v-bind="selectionState" />
        </template>

        <template v-slot:label="label">
          <slot name="node-label" v-bind="label" />
        </template>
      </TreeViewNode>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch, computed, provide } from 'vue';
import type { InjectionKey } from 'vue';
import {
  TreeViewDataProvider,
  DataProviderKey,
  TreeViewSelectionController,
  SelectionControllerKey,
} from './types';
import TreeViewNode from './TreeViewNode.vue';

export interface Props {
  dataProvider?: TreeViewDataProvider<any>;
  selectionController?: TreeViewSelectionController<any>;
  nodeKey: string;
}

const props = defineProps<Props>();

const { dataProvider, selectionController, nodeKey } = toRefs(props);
const rootNodes = ref<TreeNode[]>([]);

provide(DataProviderKey, dataProvider);
provide(SelectionControllerKey, selectionController);

watch(
  dataProvider,
  (provider) => {
    if (!provider) {
      rootNodes.value = [];
      return;
    }
    const roots = provider.getChildren();
    const nodes = roots.map((n: LocationNode) => provider.getTreeItem(n));
    if (selectionController.value) {
      rootNodes.value = nodes.map((n) =>
        selectionController.value.getSelectable(n)
      );
    } else {
      rootNodes.value = nodes;
    }
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