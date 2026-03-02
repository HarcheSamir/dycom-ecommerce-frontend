import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { useActiveAnnouncements, useDismissAnnouncement, type ActiveAnnouncement } from '../hooks/useAnnouncements';
import VimeoPlayer from './VimeoPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '../hooks/useUser';

// ============================================================
// GRADIENT MAP
// ============================================================

const BORDER_COLORS: Record<string, string> = {
    purple: 'from-purple-600 via-indigo-600 to-purple-600',
    blue: 'from-blue-600 via-cyan-600 to-blue-600',
    green: 'from-green-600 via-emerald-600 to-green-600',
    red: 'from-red-600 via-rose-600 to-red-600',
    gold: 'from-yellow-500 via-amber-500 to-yellow-500',
};

// ============================================================
// ANNOUNCEMENT MODAL COMPONENT
// ============================================================

export const AnnouncementModal = ({ previewAnnouncement, onPreviewDismiss }: { previewAnnouncement?: ActiveAnnouncement | null, onPreviewDismiss?: () => void }) => {
    const { data: announcements } = useActiveAnnouncements();
    const { data: userProfile } = useUserProfile();
    const [dismissedLocally, setDismissedLocally] = useState<Set<string>>(() => {
        try {
            const stored = sessionStorage.getItem('dismissed_modals');
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    });

    // --- PREVIEW OVERRIDE ---
    if (previewAnnouncement && previewAnnouncement.type === 'MODAL') {
        return (
            <AnimatePresence>
                <ModalContent
                    key="preview"
                    announcement={previewAnnouncement}
                    onDismiss={() => {
                        if (onPreviewDismiss) {
                            onPreviewDismiss();
                        }
                    }}
                />
            </AnimatePresence>
        );
    }

    // --- ADMIN HIDE ---
    if (userProfile?.accountType === 'ADMIN') return null;

    // Get the highest-priority MODAL type that hasn't been dismissed
    const modals = (announcements || []).filter(
        (a) => a.type === 'MODAL' && !dismissedLocally.has(a.id)
    );

    // Show only the top-priority modal
    const activeModal = modals[0] || null;

    const handleDismiss = (id: string) => {
        setDismissedLocally((prev) => {
            const next = new Set(prev).add(id);
            try {
                sessionStorage.setItem('dismissed_modals', JSON.stringify(Array.from(next)));
            } catch {
                // Ignore storage errors
            }
            return next;
        });
    };

    return (
        <AnimatePresence>
            {activeModal && (
                <ModalContent
                    key={activeModal.id}
                    announcement={activeModal}
                    onDismiss={handleDismiss}
                />
            )}
        </AnimatePresence>
    );
};

// ============================================================
// MODAL CONTENT
// ============================================================

const ModalContent = ({
    announcement,
    onDismiss,
}: {
    announcement: ActiveAnnouncement;
    onDismiss: (id: string) => void;
}) => {
    const borderGradient = BORDER_COLORS[announcement.colorScheme || 'purple'] || BORDER_COLORS.purple;
    const isExternalUrl = announcement.ctaUrl?.startsWith('http');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => announcement.isDismissible && onDismiss(announcement.id)}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-2xl max-h-[90vh] bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Gradient Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${borderGradient} z-20 opacity-80`} />

                {/* Close button */}
                {announcement.isDismissible && (
                    <button
                        onClick={() => onDismiss(announcement.id)}
                        className="absolute top-4 right-4 z-30 p-2 rounded-lg bg-black/50 text-white/60 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                        aria-label="Fermer"
                    >
                        <FaTimes size={14} />
                    </button>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Hero Image */}
                    {announcement.imageUrl && !announcement.videoVimeoId && (
                        <div className="w-full h-56 md:h-72 overflow-hidden">
                            <img
                                src={announcement.imageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                        </div>
                    )}

                    {/* Video */}
                    {announcement.videoVimeoId && (
                        <div className="p-4 md:p-8 pb-0">
                            <div className="w-full shadow-2xl bg-neutral-900 rounded-xl overflow-hidden">
                                <VimeoPlayer
                                    vimeoId={announcement.videoVimeoId}
                                    onProgress={() => { }}
                                    onEnded={() => { }}
                                    initialTime={0}
                                    autoplay={false}
                                />
                            </div>
                        </div>
                    )}

                    {/* Text Content */}
                    <div className="p-6 md:p-8 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                            {announcement.headline}
                        </h2>

                        {announcement.description && (
                            <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-6">
                                {announcement.description}
                            </p>
                        )}

                        {/* CTA Button */}
                        {announcement.ctaText && announcement.ctaUrl && (
                            isExternalUrl ? (
                                <a
                                    href={announcement.ctaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => announcement.isDismissible && onDismiss(announcement.id)}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] shadow-lg shadow-white/10"
                                >
                                    {announcement.ctaText}
                                </a>
                            ) : (
                                <Link
                                    to={announcement.ctaUrl}
                                    onClick={() => announcement.isDismissible && onDismiss(announcement.id)}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] shadow-lg shadow-white/10"
                                >
                                    {announcement.ctaText}
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
