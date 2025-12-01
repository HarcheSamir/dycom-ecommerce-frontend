import { useState, type FormEvent } from 'react';
import { useResetPassword } from '../hooks/useAuthMutations';
import { FaLock } from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { mutate: resetPassword, isPending } = useResetPassword();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!token) return toast.error('Invalid token.');
        if (newPassword !== confirmPassword) return toast.error('Passwords do not match.');
        if (newPassword.length < 8) return toast.error('Password must be at least 8 characters.');

        resetPassword({ token, newPassword }, {
            onSuccess: () => {
                toast.success('Password reset successfully!');
                setTimeout(() => navigate('/login'), 2000);
            },
            onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to reset password.')
        });
    };

    if (!token) return <div className="min-h-screen flex items-center justify-center text-white">Invalid or missing token.</div>;

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1C1E22', color: '#fff' } }} />
            
            <div className="w-full max-w-md">
                <div className="relative overflow-hidden border border-neutral-800 rounded-3xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
                        <p className="text-neutral-400 mb-6">Please enter your new password below.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">New Password</label>
                                <div className="relative">
                                    <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Confirm Password</label>
                                <div className="relative">
                                    <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>

                            <button type="submit" disabled={isPending} className="w-full h-12 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
                                {isPending ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;