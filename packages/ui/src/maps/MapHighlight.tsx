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
  /** Country or point to highlight. Nothing renders when unset. */
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

  // Empty string matches no feature, so unset/point values highlight nothing.
  const countryIso = value?.type === "country" ?
    value.iso_a2 : null;

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

  // Both sources stay mounted with stable ids: swapping a <Source>'s id between
  // renders makes react-map-gl throw "source id changed". Visibility comes from
  // the data and the layer filters instead.
  return (
    <>
      <Source id={COUNTRY_SOURCE_ID} type="geojson" data={data}>
        {/* Matches either ISO field, mirroring RegionSelection's fallback. */}
        <Layer
          id={COUNTRY_FILL_LAYER_ID}
          type="fill"
          filter={
            countryIso
              ? [
                "any",
                ["==", ["get", "ISO_A2_EH"], countryIso],
                ["==", ["get", "ISO_A2"], countryIso],
              ]
              : ["==", ["literal", false], true]
          }
          paint={{ "fill-color": color, "fill-opacity": fillOpacity }}
        />
        <Layer
          id={COUNTRY_OUTLINE_LAYER_ID}
          type="line"
          filter={
            countryIso
              ? [
                "any",
                ["==", ["get", "ISO_A2_EH"], countryIso],
                ["==", ["get", "ISO_A2"], countryIso],
              ]
              : ["==", ["literal", false], true]
          }
          paint={{ "line-color": color, "line-width": 2 }}
        />
      </Source>
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
    </>
  );
}

MapHighlight.displayName = "MapHighlight";
