"use client";

import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { TrendingUp, CheckCircle2, Bot, Wallet, ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context"
import { useFirestore } from "../../lib/firestore-context";

interface ApplicationData {
   limit: number;
   score: number;
   active: number;
}

export default function OverviewPage() {
   const router = useRouter();
   const [loading, setLoading] = useState(false);
   const { user } = useAuth();
   const { userData } = useFirestore(); // Use realtime data

   // Map firestore data to local interface if needed, or just use userData directly
   const loanData = userData ? {
      limit: userData.preApprovedLoan || 0,
      open: userData.loanApplications || 0,
      active: userData.activeApplications || 0
   } : null;

   useEffect(() => {
      // Just for initial loading state if needed, but userData updates automatically
      if (userData) setLoading(false);
   }, [userData]);

   // Helper to format currency
   const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN').format(amount);
   };

   if (loading) {
      return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;
   }

   return (
      <div className="space-y-8 animate-in fade-in duration-500">

         {/* GREETING */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.displayName}! 👋</h1>
               <p className="text-gray-500">Here is your financial overview for today.</p>
            </div>

            {/* Show "New Application" button only if user has NO active loans or NO data */}
            {(!loanData || loanData.active === 0) && (
               <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={() => router.push('/chat')}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Loan Application
               </Button>
            )}
         </div>

         {/* FINANCIAL CARDS */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* CARD 1: LIMIT */}
            <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-blue-700 text-white">
               <CardContent className="p-6 pt-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Pre-Approved Limit</p>

                  {/* Fixed Logic: Shows formatted limit or 0 */}
                  <h3 className="text-3xl font-bold mb-4">
                     ₹ {loanData?.limit ? formatCurrency(loanData.limit) : 0}
                  </h3>

                  <div className="flex items-center gap-2 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                     <CheckCircle2 size={12} />
                     Valid till Dec 31
                  </div>
               </CardContent>
            </Card>

            {/* CARD 2: OPEN APPLICATIONS */}
            <Card className="border-none shadow-sm bg-white">
               <CardContent className="p-6 pt-6">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <p className="text-gray-500 text-sm font-medium">Open Applications</p>
                        {/* Fallback to 0 */}
                        <h3 className="text-3xl font-bold text-gray-900">
                           {loanData?.open || 0}
                        </h3>
                     </div>
                     <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <TrendingUp size={20} />
                     </div>
                  </div>
                  <div className="text-xs text-green-600 mt-2 font-medium bg-green-50 w-fit px-2 py-1 rounded">
                     In Progress
                  </div>
               </CardContent>
            </Card>

            {/* CARD 3: ACTIVE LOANS */}
            <Card className="border-none shadow-sm bg-white">
               <CardContent className="p-6 pt-6">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <p className="text-gray-500 text-sm font-medium">Active Loans</p>
                        {/* Fallback to 0 */}
                        <h3 className="text-3xl font-bold text-gray-900">
                           {loanData?.active || 0}
                        </h3>
                     </div>
                     <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                        <Wallet size={20} />
                     </div>
                  </div>

                  {/* Call to Action if 0 active loans */}
                  {(!loanData || loanData.active === 0) && (
                     <Button variant="ghost" className="w-full justify-between text-blue-600 h-8 px-0 hover:bg-transparent hover:underline" onClick={() => router.push('/chat')}>
                        Check Eligibility <ArrowRight size={14} />
                     </Button>
                  )}
               </CardContent>
            </Card>
         </div>

         {/* AGENT PROMO (Show if no active loans) */}
         {(!loanData || loanData.active === 0) && (
            <div className="bg-white rounded-xl p-8 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Bot size={32} className="text-blue-600" />
               </div>
               <h3 className="text-lg font-bold text-gray-900">Talk to our Agentic AI</h3>
               <p className="text-gray-500 max-w-md mb-6">
                  Our multi-agent system can negotiate terms, verify your documents, and sanction your loan in less than 5 minutes.
               </p>
               <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/chat')}>
                  Start Conversation
               </Button>
            </div>
         )}
      </div>
   );
}