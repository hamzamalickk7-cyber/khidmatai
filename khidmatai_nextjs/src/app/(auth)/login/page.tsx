import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthenticationFormView } from "@/modules/authentication/views/authentication-form-view";

export const metadata: Metadata = { title: "Sign in | KhidmatAI" };

export default function LoginPage() { return <Suspense><AuthenticationFormView mode="sign-in" /></Suspense>; }
