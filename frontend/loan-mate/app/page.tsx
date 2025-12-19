"use client";

import Link from 'next/link'; // Improved Navigation
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
  Zap,
  Workflow,
  MessageSquare,
  FileOutput,
  ChevronRight,
  Terminal,
  LogIn,
  LogOut,
  User,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
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
      desc: "Handles user greetings, intent recognition, and negotiation of loan terms.",
      color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
      title: "Verification Agent",
      role: "KYC Validator",
      desc: "Simulates fetching data from a CRM to verify customer identity and address details.",
      color: "bg-green-100 text-green-700 border-green-200"
    },
    {
      title: "Underwriting Agent",
      role: "Risk Engine",
      desc: "Fetches credit scores and executes logic: (Loan <= Limit) ? Approve : Check Salary.",
      color: "bg-purple-100 text-purple-700 border-purple-200"
    },
    {
      title: "Sanction Agent",
      role: "Doc Generator",
      desc: "Compiles all approved data and generates a downloadable PDF sanction letter.",
      color: "bg-orange-100 text-orange-700 border-orange-200"
    }
  ];

  const techStack = [
    'Next.js 15', 'TypeScript', 'Tailwind CSS', 'React 19', 'Firebase', 'Vercel AI'
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100">

      {/* --- NAVBAR --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-blue-200">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">FinBot</span>
          </Link>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : user ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{user.displayName || 'User'}</span>
                </div>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login with Google
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="bg-white pt-20 pb-20 px-6 md:px-12 overflow-hidden relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03]"
          aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left Content */}
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-4">
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 px-3 py-1">
                  v2.0 Now Live
                </Badge>
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
                  The Future of <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Agentic AI Lending
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                  Experience a fully autonomous multi-agent system that negotiates, verifies, underwrites, and sanctions loans in real-time.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/chat">
                    <Button
                    size="lg"
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-base shadow-lg shadow-blue-200/50 transition-all hover:scale-105 active:scale-95"
                    >
                    <Zap className="w-4 h-4 mr-2 fill-current" />
                    Try Live Demo
                    </Button>
                </Link>

                <Link href={user ? "/dashboard" : "/login"}>
                    <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border-gray-200 h-12 px-8 text-base hover:text-blue-600 transition-all"
                    >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                    </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm font-medium text-gray-500 pt-4 border-t border-gray-100 w-fit">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-blue-500" />
                  <span>End-to-End Automation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-500" />
                  <span>Real-time Logs</span>
                </div>
              </div>
            </div>

            {/* Right Content - Mock UI Visual */}
            <div className="relative animate-in zoom-in-95 duration-1000 delay-200 hidden lg:block">
               {/* Decorative Blobs */}
               <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
               <div className="absolute bottom-0 left-10 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl -z-10"></div>

               {/* Mock Chat Card */}
               <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-md mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center gap-3">
                     <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                     </div>
                     <div className="text-xs font-mono text-gray-400 ml-2">finbot_agent_v1.tsx</div>
                  </div>
                  <div className="p-6 space-y-4">
                     {/* Bot Message */}
                     <div className="flex gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                           <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 max-w-[85%]">
                           <p className="font-semibold text-blue-600 text-xs mb-1">SALES AGENT</p>
                           Hello! I can help you get a loan up to ₹5 Lakhs instantly. How much do you need?
                        </div>
                     </div>
                     {/* User Message */}
                     <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                           <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none text-sm text-white">
                           I need ₹2,00,000 for a personal emergency.
                        </div>
                     </div>
                     {/* Bot Processing */}
                     <div className="flex gap-3">
                         <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0 animate-bounce">
                           <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-purple-50 p-3 rounded-2xl rounded-tl-none text-sm text-purple-800 border border-purple-100">
                           <p className="font-semibold text-purple-600 text-xs mb-1 flex items-center gap-1">
                              RISK ENGINE <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                           </p>
                           Checking eligibility...
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECH STACK STRIP --- */}
      <div className="border-y border-gray-100 bg-gray-50/50 py-6 overflow-hidden">
         <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-6 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <p className="text-sm font-semibold text-gray-500 whitespace-nowrap">POWERED BY</p>
             <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center">
                 {techStack.map((tech) => (
                    <span key={tech} className="text-sm font-medium text-gray-600 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-blue-500" /> {tech}
                    </span>
                 ))}
             </div>
         </div>
      </div>

      {/* --- SYSTEM CAPABILITIES SECTION --- */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              System Capabilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built to demonstrate the power of collaborative AI agents in the BFSI sector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className="group border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 bg-white"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- AGENT ARCHITECTURE SECTION --- */}
      <section className="py-24 px-6 md:px-12 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Multi-Agent Architecture
                </h2>
                <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Unlike traditional chatbots, FinBot uses a <strong>Master-Worker</strong> architecture.
                The Master Agent breaks down the loan process into atomic tasks and assigns them to specialized agents.
              </p>

              <div className="grid gap-3">
                {agentRoles.map((agent, i) => (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl bg-white border ${agent.color.split(' ')[2]} hover:shadow-md transition-shadow`}>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${agent.color.split(' ').slice(0, 2).join(' ')} mt-0.5 border border-current/20`}>
                      {agent.title}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{agent.role}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{agent.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Architecture Diagram */}
            <div className="relative flex justify-center order-1 lg:order-2">
              <div className="relative w-full max-w-md aspect-square bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-100 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gray-900 rounded-full opacity-50 blur-3xl"></div>

                {/* Center Master Node */}
                <div className="w-32 h-32 bg-blue-600 rounded-full flex flex-col items-center justify-center z-20 shadow-lg shadow-blue-500/50 relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                  <BrainCircuit className="w-10 h-10 text-white mb-1" />
                  <span className="text-xs font-bold text-white tracking-widest">MASTER</span>
                </div>

                {/* Orbiting Track */}
                <div className="absolute w-[80%] h-[80%] border border-dashed border-gray-700 rounded-full animate-spin [animation-duration:10s]">
                    {/* Nodes positioned on the track using transforms */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center shadow-lg transform -rotate-0">
                        <MessageSquare className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center shadow-lg transform -rotate-180">
                        <FileCheck className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center shadow-lg transform -rotate-90">
                        <ShieldCheck className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center shadow-lg transform rotate-90">
                        <FileOutput className="w-6 h-6 text-orange-400" />
                    </div>
                </div>
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
              <Link href="/chat">
                <Button
                    size="lg"
                    className="bg-white !text-black hover:bg-gray-100 h-14 px-10 text-lg font-bold shadow-xl transition-transform hover:scale-105"
                >
                    Launch Application
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}