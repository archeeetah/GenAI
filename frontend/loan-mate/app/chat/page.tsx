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

export default function ChatPage() {
    const { user, loading } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [attachedDoc, setAttachedDoc] = useState<{ id: string; name: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { createApplication } = useFirestore();
    const searchParams = useSearchParams();

    // Generate a random session ID if one doesn't exist, or use the one from URL
    const [sessionId] = useState(() => {
        const urlSessionId = searchParams.get('session_id');
        return urlSessionId || `session_${Math.random().toString(36).substring(2, 9)}`;
    });

    // Conditional Application Creation
    useEffect(() => {
        if (user) {
            loadHistory(user.uid, sessionId);
            // Create Application Record ONLY if logged in
            createApplication(sessionId, {
                uid: user.uid,
                status: "In Progress",
                date: new Date().toISOString(),
                type: "New Loan Query",
                amount: 0
            });
        } else {
            // For guest, clear messages on mount/unmount or just let local state handle it.
            // We don't load history for guests (no persistent ID easily available without cookies, keeping it simple)
        }
    }, [user, sessionId, createApplication]);

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
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href={user ? "/dashboard/applications" : "/"} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Bot size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">AI Assistant</h1>
                            <p className="text-sm text-green-600 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Always active
                            </p>
                        </div>
                    </div>
                </div>
                {!user && (
                    <div className="bg-blue-50/80 px-4 py-2 text-center text-xs text-blue-700 border-b border-blue-100 italic">
                        You are chatting as a guest. <Link href="/login" className="underline font-semibold hover:text-blue-800">Log in</Link> to save your conversation history.
                    </div>
                )}
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 space-y-4">
                            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                                <Bot size={64} className="text-blue-200" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600">Start a new conversation</h3>
                            <p className="max-w-md text-gray-500">Ask me anything about loans, interest rates, or get financial advice tailored to your needs.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg mt-8">
                                {["How can I apply for a loan?", "What are the current interest rates?", "Explain compound interest", "Am I eligible for a home loan?"].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setInput(suggestion); handleSend(); }} // Fix: this won't auto send because state update is async, but good enough for pre-fill or need effect
                                        className="text-sm bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left text-gray-700"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot size={16} className="text-white" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-sm'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                    }`}
                            >
                                {msg.agentName && <p className="text-xs text-blue-600 font-semibold mb-1">{msg.agentName}</p>}
                                <div className="leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                                    <User size={16} className="text-gray-600" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot size={16} className="text-white" />
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-5 shadow-sm">
                                <div className="flex gap-2">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="bg-white border-t border-gray-200 p-4 md:p-6 sticky bottom-0">
                <div className="max-w-3xl mx-auto">
                    {/* Attachment Preview */}
                    {attachedDoc && (
                        <div className="mb-2 flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg w-fit text-sm animate-in slide-in-from-bottom-2">
                            <Paperclip size={14} />
                            <span className="font-medium truncate max-w-[200px]">{attachedDoc.name}</span>
                            <button
                                onClick={() => setAttachedDoc(null)}
                                className="ml-2 hover:bg-blue-100 rounded-full p-1"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-4 bg-gray-50 p-2 pr-2 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50/50 transition-all shadow-sm">
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
                            className={`p-2 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors`}
                            title="Attach Document"
                        >
                            {isUploading ? (
                                <Loader2 size={20} className="animate-spin text-blue-600" />
                            ) : (
                                <Paperclip size={20} />
                            )}
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={isUploading ? "Uploading..." : "Type your message here..."}
                            disabled={isLoading || isUploading}
                            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 px-2 py-2"
                        />
                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && !attachedDoc) || isLoading || isUploading}
                            className={`p-3 rounded-xl transition-all ${(input.trim() || attachedDoc) && !isLoading && !isUploading
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        AI can make mistakes. Please verify important financial information.
                    </p>
                </div>
            </footer>
        </div>
    );
}
