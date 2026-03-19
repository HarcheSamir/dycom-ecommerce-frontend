import React, { type JSX } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const CguPage = (): JSX.Element => {
    return (
        <div className="min-h-screen p-6 font-sans text-white" style={{ background: 'linear-gradient(135deg, #000000 0%, #030712 50%, #000000 100%)' }}>
            <div className="max-w-4xl mx-auto pt-10 pb-20">
                <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8">
                    <FaArrowLeft /><span>Retour à l'accueil</span>
                </Link>

                <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 md:p-12 mb-8" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <h1 className="text-3xl md:text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>

                    <div className="space-y-6 text-neutral-300 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Objet</h2>
                            <p>Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation du site dycom-academie.com ainsi que les droits et obligations des utilisateurs.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Accès au site</h2>
                            <p className="mb-2">L'accès au site dycom-academie.com est gratuit. Toutefois, l'accès aux formations nécessite un achat préalable conformément aux Conditions Générales de Vente.</p>
                            <p>L'utilisateur est responsable de la sécurité de ses identifiants de connexion et s'engage à ne pas les divulguer à des tiers.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Utilisation du site</h2>
                            <p className="mb-2">L'utilisateur s'engage à :</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Utiliser le site de manière loyale et conforme à sa destination</li>
                                <li>Ne pas porter atteinte aux droits de propriété intellectuelle de MZ businessCom FZ-LLC</li>
                                <li>Ne pas diffuser, partager ou revendre les contenus des formations</li>
                                <li>Ne pas utiliser le site à des fins illégales ou frauduleuses</li>
                                <li>Ne pas tenter de pirater, altérer ou perturber le fonctionnement du site</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Propriété intellectuelle</h2>
                            <p className="mb-2">Tous les contenus présents sur le site (textes, images, vidéos, logos, marques, etc.) sont la propriété exclusive de MZ businessCom FZ-LLC ou de ses partenaires.</p>
                            <p>Toute utilisation, reproduction, diffusion ou exploitation non autorisée de ces contenus est strictement interdite et constitue une violation des droits de propriété intellectuelle.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Données personnelles</h2>
                            <p className="mb-2">Les données personnelles collectées lors de l'inscription ou de l'achat sont traitées conformément à notre Politique de Confidentialité et aux réglementations en vigueur (RGPD).</p>
                            <p>L'utilisateur dispose d'un droit d'accès, de rectification, de suppression et d'opposition concernant ses données personnelles.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Responsabilité</h2>
                            <p className="mb-2">MZ businessCom FZ-LLC met tout en œuvre pour assurer la disponibilité et la qualité du site, mais ne peut garantir :</p>
                            <ul className="list-disc pl-5 space-y-1 mb-2">
                                <li>L'absence d'interruptions ou d'erreurs techniques</li>
                                <li>L'absence de virus ou autres éléments nuisibles</li>
                                <li>L'exactitude, l'exhaustivité ou la pertinence de toutes les informations</li>
                            </ul>
                            <p>L'utilisateur est seul responsable de l'utilisation qu'il fait des contenus et des résultats obtenus.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Modification des CGU</h2>
                            <p>MZ businessCom FZ-LLC se réserve le droit de modifier les présentes CGU à tout moment. Les nouvelles conditions seront applicables dès leur mise en ligne sur le site.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. Loi applicable</h2>
                            <p>Les présentes CGU sont régies par le droit des Émirats Arabes Unis. En cas de litige, compétence exclusive est attribuée aux tribunaux de Ras Al Khaimah, Émirats Arabes Unis.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CguPage;
