import { useState, useRef, type FC } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
    FaBullhorn, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff,
    FaImage, FaVideo, FaTimes, FaEye, FaCalendarAlt, FaUsers,
    FaStar, FaChevronLeft, FaChevronRight, FaExternalLinkAlt
} from 'react-icons/fa';
import {
    useAdminAnnouncements,
    useCreateAnnouncement,
    useUpdateAnnouncement,
    useDeleteAnnouncement,
    useToggleAnnouncement,
    type Announcement,
} from '../hooks/useAnnouncements';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { AnnouncementModal } from '../components/AnnouncementModal';
import { AnnouncementCarousel } from '../components/AnnouncementCarousel';

// ============================================================
// COLOR SCHEME CONFIG
// ============================================================

const COLOR_SCHEMES: Record<string, { label: string; gradient: string; border: string; text: string }> = {
    purple: { label: 'Violet', gradient: 'from-purple-600 via-purple-700 to-indigo-800', border: 'border-purple-500/30', text: 'text-purple-300' },
    blue: { label: 'Bleu', gradient: 'from-blue-600 via-blue-700 to-cyan-800', border: 'border-blue-500/30', text: 'text-blue-300' },
    green: { label: 'Vert', gradient: 'from-green-600 via-emerald-700 to-teal-800', border: 'border-green-500/30', text: 'text-green-300' },
    red: { label: 'Rouge', gradient: 'from-red-600 via-rose-700 to-pink-800', border: 'border-red-500/30', text: 'text-red-300' },
    gold: { label: 'Or', gradient: 'from-yellow-500 via-amber-600 to-orange-700', border: 'border-yellow-500/30', text: 'text-yellow-300' },
    custom: { label: 'Personnalisé', gradient: '', border: 'border-neutral-500/30', text: 'text-neutral-300' },
};

const AUDIENCE_OPTIONS = [
    { value: 'ALL', label: 'Tous les utilisateurs' },
    { value: 'SUBSCRIBERS', label: 'Abonnés actifs' },
    { value: 'SMMA', label: 'SMMA uniquement' },
    { value: 'TRIALING', label: 'En période d\'essai' },
];

// ============================================================
// FORM STATE TYPE
// ============================================================

interface AnnouncementForm {
    title: string;
    headline: string;
    description: string;
    type: 'BANNER' | 'MODAL' | 'CAROUSEL';
    videoVimeoId: string;
    ctaText: string;
    ctaUrl: string;
    audience: string;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
    priority: number;
    isDismissible: boolean;
    colorScheme: string;
    customGradient: string;
}

