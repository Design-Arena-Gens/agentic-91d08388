import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quillcraft | Editing Workspace",
  description: "A modern writing and editing workspace with focus, formatting, and export tools."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="app-header">
          <Link href="/" className="logo">
            Quillcraft
          </Link>
          <nav className="nav-actions">
            <ThemeSwitcher />
            <a
              className="nav-link"
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </nav>
        </header>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
