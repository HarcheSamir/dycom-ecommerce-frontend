import { useState, type FormEvent } from 'react';
import { useForgotPassword } from '../hooks/useAuthMutations';
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const { mutate: requestReset, isPending } = useForgotPassword();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        requestReset(email, {
            onSuccess: () => {
                toast.success('Reset link sent! Check your inbox.');
                setEmail('');
            },
            onError: () => toast.error('Something went wrong. Please try again.')
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1C1E22', color: '#fff' } }} />
            
            <div className="w-full max-w-md">
                <Link to="/login" className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors">
                    <FaArrowLeft /> Back to Login
                </Link>

                <div className="relative overflow-hidden border border-neutral-800 rounded-3xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-neutral-400 mb-6">Enter your email address and we'll send you a link to reset your password.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary" 
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={isPending} className="w-full h-12 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
                                {isPending ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;