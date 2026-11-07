import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "Capabl — AI Job Search Assistant",
  description: "AI-powered career assistant to find jobs, build resumes, and prepare for interviews.",
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
