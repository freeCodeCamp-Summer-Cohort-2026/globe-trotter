import { Header, Container } from "@repo/ui";
import { headers } from "next/headers";
import type { Session } from "@repo/types";
import { redirect } from "next/navigation";

async function getSession(): Promise<Session> {
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
    
    return response.json();
  } catch (err) {
    //? Network errors, non-2xx responses and JSON parse failures are re-thrown as a generic error so that the error boundary
    //? can surface them. An unauthenticated user gets a 200 response with a null body, which returns from the try block before
    //? reaching this catch block - that case is handled by the guard statements in AuthorLayout.
    throw new Error("Could not verify your session. Please refresh the page or try again shortly.", { cause: err });
  }
}

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login?redirect=/author/modules");
  }

  if (session.user.role !== "author") {
    redirect("/modules?redirect=/author/modules");
  }

  return (
    <>
      <Header variant="content-author" user={session.user} />
      <main className="min-h-[calc(100vh-4rem)]">
        <Container size="lg">{children}</Container>
      </main>
    </>
  );
}
