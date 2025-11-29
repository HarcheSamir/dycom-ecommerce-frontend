// src/components/ProductDetailModal.tsx

import type { FC } from 'react';
import { FaTimes, FaExternalLinkAlt, FaChartLine, FaTag, FaStar } from 'react-icons/fa';
import type { WinningProduct } from '../hooks/useWinningProducts';
import { useProductTrends } from '../hooks/useWinningProducts';
import ProductTrendChart from './ProductTrendChart';

interface ProductDetailModalProps {
  product: WinningProduct;
  show: boolean;
  onClose: () => void;
}

const ProductDetailModal: FC<ProductDetailModalProps> = ({ product, show, onClose }) => {
  const { data: trendData, isLoading, isError } = useProductTrends(product.id);

  if (!show) {
    return null;
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: product.currency ?? 'USD' }).format(price);
  };
  
  const glassCardStyle = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%, rgba(255, 255, 255, 0.05) 100%), #111317',
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative border border-neutral-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-[scale-in_0.3s_ease-out]"
        style={glassCardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-[#1C1E22]/80 border border-neutral-700 hover:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-all duration-300"
        >
          <FaTimes />
        </button>

        <div className="p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Image & Supplier */}
            <div className="space-y-6">
              <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#1C1E22]">
                <img src={product.imageUrl ?? ''} alt={product.title ?? 'Product Image'} className="w-full h-full object-cover" />
              </div>

              {/* THIS IS THE FIX: Using real data and removing fake data */}
              {product.shopName && (
                <div className="border border-neutral-800 rounded-2xl p-4" style={{background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)'}}>
                   <p className="text-neutral-500 text-sm mb-2">Vendu par</p>
                   <div className="flex justify-between items-center">
                      <span className="text-white font-semibold truncate pr-4">{product.shopName}</span>
                      {product.shopEvaluationRate && (
                        <span className="flex items-center gap-1.5 text-yellow-400 flex-shrink-0">
                            <FaStar/> {product.shopEvaluationRate}
                        </span>
                      )}
                   </div>
                </div>
              )}
            </div>

            {/* Right Column: Details & Chart */}
            <div className="flex flex-col space-y-6">
              <div>
                <span className="inline-block my-2 text-xs px-3 py-1 rounded-full bg-[#1C1E22] border border-neutral-700 text-neutral-300 self-start">{product.firstLevelCategoryName || "Catégorie"}</span>
                <h2 className="text-3xl font-bold text-white mt-2">{product.title}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="border border-neutral-800 rounded-2xl p-4" style={{background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)'}}>
                      <p className="text-neutral-500 text-sm">Prix</p>
                      <p className="text-2xl font-bold text-white mt-1">{formatPrice(product.price)}</p>
                  </div>
                  <div className="border border-neutral-800 rounded-2xl p-4" style={{background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)'}}>
                      <p className="text-neutral-500 text-sm">Ventes/mois</p>
                      <p className="text-2xl font-bold text-white mt-1">{product.salesVolume?.toLocaleString('fr-FR')}</p>
                  </div>
              </div>

              <div className="border border-neutral-800 rounded-2xl p-4 flex-grow" style={{background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)'}}>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <FaChartLine className="text-neutral-400" />
                  Tendance Google
                </h3>
                {product.googleTrendKeyword && (
                  <div className="flex items-center gap-2 text-sm text-neutral-400 mb-4">
                    <FaTag size={12} />
                    <span className="italic">Terme de recherche : "{product.googleTrendKeyword}"</span>
                  </div>
                )}
                <ProductTrendChart data={trendData ?? undefined} isLoading={isLoading} isError={isError} />
              </div>
               <a
                href={product.productUrl ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-12 rounded-lg text-base font-semibold bg-gray-200 text-black hover:bg-gray-300 transition-colors"
              >
                <FaExternalLinkAlt />
                Voir sur AliExpress
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
