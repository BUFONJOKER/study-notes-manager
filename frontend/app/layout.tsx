import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import "@/app/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Noteflow - Study Workspace",
  description: "AI-powered study notes and quiz generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${newsreader.variable}`}>
      <body className="bg-[#f6f7f3] font-sans text-[#18231f] antialiased">
        {children}
      </body>
    </html>
  );
}