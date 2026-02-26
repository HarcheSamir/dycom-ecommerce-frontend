import React, { useState, useEffect } from 'react';
import { useAdminUsers, useGrantLifetime, type AdminUser } from '../hooks/useAdminUsers';
import {
    FaUser, FaSearch, FaChevronLeft, FaChevronRight, FaCrown, FaEllipsisV,
    FaFilter, FaLayerGroup, FaChevronDown, FaExclamationTriangle,
    FaDollarSign, FaHistory, FaClock, FaCheckCircle, FaTimesCircle, FaFileCsv,
    FaExternalLinkAlt
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import apiClient from '../lib/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
// --- Reusable Components ---

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-700 rounded-3xl transition-all duration-300 ${className}`} style={{ background: '#1C1E22' }}>
        <div className={`relative ${padding}`}>
            {children}
        </div>
    </div>
);

// Styled Dropdown Component - High Contrast
const FilterSelect: React.FC<{
    icon: React.ReactNode;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[]
}> = ({ icon, value, onChange, options }) => (
    <div className="relative min-w-[200px]">
        <div className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-300 pointer-events-none rtl:right-4 rtl:left-auto">{icon}</div>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none bg-[#111317] border border-neutral-600 rounded-xl h-12 pl-11 pr-10 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <FaChevronDown className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-300 pointer-events-none text-xs" />
    </div>
);

// --- STATUS BADGE COMPONENT ---
const UserStatusBadge = ({ status }: { status: string }) => {
    const { t } = useTranslation();

    const config: { [key: string]: [string, string, React.ReactNode] } = {
        ACTIVE: [
            'bg-green-500/20 border-green-500/40',
            'text-green-200',
            <FaCheckCircle className="mr-1.5 text-green-400" size={10} />
        ],
        LIFETIME_ACCESS: [
            'bg-purple-500/20 border-purple-500/40',
            'text-purple-200',
            <FaCrown className="mr-1.5 text-purple-400" size={10} />
        ],
        TRIALING: [
            'bg-blue-500/20 border-blue-500/40',
            'text-blue-200',
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2" />
        ],
        PAST_DUE: [
            'bg-red-500/20 border-red-500/40',
            'text-red-200',
            <FaExclamationTriangle className="mr-1.5 text-red-400" size={10} />
        ],
        CANCELED: [
            'bg-neutral-600/40 border-neutral-500',
            'text-neutral-200',
            <FaTimesCircle className="mr-1.5 text-neutral-400" size={10} />
        ],
        INCOMPLETE: [
            'bg-yellow-500/20 border-yellow-500/40',
            'text-yellow-200',
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2" />
        ],
        SMMA_ONLY: [
            'bg-pink-500/20 border-pink-500/40',
            'text-pink-200',
            <FaCrown className="mr-1.5 text-pink-400" size={10} />
        ],
    };

    const [styleClass, textClass, icon] = config[status] || config['INCOMPLETE'];

    let label = status;
    if (status === 'ACTIVE') label = t('adminUsers.filters.statusActive');
    else if (status === 'LIFETIME_ACCESS') label = "LIFETIME";
    else if (status === 'PAST_DUE') label = "FAILED";
    else if (status === 'CANCELED') label = "CANCELED";
    else if (status === 'SMMA_ONLY') label = "SMMA";
    else label = status.replace('_', ' ');

    return (
        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border ${styleClass}`}>
            {icon}
            <span className={`text-[11px] font-bold tracking-wider uppercase ${textClass}`}>
                {label}
            </span>
        </div>
    );
};

