<template>
  <li ref="root" class="tvn">
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
      <TreeViewNode ref="vnChildren" v-for="child in children" :item="child" :get-key="getKey" :key="getKey(child)">
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
  toValue,
  nextTick,
  toRaw,
} from 'vue';
import {
  TreeItem,
  CollapsibleState,
  DefaultSlotProps,
  CollapsibleStateSlotProps,
  SelectionStateSlotProps,
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

defineOptions({
  name: "TreeViewNode"
})

const props = defineProps<Props>();

defineSlots<{
  default(props: DefaultSlotProps): any
  label(props: DefaultSlotProps): any
  ["collapsible-state"](props: CollapsibleStateSlotProps): any
  ["selection-state"](props: SelectionStateSlotProps): any
}>()

const { item } = toRefs(props);
const vnChildren = ref()

const dataProvider = inject(DataProviderKey)!;
const selectionController = inject(SelectionControllerKey);
const nodeComparer = inject(TreeItemComparerKey);
const children = ref<TreeItem[] | undefined>();
const root = ref<HTMLElement | null>()
const needRenderSelectionControl = ref<boolean>(false);

defineExpose({ expand, expandNode, collapse })

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
    return
  }
  item.value.collapsibleState = CollapsibleState.Collapsed;
}

function expand() {
  const it = toValue(item)
  const dp = toValue(dataProvider)
  if (it.collapsibleState === CollapsibleState.None) {
    return
  }
  if (children.value === undefined) {
    let ch = [] as TreeItem[]
    if (dp) {
      ch = dp.getChildren(dp.getData(it))
        .map((n: any) => dp.getTreeItem(n));
    }

    const comparer = toValue(nodeComparer)
    if (comparer) {
      ch.sort(comparer);
    }

    children.value = ch;
  }
  item.value.collapsibleState = CollapsibleState.Expanded;
}

async function expandNode(it: TreeItem, scrollIntoView: boolean) {
  if (toRaw(it) === toRaw(item.value)) {
    if (!scrollIntoView) {
      expand()
      await nextTick()
    }
    if (scrollIntoView && window !== undefined) {
      root.value?.scrollIntoView(true)
    }
    return vnChildren.value
  }
}

function select(event?: Event) {
  const it = toValue(item)
  const sc = toValue(selectionController);
  if (sc) {
    sc.select([it], event);
  }
}

function deselect(event?: Event) {
  const it = toValue(item)
  const sc = toValue(selectionController);
  if (sc) {
    sc.deselect([it], event);
  }
}
</script>

<style lang="scss" scoped>
.tvn {}
</style>
