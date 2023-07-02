<template>
  <TreeView :data-provider="dataProvider" :selection-controller="selectionController" :get-key="getNodeKey">
    <template #node-selection-state="selectionStateSlot">
      <TreeViewNodeCheckMarkExample v-bind="selectionStateSlot" />
    </template>
  </TreeView>
</template>

<script setup lang="ts" >
import TreeView from "@/common/treeView/TreeView.vue"
import TreeViewNodeCheckMarkExample from "../locationTreeView/TreeViewNodeCheckMarkExample.vue";
import { ISearchNode, Props, SearchTreeItem } from "./types"
import { ref, shallowRef, toValue, watch } from "vue";
import { TreeItem, TreeViewDataProvider, TreeViewSelectionController } from "@/common/treeView/types";
import DataProvider from "./dataProvider";
import SubtreeSelectionController from "@/common/treeView/subtreeSelectionController";
// import ClassicSelectionController from "@/common/treeView/classicSelectionController";

const props = withDefaults(defineProps<Props>(), {
  selectedLocations: () => ([])
})
const shallowResponse = shallowRef(props.response)

const dataProvider = ref<TreeViewDataProvider>()
const selectionController = ref<TreeViewSelectionController>()

const localSelectedLocations = ref<ISearchNode[]>([])

const emit = defineEmits<{
  'update:selected-locations': [selection: ISearchNode[]];
}>();

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

</script>

<style lang="scss" scoped>
.tree-view {
  font-family: monospace;
  height: 100%;
  overflow-y: auto;
}
</style>