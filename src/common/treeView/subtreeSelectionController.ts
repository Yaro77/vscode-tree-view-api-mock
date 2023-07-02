import { toRaw } from 'vue';
import {
  TreeViewDataProvider,
  TreeViewSelectionController,
  TreeItem,
  SelectionState,
} from './types';

export default class extends TreeViewSelectionController<TreeItem> {
  private selectionDidChangeEventTarget: EventTarget = new EventTarget();
  private selectedItems: any[] = [];

  constructor(private dataProvider: TreeViewDataProvider) {
    super();
  }

  get onSelectionDidChange(): EventTarget {
    return this.selectionDidChangeEventTarget;
  }

  select(items: TreeItem[]): void {
    items.forEach(item => this.selectInternal(item))

    this.selectedItems = this.getSelectedItemsInternal();
    this.fireSelectionDidChange(this.selectedItems);
  }

  deselect(items: TreeItem[]): void {
    items.forEach(item => this.deselectInternal(item))

    this.selectedItems = this.getSelectedItemsInternal();
    this.fireSelectionDidChange(this.selectedItems);
  }

  private selectInternal(item: TreeItem): void {

    const selectDown = (it: TreeItem) => {
      const children = this.getChildren(it)
      children.forEach((child: TreeItem) => {
        child.selectionState = SelectionState.Selected;
        selectDown(child);
      });
    };

    const selectUp = (it: TreeItem) => {
      const parent = this.getParent(it);
      if (parent) {
        const allSelected = this.getChildren(parent).every(
          (it: TreeItem) => it.selectionState === SelectionState.Selected
        );
        if (allSelected) {
          parent.selectionState = SelectionState.Selected;
        } else {
          parent.selectionState = SelectionState.Intermediate;
        }
        selectUp(parent);
      }
    };

    item.selectionState = SelectionState.Selected;
    selectDown(item);
    selectUp(item);
  }

  private deselectInternal(item: TreeItem): void {

    const deselectDown = (it: TreeItem) => {
      const children = this.getChildren(it)
      children.forEach((child: TreeItem) => {
        child.selectionState = SelectionState.Unselected;
        deselectDown(child);
      });
    };

    const deselectUp = (it: TreeItem) => {
      const parent = this.getParent(it);
      if (parent) {
        const allUnselected = this.getChildren(parent).every(
          (x) => x.selectionState === SelectionState.Unselected
        );
        if (allUnselected) {
          parent.selectionState = SelectionState.Unselected;
        } else {
          parent.selectionState = SelectionState.Intermediate;
        }
        deselectUp(parent);
      }
    };

    item.selectionState = SelectionState.Unselected;
    deselectDown(item);
    deselectUp(item);
  }

  getSelectedItems(): any[] {
    return this.selectedItems;
  }

  private fireSelectionDidChange(selectedItems: any[]) {
    this.onSelectionDidChange.dispatchEvent(
      new CustomEvent('change', {
        detail: selectedItems.map((it) => toRaw(it)),
      })
    );
  }

  private getSelectedItemsInternal(): any[] {
    const ret = [] as any[];

    const searchSelected = (it?: TreeItem) => {
      const children = this.getChildren(it)
      for (const it of children) {
        if (it.selectionState === SelectionState.Selected) {
          ret.push(this.dataProvider.getData(it));
        } else if (it.selectionState === SelectionState.Intermediate) {
          searchSelected(it);
        }
      }
    };

    searchSelected();

    return ret;
  }

  clear(suspendSelectionDidChange?: boolean): void {
    const rootItems = this.getChildren();
    rootItems.forEach((it: any) => {
      this.deselectInternal(it);
    });

    this.selectedItems = []; // = this.getSelectedItemsInternal();
    if (!suspendSelectionDidChange) {
      this.fireSelectionDidChange(this.selectedItems);
    }
  }

  private getChildren(it?: TreeItem): TreeItem[] {
    return this.dataProvider
      .getChildren(!!it ? this.dataProvider.getData(it) : undefined)
      .map((n: any) => this.dataProvider.getTreeItem(n));
  }

  private getParent(it: TreeItem): TreeItem | undefined {
    if (this.dataProvider.getParent) {
      const p = this.dataProvider.getParent(this.dataProvider.getData(it));
      if (p) {
        return this.dataProvider.getTreeItem(p);
      }
    }
  }
}
