import { useState, useMemo, type FC } from 'react';
import { useCourses, type VideoCourse } from '../hooks/useTraining';
import { useUserProfile } from '../hooks/useUser';
import { FaSort, FaGlobe, FaBookReader, FaSearch } from 'react-icons/fa';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Imported Components
import { CourseCard } from '../components/training/CourseCard';
import { PurchaseCourseModal } from '../components/training/PurchaseCourseModal';
import { CourseDetailView } from '../components/training/CourseDetailView';
import { FilterDropdown } from '../components/training/FilterDropdown';
import { FilterButton } from '../components/training/FilterButton';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

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

    const sortOptions = [{ value: 'createdAt', label: 'Sort by Recency' }, { value: 'title', label: 'Sort by Name (A-Z)' }];
    const languageOptions = [{ value: '', label: 'Default Language' }, { value: 'ALL', label: 'All Languages' }, { value: 'EN', label: 'English' }, { value: 'FR', label: 'Français' }, { value: 'AR', label: 'Arabic' }];

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