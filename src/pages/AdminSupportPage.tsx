import React, { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminTickets, useTicketDetails, useAdminReply, useEditMessage, useDeleteMessage } from '../hooks/useSupport';
import type { Ticket } from '../hooks/useSupport';
import { StatusBadge, MessageBubble } from '../components/support/TicketUI';
import { FaExternalLinkAlt, FaPaperPlane, FaLock, FaCheckCircle, FaInbox, FaUser, FaPaperclip, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AdminSupportPage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [reply, setReply] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: ticketPages, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminTickets(statusFilter);
    const { data: activeTicket } = useTicketDetails(selectedTicketId);
    const { mutate: sendReply, isPending } = useAdminReply();
    const { mutate: editMessage, isPending: isEditPending } = useEditMessage();
    const { mutate: deleteMessage, isPending: isDeletePending } = useDeleteMessage();

    // Flatten pages into a single list of tickets
    const ticketList = ticketPages?.pages.flatMap(page => page.data) || [];

    const handleEditMessage = (messageId: string, content: string) => {
        if (!selectedTicketId) return;
        editMessage({ messageId, content, ticketId: selectedTicketId });
    };

    const handleDeleteMessage = (messageId: string) => {
        if (!selectedTicketId) return;
        deleteMessage({ messageId, ticketId: selectedTicketId });
    };

    const handleSelectTicket = (ticketId: string) => {
        setSelectedTicketId(ticketId);
        // Optimistically clear the unread badge immediately
        queryClient.setQueryData(['adminTickets', statusFilter], (old: any) => {
            if (!old) return old;
            return {
                ...old,
                pages: old.pages.map((page: any) => ({
                    ...page,
                    data: page.data.map((t: Ticket) => t.id === ticketId ? { ...t, adminUnread: false } : t)
                }))
            };
        });
    };

    const handleGoToProfile = (e: React.MouseEvent, userId?: string | null) => {
        if (!userId) return;
        e.stopPropagation();
        navigate(`/dashboard/admin/users/${userId}`);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicketId || !reply.trim()) return;
        sendReply({
            ticketId: selectedTicketId,
            message: reply,
            isInternal,
            newStatus: isInternal ? undefined : 'IN_PROGRESS',
            files: isInternal ? undefined : selectedFiles
        }, {
            onSuccess: () => {
                setReply('');
                setSelectedFiles([]);
            }
        });
    };

    const markSolved = () => {
        if (!selectedTicketId) return;
        sendReply({
            ticketId: selectedTicketId,
            message: t('adminSupportPage.details.systemResolvedMessage'),
            isInternal: true,
            newStatus: 'RESOLVED'
        });
    };

    const formatTimeDisplay = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

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
                                {t(`adminSupportPage.filter.${status}`, status) as string}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {ticketList.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => handleSelectTicket(ticket.id)}
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
                            <h4 className="text-sm font-semibold text-white mb-1 truncate flex items-center gap-2">
                                {ticket.adminUnread && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" title={t('adminSupportPage.card.unread', 'New message')} />
                                )}
                                {ticket.subject}
                            </h4>
                            {ticket.messages?.[0] && (
                                <p className="text-xs text-neutral-500 truncate mb-2">
                                    <span className="text-neutral-600">{ticket.messages[0].senderType === 'ADMIN' ? t('adminSupportPage.card.you', 'You') : ticket.guestName?.split(' ')[0]}:</span>{' '}
                                    {ticket.messages[0].content.slice(0, 80)}{ticket.messages[0].content.length > 80 ? '...' : ''}
                                </p>
                            )}
                            <div className="flex gap-2 mt-2">
                                <StatusBadge status={ticket.status} />
                                <span className="px-2 py-1 text-[10px] rounded bg-neutral-800 text-neutral-400">
                                    {t(`supportPage.createModal.categories.${ticket.category}`, ticket.category) as string}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Load More Button */}
                    {hasNextPage && (
                        <div className="p-4 text-center">
                            <button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {isFetchingNextPage ? t('common.loading', 'Loading...') : t('common.loadMore', 'Load More')}
                            </button>
                        </div>
                    )}
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
                            {[...(activeTicket.messages || [])].reverse().map(msg => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    isSelf={msg.senderType === 'ADMIN' || msg.senderType === 'SYSTEM'}
                                    ticketId={selectedTicketId || undefined}
                                    onEdit={handleEditMessage}
                                    onDelete={handleDeleteMessage}
                                    isEditPending={isEditPending}
                                    isDeletePending={isDeletePending}
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

                                    {/* File attachment button - hidden for internal notes */}
                                    {!isInternal && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-3 py-1 rounded text-xs font-bold text-neutral-500 hover:text-neutral-300 transition-colors"
                                        >
                                            <FaPaperclip size={10} /> Attach Files
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.zip"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                {/* Selected files preview */}
                                {selectedFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center gap-2 px-3 py-1 bg-neutral-800 rounded-lg text-sm">
                                                <FaPaperclip className="text-neutral-500" />
                                                <span className="truncate max-w-32">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="text-neutral-500 hover:text-red-400"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

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