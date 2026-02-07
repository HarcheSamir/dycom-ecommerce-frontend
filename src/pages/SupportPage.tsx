import React, { useState, useRef } from 'react';
import { useUserTickets, useCreateTicket } from '../hooks/useSupport';
import { StatusBadge } from '../components/support/TicketUI';
import { FaPlus, FaTicketAlt, FaPaperclip, FaTimes } from 'react-icons/fa';
import { GlassCard } from '../components/GlassCard';
import { useTranslation } from 'react-i18next';

export const SupportPage = () => {
    const { t } = useTranslation();
    const { data: tickets, isLoading } = useUserTickets();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('GENERAL');
    const [message, setMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutate: createTicket, isPending } = useCreateTicket();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files].slice(0, 5)); // Max 5 files
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setSubject('');
        setCategory('GENERAL');
        setMessage('');
        setSelectedFiles([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createTicket({ subject, category, message, files: selectedFiles }, {
            onSuccess: () => {
                setIsModalOpen(false);
                resetForm();
            }
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-white">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('supportPage.title')}</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
                >
                    <FaPlus /> {t('supportPage.newTicketButton')}
                </button>
            </div>

            {isLoading ? (
                <p className="text-neutral-500">{t('supportPage.loading')}</p>
            ) : tickets?.length === 0 ? (
                <GlassCard className="text-center ">
                    <FaTicketAlt className="mx-auto text-4xl text-neutral-600 mb-4" />
                    <h3 className="text-xl font-bold">{t('supportPage.emptyState.title')}</h3>
                    <p className="text-neutral-400">{t('supportPage.emptyState.description')}</p>
                </GlassCard>
            ) : (
                <div className="grid gap-4">
                    {tickets?.map(ticket => (
                        <GlassCard
                            key={ticket.id}
                            className="hover:border-neutral-600 transition-colors cursor-pointer"
                            onClick={() => window.open(`/support/ticket/${ticket.id}?key=${ticket.accessToken}`, '_blank')}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg">{ticket.subject}</h3>
                                        <StatusBadge status={ticket.status} />
                                        <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                                            {t(`supportPage.createModal.categories.${ticket.category}`, ticket.category)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-400 truncate max-w-xl">
                                        {ticket.messages?.[0]?.content || t('supportPage.card.noPreview')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-neutral-500">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    <p className="text-xs text-neutral-600">{t('supportPage.card.idPrefix')}: {ticket.id.slice(0, 8)}</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* CREATE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1C1E22] border border-neutral-700 rounded-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4">{t('supportPage.createModal.title')}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">{t('supportPage.createModal.labels.subject')}</label>
                                <input
                                    className="w-full bg-black/30 border border-neutral-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    value={subject} onChange={e => setSubject(e.target.value)} required
                                    placeholder={t('supportPage.createModal.placeholders.subject')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">{t('supportPage.createModal.labels.category')}</label>
                                <select
                                    className="w-full bg-black/30 border border-neutral-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    value={category} onChange={e => setCategory(e.target.value)}
                                >
                                    <option value="GENERAL">{t('supportPage.createModal.categories.GENERAL')}</option>
                                    <option value="BILLING">{t('supportPage.createModal.categories.BILLING')}</option>
                                    <option value="TECHNICAL">{t('supportPage.createModal.categories.TECHNICAL')}</option>
                                    <option value="PARTNERSHIP">{t('supportPage.createModal.categories.PARTNERSHIP')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">{t('supportPage.createModal.labels.message')}</label>
                                <textarea
                                    className="w-full bg-black/30 border border-neutral-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-32"
                                    value={message} onChange={e => setMessage(e.target.value)} required
                                    placeholder={t('supportPage.createModal.placeholders.message')}
                                />
                            </div>

                            {/* File Attachment Section */}
                            <div>
                                <label className="block text-sm text-neutral-400 mb-2">
                                    {t('supportPage.createModal.labels.attachments', 'Attachments')}
                                    <span className="text-neutral-600 ml-1">({t('supportPage.createModal.labels.optional', 'optional')})</span>
                                </label>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-neutral-600 rounded-lg text-neutral-400 hover:border-neutral-500 hover:text-neutral-300 transition-colors w-full justify-center"
                                >
                                    <FaPaperclip /> {t('supportPage.createModal.buttons.attachFiles', 'Attach Files')}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.zip"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {/* Selected files preview */}
                                {selectedFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
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
                                <p className="text-xs text-neutral-600 mt-2">
                                    {t('supportPage.createModal.labels.maxFiles', 'Max 5 files, 10MB each')}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-neutral-400 hover:text-white">
                                    {t('supportPage.createModal.buttons.cancel')}
                                </button>
                                <button type="submit" disabled={isPending} className="px-6 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50">
                                    {isPending ? t('supportPage.createModal.buttons.sending') : t('supportPage.createModal.buttons.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};