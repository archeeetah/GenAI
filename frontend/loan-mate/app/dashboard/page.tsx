"use client";

import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { TrendingUp, CheckCircle2, Bot, Wallet, ArrowRight, Plus, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context"
import { useFirestore } from "../../lib/firestore-context";

export default function OverviewPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { userData } = useFirestore(); // Assuming this is realtime

    // robust data mapping with fallbacks
    const loanData = {
        limit: userData?.preApprovedLoan || 0,
        open: userData?.loanApplications || 0,
        active: userData?.activeApplications || 0
    };

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN').format(amount);
    };

    // Combined loading state
    if (authLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-gray-500" role="status">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                <span>Loading your dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Welcome back, {user?.displayName?.split(' ')[0] || 'User'}! 
                        <span className="text-2xl animate-pulse">👋</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Here is your financial overview for today.</p>
                </div>

                {/* CTA: Only show if user has low activity to encourage engagement */}
                {loanData.active === 0 && (
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-105" 
                        onClick={() => router.push('/chat')}
                        aria-label="Start a new loan application"
                    >
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        New Application
                    </Button>
                )}
            </div>

            {/* --- FINANCIAL CARDS GRID --- */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Financial Statistics">

                {/* CARD 1: LIMIT (Hero Card) */}
                <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden relative group">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-3xl"></div>
                    
                    <CardContent className="p-6 pt-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <p className="text-blue-100 text-sm font-medium mb-1">Pre-Approved Limit</p>
                            <Sparkles className="w-5 h-5 text-yellow-300 opacity-75" />
                        </div>

                        <h3 className="text-4xl font-bold mb-4 tracking-tight">
                            ₹ {formatCurrency(loanData.limit)}
                        </h3>

                        <div className="flex items-center gap-2 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                            <CheckCircle2 size={12} className="text-green-300" />
                            <span className="text-blue-50">Valid till Dec 31</span>
                        </div>
                    </CardContent>
                </Card>

                {/* CARD 2: OPEN APPLICATIONS */}
                <Card className="border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6 pt-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Open Applications</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                    {loanData.open}
                                </h3>
                            </div>
                            <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
                                <TrendingUp size={22} />
                            </div>
                        </div>
                        {loanData.open > 0 ? (
                            <div className="text-xs text-green-700 font-medium bg-green-50 w-fit px-2.5 py-1 rounded-md border border-green-100">
                                • In Progress
                            </div>
                        ) : (
                            <div className="text-xs text-gray-400 font-medium bg-gray-50 w-fit px-2.5 py-1 rounded-md">
                                No pending requests
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* CARD 3: ACTIVE LOANS */}
                <Card className="border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6 pt-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Active Loans</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                    {loanData.active}
                                </h3>
                            </div>
                            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                                <Wallet size={22} />
                            </div>
                        </div>

                        {/* Conditional Footer Action */}
                        {loanData.active === 0 ? (
                            <button 
                                onClick={() => router.push('/chat')}
                                className="group flex items-center text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
                            >
                                Check Eligibility 
                                <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <div className="text-xs text-purple-700 font-medium bg-purple-50 w-fit px-2.5 py-1 rounded-md border border-purple-100">
                                • Payment on time
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* --- AI PROMO BANNER --- */}
            {/* Displayed prominently to users with no active loans to drive conversion */}
            {loanData.active === 0 && (
                <section className="bg-gradient-to-r from-blue-50 via-white to-blue-50 rounded-2xl p-8 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                   {/* Background pattern */}
                   <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

                    <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 z-10">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-blue-100 flex items-center justify-center shrink-0">
                            <Bot size={32} className="text-blue-600" />
                        </div>
                        <div className="max-w-md">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Talk to our Agentic AI</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Our multi-agent system can negotiate terms, verify your documents, and sanction your loan in less than 5 minutes.
                            </p>
                        </div>
                    </div>
                    
                    <div className="z-10">
                        <Button 
                            size="lg" 
                            className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all" 
                            onClick={() => router.push('/chat')}
                        >
                            Start Conversation
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </section>
            )}
        </div>
    );
}