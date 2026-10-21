"use client";

import * as React from "react";
import {
  CheckIcon,
  GlobeIcon,
  MapIcon,
  MountainIcon,
  type LucideIcon,
} from "lucide-react";
import type {
  MapTemplateId,
  MapTemplateSelection,
  MapViewState,
} from "@repo/types";

import { Select, type SelectOption } from "../forms/Select";
import { cn } from "../lib/utils";
import { Skeleton } from "../Skeleton";
import { InitialStateControls } from "./InitialStateControls";
import { mapTemplates } from "./mapTemplates";

// SSR NOTE: MapLibre GL JS cannot run on the server. The preview is code-split
// and only rendered once in the browser (see useIsClient), which is the
// framework-agnostic equivalent of `dynamic(() => import(...), { ssr: false })`.
// Do not import MapTemplate statically here or render it during SSR.
const MapTemplate = React.lazy(() =>
  import("./MapTemplate.js").then((module) => ({
    default: module.MapTemplate,
  })),
);

const subscribeNoop = () => () => {};

// false on the server and during hydration, true once rendering in the browser.
function useIsClient() {
  return React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

const DEFAULT_TEMPLATE_ID: MapTemplateId = "world-political";

const headingClasses = "ui:text-sm ui:font-semibold ui:text-slate-950";

const templateIds = Object.keys(mapTemplates) as MapTemplateId[];

const templateSelectOptions: SelectOption[] = templateIds.map((templateId) => ({
  value: templateId,
  label: mapTemplates[templateId].name,
}));

const templateThumbnails: Record<
  MapTemplateId,
  { icon: LucideIcon; className: string }
> = {
  "world-political": {
    icon: MapIcon,
    className: "ui:bg-blue-100 ui:text-blue-900",
  },
  "world-physical": {
    icon: MountainIcon,
    className: "ui:bg-green-100 ui:text-green-900",
  },
  "satellite-3d": {
    icon: GlobeIcon,
    className: "ui:bg-slate-950 ui:text-blue-500",
  },
};

// Switching templates keeps the author's center and zoom, but resets bearing,
// pitch and config to the new template's defaults.
function createSelection(
  templateId: MapTemplateId,
  previous?: MapViewState,
): MapTemplateSelection {
  const { defaultViewState, defaultConfig } = mapTemplates[templateId];
  const initialState: MapViewState = previous
    ? {
        ...defaultViewState,
        longitude: previous.longitude,
        latitude: previous.latitude,
        zoom: previous.zoom,
      }
    : { ...defaultViewState };

  return {
    templateId,
    initialState,
    config: { ...defaultConfig },
  } as MapTemplateSelection;
}

type TemplateCardGridProps = {
  value: MapTemplateId;
  onSelect: (templateId: MapTemplateId) => void;
};

function TemplateCardGrid({ value, onSelect }: TemplateCardGridProps) {
  const name = React.useId();

  return (
    <fieldset>
      <legend className={cn("ui:mb-2", headingClasses)}>Map template</legend>
      <div className="ui:grid ui:grid-cols-3 ui:gap-2">
        {templateIds.map((templateId) => {
          const { icon: Icon, className } = templateThumbnails[templateId];
          const checked = templateId === value;

          return (
            <label
              key={templateId}
              className={cn(
                "ui:relative ui:flex ui:cursor-pointer ui:flex-col ui:items-center ui:gap-2 ui:rounded-xl ui:border ui:bg-white ui:p-2 ui:text-center ui:text-xs ui:font-medium ui:leading-tight ui:text-slate-950 ui:transition-colors ui:has-focus-visible:ring-2 ui:has-focus-visible:ring-primary/30",
                checked
                  ? "ui:border-primary ui:bg-green-50"
                  : "ui:border-slate-300 ui:hover:border-slate-700",
              )}
            >
              <input
                type="radio"
                name={name}
                value={templateId}
                checked={checked}
                onChange={() => onSelect(templateId)}
                className="ui:sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "ui:flex ui:aspect-[4/3] ui:w-full ui:items-center ui:justify-center ui:rounded-lg",
                  className,
                )}
              >
                <Icon className="ui:h-6 ui:w-6" />
              </span>
              {mapTemplates[templateId].name}
              {checked ? (
                <span
                  aria-hidden="true"
                  className="ui:absolute ui:top-1 ui:right-1 ui:flex ui:h-4 ui:w-4 ui:items-center ui:justify-center ui:rounded-full ui:bg-primary ui:text-white"
                >
                  <CheckIcon className="ui:h-3 ui:w-3" strokeWidth={3} />
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function TemplatePreview({ selection }: { selection: MapTemplateSelection }) {
  const isClient = useIsClient();
  const { templateId, config } = selection;
  const { longitude, latitude, zoom, bearing, pitch } = selection.initialState;

  // MapTemplate re-applies its camera and layer toggles whenever these props
  // change identity, so only pass new objects when the values change.
  const initialState = React.useMemo(
    () => ({ longitude, latitude, zoom, bearing, pitch }),
    [longitude, latitude, zoom, bearing, pitch],
  );
  const configKey = JSON.stringify(config);
  const stableConfig = React.useMemo(
    () => JSON.parse(configKey) as MapTemplateSelection["config"],
    [configKey],
  );

  const fallback = (
    <Skeleton className="ui:absolute ui:inset-0 ui:h-auto ui:rounded-2xl" />
  );

  return (
    <figure className="ui:flex ui:flex-col ui:gap-2">
      <figcaption className={headingClasses}>Map preview</figcaption>
      <div className="ui:relative ui:aspect-video ui:w-full">
        {isClient ? (
          <React.Suspense fallback={fallback}>
            <MapTemplate
              templateId={templateId}
              initialState={initialState}
              config={stableConfig}
              mode="readOnly"
              className="ui:absolute ui:inset-0 ui:h-auto ui:min-h-0"
            />
          </React.Suspense>
        ) : (
          fallback
        )}
        <span
          aria-hidden="true"
          className="ui:pointer-events-none ui:absolute ui:top-2 ui:left-2 ui:z-10 ui:rounded-md ui:bg-slate-950/75 ui:px-2 ui:py-1 ui:font-mono ui:text-xs ui:text-white"
        >
          {latitude.toFixed(4)}, {longitude.toFixed(4)} · z{zoom.toFixed(1)}
        </span>
      </div>
    </figure>
  );
}

export type MapTemplateSelectorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  /** Controlled selection, e.g. TipTap node attrs. Pair with `onChange`. */
  value?: MapTemplateSelection;
  /** Initial selection when uncontrolled. Defaults to World Political. */
  defaultValue?: MapTemplateSelection;
  onChange?: (selection: MapTemplateSelection) => void;
  /** `grid` shows thumbnail cards; `dropdown` uses a compact Select. */
  variant?: "grid" | "dropdown";
};

export function MapTemplateSelector({
  value,
  defaultValue,
  onChange,
  variant = "grid",
  className,
  ...props
}: MapTemplateSelectorProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    () => defaultValue ?? createSelection(DEFAULT_TEMPLATE_ID),
  );
  const selection = value ?? uncontrolledValue;

  const handleChange = (next: MapTemplateSelection) => {
    if (value === undefined) setUncontrolledValue(next);
    onChange?.(next);
  };

  const selectTemplate = (templateId: MapTemplateId) => {
    if (templateId !== selection.templateId) {
      handleChange(createSelection(templateId, selection.initialState));
    }
  };

  return (
    <div
      data-slot="map-template-selector"
      className={cn("ui:flex ui:flex-col ui:gap-5", className)}
      {...props}
    >
      {variant === "dropdown" ? (
        <Select
          label={<span className={headingClasses}>Map template</span>}
          value={selection.templateId}
          options={templateSelectOptions}
          onChange={(event) =>
            selectTemplate(event.target.value as MapTemplateId)
          }
        />
      ) : (
        <TemplateCardGrid
          value={selection.templateId}
          onSelect={selectTemplate}
        />
      )}
      <TemplatePreview selection={selection} />
      <InitialStateControls value={selection} onChange={handleChange} />
    </div>
  );
}

MapTemplateSelector.displayName = "MapTemplateSelector";
