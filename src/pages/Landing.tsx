import React, { useState, useEffect, useRef, type FC } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaCheck, FaChartLine, FaPlayCircle, FaUsers, FaRocket, FaChevronRight,  FaLock, FaBolt  } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

// --- Custom Hook for Scroll Animations ---
const useInView = (options?: IntersectionObserverInit) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                if (ref.current) {
                    observer.unobserve(ref.current);
                }
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [options]);

    return [ref, isInView];
};

// --- Reusable Animated Section Wrapper ---
const AnimatedSection: FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    const [ref, isInView] = useInView({ threshold: 0.1 });
    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className={`${className} transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
            {children}
        </div>
    );
};

// --- Header Component ---
const MenuIcon: FC<{ open: boolean }> = ({ open }) => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        )}
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
            
            // Show header when at top
            if (currentScrollY < 10) {
                setIsVisible(true);
            }
            // Show when scrolling up, hide when scrolling down
            else if (currentScrollY < lastScrollY) {
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

                        <div className='flex  items-center'>
                            <a href="/" className="flex items-center gap-3" aria-label="Home">
                                <img className='w-40' src='/logo2.png' alt='logo' />
                            </a>
                            <div className="hidden sm:block mx-8">
                                <LanguageSwitcher />
                            </div>
                        </div>

                        <nav className="hidden justify-center md:flex items-center gap-8 text-sm font-medium">
                            <a className="text-neutral-400 hover:text-white transition-colors" href="#features">{t('landingPage.header.features')}</a>
                            <a className="text-neutral-400 hover:text-white transition-colors" href="/pricing">{t('landingPage.header.pricing')}</a>
                            <a className="text-neutral-400 hover:text-white transition-colors" href="#footer">{t('landingPage.header.about')}</a>
                        </nav>


                        <div className="flex justify-end items-center gap-4">
                            {!isLoading && !isAuthenticated && (
                                <>
                                    <a className="hidden sm:inline-block text-sm font-medium text-neutral-400 hover:text-white transition-colors" href="/login">{t('landingPage.header.login')}</a>
                                    <a className="hidden sm:inline-block rounded-lg bg-gray-200 text-black px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-300" href="/signup">{t('landingPage.header.getStarted')}</a>
                                </>
                            )}
                            {!isLoading && isAuthenticated && (<a className="hidden sm:inline-block rounded-lg bg-gray-200 text-black px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-300" href="/dashboard">{t('landingPage.header.dashboard')}</a>)}
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-neutral-100 z-50 p-2 -mr-2" aria-controls="mobile-menu" aria-expanded={isMenuOpen}><MenuIcon open={isMenuOpen} /></button>
                        </div>
                    </div>
                </div>
            </header>
            <div id="mobile-menu" className={`fixed inset-0 z-40 bg-[#0d0f12]/95 backdrop-blur-md md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <nav className="flex flex-col items-center justify-center h-full gap-8 text-xl font-medium">
                    <a onClick={() => setIsMenuOpen(false)} className="text-neutral-300 hover:text-white" href="#features">{t('landingPage.header.features')}</a>
                    <a onClick={() => setIsMenuOpen(false)} className="text-neutral-300 hover:text-white" href="/pricing">{t('landingPage.header.pricing')}</a>
                    <a onClick={() => setIsMenuOpen(false)} className="text-neutral-300 hover:text-white" href="#footer">{t('landingPage.header.about')}</a>
                    <div className="mt-8 flex flex-col items-center gap-6 w-full px-8">
                        {!isLoading && !isAuthenticated && (
                            <>
                                <a className="w-full text-center text-lg font-medium text-neutral-300 hover:text-white" href="/login">{t('landingPage.header.login')}</a>
                                <a className="w-full text-center rounded-lg bg-gray-200 text-black px-5 py-3 text-lg font-semibold" href="/signup">{t('landingPage.header.getStarted')}</a>
                            </>
                        )}
                        {!isLoading && isAuthenticated && (<a className="w-full text-center rounded-lg bg-gray-200 text-black px-5 py-3 text-lg font-semibold" href="/dashboard">{t('landingPage.header.dashboard')}</a>)}
                    </div>
                    <div className="absolute bottom-10">
                        <LanguageSwitcher />
                    </div>
                </nav>
            </div>
        </>
    );
};

