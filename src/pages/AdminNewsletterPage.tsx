import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FaPaperPlane, FaHistory, FaUsers, FaEnvelope, FaCheckCircle, FaExclamationTriangle, FaTimes, FaSpinner, FaEye, FaEdit, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useSendNewsletter, useNewsletterHistory, useRecipientCount } from '../hooks/useNewsletter';

const AUDIENCE_OPTIONS = [
    { value: 'ALL', label: 'Tous les membres', description: 'Inclut tous les utilisateurs, actifs ou non' },
    { value: 'ACTIVE', label: 'Actifs uniquement', description: 'ACTIVE + TRIALING' },
    { value: 'LIFETIME', label: 'Lifetime uniquement', description: 'Accès à vie confirmé' },
    { value: 'SMMA', label: 'SMMA uniquement', description: 'Cours SMMA seulement' },
    { value: 'SPECIFIC', label: 'Membres spécifiques', description: 'Cibler des emails précis' },
];

const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
    ],
};

const QUILL_FORMATS = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'align', 'link', 'image',
];

export const AdminNewsletterPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [audience, setAudience] = useState('ALL');
    const [showPreview, setShowPreview] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showResult, setShowResult] = useState<{ success: boolean; totalSent: number; errors?: string[] } | null>(null);
    const [historyPage, setHistoryPage] = useState(1);
    const [selectedNewsletter, setSelectedNewsletter] = useState<any | null>(null);
    const [specificEmailsInput, setSpecificEmailsInput] = useState('');

    const sendMutation = useSendNewsletter();
    const { data: recipientData } = useRecipientCount(audience);
    const { data: historyData, isLoading: historyLoading } = useNewsletterHistory(historyPage);

    const calculatedSpecificCount = audience === 'SPECIFIC'
        ? specificEmailsInput.split(',').map(e => e.trim()).filter(e => e).length
        : 0;

    const displayCount = audience === 'SPECIFIC' ? `${calculatedSpecificCount} + Admins` : recipientData?.count || 0;

    const handleSend = () => {
        if (!subject.trim() || !htmlContent.trim() || htmlContent === '<p><br></p>') {
            return;
        }
        setShowConfirm(true);
    };

    const confirmSend = () => {
        setShowConfirm(false);
        const specificEmails = audience === 'SPECIFIC' ? specificEmailsInput.split(',').map(e => e.trim()).filter(e => e) : undefined;

        sendMutation.mutate(
            { subject, htmlContent, audience, specificEmails },
            {
                onSuccess: (data) => {
                    setShowResult({ success: true, totalSent: data.totalSent, errors: data.errors });
                    setSubject('');
                    setHtmlContent('');
                },
                onError: () => {
                    setShowResult({ success: false, totalSent: 0, errors: ['Échec de l\'envoi.'] });
                },
            }
        );
    };

    const isContentEmpty = !subject.trim() || !htmlContent.trim() || htmlContent === '<p><br></p>';

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FaEnvelope className="text-purple-400" /> Annonce Email
                </h1>
                <p className="text-neutral-400 mt-1">Composez et envoyez des emails à vos membres</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => setActiveTab('compose')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'compose'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                >
                    <FaEdit /> Composer
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'history'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-neutral-800/50 text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                >
                    <FaHistory /> Historique
                </button>
            </div>

            {activeTab === 'compose' ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column — Compose */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Subject */}
                        <div className="border border-neutral-800 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <label className="text-sm font-semibold text-neutral-300 mb-2 block">Objet de l'email</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Ex: Nouvelle fonctionnalité disponible !"
                                className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                                maxLength={200}
                            />
                            <p className="text-xs text-neutral-500 mt-1 text-right">{subject.length}/200</p>
                        </div>

                        {/* Editor */}
                        <div className="border border-neutral-800 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <div className="px-5 pt-4 pb-2">
                                <label className="text-sm font-semibold text-neutral-300">Contenu de l'email</label>
                            </div>
                            <div className="newsletter-editor">
                                <ReactQuill
                                    theme="snow"
                                    value={htmlContent}
                                    onChange={setHtmlContent}
                                    modules={QUILL_MODULES}
                                    formats={QUILL_FORMATS}
                                    placeholder="Rédigez votre annonce ici..."
                                    style={{ minHeight: '300px' }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowPreview(true)}
                                disabled={isContentEmpty}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <FaEye /> Aperçu
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={isContentEmpty || sendMutation.isPending}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {sendMutation.isPending ? (
                                    <><FaSpinner className="animate-spin" /> Envoi en cours...</>
                                ) : (
                                    <><FaPaperPlane /> Envoyer à {displayCount} membres</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column — Settings */}
                    <div className="space-y-6">
                        {/* Audience */}
                        <div className="border border-neutral-800 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <label className="text-sm font-semibold text-neutral-300 mb-3 block flex items-center gap-2">
                                <FaUsers className="text-blue-400" /> Audience
                            </label>
                            <div className="space-y-2">
                                {AUDIENCE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setAudience(opt.value)}
                                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${audience === opt.value
                                            ? 'border-purple-500 bg-purple-500/10 text-white'
                                            : 'border-neutral-700/50 bg-neutral-900/30 text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
                                            }`}
                                    >
                                        <p className="text-sm font-semibold">{opt.label}</p>
                                        <p className="text-xs mt-0.5 opacity-70">{opt.description}</p>
                                    </button>
                                ))}
                            </div>

                            {audience === 'SPECIFIC' && (
                                <div className="mt-4 pt-4 border-t border-neutral-800">
                                    <label className="text-xs font-semibold text-neutral-400 mb-2 block animate-fade-in">Adresses emails (séparées par des virgules)</label>
                                    <textarea
                                        value={specificEmailsInput}
                                        onChange={(e) => setSpecificEmailsInput(e.target.value)}
                                        placeholder="email1@exemple.com, email2@exemple.com..."
                                        className="w-full bg-neutral-900/50 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors resize-none text-sm"
                                        rows={4}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Recipient Count */}
                        <div className="border border-neutral-800 rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <p className="text-neutral-400 text-sm">Destinataires</p>
                            <p className="text-4xl font-bold text-white mt-1">{displayCount}</p>
                            <p className="text-xs text-neutral-500 mt-2 bg-neutral-800/50 p-2 rounded-lg inline-block">
                                Les administrateurs reçoivent toujours une copie.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* History Tab */
                <div className="border border-neutral-800 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {historyLoading ? (
                        <div className="p-12 text-center text-neutral-400">
                            <FaSpinner className="animate-spin text-2xl mx-auto mb-3" />
                            Chargement...
                        </div>
                    ) : !historyData || historyData.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <FaEnvelope className="text-4xl text-neutral-600 mx-auto mb-3" />
                            <p className="text-neutral-400">Aucune newsletter envoyée</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-neutral-800">
                                            <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-4">Objet</th>
                                            <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-4">Audience</th>
                                            <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-4">Destinataires</th>
                                            <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-4">Envoyé par</th>
                                            <th className="text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider px-5 py-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/50">
                                        {historyData.data.map((nl) => (
                                            <tr key={nl.id} onClick={() => setSelectedNewsletter(nl)} className="hover:bg-neutral-800/30 transition-colors cursor-pointer">
                                                <td className="px-5 py-4">
                                                    <p className="text-white font-medium text-sm truncate max-w-[250px]">{nl.subject}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${nl.audience === 'ALL' ? 'bg-blue-500/15 text-blue-300' :
                                                        nl.audience === 'LIFETIME' ? 'bg-purple-500/15 text-purple-300' :
                                                            nl.audience === 'ACTIVE' ? 'bg-green-500/15 text-green-300' :
                                                                'bg-yellow-500/15 text-yellow-300'
                                                        }`}>
                                                        {AUDIENCE_OPTIONS.find(o => o.value === nl.audience)?.label || nl.audience}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-neutral-400 text-sm">
                                                    {nl.recipientCount} <span className="text-neutral-600 text-xs">(Admins incl.)</span>
                                                </td>
                                                <td className="px-5 py-4 text-neutral-400 text-sm">{nl.sender.firstName} {nl.sender.lastName}</td>
                                                <td className="px-5 py-4 text-neutral-500 text-sm">
                                                    {new Date(nl.sentAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {historyData.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 p-4 border-t border-neutral-800">
                                    <button
                                        onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                        disabled={historyPage === 1}
                                        className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    <span className="text-sm text-neutral-400">Page {historyPage} / {historyData.totalPages}</span>
                                    <button
                                        onClick={() => setHistoryPage(p => Math.min(historyData.totalPages, p + 1))}
                                        disabled={historyPage === historyData.totalPages}
                                        className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 transition-colors"
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-neutral-700/50 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Email Preview Header */}
                        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Aperçu de l'email</p>
                                <p className="font-semibold text-gray-900">{subject || '(Sans objet)'}</p>
                            </div>
                            <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <FaTimes className="text-gray-500" />
                            </button>
                        </div>
                        {/* Email Content Preview */}
                        <div style={{ background: '#f9fafb', padding: '40px 0' }}>
                            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <div style={{ backgroundColor: '#111317', padding: '30px', textAlign: 'center' }}>
                                    <img src="https://dycom-club.com/logo2.png" alt="Dycom Club" style={{ height: '40px', margin: '0 auto', display: 'block' }} />
                                </div>
                                <div style={{ padding: '30px', color: '#333333' }} dangerouslySetInnerHTML={{ __html: htmlContent }} />
                                <div style={{ backgroundColor: '#f3f4f6', padding: '20px', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                                        © {new Date().getFullYear()} Dycom Club. Tous droits réservés.
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '5px 0 0 0' }}>
                                        <a href="https://dycom-club.com" style={{ color: '#9ca3af', textDecoration: 'none' }}>dycom-club.com</a>
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '15px 0 0 0' }}>
                                        Vous ne souhaitez plus recevoir ces annonces ? <a href="mailto:support@dycom-club.com?subject=Désinscription" style={{ color: '#9ca3af', textDecoration: 'underline' }}>Se désinscrire</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-sm rounded-2xl border border-neutral-700/50 shadow-2xl p-8 text-center"
                        style={{ background: 'linear-gradient(145deg, #1a1c23 0%, #111317 50%, #0d0f13 100%)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
                            <FaPaperPlane className="text-purple-400 text-2xl" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Confirmer l'envoi</h3>
                        <p className="text-neutral-400 text-sm mb-1">
                            <strong className="text-white">{subject}</strong>
                        </p>
                        <p className="text-neutral-400 text-sm mb-6">
                            Sera envoyé à <strong className="text-purple-400">{displayCount} membres</strong>
                        </p>
                        <button
                            onClick={confirmSend}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-bold text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20"
                        >
                            Confirmer l'envoi
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="w-full py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors mt-3"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Result Modal */}
            {showResult && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowResult(null)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-sm rounded-2xl border border-neutral-700/50 shadow-2xl p-8 text-center"
                        style={{ background: 'linear-gradient(145deg, #1a1c23 0%, #111317 50%, #0d0f13 100%)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {showResult.success ? (
                            <>
                                <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
                                    <FaCheckCircle className="text-green-400 text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Envoyé avec succès !</h3>
                                <p className="text-neutral-400 text-sm mb-6">
                                    <strong className="text-green-400">{showResult.totalSent}</strong> emails envoyés
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                                    <FaExclamationTriangle className="text-red-400 text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Erreur d'envoi</h3>
                                <p className="text-neutral-400 text-sm mb-6">
                                    {showResult.errors?.join(', ')}
                                </p>
                            </>
                        )}
                        <button
                            onClick={() => setShowResult(null)}
                            className="w-full py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {/* History Detail Modal */}
            {selectedNewsletter && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setSelectedNewsletter(null)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-neutral-700/50 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Newsletter envoyée le {new Date(selectedNewsletter.sentAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                <p className="font-semibold text-gray-900">{selectedNewsletter.subject}</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500">{selectedNewsletter.recipientCount} destinataires</span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">{AUDIENCE_OPTIONS.find(o => o.value === selectedNewsletter.audience)?.label || selectedNewsletter.audience}</span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">Par {selectedNewsletter.sender.firstName} {selectedNewsletter.sender.lastName}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNewsletter(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <FaTimes className="text-gray-500" />
                            </button>
                        </div>
                        {/* Email Content */}
                        <div style={{ background: '#f9fafb', padding: '40px 0' }}>
                            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <div style={{ backgroundColor: '#111317', padding: '30px', textAlign: 'center' }}>
                                    <img src="https://dycom-club.com/logo2.png" alt="Dycom Club" style={{ height: '40px', margin: '0 auto', display: 'block' }} />
                                </div>
                                <div style={{ padding: '30px', color: '#333333' }} dangerouslySetInnerHTML={{ __html: selectedNewsletter.htmlContent }} />
                                <div style={{ backgroundColor: '#f3f4f6', padding: '20px', textAlign: 'center', borderTop: '1px solid #e5e7eb' }}>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                                        © {new Date().getFullYear()} Dycom Club. Tous droits réservés.
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '5px 0 0 0' }}>
                                        <a href="https://dycom-club.com" style={{ color: '#9ca3af', textDecoration: 'none' }}>dycom-club.com</a>
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '15px 0 0 0' }}>
                                        Vous ne souhaitez plus recevoir ces annonces ? <a href="mailto:support@dycom-club.com?subject=Désinscription" style={{ color: '#9ca3af', textDecoration: 'underline' }}>Se désinscrire</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Quill Styles for Dark Theme */}
            <style>{`
        .newsletter-editor .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.2);
          padding: 12px 16px;
        }
        .newsletter-editor .ql-container.ql-snow {
          border: none;
          min-height: 300px;
        }
        .newsletter-editor .ql-editor {
          color: #e5e7eb;
          font-size: 15px;
          line-height: 1.7;
          padding: 20px;
          min-height: 300px;
        }
        .newsletter-editor .ql-editor.ql-blank::before {
          color: #6b7280;
          font-style: normal;
        }
        .newsletter-editor .ql-toolbar .ql-stroke {
          stroke: #9ca3af;
        }
        .newsletter-editor .ql-toolbar .ql-fill {
          fill: #9ca3af;
        }
        .newsletter-editor .ql-toolbar .ql-picker-label {
          color: #9ca3af;
        }
        .newsletter-editor .ql-toolbar button:hover .ql-stroke,
        .newsletter-editor .ql-toolbar .ql-active .ql-stroke {
          stroke: #a78bfa;
        }
        .newsletter-editor .ql-toolbar button:hover .ql-fill,
        .newsletter-editor .ql-toolbar .ql-active .ql-fill {
          fill: #a78bfa;
        }
        .newsletter-editor .ql-toolbar .ql-picker-options {
          background: #1a1c23;
          border-color: rgba(255,255,255,0.1);
        }
        .newsletter-editor .ql-toolbar .ql-picker-item {
          color: #e5e7eb;
        }
        .newsletter-editor .ql-toolbar .ql-picker-item:hover {
          color: #a78bfa;
        }
        .newsletter-editor .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          color: #a78bfa;
          border-color: rgba(255,255,255,0.1);
        }
        .newsletter-editor .ql-editor a {
          color: #a78bfa;
        }
      `}</style>
        </main>
    );
};

export default AdminNewsletterPage;