const DEFAULT_FORM: AnnouncementForm = {
    title: '',
    headline: '',
    description: '',
    type: 'CAROUSEL',
    videoVimeoId: '',
    ctaText: '',
    ctaUrl: '',
    audience: 'ALL',
    startsAt: '',
    endsAt: '',
    isActive: true,
    priority: 0,
    isDismissible: false,
    colorScheme: 'purple',
    customGradient: '',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const AdminAnnouncementsPage: FC = () => {
    const [page, setPage] = useState(1);
    const { data: response, isLoading } = useAdminAnnouncements(page);
    const createMutation = useCreateAnnouncement();
    const updateMutation = useUpdateAnnouncement();
    const deleteMutation = useDeleteAnnouncement();
    const toggleMutation = useToggleAnnouncement();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<AnnouncementForm>(DEFAULT_FORM);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Open create modal
    const handleCreate = () => {
        setEditingId(null);
        setForm(DEFAULT_FORM);
        setImageFile(null);
        setImagePreview(null);
        setRemoveImage(false);
        setIsModalOpen(true);
    };

    // Open edit modal
    const handleEdit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setForm({
            title: announcement.title,
            headline: announcement.headline,
            description: announcement.description || '',
            type: announcement.type,
            videoVimeoId: announcement.videoVimeoId || '',
            ctaText: announcement.ctaText || '',
            ctaUrl: announcement.ctaUrl || '',
            audience: announcement.audience,
            startsAt: announcement.startsAt ? announcement.startsAt.slice(0, 16) : '',
            endsAt: announcement.endsAt ? announcement.endsAt.slice(0, 16) : '',
            isActive: announcement.isActive,
            priority: announcement.priority,
            isDismissible: announcement.isDismissible,
            colorScheme: announcement.colorScheme || 'purple',
            customGradient: announcement.customGradient || '',
        });
        setImageFile(null);
        setImagePreview(announcement.imageUrl || null);
        setRemoveImage(false);
        setIsModalOpen(true);
    };

    // Handle image select
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setRemoveImage(false);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Submit form
    const handleSubmit = async () => {
        if (!form.title.trim() || !form.headline.trim()) {
            toast.error('Le titre et le headline sont requis.');
            return;
        }

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('headline', form.headline);
        formData.append('description', form.description);
        formData.append('type', form.type);
        formData.append('videoVimeoId', form.videoVimeoId);
        formData.append('ctaText', form.ctaText);
        formData.append('ctaUrl', form.ctaUrl);
        formData.append('audience', form.audience);
        formData.append('startsAt', form.startsAt || new Date().toISOString());
        formData.append('endsAt', form.endsAt || '');
        formData.append('isActive', String(form.isActive));
        formData.append('priority', String(form.priority));
        formData.append('isDismissible', form.type === 'MODAL' ? String(form.isDismissible) : 'false');
        formData.append('colorScheme', form.colorScheme);
        formData.append('customGradient', form.customGradient);

        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (removeImage) {
            formData.append('removeImage', 'true');
        }

        try {
            if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, formData });
                toast.success('Annonce mise à jour avec succès !');
            } else {
                await createMutation.mutateAsync(formData);
                toast.success('Annonce créée avec succès !');
            }
            setIsModalOpen(false);
        } catch {
            toast.error('Erreur lors de la sauvegarde.');
        }
    };

    // Preview
    const [previewItem, setPreviewItem] = useState<Announcement | null>(null);

    const handlePreviewClick = (announcement: Announcement) => {
        setPreviewItem(announcement);
        setTimeout(() => setPreviewItem(null), 5000);
    };

    // Toggle active
    const handleToggle = async (id: string) => {
        try {
            await toggleMutation.mutateAsync(id);
            toast.success('Statut mis à jour.');
        } catch {
            toast.error('Erreur lors du changement de statut.');
        }
    };

    // Delete
    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success('Annonce supprimée.');
            setDeleteConfirmId(null);
        } catch {
            toast.error('Erreur lors de la suppression.');
        }
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const announcements = response?.data || [];

    return (
        <>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1C1E22', color: '#fff', border: '1px solid #374151' } }} />

            {/* LIVE 5-SECOND PREVIEWS */}
            {previewItem?.type === 'BANNER' && <AnnouncementBanner previewAnnouncement={previewItem as any} onPreviewDismiss={() => setPreviewItem(null)} />}
            {previewItem?.type === 'MODAL' && <AnnouncementModal previewAnnouncement={previewItem as any} onPreviewDismiss={() => setPreviewItem(null)} />}
            {previewItem?.type === 'CAROUSEL' && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewItem(null)}>
                    <div className="w-full max-w-5xl" onClick={e => e.stopPropagation()}>
                        <AnnouncementCarousel previewAnnouncement={previewItem as any} />
                    </div>
                </div>
            )}

            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                            <FaBullhorn className="text-purple-400" />
                            Bandes Annonces
                        </h1>
                        <p className="text-neutral-400 mt-1">
                            Gérez les annonces affichées aux utilisateurs (bannières, modals et carrousels).
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-5 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all transform hover:scale-[1.02] shadow-lg"
                    >
                        <FaPlus /> Nouvelle Annonce
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border border-neutral-800 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-sm text-neutral-500">Total</p>
                        <p className="text-3xl font-bold text-white mt-1">{response?.total ?? '...'}</p>
                    </div>
                    <div className="border border-neutral-800 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-sm text-neutral-500">Actives</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">
                            {announcements.filter(a => a.isActive).length}
                        </p>
                    </div>
                    <div className="border border-neutral-800 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-sm text-neutral-500">Bannières / Modals / Carrousels</p>
                        <p className="text-3xl font-bold text-purple-400 mt-1">
                            {announcements.filter(a => a.type === 'BANNER').length} / {announcements.filter(a => a.type === 'MODAL').length} / {announcements.filter(a => a.type === 'CAROUSEL').length}
                        </p>
                    </div>
                </div>

                {/* List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="border border-neutral-800 rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <FaBullhorn className="text-4xl text-neutral-600 mx-auto mb-4" />
                        <p className="text-lg text-neutral-400 font-medium">Aucune annonce créée</p>
                        <p className="text-sm text-neutral-500 mt-1">Créez votre première bande annonce pour commencer.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => {
                            const scheme = COLOR_SCHEMES[announcement.colorScheme || 'purple'] || COLOR_SCHEMES.purple;
                            const isExpired = announcement.endsAt && new Date(announcement.endsAt) < new Date();
                            const isScheduled = new Date(announcement.startsAt) > new Date();

                            return (
                                <div
                                    key={announcement.id}
                                    className={`border rounded-2xl overflow-hidden transition-all hover:border-neutral-600 ${announcement.isActive ? scheme.border : 'border-neutral-800 opacity-60'
                                        }`}
                                    style={{ background: 'rgba(255,255,255,0.03)' }}
                                >
                                    <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* Image thumbnail */}
                                        {announcement.imageUrl && (
                                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-700">
                                                <img src={announcement.imageUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="text-white font-bold text-lg truncate">{announcement.title}</h3>
                                                {/* Type badge */}
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${announcement.type === 'BANNER'
                                                    ? 'text-blue-300 bg-blue-500/10 border-blue-500/30'
                                                    : announcement.type === 'MODAL'
                                                        ? 'text-purple-300 bg-purple-500/10 border-purple-500/30'
                                                        : 'text-pink-300 bg-pink-500/10 border-pink-500/30'
                                                    }`}>
                                                    {announcement.type === 'BANNER' ? '🔔 Bannière' : announcement.type === 'MODAL' ? '🎬 Modal' : '🎠 Carrousel'}
                                                </span>
                                                {/* Status badges */}
                                                {isExpired && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-red-300 bg-red-500/10 border border-red-500/30">
                                                        Expirée
                                                    </span>
                                                )}
                                                {isScheduled && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-yellow-300 bg-yellow-500/10 border border-yellow-500/30">
                                                        Programmée
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-neutral-400 text-sm truncate">{announcement.headline}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                                                <span className="flex items-center gap-1">
                                                    <FaUsers className="text-neutral-600" />
                                                    {AUDIENCE_OPTIONS.find(a => a.value === announcement.audience)?.label || announcement.audience}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FaStar className="text-neutral-600" />
                                                    Priorité: {announcement.priority}
                                                </span>
                                                {announcement._count && (
                                                    <span className="flex items-center gap-1">
                                                        <FaEye className="text-neutral-600" />
                                                        {announcement._count.dismissals} fermées
                                                    </span>
                                                )}
                                                {announcement.creator && (
                                                    <span>
                                                        Par {announcement.creator.firstName} {announcement.creator.lastName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handlePreviewClick(announcement)}
                                                className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                                                title="Aperçu (5s)"
                                            >
                                                <FaEye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleToggle(announcement.id)}
                                                disabled={toggleMutation.isPending}
                                                className={`p-2.5 rounded-xl border transition-colors ${announcement.isActive
                                                    ? 'text-green-400 border-green-500/30 bg-green-500/10 hover:bg-green-500/20'
                                                    : 'text-neutral-500 border-neutral-700 bg-neutral-800/50 hover:bg-neutral-700'
                                                    }`}
                                                title={announcement.isActive ? 'Désactiver' : 'Activer'}
                                            >
                                                {announcement.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(announcement)}
                                                className="p-2.5 rounded-xl border border-neutral-700 bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                                                title="Modifier"
                                            >
                                                <FaEdit size={14} />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmId(announcement.id)}
                                                className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                title="Supprimer"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {response && response.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 transition-colors"
                        >
                            <FaChevronLeft />
                        </button>
                        <span className="text-neutral-400 text-sm">
                            Page {page} / {response.totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(response.totalPages, p + 1))}
                            disabled={page === response.totalPages}
                            className="p-2 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 transition-colors"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </main>

            {/* ============================================================ */}
            {/* CREATE / EDIT MODAL                                          */}
            {/* ============================================================ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-700/50 shadow-2xl"
                        style={{ background: 'linear-gradient(145deg, #1a1c23 0%, #111317 50%, #0d0f13 100%)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 p-6 border-b border-neutral-800 flex items-center justify-between" style={{ background: 'rgba(17, 19, 23, 0.95)', backdropFilter: 'blur(10px)' }}>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {editingId ? 'Modifier l\'annonce' : 'Nouvelle Annonce'}
                                </h2>
                                <p className="text-neutral-500 text-sm mt-0.5">
                                    {editingId ? 'Modifiez les détails de votre bande annonce.' : 'Créez une nouvelle bande annonce pour vos utilisateurs.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Type Selector */}
                            <div>
                                <label className="text-sm font-semibold text-neutral-300 mb-2 block">Type d'affichage</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {(['CAROUSEL', 'BANNER', 'MODAL'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setForm(f => ({ ...f, type: t, isDismissible: t === 'MODAL' ? true : false }))}
                                            className={`p-4 rounded-xl border text-left transition-all ${form.type === t
                                                ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/30'
                                                : 'border-neutral-700 bg-neutral-800/30 hover:border-neutral-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">
                                                    {t === 'BANNER' ? '🔔' : t === 'MODAL' ? '🎬' : '🎠'}
                                                </span>
                                                <div>
                                                    <p className="font-bold text-white text-sm">
                                                        {t === 'BANNER' ? 'Bannière' : t === 'MODAL' ? 'Modal Cinéma' : 'Carrousel'}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                                                        {t === 'BANNER' ? 'Barre en haut' : t === 'MODAL' ? 'Popup vidéo/image' : 'Slider professionnel'}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title + Headline */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-neutral-300 mb-2 block">Titre interne *</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                        placeholder="Ex: Promo Black Friday"
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                    <p className="text-xs text-neutral-600 mt-1">Visible uniquement par les admins</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-neutral-300 mb-2 block">Headline affiché *</label>
                                    <input
                                        type="text"
                                        value={form.headline}
                                        onChange={(e) => setForm(f => ({ ...f, headline: e.target.value }))}
                                        placeholder="Ex: 🔥 -50% sur tous les plans !"
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-semibold text-neutral-300 mb-2 block">Description {form.type === 'MODAL' ? '(affiché dans le modal)' : '(optionnel)'}</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Description détaillée de l'annonce..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="text-sm font-semibold text-neutral-300 mb-2 block flex items-center gap-2">
                                    <FaImage className="text-neutral-500" />
                                    Image {form.type === 'BANNER' ? '(optionnel, fond de bannière)' : form.type === 'MODAL' ? '(héro du modal)' : '(image du carrousel)'}
                                </label>
                                <div className="flex items-start gap-4">
                                    <div
                                        onClick={() => form.type !== 'BANNER' && fileInputRef.current?.click()}
                                        className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors overflow-hidden ${form.type === 'BANNER'
                                            ? 'border-neutral-800 bg-neutral-900/50 cursor-not-allowed opacity-40'
                                            : 'border-neutral-700 cursor-pointer hover:border-purple-500/50'
                                            }`}
                                    >
                                        {imagePreview && form.type !== 'BANNER' ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <FaImage className="text-neutral-600 text-2xl mb-2" />
                                                <p className="text-xs text-neutral-500">Cliquez pour sélectionner</p>
                                            </>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={form.type === 'BANNER'} />
                                    {imagePreview && form.type !== 'BANNER' && (
                                        <button
                                            onClick={() => { setImageFile(null); setImagePreview(null); setRemoveImage(true); }}
                                            className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Vimeo Video (MODAL only) */}
                            {form.type === 'MODAL' && (
                                <div>
                                    <label className="text-sm font-semibold text-neutral-300 mb-2 block flex items-center gap-2">
                                        <FaVideo className="text-neutral-500" />
                                        Vimeo Video ID (optionnel)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.videoVimeoId}
                                        onChange={(e) => setForm(f => ({ ...f, videoVimeoId: e.target.value }))}
                                        placeholder="Ex: 1151206665"
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>
                            )}

                            {/* CTA Button */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-neutral-300 mb-2 block flex items-center gap-2">
                                        <FaExternalLinkAlt className="text-neutral-500 text-xs" />
                                        Texte du bouton CTA
                                    </label>
                                    <input
                                        type="text"
                                        value={form.ctaText}
                                        onChange={(e) => setForm(f => ({ ...f, ctaText: e.target.value }))}
                                        placeholder="Ex: Découvrir →"
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-neutral-300 mb-2 block">Lien du bouton CTA</label>
                                    <input
                                        type="text"
                                        value={form.ctaUrl}
                                        onChange={(e) => setForm(f => ({ ...f, ctaUrl: e.target.value }))}
                                        placeholder="Ex: /dashboard/billing ou https://..."
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Color Scheme */}
                            <div>
                                <label className="text-sm font-semibold text-neutral-300 mb-2 block">Style de couleur</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                                        <button
                                            key={key}
                                            onClick={() => setForm(f => ({ ...f, colorScheme: key }))}
                                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${form.colorScheme === key
                                                ? `${scheme.border} ${scheme.text} bg-white/5 ring-1 ring-white/10`
                                                : 'border-neutral-700 text-neutral-500 hover:text-neutral-300'
                                                }`}
                                        >
                                            {scheme.label}
                                        </button>
                                    ))}
                                </div>
                                {form.colorScheme === 'custom' && (
                                    <input
                                        type="text"
                                        value={form.customGradient}
                                        onChange={(e) => setForm(f => ({ ...f, customGradient: e.target.value }))}
                                        placeholder="Ex: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                        className="w-full mt-3 px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors text-sm"
                                    />
                                )}
                            </div>

                            {/* Audience + Scheduling */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-neutral-300 mb-2 block flex items-center gap-2">
                                        <FaUsers className="text-neutral-500" />
                                        Audience
                                    </label>
                                    <select
                                        value={form.audience}
                                        onChange={(e) => setForm(f => ({ ...f, audience: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                    >
                                        {AUDIENCE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-neutral-300 mb-2 block flex items-center gap-2">
                                        <FaCalendarAlt className="text-neutral-500" />
                                        Début
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={form.startsAt}
                                        onChange={(e) => setForm(f => ({ ...f, startsAt: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-neutral-300 mb-2 block flex items-center gap-2">
                                        <FaCalendarAlt className="text-neutral-500" />
                                        Fin (optionnel)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={form.endsAt}
                                        onChange={(e) => setForm(f => ({ ...f, endsAt: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Priority + Toggles */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-neutral-300 mb-2 block flex items-center gap-2">
                                        <FaStar className="text-neutral-500" />
                                        Priorité
                                    </label>
                                    <input
                                        type="number"
                                        value={form.priority}
                                        onChange={(e) => setForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))}
                                        min={0}
                                        max={100}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                    <p className="text-xs text-neutral-600 mt-1">Plus élevé = affiché en premier</p>
                                </div>
                                <div className="flex items-center gap-3 pt-6">
                                    <button
                                        onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                                        className={`p-2 rounded-lg border transition-colors ${form.isActive
                                            ? 'text-green-400 border-green-500/30 bg-green-500/10'
                                            : 'text-neutral-500 border-neutral-700 bg-neutral-800/50'
                                            }`}
                                    >
                                        {form.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                                    </button>
                                    <span className="text-sm text-neutral-300">
                                        {form.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {form.type === 'MODAL' && (
                                    <div className="flex items-center gap-3 pt-6">
                                        <button
                                            onClick={() => setForm(f => ({ ...f, isDismissible: !f.isDismissible }))}
                                            className={`p-2 rounded-lg border transition-colors ${form.isDismissible
                                                ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                                                : 'text-neutral-500 border-neutral-700 bg-neutral-800/50'
                                                }`}
                                        >
                                            {form.isDismissible ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                                        </button>
                                        <span className="text-sm text-neutral-300">
                                            {form.isDismissible ? 'Peut être fermée' : 'Non-fermable'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Preview Toggle */}
                            <div>
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    <FaEye /> {showPreview ? 'Masquer l\'aperçu' : 'Afficher l\'aperçu'}
                                </button>
                                {showPreview && (
                                    <div className="mt-4 border border-neutral-700 rounded-xl overflow-hidden">
                                        {form.type === 'BANNER' ? (
                                            <div
                                                className={`relative p-4 bg-gradient-to-r ${COLOR_SCHEMES[form.colorScheme]?.gradient || ''}`}
                                                style={form.colorScheme === 'custom' && form.customGradient ? { background: form.customGradient } : undefined}
                                            >
                                                {imagePreview && (
                                                    <div className="absolute inset-0 opacity-20">
                                                        <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="relative flex items-center justify-between gap-4">
                                                    <p className="text-white font-bold text-sm">{form.headline || 'Headline ici...'}</p>
                                                    <div className="flex items-center gap-3 flex-shrink-0">
                                                        {form.ctaText && (
                                                            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-white/20">
                                                                {form.ctaText}
                                                            </span>
                                                        )}
                                                        {form.isDismissible && (
                                                            <span className="text-white/60">✕</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : form.type === 'MODAL' ? (
                                            <div className="bg-black/80 p-8 text-center">
                                                {imagePreview && (
                                                    <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
                                                        <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <h3 className="text-white font-bold text-xl mb-2">{form.headline || 'Headline ici...'}</h3>
                                                {form.description && <p className="text-neutral-400 text-sm mb-4">{form.description}</p>}
                                                {form.ctaText && (
                                                    <span className="inline-block px-6 py-2 bg-white text-black font-bold text-sm rounded-lg">
                                                        {form.ctaText}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-neutral-900 p-6 flex gap-6 items-center">
                                                {imagePreview && (
                                                    <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                                        <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-3 bg-gradient-to-r ${COLOR_SCHEMES[form.colorScheme]?.gradient || ''}`}
                                                        style={form.colorScheme === 'custom' && form.customGradient ? { background: form.customGradient } : undefined}>
                                                        Nouveauté
                                                    </span>
                                                    <h3 className="text-white font-bold text-2xl mb-2">{form.headline || 'Headline du Carrousel...'}</h3>
                                                    {form.description && <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{form.description}</p>}
                                                    {form.ctaText && (
                                                        <span className="inline-block px-6 py-2 bg-white text-black font-bold text-sm rounded-lg border border-white/20">
                                                            {form.ctaText}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 p-6 border-t border-neutral-800 flex items-center justify-end gap-3" style={{ background: 'rgba(17, 19, 23, 0.95)', backdropFilter: 'blur(10px)' }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-medium hover:bg-neutral-700 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isSaving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer l\'annonce'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* DELETE CONFIRMATION MODAL                                    */}
            {/* ============================================================ */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-sm rounded-2xl border border-neutral-700/50 shadow-2xl p-8 text-center"
                        style={{ background: 'linear-gradient(145deg, #1a1c23 0%, #111317 50%, #0d0f13 100%)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                            <FaTrash className="text-red-400 text-xl" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Supprimer cette annonce ?</h3>
                        <p className="text-neutral-400 text-sm mb-6">Cette action est irréversible.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-medium hover:bg-neutral-700 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirmId)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
