
import React, { useState, useRef, useEffect, type FC } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown'; // Ensure you have this or use simple text
// If react-markdown is not installed, we can fall back to simple text for now or simple regex
// Let's assume simple text for stability first, or use a simple parser if needed. 
// For now, I'll use simple text rendering with line breaks.

type Message = {
    id: string;
    role: 'user' | 'agent';
    text: string;
    timestamp: Date;
};

export const AcademyAgentWidget: FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'intro',
            role: 'agent',
            text: "Salut ! Je suis Dylan, ton assistant IA. Je connais toute la formation par cœur. Une question ?",
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: inputText.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText("");
        setIsLoading(true);

        try {
            // Retrieve token from localStorage/Context if needed. 
            // Assuming axios interceptor or standard fetch with header handles auth if using global axios.
            // Using fetch here for simplicity.
            const token = localStorage.getItem('token'); // Adjust key as per your auth system

            const response = await fetch('/api/academy-agent/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMsg.text })
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                text: data.answer,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, agentMsg]);

        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'agent',
                text: "Désolé, j'ai eu un petit bug technique. Peux-tu reformuler ?",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <div className="pointer-events-auto w-[350px] md:w-[400px] h-[500px] bg-[#111317] border border-neutral-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-[#1C1E22] p-4 flex justify-between items-center border-b border-neutral-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg">
                                <FaRobot />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Dylan AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-xs text-neutral-400">En ligne</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-neutral-400 hover:text-white transition-colors p-2"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f1115]">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                                        ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none shadow-blue-900/20 shadow-lg'
                                            : 'bg-[#1C1E22] text-neutral-200 border border-neutral-800 rounded-bl-none'
                                        }
                                    `}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#1C1E22] border border-neutral-800 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#1C1E22] border-t border-neutral-800">
                        <div className="relative">
                            <textarea
                                ref={inputRef}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Pose ta question..."
                                className="w-full bg-[#111317] text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border border-neutral-800 resize-none h-[50px] custom-scrollbar"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputText.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </div>
                        <p className="text-[10px] text-neutral-500 text-center mt-2">
                            Dylan peut faire des erreurs. Vérifie toujours dans la formation.
                        </p>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:scale-110 transition-transform duration-300"
                >
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-[#111317]"></span>
                    <FaRobot className="text-2xl group-hover:rotate-12 transition-transform duration-300" />

                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 bg-white text-black px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block pointer-events-none">
                        Pose-moi une question !
                        <div className="absolute top-1/2 -right-1 w-2 h-2 bg-white rotate-45 -translate-y-1/2"></div>
                    </div>
                </button>
            )}
        </div>
    );
};
