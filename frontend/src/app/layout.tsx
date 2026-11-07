import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "CareerCraft — AI Job Search & Career Intelligence",
  description: "AI-powered career platform to find jobs, optimize resumes for ATS, and prepare for interviews.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased transition-colors duration-300 font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
