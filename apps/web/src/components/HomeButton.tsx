import { Button } from "@repo/ui";
import { useRouter } from "next/navigation";

export default function HomeButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/")}
      className="font-normal min-w-8 border border-black"
    >
      Home
    </Button>
  );
}
