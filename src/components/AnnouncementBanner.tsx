import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { useActiveAnnouncements, useDismissAnnouncement, type ActiveAnnouncement } from '../hooks/useAnnouncements';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserProfile } from '../hooks/useUser';

// ============================================================
// COLOR SCHEME GRADIENTS
// ============================================================

const GRADIENTS: Record<string, string> = {
    purple: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6d28d9 100%)',
    blue: 'linear-gradient(135deg, #2563eb 0%, #0891b2 50%, #1d4ed8 100%)',
    green: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #047857 100%)',
    red: 'linear-gradient(135deg, #dc2626 0%, #e11d48 50%, #b91c1c 100%)',
    gold: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #b45309 100%)',
};

// ============================================================
// ANNOUNCEMENT BANNER COMPONENT
// ============================================================

export const AnnouncementBanner = ({ previewAnnouncement, onPreviewDismiss }: { previewAnnouncement?: ActiveAnnouncement | null, onPreviewDismiss?: () => void }) => {
    const { data: announcements } = useActiveAnnouncements();
    const { data: userProfile } = useUserProfile();
    const [dismissedLocally, setDismissedLocally] = useState<Set<string>>(() => {
        try {
            const stored = sessionStorage.getItem('dismissed_banners');
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    });

    // --- PREVIEW OVERRIDE ---
    if (previewAnnouncement && previewAnnouncement.type === 'BANNER') {
        return (
            <div className="fixed top-0 inset-x-0 z-[9999]">
                <BannerItem
                    banner={previewAnnouncement}
                    onDismiss={() => {
                        if (onPreviewDismiss) onPreviewDismiss();
                    }}
                />
            </div>
        );
    }

    // --- ADMIN HIDE ---
    if (userProfile?.accountType === 'ADMIN') return null;

    const banners = (announcements || []).filter(
        (a) => a.type === 'BANNER' && !dismissedLocally.has(a.id)
    );

    if (banners.length === 0) return null;

    const handleDismiss = (id: string) => {
        setDismissedLocally((prev) => {
            const next = new Set(prev).add(id);
            try {
                sessionStorage.setItem('dismissed_banners', JSON.stringify(Array.from(next)));
            } catch {
                // Ignore storage errors
            }
            return next;
        });
    };

    return (
        <div className="space-y-0">
            <AnimatePresence>
                {banners.map((banner) => (
                    <BannerItem key={banner.id} banner={banner} onDismiss={handleDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
};

// ============================================================
// SINGLE BANNER ITEM
// ============================================================

const BannerItem = ({
    banner,
}: {
    banner: ActiveAnnouncement;
    onDismiss?: (id: string) => void;
}) => {
    const [showDetails, setShowDetails] = useState(false);

    const gradient = banner.colorScheme === 'custom' && banner.customGradient
        ? banner.customGradient
        : GRADIENTS[banner.colorScheme || 'purple'] || GRADIENTS.purple;

    const isExternalUrl = banner.ctaUrl?.startsWith('http');

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
        >
            <div
                className="relative"
                style={{ background: gradient }}
            >
                {/* Background image overlay */}
                {banner.imageUrl && (
                    <div className="absolute inset-0">
                        <img
                            src={banner.imageUrl}
                            alt=""
                            className="w-full h-full object-cover opacity-15"
                        />
                        <div className="absolute inset-0" style={{ background: gradient, opacity: 0.85 }} />
                    </div>
                )}

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-3.5">
                    {/* Content */}
                    <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-white font-bold text-sm">
                            {banner.headline}
                        </p>
                        {banner.description && (
                            <div className="mt-0.5 flex items-end gap-2">
                                <p className="text-white/80 text-xs line-clamp-1">
                                    {banner.description}
                                </p>
                                {/* Only show "Voir plus" if there is a description */}
                                <button
                                    onClick={() => setShowDetails(true)}
                                    className="text-xs font-semibold text-white hover:underline whitespace-nowrap opacity-90"
                                >
                                    Voir plus
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 flex-shrink-0">
                        {banner.ctaText && banner.ctaUrl && (
                            isExternalUrl ? (
                                <a
                                    href={banner.ctaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-lg border border-transparent shadow-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                                >
                                    {banner.ctaText}
                                </a>
                            ) : (
                                <Link
                                    to={banner.ctaUrl}
                                    className="px-4 py-1.5 bg-white text-black text-xs font-bold rounded-lg border border-transparent shadow-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                                >
                                    {banner.ctaText}
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Popup Modal for "Voir plus" */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
                        onClick={() => setShowDetails(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl max-w-2xl w-full relative shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Top Gradient Line to match announcement color */}
                            <div className="absolute top-0 left-0 right-0 h-1 z-20 opacity-90" style={{ background: gradient }} />

                            <button
                                onClick={() => setShowDetails(false)}
                                className="absolute top-4 right-4 z-30 p-2 rounded-lg bg-black/50 text-white/60 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                                aria-label="Fermer"
                            >
                                <FaTimes size={14} />
                            </button>

                            {/* Scrollable Content Area */}
                            <div className="p-8 md:p-10 flex-1 overflow-y-auto custom-scrollbar">
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 pr-8 leading-tight">
                                    {banner.headline}
                                </h3>

                                <div className="text-neutral-400 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                                    {banner.description}
                                </div>

                                {banner.ctaText && banner.ctaUrl && (
                                    <div className="mt-10 flex justify-center md:justify-start">
                                        {isExternalUrl ? (
                                            <a
                                                href={banner.ctaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] shadow-lg shadow-white/10"
                                                onClick={() => setShowDetails(false)}
                                            >
                                                {banner.ctaText}
                                            </a>
                                        ) : (
                                            <Link
                                                to={banner.ctaUrl}
                                                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] shadow-lg shadow-white/10"
                                                onClick={() => setShowDetails(false)}
                                            >
                                                {banner.ctaText}
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
