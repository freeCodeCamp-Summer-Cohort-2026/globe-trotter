type ApiError = {
  statusCode: number;
  message: string;
  timestamp: string;
};

type Session = {
  user: {
    id: string;
    name: string;
    role: "learner" | "author";
  };
} | null;

export type {
  ApiError,
  Session
};
