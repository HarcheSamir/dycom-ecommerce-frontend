// src/pages/AdminUsersPage.tsx

import React, { useState } from 'react';
import { useAdminUsers, useGrantLifetime, type AdminUser } from '../hooks/useAdminUsers';
import { FaUser, FaSearch, FaChevronLeft, FaChevronRight, FaCrown, FaEllipsisV, FaFilter, FaLayerGroup, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

// --- Reusable Components ---
const GlassCard: React.FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

// Styled Dropdown Component
const FilterSelect: React.FC<{ 
    icon: React.ReactNode; 
    value: string; 
    onChange: (val: string) => void; 
    options: { value: string; label: string }[] 
}> = ({ icon, value, onChange, options }) => (
    <div className="relative min-w-[200px]">
        <div className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500 pointer-events-none rtl:right-4 rtl:left-auto">{icon}</div>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none bg-[#111317] border border-neutral-700 rounded-lg h-12 pl-11 pr-10 rtl:pr-11 rtl:pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <FaChevronDown className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-500 pointer-events-none text-xs rtl:left-4 rtl:right-auto" />
    </div>
);

const UserStatusBadge = ({ status }: { status: string }) => {
    const { t } = useTranslation();

    const styles: { [key: string]: string } = {
        ACTIVE: 'bg-green-900/30 text-green-400 border-green-500/30',
        LIFETIME_ACCESS: 'bg-purple-900/30 text-purple-400 border-purple-500/30',
        TRIALING: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
        PAST_DUE: 'bg-red-900/30 text-red-400 border-red-500/30',
        CANCELED: 'bg-neutral-800 text-neutral-400 border-neutral-600',
        INCOMPLETE: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30',
    };
    const defaultStyle = 'bg-neutral-800 text-white';
    
    // Translate specific database statuses
    let label = status;
    if (status === 'ACTIVE') label = t('adminUsers.filters.statusActive');
    else if (status === 'LIFETIME_ACCESS') label = t('adminUsers.filters.statusLifetime');
    else if (status === 'PAST_DUE') label = t('adminUsers.filters.statusPastDue');
    else if (status === 'CANCELED') label = t('adminUsers.filters.statusCanceled');
    else if (status === 'INCOMPLETE') label = t('adminUsers.filters.statusIncomplete');
    else label = status.replace('_', ' ');

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || defaultStyle} uppercase tracking-wider`}>
            {label}
        </span>
    );
};

const ActionMenu: React.FC<{ user: AdminUser }> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { mutate: grantLifetime, isPending } = useGrantLifetime();
    const { t } = useTranslation();

    const handleGrant = () => {
        // Translated Confirm Dialog
        if (window.confirm(t('adminUsers.actions.grantConfirm', { email: user.email }))) {
            grantLifetime(user.id);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors">
                <FaEllipsisV />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1C1E22] border border-neutral-700 rounded-lg shadow-xl z-20 overflow-hidden rtl:left-0 rtl:right-auto">
                    <div className="p-2 text-xs text-neutral-500 uppercase font-bold tracking-wider border-b border-neutral-800">
                        {t('adminUsers.actions.menuTitle')}
                    </div>
                    {user.subscriptionStatus !== 'LIFETIME_ACCESS' && (
                        <button 
                            onClick={handleGrant} 
                            disabled={isPending}
                            className="w-full text-left rtl:text-right px-4 py-3 text-sm text-purple-400 hover:bg-purple-900/20 hover:text-purple-300 flex items-center gap-2 transition-colors"
                        >
                            <FaCrown size={14} /> {t('adminUsers.actions.grantLifetime')}
                        </button>
                    )}
                    <button className="w-full text-left rtl:text-right px-4 py-3 text-sm text-neutral-400 hover:bg-neutral-800 flex items-center gap-2 cursor-not-allowed opacity-50">
                        <FaUser size={14} /> {t('adminUsers.actions.editDetails')}
                    </button>
                </div>
            )}
            {/* Backdrop to close */}
            {isOpen && <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />}
        </div>
    );
};

export const AdminUsersPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [page, setPage] = useState(1);
    
    // Determine Text Direction and Locale
    const isRtl = i18n.language === 'ar';
    const currentLocale = i18n.language === 'fr' ? 'fr-FR' : (isRtl ? 'ar-AE' : 'en-US');

    // Filter State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [planFilter, setPlanFilter] = useState('ALL');

    // Debounce search input
    const [tempSearch, setTempSearch] = useState('');
    React.useEffect(() => {
        const timer = setTimeout(() => { setSearch(tempSearch); setPage(1); }, 500);
        return () => clearTimeout(timer);
    }, [tempSearch]);

    // Fetch data with all filters
    const { data, isLoading } = useAdminUsers(page, { 
        search, 
        status: statusFilter, 
        installments: planFilter 
    });

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        setPage(1); 
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#111317] min-h-screen text-white space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FaUser className="text-blue-400" /> {t('adminUsers.title')}
                </h1>
                <p className="text-neutral-400 mt-1">{t('adminUsers.subtitle')}</p>
            </div>

            <GlassCard padding="p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Bar */}
                    <div className="relative flex-grow">
                        <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500 rtl:right-4 rtl:left-auto" />
                        <input 
                            type="text" 
                            placeholder={t('adminUsers.searchPlaceholder')} 
                            value={tempSearch}
                            onChange={(e) => setTempSearch(e.target.value)}
                            className="w-full bg-[#111317] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 rtl:pr-11 rtl:pl-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4">
                        <FilterSelect 
                            icon={<FaFilter />}
                            value={statusFilter}
                            onChange={(val) => handleFilterChange(setStatusFilter, val)}
                            options={[
                                { value: 'ALL', label: t('adminUsers.filters.statusAll') },
                                { value: 'ACTIVE', label: t('adminUsers.filters.statusActive') },
                                { value: 'PAST_DUE', label: t('adminUsers.filters.statusPastDue') },
                                { value: 'LIFETIME_ACCESS', label: t('adminUsers.filters.statusLifetime') },
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

            <div className="bg-[#1C1E22] border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    {/* Changed text-left to text-start for RTL support */}
                    <table className="w-full text-start">
                        <thead className="bg-neutral-900/50 text-neutral-400 text-sm">
                            <tr>
                                <th className="p-4 text-start">{t('adminUsers.table.identity')}</th>
                                <th className="p-4 text-start">{t('adminUsers.table.status')}</th>
                                <th className="p-4 text-start">{t('adminUsers.table.progress')}</th>
                                <th className="p-4 text-start">{t('adminUsers.table.joined')}</th>
                                <th className="p-4 text-end">{t('adminUsers.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-neutral-500">{t('adminUsers.table.loading')}</td></tr>
                            ) : data?.data.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-neutral-500">{t('adminUsers.table.empty')}</td></tr>
                            ) : data?.data.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-white">{user.firstName} {user.lastName}</div>
                                        <div className="text-xs text-neutral-500">{user.email}</div>
                                        <div className="text-[10px] text-neutral-600 font-mono mt-0.5">{user.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <UserStatusBadge status={user.subscriptionStatus} />
                                    </td>
                                    <td className="p-4">
                                        {user.subscriptionStatus === 'LIFETIME_ACCESS' ? (
                                            <div className="flex items-center gap-2 text-purple-400 text-sm font-bold">
                                                <FaCrown /> {t('adminUsers.table.lifetimeBadge')}
                                            </div>
                                        ) : (
                                            <div className="w-32">
                                                <div className="flex justify-between text-xs text-neutral-400 mb-1">
                                                    <span>{t('adminUsers.table.paid')}</span>
                                                    <span>{user.installmentsPaid}/{user.installmentsRequired}</span>
                                                </div>
                                                <div className="w-full bg-neutral-800 rounded-full h-1.5">
                                                    <div 
                                                        className={`h-1.5 rounded-full ${user.subscriptionStatus === 'PAST_DUE' ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                        style={{ width: `${Math.min((user.installmentsPaid / (user.installmentsRequired || 1)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                {user.subscriptionStatus === 'PAST_DUE' && (
                                                    <div className="flex items-center gap-1 text-[10px] text-red-400 mt-1">
                                                        <FaExclamationTriangle /> {t('adminUsers.table.paymentFailed')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-neutral-400">
                                        {/* Locale-aware date */}
                                        {new Date(user.createdAt).toLocaleDateString(currentLocale)}
                                    </td>
                                    <td className="p-4 text-end">
                                        <ActionMenu user={user} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && data.meta.totalPages > 1 && (
                    <div className="p-4 border-t border-neutral-800 flex justify-end gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 bg-neutral-800 rounded text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
                        >
                            {isRtl ? <FaChevronRight /> : <FaChevronLeft />}
                        </button>
                        <span className="px-3 py-1.5 text-sm text-neutral-400">
                            {t('adminUsers.pagination', { page, total: data.meta.totalPages })}
                        </span>
                        <button 
                            onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                            disabled={page === data.meta.totalPages}
                            className="px-3 py-1.5 bg-neutral-800 rounded text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
                        >
                            {isRtl ? <FaChevronLeft /> : <FaChevronRight />}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};