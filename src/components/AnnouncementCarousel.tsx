import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useActiveAnnouncements, useDismissAnnouncement, type ActiveAnnouncement } from '../hooks/useAnnouncements';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '../hooks/useUser';

// ============================================================
// GRADIENT MAP
// ============================================================

const GRADIENTS: Record<string, string> = {
    purple: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6d28d9 100%)',
    blue: 'linear-gradient(135deg, #2563eb 0%, #0891b2 50%, #1d4ed8 100%)',
    green: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #047857 100%)',
    red: 'linear-gradient(135deg, #dc2626 0%, #e11d48 50%, #b91c1c 100%)',
    gold: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #b45309 100%)',
};

// ============================================================
// CAROUSEL COMPONENT
// ============================================================

export const AnnouncementCarousel = ({ previewAnnouncement }: { previewAnnouncement?: ActiveAnnouncement | null }) => {
    const { data: announcements } = useActiveAnnouncements();
    const { data: userProfile } = useUserProfile();
    const dismissMutation = useDismissAnnouncement();
    const [dismissedLocally, setDismissedLocally] = useState<Set<string>>(new Set());
    const [currentIndex, setCurrentIndex] = useState(0);

    const isPreview = previewAnnouncement && previewAnnouncement.type === 'CAROUSEL';

    // --- ADMIN HIDE (unless previewing) ---
    if (userProfile?.accountType === 'ADMIN' && !isPreview) return null;

    const carousels = isPreview
        ? [previewAnnouncement as ActiveAnnouncement]
        : (announcements || []).filter((a) => a.type === 'CAROUSEL' && !dismissedLocally.has(a.id));

    // Auto-advance
    useEffect(() => {
        if (carousels.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % carousels.length);
        }, 6000); // 6 seconds per slide
        return () => clearInterval(interval);
    }, [carousels.length]);

    if (carousels.length === 0) return null;

    // Reset index if it goes out of bounds after a dismiss
    if (currentIndex >= carousels.length) {
        setCurrentIndex(0);
        return null;
    }

    const currentSlide = carousels[currentIndex];

    const handleDismiss = (id: string) => {
        setDismissedLocally((prev) => new Set(prev).add(id));
        dismissMutation.mutate(id);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + carousels.length) % carousels.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % carousels.length);
    };

    const gradient = currentSlide.colorScheme === 'custom' && currentSlide.customGradient
        ? currentSlide.customGradient
        : GRADIENTS[currentSlide.colorScheme || 'purple'] || GRADIENTS.purple;

    const isExternalUrl = currentSlide.ctaUrl?.startsWith('http');

    return (
        <div className="w-full mb-8 relative group">
            <div className="overflow-hidden rounded-2xl shadow-2xl relative bg-[#0a0a0a] border border-neutral-800">

                {/* Background Image/Gradient setup */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="flex flex-col md:flex-row min-h-[280px]"
                    >
                        {/* Image Side (Shows on left for larger screens, top for mobile) */}
                        {currentSlide.imageUrl && (
                            <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden flex-shrink-0">
                                <img
                                    src={currentSlide.imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent to-[#0a0a0a]" />
                            </div>
                        )}

                        {/* Content Side */}
                        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center relative z-10">

                            {/* Eyebrow Label */}
                            <div className="mb-4">
                                <span
                                    className="inline-block px-3 py-1 text-xs font-bold rounded-full text-white"
                                    style={{ background: gradient }}
                                >
                                    Nouveauté
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                {currentSlide.headline}
                            </h2>

                            {currentSlide.description && (
                                <p className="text-neutral-400 text-sm md:text-base mb-6 line-clamp-3 max-w-2xl">
                                    {currentSlide.description}
                                </p>
                            )}

                            {/* CTA */}
                            {currentSlide.ctaText && currentSlide.ctaUrl && (
                                <div className="mt-auto pt-2">
                                    {isExternalUrl ? (
                                        <a
                                            href={currentSlide.ctaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-transform transform hover:scale-[1.02]"
                                        >
                                            {currentSlide.ctaText}
                                        </a>
                                    ) : (
                                        <Link
                                            to={currentSlide.ctaUrl}
                                            className="inline-block px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-transform transform hover:scale-[1.02]"
                                        >
                                            {currentSlide.ctaText}
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Controls (Bottom Right) */}
                {carousels.length > 1 && (
                    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                        {/* Dots */}
                        <div className="flex gap-1.5 mr-2">
                            {carousels.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/30 hover:bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>
                        {/* Arrows */}
                        <button
                            onClick={handlePrev}
                            className="p-1.5 rounded-md bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-sm"
                        >
                            <FaChevronLeft size={10} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-1.5 rounded-md bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-sm"
                        >
                            <FaChevronRight size={10} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
