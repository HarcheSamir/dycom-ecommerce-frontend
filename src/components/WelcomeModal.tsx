import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GlassCard } from './GlassCard';
import VimeoPlayer from './VimeoPlayer';
import { useMarkWelcomeSeen } from '../hooks/useUser';
import { FaRocket } from 'react-icons/fa';

interface WelcomeModalProps {
    onClose: () => void;
}

export const WelcomeModal = ({ onClose }: WelcomeModalProps) => {
    const { t } = useTranslation();
    const { mutate: markSeen, isPending } = useMarkWelcomeSeen();
    const [canClose, setCanClose] = useState(false);

    const handleClose = () => {
        markSeen(undefined, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    // VIMEO ID provided
    const VIMEO_ID = "1151206665";

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <div className="w-full max-w-4xl animate-[scale-in_0.3s_ease-out]">
                <GlassCard className="border-t border-purple-500/50 shadow-2xl shadow-purple-900/20">
                    
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-3">
                            <FaRocket className="text-purple-500" />
                            {t('dashboard.welcomeModal.title')}
                        </h2>
                        <p className="text-neutral-400 mt-2 font-medium">
                            {t('dashboard.welcomeModal.subtitle')}
                        </p>
                    </div>

                    {/* Video Container - 16:9 Aspect Ratio */}
                    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-black  mb-8">
                        <VimeoPlayer 
                            vimeoId={VIMEO_ID} 
                            onProgress={() => {}} 
                            onEnded={() => setCanClose(true)} 
                            initialTime={0}
                            autoplay={true} // <--- ENABLE AUTOPLAY
                        />
                    </div>

                    {/* Footer Action */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleClose}
                            disabled={isPending}
                            className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-brand-purple to-brand-magenta hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? t('common.loading') : t('dashboard.welcomeModal.accessButton')}
                        </button>
                    </div>

                </GlassCard>
            </div>
        </div>
    );
};