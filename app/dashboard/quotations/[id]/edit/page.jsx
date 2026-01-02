'use client';
import { useState, useEffect } from 'react';
import { quotationAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

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

      // Fill form fields
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
    setItems(items.filter((_, i) => i !== index));
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#007d58] border-t-transparent"></div>
    </div>
  );

  if (!quotation) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link href={`/dashboard/quotations/${params.id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Quotation
          </Link>
          <h1 className="text-3xl font-bold text-[#070708]">Edit Quotation {quotation.quotationNumber}</h1>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-[#070708]">Customer Information</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
              className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Company Name</label>
            <input type="text" value={customerCompanyName} onChange={e => setCustomerCompanyName(e.target.value)}
              className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
              className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
              className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Address</label>
            <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
              className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Shipping Details</label>
            <textarea value={shippingDetails} onChange={e => setShippingDetails(e.target.value)}
              className="w-full border rounded px-3 py-2" rows={2} />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-[#070708]">Items</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-3 py-2 text-left">Description</th>
              <th className="border px-3 py-2">Qty</th>
              <th className="border px-3 py-2">Rate</th>
              <th className="border px-3 py-2">Tax %</th>
              <th className="border px-3 py-2">Amount</th>
              <th className="border px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="border px-3 py-2">
                  <input type="text" value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} className="w-full border rounded px-2 py-1" />
                </td>
                <td className="border px-3 py-2">
                  <input type="number" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)} className="w-full border rounded px-2 py-1" />
                </td>
                <td className="border px-3 py-2">
                  <input type="number" value={item.rate} onChange={e => handleItemChange(i, 'rate', e.target.value)} className="w-full border rounded px-2 py-1" />
                </td>
                <td className="border px-3 py-2">
                  <input type="number" value={item.tax} onChange={e => handleItemChange(i, 'tax', e.target.value)} className="w-full border rounded px-2 py-1" />
                </td>
                <td className="border px-3 py-2">₹{item.amount.toFixed(2)}</td>
                <td className="border px-3 py-2">
                  <button onClick={() => removeItem(i)} className="text-red-600 hover:underline">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addItem} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Add Item</button>
      </div>

      {/* Notes */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#070708] mb-2">Notes</h2>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border rounded px-3 py-2" rows={4} />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
