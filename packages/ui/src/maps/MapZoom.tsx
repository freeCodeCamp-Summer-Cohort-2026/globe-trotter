"use client";

import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import type { MapZoomTarget } from "@repo/types";

export type MapZoomProps = {
  /** Camera target, (re)trigger the camera animation by changing the prop */
  value?: MapZoomTarget | null;
  /** Animation duration in ms. */
  duration?: number;
};

export function MapZoom({ value, duration = 1000 }: MapZoomProps) {
  const { current: map } = useMap();

  const longitude = value?.longitude;
  const latitude = value?.latitude;
  const zoom = value?.zoom;
  const bearing = value?.bearing;
  const pitch = value?.pitch;

  useEffect(() => {
    if (!map || longitude === undefined || latitude === undefined) return;
    map.easeTo({
      center: [longitude, latitude],
      ...(zoom !== undefined ? { zoom } : {}),
      ...(bearing !== undefined ? { bearing } : {}),
      ...(pitch !== undefined ? { pitch } : {}),
      duration,
    });
  }, [map, longitude, latitude, zoom, bearing, pitch, duration]);

  return null;
}

MapZoom.displayName = "MapZoom";
