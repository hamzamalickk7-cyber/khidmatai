import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthenticationFormView } from "@/modules/authentication/views/authentication-form-view";
export const metadata: Metadata = { title: "Create account | KhidmatAI" };
export default function RegisterPage() { return <Suspense><AuthenticationFormView mode="sign-up" /></Suspense>; }
