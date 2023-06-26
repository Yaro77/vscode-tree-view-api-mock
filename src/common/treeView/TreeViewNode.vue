<template>
  <li class="tvn">
    <div>
      <slot
        :item="item"
        :expand="expand"
        :collapse="collapse"
        :select="select"
        :deselect="deselect"
      >
        <slot
          name="collapsible-state"
          :item="item"
          :expand="expand"
          :collapse="collapse"
        >
          <DefaultExpansion
            :item="item"
            :expand="expand"
            :collapse="collapse"
          />
        </slot>
        <slot
          v-if="needRenderSelectionControl"
          name="selection-state"
          :item="item"
          :select="select"
          :deselect="deselect"
        />
        <slot
          name="label"
          :item="item"
          :expand="expand"
          :collapse="collapse"
          :select="select"
          :deselect="deselect"
        >
          <span>{{ item.label }}</span>
        </slot>
      </slot>
    </div>
    <ul v-if="item.collapsibleState === CollapsibleState.Expanded">
      <TreeViewNode
        ref="childNodes"
        v-for="child in children"
        :item="child"
        :node-key="nodeKey"
        :key="child[nodeKey]"
      >
        <template v-slot:default="defaultSlot">
          <slot v-bind="defaultSlot" />
        </template>
        <template v-slot:collapsible-state="collapsibleStateSlot">
          <slot name="collapsible-state" v-bind="collapsibleStateSlot" />
        </template>
        <template v-slot:selection-state="selectionStateSlot">
          <slot name="selection-state" v-bind="selectionStateSlot" />
        </template>
        <template v-slot:label="labelSlot">
          <slot name="label" v-bind="labelSlot" />
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
import DefaultExpansion from './TreeViewNodeExpansion.vue';

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

function select(event?: Event) {
  const sc = selectionController.value;
  if (!sc) {
    return;
  }

  sc.select(item.value, event);
}

function deselect(event?: Event) {
  const sc = selectionController.value;
  if (!sc) {
    return;
  }

  const dp = dataProvider.value;
  sc.deselect(item.value, event);
}
</script>

<style lang="scss" scoped>
.tvn {
}
</style>