const Hero: FC = () => {
    const { t } = useTranslation();
    return (
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 text-center">
            <div className="container mx-auto px-6 relative z-10">
                <div className="inline-flex items-center gap-3 bg-[#1C1E22] border border-neutral-800 rounded-full px-4 py-2 mb-8 animate-[fadeIn-up_1s_ease-out_0.2s] opacity-0 [animation-fill-mode:forwards]">
                    <FaStar className="text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-300">{t('landingPage.hero.tagline')}</span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 leading-tight animate-[fadeIn-up_1s_ease-out_0.4s] opacity-0 [animation-fill-mode:forwards]">
                    {t('landingPage.hero.title1')}<br />{t('landingPage.hero.title2')}
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-neutral-400 leading-relaxed animate-[fadeIn-up_1s_ease-out_0.6s] opacity-0 [animation-fill-mode:forwards]">
                    {t('landingPage.hero.subtitle')}
                </p>
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeIn-up_1s_ease-out_0.8s] opacity-0 [animation-fill-mode:forwards]">
                    <a className="inline-flex items-center justify-center rounded-lg h-12 px-8 bg-gray-200 text-black font-semibold text-base transition-transform hover:scale-105 w-full sm:w-auto animate-[pulse-glow_2.5s_infinite]" href='/signup'>
                        {t('landingPage.hero.ctaPrimary')}
                    </a>
                    <a className="inline-flex items-center justify-center rounded-lg h-12 px-8 bg-[#1C1E22] border border-neutral-700 text-white font-semibold text-base transition-colors hover:bg-neutral-800 w-full sm:w-auto" href='#features'>
                        {t('landingPage.hero.ctaSecondary')}
                    </a>
                </div>
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-4 text-sm text-neutral-500 animate-[fadeIn-up_1s_ease-out_1s] opacity-0 [animation-fill-mode:forwards]">
                    {/* Updated Icons and Keys */}
                    <div className="flex items-center gap-2"> <FaBolt className="text-yellow-500" /> <span>{t('landingPage.hero.benefit1')}</span> </div>
                    <div className="flex items-center gap-2"> <FaLock className="text-green-500" /> <span>{t('landingPage.hero.benefit2')}</span> </div>
                    <div className="flex items-center gap-2"> <FaCheck className="text-blue-500" /> <span>{t('landingPage.hero.benefit3')}</span> </div>
                </div>
            </div>
        </section>
    );
};

const Features: FC = () => {
    const { t } = useTranslation();
    const featureList = t('landingPage.features.list', { returnObjects: true }) as { title: string, description: string, points: string[], buttonText: string }[];
    const icons = [<FaChartLine className="h-6 w-6 text-neutral-400" />, <FaPlayCircle className="h-6 w-6 text-neutral-400" />, <FaUsers className="h-6 w-6 text-neutral-400" />];

    return (
        <section id="features" className="py-20 sm:py-24">
            <AnimatedSection className="container mx-auto px-6 text-center">
                <div className="inline-block bg-[#1C1E22] border border-neutral-800 rounded-full px-5 py-2 mb-6">
                    <span className="font-semibold text-neutral-300">{t('landingPage.features.sectionTitle')}</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t('landingPage.features.title')}</h2>
                <p className="text-lg text-neutral-400 max-w-2xl mx-auto">{t('landingPage.features.subtitle')}</p>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {featureList.map((feature, index) => (
                        <div key={index} className="group relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 hover:border-neutral-700 hover:-translate-y-2" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group-hover:w-48 group-hover:h-48"></div>
                            <div className="relative p-8 flex flex-col h-full" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 0.05) 100%)' }}>
                                <div className="relative z-10 flex flex-col flex-grow">
                                    <div className="flex-shrink-0 bg-[#1C1E22] border border-neutral-700 w-12 h-12 flex items-center justify-center rounded-xl mb-6"> {icons[index]} </div>
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                        <p className="text-neutral-400 mb-6 leading-relaxed">{feature.description}</p>
                                        <ul className="space-y-3">
                                            {feature.points.map((point, pIndex) => (
                                                <li key={pIndex} className="flex items-center gap-3 text-neutral-400"> <FaCheck className="text-neutral-500" /> <span>{point}</span> </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-8">
                                        <a href="/dashboard" className="w-full inline-block text-center rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold py-3 transition-colors hover:bg-neutral-800">{feature.buttonText}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </AnimatedSection>
        </section>
    );
};

const AnimatedNumber = ({ value }: { value: number }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                let start = 0;
                const duration = 1500;
                const end = value;
                const stepTime = Math.max(1, Math.floor(duration / end));

                const timer = setInterval(() => {
                    start += 1;
                    setDisplayValue(start);
                    if (start >= end) {
                        setDisplayValue(end);
                        clearInterval(timer);
                    }
                }, stepTime);
                observer.unobserve(element);
            }
        }, { threshold: 0.5 });

        observer.observe(element);
        return () => observer.disconnect();
    }, [value]);

    return <span ref={ref}>{displayValue}</span>;
}

