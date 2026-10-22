import { Suspense } from "react";
import LoginForm from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
};
