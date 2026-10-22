"use client";

import * as React from "react";
import type {
  MapTemplateConfigMap,
  MapTemplateId,
  MapTemplateSelection,
  MapViewState,
} from "@repo/types";

import { Checkbox } from "../forms/Checkbox";
import { Input } from "../forms/Input";
import { cn } from "../lib/utils";

const ZOOM_MIN = 0;
const ZOOM_MAX = 18;

// Strips the text-field chrome from Input so it renders as a plain slider.
const rangeClasses =
  "ui:h-auto ui:cursor-pointer ui:border-0 ui:bg-transparent ui:px-0 ui:py-1 ui:shadow-none ui:accent-primary";

const legendClasses = "ui:mb-3 ui:text-sm ui:font-semibold ui:text-slate-950";

type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T] &
  string;

type ToggleOption<K extends string = string> = { key: K; label: string };

type RangeOption<K extends string = string> = ToggleOption<K> & {
  min: number;
  max: number;
  step: number;
  unit: string;
};

type TemplateOptions<C> = {
  legend: string;
  toggles: ReadonlyArray<ToggleOption<KeysMatching<C, boolean>>>;
  ranges: ReadonlyArray<RangeOption<KeysMatching<C, number>>>;
};

const templateOptions: {
  [T in MapTemplateId]: TemplateOptions<MapTemplateConfigMap[T]>;
} = {
  "world-political": {
    legend: "Map layers",
    toggles: [
      { key: "showBorders", label: "Show borders" },
      { key: "showLabels", label: "Show labels" },
      { key: "showCapitals", label: "Show capitals" },
    ],
    ranges: [],
  },
  "world-physical": {
    legend: "Map layers",
    toggles: [
      { key: "showElevation", label: "Show elevation" },
      { key: "showRivers", label: "Show rivers" },
      { key: "showLabels", label: "Show labels" },
    ],
    ranges: [],
  },
  "satellite-3d": {
    legend: "Camera",
    toggles: [],
    // MapLibre clamps pitch to its default maxPitch of 60°.
    ranges: [
      { key: "cameraAngle", label: "Camera angle", min: 0, max: 360, step: 1, unit: "°" },
      { key: "pitch", label: "Pitch", min: 0, max: 60, step: 1, unit: "°" },
    ],
  },
};

const zoomScale = (
  <span className="ui:flex ui:justify-between ui:text-xs">
    <span>{ZOOM_MIN} (Global)</span>
    <span>9 (Regional)</span>
    <span>{ZOOM_MAX} (Street)</span>
  </span>
);

// Up to 4 decimal places (~11 m), without trailing zeros.
const formatCoordinate = (value: number) => String(Number(value.toFixed(4)));

function parseCoordinate(input: string, min: number, max: number) {
  if (input.trim() === "") return null;
  const value = Number(input);
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function RangeLabel({ label, value }: { label: string; value: string }) {
  return (
    <>
      {label}
      <span
        aria-hidden="true"
        className="ui:ml-auto ui:rounded-md ui:bg-green-100 ui:px-1.5 ui:py-0.5 ui:text-xs ui:font-semibold ui:tabular-nums ui:text-green-900"
      >
        {value}
      </span>
    </>
  );
}

type CoordinateInputProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
};

function CoordinateInput({
  label,
  value,
  min,
  max,
  onValueChange,
}: CoordinateInputProps) {
  // Keeps partially typed input (e.g. "-" or "12.") until it parses to a valid value.
  const [draft, setDraft] = React.useState(() => formatCoordinate(value));
  const [syncedValue, setSyncedValue] = React.useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    if (parseCoordinate(draft, min, max) !== value) {
      setDraft(formatCoordinate(value));
    }
  }

  const isValid = parseCoordinate(draft, min, max) !== null;

  return (
    <Input
      label={label}
      autoComplete="off"
      spellCheck={false}
      value={draft}
      error={isValid ? undefined : `Enter a value from ${min} to ${max}`}
      onChange={(event) => {
        const nextDraft = event.target.value;
        setDraft(nextDraft);
        const next = parseCoordinate(nextDraft, min, max);
        if (next !== null && next !== value) onValueChange(next);
      }}
    />
  );
}

export type InitialStateControlsProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  value: MapTemplateSelection;
  onChange: (value: MapTemplateSelection) => void;
};

export function InitialStateControls({
  value,
  onChange,
  className,
  ...props
}: InitialStateControlsProps) {
  const { initialState } = value;
  const options = templateOptions[value.templateId];
  const toggles: ReadonlyArray<ToggleOption> = options.toggles;
  const ranges: ReadonlyArray<RangeOption> = options.ranges;
  const config: Record<string, unknown> = value.config;

  const updateInitialState = (patch: Partial<MapViewState>) =>
    onChange({ ...value, initialState: { ...initialState, ...patch } });

  const updateConfig = (key: string, next: boolean | number) =>
    onChange({
      ...value,
      config: { ...value.config, [key]: next },
    } as MapTemplateSelection);

  return (
    <div
      data-slot="initial-state-controls"
      className={cn("ui:flex ui:flex-col ui:gap-5", className)}
      {...props}
    >
      <fieldset>
        <legend className={legendClasses}>Initial viewport</legend>
        <div className="ui:flex ui:flex-col ui:gap-4">
          <Input
            type="range"
            label={
              <RangeLabel
                label="Zoom level"
                value={initialState.zoom.toFixed(1)}
              />
            }
            hint={zoomScale}
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            step={0.1}
            value={initialState.zoom}
            onChange={(event) =>
              updateInitialState({ zoom: Number(event.target.value) })
            }
            className={rangeClasses}
          />
          <div className="ui:grid ui:grid-cols-2 ui:gap-3">
            <CoordinateInput
              label="Latitude"
              min={-90}
              max={90}
              value={initialState.latitude}
              onValueChange={(latitude) => updateInitialState({ latitude })}
            />
            <CoordinateInput
              label="Longitude"
              min={-180}
              max={180}
              value={initialState.longitude}
              onValueChange={(longitude) => updateInitialState({ longitude })}
            />
          </div>
        </div>
      </fieldset>

      {/* The divider lives on a wrapper because a fieldset border would run through its legend. */}
      <div className="ui:border-t ui:border-slate-200 ui:pt-5">
        <fieldset>
          <legend className={legendClasses}>{options.legend}</legend>
          <div className="ui:flex ui:flex-col ui:gap-4">
            {toggles.length > 0 ? (
              <div className="ui:grid ui:grid-cols-2 ui:gap-3">
                {toggles.map((toggle) => (
                  <Checkbox
                    key={toggle.key}
                    label={toggle.label}
                    checked={Boolean(config[toggle.key])}
                    onChange={(event) =>
                      updateConfig(toggle.key, event.target.checked)
                    }
                  />
                ))}
              </div>
            ) : null}
            {ranges.map((range) => {
              const rangeValue = Number(config[range.key]);
              return (
                <Input
                  key={range.key}
                  type="range"
                  label={
                    <RangeLabel
                      label={range.label}
                      value={`${rangeValue}${range.unit}`}
                    />
                  }
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={rangeValue}
                  aria-valuetext={`${rangeValue}${range.unit}`}
                  onChange={(event) =>
                    updateConfig(range.key, Number(event.target.value))
                  }
                  className={rangeClasses}
                />
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

InitialStateControls.displayName = "InitialStateControls";
