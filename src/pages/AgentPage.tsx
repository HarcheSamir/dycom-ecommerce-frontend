import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaRobot, FaPaperPlane, FaMagic, FaExclamationTriangle, FaUser, FaStop } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAgent } from '../hooks/useAgent';
import { useUserProfile } from '../hooks/useUser';

const AgentPage: React.FC = () => {
    const { t } = useTranslation();
    const { messages, remaining, isLoadingHistory, isSending, sendMessage } = useAgent();
    const { data: user } = useUserProfile();

    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom behavior
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isSending]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isSending || remaining <= 0) return;

        sendMessage(input);
        setInput('');

        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative flex flex-col h-full w-full bg-[#0B0D0F]">
            {/* Added relative positioning and background to match dashboard dark theme */}

            {/* --- HEADER (Minimalist & Sticky) --- */}
            <div className="flex-shrink-0 sticky top-0 z-20 backdrop-blur-md bg-[#0B0D0F]/80 border-b border-white/5 py-4 px-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
                        <FaRobot size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                            Coach Dylan
                        </h1>
                        <p className="text-neutral-400 text-xs">Expert E-commerce & Stratégie</p>
                    </div>
                </div>

                {/* Credits / Quota */}
                <div className="hidden md:flex items-center gap-2">
                    <span className="text-xs text-neutral-500 font-medium">Messages restants</span>
                    <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-2 ${remaining > 0
                        ? 'bg-neutral-800 border-neutral-700 text-white'
                        : 'bg-red-900/20 border-red-800/50 text-red-400'
                        }`}>
                        {remaining > 0 ? (
                            <>
                                <span className={`w-2 h-2 rounded-full ${remaining > 3 ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                {remaining} / 10
                            </>
                        ) : (
                            <>
                                <FaExclamationTriangle size={12} /> 0 / 10
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MESSAGES AREA --- */}
            <div className="flex-1 overflow-y-auto px-4 md:px-0">
                <div className="max-w-3xl mx-auto py-8 space-y-8 pb-32">
                    {/* Added pb-32 to ensure last message is not hidden behind sticky input */}

                    {isLoadingHistory ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                            <span className="text-sm text-neutral-400">Chargement de la conversation...</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-6">
                                <FaMagic className="text-2xl text-neutral-600" />
                            </div>
                            <h2 className="text-2xl text-white font-bold mb-2">Comment puis-je t'aider aujourd'hui ?</h2>
                            <p className="text-neutral-400 max-w-md">
                                Je peux analyser ta boutique, te donner des idées de produits, ou t'aider à configurer tes campagnes publicitaires.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isUser = msg.role === 'user';
                            return (
                                <div key={msg.id} className={`flex gap-4 md:gap-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-1">
                                        {isUser ? (
                                            <div className="w-8 h-8 rounded-lg bg-[#2A2B32] border border-white/5 flex items-center justify-center text-neutral-300">
                                                {user?.firstName ? user.firstName[0] : <FaUser size={12} />}
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-md">
                                                <FaRobot size={14} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className={`relative max-w-[85%] md:max-w-[75%] space-y-1`}>
                                        <div className={`text-xs font-semibold mb-1 ${isUser ? 'text-right text-neutral-400' : 'text-left text-amber-500/80'}`}>
                                            {isUser ? 'Toi' : 'Dylan'}
                                        </div>
                                        <div className={`
                                            prose prose-invert prose-sm md:prose-base max-w-none leading-relaxed text-neutral-200
                                            ${isUser
                                                ? 'bg-[#2A2B32] px-4 py-3 rounded-2xl rounded-tr-sm text-white'
                                                : ''}
                                        `}>
                                            {/* Note: Assistant messages have NO background, just clean text like Claude */}
                                            {isUser ? (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            ) : (
                                                <ReactMarkdown
                                                    components={{
                                                        // Custom styling for markdown elements
                                                        p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="pl-4 mb-4 list-disc" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="pl-4 mb-4 list-decimal" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                        code: ({ node, ...props }) => <code className="bg-neutral-800 px-1 py-0.5 rounded text-amber-200 text-xs font-mono" {...props} />,
                                                        pre: ({ node, ...props }) => <div className="bg-[#16181C] p-3 rounded-lg border border-neutral-800 my-4 overflow-x-auto"><pre {...props} /></div>
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Typing Indicator */}
                    {isSending && (
                        <div className="flex gap-4 md:gap-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-md flex-shrink-0 mt-1">
                                <FaRobot size={14} />
                            </div>
                            <div className="flex items-center gap-1.5 h-8 bg-neutral-800/0 px-2">
                                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-150"></span>
                                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* --- INPUT AREA --- */}
            <div className="flex-shrink-0 sticky bottom-0 z-20 p-4 md:pb-6 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F] to-transparent">
                <div className="max-w-3xl mx-auto bg-[#1C1E22] border border-neutral-700 focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-white/10 rounded-2xl shadow-2xl flex items-end p-2 transition-all duration-200">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={remaining > 0 ? "Pose une question à Dylan..." : "Limite de messages atteinte pour aujourd'hui."}
                        disabled={remaining <= 0 || isSending}
                        className="flex-1 bg-transparent border-none text-white placeholder-neutral-500 px-4 py-3 max-h-[200px] min-h-[50px] focus:ring-0 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-600"
                        rows={1}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isSending || remaining <= 0}
                        className={`p-3 rounded-xl mb-[1px] transition-all duration-200 ${input.trim() && !isSending && remaining > 0
                            ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg'
                            : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                            }`}
                    >
                        {isSending ? <FaStop size={14} className="animate-pulse" /> : <FaPaperPlane size={16} />}
                    </button>
                </div>
                <p className="text-center text-[10px] text-neutral-500 mt-3">
                    {remaining > 0 ? (
                        "Dylan est une IA expérimentale. Vérifie toujours les informations critiques."
                    ) : (
                        "Tu as atteint ta limite de messages pour aujourd'hui, réessaie dans 24h"
                    )}
                </p>
            </div>
        </div>
    );
};

export default AgentPage;
