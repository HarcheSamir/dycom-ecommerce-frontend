// src/pages/AdminFinancialPage.tsx

import React, { useState, useEffect } from 'react';
import { 
    useStripeFinancialStats, 
    useStripeCustomers, 
    useStripeTransactions, 
    useAssignCloser,
    useCloserStats,
    type StripeCustomer, 
    type StripeTransaction 
} from '../hooks/useAdminStripe';
import { 
    FaEuroSign, FaUsers, FaCreditCard, FaExclamationTriangle, 
    FaChevronLeft, FaChevronRight, FaUserTie, FaExchangeAlt, FaSearch 
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// --- SUB-COMPONENTS ---

const FinancialCard: React.FC<{ title: string; value: string; subValue?: string; icon: React.ReactNode; color?: string }> = ({ title, value, subValue, icon, color = "text-white" }) => (
    <div className="bg-[#1C1E22] border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
        <div className={`absolute top-4 end-4 opacity-20 text-4xl ${color} rtl:left-4 ltr:right-4`}>{icon}</div>
        <p className="text-neutral-400 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        {subValue && <p className="text-neutral-500 text-xs mt-1">{subValue}</p>}
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const styles: { [key: string]: string } = {
        succeeded: 'bg-green-900/30 text-green-400 border-green-500/30',
        active: 'bg-green-900/30 text-green-400 border-green-500/30',
        trialing: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
        past_due: 'bg-red-900/30 text-red-400 border-red-500/30',
        failed: 'bg-red-900/30 text-red-400 border-red-500/30',
        canceled: 'bg-neutral-800 text-neutral-400 border-neutral-600',
    };
    const defaultStyle = 'bg-neutral-800 text-white';
    
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || defaultStyle} uppercase tracking-wider`}>
            {status}
        </span>
    );
};

const CloserInput: React.FC<{ transaction: StripeTransaction }> = ({ transaction }) => {
    const [name, setName] = useState(transaction.closer || '');
    const { mutate: assignCloser, isPending } = useAssignCloser();

    useEffect(() => {
        setName(transaction.closer || '');
    }, [transaction.closer]);

    const handleSave = () => {
        if (name === transaction.closer) return; // No change

        assignCloser({
            chargeId: transaction.id,
            paymentId: transaction.paymentId,
            amount: transaction.amount,
            currency: transaction.currency,
            created: transaction.created,
            customerId: transaction.customer?.id,
            customerEmail: transaction.customer?.email || undefined,
            closerName: name
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur(); 
        }
    };

    return (
        <div className="relative group">
            <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                placeholder="Assign..."
                disabled={isPending}
                className={`w-full bg-[#111317] border ${isPending ? 'border-yellow-500/50' : 'border-neutral-700'} rounded-lg h-9 px-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-600`}
            />
            {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

const TableSkeleton = () => (
    <div className="animate-pulse space-y-4 p-5">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
                <div className="h-8 bg-neutral-800 rounded w-24"></div>
                <div className="h-8 bg-neutral-800 rounded w-32"></div>
                <div className="h-8 bg-neutral-800 rounded flex-1"></div>
                <div className="h-8 bg-neutral-800 rounded w-20"></div>
                <div className="h-8 bg-neutral-800 rounded w-40"></div>
            </div>
        ))}
    </div>
);

// --- MAIN PAGE ---

