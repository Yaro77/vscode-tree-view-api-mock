import type { InjectionKey } from 'vue';

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
  constructor(
    public label: string,
    public collapsibleState: CollapsibleState
  ) {}

  abstract clone(): TreeItem;
}

export abstract class TreeViewDataProvider<T = any> {
  abstract getChildren(element?: T): T[];
  abstract getTreeItem(element: T): TreeItem;
  abstract getParent?(element: T): T | undefined;
  abstract resolveTreeItem?(treeItem: TreeItem, element: T): TreeItem;
}

export const DataProviderKey = Symbol() as InjectionKey<
  TreeViewDataProvider<any>
>;

export interface SelectableEntity {
  selectionState: SelectionState;
}

export type Selectable<T> = T & SelectableEntity;

export abstract class TreeViewSelectionController<
  T extends TreeItem = TreeItem,
  S extends Selectable<T> = Selectable<T>,
  D = any
> {
  constructor(protected dataProvider: TreeViewDataProvider<D>) {}

  abstract get onSelectionDidChange(): EventTarget;

  abstract getSelectable(item: T): S;

  abstract select(item: T): void;
  abstract deselect(itme: T): void;

  abstract getSelectedItems(): T[];
  abstract clear(): void;
}

export const SelectionControllerKey = Symbol() as InjectionKey<
  TreeViewSelectionController<any>
>;
