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

  select(item: TreeItem, event?: Event): void {
    if (event && event instanceof PointerEvent) {
      const pe = event as PointerEvent;
      if (pe.shiftKey) {
        if (!this.isSelected(item)) {
          this.selectInternal(item);
          this.fireSelectionDidChange([...this.selectedItems]);
        }
      } else if (pe.ctrlKey) {
        if (this.isSelected(item)) {
          this.deselectInternal(item);
        } else {
          this.selectInternal(item);
        }
        this.fireSelectionDidChange([...this.selectedItems]);
      } else {
        this.clearInternal();
        this.selectInternal(item);
        this.fireSelectionDidChange([...this.selectedItems]);
      }
    } else {
      if (!this.isSelected(item)) {
        this.selectInternal(item);
        this.fireSelectionDidChange([...this.selectedItems]);
      }
    }
  }

  deselect(item: TreeItem, event?: Event): void {
    this.select(item, event);
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

  private isSelected(item: TreeItem): boolean {
    return this.selectedItems.has(item);
  }

  private fireSelectionDidChange(selectedItems: TreeItem[]) {
    this.onSelectionDidChange.dispatchEvent(
      new CustomEvent('change', {
        detail: selectedItems.map((it) => toRaw(it)),
      })
    );
  }

  clear(): void {
    this.clearInternal();

    this.fireSelectionDidChange([...this.selectedItems]);
  }

  private clearInternal(): void {
    const selected = [...this.selectedItems];
    selected.forEach((item: TreeItem) => this.deselectInternal(item));
  }
}
