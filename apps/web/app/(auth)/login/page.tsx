import { Suspense } from "react";
import LoginForm from "./_components/LoginForm";
import AuthPageSkeleton from "../_components/AuthPageSkeleton";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <LoginForm />
    </Suspense>
  )
};
