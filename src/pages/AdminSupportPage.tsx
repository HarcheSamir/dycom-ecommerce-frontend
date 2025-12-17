import React, { useState } from 'react';
import { useAdminTickets, useTicketDetails, useAdminReply } from '../hooks/useSupport';
import { StatusBadge, MessageBubble } from '../components/support/TicketUI';
import { FaExternalLinkAlt, FaPaperPlane, FaLock, FaCheckCircle, FaInbox, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import hook

export const AdminSupportPage = () => {
    const { t, i18n } = useTranslation(); // Initialize hook
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [reply, setReply] = useState('');
    const [isInternal, setIsInternal] = useState(false);

    const { data: ticketList } = useAdminTickets(statusFilter);
    const { data: activeTicket } = useTicketDetails(selectedTicketId);
    const { mutate: sendReply, isPending } = useAdminReply();

    const handleGoToProfile = (e: React.MouseEvent, userId?: string | null) => {
        if (!userId) return;
        e.stopPropagation(); // Prevent opening the ticket if clicked in the list
        navigate(`/dashboard/admin/users/${userId}`);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicketId || !reply.trim()) return;
        sendReply({
            ticketId: selectedTicketId,
            message: reply,
            isInternal,
            newStatus: isInternal ? undefined : 'IN_PROGRESS' // Auto update status on public reply
        }, {
            onSuccess: () => setReply('')
        });
    };

    const markSolved = () => {
        if (!selectedTicketId) return;
        sendReply({
            ticketId: selectedTicketId,
            message: t('adminSupportPage.details.systemResolvedMessage'), // Translated system message
            isInternal: true,
            newStatus: 'RESOLVED'
        });
    };

    // Helper to format date professionally with translations
    const formatTimeDisplay = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        // Standard format: "Dec 17, 14:30"
        const localeCode = i18n.language === 'ar' ? 'ar-EG' : (i18n.language === 'fr' ? 'fr-FR' : 'en-US');
        const absolute = date.toLocaleDateString(localeCode, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        if (diffMins < 1) return <span className="text-blue-400 font-bold">{t('adminSupportPage.time.justNow')}</span>;
        if (diffMins < 60) return <span className="text-blue-400 font-bold">{t('adminSupportPage.time.minutesAgo', { count: diffMins })}</span>;
        if (diffHours < 24) return <span>{absolute} <span className="opacity-60">({t('adminSupportPage.time.hoursAgo', { count: diffHours })})</span></span>;

        return <span>{absolute}</span>;
    };

    return (
        <main className="flex h-screen overflow-hidden bg-[#111317]">

            {/* LEFT PANEL: Ticket List */}
            <div className="w-1/3 border-r border-neutral-800 flex flex-col bg-[#16181c]">
                <div className="p-4 border-b border-neutral-800">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FaInbox /> {t('adminSupportPage.inbox')}
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${statusFilter === status
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-transparent border-neutral-700 text-neutral-400 hover:border-neutral-500'
                                    }`}
                            >
                                {t(`adminSupportPage.filter.${status}`, status)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {ticketList?.data.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicketId(ticket.id)}
                            className={`p-4 border-b border-neutral-800 cursor-pointer transition-colors hover:bg-white/5 ${selectedTicketId === ticket.id ? 'bg-blue-900/10 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span
                                    onClick={(e) => handleGoToProfile(e, ticket.userId)}
                                    className={`font-bold text-sm flex items-center gap-1 ${selectedTicketId === ticket.id ? 'text-white' : 'text-neutral-300'
                                        } ${ticket.userId ? 'hover:text-blue-400 hover:underline z-10' : ''}`}
                                    title={ticket.userId ? t('adminSupportPage.card.viewProfile') : t('adminSupportPage.card.guestUser')}
                                >
                                    {ticket.guestName || t('adminSupportPage.card.unknown')}
                                    {ticket.userId && <FaExternalLinkAlt size={10} className="opacity-50" />}
                                </span>
                                <span className="text-[10px] text-neutral-500 whitespace-nowrap ml-2">
                                    {formatTimeDisplay(ticket.createdAt)}
                                </span>
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1 truncate">{ticket.subject}</h4>
                            <div className="flex gap-2 mt-2">
                                <StatusBadge status={ticket.status} />
                                <span className="px-2 py-1 text-[10px] rounded bg-neutral-800 text-neutral-400">
                                    {/* Try to translate category if possible, else show raw */}
                                    {t(`supportPage.createModal.categories.${ticket.category}`, ticket.category)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL: Conversation */}
            <div className="flex-1 flex flex-col bg-[#111317]">
                {activeTicket ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-[#16181c]">
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    {activeTicket.subject}
                                    <span className="text-sm font-normal text-neutral-400">#{activeTicket.id.slice(0, 8)}</span>
                                </h2>
                                <p className="text-xs text-neutral-400 flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1"><FaUser /> {activeTicket.guestEmail}</span>
                                    <span>{t('adminSupportPage.details.plan')}: {activeTicket.user?.subscriptionStatus || t('adminSupportPage.details.guest')}</span>
                                </p>
                            </div>
                            <button onClick={markSolved} className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/50 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-600/30">
                                <FaCheckCircle /> {t('adminSupportPage.details.markSolved')}
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col-reverse">
                            {/* Reverse mapping for chat-like scroll from bottom */}
                            {[...(activeTicket.messages || [])].reverse().map(msg => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    isSelf={msg.senderType === 'ADMIN' || msg.senderType === 'SYSTEM'}
                                />
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-neutral-800 bg-[#16181c]">
                            <form onSubmit={handleSend} className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <label className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded text-xs font-bold transition-colors ${isInternal ? 'bg-yellow-500/20 text-yellow-400' : 'text-neutral-500 hover:text-neutral-300'}`}>
                                        <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="hidden" />
                                        <FaLock size={10} /> {t('adminSupportPage.reply.privateNote')}
                                    </label>
                                </div>
                                <div className="relative">
                                    <textarea
                                        className={`w-full rounded-xl p-4 pr-12 text-white outline-none focus:ring-2 resize-none ${isInternal ? 'bg-yellow-900/10 border border-yellow-700/30 focus:ring-yellow-500/50' : 'bg-black border border-neutral-700 focus:ring-blue-500/50'}`}
                                        rows={3}
                                        placeholder={isInternal ? t('adminSupportPage.reply.placeholderInternal') : t('adminSupportPage.reply.placeholderPublic')}
                                        value={reply}
                                        onChange={e => setReply(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e); }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isPending || !reply.trim()}
                                        className="absolute bottom-3 right-3 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50"
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                        <FaInbox className="text-6xl mb-4 opacity-20" />
                        <p>{t('adminSupportPage.details.emptyState')}</p>
                    </div>
                )}
            </div>
        </main>
    );
};