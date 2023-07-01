import { toRaw } from 'vue';
import { TreeViewSelectionController, TreeItem, SelectionState, TreeViewDataProvider } from './types';

export default class extends TreeViewSelectionController<TreeItem> {
  private selectionDidChangeEventTarget: EventTarget = new EventTarget();
  private selectedItems: Set<any> = new Set();

  constructor(private dataProvider: TreeViewDataProvider) {
    super()
  }

  get onSelectionDidChange(): EventTarget {
    return this.selectionDidChangeEventTarget;
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
    item.selectionState = SelectionState.Selected;
    this.selectedItems.add(this.dataProvider.getData(item));
  }

  private deselectInternal(item: TreeItem): void {
    item.selectionState = SelectionState.Unselected;
    this.selectedItems.delete(this.dataProvider.getData(item));
  }

  getSelectedItems(): TreeItem[] {
    return [...this.selectedItems];
  }

  private isSelected(item: TreeItem): boolean {
    return this.selectedItems.has(this.dataProvider.getData(item));
  }

  private fireSelectionDidChange(selectedItems: any[]) {
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

  canSelect(): boolean {
    return true
  }

  canDeselect(): boolean {
    return true
  }

  private clearInternal(): void {
    const selected = [...this.selectedItems];
    selected.forEach((it: any) => {
      const treeItem = this.dataProvider.getTreeItem(it)
      this.deselectInternal(treeItem)
    });
  }
}
