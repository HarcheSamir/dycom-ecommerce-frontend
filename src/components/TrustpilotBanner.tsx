import { FaStar, FaStarHalfAlt, FaExternalLinkAlt } from 'react-icons/fa';

// =============================================
// HARDCODED VALUES — Update manually as needed
// =============================================
const TRUSTPILOT_RATING = 4.8;
const TRUSTPILOT_REVIEW_COUNT = 143;
const TRUSTPILOT_REVIEW_URL = 'https://fr.trustpilot.com/review/dycom-academie.com';
const TRUSTPILOT_EVALUATE_URL = 'https://fr.trustpilot.com/evaluate/dycom-academie.com';

const StarRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.3;
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: fullStars }).map((_, i) => (
                <FaStar key={i} className="text-[#00b67a] text-lg" />
            ))}
            {hasHalf && <FaStarHalfAlt className="text-[#00b67a] text-lg" />}
        </div>
    );
};

export const TrustpilotBanner = () => {
    return (
        <div className="relative overflow-hidden border border-neutral-800 rounded-2xl transition-all duration-300 hover:border-neutral-700"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="relative px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{ background: 'linear-gradient(135deg, rgba(0, 182, 122, 0.08) 0%, rgba(0, 0, 0, 0) 50%, rgba(0, 182, 122, 0.04) 100%)' }}>

                {/* Left: Trustpilot branding + rating */}
                <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
                    {/* Trustpilot Logo */}
                    <div className="flex items-center gap-2">
                        <FaStar className="text-[#00b67a] text-2xl" />
                        <span className="text-white font-bold text-lg tracking-tight">Trustpilot</span>
                    </div>

                    <div className="h-8 w-px bg-neutral-700 hidden sm:block" />

                    {/* Stars + Score */}
                    <div className="flex items-center gap-3">
                        <StarRating rating={TRUSTPILOT_RATING} />
                        <span className="text-white font-bold text-xl">{TRUSTPILOT_RATING}</span>
                        <span className="text-neutral-400 text-sm">/5</span>
                    </div>

                    <span className="text-neutral-400 text-sm">
                        Basé sur <span className="text-white font-semibold">{TRUSTPILOT_REVIEW_COUNT}</span> avis
                    </span>
                </div>

                {/* Right: CTA buttons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <a
                        href={TRUSTPILOT_REVIEW_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                        Voir les avis <FaExternalLinkAlt className="text-xs" />
                    </a>
                    <a
                        href={TRUSTPILOT_EVALUATE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_-5px_rgba(0,182,122,0.5)]"
                        style={{ background: 'linear-gradient(135deg, #00b67a 0%, #00a06a 100%)' }}
                    >
                        ⭐ Laisser un avis
                    </a>
                </div>
            </div>
        </div>
    );
};
