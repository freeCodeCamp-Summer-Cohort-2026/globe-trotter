import type { MapTemplateId } from "./interactions";

type MapViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
};

type WorldPoliticalConfig = {
  showBorders: boolean;
  showLabels: boolean;
  showCapitals: boolean;
};

type WorldPhysicalConfig = {
  showElevation: boolean;
  showRivers: boolean;
  showLabels: boolean;
};

type SatelliteConfig = {
  cameraAngle: number;
  tilt: number;
  pitch: number;
};

type MapTemplateConfigMap = {
  "world-political": WorldPoliticalConfig;
  "world-physical": WorldPhysicalConfig;
  "satellite-3d": SatelliteConfig;
};

type MapTemplateConfig = MapTemplateConfigMap[MapTemplateId];

// Students render read-only maps; content authors edit interaction goals.
type MapMode = "readOnly" | "editable";

export type {
  MapMode,
  MapTemplateConfig,
  MapTemplateConfigMap,
  MapViewState,
  SatelliteConfig,
  WorldPhysicalConfig,
  WorldPoliticalConfig,
};
