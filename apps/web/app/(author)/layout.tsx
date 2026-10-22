import { Header, Container } from "@repo/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import getSession from "../../src/lib/getSession";

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/author/modules";

  // This only runs if the user is trying to navigate to an author-specific route, so doesn't trigger when on Home page e.g.
  if (!session?.user) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  }

  if (session.user.role !== "author") {
    redirect("/modules");
  }
  // `/modules?redirect=${encodeURIComponent(pathname)}`

  return (
    <>
      <Header variant="content-author" user={session.user} />
      <main className="min-h-[calc(100vh-4rem)]">
        <Container size="lg">{children}</Container>
      </main>
    </>
  );
}
