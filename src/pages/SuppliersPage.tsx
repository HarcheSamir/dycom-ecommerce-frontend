// src/pages/SuppliersPage.tsx

import React, { useState, type FC, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { AxiosResponse } from 'axios';
import { FaStore, FaStar, FaExternalLinkAlt, FaSearch, FaSortAmountDown, FaChevronDown, FaFileCsv } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// --- Type Definitions ---
interface Supplier {
    shopId: string;
    shopName: string;
    shopUrl: string | null;
    shopEvaluationRate: string | null;
    productCount: number;
    maxSales: number | null;
}

interface SuppliersResponse {
    data: Supplier[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

interface SupplierFilters {
    page: number;
    limit: number;
    keyword: string;
    sortBy: 'productCount_desc' | 'maxSales_desc';
}

// --- Data Fetching Hook ---
const useSuppliers = (filters: SupplierFilters) => {
    return useQuery<SuppliersResponse, Error>({
        queryKey: ['suppliers', filters],
        queryFn: async () => {
            const response: AxiosResponse<SuppliersResponse> = await apiClient.get('/winning-products/suppliers', {
                params: filters
            });
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });
};

// --- Reusable Components ---
const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (
    <div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
        <div className={`relative flex flex-col h-full ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>
            {children}
        </div>
    </div>
);

const SupplierCard: FC<{ supplier: Supplier }> = ({ supplier }) => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';

    return (
        <GlassCard padding="p-5" className="hover:-translate-y-1">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[#1C1E22] border border-neutral-700">
                    <FaStore className="text-neutral-400" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{supplier.shopName}</h3>
                    {supplier.shopEvaluationRate && (
                        <span className="flex items-center gap-1.5 text-sm text-yellow-400 font-semibold">
                            <FaStar size={12} /> {supplier.shopEvaluationRate}
                        </span>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 my-5 text-center">
                <div className="border border-neutral-800 rounded-xl p-3 bg-neutral-900/50">
                    <p className="text-2xl font-bold text-white">{supplier.productCount}</p>
                    <p className="text-xs text-neutral-400">{t('suppliersPage.productsInCatalog')}</p>
                </div>
                <div className="border border-neutral-800 rounded-xl p-3 bg-neutral-900/50">
                    <p className="text-2xl font-bold text-white">{supplier.maxSales?.toLocaleString(locale) ?? 'N/A'}</p>
                    <p className="text-xs text-neutral-400">{t('suppliersPage.highestSales')}</p>
                </div>
            </div>
            {supplier.shopUrl && (
                <a href={supplier.shopUrl} target="_blank" rel="noopener noreferrer" className="flex mt-auto items-center justify-center gap-2 w-full h-11 rounded-lg text-sm font-semibold bg-[#1C1E22] border border-neutral-700 text-white hover:bg-neutral-800 transition-colors">
                    <FaExternalLinkAlt size={12}/>
                    {t('suppliersPage.viewSupplierStore')}
                </a>
            )}
        </GlassCard>
    );
};

// --- Main Suppliers Page ---
export const SuppliersPage: FC = () => {
    const { t } = useTranslation();
    const [filters, setFilters] = useState<SupplierFilters>({ page: 1, limit: 12, sortBy: 'productCount_desc', keyword: '' });
    const [tempKeyword, setTempKeyword] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const { data: response, isLoading, isError } = useSuppliers(filters);

    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters(prev => ({ ...prev, keyword: tempKeyword, page: 1 }));
        }, 500);
        return () => clearTimeout(handler);
    }, [tempKeyword]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, sortBy: e.target.value as SupplierFilters['sortBy'], page: 1 }));
    };

    const suppliers = response?.data ?? [];
    const meta = response?.meta;

    // *** THIS IS THE FIX: The new function to handle the authenticated download ***
    const handleExport = async () => {
        setIsExporting(true);
        toast.loading('Exporting data...');
        try {
            const response = await apiClient.get('/winning-products/suppliers/export', {
                responseType: 'blob', // This is crucial
            });

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'suppliers.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            toast.dismiss();
            toast.success('Export successful!');

        } catch (err) {
            toast.dismiss();
            toast.error('Export failed. Please try again.');
            console.error(err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white">{t('suppliersPage.title')}</h1>
                    <p className="text-neutral-400 mt-1">{t('suppliersPage.subtitle')}</p>
                </div>
                {/* *** THIS IS THE FIX: Replaced <a> tag with a <button> *** */}
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-shrink-0 flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-gray-200 text-sm font-semibold text-black hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                    <FaFileCsv />
                    {isExporting ? 'Exporting...' : t('suppliersPage.exportButton')}
                </button>
            </div>

            <GlassCard padding="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative md:col-span-2">
                        <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                        <input type="text" placeholder={t('suppliersPage.filters.keywordPlaceholder')} value={tempKeyword} onChange={(e) => setTempKeyword(e.target.value)} className="w-full bg-[#111317] border border-neutral-700 rounded-lg h-12 pl-11 pr-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-gray-400" />
                    </div>
                    <div className="relative">
                        <FaSortAmountDown className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-500" />
                        <select className="w-full appearance-none pl-10 pr-4 h-12 rounded-lg border-0 bg-[#111317] border-neutral-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-400" value={filters.sortBy} onChange={handleSortChange}>
                            <option value="productCount_desc">{t('suppliersPage.filters.sortBy.products')}</option>
                            <option value="maxSales_desc">{t('suppliersPage.filters.sortBy.sales')}</option>
                        </select>
                        <FaChevronDown className="absolute top-1/2 right-4 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                    </div>
                </div>
            </GlassCard>

            <section>
                {isLoading && <p className="text-center text-neutral-400 py-10">Loading suppliers...</p>}
                {isError && <p className="text-center text-red-500 py-10">Error loading suppliers.</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {!isLoading && suppliers.map((supplier) => (
                        <SupplierCard key={supplier.shopId} supplier={supplier} />
                    ))}
                </div>
                {!isLoading && suppliers.length === 0 && <p className="text-center text-neutral-500 py-10">No suppliers found.</p>}
            </section>

            {meta && meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-10">
                    <button onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))} disabled={meta.page <= 1} className="px-4 py-2 rounded-lg bg-[#1C1E22] text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed">{t('winningProductsPage.pagination.previous')}</button>
                    <span className="text-sm text-neutral-400">{t('winningProductsPage.pagination.pageInfo', { page: meta.page, totalPages: meta.totalPages })}</span>
                    <button onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))} disabled={meta.page >= meta.totalPages} className="px-4 py-2 rounded-lg bg-[#1C1E22] text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed">{t('winningProductsPage.pagination.next')}</button>
                </div>
            )}
        </main>
    );
};