export type RegionSelectionGoal = {
  type: "region_selection";
  iso_a2: string;
};

export type PathDrawingGoal = {
  type: "path_drawing";
  coordinates: [number, number][];
  tolerance_meters: number;
};

export type PolygonDrawingGoal = {
  type: "polygon_drawing";
  coordinates: [number, number][][];
  tolerance_meters: number;
};

export type TextInputGoal = {
  type: "text_input";
  value: string;
  caseSensitive: boolean;
};

export type MultipleChoiceGoal = {
  type: "multiple_choice";
  correctIndex: number;
};

export type MapInteractionType =
  | RegionSelectionGoal
  | PathDrawingGoal
  | PolygonDrawingGoal
  | TextInputGoal
  | MultipleChoiceGoal;

export type MapTemplateId =
  "world-political" | "world-physical" | "satellite-3d";
