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

export class TreeItem {
  constructor(
    public label: string,
    public collapsibleState: CollapsibleState
  ) { }
}

export abstract class TreeViewDataProvider<T = any> {
  abstract getChildren(element?: T): T[];
  abstract getTreeItem(element: T): TreeItem;
  abstract getParent?(element: T): T | undefined;
  abstract resolveTreeItem?(treeItem: TreeItem, element: T): TreeItem;
}

export interface SelectableEntity {
  selectionState: SelectionState;
}

export type Selectable<T> = T & SelectableEntity;

export abstract class TreeViewSelectionController<
  T extends TreeItem = TreeItem,
  S extends Selectable<T> = Selectable<T>
> {
  abstract get onSelectionDidChange(): EventTarget;

  abstract getSelectable(item: T): S;

  abstract select(item: T, event?: Event): void;
  abstract deselect(item: T, event?: Event): void;

  abstract getSelectedItems(): T[];
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