import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, MapPin, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { Product, Category, formatNPR } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Spinner } from '../components/Spinner';

export const StorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with active filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (searchParam) params.search = searchParam;
        if (selectedCategory) params.categoryId = selectedCategory;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (inStockOnly) params.inStock = 'true';

        const res = await api.get('/products', { params });
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalCount(res.data.total);
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParam, selectedCategory, minPrice, maxPrice, inStockOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-6 sm:p-10 shadow-lg overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-orange-800/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>Serving Butwal Sub-Metropolitan & Rupandehi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Algorithm-Powered E-Commerce in Butwal
          </h1>
          <p className="text-orange-100 text-xs sm:text-sm leading-relaxed">
            Fast localized delivery from our <strong>Traffic Chowk Depot</strong>. Featuring content-based cosine recommendations, typo-tolerant search, and Dijkstra shortest-path delivery routing.
          </p>
        </div>
      </div>

      {/* Main Catalog Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6 shrink-0 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-600" />
              <span>Filters</span>
            </h3>
            {(selectedCategory || minPrice || maxPrice || inStockOnly || searchParam) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setMinPrice('');
                  setMaxPrice('');
                  setInStockOnly(false);
                  setSearchParams({});
                }}
                className="text-xs text-orange-600 hover:underline font-semibold"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
              Categories
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${
                  selectedCategory === ''
                    ? 'bg-orange-50 text-orange-600 font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Categories ({totalCount})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex justify-between items-center ${
                    selectedCategory === cat.id
                      ? 'bg-orange-50 text-orange-600 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat._count?.products !== undefined && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {cat._count.products}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter (in NPR) */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
              Price Range (NPR)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-gray-500">Min (Rs.)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Max (Rs.)</label>
                <input
                  type="number"
                  placeholder="150000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* In Stock toggle */}
          <div>
            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span>In-Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1">
          {/* Active Search Banner */}
          {searchParam && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-center justify-between text-xs text-orange-900">
              <div>
                Showing results for search:{' '}
                <strong className="text-orange-950 font-bold">"{searchParam}"</strong>
              </div>
              <button
                onClick={() => setSearchParams({})}
                className="text-xs font-semibold text-orange-700 hover:underline"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Grid Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-500">
              Found <strong className="text-gray-900 font-bold">{products.length}</strong> items in Butwal catalog
            </p>
          </div>

          {/* Products */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Spinner size="lg" />
              <p className="text-xs text-gray-500 font-medium">Loading catalog products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-800">No products match your criteria</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Try widening your price range or clearing category filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
