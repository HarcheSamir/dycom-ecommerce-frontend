import React, { useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useGuestTicket, useGuestReply } from '../hooks/useSupport';
import { MessageBubble, StatusBadge } from '../components/support/TicketUI';
import { FaPaperPlane, FaPaperclip, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export const GuestTicketPage = () => {
    const { t } = useTranslation();
    const { ticketId } = useParams<{ ticketId: string }>();
    const [searchParams] = useSearchParams();
    const accessKey = searchParams.get('key');
    const [reply, setReply] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: ticket, isLoading, isError } = useGuestTicket(ticketId!, accessKey!);
    const { mutate: sendReply, isPending } = useGuestReply();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketId || !accessKey || !reply.trim()) return;
        sendReply({ ticketId, key: accessKey, message: reply, files: selectedFiles }, {
            onSuccess: () => {
                setReply('');
                setSelectedFiles([]);
            }
        });
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">{t('guestTicketPage.loading')}</div>;
    if (isError || !ticket) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">{t('guestTicketPage.error')}</div>;

    return (
        <div className="h-screen bg-[#111317] text-white flex flex-col">
            <header className="p-6 border-b border-neutral-800 bg-[#16181c] flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold">{ticket.subject}</h1>
                    <p className="text-sm text-neutral-400">{t('guestTicketPage.ticketId')}: {ticket.id.slice(0, 8)}</p>
                </div>
                <StatusBadge status={ticket.status} />
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col-reverse gap-4">
                {[...(ticket.messages || [])].reverse().map(msg => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isSelf={msg.senderType === 'GUEST' || msg.senderType === 'USER'}
                    />
                ))}
            </main>

            <div className="p-4 bg-[#16181c] border-t border-neutral-800">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSend} className="space-y-3">
                        {/* File attachment controls */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-1.5 text-neutral-500 hover:text-neutral-300 transition-colors text-sm"
                            >
                                <FaPaperclip /> {t('guestTicketPage.attachFiles', 'Attach Files')}
                            </button>
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
                                    <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 rounded-lg text-sm">
                                        <FaPaperclip className="text-neutral-500" />
                                        <span className="truncate max-w-32">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-neutral-500 hover:text-red-400 transition-colors"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative">
                            <textarea
                                className="w-full bg-black border border-neutral-700 rounded-xl p-4 pr-14 text-white outline-none focus:border-blue-500 transition-colors resize-none"
                                rows={3}
                                placeholder={t('guestTicketPage.placeholder')}
                                value={reply}
                                onChange={e => setReply(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={isPending || !reply.trim()}
                                className="absolute bottom-4 right-4 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50"
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};