// src/pages/MyShopOrdersPage.tsx

import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useMyShopOrders } from '../hooks/useShopOrder';
import { FaShoppingBag, FaClock, FaCheckCircle, FaSpinner, FaCreditCard, FaArrowRight } from 'react-icons/fa';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    DRAFT: { label: 'Brouillon', color: 'bg-neutral-600', icon: FaShoppingBag },
    PENDING_PAYMENT: { label: 'En attente de paiement', color: 'bg-yellow-600', icon: FaCreditCard },
    SUBMITTED: { label: 'Soumise', color: 'bg-blue-600', icon: FaClock },
    IN_PROGRESS: { label: 'En cours', color: 'bg-purple-600', icon: FaSpinner },
    COMPLETED: { label: 'Terminée', color: 'bg-green-600', icon: FaCheckCircle },
    CANCELLED: { label: 'Annulée', color: 'bg-red-600', icon: FaShoppingBag }
};

export const MyShopOrdersPage: FC = () => {
    const { data: orders, isLoading } = useMyShopOrders();

    if (isLoading) {
        return (
            <main className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary" />
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Mes Commandes</h1>
                        <p className="text-neutral-400">Historique de vos commandes de boutique</p>
                    </div>
                    <Link
                        to="/dashboard/order-shop"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-semibold hover:opacity-90 transition-all"
                    >
                        Nouvelle commande <FaArrowRight />
                    </Link>
                </div>

                {/* Orders List */}
                {!orders || orders.length === 0 ? (
                    <div className="text-center py-16">
                        <FaShoppingBag className="text-6xl text-neutral-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Aucune commande</h2>
                        <p className="text-neutral-400 mb-6">Vous n'avez pas encore commandé de boutique.</p>
                        <Link
                            to="/dashboard/order-shop"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-all"
                        >
                            Commander ma boutique
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.DRAFT;
                            const StatusIcon = status.icon;

                            return (
                                <div
                                    key={order.id}
                                    className="p-5 rounded-2xl border border-neutral-700 bg-[#1C1E22]/80 backdrop-blur-sm hover:border-neutral-600 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${status.color} flex items-center justify-center`}>
                                                <StatusIcon className="text-white text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold">
                                                    {order.brandName || 'Boutique sans nom'}
                                                </h3>
                                                <div className="flex items-center gap-3 text-sm text-neutral-400">
                                                    <span>#{order.id.slice(0, 8)}</span>
                                                    <span>•</span>
                                                    <span>{order.productCount || 0} produit(s)</span>
                                                    <span>•</span>
                                                    <span>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
                                                {status.label}
                                            </span>
                                            {order.totalPrice && (
                                                <span className="text-white font-bold">{order.totalPrice}€</span>
                                            )}

                                            {(order.status === 'DRAFT' || order.status === 'PENDING_PAYMENT') && (
                                                <Link
                                                    to="/dashboard/order-shop"
                                                    className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-all"
                                                >
                                                    {order.status === 'PENDING_PAYMENT' ? 'Reprendre le paiement' : 'Continuer'}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
};

export default MyShopOrdersPage;
