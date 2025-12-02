import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import { FaChevronRight, FaBook, FaCheckCircle, FaPlayCircle, FaClock, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
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
    
    // Accordion states for mobile
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
            // TRANSLATION APPLIED
            toast.success(t('trainingPage.toasts.lessonFinished'));
            setCurrentVideoId(nextVideo.id);
        } else {
            // TRANSLATION APPLIED
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

    // --- RENDER HELPERS ---
    const SyllabusList = ({ mobile = false }) => (
        <div className={`space-y-6 ${mobile ? 'pb-20' : ''}`}>
            {course.sections.map((section) => (
                <div key={section.id}>
                    <div className={`flex items-center gap-2 font-bold text-neutral-400 text-xs uppercase tracking-wider mb-3 px-2 ${mobile ? 'pt-2' : ''}`}>
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
    );

    return (
        <>
            {/* ================= MOBILE LAYOUT (Fixed Header) ================= */}
            <div className="md:hidden">
                <div className="fixed top-0 left-0 w-full z-[100] bg-[#111317] shadow-xl">
                    <div className="w-full aspect-video bg-black relative">
                        <VimeoPlayer
                            key={activeVideo.id}
                            vimeoId={activeVideo.vimeoId}
                            initialTime={initialTime}
                            onProgress={handleProgressUpdate}
                            onEnded={handleVideoEnded}
                        />
                        <button 
                            onClick={onBack}
                            className="absolute top-4 left-4 w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform"
                        >
                            <FaArrowLeft size={14} />
                        </button>
                    </div>

                    <div className="px-4 py-3 border-b border-neutral-800 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                            <h2 className="text-base font-bold text-white line-clamp-2 leading-tight">
                                {activeVideo.title}
                            </h2>
                            <button
                                onClick={handleVideoEnded}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-[10px] uppercase font-bold hover:bg-white/20 transition-colors"
                            >
                                {/* TRANSLATION APPLIED */}
                                <span>{t('trainingPage.next')}</span> <FaChevronRight size={10} />
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => setIsDescExpanded(!isDescExpanded)}
                            className="text-xs text-neutral-400 flex items-center gap-1 hover:text-white self-start"
                        >
                            {/* TRANSLATION APPLIED */}
                            <FaInfoCircle /> {isDescExpanded ? t('trainingPage.hideDetails') : t('trainingPage.showDetails')}
                        </button>
                        
                        {isDescExpanded && (
                            <div className="mt-1 text-xs text-neutral-400 bg-neutral-900/50 p-2 rounded-lg animate-[fadeIn-up_0.2s_ease-out]">
                                {/* TRANSLATION APPLIED */}
                                {activeVideo.description || t('adminPage.courseManagement.noDescription')}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginTop: 'calc(56.25vw + 90px)' }}></div>

                <div className="p-4 space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            {/* TRANSLATION APPLIED */}
                            <h3 className="text-lg font-bold text-white">{t('trainingPage.courseContent')}</h3>
                            {/* TRANSLATION APPLIED */}
                            <span className="text-xs text-neutral-500 font-mono">{t('trainingPage.lessonCounter', { current: currentIndex + 1, total: totalCount })}</span>
                        </div>
                        
                        <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden mb-4">
                            <div 
                                className="h-full bg-primary transition-all duration-500" 
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            ></div>
                        </div>

                        <SyllabusList mobile={true} />
                    </div>
                </div>
            </div>


            {/* ================= DESKTOP LAYOUT (Grid) ================= */}
            <div className="hidden md:grid lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2">
                    <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/30 mb-6">
                        <VimeoPlayer
                            key={activeVideo.id}
                            vimeoId={activeVideo.vimeoId}
                            initialTime={initialTime}
                            onProgress={handleProgressUpdate}
                            onEnded={handleVideoEnded}
                        />
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">{activeVideo.title}</h2>
                        <button
                            onClick={handleVideoEnded}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-colors"
                        >
                            {/* TRANSLATION APPLIED */}
                            <span>{t('trainingPage.markAsCompleted')}</span>
                            <FaChevronRight />
                        </button>
                    </div>

                    <GlassCard>
                        {/* TRANSLATION APPLIED */}
                        <h3 className="text-lg font-bold text-white mb-2">{t('adminPage.modals.common.description')}</h3>
                        <p className="text-neutral-400">{activeVideo.description || t('adminPage.courseManagement.noDescription')}</p>
                    </GlassCard>
                </div>

                <div className="lg:col-span-1 mt-8 lg:mt-0 lg:h-[80vh] lg:sticky lg:top-4">
                    <GlassCard className="h-full" padding="p-5">
                        <div className="flex flex-col h-full">
                            <div className="mb-4 px-2 flex-shrink-0">
                                {/* TRANSLATION APPLIED */}
                                <h3 className="text-lg font-bold text-white">{t('trainingPage.courseContent')}</h3>
                                {/* TRANSLATION APPLIED */}
                                <p className="text-sm text-neutral-400">{t('trainingPage.completedCount', { completed: completedCount, total: totalCount })}</p>
                            </div>
                            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-6 min-h-0">
                                <SyllabusList mobile={false} />
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </>
    );
};