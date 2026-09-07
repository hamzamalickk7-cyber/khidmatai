import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginView } from "@/modules/authentication/views/admin-login-view";

export const metadata: Metadata = { title: "Admin sign in | KhidmatAI" };

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginView />
    </Suspense>
  );
}
