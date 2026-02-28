import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useAdminUserDetails, useUpdateUserSubscription,
    useSyncStripeSubscription, useAddStripePayment
} from '../hooks/useAdminUsers';
import {
    FaArrowLeft, FaEnvelope, FaCreditCard,
    FaCheckCircle, FaClock, FaUniversity, FaGem, FaTimesCircle, FaPhone,
    FaTools, FaSync, FaSave, FaPlus, FaExclamationTriangle, FaStripe,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { GlassCard } from '../components/admin/AdminUI';
import { Toaster } from 'react-hot-toast';

const AdminUserDetailsPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useAdminUserDetails(userId);

    // Mutations
    const { mutate: updateSubscription, isPending: isUpdating } = useUpdateUserSubscription();
    const { mutate: syncSubscription, isPending: isSyncing } = useSyncStripeSubscription();
    const { mutate: addPayment, isPending: isAddingPayment } = useAddStripePayment();

    // Local State for Forms
    const [status, setStatus] = useState('');
    const [instPaid, setInstPaid] = useState(0);
    const [instReq, setInstReq] = useState(1);
    const [stripeSubId, setStripeSubId] = useState('');
    const [stripePayId, setStripePayId] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');

    useEffect(() => {
        if (data?.user) {
            setStatus(data.user.subscriptionStatus);
            setInstPaid(data.user.installmentsPaid);
            setInstReq(data.user.installmentsRequired);
            setStripeSubId(data.user.stripeSubscriptionId || '');
            if (data.user.currentPeriodEnd) {
                setPeriodEnd(data.user.currentPeriodEnd.split('T')[0]);
            } else {
                setPeriodEnd('');
            }
        }
    }, [data]);

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

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'LIFETIME_ACCESS': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'PAST_DUE': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'CANCELED': return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    // --- Handlers ---
    const handleManualUpdate = () => {
        if (!userId) return;

        // Check if the date string changed from what the server gave us
        const originalDate = data?.user?.currentPeriodEnd ? data.user.currentPeriodEnd.split('T')[0] : '';
        const payload: any = {
            userId,
            subscriptionStatus: status,
            installmentsPaid: instPaid,
            installmentsRequired: instReq
        };

        // If explicitly modified (or cleared -> null), send it. If empty string -> null
        if (periodEnd !== originalDate) {
            payload.currentPeriodEnd = periodEnd || null;
        }

        updateSubscription(payload);
    };

    const handleSyncSubscription = () => {
        if (!userId || !stripeSubId) return;
        syncSubscription({ userId, stripeSubscriptionId: stripeSubId });
    };

    const handleAddPayment = () => {
        if (!userId || !stripePayId) return;
        addPayment({ userId, stripePaymentId: stripePayId });
        setStripePayId(''); // Clear after submit
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#111317] min-h-screen text-white space-y-8">
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1C1E22', color: '#fff', border: '1px solid #374151' } }} />

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
                <div className="flex items-center gap-3">
                    {user.stripeCustomerId && (
                        <a
                            href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-sm font-medium text-white transition-colors"
                        >
                            <span>STRIPE</span>
                            <FaExternalLinkAlt size={10} className="text-neutral-500" />
                        </a>
                    )}
                    <div className={`px-4 py-2 rounded-lg border text-sm font-bold tracking-wider ${getStatusStyle(user.subscriptionStatus)}`}>
                        {user.subscriptionStatus.replace('_', ' ')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT COLUMN: Profile & Stats --- */}
                <div className="lg:col-span-4 space-y-6">
                    <GlassCard className="h-fit">
                        <div className="flex flex-col items-center text-center pb-6 border-b border-neutral-800 mb-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border-4 border-[#1C1E22] shadow-xl flex items-center justify-center text-3xl font-bold text-white mb-4">
                                {user.firstName[0]}{user.lastName[0]}
                            </div>
                            <div className="flex justify-between w-full py-2 border-b border-neutral-800">
                                <span className="text-neutral-400 flex items-center gap-2"><FaEnvelope /> Email</span>
                                <span>{user.email}</span>
                            </div>
                            <div className="flex justify-between w-full py-2 border-b border-neutral-800">
                                <span className="text-neutral-400 flex items-center gap-2"><FaPhone /> Phone</span>
                                <span className="text-white">{user.phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between w-full py-2">
                                <span className="text-neutral-400">Created</span>
                                <span className="text-xs mt-1">{formatDateTime(user.createdAt).date}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
                                <div className="flex items-center gap-3 text-sm text-neutral-400"><FaCreditCard /> Plan Progress</div>
                                <span className="font-bold text-white">{user.installmentsPaid} / {user.installmentsRequired}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
                                <div className="flex items-center gap-3 text-sm text-neutral-400"><FaUniversity /> Total LTV</div>
                                <span className="font-bold text-green-400 text-lg">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financials.ltv)}
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* --- DANGER ZONE / MANAGEMENT CONSOLE --- */}
                    <div className="relative overflow-hidden border border-red-500/20 rounded-3xl bg-[#161212]">
                        <div className="p-6 bg-gradient-to-b from-red-900/10 to-transparent">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <FaTools className="text-red-400" /> Management Console
                            </h3>

                            {/* 1. Manual Status Override */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaExclamationTriangle className="text-orange-400 text-xs" />
                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Manual Override</span>
                                </div>

                                <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-neutral-800">

                                    {/* Status Dropdown */}
                                    <div>
                                        <label className="text-[10px] text-neutral-500 block mb-1.5">Subscription Status</label>
                                        <select
                                            value={status}
                                            onChange={e => setStatus(e.target.value)}
                                            className="w-full bg-[#0f1115] border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all outline-none"
                                        >
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="PAST_DUE">PAST_DUE</option>
                                            <option value="CANCELED">CANCELED</option>
                                            <option value="LIFETIME_ACCESS">LIFETIME_ACCESS</option>
                                            <option value="SMMA_ONLY">SMMA_ONLY</option>
                                            <option value="TRIALING">TRIALING</option>
                                            <option value="INCOMPLETE">INCOMPLETE</option>
                                        </select>

                                        {/* Contextual notes — only when CHANGING status */}
                                        {status !== user.subscriptionStatus && (
                                            <p className={`text-[10px] mt-1.5 font-medium ${status === 'CANCELED' || status === 'INCOMPLETE' ? 'text-red-400' :
                                                status === 'LIFETIME_ACCESS' ? 'text-purple-400' :
                                                    status === 'ACTIVE' || status === 'SMMA_ONLY' ? 'text-green-400' :
                                                        'text-neutral-500'
                                                }`}>
                                                {status === 'CANCELED' && '⚠ User will lose platform access immediately.'}
                                                {status === 'INCOMPLETE' && '⚠ User will lose platform access immediately.'}
                                                {status === 'LIFETIME_ACCESS' && '👑 Permanent access — Stripe subscription will be unlinked.'}
                                                {status === 'ACTIVE' && '✓ User will regain platform access.'}
                                                {status === 'SMMA_ONLY' && '✓ User will have SMMA-only access.'}
                                                {status === 'PAST_DUE' && '⚠ User will be flagged as past due.'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Period End */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-[10px] text-neutral-500">Current Period End</label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const d = new Date();
                                                    d.setDate(d.getDate() + 30);
                                                    setPeriodEnd(d.toISOString().split('T')[0]);
                                                }}
                                                className="text-[9px] text-blue-400 hover:text-blue-300 font-bold"
                                            >
                                                +30 Days
                                            </button>
                                        </div>
                                        <input
                                            type="date"
                                            value={periodEnd}
                                            onChange={e => setPeriodEnd(e.target.value)}
                                            className="w-full bg-[#0f1115] border border-neutral-700 rounded-lg p-2.5 text-sm text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all outline-none [color-scheme:dark]"
                                        />
                                    </div>

                                    {/* Installments — compact row */}
                                    <div className="pt-1 border-t border-neutral-800/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] text-neutral-500">Installments</label>
                                            <span className={`text-[10px] font-bold tabular-nums ${instReq > 0 && instPaid >= instReq ? 'text-green-400' : 'text-neutral-400'}`}>
                                                {instPaid} / {instReq} {instReq > 0 && instPaid >= instReq ? '✓' : ''}
                                            </span>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden mb-3">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${instReq > 0 && instPaid >= instReq ? 'bg-green-500' : 'bg-blue-500'}`}
                                                style={{ width: instReq > 0 ? `${Math.min(100, (instPaid / instReq) * 100)}%` : '0%' }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] text-neutral-500 block mb-1">Paid</label>
                                                <div className="flex gap-1.5">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                        value={instPaid}
                                                        onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setInstPaid(v === '' ? 0 : Number(v)); }}
                                                        className="flex-1 min-w-0 bg-[#0f1115] border border-neutral-700 rounded-lg p-2 text-sm text-white text-center focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setInstPaid(prev => prev + 1)}
                                                        className="px-3 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-400 rounded-lg text-xs font-bold transition-colors shrink-0"
                                                    >
                                                        +1
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-neutral-500 block mb-1">Required</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={instReq}
                                                    onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ''); setInstReq(v === '' ? 0 : Number(v)); }}
                                                    className="w-full bg-[#0f1115] border border-neutral-700 rounded-lg p-2 text-sm text-white text-center focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleManualUpdate}
                                        disabled={isUpdating}
                                        className="w-full mt-1 bg-neutral-100 hover:bg-white text-black font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        <FaSave /> Save Changes
                                    </button>
                                </div>
                            </div>

                            {/* 2. Stripe Recovery Tools */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <FaStripe className="text-[#635BFF] text-lg" />
                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Stripe Recovery</span>
                                </div>

                                <div className="space-y-4">
                                    {/* Subscription Sync */}
                                    <div className="bg-black/20 p-4 rounded-xl border border-neutral-800 group focus-within:border-blue-500/30 transition-colors">
                                        <label className="text-[10px] text-blue-400/80 block mb-1 font-semibold">Sync Subscription (sub_...)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="sub_1M..."
                                                value={stripeSubId}
                                                onChange={e => setStripeSubId(e.target.value)}
                                                className="flex-1 bg-[#0f1115] border border-neutral-700 rounded-lg px-3 text-xs text-white font-mono focus:border-blue-500/50 focus:outline-none transition-all"
                                            />
                                            <button
                                                onClick={handleSyncSubscription}
                                                disabled={isSyncing}
                                                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <FaSync className={isSyncing ? "animate-spin" : ""} /> Sync
                                            </button>
                                        </div>
                                    </div>

                                    {/* Payment Recovery */}
                                    <div className="bg-black/20 p-4 rounded-xl border border-neutral-800 group focus-within:border-green-500/30 transition-colors">
                                        <label className="text-[10px] text-green-400/80 block mb-1 font-semibold">Recover Payment (pi_...)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="pi_3N..."
                                                value={stripePayId}
                                                onChange={e => setStripePayId(e.target.value)}
                                                className="flex-1 bg-[#0f1115] border border-neutral-700 rounded-lg px-3 text-xs text-white font-mono focus:border-green-500/50 focus:outline-none transition-all"
                                            />
                                            <button
                                                onClick={handleAddPayment}
                                                disabled={isAddingPayment}
                                                className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                                            >
                                                <FaPlus /> Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Content & History --- */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Courses Progress */}
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
                                            <div className={`h-full rounded-full transition-all duration-500 ${course.percentage === 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${course.percentage}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {courses.length === 0 && <div className="col-span-full p-6 text-center border border-dashed border-neutral-800 rounded-xl text-neutral-500">User has not started any courses yet.</div>}
                        </div>
                    </section>

                    {/* Transaction History */}
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
                                        const stripeId = tx.stripePaymentId || tx.stripeInvoiceId || tx.id;

                                        return (
                                            <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-medium text-white">{date}</div>
                                                    <div className="text-xs text-neutral-500">{time}</div>
                                                    <div className="text-[9px] text-neutral-500 font-mono mt-1 opacity-70" title="Stripe ID">
                                                        {stripeId}
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-white text-base">{tx.amount}</td>
                                                <td className="p-4 text-neutral-400 uppercase">{tx.currency}</td>
                                                <td className="p-4 text-right">
                                                    {tx.status === 'succeeded' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold uppercase"><FaCheckCircle /> Paid</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase"><FaTimesCircle /> Failed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {financials.transactions.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-neutral-500 italic">No transactions found.</td></tr>}
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