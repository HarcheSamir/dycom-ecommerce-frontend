import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import VimeoPlayer from './VimeoPlayer';
import { useMarkWelcomeSeen } from '../hooks/useUser';
import { FaRocket, FaLock } from 'react-icons/fa';

interface WelcomeModalProps {
    onClose: () => void;
}

export const WelcomeModal = ({ onClose }: WelcomeModalProps) => {
    const { t } = useTranslation();
    const { mutate: markSeen, isPending } = useMarkWelcomeSeen();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [canClose, setCanClose] = useState(false);

    const handleClose = () => {
        markSeen(undefined, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const VIMEO_ID = "1151206665";

    return (
        // 1. BACKDROP
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            
            {/* 
                2. CINEMA CARD
                - max-w-5xl: Wide theater width.
                - max-h-[90vh]: Limits height so browser doesn't cut it off.
                - flex-col: Enables Sticky Footer logic.
            */}
            <div className="w-full max-w-5xl max-h-[90vh] bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden animate-[scale-in_0.3s_ease-out]">
                
                {/* Top Gradient Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 z-20 opacity-80" />

                {/* 3. HEADER (Pinned to Top) */}
                <div className="p-5 flex-shrink-0 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a] z-10 relative">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaRocket className="text-purple-500" />
                            {t('dashboard.welcomeModal.title')}
                        </h2>
                        <p className="text-neutral-500 text-xs mt-0.5">
                            {t('dashboard.welcomeModal.subtitle')}
                        </p>
                    </div>
                    <div className="hidden sm:block px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        Important
                    </div>
                </div>

                {/* 
                    4. THEATER SCREEN (Scrollable Middle)
                    - flex-1: Takes all remaining height.
                    - overflow-y-auto: Scrolls if video is too tall.
                    - p-4 md:p-8: SAFETY PADDING to prevent control clipping.
                */}
                <div className="flex-1 overflow-y-auto bg-black flex flex-col items-center justify-center min-h-0 custom-scrollbar p-4 md:p-8">
                    
                    {/* Video Wrapper - No overflow-hidden here to allow buttons to pop */}
                    <div className="sm:w-[70%] w-full shadow-2xl bg-neutral-900 rounded-lg">
                        <VimeoPlayer 
                            vimeoId={VIMEO_ID} 
                            onProgress={() => {}} 
                            onEnded={() => setCanClose(true)} 
                            initialTime={0}
                            autoplay={true}
                        />
                    </div>

                </div>

                {/* 5. FOOTER (Pinned to Bottom) */}
                <div className="p-5 border-t border-white/5 bg-[#0a0a0a] flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 relative">
                    
                    <div className="flex items-center gap-2 text-xs text-neutral-500 order-2 sm:order-1">
                        <FaLock className="text-neutral-600" />
                        <span>{t('dashboard.welcomeModal.secureNote', "Accès sécurisé")}</span>
                    </div>

                    <button
                        onClick={handleClose}
                        disabled={isPending}
                        className="order-1 sm:order-2 w-full sm:w-auto px-8 py-3 bg-white text-black font-bold text-sm sm:text-base rounded-lg hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? t('common.loading') : t('dashboard.welcomeModal.accessButton')}
                    </button>
                </div>

            </div>
        </div>
    );
};