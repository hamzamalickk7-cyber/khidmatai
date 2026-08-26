import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const bodyTextFont = Plus_Jakarta_Sans({
  variable: "--font-body-text",
  subsets: ["latin"],
});

const headingDisplayFont = Space_Grotesk({
  variable: "--font-heading-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KhidmatAI: Local services, matched intelligently",
  description:
    "Describe your problem and KhidmatAI structures it, matches you with verified local electricians, plumbers, mechanics, and home service professionals, and keeps quotes and bookings in one place.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bodyTextFont.variable} ${headingDisplayFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-ink">
        <NextTopLoader color="#4f46e5" height={3} showSpinner={false} shadow="0 0 12px rgba(79, 70, 229, 0.45)" />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
