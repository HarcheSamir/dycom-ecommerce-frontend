import { useTranslation } from 'react-i18next';
import { useLatestUpdates } from '../hooks/useTraining';
import { FaBolt, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export const UpdatesPage = () => {
    const { i18n } = useTranslation();
    const { data: updates, isLoading } = useLatestUpdates();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case 'MODULE': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'VIDEO': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'COURSE': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
        }
    };

    const getBadgeLabel = (type: string) => {
        switch (type) {
            case 'MODULE': return 'NOUVEAU MODULE';
            case 'VIDEO': return 'NOUVELLE VIDÉO';
            case 'COURSE': return 'NOUVELLE FORMATION';
            default: return 'MISE À JOUR';
        }
    };

    const getDotColor = (type: string) => {
        switch (type) {
            case 'MODULE': return 'bg-orange-500';
            case 'VIDEO': return 'bg-blue-500';
            case 'COURSE': return 'bg-purple-500';
            default: return 'bg-neutral-500';
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <FaBolt className="text-yellow-400" /> Dernières nouveautés
                </h1>
                <p className="text-neutral-400 mt-1">
                    Restez à jour avec le nouveau contenu ajouté à la formation.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center text-neutral-500 py-10">Chargement...</div>
            ) : (
                <div className="relative border-l border-neutral-800 ml-3 space-y-8">
                    {updates?.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="relative pl-8">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[#111317] ${getDotColor(item.type)}`}></div>
                            
                            <div className="bg-[#1C1E22] border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors group">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase border ${getBadgeStyle(item.type)}`}>
                                            {getBadgeLabel(item.type)}
                                        </span>
                                        <span className="text-neutral-500 text-xs flex items-center gap-1">
                                            <FaCalendarAlt size={10} />
                                            {new Date(item.date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <Link to={item.link} className="text-xs font-bold text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Voir maintenant <FaArrowRight />
                                    </Link>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-sm text-neutral-400">
                                    {item.type === 'COURSE' ? 'Nouveau cours disponible' : <span>Dans : <span className="text-neutral-300">{item.courseTitle}</span></span>}
                                </p>
                            </div>
                        </div>
                    ))}
                    {updates?.length === 0 && <p className="text-neutral-500">Aucune mise à jour récente.</p>}
                </div>
            )}
        </main>
    );
};