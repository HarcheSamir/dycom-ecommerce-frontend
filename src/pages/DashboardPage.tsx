import React, { useState, useEffect, useRef, type FC } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserProfile, useDiscordAuthUrl, useDiscordCallback, useDiscordDisconnect } from '../hooks/useUser';
import { useWinningProducts, type WinningProduct } from '../hooks/useWinningProducts';
import ProductDetailModal from '../components/ProductDetailModal';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useNotifications } from '../hooks/useNotifications';
import { WelcomeModal } from '../components/WelcomeModal';
import { TrustpilotBanner } from '../components/TrustpilotBanner';
import {
    FaTachometerAlt, FaTicketAlt, FaBolt, FaHeadset, FaExclamationTriangle, FaChartLine, FaStore, FaVideo, FaGift, FaUsers, FaCog, FaShieldAlt, FaSignOutAlt, FaGlobe, FaChevronRight, FaStar, FaSearch, FaBars, FaBell, FaCreditCard, FaCrown, FaFolderOpen, FaShoppingBag, FaWhatsapp, FaChevronDown, FaRobot, FaRocket, FaDiscord, FaLock, FaCheck, FaTimesCircle
} from 'react-icons/fa';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { SupportWidget } from '../components/support/SupportWidget';
import { useAdminUnreadCounts } from '../hooks/useAdminUnreadCounts';

// --- Type Definitions ---
type NavLink = {
    name: string;
    icon: React.ReactNode;
    path: string;
    isExternal?: boolean; // Added for external links
};

// --- HELPER: Time Ago Function ---
const timeAgo = (date: string, t: TFunction) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return t('timeAgo.years', { count: Math.floor(interval) });
    interval = seconds / 2592000;
    if (interval > 1) return t('timeAgo.months', { count: Math.floor(interval) });
    interval = seconds / 86400;
    if (interval > 1) return t('timeAgo.days', { count: Math.floor(interval) });
    interval = seconds / 3600;
    if (interval > 1) return t('timeAgo.hours', { count: Math.floor(interval) });
    interval = seconds / 60;
    if (interval > 1) return t('timeAgo.minutes', { count: Math.floor(interval) });
    return t('timeAgo.seconds');
};


// --- Animation Hooks & Components ---
const useInView = (options?: IntersectionObserverInit) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.unobserve(entry.target);
            }
        }, options);
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [options]);
    return [ref, isInView];
};

