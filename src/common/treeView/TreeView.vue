<template>
  <div class="tree-view">
    <slot v-if="isEmptyTree" name="empty-tree" />
    <ul v-else>
      <TreeViewNode ref="vnChildren" v-for="node in rootNodes" :key="getKey(node)" :get-key="getKey" :item="node">
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
import { ref, watch, computed, provide, toValue, shallowRef, toRaw } from 'vue';
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
  FilterKey,
  SelectionControllerKey,
  TreeItemComparerKey,
} from "./constants"
import TreeViewNode from './TreeViewNode.vue';

export interface Props {
  dataProvider?: TreeViewDataProvider<any>;
  selectionController?: TreeViewSelectionController<any>;
  nodeComparer?: TreeItemComparer;
  getKey: (item: TreeItem) => any;
  filter?: (element: any) => boolean;
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
const filter = ref(props.filter)!
const dataProvider = shallowRef(props.dataProvider)!
const selectionController = shallowRef(props.selectionController)!
const rootNodes = ref<TreeItem[]>([]);
const vnChildren = ref<InstanceType<typeof TreeViewNode>[]>([])

defineExpose({
  reveal,
})

provide(DataProviderKey, dataProvider);
provide(SelectionControllerKey, selectionController);
provide(TreeItemComparerKey, nodeComparer);
provide(FilterKey, filter)

watch(() => props.filter, (f) => {
  filter.value = f
  rootNodes.value = getRootNodes();
})

watch(
  dataProvider!,
  () => {
    rootNodes.value = getRootNodes();
  },
  { immediate: true }
);

const isEmptyTree = computed<boolean>(() => rootNodes.value.length === 0);

function getRootNodes(): TreeItem[] {
  const dp = toValue(dataProvider)
  if (!dp) {
    return []
  }
  const roots = dp.getChildren();
  let nodes = roots.filter(n => deepMatch(n)).map((n: any) => dp.getTreeItem(n));
  const comparer = toValue(nodeComparer)
  if (comparer) {
    nodes.sort(comparer);
  }
  return nodes
}

async function reveal(element: any) {
  const dp = toValue(dataProvider)
  if (!dp || !dp.getParent) {
    return
  }

  const subtree = [] as TreeItem[]
  let parent = element
  while (parent) {
    const it = dp.getTreeItem(parent)
    if (it) {
      subtree.unshift(it)
    }

    parent = dp.getParent(parent)
  }

  let vn = vnChildren.value
  const lastItem = subtree[subtree.length - 1]
  for (const item of subtree) {
    for (const node of vn) {
      const deeperNodes = await node.expandNode(item, toRaw(item) === toRaw(lastItem))

      if (deeperNodes && deeperNodes.length > 0) {
        vn = deeperNodes
        break
      }
    }
  }
}

function deepMatch(element: any): boolean {
  if (!filter!.value || filter.value(element)) {
    return true
  }
  const children = dataProvider!.value?.getChildren(element) ?? [];
  return children.some(ch => deepMatch(ch))
}

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
