import { useState, type FormEvent, type JSX } from 'react';
import { useLogin } from '../hooks/useAuthMutations';
import { FaArrowLeft, FaEnvelope, FaLock } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const LoginPage = (): JSX.Element => {
    const { t } = useTranslation();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { mutate: loginUser, isPending, error } = useLogin();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        loginUser({ email, password });
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 font-sans overflow-hidden" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            <div className="absolute top-[-10rem] left-[-20rem] w-[40rem] h-[40rem] rounded-full animate-[float-A_15s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.2), transparent 60%)', filter: 'blur(128px)' }} />
            <div className="absolute bottom-[-15rem] right-[-15rem] w-[40rem] h-[40rem] rounded-full animate-[float-B_20s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.15), transparent 70%)', filter: 'blur(128px)' }} />

            <div className="relative w-full max-w-md">
                <a href="/home" className="absolute top-0 left-0 -translate-y-12 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors opacity-0 animate-[fadeIn-up_1s_ease-out] [animation-fill-mode:forwards]">
                    <FaArrowLeft /><span>{t('loginPage.backToHome')}</span>
                </a>
                <div className="relative overflow-hidden border border-neutral-800 rounded-3xl opacity-0 animate-[fadeIn-up_1s_ease-out_0.2s] [animation-fill-mode:forwards]" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="relative p-8 md:p-12" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 0.05) 100%)' }}>
                        <div className="text-center mb-8 flex flex-col items-center">
                            <img className='w-[40%]' src='/logo2.png' alt='logo' />
                            <h1 className="text-4xl font-bold text-white mt-4">{t('loginPage.title')}</h1>
                            <p className="text-neutral-400 mt-2">{t('loginPage.subtitle')}</p>
                        </div>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">{t('loginPage.emailLabel')}</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('loginPage.emailPlaceholder')} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                                </div>
                            </div>
                            <div>
                                {/* <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm text-neutral-400">{t('loginPage.passwordLabel')}</label>
                                    <a href="#" className="text-sm text-neutral-400 hover:text-white hover:underline">{t('loginPage.forgotPassword')}</a>
                                </div> */}
                                <div className="relative">
                                    <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('loginPage.passwordPlaceholder')} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                                </div>
                            </div>
                            {error && (<p className="text-sm text-red-500 text-center">{t('loginPage.invalidCredentials')}</p>)}
                            <button type="submit" disabled={isPending} className="w-full h-12 rounded-lg bg-gray-200 text-black font-semibold transition-colors hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait">
                                {isPending ? t('loginPage.loggingInButton') : t('loginPage.loginButton')}
                            </button>
                        </form>
                        <p className="text-center text-sm text-neutral-400 mt-6">
                            {t('loginPage.noAccount')}{' '}
                            <a href="/signup" className="font-semibold text-white hover:underline">{t('loginPage.createAccount')}</a>
                        </p>

                        <div className="mt-8 flex justify-center">
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;