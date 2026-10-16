import Link from "next/link";

export default function ActionLink() {
  return (
    <Link
      href="/modules"
      className="underline underline-offset-2 hover:no-underline"
    >
      Return to All Modules
    </Link>
  );
}
