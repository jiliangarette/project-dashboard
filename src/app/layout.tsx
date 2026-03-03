import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { SessionProvider } from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastContainer } from "@/components/Toast";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { Footer } from "@/components/Footer";
import { TopLoader } from "@/components/TopLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: "Project Dashboard",
    template: "%s | Project Dashboard",
  },
  description: "GitHub repository dashboard with AI-powered changelogs that explain your commits in plain English. Track your projects, view analytics, and stay organized.",
  keywords: ["github", "dashboard", "ai", "changelog", "project management", "repository", "git", "developer tools"],
  authors: [{ name: "Jilian Garette A. Abangan", url: "https://github.com/jiliangarette" }],
  creator: "Jilian Garette A. Abangan",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://project-dashboard.vercel.app",
    title: "Project Dashboard",
    description: "GitHub repository dashboard with AI-powered changelogs that explain your commits in plain English.",
    siteName: "Project Dashboard",
    images: [
      {
        url: "https://project-dashboard.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Project Dashboard - AI-powered GitHub changelogs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Dashboard",
    description: "GitHub dashboard with AI-powered changelogs in plain English",
    creator: "@jiliangarette",
    images: ["https://project-dashboard.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider>
        <SessionProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-white focus:outline-none"
          >
            Skip to content
          </a>
          <TopLoader />
          <Header />
          <main id="main-content" role="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </main>
          <Footer />
          <ToastContainer />
          <KeyboardShortcutsModal />
        </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
