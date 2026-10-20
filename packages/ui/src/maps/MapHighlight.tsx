"use client";

import { useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import type { FeatureCollection } from "geojson";
import type { MapHighlightValue } from "@repo/types";

import { useCountryBoundaries } from "./countryBoundaries";

const COUNTRY_SOURCE_ID = "map-highlight-countries";
const COUNTRY_FILL_LAYER_ID = "map-highlight-country-fill";
const COUNTRY_OUTLINE_LAYER_ID = "map-highlight-country-outline";
const POINT_SOURCE_ID = "map-highlight-point";
const POINT_LAYER_ID = "map-highlight-point-circle";

export type MapHighlightProps = {
  /** Country or point to highlight. Renders nothing when unset. */
  value?: MapHighlightValue | null;
  color?: string;
  fillOpacity?: number;
  /** Point marker radius in pixels. */
  radius?: number;
};

export function MapHighlight({
  value,
  color = "#f59e0b",
  fillOpacity = 0.45,
  radius = 8,
}: MapHighlightProps) {
  // Shared, cached boundaries — used only for the country variant.
  const { data } = useCountryBoundaries();

  // Single-point FeatureCollection (always defined so hooks stay unconditional).
  const pointData = useMemo<FeatureCollection>(() => {
    if (value?.type !== "point") {
      return { type: "FeatureCollection", features: [] };
    }
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: { type: "Point", coordinates: value.coordinates },
        },
      ],
    };
  }, [value]);

  // Read-only: no user input, nothing to render without a value.
  if (!value) return null;

  if (value.type === "point") {
    return (
      <Source id={POINT_SOURCE_ID} type="geojson" data={pointData}>
        <Layer
          id={POINT_LAYER_ID}
          type="circle"
          paint={{
            "circle-radius": radius,
            "circle-color": color,
            "circle-opacity": fillOpacity,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          }}
        />
      </Source>
    );
  }

  return (
    <Source id={COUNTRY_SOURCE_ID} type="geojson" data={data}>
      {/* Matches the ISO field and mirrors RegionSelection's fallback. */}
      <Layer
        id={COUNTRY_FILL_LAYER_ID}
        type="fill"
        filter={[
          "any",
          ["==", ["get", "ISO_A2_EH"], value.iso_a2],
          ["==", ["get", "ISO_A2"], value.iso_a2],
        ]}
        paint={{ "fill-color": color, "fill-opacity": fillOpacity }}
      />
      <Layer
        id={COUNTRY_OUTLINE_LAYER_ID}
        type="line"
        filter={[
          "any",
          ["==", ["get", "ISO_A2_EH"], value.iso_a2],
          ["==", ["get", "ISO_A2"], value.iso_a2],
        ]}
        paint={{ "line-color": color, "line-width": 2 }}
      />
    </Source>
  );
}

MapHighlight.displayName = "MapHighlight";
