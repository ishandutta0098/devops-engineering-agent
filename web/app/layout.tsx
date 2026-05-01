import type { Metadata } from "next";
import { Inter, Space_Grotesk, Fira_Code } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/AppShell/TopNav";
import { Footer } from "@/components/AppShell/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fira-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DEVOPS_AGENT_LAB // Build a Multi-Agent DevOps System",
  description:
    "Learn to build a 3-agent DevOps pipeline with CrewAI — from your first agent to production guardrails. Interactive demos for every concept.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${inter.variable} ${firaCode.variable}`}>
      <body className="bg-night text-ink font-body min-h-screen">
        <TopNav />
        <main className="pt-16 min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
