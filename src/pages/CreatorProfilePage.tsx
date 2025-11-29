// src/pages/CreatorProfilePage.tsx

import React, { useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreator, useRecordVisit } from '../hooks/useContentCreator';
import { FaArrowLeft, FaMapMarkerAlt, FaInstagram, FaYoutube, FaEnvelope, FaHeart, FaTh, FaUserFriends, FaExternalLinkAlt, FaCopy } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-8' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative h-full ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

const StatBox: FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-[#111317] border border-neutral-800 rounded-2xl p-6 flex flex-col items-center text-center hover:border-neutral-600 transition-colors">
        <div className="mb-3 text-neutral-400 text-2xl">{icon}</div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <p className="text-sm text-neutral-400">{label}</p>
    </div>
);

export const CreatorProfilePage: FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: creator, isLoading, isError } = useCreator(id);
    const { mutate: recordVisit } = useRecordVisit();

    useEffect(() => {
        if (id) {
            recordVisit(id);
        }
    }, [id, recordVisit]);

    if (isLoading) {
        return (
            <main className="flex-1 flex items-center justify-center p-6 md:p-8">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-neutral-500"></div>
            </main>
        );
    }

    if (isError || !creator) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 space-y-4">
                <p className="text-red-400 text-lg">{t('creatorProfile.notFound')}</p>
                <button onClick={() => navigate(-1)} className="text-white hover:underline flex items-center gap-2">
                    <FaArrowLeft /> {t('creatorProfile.backToSearch')}
                </button>
            </main>
        );
    }

    const formatNumber = (num: number | null | undefined) => {
        if (num === null || num === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
    };

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.nickname || creator.username || 'A')}&background=2a2a2a&color=fff&size=256`;

    const handleCopyEmail = () => {
        if (creator.email) {
            navigator.clipboard.writeText(creator.email);
            toast.success(t('creatorProfile.emailCopied'));
        }
    };

    return (
        <>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1C1E22', color: '#fff', border: '1px solid #374151' } }} />
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-4">
                    <FaArrowLeft />
                    <span>{t('creatorProfile.backToSearch')}</span>
                </button>

                {/* Header Section */}
                <GlassCard className="relative">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-purple-500 to-pink-500">
                                <img src={avatarUrl} alt={creator.nickname || ''} className="w-full h-full rounded-full object-cover border-4 border-[#111317]" />
                            </div>
                            {creator.region?.flag && (
                                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full overflow-hidden border-2 border-[#111317] shadow-lg" title={creator.region.countryName || ''}>
                                    <img src={creator.region.flag} alt="flag" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="flex-grow text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-white">{creator.nickname || creator.username}</h1>
                                {creator.niche && (
                                    <span className="inline-block px-3 py-1 rounded-full bg-[#1C1E22] border border-neutral-700 text-neutral-300 text-xs font-semibold self-center">
                                        {creator.niche.name}
                                    </span>
                                )}
                            </div>
                            <p className="text-neutral-400 text-lg mb-4">@{creator.username}</p>
                            
                            {creator.bio && (
                                <p className="text-neutral-300 max-w-2xl mx-auto md:mx-0 mb-6 leading-relaxed">
                                    {creator.bio}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                {creator.profileLink && (
                                    <a href={creator.profileLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors">
                                        <FaExternalLinkAlt size={14} />
                                        <span>{t('creatorProfile.visitTikTok')}</span>
                                    </a>
                                )}
                                {creator.email && (
                                    <button onClick={handleCopyEmail} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold hover:bg-neutral-800 transition-colors">
                                        <FaEnvelope />
                                        <span>{creator.email}</span>
                                        <FaCopy className="text-neutral-500 ml-2" size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatBox label={t('creatorProfile.followers')} value={formatNumber(creator.followers)} icon={<FaUserFriends className="text-blue-400" />} />
                    <StatBox label={t('creatorProfile.totalLikes')} value={formatNumber(creator.likes)} icon={<FaHeart className="text-red-400" />} />
                    <StatBox label={t('creatorProfile.totalPosts')} value={formatNumber(creator.posts)} icon={<FaTh className="text-purple-400" />} />
                </div>

                {/* Additional Details & Socials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard>
                        <h3 className="text-xl font-bold text-white mb-6">{t('creatorProfile.locationAndDetails')}</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-between border-b border-neutral-800 pb-3">
                                <span className="text-neutral-400 flex items-center gap-2"><FaMapMarkerAlt /> {t('creatorProfile.country')}</span>
                                <span className="text-white font-medium flex items-center gap-2">
                                    {creator.region?.flag && <img src={creator.region.flag} alt="" className="w-5 h-auto" />}
                                    {creator.region?.countryName || creator.country || 'N/A'}
                                </span>
                            </li>
                             <li className="flex items-center justify-between border-b border-neutral-800 pb-3">
                                <span className="text-neutral-400 flex items-center gap-2"><FaUserFriends /> {t('creatorProfile.niche')}</span>
                                <span className="text-white font-medium">{creator.niche?.name || t('creatorProfile.general')}</span>
                            </li>
                        </ul>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-xl font-bold text-white mb-6">{t('creatorProfile.socialChannels')}</h3>
                        <div className="flex flex-col gap-4">
                            {creator.instagram ? (
                                <a href={creator.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-[#1C1E22] border border-neutral-800 hover:border-neutral-600 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center text-white">
                                            <FaInstagram size={20} />
                                        </div>
                                        <span className="text-white font-medium">{t('creatorProfile.instagram')}</span>
                                    </div>
                                    <FaExternalLinkAlt className="text-neutral-500 group-hover:text-white transition-colors" />
                                </a>
                            ) : (
                                <div className="p-4 rounded-xl bg-[#1C1E22]/50 border border-neutral-800/50 flex items-center gap-4 opacity-50">
                                     <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500">
                                            <FaInstagram size={20} />
                                    </div>
                                    <span className="text-neutral-500">{t('creatorProfile.instagramNotLinked')}</span>
                                </div>
                            )}

                            {creator.youtube ? (
                                <a href={creator.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-[#1C1E22] border border-neutral-800 hover:border-neutral-600 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white">
                                            <FaYoutube size={20} />
                                        </div>
                                        <span className="text-white font-medium">{t('creatorProfile.youtube')}</span>
                                    </div>
                                    <FaExternalLinkAlt className="text-neutral-500 group-hover:text-white transition-colors" />
                                </a>
                            ) : (
                                 <div className="p-4 rounded-xl bg-[#1C1E22]/50 border border-neutral-800/50 flex items-center gap-4 opacity-50">
                                     <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500">
                                            <FaYoutube size={20} />
                                    </div>
                                    <span className="text-neutral-500">{t('creatorProfile.youtubeNotLinked')}</span>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </main>
        </>
    );
};