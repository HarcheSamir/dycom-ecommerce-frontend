import React, { useState, useEffect, useRef, type FC } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUser';
import { useWinningProducts, type WinningProduct } from '../hooks/useWinningProducts';
import ProductDetailModal from '../components/ProductDetailModal';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useNotifications } from '../hooks/useNotifications';

import {
    FaTachometerAlt, FaChartLine, FaStore, FaVideo, FaGift, FaUsers, FaCog, FaShieldAlt, FaSignOutAlt, FaGlobe, FaChevronRight, FaStar, FaSearch, FaBars, FaBell, FaCreditCard
} from 'react-icons/fa';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

// --- Type Definitions ---
type NavLink = { name: string; icon: React.ReactNode; path: string };

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
            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
                <AnimatedSection>
                    <h1 className="text-4xl font-bold text-white">{t('dashboard.welcome', { name: userProfile?.firstName || 'User' })}</h1>
                    <p className="text-neutral-400 mt-1">{t('dashboard.welcomeSubtitle')}</p>
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

// --- Sidebar Component ---
const Sidebar: FC<{ isOpen: boolean; onNavigate: () => void; }> = ({ isOpen, onNavigate }) => {
    const { data: user } = useUserProfile();
    const { logout } = useAuth();
    const location = useLocation();
    const { t, i18n } = useTranslation(); // Get i18n instance

    // MODIFICATION: Check if the current language is RTL
    const isRtl = i18n.language === 'ar';

    const baseNavLinks = [
        { nameKey: 'dashboard', icon: <FaTachometerAlt />, path: '/dashboard' },
        { nameKey: 'products', icon: <FaChartLine />, path: '/dashboard/products' },
        { nameKey: 'suppliers', icon: <FaStore />, path: '/dashboard/suppliers' },
        { nameKey: 'training', icon: <FaVideo />, path: '/dashboard/training' },
        { nameKey: 'influencers', icon: <FaUsers />, path: '/dashboard/influencers' },
        { nameKey: 'billing', icon: <FaCreditCard />, path: '/dashboard/billing' },
        { nameKey: 'settings', icon: <FaCog />, path: '/dashboard/settings' },
        { nameKey: 'affiliate', icon: <FaGift />, path: '/dashboard/affiliate' },

    ];

    if (user && user.accountType === 'ADMIN') {
        baseNavLinks.unshift({ nameKey: 'admin', icon: <FaShieldAlt />, path: '/dashboard/admin' },
            { nameKey: 'users', icon: <FaUsers />, path: '/dashboard/admin/users' },
            { nameKey: 'financials', icon: <FaCreditCard />, path: '/dashboard/admin/financials' }
        );
    }

    const navLinks: NavLink[] = baseNavLinks.map(link => ({
        name: t(`sidebar.nav.${link.nameKey}`),
        icon: link.icon,
        path: link.path,
    }));

    // MODIFICATION: Conditionally apply positioning and transform classes
    const sidebarClasses = `
        bg-[#111317] p-6 flex flex-col h-screen transition-transform duration-300 ease-in-out
        w-72 flex-shrink-0 fixed top-0 z-40
        md:sticky md:translate-x-0
        ${isRtl ? 'right-0' : 'left-0'}
        ${isOpen ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}
    `;

    return (
        <aside className={sidebarClasses}>
            {/* ... rest of the component is unchanged ... */}
            <div className="flex items-center gap-3 mb-6 mt-4 "> <img className='w-[80%]' src='/logo2.png' alt='logo' /></div>
            <nav className="flex flex-col gap-2 overflow-y-scroll">{navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                    <Link key={link.name} to={link.path} onClick={onNavigate} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-left ${isActive ? 'bg-gray-200 text-black font-semibold' : 'text-neutral-400 hover:bg-[#1C1E22] hover:text-white'}`}>
                        {link.icon} <span>{link.name}</span>
                    </Link>
                );
            })}</nav>


            <div className="mt-auto flex flex-col gap-4 ">
                <div className="mb-4 ">
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1C1E22]">
                    <img
                        src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
                        alt={`${user?.firstName} ${user?.lastName}`}
                        className="w-10 h-10 rounded-full"
                    />
                    <div className='min-w-0 flex-1 '>
                        <p className="font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs w-full text-neutral-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <div className='flex ml-3 '><LanguageSwitcher /></div>
                <button onClick={logout} className="ml-3 cursor-pointer flex items-center gap-3 text-neutral-400 hover:text-white w-full text-left"><FaSignOutAlt /><span>{t('sidebar.logout')}</span></button></div>
        </aside>
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
    const navigate = useNavigate();
    const location = useLocation();
    const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
    const { t, i18n } = useTranslation(); // Get i18n instance

    // MODIFICATION: Check for RTL language
    const isRtl = i18n.language === 'ar';

    useEffect(() => {
        if (isProfileLoading) return; // Wait for profile to load

        const status = userProfile?.subscriptionStatus;
        const isAdmin = userProfile?.accountType === 'ADMIN';
        const isOnBillingPage = location.pathname === '/dashboard/billing';

        if (!isAdmin && status !== 'ACTIVE' && status !== 'TRIALING' && status !== 'LIFETIME_ACCESS' && !isOnBillingPage) {
            navigate('/dashboard/billing', { replace: true });
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

    return (
        <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            <div className="flex">
                {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
                <Sidebar isOpen={isSidebarOpen} onNavigate={handleNavigate} />
                <div className="flex-1 flex flex-col min-w-0">
                    {/* MODIFICATION: Conditionally position the mobile menu button */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className={`md:hidden absolute top-5 z-20 p-2 bg-[#1C1E22] rounded-md text-white ${isRtl ? 'right-5' : 'left-5'}`}
                    >
                        <FaBars />
                    </button>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;