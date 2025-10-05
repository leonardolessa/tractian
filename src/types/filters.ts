import type { SensorType } from "./asset";

export interface AssetFilterState {
  searchTerm: string;
  sensorTypes: SensorType[];
  criticalOnly: boolean;
}
