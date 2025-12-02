import React, { useState, useEffect, type FC } from 'react';
import { useUserProfile, useUpdateUserProfile, useCancelSubscription, useReactivateSubscription } from '../hooks/useUser';
import { useAffiliateDashboard } from '../hooks/useAffiliate';
import { FaUser,FaTicketAlt, FaEnvelope, FaGift, FaUsers, FaCheckCircle, FaEuroSign, FaCopy, FaLink, FaExclamationTriangle, FaDollarSign, FaCrown } from 'react-icons/fa'; // Added FaCrown
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Reusable Glass Card Component for consistent styling
const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-8' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

// Reusable Input component to match the design
const InfoInput: FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon: React.ReactNode; type?: string; disabled?: boolean; }> = ({ label, value, onChange, icon, type = 'text', disabled = false }) => (
    <div>
        <label className="text-sm text-neutral-400 mb-2 block">{label}</label>
        <div className="relative">
            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500">{icon}</div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60"
            />
        </div>
    </div>
);

// Stat card for the affiliate section
const AffiliateStatCard: FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="flex-1 p-5 border border-neutral-800 rounded-2xl bg-[#111317] text-center">
        <div className="flex justify-center text-neutral-400 mb-2">{icon}</div>
        <p className="text-sm text-neutral-400">{title}</p>
        <p className="text-4xl font-bold text-white my-1">{value}</p>
    </div>
);


