export interface IdName {
  id: number;
  name: string;
}

export type Country = IdName;
export type Region = IdName & { countryId: number };
export type Location = IdName & { regionId: number };
export type LocationArea = IdName & { locationId: number };

export interface RefDescription {
  countries: Country[] | null;
  regions: Region[] | null;
  locations: Location[] | null;
  locationAreas: LocationArea[] | null;
}
