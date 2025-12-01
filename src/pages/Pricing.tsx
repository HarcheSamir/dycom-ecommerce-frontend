// src/pages/Pricing.tsx

import React, { useState, useMemo, type FC, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetSubscriptionPlans, type SubscriptionPlan } from '../hooks/useUser';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle, FaGem, FaChevronDown } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

// --- SHARED COMPONENTS ---

const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative flex flex-col h-full ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

const MenuIcon: FC<{ open: boolean }> = ({ open }) => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        )}
    </svg>
);

const ChevronDownIcon: FC = () => (
    <svg className="h-6 w-6 text-primary transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
);

const Header: FC = () => {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, isLoading } = useAuth();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        if (isMenuOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < 10) {
                setIsVisible(true);
            } else if (currentScrollY < lastScrollY) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <>
            <header
                className="fixed top-0 left-0 right-0 z-50 px-6 pt-6 transition-transform duration-300 ease-in-out"
                style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-100%)' }}
            >
                <div className="container mx-auto bg-neutral-900/50 border border-neutral-800 rounded-xl backdrop-blur-md">
                    <div className="grid grid-cols-2 md:grid-cols-3 h-16 px-6">
                        <div className='flex items-center'>
                            <a href="/" className="flex items-center gap-3" aria-label="Home">
                                <img className='w-40' src='/logo2.png' alt='logo' />
                            </a>
                            <div className="hidden sm:block mx-8">
                                <LanguageSwitcher />
                            </div>
                        </div>

                        <nav className="hidden justify-center md:flex items-center gap-8 text-sm font-medium">
                            <a className="text-neutral-400 hover:text-white transition-colors" href="/home#features">{t('landingPage.header.features')}</a>
                            <a className="text-white font-semibold transition-colors" href="/pricing">{t('membershipPricing.header.getStarted')}</a>
                            <a className="text-neutral-400 hover:text-white transition-colors" href="/home#footer">{t('landingPage.header.about')}</a>
                        </nav>

                        <div className="flex justify-end items-center gap-4">
                            {!isLoading && !isAuthenticated && (
                                <>
                                    <a className="hidden sm:inline-block text-sm font-medium text-neutral-400 hover:text-white transition-colors" href="/login">{t('landingPage.header.login')}</a>
                                    <a className="hidden sm:inline-block rounded-lg bg-gray-200 text-black px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-300" href="/signup">{t('membershipPricing.header.getStarted')}</a>
                                </>
                            )}
                            {!isLoading && isAuthenticated && (<a className="hidden sm:inline-block rounded-lg bg-gray-200 text-black px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-300" href="/dashboard">{t('membershipPricing.header.dashboard')}</a>)}
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-neutral-100 z-50 p-2 -mr-2" aria-controls="mobile-menu" aria-expanded={isMenuOpen}><MenuIcon open={isMenuOpen} /></button>
                        </div>
                    </div>
                </div>
            </header>
            <div id="mobile-menu" className={`fixed inset-0 z-40 bg-[#0d0f12]/95 backdrop-blur-md md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <nav className="flex flex-col items-center justify-center h-full gap-8 text-xl font-medium">
                    <a onClick={() => setIsMenuOpen(false)} className="text-neutral-300 hover:text-white" href="/home#features">{t('landingPage.header.features')}</a>
                    <a onClick={() => setIsMenuOpen(false)} className="text-white font-semibold" href="/pricing">{t('landingPage.header.pricing')}</a>
                    <a onClick={() => setIsMenuOpen(false)} className="text-neutral-300 hover:text-white" href="/home#footer">{t('landingPage.header.about')}</a>
                    <div className="mt-8 flex flex-col items-center gap-6 w-full px-8">
                        {!isLoading && !isAuthenticated && (
                            <>
                                <a className="w-full text-center text-lg font-medium text-neutral-300 hover:text-white" href="/login">{t('landingPage.header.login')}</a>
                                <a className="w-full text-center rounded-lg bg-gray-200 text-black px-5 py-3 text-lg font-semibold" href="/signup">{t('membershipPricing.header.getStarted')}</a>
                            </>
                        )}
                        {!isLoading && isAuthenticated && (<a className="w-full text-center rounded-lg bg-gray-200 text-black px-5 py-3 text-lgfont-semibold" href="/dashboard">{t('membershipPricing.header.dashboard')}</a>)}
                    </div>
                    <div className="absolute bottom-10">
                        <LanguageSwitcher />
                    </div>
                </nav>
            </div>
        </>
    );
};

// --- FAQ COMPONENTS ---

const FaqItem: FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
    <details className="group rounded-lg border border-[#333333] bg-[#1a1a1a] p-5 sm:p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between text-base sm:text-lg font-semibold text-white">
            {question}
            <ChevronDownIcon />
        </summary>
        <p className="mt-4 text-sm sm:text-base text-[#a3a3a3]">{children}</p>
    </details>
);

const FaqSection: FC = () => {
    const { t } = useTranslation();
    const faqs = t('membershipPricing.faq.questions', { returnObjects: true }) as { q: string, a: string }[] || [];

    if (!Array.isArray(faqs) || faqs.length === 0) return null;

    return (
        <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <h2 className="text-center text-3xl sm:text-4xl font-bold tracking-tight text-white">{t('membershipPricing.faq.title')}</h2>
            <div className="mx-auto mt-10 sm:mt-12 max-w-3xl space-y-4">
                {faqs.map((faq, index) => (
                    <FaqItem key={index} question={faq.q}>{faq.a}</FaqItem>
                ))}
            </div>
        </section>
    );
};

const Footer: FC = () => {
    const { t } = useTranslation();
    return (
        <footer className="py-16" id="footer">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-3 mb-4"><img className='w-40' src='/logo2.png' alt='logo' /></div>
                        <p className="text-neutral-400">{t('membershipPricing.footer.tagline')}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t('landingPage.footer.productTitle')}</h4>
                        <ul className="space-y-3">
                            <li><a href="/home#features" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.productLink1')}</a></li>
                            <li><a href="/home#features" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.productLink2')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t('landingPage.footer.companyTitle')}</h4>
                        <ul className="space-y-3">
                            <li><a href="/home#footer" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.companyLink1')}</a></li>
                            <li><a href="/pricing" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.companyLink2')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t('landingPage.footer.legalTitle')}</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.legalLink1')}</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
                    <p>{t('membershipPricing.footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
};

// --- PRICING CARD COMPONENT ---

interface PricingCardProps {
    plan: SubscriptionPlan;
    isBestValue?: boolean;
    locale: string;
    features: string[];
}

const PricingCard: FC<PricingCardProps> = ({ plan, isBestValue, locale, features }) => {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();

    // Extract metadata
    const installments = plan.metadata?.installments ? parseInt(plan.metadata.installments) : 1;
    const isOneTime = installments === 1;

    // Format prices
    const priceFormatted = new Intl.NumberFormat(locale, { style: 'currency', currency: plan.currency }).format(plan.price / 100);
    const totalCost = isOneTime ? plan.price : (plan.price * installments);
    const totalFormatted = new Intl.NumberFormat(locale, { style: 'currency', currency: plan.currency }).format(totalCost / 100);

    // --- NEW: Generate offer string (1x, 2x, 3x) ---
    const offerQuery = `&offer=${installments}x`;

    return (
        <GlassCard className={`flex-1 flex flex-col h-full ${isBestValue ? 'border-primary/50 shadow-2xl shadow-primary/10 relative transform scale-105 z-10 bg-neutral-900/40' : ''}`}>
            {isBestValue && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg">
                    {t('membershipPricing.card.bestValue')}
                </div>
            )}

            <div className="mb-4">
                <h3 className="text-2xl font-bold text-white mb-2">
                    {isOneTime ? t('membershipPricing.card.oneTime') : t('membershipPricing.card.installments', { count: installments })}
                </h3>
                {isOneTime && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/30 border border-green-500/30">
                        <FaGem className="text-green-400 text-xs" />
                        <span className="text-green-400 text-xs font-bold uppercase tracking-wider">{t('membershipPricing.card.lifetime')}</span>
                    </div>
                )}
            </div>

            <div className="mb-8 border-b border-neutral-800 pb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white tracking-tight">{priceFormatted}</span>
                    {!isOneTime && <span className="text-lg text-neutral-400 font-medium">{t('membershipPricing.card.perMonth')}</span>}
                </div>
                {!isOneTime && (
                    <p className="text-sm text-neutral-500 mt-3 font-medium">
                        {t('membershipPricing.card.totalCost', { amount: totalFormatted })}
                    </p>
                )}
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
                {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                        <FaCheckCircle className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="leading-snug">{f}</span>
                    </li>
                ))}
            </ul>

            <Link
                // --- CHANGED: Append offerQuery to the URL ---
                to={isAuthenticated ? `/dashboard/billing?plan=${plan.id}${offerQuery}` : `/signup?plan=${plan.id}${offerQuery}`}
                className={`w-full block py-4 rounded-xl text-center font-bold text-lg transition-all ${isBestValue ? 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10' : 'bg-[#1C1E22] border border-neutral-700 text-white hover:bg-neutral-800'}`}
            >
                {t('membershipPricing.card.startNow')}
            </Link>
        </GlassCard>
    );
};

// --- MAIN PRICING PAGE ---

const PricingPage: FC = () => {
    const { t, i18n } = useTranslation();
    const [searchParams] = useSearchParams();
    
    // --- CHANGED: Always show all plans (Installments included) ---
    const showInstallments = true; // Was: searchParams.get('offer') === 'flex';

    let currency: 'eur' | 'usd' | 'aed' = 'usd';
    if (i18n.language === 'fr') currency = 'eur';
    if (i18n.language === 'ar') currency = 'aed';

    const { data: plans, isLoading } = useGetSubscriptionPlans(currency);
    const locale = currency === 'eur' ? 'fr-FR' : (currency === 'aed' ? 'ar-AE' : 'en-US');

    const features = t('billingPage.features', { returnObjects: true }) as string[];

    const sortedPlans = useMemo(() => {
        if (!plans) return [];
        
        let availablePlans = plans.filter(p => p.metadata?.type === 'membership_tier');

        // Logic handled by 'showInstallments' which is now true
        if (!showInstallments) {
            availablePlans = availablePlans.filter(p => p.metadata?.installments === '1');
        }

        return availablePlans.sort((a, b) => {
            const instA = parseInt(a.metadata?.installments || '1');
            const instB = parseInt(b.metadata?.installments || '1');
            return instA - instB;
        });
    }, [plans, showInstallments]);

    // Dynamic grid classes
    const gridClasses = showInstallments 
        ? "grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full items-stretch"
        : "flex flex-col items-center justify-center w-full max-w-md";

    return (
        <div className="relative overflow-x-clip font-sans w-full text-white min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            <div className="absolute top-[-20rem] left-[-25rem] w-[50rem] h-[50rem] rounded-full animate-[float-A_15s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.2), transparent 60%)', filter: 'blur(128px)' }} />
            <div className="absolute top-[30rem] right-[-30rem] w-[60rem] h-[60rem] rounded-full animate-[float-B_20s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.15), transparent 70%)', filter: 'blur(128px)' }} />

            <div className="relative flex flex-col flex-1 z-10">
                <Header />

                <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-[#1C1E22] border border-neutral-800 rounded-full px-4 py-2 mb-6 animate-[fadeIn-up_1s_ease-out]">
                            <FaGem className="text-primary" />
                            <span className="text-sm font-medium text-neutral-300">{t('membershipPricing.hero.tagline')}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight animate-[fadeIn-up_1s_ease-out_0.2s] [animation-fill-mode:forwards] opacity-0">
                            {t('membershipPricing.hero.title')}
                        </h1>
                        <p className="text-neutral-400 text-lg max-w-2xl mx-auto animate-[fadeIn-up_1s_ease-out_0.4s] [animation-fill-mode:forwards] opacity-0">
                            {t('membershipPricing.hero.subtitle')}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                    ) : sortedPlans.length === 0 ? (
                        <div className="text-center text-neutral-500 bg-[#1C1E22] p-8 rounded-2xl border border-neutral-800">
                            {t('membershipPricing.plan.loadingError')}
                        </div>
                    ) : (
                        <div className={`${gridClasses} animate-[fadeIn-up_1s_ease-out_0.6s] [animation-fill-mode:forwards] opacity-0`}>
                            {sortedPlans.map((plan) => (
                                <div key={plan.id} className="w-full h-full">
                                    <PricingCard
                                        plan={plan}
                                        locale={locale}
                                        features={features}
                                        isBestValue={plan.metadata?.installments === '1'}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="max-w-3xl w-full mt-24 animate-[fadeIn-up_1s_ease-out_0.8s] [animation-fill-mode:forwards] opacity-0">
                        <FaqSection />
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default PricingPage;