import React, { useState, useEffect, type FC } from 'react';
import {
    useCreateCourse, useCreateSection, useAddVideoToSection,
    useUpdateSection, useUpdateVideo, useUpdateCourse
} from '../../hooks/useAdmin';
import { FaTimes, FaFileImage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// --- UPLOAD COURSE MODAL ---
export const UploadCourseModal: FC<{ show: boolean; onClose: () => void }> = ({ show, onClose }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isFree, setIsFree] = useState(true);
    const [priceEur, setPriceEur] = useState('');
    const [priceUsd, setPriceUsd] = useState('');
    const [priceAed, setPriceAed] = useState('');
    const [language, setLanguage] = useState('EN');
    const [category, setCategory] = useState<'MAIN' | 'ARCHIVE'>('MAIN');
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { mutate: createCourse, isPending } = useCreateCourse();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !coverImageFile) { toast.error(t('adminPage.toasts.titleAndImageRequired')); return; }
        setIsUploading(true);
        // TRANSLATION APPLIED
        const uploadToast = toast.loading(t('adminPage.toasts.uploadingImage'));
        const formData = new FormData();
        formData.append('file', coverImageFile);
        formData.append('upload_preset', 'test2test');
        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dw2d5lgfk/image/upload', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.secure_url) {
                toast.dismiss(uploadToast);
                // TRANSLATION APPLIED
                const createToast = toast.loading(t('adminPage.toasts.creatingCourse'));

                createCourse({
                    title,
                    description,
                    coverImageUrl: data.secure_url,
                    priceEur: isFree ? 0 : (Number(priceEur) || 0),
                    priceUsd: isFree ? 0 : (Number(priceUsd) || 0),
                    priceAed: isFree ? 0 : (Number(priceAed) || 0),
                    language: language,
                    category: category,
                }, {
                    onSuccess: () => {
                        toast.dismiss(createToast);
                        toast.success(t('adminPage.toasts.courseCreateSuccess'));
                        setTitle('');
                        setDescription('');
                        setPriceEur('');
                        setPriceUsd('');
                        setPriceAed('');
                        setLanguage('EN');
                        setCategory('MAIN');
                        setCoverImageFile(null);
                        setIsFree(true);
                        onClose();
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
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1C1E22] border border-neutral-700">
                            <input
                                type="checkbox"
                                id="isFree"
                                checked={isFree}
                                onChange={(e) => setIsFree(e.target.checked)}
                                className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-neutral-900"
                            />
                            {/* TRANSLATION APPLIED */}
                            <label htmlFor="isFree" className="text-white font-medium cursor-pointer select-none">
                                {t('adminPage.modals.uploadCourse.isFreeLabel')}
                            </label>
                        </div>
                        {!isFree && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-[fadeIn-up_0.3s_ease-out]">
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.priceEur')}</label>
                                    <input type="number" step="0.01" value={priceEur} onChange={e => setPriceEur(e.target.value)} placeholder="49.99" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.priceUsd')}</label>
                                    <input type="number" step="0.01" value={priceUsd} onChange={e => setPriceUsd(e.target.value)} placeholder="55.00" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                                </div>
                                <div>
                                    {/* TRANSLATION APPLIED */}
                                    <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.priceAed')}</label>
                                    <input type="number" step="0.01" value={priceAed} onChange={e => setPriceAed(e.target.value)} placeholder="199.00" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                {/* TRANSLATION APPLIED */}
                                <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.language')}</label>
                                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white">
                                    <option value="EN">English</option>
                                    <option value="FR">Français</option>
                                    <option value="AR">العربية (Arabic)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.category')}</label>
                            <select value={category} onChange={e => setCategory(e.target.value as 'MAIN' | 'ARCHIVE')} className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white">
                                <option value="MAIN">{t('adminPage.modals.common.main')}</option>
                                <option value="ARCHIVE">{t('adminPage.modals.common.archive')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.description')}</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg p-4 text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.uploadCourse.coverImage')}</label>
                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-neutral-700 px-6 py-10 hover:border-neutral-500 transition-colors">
                                <div className="text-center">
                                    <FaFileImage className="mx-auto h-12 w-12 text-neutral-500" />
                                    <div className="mt-4 flex text-sm text-neutral-400 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-white hover:text-gray-300">
                                            <span>{t('adminPage.modals.uploadCourse.uploadFile')}</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => { if (e.target.files) setCoverImageFile(e.target.files[0]) }} accept="image/*" />
                                        </label>
                                        <p className="pl-1">{t('adminPage.modals.uploadCourse.dragAndDrop')}</p>
                                    </div>
                                    <p className="text-xs text-neutral-500">{t('adminPage.modals.uploadCourse.imageHint')}</p>
                                    {coverImageFile && <p className="text-sm mt-2 text-green-400 font-bold">{coverImageFile.name}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#1C1E22] border border-neutral-700 text-white font-semibold hover:bg-neutral-800 transition-colors">{t('adminPage.modals.common.cancel')}</button>
                            <button type="submit" disabled={isUploading || isPending} className="px-6 py-2.5 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
                                {(isUploading || isPending) ? t('adminPage.modals.common.loading') : t('adminPage.modals.common.create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- EDIT COURSE MODAL ---
export const EditCourseModal: FC<{ show: boolean; onClose: () => void; course: any; }> = ({ show, onClose, course }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isFree, setIsFree] = useState(false);
    const [priceEur, setPriceEur] = useState<string | number>('');
    const [priceUsd, setPriceUsd] = useState<string | number>('');
    const [priceAed, setPriceAed] = useState<string | number>('');
    const [language, setLanguage] = useState<string>('EN');
    const [category, setCategory] = useState<'MAIN' | 'ARCHIVE'>('MAIN');

    // --- NEW: Image Upload State ---
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    // -------------------------------

    const { mutate: updateCourse, isPending } = useUpdateCourse();

    useEffect(() => {
        if (course) {
            setTitle(course.title || '');
            setDescription(course.description || '');
            setPriceEur(course.priceEur ?? '');
            setPriceUsd(course.priceUsd ?? '');
            setPriceAed(course.priceAed ?? '');
            setLanguage(course.language ?? 'EN');
            setCategory(course.category ?? 'MAIN');
            const currentlyFree = (course.priceEur === 0 || course.priceEur === null) &&
                (course.priceUsd === 0 || course.priceUsd === null) &&
                (course.priceAed === 0 || course.priceAed === null);
            setIsFree(currentlyFree);
        }
    }, [course]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalCoverImageUrl = course.coverImageUrl;

        // --- NEW: Upload Image Logic (if file selected) ---
        if (coverImageFile) {
            setIsUploading(true);
            const uploadToast = toast.loading(t('adminPage.toasts.uploadingImage'));
            const formData = new FormData();
            formData.append('file', coverImageFile);
            formData.append('upload_preset', 'test2test'); // Same preset as upload modal

            try {
                const response = await fetch('https://api.cloudinary.com/v1_1/dw2d5lgfk/image/upload', { method: 'POST', body: formData });
                const data = await response.json();
                if (data.secure_url) {
                    finalCoverImageUrl = data.secure_url;
                    toast.dismiss(uploadToast);
                } else {
                    toast.dismiss(uploadToast);
                    toast.error(t('adminPage.toasts.cloudinaryError'));
                    setIsUploading(false);
                    return; // Stop if upload fails
                }
            } catch (err) {
                console.error(err);
                toast.dismiss(uploadToast);
                toast.error(t('adminPage.toasts.imageUploadError'));
                setIsUploading(false);
                return;
            }
        }
        // ------------------------------------------------

        updateCourse({
            courseId: course.id,
            data: {
                title,
                description,
                priceEur: isFree ? 0 : Number(priceEur),
                priceUsd: isFree ? 0 : Number(priceUsd),
                priceAed: isFree ? 0 : Number(priceAed),
                language,
                category,
                coverImageUrl: finalCoverImageUrl // Pass the new (or old) URL
            }
        }, {
            onSuccess: () => {
                setIsUploading(false);
                onClose();
            },
            onError: () => setIsUploading(false)
        });
    };

    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="relative h-[80vh] overflow-scroll border border-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.editCourse.title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.title')}</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1C1E22] border border-neutral-700">
                            <input
                                type="checkbox"
                                id="isFreeEdit"
                                checked={isFree}
                                onChange={(e) => setIsFree(e.target.checked)}
                                className="w-5 h-5 rounded border-neutral-600 bg-neutral-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-neutral-900"
                            />
                            <label htmlFor="isFreeEdit" className="text-white font-medium cursor-pointer select-none">
                                {t('adminPage.modals.uploadCourse.isFreeLabel')}
                            </label>
                        </div>
                        {!isFree && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-[fadeIn-up_0.3s_ease-out]">
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.priceEur')}</label>
                                    <input type="number" step="0.01" value={priceEur} onChange={e => setPriceEur(e.target.value)} placeholder="e.g., 49.99" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.priceUsd')}</label>
                                    <input type="number" step="0.01" value={priceUsd} onChange={e => setPriceUsd(e.target.value)} placeholder="e.g., 55.00" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                                </div>
                                <div>
                                    <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.priceAed')}</label>
                                    <input type="number" step="0.01" value={priceAed} onChange={e => setPriceAed(e.target.value)} placeholder="e.g., 199.00" className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.description')}</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg p-4 text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.language')}</label>
                            <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white">
                                <option value="EN">English</option>
                                <option value="FR">Français</option>
                                <option value="AR">العربية (Arabic)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.category')}</label>
                            <select value={category} onChange={e => setCategory(e.target.value as 'MAIN' | 'ARCHIVE')} className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white">
                                <option value="MAIN">{t('adminPage.modals.common.main')}</option>
                                <option value="ARCHIVE">{t('adminPage.modals.common.archive')}</option>
                            </select>
                        </div>

                        {/* --- NEW: Image Upload Field --- */}
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.uploadCourse.coverImage')}</label>
                            {/* Preview Current Image */}
                            {course.coverImageUrl && !coverImageFile && (
                                <div className="mb-3">
                                    <p className="text-xs text-neutral-500 mb-1">Current Image:</p>
                                    <img src={course.coverImageUrl} alt="Current Cover" className="h-20 w-auto rounded-md object-cover border border-neutral-700" />
                                </div>
                            )}

                            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-neutral-700 px-6 py-6 hover:border-neutral-500 transition-colors">
                                <div className="text-center">
                                    <FaFileImage className="mx-auto h-10 w-10 text-neutral-500" />
                                    <div className="mt-2 flex text-sm text-neutral-400 justify-center">
                                        <label htmlFor="file-upload-edit" className="relative cursor-pointer rounded-md font-semibold text-white hover:text-gray-300">
                                            <span>{t('adminPage.modals.uploadCourse.uploadFile')}</span>
                                            <input id="file-upload-edit" name="file-upload-edit" type="file" className="sr-only" onChange={(e) => { if (e.target.files) setCoverImageFile(e.target.files[0]) }} accept="image/*" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-1">{t('adminPage.modals.uploadCourse.imageHint')}</p>
                                    {coverImageFile && <p className="text-sm mt-2 text-green-400 font-bold">{coverImageFile.name}</p>}
                                </div>
                            </div>
                        </div>
                        {/* ------------------------------- */}

                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#1C1E22] text-white hover:bg-neutral-800 transition-colors">{t('adminPage.modals.common.cancel')}</button>
                            <button type="submit" disabled={isUploading || isPending} className="px-6 py-2.5 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50">
                                {isUploading || isPending ? t('adminPage.modals.common.saving') : t('adminPage.modals.common.update')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const AddSectionModal: FC<{ show: boolean; onClose: () => void; courseId: string; }> = ({ show, onClose, courseId }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const { mutate: createSection, isPending } = useCreateSection();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createSection({ title, courseId }, { onSuccess: () => { toast.success(t('adminPage.toasts.sectionAdded')); setTitle(''); onClose(); }, onError: () => { toast.error(t('adminPage.toasts.genericError')); } });
    };
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.addSection.title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.title')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" /></div>
                        <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#1C1E22] text-white">{t('adminPage.modals.common.cancel')}</button><button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-lg bg-gray-200 text-black">{t('adminPage.modals.common.add')}</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const AddVideoModal: FC<{ show: boolean; onClose: () => void; sectionId: string; courseId: string; }> = ({ show, onClose, sectionId, courseId }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [vimeoId, setVimeoId] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState<number | ''>('');
    const { mutate: addVideo, isPending } = useAddVideoToSection();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addVideo({ title, vimeoId, description, duration: Number(duration) || undefined, sectionId, courseId }, { onSuccess: () => { toast.success(t('adminPage.toasts.videoAdded')); setTitle(''); setVimeoId(''); setDescription(''); setDuration(''); onClose(); }, onError: () => { toast.error(t('adminPage.toasts.genericError')); } });
    };
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.addVideo.title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label>{t('adminPage.modals.common.title')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border rounded-lg h-12 px-4 text-white" /></div>
                        <div><label>{t('adminPage.modals.common.vimeoId')}</label><input type="text" value={vimeoId} onChange={e => setVimeoId(e.target.value)} required className="w-full bg-[#1C1E22] border rounded-lg h-12 px-4 text-white" /></div>
                        <div><label>{t('adminPage.modals.common.description')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-[#1C1E22] border rounded-lg p-4 text-white" /></div>
                        <div><label>{t('adminPage.modals.common.duration')}</label><input type="number" value={duration} onChange={e => setDuration(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-[#1C1E22] border rounded-lg h-12 px-4 text-white" /></div>
                        <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose}>{t('adminPage.modals.common.cancel')}</button><button type="submit" disabled={isPending}>{t('adminPage.modals.common.add')}</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const EditSectionModal: FC<{ show: boolean; onClose: () => void; section: any; courseId: string; }> = ({ show, onClose, section, courseId }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const { mutate: updateSection, isPending } = useUpdateSection();
    useEffect(() => { if (section) setTitle(section.title); }, [section]);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSection({ sectionId: section.id, courseId, data: { title } }, { onSuccess: onClose });
    };
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.editSection.title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div><label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.title')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" /></div>
                        <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#1C1E22] text-white">{t('adminPage.modals.common.cancel')}</button><button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-lg bg-gray-200 text-black">{isPending ? t('adminPage.modals.common.saving') : t('adminPage.modals.common.update')}</button></div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const EditVideoModal: FC<{ show: boolean; onClose: () => void; video: any; courseId: string; }> = ({ show, onClose, video, courseId }) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [vimeoId, setVimeoId] = useState('');
    // --- CONFIRMATION: Description Field Logic ---
    const [description, setDescription] = useState('');

    const { mutate: updateVideo, isPending } = useUpdateVideo();

    useEffect(() => {
        if (video) {
            setTitle(video.title);
            setVimeoId(video.vimeoId);
            // Ensure description isn't null
            setDescription(video.description || '');
        }
    }, [video]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateVideo({
            videoId: video.id,
            courseId,
            data: { title, vimeoId, description }
        }, { onSuccess: onClose });
    };

    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-lg w-full" style={{ background: '#111317' }} onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">{t('adminPage.modals.editVideo.title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.title')}</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.vimeoId')}</label>
                            <input type="text" value={vimeoId} onChange={e => setVimeoId(e.target.value)} required className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg h-12 px-4 text-white" />
                        </div>
                        {/* --- EXPLICIT DESCRIPTION FIELD --- */}
                        <div>
                            <label className="text-sm text-neutral-400 mb-2 block">{t('adminPage.modals.common.description')}</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-[#1C1E22] border border-neutral-700 rounded-lg p-4 text-white"
                                placeholder="Enter video description here..."
                            />
                        </div>
                        {/* ---------------------------------- */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#1C1E22] text-white hover:bg-neutral-800 transition-colors">{t('adminPage.modals.common.cancel')}</button>
                            <button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-lg bg-gray-200 text-black font-semibold hover:bg-gray-300 transition-colors">
                                {isPending ? t('adminPage.modals.common.saving') : t('adminPage.modals.common.update')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};