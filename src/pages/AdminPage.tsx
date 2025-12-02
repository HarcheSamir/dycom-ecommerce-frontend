import React, { useState, useMemo, type FC } from 'react';
import { useAdminDashboardStats } from '../hooks/useAdmin';
import { FaUsers, FaUserPlus, FaEuroSign, FaVideo, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Components
import { StatCard, SmallStatCard } from '../components/admin/AdminUI';
import { UploadCourseModal } from '../components/admin/AdminModals';
import {
    MembershipPricingManager, NewMonthlyRevenue, NewTopAffiliates,
    PlatformSettings, NewCourseManagement
} from '../components/admin/AdminDashboardWidgets';
import { AdminCourseDetailView } from '../components/admin/AdminCourseDetailView';

export const AdminPage: FC = () => {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const { data: stats, isLoading: isLoadingStats } = useAdminDashboardStats();
    const chartData = useMemo(() => stats?.monthlyRevenueChart ? Object.entries(stats.monthlyRevenueChart).map(([name, value]) => ({ name, value })).slice(-6) : [], [stats]);

    const renderContent = () => {
        if (selectedCourseId) {
            return <AdminCourseDetailView courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />;
        }
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-white">{t('adminPage.title')}</h1>
                    <p className="text-neutral-400 mt-1">{t('adminPage.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<FaUsers />} value={isLoadingStats ? '...' : stats?.activeSubscribers.toLocaleString(locale) || '0'} label={t('adminPage.stats.activeSubscribers')} />
                    <StatCard icon={<FaUserPlus />} value={isLoadingStats ? '...' : stats?.totalUsers.toLocaleString(locale) || '0'} label={t('adminPage.stats.totalUsers')} />
                    <StatCard icon={<FaEuroSign />} value={isLoadingStats ? '...' : `$${Math.round(stats?.monthlyRevenue || 0).toLocaleString(locale)}`} label={t('adminPage.stats.monthlyRevenue')} />
                    <StatCard icon={<FaVideo />} value={isLoadingStats ? '...' : stats?.totalVideos.toLocaleString(locale) || '0'} label={t('adminPage.stats.publishedVideos')} />
                </div>
                <div className="flex flex-col gap-8">
                    <MembershipPricingManager />
                    <NewCourseManagement onUpload={() => setIsUploadModalOpen(true)} onSelectCourse={setSelectedCourseId} />
                    <NewMonthlyRevenue data={chartData} />
                    <NewTopAffiliates />
                    <PlatformSettings />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SmallStatCard icon={<FaGraduationCap size={20} />} value={isLoadingStats ? '...' : stats?.totalCourses.toLocaleString(locale) || '0'} label={t('adminPage.stats.availableCourses')} />
                    <SmallStatCard icon={<FaUsers size={20} />} value={isLoadingStats ? '...' : stats?.totalInfluencers.toLocaleString(locale) || '0'} label={t('adminPage.stats.activeInfluencers')} />
                    <SmallStatCard icon={<FaChartLine size={20} />} value={isLoadingStats ? '...' : stats?.totalProducts.toLocaleString(locale) || '0'} label={t('adminPage.stats.trendingProducts')} />
                </div>
            </div>
        );
    };

    return (
        <>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#1C1E22', color: '#fff', border: '1px solid #374151' } }} />
            <UploadCourseModal show={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
            <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#111317] text-white">
                {renderContent()}
            </main>
        </>
    );
};