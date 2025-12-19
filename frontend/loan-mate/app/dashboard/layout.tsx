"use client";

import { Bot, LayoutDashboard, FileText, Wallet, History, Settings, LogOut, Bell, BrainCircuit, Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../components/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import React, { useState, useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();
    
    // State for Mobile Sidebar
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Protect route
    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading FinBot...</div>;
    }

    if (!user) {
        return null; 
    }

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "U";
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    }

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/'); 
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900 relative">

            {/* --- MOBILE OVERLAY BACKDROP --- */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside 
                className={`
                    fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
                    md:translate-x-0 md:static md:h-screen
                    ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
                `}
            >
                {/* Sidebar Header */}
                <div className="p-6 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Bot size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight">FinBot</span>
                    </div>
                    {/* Close Button (Mobile Only) */}
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="md:hidden text-gray-500 hover:text-gray-700"
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <SidebarItem 
                        icon={LayoutDashboard} 
                        label="Overview" 
                        href="/dashboard" 
                        isActive={pathname === "/dashboard"} 
                    />
                    <SidebarItem 
                        icon={FileText} 
                        label="My Applications" 
                        href="/dashboard/applications" 
                        isActive={pathname.startsWith("/dashboard/applications")} 
                    />
                    {/* <SidebarItem icon={Wallet} label="Payments" href="/dashboard/payments" isActive={pathname.startsWith("/dashboard/payments")} />
                    <SidebarItem icon={History} label="History" href="/dashboard/history" isActive={pathname.startsWith("/dashboard/history")} />
                    <SidebarItem icon={Settings} label="Settings" href="/dashboard/settings" isActive={pathname.startsWith("/dashboard/settings")} />
                    */}
                </nav>

                {/* Sidebar Footer */}
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
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                        onClick={handleLogout}
                    >
                        <LogOut size={18} className="mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            aria-label="Open menu"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="font-semibold text-lg text-gray-800 capitalize">
                            {pathname === '/dashboard' ? 'Overview' : pathname.split('/').pop()?.replace(/-/g, ' ')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Notifications">
                            <Bell size={20} className="text-gray-600" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        
                        {/* User Profile */}
                        <div className="flex items-center gap-3">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                                <p className="text-xs text-gray-500">Applicant</p>
                            </div>
                            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">
                                {getInitials(user?.displayName)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 scroll-smooth">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Helper Component for Sidebar Links
interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    href: string;
    isActive?: boolean;
}

function SidebarItem({ icon: Icon, label, isActive, href }: SidebarItemProps) {
    return (
        <Link
            href={href}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
            <Icon size={18} className={isActive ? "text-white" : "text-gray-500"} />
            {label}
        </Link>
    )
}