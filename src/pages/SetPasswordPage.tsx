import { useState, type JSX, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import apiClient from '../lib/apiClient';

/**
 * SetPasswordPage - Allows new Hotmart users to set their password.
 * Uses the permanent accountSetupToken from welcome email.
 */
const SetPasswordPage = (): JSX.Element => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!token) {
            setError('Token manquant. Utilisez le lien de votre email.');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setIsSubmitting(true);

        try {
            await apiClient.post('/auth/set-password', {
                token,
                newPassword: password
            });
            setSuccess(true);
            toast.success('Mot de passe créé avec succès !');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
            setError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // No token provided
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
                <div className="max-w-md w-full mx-4 p-8 rounded-2xl border border-neutral-800" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="text-center">
                        <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white mb-2">Lien invalide</h1>
                        <p className="text-neutral-400 mb-6">
                            Ce lien ne semble pas valide. Veuillez utiliser le lien envoyé dans votre email de bienvenue.
                        </p>
                        <a
                            href="/login"
                            className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Retour à la connexion
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
                <div className="max-w-md w-full mx-4 p-8 rounded-2xl border border-neutral-800" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCheck className="text-white text-3xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Mot de passe créé !</h1>
                        <p className="text-neutral-400 mb-4">
                            Vous allez être redirigé vers la page de connexion...
                        </p>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

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
                        <h1 className="text-2xl font-bold text-white text-center mb-2">Créez votre mot de passe</h1>
                        <p className="text-neutral-400 text-center mb-6">
                            Bienvenue chez Dycom Club ! Définissez votre mot de passe pour accéder à votre espace membre.
                        </p>

                        <form onSubmit={handleSubmit}>
                            {/* Password */}
                            <div className="mb-4">
                                <label className="block text-sm text-neutral-400 mb-2">Mot de passe</label>
                                <div className="relative">
                                    <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 6 caractères"
                                        className="w-full h-12 pl-11 pr-4 bg-[#1C1E22] border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-6">
                                <label className="block text-sm text-neutral-400 mb-2">Confirmer le mot de passe</label>
                                <div className="relative">
                                    <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Répétez votre mot de passe"
                                        className="w-full h-12 pl-11 pr-4 bg-[#1C1E22] border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-14 bg-white hover:bg-gray-100 disabled:bg-neutral-700 disabled:text-neutral-500 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                        Création...
                                    </>
                                ) : (
                                    'Créer mon mot de passe'
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-neutral-500">
                        <p>
                            Déjà un mot de passe ?{' '}
                            <a href="/login" className="text-white hover:underline">Se connecter</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SetPasswordPage;
