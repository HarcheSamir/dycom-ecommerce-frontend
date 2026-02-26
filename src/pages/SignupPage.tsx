import { useState, type JSX } from 'react';
import { FaArrowLeft, FaCheck, FaRocket, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

// Hotmart payment URLs
const ACADEMY_URL = 'https://pay.hotmart.com/U103378139T';
const SMMA_URL = 'https://pay.hotmart.com/L104644463R';

const SignupPage = (): JSX.Element => {
    const [selectedPlan, setSelectedPlan] = useState<'academy' | 'smma' | null>(null);

    const handlePurchase = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 font-sans overflow-hidden" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            {/* Background Effects */}
            <div className="absolute top-[-10rem] left-[-20rem] w-[40rem] h-[40rem] rounded-full animate-[float-A_15s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.2), transparent 60%)', filter: 'blur(128px)' }} />
            <div className="absolute bottom-[-15rem] right-[-15rem] w-[40rem] h-[40rem] rounded-full animate-[float-B_20s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.15), transparent 70%)', filter: 'blur(128px)' }} />

            <div className="relative w-full max-w-4xl">
                <a href="/home" className="absolute top-0 left-0 -translate-y-12 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors opacity-0 animate-[fadeIn-up_1s_ease-out] [animation-fill-mode:forwards]">
                    <FaArrowLeft /><span>Retour</span>
                </a>

                {/* Header */}
                <div className="text-center mb-10 opacity-0 animate-[fadeIn-up_1s_ease-out_0.1s] [animation-fill-mode:forwards]">
                    <img className='w-[120px] mx-auto' src='/logo2.png' alt='logo' />
                    <h1 className="text-3xl md:text-4xl font-bold text-white mt-6">Choisissez votre accès</h1>
                    <p className="text-neutral-400 mt-2 max-w-lg mx-auto">Sélectionnez l'offre qui correspond à vos objectifs</p>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-0 animate-[fadeIn-up_1s_ease-out_0.3s] [animation-fill-mode:forwards]">

                    {/* Academy Card */}
                    <div
                        onClick={() => setSelectedPlan('academy')}
                        className={`relative overflow-hidden border rounded-3xl cursor-pointer transition-all duration-300 ${selectedPlan === 'academy'
                                ? 'border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.1)]'
                                : 'border-neutral-800 hover:border-neutral-600'
                            }`}
                        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                        {selectedPlan === 'academy' && (
                            <div className="absolute top-4 right-4 w-7 h-7 bg-white rounded-full flex items-center justify-center">
                                <FaCheck className="text-black text-xs" />
                            </div>
                        )}
                        <div className="p-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-5">
                                <FaRocket className="text-white text-xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">Dycom Académie</h2>
                            <p className="text-neutral-400 text-sm mb-6">Accès complet à toutes les formations e-commerce</p>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">980 €</span>
                                <span className="text-neutral-500 ml-2">/ accès à vie</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {[
                                    'Toutes les formations e-commerce',
                                    'Dycom 2026 + mises à jour',
                                    'Formation IA',
                                    'Accès aux formations archivées',
                                    'Support prioritaire',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                                        <FaCheck className="text-green-500 mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                                <li className="flex items-start gap-3 text-sm text-neutral-500">
                                    <span className="mt-0.5 shrink-0">✕</span>
                                    <span>Formation SMMA (vendue séparément)</span>
                                </li>
                            </ul>

                            <button
                                onClick={(e) => { e.stopPropagation(); handlePurchase(ACADEMY_URL); }}
                                className="w-full h-12 rounded-xl bg-white text-black font-semibold transition-all hover:bg-gray-200 active:scale-[0.98]"
                            >
                                Commencer maintenant
                            </button>
                        </div>
                    </div>

                    {/* SMMA Card */}
                    <div
                        onClick={() => setSelectedPlan('smma')}
                        className={`relative overflow-hidden border rounded-3xl cursor-pointer transition-all duration-300 ${selectedPlan === 'smma'
                                ? 'border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.15)]'
                                : 'border-neutral-800 hover:border-neutral-600'
                            }`}
                        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                    >
                        {selectedPlan === 'smma' && (
                            <div className="absolute top-4 right-4 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center">
                                <FaCheck className="text-white text-xs" />
                            </div>
                        )}
                        <div className="p-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 mb-5">
                                <FaGraduationCap className="text-white text-xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">Formation SMMA</h2>
                            <p className="text-neutral-400 text-sm mb-6">Trouve et signe tes premiers clients</p>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">479 €</span>
                                <span className="text-neutral-500 ml-2">/ accès à vie</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {[
                                    'Formation SMMA complète',
                                    'De A à Z : prospection → closing',
                                    'Méthodes et scripts éprouvés',
                                    'Accès aux mises à jour',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                                        <FaCheck className="text-purple-500 mt-0.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                                <li className="flex items-start gap-3 text-sm text-neutral-500">
                                    <span className="mt-0.5 shrink-0">✕</span>
                                    <span>Formations e-commerce (vendues séparément)</span>
                                </li>
                            </ul>

                            <button
                                onClick={(e) => { e.stopPropagation(); handlePurchase(SMMA_URL); }}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                            >
                                Accéder à la formation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Login Link */}
                <p className="text-center text-sm text-neutral-400 mt-8 opacity-0 animate-[fadeIn-up_1s_ease-out_0.5s] [animation-fill-mode:forwards]">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="font-semibold text-white hover:underline">Se connecter</Link>
                </p>

                <div className="mt-6 flex justify-center opacity-0 animate-[fadeIn-up_1s_ease-out_0.6s] [animation-fill-mode:forwards]">
                    <LanguageSwitcher />
                </div>
            </div>
        </div>
    );
};

export default SignupPage;