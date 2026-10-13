import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { AppProvider } from "@/context/app-context";
import "./globals.css";
import AuthProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Noteflow", template: "%s · Noteflow" },
  description: "Study workspace: organize notes and generate practice quizzes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`} data-scroll-behavior="smooth">
      <body>
        <AppProvider>
          <AuthProvider>{children}</AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
