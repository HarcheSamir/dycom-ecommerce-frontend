// src/pages/OrderShopPage.tsx

import React, { useState, useEffect, useCallback, type FC } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck, FaShoppingCart, FaExclamationTriangle, FaUpload, FaTimes } from 'react-icons/fa';
import {
    useShopOrderDraft,
    useSaveDraft,
    useUploadFile,
    useSubmitOrder,
    useWinningProducts,
    useProductCategories,
    getPricingTier,
    formatPrice,
} from '../hooks/useShopOrder';
import type { ShopOrder, WinningProductsFilters } from '../hooks/useShopOrder';
import toast, { Toaster } from 'react-hot-toast';

// ================
// REUSABLE COMPONENTS (matching project style)
// ================

const GlassCard: FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className="relative p-8" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

const Input: FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', required }) => (
    <div>
        <label className="text-sm text-neutral-400 mb-2 block">{label} {required && <span className="text-red-400">*</span>}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
    </div>
);

const TextArea: FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 4 }) => (
    <div>
        <label className="text-sm text-neutral-400 mb-2 block">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg p-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
        />
    </div>
);

// ================
// STEP COMPONENTS
// ================

interface StepProps {
    order: ShopOrder;
    onUpdate: (data: Partial<ShopOrder>) => void;
}

// Step 1: Brand Name
const StepBrandName: FC<StepProps> = ({ order, onUpdate }) => {
    const [brandName, setBrandName] = useState(order.brandName || '');

    const handleChange = (value: string) => {
        setBrandName(value);
        onUpdate({ brandName: value });
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Nom de votre marque</h2>
                <p className="text-neutral-400">Choisissez un nom unique pour votre boutique</p>
            </div>
            <Input
                label="Nom de marque"
                value={brandName}
                onChange={handleChange}
                placeholder="Ex: TechStyle, ModernHome..."
                required
            />
        </div>
    );
};

