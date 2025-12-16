"use client";

import { Bot, LayoutDashboard, FileText, Wallet, History, Settings, LogOut, Bell, BrainCircuit } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../components/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
   const router = useRouter();
   const pathname = usePathname();
   const { user, loading, logout } = useAuth(); // destructure logout

   // Protect route
   React.useEffect(() => {
      if (!loading && !user) {
         router.replace('/login');
      }
   }, [user, loading, router]);

   if (loading) {
      return <div className="h-screen flex items-center justify-center">Loading...</div>;
   }

   if (!user) {
      return null; // Will redirect
   }

   // Helper to get initials
   const getInitials = (name: string | null | undefined) => {
      if (!name) return "U";
      return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
   }

   return (
      <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

         {/* --- SIDEBAR --- */}
         <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-0 h-screen">
            <div className="p-6 flex items-center gap-2 border-b border-gray-100">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <Bot size={20} />
               </div>
               <span className="text-xl font-bold tracking-tight">LoanMate</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
               <SidebarItem icon={LayoutDashboard} label="Overview" href="/dashboard" active={pathname === "/dashboard"} />
               <SidebarItem icon={FileText} label="My Applications" href="/dashboard/applications" active={pathname === "/dashboard/applications"} />
               {/* <SidebarItem icon={Wallet} label="Payments" href="/dashboard/payments" active={pathname === "/dashboard/payments"} /> */}
               {/* <SidebarItem icon={History} label="History" href="/dashboard/history" active={pathname === "/dashboard/history"} /> */}
               {/* <SidebarItem icon={Settings} label="Settings" href="/dashboard/settings" active={pathname === "/dashboard/settings"} /> */}
            </nav>

            <div className="p-4 border-t border-gray-100">
               <div className="bg-blue-50 p-4 rounded-xl mb-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BrainCircuit className="w-4 h-4 text-blue-600" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-blue-800">Master Agent</p>
                        <p className="text-[10px] text-blue-600">System Online</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-blue-500">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                     Monitoring Transactions
                  </div>
               </div>
               <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={async () => {
                  router.push('/');
                  await logout();
               }}>
                  <LogOut size={18} className="mr-2" />
                  Logout
               </Button>
            </div>
         </aside>

         {/* --- MAIN CONTENT WRAPPER --- */}
         <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
               <h2 className="font-semibold text-lg text-gray-800 capitalize">Dashboard</h2>
               <div className="flex items-center gap-4">
                  <button className="relative p-2 hover:bg-gray-100 rounded-full">
                     <Bell size={20} className="text-gray-600" />
                     <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  </button>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                     {getInitials(user?.displayName)}
                  </div>
               </div>
            </header>

            {/* PAGE CONTENT INJECTED HERE */}
            <div className="flex-1 overflow-y-auto p-6">
               {children}
            </div>
         </main>
      </div>
   );
}

// Helper Component for Sidebar Links
function SidebarItem({ icon: Icon, label, active, href }: any) {
   return (
      <Link
         href={href}
         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
            ? "bg-blue-50 text-blue-600"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
      >
         <Icon size={18} />
         {label}
      </Link>
   )
}