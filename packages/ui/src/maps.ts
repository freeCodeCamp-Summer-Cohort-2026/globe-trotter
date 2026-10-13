// SSR NOTE: MapLibre GL JS cannot run on the server. Every export below renders
// the map in the browser only. Import these through a browser-only boundary,
// e.g. `dynamic(() => import("@repo/ui/maps"), { ssr: false })`, and do not move
// the map render into a server component or run it during SSR.
// The consuming app must also import the MapLibre stylesheet once (e.g. in its
// root layout): import "maplibre-gl/dist/maplibre-gl.css";
export { MapTemplate } from "./maps/MapTemplate";
export type { MapTemplateProps } from "./maps/MapTemplate";
export { mapTemplates } from "./maps/mapTemplates";
export type { MapTemplateDefinition } from "./maps/mapTemplates";
