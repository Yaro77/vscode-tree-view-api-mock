<template>
  <li class="tvn">
    <div>
      <slot :item="item" :expand="expand" :collapse="collapse" :select="select" :deselect="deselect">
        <slot name="collapsible-state" :item="item" :expand="expand" :collapse="collapse">
          <DefaultExpansion :item="item" :expand="expand" :collapse="collapse" />
        </slot>
        <slot v-if="needRenderSelectionControl" name="selection-state" :item="item" :select="select"
          :deselect="deselect" />
        <slot name="label" :item="item" :expand="expand" :collapse="collapse" :select="select" :deselect="deselect">
          <span>{{ item.label }}</span>
        </slot>
      </slot>
    </div>
    <ul v-if="item.collapsibleState === CollapsibleState.Expanded">
      <TreeViewNode ref="childNodes" v-for="child in children" :item="child" :get-key="getKey" :key="getKey(child)">
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
  onBeforeUnmount,
  watch,
} from 'vue';
import {
  TreeItem,
  CollapsibleState,
} from './types';
import {
  DataProviderKey,
  SelectionControllerKey,
  TreeItemComparerKey,
} from "./constants"
import DefaultExpansion from './TreeViewNodeExpansion.vue';

export interface Props {
  item: TreeItem;
  getKey: (node: TreeItem) => any;
}

export interface DefaultSlotProps {
  item: TreeItem
  expand: () => void
  collapse: () => void
  select: (event?: Event) => void
  deselect: (event?: Event) => void
}

export interface CollapsibleStateSlotProps {
  item: TreeItem
  expand: () => void
  collapse: () => void
}

export interface SelectionStateSlotProps {
  item: TreeItem
  select: (event?: Event) => void
  deselect: (event?: Event) => void
}

const props = defineProps<Props>();

defineSlots<{
  default(props: DefaultSlotProps): any
  label(props: DefaultSlotProps): any
  ["collapsible-state"](props: CollapsibleStateSlotProps): any
  ["selection-state"](props: SelectionStateSlotProps): any
}>()

const { item } = toRefs(props);
const childNodes = ref();

const dataProvider = inject(DataProviderKey)!;
const selectionController = inject(SelectionControllerKey);
const nodeComparer = inject(TreeItemComparerKey);
const children = ref<TreeItem[] | undefined>();
const needRenderSelectionControl = ref<boolean>(false);

if (selectionController) {
  watch(
    selectionController,
    (sc) => {
      needRenderSelectionControl.value = !!sc;
    },
    { immediate: true }
  );
}

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
    let ch = dataProvider.value
      .getChildren(item.value)
      .map((child) => dataProvider.value.getTreeItem(child));

    if (nodeComparer && nodeComparer.value) {
      ch.sort(nodeComparer.value);
    }

    if (selectionController && selectionController.value) {
      const sc = selectionController.value
      ch = children.value = ch.map((c) =>
        sc.getSelectable(c)
      );
    }

    children.value = ch;
  }
  item.value.collapsibleState = CollapsibleState.Expanded;
}

function select(event?: Event) {
  const sc = selectionController?.value;
  if (!sc) {
    return;
  }

  sc.select(item.value, event);
}

function deselect(event?: Event) {
  const sc = selectionController?.value;
  if (!sc) {
    return;
  }

  sc.deselect(item.value, event);
}
</script>

<style lang="scss" scoped>
.tvn {}
</style>
