import { toRaw } from 'vue';
import { TreeViewSelectionController, TreeItem, SelectionState } from './types';

import type { Selectable } from './types';

export class SimpleSelectionController extends TreeViewSelectionController<TreeItem> {
  private selectionDidChangeEventTarget: EventTarget = new EventTarget();
  private selectedItems: Set<TreeItem> = new Set();

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

    this.fireSelectionDidChange([...this.selectedItems]);
  }

  deselect(item: TreeItem): void {
    this.deselectInternal(item);

    this.fireSelectionDidChange([...this.selectedItems]);
  }

  private selectInternal(item: TreeItem): void {
    const selectable = this.getSelectable(item);

    selectable.selectionState = SelectionState.Selected;
    this.selectedItems.add(item);
  }

  private deselectInternal(item: TreeItem): void {
    const selectable = this.getSelectable(item);

    selectable.selectionState = SelectionState.Unselected;
    this.selectedItems.delete(item);
  }

  getSelectedItems(): TreeItem[] {
    return [...this.selectedItems];
  }

  private fireSelectionDidChange(selectedItems: TreeItem[]) {
    this.onSelectionDidChange.dispatchEvent(
      new CustomEvent('change', {
        detail: selectedItems.map((it) => toRaw(it)),
      })
    );
  }

  clear(): void {
    const selected = [...this.selectedItems];
    selected.forEach((item: TreeItem) => this.deselectInternal(item));

    this.fireSelectionDidChange([...this.selectedItems]);
  }
}
