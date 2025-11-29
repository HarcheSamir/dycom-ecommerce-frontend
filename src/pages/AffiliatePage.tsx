// src/pages/AffiliatePage.tsx
import React, { type FC } from 'react';
import { useAffiliateDashboard } from '../hooks/useAffiliate';
import { FaLink, FaUsers, FaCheckCircle, FaExclamationCircle, FaCopy, FaTicketAlt } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Reusable Glass Card Component
const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

// Reusable Stat Card Component
const StatCard: FC<{ icon: React.ReactNode; value: string | number; label: string }> = ({ icon, value, label }) => (
    <GlassCard padding="p-5">
        <div className="bg-[#1C1E22] border border-neutral-700 w-10 h-10 flex items-center justify-center rounded-xl text-neutral-400 mb-4">{icon}</div>
        <p className="text-4xl font-bold text-white mt-4">{value}</p>
        <p className="text-neutral-400 text-sm mt-1">{label}</p>
    </GlassCard>
);

export const AffiliatePage: FC = () => {
    const { t, i18n } = useTranslation();
    const { data, isLoading, error } = useAffiliateDashboard();

    const dateLocale = i18n.language === 'fr' ? 'fr-FR' : 'en-GB';

    const handleCopyLink = () => {
        if (data?.referralLink) {
            navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${data.referralLink}`);
            toast.success(t('toasts.linkCopiedSuccess'));
        }
    };

    if (isLoading) {
        return <main className="flex-1 p-6 md:p-8"><p className="text-center text-neutral-400">{t('affiliatePage.loading')}</p></main>;
    }

    if (error) {
        return (
            <main className="flex-1 p-6 md:p-8 flex items-center justify-center">
                <GlassCard className="text-center max-w-md">
                    <FaExclamationCircle className="text-yellow-500 text-5xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white">{t('affiliatePage.error.title')}</h2>
                    <p className="text-neutral-400 mt-2">{(error as any).response?.data.message || t('affiliatePage.error.generic')}</p>
                </GlassCard>
            </main>
        );
    }

    return (
        <>
            <Toaster position="bottom-right" />
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
                <div>
                    <h1 className="text-4xl font-bold text-white">{t('affiliatePage.title')}</h1>
                    <p className="text-neutral-400 mt-1">{t('affiliatePage.subtitle', 'Track your referrals and earned discounts.')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard icon={<FaUsers />} value={data?.stats.totalReferrals.toString() || '0'} label={t('affiliatePage.stats.signups')} />
                    <StatCard icon={<FaCheckCircle />} value={data?.stats.paidReferrals.toString() || '0'} label={t('affiliatePage.stats.activeSubscribers', 'Paying Referrals')} />
                    <StatCard icon={<FaTicketAlt />} value={data?.stats.availableDiscounts.toString() || '0'} label={t('affiliatePage.stats.availableDiscounts', 'Available Discounts')} />
                </div>

                <GlassCard>
                    <div className="w-full rounded-2xl p-5 bg-gradient-to-r from-purple-900/30 via-purple-800/20 to-purple-900/30 shadow-lg">
                        <p className="text-neutral-300 text-sm">{t('affiliatePage.referralLink.title')}</p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mt-3">
                            <div className="relative flex-grow w-full">
                                <FaLink className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/signup?ref=${data?.referralLink ?? ''}`}
                                    className={"w-full rounded-xl h-12 pl-11 pr-4 text-white placeholder:text-neutral-400 bg-[rgba(0,0,0,0.25)] border border-neutral-700/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-sm"}
                                />
                            </div>
                            <button onClick={handleCopyLink} className="flex-shrink-0 cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-5 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition">
                                <FaCopy /> {t('affiliatePage.referralLink.copyButton')}
                            </button>
                        </div>
                        <p className="text-neutral-400 text-xs mt-3">
                            {t('settingsPage.affiliate.how')}{ data?.discountPercentage}%{t('settingsPage.affiliate.how2')}
                        </p>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-4">{t('affiliatePage.referrals.title')}</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                                <tr className="border-b border-neutral-800">
                                    <th className="p-4 text-sm font-semibold text-neutral-400">{t('affiliatePage.referrals.table.name')}</th>
                                    <th className="p-4 text-sm font-semibold text-neutral-400">{t('affiliatePage.referrals.table.signupDate')}</th>
                                    <th className="p-4 text-sm font-semibold text-neutral-400 text-right">{t('affiliatePage.referrals.table.paymentStatus')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.referredUsers.map(user => (
                                    <tr key={user.id} className="border-b border-neutral-800 last:border-b-0">
                                        <td className="p-4 text-white font-medium">{user.name}</td>
                                        <td className="p-4 text-neutral-300">{new Date(user.signedUpAt).toLocaleDateString(dateLocale)}</td>
                                        <td className="p-4 text-right">
                                            {user.hasPaid
                                                ? <span className="text-xs font-semibold text-green-400 bg-green-900/50 px-3 py-1 rounded-full">{t('affiliatePage.referrals.status.paid')}</span>
                                                : <span className="text-xs font-semibold text-yellow-500 bg-yellow-900/50 px-3 py-1 rounded-full">{t('affiliatePage.referrals.status.pending')}</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!data || data.referredUsers.length === 0) && <p className="text-center text-neutral-500 py-8">{t('affiliatePage.referrals.noReferrals')}</p>}
                    </div>
                </GlassCard>
            </main>
        </>
    );
};