// --- ACTION MENU COMPONENT ---
const ActionMenu: React.FC<{ user: AdminUser }> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { mutate: grantLifetime, isPending } = useGrantLifetime();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const handleGrant = () => {
        if (window.confirm(t('adminUsers.actions.grantConfirm', { email: user.email }))) {
            grantLifetime(user.id);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors">
                <FaEllipsisV />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1C1E22] border border-neutral-600 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                        <div className="px-4 py-2 text-[10px] text-neutral-400 uppercase font-bold tracking-wider border-b border-neutral-700">
                            {t('adminUsers.actions.menuTitle')}
                        </div>
                        {user.subscriptionStatus !== 'LIFETIME_ACCESS' && (
                            <button
                                onClick={handleGrant}
                                disabled={isPending}
                                className="w-full text-left px-4 py-3 text-sm font-medium text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 flex items-center gap-2 transition-colors"
                            >
                                <FaCrown size={12} /> {t('adminUsers.actions.grantLifetime')}
                            </button>
                        )}
                        <button className="w-full text-left px-4 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-700 flex items-center gap-2 cursor-not-allowed opacity-50">
                            <FaUser size={12} /> {t('adminUsers.actions.editDetails')}
                        </button>
                        <button
                            onClick={() => navigate(`/dashboard/admin/users/${user.id}`)} // Updated Navigation
                            className="w-full text-left px-4 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-700 flex items-center gap-2"
                        >
                            <FaUser size={12} /> View User Details
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// --- CREATE USER MODAL ---
const CreateUserModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void }> = ({ isOpen, onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [status, setStatus] = useState<'LIFETIME' | 'ACTIVE' | 'SMMA'>('LIFETIME');
    const [installmentsPaid, setInstallmentsPaid] = useState(0);
    const [installmentsRequired, setInstallmentsRequired] = useState(1);
    const [stripeSubscriptionId, setStripeSubscriptionId] = useState('');
    const [stripePaymentId, setStripePaymentId] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/admin/users/create', {
                email,
                firstName,
                lastName,
                status,
                installmentsPaid,
                installmentsRequired,
                stripeSubscriptionId,
                stripePaymentId
            });
            toast.success('Utilisateur créé/mis à jour avec succès !');
            onSuccess();
            onClose();
            // Reset fields
            setEmail('');
            setFirstName('');
            setLastName('');
            setStatus('LIFETIME');
            setInstallmentsPaid(0);
            setInstallmentsRequired(1);
            setStripeSubscriptionId('');
            setStripePaymentId('');
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Échec de la création de l'utilisateur");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed h-full inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#1C1E22] border border-neutral-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">✕</button>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    {status === 'LIFETIME' ? <FaCrown className="text-purple-400" /> : status === 'SMMA' ? <FaCrown className="text-pink-400" /> : <FaUser className="text-blue-400" />}
                    {status === 'LIFETIME' ? 'Créer un Utilisateur à Vie' : status === 'SMMA' ? 'Créer un Utilisateur SMMA' : 'Créer un Utilisateur Actif'}
                </h2>

                {/* Status Toggle */}
                <div className="flex bg-[#111317] p-1 rounded-lg mb-6 border border-neutral-700">
                    <button
                        type="button"
                        onClick={() => setStatus('LIFETIME')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${status === 'LIFETIME' ? 'bg-purple-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                    >
                        LIFETIME
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatus('SMMA')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${status === 'SMMA' ? 'bg-pink-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                    >
                        SMMA
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatus('ACTIVE')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${status === 'ACTIVE' ? 'bg-blue-600 text-white shadow' : 'text-neutral-400 hover:text-white'}`}
                    >
                        ACTIVE
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Prénom</label>
                            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#111317] border border-neutral-600 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none" placeholder="Jean" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Nom</label>
                            <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[#111317] border border-neutral-600 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none" placeholder="Dupont" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Email</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#111317] border border-neutral-600 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none" placeholder="user@example.com" />
                    </div>

                    {status === 'ACTIVE' && (
                        <div className="space-y-4 pt-2 border-t border-neutral-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Installments Paid</label>
                                    <input type="number" min="0" value={installmentsPaid} onChange={(e) => setInstallmentsPaid(Number(e.target.value))} className="w-full bg-[#111317] border border-neutral-600 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Total Required</label>
                                    <input type="number" min="1" value={installmentsRequired} onChange={(e) => setInstallmentsRequired(Number(e.target.value))} className="w-full bg-[#111317] border border-neutral-600 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Stripe Subscription ID (Optional)</label>
                                <input type="text" value={stripeSubscriptionId} onChange={(e) => setStripeSubscriptionId(e.target.value)} className="w-full bg-[#111317] border border-neutral-600 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none" placeholder="sub_..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Stripe Payment ID (Optional)</label>
                                <p className="text-[10px] text-neutral-500 mb-1">If provided, creates a transaction record.</p>
                                <input type="text" value={stripePaymentId} onChange={(e) => setStripePaymentId(e.target.value)} className="w-full bg-[#111317] border border-neutral-600 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none" placeholder="pi_..." />
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${status === 'LIFETIME' ? 'bg-purple-600 hover:bg-purple-500 text-white' : status === 'SMMA' ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                        >
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (status === 'LIFETIME' ? "Accorder l'Accès à Vie" : status === 'SMMA' ? "Créer l'Utilisateur SMMA" : "Créer l'Utilisateur Actif")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export const AdminUsersPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [page, setPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isRtl = i18n.language === 'ar';
    const currentLocale = i18n.language === 'fr' ? 'fr-FR' : (isRtl ? 'ar-AE' : 'en-US');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [planFilter, setPlanFilter] = useState('ALL');

    const [tempSearch, setTempSearch] = useState('');
    const navigate = useNavigate();
    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => { setSearch(tempSearch); setPage(1); }, 500);
        return () => clearTimeout(timer);
    }, [tempSearch]);

    const { data, isLoading, refetch } = useAdminUsers(page, {
        search,
        status: statusFilter,
        installments: planFilter
    });

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        setPage(1);
    };

    // --- CSV EXPORT HANDLER ---
    const handleExport = async () => {
        setIsExporting(true);
        const toastId = toast.loading('Exporting data...');
        try {
            const response = await apiClient.get('/admin/users/export', {
                params: {
                    search,
                    status: statusFilter,
                    installments: planFilter
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Export successful!', { id: toastId });
        } catch (error) {
            console.error("Export failed", error);
            toast.error('Export failed.', { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    // --- FORMATTERS ---
    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);

        const dayDate = date.toLocaleDateString(currentLocale, {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const time = date.toLocaleTimeString(currentLocale, {
            hour: '2-digit', minute: '2-digit', hour12: false // Force 24h format
        });

        return { dayDate, time };
    };

    const formatCurrency = (amount: number, currency: string = 'EUR') => {
        return new Intl.NumberFormat(currentLocale, { style: 'currency', currency: currency }).format(amount);
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#111317] min-h-screen text-white space-y-8">
            <Toaster position="bottom-right" />
            <CreateUserModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => { refetch(); }}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                        <FaUser className="text-blue-500" /> {t('adminUsers.title')}
                    </h1>
                    <p className="text-neutral-300">{t('adminUsers.subtitle')}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 border border-purple-500 rounded-xl text-white font-medium transition-colors shadow-lg shadow-purple-500/20"
                    >
                        <FaCrown /> Créer un Utilisateur
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-xl text-white font-medium transition-colors disabled:opacity-50 shadow-lg"
                    >
                        <FaFileCsv className="text-green-400" />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>

            <GlassCard padding="p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-grow">
                        <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-300 rtl:right-4 rtl:left-auto" />
                        <input
                            type="text"
                            placeholder={t('adminUsers.searchPlaceholder')}
                            value={tempSearch}
                            onChange={(e) => setTempSearch(e.target.value)}
                            className="w-full bg-[#111317] border border-neutral-600 rounded-xl h-12 pl-11 pr-4 rtl:pr-11 rtl:pl-4 text-white placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0">
                        <FilterSelect
                            icon={<FaFilter />}
                            value={statusFilter}
                            onChange={(val) => handleFilterChange(setStatusFilter, val)}
                            options={[
                                { value: 'ALL', label: t('adminUsers.filters.statusAll') },
                                { value: 'ACTIVE', label: t('adminUsers.filters.statusActive') },
                                { value: 'PAST_DUE', label: t('adminUsers.filters.statusPastDue') },
                                { value: 'LIFETIME_ACCESS', label: t('adminUsers.filters.statusLifetime') },
                                { value: 'SMMA_ONLY', label: 'SMMA Only' },
                                { value: 'CANCELED', label: t('adminUsers.filters.statusCanceled') },
                                { value: 'INCOMPLETE', label: t('adminUsers.filters.statusIncomplete') },
                            ]}
                        />

                        <FilterSelect
                            icon={<FaLayerGroup />}
                            value={planFilter}
                            onChange={(val) => handleFilterChange(setPlanFilter, val)}
                            options={[
                                { value: 'ALL', label: t('adminUsers.filters.planAll') },
                                { value: 'LIFETIME', label: t('adminUsers.filters.planLifetime') },
                                { value: '2', label: t('adminUsers.filters.plan2') },
                                { value: '3', label: t('adminUsers.filters.plan3') },
                            ]}
                        />
                    </div>
                </div>
            </GlassCard>

            <div className="bg-[#1C1E22] border border-neutral-700 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#111317] border-b border-neutral-700 text-neutral-300 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="p-5">{t('adminUsers.table.identity')}</th>
                                <th className="p-5">{t('adminUsers.table.status')}</th>
                                <th className="p-5">Progress</th>
                                <th className="p-5">Financials (LTV)</th>
                                <th className="p-5">Activity Log</th>
                                <th className="p-5 text-right">{t('adminUsers.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-12 text-center text-neutral-300">{t('adminUsers.table.loading')}</td></tr>
                            ) : data?.data.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-neutral-300">{t('adminUsers.table.empty')}</td></tr>
                            ) : data?.data.map((user) => (
                                <tr key={user.id} className="group cursor-pointer hover:bg-[#23262b] transition-colors" onClick={() => navigate(`/dashboard/admin/users/${user.id}`)}>

                                    {/* --- 1. IDENTITY COLUMN --- */}
                                    <td className="p-5 align-top">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-bold border border-neutral-600 shadow-sm">
                                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{user.firstName} {user.lastName}</div>
                                                <div className="text-xs text-neutral-300 font-mono">{user.email}</div>
                                                <div className="text-[10px] text-neutral-500 font-mono mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">{user.id}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* --- 2. STATUS COLUMN --- */}
                                    <td className="p-5 align-top">
                                        <UserStatusBadge status={user.subscriptionStatus} />
                                    </td>

                                    {/* --- 3. PROGRESS COLUMN (Separated & Logic applied) --- */}
                                    <td className="p-5 align-top">
                                        {user.subscriptionStatus === 'LIFETIME_ACCESS' ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider">
                                                Paid Full
                                            </span>
                                        ) : user.installmentsPaid === 0 ? (
                                            <span className="text-neutral-500 text-xs italic font-medium px-2 py-1 bg-neutral-800 rounded border border-neutral-700">
                                                None
                                            </span>
                                        ) : (
                                            <div className="w-28">
                                                <div className="flex justify-between text-[10px] text-neutral-300 mb-1.5 font-bold tracking-wide">
                                                    <span>PAID</span>
                                                    <span>{user.installmentsPaid} / {user.installmentsRequired}</span>
                                                </div>
                                                <div className="w-full bg-neutral-700 rounded-full h-2 shadow-inner">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${user.subscriptionStatus === 'PAST_DUE' ? 'bg-red-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${Math.min((user.installmentsPaid / (user.installmentsRequired || 1)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    {/* --- 4. FINANCIALS COLUMN --- */}
                                    <td className="p-5 align-top">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-green-300 font-bold text-base flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded w-fit border border-green-500/20">
                                                <FaDollarSign size={12} className="text-green-400" /> {formatCurrency(user.ltv)}
                                            </span>
                                            {user.stats.purchases > 0 && (
                                                <span className="text-[11px] text-neutral-400 pl-1">
                                                    {user.stats.purchases} Successful Transactions
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* --- 5. ACTIVITY / DATES COLUMN (Accurate Format + Full History) --- */}
                                    <td className="p-5 align-top ">
                                        <div className="space-y-4">
                                            {/* Joined Date */}
                                            <div className="flex items-start gap-3">
                                                <div className="w-5 flex justify-center pt-0.5"><FaClock className="text-blue-400" size={13} /></div>
                                                <div>
                                                    <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider block leading-none mb-1">Joined</span>
                                                    <div className="flex gap-2 text-xs font-mono text-neutral-200">
                                                        <span>{formatDateTime(user.createdAt)?.dayDate}</span>
                                                        <span className="text-neutral-400 font-bold">{formatDateTime(user.createdAt)?.time}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payments List (UPDATED WITH TIME) */}
                                            <div className="flex items-start gap-3">
                                                <div className="w-5 flex justify-center pt-0.5"><FaHistory className="text-green-400" size={13} /></div>
                                                <div className="flex-1">
                                                    <span className="text-[10px] text-green-300 font-bold uppercase tracking-wider block leading-none mb-1">Payment History</span>

                                                    {user.paymentHistory && user.paymentHistory.length > 0 ? (
                                                        <div className="max-h-24  pr-2 space-y-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900">
                                                            {user.paymentHistory.map((payment, idx) => (
                                                                <div key={idx} className="flex justify-between items-start text-xs font-mono border-b border-neutral-800 pb-1 last:border-0 last:pb-0">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-neutral-300">{formatDateTime(payment.date)?.dayDate}</span>
                                                                        {/* ADDED TIME HERE */}
                                                                        <span className="text-[10px] text-neutral-500">{formatDateTime(payment.date)?.time}</span>
                                                                    </div>
                                                                    <span className="text-white font-bold ml-2 mt-0.5">{formatCurrency(payment.amount, payment.currency)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-neutral-500 italic">No payments yet</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    {/* --- 6. ACTIONS COLUMN --- */}
                                    <td className="p-5 text-right align-top">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            {user.stripeCustomerId && (
                                                <a
                                                    href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 rounded-lg text-xs font-medium text-white transition-colors"
                                                    title="View in Stripe"
                                                >
                                                    Stripe <FaExternalLinkAlt size={10} className="text-neutral-400" />
                                                </a>
                                            )}
                                            <ActionMenu user={user} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.meta.totalPages > 1 && (
                    <div className="p-4  border-t border-neutral-700 flex justify-end gap-2 bg-[#1C1E22]">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-sm text-white hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isRtl ? <FaChevronRight /> : <FaChevronLeft />}
                        </button>
                        <span className="px-3 py-1.5 text-xs font-mono text-neutral-300 flex items-center border border-neutral-700 rounded bg-[#111317]">
                            Page {page} / {data.meta.totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                            disabled={page === data.meta.totalPages}
                            className="px-3 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-sm text-white hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isRtl ? <FaChevronLeft /> : <FaChevronRight />}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};