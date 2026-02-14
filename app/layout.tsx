import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlogSaaS - Managed blogging platform",
  description:
    "A full-stack managed blogging SaaS for solo creators and teams with AI-assisted writing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
