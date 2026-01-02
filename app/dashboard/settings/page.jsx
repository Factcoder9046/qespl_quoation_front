'use client';

import { useState, useEffect } from 'react';
import { quotationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Calendar
} from 'lucide-react';

export default function SettingsPage() {
  const [deletedQuotations, setDeletedQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  /* ===== PAGINATION ===== */
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    fetchDeletedQuotations();
  }, []);

  const fetchDeletedQuotations = async () => {
    try {
      const { data } = await quotationAPI.getDeleted();
      setDeletedQuotations(data.quotations);
    } catch {
      toast.error('Failed to load deleted quotations');
    } finally {
      setLoading(false);
    }
  };

  /* ===== PAGINATION LOGIC ===== */
  const totalPages = Math.ceil(deletedQuotations.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentQuotations = deletedQuotations.slice(startIndex, endIndex);

  const handleRestore = async (id) => {
    if (!confirm('Are you sure you want to restore this quotation?')) return;
    setActionLoading(id);
    try {
      await quotationAPI.restore(id);
      toast.success('Quotation restored successfully!');
      fetchDeletedQuotations();
    } catch {
      toast.error('Failed to restore quotation');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!confirm('⚠️ This will permanently delete the quotation.')) return;
    setActionLoading(id);
    try {
      await quotationAPI.permanentDelete(id);
      toast.success('Quotation permanently deleted');
      fetchDeletedQuotations();
    } catch {
      toast.error('Failed to delete quotation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEmptyRecycleBin = async () => {
    if (!confirm('⚠️ Permanently delete ALL quotations?')) return;
    setLoading(true);
    try {
      for (const q of deletedQuotations) {
        await quotationAPI.permanentDelete(q._id);
      }
      toast.success('Recycle bin emptied');
      fetchDeletedQuotations();
    } catch {
      toast.error('Failed to empty recycle bin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
          <SettingsIcon className="w-7 h-7 text-[#007d58]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600 text-sm">Manage your application settings</p>
        </div>
      </div>

      {/* Recycle Bin */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Recycle Bin
            </h2>
            <p className="text-sm text-gray-600">
              Deleted quotations are stored here
            </p>
          </div>

          {deletedQuotations.length > 0 && (
            <button
              onClick={handleEmptyRecycleBin}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Empty Bin
            </button>
          )}
        </div>

        {/* ===== CONTENT ===== */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent"></div>
          </div>
        ) : deletedQuotations.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Recycle bin is empty
          </div>
        ) : (
          <>
            {/* ===== MOBILE VIEW (CARDS) ===== */}
            <div className="block sm:hidden divide-y">
              {currentQuotations.map(q => (
                <div key={q._id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{q.quotationNumber}</p>
                      <p className="text-sm text-gray-600">{q.customerName}</p>
                    </div>
                    <p className="font-bold">₹{q.total.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(q.deletedAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleRestore(q._id)}
                      className="flex-1 py-2 text-green-600 border rounded-lg"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(q._id)}
                      className="flex-1 py-2 text-red-600 border rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== DESKTOP TABLE ===== */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Quotation</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Deleted On</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentQuotations.map(q => (
                    <tr key={q._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{q.quotationNumber}</td>
                      <td className="px-6 py-4">{q.customerName}</td>
                      <td className="px-6 py-4 font-bold">₹{q.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {new Date(q.deletedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleRestore(q._id)} className="p-2 text-green-600">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button onClick={() => handlePermanentDelete(q._id)} className="p-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-600">
                  Showing {startIndex + 1}–{Math.min(endIndex, deletedQuotations.length)} of {deletedQuotations.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
