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
import { ref, watch, computed, provide, toValue, shallowRef } from 'vue';
import { } from 'vue';
import {
  TreeItem,
  TreeViewDataProvider,
  TreeViewSelectionController,
  TreeItemComparer,
  DefaultSlotProps,
  CollapsibleStateSlotProps,
  SelectionStateSlotProps,
} from './types';
import {
  DataProviderKey,
  SelectionControllerKey,
  TreeItemComparerKey,
} from "./constants"
import TreeViewNode from './TreeViewNode.vue';

export interface Props {
  dataProvider?: TreeViewDataProvider<any>;
  selectionController?: TreeViewSelectionController<any>;
  nodeComparer?: TreeItemComparer;
  getKey: (item: TreeItem) => any;
}

const props = defineProps<Props>();


defineSlots<{
  node(props: DefaultSlotProps): any
  ["empty-tree"](props: {}): any
  ["node-label"](props: DefaultSlotProps): any
  ["node-collapsible-state"](props: CollapsibleStateSlotProps): any
  ["node-selection-state"](props: SelectionStateSlotProps): any
}>()


const nodeComparer = ref(props.nodeComparer)!
const dataProvider = shallowRef(props.dataProvider)!
const selectionController = shallowRef(props.selectionController)!
const rootNodes = ref<TreeItem[]>([]);

provide(DataProviderKey, dataProvider);
provide(SelectionControllerKey, selectionController);
provide(TreeItemComparerKey, nodeComparer);

watch(
  dataProvider!,
  (dp) => {
    if (!dp) {
      rootNodes.value = [];
      return;
    }
    const roots = dp.getChildren();
    let nodes = roots.map((n: any) => dp.getTreeItem(n));
    const comparer = toValue(nodeComparer)
    if (comparer) {
      nodes.sort(comparer);
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
