'use client';

import { useState, useEffect } from 'react';
import { quotationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Trash2, RefreshCw, AlertTriangle, Calendar } from 'lucide-react';

export default function SettingsPage() {
  const [deletedQuotations, setDeletedQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDeletedQuotations();
  }, []);

  const fetchDeletedQuotations = async () => {
    try {
      const { data } = await quotationAPI.getDeleted();
      setDeletedQuotations(data.quotations);
    } catch (error) {
      toast.error('Failed to load deleted quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (!confirm('Are you sure you want to restore this quotation?')) return;
    setActionLoading(id);
    try {
      await quotationAPI.restore(id);
      toast.success('Quotation restored successfully! ✅');
      fetchDeletedQuotations();
    } catch (error) {
      toast.error('Failed to restore quotation');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!confirm('⚠️ This will PERMANENTLY delete the quotation. This action cannot be undone. Are you sure?')) return;
    setActionLoading(id);
    try {
      await quotationAPI.permanentDelete(id);
      toast.success('Quotation permanently deleted');
      fetchDeletedQuotations();
    } catch (error) {
      toast.error('Failed to delete quotation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEmptyRecycleBin = async () => {
    if (!confirm('⚠️ This will PERMANENTLY delete ALL quotations in recycle bin. This action cannot be undone. Are you sure?')) return;
    setLoading(true);
    try {
      for (const quotation of deletedQuotations) {
        await quotationAPI.permanentDelete(quotation._id);
      }
      toast.success('Recycle bin emptied successfully');
      fetchDeletedQuotations();
    } catch (error) {
      toast.error('Failed to empty recycle bin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <SettingsIcon className="w-7 h-7 text-[#007d58]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your application settings</p>
          </div>
        </div>
      </div>

      {/* Recycle Bin Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-600" />
              Recycle Bin
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Deleted quotations are stored here for 30 days
            </p>
          </div>
          {deletedQuotations.length > 0 && (
            <button
              onClick={handleEmptyRecycleBin}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Empty Recycle Bin
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
          </div>
        ) : deletedQuotations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recycle bin is empty</h3>
            <p className="text-gray-600">Deleted quotations will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quotation #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Deleted On
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Deleted By
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deletedQuotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {quotation.quotationNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{quotation.customerName}</div>
                      <div className="text-sm text-gray-500">{quotation.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      ₹{quotation.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(quotation.deletedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {quotation.createdBy?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleRestore(quotation._id)}
                          disabled={actionLoading === quotation._id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors disabled:opacity-50"
                          title="Restore"
                        >
                          <RefreshCw className={`w-4 h-4 ${actionLoading === quotation._id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(quotation._id)}
                          disabled={actionLoading === quotation._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                          title="Permanent Delete"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About Recycle Bin</h3>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Deleted quotations are moved to recycle bin instead of permanent deletion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>You can restore quotations from recycle bin within 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Permanent deletion cannot be undone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Empty recycle bin to permanently delete all items at once</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}