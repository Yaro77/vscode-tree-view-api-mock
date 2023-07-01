import { TreeItem, CollapsibleState, TreeViewDataProvider } from "@/common/treeView/types";
import {
  SearchNodeType, SearchNode, SearchTreeItem, SearchLocationTreeReferenceDescription,
  SearchLocationTreeLocation, SearchLocationTreeReferenceRegion
} from "./types"

import type { SearchLocationTreeReferenceLocation, SearchLocationTreeReferenceLocationArea } from "./types"


type DataProviderLocation = SearchLocationTreeReferenceLocation
  & Pick<SearchLocationTreeLocation, "hasHotelsOutsideAreas">
type MultiIndex<T> = Map<T, Set<T>>


export default class extends TreeViewDataProvider<SearchNode> {
  private readonly regions: Map<number, SearchLocationTreeReferenceRegion> = new Map()
  private readonly locations: Map<number, DataProviderLocation> = new Map()
  private readonly locationAreas: Map<number, SearchLocationTreeReferenceLocationArea> = new Map()
  private readonly regionIdToLocationIdsIndex: MultiIndex<number> = new Map()
  private readonly locationIdToLocationAreaIdsIndex: MultiIndex<number> = new Map()
  private readonly treeItemCache: Map<any, SearchTreeItem> = new Map()

  constructor(rd: SearchLocationTreeReferenceDescription,
    regionIds: number[],
    locations: SearchLocationTreeLocation[],
    locationAreaIds: number[]) {
    super()

    regionIds.forEach(id => {
      const r = rd.regions.find(x => x.id === id)!
      this.regions.set(id, r)
      this.regionIdToLocationIdsIndex.set(id, new Set())
    })

    locations.forEach(({ locationId, hasHotelsOutsideAreas }) => {
      const loc = rd.locations.find(x => x.id === locationId)!
      this.locations.set(locationId, {
        ...loc,
        hasHotelsOutsideAreas,
      })
      this.regionIdToLocationIdsIndex.get(loc.regionId)?.add(locationId)
      this.locationIdToLocationAreaIdsIndex.set(locationId, new Set())
    })

    locationAreaIds.forEach((id) => {
      const la = rd.locationAreas.find(x => x.id === id)!
      this.locationAreas.set(id, la)
      this.locationIdToLocationAreaIdsIndex.get(la.locationId)?.add(id)
    })
  }

  getChildren(element?: SearchNode): SearchNode[] {
    if (!element) {
      return Array.from(this.regions.values()).map(region => {
        return new SearchNode(region.id, SearchNodeType.Region, region.name)
      })
    }
    switch (element.type) {
      case SearchNodeType.Region:
        const locationIdSet = this.regionIdToLocationIdsIndex.get(element.id)!
        return Array.from(locationIdSet).map(id => {
          const loc = this.locations.get(id)!
          return new SearchNode(loc.id, SearchNodeType.Location, loc.name, loc.regionId)
        })
      case SearchNodeType.Location:
        const locationareaIdSet = this.locationIdToLocationAreaIdsIndex.get(element.id)!
        const realAreas = Array.from(locationareaIdSet).map(id => {
          const la = this.locationAreas.get(id)!
          return new SearchNode(la.id, SearchNodeType.LocationArea, la.name, la.locationId)
        })
        const location = this.locations.get(element.id)!
        const otherAreas = location.hasHotelsOutsideAreas ?
          [new SearchNode(-133, SearchNodeType.LocationArea, "Other areas", element.id)] :
          []
        return [...realAreas, ...otherAreas]
      case SearchNodeType.LocationArea:
        return []
      default:
        throw new Error(`Unsupported type ${element.type}`)
    }
  }

  getTreeItem(element: SearchNode): SearchTreeItem {
    if (this.treeItemCache.has(cacheKey(element))) {
      return this.treeItemCache.get(cacheKey(element))!
    }

    let newTreeItem
    switch (element.type) {
      case SearchNodeType.Region:
        const hasLocations = this.regionIdToLocationIdsIndex.get(element.id)!.size > 0
        newTreeItem = new SearchTreeItem(
          element.name, hasLocations ? CollapsibleState.Collapsed : CollapsibleState.None, element)
        break
      case SearchNodeType.Location:
        const hasAreas = this.locationIdToLocationAreaIdsIndex.get(element.id)!.size > 0 ||
          this.locations.get(element.id)!.hasHotelsOutsideAreas
        newTreeItem = new SearchTreeItem(
          element.name, hasAreas ? CollapsibleState.Collapsed : CollapsibleState.None, element)
        break
      case SearchNodeType.LocationArea:
        newTreeItem = new SearchTreeItem(
          element.name, CollapsibleState.None, element)
        break
      default:
        throw new Error(`Unsupported type ${element.type}`)
    }
    this.treeItemCache.set(cacheKey(element), newTreeItem)
    return newTreeItem
  }

  getParent(element: SearchNode): SearchNode | undefined {
    switch (element.type) {
      case SearchNodeType.LocationArea:
        const location = this.locations.get(element.parentId!)!
        return new SearchNode(location.id, SearchNodeType.Location, location.name, location.regionId)
      case SearchNodeType.Location:
        const region = this.regions.get(element.parentId!)!
        return new SearchNode(region.id, SearchNodeType.Region, region.name)
      case SearchNodeType.Region:
        return
      default:
        throw new Error(`Unsupported type ${element.type}`)
    }
  }

  // @ts-ignore
  resolveTreeItem?(treeItem: SearchTreeItem, element: SearchNode): SearchTreeItem {
    throw new Error("Method not implemented.");
  }

  getData(treeItem: TreeItem): SearchNode {
    return (treeItem as SearchTreeItem).node
  }
}

function cacheKey(element: SearchNode): string {
  return `${element.id}_${element.parentId}`
}

