import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import { FaChevronRight, FaPlayCircle, FaCheckCircle, FaClock, FaInfoCircle, FaArrowLeft, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { GlassCard } from '../GlassCard';
import VimeoPlayer from '../VimeoPlayer';
import { useUpdateVideoProgress, useMarkSectionSeen, type VideoCourse } from '../../hooks/useTraining';

interface CourseDisplayProps {
    course: VideoCourse;
    initialVideoId?: string | null;
    onBack?: () => void;
}

export const CourseDisplay: FC<CourseDisplayProps> = ({ course, initialVideoId, onBack }) => {
    const { t } = useTranslation();
    const { mutate: updateProgress } = useUpdateVideoProgress();
    const { mutate: markSectionSeen } = useMarkSectionSeen(); // Added hook
    const [_, setSearchParams] = useSearchParams();

    // --- State & Memo ---
    const allVideos = useMemo(() => course.sections.flatMap(section => section.videos), [course.sections]);

    const startVideoId = useMemo(() => {
        if (initialVideoId) {
            const requested = allVideos.find(v => v.id === initialVideoId);
            if (requested) return requested.id;
        }
        const firstUncompleted = allVideos.find(v => {
            const prog = v.progress?.[0];
            return !prog?.completed;
        });
        return firstUncompleted?.id || allVideos[0]?.id || '';
    }, [allVideos, initialVideoId]);

    const [currentVideoId, setCurrentVideoId] = useState<string>(startVideoId);

    // Accordion state for Description (Mobile only)
    const [isDescExpanded, setIsDescExpanded] = useState(false);

    const activeVideo = useMemo(() =>
        allVideos.find(v => v.id === currentVideoId) || allVideos[0],
        [allVideos, currentVideoId]);

    useEffect(() => {
        if (activeVideo) {
            setSearchParams({ video: activeVideo.id }, { replace: true });
        }
    }, [activeVideo, setSearchParams]);

    // --- NEW: Accordion Logic for Sections ---
    const activeSectionId = useMemo(() =>
        course.sections.find(s => s.videos.some(v => v.id === currentVideoId))?.id,
        [course.sections, currentVideoId]
    );

    // Initialize with ALL section IDs so they are open by default
    const [expandedSections, setExpandedSections] = useState<Set<string>>(() =>
        new Set(course.sections.map(s => s.id))
    );

    // Ensure the section containing the active video stays open if changed externally
    useEffect(() => {
        if (activeSectionId) {
            setExpandedSections(prev => new Set(prev).add(activeSectionId));
        }
    }, [activeSectionId]);

    const toggleSection = (sectionId: string, isNew?: boolean) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(sectionId)) next.delete(sectionId);
            else {
                next.add(sectionId);
                // If the module was new, mark it as seen immediately upon expansion
                if (isNew) {
                    markSectionSeen(sectionId);
                }
            }
            return next;
        });
    };

    const initialTime = useMemo(() => {
        if (!activeVideo?.progress || activeVideo.progress.length === 0) return 0;
        const prog = activeVideo.progress[0];
        return prog.completed ? 0 : prog.lastPosition;
    }, [activeVideo]);

    // --- Handlers ---
    const handleProgressUpdate = useCallback((seconds: number, percent: number) => {
        if (!activeVideo) return;
        updateProgress({
            videoId: activeVideo.id,
            lastPosition: seconds,
            percentage: percent
        });
    }, [activeVideo, updateProgress]);

    const handleVideoEnded = useCallback(() => {
        if (!activeVideo) return;
        updateProgress({ videoId: activeVideo.id, lastPosition: 0, percentage: 100, completed: true });

        const currentIndex = allVideos.findIndex(v => v.id === activeVideo.id);
        if (currentIndex !== -1 && currentIndex < allVideos.length - 1) {
            const nextVideo = allVideos[currentIndex + 1];
            toast.success(t('trainingPage.toasts.lessonFinished'));
            setCurrentVideoId(nextVideo.id);
        } else {
            toast.success(t('trainingPage.toasts.courseFinished'));
        }
    }, [activeVideo, allVideos, updateProgress, t]);

    const handleVideoChange = (newVideoId: string) => {
        if (newVideoId === currentVideoId) return;
        setCurrentVideoId(newVideoId);

        if (window.innerWidth < 1024) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!activeVideo) return <div className="text-white text-center p-10">{t('adminPage.courseDetail.noVideos')}</div>;

    const completedCount = allVideos.filter(v => v.progress?.[0]?.completed).length;
    const totalCount = allVideos.length;
    const currentIndex = allVideos.findIndex(v => v.id === activeVideo.id);

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8 w-full">

            {/* VIDEO WRAPPER (Mobile: Fixed, Desktop: Static) */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#111317] shadow-xl lg:static lg:bg-transparent lg:shadow-none lg:col-span-2 lg:block">

                {/* THE VIDEO PLAYER */}
                <div className="w-full  bg-black relative lg:rounded-2xl lg:overflow-hidden lg:shadow-2xl lg:shadow-black/30">
                    <VimeoPlayer
                        key={activeVideo.id}
                        vimeoId={activeVideo.vimeoId}
                        initialTime={initialTime}
                        onProgress={handleProgressUpdate}
                        onEnded={handleVideoEnded}
                    />

                    {/* Mobile Back Button */}
                    <button
                        onClick={onBack}
                        className="lg:hidden absolute top-4 left-4 w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform z-20"
                    >
                        <FaArrowLeft size={14} />
                    </button>
                </div>

                {/* MOBILE CONTROLS */}
                <div className="lg:hidden px-4 py-3 border-b border-neutral-800 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                        <h2 className="text-base font-bold text-white line-clamp-2 leading-tight">
                            {activeVideo.title}
                        </h2>
                        <button
                            onClick={handleVideoEnded}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-[10px] uppercase font-bold hover:bg-white/20 transition-colors"
                        >
                            <span>{t('trainingPage.next')}</span> <FaChevronRight size={10} />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsDescExpanded(!isDescExpanded)}
                        className="text-xs text-neutral-400 flex items-center gap-1 hover:text-white self-start"
                    >
                        <FaInfoCircle /> {isDescExpanded ? t('trainingPage.hideDetails') : t('trainingPage.showDetails')}
                    </button>

                    {isDescExpanded && (
                        <div className="mt-1 text-xs text-neutral-400 bg-neutral-900/50 p-2 rounded-lg animate-[fadeIn-up_0.2s_ease-out]">
                            {activeVideo.description || t('adminPage.courseManagement.noDescription')}
                        </div>
                    )}
                </div>

                {/* DESKTOP CONTROLS & DESC */}
                <div className="hidden lg:block mt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">{activeVideo.title}</h2>
                        <button
                            onClick={handleVideoEnded}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-colors"
                        >
                            <span>{t('trainingPage.markAsCompleted')}</span>
                            <FaChevronRight />
                        </button>
                    </div>

                    <GlassCard>
                        <h3 className="text-lg font-bold text-white mb-2">{t('adminPage.modals.common.description')}</h3>
                        <p className="text-neutral-400">{activeVideo.description || t('adminPage.courseManagement.noDescription')}</p>
                    </GlassCard>
                </div>
            </div>

            {/* MOBILE SPACER */}
            <div className="lg:hidden" style={{ marginTop: 'calc(56.25vw + 100px)' }}></div>

            {/* RIGHT COLUMN: ACCORDION MENU */}
            <div className="lg:col-span-1 mt-0 lg:h-[80vh] lg:sticky lg:top-4 p-4 lg:p-0">

                {/* Mobile Header for List */}
                <div className="lg:hidden mb-4">
                    <div className="flex justify-between items-end mb-2">
                        <h3 className="text-lg font-bold text-white">{t('trainingPage.courseContent')}</h3>
                        <span className="text-xs text-neutral-500 font-mono">{t('trainingPage.lessonCounter', { current: currentIndex + 1, total: totalCount })}</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(completedCount / totalCount) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <GlassCard className="h-full rounded-none lg:rounded-3xl border-0 lg:border border-neutral-800 bg-transparent lg:bg-[rgba(255,255,255,0.05)]" padding="p-0 lg:p-5">
                    <div className="flex flex-col h-full">
                        {/* Desktop List Header */}
                        <div className="hidden lg:block mb-4 px-2 flex-shrink-0">
                            <h3 className="text-lg font-bold text-white">{t('trainingPage.courseContent')}</h3>
                            <p className="text-sm text-neutral-400">{t('trainingPage.completedCount', { completed: completedCount, total: totalCount })}</p>
                        </div>

                        {/* ACCORDION VIDEO LIST */}
                        <div className="overflow-y-auto pr-0 lg:pr-2 custom-scrollbar flex-1 space-y-3 min-h-0 pb-20 lg:pb-0">
                            {course.sections.map((section) => {
                                const isExpanded = expandedSections.has(section.id);
                                const completedInSection = section.videos.filter(v => v.progress?.[0]?.completed).length;
                                const totalInSection = section.videos.length;

                                return (
                                    <div key={section.id} className="overflow-hidden rounded-xl border border-neutral-800 bg-[#16181c] transition-colors hover:border-neutral-700">
                                        <button
                                            onClick={() => toggleSection(section.id, section.isNew)}
                                            className="flex w-full items-center justify-between bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
                                        >
                                            <div className="flex flex-col items-start pr-6">
                                                <div className='flex items-center gap-2'>
                                                    <span className="font-semibold text-white text-sm text-left">{section.title}</span>
                                                    {section.isNew && (
                                                        <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase animate-pulse">
                                                            NOUVEAU MODULE
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-neutral-400 font-medium tracking-wide mt-0.5">
                                                    {completedInSection} / {totalInSection} COMPLETED
                                                </span>
                                            </div>
                                            <FaChevronDown className={`text-neutral-500 transition-transform duration-300 flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} size={12} />
                                        </button>

                                        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <ul className="flex flex-col border-t border-neutral-800/50">
                                                {section.videos.map((video) => {
                                                    const isActive = activeVideo.id === video.id;
                                                    const isCompleted = video.progress?.[0]?.completed;

                                                    return (
                                                        <li key={video.id}>
                                                            <button
                                                                onClick={() => handleVideoChange(video.id)}
                                                                className={`group relative flex w-full items-center gap-3 border-l-[3px] px-4 py-3 transition-all
                                                                    ${isActive
                                                                        ? 'border-primary bg-primary/10'
                                                                        : 'border-transparent hover:bg-white/5'
                                                                    }`}
                                                            >
                                                                <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs transition-colors
                                                                    ${isCompleted
                                                                        ? 'bg-green-500/20 text-green-500'
                                                                        : isActive
                                                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                                                            : 'bg-neutral-800 text-neutral-500 group-hover:bg-neutral-700 group-hover:text-neutral-300'
                                                                    }`}
                                                                >
                                                                    {isCompleted ? <FaCheckCircle size={10} /> : <FaPlayCircle size={10} />}
                                                                </div>

                                                                <div className="flex flex-1 flex-col items-start gap-0.5 overflow-hidden">
                                                                    <div className="flex items-center gap-2 w-full">
                                                                        <span className={`truncate text-xs font-medium w-full text-left ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                                                                            {video.title}
                                                                        </span>
                                                                        {video.isNew && (
                                                                            <span className="ml-auto bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                                                                                NOUVELLE VIDÉO
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {video.duration && (
                                                                        <span className={`flex items-center gap-1 text-[10px] ${isActive ? 'text-primary/80' : 'text-neutral-500'}`}>
                                                                            <FaClock size={8} /> {video.duration} min
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                                {section.videos.length === 0 && (
                                                    <li className="px-4 py-3 text-xs text-neutral-500 italic text-center">
                                                        {t('adminPage.courseDetail.noVideos')}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};