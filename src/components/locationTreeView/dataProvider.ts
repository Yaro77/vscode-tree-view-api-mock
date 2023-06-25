import { TreeViewDataProvider, TreeItem } from '@/common/treeView/types';
import { CollapsibleState } from '@/common/treeView/types';
import type {
  RefDescription,
  Country,
  Region,
  Location,
  LocationArea,
} from '@/common/types';
import { IdName } from 'common/types';

enum LocationNodeType {
  Country,
  Region,
  Location,
  LocationArea,
}

export class LocationNode extends TreeItem {
  constructor(
    name: string,
    collapsibleState: CollapsibleState,
    readonly id: number,
    readonly type: LocationNodeType
  ) {
    super(name, collapsibleState);
  }
}

export class LocationTreeViewDataProvider extends TreeViewDataProvider<LocationNode> {
  private readonly refDescription: RefDescription;
  private readonly countryCache: Map<number, LocationNode> = new Map();
  private readonly regionCache: Map<number, LocationNode> = new Map();
  private readonly locationCache: Map<number, LocationNode> = new Map();
  private readonly locationAreaCache: Map<number, LocationNode> = new Map();

  constructor(rd: RefDescription) {
    super();

    this.refDescription = {
      countries: [...(rd.countries ?? [])],
      regions: [...(rd.regions ?? [])],
      locations: [...(rd.locations ?? [])],
      locationAreas: [...(rd.locationAreas ?? [])],
    };
  }

  getChildren(element?: LocationNode): LocationNode[] {
    if (element) {
      let ret = [] as IdName[];
      let hasNextLevelChildren: (childId: number) => boolean = () => false;
      let childrenCache: Map<number, LocationNode>;
      let childType: LocationNodeType;
      switch (element.type) {
        case LocationNodeType.Country:
          childType = LocationNodeType.Region;
          childrenCache = this.regionCache;
          ret = this.getRegions(element.id);
          hasNextLevelChildren = this.hasLocations.bind(this);
          break;
        case LocationNodeType.Region:
          childType = LocationNodeType.Location;
          childrenCache = this.locationCache;
          ret = this.getLocations(element.id);
          hasNextLevelChildren = this.hasLocationAreas.bind(this);
          break;
        case LocationNodeType.Location:
          childType = LocationNodeType.LocationArea;
          childrenCache = this.locationAreaCache;
          ret = this.getLocationAreas(element.id);
          // no children in location areas
          break;
        case LocationNodeType.LocationArea:
          // nothing
          ret = [];
          break;
        default:
          throw new Error('Not supported type');
      }
      ret.sort(idNameComparer);

      return ret.map((child: IdName) => {
        if (childrenCache.has(child.id)) {
          return childrenCache.get(child.id) as LocationNode;
        }
        const node = new LocationNode(
          child.name,
          hasNextLevelChildren(child.id)
            ? CollapsibleState.Collapsed
            : CollapsibleState.None,
          child.id,
          childType
        );

        childrenCache.set(child.id, node);
        return node;
      });
    } else {
      const countries = this.getCountries();
      countries.sort(idNameComparer);

      return countries.map((c: Country) => {
        if (this.countryCache.has(c.id)) {
          return this.countryCache.get(c.id) as LocationNode;
        }
        const node = new LocationNode(
          c.name,
          this.hasRegions(c.id)
            ? CollapsibleState.Collapsed
            : CollapsibleState.None,
          c.id,
          LocationNodeType.Country
        );
        this.countryCache.set(c.id, node);
        return node;
      });
    }
  }

  getParent?(element: LocationNode): LocationNode | undefined {
    switch (element.type) {
      case LocationNodeType.LocationArea:
        const locationArea: LocationArea =
          this.refDescription.locationAreas.find(
            (la: LocationArea) => la.id === element.id
          )!;
        return this.locationCache.get(locationArea.locationId);
      case LocationNodeType.Location:
        const location: Location = this.refDescription.locations.find(
          (loc: Location) => loc.id === element.id
        )!;
        return this.regionCache.get(location.regionId);
      case LocationNodeType.Region:
        const region: Region = this.refDescription.regions.find(
          (r: Region) => r.id === element.id
        )!;
        return this.countryCache.get(region.countryId);
      case LocationNodeType.Country:
        return;
      default:
        throw new Error('Not supported type');
    }
  }

  getTreeItem(element: LocationNode): TreeItem {
    return element;
  }

  private getCountries(): IdName[] {
    const { countries } = this.refDescription;
    return countries;
  }

  private getRegions(countryId: number): IdName[] {
    const { regions } = this.refDescription;
    return regions.filter((r: Region) => r.countryId === countryId);
  }

  private hasRegions(countryId: number): boolean {
    const { regions } = this.refDescription;
    return regions.some((r: Region) => r.countryId === countryId);
  }

  private getLocations(regionId: number): IdName[] {
    const { locations } = this.refDescription;
    return locations.filter((loc: Location) => loc.regionId === regionId);
  }

  private hasLocations(regionId: number): boolean {
    const { locations } = this.refDescription;
    return locations.some((loc: Location) => loc.regionId === regionId);
  }

  private getLocationAreas(locationId: number): IdName[] {
    const { locationAreas } = this.refDescription;
    return locationAreas.filter(
      (la: LocationArea) => la.locationId === locationId
    );
  }

  private hasLocationAreas(locationId: number): boolean {
    const { locationAreas } = this.refDescription;
    return locationAreas.some(
      (la: LocationArea) => la.locationId === locationId
    );
  }
}

function idNameComparer<T extends IdName>(a: T, b: T): -1 | 0 | 1 {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}
