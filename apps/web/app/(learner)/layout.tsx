import { Header, Footer, Container } from "@repo/ui";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header variant="learner" />
      <main className="min-h-[calc(100vh-4rem)]">
        <Container>{children}</Container>
      </main>
      <Footer />
    </>
  );
}
