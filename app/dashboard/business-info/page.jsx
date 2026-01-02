'use client';
import { useState, useEffect } from 'react';
import { companyAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Building2, Upload, Save } from 'lucide-react';

export default function BusinessInfoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [logoPreview, setLogoPreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);

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
    'Environment Service', 'IT & Software', 'Manufacturing', 'Construction', 'Healthcare',
    'Education', 'Retail', 'Hospitality', 'Transportation', 'Finance', 'Real Estate',
    'Agriculture', 'Energy', 'Consulting', 'Media & Entertainment', 'Other'
  ];

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchCompanyDetails();
  }, [user, router]);

  const fetchCompanyDetails = async () => {
    try {
      const { data } = await companyAPI.getMyCompany();
      if (data.company) {
        setFormData(data.company);
        setLogoPreview(data.company.logo);
        setHasCompany(true);
      }
    } catch (error) {
      setHasCompany(false);
    } finally {
      setFetching(false);
    }
  };

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
      if (hasCompany) {
        await companyAPI.update(formData);
        toast.success('Business information updated successfully! 🎉');
      } else {
        await companyAPI.create(formData);
        toast.success('Business information saved successfully! 🎉');
        setHasCompany(true);
      }
      setIsEditing(false);
      fetchCompanyDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save business information');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  if (!isEditing && hasCompany) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#007d58]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Information</h1>
              <p className="text-gray-600 text-sm mt-1">Your company details for quotations</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Edit Information
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {logoPreview && (
            <div className="mb-8 flex justify-center">
              <img src={logoPreview} alt="Company Logo" className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Company Name</label>
              <p className="text-base font-semibold text-gray-900 mt-2">{formData.companyName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Contact Name</label>
              <p className="text-base font-semibold text-gray-900 mt-2">{formData.contactName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-base font-semibold text-gray-900 mt-2">{formData.phone}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Business Category</label>
              <p className="text-base font-semibold text-gray-900 mt-2">{formData.businessCategory}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-sm text-gray-900 mt-2">
                {formData.address1}
                {formData.address2 && <><br />{formData.address2}</>}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">{formData.businessLabel}</label>
              <p className="text-base font-semibold text-gray-900 mt-2">{formData.businessNumber}</p>
            </div>
          </div>

          {formData.otherInfo && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-500">Other Information</label>
              <p className="text-sm text-gray-900 mt-2 whitespace-pre-wrap">{formData.otherInfo}</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            ℹ️ <strong>Note:</strong> This information will be used in all quotations created by you and your team members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          <Building2 className="w-7 h-7 text-gray-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {hasCompany ? 'Edit Business Information' : 'Setup Business Information'}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {hasCompany ? 'Update your company details' : 'Please setup your company information'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
          <div className="flex items-center gap-6">
            {logoPreview ? (
              <div className="w-24 h-24 rounded-xl border-2 border-gray-200 overflow-hidden bg-white">
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Upload Logo</span>
              </div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">Max size: 2MB. Formats: JPG, PNG, GIF</p>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
            <input 
              type="text" 
              name="companyName" 
              value={formData.companyName} 
              onChange={handleInputChange} 
              placeholder="ABC Company Pvt. Ltd."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
            <input 
              type="text" 
              name="contactName" 
              value={formData.contactName} 
              onChange={handleInputChange} 
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Category *</label>
            <select 
              name="businessCategory" 
              value={formData.businessCategory} 
              onChange={handleInputChange} 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white" 
              required
            >
              {businessCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
          <input 
            type="text" 
            name="address1" 
            value={formData.address1} 
            onChange={handleInputChange} 
            placeholder="Street address, building number"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white" 
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
          <input 
            type="text" 
            name="address2" 
            value={formData.address2} 
            onChange={handleInputChange} 
            placeholder="City, State, PIN Code"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
          />
        </div>

        {/* Business Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Label *</label>
            <select 
              name="businessLabel" 
              value={formData.businessLabel} 
              onChange={handleInputChange} 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white" 
              required
            >
              <option value="GSTIN">GSTIN</option>
              <option value="PAN">PAN</option>
              <option value="VAT">VAT</option>
              <option value="Business Number">Business Number</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{formData.businessLabel} Number *</label>
            <input 
              type="text" 
              name="businessNumber" 
              value={formData.businessNumber} 
              onChange={handleInputChange} 
              placeholder={`Enter ${formData.businessLabel} number`}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white" 
              required
            />
          </div>
        </div>

        {/* Other Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Other Information</label>
          <textarea 
            name="otherInfo" 
            value={formData.otherInfo} 
            onChange={handleInputChange} 
            rows="4"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none bg-white"
            placeholder="Additional information about your business..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {hasCompany ? 'Update Information' : 'Save Information'}
              </>
            )}
          </button>

          {hasCompany && (
            <button 
              type="button" 
              onClick={() => { setIsEditing(false); fetchCompanyDetails(); }}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}