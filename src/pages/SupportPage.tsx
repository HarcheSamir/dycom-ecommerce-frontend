import React from 'react';
import { FaHeadset, FaTicketAlt, FaBook, FaArrowRight, FaLightbulb, FaShieldAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export const SupportPage = () => {
    const { t } = useTranslation();

    const openChatWidget = () => {
        if (window.Tawk_API) {
            window.Tawk_API.maximize();
        } else {
            console.warn("Tawk API not ready yet");
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 text-white">
            
            {/* --- Header Section --- */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary">
                        <FaHeadset size={32} />
                    </div>
                    <span>{t('supportPage.title')}</span>
                </h1>
                <p className="text-neutral-400 text-lg ml-1">
                    {t('supportPage.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- Option 1: Active Support Card --- */}
                <button 
                    onClick={openChatWidget}
                    className="relative text-left group overflow-hidden rounded-3xl border border-neutral-800 bg-[#1C1E22] p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(127,86,217,0.15)] active:scale-[0.98]"
                >
                    {/* Background Gradient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                                <FaTicketAlt className="text-white" />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                                {t('supportPage.liveChat.badge')}
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                            {t('supportPage.liveChat.title')}
                        </h2>
                        <p className="text-neutral-400 mb-8 leading-relaxed">
                            {t('supportPage.liveChat.description')}
                        </p>

                        <div className="mt-auto flex items-center gap-2 text-white font-bold text-sm bg-white/5 border border-white/10 w-fit px-6 py-3 rounded-xl group-hover:bg-primary group-hover:border-primary transition-all">
                            <span>{t('supportPage.liveChat.button')}</span>
                            <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </button>

                {/* --- Option 2: Knowledge Base (Disabled/Coming Soon) --- */}
                <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-[#111317] p-8 opacity-75">
                    {/* Coming Soon Overlay */}
                    <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-bold uppercase tracking-wider">
                        {t('supportPage.knowledgeBase.badge')}
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-6 w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-3xl text-neutral-500">
                            <FaBook />
                        </div>

                        <h2 className="text-2xl font-bold text-neutral-300 mb-2">
                            {t('supportPage.knowledgeBase.title')}
                        </h2>
                        <p className="text-neutral-500 mb-8 leading-relaxed">
                            {t('supportPage.knowledgeBase.description')}
                        </p>

                        <div className="mt-auto flex items-center gap-2 text-neutral-500 font-bold text-sm bg-neutral-800 w-fit px-6 py-3 rounded-xl cursor-not-allowed">
                            <span>{t('supportPage.knowledgeBase.button')}</span>
                            <FaShieldAlt />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Quick Tips Section --- */}
            <section className="pt-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FaLightbulb className="text-yellow-400" /> {t('supportPage.quickTips.title')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-[#1C1E22] border border-neutral-800">
                        <h4 className="font-bold text-white mb-2">{t('supportPage.quickTips.billing.title')}</h4>
                        <p className="text-sm text-neutral-400">{t('supportPage.quickTips.billing.desc')}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[#1C1E22] border border-neutral-800">
                        <h4 className="font-bold text-white mb-2">{t('supportPage.quickTips.video.title')}</h4>
                        <p className="text-sm text-neutral-400">{t('supportPage.quickTips.video.desc')}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-[#1C1E22] border border-neutral-800">
                        <h4 className="font-bold text-white mb-2">{t('supportPage.quickTips.response.title')}</h4>
                        <p className="text-sm text-neutral-400">{t('supportPage.quickTips.response.desc')}</p>
                    </div>
                </div>
            </section>

        </main>
    );
};