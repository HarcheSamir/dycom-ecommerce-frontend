import React, { useState, useEffect, useMemo, type FC } from 'react';
import {
    useGetMembershipPrices, useUpdateMembershipPrices, type PricingGrid,
    useGetSettings, useUpdateSettings, useAdminCourses, useAffiliateLeaderboard, type AdminCourse
} from '../../hooks/useAdmin';
import { usePublicSettings, useUpdateSettings as useUpdateGlobalSettings } from '../../hooks/useSettings';
import { GlassCard, DashboardCard } from './AdminUI';
import { FaEuroSign, FaCog, FaPlus, FaEdit, FaTrophy, FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// --- MEMBERSHIP PRICING MANAGER ---
export const MembershipPricingManager: FC = () => {
    const { t } = useTranslation();
    const { data: initialPrices, isLoading } = useGetMembershipPrices();
    const { mutate: savePrices, isPending } = useUpdateMembershipPrices();
    const [grid, setGrid] = useState<PricingGrid | null>(null);

    useEffect(() => {
        if (initialPrices) setGrid(initialPrices);
    }, [initialPrices]);

    const handlePriceChange = (installments: '1' | '2' | '3', currency: 'eur' | 'usd' | 'aed', value: string) => {
        if (!grid) return;
        setGrid({
            ...grid,
            [installments]: {
                ...grid[installments],
                [currency]: Number(value)
            }
        });
    };

    const handleSave = () => { if (grid) savePrices(grid); };

    if (isLoading) return <DashboardCard><p className="text-neutral-500 text-center py-10">{t('adminMembership.loading')}</p></DashboardCard>;
    if (!grid) return null;

    return (
        <DashboardCard>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><FaEuroSign /> {t('adminMembership.title')}</h2>
                    <p className="text-sm text-neutral-400">{t('adminMembership.subtitle')}</p>
                </div>
                <button onClick={handleSave} disabled={isPending} className="px-6 py-2.5 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                    {isPending && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>}
                    {isPending ? t('adminMembership.saving') : t('adminMembership.saveButton')}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-neutral-800 text-sm text-neutral-400">
                            <th className="p-4 font-semibold w-1/3">{t('adminMembership.table.planType')}</th>
                            <th className="p-4 font-semibold">EUR (€)</th>
                            <th className="p-4 font-semibold">USD ($)</th>
                            <th className="p-4 font-semibold">AED (د.إ)</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {['1', '2', '3'].map((tier) => (
                            <tr key={tier} className="border-b border-neutral-800 hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold flex items-center gap-2">
                                        {tier === '1' ? t('adminMembership.table.lifetime') : tier === '2' ? t('adminMembership.table.split2') : t('adminMembership.table.split3')}
                                        {tier === '1' && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">1x</span>}
                                    </div>
                                    <div className="text-xs text-neutral-400 mt-1">
                                        {tier === '1' ? t('adminMembership.table.lifetimeSub') : tier === '2' ? t('adminMembership.table.split2Sub') : t('adminMembership.table.split3Sub')}
                                    </div>
                                </td>
                                {['eur', 'usd', 'aed'].map((curr) => (
                                    <td key={curr} className="p-4">
                                        <input
                                            type="number"
                                            value={grid[tier as '1' | '2' | '3'][curr as 'eur' | 'usd' | 'aed']}
                                            onChange={(e) => handlePriceChange(tier as '1' | '2' | '3', curr as 'eur' | 'usd' | 'aed', e.target.value)}
                                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-10 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardCard>
    );
};

// --- REVENUE CHART ---
export const NewMonthlyRevenue: FC<{ data: { name: string, value: number }[] }> = ({ data }) => {
    const { t, i18n } = useTranslation();
    const maxValue = useMemo(() => data.length > 0 ? Math.max(...data.map(d => d.value)) : 1, [data]);
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';

    return (
        <DashboardCard>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2"><FaEuroSign /> {t('adminPage.monthlyRevenue.title')}</h2>
                    <p className="text-sm text-neutral-400">{t('adminPage.monthlyRevenue.subtitle')}</p>
                </div>
            </div>
            <div className="space-y-4">
                {data.map(item => (
                    <div key={item.name} className="flex items-center gap-4 text-sm">
                        <p className="w-16 text-neutral-400 font-medium">{item.name}</p>
                        <div className="flex-1 bg-neutral-800 rounded-full h-6">
                            <div className="bg-white rounded-full h-6" style={{ width: `${(item.value / maxValue) * 100}%` }} />
                        </div>
                        <p className="w-24 text-right font-semibold text-white">${item.value.toLocaleString(locale)}</p>
                    </div>
                ))}
                {data.length === 0 && <p className="text-neutral-500 text-center py-8">{t('adminPage.monthlyRevenue.noData')}</p>}
            </div>
        </DashboardCard>
    );
};

// --- PLATFORM SETTINGS ---
export const PlatformSettings: FC = () => {
    const { t } = useTranslation();
    const { data: settings, isLoading: isLoadingSettings } = useGetSettings();
    const { mutate: updateSettings, isPending: isUpdatingSettings } = useUpdateSettings();
    const { data: globalSettings } = usePublicSettings();
    const { mutate: updateGlobalSettings, isPending: isUpdatingGlobal } = useUpdateGlobalSettings(); // Rename to avoid conflict
    const [discountPercentage, setDiscountPercentage] = useState('');

    useEffect(() => {
        if (settings) {
            setDiscountPercentage(settings.affiliateCourseDiscountPercentage || '50');
        }
    }, [settings]);

    const handleSave = () => {
        const rateValue = parseFloat(discountPercentage);
        if (isNaN(rateValue) || rateValue <= 0 || rateValue > 100) {
            toast.error(t('adminPage.toasts.invalidSettings', 'Please enter a valid percentage between 1 and 100.'));
            return;
        }
        updateSettings({ affiliateCourseDiscountPercentage: String(rateValue) });
    };

    const toggleUrgency = () => {
        const newValue = !globalSettings?.urgencyEnabled;
        updateGlobalSettings({ urgencyEnabled: newValue });
    };

    if (isLoadingSettings) return <DashboardCard><p className="text-neutral-500">{t('adminPage.platformSettings.loading')}</p></DashboardCard>;

    return (
        <DashboardCard>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><FaCog /> {t('adminPage.platformSettings.title')}</h2>
            <div className="space-y-6">

                {/* URGENCY MODE TOGGLE */}
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <div>
                        <h3 className="text-white font-medium">{t('adminPage.urgencyMode.label')}</h3>
                        <p className="text-sm text-neutral-400">{t('adminPage.urgencyMode.description')}</p>
                    </div>
                    <button
                        onClick={toggleUrgency}
                        disabled={isUpdatingGlobal}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${globalSettings?.urgencyEnabled ? 'bg-green-500' : 'bg-neutral-700'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${globalSettings?.urgencyEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div>
                    <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.platformSettings.discountRateLabel', 'Affiliate Reward Discount (%)')}</label>
                    <input type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} className="w-full bg-[#111317] border border-neutral-700 rounded-lg h-12 px-4 text-white" placeholder={t('adminPage.platformSettings.commissionRatePlaceholder', 'e.g., 50')} />
                </div>
                <div className="flex justify-end">
                    <button onClick={handleSave} disabled={isUpdatingSettings} className="px-5 py-2.5 rounded-lg bg-gray-200 text-black font-semibold disabled:opacity-50">
                        {isUpdatingSettings ? t('adminPage.platformSettings.saving') : t('adminPage.platformSettings.save')}
                    </button>
                </div>
            </div>
        </DashboardCard>
    );
};

// --- COURSE MANAGEMENT TABLE ---
export const NewCourseManagement: FC<{ onUpload: () => void; onSelectCourse: (id: string) => void; }> = ({ onUpload, onSelectCourse }) => {
    const { t, i18n } = useTranslation();
    const { data: courses, isLoading } = useAdminCourses();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';

    const formatPrice = (price: number | null, currency: 'EUR' | 'USD' | 'AED') => {
        if (price === null || price === undefined) return <span className="text-neutral-500">N/A</span>;
        if (price === 0) return <span className="text-green-400">Inclus</span>;
        return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price);
    };
    const LanguageBadge: FC<{ lang: AdminCourse['language'] }> = ({ lang }) => (
        <span className="text-xs font-semibold text-neutral-300 bg-neutral-700/50 px-2 py-1 rounded-md">{lang}</span>
    );

    return (
        <GlassCard padding="p-0">
            <div className="flex justify-between items-center p-6 border-b border-neutral-800">
                <div>
                    <h2 className="text-xl font-bold text-white">{t('adminPage.courseManagement.title')}</h2>
                    <p className="text-sm text-neutral-400">{t('adminPage.courseManagement.subtitle')}</p>
                </div>
                <button onClick={onUpload} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold transition-colors hover:bg-neutral-800">
                    <FaPlus /> {t('adminPage.courseManagement.uploadButton')}
                </button>
            </div>
            <div className="overflow-x-auto">
                {isLoading ? (
                    <p className="text-neutral-500 text-center p-8">{t('adminPage.common.loading')}</p>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-neutral-800">
                                <th className="p-4 text-sm font-semibold text-neutral-400">Course</th>
                                <th className="p-4 text-sm font-semibold text-neutral-400">Language</th>
                                <th className="p-4 text-sm font-semibold text-neutral-400">Lessons</th>
                                <th className="p-4 text-sm font-semibold text-neutral-400">Price (EUR)</th>
                                <th className="p-4 text-sm font-semibold text-neutral-400">Price (USD)</th>
                                <th className="p-4 text-sm font-semibold text-neutral-400">Price (AED)</th>
                                <th className="p-4 text-sm font-semibold text-neutral-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses?.map(course => (
                                <tr key={course.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-800/30 cursor-pointer" onClick={() => onSelectCourse(course.id)}>
                                    <td className="p-4 min-w-[300px]">
                                        <div className="flex items-center gap-4">
                                            <img src={course.coverImageUrl || ''} alt={course.title} className="w-24 h-14 rounded-md object-cover" />
                                            <span className="font-semibold text-white">{course.title}</span>
                                        </div>
                                    </td>
                                    <td className="p-4"><LanguageBadge lang={course.language} /></td>
                                    <td className="p-4 text-neutral-300 text-center">{course.totalVideos}</td>
                                    <td className="p-4 text-white font-mono">{formatPrice(course.priceEur, 'EUR')}</td>
                                    <td className="p-4 text-white font-mono">{formatPrice(course.priceUsd, 'USD')}</td>
                                    <td className="p-4 text-white font-mono">{formatPrice(course.priceAed, 'AED')}</td>
                                    <td className="p-4">
                                        <button onClick={(e) => { e.stopPropagation(); onSelectCourse(course.id); }} className="p-2 text-neutral-400 hover:text-white"><FaEdit /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </GlassCard>
    );
};

// --- TOP AFFILIATES LIST ---
export const NewTopAffiliates: FC = () => {
    const { t } = useTranslation();
    const { data: affiliates, isLoading } = useAffiliateLeaderboard();

    const getTierIcon = (index: number) => {
        if (index === 0) return <FaTrophy className="text-yellow-400" />;
        if (index === 1) return <FaTrophy className="text-gray-300" />;
        if (index === 2) return <FaTrophy className="text-yellow-600" />;
        return <span className="text-neutral-500 font-semibold">{index + 1}</span>;
    };

    return (
        <DashboardCard>
            <h2 className="text-lg font-semibold text-white mb-4">{t('adminPage.topAffiliates.title', 'Top Affiliates')}</h2>
            {isLoading ? <p className="text-center text-neutral-500 py-8">{t('adminPage.common.loading')}</p> : (
                <ul className="space-y-3">
                    {affiliates?.map((affiliate, index) => (
                        <li key={affiliate.id} className="flex items-center gap-4 p-3 hover:bg-neutral-800/50 rounded-lg">
                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold text-white">{getTierIcon(index)}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{affiliate.name}</p>
                                <p className="text-xs text-neutral-400 truncate">{affiliate.email}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-bold text-green-400 flex items-center justify-end gap-1.5">{affiliate.payingReferrals} <FaCheckCircle size={12} /></p>
                                <p className="text-xs text-neutral-400">{t('adminPage.topAffiliates.payingReferrals', 'Paying Referrals')}</p>
                            </div>
                        </li>
                    ))}
                    {(!affiliates || affiliates.length === 0) && <p className="text-center text-neutral-500 py-8">{t('adminPage.topAffiliates.noAffiliates')}</p>}
                </ul>
            )}
        </DashboardCard>
    );
};