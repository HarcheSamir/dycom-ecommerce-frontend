// src/pages/BillingPage.tsx

import React, { useState, type FC } from 'react';
import { useUserProfile, useCancelSubscription, useReactivateSubscription } from '../hooks/useUser';
import { FaCheckCircle, FaExclamationTriangle, FaCrown, FaGem, FaCcVisa, FaCcMastercard, FaCcPaypal, FaShieldAlt } from 'react-icons/fa';
import { SiKlarna } from 'react-icons/si';
import { useTranslation } from 'react-i18next';

// --- Reusable Glass Card Component ---
const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = '' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

// --- STATIC HOTMART CONFIG ---
const HOTMART_LINK = "https://pay.hotmart.com/U103378139T";
const PRODUCT_PRICE = "980,00 €";

// --- SUBSCRIPTION STATUS COMPONENT ---
const ManageSubscription: FC = () => {
    const { t, i18n } = useTranslation();
    const { data: user } = useUserProfile();
    const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();
    const { mutate: reactivateSubscription, isPending: isReactivating } = useReactivateSubscription();

    // Determine Status
    const isLifetime = user?.subscriptionStatus === 'LIFETIME_ACCESS';
    
    // Legacy Stripe users have a 'stripeSubscriptionId'
    const isStripeUser = !!user?.stripeSubscriptionId;

    const dateLocale = i18n.language === 'fr' ? 'fr-FR' : 'en-GB';

    // --- CASE 1: LIFETIME ACCESS (Hotmart or Paid-off Stripe) ---
    if (isLifetime) {
        return (
            <div className="text-center py-10">
                <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-lg shadow-orange-500/20 animate-[pulse-glow_3s_infinite]">
                    <FaCrown className="text-white text-4xl" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">{t('membershipBilling.manage.lifetimeTitle')}</h3>
                <p className="text-neutral-400 max-w-sm mx-auto mb-8 leading-relaxed">
                    {t('membershipBilling.manage.lifetimeDesc')}
                </p>
                <div className="inline-block px-4 py-2 bg-neutral-800 rounded-lg text-xs text-neutral-500">
                    Access granted via {user?.stripeSubscriptionId ? 'Stripe' : 'Hotmart'}
                </div>
            </div>
        );
    }

    // --- CASE 2: ACTIVE LEGACY STRIPE USER (Paying Installments) ---
    const paid = user?.installmentsPaid || 0;
    const required = user?.installmentsRequired || 1;
    const progressPercent = Math.min((paid / required) * 100, 100);
    const formattedDate = user?.currentPeriodEnd ? new Date(user.currentPeriodEnd).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';

    return (
        <div>
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white">{t('membershipBilling.manage.title')}</h3>
                <p className="text-neutral-400">{t('membershipBilling.manage.subtitle')}</p>
            </div>

            <div className="bg-[#111317] border border-neutral-800 rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-neutral-400">{t('membershipBilling.manage.progressTitle')}</span>
                    <span className="text-white font-bold">{paid} / {required}</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-3 mb-6 overflow-hidden">
                    <div
                        className="h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(127,86,217,0.5)] bg-gradient-to-r from-[#7F56D9] via-[#4C6EF5] to-[#0EA5E9]"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-3 text-sm text-neutral-400">
                        <FaCheckCircle className="text-green-400" />
                        <span>{t('membershipBilling.manage.statusActive')}</span>
                    </div>
                    {user?.isCancellationScheduled ? (
                        <div className="flex items-center justify-center gap-2 text-yellow-500 bg-yellow-900/10 p-2 rounded text-xs">
                            <FaExclamationTriangle />
                            <span>{t('membershipBilling.manage.cancellationNotice', { date: formattedDate })}</span>
                        </div>
                    ) : (
                        <div className="text-center text-xs text-neutral-500">
                            {t('membershipBilling.manage.nextPayment', { date: formattedDate })}
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel/Reactivate Buttons (Only for Stripe Users) */}
            {isStripeUser && (
                <div className="flex justify-center">
                    {user?.isCancellationScheduled ? (
                        <button 
                            onClick={() => reactivateSubscription()} 
                            disabled={isReactivating} 
                            className="w-full h-12 rounded-lg bg-neutral-700 text-white font-medium hover:bg-neutral-600 transition-colors disabled:opacity-50"
                        >
                            {isReactivating ? t('membershipBilling.manage.reactivating') : t('membershipBilling.manage.reactivateButton')}
                        </button>
                    ) : (
                        <button 
                            onClick={() => { if(window.confirm(t('membershipBilling.manage.cancelConfirm'))) cancelSubscription() }} 
                            disabled={isCancelling} 
                            className="w-full h-12 rounded-lg border border-red-500/50 text-red-400 font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                            {isCancelling ? t('membershipBilling.manage.cancelling') : t('membershipBilling.manage.cancelButton')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// --- MAIN PAGE ---
export const BillingPage: FC = () => {
    const { t } = useTranslation();
    const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();

    // Hotmart Link Logic
    const handleBuyNow = () => {
        if (!userProfile) return;
        
        let link = `${HOTMART_LINK}?name=${encodeURIComponent(userProfile.firstName + ' ' + userProfile.lastName)}&email=${encodeURIComponent(userProfile.email)}`;
        
        // Strict phone cleaning: numbers only
        if (userProfile.phone) {
            const cleanPhone = userProfile.phone.replace(/[^0-9]/g, ''); 
            link += `&phone_number=${cleanPhone}`;
        }
        window.location.href = link;
    };

    const features = t('billingPage.features', { returnObjects: true }) as string[];

    const renderContent = () => {
        if (isLoadingProfile) return <div className="text-center py-20"><div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div></div>;

        const status = userProfile?.subscriptionStatus;

        // 1. Has Valid Subscription
        if (status === 'ACTIVE' || status === 'TRIALING' || status === 'LIFETIME_ACCESS') {
            return (
                <div className="w-full max-w-xl mx-auto">
                    <GlassCard>
                        <ManageSubscription />
                    </GlassCard>
                </div>
            );
        }

        // 2. No Subscription - Show the FULL PRICING CARD (Matching Pricing.tsx)
        return (
            <div className="w-full max-w-md mx-auto">
                <GlassCard className="border-primary/50 shadow-2xl shadow-primary/10 bg-neutral-900/40">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg">
                        {t('membershipPricing.card.bestValue')}
                    </div>

                    <div className="flex flex-col p-6 h-full bg-gradient-to-b from-white/5 to-transparent">
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {t('membershipPricing.card.lifetime')}
                        </h3>
                        <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/30 mb-2">
                            <FaGem className="text-green-400 text-xs" />
                            <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Access A Vie</span>
                        </div>

                        <div className="mb-8 border-b border-neutral-800 pb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-white tracking-tight">{PRODUCT_PRICE}</span>
                            </div>
                            <p className="text-sm text-neutral-500 mt-3 font-medium">
                                Paiement unique
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-grow">
                            {features.map((f, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                                    <FaCheckCircle className="text-primary mt-0.5 flex-shrink-0" />
                                    <span className="leading-snug">{f}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={handleBuyNow}
                            className="w-full block py-4 rounded-xl text-center font-bold text-lg transition-all bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10 transform hover:scale-[1.02]"
                        >
                            {t('membershipPricing.card.startNow')}
                        </button>

                        <div className="mt-6 text-center border-t border-neutral-800 pt-6">
                            <p className="text-xs text-green-400 font-bold mb-3 uppercase tracking-wide">
                                Payez en 3x sans frais avec Klarna
                            </p>
                            <div className="flex justify-center items-center gap-4 text-neutral-400 mb-3">
                                <FaCcVisa size={24} />
                                <FaCcMastercard size={24} />
                                <FaCcPaypal size={24} />
                                <div className="flex items-center gap-1 font-bold text-white bg-pink-500/10 px-2 py-1 rounded">
                                    <SiKlarna size={18} className="text-pink-500"/> <span className="text-xs text-pink-500">Klarna.</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-600">
                                <FaShieldAlt /> Paiement sécurisé par Hotmart. Satisfait ou remboursé.
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        );
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
            {renderContent()}
        </main>
    );
};