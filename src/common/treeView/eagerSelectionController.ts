import { toRaw } from 'vue';
import {
  TreeViewDataProvider,
  TreeViewSelectionController,
  TreeItem,
  SelectionState,
} from './types';

import type { Selectable } from './types';
import { LocationNode } from '@/components/locationTreeView/dataProvider';

export class EagerSelectionController extends TreeViewSelectionController<TreeItem> {
  private selectionDidChangeEventTarget: EventTarget = new EventTarget();
  private selectedItems: TreeItem[] = [];

  constructor(dataProvider: TreeViewDataProvider) {
    super(dataProvider);
  }

  get onSelectionDidChange(): EventTarget {
    return this.selectionDidChangeEventTarget;
  }

  getSelectable(item: TreeItem): Selectable<TreeItem> {
    const selectable = item as Selectable<TreeItem>;
    if (selectable.selectionState === undefined) {
      selectable.selectionState = SelectionState.Unselected;
    }
    return selectable;
  }

  select(item: TreeItem): void {
    this.selectInternal(item);

    this.selectedItems = this.getSelectedItemsInternal();
    this.fireSelectionDidChange(this.selectedItems);
  }

  deselect(item: TreeItem): void {
    this.deselectInternal(item);
    this.selectedItems = this.getSelectedItemsInternal();
    this.fireSelectionDidChange(this.selectedItems);
  }

  private selectInternal(item: TreeItem): void {
    const selectable = this.getSelectable(item);
    const selectDown = (item: Selectable<TreeItem>) => {
      const children = this.getChildren(item).map((it: TreeItem) =>
        this.getSelectable(it)
      );
      children.forEach((child: Selectable<TreeItem>) => {
        child.selectionState = SelectionState.Selected;
        selectDown(child);
      });
    };

    const selectUp = (item: Selectable<TreeItem>) => {
      const parent = this.getParent(item);
      if (parent) {
        const allSelected = this.getChildren(parent).every(
          (it: TreeItem) =>
            this.getSelectable(it).selectionState === SelectionState.Selected
        );
        const selectableParent = this.getSelectable(parent);
        if (allSelected) {
          selectableParent.selectionState = SelectionState.Selected;
        } else {
          selectableParent.selectionState = SelectionState.Intermediate;
        }
        selectUp(selectableParent);
      }
    };

    selectable.selectionState = SelectionState.Selected;
    selectDown(selectable);
    selectUp(selectable);
  }

  private deselectInternal(item: TreeItem): void {
    const selectable = this.getSelectable(item);

    const deselectDown = (item: Selectable<TreeItem>) => {
      const children = this.getChildren(item).map((it: TreeItem) =>
        this.getSelectable(it)
      );
      children.forEach((child: Selectable<TreeItem>) => {
        child.selectionState = SelectionState.Unselected;
        deselectDown(child);
      });
    };

    const deselectUp = (item: Selectable<TreeItem>) => {
      const parent = this.getParent(item);
      if (parent) {
        const allUnselected = this.getChildren(parent).every(
          (it) =>
            this.getSelectable(it).selectionState === SelectionState.Unselected
        );
        const selectableParent = this.getSelectable(parent);
        if (allUnselected) {
          selectableParent.selectionState = SelectionState.Unselected;
        } else {
          selectableParent.selectionState = SelectionState.Intermediate;
        }
        deselectUp(selectableParent);
      }
    };

    selectable.selectionState = SelectionState.Unselected;
    deselectDown(selectable);
    deselectUp(selectable);
  }

  getSelectedItems(): TreeItem[] {
    return this.selectedItems;
  }

  private fireSelectionDidChange(selectedItems: TreeItem[]) {
    this.onSelectionDidChange.dispatchEvent(
      new CustomEvent('change', {
        detail: selectedItems.map((it) => toRaw(it)),
      })
    );
  }

  private getSelectedItemsInternal(): TreeItem[] {
    const ret = [] as TreeItem[];

    const searchSelected = (item?: TreeItem) => {
      const children = this.getChildren(item).map((it: TreeItem) =>
        this.getSelectable(it)
      );
      for (const it of children) {
        if (it.selectionState === SelectionState.Selected) {
          ret.push(it);
        } else if (it.selectionState === SelectionState.Intermediate) {
          searchSelected(it);
        }
      }
    };

    searchSelected();

    return ret;
  }

  clear(): void {
    const rootItems = this.getChildren();
    rootItems.forEach((item) => this.deselectInternal(item));

    this.selectedItems = this.getSelectedItemsInternal();
    this.fireSelectionDidChange(this.selectedItems);
  }

  private getChildren(item?: TreeItem): TreeItem[] {
    return this.dataProvider
      .getChildren(item)
      .map((child: TreeItem) => this.dataProvider.getTreeItem(child));
  }

  private getParent(it: TreeItem): TreeItem | undefined {
    const p = this.dataProvider.getParent(it);
    if (p) {
      return this.dataProvider.getTreeItem(p);
    }
  }
}
