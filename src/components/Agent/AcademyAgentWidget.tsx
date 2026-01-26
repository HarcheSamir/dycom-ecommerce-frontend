import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaMagic } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { agentService } from '../../services/agent.service';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const AcademyAgentWidget = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- RTL DETECTION ---
    const isRtl = i18n.language === 'ar';

    // --- STATE ---
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "👋 Bonjour! Je suis Dylan, ton coach E-commerce. Comment puis-je t'aider aujourd'hui ?",
            timestamp: new Date()
        }
    ]);

    // --- AUTO SCROLL ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // --- VISIBILITY ---
    // Only show for logged in users
    if (!user) return null;

    // --- HANDLERS ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await agentService.sendMessage(userMsg.content);

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error: any) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: error.message || "Désolé, j'ai eu un petit bug technique. Peux-tu reformuler ?",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Positioned at bottom-24 (above the SupportWidget which is bottom-6)
        <div className={`fixed bottom-24 z-50 flex flex-col gap-4 font-sans ${isRtl ? 'left-6 items-start' : 'right-6 items-end'}`}>

            {/* --- CHAT WINDOW --- */}
            {isOpen && (
                <div className={`
          w-[380px] max-w-[90vw] h-[500px] max-h-[70vh] bg-[#111317] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col
          transition-all duration-300 ease-out
          ${isRtl ? 'origin-bottom-left' : 'origin-bottom-right'}
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'}
        `}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-700 to-orange-900 p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-amber-200 backdrop-blur-sm">
                                <FaRobot size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-md flex items-center gap-2">
                                    Coach Dylan <FaMagic className="text-amber-300 text-xs" />
                                </h3>
                                <p className="text-white/70 text-[10px] uppercase tracking-wider">Expert E-commerce</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/60 hover:text-white transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-neutral-800">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                  max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed
                  ${msg.role === 'user'
                                        ? 'bg-neutral-800 text-white rounded-br-none'
                                        : 'bg-gradient-to-br from-amber-900/40 to-neutral-900 border border-amber-900/30 text-neutral-200 rounded-bl-none'
                                    }
                `}>
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 flex gap-2 items-center text-neutral-500 text-xs">
                                    <FaSpinner className="animate-spin text-amber-500" /> Dylan réfléchit...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-3 bg-[#111317] border-t border-neutral-800 shrink-0">
                        <div className="relative">
                            <input
                                className="w-full bg-black/40 border border-neutral-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-neutral-600"
                                placeholder="Pose-moi une question sur ton business..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-amber-500 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-amber-500 transition-colors"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </div>
                    </form>

                </div>
            )}

            {/* --- FAB BUTTON --- */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-14 h-14 cursor-pointer rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transition-all duration-300
          hover:scale-110 active:scale-95 border border-amber-500/20
          ${isOpen ? 'bg-neutral-800 rotate-90' : 'bg-gradient-to-br from-amber-600 to-orange-700 hover:shadow-amber-900/50'}
        `}
            >
                {isOpen ? <FaTimes /> : <FaRobot />}
            </button>
        </div>
    );
};
