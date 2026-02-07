// src/pages/AdminShopOrdersPage.tsx

import React, { useState } from 'react';
import {
    useAdminShopOrders,
    useAdminShopOrderStats,
    useAdminUpdateStatus,
    useAdminUpdateNotes,
    useMarkOrderViewed,
    getPricingTier,
    formatPrice
} from '../hooks/useShopOrder';
import type { ShopOrder } from '../hooks/useShopOrder';
import { FaSearch, FaTimes, FaPlay, FaCheck, FaSpinner, FaClock, FaBox, FaCreditCard, FaExclamationTriangle, FaChevronLeft, FaChevronRight, FaEye, FaEyeSlash, FaCopy } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

// ================
// REUSABLE STYLED COMPONENTS
// ================

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-2xl h-full ${className}`} style={{ background: 'rgba(28, 30, 34, 0.95)' }}>
        <div className="relative p-5 h-full" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 0.02) 100%)' }}>
            {children}
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        'DRAFT': { bg: 'bg-neutral-700', text: 'text-neutral-300', label: 'Brouillon' },
        'PENDING_PAYMENT': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Paiement en attente' },
        'SUBMITTED': { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Nouvelle' },
        'IN_PROGRESS': { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'En cours' },
        'COMPLETED': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Terminée' },
        'CANCELLED': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Annulée' }
    };

    const { bg, text, label } = config[status] || config['DRAFT'];

    return (
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
            {label}
        </span>
    );
};

const PaymentBadge: React.FC<{ status: string }> = ({ status }) => {
    if (status === 'PAID') {
        return <span className="text-green-400 text-xs font-medium">✓ Payé</span>;
    }
    if (status === 'REFUNDED') {
        return <span className="text-red-400 text-xs font-medium">↩ Remboursé</span>;
    }
    return <span className="text-yellow-400 text-xs font-medium">⏳ En attente</span>;
};

// ================
// STAT CARD
// ================

interface StatCardProps {
    icon: React.ReactNode;
    value: number;
    label: string;
    color: string;
    onClick?: () => void;
    active?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, onClick, active }) => (
    <button
        onClick={onClick}
        className={`w-full p-4 rounded-2xl border transition-all text-left ${active
            ? 'border-white bg-white/10'
            : 'border-neutral-800 bg-[#1C1E22] hover:border-neutral-700'
            }`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-neutral-500">{label}</p>
            </div>
        </div>
    </button>
);

// ================
// ORDER DETAIL MODAL
// ================

const OrderDetailModal: React.FC<{
    order: ShopOrder | null;
    onClose: () => void;
    onStatusUpdate: (status: string) => void;
    onNotesUpdate: (notes: string) => void;
}> = ({ order, onClose, onStatusUpdate, onNotesUpdate }) => {
    const [notes, setNotes] = useState(order?.adminNotes || '');
    const [editingNotes, setEditingNotes] = useState(false);
    const [showToken, setShowToken] = useState(false);

    if (!order) return null;

    const pricingTier = getPricingTier(order.productCount);

    const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div className="flex justify-between py-2 border-b border-neutral-800 last:border-0">
            <span className="text-neutral-500 text-sm">{label}</span>
            <span className="text-white text-sm font-medium">{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0D0F11] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-neutral-800">
                {/* Header */}
                <div className="p-6 border-b border-neutral-800 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{order.brandName || 'Sans nom'}</h2>
                        <p className="text-neutral-400 mt-1 text-sm">
                            {order.contactName} • {order.contactEmail}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
                    {/* Status & Actions */}
                    <GlassCard>
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-neutral-500 text-sm">Statut:</span>
                                <StatusBadge status={order.status} />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-neutral-500 text-sm">Changer:</span>
                                <select
                                    value={order.status}
                                    onChange={(e) => onStatusUpdate(e.target.value)}
                                    className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-primary cursor-pointer"
                                >
                                    <option value="SUBMITTED">Nouvelle</option>
                                    <option value="IN_PROGRESS">En cours</option>
                                    <option value="COMPLETED">Terminée</option>
                                    <option value="CANCELLED">Annulée</option>
                                </select>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Admin Notes */}
                    <GlassCard>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white text-sm">📝 Notes Admin</h3>
                            <button
                                onClick={() => {
                                    if (editingNotes) {
                                        onNotesUpdate(notes);
                                        toast.success('Notes sauvegardées');
                                    }
                                    setEditingNotes(!editingNotes);
                                }}
                                className="text-xs text-primary hover:text-primary/80 font-medium"
                            >
                                {editingNotes ? '✓ Sauvegarder' : '✎ Modifier'}
                            </button>
                        </div>
                        {editingNotes ? (
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ex: Assigned: Yassine, Priorité haute..."
                                rows={3}
                                className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-primary"
                            />
                        ) : (
                            <p className="text-neutral-400 text-sm">{order.adminNotes || 'Aucune note'}</p>
                        )}
                    </GlassCard>

                    {/* Two Column Layout */}
                    <div className="grid md:grid-cols-2 gap-4 items-stretch">
                        {/* Order Info */}
                        <GlassCard className="h-full">
                            <h3 className="font-semibold text-white text-sm mb-4">📦 Commande</h3>
                            <InfoRow label="Formule" value={pricingTier.label} />
                            <InfoRow label="Prix" value={<span className="text-primary font-bold">{formatPrice(pricingTier.price)}</span>} />
                            <InfoRow label="Produits" value={`${order.productCount || 0} produits`} />
                            <InfoRow label="Paiement" value={<PaymentBadge status={order.paymentStatus} />} />
                        </GlassCard>

                        {/* Contact Info */}
                        <GlassCard className="h-full">
                            <h3 className="font-semibold text-white text-sm mb-4">👤 Contact</h3>
                            <InfoRow label="Nom" value={order.contactName || '-'} />
                            <InfoRow label="Email" value={order.contactEmail || '-'} />
                            <InfoRow label="WhatsApp" value={order.contactWhatsApp || '-'} />
                            <InfoRow label="Timezone" value={order.timezone || '-'} />
                        </GlassCard>

                        {/* Brand & Style */}
                        <GlassCard className="h-full">
                            <h3 className="font-semibold text-white text-sm mb-4">🎨 Style</h3>
                            <InfoRow label="Marque" value={order.brandName || '-'} />
                            <InfoRow label="Style" value={order.selectedStyle || '-'} />
                            <InfoRow label="Couleur" value={
                                order.colorPalette?.primary ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: order.colorPalette.primary }} />
                                        <span>{order.colorPalette.primary}</span>
                                    </div>
                                ) : '-'
                            } />
                            <InfoRow label="Langues" value={order.siteLanguages?.join(', ') || '-'} />
                        </GlassCard>

                        {/* Shopify Info */}
                        <GlassCard className="h-full">
                            <h3 className="font-semibold text-white text-sm mb-4">🛒 Shopify</h3>
                            <InfoRow label="URL" value={
                                order.shopifyStoreUrl ? (
                                    <a
                                        href={order.shopifyStoreUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:text-primary/80 transition-colors"
                                    >
                                        {order.shopifyStoreUrl}
                                    </a>
                                ) : '-'
                            } />
                            <InfoRow label="Token" value={
                                order.shopifyApiToken ? (
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs bg-neutral-800 px-2 py-1 rounded font-mono">
                                            {showToken ? order.shopifyApiToken : '••••••••••••••••'}
                                        </code>
                                        <button
                                            onClick={() => setShowToken(!showToken)}
                                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all"
                                            title={showToken ? 'Masquer' : 'Afficher'}
                                        >
                                            {showToken ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(order.shopifyApiToken || '');
                                                toast.success('Token copié !');
                                            }}
                                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all"
                                            title="Copier"
                                        >
                                            <FaCopy className="text-xs" />
                                        </button>
                                    </div>
                                ) : '-'
                            } />
                        </GlassCard>
                    </div>

                    {/* Notes */}
                    {order.additionalNotes && (
                        <GlassCard>
                            <h3 className="font-semibold text-white text-sm mb-3">💬 Notes Client</h3>
                            <p className="text-neutral-400 text-sm whitespace-pre-wrap">{order.additionalNotes}</p>
                        </GlassCard>
                    )}

                    {/* Upsells */}
                    {(order.wantsAdsVisuals || order.wantsUGC || order.wantsCopywriting || order.wantsPremiumLogo) && (
                        <GlassCard>
                            <h3 className="font-semibold text-white text-sm mb-3">⭐ Options Supplémentaires</h3>
                            <div className="flex flex-wrap gap-2">
                                {order.wantsAdsVisuals && (
                                    <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-medium">
                                        Visuels Ads
                                    </span>
                                )}
                                {order.wantsUGC && (
                                    <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-medium">
                                        UGC
                                    </span>
                                )}
                                {order.wantsCopywriting && (
                                    <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-medium">
                                        Copywriting
                                    </span>
                                )}
                                {order.wantsPremiumLogo && (
                                    <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-medium">
                                        Logo Premium
                                    </span>
                                )}
                            </div>
                        </GlassCard>
                    )}

                    {/* Products Section */}
                    <GlassCard>
                        <h3 className="font-semibold text-white text-sm mb-4">📦 Produits Commandés ({order.productCount || 0})</h3>

                        {/* Product Source Badge */}
                        <div className="mb-4">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${order.productSource === 'TRENDING'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {order.productSource === 'TRENDING' ? '🔥 Produits Gagnants' : '📝 Produits Personnalisés'}
                            </span>
                        </div>

                        {/* Own Products */}
                        {order.ownProductInfo && (
                            <div className="space-y-3">
                                {(Array.isArray(order.ownProductInfo) ? order.ownProductInfo : [order.ownProductInfo]).map((product: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
                                        <div className="flex gap-4">
                                            {product.imageUrl && (
                                                <a
                                                    href={product.imageUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="shrink-0"
                                                >
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-20 h-20 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                                                    />
                                                </a>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-white font-medium">{product.name || `Produit ${idx + 1}`}</h4>
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${product.type === 'winning'
                                                        ? 'bg-purple-500/20 text-purple-400'
                                                        : 'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {product.type === 'winning' ? '🔥 Winning' : '📝 Custom'}
                                                    </span>
                                                </div>
                                                {product.description && (
                                                    <p className="text-neutral-400 text-sm mt-1 line-clamp-2">{product.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                                                    {product.price && (
                                                        <span className="text-green-400 font-semibold">{product.price}€</span>
                                                    )}
                                                    {product.url && (
                                                        <a
                                                            href={product.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline"
                                                        >
                                                            Lien produit →
                                                        </a>
                                                    )}
                                                    {product.winningProductId && (
                                                        <a
                                                            href={`/dashboard/products?highlight=${product.winningProductId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-purple-400 hover:underline"
                                                        >
                                                            Voir fiche produit gagnant →
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Selected Trending Product ID (legacy fallback) */}
                        {order.selectedProductId && !order.ownProductInfo && (
                            <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">🔥 Winning</span>
                                    <span className="text-neutral-500 text-sm">ID:</span>
                                    <code className="bg-neutral-800 px-2 py-0.5 rounded text-xs text-white">{order.selectedProductId}</code>
                                    <a
                                        href={`/dashboard/products?highlight=${order.selectedProductId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-400 hover:underline text-xs"
                                    >
                                        Voir fiche →
                                    </a>
                                </div>
                            </div>
                        )}

                        {!order.ownProductInfo && !order.selectedProductId && (
                            <p className="text-neutral-500 text-sm italic">Aucun produit spécifié</p>
                        )}
                    </GlassCard>

                    {/* Logo Section */}
                    {(order.logoUrl || order.logoStyle) && (
                        <GlassCard>
                            <h3 className="font-semibold text-white text-sm mb-4">🎨 Logo</h3>
                            <div className="flex items-start gap-4">
                                {order.logoUrl && (
                                    <a href={order.logoUrl} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={order.logoUrl}
                                            alt="Logo"
                                            className="w-24 h-24 object-contain rounded-xl bg-neutral-800 p-2"
                                        />
                                    </a>
                                )}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-neutral-500 text-sm">A son propre logo:</span>
                                        <span className={`text-sm font-medium ${order.hasOwnLogo ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {order.hasOwnLogo ? '✓ Oui' : '✗ Non (à créer)'}
                                        </span>
                                    </div>
                                    {order.logoStyle && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-neutral-500 text-sm">Style souhaité:</span>
                                            <span className="px-2 py-1 bg-neutral-800 rounded text-xs text-white capitalize">
                                                {order.logoStyle}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* Inspiration URLs */}
                    {order.inspirationUrls && (order.inspirationUrls as string[]).length > 0 && (
                        <GlassCard>
                            <h3 className="font-semibold text-white text-sm mb-4">🌐 Sites d'Inspiration</h3>
                            <div className="space-y-2">
                                {(order.inspirationUrls as string[]).map((url, idx) => (
                                    <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                                            {idx + 1}
                                        </div>
                                        <span className="text-neutral-300 text-sm group-hover:text-primary truncate flex-1">
                                            {url}
                                        </span>
                                        <span className="text-neutral-500 text-xs">↗</span>
                                    </a>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Uploaded Files */}
                    {order.files && order.files.length > 0 && (
                        <GlassCard>
                            <h3 className="font-semibold text-white text-sm mb-4">📎 Fichiers Téléversés ({order.files.length})</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {order.files.map((file) => (
                                    <a
                                        key={file.id}
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative overflow-hidden rounded-xl border border-neutral-800 hover:border-neutral-600 transition-all"
                                    >
                                        {file.mimeType?.startsWith('image/') ? (
                                            <img
                                                src={file.fileUrl}
                                                alt={file.fileName}
                                                className="w-full h-24 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-24 bg-neutral-800 flex items-center justify-center">
                                                <span className="text-2xl">📄</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">Ouvrir</span>
                                        </div>
                                        <div className="p-2 bg-neutral-900">
                                            <p className="text-xs text-neutral-400 truncate">{file.fileName}</p>
                                            <p className="text-xs text-neutral-600">{file.fileType}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};

// ================
// MAIN PAGE
// ================

export const AdminShopOrdersPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);

    const { data: statsData } = useAdminShopOrderStats();
    const { data, isLoading, refetch } = useAdminShopOrders({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        page,
        limit: 20
    });

    const updateStatus = useAdminUpdateStatus();
    const updateNotes = useAdminUpdateNotes();
    const markViewed = useMarkOrderViewed();

    // Mark order as viewed when selected
    const handleSelectOrder = (order: ShopOrder) => {
        setSelectedOrder(order);
        // Call backend to mark as viewed (triggers badge update)
        markViewed.mutate(order.id);
    };

    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            await updateStatus.mutateAsync({ orderId, status });
            toast.success('Statut mis à jour');
            setSelectedOrder(null);
            refetch();
        } catch {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleNotesUpdate = async (orderId: string, notes: string) => {
        try {
            await updateNotes.mutateAsync({ orderId, notes });
            refetch();
        } catch {
            toast.error('Erreur lors de la sauvegarde');
        }
    };

    const stats = statsData || { totalOrders: 0, pendingPayment: 0, submitted: 0, inProgress: 0, completed: 0 };
    const orders = data?.orders || [];
    const totalPages = data?.pagination?.totalPages || 1;

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <Toaster position="bottom-right" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Commandes Boutiques</h1>
                        <p className="text-neutral-400 mt-1">Gérez les commandes de création de boutiques</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <StatCard
                        icon={<FaBox className="text-blue-400" />}
                        value={stats.totalOrders}
                        label="Total"
                        color="bg-blue-500/20"
                        onClick={() => setStatusFilter('')}
                        active={statusFilter === ''}
                    />
                    <StatCard
                        icon={<FaCreditCard className="text-yellow-400" />}
                        value={stats.pendingPayment}
                        label="Paiement"
                        color="bg-yellow-500/20"
                        onClick={() => setStatusFilter('PENDING_PAYMENT')}
                        active={statusFilter === 'PENDING_PAYMENT'}
                    />
                    <StatCard
                        icon={<FaExclamationTriangle className="text-blue-400" />}
                        value={stats.submitted}
                        label="Nouvelles"
                        color="bg-blue-500/20"
                        onClick={() => setStatusFilter('SUBMITTED')}
                        active={statusFilter === 'SUBMITTED'}
                    />
                    <StatCard
                        icon={<FaSpinner className="text-purple-400" />}
                        value={stats.inProgress}
                        label="En cours"
                        color="bg-purple-500/20"
                        onClick={() => setStatusFilter('IN_PROGRESS')}
                        active={statusFilter === 'IN_PROGRESS'}
                    />
                    <StatCard
                        icon={<FaCheck className="text-green-400" />}
                        value={stats.completed}
                        label="Terminées"
                        color="bg-green-500/20"
                        onClick={() => setStatusFilter('COMPLETED')}
                        active={statusFilter === 'COMPLETED'}
                    />
                </div>

                {/* Search & Filters */}
                <GlassCard>
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher par nom, email, marque..."
                                className="w-full h-11 pl-11 pr-4 bg-neutral-900 border border-neutral-700 rounded-xl text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* Orders Table */}
                <GlassCard>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-10 h-10 border-3 border-dashed rounded-full animate-spin border-primary" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16">
                            <FaBox className="text-5xl text-neutral-700 mx-auto mb-4" />
                            <p className="text-neutral-400">Aucune commande trouvée</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-800">
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Client</th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Marque</th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Formule</th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Statut</th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Paiement</th>
                                        <th className="text-left py-4 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                                        <th className="text-right py-4 px-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => {
                                        const tier = getPricingTier(order.productCount);
                                        return (
                                            <tr
                                                key={order.id}
                                                className="border-b border-neutral-800/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
                                                onClick={() => handleSelectOrder(order)}
                                            >
                                                <td className="py-4 px-5">
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{order.contactName || order.user?.firstName || '-'}</p>
                                                        <p className="text-neutral-500 text-xs">{order.contactEmail || order.user?.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <span className="text-white text-sm">{order.brandName || '-'}</span>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <div>
                                                        <p className="text-white text-sm">{tier.label}</p>
                                                        <p className="text-primary text-xs font-semibold">{formatPrice(tier.price)}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-5">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                                <td className="py-4 px-5">
                                                    <PaymentBadge status={order.paymentStatus} />
                                                </td>
                                                <td className="py-4 px-5">
                                                    <span className="text-neutral-400 text-sm">
                                                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelectOrder(order);
                                                        }}
                                                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition-all"
                                                    >
                                                        Voir
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 p-4 border-t border-neutral-800">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg bg-neutral-800 text-white disabled:opacity-50 hover:bg-neutral-700 transition-all"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            <span className="text-neutral-400 text-sm px-4">
                                Page {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg bg-neutral-800 text-white disabled:opacity-50 hover:bg-neutral-700 transition-all"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusUpdate={(status) => handleStatusUpdate(selectedOrder.id, status)}
                    onNotesUpdate={(notes) => handleNotesUpdate(selectedOrder.id, notes)}
                />
            )}
        </main>
    );
};

export default AdminShopOrdersPage;
