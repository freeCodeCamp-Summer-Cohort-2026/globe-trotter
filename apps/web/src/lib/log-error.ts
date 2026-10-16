export function logError(error: Error & { digest?: string }) {
  // Placeholder for real logging service - for MVP, log to console
  console.error("[error]", error.message, error.digest ?? "");
}