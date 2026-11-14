import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { Product, formatNPR } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenExplain?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenExplain }) => {
  const { addToCart } = useCart();

  const isDiscounted = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = isDiscounted
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col overflow-hidden relative">
      {/* Discount Badge */}
      {isDiscounted && (
        <span className="absolute top-2.5 left-2.5 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          {discountPercent}% OFF
        </span>
      )}

      {/* Low stock tag */}
      {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
        <span className="absolute top-2.5 right-2.5 z-10 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
          Only {product.stockQuantity} left
        </span>
      )}

      {/* Image container */}
      <Link to={`/product/${product.id}`} className="block relative pt-[75%] bg-gray-50 overflow-hidden">
        <img
          src={product.images[0] || 'https://via.placeholder.com/400x300'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      {/* Body info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="font-medium text-orange-600 uppercase tracking-wider">
              {product.category?.name}
            </span>
            {product.brand && <span className="text-gray-400">{product.brand}</span>}
          </div>

          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 line-clamp-2 transition mb-1">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-bold text-gray-900">
                {formatNPR(product.discountPrice ?? product.price)}
              </span>
              {isDiscounted && (
                <span className="text-xs text-gray-400 line-through">
                  {formatNPR(product.price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">In Stock (Butwal Depot)</span>
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition shadow-sm"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
