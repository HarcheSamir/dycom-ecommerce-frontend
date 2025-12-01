import { useState, type FormEvent, type JSX, useRef, useEffect } from 'react';
import { useLogin, useVerifyOtp } from '../hooks/useAuthMutations';
import { FaArrowLeft, FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useSearchParams, Link } from 'react-router-dom'; // <--- Added Link here

const LoginPage = (): JSX.Element => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    
    // --- State Management ---
    const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [otpCode, setOtpCode] = useState<string>('');
    
    // --- Hooks ---
    const { mutate: loginUser, isPending: isLoginPending, error: loginError } = useLogin((confirmedEmail) => {
        setEmail(confirmedEmail); 
        setStep('otp');
    });

    const { mutate: verifyOtp, isPending: isVerifyPending, error: verifyError } = useVerifyOtp();

    const currentParams = searchParams.toString();
    const signupLink = currentParams ? `/signup?${currentParams}` : '/signup';

    const otpInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (step === 'otp' && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [step]);

    const handleLoginSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        loginUser({ email, password });
    };

    const handleOtpSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        verifyOtp({ email, otp: otpCode });
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 font-sans overflow-hidden" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            {/* Background Effects */}
            <div className="absolute top-[-10rem] left-[-20rem] w-[40rem] h-[40rem] rounded-full animate-[float-A_15s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.2), transparent 60%)', filter: 'blur(128px)' }} />
            <div className="absolute bottom-[-15rem] right-[-15rem] w-[40rem] h-[40rem] rounded-full animate-[float-B_20s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, rgba(40, 58, 114, 0.15), transparent 70%)', filter: 'blur(128px)' }} />

            <div className="relative w-full max-w-md">
                <a href="/home" className="absolute top-0 left-0 -translate-y-12 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors opacity-0 animate-[fadeIn-up_1s_ease-out] [animation-fill-mode:forwards]">
                    <FaArrowLeft /><span>{t('loginPage.backToHome')}</span>
                </a>
                
                <div className="relative overflow-hidden border border-neutral-800 rounded-3xl opacity-0 animate-[fadeIn-up_1s_ease-out_0.2s] [animation-fill-mode:forwards]" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="relative p-8 md:p-12" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0,0, 0) 50%, rgba(255, 255, 255, 0.05) 100%)' }}>
                        
                        <div className="text-center mb-8 flex flex-col items-center">
                            <img className='w-[40%]' src='/logo2.png' alt='logo' />
                            <h1 className="text-4xl font-bold text-white mt-4">{t('loginPage.title')}</h1>
                            <p className="text-neutral-400 mt-2">{t('loginPage.subtitle')}</p>
                        </div>

                        {/* === STEP 1: CREDENTIALS === */}
                        {step === 'credentials' && (
                            <form className="space-y-6" onSubmit={handleLoginSubmit}>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">{t('loginPage.emailLabel')}</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('loginPage.emailPlaceholder')} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                                    </div>
                                </div>
                                
                                {/* --- UPDATED PASSWORD BLOCK WITH FORGOT LINK --- */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm text-neutral-400">{t('loginPage.passwordLabel')}</label>
                                        <Link 
                                            to="/forgot-password" 
                                            className="text-sm text-neutral-500 hover:text-white transition-colors hover:underline"
                                        >
                                            {t('loginPage.forgotPassword')}
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('loginPage.passwordPlaceholder')} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                                    </div>
                                </div>
                                {/* --------------------------------------------- */}

                                {loginError && (<p className="text-sm text-red-500 text-center">{t('loginPage.invalidCredentials')}</p>)}
                                <button type="submit" disabled={isLoginPending} className="w-full h-12 rounded-lg bg-gray-200 text-black font-semibold transition-colors hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait">
                                    {isLoginPending ? t('loginPage.loggingInButton') : t('loginPage.loginButton')}
                                </button>
                            </form>
                        )}

                        {/* === STEP 2: OTP VERIFICATION === */}
                        {step === 'otp' && (
                            <form className="space-y-6 animate-[fadeIn-up_0.5s_ease-out]" onSubmit={handleOtpSubmit}>
                                <div className="text-center mb-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-900/30 text-blue-400 mb-3 border border-blue-500/30">
                                        <FaShieldAlt size={20} />
                                    </div>
                                    <h3 className="text-white font-semibold">Security Verification</h3>
                                    <p className="text-sm text-neutral-400 mt-1">We sent a 6-digit code to <span className="text-white">{email}</span></p>
                                </div>

                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">Verification Code</label>
                                    <input 
                                        ref={otpInputRef}
                                        type="text" 
                                        value={otpCode} 
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                                        placeholder="123456" 
                                        required 
                                        className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-center text-white text-xl tracking-[0.5em] placeholder:tracking-normal placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                                    />
                                </div>

                                {verifyError && (<p className="text-sm text-red-500 text-center">Invalid code. Please try again.</p>)}

                                <button type="submit" disabled={isVerifyPending} className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait">
                                    {isVerifyPending ? 'Verifying...' : 'Verify & Login'}
                                </button>
                                
                                <button type="button" onClick={() => setStep('credentials')} className="w-full text-sm text-neutral-500 hover:text-white mt-2">
                                    Back to Login
                                </button>
                            </form>
                        )}

                        {step === 'credentials' && (
                            <p className="text-center text-sm text-neutral-400 mt-6">
                                {t('loginPage.noAccount')}{' '}
                                <a href={signupLink} className="font-semibold text-white hover:underline">{t('loginPage.createAccount')}</a>
                            </p>
                        )}

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