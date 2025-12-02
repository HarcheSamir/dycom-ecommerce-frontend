import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminUserDetails } from '../hooks/useAdminUsers';
import {
    FaArrowLeft, FaUser, FaEnvelope, FaCalendarAlt, FaCreditCard,
    FaCheckCircle, FaClock, FaUniversity, FaUserFriends, FaGem, FaTimesCircle, FaPhone
} from 'react-icons/fa';
import { GlassCard } from '../components/admin/AdminUI';

const AdminUserDetailsPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useAdminUserDetails(userId);

    if (isLoading) return <div className="flex h-screen items-center justify-center text-neutral-400">Loading profile...</div>;
    if (isError || !data) return <div className="flex h-screen items-center justify-center text-red-500">User not found.</div>;

    const { user, financials, courses, affiliate } = data;

    // --- Helper: Date & Time Formatter ---
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // --- Helper: Status Styles ---
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'LIFETIME_ACCESS': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'PAST_DUE': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'CANCELED': return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#111317] min-h-screen text-white space-y-8">
            {/* --- Header --- */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard/admin/users')} className="p-3 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-colors border border-neutral-700">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {user.firstName} {user.lastName}
                            {user.subscriptionStatus === 'LIFETIME_ACCESS' && <FaGem className="text-purple-500 text-lg" />}
                        </h1>
                        <p className="text-neutral-400 text-xs font-mono">ID: {user.id}</p>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-lg border text-sm font-bold tracking-wider ${getStatusStyle(user.subscriptionStatus)}`}>
                    {user.subscriptionStatus.replace('_', ' ')}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT COLUMN: Profile & Stats (4 cols) --- */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Identity Card */}
                    <GlassCard className="h-fit">
                        <div className="flex flex-col items-center text-center pb-6 border-b border-neutral-800 mb-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border-4 border-[#1C1E22] shadow-xl flex items-center justify-center text-3xl font-bold text-white mb-4">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div className="flex justify-between py-2 border-b border-neutral-800">
                                <span className="text-neutral-400 mr-2 flex items-center gap-2"><FaEnvelope /> </span>
                                <span>{user.email}</span>
                            </div>
                            {/* ADD PHONE DISPLAY HERE */}
                            <div className="flex justify-between py-2 border-b border-neutral-800">
                                <span className="text-neutral-400 mr-2  flex items-center gap-2"><FaPhone /> </span>
                                <span className="text-white">{user.phone || 'N/A'}</span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Created: {formatDateTime(user.createdAt).date} at {formatDateTime(user.createdAt).time}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
                                <div className="flex items-center gap-3 text-sm text-neutral-400">
                                    <FaCreditCard /> Plan Progress
                                </div>
                                <span className="font-bold text-white">{user.installmentsPaid} / {user.installmentsRequired}</span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
                                <div className="flex items-center gap-3 text-sm text-neutral-400">
                                    <FaUniversity /> Total LTV
                                </div>
                                <span className="font-bold text-green-400 text-lg">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financials.ltv)}
                                </span>
                            </div>

                            {/* Affiliate Info */}
                            {(affiliate.referredBy || affiliate.referralsCount > 0) && (
                                <div className="pt-4 border-t border-neutral-800">
                                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Affiliate Data</p>
                                    {affiliate.referredBy && (
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-neutral-400">Referred By:</span>
                                            <span className="text-white">{affiliate.referredBy}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Referrals Made:</span>
                                        <span className="text-white flex items-center gap-2"><FaUserFriends className="text-blue-400" /> {affiliate.referralsCount}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* --- RIGHT COLUMN: Content & History (8 cols) --- */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 1. Courses Progress */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaCheckCircle className="text-blue-500" /> Training Progress
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses.map(course => (
                                <div key={course.id} className="group bg-[#1C1E22] border border-neutral-800 hover:border-neutral-600 transition-all rounded-xl p-4 flex gap-4">
                                    <img src={course.coverImageUrl || ''} alt="" className="w-16 h-16 rounded-lg object-cover bg-neutral-800 shadow-sm" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white truncate text-sm mb-1">{course.title}</h3>

                                        <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                                            <span>{course.completedVideos} / {course.totalVideos} Lessons</span>
                                            <span className={course.percentage === 100 ? 'text-green-400' : 'text-white'}>{course.percentage}%</span>
                                        </div>

                                        <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${course.percentage === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                                style={{ width: `${course.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {courses.length === 0 && (
                                <div className="col-span-full p-6 text-center border border-dashed border-neutral-800 rounded-xl text-neutral-500">
                                    User has not started any courses yet.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 2. Transaction History */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FaClock className="text-yellow-500" /> Transaction History
                        </h2>
                        <div className="bg-[#1C1E22] border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase text-xs font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4">Date & Time</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Currency</th>
                                        <th className="p-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {financials.transactions.map(tx => {
                                        const { date, time } = formatDateTime(tx.createdAt);
                                        return (
                                            <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-medium text-white">{date}</div>
                                                    <div className="text-xs text-neutral-500">{time}</div>
                                                </td>
                                                <td className="p-4 font-bold text-white text-base">
                                                    {tx.amount}
                                                </td>
                                                <td className="p-4 text-neutral-400 uppercase">
                                                    {tx.currency}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {tx.status === 'succeeded' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase">
                                                            <FaCheckCircle /> Paid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase">
                                                            <FaTimesCircle /> Failed
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {financials.transactions.length === 0 && (
                                        <tr><td colSpan={4} className="p-8 text-center text-neutral-500 italic">No transactions found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default AdminUserDetailsPage;