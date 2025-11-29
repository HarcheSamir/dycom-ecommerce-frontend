// src/pages/SearchPage.tsx

import React, { useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import { useSearchCreators, type Creator, type SearchParams } from '../hooks/useContentCreator';
import { FaSearch, FaUsers, FaMapMarkerAlt, FaInstagram, FaYoutube, FaGlobe, FaChevronDown, FaEnvelope } from 'react-icons/fa';
import { useRegions } from '../hooks/useRegions';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next'; // Added import

const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 hover:border-neutral-700 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

const InfluencerCard: FC<{ creator: Creator }> = ({ creator }) => {
    const { t } = useTranslation(); // Hook usage
    const formatNumber = (num: number | null | undefined) => {
        if (num === null || num === undefined) return 'N/A';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toString();
    };

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.nickname || creator.username || 'A')}&background=2a2a2a&color=fff&size=128`;
    const category = creator.niche?.name || "Général";

    const handleCopyEmail = () => {
        if (creator.email) {
            navigator.clipboard.writeText(creator.email);
            toast.success(t('creatorProfile.emailCopied')); // Use existing translation
        }
    };

    return (
        <GlassCard padding="p-5">
            <div className="flex items-center gap-4 mb-4">
                <img src={avatarUrl} alt={creator.nickname || ''} className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <h3 className="text-lg font-bold text-white">{creator.nickname || creator.username}</h3>
                    <p className="text-sm text-neutral-400">@{creator.username || 'username'}</p>
                </div>
            </div>
            <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#1C1E22] border border-neutral-700 text-neutral-300 mb-4">{category}</span>
            <hr className="border-neutral-800" />
            <div className="grid grid-cols-1 gap-4 text-center my-4">
                <div>
                    <p className="text-sm text-neutral-400">{t('creatorProfile.followers')}</p> {/* Used existing translation */}
                    <p className="font-bold text-white mt-1 text-2xl">{formatNumber(creator.followers)}</p>
                </div>
            </div>
            <hr className="border-neutral-800" />
            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-neutral-400 flex items-center gap-2">
                    <FaMapMarkerAlt />
                    {creator.region?.flag && <img src={creator.region.flag} alt={creator.region.countryName || ''} className="w-5 h-auto " />}
                    <span className="truncate">{creator.region?.countryName || creator.country || 'N/A'}</span>
                </p>
                <div className="flex items-center gap-2">
                    {creator.email && (
                        <div className="relative group">
                            <button
                                onClick={handleCopyEmail}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1C1E22] border border-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <FaEnvelope />
                            </button>
                             {/* Tooltip */}
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 text-xs font-medium text-white bg-neutral-900 border border-neutral-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-xl">
                                {creator.email}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-700"></div>
                            </div>
                        </div>
                    )}
                    {creator.instagram && <a href={creator.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1C1E22] border border-neutral-700 text-neutral-400 hover:text-white"><FaInstagram /></a>}
                    {creator.youtube && <a href={creator.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1C1E22] border border-neutral-700 text-neutral-400 hover:text-white"><FaYoutube /></a>}
                </div>
            </div>
            {/* Link with translation */}
            <Link to={`/dashboard/influencers/${creator.id}`} className="w-full mt-5 h-11 flex items-center justify-center rounded-lg bg-gray-200 text-black font-semibold transition-colors hover:bg-gray-300">
                {t('searchPage.viewProfile')}
            </Link>
        </GlassCard>
    );
};

export const DatabasePage: FC = () => {
    const [filters, setFilters] = useState<SearchParams>({ keyword: '', country: '', page: 1, limit: 12 });
    const [tempKeyword, setTempKeyword] = useState('');

    const { data: searchData, isLoading: isSearching, isError } = useSearchCreators(filters);
    const { data: regions, isLoading: isLoadingRegions } = useRegions();

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, keyword: tempKeyword, page: 1 }));
    };

    const handleCountryChange = (countryCode: string) => {
        setFilters(prev => ({ ...prev, country: countryCode, page: 1 }));
    };

    const creators = searchData?.data || [];

    return (
        <>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1C1E22', color: '#fff', border: '1px solid #374151' } }} />
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
                <div>
                    <h1 className="text-4xl font-bold text-white">Hub Influenceurs</h1>
                    <p className="text-neutral-400 mt-1">Trouvez et contactez les meilleurs influenceurs pour promouvoir vos produits</p>
                </div>

                <GlassCard padding="p-5">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative w-full flex-grow">
                            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Rechercher des influenceurs..."
                                className="w-full bg-[#111317] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                value={tempKeyword}
                                onChange={(e) => setTempKeyword(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                            />
                        </div>

                        <div className="relative w-full md:w-64">
                            <FaGlobe className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500 pointer-events-none z-10" />
                            <select
                                value={filters.country}
                                onChange={(e) => handleCountryChange(e.target.value)}
                                disabled={isLoadingRegions}
                                className="w-full appearance-none bg-[#111317] border border-neutral-700 rounded-lg h-12 pl-11 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                <option value="">Tous les pays</option>
                                {Array.isArray(regions) && regions.map(region => (
                                    <option key={region.id} value={region.name}>
                                        {region.countryName}
                                    </option>
                                ))}
                            </select>
                            <FaChevronDown className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                        </div>
                    </div>
                </GlassCard>

                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Résultats de la recherche</h2>
                    </div>
                    {isSearching && <p className="text-center text-neutral-400">Recherche des influenceurs...</p>}
                    {isError && <p className="text-center text-red-500">Erreur lors de la recherche.</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {creators.length > 0 ? creators.map(creator => (
                            <InfluencerCard key={creator.id} creator={creator} />
                        )) : isSearching ? (
                            Array(6).fill(null).map((_, i) => <GlassCard key={i} className="h-96 animate-pulse"><div/></GlassCard>)
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-neutral-500">Aucun influenceur trouvé pour les filtres actuels.</p>
                            </div>
                        )}
                    </div>
                    {searchData && searchData.meta.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-10">
                            <button onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))} disabled={searchData.meta.page <= 1} className="px-4 py-2 rounded-lg bg-[#1C1E22] text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
                            <span className="text-sm text-neutral-400">Page {searchData.meta.page} sur {searchData.meta.totalPages}</span>
                            <button onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))} disabled={searchData.meta.page >= searchData.meta.totalPages} className="px-4 py-2 rounded-lg bg-[#1C1E22] text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
};