export type LocationId = string;

export interface Location {
  id: LocationId;
  name: string;
  parentId: LocationId | null;
}

export type LocationMap = Record<LocationId, Location>;
