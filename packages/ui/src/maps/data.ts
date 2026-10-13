import type { FeatureCollection } from "geojson";

// Minimal keyless datasets so every MVP layer toggle controls a real layer.
// Coordinates are coarse and meant for visual overlays only, not analysis.

export const WORLD_CAPITALS: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    ["Washington, D.C.", -77.04, 38.91],
    ["Ottawa", -75.7, 45.42],
    ["Mexico City", -99.13, 19.43],
    ["Brasília", -47.93, -15.78],
    ["Buenos Aires", -58.38, -34.6],
    ["Lima", -77.04, -12.05],
    ["London", -0.13, 51.51],
    ["Paris", 2.35, 48.86],
    ["Madrid", -3.7, 40.42],
    ["Rome", 12.5, 41.9],
    ["Berlin", 13.4, 52.52],
    ["Moscow", 37.62, 55.75],
    ["Ankara", 32.85, 39.93],
    ["Cairo", 31.24, 30.04],
    ["Nairobi", 36.82, -1.29],
    ["Pretoria", 28.19, -25.75],
    ["Riyadh", 46.72, 24.63],
    ["New Delhi", 77.21, 28.61],
    ["Beijing", 116.4, 39.9],
    ["Tokyo", 139.69, 35.69],
    ["Jakarta", 106.85, -6.21],
    ["Canberra", 149.13, -35.28],
  ].map(([name, lng, lat]) => ({
    type: "Feature",
    properties: { name },
    geometry: { type: "Point", coordinates: [lng as number, lat as number] },
  })),
};

export const MAJOR_RIVERS: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    [
      "Nile",
      [
        [31.3, -1.0],
        [32.5, 15.6],
        [30.5, 24.1],
        [31.2, 30.0],
        [30.5, 31.5],
      ],
    ],
    [
      "Amazon",
      [
        [-73.0, -4.5],
        [-67.0, -3.3],
        [-60.0, -3.1],
        [-55.0, -2.5],
        [-50.0, -0.5],
      ],
    ],
    [
      "Mississippi",
      [
        [-95.0, 47.2],
        [-93.1, 44.9],
        [-90.2, 38.6],
        [-91.1, 32.3],
        [-89.25, 29.15],
      ],
    ],
    [
      "Yangtze",
      [
        [91.0, 33.5],
        [104.1, 30.7],
        [111.3, 30.6],
        [118.8, 32.1],
        [121.8, 31.4],
      ],
    ],
    [
      "Ganges",
      [
        [78.0, 30.9],
        [80.9, 26.8],
        [83.0, 25.4],
        [87.0, 24.6],
        [89.0, 23.5],
      ],
    ],
    [
      "Congo",
      [
        [28.0, -6.0],
        [23.0, -2.0],
        [18.0, -3.0],
        [15.0, -4.3],
        [12.4, -6.0],
      ],
    ],
    [
      "Volga",
      [
        [37.0, 57.0],
        [44.0, 56.3],
        [47.5, 51.5],
        [48.0, 46.3],
      ],
    ],
    [
      "Danube",
      [
        [8.2, 48.1],
        [16.4, 48.2],
        [21.0, 47.0],
        [26.1, 44.1],
        [29.7, 45.2],
      ],
    ],
  ].map(([name, coordinates]) => ({
    type: "Feature",
    properties: { name },
    geometry: { type: "LineString", coordinates: coordinates as number[][] },
  })),
};
