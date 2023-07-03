import { InjectionKey, Ref } from 'vue';
import { TreeViewDataProvider, TreeViewSelectionController, TreeItemComparer } from "./types"


export const DataProviderKey = Symbol() as InjectionKey<
  Ref<TreeViewDataProvider<any> | undefined>
>;

export const SelectionControllerKey = Symbol() as InjectionKey<
  Ref<TreeViewSelectionController<any> | undefined>
>;

export const TreeItemComparerKey = Symbol() as InjectionKey<
  Ref<TreeItemComparer | undefined>
>;

export const FilterKey = Symbol() as InjectionKey<Ref<((element: any) => boolean) | undefined>>