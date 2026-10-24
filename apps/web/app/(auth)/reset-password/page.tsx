import { Suspense } from "react";
import ResetPasswordForm from "./_components/ResetPasswordForm";
import AuthPageSkeleton from "../_components/AuthPageSkeleton";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthPageSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  )
};
