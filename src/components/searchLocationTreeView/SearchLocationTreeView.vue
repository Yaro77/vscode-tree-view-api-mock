<template>
  <TreeView :data-provider="dataProvider" :selection-controller="selectionController" :filter="localFilter"
    :get-key="getNodeKey" :node-comparer="compareNodes">
    <template #empty-tree>
      <template v-if="!!localFilter">Nothing was found</template>
      <template v-else>Empty</template>
    </template>
    <template #node-selection-state="selectionStateSlot">
      <TreeViewNodeCheckMarkExample v-bind="selectionStateSlot" />
    </template>
  </TreeView>
</template>

<script setup lang="ts" >
import TreeView from "@/common/treeView/TreeView.vue"
import TreeViewNodeCheckMarkExample from "../locationTreeView/TreeViewNodeCheckMarkExample.vue";
import { ISearchNode, Props, SearchNode, SearchTreeItem } from "./types"
import { ref, shallowRef, toValue, watch } from "vue";
import { TreeItem, TreeItemComparer, TreeViewDataProvider, TreeViewSelectionController } from "@/common/treeView/types";
import DataProvider from "./dataProvider";
import SubtreeSelectionController from "@/common/treeView/subtreeSelectionController";
// import ClassicSelectionController from "@/common/treeView/classicSelectionController";

const props = withDefaults(defineProps<Props>(), {
  selectedLocations: () => ([])
})

const localFilter = ref<((element: SearchNode) => boolean) | undefined>()
const shallowResponse = shallowRef(props.response)

const dataProvider = ref<TreeViewDataProvider>()
const selectionController = ref<TreeViewSelectionController>()

const localSelectedLocations = ref<ISearchNode[]>([])

const emit = defineEmits<{
  'update:selected-locations': [selection: ISearchNode[]];
}>();

watch(() => props.filter, f => {
  if (f) {
    localFilter.value = (element: SearchNode) => element.name.toLocaleLowerCase().indexOf(f.toLocaleLowerCase()) >= 0
  } else {
    localFilter.value = undefined
  }
}, { immediate: true })


watch(() => props.selectedLocations, (selected) => {
  if (!isSelectedLocationsChanged(selected ?? [], localSelectedLocations.value)) {
    return
  }

  const sc = toValue(selectionController)
  const dp = toValue(dataProvider)
  if (!sc || !dp) {
    return
  }

  sc.clear(true)
  const items = selected.map(s => dp.getTreeItem(s))
  sc.select(items)
})

watch(shallowResponse, (r) => {
  if (r) {
    dataProvider.value = new DataProvider(
      r.referenceDescription,
      r.regionIds,
      r.locations,
      r.locationAreaIds
    )
    selectionController.value = new SubtreeSelectionController(dataProvider.value)
    // selectionController.value = new ClassicSelectionController(dataProvider.value)
    selectionController.value.onSelectionDidChange.addEventListener("change", onSelectionChange)
  } else {
    selectionController.value?.onSelectionDidChange.removeEventListener("change", onSelectionChange)
    selectionController.value = undefined
    dataProvider.value = undefined
  }

}, { immediate: true })

function getNodeKey(item: TreeItem) {
  return (item as SearchTreeItem).node.id
}

function onSelectionChange(e: Event) {
  localSelectedLocations.value = (e as CustomEvent).detail as ISearchNode[]
  emit("update:selected-locations", localSelectedLocations.value)
}

function isSelectedLocationsChanged(newSelection: ISearchNode[], oldSelection: ISearchNode[]) {
  const equal = (a: ISearchNode, b: ISearchNode) => a.id === b.id && a.parentId === b.parentId && a.type === b.type

  return newSelection.some(a => -1 === oldSelection.findIndex(b => equal(a, b))) ||
    oldSelection.some(a => -1 === newSelection.findIndex(b => equal(a, b)))
}

function compareNodes(a: TreeItem, b: TreeItem): number {
  const sa = a as SearchTreeItem
  const sb = b as SearchTreeItem

  if (sa.node.id === -133) {
    return 1
  }

  if (sb.node.id === -133) {
    return -1
  }

  if (sa.node.name < sb.node.name) {
    return -1
  }
  if (sa.node.name > sb.node.name) {
    return 1
  }
  return 0
}

// @ts-ignore
function invertCompare(compare: TreeItemComparer): TreeItemComparer {
  return (a: TreeItem, b: TreeItem) => -compare(a, b)
}

</script>

<style lang="scss" scoped>
.tree-view {
  font-family: monospace;
  height: 100%;
  overflow-y: auto;
}
</style>