// src/pages/AdminFinancialsPage.tsx

import React, { useState } from 'react';
import { useStripeFinancialStats, useStripeCustomers, type StripeCustomer } from '../hooks/useAdminStripe';
import { FaEuroSign, FaUsers, FaCreditCard, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// Reusable Stat Card
// FIX 1: Changed 'right-4' to 'end-4' so the icon moves to the left in Arabic
const FinancialCard: React.FC<{ title: string; value: string; subValue?: string; icon: React.ReactNode; color?: string }> = ({ title, value, subValue, icon, color = "text-white" }) => (
    <div className="bg-[#1C1E22] border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
        <div className={`absolute top-4 end-4 opacity-20 text-4xl ${color} rtl:left-4 ltr:right-4`}>{icon}</div>
        <p className="text-neutral-400 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        {subValue && <p className="text-neutral-500 text-xs mt-1">{subValue}</p>}
    </div>
);

// Status Badge Helper
const StatusBadge = ({ status }: { status: string }) => {
    const { t } = useTranslation();

    const styles: { [key: string]: string } = {
        active: 'bg-green-900/30 text-green-400 border-green-500/30',
        succeeded: 'bg-purple-900/30 text-purple-400 border-purple-500/30', // Lifetime
        trialing: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
        past_due: 'bg-red-900/30 text-red-400 border-red-500/30',
        canceled: 'bg-neutral-800 text-neutral-400 border-neutral-600',
        unpaid: 'bg-red-900/30 text-red-400 border-red-500/30',
    };
    const defaultStyle = 'bg-neutral-800 text-white';

    let label = '';
    if (status === 'succeeded') label = t('adminFinancials.status.lifetime');
    else if (status === 'active') label = t('adminFinancials.status.active');
    else if (status === 'past_due') label = t('adminFinancials.status.past_due');
    else if (status === 'trialing') label = t('adminFinancials.status.trialing');
    else if (status === 'canceled') label = t('adminFinancials.status.canceled');
    else if (status === 'unpaid') label = t('adminFinancials.status.unpaid');
    else label = status;

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || defaultStyle} uppercase tracking-wider`}>
            {label}
        </span>
    );
};

export const AdminFinancialsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { data: stats, isLoading: statsLoading } = useStripeFinancialStats();

    // Determine direction for conditional icons
    const isRtl = i18n.language === 'ar';
    const currentLocale = i18n.language === 'fr' ? 'fr-FR' : (isRtl ? 'ar-AE' : 'en-US');

    // Pagination State
    const [cursor, setCursor] = useState<{ startingAfter?: string; endingBefore?: string }>({});
    const [pageHistory, setPageHistory] = useState<string[]>([]);

    const { data: customersData, isLoading: customersLoading } = useStripeCustomers(20, cursor.startingAfter, cursor.endingBefore);

    const handleNext = () => {
        if (customersData?.last_id) {
            setPageHistory(prev => [...prev, customersData.first_id!]);
            setCursor({ startingAfter: customersData.last_id, endingBefore: undefined });
        }
    };

    const handlePrev = () => {
        if (pageHistory.length > 0) {
            const prevId = pageHistory[pageHistory.length - 1]; 
            const newHistory = pageHistory.slice(0, -1);
            setPageHistory(newHistory);
            if (customersData?.first_id) {
                 setCursor({ endingBefore: customersData.first_id, startingAfter: undefined });
            }
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat(currentLocale, { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#111317] min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FaEuroSign className="text-green-400" /> {t('adminFinancials.title')}
                </h1>
                <p className="text-neutral-400 mt-1">{t('adminFinancials.subtitle')}</p>
            </div>

            {/* --- STATS ROW --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinancialCard
                    title={t('adminFinancials.stats.available')}
                    value={stats ? formatCurrency(stats.balance.available * 100, stats.balance.currency) : '...'}
                    subValue={t('adminFinancials.stats.availableSub')}
                    icon={<FaEuroSign />}
                    color="text-white"
                />
                <FinancialCard
                    title={t('adminFinancials.stats.pending')}
                    value={stats ? formatCurrency(stats.balance.pending * 100, stats.balance.currency) : '...'}
                    subValue={t('adminFinancials.stats.pendingSub')}
                    icon={<FaCreditCard />}
                    color="text-neutral-400"
                />
                <FinancialCard
                    title={t('adminFinancials.stats.active')}
                    value={stats ? stats.subscribers.active.toString() : '...'}
                    subValue={t('adminFinancials.stats.activeSub')}
                    icon={<FaUsers />}
                    color="text-green-400"
                />
                <FinancialCard
                    title={t('adminFinancials.stats.risk')}
                    value={stats ? stats.subscribers.past_due.toString() : '...'}
                    subValue={t('adminFinancials.stats.riskSub')}
                    icon={<FaExclamationTriangle />}
                    color="text-red-400"
                />
            </div>

            {/* --- CUSTOMERS TABLE --- */}
            <div className="bg-[#1C1E22] border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{t('adminFinancials.explorer.title')}</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={pageHistory.length === 0 || customersLoading}
                            className="px-4 py-2 bg-neutral-800 rounded-lg text-white hover:bg-neutral-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {/* FIX 2: Flip Icons for RTL */}
                            {isRtl ? <FaChevronRight /> : <FaChevronLeft />} 
                            {t('adminFinancials.explorer.prev')}
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!customersData?.has_more || customersLoading}
                            className="px-4 py-2 bg-neutral-800 rounded-lg text-white hover:bg-neutral-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {t('adminFinancials.explorer.next')} 
                            {isRtl ? <FaChevronLeft /> : <FaChevronRight />}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {/* FIX 3: Changed 'text-left' to 'text-start' for proper RTL alignment */}
                    <table className="w-full text-start">
                        <thead className="bg-neutral-900/50 text-neutral-400 text-sm">
                            <tr>
                                <th className="p-4 text-start">{t('adminFinancials.table.customer')}</th>
                                <th className="p-4 text-start">{t('adminFinancials.table.status')}</th>
                                <th className="p-4 text-start">{t('adminFinancials.table.plan')}</th>
                                <th className="p-4 text-start">{t('adminFinancials.table.card')}</th>
                                <th className="p-4 text-start">{t('adminFinancials.table.billing')}</th>
                                <th className="p-4 text-start">{t('adminFinancials.table.created')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {customersLoading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-neutral-500">{t('adminFinancials.table.loading')}</td></tr>
                            ) : customersData?.data.map((c: StripeCustomer) => (
                                <tr key={c.id} className="hover:bg-neutral-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-semibold text-white">{c.name || t('adminFinancials.table.unknown')}</div>
                                        <div className="text-xs text-neutral-500">{c.email}</div>
                                        <div className="text-[10px] text-neutral-600 font-mono mt-1">{c.id}</div>
                                    </td>
                                    <td className="p-4">
                                        {c.subscription ? (
                                            <StatusBadge status={c.subscription.status} />
                                        ) : (
                                            <span className="text-neutral-500 text-sm">{t('adminFinancials.status.prospect')}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {c.subscription ? (
                                            <div className="flex flex-col">
                                                <div className="text-white font-medium flex items-center gap-1">
                                                    {formatCurrency(c.subscription.amount, c.subscription.currency)}
                                                    {c.subscription.interval === 'lifetime' ? (
                                                        <span className="text-purple-400 text-xs"> ({t('adminFinancials.status.oneTime')})</span>
                                                    ) : (
                                                        <span className="text-neutral-500 text-xs"> / {c.subscription.interval}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-neutral-500">-</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {c.card ? (
                                            <div className="flex items-center gap-2 text-sm text-neutral-300">
                                                <FaCreditCard />
                                                <span className="capitalize">{c.card.brand}</span> •••• {c.card.last4}
                                                <span className={`text-xs ml-1 ${
                                                    c.card.exp_year < new Date().getFullYear() ? 'text-red-500' : 'text-neutral-500'
                                                }`}>
                                                    ({c.card.exp_month}/{c.card.exp_year.toString().slice(-2)})
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-neutral-600 text-xs">{t('adminFinancials.table.noCard')}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-neutral-400">
                                        {c.subscription?.current_period_end ? (
                                            new Date(Number(c.subscription.current_period_end) * 1000).toLocaleDateString(currentLocale)
                                        ) : (c.subscription?.interval === 'lifetime' ? (
                                            <span className="text-green-500 text-xs">{t('adminFinancials.table.paidFull')}</span>
                                        ) : '-')}
                                    </td>
                                    <td className="p-4 text-sm text-neutral-500">
                                        {new Date(c.created * 1000).toLocaleDateString(currentLocale)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
};