export enum CollapsibleState {
  None,
  Collapsed,
  Expanded,
}

export enum SelectionState {
  Unselected,
  Selected,
  Intermediate,
}

export abstract class TreeItem {
  label: string
  collapsibleState: CollapsibleState
  selectionState: SelectionState

  constructor(
    label: string,
    collapsibleState: CollapsibleState
  ) {
    this.label = label
    this.collapsibleState = collapsibleState
    this.selectionState = SelectionState.Unselected
  }
}

export abstract class TreeViewDataProvider<T = any> {
  abstract getChildren(element?: T): T[];
  abstract getTreeItem(element: T): TreeItem;
  abstract getParent?(element: T): T | undefined;
  abstract resolveTreeItem?(treeItem: TreeItem, element: T): TreeItem;
  abstract getData(treeItem: TreeItem): T
}

export abstract class TreeViewSelectionController<
  I extends TreeItem = TreeItem
> {
  abstract get onSelectionDidChange(): EventTarget;

  abstract select(item: I, event?: Event): void;
  abstract deselect(item: I, event?: Event): void;

  abstract canSelect(item: I): boolean
  abstract canDeselect(item: I): boolean

  abstract getSelectedItems(): I[];
  abstract clear(): void;
}

export interface TreeItemComparer {
  (a: TreeItem, b: TreeItem): number;
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