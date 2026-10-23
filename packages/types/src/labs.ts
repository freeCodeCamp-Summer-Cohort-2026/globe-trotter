// Full goal shape as stored in `labs.goals`. `expected` is the answer key and must never be sent to students.
type LabGoal =
  | {
      id: string;
      type: "region_selection";
      description: string;
      expected: { iso_a2: string };
      hint?: string;
    }
  | {
      id: string;
      type: "path_drawing";
      description: string;
      expected: { coordinates: [number, number][]; tolerance_meters: number };
      hint?: string;
    }
  | {
      id: string;
      type: "polygon_drawing";
      description: string;
      expected: { coordinates: [number, number][][]; tolerance_meters: number };
      hint?: string;
    }
  | {
      id: string;
      type: "text_input";
      description: string;
      expected: { value: string; caseSensitive: boolean };
      hint?: string;
    }
  | {
      id: string;
      type: "multiple_choice";
      description: string;
      options: string[];
      expected: { correctIndex: number };
      hint?: string;
    };

// Student-facing goal - no `expected`.
interface LabGoalPublic {
  id: string;
  type: LabGoal["type"];
  description: string;
  hint?: string;
  // multiple_choice only:
  options?: string[];
}

interface LabDetail {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  goals: LabGoalPublic[];
  allowedAttempts: number | null;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type { LabDetail, LabGoal, LabGoalPublic };
