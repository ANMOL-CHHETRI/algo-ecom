import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Product, Category } from '../../types';
import api from '../../services/api';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  productToEdit?: Product | null;
  categories: Category[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [features, setFeatures] = useState<Array<{ featureKey: string; featureValue: string; weight: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSlug(productToEdit.slug);
      setSku(productToEdit.sku);
      setDescription(productToEdit.description);
      setPrice(String(productToEdit.price));
      setDiscountPrice(productToEdit.discountPrice ? String(productToEdit.discountPrice) : '');
      setStockQuantity(String(productToEdit.stockQuantity));
      setBrand(productToEdit.brand || '');
      setCategoryId(productToEdit.categoryId);
      setImageUrl(productToEdit.images[0] || '');
      setFeatures(
        productToEdit.features?.map((f) => ({
          featureKey: f.featureKey,
          featureValue: f.featureValue,
          weight: f.weight,
        })) || []
      );
    } else {
      setName('');
      setSlug('');
      setSku(`SKU-${Date.now().toString(36).toUpperCase()}`);
      setDescription('');
      setPrice('');
      setDiscountPrice('');
      setStockQuantity('15');
      setBrand('');
      setCategoryId(categories[0]?.id || '');
      setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600');
      setFeatures([
        { featureKey: 'type', featureValue: 'general', weight: 1.0 },
      ]);
    }
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!productToEdit) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const addFeature = () => {
    setFeatures([...features, { featureKey: '', featureValue: '', weight: 1.0 }]);
  };

  const removeFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const updateFeature = (idx: number, field: string, val: any) => {
    const updated = [...features];
    (updated[idx] as any)[field] = val;
    setFeatures(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        name,
        slug,
        sku,
        description,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stockQuantity: parseInt(stockQuantity, 10),
        brand: brand || null,
        categoryId,
        images: imageUrl ? [imageUrl] : [],
        features: features.filter((f) => f.featureKey.trim() && f.featureValue.trim()),
      };

      if (productToEdit) {
        await api.put(`/products/${productToEdit.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-gray-900 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">
              {productToEdit ? 'Edit Product & Vector Attributes' : 'Add New Product to Catalog'}
            </h3>
            <p className="text-gray-400 text-[11px] mt-0.5">
              Updates Postgres database and recalculates vector features for recommendation engine.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 p-3 text-red-700 border-b border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Regular Price (NPR)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Discount Price (NPR)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Dynamic Vector Features Table */}
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">
                Product Features (For Cosine Similarity Vectors)
              </span>
              <button
                type="button"
                onClick={addFeature}
                className="px-2 py-1 bg-white border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-100 flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Attribute</span>
              </button>
            </div>

            <div className="space-y-2">
              {features.map((f, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Key (e.g. ram)"
                    value={f.featureKey}
                    onChange={(e) => updateFeature(idx, 'featureKey', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 8gb)"
                    value={f.featureValue}
                    onChange={(e) => updateFeature(idx, 'featureValue', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Weight"
                    value={f.weight}
                    onChange={(e) => updateFeature(idx, 'weight', parseFloat(e.target.value) || 1.0)}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded bg-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving to Database...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
