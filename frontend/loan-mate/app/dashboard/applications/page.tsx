"use client";

import { Card, CardContent } from "../../components/card";
import { Badge } from "../../components/badge";
import { Button } from "../../components/button";
import { Loader2, Eye, X, Circle } from "lucide-react"; // Added Eye, X, Circle
import { useEffect, useState } from "react";
import { useFirestore } from "../../../lib/firestore-context";
import { useAuth } from "../../../lib/auth-context";

// 1. Define Types
interface Application {
  applicationId: string;
  type: string;
  amount: number;
  date: any;
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

const formatDate = (dateVal: any) => {
  if (!dateVal) return "N/A";
  if (dateVal?.seconds) {
    return new Date(dateVal.seconds * 1000).toLocaleDateString("en-IN", {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
  return new Date(dateVal).toLocaleDateString("en-IN");
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved": return "bg-green-600 text-white hover:bg-green-700";
    case "rejected": return "bg-red-600 text-white hover:bg-red-700";
    case "closed": return "bg-gray-600 text-white hover:bg-gray-700";
    default: return "bg-gray-600 text-white hover:bg-gray-700";
  }
};

// 3. Components

// Loading Widget
const LoadingWidget = () => {
  return (
    <div className="flex flex-col justify-center items-center py-16 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      <p className="text-sm text-gray-500 font-medium">Loading applications...</p>
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
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <LoadingWidget />
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No applications found.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  {/* CHANGED: Header Name */}
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.map((app, index) => (
                  <tr key={app.applicationId} className="bg-white hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">{app.type}</td>
                    <td className="px-6 py-4">{formatCurrency(app.amount)}</td>
                    <td className="px-6 py-4">{formatDate(app.date)}</td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </td>
                    {/* CHANGED: Resume Chat Button */}
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => window.location.href = `/chat?session_id=${app.applicationId}`}
                      >
                        Resume Chat
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>


    </div>
  );
}