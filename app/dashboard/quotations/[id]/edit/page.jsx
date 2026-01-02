'use client';
import { useState, useEffect } from 'react';
import { quotationAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

export default function EditQuotationPage() {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const params = useParams();

  const [customerName, setCustomerName] = useState('');
  const [customerCompanyName, setCustomerCompanyName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [shippingDetails, setShippingDetails] = useState('');
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchQuotation();
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      const { data } = await quotationAPI.getOne(params.id);
      const q = data.quotation;
      setQuotation(q);

      setCustomerName(q.customerName || '');
      setCustomerCompanyName(q.customerCompanyName || '');
      setCustomerEmail(q.customerEmail || '');
      setCustomerPhone(q.customerPhone || '');
      setCustomerAddress(q.customerAddress || '');
      setShippingDetails(q.shippingDetails || '');
      setItems(q.items || []);
      setNotes(q.notes || '');
    } catch (error) {
      toast.error('Failed to load quotation');
      router.push('/dashboard/quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'description' ? value : Number(value);
    newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, tax: 0, amount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const subtotal = items.reduce((acc, i) => acc + i.amount, 0);
      const tax = items.reduce((acc, i) => acc + (i.amount * (i.tax / 100)), 0);
      const total = subtotal + tax;

      await quotationAPI.update(params.id, {
        customerName,
        customerCompanyName,
        customerEmail,
        customerPhone,
        customerAddress,
        shippingDetails,
        items,
        notes,
        subtotal,
        tax,
        total,
      });
      toast.success('Quotation updated successfully');
      router.push(`/dashboard/quotations/${params.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update quotation');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((acc, i) => acc + i.amount, 0);
    const tax = items.reduce((acc, i) => acc + (i.amount * (i.tax / 100)), 0);
    return { subtotal, tax, total: subtotal + tax };
  };

  const totals = calculateTotal();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
    </div>
  );

  if (!quotation) return null;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link href={`/dashboard/quotations/${params.id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Quotation
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Quotation {quotation.quotationNumber}</h1>
        <p className="text-gray-600 text-sm mt-1">Update quotation details</p>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input 
              type="text" 
              value={customerCompanyName} 
              onChange={e => setCustomerCompanyName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={customerEmail} 
              onChange={e => setCustomerEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input 
              type="text" 
              value={customerPhone} 
              onChange={e => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea 
              value={customerAddress} 
              onChange={e => setCustomerAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
              rows={3}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Details</label>
            <textarea 
              value={shippingDetails} 
              onChange={e => setShippingDetails(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Items</h2>
          <button 
            onClick={addItem} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
        
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input 
                    type="text" 
                    value={item.description} 
                    onChange={e => handleItemChange(i, 'description', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input 
                    type="number" 
                    value={item.quantity} 
                    onChange={e => handleItemChange(i, 'quantity', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    min="1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rate (₹)</label>
                  <input 
                    type="number" 
                    value={item.rate} 
                    onChange={e => handleItemChange(i, 'rate', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
                  <input 
                    type="number" 
                    value={item.tax} 
                    onChange={e => handleItemChange(i, 'tax', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button 
                    onClick={() => removeItem(i)} 
                    disabled={items.length === 1}
                    className="w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm font-semibold text-gray-900">
                Amount: ₹{item.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <div className="max-w-xs ml-auto space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-gray-900">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-semibold text-gray-900">₹{totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-200">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">₹{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
        <textarea 
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none"
          rows={4}
          placeholder="Add any additional notes..."
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4 justify-end">
        <Link
          href={`/dashboard/quotations/${params.id}`}
          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          Cancel
        </Link>
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}