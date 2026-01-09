'use client';
import { useState, useEffect } from 'react';
import { quotationAPI, companyAPI, productAPI, customerAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft, Save, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function EditQuotationPage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyDetails, setCompanyDetails] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCompanyName: '',
    shippingDetails: '',
    notes: ''
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchCompanyDetails();
    fetchProducts();
    fetchCustomers();
    fetchQuotation();
  }, [params.id]);

  const fetchCompanyDetails = async () => {
    try {
      const { data } = await companyAPI.getMyCompany();
      setCompanyDetails(data.company);
      setFormData(prev => ({
        ...prev,
        companyName: data.company.companyName,
        contactName: data.company.contactName
      }));
    } catch (error) {
      toast.error('Please setup company details first');
      router.push('/company-setup');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getAll();
      setProducts(data.products);
    } catch {
      console.error('Failed to load products');
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await customerAPI.getAll();
      setCustomers(data.customers);
    } catch {
      console.error('Failed to load customers');
    }
  };

  const fetchQuotation = async () => {
    try {
      const { data } = await quotationAPI.getOne(params.id);
      const q = data.quotation;

      setFormData({
        companyName: q.companyName,
        contactName: q.contactName,
        customerId: q.customerId || '',
        customerName: q.customerName,
        customerEmail: q.customerEmail,
        customerPhone: q.customerPhone,
        customerAddress: q.customerAddress,
        customerCompanyName: q.customerCompanyName,
        shippingDetails: q.shippingDetails,
        notes: q.notes
      });

      setItems(q.items || []);
    } catch (error) {
      toast.error('Failed to load quotation');
      router.push('/dashboard/quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    if (customerId) {
      const customer = customers.find(c => c._id === customerId);
      if (customer) {
        setSelectedCustomer(customer);
        setFormData(prev => ({
          ...prev,
          customerId: customer._id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.mobile,
          customerAddress: `${customer.address1}${customer.address2 ? ', ' + customer.address2 : ''}`,
          customerCompanyName: customer.companyName || '',
          shippingDetails: customer.shippingDetails || ''
        }));
      }
    } else {
      setSelectedCustomer(null);
      setFormData(prev => ({
        ...prev,
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        customerCompanyName: '',
        shippingDetails: ''
      }));
    }
  };

  const handleProductSelect = (index, productId) => {
    if (productId) {
      const product = products.find(p => p._id === productId);
      if (product) {
        const newItems = [...items];
        newItems[index] = {
          ...newItems[index],
          productId: product._id,
          productName: product.productName,
          description: product.description || '',
          rate: product.price,
          tax: product.tax || 0,
          quantity: 1,
          parameters: product.parameters || []
        };
        setItems(newItems);
      }
    } else {
      const newItems = [...items];
      newItems[index] = {
        productId: '',
        productName: '',
        description: '',
        quantity: 1,
        rate: 0,
        tax: 0,
        parameters: []
      };
      setItems(newItems);
    }
  };

  const handleParameterChange = (itemIndex, paramIndex, specIndex, value) => {
    const newItems = [...items];
    newItems[itemIndex].parameters[paramIndex].specs[specIndex].value = value;
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'description') newItems[index][field] = value;
    else newItems[index][field] = Number(value) || 0;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, {
    productId: '',
    productName: '',
    description: '',
    quantity: 1,
    rate: 0,
    tax: 0,
    parameters: []
  }]);

  const removeItem = (index) => items.length > 1 && setItems(items.filter((_, i) => i !== index));

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const calculateItemTax = (item) => (item.quantity * item.rate * item.tax) / 100;
  const calculateTotalTax = () => items.reduce((sum, item) => sum + calculateItemTax(item), 0);
  const calculateTotal = () => calculateSubtotal() + calculateTotalTax();

  const handleSave = async () => {
    if (items.some(item => !item.description)) {
      toast.error('Please fill all item descriptions');
      return;
    }
    setSaving(true);
    try {
      const taxAmount = calculateTotalTax();
      await quotationAPI.update(params.id, {
        ...formData,
        items,
        tax: taxAmount,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        companyPhone: companyDetails?.phone,
        companyAddress: `${companyDetails?.address1}${companyDetails?.address2 ? ', ' + companyDetails.address2 : ''}`,
        companyLogo: companyDetails?.logo
      });
      toast.success('Quotation updated successfully!');
      router.push(`/dashboard/quotations/${params.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update quotation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link href={`/dashboard/quotations/${params.id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Quotation
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Quotation</h1>
        <p className="text-gray-600 mt-1">Update quotation details</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Company Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gray-700" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField label="Company Name *" name="companyName" value={formData.companyName} onChange={handleInputChange} />
            <InputField label="Contact Name *" name="contactName" value={formData.contactName} onChange={handleInputChange} />
          </div>

          {companyDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
              <p className="mb-1"><span className="font-medium">Phone:</span> {companyDetails.phone}</p>
              <p><span className="font-medium">Address:</span> {companyDetails.address1}{companyDetails.address2 && ', ' + companyDetails.address2}</p>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            </div>
            <Link
              href="/dashboard/customers/create"
              className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium justify-center w-full sm:w-auto"
            >
              + Add New Customer
            </Link>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Existing Customer (Optional)
            </label>
            <select
              value={formData.customerId}
              onChange={handleCustomerSelect}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white"
            >
              <option value="">-- Select a customer or enter manually --</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name} {c.companyName && `(${c.companyName})`} - {c.email}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField label="Customer Name *" name="customerName" value={formData.customerName} onChange={handleInputChange} />
            <InputField label="Customer Email *" name="customerEmail" value={formData.customerEmail} onChange={handleInputChange} type="email" />
            <InputField label="Phone" name="customerPhone" value={formData.customerPhone} onChange={handleInputChange} />
            <InputField label="Address" name="customerAddress" value={formData.customerAddress} onChange={handleInputChange} />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Product (Optional)</label>
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductSelect(i, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm bg-white"
                  >
                    <option value="">-- Select a product or enter manually --</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.productName} - ₹{p.price} ({p.unitOfMeasure}) - Tax: {p.tax}%</option>)}
                  </select>
                </div>

                {item.productName && (
                  <p className="text-sm font-semibold text-gray-900 mb-2">{item.productName}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <ItemInput colSpan={5} label="Description *" value={item.description} onChange={(v) => handleItemChange(i, 'description', v)} />
                  <ItemInput colSpan={2} label="Quantity *" type="number" value={item.quantity} onChange={(v) => handleItemChange(i, 'quantity', v)} min={1} />
                  <ItemInput colSpan={2} label="Rate (₹) *" type="number" value={item.rate} onChange={(v) => handleItemChange(i, 'rate', v)} min={0} step={0.01} />
                  <ItemInput colSpan={1} label="Tax %" type="number" value={item.tax} onChange={(v) => handleItemChange(i, 'tax', v)} min={0} step={0.01} />

                  <div className="md:col-span-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 flex items-center justify-center">
                    ₹{(item.quantity * item.rate).toFixed(2)}
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)} className="w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    )}
                  </div>
                </div>

                {item.parameters?.length > 0 && (
                  <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg text-xs">
                    {item.parameters.map((param, pi) => (
                      <div key={pi} className="mb-3">
                        <p className="font-semibold text-gray-800 mb-1">{param.title}</p>
                        <div className="space-y-2">
                          {param.specs.map((spec, si) => (
                            <div key={si} className="flex gap-2 items-center">
                              <span className="w-32 text-gray-600">{spec.label}</span>
                              <input type="text" value={spec.value} onChange={(e) => handleParameterChange(i, pi, si, e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-gray-900 outline-none" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                <span className="text-lg font-bold text-gray-900">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Tax:</span>
                <span className="text-sm font-semibold text-gray-900">₹{calculateTotalTax().toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t-2 border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-gray-900">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Additional Notes</h2>
          </div>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none bg-white"
            placeholder="Add any additional notes or terms..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 justify-end">
          <Link
            href={`/dashboard/quotations/${params.id}`}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Input Field Component
const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none bg-white" required />
  </div>
);

// Item Input Component
const ItemInput = ({ colSpan, label, value, onChange, type = 'text', min, step }) => (
  <div className={`md:col-span-${colSpan}`}>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} min={min} step={step} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm bg-white" />
  </div>
);
