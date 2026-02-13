import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlogSaaS - Managed blogging platform",
  description:
    "A full-stack managed blogging SaaS for solo creators and teams with AI-assisted writing."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-inner">
            <a className="logo" href="/">
              BlogSaaS
            </a>
            <nav style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <a href="/dashboard">Dashboard</a>
              <a href="/signin" className="button primary">
                Sign in
              </a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
