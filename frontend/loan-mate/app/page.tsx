"use client";

import { useRouter } from 'next/navigation';
import { Button } from './components/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/card';
import { Badge } from './components/badge';
import { useAuth } from '../lib/auth-context';
import {
  Bot,
  BrainCircuit,
  LayoutDashboard,
  FileCheck,
  ShieldCheck,
  Cpu,
  Code2,
  Zap,
  Workflow,
  MessageSquare,
  FileOutput,
  ChevronRight,
  Terminal,
  LogIn,
  UserPlus,
  LogOut,
  User
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  // Features focusing on the "Agentic AI" aspect
  const systemFeatures = [
    {
      icon: BrainCircuit,
      title: 'Master Orchestrator',
      description: 'A central intelligence that manages conversation flow and delegates tasks to specialized worker agents.'
    },
    {
      icon: MessageSquare,
      title: 'Contextual Sales',
      description: 'Human-like negotiation capabilities that adapt to user intent, sentiment, and financial needs.'
    },
    {
      icon: ShieldCheck,
      title: 'Automated Underwriting',
      description: 'Real-time credit evaluation logic based on CIBIL scores and salary-to-EMI ratios.'
    },
    {
      icon: FileOutput,
      title: 'Instant Sanction',
      description: 'Dynamic generation of PDF sanction letters immediately upon loan approval.'
    }
  ];

  // The specific "Agents" in your system
  const agentRoles = [
    {
      title: "Sales Agent",
      role: "Front-End Interaction",
      desc: "Handles user greetings, intent recognition, and negotiation of loan terms (Amount & Tenure).",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Verification Agent",

      role: "KYC Validator",
      desc: "Simulates fetching data from a CRM to verify customer identity and address details.",
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Underwriting Agent",
      role: "Risk Engine",
      desc: "Fetches credit scores and executes logic: (Loan <= Limit) ? Approve : Check Salary.",
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Sanction Agent",
      role: "Doc Generator",
      desc: "Compiles all approved data and generates a downloadable PDF sanction letter.",
      color: "bg-orange-100 text-orange-700"
    }
  ];

  // Technologies used (Replacing "Banking Partners")
  const techStack = [
    'Next.js 16', 'TypeScript', 'Tailwind CSS 4', 'React 19', 'Agentic Workflow', 'Mock APIs'
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">FinBot</span>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.displayName || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                  onClick={async () => {
                    try {
                      await logout();
                    } catch (error) {
                      console.error('Logout error:', error);
                    }
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                  onClick={() => router.push('/login')}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login with Google
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="bg-white pt-20 pb-24 px-6 md:px-12 overflow-hidden relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">

                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                  The Future of <br />
                  <span className="text-blue-600">Agentic AI Lending</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                  Experience a fully autonomous multi-agent system that negotiates, verifies, underwrites, and sanctions loans in real-time.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-base shadow-lg shadow-blue-200/50 transition-all hover:scale-105"
                  onClick={() => router.push('/chat')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Try Live Demo
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 h-12 px-8 text-base hover:text-blue-600 transition-all"
                  onClick={() => router.push('/dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>

              </div>

              <div className="flex items-center gap-6 text-sm font-medium text-gray-500 pt-4">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4" />
                  <span>End-to-End Automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>Real-time Logs</span>
                </div>
              </div>
            </div>

            {/* Right Content - Abstract Tech Visual */}
            <div className="relative">
              {/* This section is intentionally left blank for future content */}
            </div>
          </div>
        </div>
      </section>

      {/* --- SYSTEM CAPABILITIES SECTION --- */}
      <section className="py-24 px-6 md:px-12 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              System Capabilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built to demonstrate the power of collaborative AI agents in the BFSI sector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {systemFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-none shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- AGENT ARCHITECTURE SECTION --- */}
      <section className="py-24 px-6 md:px-12 bg-white border-y border-gray-100">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Multi-Agent Architecture
                </h2>
                <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Unlike traditional chatbots, FinBot uses a <strong>Master-Worker</strong> architecture.
                The Master Agent breaks down the loan process into atomic tasks and assigns them to specialized agents,
                ensuring accuracy and modularity.
              </p>

              <div className="space-y-4">
                {agentRoles.map((agent, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${agent.color} mt-1`}>
                      {agent.title}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{agent.role}</h4>
                      <p className="text-sm text-gray-600 mt-1">{agent.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagram Visual Placeholder */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-100 shadow-2xl">
                <div className="absolute inset-0 bg-gray-900 rounded-full opacity-50 blur-3xl"></div>

                {/* Center Node */}
                <div className="w-32 h-32 bg-blue-600 rounded-full flex flex-col items-center justify-center z-20 shadow-lg shadow-blue-500/50">
                  <BrainCircuit className="w-10 h-10 text-white mb-1" />
                  <span className="text-xs font-bold text-white">MASTER</span>
                </div>

                {/* Orbiting Nodes */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-gray-800 rounded-full flex flex-col items-center justify-center z-10 border border-gray-700">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <span className="text-[10px] text-gray-400 mt-1">Sales</span>
                </div>
                <div className="absolute top-10 right-10 w-20 h-20 bg-gray-800 rounded-full flex flex-col items-center justify-center z-10 border border-gray-700">
                  <ShieldCheck className="w-6 h-6 text-purple-400" />
                  <span className="text-[10px] text-gray-400 mt-1">Risk</span>
                </div>
                <div className="absolute bottom-10 w-20 h-20 bg-gray-800 rounded-full flex flex-col items-center justify-center z-10 border border-gray-700">
                  <FileCheck className="w-6 h-6 text-green-400" />
                  <span className="text-[10px] text-gray-400 mt-1">KYC</span>
                </div>

                {/* Connection Lines (Simulated with CSS) */}
                <div className="absolute w-full h-full border border-dashed border-gray-700 rounded-full opacity-30 animate-spin-slow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-6 md:px-12 bg-gray-900 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px]"></div>

        <div className="container mx-auto text-center relative z-10">
          <div className="space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Ready to judge the prototype?
            </h2>
            <p className="text-xl text-gray-400">
              See the Agentic AI Controller in action as it handles a complete loan lifecycle from start to finish.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                className="bg-white !text-black hover:bg-gray-100 h-14 px-10 text-lg font-bold shadow-xl transition-transform hover:scale-105"
                onClick={() => router.push('/chat')}
              >
                Launch Application
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}