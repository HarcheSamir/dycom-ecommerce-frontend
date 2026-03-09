import type { FC } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCourse } from '../../hooks/useTraining';
import { CourseDisplay } from './CourseDisplay';

interface CourseDetailViewProps {
    courseId: string;
    initialVideoId?: string | null;
    onBack: () => void;
}

export const CourseDetailView: FC<CourseDetailViewProps> = ({ courseId, initialVideoId, onBack }) => {
    const { t } = useTranslation();
    const { data: course, isLoading, isError, error } = useCourse(courseId);

    if (isLoading && !course) {
        return <p className="text-center text-neutral-400 p-10">{t('trainingPage.detailView.loading')}</p>;
    }

    // Handle 403 errors with specific messages
    const axiosError = error as any;
    if (axiosError?.response?.status === 403) {
        const reason = axiosError.response.data?.reason;
        const message = axiosError.response.data?.error || 'Accès refusé.';
        const purchase = axiosError.response.data?.purchase;

        const iconMap: Record<string, string> = {
            INSTALLMENT_EXPIRED: '⚠️',
            ACCESS_REVOKED: '🚫',
            NO_PURCHASE: '🔒',
            NO_SUBSCRIPTION: '🔒',
        };

        return (
            <main className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center bg-[#1C1E22] border border-neutral-800 rounded-2xl p-8 space-y-5">
                    <div className="text-5xl">{iconMap[reason] || '🔒'}</div>
                    <h2 className="text-xl font-bold text-white">Accès Restreint</h2>
                    <p className="text-neutral-400 text-sm leading-relaxed">{message}</p>

                    {/* Installment details */}
                    {purchase && (
                        <div className="bg-black/30 rounded-xl p-4 space-y-3 text-left border border-neutral-800">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500">Versements</span>
                                <span className="font-bold text-white">{purchase.installmentsPaid} / {purchase.installmentsRequired} payés</span>
                            </div>
                            <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${purchase.installmentsPaid >= purchase.installmentsRequired ? 'bg-green-500' : 'bg-orange-500'}`}
                                    style={{ width: purchase.installmentsRequired > 0 ? `${Math.min(100, (purchase.installmentsPaid / purchase.installmentsRequired) * 100)}%` : '0%' }}
                                />
                            </div>
                            {purchase.currentPeriodEnd && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-500">Échéance</span>
                                    <span className="text-red-400 font-medium">{new Date(purchase.currentPeriodEnd).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-500">Statut</span>
                                <span className={`font-bold text-xs px-2 py-0.5 rounded ${purchase.status === 'PAST_DUE' ? 'bg-red-500/10 text-red-400' : 'bg-neutral-500/10 text-neutral-400'}`}>
                                    {purchase.status === 'PAST_DUE' ? 'EN RETARD' : purchase.status === 'REVOKED' ? 'RÉVOQUÉ' : purchase.status}
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onBack}
                        className="mt-2 px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                        <FaChevronLeft size={10} /> Retour aux formations
                    </button>
                </div>
            </main>
        );
    }

    if (isError && !course) {
        return <p className="text-center text-red-500 p-10">{t('trainingPage.detailView.error')}</p>;
    }

    return (
        <main className="flex-1 p-0 md:p-8">
            {/* Desktop Navigation & Header (Hidden on Mobile) */}
            <div className="hidden md:block mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                    <FaChevronLeft />
                    <span>{t('trainingPage.detailView.backButton')}</span>
                </button>
            </div>

            {course && (
                <div className="hidden md:block mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">{course.title}</h1>
                    <p className="text-neutral-400">{course.description}</p>
                </div>
            )}

            {course && (
                <CourseDisplay
                    course={course}
                    initialVideoId={initialVideoId}
                    onBack={onBack} // Passed for the mobile overlay back button
                />
            )}
        </main>
    );
};