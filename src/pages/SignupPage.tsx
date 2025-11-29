import axios from 'axios';
import { useState, useEffect, type FormEvent, type JSX } from 'react';
import { useSignup } from '../hooks/useAuthMutations';
import type { AxiosError } from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FaArrowLeft, FaEnvelope, FaLock, FaUser, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const SignupPage = (): JSX.Element => {
    const { t } = useTranslation();
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [refCode, setRefCode] = useState<string | null>(null);
    const { mutate: signupUser, isPending } = useSignup();
    const { login } = useAuth();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref) {
            setRefCode(ref);
            toast.success(t('signupPage.toasts.affiliateSuccess'));
        }
    }, [t]);


    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const signupData = { firstName, lastName, email, password, refCode: refCode || undefined };

        signupUser(
            signupData,
            {
                onSuccess: () => {
                    toast.success(t('signupPage.toasts.signupSuccess'));
                },
                onError: (err: Error) => {
                    if (axios.isAxiosError(err)) {
                        const errorData = err.response?.data as { message?: string };
                        toast.error(errorData?.message || t('signupPage.toasts.signupError'));
                    } else {
                        toast.error(t('signupPage.toasts.unknownError'));
                    }
                },
            }
        );
    };

    const features = t('signupPage.features', { returnObjects: true }) as { title: string; description: string }[];

    return (
        <>
            <Toaster position="bottom-right" reverseOrder={false} toastOptions={{ style: { background: '#333', color: '#fff' } }} />
            <div className="relative min-h-screen flex items-center justify-center p-6 font-sans overflow-hidden" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
                <div className="absolute top-[-10rem] left-[-20rem] w-[40rem] h-[40rem] rounded-full animate-[float-A_15s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.2), transparent 60%)', filter: 'blur(128px)' }} />
                <div className="absolute bottom-[-15rem] right-[-15rem] w-[40rem] h-[40rem] rounded-full animate-[float-B_20s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.15), transparent 70%)', filter: 'blur(128px)' }} />

                <div className="relative container mx-auto max-w-6xl w-full">
                    <a href="/home" className="absolute top-0 left-0 -translate-y-12 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors animate-[fadeIn-up_1s_ease-out] opacity-0 [animation-fill-mode:forwards]">
                        <FaArrowLeft /><span>{t('signupPage.backToHome')}</span>
                    </a>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative overflow-hidden border border-neutral-800 rounded-3xl opacity-0 animate-[fadeIn-up_1s_ease-out_0.2s] [animation-fill-mode:forwards]" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                            <div className="relative p-8 md:p-12" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0,0, 0) 50%, rgba(255, 255, 255, 0.05) 100%)' }}>
                                <div className="text-center mb-8 flex flex-col items-center">
                                    <img className='w-[40%]' src='/logo2.png' alt='logo' />
                                    <h1 className="text-4xl font-bold text-white mt-4">{t('signupPage.title')}</h1>
                                </div>
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-neutral-400 mb-2 block">{t('signupPage.firstNameLabel')}</label>
                                            <div className="relative">
                                                <FaUser className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-neutral-400 mb-2 block">{t('signupPage.lastNameLabel')}</label>
                                            <div className="relative">
                                                <FaUser className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-neutral-400 mb-2 block">{t('signupPage.emailLabel')}</label>
                                        <div className="relative">
                                            <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('signupPage.emailPlaceholder')} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-neutral-400 mb-2 block">{t('signupPage.passwordLabel')}</label>
                                        <div className="relative">
                                            <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('signupPage.passwordPlaceholder')} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isPending} className="w-full h-12 rounded-lg bg-gray-200 text-black font-semibold transition-colors hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait">
                                        {isPending ? t('signupPage.creatingButton') : t('signupPage.createButton')}
                                    </button>
                                </form>
                                <p className="text-center text-sm text-neutral-400 mt-6">
                                    {t('signupPage.alreadyHaveAccount')}{' '}
                                    <a href="/login" className="font-semibold text-white hover:underline">{t('signupPage.loginLink')}</a>
                                </p>
                                <div className="mt-8 flex justify-center">
                                    <LanguageSwitcher />
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex flex-col justify-center px-8">
                            <h2 className="text-4xl font-bold text-white mb-8 opacity-0 animate-[fadeIn-up_1s_ease-out_0.4s] [animation-fill-mode:forwards]">{t('signupPage.featuresHeader')}</h2>
                            <ul className="space-y-8">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-4 opacity-0 animate-[fadeIn-up_1s_ease-out] [animation-fill-mode:forwards]" style={{ animationDelay: `${0.6 + index * 0.2}s` }}>
                                        <div className="flex-shrink-0 bg-neutral-800/60 border border-neutral-700 w-10 h-10 flex items-center justify-center rounded-full">
                                            <FaCheck className="text-neutral-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{feature.title}</h3>
                                            <p className="text-neutral-400">{feature.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignupPage;