import { useState, useEffect, useMemo } from 'react';
import type { FC } from 'react';
import { FaTimes } from 'react-icons/fa';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useUserProfile, useCreateCoursePaymentIntent } from '../../hooks/useUser';
import { useAffiliateDashboard } from '../../hooks/useAffiliate';
import type { VideoCourse } from '../../hooks/useTraining';

interface PurchaseCourseModalProps {
    course: VideoCourse | null;
    onClose: () => void;
    onPurchaseSubmitted: () => void;
    isVerifying: boolean;
}

export const PurchaseCourseModal: FC<PurchaseCourseModalProps> = ({ course, onClose, onPurchaseSubmitted, isVerifying }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { t, i18n } = useTranslation();
    const { mutate: createPI, isPending: isCreatingPI } = useCreateCoursePaymentIntent();
    const { data: userProfile } = useUserProfile();
    const { data: affiliateData, isLoading: isLoadingAffiliate } = useAffiliateDashboard();

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasAvailableDiscount = (userProfile?.availableCourseDiscounts ?? 0) > 0;
    const [applyDiscount, setApplyDiscount] = useState(hasAvailableDiscount);

    useEffect(() => {
        setApplyDiscount(hasAvailableDiscount);
    }, [hasAvailableDiscount]);

    const handlePurchase = async () => {
        if (!stripe || !elements || !course) return;
        setIsProcessing(true);
        setError(null);
        let currency: 'eur' | 'usd' | 'aed';
        if (i18n.language === 'fr') {
            currency = 'eur';
        } else if (i18n.language === 'ar') {
            currency = 'aed';
        } else {
            currency = 'usd';
        }
        createPI({ courseId: course.id, currency, applyAffiliateDiscount: applyDiscount }, {
            onSuccess: async (response) => {
                const clientSecret = response.data.clientSecret;
                if (!clientSecret) {
                    onPurchaseSubmitted();
                    return;
                }
                const cardElement = elements.getElement(CardElement)!;
                const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } });
                if (confirmError) {
                    setError(confirmError.message || t('trainingPage.toasts.paymentFailed'));
                    setIsProcessing(false);
                } else {
                    onPurchaseSubmitted();
                }
            },
            onError: () => {
                setError(t('trainingPage.toasts.paymentStartFailed'));
                setIsProcessing(false);
            }
        });
    };

    const locale = i18n.language === 'fr' ? 'fr-FR' : (i18n.language === 'ar' ? 'ar-AE' : 'en-US');
    const currencyCode = course?.currency || (i18n.language === 'fr' ? 'eur' : (i18n.language === 'ar' ? 'aed' : 'usd'));

    const originalPrice = course?.price ?? 0;
    const discountAmount = useMemo(() => {
        if (applyDiscount && userProfile && userProfile.availableCourseDiscounts > 0 && affiliateData) {
            const discountPercentage = affiliateData.discountPercentage;
            return originalPrice * (discountPercentage / 100);
        }
        return 0;
    }, [applyDiscount, userProfile, affiliateData, originalPrice]);

    const finalPrice = originalPrice - discountAmount;

    const formattedOriginalPrice = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(originalPrice);
    const formattedDiscountAmount = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(discountAmount);
    const formattedFinalPrice = new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(finalPrice);

    if (!course) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={isVerifying ? undefined : onClose}>
            <div className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-md w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}>
                {!isVerifying && <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><FaTimes /></button>}
                <div className="p-8">
                    {isVerifying ? (
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
                            <h3 className="text-2xl font-bold text-white mt-6">{t('trainingPage.purchaseModal.verifying.title')}</h3>
                            <p className="text-neutral-400 mt-2">{t('trainingPage.purchaseModal.verifying.subtitle')}</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">{t('trainingPage.purchaseModal.title')}</h2>
                            <p className="text-neutral-400 mb-6">{t('trainingPage.purchaseModal.buying')} <span className="font-semibold text-white">{course.title}</span></p>

                            {hasAvailableDiscount && (
                                <div className="mb-4">
                                    <label htmlFor="apply-discount" className="flex items-center gap-3 cursor-pointer p-4 rounded-lg bg-purple-900/30 border border-purple-500/30">
                                        <input
                                            id="apply-discount"
                                            type="checkbox"
                                            checked={applyDiscount}
                                            onChange={(e) => setApplyDiscount(e.target.checked)}
                                            className="h-5 w-5 rounded bg-neutral-700 border-neutral-500 text-primary focus:ring-primary"
                                        />
                                        <span className="text-white font-medium">
                                            {t('trainingPage.purchaseModal.applyDiscount', { count: userProfile?.availableCourseDiscounts })}
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div className="my-4 space-y-2 border-y border-neutral-700 py-4">
                                <div className="flex justify-between text-neutral-400">
                                    <span>{t('trainingPage.purchaseModal.originalPrice')}</span>
                                    <span>{formattedOriginalPrice}</span>
                                </div>
                                {applyDiscount && (
                                    <div className="flex justify-between text-green-400">
                                        <span>{t('trainingPage.purchaseModal.discount')} ({affiliateData?.discountPercentage}%)</span>
                                        <span>-{formattedDiscountAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-white font-bold text-lg pt-2">
                                    <span>{t('trainingPage.purchaseModal.total')}</span>
                                    <span>{formattedFinalPrice}</span>
                                </div>
                            </div>

                            {finalPrice > 0 && (
                                <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 mb-6">
                                    <CardElement options={{ style: { base: { fontSize: '16px', color: '#ffffff', '::placeholder': { color: '#6B7280' } }, invalid: { color: '#ef4444' } } }} />
                                </div>
                            )}

                            {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
                            <button onClick={handlePurchase} disabled={isCreatingPI || isProcessing || !stripe || isLoadingAffiliate} className="w-full h-12 rounded-lg bg-white text-black cursor-pointer font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
                                {isProcessing
                                    ? t('trainingPage.purchaseModal.processingButton')
                                    : (finalPrice > 0
                                        ? t('trainingPage.purchaseModal.payButton', { price: formattedFinalPrice })
                                        : t('trainingPage.courseCard.getFreeButton'))
                                }
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};