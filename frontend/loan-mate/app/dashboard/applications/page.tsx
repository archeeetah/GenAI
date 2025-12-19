"use client";

import { Card, CardContent } from "../../components/card";
import { Badge } from "../../components/badge";
import { Button } from "../../components/button";
import { Loader2, FileText, ArrowRight } from "lucide-react"; 
import { useEffect, useState } from "react";
import { useFirestore } from "../../../lib/firestore-context";
import { useAuth } from "../../../lib/auth-context";
import Link from "next/link"; // Import Next.js Link

// 1. Define Types
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

interface Application {
  applicationId: string;
  type: string;
  amount: number;
  date: FirestoreTimestamp | string | number | null; // More specific type
  status: string;
}

// 2. Helper Functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumSignificantDigits: 10,
  }).format(amount);
};

const formatDate = (dateVal: Application['date']) => {
  if (!dateVal) return "N/A";
  
  // Handle Firestore Timestamp
  if (typeof dateVal === 'object' && 'seconds' in dateVal) {
    return new Date(dateVal.seconds * 1000).toLocaleDateString("en-IN", {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
  
  // Handle standard Date strings/numbers
  return new Date(dateVal as string | number).toLocaleDateString("en-IN", {
      year: 'numeric', month: 'short', day: 'numeric'
  });
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved": return "bg-green-100 text-green-700 border border-green-200"; // Improved contrast
    case "rejected": return "bg-red-100 text-red-700 border border-red-200";
    case "closed": return "bg-gray-100 text-gray-700 border border-gray-200";
    default: return "bg-blue-50 text-blue-700 border border-blue-100";
  }
};

// 3. Components

// Loading Widget
const LoadingWidget = () => {
  return (
    <div className="flex flex-col justify-center items-center py-20 space-y-4" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-500 font-medium animate-pulse">Fetching your applications...</p>
    </div>
  );
};

// 4. Main Component
export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  const { getApplications } = useFirestore();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;
      try {
        setLoading(true);
        const data = await getApplications();
        setApplications(data as Application[]);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, getApplications]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        {/* Optional: Add a 'New Application' button here if needed */}
      </div>

      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <LoadingWidget />
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
               <div className="bg-gray-100 p-4 rounded-full">
                  <FileText className="h-8 w-8 text-gray-400" />
               </div>
               <div>
                  <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
                  <p className="text-sm text-gray-500 mt-1">You haven't applied for any loans yet.</p>
               </div>
               <Link href="/chat">
                 <Button className="mt-2">Start New Application</Button>
               </Link>
            </div>
          ) : (
            // RESPONSIVE WRAPPER: Makes table scrollable on mobile
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4">ID</th>
                    <th scope="col" className="px-6 py-4">Type</th>
                    <th scope="col" className="px-6 py-4">Amount</th>
                    <th scope="col" className="px-6 py-4">Date Applied</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app, index) => (
                    <tr key={app.applicationId} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                         #{app.applicationId.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{app.type}</td>
                      <td className="px-6 py-4 text-gray-700 font-medium">{formatCurrency(app.amount)}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(app.date)}</td>
                      <td className="px-6 py-4">
                        <Badge className={`${getStatusColor(app.status)} shadow-none`}>
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* NAVIGATION FIX: Using Next.js Link instead of window.location */}
                        <Link 
                            href={`/chat?session_id=${app.applicationId}`}
                            className="inline-block"
                        >
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 gap-1"
                              aria-label={`Resume application ${app.applicationId}`}
                            >
                              Resume
                              <ArrowRight size={14} />
                            </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}