const AnimatedSection: FC<{ children: React.ReactNode; className?: string; delay?: string }> = ({ children, className, delay = '0s' }) => {
    const [ref, isInView] = useInView({ threshold: 0.1 });
    return (
        <div ref={ref as React.RefObject<HTMLDivElement>} className={`${className} transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: delay }}>
            {children}
        </div>
    );
};

const AnimatedNumber: FC<{ value: number }> = ({ value }) => {
    const { i18n } = useTranslation();
    const ref = useRef<HTMLSpanElement>(null);
    const [displayValue, setDisplayValue] = useState(0);
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setIsInView(true);
                observer.unobserve(element);
            }
        }, { threshold: 0.5 });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (isInView) {
            let start = 0;
            const end = value;
            if (start === end) return;
            const duration = 1500;
            const frameDuration = 1000 / 60;
            const totalFrames = Math.round(duration / frameDuration);
            const increment = Math.max(1, Math.ceil(end / totalFrames));
            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setDisplayValue(end);
                    clearInterval(timer);
                } else {
                    setDisplayValue(start);
                }
            }, frameDuration);
            return () => clearInterval(timer);
        }
    }, [isInView, value]);

    return <span ref={ref}>{displayValue.toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>;
};

// --- Reusable Glass Card Component ---
const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 hover:border-neutral-700 hover:-translate-y-1 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);


// --- Main Dashboard View ---
export const DashboardContent: FC = () => {
    const { t, i18n } = useTranslation();
    const { data: userProfile } = useUserProfile();
    const isSmmaOnly = userProfile?.subscriptionStatus === 'SMMA_ONLY';
    const { data: productsResponse, isLoading: productsLoading } = useWinningProducts({ page: 1, limit: 4, sortBy: 'newest' });
    const [selectedProduct, setSelectedProduct] = useState<WinningProduct | null>(null);

    const { data: statsData, isLoading: statsLoading } = useDashboardStats();
    const { data: notifications, isLoading: notificationsLoading } = useNotifications();

    const statCards = [
        { icon: <FaChartLine />, value: statsData?.totalWinningProducts, label: t('dashboard.stats.trendingProducts'), color: "text-red-400", bgColor: "bg-red-900/20" },
        { icon: <FaVideo />, value: statsData?.totalCourses, label: t('dashboard.stats.availableCourses'), color: "text-purple-400", bgColor: "bg-purple-900/20" },
        { icon: <FaUsers />, value: statsData?.totalInfluencers, label: t('dashboard.stats.activeInfluencers'), color: "text-blue-400", bgColor: "bg-blue-900/20" },
        { icon: <FaGlobe />, value: statsData?.countriesCovered, label: t('dashboard.stats.countriesCovered'), color: "text-green-400", bgColor: "bg-green-900/20" },
    ];

    return (
        <>
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 ">
                <AnimatedSection>
                    <h1 className="text-4xl font-bold text-white">{t('dashboard.welcome', { name: userProfile?.firstName || 'User' })}</h1>
                    <p className="text-neutral-400 mt-1">{t('dashboard.welcomeSubtitle')}</p>
                </AnimatedSection>

                <AnimatedSection>
                    <TrustpilotBanner />
                </AnimatedSection>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <AnimatedSection key={i} delay={`${i * 100}ms`}>
                            <GlassCard padding="p-5">
                                <div className={`w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-700 ${stat.bgColor} ${stat.color} mb-4`}>{stat.icon}</div>
                                <p className="text-4xl font-bold text-white mt-4">
                                    {(statsLoading || typeof stat.value === 'undefined') ? '...' : <AnimatedNumber value={stat.value} />}
                                </p>
                                <p className="text-neutral-400 text-sm mt-1">{stat.label}</p>
                            </GlassCard>
                        </AnimatedSection>
                    ))}
                </div>

                {/* Premium content: Trending products — hidden for SMMA_ONLY, replaced with upgrade CTA */}
                {isSmmaOnly ? (
                    <AnimatedSection>
                        <div className="relative overflow-hidden border border-purple-500/30 rounded-3xl p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(147, 51, 234, 0.05) 100%)' }}>
                            <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
                            <div className="relative z-10">
                                <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-5">
                                    <FaCrown className="text-purple-400 text-2xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Débloquez tout le potentiel de Dycom</h3>
                                <p className="text-neutral-400 max-w-lg mx-auto mb-6 leading-relaxed">
                                    Accédez aux produits tendance, aux influenceurs, à l'IA Coach Dylan, et bien plus avec l'Académie Dycom.
                                </p>
                                <Link
                                    to="/dashboard/billing"
                                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all transform hover:scale-[1.02] shadow-lg shadow-white/10"
                                >
                                    <FaCrown className="text-purple-500" /> Passer à l'Académie
                                </Link>
                            </div>
                        </div>
                    </AnimatedSection>
                ) : (
                    <>
                        <AnimatedSection>
                            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-white">{t('dashboard.productsOfTheDay')}</h2><Link to="/dashboard/products" className="px-4 py-2 text-sm rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold transition-colors hover:bg-neutral-800">{t('dashboard.viewAllProducts')}</Link></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {(productsLoading ? Array(4).fill({}) : productsResponse?.data || []).map((product: Partial<WinningProduct>, i) => (
                                    <GlassCard key={product.id || i} padding="p-0" className={product.id ? "cursor-pointer" : "cursor-default"}>
                                        <div onClick={() => product.id && setSelectedProduct(product as WinningProduct)}>
                                            <div className="w-full h-40 bg-[#1C1E22] rounded-t-3xl overflow-hidden">{product.imageUrl ? <img src={product.imageUrl} alt={product.title || 'Product'} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-neutral-800 animate-pulse"></div>}</div>
                                            <div className="p-4 space-y-3">
                                                <h3 className="font-bold text-white truncate h-5">{product.title || t('common.loading')}</h3>
                                                <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#1C1E22] border border-neutral-700 text-neutral-300">{product.categoryName || t('common.category')}</span>
                                                <p className="text-sm text-neutral-400 flex items-center gap-2"><FaChartLine /> {t('dashboard.salesPerMonth', { count: product.salesVolume || 0 })}</p>
                                                <hr className="border-neutral-800" />
                                                {product.shopName && (
                                                    <div className="text-sm">
                                                        <p className="text-neutral-500 mb-1">{t('dashboard.soldBy')}</p>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-neutral-300 truncate pr-2">{product.shopName}</span>
                                                            {product.shopEvaluationRate && (
                                                                <span className="flex items-center gap-1 text-yellow-400 flex-shrink-0">
                                                                    <FaStar /> {product.shopEvaluationRate}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <hr className="border-neutral-800" />
                                                <div className="flex justify-between items-center">
                                                    <div><p className="text-xs text-neutral-500">{t('dashboard.from')}</p><p className="text-xl font-bold text-white">{product.price?.toFixed(2) || '...'} $</p></div>
                                                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-black hover:bg-gray-300 transition-colors"><FaSearch /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </AnimatedSection>
                        <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <GlassCard><div className=" border border-neutral-700 w-10 h-10 flex items-center justify-center rounded-xl mb-4 text-blue-400 bg-blue-900/20"><FaChartLine /></div><h3 className="font-bold text-white text-lg">{t('dashboard.promo.discoverTrends.title')}</h3><p className="text-neutral-400text-sm my-2">{t('dashboard.promo.discoverTrends.description')}</p><Link to="/dashboard/products" className="group mt-4 flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-white">{t('dashboard.promo.discoverTrends.link')} <FaChevronRight className="transition-transform group-hover:translate-x-1" /> </Link></GlassCard>
                            <GlassCard><div className=" border border-neutral-700 w-10 h-10 flex items-center justify-center rounded-xl  mb-4 text-red-400 bg-red-900/20"><FaVideo /></div><h3 className="font-bold text-white text-lg">{t('dashboard.promo.startTraining.title')}</h3><p className="text-neutral-400 text-sm my-2">{t('dashboard.promo.startTraining.description')}</p><Link to="/dashboard/training" className="group mt-4 flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-white">{t('dashboard.promo.startTraining.link')} <FaChevronRight className="transition-transform group-hover:translate-x-1" /> </Link></GlassCard>
                            <GlassCard><div className=" border border-neutral-700 w-10 h-10 flex items-center justify-center rounded-xl  mb-4 text-green-400 bg-green-900/20"><FaUsers /></div><h3 className="font-bold text-white text-lg">{t('dashboard.promo.findInfluencers.title')}</h3><p className="text-neutral-400 text-sm my-2">{t('dashboard.promo.findInfluencers.description')}</p><Link to="/dashboard/influencers" className="group mt-4 flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-white">{t('dashboard.promo.findInfluencers.link')} <FaChevronRight className="transition-transform group-hover:translate-x-1" /> </Link></GlassCard>
                        </AnimatedSection>
                    </>
                )}

                <AnimatedSection>
                    <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-white">{t('dashboard.recentActivity')}</h2><button className="px-4 py-2 text-sm rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold transition-colors hover:bg-neutral-800">{t('common.viewAll')}</button></div>
                    <GlassCard padding="p-0">
                        {notificationsLoading ? (
                            <p className="p-5 text-center text-neutral-400">{t('dashboard.loadingActivity')}</p>
                        ) : !notifications || notifications.length === 0 ? (
                            <p className="p-5 text-center text-neutral-500">{t('dashboard.noRecentActivity')}</p>
                        ) : (
                            <ul className="divide-y divide-neutral-800">
                                {notifications.map((activity) => (
                                    <li key={activity.id} className="flex items-center gap-4 p-5">
                                        <div className="bg-[#1C1E22] border border-neutral-700 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-neutral-400">
                                            <FaBell />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-white">{activity.message}</p>
                                        </div>
                                        <p className="text-sm text-neutral-500 flex-shrink-0">{timeAgo(activity.createdAt, t)}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </GlassCard>
                </AnimatedSection>

            </main>
            {selectedProduct && (
                <ProductDetailModal product={selectedProduct} show={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
            )}
        </>
    );
}

import { VideoModal } from '../components/VideoModal';

// --- Sidebar Component ---
const Sidebar: FC<{ isOpen: boolean; onNavigate: () => void; onOpenVideoModal: () => void; }> = ({ isOpen, onNavigate, onOpenVideoModal }) => {
    const { data: user } = useUserProfile();
    const { logout } = useAuth();
    const location = useLocation();
    const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const isAdmin = user?.accountType === 'ADMIN';
    const isSmmaOnly = user?.subscriptionStatus === 'SMMA_ONLY';
    const { data: unreadCounts } = useAdminUnreadCounts();

    // Discord hooks
    const discordAuthUrl = useDiscordAuthUrl();
    const discordCallback = useDiscordCallback();
    const discordDisconnect = useDiscordDisconnect();
    const isDiscordConnected = !!user?.discordId;
    const discordCallbackFired = useRef(false);

    // Handle Discord OAuth2 callback
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const state = params.get('state');
        const code = params.get('code');

        if (state === 'discord_connect' && code && !discordCallbackFired.current) {
            discordCallbackFired.current = true;
            // Clean up URL immediately to prevent re-fires
            window.history.replaceState({}, '', window.location.pathname);
            discordCallback.mutate({ code });
        }
    }, [location.search]);

    // Map paths to unread count keys
    const getBadgeCount = (path: string): number | undefined => {
        if (!unreadCounts) return undefined;
        if (path === '/dashboard/admin/support') return unreadCounts.support || undefined;
        if (path === '/dashboard/admin/shop-orders') return unreadCounts.shopOrders || undefined;
        return undefined;
    };

    type NavLink = {
        nameKey?: string;
        label?: string; // Explicit label overrides translation
        icon: React.ReactNode;
        path: string;
        isExternal?: boolean;
        adminOnly?: boolean;
        premiumOnly?: boolean; // Hidden from SMMA_ONLY users
    };

    type NavGroup = {
        title: string;
        adminOnly?: boolean;
        premiumOnly?: boolean; // Entire group hidden from SMMA_ONLY users
        items: NavLink[];
    };

    const sidebarGroups: NavGroup[] = [
        {
            title: "🏠 Accueil",
            items: [
                { nameKey: 'home', label: 'Tableau de bord', icon: <FaTachometerAlt />, path: '/dashboard' },
            ]
        },
        {
            title: "🔐 Admin",
            adminOnly: true,
            items: [
                { nameKey: 'users', label: 'Gestion utilisateurs', icon: <FaUsers />, path: '/dashboard/admin/users' },
                { nameKey: 'financials', label: 'Finances', icon: <FaCreditCard />, path: '/dashboard/admin/financials' },
                { nameKey: 'pastDue', label: 'Past Due', icon: <FaExclamationTriangle />, path: '/dashboard/admin/financials/past-due' },
                { nameKey: 'supportInbox', label: 'Support Inbox', icon: <FaTicketAlt />, path: '/dashboard/admin/support' },
                { nameKey: 'shopOrders', label: 'Commandes boutiques', icon: <FaShoppingBag />, path: '/dashboard/admin/shop-orders' },
                { nameKey: 'dashboard', label: 'Tableau de bord', icon: <FaTachometerAlt />, path: '/dashboard/admin' },
            ]
        },
        {
            title: "🎓 Formation",
            items: [
                { nameKey: 'training', label: 'Formation vidéo', icon: <FaVideo />, path: '/dashboard/training' },
                { nameKey: 'agent', label: 'Coach Dylan', icon: <FaRobot />, path: '/dashboard/agent-ia', premiumOnly: true },
                { nameKey: 'updates', label: 'Dernières nouveautés', icon: <FaBolt className="text-yellow-400" />, path: '/dashboard/updates', premiumOnly: true },
                { nameKey: 'resources', label: 'Ressources', icon: <FaFolderOpen />, path: '/dashboard/resources', premiumOnly: true },
                { nameKey: 'manageResources', label: 'Gestion ressources', icon: <FaFolderOpen />, path: '/dashboard/admin/resources', adminOnly: true },
            ]
        },
        {
            title: "🚀 Lancer mon business",
            items: [
                { nameKey: 'orderShop', label: 'Commander ma boutique', icon: <FaShoppingBag className="text-green-400" />, path: '/dashboard/order-shop' },
                { nameKey: 'visuelsAds', label: 'Visuels Ads', icon: <FaCrown className="text-yellow-500" />, path: 'https://opalolabs.com/?via=Dycom', isExternal: true, premiumOnly: true },
                { nameKey: 'influencers', label: 'Influencers', icon: <FaUsers />, path: '/dashboard/influencers', premiumOnly: true },
                { nameKey: 'trendtrack', label: 'TrendTrack', icon: <FaStar className="text-yellow-400" />, path: 'https://dev.trendtrack.io/promoter/dydy20', isExternal: true, premiumOnly: true },
                { nameKey: 'suppliers', label: 'Fournisseurs', icon: <FaStore />, path: '/dashboard/suppliers', premiumOnly: true },
                { nameKey: 'products', label: 'Produits tendance', icon: <FaChartLine />, path: '/dashboard/products', premiumOnly: true },
            ]
        },
        {
            title: "Aide ?",
            items: [
                { nameKey: 'support', label: 'Support', icon: <FaHeadset />, path: '/dashboard/support' },
                { nameKey: 'whatsapp', label: 'Whatsapp SAV Dycom', icon: <FaWhatsapp className="text-green-500" />, path: 'https://wa.me/message/SCESABMUBCVOF1', isExternal: true },
            ]
        },
        {
            title: "👤 Mon compte",
            items: [
                { nameKey: 'myOrders', label: 'Mes commandes', icon: <FaShoppingBag className="text-blue-400" />, path: '/dashboard/my-orders' },
                { nameKey: 'billing', label: 'Facturation', icon: <FaCreditCard />, path: '/dashboard/billing' },
                { nameKey: 'settings', label: 'Paramètres', icon: <FaCog />, path: '/dashboard/settings' },
                { nameKey: 'affiliate', label: 'Affiliation', icon: <FaGift />, path: '/dashboard/affiliate' },
            ]
        }
    ];

    // MODIFICATION: Conditionally apply positioning and transform classes
    const sidebarClasses = `
        bg-[#111317] p-6 flex flex-col h-screen transition-transform duration-300 ease-in-out
        w-72 flex-shrink-0 fixed top-0 z-40
        md:sticky md:translate-x-0
        ${isRtl ? 'right-0' : 'left-0'}
        ${isOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}
    `;

    // State for collapsible groups
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Effect to set initial expanded group and handle navigation changes
    useEffect(() => {
        const foundGroup = sidebarGroups.find(group =>
            group.items.some(link => !link.isExternal && location.pathname.startsWith(link.path))
        );

        if (foundGroup) {
            setExpandedGroups(prev => ({
                ...prev,
                [foundGroup.title]: true
            }));
        }
    }, [location.pathname]); // Update when path changes

    // Update state initialization to run once on mount for the initial path if needed, 
    // but the useEffect covers it. To avoid "flash", we can lazy init.
    // However, since `sidebarGroups` is defined inside the component, we can't easily access it in useState initializer 
    // WITHOUT refactoring where sidebarGroups is defined. 
    // Let's rely on the useEffect for simplicity as it runs immediately after render, or refactor sidebarGroups structure.

    // Better approach: Define helper to find active group title
    const getActiveGroupTitle = () => {
        const found = sidebarGroups.find(group =>
            group.items.some(link => !link.isExternal && location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path)))
        );
        return found ? found.title : null;
    };

    // Initialize state keeping only the active group open
    useEffect(() => {
        const activeTitle = getActiveGroupTitle();
        if (activeTitle) {
            setExpandedGroups({ [activeTitle]: true });
        }
    }, [location.pathname]);

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev => {
            const isOpen = prev[title];
            // If clicking an open group, close it (empty object).
            // If clicking a closed group, open it and close others (object with just that title).
            return isOpen ? {} : { [title]: true };
        });
    };

    return (
        <>
            <aside className={sidebarClasses}>
                <Link to="/dashboard" onClick={onNavigate} className="flex items-center gap-3 mb-6 mt-4 cursor-pointer hover:opacity-80 transition-opacity">
                    <img className='w-[80%]' src='/logo2.png' alt='logo' />
                </Link>

                {/* Academy Presentation Button */}
                <div className="px-2 mb-6">
                    <button
                        onClick={onOpenVideoModal}
                        className="relative w-full group overflow-hidden rounded-xl p-[1px] transition-all hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]"
                    >
                        {/* Gradient Border */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Inner Content */}
                        <div className="relative flex items-center justify-center gap-2 w-full h-full bg-[#111317] group-hover:bg-[#16181d] rounded-xl px-4 py-3 transition-colors duration-300">
                            <FaRocket className="text-purple-400 group-hover:text-pink-400 group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-300 group-hover:from-white group-hover:to-white">
                                {t('sidebar.academyPresentation', "Présentation de l'académie")}
                            </span>
                        </div>
                    </button>

                    {/* Discord Server */}
                    <button
                        onClick={() => {
                            if (isDiscordConnected) {
                                setIsDiscordModalOpen(true);
                            } else {
                                discordAuthUrl.mutate(undefined, {
                                    onSuccess: (data) => {
                                        window.location.href = data.url;
                                    },
                                });
                            }
                        }}
                        disabled={discordAuthUrl.isPending || discordCallback.isPending}
                        className="relative w-full group overflow-hidden rounded-xl p-[1px] mt-3 transition-all hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]"
                    >
                        {/* Gradient Border */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${isDiscordConnected ? 'from-green-500 via-emerald-500 to-teal-500' : 'from-indigo-500 via-blue-500 to-purple-500'} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />

                        {/* Inner Content */}
                        <div className="relative flex items-center justify-between w-full h-full bg-[#111317] group-hover:bg-[#16181d] rounded-xl px-4 py-3 transition-colors duration-300">
                            <div className="flex items-center gap-2">
                                <FaDiscord className={`${isDiscordConnected ? 'text-green-400 group-hover:text-green-300' : 'text-indigo-400 group-hover:text-indigo-300'} text-lg transition-colors duration-300`} />
                                <span className="font-bold text-sm text-neutral-300 group-hover:text-white transition-colors duration-300">
                                    Discord
                                </span>
                            </div>
                            {isDiscordConnected ? (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-300 bg-green-500/15 border border-green-500/30 rounded-full px-2.5 py-0.5">
                                    <FaCheck className="text-[8px]" />
                                    connecté
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-2.5 py-0.5">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400"></span>
                                    </span>
                                    rejoindre
                                </span>
                            )}
                        </div>
                    </button>
                </div>

                <nav className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2">
                    {sidebarGroups.map((group, groupIndex) => {
                        // Filter groups: if group is adminOnly, user must be admin
                        if (group.adminOnly && !isAdmin) return null;
                        // Filter items within group (keep premiumOnly visible but locked for SMMA)
                        const visibleItems = group.items.filter(item => {
                            if (item.adminOnly && !isAdmin) return false;
                            return true;
                        });

                        if (visibleItems.length === 0) return null;

                        const isExpanded = expandedGroups[group.title];

                        return (
                            <div key={groupIndex} className="border-b border-neutral-800/50 pb-2 last:border-0">
                                {/* Group Header / Toggle */}
                                <button
                                    onClick={() => toggleGroup(group.title)}
                                    className="w-full flex items-center justify-between px-2 py-2 text-xs font-bold text-neutral-500 uppercase tracking-wider hover:text-white transition-colors focus:outline-none"
                                >
                                    <span>{group.title}</span>
                                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                </button>

                                {/* Collapsible Content */}
                                <div className={`flex flex-col gap-1 mt-1 transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {visibleItems.map((link) => {
                                        const linkLabel = link.label || (link.nameKey ? t(`sidebar.nav.${link.nameKey}`) : '');
                                        const isLocked = link.premiumOnly && isSmmaOnly;

                                        // Locked premium items for SMMA users — visible but greyed out with lock
                                        if (isLocked) {
                                            return (
                                                <Link
                                                    key={link.path}
                                                    to="/dashboard/billing"
                                                    onClick={onNavigate}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-left text-sm text-neutral-600 hover:bg-purple-500/5 hover:text-neutral-400 group cursor-pointer"
                                                >
                                                    <span className="text-lg opacity-40">{link.icon}</span>
                                                    <span className="flex-1 opacity-50">{linkLabel}</span>
                                                    <FaLock className="text-[10px] text-purple-400/60 group-hover:text-purple-400 transition-colors" />
                                                </Link>
                                            );
                                        }

                                        if (link.isExternal) {
                                            return (
                                                <a
                                                    key={link.path}
                                                    href={link.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={onNavigate}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-left text-neutral-400 hover:bg-[#1C1E22] hover:text-white text-sm"
                                                >
                                                    <span className="text-lg">{link.icon}</span> <span>{linkLabel}</span>
                                                </a>
                                            );
                                        }

                                        const isActive = location.pathname === link.path;
                                        const badgeCount = getBadgeCount(link.path);
                                        return (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                onClick={onNavigate}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-left text-sm ${isActive ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:bg-[#1C1E22] hover:text-white'}`}
                                            >
                                                <span className="text-lg relative">
                                                    {link.icon}
                                                    {badgeCount && badgeCount > 0 && (
                                                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                                                            {badgeCount > 9 ? '9+' : badgeCount}
                                                        </span>
                                                    )}
                                                </span>
                                                <span>{linkLabel}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                <div className="mt-auto flex flex-col gap-4 pt-4 border-t border-neutral-800">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1C1E22]">
                        <Link to="/dashboard/settings" onClick={onNavigate} className="flex items-center gap-3 flex-1 min-w-0 group cursor-pointer">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={`${user?.firstName} ${user?.lastName}`}
                                    className="w-10 h-10 rounded-full object-cover border border-neutral-700 group-hover:border-neutral-500 transition-colors"
                                />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                                    alt={`${user?.firstName} ${user?.lastName}`}
                                    className="w-10 h-10 rounded-full group-hover:opacity-80 transition-opacity"
                                />
                            )}
                            <div className='min-w-0 flex-1'>
                                <p className="font-semibold text-white truncate group-hover:text-neutral-300 transition-colors">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs w-full text-neutral-400 truncate">{user?.email}</p>
                            </div>
                        </Link>
                    </div>
                    <div className='flex ml-3 '><LanguageSwitcher /></div>
                    <button onClick={logout} className="ml-3 cursor-pointer flex items-center gap-3 text-neutral-400 hover:text-white w-full text-left"><FaSignOutAlt /><span>{t('sidebar.logout')}</span></button>
                </div>
            </aside>

            {/* Discord Connected Modal — Disconnect option */}
            {
                isDiscordModalOpen && isDiscordConnected && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setIsDiscordModalOpen(false)}>
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                        {/* Modal */}
                        <div
                            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-700/50 shadow-2xl"
                            style={{ background: 'linear-gradient(145deg, #1a1c23 0%, #111317 50%, #0d0f13 100%)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative gradient glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/15 rounded-full blur-3xl" />

                            <div className="relative p-8 flex flex-col items-center text-center">
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
                                    <FaDiscord className="text-green-400 text-3xl" />
                                </div>

                                {/* Badge */}
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-300 bg-green-500/10 border border-green-500/25 rounded-full px-4 py-1.5 mb-4">
                                    <FaCheck className="text-[10px]" />
                                    Connecté
                                </span>

                                {/* Text */}
                                <h3 className="text-xl font-bold text-white mb-2">Serveur Discord</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">
                                    Votre compte Discord est connecté et vous avez accès au serveur de la communauté.
                                </p>

                                {/* Open Server Button */}
                                <a
                                    href="https://discord.com/channels/1445714338731262063"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                                >
                                    <FaDiscord className="text-base" />
                                    Ouvrir le Serveur
                                </a>

                                {/* Disconnect Button */}
                                <button
                                    onClick={() => {
                                        discordDisconnect.mutate();
                                        setIsDiscordModalOpen(false);
                                    }}
                                    disabled={discordDisconnect.isPending}
                                    className="mt-3 w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaTimesCircle className="text-xs" />
                                    {discordDisconnect.isPending ? 'Déconnexion...' : 'Déconnecter Discord'}
                                </button>

                                {/* Close Button */}
                                <button
                                    onClick={() => setIsDiscordModalOpen(false)}
                                    className="mt-3 w-full py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

// --- A generic page for features not yet built ---
export const ComingSoonPage: FC<{ pageTitle: string }> = ({ pageTitle }) => {
    const { t } = useTranslation();
    return (
        <main className="flex-1 flex flex-col p-6 md:p-8">
            <div className="mb-8"><h1 className="text-4xl font-bold text-white">{pageTitle}</h1><p className="text-neutral-400 mt-1">{t('comingSoon.subtitle')}</p></div>
            <div className="flex-1 flex items-center justify-center"><GlassCard className="text-center"><h2 className="text-2xl font-bold text-white">{t('comingSoon.title')}</h2><p className="text-neutral-400 mt-2">{t('comingSoon.description')}</p></GlassCard></div>
        </main>
    );
}

// --- Main Page Component / Controller ---
const DashboardPage: FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [showPastDueModal, setShowPastDueModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
    const { t, i18n } = useTranslation(); // Get i18n instance


    // MODIFICATION: Check for RTL language
    const isRtl = i18n.language === 'ar';

    // Routes restricted from SMMA_ONLY users (premium features)
    const PREMIUM_ONLY_ROUTES = [
        '/dashboard/agent-ia',
        '/dashboard/resources',
        '/dashboard/updates',
        '/dashboard/products',
        '/dashboard/influencers',
        '/dashboard/suppliers',
    ];

    useEffect(() => {
        if (isProfileLoading) return; // Wait for profile to load

        const status = userProfile?.subscriptionStatus;
        const isAdmin = userProfile?.accountType === 'ADMIN';
        const isOnBillingPage = location.pathname === '/dashboard/billing';
        const isOnSupportPage = location.pathname.startsWith('/dashboard/support');

        // Show blocking popup for PAST_DUE users (installment expired)
        if (!isAdmin && status === 'PAST_DUE') {
            setShowPastDueModal(true);
            // Only allow billing and support pages for PAST_DUE users
            if (!isOnBillingPage && !isOnSupportPage) {
                navigate('/dashboard/billing', { replace: true });
            }
            return;
        } else {
            setShowPastDueModal(false);
        }

        // Redirect non-subscribers to billing
        if (!isAdmin && status !== 'ACTIVE' && status !== 'TRIALING' && status !== 'LIFETIME_ACCESS' && status !== 'SMMA_ONLY' && !isOnBillingPage && !isOnSupportPage) {
            navigate('/dashboard/billing', { replace: true });
            return;
        }

        // Redirect SMMA_ONLY users away from premium-only routes
        if (!isAdmin && status === 'SMMA_ONLY' && PREMIUM_ONLY_ROUTES.some(route => location.pathname.startsWith(route))) {
            navigate('/dashboard/training', { replace: true });
        }
    }, [isProfileLoading, userProfile, location.pathname, navigate]);

    const handleNavigate = () => {
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    if (isProfileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
                <p className="text-white text-lg">{t('dashboard.loadingWorkspace')}</p>
            </div>
        );
    }
    // Only show welcome modal to active subscribers who haven't seen it
    const isActiveMember = userProfile?.subscriptionStatus === 'ACTIVE' ||
        userProfile?.subscriptionStatus === 'TRIALING' ||
        userProfile?.subscriptionStatus === 'LIFETIME_ACCESS' ||
        userProfile?.subscriptionStatus === 'SMMA_ONLY';
    const showWelcomeModal = userProfile && !userProfile.hasSeenWelcomeModal && isActiveMember;

    return (
        <div className="min-h-screen font-sans " style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            <div className="flex w-full ">

                {showWelcomeModal && (
                    <WelcomeModal onClose={() => {/* Logic handled inside component via mutation */ }} />
                )}

                {/* PAST_DUE Blocking Modal */}
                {showPastDueModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
                        <div
                            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/30 shadow-2xl"
                            style={{ background: 'linear-gradient(145deg, #1a1c23 0%, #111317 50%, #0d0f13 100%)' }}
                        >
                            {/* Decorative glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/15 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />

                            <div className="relative p-8 flex flex-col items-center text-center">
                                {/* Warning Icon */}
                                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                                    <FaExclamationTriangle className="text-red-400 text-3xl" />
                                </div>

                                {/* Badge */}
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-300 bg-red-500/10 border border-red-500/25 rounded-full px-4 py-1.5 mb-4">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                                    </span>
                                    Paiement en retard
                                </span>

                                {/* Title & Description */}
                                <h3 className="text-2xl font-bold text-white mb-3">Accès suspendu</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed mb-2">
                                    Votre période d'abonnement est arrivée à expiration.
                                </p>
                                <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                                    Veuillez procéder au paiement de votre prochaine mensualité pour restaurer votre accès.
                                </p>

                                {/* Installment Progress */}
                                {userProfile && userProfile.installmentsRequired > 1 && (
                                    <div className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 mb-6">
                                        <div className="flex justify-between text-xs text-neutral-400 mb-2">
                                            <span>Progression</span>
                                            <span className="text-white font-bold">{userProfile.installmentsPaid} / {userProfile.installmentsRequired}</span>
                                        </div>
                                        <div className="w-full bg-neutral-700 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                                                style={{ width: `${Math.min((userProfile.installmentsPaid / userProfile.installmentsRequired) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* CTA Buttons */}
                                <button
                                    onClick={() => { setShowPastDueModal(false); navigate('/dashboard/billing'); }}
                                    className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors mb-3 shadow-lg shadow-white/10"
                                >
                                    Voir ma facturation
                                </button>
                                <a
                                    href="https://wa.me/message/SCESABMUBCVOF1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-sm font-semibold text-[#25D366] hover:bg-[#25D366]/20 transition-colors mb-3 flex items-center justify-center gap-2"
                                >
                                    <FaWhatsapp size={18} /> Contacter sur WhatsApp
                                </a>
                                <button
                                    onClick={() => { setShowPastDueModal(false); navigate('/dashboard/support'); }}
                                    className="w-full py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-sm font-semibold text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                                >
                                    Email de support
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className={`flex w-full ${showWelcomeModal ? 'blur-sm pointer-events-none h-screen overflow-hidden' : ''}`}>
                    {/* ^ Optional: Add blur/lock to background when modal is open */}

                    {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
                    <Sidebar isOpen={isSidebarOpen} onNavigate={handleNavigate} onOpenVideoModal={() => setIsVideoModalOpen(true)} />
                    <div className="flex-1 flex flex-col min-w-0 ">
                        {/* Mobile menu button — sticky bar */}
                        <div className={`md:hidden sticky top-0 z-20 p-3 bg-[#030712]/90 backdrop-blur-md border-b border-neutral-800/50 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2.5 bg-[#1C1E22] rounded-lg text-white border border-neutral-700 hover:bg-neutral-800 transition-colors"
                            >
                                <FaBars />
                            </button>
                        </div>
                        <Outlet />
                    </div>
                    {/* Floating Support Widget */}
                    <SupportWidget />

                </div>
            </div>
            {/* Video Modal - Rendered at root level to be on top of everything including sidebar */}
            {isVideoModalOpen && (
                <VideoModal
                    isOpen={isVideoModalOpen}
                    onClose={() => setIsVideoModalOpen(false)}
                    vimeoId="1151206665"
                    title={t('sidebar.academyPresentation', "Présentation de l'académie")}
                />
            )}
        </div>
    );
};

export default DashboardPage;