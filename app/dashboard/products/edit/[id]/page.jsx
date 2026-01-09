'use client';
import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    unitOfMeasure: 'Piece',
    tax: 0,
    description: '',
    parameters: [],
    generalSpecifications: []
  });

  const unitOptions = [
    'Piece', 'Set', 'Kg', 'Gram', 'Liter', 'Meter', 'Box', 'Packet', 'Unit', 'Other'
  ];

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const { data } = await productAPI.getOne(params.id);
      setFormData({
        productName: data.product.productName || '',
        price: data.product.price?.toString() || '',
        unitOfMeasure: data.product.unitOfMeasure || 'Piece',
        tax: data.product.tax ?? 0,
        description: data.product.description || '',
        parameters: data.product.parameters || [],
        generalSpecifications: (data.product.generalSpecifications || []).map(spec =>
          typeof spec === 'string' ? { text: spec } : spec
        )
      });
    } catch (error) {
      toast.error('Failed to load product');
      router.push('/dashboard/products');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanedGeneralSpecs = (formData.generalSpecifications || [])
        .filter(spec => spec.text?.trim())
        .map(spec => ({ text: spec.text.trim() }));

      await productAPI.update(params.id, {
        ...formData,
        price: parseFloat(formData.price),
        tax: parseFloat(formData.tax),
        parameters: formData.parameters.filter(p => p.title.trim()),
        generalSpecifications: cleanedGeneralSpecs // ✅ ADD THIS
      });

      toast.success('Product updated successfully! 🎉');
      router.push('/dashboard/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };


  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a1d29] border-t-transparent"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold text-[#1a1d29]">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-1">Update product details</p>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                  required
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                    min="0"
                    step="0.01"
                    required
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm bg-white"
                    required
                  >
                    {unitOptions.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tax */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax (%)
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>

            {/* PARAMETERS SECTION */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold mb-4">Parameters</h3>

              {formData.parameters.map((param, pIndex) => (
                <div key={pIndex} className="border rounded-lg p-4 mb-4">

                  <input
                    value={param.title}
                    onChange={(e) => {
                      const updated = [...formData.parameters];
                      updated[pIndex].title = e.target.value;
                      setFormData({ ...formData, parameters: updated });
                    }}
                    placeholder="Parameter Title"
                    className="w-full mb-3 px-3 py-2 border rounded"
                  />

                  {param.specs.map((spec, sIndex) => (
                    <div key={sIndex} className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        value={spec.label}
                        placeholder="Label"
                        onChange={(e) => {
                          const updated = [...formData.parameters];
                          updated[pIndex].specs[sIndex].label = e.target.value;
                          setFormData({ ...formData, parameters: updated });
                        }}
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        value={spec.value}
                        placeholder="Value"
                        onChange={(e) => {
                          const updated = [...formData.parameters];
                          updated[pIndex].specs[sIndex].value = e.target.value;
                          setFormData({ ...formData, parameters: updated });
                        }}
                        className="px-3 py-2 border rounded"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...formData.parameters];
                      updated[pIndex].specs.push({ label: '', value: '' });
                      setFormData({ ...formData, parameters: updated });
                    }}
                    className="text-sm text-blue-600"
                  >
                    + Add Row
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    parameters: [...formData.parameters, { title: '', specs: [{ label: '', value: '' }] }]
                  })
                }
                className="text-sm text-green-600"
              >
                + Add Parameter Section
              </button>
            </div>

          </div>

          {/* GENERAL SPECIFICATIONS */}
          {formData.generalSpecifications.map((spec, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <span className="text-lg leading-none">•</span>
              <input
                type="text"
                value={spec.text || ''}
                placeholder="e.g. SD Card: 8GB"
                onChange={(e) => {
                  const updated = [...formData.generalSpecifications];
                  updated[index].text = e.target.value;
                  setFormData({ ...formData, generalSpecifications: updated });
                }}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const updated = formData.generalSpecifications.filter((_, i) => i !== index);
                  setFormData({ ...formData, generalSpecifications: updated });
                }}
                className="text-red-500 text-sm"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Button to add a new specification */}
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                generalSpecifications: [...formData.generalSpecifications, { text: '' }]
              })
            }
            className="text-blue-600 text-sm mt-2"
          >
            + Add Specification
          </button>


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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Product
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
    </div >
  );
}