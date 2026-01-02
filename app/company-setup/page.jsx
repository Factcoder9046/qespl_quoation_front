'use client';
import { useState } from 'react';
import { companyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Building2, Upload } from 'lucide-react';

export default function CompanySetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [formData, setFormData] = useState({
    logo: '',
    companyName: '',
    contactName: '',
    phone: '',
    address1: '',
    address2: '',
    otherInfo: '',
    businessLabel: 'GSTIN',
    businessNumber: '',
    businessCategory: 'Environment Service'
  });

  const businessCategories = [
    'Environment Service',
    'IT & Software',
    'Manufacturing',
    'Construction',
    'Healthcare',
    'Education',
    'Retail',
    'Hospitality',
    'Transportation',
    'Finance',
    'Real Estate',
    'Agriculture',
    'Energy',
    'Consulting',
    'Media & Entertainment',
    'Other'
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setLogoPreview(base64String);
        setFormData({ ...formData, logo: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await companyAPI.create(formData);
      toast.success('Company details saved successfully! 🎉');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save company details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto pt-4 sm:pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Company Details</h1>
              <p className="text-sm text-gray-600 mt-1">Complete your business profile to get started</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="w-20 h-20 rounded-xl border-2 border-gray-200 overflow-hidden bg-white">
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Upload Logo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">Recommended: Square image, max 2MB (JPG, PNG, GIF)</p>
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Enter contact name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="+91 1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Category *
                </label>
                <select
                  name="businessCategory"
                  value={formData.businessCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  required
                >
                  {businessCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Enter your business address"
                required
              />
            </div>

            {/* Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business ID Type *
                </label>
                <select
                  name="businessLabel"
                  value={formData.businessLabel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  required
                >
                  <option value="GSTIN">GSTIN</option>
                  <option value="PAN">PAN</option>
                  <option value="VAT">VAT</option>
                  <option value="Business Number">Business Number</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.businessLabel} Number *
                </label>
                <input
                  type="text"
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder={`Enter ${formData.businessLabel} number`}
                  required
                />
              </div>
            </div>

            {/* Other Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                name="otherInfo"
                value={formData.otherInfo}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                placeholder="Add any additional details about your business..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="sm:flex-1 px-6 py-3.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save & Continue'}
              </button>
            </div>
          </form>
        </div>

       
      </div>
    </div>
  );
}