"use client";

import { Button } from '../components/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Bot, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push('/'); // Redirect to home page after successful sign in
    } catch (error) {
      console.error('Sign in error:', error);
      // You can add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
           style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-gray-900 tracking-tight">LoanMate</span>
        </div>
        <p className="text-gray-600 text-lg">The Future of Agentic AI Lending</p>
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl shadow-blue-100/50 bg-white/80 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Create an account</CardTitle>
          <p className="text-sm text-gray-600">
            Sign up with your Google account to get started
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50 transition-all hover:scale-[1.02] h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing up...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}