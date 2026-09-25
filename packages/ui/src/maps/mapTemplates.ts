import type { StyleSpecification } from "maplibre-gl";
import type {
  MapTemplateConfigMap,
  MapTemplateId,
  MapViewState,
} from "@repo/types";

// Maps a config toggle key to the style layer ids whose visibility it controls.
type LayerToggleMap<TConfig> = Partial<Record<keyof TConfig, string[]>>;

export type MapTemplateDefinition<T extends MapTemplateId = MapTemplateId> = {
  id: T;
  name: string;
  is3D: boolean;
  mapStyle: string | StyleSpecification;
  defaultViewState: MapViewState;
  defaultConfig: MapTemplateConfigMap[T];
  layerToggles: LayerToggleMap<MapTemplateConfigMap[T]>;
};

const worldPhysicalStyle: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "physical-relief": {
      type: "raster",
      tiles: [
        "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
        "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
        "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenTopoMap (CC-BY-SA) · © OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "physical-background",
      type: "background",
      paint: { "background-color": "#a5bfdd" },
    },
    { id: "physical-elevation", type: "raster", source: "physical-relief" },
  ],
};

const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution:
        "Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
  },
  layers: [
    {
      id: "satellite-background",
      type: "background",
      paint: { "background-color": "#000000" },
    },
    { id: "satellite-imagery", type: "raster", source: "satellite" },
  ],
};

const worldPolitical: MapTemplateDefinition<"world-political"> = {
  id: "world-political",
  name: "World Political (2D)",
  is3D: false,
  mapStyle: "https://demotiles.maplibre.org/style.json",
  defaultViewState: {
    longitude: 0,
    latitude: 20,
    zoom: 1.4,
    bearing: 0,
    pitch: 0,
  },
  defaultConfig: { showBorders: true, showLabels: true, showCapitals: false },
  // showCapitals is a declarative overlay layer (see MapTemplate); the rest live in the demotiles style.
  layerToggles: {
    showBorders: ["countries-boundary"],
    showLabels: ["countries-label"],
  },
};

const worldPhysical: MapTemplateDefinition<"world-physical"> = {
  id: "world-physical",
  name: "World Physical (2D)",
  is3D: false,
  mapStyle: worldPhysicalStyle,
  defaultViewState: {
    longitude: 0,
    latitude: 20,
    zoom: 1.4,
    bearing: 0,
    pitch: 0,
  },
  defaultConfig: { showElevation: true, showRivers: true, showLabels: true },
  // showRivers and showLabels are declarative overlay layers (see MapTemplate).
  layerToggles: {
    showElevation: ["physical-elevation"],
  },
};

const satellite3d: MapTemplateDefinition<"satellite-3d"> = {
  id: "satellite-3d",
  name: "Satellite View (3D Globe)",
  is3D: true,
  mapStyle: satelliteStyle,
  defaultViewState: {
    longitude: 0,
    latitude: 20,
    zoom: 2,
    bearing: 0,
    pitch: 45,
  },
  defaultConfig: { cameraAngle: 0, tilt: 45, pitch: 45 },
  layerToggles: {},
};

export const mapTemplates: {
  [T in MapTemplateId]: MapTemplateDefinition<T>;
} = {
  "world-political": worldPolitical,
  "world-physical": worldPhysical,
  "satellite-3d": satellite3d,
};
