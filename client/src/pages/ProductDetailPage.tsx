import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingCart,
  CheckCircle,
  Truck,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { Product, RecommendedProduct, formatNPR } from '../types';
import { useCart } from '../contexts/CartContext';
import { Spinner } from '../components/Spinner';
import { RecommendationModal } from '../components/RecommendationModal';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');

  // Explain modal state
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendedProduct | null>(
    null
  );
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  useEffect(() => {
    const fetchProductAndRecommendations = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [prodRes, recRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/recommendations`),
        ]);

        if (prodRes.data.success) {
          setProduct(prodRes.data.product);
          setActiveImage(prodRes.data.product.images[0] || '');
        }

        if (recRes.data.success) {
          setRecommendations(recRes.data.recommendations || []);
        }
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRecommendations();
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-gray-500 font-medium">Loading product & calculating recommendations...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">Product not found</h2>
        <Link to="/" className="text-orange-600 text-sm mt-2 inline-block hover:underline">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const isDiscounted = product.discountPrice && product.discountPrice < product.price;

  const handleOpenExplain = (rec: RecommendedProduct) => {
    setSelectedRecommendation(rec);
    setIsExplainOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-orange-600 transition">
          Store
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-400">{product.category?.name}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 border border-gray-100 relative">
            <img
              src={activeImage || 'https://via.placeholder.com/600x400'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {isDiscounted && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                SALE
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    activeImage === img ? 'border-orange-600' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Purchase */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 font-bold uppercase tracking-wider">
                {product.category?.name}
              </span>
              <span className="font-mono text-gray-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {product.brand && (
              <p className="text-sm font-medium text-gray-500 mt-1">
                Brand: <strong className="text-gray-800">{product.brand}</strong>
              </p>
            )}

            {/* Price section */}
            <div className="mt-4 flex items-baseline space-x-3">
              <span className="text-3xl font-black text-gray-900">
                {formatNPR(product.discountPrice ?? product.price)}
              </span>
              {isDiscounted && (
                <span className="text-base text-gray-400 line-through">
                  {formatNPR(product.price)}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 mt-4 leading-relaxed">{product.description}</p>

            {/* Specification Features Table */}
            {product.features && product.features.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Key Vector Attributes (Feature Space)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {product.features.map((feat) => (
                    <div key={feat.id} className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <span className="text-gray-500 capitalize">{feat.featureKey.replace(/_/g, ' ')}: </span>
                      <span className="font-semibold text-gray-800 capitalize">
                        {feat.featureValue.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(product.id, quantity)}
                className="flex-1 py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart ({formatNPR((product.discountPrice ?? product.price) * quantity)})</span>
              </button>
            </div>

            {/* Delivery Assurance */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Same-day Dispatch from Butwal Hub</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cash on Delivery (COD) Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Recommendation Carousel powered by Cosine Similarity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-orange-600 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Content-Based Recommendation Engine</span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mt-0.5">
              Similar Products Recommended for You
            </h2>
          </div>
          <span className="text-xs text-gray-500 font-mono hidden sm:inline">
            Metric: Cosine Similarity(A, B)
          </span>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <Link to={`/product/${rec.id}`} className="block relative pt-[65%] bg-gray-50">
                  <img
                    src={rec.images[0] || 'https://via.placeholder.com/300x200'}
                    alt={rec.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-orange-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    {rec.similarity}% Match
                  </div>
                </Link>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${rec.id}`}>
                      <h4 className="text-xs font-bold text-gray-900 hover:text-orange-600 line-clamp-2 transition">
                        {rec.name}
                      </h4>
                    </Link>
                    <p className="text-xs font-bold text-gray-800 mt-1">
                      {formatNPR(rec.discountPrice ?? rec.price)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenExplain(rec)}
                      className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center space-x-1 hover:underline"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Why recommended?</span>
                    </button>

                    <button
                      onClick={() => addToCart(rec.id, 1)}
                      className="p-1.5 rounded-md bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-xl border border-gray-100">
            No similar products found in vector vocabulary.
          </div>
        )}
      </section>

      {/* Explainability Modal */}
      {selectedRecommendation && (
        <RecommendationModal
          isOpen={isExplainOpen}
          onClose={() => setIsExplainOpen(false)}
          targetProduct={product}
          recommendation={selectedRecommendation}
        />
      )}
    </div>
  );
};
