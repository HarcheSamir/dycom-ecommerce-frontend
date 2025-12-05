import React from 'react';
import { usePastDueUsers } from '../hooks/useAdmin';
import { FaExclamationTriangle, FaEnvelope, FaPhone, FaExternalLinkAlt, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import { GlassCard } from '../components/admin/AdminUI';
import { useTranslation } from 'react-i18next'; // 1. Import hook

const AdminPastDuePage: React.FC = () => {
    const { t, i18n } = useTranslation(); // 2. Initialize hook
    const { data: users, isLoading } = usePastDueUsers();

    // Determine locale for currency formatting
    const isRtl = i18n.language === 'ar';
    const currentLocale = i18n.language === 'fr' ? 'fr-FR' : (isRtl ? 'ar-AE' : 'en-US');

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat(currentLocale, { style: 'currency', currency: currency.toUpperCase() }).format(amount);
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#111317] min-h-screen text-white space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FaExclamationTriangle className="text-red-500" /> {t('adminPastDue.title')}
                </h1>
                <p className="text-neutral-400 mt-1">{t('adminPastDue.subtitle')}</p>
            </div>

            <GlassCard padding="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1C1E22] border-b border-neutral-700 text-neutral-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-5 text-start">{t('adminPastDue.table.user')}</th>
                                <th className="p-5 text-start">{t('adminPastDue.table.contact')}</th>
                                <th className="p-5 text-start">{t('adminPastDue.table.daysLate')}</th>
                                <th className="p-5 text-start">{t('adminPastDue.table.amountDue')}</th>
                                <th className="p-5 text-end">{t('adminPastDue.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-12 text-center text-neutral-500">{t('adminPastDue.table.loading')}</td></tr>
                            ) : !users || users.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-neutral-500 italic">{t('adminPastDue.table.empty')}</td></tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-red-900/5 transition-colors">
                                    <td className="p-5">
                                        <div className="font-bold text-white">{user.name}</div>
                                        <div className="text-xs text-neutral-500 font-mono mt-1">{user.id}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-1">
                                            <a href={`mailto:${user.email}`} className="text-sm text-neutral-300 hover:text-white flex items-center gap-2">
                                                <FaEnvelope size={12} /> {user.email}
                                            </a>
                                            {user.phone && (
                                                <a href={`tel:${user.phone}`} className="text-sm text-neutral-300 hover:text-white flex items-center gap-2">
                                                    <FaPhone size={12} /> {user.phone}
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm">
                                            <FaClock size={12} /> {user.daysLate} {t('adminPastDue.days')}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="font-mono text-lg font-bold text-white flex items-center gap-2">
                                            <FaMoneyBillWave className="text-neutral-500 text-sm" />
                                            {formatCurrency(user.amountDue, user.currency)}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        {user.stripeCustomerId && (
                                            <a 
                                                href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-sm text-white transition-colors"
                                            >
                                                {/* Keeping Stripe button text in English */}
                                                Stripe <FaExternalLinkAlt size={10} />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </main>
    );
};

export default AdminPastDuePage;