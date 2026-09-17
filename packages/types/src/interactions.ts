type RegionSelectionGoal = {
  type: "region_selection";
  iso_a2: string;
};

type PathDrawingGoal = {
  type: "path_drawing";
  coordinates: [number, number][];
  tolerance_meters: number;
};

type PolygonDrawingGoal = {
  type: "polygon_drawing";
  coordinates: [number, number][][];
  tolerance_meters: number;
};

type TextInputGoal = {
  type: "text_input";
  value: string;
  caseSensitive: boolean;
};

type MultipleChoiceGoal = {
  type: "multiple_choice";
  correctIndex: number;
};

type MapInteractionType =
  | RegionSelectionGoal
  | PathDrawingGoal
  | PolygonDrawingGoal
  | TextInputGoal
  | MultipleChoiceGoal;

type MapTemplateId =
  "world-political" | "world-physical" | "satellite-3d";

export type {
  MapInteractionType,
  MapTemplateId,
  MultipleChoiceGoal,
  PathDrawingGoal,
  PolygonDrawingGoal,
  RegionSelectionGoal,
  TextInputGoal
};
