
import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { AppProvider } from "@/context/app-context";
import AuthProvider from "@/components/SessionProvider";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { SessionExpiredAlert } from "@/components/session-expired-alert";
import { GlobalErrorBanner } from "@/components/global-error-banner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Noteflow", template: "%s · Noteflow" },
  description: "Study workspace: organize notes and generate practice quizzes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="bg-[#FAF8F5] text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppProvider>
              <SessionExpiredAlert />
              <GlobalErrorBanner />
              {children}
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
