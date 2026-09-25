"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, {
  Layer,
  NavigationControl,
  Source,
  type MapRef,
} from "react-map-gl/maplibre";

import type {
  MapInteractionType,
  MapMode,
  MapTemplateConfigMap,
  MapTemplateId,
  MapViewState,
} from "@repo/types";

import { cn } from "../lib/utils";
import { MAJOR_RIVERS, WORLD_CAPITALS } from "./data";
import { mapTemplates } from "./mapTemplates";

export type MapTemplateProps<T extends MapTemplateId = MapTemplateId> = {
  templateId: T;
  initialState?: Partial<MapViewState>;
  interactionType?: MapInteractionType;
  config?: Partial<MapTemplateConfigMap[T]>;
  mode?: MapMode;
  onInteractionChange?: (interaction: MapInteractionType) => void;
  className?: string;
};

export function MapTemplate<T extends MapTemplateId>({
  templateId,
  initialState,
  interactionType,
  config,
  mode = "readOnly",
  onInteractionChange,
  className,
}: MapTemplateProps<T>) {
  const mapRef = useRef<MapRef>(null);
  const definition = mapTemplates[templateId];
  const interactive = mode === "editable";

  const resolvedConfig = useMemo(
    () => ({ ...definition.defaultConfig, ...config }),
    [definition, config],
  );

  const viewState = useMemo<MapViewState>(() => {
    const base = { ...definition.defaultViewState, ...initialState };
    if (templateId === "satellite-3d") {
      const satellite = resolvedConfig as MapTemplateConfigMap["satellite-3d"];
      return {
        ...base,
        bearing: satellite.cameraAngle,
        pitch: satellite.pitch,
      };
    }
    return base;
  }, [definition, initialState, templateId, resolvedConfig]);

  const applyToggles = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || !map.isStyleLoaded()) return;

    for (const [key, layerIds] of Object.entries(definition.layerToggles)) {
      const visible = Boolean((resolvedConfig as Record<string, unknown>)[key]);
      for (const layerId of layerIds as string[]) {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(
            layerId,
            "visibility",
            visible ? "visible" : "none",
          );
        }
      }
    }
  }, [definition, resolvedConfig]);

  useEffect(() => {
    applyToggles();
  }, [applyToggles]);

  useEffect(() => {
    mapRef.current?.getMap().jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing ?? 0,
      pitch: viewState.pitch ?? 0,
    });
  }, [viewState]);

  const handleClick = useCallback(() => {
    if (interactive && interactionType) {
      onInteractionChange?.(interactionType);
    }
  }, [interactive, interactionType, onInteractionChange]);

  const political =
    templateId === "world-political"
      ? (resolvedConfig as MapTemplateConfigMap["world-political"])
      : null;
  const physical =
    templateId === "world-physical"
      ? (resolvedConfig as MapTemplateConfigMap["world-physical"])
      : null;

  return (
    <div
      className={cn(
        "ui:relative ui:h-full ui:min-h-100 ui:w-full ui:overflow-hidden ui:rounded-2xl ui:border ui:border-slate-200",
        className,
      )}
    >
      <Map
        ref={mapRef}
        mapStyle={definition.mapStyle}
        initialViewState={{
          longitude: viewState.longitude,
          latitude: viewState.latitude,
          zoom: viewState.zoom,
          bearing: viewState.bearing ?? 0,
          pitch: viewState.pitch ?? 0,
        }}
        dragPan={interactive}
        dragRotate={interactive && definition.is3D}
        scrollZoom={interactive}
        doubleClickZoom={interactive}
        touchZoomRotate={interactive}
        keyboard={interactive}
        onLoad={applyToggles}
        onStyleData={applyToggles}
        onClick={handleClick}
        style={{ position: "absolute", inset: 0 }}
      >
        {political ? (
          <Source id="capitals" type="geojson" data={WORLD_CAPITALS}>
            <Layer
              id="capitals"
              type="circle"
              layout={{
                visibility: political.showCapitals ? "visible" : "none",
              }}
              paint={{
                "circle-radius": 4,
                "circle-color": "#dc2626",
                "circle-stroke-width": 1,
                "circle-stroke-color": "#ffffff",
              }}
            />
          </Source>
        ) : null}

        {physical ? (
          <>
            <Source id="rivers" type="geojson" data={MAJOR_RIVERS}>
              <Layer
                id="physical-rivers"
                type="line"
                layout={{
                  visibility: physical.showRivers ? "visible" : "none",
                  "line-join": "round",
                  "line-cap": "round",
                }}
                paint={{ "line-color": "#2563eb", "line-width": 1.5 }}
              />
            </Source>
            <Source id="physical-labels" type="geojson" data={WORLD_CAPITALS}>
              <Layer
                id="physical-labels"
                type="symbol"
                layout={{
                  visibility: physical.showLabels ? "visible" : "none",
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Semibold"],
                  "text-size": 11,
                  "text-offset": [0, 0.6],
                  "text-anchor": "top",
                }}
                paint={{
                  "text-color": "#1e293b",
                  "text-halo-color": "#ffffff",
                  "text-halo-width": 1.2,
                }}
              />
            </Source>
          </>
        ) : null}

        {interactive ? <NavigationControl position="top-right" /> : null}
      </Map>
    </div>
  );
}

MapTemplate.displayName = "MapTemplate";
