import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, AlertCircle, Package } from 'lucide-react';
import api from '../../services/api';
import { Product, Category, formatNPR } from '../../types';
import { ProductForm } from '../../components/admin/ProductForm';
import { Spinner } from '../../components/Spinner';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories'),
      ]);
      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (catRes.data.success) setCategories(catRes.data.categories);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      fetchCatalog();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Catalog & Inventory Management</h2>
          <p className="text-gray-500">
            CRUD operations, stock levels, and vector attribute weights in Butwal warehouse.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition flex items-center space-x-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm max-w-md">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by title, brand, or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs focus:outline-none"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-gray-500">Loading catalog items...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 font-bold text-gray-600">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price (NPR)</th>
                  <th className="px-4 py-3">Stock Level</th>
                  <th className="px-4 py-3">Vector Attributes</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= 5;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 flex items-center space-x-3">
                        <img
                          src={p.images[0] || 'https://via.placeholder.com/50'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-xs">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{p.sku}</p>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-700">{p.category?.name}</td>

                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatNPR(p.discountPrice ?? p.price)}
                        {p.discountPrice && (
                          <span className="block text-[10px] text-gray-400 line-through">
                            {formatNPR(p.price)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLow
                              ? 'bg-red-100 text-red-800 animate-pulse'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stockQuantity} units
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded font-mono">
                          {p.features?.length || 0} features
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={fetchCatalog}
        productToEdit={editingProduct}
        categories={categories}
      />
    </div>
  );
};
