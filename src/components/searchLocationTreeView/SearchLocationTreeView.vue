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
import { Props, SearchTreeItem } from "./types"
import { ref, shallowRef, watch } from "vue";
import { TreeItem, TreeViewDataProvider, TreeViewSelectionController } from "@/common/treeView/types";
import DataProvider from "./dataProvider";
import SubtreeSelectionController from "@/common/treeView/subtreeSelectionController";
// import ClassicSelectionController from "@/common/treeView/classicSelectionController";

const props = defineProps<Props>()
const shallowResponse = shallowRef(props.response)

const dataProvider = ref<TreeViewDataProvider>()
const selectionController = ref<TreeViewSelectionController>()

const emit = defineEmits<{
  'selection-changed': [selection: any[]];
}>();

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
  emit('selection-changed', (e as CustomEvent).detail);
}

</script>

<style lang="scss" scoped>
.tree-view {
  font-family: monospace;
  height: 100%;
  overflow-y: auto;
}
</style>