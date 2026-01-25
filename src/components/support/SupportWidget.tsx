import React, { useState, useEffect } from 'react'; // <--- Import useEffect
import { useLocation } from 'react-router-dom';
import { FaCommentAlt, FaTimes, FaPaperPlane, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { useTranslation, Trans } from 'react-i18next';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

export const SupportWidget = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const { user } = useAuth();

    // --- RTL DETECTION ---
    const isRtl = i18n.language === 'ar';

    // --- STATE ---
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'form' | 'sending' | 'success'>('form');
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    // --- 1. AUTO-FILL LOGIC (THE FIX) ---
    useEffect(() => {
        if (user) {
            setName(`${user.firstName} ${user.lastName}`);
            setEmail(user.email);
        }
    }, [user]);

    // --- VISIBILITY LOGIC ---
    const isTicketViewer = location.pathname.startsWith('/support/ticket');
    const isAdmin = user?.accountType === 'ADMIN';

    if (isTicketViewer || isAdmin) return null;

    // --- HANDLERS ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('sending');
        setError(null);

        try {
            await apiClient.post('/support/public/create', {
                name,
                email,
                subject: subject || t('supportWidget.form.defaultSubject'),
                message,
                category: 'GENERAL'
            });
            setStep('success');
            // Reset form (keep name/email if logged in)
            if (!user) {
                setName('');
                setEmail('');
            }
            setSubject('');
            setMessage('');
        } catch (err) {
            console.error(err);
            setError(t('supportWidget.form.error'));
            setStep('form');
        }
    };

    return (
        <div className={`fixed bottom-6 z-50 flex flex-col gap-4 font-sans ${isRtl ? 'left-6 items-start' : 'right-6 items-end'}`}>

            {/* --- THE POPUP WINDOW --- */}
            {isOpen && (
                <div className={`
                    w-[360px] max-w-[90vw] bg-[#111317] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden
                    transition-all duration-300 ease-out
                    ${isRtl ? 'origin-bottom-left' : 'origin-bottom-right'}
                    ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'}
                `}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-5">
                        <h3 className="text-white font-bold text-lg">{t('supportWidget.header.title')}</h3>
                        <p className="text-white/80 text-xs mt-1">
                            {t('supportWidget.header.subtitle')}
                        </p>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 bg-[#1C1E22]">

                        {step === 'success' ? (
                            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4 animate-[fade-in_0.5s]">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                                    <FaCheckCircle size={32} />
                                </div>
                                <h4 className="text-white font-bold text-lg">{t('supportWidget.success.title')}</h4>
                                <p className="text-neutral-400 text-sm">
                                    <Trans
                                        i18nKey="supportWidget.success.description"
                                        values={{ email }}
                                        components={{ 1: <strong /> }}
                                    />
                                    <br />{t('supportWidget.success.instruction')}
                                </p>
                                <button
                                    onClick={() => { setIsOpen(false); setTimeout(() => setStep('form'), 300); }}
                                    className="mt-4 text-sm text-neutral-300 hover:text-white underline"
                                >
                                    {t('supportWidget.success.close')}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {error && <p className="text-red-400 text-xs bg-red-900/20 p-2 rounded">{error}</p>}

                                {/* --- 2. HIDE FIELDS IF USER IS LOGGED IN --- */}
                                {!user && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            className="w-full bg-black/40 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder={t('supportWidget.form.placeholders.name')}
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                        />
                                        <input
                                            className="w-full bg-black/40 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:border-purple-500 outline-none transition-colors"
                                            placeholder={t('supportWidget.form.placeholders.email')}
                                            type="email"
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </div>
                                )}

                                <input
                                    className="w-full bg-black/40 border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:border-purple-500 outline-none transition-colors"
                                    placeholder={t('supportWidget.form.placeholders.subject')}
                                    required
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                />

                                <textarea
                                    className="w-full bg-black/40 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:border-purple-500 outline-none transition-colors resize-none h-24"
                                    placeholder={t('supportWidget.form.placeholders.message')}
                                    required
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />

                                <button
                                    type="submit"
                                    disabled={step === 'sending'}
                                    className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {step === 'sending' ? <FaSpinner className="animate-spin" /> : <><FaPaperPlane /> {t('supportWidget.form.submit')}</>}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="bg-[#111317] p-2 text-center border-t border-neutral-800">
                        <p className="text-[10px] text-neutral-600">{t('supportWidget.footer')}</p>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-14 h-14 cursor-pointer rounded-full shadow-2xl flex items-center justify-center text-white text-2xl transition-all duration-300
                    hover:scale-110 active:scale-95
                    ${isOpen ? 'bg-neutral-800 rotate-90' : 'bg-gradient-to-tr from-purple-600 to-blue-600 animate-[pulse-glow_3s_infinite]'}
                `}
            >
                {isOpen ? <FaTimes /> : <FaCommentAlt />}
            </button>
        </div>
    );
};