const Stats: FC = () => {
    const { t } = useTranslation();
    const statsList = [
        { value: 15, label: "k+" },
        { value: 120, label: "+" },
        { value: 1, label: "M+" },
        { value: 180, label: "+" }
    ];
    const statTexts = t('landingPage.stats.list', { returnObjects: true }) as { text: string }[];

    return (
        <section className="py-20 sm:py-24">
            <AnimatedSection className="container mx-auto px-6">
                <div className="relative overflow-hidden border border-neutral-800 rounded-3xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="relative px-8 py-12" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 0.05) 100%)' }}>
                        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {statsList.map((stat, index) => (
                                <div key={index}>
                                    <p className="text-5xl font-bold text-white"><AnimatedNumber value={stat.value} />{stat.label}</p>
                                    <p className="mt-2 text-neutral-400">{statTexts[index].text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        </section>
    );
};

const CTA: FC = () => {
    const { t } = useTranslation();
    return (
        <section className="py-20 sm:py-24">
            <AnimatedSection className="container mx-auto px-6">
                <div className="relative overflow-hidden border border-neutral-800 rounded-3xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="relative p-12 md:p-16 text-center" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 0.05) 100%)' }}>
                        <div className="relative z-10">
                            <div className="flex justify-center mb-6">
                                <div className="bg-gray-200 w-16 h-16 flex items-center justify-center rounded-full"> <FaRocket className="w-8 h-8 text-black" /> </div>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">{t('landingPage.cta.title')}</h2>
                            <p className="text-lg text-neutral-400 max-w-2xl mx-auto mb-10">{t('landingPage.cta.subtitle')}</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a href="/signup" className="group flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-gray-200 text-black font-semibold text-base transition-colors hover:bg-gray-300 w-full sm:w-auto">
                                    <span>{t('landingPage.cta.ctaPrimary')}</span> <FaChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                </a>
                                <a href="#features" className="group flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-[#1C1E22] border border-neutral-700 text-white font-semibold text-base transition-colors hover:bg-neutral-800 w-full sm:w-auto">
                                    <span>{t('landingPage.cta.ctaSecondary')}</span> <FaChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
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
                        <div className="flex items-center gap-3 mb-4">
                            <img className='w-40' src='/logo2.png' alt='logo' />
                        </div>
                        <p className="text-neutral-400">{t('landingPage.footer.tagline')}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t('landingPage.footer.productTitle')}</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.productLink1')}</a></li>
                            <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.productLink2')}</a></li>
                            <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.productLink3')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t('landingPage.footer.companyTitle')}</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.companyLink1')}</a></li>
                            <li><a href="/pricing" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.companyLink2')}</a></li>
                            <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.companyLink3')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-4">{t('landingPage.footer.legalTitle')}</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.legalLink1')}</a></li>
                            <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">{t('landingPage.footer.legalLink2')}</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
                    <p>{t('landingPage.footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
};

function LandingPage() {
    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const id = hash.substring(1);
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    const backgroundStyle = { background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' };

    return (
        <div style={backgroundStyle} className="relative text-white font-sans overflow-hidden">
            <div className="absolute top-[-20rem] left-[-25rem] w-[50rem] h-[50rem] rounded-full animate-[float-A_15s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.2), transparent 60%)', filter: 'blur(128px)' }} />
            <div className="absolute top-[30rem] right-[-30rem] w-[60rem] h-[60rem] rounded-full animate-[float-B_20s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.15), transparent 70%)', filter: 'blur(128px)' }} />
            <div className="relative ">
                <Header />
                <main>
                    <Hero />
                    <Features />
                    <Stats />
                    <CTA />
                </main>
                <Footer />
            </div>
        </div>
    );
}

export default LandingPage;