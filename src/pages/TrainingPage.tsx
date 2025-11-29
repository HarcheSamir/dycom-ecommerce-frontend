// src/pages/TrainingPage.tsx

import React, { useState, useMemo, useEffect,useRef } from 'react';
import type { FC } from 'react';
import { useCourses, useCourse, useUpdateVideoProgress } from '../hooks/useTraining';
import type { VideoCourse, Video, Section } from '../hooks/useTraining';
// ==================== SURGICAL MODIFICATION START: Add Affiliate Hook ====================
import { useUserProfile, useCreateCoursePaymentIntent } from '../hooks/useUser';
import { useAffiliateDashboard } from '../hooks/useAffiliate'; // <-- IMPORT THIS
// ==================== SURGICAL MODIFICATION END ====================
import { FaPlayCircle,FaSort,FaBookReader, FaChevronLeft, FaChevronDown, FaChevronRight, FaGlobe, FaClock, FaStar, FaVideo, FaSearch, FaFilter, FaUsers, FaBookOpen, FaCheckCircle, FaBook, FaShoppingCart, FaTimes } from 'react-icons/fa';
import VimeoPlayer from '../components/VimeoPlayer';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

// --- Reusable Glass Card Component (preserved) ---
const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 hover:border-neutral-700 hover:-translate-y-1 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative h-full ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

