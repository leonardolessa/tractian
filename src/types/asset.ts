import type { LocationId } from "./location";

export type AssetId = string;

export type SensorType = "energy" | "vibration";

export type SensorStatus = "operating" | "alert";

interface AssetBase {
  id: AssetId;
  name: string;
  locationId: LocationId | null;
  parentId: AssetId | null;
}

export interface NonComponentAsset extends AssetBase {
  sensorId?: null;
  sensorType: null;
  status: null;
  gatewayId?: null;
}

export interface ComponentAsset extends AssetBase {
  sensorId: string;
  sensorType: SensorType;
  status: SensorStatus;
  gatewayId: string | null;
}

export type Asset = NonComponentAsset | ComponentAsset;

export type AssetMap = Record<AssetId, Asset>;