export const AdminFinancialsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { data: stats } = useStripeFinancialStats();
    const { data: closers } = useCloserStats(); // Fetch Stats for Menu
    
    // State
    const [viewMode, setViewMode] = useState<'transactions' | 'customers'>('transactions');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCloser, setSelectedCloser] = useState<string | null>(null);
    
    // Pagination State
    const [cursor, setCursor] = useState<{ startingAfter?: string; endingBefore?: string }>({});
    const [pageHistory, setPageHistory] = useState<string[]>([]);

    const isRtl = i18n.language === 'ar';
    const currentLocale = i18n.language === 'fr' ? 'fr-FR' : (isRtl ? 'ar-AE' : 'en-US');

    // Debounce
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset pagination on filter change
    useEffect(() => {
        setCursor({});
        setPageHistory([]);
    }, [viewMode, debouncedSearch, selectedCloser]);

    // Data Fetching
    const { data: transData, isLoading: transLoading } = useStripeTransactions(
        20, 
        viewMode === 'transactions' ? cursor.startingAfter : undefined, 
        viewMode === 'transactions' ? cursor.endingBefore : undefined,
        debouncedSearch,
        selectedCloser || undefined
    );

    const { data: custData, isLoading: custLoading } = useStripeCustomers(
        20, 
        viewMode === 'customers' ? cursor.startingAfter : undefined, 
        viewMode === 'customers' ? cursor.endingBefore : undefined
    );

    const activeData = viewMode === 'transactions' ? transData : custData;
    const isLoading = viewMode === 'transactions' ? transLoading : custLoading;

    // Handlers
    const handleNext = () => {
        if (activeData?.last_id) {
            setPageHistory(prev => [...prev, activeData.first_id!]);
            setCursor({ startingAfter: activeData.last_id, endingBefore: undefined });
        }
    };

    const handlePrev = () => {
        if (pageHistory.length > 0) {
            const newHistory = pageHistory.slice(0, -1);
            setPageHistory(newHistory);
            
            // For Stripe, if we go back to start, we send undefined (clearing params)
            // For Local DB pagination, this logic holds because first_id/last_id are page numbers
            if (activeData?.first_id) {
                 setCursor({ endingBefore: activeData.first_id, startingAfter: undefined });
            } else {
                 setCursor({});
            }
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat(currentLocale, { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#111317] min-h-screen text-white">
            
            {/* Header & View Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FaEuroSign className="text-green-400" /> {t('adminFinancials.title')}
                    </h1>
                    <p className="text-neutral-400 mt-1">{t('adminFinancials.subtitle')}</p>
                </div>
                
                <div className="flex bg-[#1C1E22] p-1 rounded-xl border border-neutral-800">
                    <button 
                        onClick={() => setViewMode('transactions')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'transactions' ? 'bg-purple-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <FaExchangeAlt /> Transactions
                    </button>
                    <button 
                        onClick={() => setViewMode('customers')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'customers' ? 'bg-purple-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <FaUsers /> Customers
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinancialCard
                    title={t('adminFinancials.stats.available')}
                    value={stats ? formatCurrency(stats.balance.available * 100, stats.balance.currency) : '...'}
                    subValue={t('adminFinancials.stats.availableSub')}
                    icon={<FaEuroSign />}
                />
                <FinancialCard
                    title={t('adminFinancials.stats.pending')}
                    value={stats ? formatCurrency(stats.balance.pending * 100, stats.balance.currency) : '...'}
                    subValue={t('adminFinancials.stats.pendingSub')}
                    icon={<FaCreditCard />}
                    color="text-neutral-400"
                />
                <FinancialCard
                    title={t('adminFinancials.stats.active')}
                    value={stats ? stats.subscribers.active.toString() : '...'}
                    subValue={t('adminFinancials.stats.activeSub')}
                    icon={<FaUsers />}
                    color="text-green-400"
                />
                <FinancialCard
                    title={t('adminFinancials.stats.risk')}
                    value={stats ? stats.subscribers.past_due.toString() : '...'}
                    subValue={t('adminFinancials.stats.riskSub')}
                    icon={<FaExclamationTriangle />}
                    color="text-red-400"
                />
            </div>

            {/* --- CLOSER FILTER MENU (Horizontal Scroll) --- */}
            {viewMode === 'transactions' && closers && closers.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-800">
                    <button
                        onClick={() => setSelectedCloser(null)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                            selectedCloser === null 
                            ? 'bg-white text-black border-white' 
                            : 'bg-[#1C1E22] text-neutral-400 border-neutral-700 hover:border-neutral-500'
                        }`}
                    >
                        All Payments
                    </button>
                    {closers.map(c => (
                        <button
                            key={c.name}
                            onClick={() => setSelectedCloser(c.name)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 transition-all ${
                                selectedCloser === c.name 
                                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/50' 
                                : 'bg-[#1C1E22] text-neutral-300 border-neutral-700 hover:border-neutral-500'
                            }`}
                        >
                            <span>{c.name}</span>
                            <span className={`text-xs px-1.5 rounded min-w-[20px] text-center ${selectedCloser === c.name ? 'bg-purple-800 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                                {c.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* --- MAIN TABLE --- */}
            <div className="bg-[#1C1E22] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                
                {/* Table Header / Toolbar */}
                <div className="p-6 border-b border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <h2 className="text-xl font-bold text-white whitespace-nowrap">
                            {selectedCloser ? `Sales by ${selectedCloser}` : (viewMode === 'transactions' ? 'Recent Transactions' : t('adminFinancials.explorer.title'))}
                        </h2>
                        {/* Search Bar */}
                        {viewMode === 'transactions' && !selectedCloser && (
                            <div className="relative w-full md:w-72">
                                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search email, name..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#111317] border border-neutral-700 rounded-lg h-10 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-neutral-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrev}
                            disabled={pageHistory.length === 0 || isLoading}
                            className="px-4 py-2 bg-neutral-800 rounded-lg text-white hover:bg-neutral-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                        >
                            {isRtl ? <FaChevronRight /> : <FaChevronLeft />}
                            {t('adminFinancials.explorer.prev')}
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!activeData?.has_more || isLoading}
                            className="px-4 py-2 bg-neutral-800 rounded-lg text-white hover:bg-neutral-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                        >
                            {t('adminFinancials.explorer.next')}
                            {isRtl ? <FaChevronLeft /> : <FaChevronRight />}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <TableSkeleton />
                    ) : viewMode === 'transactions' ? (
                        /* --- TRANSACTIONS TABLE --- */
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#111317] border-b border-neutral-800 text-neutral-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-5">Date</th>
                                    <th className="p-5">Amount</th>
                                    <th className="p-5">Customer / Email</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 w-64 bg-purple-900/10 border-l border-neutral-800 text-purple-300">
                                        <div className="flex items-center gap-2">
                                            <FaUserTie /> Assigned Closer
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {transData?.data.map((tx: StripeTransaction) => (
                                    <tr key={tx.id} className="hover:bg-[#23262b] transition-colors group">
                                        <td className="p-5 text-sm text-neutral-300">
                                            {new Date(tx.created * 1000).toLocaleDateString(currentLocale, {
                                                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
                                            })}
                                        </td>
                                        <td className="p-5 font-mono font-bold text-white">
                                            {formatCurrency(tx.amount, tx.currency)}
                                        </td>
                                        <td className="p-5">
                                            <div className="font-medium text-white">{tx.customer?.name || 'Guest'}</div>
                                            <div className="text-xs text-neutral-500">{tx.customer?.email || 'No Email'}</div>
                                        </td>
                                        <td className="p-5">
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td className="p-5 border-l border-neutral-800 bg-[#16181c]">
                                            <CloserInput transaction={tx} />
                                        </td>
                                    </tr>
                                ))}
                                {transData?.data.length === 0 && (
                                    <tr><td colSpan={5} className="p-12 text-center text-neutral-500">No transactions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        /* --- CUSTOMERS TABLE --- */
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#111317] border-b border-neutral-800 text-neutral-400 text-xs uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-5">{t('adminFinancials.table.customer')}</th>
                                    <th className="p-5">{t('adminFinancials.table.status')}</th>
                                    <th className="p-5">{t('adminFinancials.table.plan')}</th>
                                    <th className="p-5">{t('adminFinancials.table.billing')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                {custData?.data.map((c: StripeCustomer) => (
                                    <tr key={c.id} className="hover:bg-[#23262b] transition-colors">
                                        <td className="p-5">
                                            <div className="font-semibold text-white">{c.name || t('adminFinancials.table.unknown')}</div>
                                            <div className="text-xs text-neutral-500">{c.email}</div>
                                        </td>
                                        <td className="p-5">
                                            {c.subscription ? <StatusBadge status={c.subscription.status} /> : <span className="text-neutral-500">-</span>}
                                        </td>
                                        <td className="p-5 font-mono text-sm text-neutral-300">
                                            {c.subscription ? formatCurrency(c.subscription.amount, c.subscription.currency) : '-'}
                                        </td>
                                        <td className="p-5 text-sm text-neutral-400">
                                            {c.subscription?.current_period_end 
                                                ? new Date(c.subscription.current_period_end * 1000).toLocaleDateString(currentLocale) 
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    );
};