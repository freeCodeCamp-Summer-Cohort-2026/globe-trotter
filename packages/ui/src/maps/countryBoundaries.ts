import { useEffect, useState } from "react";
import type { Feature, FeatureCollection } from "geojson";

// Natural Earth 110m admin-0 country boundaries dataset is domain.
// ISO_A2_EH property is used by RegionSelection clicks.
const COUNTRY_BOUNDARIES_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

// Rendered while loading or after a failed fetch so the source always has
// GeoJSON and components never crash.
export const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

// Module-level cache: the first caller performs the fetch all other callers reuse the promise
// The same promise guarantees one network request, for each page load no matter how many
// map interaction components are mounted.

let cachedBoundaries: Promise<FeatureCollection> | null = null;

export function loadCountryBoundaries(): Promise<FeatureCollection> {
  cachedBoundaries ??= fetch(COUNTRY_BOUNDARIES_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `country boundaries request failed: ${response.status}`,
        );
      }
      return response.json() as Promise<FeatureCollection>;
    })
    .catch((error) => {
      // Drop the failed promise so a later retry can fetch again.
      cachedBoundaries = null;
      throw error;
    });
  return cachedBoundaries;
}

// Natural Earth uses "-99" for a features in ISO_A2_EH;
// fall back to ISO_A2
export function getIsoA2(feature: Feature | undefined): string | null {
  const properties = feature?.properties ?? {};
  const candidates = [properties.ISO_A2_EH, properties.ISO_A2];
  for (const candidate of candidates) {
    if (
      typeof candidate === "string" &&
      candidate !== "-99" &&
      candidate !== ""
    ) {
      return candidate;
    }
  }
  return null;
}

// Reactive wrapper over the cached loader for map components.
export function useCountryBoundaries(): {
  data: FeatureCollection;
  status: "loading" | "ready" | "error";
} {
  const [data, setData] = useState<FeatureCollection>(EMPTY_FEATURE_COLLECTION);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;
    loadCountryBoundaries()
      .then((boundaries) => {
        if (cancelled) return;
        setData(boundaries);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("Failed to load country boundaries", error);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, status };
}
