import { CollapsibleState } from './../../common/treeView/types';
import { TreeItem } from '@/common/treeView/types';

export enum SearchNodeType {
  Region,
  Location,
  LocationArea,
}

export interface ISearchNode {
  id: number
  type: SearchNodeType
  name: string
  parentId?: number
}

export class SearchNode implements ISearchNode {
  id: number
  type: SearchNodeType
  name: string
  parentId?: number

  constructor(id: number, type: SearchNodeType, name: string, parentId?: number) {
    this.id = id
    this.type = type
    this.name = name
    this.parentId = parentId
  }
}

export class SearchTreeItem extends TreeItem {
  node: SearchNode

  constructor(label: string, collapsibleState: CollapsibleState, node: SearchNode) {
    super(label, collapsibleState)
    this.node = node
  }
}

export interface SearchLocationTreeLocation {
  locationId: number
  hasHotelsOutsideAreas: boolean
}

export interface IdName {
  id: number
  name: string
}

export type SearchLocationTreeReferenceRegion = IdName & { countryId: number }
export type SearchLocationTreeReferenceLocation = IdName & { regionId: number }
export type SearchLocationTreeReferenceLocationArea = IdName & { locationId: number }

export interface SearchLocationTreeReferenceDescription {
  regions: SearchLocationTreeReferenceRegion[]
  locations: SearchLocationTreeReferenceLocation[]
  locationAreas: SearchLocationTreeReferenceLocationArea[]
}

export interface Response {
  regionIds: number[]
  locations: SearchLocationTreeLocation[]
  locationAreaIds: number[]
  referenceDescription: SearchLocationTreeReferenceDescription

}

export interface Props {
  response: Response,
  selectedLocations?: ISearchNode[]
  filter?: string
}