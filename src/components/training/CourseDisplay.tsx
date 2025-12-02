import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import { FaChevronRight, FaBook, FaCheckCircle, FaPlayCircle, FaClock, FaInfoCircle, FaArrowLeft, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { GlassCard } from '../GlassCard';
import VimeoPlayer from '../VimeoPlayer';
import { useUpdateVideoProgress, type VideoCourse } from '../../hooks/useTraining';

interface CourseDisplayProps {
    course: VideoCourse;
    initialVideoId?: string | null;
    onBack?: () => void;
}

export const CourseDisplay: FC<CourseDisplayProps> = ({ course, initialVideoId, onBack }) => {
    const { t } = useTranslation();
    const { mutate: updateProgress } = useUpdateVideoProgress();
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
        // Grid Layout for Desktop, Block/Fixed for Mobile
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8 w-full">
            
            {/* 
                VIDEO WRAPPER
                Mobile: FIXED at top (z-50)
                Desktop: STATIC (in grid flow)
                Using CSS classes to switch modes ensures component isn't remounted
            */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#111317] shadow-xl lg:static lg:bg-transparent lg:shadow-none lg:col-span-2 lg:block">
                
                {/* 1. THE VIDEO PLAYER */}
                <div className="w-full aspect-video bg-black relative lg:rounded-2xl lg:overflow-hidden lg:shadow-2xl lg:shadow-black/30">
                    <VimeoPlayer
                        key={activeVideo.id}
                        vimeoId={activeVideo.vimeoId}
                        initialTime={initialTime}
                        onProgress={handleProgressUpdate}
                        onEnded={handleVideoEnded}
                    />
                    
                    {/* Mobile Back Button (Hidden on Desktop) */}
                    <button 
                        onClick={onBack}
                        className="lg:hidden absolute top-4 left-4 w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform z-20"
                    >
                        <FaArrowLeft size={14} />
                    </button>
                </div>

                {/* 2. MOBILE CONTROLS (Hidden on Desktop) */}
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

                {/* 3. DESKTOP CONTROLS & DESC (Hidden on Mobile) */}
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

            {/* 
                MOBILE SPACER 
                Pushes content down because the video header is fixed.
                Hidden on Desktop.
                Calculation: 100vw * (9/16) aspect ratio = 56.25vw + approx 90px for title bar
            */}
            <div className="lg:hidden" style={{ marginTop: 'calc(56.25vw + 100px)' }}></div>

            {/* RIGHT COLUMN / MOBILE CONTENT AREA */}
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

                        {/* Video List */}
                        <div className="overflow-y-auto pr-0 lg:pr-2 custom-scrollbar flex-1 space-y-6 min-h-0 pb-20 lg:pb-0">
                            {course.sections.map((section) => (
                                <div key={section.id}>
                                    <div className="flex items-center gap-2 font-bold text-neutral-400 text-xs uppercase tracking-wider mb-3 px-2 pt-2 lg:pt-0">
                                        <FaBook /> {section.title}
                                    </div>
                                    <ul className="space-y-1">
                                        {section.videos.map((video) => {
                                            const prog = video.progress?.[0];
                                            const isCompleted = prog?.completed;
                                            const isActive = activeVideo.id === video.id;
                                            const percentage = prog?.percentage || 0;

                                            return (
                                                <li key={video.id}>
                                                    <button
                                                        onClick={() => handleVideoChange(video.id)}
                                                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                                                            isActive
                                                                ? 'bg-primary text-white shadow-lg shadow-primary/25 ring-1 ring-primary/50'
                                                                : 'hover:bg-white/5 text-neutral-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-1 text-lg flex-shrink-0 ${isActive ? 'text-white' : isCompleted ? 'text-green-500' : 'text-neutral-600'}`}>
                                                                {isCompleted ? <FaCheckCircle /> : <FaPlayCircle />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm font-medium leading-tight truncate ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
                                                                    {video.title}
                                                                </p>
                                                                <div className="flex justify-between items-center mt-2">
                                                                    {video.duration && (
                                                                        <span className={`text-xs flex items-center gap-1 ${isActive ? 'text-white/80' : 'text-neutral-500'}`}>
                                                                            <FaClock size={10} /> {video.duration} min
                                                                        </span>
                                                                    )}
                                                                    {percentage > 0 && !isCompleted && (
                                                                        <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-primary'}`}>
                                                                            {percentage}%
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};