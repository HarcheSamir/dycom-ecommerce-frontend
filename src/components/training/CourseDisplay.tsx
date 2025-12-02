import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import { FaChevronRight, FaBook, FaCheckCircle, FaPlayCircle, FaClock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom'; // <--- IMPORT THIS
import { GlassCard } from '../GlassCard';
import VimeoPlayer from '../VimeoPlayer';
import { useUpdateVideoProgress, type VideoCourse } from '../../hooks/useTraining';

interface CourseDisplayProps {
    course: VideoCourse;
    initialVideoId?: string | null;
}

export const CourseDisplay: FC<CourseDisplayProps> = ({ course, initialVideoId }) => {
    const { t } = useTranslation();
    const { mutate: updateProgress } = useUpdateVideoProgress();
    
    // --- HOOK FOR URL UPDATES ---
    const [_, setSearchParams] = useSearchParams();

    const allVideos = useMemo(() => course.sections.flatMap(section => section.videos), [course.sections]);

    const startVideoId = useMemo(() => {
        // 1. Priority: Specific video requested via URL
        if (initialVideoId) {
            const requested = allVideos.find(v => v.id === initialVideoId);
            if (requested) return requested.id;
        }

        // 2. Fallback: Resume Logic (First uncompleted)
        const firstUncompleted = allVideos.find(v => {
            const prog = v.progress?.[0];
            return !prog?.completed;
        });
        return firstUncompleted?.id || allVideos[0]?.id || '';
    }, [allVideos, initialVideoId]);

    const [currentVideoId, setCurrentVideoId] = useState<string>(startVideoId);

    const activeVideo = useMemo(() =>
        allVideos.find(v => v.id === currentVideoId) || allVideos[0],
    [allVideos, currentVideoId]);

    // --- NEW: SYNC URL WITH ACTIVE VIDEO ---
    useEffect(() => {
        if (activeVideo) {
            // Update the URL query param without reloading the page
            // replace: true ensures the back button works as expected (exits the course instead of rewinding video selection)
            setSearchParams({ video: activeVideo.id }, { replace: true });
        }
    }, [activeVideo, setSearchParams]);
    // ---------------------------------------

    const initialTime = useMemo(() => {
        if (!activeVideo?.progress || activeVideo.progress.length === 0) return 0;
        const prog = activeVideo.progress[0];
        return prog.completed ? 0 : prog.lastPosition;
    }, [activeVideo]);

    const handleProgressUpdate = useCallback((seconds: number, percent: number) => {
        if (!activeVideo) return;
        
        // Console log removed as per previous instructions to keep it clean
        // console.log(`[UI] Update...`); 
        
        updateProgress({
            videoId: activeVideo.id,
            lastPosition: seconds,
            percentage: percent
        });
    }, [activeVideo, updateProgress]);

    const handleVideoEnded = useCallback(() => {
        if (!activeVideo) return;
        
        updateProgress({
            videoId: activeVideo.id,
            lastPosition: 0,
            percentage: 100,
            completed: true
        });

        const currentIndex = allVideos.findIndex(v => v.id === activeVideo.id);
        if (currentIndex !== -1 && currentIndex < allVideos.length - 1) {
            const nextVideo = allVideos[currentIndex + 1];
            toast.success("Leçon terminée ! Lecture de la suivante...");
            setCurrentVideoId(nextVideo.id);
        } else {
            toast.success("Félicitations ! Cours terminé.");
        }
    }, [activeVideo, allVideos, updateProgress]);

    const handleVideoChange = (newVideoId: string) => {
        if (newVideoId === currentVideoId) return;
        setCurrentVideoId(newVideoId);
    };

    if (!activeVideo) return <div className="text-white text-center p-10">Aucune vidéo disponible.</div>;

    const completedCount = allVideos.filter(v => v.progress?.[0]?.completed).length;
    const totalCount = allVideos.length;

    return (
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
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
                        <span>Marquer comme terminé</span>
                        <FaChevronRight />
                    </button>
                </div>

                <GlassCard>
                    <h3 className="text-lg font-bold text-white mb-2">Description</h3>
                    <p className="text-neutral-400">{activeVideo.description || "Aucune description disponible."}</p>
                </GlassCard>
            </div>

            <div className="lg:col-span-1 mt-8 lg:mt-0 lg:h-[80vh] lg:sticky lg:top-4">
                <GlassCard className="h-full" padding="p-5">
                    <div className="flex flex-col h-full">
                        <div className="mb-4 px-2 flex-shrink-0">
                            <h3 className="text-lg font-bold text-white">Programme</h3>
                            <p className="text-sm text-neutral-400">{completedCount} / {totalCount} leçons terminées</p>
                        </div>

                        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-6 min-h-0">
                            {course.sections.map((section) => (
                                <div key={section.id}>
                                    <h4 className="font-bold text-neutral-500 text-xs uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                                        <FaBook /> {section.title}
                                    </h4>
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
                                                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                                : 'hover:bg-white/5 text-neutral-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`mt-1 text-lg ${isActive ? 'text-white' : isCompleted ? 'text-green-500' : 'text-neutral-600'}`}>
                                                                {isCompleted ? <FaCheckCircle /> : <FaPlayCircle />}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-sm font-medium leading-tight ${isActive ? 'text-white' : 'text-neutral-300 group-hover:text-white'}`}>
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