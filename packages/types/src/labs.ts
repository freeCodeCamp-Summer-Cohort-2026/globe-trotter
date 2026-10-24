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

// Coordinates are [longitude, latitude], matching GeoJSON and the goal `expected` coordinates.
// - region_selection: ISO alpha-2 code
// - text_input: free text
// - multiple_choice: option index
// - path_drawing: line of positions
// - polygon_drawing: a single closed ring, e.g. [[[lng, lat], ..., [lng, lat]]]
type LabAnswer = string | number | [number, number][] | [number, number][][];

// Request body for `POST /labs/:id/submit`, keyed by goal ID.
interface LabSubmission {
  answers: Record<string, LabAnswer>;
}

interface LabGoalResult {
  goalId: string;
  passed: boolean;
  // Only present when the goal failed. Never reveals the expected answer.
  reason?: string;
}

// Response body for `POST /labs/:id/submit`.
interface LabSubmissionResult {
  labId: string;
  passed: boolean;
  message: string;
  goals: LabGoalResult[];
  // `null` when the lab allows unlimited attempts.
  attemptsRemaining: number | null;
}

// A random message from the matching list is returned with each lab submission result.
const LAB_SUCCESS_MESSAGES = [
  "Great work! You completed every goal.",
  "Spot on! You've mastered this lab.",
  "Nailed it! Your geography skills are on point.",
  "Excellent navigating - lab complete!",
  "Well done! You found your way through every goal.",
] as const;

const LAB_FAILURE_MESSAGES = [
  "Not quite. Give it another go.",
  "Close, but not all goals are complete yet.",
  "Almost there! Check the hints and try again.",
  "A few goals still need work. Keep exploring!",
  "Not this time - review the failed goals and try again.",
] as const;

export type {
  LabAnswer,
  LabDetail,
  LabGoal,
  LabGoalPublic,
  LabGoalResult,
  LabSubmission,
  LabSubmissionResult,
};

export { LAB_FAILURE_MESSAGES, LAB_SUCCESS_MESSAGES };
