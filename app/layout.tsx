import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree, Source_Serif_4 } from "next/font/google";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { getBaseUrl } from "@/lib/seo";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  style: ["normal", "italic"],
  display: "swap",
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "BlogSaaS - Managed blogging platform",
    template: "%s | BlogSaaS",
  },
  description:
    "A full-stack managed blogging SaaS for solo creators and teams with AI-assisted writing.",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BlogSaaS",
    title: "BlogSaaS - Managed blogging platform",
    description:
      "A full-stack managed blogging SaaS for solo creators and teams with AI-assisted writing.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${figtree.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen antialiased">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
