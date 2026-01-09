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

  //  PARAMETERS STATE
  const [parameters, setParameters] = useState([
    {
      title: '',
      specs: [{ label: '', value: '' }]
    }
  ]);

  const [generalSpecs, setGeneralSpecs] = useState([
    { text: '' }
  ]);

  const unitOptions = [
    'Piece', 'Set', 'Kg', 'Gram', 'Liter', 'Meter',
    'Box', 'Packet', 'Unit', 'Other'
  ];

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  //  PARAMETER HANDLERS
  const addParameterBlock = () => {
    setParameters([
      ...parameters,
      { title: '', specs: [{ label: '', value: '' }] }
    ]);
  };

  const addSpecRow = (pIndex) => {
    const updated = [...parameters];
    updated[pIndex].specs.push({ label: '', value: '' });
    setParameters(updated);
  };

  const updateTitle = (pIndex, value) => {
    const updated = [...parameters];
    updated[pIndex].title = value;
    setParameters(updated);
  };

  const updateSpec = (pIndex, sIndex, field, value) => {
    const updated = [...parameters];
    updated[pIndex].specs[sIndex][field] = value;
    setParameters(updated);
  };

  const removeSpec = (pIndex, sIndex) => {
    const updated = [...parameters];
    updated[pIndex].specs.splice(sIndex, 1);
    setParameters(updated);
  };

  // GENERAL SPEC HANDLERS
  const addGeneralSpec = () => {
    setGeneralSpecs([...generalSpecs, { text: '' }]);
  };

  const updateGeneralSpec = (index, value) => {
    const updated = [...generalSpecs];
    updated[index].text = value;
    setGeneralSpecs(updated);
  };

  const removeGeneralSpec = (index) => {
    const updated = [...generalSpecs];
    updated.splice(index, 1);
    setGeneralSpecs(updated);
  };


  //  SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ CLEAN GENERAL SPECIFICATIONS
    const cleanedGeneralSpecs = generalSpecs.filter(
      s => s.text.trim()
    );

    try {
      await productAPI.create({
        ...formData,
        price: parseFloat(formData.price),
        tax: parseFloat(formData.tax),
        parameters,
        generalSpecifications: cleanedGeneralSpecs 
      });

      toast.success('Product added successfully! 🎉');
      router.push('/dashboard/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-2xl font-semibold text-[#1a1d29]">
            Add New Product
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a new product or service
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* BASIC DETAILS */}
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
                  required
                  className="w-full px-4 py-2.5 border rounded-lg text-sm"
                />
              </div>

              {/* Price & Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Unit of Measure
                  </label>
                  <select
                    name="unitOfMeasure"
                    value={formData.unitOfMeasure}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border rounded-lg text-sm"
                  >
                    {unitOptions.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tax */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tax (%)
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border rounded-lg text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* 🔥 TECHNICAL PARAMETERS */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold mb-4">
              Parameters
            </h3>

            {parameters.map((param, pIndex) => (
              <div key={pIndex} className="border rounded-lg p-4 mb-4">

                <input
                  placeholder="Parameter Title (e.g. Rain Fall)"
                  value={param.title}
                  onChange={(e) =>
                    updateTitle(pIndex, e.target.value)
                  }
                  className="w-full mb-3 px-3 py-2 border rounded-md text-sm font-medium"
                />

                {param.specs.map((spec, sIndex) => (
                  <div
                    key={sIndex}
                    className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-2"
                  >
                    <input
                      placeholder="Label"
                      value={spec.label}
                      onChange={(e) =>
                        updateSpec(pIndex, sIndex, 'label', e.target.value)
                      }
                      className="md:col-span-2 px-3 py-2 border rounded-md text-sm"
                    />

                    <input
                      placeholder="Value"
                      value={spec.value}
                      onChange={(e) =>
                        updateSpec(pIndex, sIndex, 'value', e.target.value)
                      }
                      className="md:col-span-2 px-3 py-2 border rounded-md text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => removeSpec(pIndex, sIndex)}
                      className="text-red-500 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSpecRow(pIndex)}
                  className="text-blue-600 text-sm mt-2"
                >
                  + Add Row
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addParameterBlock}
              className="text-green-600 text-sm"
            >
              + Add Parameter Section
            </button>
          </div>

          {/* 🔥 GENERAL SPECIFICATION */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold mb-4">
              General Specification (Optional)
            </h3>

            {generalSpecs.map((spec, index) => (
              <div key={index} className="flex items-center gap-3 mb-2">
                <span className="text-lg leading-none">•</span>

                <input
                  type="text"
                  placeholder="e.g. SD Card: 8GB"
                  value={spec.text}
                  onChange={(e) =>
                    updateGeneralSpec(index, e.target.value)
                  }
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />

                <button
                  type="button"
                  onClick={() => removeGeneralSpec(index)}
                  className="text-red-500 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addGeneralSpec}
              className="text-blue-600 text-sm mt-2"
            >
              + Add Specification
            </button>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1a1d29] text-white rounded-lg text-sm"
            >
              {loading ? 'Adding...' : <><Save className="w-4 h-4" /> Add Product</>}
            </button>

            <Link
              href="/dashboard/products"
              className="px-6 py-2.5 border rounded-lg text-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
