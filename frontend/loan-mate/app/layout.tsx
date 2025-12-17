import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth-context";
import { FirestoreProvider } from "../lib/firestore-context"; // <--- 1. Import this

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinBot",
  description: "Agentic AI Loan Application System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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