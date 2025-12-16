"use client";

import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { TrendingUp, CheckCircle2, Bot, Wallet, ArrowRight, Plus, Building2, Calendar, FileText, PieChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context"
import { useFirestore } from "../../lib/firestore-context";
import { DocumentData } from "firebase/firestore";

export default function OverviewPage() {
   const router = useRouter();
   const [loading, setLoading] = useState(true);
   const [loans, setLoans] = useState<DocumentData[]>([]);
   const { user } = useAuth();
   const { userData, getLoans } = useFirestore();

   // Helper to format currency
   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN').format(amount);
   };

   // Fetch Loans on Mount
   useEffect(() => {
      const fetchLoans = async () => {
         if (user) {
            const fetchedLoans = await getLoans();
            setLoans(fetchedLoans);
         }
         setLoading(false);
      };

      // Delay slightly for effect or wait for user
      // FIX: Ensure loading is set to false even if no user
      if (user) {
         fetchLoans();
      } else {
         // Allow a short buffer to check if auth is initializing, but if user is null we stop loading
         // However, auth-context usually handles 'loading' state. 
         // Since we don't have 'authLoading' exposed here, we might need to assume 
         // if user is null after mount, they are guest.
         // A small timeout helps avoid flashing 'Guest' before 'User' loads
         const timer = setTimeout(() => setLoading(false), 1000);
         return () => clearTimeout(timer);
      }
   }, [user, getLoans]);


   const startNewApplication = () => {
      const newSessionId = `session_${Math.random().toString(36).substring(2, 9)}`;
      router.push(`/chat?session_id=${newSessionId}`);
   };

   const startSpecificApplication = (type: string) => {
      const newSessionId = `session_${Math.random().toString(36).substring(2, 9)}`;
      // We could technically pre-fill the input in the chat, but for now just routing is fine.
      router.push(`/chat?session_id=${newSessionId}`);
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-400">
            <div className="animate-pulse flex flex-col items-center gap-2">
               <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
               <div>Loading Dashboard...</div>
            </div>
         </div>
      );
   }

   // --- GUEST VIEW ---
   if (!user) {
      return (
         <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
               <Bot size={48} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to LoanMate</h1>
            <p className="text-slate-500 max-w-md mb-8">
               You are currently browsing as a guest. Log in to view your personalized dashboard, track loans, and manage your finances.
            </p>
            <div className="flex gap-4">
               <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg" onClick={() => router.push('/login')}>
                  Log In / Sign Up
               </Button>
               <Button variant="outline" size="lg" onClick={startNewApplication}>
                  Talk to Agent
               </Button>
            </div>
         </div>
      );
   }

   // Stats from User Profile
   const stats = {
      limit: userData?.preApprovedLoan || 0,
      open: userData?.loanApplications || 0,
      active: userData?.activeApplications || 0
   };

   return (
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-10 animate-in fade-in duration-700">

         {/* HEADER SECTION */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div>
               <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Hello, {user?.displayName?.split(' ')[0] || 'Member'} <span className="text-2xl">👋</span>
               </h1>
               <p className="text-slate-500 mt-2 text-lg">Here's your financial snapshot for today.</p>
            </div>

            <div className="flex gap-3">
               <Button
                  className="bg-gray-900 hover:bg-black text-white rounded-xl shadow-xl shadow-gray-200"
                  onClick={startNewApplication}
               >
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
               </Button>
            </div>
         </div>

         {/* STATS CARDS GRID */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: LIMIT */}
            <Card className="border-none shadow-xl shadow-blue-500/10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
               <CardContent className="p-8 relative">
                  <div className="flex items-center gap-3 mb-4 text-blue-100/80">
                     <Wallet size={20} />
                     <span className="font-medium tracking-wide text-sm uppercase">Pre-Approved Limit</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-6 tracking-tight">
                     ₹ {formatCurrency(stats.limit)}
                  </h3>
                  <div className="flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                     <CheckCircle2 size={12} />
                     <span className="font-medium">Valid until Dec 31</span>
                  </div>
               </CardContent>
            </Card>

            {/* CARD 2: OPEN APPS */}
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-300">
               <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className="space-y-1">
                        <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">Open Applications</span>
                        <h3 className="text-4xl font-bold text-gray-900">{stats.open}</h3>
                     </div>
                     <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                        <FileText size={24} />
                     </div>
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                     Currently under review
                  </div>
               </CardContent>
            </Card>

            {/* CARD 3: ACTIVE LOANS COUNT */}
            <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-3xl hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-300">
               <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className="space-y-1">
                        <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">Active Loans</span>
                        <h3 className="text-4xl font-bold text-gray-900">{stats.active}</h3>
                     </div>
                     <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                        <PieChart size={24} />
                     </div>
                  </div>
                  <Button variant="ghost" className="w-full justify-between text-purple-600 h-auto p-0 hover:bg-transparent hover:opacity-80 font-medium" onClick={() => {
                     const el = document.getElementById('loans-section');
                     el?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                     View Portfolio <ArrowRight size={16} />
                  </Button>
               </CardContent>
            </Card>
         </div>

         {/* ACTIVE LOANS SECTION */}
         <div id="loans-section" className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="text-blue-600" />
                  Your Portfolio
               </h2>
               <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                     Total Exposure: ₹ {formatCurrency(loans.reduce((acc, curr) => acc + (curr.amount || 0), 0))}
                  </span>
               </div>
            </div>

            {loans.length === 0 ? (
               // EMPTY STATE
               <div className="bg-white rounded-3xl p-12 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                     <Bot size={40} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Loans Found</h3>
                  <p className="text-gray-500 max-w-md mb-8">
                     It looks like you don't have any approved loans yet. Speak to our AI Advisor to check your eligibility today.
                  </p>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-xl px-8" onClick={startNewApplication}>
                     Start New Application
                  </Button>
               </div>
            ) : (
               // LOANS GRID
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loans.map((loan, index) => {
                     // Mock fields if missing
                     const emiAmount = loan.emiAmount || Math.round((loan.amount || 0) * 0.015);
                     const totalTenure = loan.tenure || 24;
                     const paidTenure = loan.paidTenure || Math.floor(Math.random() * 5); // Mock progress
                     const nextDate = new Date();
                     nextDate.setDate(5); // 5th of next month
                     nextDate.setMonth(nextDate.getMonth() + 1);

                     return (
                        <Card key={index} className="border-none shadow-md bg-white rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                           <div className={`h-2 w-full ${loan.status === 'Closed' ? 'bg-green-500' : 'bg-blue-600'}`}></div>
                           <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                 <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{loan.type || "Personal Loan"}</h4>
                                    <p className="text-xs text-slate-500 font-mono mt-1">ID: #{loan.id?.substring(0, 8).toUpperCase()}</p>
                                 </div>
                                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${loan.status === 'Closed' ? 'bg-green-100 text-green-700' :
                                    loan.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {loan.status || "Active"}
                                 </span>
                              </div>

                              <div className="space-y-4 my-6">
                                 <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Loan Amount</span>
                                    <span className="font-semibold text-gray-900">₹ {formatCurrency(loan.amount || 0)}</span>
                                 </div>
                                 <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">EMI Amount</span>
                                    <span className="font-semibold text-gray-900">₹ {formatCurrency(emiAmount)} / mo</span>
                                 </div>
                                 {/* Progress Bar */}
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-slate-500">
                                       <span>Progress</span>
                                       <span>{paidTenure} / {totalTenure} EMIs Paid</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                       <div
                                          className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                          style={{ width: `${(paidTenure / totalTenure) * 100}%` }}
                                       ></div>
                                    </div>
                                 </div>
                              </div>

                              <div className="bg-slate-50 -mx-6 -mb-6 p-4 border-t border-slate-100 flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                    <Calendar size={14} className="text-slate-400" />
                                    Next: {nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                 </div>
                                 <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                                    <CheckCircle2 size={14} />
                                    Status: Current
                                 </div>
                              </div>
                           </CardContent>
                        </Card>
                     );
                  })}
               </div>
            )}
         </div>
      </div>
   );
}