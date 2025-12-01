import type { FC } from 'react';
import { FaPlayCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../GlassCard';
import type { VideoCourse } from '../../hooks/useTraining';

interface CourseCardProps {
    course: VideoCourse;
    onClick: () => void;
    hasAccess: boolean;
    onBuy: () => void;
}

export const CourseCard: FC<CourseCardProps> = ({ course, onClick, hasAccess, onBuy }) => {
    const { t, i18n } = useTranslation();

    // Calculate percentage
    const progressPercent = course.totalVideos && course.totalVideos > 0
        ? Math.round(((course.completedVideos || 0) / course.totalVideos) * 100)
        : 0;

    const locale = i18n.language === 'fr' ? 'fr-FR' : (i18n.language === 'ar' ? 'ar-AE' : 'en-US');
    const isFree = course.price === 0 || course.price === null;
    const formattedPrice = !isFree && course.currency
        ? new Intl.NumberFormat(locale, { style: 'currency', currency: course.currency }).format(course.price!)
        : t('trainingPage.courseCard.free');

    return (
        <GlassCard className="flex flex-col h-full" padding="p-0">
            <div className={`flex flex-col h-full ${hasAccess ? 'cursor-pointer' : ''}`}>
                <div onClick={hasAccess ? onClick : undefined} className="relative w-full h-48 bg-[#1C1E22] rounded-t-3xl overflow-hidden group">
                    <img src={course.coverImageUrl || ''} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                    {/* Overlay Play Icon on Hover */}
                    {hasAccess && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <FaPlayCircle className="text-white text-5xl drop-shadow-lg" />
                        </div>
                    )}

                    {course.level && (<span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">{course.level}</span>)}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    {/* Progress Bar Section */}
                    {hasAccess && (
                        <div className="mb-4">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{t('trainingPage.courseDisplay.lessonsTitle', { completed: course.completedVideos || 0, total: course.totalVideos || 0 })}</span>
                                <span className="text-xs font-bold text-primary">{progressPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </div>
                    )}

                    <h3 className="font-bold text-white text-xl line-clamp-2 mb-2">{course.title}</h3>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-800">
                        {hasAccess ? (
                            <button onClick={onClick} className="w-full h-10 rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-medium hover:bg-neutral-800 transition-colors">
                                {progressPercent > 0 ? "Continuer" : "Commencer"}
                            </button>
                        ) : (
                            <>
                                <div>
                                    <p className="text-neutral-500 text-xs uppercase font-bold">{t('trainingPage.courseCard.priceLabel')}</p>
                                    <p className="text-white font-bold text-2xl">{formattedPrice}</p>
                                </div>
                                <button onClick={onBuy} className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${isFree ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
                                    {isFree ? t('trainingPage.courseCard.getFreeButton') : t('trainingPage.courseCard.buyButton')}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};