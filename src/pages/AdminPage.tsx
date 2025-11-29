// src/pages/AdminPage.tsx

import React, { useState, type FC, useMemo, useEffect } from 'react';
import {
    useAdminDashboardStats, useAdminCourses, useCreateCourse, useAdminCourseDetails,
    useCreateSection, useAddVideoToSection, useDeleteCourse, useDeleteSection, useDeleteVideo,
    useUpdateSection, useUpdateVideo, useUpdateVideoOrder, useUpdateCourse, useGetSettings, useUpdateSettings, useAffiliateLeaderboard,type AdminCourse , useGetMembershipPrices, useUpdateMembershipPrices,type PricingGrid
} from '../hooks/useAdmin';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import {
    FaUsers, FaUserPlus, FaEuroSign, FaVideo, FaBoxOpen, FaUpload,
    FaTimes, FaPlus, FaFileImage, FaChevronLeft, FaFilm, FaBook, FaEdit, FaTrash, FaBars as FaDragHandle,
    FaGraduationCap, FaChartLine, FaCog, FaTrophy, FaCheckCircle
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// --- PRESERVED ORIGINAL COMPONENTS ---
const GlassCard: FC<{ children: React.ReactNode; className?: string; padding?: string }> = ({ children, className = '', padding = 'p-6' }) => (<div className={`relative overflow-hidden border border-neutral-800 rounded-3xl transition-all duration-300 ${className}`} style={{ background: 'rgba(255, 255, 255, 0.05)' }}><div className={`relative ${padding}`} style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%,rgba(0, 0, 0, 0) 50%,rgba(255, 255, 255, 0.05) 100%)' }}>{children}</div></div>);
const StatCard: FC<{ icon: React.ReactNode; value: string; label: string; change?: string; }> = ({ icon, value, label, change }) => (<GlassCard padding="p-5"><div className="flex justify-between items-start"><div className="bg-[#1C1E22] border border-neutral-700 w-10 h-10 flex items-center justify-center rounded-xl text-neutral-400">{icon}</div>{change && <span className="text-xs font-semibold text-green-400 flex items-center gap-1">↑ {change}</span>}</div><p className="text-4xl font-bold text-white mt-4">{value}</p><p className="text-neutral-400 text-sm mt-1">{label}</p></GlassCard>);
const DashboardCard: FC<{ children: React.ReactNode; className?: string; }> = ({ children, className = '' }) => (<div className={`bg-[#1C1E22] border border-neutral-800 rounded-2xl p-6 ${className}`}>{children}</div>);
const SmallStatCard: FC<{ icon: React.ReactNode; value: string; label: string; }> = ({ icon, value, label }) => (<DashboardCard><div className="flex justify-between items-center text-neutral-400">{icon}</div><p className="text-3xl font-bold text-white mt-3">{value}</p><p className="text-sm text-neutral-400">{label}</p></DashboardCard>);


// --- NEW COMPONENT: Membership Pricing Manager ---
const MembershipPricingManager: FC = () => {
    const { t } = useTranslation();
    const { data: initialPrices, isLoading } = useGetMembershipPrices();
    const { mutate: savePrices, isPending } = useUpdateMembershipPrices();
    
    // Local state for editing
    const [grid, setGrid] = useState<PricingGrid | null>(null);

    // Sync state when data loads
    useEffect(() => {
        if (initialPrices) {
            setGrid(initialPrices);
        }
    }, [initialPrices]);

    const handlePriceChange = (installments: '1'|'2'|'3', currency: 'eur'|'usd'|'aed', value: string) => {
        if (!grid) return;
        setGrid({
            ...grid,
            [installments]: {
                ...grid[installments],
                [currency]: Number(value)
            }
        });
    };

    const handleSave = () => {
        if (grid) savePrices(grid);
    };

    if (isLoading) return (
        <DashboardCard>
            <p className="text-neutral-500 text-center py-10">{t('adminMembership.loading')}</p>
        </DashboardCard>
    );
    
    if (!grid) return null;

    return (
        <DashboardCard>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FaEuroSign /> {t('adminMembership.title')}
                    </h2>
                    <p className="text-sm text-neutral-400">
                        {t('adminMembership.subtitle')}
                    </p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={isPending}
                    className="px-6 py-2.5 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
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
                        {/* Row 1: Lifetime */}
                        <tr className="border-b border-neutral-800 bg-white/5 hover:bg-white/10 transition-colors">
                            <td className="p-4">
                                <div className="font-bold flex items-center gap-2">
                                    {t('adminMembership.table.lifetime')}
                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">1x</span>
                                </div>
                                <div className="text-xs text-neutral-400 mt-1">{t('adminMembership.table.lifetimeSub')}</div>
                            </td>
                            <td className="p-4">
                                <input type="number" value={grid['1'].eur} onChange={(e) => handlePriceChange('1', 'eur', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-10 px-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" />
                            </td>
                            <td className="p-4">
                                <input type="number" value={grid['1'].usd} onChange={(e) => handlePriceChange('1', 'usd', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-10 px-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" />
                            </td>
                            <td className="p-4">
                                <input type="number" value={grid['1'].aed} onChange={(e) => handlePriceChange('1', 'aed', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-10 px-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" />
                            </td>
                        </tr>

                        {/* Row 2: 2-Split */}
                        <tr className="border-b border-neutral-800 hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <div className="font-bold">{t('adminMembership.table.split2')}</div>
                                <div className="text-xs text-blue-400 mt-1">{t('adminMembership.table.split2Sub')}</div>
                            </td>
                            <td className="p-4">
                                <input type="number" value={grid['2'].eur} onChange={(e) => handlePriceChange('2', 'eur', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-10 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                            </td>
                            <td className="p-4">
                                <input type="number" value={grid['2'].usd} onChange={(e) => handlePriceChange('2', 'usd', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-10 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                            </td>
                            <td className="p-4">
                                <input type="number" value={grid['2'].aed} onChange={(e) => handlePriceChange('2', 'aed', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-10 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                            </td>
                        </tr>

                        {/* Row 3: 3-Split */}
                        <tr className="border-b border-neutral-800 hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <div className="font-bold">{t('adminMembership.table.split3')}</div>
                                <div className="text-xs text-purple-400 mt-1">{t('adminMembership.table.split3Sub')}</div>
                            </td>
                            <td className="p-4">
                                <input type="number" value={grid['3'].eur} onChange={(e) => handlePriceChange('3', 'eur', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-10 px-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" />
                            </td>
                            <td className="p-4">
                                <input type="number" value={grid['3'].usd} onChange={(e) => handlePriceChange('3', 'usd', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-10 px-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" />
                            </td>
                            <td className="p-4">
                                <input type="number" value={grid['3'].aed} onChange={(e) => handlePriceChange('3', 'aed', e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg h-10 px-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </DashboardCard>
    );
};
// --- PRESERVED MODAL AND DETAIL VIEW COMPONENTS ---
const UploadCourseModal: FC<{ show: boolean; onClose: () => void }> = ({ show, onClose }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priceEur, setPriceEur] = useState('');
    const [priceUsd, setPriceUsd] = useState('');
    const [priceAed, setPriceAed] = useState('');
    const [language, setLanguage] = useState('EN');
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { mutate: createCourse, isPending } = useCreateCourse();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !coverImageFile) { toast.error(t('adminPage.toasts.titleAndImageRequired')); return; }
        setIsUploading(true);
        const uploadToast = toast.loading('Uploading image...');
        const formData = new FormData();
        formData.append('file', coverImageFile);
        formData.append('upload_preset', 'test2test');
        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dw2d5lgfk/image/upload', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.secure_url) {
                toast.dismiss(uploadToast);
                const createToast = toast.loading('Creating course...');
                createCourse({
                    title,
                    description,
                    coverImageUrl: data.secure_url,
                    priceEur: Number(priceEur) || undefined,
                    priceUsd: Number(priceUsd) || undefined,
                    priceAed: Number(priceAed) || undefined,
                    language: language,
                }, {
                    onSuccess: () => {
                        toast.dismiss(createToast);
                        toast.success(t('adminPage.toasts.courseCreateSuccess'));
                        setTitle(''); setDescription(''); setPriceEur(''); setPriceUsd(''); setPriceAed(''); setLanguage('EN'); setCoverImageFile(null); onClose();
                    },
                    onError: () => { toast.dismiss(createToast); toast.error(t('adminPage.toasts.courseCreateError')); }
                });
            } else { throw new Error(t('adminPage.toasts.cloudinaryError')); }
        } catch (error) { console.error(error); toast.dismiss(uploadToast); toast.error(t('adminPage.toasts.imageUploadError')); } finally { setIsUploading(false); }
    };

    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative h-[80vh] overflow-scroll border border-neutral-800 rounded-3xl shadow-2xl max-w-2xl w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-6 right-6 z-10 w-8 h-8 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center text-neutral-400"><FaTimes /></button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.uploadCourse.title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.title')}</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.priceEur')}</label>
                                <input type="number" step="0.01" value={priceEur} onChange={e => setPriceEur(e.target.value)} placeholder="e.g., 49.99" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                            </div>
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.priceUsd')}</label>
                                <input type="number" step="0.01" value={priceUsd} onChange={e => setPriceUsd(e.target.value)} placeholder="e.g., 55.00" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                            </div>
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Price (AED)</label>
                                <input type="number" step="0.01" value={priceAed} onChange={e => setPriceAed(e.target.value)} placeholder="e.g., 199.00" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                            </div>
                            <div>
                                <label className="text-sm text-neutral-400 mb-2 block">Language</label>
                                <select
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white"
                                >
                                    <option value="EN">English</option>
                                    <option value="FR">Français</option>
                                    <option value="AR">العربية (Arabic)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.description')}</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg p-4 text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.uploadCourse.coverImage')}</label>
                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-neutral-700 px-6 py-10">
                                <div className="text-center">
                                    <FaFileImage className="mx-auto h-12 w-12 text-neutral-500" />
                                    <div className="mt-4 flex text-sm text-neutral-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-white hover:text-gray-300">
                                            <span>{t('adminPage.modals.uploadCourse.uploadFile')}</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => { if (e.target.files) setCoverImageFile(e.target.files[0]) }} accept="image/*" />
                                        </label>
                                        <p className="pl-1">{t('adminPage.modals.uploadCourse.dragAndDrop')}</p>
                                    </div>
                                    <p className="text-xs text-neutral-500">{t('adminPage.modals.uploadCourse.imageHint')}</p>
                                    {coverImageFile && <p className="text-sm mt-2 text-green-400">{coverImageFile.name}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold">{t('adminPage.modals.common.cancel')}</button>
                            <button type="submit" disabled={isUploading || isPending} className="px-6 py-2.5 rounded-lg bg-gray-200 text-black font-semibold disabled:opacity-50">
                                {(isUploading || isPending) ? t('adminPage.modals.common.loading') : t('adminPage.modals.common.create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
const EditCourseModal: FC<{ show: boolean; onClose: () => void; course: any; }> = ({ show, onClose, course }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [priceEur, setPriceEur] = useState<string | number>('');
    const [priceUsd, setPriceUsd] = useState<string | number>('');
    const [priceAed, setPriceAed] = useState<string | number>('');
    const [language, setLanguage] = useState<string>('EN');
    const { mutate: updateCourse, isPending } = useUpdateCourse();
    useEffect(() => { if (course) { setTitle(course.title || ''); setDescription(course.description || ''); setPriceEur(course.priceEur ?? '');setPriceUsd(course.priceUsd ?? ''); setPriceAed(course.priceAed ?? ''); setLanguage(course.language ?? 'EN'); } }, [course]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); updateCourse({ courseId: course.id, data: { title, description, priceEur: Number(priceEur), priceUsd: Number(priceUsd), priceAed: Number(priceAed), language } }, { onSuccess: onClose }); };
    if (!show) return null;
    return (<div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}><div className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}><div className="p-8"><h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.editCourse.title')}</h2><form onSubmit={handleSubmit} className="space-y-4"><div><label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.title')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" /></div><div><label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.description')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg p-4 text-white" /></div><div><label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.priceEur')}</label><input type="number" step="0.01" value={priceEur} onChange={e => setPriceEur(e.target.value)} placeholder="e.g., 49.99" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" /></div><div><label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.priceUsd')}</label><input type="number" step="0.01" value={priceUsd} onChange={e => setPriceUsd(e.target.value)} placeholder="e.g., 55.00" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" /></div><div><label className="text-sm text-neutral-400 mb-2 block">Price (AED)</label><input type="number" step="0.01" value={priceAed} onChange={e => setPriceAed(e.target.value)} placeholder="e.g., 199.00" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" /></div><div><label className="text-sm text-neutral-400 mb-2 block">Language</label><select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white"><option value="EN">English</option><option value="FR">Français</option><option value="AR">العربية (Arabic)</option></select></div><div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#1C1E22] text-white">{t('adminPage.modals.common.cancel')}</button><button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-lg bg-gray-200 text-black">{isPending ? t('adminPage.modals.common.saving') : t('adminPage.modals.common.update')}</button></div></form></div></div></div>);
};
const AddSectionModal: FC<{ show: boolean; onClose: () => void; courseId: string; }> = ({ show, onClose, courseId }) => { const { t } = useTranslation(); const [title, setTitle] = useState(''); const { mutate: createSection, isPending } = useCreateSection(); const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); createSection({ title, courseId }, { onSuccess: () => { toast.success(t('adminPage.toasts.sectionAdded')); setTitle(''); onClose(); }, onError: () => { toast.error(t('adminPage.toasts.genericError')); } }); }; if (!show) return null; return (<div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}><div className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}><div className="p-8"><h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.addSection.title')}</h2><form onSubmit={handleSubmit} className="space-y-4"><div><label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.title')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" /></div><div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#1C1E22] text-white">{t('adminPage.modals.common.cancel')}</button><button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-lg bg-gray-200 text-black">{t('adminPage.modals.common.add')}</button></div></form></div></div></div>); };
const AddVideoModal: FC<{ show: boolean; onClose: () => void; sectionId: string; courseId: string; }> = ({ show, onClose, sectionId, courseId }) => { const { t } = useTranslation(); const [title, setTitle] = useState(''); const [vimeoId, setVimeoId] = useState(''); const [description, setDescription] = useState(''); const [duration, setDuration] = useState<number | ''>(''); const { mutate: addVideo, isPending } = useAddVideoToSection(); const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); addVideo({ title, vimeoId, description, duration: Number(duration) || undefined, sectionId, courseId }, { onSuccess: () => { toast.success(t('adminPage.toasts.videoAdded')); setTitle(''); setVimeoId(''); setDescription(''); setDuration(''); onClose(); }, onError: () => { toast.error(t('adminPage.toasts.genericError')); } }); }; if (!show) return null; return (<div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}><div className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}><div className="p-8"><h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.addVideo.title')}</h2><form onSubmit={handleSubmit} className="space-y-4"><div><label>{t('adminPage.modals.common.title')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border rounded-lg h-12 px-4 text-white" /></div><div><label>{t('adminPage.modals.common.vimeoId')}</label><input type="text" value={vimeoId} onChange={e => setVimeoId(e.target.value)} required className="w-full bg-[#1C1E22] border rounded-lg h-12 px-4 text-white" /></div><div><label>{t('adminPage.modals.common.description')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-[#1C1E22] border rounded-lg p-4 text-white" /></div><div><label>{t('adminPage.modals.common.duration')}</label><input type="number" value={duration} onChange={e => setDuration(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#1C1E22] border rounded-lg h-12 px-4 text-white" /></div><div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose}>{t('adminPage.modals.common.cancel')}</button><button type="submit" disabled={isPending}>{t('adminPage.modals.common.add')}</button></div></form></div></div></div>); };
const EditSectionModal: FC<{ show: boolean; onClose: () => void; section: any; courseId: string; }> = ({ show, onClose, section, courseId }) => { const { t } = useTranslation(); const [title, setTitle] = useState(''); const { mutate: updateSection, isPending } = useUpdateSection(); useEffect(() => { if (section) setTitle(section.title); }, [section]); const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); updateSection({ sectionId: section.id, courseId, data: { title } }, { onSuccess: onClose }); }; if (!show) return null; return (<div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}><div className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}><div className="p-8"><h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.editSection.title')}</h2><form onSubmit={handleSubmit} className="space-y-4"><div><label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.title')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" /></div><div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#1C1E22] text-white">{t('adminPage.modals.common.cancel')}</button><button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-lg bg-gray-200 text-black">{isPending ? t('adminPage.modals.common.saving') : t('adminPage.modals.common.update')}</button></div></form></div></div></div>); };
const EditVideoModal: FC<{ show: boolean; onClose: () => void; video: any; courseId: string; }> = ({ show, onClose, video, courseId }) => { const { t } = useTranslation(); const [title, setTitle] = useState(''); const [vimeoId, setVimeoId] = useState(''); const { mutate: updateVideo, isPending } = useUpdateVideo(); useEffect(() => { if (video) { setTitle(video.title); setVimeoId(video.vimeoId); } }, [video]); const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); updateVideo({ videoId: video.id, courseId, data: { title, vimeoId } }, { onSuccess: onClose }); }; if (!show) return null; return (<div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}><div className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}><div className="p-8"><h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.editVideo.title')}</h2><form onSubmit={handleSubmit} className="space-y-4"><div><label>{t('adminPage.modals.common.title')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border rounded-lg h-12 px-4 text-white" /></div><div><label>{t('adminPage.modals.common.vimeoId')}</label><input type="text" value={vimeoId} onChange={e => setVimeoId(e.target.value)} required className="w-full bg-[#1C1E22] border rounded-lg h-12 px-4 text-white" /></div><div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose}>{t('adminPage.modals.common.cancel')}</button><button type="submit" disabled={isPending}>{isPending ? t('adminPage.modals.common.saving') : t('adminPage.modals.common.update')}</button></div></form></div></div></div>); };
const AdminCourseDetailView: FC<{ courseId: string, onBack: () => void }> = ({ courseId, onBack }) => { const { t } = useTranslation(); const { data: course, isLoading, isError } = useAdminCourseDetails(courseId); const { mutate: deleteCourse } = useDeleteCourse(); const { mutate: deleteSection } = useDeleteSection(); const { mutate: deleteVideo } = useDeleteVideo(); const { mutate: updateVideoOrder } = useUpdateVideoOrder(); const [modal, setModal] = useState<{ type: 'addSection' | 'addVideo' | 'editSection' | 'editVideo' | 'editCourse', data?: any } | null>(null); const onDragEnd = (result: DropResult) => { const { source, destination } = result; if (!destination) return; const sourceSectionId = source.droppableId; const destSectionId = destination.droppableId; const sourceSection = course?.sections.find(s => s.id === sourceSectionId); if (!sourceSection) return; if (sourceSectionId === destSectionId) { const newVideos = Array.from(sourceSection.videos); const [movedVideo] = newVideos.splice(source.index, 1); newVideos.splice(destination.index, 0, movedVideo); const updatedOrder = newVideos.map((video, index) => ({ id: video.id, order: index })); updateVideoOrder({ sectionId: sourceSectionId, courseId, videos: updatedOrder }); } else { toast.error(t('adminPage.toasts.dndError')); } }; const handleDeleteCourse = () => { if (window.confirm(t('adminPage.confirm.deleteCourse'))) { deleteCourse(courseId, { onSuccess: onBack }); } }; const handleDeleteSection = (sectionId: string) => { if (window.confirm(t('adminPage.confirm.deleteSection'))) { deleteSection({ sectionId, courseId }); } }; const handleDeleteVideo = (videoId: string) => { if (window.confirm(t('adminPage.confirm.deleteVideo'))) { deleteVideo({ videoId, courseId }); } }; if (isLoading) return <p className="text-center p-10 text-neutral-400">{t('adminPage.common.loading')}</p>; if (isError) return <p className="text-center p-10 text-red-500">{t('adminPage.common.error')}</p>; return (<div>{modal?.type === 'addSection' && <AddSectionModal show={true} onClose={() => setModal(null)} courseId={courseId} />}{modal?.type === 'addVideo' && <AddVideoModal show={true} onClose={() => setModal(null)} sectionId={modal.data.sectionId} courseId={courseId} />}{modal?.type === 'editSection' && <EditSectionModal show={true} onClose={() => setModal(null)} section={modal.data} courseId={courseId} />}{modal?.type === 'editVideo' && <EditVideoModal show={true} onClose={() => setModal(null)} video={modal.data} courseId={courseId} />}{modal?.type === 'editCourse' && <EditCourseModal show={true} onClose={() => setModal(null)} course={course} />}<button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6"><FaChevronLeft /> {t('adminPage.courseDetail.back')}</button><div className="flex items-start gap-6"><img src={course?.coverImageUrl || ''} alt={course?.title} className="w-48 h-auto rounded-2xl object-cover" /><div className="flex-1"><h2 className="text-3xl font-bold text-white">{course?.title}</h2><p className="text-neutral-400 mt-2">{course?.description}</p><div className="flex items-center gap-2 mt-4"><button onClick={() => setModal({ type: 'addSection' })} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold hover:bg-neutral-800"> <FaPlus /> {t('adminPage.courseDetail.addSection')} </button><button onClick={() => setModal({ type: 'editCourse' })} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-neutral-800/50 border border-neutral-700 text-neutral-300 font-semibold hover:bg-neutral-800"> <FaEdit /> {t('adminPage.courseDetail.edit')} </button><button onClick={handleDeleteCourse} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-900/40"> <FaTrash /> {t('adminPage.courseDetail.delete')} </button></div></div></div><div className="mt-10 space-y-6"><DragDropContext onDragEnd={onDragEnd}>{course?.sections.map(section => (<GlassCard key={section.id} padding="p-5"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white flex items-center gap-3"><FaBook className="text-neutral-500" />{section.title}</h3><div className="flex items-center gap-2"><button onClick={() => setModal({ type: 'addVideo', data: { sectionId: section.id } })} className="text-xs rounded-lg bg-[#111317] border border-neutral-700 text-neutral-300 font-semibold hover:bg-neutral-800 p-2"><FaPlus /></button><button onClick={() => setModal({ type: 'editSection', data: section })} className="text-xs rounded-lg bg-[#111317] border border-neutral-700 text-neutral-300 font-semibold hover:bg-neutral-800 p-2"><FaEdit /></button><button onClick={() => handleDeleteSection(section.id)} className="text-xs rounded-lg bg-[#111317] border border-neutral-700 text-red-400 font-semibold hover:bg-neutral-800 p-2"><FaTrash /></button></div></div><Droppable droppableId={section.id}>{(provided) => (<ul className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>{section.videos.map((video, index) => (<Draggable key={video.id} draggableId={video.id} index={index}>{(provided) => (<li ref={provided.innerRef} {...provided.draggableProps} className="group flex items-center gap-4 p-3 bg-[#111317] rounded-lg"><div {...provided.dragHandleProps} className="text-neutral-500 cursor-grab p-2 -ml-2"><FaDragHandle /></div><FaFilm className="text-neutral-500 flex-shrink-0" /><span className="text-white flex-1 truncate">{video.title}</span><span className="text-xs text-neutral-400">ID: {video.vimeoId}</span><div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setModal({ type: 'editVideo', data: video })} className="p-1 text-neutral-400 hover:text-white"><FaEdit size={12} /></button><button onClick={() => handleDeleteVideo(video.id)} className="p-1 text-neutral-400 hover:text-red-400"><FaTrash size={12} /></button></div></li>)}</Draggable>))}{provided.placeholder}{section.videos.length === 0 && <p className="text-center text-sm text-neutral-500 py-4">{t('adminPage.courseDetail.noVideos')}</p>}</ul>)}</Droppable></GlassCard>))}{course?.sections.length === 0 && <p className="text-center text-neutral-500 py-10">{t('adminPage.courseDetail.noSections')}</p>}</DragDropContext></div></div>); };

// --- MODIFIED & NEW COMPONENTS ---
const NewMonthlyRevenue: FC<{ data: { name: string, value: number }[] }> = ({ data }) => {
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

const PlatformSettings: FC = () => {
    const { t } = useTranslation();
    const { data: settings, isLoading: isLoadingSettings } = useGetSettings();
    const { mutate: updateSettings, isPending: isUpdatingSettings } = useUpdateSettings();
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

    if (isLoadingSettings) {
        return <DashboardCard><p className="text-neutral-500">{t('adminPage.platformSettings.loading')}</p></DashboardCard>;
    }

    return (
        <DashboardCard>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4"><FaCog /> {t('adminPage.platformSettings.title')}</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.platformSettings.discountRateLabel', 'Affiliate Reward Discount (%)')}</label>
                    <input
                        type="number"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        className="w-full bg-[#111317] border border-neutral-700 rounded-lg h-12 px-4 text-white"
                        placeholder={t('adminPage.platformSettings.commissionRatePlaceholder', 'e.g., 50')}
                    />
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

const NewCourseManagement: FC<{ onUpload: () => void; onSelectCourse: (id: string) => void; }> = ({ onUpload, onSelectCourse }) => {
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

const NewTopAffiliates: FC = () => {
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