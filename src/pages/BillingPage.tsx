import React, { useState, useEffect, useMemo, type FC } from 'react';
import { useCreateSubscription, useUserProfile, useGetSubscriptionPlans, useCancelSubscription, useReactivateSubscription, type SubscriptionPlan } from '../hooks/useUser';
import { loadStripe } from '@stripe/stripe-js';
import { 
    Elements, 
    useStripe, 
    useElements, 
    CardNumberElement, 
    CardExpiryElement, 
    CardCvcElement 
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaExclamationTriangle, FaLock, FaCreditCard, FaCrown, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';

// --- Stripe Initialization ---
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

// --- Reusable Glass Card Component ---
const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

// --- PAYMENT FORM COMPONENT ---
const PaymentForm: FC<{ onPaymentSuccess: () => void; plans: SubscriptionPlan[] | undefined; isLoadingPlans: boolean; }> = ({ onPaymentSuccess, plans, isLoadingPlans }) => {
    const { t, i18n } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const { mutate: createSubscription, isPending } = useCreateSubscription();
    const [searchParams] = useSearchParams();
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Style for Stripe Elements to match your dark theme
    const elementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': { color: '#6B7280' },
                iconColor: '#7F56D9',
                fontFamily: 'Poppins, sans-serif',
            },
            invalid: { color: '#ef4444' }
        }
    };

    // Pre-select plan from URL if available, otherwise default to 1x
    useEffect(() => {
        if (!plans || plans.length === 0) return;

        const planFromUrl = searchParams.get('plan');
        const defaultPlan = plans.find(p => p.metadata?.installments === '1') || plans[0];

        if (planFromUrl && plans.some(p => p.id === planFromUrl)) {
            setSelectedPlanId(planFromUrl);
        } else if (!selectedPlanId) {
            setSelectedPlanId(defaultPlan.id);
        }
    }, [plans, searchParams]);

    // Sort plans: 1x -> 2x -> 3x
    const sortedPlans = useMemo(() => {
        if (!plans) return [];
        return plans
            .filter(p => p.metadata?.type === 'membership_tier')
            .sort((a, b) => {
                const instA = parseInt(a.metadata?.installments || '1');
                const instB = parseInt(b.metadata?.installments || '1');
                return instA - instB;
            });
    }, [plans]);

    const selectedPlan = plans?.find(p => p.id === selectedPlanId);
    
    // Currency Handling
    const locale = i18n.language === 'fr' ? 'fr-FR' : (i18n.language === 'ar' ? 'ar-AE' : 'en-US');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (!stripe || !elements || !selectedPlanId) {
            setError(t('membershipBilling.form.errors.plansUnavailable'));
            return;
        }
        
        // --- CHANGED: Get CardNumberElement instead of CardElement ---
        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) return;

        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({ type: 'card', card: cardElement });
        if (pmError || !paymentMethod) {
            setError(pmError?.message || t('membershipBilling.form.errors.cardValidation'));
            return;
        }

        createSubscription({ priceId: selectedPlanId, paymentMethodId: paymentMethod.id }, {
            onSuccess: async (response) => {
                if (response.data.status === 'requires_action' && response.data.clientSecret) {
                    const { error: confirmError } = await stripe.confirmCardPayment(response.data.clientSecret);
                    if (confirmError) {
                        setError(confirmError.message || t('membershipBilling.form.errors.3dsFailed'));
                        return;
                    }
                }
                onPaymentSuccess();
            },
            onError: (err: any) => {
                setError(err.response?.data?.message || t('membershipBilling.form.errors.generic'));
            }
        });
    };

    if (isLoadingPlans) return <div className="text-center py-10"><div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div></div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-white">{t('membershipBilling.form.title')}</h3>
                <p className="text-neutral-400 mt-2">{t('membershipBilling.form.subtitle')}</p>
            </div>

            {/* Plan Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sortedPlans.map(plan => {
                    const installments = parseInt(plan.metadata?.installments || '1');
                    const isOneTime = installments === 1;
                    const isSelected = plan.id === selectedPlanId;
                    const price = new Intl.NumberFormat(locale, { style: 'currency', currency: plan.currency }).format(plan.price / 100);
                    
                    return (
                        <div 
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`cursor-pointer relative rounded-xl p-4 border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(127,86,217,0.3)]' : 'border-neutral-800 bg-[#111317] hover:border-neutral-600'}`}
                        >
                            {isOneTime && (
                                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    {t('membershipPricing.card.bestValue')}
                                </span>
                            )}
                            <div className="text-center mt-1">
                                <span className={`text-sm font-bold block mb-1 ${isSelected ? 'text-primary' : 'text-neutral-400'}`}>
                                    {isOneTime ? t('membershipPricing.card.oneTime') : t('membershipPricing.card.installments', { count: installments })}
                                </span>
                                <div className="text-2xl font-bold text-white">{price}</div>
                                {!isOneTime && <div className="text-[10px] text-neutral-500 mt-1 uppercase font-semibold">{t('membershipPricing.card.perMonth')}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total Summary */}
            {selectedPlan && (
                <div className="bg-[#111317] rounded-xl p-6 border border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white font-bold">1</div>
                        <div>
                            <p className="text-sm text-neutral-400">Total to pay today</p>
                            <p className="text-2xl font-bold text-white">
                                {new Intl.NumberFormat(locale, { style: 'currency', currency: selectedPlan.currency }).format(selectedPlan.price / 100)}
                            </p>
                        </div>
                    </div>
                    {parseInt(selectedPlan.metadata?.installments || '1') > 1 && (
                        <div className="text-right border-t sm:border-t-0 sm:border-l border-neutral-800 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                            <p className="text-xs text-neutral-500">
                                {t('membershipPricing.card.totalCost', { 
                                    amount: new Intl.NumberFormat(locale, { style: 'currency', currency: selectedPlan.currency }).format((selectedPlan.price * parseInt(selectedPlan.metadata?.installments || '1')) / 100) 
                                })}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* --- SPLIT CARD INPUTS (Fixed Layout) --- */}
            <div className="bg-[#111317] border border-neutral-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-white font-medium text-sm mb-2">
                    <FaCreditCard className="text-primary" /> {t('membershipBilling.form.secure')}
                </div>
                
                {/* Card Number */}
                <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                    <CardNumberElement options={elementOptions} />
                </div>

                {/* Date & CVC */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                        <CardExpiryElement options={elementOptions} />
                    </div>
                    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3">
                        <CardCvcElement options={elementOptions} />
                    </div>
                </div>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/50 text-red-200 text-sm text-center">{error}</div>}
            
            <button type="submit" disabled={isPending || !stripe || !selectedPlanId} className="w-full py-4 rounded-xl text-lg font-bold bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-wait shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                {isPending ? t('membershipBilling.form.processing') : (parseInt(selectedPlan?.metadata?.installments || '1') > 1 ? t('membershipBilling.form.payInstallment') : t('membershipBilling.form.payFull'))}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                <FaShieldAlt />
                <span>SSL Encrypted Transaction</span>
            </div>
        </form>
    );
};

// --- SUBSCRIPTION STATUS COMPONENT ---
const ManageSubscription: FC = () => {
    const { t, i18n } = useTranslation();
    const { data: user } = useUserProfile();
    const navigate = useNavigate();
    
    // Redirect to settings for detailed management
    const goToSettings = () => navigate('/dashboard/settings');

    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    const isLifetime = user?.subscriptionStatus === 'LIFETIME_ACCESS';

    if (isLifetime) {
        return (
            <div className="text-center py-10">
                <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-lg shadow-orange-500/20 animate-[pulse-glow_3s_infinite]">
                    <FaCrown className="text-white text-4xl" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">{t('membershipBilling.manage.lifetimeTitle')}</h3>
                <p className="text-neutral-400 max-w-sm mx-auto mb-8 leading-relaxed">{t('membershipBilling.manage.lifetimeDesc')}</p>
                <button onClick={goToSettings} className="px-6 py-2.5 rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold hover:bg-neutral-800 transition-colors">
                    Go to Settings
                </button>
            </div>
        );
    }

    // Active Installation Plan
    const paid = user?.installmentsPaid || 0;
    const required = user?.installmentsRequired || 1;
    const progressPercent = Math.min((paid / required) * 100, 100);

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
                    <div className="bg-primary h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(127,86,217,0.5)]" style={{ width: `${progressPercent}%` }}></div>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-neutral-400 justify-center">
                    <FaCheckCircle className="text-green-400" />
                    <span>{t('membershipBilling.manage.statusActive')}</span>
                </div>
            </div>

            <button onClick={goToSettings} className="w-full h-12 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors">
                Manage Billing in Settings
            </button>
        </div>
    );
}

// --- MAIN PAGE ---
export const BillingPage: FC = () => {
    const { t, i18n } = useTranslation();
    const { data: userProfile, refetch: refetchUserProfile, isLoading: isLoadingProfile } = useUserProfile();
    const [isVerifying, setIsVerifying] = useState(false);

    let currency: 'eur' | 'usd' | 'aed' = 'usd';
    if (i18n.language === 'fr') currency = 'eur';
    if (i18n.language === 'ar') currency = 'aed';

    const { data: plans, isLoading: isLoadingPlans } = useGetSubscriptionPlans(currency);

    useEffect(() => {
        // Stop verifying once status updates to active/lifetime
        if (userProfile?.subscriptionStatus === 'ACTIVE' || userProfile?.subscriptionStatus === 'LIFETIME_ACCESS') {
            setIsVerifying(false);
        }
    }, [userProfile?.subscriptionStatus]);

    const handlePaymentSuccess = () => {
        setIsVerifying(true);
        // Poll for profile update
        const pollInterval = setInterval(() => { refetchUserProfile(); }, 2000);
        // Timeout after 30s
        setTimeout(() => { clearInterval(pollInterval); setIsVerifying(false); }, 30000);
    };

    const renderContent = () => {
        if (isLoadingProfile) return <div className="text-center py-20"><div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div></div>;
        
        if (isVerifying) {
            return (
                <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-400 mx-auto mb-6"></div>
                    <h3 className="text-2xl font-bold text-white">{t('membershipBilling.verifying.title')}</h3>
                    <p className="text-neutral-400 mt-2">{t('membershipBilling.verifying.subtitle')}</p>
                </div>
            );
        }

        const status = userProfile?.subscriptionStatus;
        // If user has a valid status, show status view instead of payment form
        if (status === 'ACTIVE' || status === 'TRIALING' || status === 'LIFETIME_ACCESS') {
            return <ManageSubscription />;
        }

        return (
            <Elements stripe={stripePromise}>
                <PaymentForm 
                    onPaymentSuccess={handlePaymentSuccess} 
                    plans={plans} 
                    isLoadingPlans={isLoadingPlans} 
                />
            </Elements>
        );
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-2xl">
                <GlassCard>
                    {renderContent()}
                </GlassCard>
            </div>
        </main>
    );
};