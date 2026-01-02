'use client';
import { useState } from 'react';
import { productAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    unitOfMeasure: 'Piece',
    tax: 0,
    description: ''
  });

  const unitOptions = [
    'Piece', 'Set', 'Kg', 'Gram', 'Liter', 'Meter', 'Box', 'Packet', 'Unit', 'Other'
  ];

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await productAPI.create({
        ...formData,
        price: parseFloat(formData.price),
        tax: parseFloat(formData.tax)
      });
      toast.success('Product added successfully! 🎉');
      router.push('/dashboard/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <h1 className="text-2xl font-semibold text-[#1a1d29]">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new product or service</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                />
              </div>

              {/* Price and Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit of Measure <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unitOfMeasure"
                    value={formData.unitOfMeasure}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm bg-white"
                  >
                    {unitOptions.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </div>
              </div>

              {/* Tax */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Product description, specifications, etc."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Price Preview */}
          {formData.price && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-[#1a1d29] mb-4">Price Preview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Base Price:</span>
                  <span className="text-sm font-medium text-[#1a1d29]">₹{parseFloat(formData.price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tax ({formData.tax}%):</span>
                  <span className="text-sm font-medium text-[#1a1d29]">
                    ₹{((parseFloat(formData.price || 0) * parseFloat(formData.tax || 0)) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm font-semibold text-[#1a1d29]">Total Price:</span>
                  <span className="text-base font-bold text-[#1a1d29]">
                    ₹{(parseFloat(formData.price || 0) + (parseFloat(formData.price || 0) * parseFloat(formData.tax || 0)) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1a1d29] text-white rounded-lg hover:bg-[#2a2d39] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Add Product
                </>
              )}
            </button>
            
            <Link
              href="/dashboard/products"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}