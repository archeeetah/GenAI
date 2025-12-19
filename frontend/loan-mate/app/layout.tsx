import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { FirestoreProvider } from "../lib/firestore-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Mobile & Brand Settings
export const viewport: Viewport = {
  themeColor: "#2563eb", // Matches your Brand Blue
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents auto-zoom on inputs in iOS
};

// 2. SEO & Title Settings
export const metadata: Metadata = {
  title: {
    template: "%s | FinBot",
    default: "FinBot - Agentic AI Lending",
  },
  description: "Experience fully autonomous multi-agent loan negotiation, verification, and underwriting.",
  icons: {
    icon: "/favicon.ico", // Ensure you have a favicon in your /public folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {/* AuthProvider handles the user login state */}
        <AuthProvider>
          {/* FirestoreProvider needs the user info, so it goes INSIDE AuthProvider */}
          <FirestoreProvider>
            {children}
          </FirestoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}