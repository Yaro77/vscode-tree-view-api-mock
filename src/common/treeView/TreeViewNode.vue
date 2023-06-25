<template>
  <li class="tvn">
    <div>
      <slot
        name="collapsible-state"
        :item="item"
        :expand="expand"
        :collapse="collapse"
      />
      <slot
        v-if="needRenderSelectionControl"
        name="selection-state"
        :item="item"
        :select="select"
        :deselect="deselect"
      />
      <slot name="label" :item="item">{{ item.label }}</slot>
    </div>
    <ul v-if="item.collapsibleState === CollapsibleState.Expanded">
      <TreeViewNode
        ref="childNodes"
        v-for="child in children"
        :item="child"
        :node-key="nodeKey"
        :key="child[nodeKey]"
      >
        <template v-slot:collapsible-state="collapsibleState">
          <slot name="collapsible-state" v-bind="collapsibleState" />
        </template>
        <template v-slot:selection-state="selectionState">
          <slot name="selection-state" v-bind="selectionState" />
        </template>
        <template v-slot:label="label">
          <slot name="label" v-bind="label" />
        </template>
      </TreeViewNode>
    </ul>
  </li>
</template>

<script lang="ts" setup>
import {
  ref,
  inject,
  toRefs,
  computed,
  onBeforeUnmount,
  watch,
  getCurrentInstance,
} from 'vue';
import {
  TreeItem,
  DataProviderKey,
  TreeViewDataProvider,
  SelectionControllerKey,
  TreeViewSelectionController,
  CollapsibleState,
  SelectionState,
  Selectable,
} from './types';

export interface Props {
  item: TreeItem;
  nodeKey: string;
}

const props = defineProps<Props>();
const { item } = toRefs(props);
const childNodes = ref();

const emit = defineEmits<{
  'item-click': [item: TreeItem];
}>();

const dataProvider = inject<TreeViewDataProvider>(DataProviderKey);
const selectionController = inject<TreeViewSelectionController>(
  SelectionControllerKey
);
const children = ref<TreeItem[] | undefined>();
const needRenderSelectionControl = ref<boolean>(false);
const vm = getCurrentInstance();

watch(
  selectionController,
  (sc) => {
    needRenderSelectionControl.value = !!sc;
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (item.value.collapsibleState === CollapsibleState.Expanded) {
    (children.value || []).forEach((child) => {
      if (child.collapsibleState === CollapsibleState.Expanded) {
        child.collapsibleState = CollapsibleState.Collapsed;
      }
    });
    item.value.collapsibleState = CollapsibleState.Collapsed;
  }
});

function collapse() {
  if (item.value.collapsibleState === CollapsibleState.None) {
    return;
  }
  item.value.collapsibleState = CollapsibleState.Collapsed;
}

function expand() {
  if (item.value.collapsibleState === CollapsibleState.None) {
    return;
  }
  if (children.value === undefined) {
    const ch = dataProvider.value
      .getChildren(item.value)
      .map((child) => dataProvider.value.getTreeItem(child));
    if (selectionController.value) {
      children.value = ch.map((c) =>
        selectionController.value.getSelectable(c)
      );
    } else {
      children.value = ch;
    }
  }
  item.value.collapsibleState = CollapsibleState.Expanded;
}

function select() {
  const sc = selectionController.value;
  if (!sc) {
    return;
  }

  sc.select(item.value);
}

function deselect() {
  const sc = selectionController.value;
  if (!sc) {
    return;
  }

  const dp = dataProvider.value;
  sc.deselect(item.value);
}
</script>

<style lang="scss" scoped>
.tvn {
}
</style>