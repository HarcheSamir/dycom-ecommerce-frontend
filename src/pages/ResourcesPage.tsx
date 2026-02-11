// src/pages/ResourcesPage.tsx

import { useState, type FC } from 'react';
import { useResources, formatFileSize, type ResourceCategory, type Resource } from '../hooks/useResources';
import { useTranslation } from 'react-i18next';
import {
    FaFolderOpen, FaDownload, FaExternalLinkAlt, FaFilePdf, FaFileExcel, FaFileWord,
    FaFileCode, FaFileImage, FaFileArchive, FaFile, FaLink, FaSearch
} from 'react-icons/fa';

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
    FaFilePdf: <FaFilePdf className="text-red-400" />,
    FaFileExcel: <FaFileExcel className="text-green-400" />,
    FaFileWord: <FaFileWord className="text-blue-400" />,
    FaFileCode: <FaFileCode className="text-yellow-400" />,
    FaFileImage: <FaFileImage className="text-purple-400" />,
    FaFileArchive: <FaFileArchive className="text-orange-400" />,
    FaFile: <FaFile className="text-neutral-400" />,
    FaLink: <FaLink className="text-cyan-400" />,
};

const getResourceIcon = (resource: Resource) => {
    if (resource.type === 'URL') return iconMap.FaLink;

    const mimeType = resource.mimeType || '';
    if (mimeType.includes('pdf')) return iconMap.FaFilePdf;
    if (mimeType.includes('csv') || mimeType.includes('excel') || mimeType.includes('spreadsheet')) return iconMap.FaFileExcel;
    if (mimeType.includes('word') || mimeType.includes('document')) return iconMap.FaFileWord;
    if (mimeType.includes('json')) return iconMap.FaFileCode;
    if (mimeType.includes('image')) return iconMap.FaFileImage;
    if (mimeType.includes('zip')) return iconMap.FaFileArchive;
    return iconMap.FaFile;
};

// Glass Card Component
const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-2xl transition-all duration-300 hover:border-neutral-700 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative h-full ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

// Resource Card Component
const ResourceCard: FC<{ resource: Resource }> = ({ resource }) => {
    const { t } = useTranslation();

    const handleClick = () => {
        if (resource.type === 'URL' && resource.externalUrl) {
            window.open(resource.externalUrl, '_blank', 'noopener,noreferrer');
        } else if (resource.type === 'FILE' && resource.fileUrl) {
            // Force download for Cloudinary files (images/PDFs)
            // Raw files (zips, etc) download automatically usually, and transformations might break raw URLs
            let downloadUrl = resource.fileUrl;
            if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/') && !downloadUrl.includes('/raw/upload/')) {
                downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
            }
            window.open(downloadUrl, '_blank');
        }
    };

    return (
        <GlassCard padding="p-0" className="cursor-pointer hover:-translate-y-1">
            <div onClick={handleClick} className="p-5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1C1E22] border border-neutral-700 text-2xl flex-shrink-0">
                        {getResourceIcon(resource)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{resource.title}</h3>
                        {resource.description && (
                            <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{resource.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3 text-xs text-neutral-500">
                            {resource.type === 'FILE' && resource.fileSize && (
                                <span>{formatFileSize(resource.fileSize)}</span>
                            )}
                            {resource.fileName && (
                                <span className="truncate max-w-[150px]">{resource.fileName}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-black hover:bg-gray-300 transition-colors">
                            {resource.type === 'URL' ? <FaExternalLinkAlt /> : <FaDownload />}
                        </button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

// Category Section Component
const CategorySection: FC<{ category: ResourceCategory }> = ({ category }) => {
    if (!category.resources || category.resources.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1C1E22] border border-neutral-700 text-neutral-400">
                    <FaFolderOpen />
                </div>
                <h2 className="text-xl font-bold text-white">{category.name}</h2>
                <span className="text-sm text-neutral-500">({category.resources.length})</span>
            </div>
            {category.description && (
                <p className="text-neutral-400 mb-4 ml-11">{category.description}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-11">
                {category.resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                ))}
            </div>
        </div>
    );
};

// Main Resources Page
export const ResourcesPage: FC = () => {
    const { t } = useTranslation();
    const { data: categories, isLoading, error } = useResources();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Filter resources
    const filteredCategories = categories?.map(cat => ({
        ...cat,
        resources: cat.resources?.filter(res => {
            const matchesSearch = !searchTerm ||
                res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                res.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || cat.id === selectedCategory;
            return matchesSearch && matchesCategory;
        })
    })).filter(cat => cat.resources && cat.resources.length > 0);

    const totalResources = categories?.reduce((sum, cat) => sum + (cat.resources?.length || 0), 0) || 0;

    if (error) {
        return (
            <main className="flex-1 p-6 md:p-8">
                <GlassCard className="text-center">
                    <p className="text-red-400">{t('resources.error', 'Failed to load resources')}</p>
                </GlassCard>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white">{t('resources.title', 'Ressources')}</h1>
                <p className="text-neutral-400 mt-1">{t('resources.subtitle', 'Téléchargez des guides, templates et outils')}</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                        type="text"
                        placeholder={t('resources.searchPlaceholder', 'Rechercher...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-[#1C1E22] border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedCategory
                            ? 'bg-gray-200 text-black'
                            : 'bg-[#1C1E22] text-neutral-400 border border-neutral-700 hover:text-white'
                            }`}
                    >
                        {t('resources.allCategories', 'Toutes')} ({totalResources})
                    </button>
                    {categories?.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.id
                                ? 'bg-gray-200 text-black'
                                : 'bg-[#1C1E22] text-neutral-400 border border-neutral-700 hover:text-white'
                                }`}
                        >
                            {cat.name} ({cat.resources?.length || 0})
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <GlassCard key={i} padding="p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-neutral-800 animate-pulse" />
                                <div className="flex-1">
                                    <div className="h-5 w-3/4 bg-neutral-800 rounded animate-pulse mb-2" />
                                    <div className="h-4 w-1/2 bg-neutral-800 rounded animate-pulse" />
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && (!filteredCategories || filteredCategories.length === 0) && (
                <GlassCard className="text-center py-16">
                    <FaFolderOpen className="text-5xl text-neutral-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">{t('resources.noResources', 'Aucune ressource disponible')}</h3>
                    <p className="text-neutral-400">{t('resources.noResourcesDesc', 'Les ressources seront bientôt disponibles.')}</p>
                </GlassCard>
            )}

            {/* Resources by Category */}
            {!isLoading && filteredCategories?.map(category => (
                <CategorySection key={category.id} category={category} />
            ))}
        </main>
    );
};

export default ResourcesPage;
