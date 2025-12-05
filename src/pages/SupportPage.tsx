import React from 'react';
import { FaHeadset, FaTicketAlt, FaQuestionCircle } from 'react-icons/fa';
import { GlassCard } from '../components/admin/AdminUI';

export const SupportPage = () => {

    const openChatWidget = () => {
        if (window.Tawk_API) {
            window.Tawk_API.maximize();
        } else {
            alert("Support widget is loading...");
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-white">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <FaHeadset className="text-primary" /> Support & Tickets
                </h1>
                <p className="text-neutral-400 mt-1">Need help? Choose an option below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Option 1: Live Chat / Ticket */}
                <GlassCard className="text-center py-10 hover:bg-white/5 transition-colors cursor-pointer group" >
                    <div onClick={openChatWidget} className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                            <FaTicketAlt />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Open a Ticket / Live Chat</h2>
                        <p className="text-neutral-400 mb-6 max-w-sm">
                            Chat with us directly. If we are offline, this will automatically create a support ticket that we will answer via email.
                        </p>
                        <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-light transition-colors">
                            Start Conversation
                        </button>
                    </div>
                </GlassCard>

                {/* Option 2: FAQ (Placeholder for now) */}
                <GlassCard className="text-center py-10 opacity-70">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center text-3xl mb-6">
                            <FaQuestionCircle />
                        </div>
                        <h2 className="text-2xl font-bold mb-3">Knowledge Base</h2>
                        <p className="text-neutral-400 mb-6 max-w-sm">
                            Browse tutorials and frequently asked questions to find instant answers.
                        </p>
                        <button className="px-6 py-3 bg-neutral-800 text-neutral-500 rounded-xl font-bold cursor-not-allowed">
                            Coming Soon
                        </button>
                    </div>
                </GlassCard>
            </div>
        </main>
    );
};