"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-center mt-8 px-4">
      <div
        className="w-full max-w-7xl 
        bg-transparent backdrop-blur-md 
        rounded-2xl 
        shadow-[0_12px_35px_rgba(37,99,235,0.25)] 
        px-6 py-4 
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


          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md transition">
            WhatsApp
          </button>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg transition">
            Apply Now
          </button>
        </div>
    </nav>
  );
}
