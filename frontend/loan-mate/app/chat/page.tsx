'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, ArrowLeft, Paperclip, X, Loader2 } from 'lucide-react';
import { sendMessage, getHistory, uploadDocument } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useFirestore } from '@/lib/firestore-context';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: number;
    agentName?: string;
}

function ChatContent() {
    const { user, loading } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [attachedDoc, setAttachedDoc] = useState<{ id: string; name: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { createApplication, userData } = useFirestore(); // Get userData for activeSessionId
    const searchParams = useSearchParams();

    const [sessionId, setSessionId] = useState<string>("");

    // Initialize Session ID (URL > Active Session > Random)
    useEffect(() => {
        const urlId = searchParams.get('session_id');
        if (urlId) {
            setSessionId(urlId);
        } else if (userData?.activeSessionId) {
            setSessionId(userData.activeSessionId);
        } else {
            // Only generate new if we don't have one and not loading
            if (!sessionId) {
                setSessionId(`session_${Math.random().toString(36).substring(2, 9)}`);
            }
        }
    }, [userData, searchParams]);

    // Conditional Application Creation
    useEffect(() => {
        if (user) {
            loadHistory(user.uid, sessionId);
            // Frontend NO LONGER creates the application. 
            // The AI Agent decides when to create it based on conversation intent.
        } else {
            // For guest, clear messages on mount/unmount or just let local state handle it.
            // We don't load history for guests (no persistent ID easily available without cookies, keeping it simple)
        }
    }, [user, sessionId]);

    // Removed the login guard block here. Guests can see the UI.

    const loadHistory = async (uid: string, sid: string) => {
        try {
            const data = await getHistory(uid, sid);
            if (data.history && Array.isArray(data.history)) {
                const mappedMessages = data.history.map((msg: any, index: number) => ({
                    id: `hist_${index}`,
                    role: msg.role === 'user' ? 'user' : 'model',
                    content: msg.content,
                    timestamp: Date.now()
                }));
                setMessages(mappedMessages);
            }
        } catch (e) {
            console.error("Failed to load history:", e);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsUploading(true);
        try {
            const result = await uploadDocument(file);
            setAttachedDoc({ id: result.doc_id, name: file.name });
        } catch (error) {
            console.error('Failed to upload:', error);
            // Optionally add error state/toast here
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSend = async () => {
        if ((!input.trim() && !attachedDoc)) return;

        // Use a temporary guest ID if no user
        const currentUserId = user ? user.uid : "guest_user";

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input || (attachedDoc ? `[Sent File: ${attachedDoc.name}]` : ""), // Fallback text if just file
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');

        // Temporarily hold doc id and clear state so UI resets
        const docIdToSend = attachedDoc?.id;
        setAttachedDoc(null);

        setIsLoading(true);

        try {
            const result = await sendMessage(userMsg.content, currentUserId, sessionId, docIdToSend);

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: result.response,
                timestamp: Date.now(),
                agentName: result.agent_used
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-gray-50">Loading...</div>;
    }

    // Guest access allowed - no login guard block.

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header with Glassmorphism */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-all">
                <div className="flex items-center gap-4">
                    <Link href={user ? "/dashboard/applications" : "/"} className="p-2 hover:bg-white/50 rounded-full transition-all hover:shadow-md group">
                        <ArrowLeft size={20} className="text-gray-600 group-hover:text-blue-600" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                            <Bot size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                LoanMate AI
                            </h1>
                            <p className="text-xs text-green-600 flex items-center gap-1.5 font-medium">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Online & Ready
                            </p>
                        </div>
                    </div>
                </div>
                {!user && (
                    <div className="hidden md:block bg-blue-50/80 px-4 py-2 rounded-full text-xs text-blue-700 border border-blue-100 font-medium">
                        Guest Mode • <Link href="/login" className="underline hover:text-blue-800">Login to Save</Link>
                    </div>
                )}
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scroll-smooth scrollbar-thin scrollbar-thumb-gray-200">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-blue-100 mb-6">
                                <Bot size={64} className="text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">How can I help you today?</h3>
                            <p className="max-w-md text-gray-500 mb-8 leading-relaxed">
                                I'm your personal banking assistant. I can help with loans, check your eligibility, or analyze documents.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                                {[
                                    { text: "Apply for a Home Loan", icon: "🏠" },
                                    { text: "Check my Loan Eligibility", icon: "✅" },
                                    { text: "Compare Interest Rates", icon: "📊" },
                                    { text: "Upload Salary Slip", icon: "📄" }
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setInput(item.text); handleSend(); }}
                                        className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left"
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{item.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => {
                        const isModel = msg.role === 'model';

                        // Helper to get agent icon/style
                        const getAgentStyle = (name?: string) => {
                            const n = name?.toLowerCase() || "";
                            if (n.includes('verification') || n.includes('auditor')) return { icon: <Paperclip size={16} className="text-white" />, color: "bg-gradient-to-br from-purple-500 to-indigo-600", label: "Verification Officer" };
                            if (n.includes('advisor') || n.includes('loan')) return { icon: <Bot size={16} className="text-white" />, color: "bg-gradient-to-br from-indigo-500 to-blue-600", label: "Loan Advisor" };
                            if (n.includes('market')) return { icon: <Bot size={16} className="text-white" />, color: "bg-gradient-to-br from-emerald-500 to-teal-600", label: "Market Analyst" };
                            return { icon: <Bot size={16} className="text-white" />, color: "bg-gradient-to-br from-blue-500 to-cyan-600", label: "Customer Executive" };
                        };

                        const agentStyle = isModel ? getAgentStyle(msg.agentName) : null;

                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                            >
                                {isModel && agentStyle && (
                                    <div className={`w-10 h-10 rounded-2xl ${agentStyle.color} flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-gray-200 hover:scale-105 transition-transform`}>
                                        {agentStyle.icon}
                                    </div>
                                )}

                                <div
                                    className={`max-w-[85%] md:max-w-[75%] rounded-[1.5rem] p-5 shadow-sm relative ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-md shadow-blue-200'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-md shadow-gray-100'
                                        }`}
                                >
                                    {isModel && agentStyle && (
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100/50">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest bg-clip-text text-transparent ${agentStyle.color.replace('bg-', 'bg-')}`}>
                                                {msg.agentName || agentStyle.label}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none ${!isModel ? 'prose-invert' : 'prose-stone'}`}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                    <div className={`text-[10px] mt-2 opacity-50 ${isModel ? 'text-gray-400' : 'text-blue-100'} text-right`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-10 h-10 rounded-2xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden relative group">
                                        {/* If we had a user avatar URL, we'd use it here. Defaulting to icon */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-100 group-hover:scale-110 transition-transform" />
                                        <User size={20} className="text-gray-500 relative z-10" />
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {isLoading && (
                        <div className="flex gap-4 justify-start animate-pulse">
                            <div className="w-10 h-10 rounded-2xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot size={20} className="text-gray-400" />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-[1.5rem] rounded-tl-md p-5 shadow-sm">
                                <div className="flex gap-2 items-center h-full">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </main>

            {/* Input Area */}
            <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200 p-4 md:p-6 sticky bottom-0 z-20">
                <div className="max-w-3xl mx-auto">
                    {/* Attachment Preview */}
                    {attachedDoc && (
                        <div className="mb-3 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-3 rounded-xl w-fit text-sm animate-in slide-in-from-bottom-2 border border-blue-100 shadow-sm">
                            <div className="p-2 bg-white rounded-lg">
                                <Paperclip size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-xs uppercase tracking-wider text-blue-400">Attached</span>
                                <span className="font-medium truncate max-w-[200px]">{attachedDoc.name}</span>
                            </div>
                            <button
                                onClick={() => setAttachedDoc(null)}
                                className="ml-2 hover:bg-white rounded-full p-1.5 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-3 bg-gray-50 p-2 pr-2 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all shadow-sm">
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".pdf,image/*"
                        />

                        {/* Attachment Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading || isUploading}
                            className={`p-3 rounded-xl text-gray-500 hover:bg-white hover:shadow-md transition-all active:scale-95`}
                            title="Attach Document"
                        >
                            {isUploading ? (
                                <Loader2 size={22} className="animate-spin text-blue-600" />
                            ) : (
                                <Paperclip size={22} />
                            )}
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={isUploading ? "Uploading..." : "Type your message here..."}
                            disabled={isLoading || isUploading}
                            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 px-2 py-3 text-base"
                        />
                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !attachedDoc) || isLoading || isUploading}
                            className={`p-3 rounded-xl transition-all duration-300 ${(input.trim() || attachedDoc) && !isLoading && !isUploading
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest opacity-60">
                        LoanMate AI • Powered by Gemini Flash
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default function ChatPage() {
    return (
        <React.Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50">Loading Chat...</div>}>
            <ChatContent />
        </React.Suspense>
    );
}
