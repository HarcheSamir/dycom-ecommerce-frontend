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
    onDismiss,
}: {
    banner: ActiveAnnouncement;
    onDismiss: (id: string) => void;
}) => {
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
                            <p className="text-white/80 text-xs mt-0.5 line-clamp-1">
                                {banner.description}
                            </p>
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

                        {/* Always show dismiss for session-based testing/banner flow */}
                        <button
                            onClick={() => onDismiss(banner.id)}
                            className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-2"
                            aria-label="Fermer"
                        >
                            <FaTimes size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
