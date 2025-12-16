"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./button"; // Assuming Navbar is in components folder, so ./button
import { LogIn } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  return (
    <nav className="w-full flex justify-center mt-8 px-4">
      <div
        className="w-full max-w-7xl 
        bg-transparent backdrop-blur-md 
        rounded-2xl 
        shadow-[0_12px_35px_rgba(37,99,235,0.25)] 
        px-8 md:px-12 py-4 
        flex items-center justify-between"
      >

        {/* Left - Logo + Brand */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Loan Mate Logo"
            width={40}
            height={60}
          />

          <span className="text-xl font-semibold bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 bg-clip-text text-transparent">
            LoanMate
          </span>
        </div>

        {/* Center - Nav Links */}
        <div className="hidden md:flex items-center gap-3 text-sm font-medium text-gray-700">
          {[
            "Personal Loan",
            "Education Loan",
            "Business Loan",
            "Home Loan",
            "Tools",
            "Contact Us",
          ].map((item) => (
            <Link
              key={item}
              href="#"
              className="px-4 py-2 rounded-full hover:bg-blue-100 hover:text-blue-700 transition"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right - Login Button */}
        <div className="flex items-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={async () => {
              try {
                // The original comment suggests dynamic import or using a hook.
                // For now, we'll just redirect to a login page.
                // If signInWithGoogle is to be called directly, ensure it's properly imported/available.
                // const { signInWithGoogle } = await import('../lib/auth-context');
                router.push('/login');
              } catch (e) {
                console.error(e);
              }
            }}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login with Google
          </Button>
        </div>
      </div>
    </nav>
  );
}
