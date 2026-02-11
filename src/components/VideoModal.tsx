import React from 'react';
import VimeoPlayer from './VimeoPlayer';
import { FaTimes, FaRocket } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    vimeoId: string;
    title?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, vimeoId, title }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-5xl max-h-[90vh] bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden animate-[scale-in_0.3s_ease-out]">

                {/* Top GRadient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 z-20 opacity-80" />

                {/* Header */}
                <div className="p-5 flex-shrink-0 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a] z-10 relative">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FaRocket className="text-purple-500" />
                            {title || t('dashboard.videoModal.title', "Academy Presentation")}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-black flex flex-col items-center justify-center min-h-0 custom-scrollbar p-4 md:p-8">
                    <div className="sm:w-[70%] w-full shadow-2xl bg-neutral-900 rounded-lg overflow-hidden">
                        <VimeoPlayer
                            vimeoId={vimeoId}
                            onProgress={() => { }}
                            onEnded={() => { }}
                            initialTime={0}
                            autoplay={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
