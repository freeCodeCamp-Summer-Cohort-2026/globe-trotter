import { Header, Container } from "@repo/ui";
import { headers } from "next/headers";
import type { Session } from "@repo/types";
import { redirect } from "next/navigation";

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  const nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!nextPublicApiUrl) {
    throw new Error("Environment variable NEXT_PUBLIC_API_URL must be set.");
  }
  
  const cookie = (await headers()).get("cookie") ?? "";

  const response = await fetch(`${nextPublicApiUrl}/api/auth/get-session`, {
    headers: { cookie },
    cache: "no-store" // Doesn't cache the session
  });

  const session: Session = await response.json().catch(() => null);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "author") {
    redirect("/modules");
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
