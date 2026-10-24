import { headers } from "next/headers";
import { sessionSchema, type Session } from "@repo/types";

export default async function getSession(): Promise<Session> {
  const nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!nextPublicApiUrl) {
    throw new Error("Environment variable NEXT_PUBLIC_API_URL must be set.");
  }
  
  const cookie = (await headers()).get("cookie") ?? "";

  try {
    const response = await fetch(`${nextPublicApiUrl}/api/auth/get-session`, {
      headers: { cookie },
      cache: "no-store" // Doesn't cache the session
    });

    if (!response.ok) throw new Error(`Session fetch failed with status: ${response.status}`); 
    
    const session = await response.json();

    const validatedSessionShape: Session = sessionSchema.parse(session);

    return validatedSessionShape;
  } catch (err) {
    //? Network errors, non-2xx responses and JSON parse failures are re-thrown as a generic error so that the error boundary
    //? can surface them. An unauthenticated user gets a 200 response with a null body, which returns from the try block before
    //? reaching this catch block - that case is handled by the guard statements in AuthorLayout.
    console.error(`Network error: ${err}`);
    throw new Error("Could not verify your session. Please refresh the page or try again shortly.", { cause: err });
  }
}
