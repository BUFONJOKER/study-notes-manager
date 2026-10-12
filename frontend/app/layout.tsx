import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noteflow — Study workspace",
  description:
    "Manage and organize study notes while generating AI-powered quizzes to enhance learning and retention.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f7f3",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="bg-[#f6f7f3]">
      <body className="m-0 min-h-screen min-w-80 bg-[#f6f7f3] font-['DM_Sans'] text-[#18231f] antialiased selection:bg-[#dcefe5] selection:text-[#1f5b45] max-[620px]:pb-[69px]">
        {children}
      </body>
    </html>
  );
}
