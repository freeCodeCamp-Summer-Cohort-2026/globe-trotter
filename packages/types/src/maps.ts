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

// Non-drawing interaction values (issue #113) — controlled value/onChange
// contracts shared by the map interaction components and their consumers.
type RegionSelectionValue = { iso_a2: string };

type MapHighlightValue =
  | { type: "country"; iso_a2: string }
  | { type: "point"; coordinates: [number, number]; label?: string };

type MapZoomTarget = {
  longitude: number;
  latitude: number;
  zoom?: number;
  bearing?: number;
  pitch?: number;
};

export type {
  MapHighlightValue,
  MapMode,
  MapTemplateConfig,
  MapTemplateConfigMap,
  MapViewState,
  MapZoomTarget,
  RegionSelectionValue,
  SatelliteConfig,
  WorldPhysicalConfig,
  WorldPoliticalConfig,
};
