'use client';
import { useState } from 'react';
import { customerAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    mobile: '',
    address1: '',
    address2: '',
    shippingDetails: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await customerAPI.create(formData);
      toast.success('Customer added successfully! 🎉');
      router.push('/dashboard/customers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add customer');
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
            href="/dashboard/customers"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </Link>
          <h1 className="text-2xl font-semibold text-[#1a1d29]">Add New Customer</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new customer profile</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="space-y-6">
              {/* Basic Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-[#1a1d29] mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                      placeholder="Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                      placeholder="ABC Company"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-[#1a1d29] mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                      placeholder="email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                      placeholder="+91"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h3 className="text-sm font-semibold text-[#1a1d29] mb-4">Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address  <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address1"
                      value={formData.address1}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
                      placeholder=" address"
                      required
                    />
                  </div>

                 
                </div>
              </div>

              {/* Shipping Details Section */}
              <div>
                <h3 className="text-sm font-semibold text-[#1a1d29] mb-4">Shipping Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    name="shippingDetails"
                    value={formData.shippingDetails}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm resize-none"
                    placeholder="Special shipping instructions, alternate address, etc."
                  />
                </div>
              </div>
            </div>
          </div>

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
                  <Save className="w-4 h-4" />
                  Add Customer
                </>
              )}
            </button>

            <Link
              href="/dashboard/customers"
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