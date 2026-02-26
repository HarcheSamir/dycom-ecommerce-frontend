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

    const progressPercent = course.totalVideos && course.totalVideos > 0
        ? Math.round(((course.completedVideos || 0) / course.totalVideos) * 100)
        : 0;

    const locale = i18n.language === 'fr' ? 'fr-FR' : (i18n.language === 'ar' ? 'ar-AE' : 'en-US');
    const isFree = course.price === 0 || course.price === null;

    // If user has no access to a free course, show the academy price (980€) instead of "Free"
    const showAcademyPrice = isFree && !hasAccess;
    const formattedPrice = showAcademyPrice
        ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'eur' }).format(980)
        : (!isFree && course.currency
            ? new Intl.NumberFormat(locale, { style: 'currency', currency: course.currency }).format(course.price!)
            : t('trainingPage.courseCard.free'));

    return (
        <GlassCard className="flex flex-col h-full" padding="p-0">
            <div
                onClick={hasAccess ? onClick : undefined}
                className={`flex flex-col h-full ${hasAccess ? 'cursor-pointer' : ''}`}
            >
                <div className="relative w-full h-48 bg-[#1C1E22] rounded-t-3xl overflow-hidden group">
                    <img src={course.coverImageUrl || ''} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                    {/* --- BADGE LOGIC --- */}
                    {course.isNew ? (
                        <div className="absolute top-3 right-3 bg-purple-600 border border-purple-400 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-pulse z-10">
                            NOUVEAU
                        </div>
                    ) : course.hasNewContent ? (
                        <div className="absolute top-3 right-3 bg-blue-600 border border-blue-400 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10">
                            NOUVEAU CONTENU
                        </div>
                    ) : null}

                    {hasAccess && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <FaPlayCircle className="text-white text-5xl drop-shadow-lg" />
                        </div>
                    )}

                    {course.level && (<span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">{course.level}</span>)}
                </div>

                <div className="p-5 flex flex-col flex-grow">
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
                            <button className="w-full h-10 cursor-pointer rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-medium hover:bg-neutral-800 transition-colors">
                                {progressPercent > 0 ? t('trainingPage.courseCard.continue') : t('trainingPage.courseCard.begin')}
                            </button>
                        ) : (
                            <>
                                <div>
                                    <p className="text-neutral-500 text-xs uppercase font-bold">{t('trainingPage.courseCard.priceLabel')}</p>
                                    <p className="text-white font-bold text-2xl">{formattedPrice}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onBuy();
                                    }}
                                    className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${(isFree && !showAcademyPrice) ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                                >
                                    {(isFree && !showAcademyPrice) ? t('trainingPage.courseCard.getFreeButton') : t('trainingPage.courseCard.buyButton')}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};