// src/pages/AdminResourcesPage.tsx

import { useState, type FC, type FormEvent } from 'react';
import {
    useAdminCategories, useAdminResources, useCreateCategory, useUpdateCategory,
    useDeleteCategory, useUploadResource, useCreateUrlResource, useUpdateResource,
    useDeleteResource, formatFileSize, type ResourceCategory, type Resource
} from '../hooks/useResources';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
    FaPlus, FaTimes, FaEdit, FaTrash, FaUpload, FaLink, FaFolderOpen,
    FaFilePdf, FaFileExcel, FaFileWord, FaFileCode, FaFileImage, FaFileArchive, FaFile,
    FaEye, FaEyeSlash, FaCheck
} from 'react-icons/fa';

// Icon mapping for display
const getResourceIcon = (resource: Resource) => {
    if (resource.type === 'URL') return <FaLink className="text-cyan-400" />;

    const mimeType = resource.mimeType || '';
    if (mimeType.includes('pdf')) return <FaFilePdf className="text-red-400" />;
    if (mimeType.includes('csv') || mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FaFileExcel className="text-green-400" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FaFileWord className="text-blue-400" />;
    if (mimeType.includes('json')) return <FaFileCode className="text-yellow-400" />;
    if (mimeType.includes('image')) return <FaFileImage className="text-purple-400" />;
    if (mimeType.includes('zip')) return <FaFileArchive className="text-orange-400" />;
    return <FaFile className="text-neutral-400" />;
};

// Glass Card Component
const GlassCard: FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-[#1C1E22] border border-neutral-800 rounded-2xl p-6 ${className}`}>
        {children}
    </div>
);

// Modal Component
const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative bg-[#1C1E22] border border-neutral-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white">
                        <FaTimes />
                    </button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

// Category Form
const CategoryForm: FC<{ category?: ResourceCategory; onClose: () => void }> = ({ category, onClose }) => {
    const [name, setName] = useState(category?.name || '');
    const [description, setDescription] = useState(category?.description || '');
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (category) {
                await updateCategory.mutateAsync({ id: category.id, name, description });
                toast.success('Catégorie mise à jour');
            } else {
                await createCategory.mutateAsync({ name, description });
                toast.success('Catégorie créée');
            }
            onClose();
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-neutral-400 mb-1">Nom *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#111317] border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                />
            </div>
            <div>
                <label className="block text-sm text-neutral-400 mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-[#111317] border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500 resize-none"
                />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-neutral-400 hover:text-white">
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={createCategory.isPending || updateCategory.isPending}
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 disabled:opacity-50"
                >
                    {category ? 'Mettre à jour' : 'Créer'}
                </button>
            </div>
        </form>
    );
};

// Upload Resource Form
const UploadResourceForm: FC<{ categories: ResourceCategory[]; onClose: () => void }> = ({ categories, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
    const [file, setFile] = useState<File | null>(null);
    const [isPublished, setIsPublished] = useState(true);
    const uploadResource = useUploadResource();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Veuillez sélectionner un fichier');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('categoryId', categoryId);
        formData.append('isPublished', String(isPublished));

        try {
            await uploadResource.mutateAsync(formData);
            toast.success('Fichier uploadé avec succès');
            onClose();
        } catch (error) {
            toast.error('Erreur lors de l\'upload');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-neutral-400 mb-1">Fichier * (max 10MB)</label>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    accept=".pdf,.csv,.json,.txt,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.zip"
                    className="w-full px-4 py-2 bg-[#111317] border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-neutral-700 file:text-white"
                />
                {file && <p className="text-xs text-neutral-500 mt-1">{file.name} ({formatFileSize(file.size)})</p>}
            </div>
            <div>
                <label className="block text-sm text-neutral-400 mb-1">Titre *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#111317] border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                />
            </div>
            <div>
                <label className="block text-sm text-neutral-400 mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-[#111317] border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500 resize-none"
                />
            </div>
            <div>
                <label className="block text-sm text-neutral-400 mb-1">Catégorie *</label>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#111317] border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                >
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="isPublished" className="text-sm text-neutral-400">Publier immédiatement</label>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-neutral-400 hover:text-white">
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={uploadResource.isPending}
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 disabled:opacity-50"
                >
                    {uploadResource.isPending ? 'Upload en cours...' : 'Uploader'}
                </button>
            </div>
        </form>
    );
};

// URL Resource Form
const UrlResourceForm: FC<{ categories: ResourceCategory[]; onClose: () => void }> = ({ categories, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [externalUrl, setExternalUrl] = useState('');
    const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
    const [isPublished, setIsPublished] = useState(true);
    const createUrlResource = useCreateUrlResource();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await createUrlResource.mutateAsync({ title, description, externalUrl, categoryId, isPublished });
            toast.success('Lien ajouté avec succès');
            onClose();
        } catch (error) {
            toast.error('Erreur lors de la création');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-neutral-400 mb-1">URL *</label>
                <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    required
                    placeholder="https://"
                    className="w-full px-4 py-2 bg-[#111317] border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                />
            </div>
            <div>
                <label className="block text-sm text-neutral-400 mb-1">Titre *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#111317] border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                />
            </div>
            <div>
                <label className="block text-sm text-neutral-400 mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 bg-[#111317] border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500 resize-none"
                />
            </div>
            <div>
                <label className="block text-sm text-neutral-400 mb-1">Catégorie *</label>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-[#111317] border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                >
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isPublishedUrl"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4"
                />
                <label htmlFor="isPublishedUrl" className="text-sm text-neutral-400">Publier immédiatement</label>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-neutral-400 hover:text-white">
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={createUrlResource.isPending}
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 disabled:opacity-50"
                >
                    Ajouter
                </button>
            </div>
        </form>
    );
};

// Main Admin Resources Page
export const AdminResourcesPage: FC = () => {
    const { t } = useTranslation();
    const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
    const { data: resources, isLoading: resourcesLoading } = useAdminResources();

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ResourceCategory | null>(null);

    const deleteCategory = useDeleteCategory();
    const deleteResource = useDeleteResource();
    const updateResource = useUpdateResource();

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!confirm(`Supprimer la catégorie "${name}" et tous ses fichiers ?`)) return;
        try {
            await deleteCategory.mutateAsync(id);
            toast.success('Catégorie supprimée');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleDeleteResource = async (id: string, title: string) => {
        if (!confirm(`Supprimer "${title}" ?`)) return;
        try {
            await deleteResource.mutateAsync(id);
            toast.success('Ressource supprimée');
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleTogglePublish = async (resource: Resource) => {
        try {
            await updateResource.mutateAsync({ id: resource.id, isPublished: !resource.isPublished });
            toast.success(resource.isPublished ? 'Ressource masquée' : 'Ressource publiée');
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const isLoading = categoriesLoading || resourcesLoading;

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestion des Ressources</h1>
                    <p className="text-neutral-400 mt-1">Gérez les fichiers et liens partagés avec vos utilisateurs</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1C1E22] border border-neutral-700 rounded-lg text-white hover:bg-neutral-800"
                    >
                        <FaFolderOpen /> Nouvelle catégorie
                    </button>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        disabled={!categories?.length}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1C1E22] border border-neutral-700 rounded-lg text-white hover:bg-neutral-800 disabled:opacity-50"
                    >
                        <FaUpload /> Uploader fichier
                    </button>
                    <button
                        onClick={() => setShowUrlModal(true)}
                        disabled={!categories?.length}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 disabled:opacity-50"
                    >
                        <FaLink /> Ajouter lien
                    </button>
                </div>
            </div>

            {/* Categories Section */}
            <GlassCard className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Catégories ({categories?.length || 0})</h2>
                {isLoading ? (
                    <div className="animate-pulse space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-neutral-800 rounded" />)}
                    </div>
                ) : !categories?.length ? (
                    <p className="text-neutral-500">Aucune catégorie. Créez-en une pour commencer.</p>
                ) : (
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-[#111317] rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FaFolderOpen className="text-neutral-400" />
                                    <span className="text-white font-medium">{cat.name}</span>
                                    <span className="text-xs text-neutral-500">({cat._count?.resources || 0} ressources)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }}
                                        className="p-2 text-neutral-400 hover:text-white"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                        className="p-2 text-neutral-400 hover:text-red-400"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>

            {/* Resources Section */}
            <GlassCard>
                <h2 className="text-lg font-semibold text-white mb-4">Ressources ({resources?.length || 0})</h2>
                {isLoading ? (
                    <div className="animate-pulse space-y-2">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-neutral-800 rounded" />)}
                    </div>
                ) : !resources?.length ? (
                    <p className="text-neutral-500">Aucune ressource. Uploadez un fichier ou ajoutez un lien.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-700">
                                    <th className="text-left py-3 px-2 text-neutral-400 font-medium text-sm">Ressource</th>
                                    <th className="text-left py-3 px-2 text-neutral-400 font-medium text-sm">Catégorie</th>
                                    <th className="text-left py-3 px-2 text-neutral-400 font-medium text-sm">Type</th>
                                    <th className="text-left py-3 px-2 text-neutral-400 font-medium text-sm">Taille</th>
                                    <th className="text-left py-3 px-2 text-neutral-400 font-medium text-sm">Statut</th>
                                    <th className="text-right py-3 px-2 text-neutral-400 font-medium text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resources.map(resource => (
                                    <tr key={resource.id} className="border-b border-neutral-800 hover:bg-[#111317]">
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{getResourceIcon(resource)}</span>
                                                <div>
                                                    <p className="text-white font-medium">{resource.title}</p>
                                                    {resource.fileName && <p className="text-xs text-neutral-500">{resource.fileName}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className="text-sm text-neutral-400">{resource.category?.name}</span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className={`text-xs px-2 py-1 rounded ${resource.type === 'FILE' ? 'bg-blue-900/30 text-blue-400' : 'bg-cyan-900/30 text-cyan-400'}`}>
                                                {resource.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className="text-sm text-neutral-400">{formatFileSize(resource.fileSize)}</span>
                                        </td>
                                        <td className="py-3 px-2">
                                            <button
                                                onClick={() => handleTogglePublish(resource)}
                                                className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${resource.isPublished ? 'bg-green-900/30 text-green-400' : 'bg-neutral-700 text-neutral-400'}`}
                                            >
                                                {resource.isPublished ? <><FaEye /> Publié</> : <><FaEyeSlash /> Masqué</>}
                                            </button>
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            <button
                                                onClick={() => handleDeleteResource(resource.id, resource.title)}
                                                className="p-2 text-neutral-400 hover:text-red-400"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </GlassCard>

            {/* Modals */}
            <Modal
                isOpen={showCategoryModal}
                onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
                title={editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            >
                <CategoryForm
                    category={editingCategory || undefined}
                    onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
                />
            </Modal>

            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Uploader un fichier">
                {categories && <UploadResourceForm categories={categories} onClose={() => setShowUploadModal(false)} />}
            </Modal>

            <Modal isOpen={showUrlModal} onClose={() => setShowUrlModal(false)} title="Ajouter un lien">
                {categories && <UrlResourceForm categories={categories} onClose={() => setShowUrlModal(false)} />}
            </Modal>
        </main>
    );
};

export default AdminResourcesPage;
