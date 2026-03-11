import { useState, useEffect, useRef, type JSX } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaEnvelope, FaExclamationCircle } from 'react-icons/fa';
import apiClient from '../lib/apiClient';

/**
 * WelcomePage — Post-Hotmart-payment landing page.
 * 
 * Hotmart redirects buyers here after payment with ?email=buyer@email.com
 * This page polls GET /auth/account-ready?email=X until the webhook has
 * created the user account, then auto-redirects to /set-password?token=X.
 * 
 * Falls back to a "check your email" message after 30s timeout.
 */
const WelcomePage = (): JSX.Element => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email')?.trim().toLowerCase() || '';

    const [status, setStatus] = useState<'polling' | 'timeout' | 'already-setup' | 'no-email'>('polling');
    const pollCount = useRef(0);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const hasRedirected = useRef(false);

    // If no email param, show error immediately
    useEffect(() => {
        if (!email) {
            setStatus('no-email');
        }
    }, [email]);

    // Polling logic
    useEffect(() => {
        if (!email || status !== 'polling') return;

        const poll = async () => {
            try {
                const res = await apiClient.get(`/auth/account-ready?email=${encodeURIComponent(email)}`);
                const data = res.data;

                if (data.ready && data.token && !hasRedirected.current) {
                    // Account is ready — redirect to set-password
                    hasRedirected.current = true;
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    navigate(`/set-password?token=${data.token}`, { replace: true });
                    return;
                }

                if (data.alreadySetup) {
                    // User already set their password
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    setStatus('already-setup');
                    return;
                }

                // Not ready yet — keep polling
                pollCount.current += 1;

                // Timeout after 15 polls (30 seconds at 2s intervals)
                if (pollCount.current >= 15) {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    setStatus('timeout');
                }
            } catch (error) {
                // Network error — keep trying silently
                pollCount.current += 1;
                if (pollCount.current >= 15) {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    setStatus('timeout');
                }
            }
        };

        // Poll immediately on mount, then every 2s
        poll();
        pollIntervalRef.current = setInterval(poll, 2000);

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [email, status, navigate]);

    // --- No email param ---
    if (status === 'no-email') {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
                <div className="max-w-md w-full mx-4 p-8 rounded-2xl border border-neutral-800" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="text-center">
                        <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white mb-2">Lien invalide</h1>
                        <p className="text-neutral-400 mb-6">
                            Ce lien ne contient pas les informations nécessaires. Veuillez vérifier vos emails pour le lien de création de mot de passe.
                        </p>
                        <a
                            href="/login"
                            className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Aller à la connexion
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // --- Already setup ---
    if (status === 'already-setup') {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
                <div className="max-w-md w-full mx-4 p-8 rounded-2xl border border-neutral-800" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCheckCircle className="text-white text-3xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Compte déjà configuré !</h1>
                        <p className="text-neutral-400 mb-6">
                            Votre mot de passe a déjà été créé. Vous pouvez vous connecter directement.
                        </p>
                        <a
                            href="/login"
                            className="inline-block px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Se connecter
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // --- Timeout ---
    if (status === 'timeout') {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
                <div className="max-w-md w-full mx-4 p-8 rounded-2xl border border-neutral-800" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaEnvelope className="text-blue-400 text-2xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Vérifiez vos emails</h1>
                        <p className="text-neutral-400 mb-2">
                            Votre achat a bien été enregistré ! Un email de bienvenue a été envoyé à :
                        </p>
                        <p className="text-white font-semibold mb-4">{email}</p>
                        <p className="text-neutral-500 text-sm mb-6">
                            Cliquez sur le lien dans l'email pour finaliser votre compte.
                            <br />Pensez à vérifier vos <span className="text-yellow-400 font-medium">spams</span>.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    pollCount.current = 0;
                                    setStatus('polling');
                                }}
                                className="w-full py-3 bg-neutral-800 border border-neutral-700 text-white font-semibold rounded-lg hover:bg-neutral-700 transition-colors"
                            >
                                Réessayer
                            </button>
                            <a
                                href="/login"
                                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-100 transition-colors text-center block"
                            >
                                Aller à la connexion
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Polling (default) ---
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            {/* Background glow */}
            <div className="fixed top-[-10rem] left-[-20rem] w-[40rem] h-[40rem] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.2), transparent 60%)', filter: 'blur(128px)' }} />

            <div className="max-w-md w-full mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/logo2.png" alt="Dycom" className="h-12 mx-auto" />
                </div>

                {/* Card */}
                <div className="p-8 rounded-2xl border border-neutral-800" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="text-center">
                        {/* Animated checkmark */}
                        <div className="w-20 h-20 mx-auto mb-6 relative">
                            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                                <FaCheckCircle className="text-white text-3xl" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Merci pour votre achat !</h1>
                        <p className="text-neutral-400 mb-6">
                            Préparation de votre espace membre...
                        </p>

                        {/* Spinner */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span className="text-neutral-400 text-sm">Configuration en cours...</span>
                        </div>

                        {/* Email displayed */}
                        <div className="bg-[#1C1E22] border border-neutral-700 rounded-lg px-4 py-3 text-sm">
                            <span className="text-neutral-500">Compte : </span>
                            <span className="text-white font-medium">{email}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomePage;