const PurchaseCourseModal: FC<{ course: VideoCourse | null; onClose: () => void; onPurchaseSubmitted: () => void; isVerifying: boolean; }> = ({ course, onClose, onPurchaseSubmitted, isVerifying }) => {
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
                                {isProcessing ? t('trainingPage.purchaseModal.processingButton') : (finalPrice > 0 ? t('trainingPage.purchaseModal.payButton', { price: formattedFinalPrice }) : "Obtenir Gratuitement")}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
// ==================== SURGICAL MODIFICATION END ====================

// --- CourseCard Component (preserved) ---
const CourseCard: FC<{ course: VideoCourse; onClick: () => void; hasAccess: boolean; onBuy: () => void; }> = ({ course, onClick, hasAccess, onBuy }) => {
    const { t, i18n } = useTranslation();

    let locale: string;
    if (i18n.language === 'fr') {
        locale = 'fr-FR';
    } else if (i18n.language === 'ar') {
        locale = 'ar-AE';
    } else {
        locale = 'en-US';
    }
    const formattedPrice = course.price != null && course.currency
        ? new Intl.NumberFormat(locale, { style: 'currency', currency: course.currency }).format(course.price)
        : t('trainingPage.courseCard.free');

    return (
        <GlassCard className="flex flex-col h-full" padding="p-0">
            <div className={`flex flex-col h-full ${hasAccess ? 'cursor-pointer' : ''}`}>
                <div onClick={hasAccess ? onClick : undefined} className="relative w-full h-48 bg-[#1C1E22] rounded-t-3xl overflow-hidden">
                    <img src={course.coverImageUrl || ''} alt={course.title} className="w-full h-full object-cover" />
                    {course.level && (<span className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">{course.level}</span>)}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-white text-xl">{course.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                        {course.rating && (<div className="flex items-center gap-1.5"><FaStar className="text-yellow-400" /><span className="text-white font-semibold text-sm">{course.rating.toFixed(1)}</span></div>)}
                        {course.language && (<div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold"><FaGlobe size={12} /><span>{course.language}</span></div>)}
                    </div>
                    <p className="text-neutral-400 text-sm my-3">{course.description || ""}</p>
                    <div className="text-sm text-neutral-400 flex items-center justify-between">
                        <span className="flex items-center gap-2"><FaClock /> {course.duration}</span>
                        <span className="flex items-center gap-2"><FaBookOpen /> {t('trainingPage.courseCard.lessons', { count: course.totalVideos })}</span>
                    </div>
                    {course.author && (<p className="text-sm text-neutral-400 mt-3">{t('trainingPage.courseCard.byAuthor', { author: course.author })}</p>)}
                    {hasAccess ? (
                        <div className="mt-auto pt-4 border-t border-neutral-800">
                            <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                                <FaCheckCircle />
                                <span>Accès autorisé</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-neutral-800">
                            <div>
                                <p className="text-neutral-500 text-sm">{t('trainingPage.courseCard.priceLabel')}</p>
                                <p className="text-white font-bold text-3xl">{formattedPrice}</p>
                            </div>
                            <button onClick={onBuy} className="h-12 cursor-pointer px-6 rounded-lg bg-white text-black font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                                {t('trainingPage.courseCard.buyButton')} <FaChevronRight size={12} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </GlassCard>
    );
};

// --- CourseDisplay Component (preserved) ---
const CourseDisplay: FC<{ course: VideoCourse }> = ({ course }) => {
    const { t } = useTranslation();
    const allVideos = useMemo(() => course.sections.flatMap(section => section.videos), [course.sections]);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(allVideos[0] || null);
    const { mutate: updateProgress, isPending } = useUpdateVideoProgress();

    const handleVideoEnded = () => {
        if (currentVideo && !isPending) {
            updateProgress({ videoId: currentVideo.id, completed: true });
            const currentIndex = allVideos.findIndex(v => v.id === currentVideo.id);
            if (currentIndex < allVideos.length - 1) {
                setCurrentVideo(allVideos[currentIndex + 1]);
            }
        }
    };

    const completedVideos = useMemo(() => new Set(allVideos.filter(v => v.progress[0]?.completed).map(v => v.id)), [allVideos]);

    if (!currentVideo) {
        return <p className="text-neutral-400 text-center p-8">{t('trainingPage.courseDisplay.noVideos')}</p>;
    }

    return (
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
                <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/30 mb-6">
                    <VimeoPlayer key={currentVideo.id} vimeoId={currentVideo.vimeoId} onEnded={handleVideoEnded} />
                </div>
                <GlassCard>
                    <h2 className="text-2xl font-bold text-white">{currentVideo.title}</h2>
                    <p className="text-neutral-400 mt-2">{currentVideo.description}</p>
                </GlassCard>
            </div>
            <div className="lg:col-span-1 mt-8 lg:mt-0">
                <GlassCard className="h-full" padding="p-5">
                    <h3 className="text-lg font-bold text-white mb-4 px-2">{t('trainingPage.courseDisplay.lessonsTitle', { completed: completedVideos.size, total: allVideos.length })}</h3>
                    <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {course.sections.map((section) => (
                            <li key={section.id}>
                                <h4 className="font-bold text-neutral-300 mb-2 px-3 flex items-center gap-2"><FaBook size={12} /> {section.title}</h4>
                                <ul className="space-y-1">
                                    {section.videos.map((video) => {
                                        const isCompleted = completedVideos.has(video.id);
                                        const isActive = currentVideo.id === video.id;
                                        return (
                                            <li key={video.id}>
                                                <button onClick={() => setCurrentVideo(video)}
                                                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-4 ${isActive ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'}`}
                                                >
                                                    <div className="flex-shrink-0 text-xl">
                                                        {isCompleted ? <FaCheckCircle className="text-green-500" /> : <FaPlayCircle className={isActive ? 'text-white' : 'text-neutral-500'} />}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold leading-tight ${isCompleted ? 'line-through text-neutral-500' : 'text-white'}`}>{video.title}</p>
                                                        {video.duration && <p className={`text-xs mt-1 flex items-center gap-1.5 ${isActive ? 'text-white/80' : 'text-neutral-400'}`}><FaClock size={10} /> {video.duration} {t('trainingPage.courseDisplay.minutes')}</p>}
                                                    </div>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </GlassCard>
            </div>
        </div>
    );
};

// --- CourseDetailView Container (preserved) ---
const CourseDetailView: FC<{ courseId: string; onBack: () => void }> = ({ courseId, onBack }) => {
    const { t } = useTranslation();
    const { data: course, isLoading, isError } = useCourse(courseId);
    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                <FaChevronLeft />
                <span>{t('trainingPage.detailView.backButton')}</span>
            </button>
            {isLoading && <p className="text-center text-neutral-400">{t('trainingPage.detailView.loading')}</p>}
            {isError && <p className="text-center text-red-500">{t('trainingPage.detailView.error')}</p>}
            {course && (
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
                    <p className="text-neutral-400 mt-1 mb-8">{course.description}</p>
                    <CourseDisplay course={course} />
                </div>
            )}
        </main>
    );
};













const FilterDropdown: FC<{
    icon: React.ReactNode;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
}> = ({ icon, options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedLabel = options.find(opt => opt.value === value)?.label;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 flex items-center justify-between px-4 rounded-lg bg-[#1C1E22] border border-neutral-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
                <div className="flex items-center gap-3">
                    <span className="text-neutral-400">{icon}</span>
                    <span>{selectedLabel}</span>
                </div>
                <FaChevronDown className={`text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-[#1C1E22] border border-neutral-700 rounded-lg z-10 shadow-lg">
                    {options.map(option => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-800"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const FilterButton: FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive: boolean;
}> = ({ icon, label, onClick, isActive }) => (
    <button
        onClick={onClick}
        className={`w-full h-12 flex items-center justify-center gap-3 px-4 rounded-lg text-sm font-semibold transition-colors ${
            isActive
                ? 'bg-gray-200 text-black'
                : 'bg-[#1C1E22] border border-neutral-700 text-white hover:bg-neutral-800'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);


// --- REFACTORED Main TrainingPage Component ---
export const TrainingPage: FC = () => {
    const { t, i18n } = useTranslation();
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [courseToBuy, setCourseToBuy] = useState<VideoCourse | null>(null);
    const [isVerifyingPurchase, setIsVerifyingPurchase] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [languageFilter, setLanguageFilter] = useState('');
    const [showOwnedOnly, setShowOwnedOnly] = useState(false);

    const { data: courses, isLoading, isError, refetch: refetchCourses } = useCourses({
        lang: i18n.language,
        search: searchTerm,
        sortBy: sortBy,
        language: languageFilter,
    });
    const { data: userProfile, refetch: refetchUser } = useUserProfile();

    const isSubscriber = userProfile?.subscriptionStatus === 'ACTIVE';
    const purchasedCourseIds = useMemo(() => new Set(userProfile?.coursePurchases.map(p => p.courseId) || []), [userProfile]);
    const isAdmin = userProfile?.accountType === 'ADMIN';

    const filteredCourses = useMemo(() => {
        if (!showOwnedOnly) return courses;
        return courses?.filter(course => {
            const isFreeCourse = course.price === null || course.price === 0;
            return isAdmin || purchasedCourseIds.has(course.id) || (isSubscriber && isFreeCourse);
        });
    }, [courses, showOwnedOnly, isAdmin, isSubscriber, purchasedCourseIds]);

    const handlePurchaseSubmitted = () => {
        setIsVerifyingPurchase(true);
        const pollInterval = setInterval(() => {
            refetchUser().then(({ data: updatedUser }) => {
                if (updatedUser?.coursePurchases.some(p => p.courseId === courseToBuy?.id)) {
                    clearInterval(pollInterval);
                    setIsVerifyingPurchase(false);
                    setCourseToBuy(null);
                    toast.success(t('trainingPage.toasts.purchaseSuccess'));
                    refetchCourses();
                }
            });
        }, 2000);

        setTimeout(() => {
            if (isVerifyingPurchase) { clearInterval(pollInterval); setIsVerifyingPurchase(false); toast.error(t('trainingPage.toasts.verificationTimeout')); }
        }, 30000);
    };

    const sortOptions = [{ value: 'createdAt', label: 'Sort by Recency' },{ value: 'title', label: 'Sort by Name (A-Z)' }];
    const languageOptions = [{ value: '', label: 'Default Language' },{ value: 'ALL', label: 'All Languages' },{ value: 'EN', label: 'English' },{ value: 'FR', label: 'Français' },{ value: 'AR', label: 'Arabic' }];

    if (selectedCourseId) { return <CourseDetailView courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />; }

    return (
        <>
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
                <div>
                    <h1 className="text-4xl font-bold text-white">{t('trainingPage.title')}</h1>
                    <p className="text-neutral-400 mt-1">{t('trainingPage.subtitle')}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-grow min-w-[250px]">
                        <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        />
                    </div>
                    <div className="flex-grow w-full sm:w-auto sm:min-w-[200px]">
                        <FilterDropdown icon={<FaSort />} options={sortOptions} value={sortBy} onChange={setSortBy} />
                    </div>
                    <div className="flex-grow w-full sm:w-auto sm:min-w-[200px]">
                        <FilterDropdown icon={<FaGlobe />} options={languageOptions} value={languageFilter} onChange={setLanguageFilter} />
                    </div>
                    <div className="flex-grow w-full sm:w-auto">
                         <FilterButton icon={<FaBookReader />} label="My Courses" onClick={() => setShowOwnedOnly(!showOwnedOnly)} isActive={showOwnedOnly} />
                    </div>
                </div>

                <section>
                    {isLoading && <p className="text-center text-neutral-400">{t('trainingPage.loading')}</p>}
                    {isError && <p className="text-center text-red-500">{t('trainingPage.error')}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses?.map((course) => {
                            const isFreeCourse = course.price === null || course.price === 0;
                            const hasAccess = isAdmin || purchasedCourseIds.has(course.id) || (isSubscriber && isFreeCourse);
                            return <CourseCard key={course.id} course={course} hasAccess={hasAccess} onClick={() => setSelectedCourseId(course.id)} onBuy={() => setCourseToBuy(course)} />;
                        })}
                    </div>
                     {filteredCourses && filteredCourses.length === 0 && !isLoading && (
                        <div className="col-span-full text-center py-10">
                            <p className="text-neutral-500">No courses match your current filters.</p>
                        </div>
                    )}
                </section>
            </main>
            {courseToBuy && (
                <Elements stripe={stripePromise}>
                    <PurchaseCourseModal course={courseToBuy} onClose={() => setCourseToBuy(null)} onPurchaseSubmitted={handlePurchaseSubmitted} isVerifying={isVerifyingPurchase} />
                </Elements>
            )}
        </>
    );
};