"use client";

import { useCallback, useEffect, useRef } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { RegionSelectionValue } from "@repo/types";

import { getIsoA2, useCountryBoundaries } from "./countryBoundaries";

const SOURCE_ID = "region-selection-countries";
const FILL_LAYER_ID = "region-selection-fill";
const HIGHLIGHT_LAYER_ID = "region-selection-highlight";

export type RegionSelectionProps = {
  /** Controlled selection; local sate is stored in the parent (node/lab view). */
  value?: RegionSelectionValue | null;
  /** Fires with `{ iso_a2 }` on click, or `null` when a selection is deselected. */
  onChange?: (value: RegionSelectionValue | null) => void;
  /** Clicking the already-selected country clears the selection when true. */
  allowDeselect?: boolean;
  fillColor?: string;
  highlightColor?: string;
};

export function RegionSelection({
  value,
  onChange,
  allowDeselect = false,
  fillColor = "#3b82f6",
  highlightColor = "#2563eb",
}: RegionSelectionProps) {
  const { current: map } = useMap();
  const { data, status } = useCountryBoundaries();

  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const allowDeselectRef = useRef(allowDeselect);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    allowDeselectRef.current = allowDeselect;
  }, [value, onChange, allowDeselect]);

  const isAttachedRef = useRef(false);

  const handleClick = useCallback((event: MapLayerMouseEvent) => {
    const isoA2 = getIsoA2(event.features?.[0]);
    if (!isoA2) return;

    if (allowDeselectRef.current && valueRef.current?.iso_a2 === isoA2) {
      onChangeRef.current?.(null);
      return;
    }
    onChangeRef.current?.({ iso_a2: isoA2 });
  }, []);

  const handleOver = useCallback(() => {
    if (map) {
      map.getCanvas().style.cursor = "pointer";
    }
  }, [map]);

  const handleOut = useCallback(() => {
    if (map) {
      map.getCanvas().style.cursor = "";
    }
  }, [map]);

  const detachHandlers = useCallback(() => {
    if (!map || !isAttachedRef.current) return;
    map.off("click", FILL_LAYER_ID, handleClick);
    map.off("mouseover", FILL_LAYER_ID, handleOver);
    map.off("mouseout", FILL_LAYER_ID, handleOut);
    map.getCanvas().style.cursor = "";
    isAttachedRef.current = false;
  }, [map, handleClick, handleOver, handleOut]);

  const attachHandlers = useCallback(() => {
    if (!map || !map.isStyleLoaded() || status !== "ready") return;

    if (!map.getLayer(FILL_LAYER_ID)) {
      if (isAttachedRef.current) {
        detachHandlers();
      }
      return;
    }

    if (isAttachedRef.current) return;

    map.on("click", FILL_LAYER_ID, handleClick);
    map.on("mouseover", FILL_LAYER_ID, handleOver);
    map.on("mouseout", FILL_LAYER_ID, handleOut);
    isAttachedRef.current = true;
  }, [map, status, handleClick, handleOver, handleOut, detachHandlers]);

  useEffect(() => {
    if (!map) return;

    attachHandlers();

    map.on("load", attachHandlers);
    map.on("styledata", attachHandlers);

    return () => {
      map.off("load", attachHandlers);
      map.off("styledata", attachHandlers);
      detachHandlers();
    };
  }, [map, attachHandlers, detachHandlers]);

  return (
    <Source id={SOURCE_ID} type="geojson" data={data}>
      <Layer
        id={FILL_LAYER_ID}
        type="fill"
        paint={{
          "fill-color": fillColor,
          "fill-opacity": 0.08,
          "fill-outline-color": fillColor,
        }}
      />
      {/* Matches either ISO field so the "-99" fallback countries also get highlighted;
      the empty string matches nothing when nothing is selected. */}
      <Layer
        id={HIGHLIGHT_LAYER_ID}
        type="fill"
        filter={
          value?.iso_a2
            ? [
                "any",
                ["==", ["get", "ISO_A2_EH"], value.iso_a2],
                ["==", ["get", "ISO_A2"], value.iso_a2],
              ]
            : ["==", ["literal", false], true]
        }
        paint={{
          "fill-color": highlightColor,
          "fill-opacity": 0.4,
          "fill-outline-color": highlightColor,
        }}
      />
    </Source>
  );
}

RegionSelection.displayName = "RegionSelection";