const SettingsPage: FC = () => {
    const { t, i18n } = useTranslation();

    // Fetch user and affiliate data
    const { data: user, isLoading: isLoadingProfile } = useUserProfile();
    const { data: affiliateData, error: affiliateError, isLoading: isLoadingAffiliate } = useAffiliateDashboard();
    const { mutate: updateUser, isPending: isUpdatingProfile } = useUpdateUserProfile();
    const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();
    const { mutate: reactivateSubscription, isPending: isReactivating } = useReactivateSubscription();

    // State for the profile form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    // Populate form with user data once it's loaded
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    // Function to handle profile updates
    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser({ firstName, lastName });
    };

    // Function to copy the referral link to the clipboard
    const handleCopyLink = () => {
        if (!affiliateError && affiliateData?.referralLink) {
            navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${affiliateData?.referralLink ?? ''}`);
            toast.success(t('toasts.linkCopiedSuccess'));
        } else {
            toast.error(t('toasts.linkCopiedError'));
        }
    };

    const handleCancel = () => {
        if (window.confirm(t('settingsPage.billing.cancelConfirm'))) {
            cancelSubscription();
        }
    };


    const renderSubscriptionCard = () => {
        const plan = user?.planDetails;
        const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
        const dateLocale = i18n.language === 'fr' ? 'fr-FR' : 'en-GB';

        // --- 1. LIFETIME ACCESS VIEW ---
        if (user?.subscriptionStatus === 'LIFETIME_ACCESS') {
            return (
                <div className="relative rounded-2xl bg-gradient-to-br from-yellow-900/40 via-orange-900/20 to-neutral-900 border border-yellow-500/30 p-10 text-center shadow-xl">
                    <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-lg shadow-orange-500/20 animate-[pulse-glow_3s_infinite]">
                        <FaCrown className="text-white text-3xl" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3">{t('membershipBilling.manage.lifetimeTitle')}</h3>
                    <p className="text-neutral-300 max-w-md mx-auto mb-8 leading-relaxed text-lg">
                        {t('membershipBilling.manage.lifetimeDesc')}
                    </p>
                    <div className="inline-block px-6 py-2 rounded-full bg-green-900/40 text-green-400 border border-green-500/40 text-sm font-bold tracking-wide uppercase">
                        {t('membershipBilling.manage.fullyPaidBadge')}
                    </div>
                </div>
            );
        }

        // --- PREPARE DATA FOR ACTIVE SUBSCRIPTION ---
        const formattedPrice = plan && plan.amount != null
            ? new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: plan.currency,
            }).format(plan.amount / 100)
            : '';

        const intervalText = plan?.interval === 'month' ? t('settingsPage.billing.perMonth') : t('settingsPage.billing.perYear');
        const formattedDate = user?.currentPeriodEnd ? new Date(user.currentPeriodEnd).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';

        // Logic for Installment Progress
        const paid = user?.installmentsPaid || 0;
        const required = user?.installmentsRequired || 1;
        const isInstallmentPlan = required > 1;
        const progressPercent = Math.min((paid / required) * 100, 100);

        return (
            <div>
                <div className="relative rounded-2xl bg-gradient-to-r from-[#2d4a6b] via-[#2d4a6b] to-[#1e6b3f] py-6 px-8 mb-6 shadow-lg overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-white text-lg font-medium opacity-90">{plan?.name || 'Pro Plan'}</div>
                            <span className="px-4 py-1.5 rounded-full bg-[#4ade80] text-[#0a3d1f] text-xs font-bold uppercase tracking-wider">
                                {t('membershipBilling.manage.statusActive')}
                            </span>
                        </div>

                        <div className="text-white text-4xl font-bold mb-6 tracking-tight flex items-baseline gap-1">
                            {formattedPrice}
                            <span className="text-lg font-normal opacity-75">{plan?.interval ? intervalText : ''}</span>
                        </div>

                        {/* --- PROGRESS BAR (Only for Tranche Plans) --- */}
                        {isInstallmentPlan && (
                            <div className="mb-6 bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-white/90 font-medium">{t('membershipBilling.manage.progressTitle')}</span>
                                    <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded text-xs">{paid} / {required}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                                    <div 
                                        className="bg-white h-3 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-white/60">
                                    <span>{t('membershipBilling.manage.started')}</span>
                                    <span>{t('membershipBilling.manage.remaining', { count: required - paid })}</span>
                                </div>
                            </div>
                        )}

                        <div className="text-white/90 text-sm font-medium border-t border-white/10 pt-4 mt-2">
                            {user?.isCancellationScheduled ? (
                                <div className="flex items-center gap-2 text-yellow-200 bg-yellow-900/30 p-2 rounded-lg">
                                    <FaExclamationTriangle />
                                    <span>{t('membershipBilling.manage.cancellationNotice', { date: formattedDate })}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FaCheckCircle className="text-green-300" />
                                    <span>{t('membershipBilling.manage.nextPayment', { date: formattedDate })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- ACTION BUTTONS --- */}
                <div className="flex flex-col sm:flex-row hidden items-center gap-4">
                    {user?.isCancellationScheduled ? (
                        <button onClick={() => reactivateSubscription()} disabled={isReactivating} className="w-full sm:w-auto px-6 cursor-pointer h-12 rounded-lg bg-neutral-700 text-white font-medium transition-colors hover:bg-neutral-600 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isReactivating ? t('membershipBilling.manage.reactivating') : t('membershipBilling.manage.reactivateButton')}
                        </button>
                    ) : (
                        <button onClick={handleCancel} disabled={isCancelling} className="w-full sm:w-auto px-6 cursor-pointer h-12 rounded-lg border border-red-500/50 text-red-400 font-medium transition-colors hover:bg-red-500/10 disabled:opacity-50 flex items-center justify-center gap-2">
                            {isCancelling ? t('membershipBilling.manage.cancelling') : t('membershipBilling.manage.cancelButton')}
                        </button>
                    )}
                    
                    {/* Ethical Warning for Installment Plans */}
                    {isInstallmentPlan && !user?.isCancellationScheduled && (
                        <p className="text-xs text-neutral-500 max-w-sm text-center sm:text-left">
                            {t('membershipBilling.manage.warning')}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="bottom-right" />
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
                <div>
                    <h1 className="text-4xl font-bold text-white">{t('settingsPage.title')}</h1>
                    <p className="text-neutral-400 mt-1">{t('settingsPage.subtitle')}</p>
                </div>

                {/* Profile Information Section */}
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-6">{t('settingsPage.profile.title')}</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {(firstName.charAt(0) + lastName.charAt(0)).toUpperCase()}
                            </div>
                            <div>
                                <button type="button" className="px-5 py-2.5 rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold transition-colors hover:bg-neutral-800">
                                    {t('settingsPage.profile.changeAvatar')}
                                </button>
                                <p className="text-xs text-neutral-500 mt-2">{t('settingsPage.profile.avatarHint')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoInput label={t('settingsPage.profile.lastNameLabel')} value={lastName} onChange={(e) => setLastName(e.target.value)} icon={<FaUser />} />
                            <InfoInput label={t('settingsPage.profile.firstNameLabel')} value={firstName} onChange={(e) => setFirstName(e.target.value)} icon={<FaUser />} />
                        </div>
                        <InfoInput label={t('settingsPage.profile.emailLabel')} value={email} onChange={(e) => setEmail(e.target.value)} icon={<FaEnvelope />} disabled />

                        <div>
                            <button type="submit" disabled={isUpdatingProfile} className="px-6 py-2.5 rounded-lg bg-gray-200 text-black font-semibold transition-colors hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait">
                                {isUpdatingProfile ? t('settingsPage.profile.savingButton') : t('settingsPage.profile.saveButton')}
                            </button>
                        </div>
                    </form>
                </GlassCard>

                {/* Affiliate Program Section */}
                <GlassCard>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-primary/10 border border-primary/20 text-primary w-12 h-12 flex items-center justify-center rounded-xl">
                            <FaGift size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{t('settingsPage.affiliate.title')}</h2>
                            <p className="text-neutral-400 text-sm">{t('settingsPage.affiliate.subtitle')}</p>
                        </div>
                    </div>
                    {affiliateError ? (
                        <div className="text-center py-8 text-yellow-400">
                            {t('settingsPage.affiliate.premiumAccess')}
                        </div>
                    ) : isLoadingAffiliate ? (
                        <div className="text-center py-8 text-neutral-400">{t('settingsPage.affiliate.loading')}</div>
                    ) : (
                        <div className="mt-6 space-y-8">
                            <div className="flex flex-col md:flex-row gap-6">
                                <AffiliateStatCard title={t('settingsPage.affiliate.stats.totalReferrals')} value={affiliateData?.stats.totalReferrals ?? 0} icon={<FaUsers />} />
                                <AffiliateStatCard title={t('settingsPage.affiliate.stats.activeSubscribers')} value={affiliateData?.stats.paidReferrals ?? 0} icon={<FaCheckCircle />} />
                                {/* CORRECTED STAT CARD */}
                                <AffiliateStatCard
                                    title={t('affiliatePage.stats.availableDiscounts', 'Available Discounts')}
                                    value={affiliateData?.stats.availableDiscounts ?? 0}
                                    icon={<FaTicketAlt />}
                                />
                            </div>
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                                <p className="text-neutral-400 text-sm">{t('settingsPage.affiliate.yourLink')}</p>
                                <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                                    <div className="relative flex-grow w-full">
                                        <FaLink className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${window.location.origin}/signup?ref=${affiliateData?.referralLink ?? ''}`}
                                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500"
                                        />
                                    </div>
                                    <button onClick={handleCopyLink} className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-5 rounded-lg bg-neutral-700 text-white font-semibold hover:bg-neutral-600 transition-colors">
                                        <FaCopy /> {t('settingsPage.affiliate.copy')}
                                    </button>
                                </div>
                            </div>

                            {/* Referred Users List - Replicated from AffiliatePage.tsx */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">{t('settingsPage.affiliate.referrals.title')}</h3>
                                <div className="overflow-x-auto border border-neutral-800 rounded-2xl">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-neutral-800 bg-white/5">
                                                <th className="p-4 text-sm font-semibold text-neutral-400">{t('settingsPage.affiliate.referrals.table.name')}</th>
                                                <th className="p-4 text-sm font-semibold text-neutral-400">{t('settingsPage.affiliate.referrals.table.signupDate')}</th>
                                                <th className="p-4 text-sm font-semibold text-neutral-400 text-right">{t('settingsPage.affiliate.referrals.table.paymentStatus')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {affiliateData?.referredUsers.map(user => (
                                                <tr key={user.id} className="border-b border-neutral-800 last:border-b-0">
                                                    <td className="p-4 text-white font-medium">{user.name}</td>
                                                    <td className="p-4 text-neutral-300">{new Date(user.signedUpAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-GB')}</td>
                                                    <td className="p-4 text-right">
                                                        {user.hasPaid
                                                            ? <span className="text-xs font-semibold text-green-400 bg-green-900/50 px-3 py-1 rounded-full">{t('settingsPage.affiliate.referrals.status.paid')}</span>
                                                            : <span className="text-xs font-semibold text-yellow-500 bg-yellow-900/50 px-3 py-1 rounded-full">{t('settingsPage.affiliate.referrals.status.pending')}</span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {(!affiliateData || affiliateData.referredUsers.length === 0) && <p className="text-center text-neutral-500 py-8">{t('settingsPage.affiliate.referrals.noReferrals')}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </GlassCard>

                {/* Billing & Subscription Section */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6">{t('settingsPage.billing.title')}</h2>
                    {isLoadingProfile ? (
                        <GlassCard>
                            <p className="text-neutral-400">{t('settingsPage.billing.loading')}</p>
                        </GlassCard>
                    ) : user?.subscriptionStatus === 'ACTIVE' || user?.subscriptionStatus === 'TRIALING' || user?.subscriptionStatus === 'LIFETIME_ACCESS' ? (
                        renderSubscriptionCard()
                    ) : (
                        <GlassCard>
                            <p className="text-neutral-400 mb-4">{t('settingsPage.billing.noActiveSubscription')}</p>
                            <a href="/pricing" className="inline-block px-5 py-2.5 rounded-lg bg-white text-black font-semibold hover:bg-gray-200">
                                View Plans
                            </a>
                        </GlassCard>
                    )}
                </div>
            </main>
        </>
    );
};

export default SettingsPage;