// Step 2: Logo
const StepLogo: FC<StepProps & { orderId: string }> = ({ order, onUpdate, orderId }) => {
    const [logoChoice, setLogoChoice] = useState<'own' | 'style'>(
        order.hasOwnLogo || order.logoUrl ? 'own' : 'style'
    );
    const [logoStyle, setLogoStyle] = useState(order.logoStyle || '');
    const uploadFile = useUploadFile();

    const logoStyles = [
        { id: 'minimalist', label: 'Minimaliste' },
        { id: 'modern', label: 'Moderne' },
        { id: 'luxury', label: 'Luxe' },
        { id: 'playful', label: 'Fun/Coloré' },
        { id: 'professional', label: 'Professionnel' }
    ];

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                await uploadFile.mutateAsync({ orderId, file, fileType: 'logo' });
                setLogoChoice('own');
                onUpdate({ hasOwnLogo: true });
                toast.success('Logo uploadé avec succès!');
            } catch {
                toast.error("Erreur lors de l'upload");
            }
        }
    };

    const handleStyleSelect = (styleId: string) => {
        setLogoStyle(styleId);
        setLogoChoice('style');
        onUpdate({ logoStyle: styleId, hasOwnLogo: false });
    };

    const handleSelectOwnLogo = () => {
        setLogoChoice('own');
        if (order.logoUrl) {
            onUpdate({ hasOwnLogo: true });
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Votre Logo</h2>
                <p className="text-neutral-400">Uploadez votre logo ou choisissez un style à créer</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Option 1: Upload your own logo */}
                <div
                    onClick={handleSelectOwnLogo}
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer bg-[#1C1E22] ${logoChoice === 'own'
                        ? 'border-primary'
                        : 'border-neutral-700 hover:border-neutral-600'
                        }`}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${logoChoice === 'own' ? 'border-primary bg-primary' : 'border-neutral-500'
                            }`}>
                            {logoChoice === 'own' && <FaCheck className="text-white text-xs" />}
                        </div>
                        <h3 className="text-lg font-semibold text-white">J'ai mon propre logo</h3>
                    </div>

                    {order.logoUrl ? (
                        <div className="text-center">
                            <img
                                src={order.logoUrl}
                                alt="Logo"
                                className="w-24 h-24 object-contain mx-auto rounded-xl bg-white/5 p-2 mb-3"
                            />
                            <p className="text-green-400 text-sm flex items-center justify-center gap-2 mb-3">
                                <FaCheck /> Logo uploadé
                            </p>
                            <label className="inline-block px-4 py-2 bg-neutral-700 rounded-lg text-neutral-300 text-sm cursor-pointer hover:bg-neutral-600 transition-colors">
                                Changer
                                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-neutral-600 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                            <FaUpload className="text-2xl text-neutral-500 mb-2" />
                            <span className="text-neutral-400 text-sm text-center">Cliquez pour uploader</span>
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>
                    )}
                </div>

                {/* Option 2: Choose a style */}
                <div
                    className={`p-6 rounded-2xl border-2 transition-all bg-[#1C1E22] ${logoChoice === 'style'
                        ? 'border-primary'
                        : 'border-neutral-700'
                        }`}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${logoChoice === 'style' ? 'border-primary bg-primary' : 'border-neutral-500'
                            }`}>
                            {logoChoice === 'style' && <FaCheck className="text-white text-xs" />}
                        </div>
                        <h3 className="text-lg font-semibold text-white">Créez-moi un logo</h3>
                    </div>

                    <div className="space-y-2">
                        {logoStyles.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => handleStyleSelect(style.id)}
                                className={`w-full p-3 rounded-lg text-left transition-all text-sm flex items-center justify-between ${logoStyle === style.id && logoChoice === 'style'
                                    ? 'bg-white text-black font-semibold'
                                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                    }`}
                            >
                                {style.label}
                                {logoStyle === style.id && logoChoice === 'style' && (
                                    <FaCheck className="text-black" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// Step 3: Product Count (FIXED - no slider!)
const StepProduct: FC<StepProps> = ({ order, onUpdate }) => {
    const [selectedTier, setSelectedTier] = useState<'TIER_1' | 'TIER_2' | 'QUOTE'>(
        order.pricingTier || 'TIER_1'
    );

    const tiers = [
        { id: 'TIER_1' as const, label: '1 à 3 produits', price: '299€', count: 3 },
        { id: 'TIER_2' as const, label: '4 à 10 produits', price: '599€', count: 10 },
        { id: 'QUOTE' as const, label: 'Plus de 10 produits', price: 'Sur devis', count: 15 }
    ];

    const handleSelect = (tier: typeof tiers[0]) => {
        setSelectedTier(tier.id);
        onUpdate({ pricingTier: tier.id, productCount: tier.count });
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Nombre de produits</h2>
                <p className="text-neutral-400">Combien de produits voulez-vous sur votre boutique ?</p>
            </div>

            <div className="grid gap-4">
                {tiers.map((tier) => (
                    <button
                        key={tier.id}
                        onClick={() => handleSelect(tier)}
                        className={`p-6 rounded-2xl border-2 transition-all text-left flex justify-between items-center ${selectedTier === tier.id ? 'bg-white border-white' : 'border-neutral-700 bg-[#1C1E22] hover:border-neutral-600'}`}
                    >
                        <div className="flex items-center gap-3">
                            {selectedTier === tier.id && <FaCheck className="text-black" />}
                            <h3 className={`text-lg font-semibold ${selectedTier === tier.id ? 'text-black' : 'text-white'}`}>{tier.label}</h3>
                        </div>
                        <div className="text-right">
                            <span className={`text-xl font-bold ${selectedTier === tier.id ? 'text-black' : 'text-white'}`}>
                                {tier.price}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Step 4: Add Products (based on tier limit)
interface ProductEntry {
    id: string;
    type: 'own' | 'winning';
    name: string;
    description: string;
    url: string;
    imageUrl?: string;
    winningProductId?: string;
}

const StepProducts: FC<StepProps & { orderId: string }> = ({ order, onUpdate, orderId }) => {
    const uploadFile = useUploadFile();

    // Filters state for winning products
    const [filters, setFilters] = useState<WinningProductsFilters>({
        keyword: '',
        category: '',
        sortBy: 'salesVolume',
        page: 1,
        limit: 12
    });
    const [searchInput, setSearchInput] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(f => ({ ...f, keyword: searchInput, page: 1 }));
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data: winningData, isLoading: loadingWinning } = useWinningProducts(filters);
    const { data: categories } = useProductCategories();

    // Mode: adding own products or selecting from winning
    const [mode, setMode] = useState<'own' | 'winning'>('own');

    // Get max products based on tier
    const getMaxProducts = () => {
        switch (order.pricingTier) {
            case 'TIER_1': return 3;
            case 'TIER_2': return 10;
            case 'QUOTE': return 20;
            default: return 3;
        }
    };

    const maxProducts = getMaxProducts();

    // Initialize products from order or empty
    const [products, setProducts] = useState<ProductEntry[]>(() => {
        const saved = order.ownProductInfo as ProductEntry[] | null;
        if (saved && Array.isArray(saved) && saved.length > 0) {
            return saved;
        }
        return [];
    });

    const updateProducts = (newProducts: ProductEntry[]) => {
        setProducts(newProducts);
        onUpdate({ ownProductInfo: newProducts, productCount: newProducts.length });
    };

    const addOwnProduct = () => {
        if (products.length < maxProducts) {
            updateProducts([...products, { id: Date.now().toString(), type: 'own', name: '', description: '', url: '' }]);
        }
    };

    const addWinningProduct = (wp: any) => {
        if (products.length >= maxProducts) {
            toast.error(`Maximum ${maxProducts} produits atteint`);
            return;
        }
        // Check if already added
        if (products.some(p => p.winningProductId === wp.id)) {
            toast.error('Ce produit est déjà ajouté');
            return;
        }
        updateProducts([...products, {
            id: Date.now().toString(),
            type: 'winning',
            name: wp.title,
            description: '',
            url: '',
            imageUrl: wp.imageUrl,
            winningProductId: wp.id
        }]);
        toast.success('Produit ajouté!');
    };

    const removeProduct = (id: string) => {
        updateProducts(products.filter(p => p.id !== id));
    };

    const updateProduct = (id: string, field: keyof ProductEntry, value: string) => {
        updateProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleImageUpload = async (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const result = await uploadFile.mutateAsync({ orderId, file, fileType: 'product' });
                updateProducts(products.map(p => p.id === productId ? { ...p, imageUrl: result.fileUrl } : p));
                toast.success('Image uploadée!');
            } catch {
                toast.error("Erreur lors de l'upload");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Vos produits</h2>
                <p className="text-neutral-400">
                    {products.length}/{maxProducts} produit{maxProducts > 1 ? 's' : ''}
                </p>
            </div>

            {/* Mode Tabs */}
            <div className="flex rounded-xl bg-neutral-800 p-1">
                <button
                    onClick={() => setMode('own')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'own' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                        }`}
                >
                    Ajouter mes produits
                </button>
                <button
                    onClick={() => setMode('winning')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'winning' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
                        }`}
                >
                    Produits gagnants
                </button>
            </div>

            {/* Own Products Mode */}
            {mode === 'own' && (
                <div className="space-y-4">
                    {products.filter(p => p.type === 'own').length === 0 && products.length < maxProducts && (
                        <button
                            onClick={addOwnProduct}
                            className="w-full p-6 rounded-xl border-2 border-dashed border-neutral-600 text-neutral-400 hover:border-primary hover:text-primary transition-colors"
                        >
                            + Ajouter un produit personnalisé
                        </button>
                    )}

                    {products.filter(p => p.type === 'own').map((product, index) => (
                        <div key={product.id} className="p-4 rounded-2xl border border-neutral-700 bg-[#1C1E22]">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white font-semibold text-sm">Produit personnalisé</span>
                                <button onClick={() => removeProduct(product.id)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                                    <FaTimes /> Supprimer
                                </button>
                            </div>

                            <div className="grid md:grid-cols-3 gap-3">
                                <div className="md:col-span-2 space-y-2">
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                        placeholder="Nom du produit *"
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded-lg h-9 px-3 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary"
                                    />
                                    <input
                                        type="url"
                                        value={product.url}
                                        onChange={(e) => updateProduct(product.id, 'url', e.target.value)}
                                        placeholder="URL du produit (optionnel)"
                                        className="w-full bg-neutral-800 border border-neutral-600 rounded-lg h-9 px-3 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    {product.imageUrl ? (
                                        <div className="relative h-20">
                                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 cursor-pointer rounded-lg transition-opacity">
                                                <span className="text-white text-xs">Changer</span>
                                                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(product.id, e)} className="hidden" />
                                            </label>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                                            <FaUpload className="text-neutral-500 mb-1" />
                                            <span className="text-neutral-500 text-xs">Image</span>
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(product.id, e)} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {products.filter(p => p.type === 'own').length > 0 && products.length < maxProducts && (
                        <button
                            onClick={addOwnProduct}
                            className="w-full p-3 rounded-xl border-2 border-dashed border-neutral-600 text-neutral-400 hover:border-primary hover:text-primary transition-colors text-sm"
                        >
                            + Ajouter un autre produit
                        </button>
                    )}
                </div>
            )}

            {/* Winning Products Mode */}
            {mode === 'winning' && (
                <div className="space-y-4">
                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Rechercher un produit..."
                            className="flex-1 bg-neutral-800 border border-neutral-600 rounded-lg h-10 px-4 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary"
                        />
                        <select
                            value={filters.category || ''}
                            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value || undefined, page: 1 }))}
                            className="bg-neutral-800 border border-neutral-600 rounded-lg h-10 px-3 text-white text-sm focus:outline-none focus:border-primary"
                        >
                            <option value="">Toutes catégories</option>
                            {categories?.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value as any, page: 1 }))}
                            className="bg-neutral-800 border border-neutral-600 rounded-lg h-10 px-3 text-white text-sm focus:outline-none focus:border-primary"
                        >
                            <option value="salesVolume">Meilleures ventes</option>
                            <option value="price_asc">Prix ↑</option>
                            <option value="price_desc">Prix ↓</option>
                            <option value="newest">Récents</option>
                        </select>
                    </div>

                    {/* Products Grid */}
                    {loadingWinning ? (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-primary mx-auto" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {winningData?.data.map((wp) => {
                                    const isAdded = products.some(p => p.winningProductId === wp.id);
                                    return (
                                        <div
                                            key={wp.id}
                                            onClick={() => !isAdded && addWinningProduct(wp)}
                                            className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isAdded ? 'border-green-500 opacity-60' : 'border-transparent hover:border-primary'}`}
                                        >
                                            <img src={wp.imageUrl} alt={wp.title || ''} className="w-full h-24 object-cover" />
                                            <div className="p-2 bg-[#1C1E22]">
                                                <p className="text-white text-xs font-medium truncate">{wp.title}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-primary text-xs font-semibold">{wp.price?.toFixed(2)}€</span>
                                                    <span className="text-neutral-500 text-[10px]">{wp.salesVolume?.toLocaleString()} ventes</span>
                                                </div>
                                            </div>
                                            {isAdded && (
                                                <div className="absolute inset-0 bg-green-900/50 flex items-center justify-center">
                                                    <FaCheck className="text-white text-xl" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {winningData && winningData.meta.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 pt-2">
                                    <button
                                        onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page || 1) - 1) }))}
                                        disabled={filters.page === 1}
                                        className="px-3 py-1 rounded bg-neutral-800 text-white text-xs disabled:opacity-50 hover:bg-neutral-700"
                                    >
                                        ←
                                    </button>
                                    <span className="text-neutral-400 text-xs">
                                        {winningData.meta.page} / {winningData.meta.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setFilters(f => ({ ...f, page: Math.min(winningData.meta.totalPages, (f.page || 1) + 1) }))}
                                        disabled={filters.page === winningData.meta.totalPages}
                                        className="px-3 py-1 rounded bg-neutral-800 text-white text-xs disabled:opacity-50 hover:bg-neutral-700"
                                    >
                                        →
                                    </button>
                                </div>
                            )}

                            {winningData && (
                                <p className="text-center text-neutral-500 text-xs">{winningData.meta.total} produits</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Selected Products Summary */}
            {products.length > 0 && (
                <div className="border-t border-neutral-700 pt-4 mt-6">
                    <h4 className="text-white font-semibold mb-3 text-sm">Produits sélectionnés ({products.length})</h4>
                    <div className="space-y-2">
                        {products.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-2 bg-neutral-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {p.imageUrl && <img src={p.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />}
                                    <div>
                                        <p className="text-white text-sm">{p.name || 'Sans nom'}</p>
                                        <p className="text-neutral-500 text-xs">{p.type === 'winning' ? 'Produit gagnant' : 'Personnalisé'}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeProduct(p.id)} className="text-red-400 hover:text-red-300 p-1">
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {products.length >= maxProducts && (
                <p className="text-center text-neutral-500 text-sm">
                    Limite atteinte ({maxProducts} produits max)
                </p>
            )}
        </div>
    );
};


// Step 5: Language
const StepLanguage: FC<StepProps> = ({ order, onUpdate }) => {
    const [languages, setLanguages] = useState<string[]>(order.siteLanguages || ['FR']);
    const [isMultilingual, setIsMultilingual] = useState(order.isMultilingual);

    const availableLanguages = [
        { code: 'FR', label: 'Français' },
        { code: 'EN', label: 'English' },
        { code: 'AR', label: 'العربية' },
        { code: 'ES', label: 'Español' }
    ];

    const toggleLanguage = (code: string) => {
        const newLanguages = languages.includes(code)
            ? languages.filter(l => l !== code)
            : [...languages, code];
        setLanguages(newLanguages);
        setIsMultilingual(newLanguages.length > 1);
        onUpdate({ siteLanguages: newLanguages, isMultilingual: newLanguages.length > 1 });
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Langues du site</h2>
                <p className="text-neutral-400">Sélectionnez les langues de votre boutique</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {availableLanguages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => toggleLanguage(lang.code)}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${languages.includes(lang.code) ? 'bg-white border-white' : 'border-neutral-700 bg-[#1C1E22] hover:border-neutral-600'}`}
                    >
                        {languages.includes(lang.code) && <FaCheck className="text-black" />}
                        <span className={`text-lg font-semibold ${languages.includes(lang.code) ? 'text-black' : 'text-white'}`}>{lang.label}</span>
                    </button>
                ))}
            </div>

            {languages.length > 1 && (
                <p className="text-center text-primary text-sm">
                    ✓ Site multilingue activé
                </p>
            )}
        </div>
    );
};

// Step 5: Style & Colors
const StepStyle: FC<StepProps> = ({ order, onUpdate }) => {
    const [selectedStyle, setSelectedStyle] = useState(order.selectedStyle || '');
    const [colors, setColors] = useState(order.colorPalette || { primary: '#7F56D9', secondary: '#1C1E22', accent: '#0EA5E9' });

    const styles = [
        { id: 'modern', label: 'Moderne' },
        { id: 'minimal', label: 'Minimaliste' },
        { id: 'luxury', label: 'Luxe' },
        { id: 'playful', label: 'Fun/Coloré' },
        { id: 'professional', label: 'Professionnel' }
    ];

    const handleStyleSelect = (styleId: string) => {
        setSelectedStyle(styleId);
        onUpdate({ selectedStyle: styleId });
    };

    const handleColorChange = (key: 'primary' | 'secondary' | 'accent', value: string) => {
        const newColors = { ...colors, [key]: value };
        setColors(newColors);
        onUpdate({ colorPalette: newColors });
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Style & Couleurs</h2>
                <p className="text-neutral-400">Définissez l'apparence de votre boutique</p>
            </div>

            <div>
                <label className="text-sm text-neutral-400 mb-3 block">Style du site</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {styles.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => handleStyleSelect(style.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${selectedStyle === style.id ? 'bg-white border-white' : 'border-neutral-700 bg-[#1C1E22] hover:border-neutral-600'}`}
                        >
                            <span className={`text-sm font-medium ${selectedStyle === style.id ? 'text-black' : 'text-white'}`}>{style.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-sm text-neutral-400 mb-3 block">Couleurs personnalisées</label>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Principale</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={colors.primary}
                                onChange={(e) => handleColorChange('primary', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border-0"
                            />
                            <span className="text-neutral-400 text-sm">{colors.primary}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Secondaire</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={colors.secondary}
                                onChange={(e) => handleColorChange('secondary', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border-0"
                            />
                            <span className="text-neutral-400 text-sm">{colors.secondary}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Accent</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={colors.accent}
                                onChange={(e) => handleColorChange('accent', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border-0"
                            />
                            <span className="text-neutral-400 text-sm">{colors.accent}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 6: Contact Info
const StepContact: FC<StepProps> = ({ order, onUpdate }) => {
    const [contactName, setContactName] = useState(order.contactName || '');
    const [contactEmail, setContactEmail] = useState(order.contactEmail || '');
    const [contactWhatsApp, setContactWhatsApp] = useState(order.contactWhatsApp || '');

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Vos coordonnées</h2>
                <p className="text-neutral-400">Comment pouvons-nous vous contacter ?</p>
            </div>

            <div className="space-y-4">
                <Input
                    label="Nom complet"
                    value={contactName}
                    onChange={(v) => { setContactName(v); onUpdate({ contactName: v }); }}
                    placeholder="Jean Dupont"
                    required
                />
                <Input
                    label="Email"
                    value={contactEmail}
                    onChange={(v) => { setContactEmail(v); onUpdate({ contactEmail: v }); }}
                    placeholder="jean@exemple.com"
                    type="email"
                    required
                />
                <Input
                    label="WhatsApp"
                    value={contactWhatsApp}
                    onChange={(v) => { setContactWhatsApp(v); onUpdate({ contactWhatsApp: v }); }}
                    placeholder="+33 6 12 34 56 78"
                    required
                />
            </div>
        </div>
    );
};

// Step 7: Upsells (FIXED - no prices!)
const StepUpsells: FC<StepProps> = ({ order, onUpdate }) => {
    const [wantsAdsVisuals, setWantsAdsVisuals] = useState(order.wantsAdsVisuals);
    const [wantsUGC, setWantsUGC] = useState(order.wantsUGC);
    const [wantsCopywriting, setWantsCopywriting] = useState(order.wantsCopywriting);
    const [wantsPremiumLogo, setWantsPremiumLogo] = useState(order.wantsPremiumLogo);

    const options = [
        { key: 'wantsAdsVisuals', label: 'Visuels Publicitaires', desc: 'Créations pour vos campagnes ads', checked: wantsAdsVisuals, set: setWantsAdsVisuals },
        { key: 'wantsUGC', label: 'Contenu UGC', desc: 'Vidéos style user-generated content', checked: wantsUGC, set: setWantsUGC },
        { key: 'wantsCopywriting', label: 'Copywriting', desc: 'Rédaction de fiches produits optimisées', checked: wantsCopywriting, set: setWantsCopywriting },
        { key: 'wantsPremiumLogo', label: 'Logo Premium', desc: 'Logo professionnel sur-mesure', checked: wantsPremiumLogo, set: setWantsPremiumLogo }
    ];

    const handleToggle = (option: typeof options[0]) => {
        option.set(!option.checked);
        onUpdate({ [option.key]: !option.checked });
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Options supplémentaires</h2>
                <p className="text-neutral-400">Cochez les options qui vous intéressent (optionnel)</p>
            </div>

            <div className="space-y-3">
                {options.map((option) => (
                    <button
                        key={option.key}
                        onClick={() => handleToggle(option)}
                        className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${option.checked ? 'bg-white border-white' : 'border-neutral-700 bg-[#1C1E22] hover:border-neutral-600'}`}
                    >
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${option.checked ? 'bg-black border-black' : 'border-neutral-600'}`}>
                            {option.checked && <FaCheck className="text-white text-xs" />}
                        </div>
                        <div>
                            <h4 className={`font-semibold ${option.checked ? 'text-black' : 'text-white'}`}>{option.label}</h4>
                            <p className={`text-sm ${option.checked ? 'text-neutral-600' : 'text-neutral-400'}`}>{option.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Step 8: Notes
const StepNotes: FC<StepProps> = ({ order, onUpdate }) => {
    const [notes, setNotes] = useState(order.additionalNotes || '');

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Notes additionnelles</h2>
                <p className="text-neutral-400">Partagez toute information utile pour votre projet</p>
            </div>

            <TextArea
                label="Vos notes (optionnel)"
                value={notes}
                onChange={(v) => { setNotes(v); onUpdate({ additionalNotes: v }); }}
                placeholder="Décrivez votre vision, vos inspirations, contraintes particulières..."
                rows={6}
            />
        </div>
    );
};

// Step 9: Shopify Info
const StepShopify: FC<StepProps> = ({ order, onUpdate }) => {
    const [shopifyUrl, setShopifyUrl] = useState(order.shopifyStoreUrl || '');
    const [apiToken, setApiToken] = useState(order.shopifyApiToken || '');
    const [inspirationUrls, setInspirationUrls] = useState<string[]>(order.inspirationUrls || ['', '', '']);

    const updateUrl = (index: number, value: string) => {
        const newUrls = [...inspirationUrls];
        newUrls[index] = value;
        setInspirationUrls(newUrls);
        onUpdate({ inspirationUrls: newUrls });
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Informations Shopify</h2>
                <p className="text-neutral-400">Connectez-nous à votre boutique</p>
            </div>

            <div className="space-y-4">
                <Input
                    label="URL de votre boutique Shopify"
                    value={shopifyUrl}
                    onChange={(v) => { setShopifyUrl(v); onUpdate({ shopifyStoreUrl: v }); }}
                    placeholder="votre-boutique.myshopify.com"
                    required
                />

                <Input
                    label="Token API Shopify"
                    value={apiToken}
                    onChange={(v) => { setApiToken(v); onUpdate({ shopifyApiToken: v }); }}
                    placeholder="shpat_xxxxx..."
                    required
                />

                <div>
                    <label className="text-sm text-neutral-400 mb-3 block">Sites d'inspiration (3 URLs)</label>
                    <div className="space-y-3">
                        {inspirationUrls.map((url, i) => (
                            <input
                                key={i}
                                type="url"
                                value={url}
                                onChange={(e) => updateUrl(i, e.target.value)}
                                placeholder={`Site d'inspiration ${i + 1}`}
                                className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 10: Recap
const StepRecap: FC<StepProps> = ({ order }) => {
    const tier = getPricingTier(order.productCount);

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Récapitulatif</h2>
                <p className="text-neutral-400">Vérifiez votre commande avant paiement</p>
            </div>

            <div className="space-y-4">
                <div className="bg-[#1C1E22] rounded-2xl p-4 border border-neutral-700">
                    <h4 className="text-neutral-400 text-sm mb-1">Marque</h4>
                    <p className="text-white font-medium">{order.brandName || 'Non défini'}</p>
                </div>

                <div className="bg-[#1C1E22] rounded-2xl p-4 border border-neutral-700">
                    <h4 className="text-neutral-400 text-sm mb-1">Formule</h4>
                    <p className="text-white font-medium">{tier.label}</p>
                </div>

                <div className="bg-[#1C1E22] rounded-2xl p-4 border border-neutral-700">
                    <h4 className="text-neutral-400 text-sm mb-1">Contact</h4>
                    <p className="text-white font-medium">{order.contactName} - {order.contactEmail}</p>
                </div>

                <div className="bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl p-6 border border-primary/30">
                    <div className="flex justify-between items-center">
                        <span className="text-white font-semibold text-lg">Total à payer</span>
                        <span className="text-3xl font-bold text-primary">{formatPrice(tier.price)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ================
// PRE-CHECKOUT MODAL
// ================

const PreCheckoutModal: FC<{ onClose: () => void; onConfirm: () => void }> = ({ onClose, onConfirm }) => {
    const [checks, setChecks] = useState([false, false, false, false, false]);

    const requirements = [
        'Créer un compte Shopify et souscrire à un abonnement',
        'Récupérer le token API Shopify (Admin → Apps → Develop apps)',
        'Préparer 3 URLs de sites d\'inspiration',
        'Avoir votre logo prêt (ou sélectionner un style)',
        'Connaître votre/vos produit(s) à vendre'
    ];

    const allChecked = checks.every(c => c);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#111317] border border-neutral-700 rounded-3xl max-w-lg w-full p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Avant de continuer...</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white">
                        <FaTimes />
                    </button>
                </div>

                <p className="text-neutral-400 mb-6">
                    Assurez-vous d'avoir préparé les éléments suivants :
                </p>

                <div className="space-y-3 mb-8">
                    {requirements.map((req, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                const newChecks = [...checks];
                                newChecks[i] = !newChecks[i];
                                setChecks(newChecks);
                            }}
                            className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${checks[i] ? 'border-green-500 bg-green-900/20' : 'border-neutral-700 bg-[#1C1E22]'}`}
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${checks[i] ? 'bg-green-500 border-green-500' : 'border-neutral-600'}`}>
                                {checks[i] && <FaCheck className="text-white text-xs" />}
                            </div>
                            <span className={`text-sm ${checks[i] ? 'text-green-400' : 'text-neutral-300'}`}>{req}</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={onConfirm}
                    disabled={!allChecked}
                    className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-neutral-200"
                >
                    Continuer vers le paiement
                </button>
            </div>
        </div>
    );
};

// ================
// MAIN PAGE
// ================

const STEPS = [
    { id: 'brand', label: 'Marque' },
    { id: 'logo', label: 'Logo' },
    { id: 'tier', label: 'Formule' },
    { id: 'products', label: 'Produits' },
    { id: 'language', label: 'Langues' },
    { id: 'style', label: 'Style' },
    { id: 'contact', label: 'Contact' },
    { id: 'upsells', label: 'Options' },
    { id: 'notes', label: 'Notes' },
    { id: 'shopify', label: 'Shopify' },
    { id: 'recap', label: 'Récap' }
];

export const OrderShopPage: FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const { data: order, isLoading } = useShopOrderDraft();
    const saveDraft = useSaveDraft();

    // Debounced autosave
    const handleUpdate = useCallback((data: Partial<ShopOrder>) => {
        if (!order) return;
        saveDraft.mutate({ orderId: order.id, ...data });
    }, [order, saveDraft]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePayment = async () => {
        if (!order) return;

        // 1. Lock order (set PENDING_PAYMENT) so user can't edit while paying
        try {
            await saveDraft.mutateAsync({ orderId: order.id, status: 'PENDING_PAYMENT' });
        } catch (error) {
            console.error('Lock error:', error);
            // Continue anyway? If draft fails to lock, maybe risky, but we want to allow payment.
            // But usually this works.
        }

        const tier = getPricingTier(order.productCount);

        if (tier.price === null) {
            // Quote request - no payment needed
            toast.success('Demande de devis envoyée avec succès!');
            // Redirect to dashboard or success page
            window.location.href = '/dashboard/order-shop/success';
            return;
        }

        // 2. Redirect to Hotmart
        const hotmartUrl = order.pricingTier === 'TIER_2'
            ? import.meta.env.VITE_HOTMART_TIER2_URL
            : import.meta.env.VITE_HOTMART_TIER1_URL;

        if (hotmartUrl && hotmartUrl.length > 10) {
            // Append params: email and sck (Source Key) for tracking
            const separator = hotmartUrl.includes('?') ? '&' : '?';
            const finalUrl = `${hotmartUrl}${separator}email=${encodeURIComponent(order.contactEmail || '')}&sck=SHOP_ORDER_${order.id}`;
            window.location.href = finalUrl;
        } else {
            toast.error('Configuration paiement manquante (Veuillez contacter le support)');
            console.error('Missing Hotmart URL for tier:', order.pricingTier);
        }
    };

    if (isLoading || !order) {
        return (
            <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary" />
            </main>
        );
    }

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    const renderStep = () => {
        const props = { order, onUpdate: handleUpdate };

        switch (STEPS[currentStep].id) {
            case 'brand': return <StepBrandName {...props} />;
            case 'logo': return <StepLogo {...props} orderId={order.id} />;
            case 'tier': return <StepProduct {...props} />;
            case 'products': return <StepProducts {...props} orderId={order.id} />;
            case 'language': return <StepLanguage {...props} />;
            case 'style': return <StepStyle {...props} />;
            case 'contact': return <StepContact {...props} />;
            case 'upsells': return <StepUpsells {...props} />;
            case 'notes': return <StepNotes {...props} />;
            case 'shopify': return <StepShopify {...props} />;
            case 'recap': return <StepRecap {...props} />;
            default: return null;
        }
    };

    return (
        <>
            <Toaster position="bottom-right" />

            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Commander ma boutique</h1>
                        <p className="text-neutral-400">Étape {currentStep + 1} sur {STEPS.length}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-blue-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Step Content */}
                    <GlassCard>
                        {renderStep()}
                    </GlassCard>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-700 text-white font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaArrowLeft /> Retour
                        </button>

                        {currentStep < STEPS.length - 1 ? (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-all"
                            >
                                Continuer <FaArrowRight />
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-bold hover:opacity-90 transition-all"
                            >
                                <FaShoppingCart /> Passer au paiement
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {showModal && (
                <PreCheckoutModal
                    onClose={() => setShowModal(false)}
                    onConfirm={() => {
                        setShowModal(false);
                        handlePayment();
                    }}
                />
            )}
        </>
    );
};

export default OrderShopPage;
