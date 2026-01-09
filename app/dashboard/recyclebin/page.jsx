'use client';

import { useState, useEffect } from 'react';
import { quotationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Trash2,
  Trash,
  RotateCcw,
  XCircle,
  Calendar,
  Archive,
  ArchiveRestore,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

export default function SettingsPage() {
  const [deletedQuotations, setDeletedQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showModal, setShowModal] = useState(null);

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
    setShowModal({ type: 'restore', id });
  };

  const confirmRestore = async () => {
    const id = showModal.id;
    setShowModal(null);
    setActionLoading(id);
    try {
      await quotationAPI.restore(id);
      toast.success('✅ Quotation restored successfully!');
      fetchDeletedQuotations();
    } catch {
      toast.error('❌ Failed to restore quotation');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (id) => {
    setShowModal({ type: 'delete', id });
  };

  const confirmDelete = async () => {
    const id = showModal.id;
    setShowModal(null);
    setActionLoading(id);
    try {
      await quotationAPI.permanentDelete(id);
      toast.success('🗑️ Quotation permanently deleted');
      fetchDeletedQuotations();
    } catch {
      toast.error('❌ Failed to delete quotation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEmptyRecycleBin = async () => {
    setShowModal({ type: 'empty' });
  };

  const confirmEmptyBin = async () => {
    setShowModal(null);
    setLoading(true);
    try {
      for (const q of deletedQuotations) {
        await quotationAPI.permanentDelete(q._id);
      }
      toast.success('🗑️ Recycle bin emptied successfully');
      fetchDeletedQuotations();
    } catch {
      toast.error('❌ Failed to empty recycle bin');
    } finally {
      setLoading(false);
    }
  };

  const GlassModal = ({ type, onConfirm, onCancel }) => {
    const configs = {
      restore: {
        icon: <ArchiveRestore className="w-12 h-12 text-green-500" />,
        title: 'Restore Quotation',
        message: 'This will move the quotation back to your active quotations.',
        confirmText: 'Restore',
        confirmClass: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
        iconBg: 'bg-green-100'
      },
      delete: {
        icon: <Trash className="w-12 h-12 text-red-500" />,
        title: 'Permanent Delete',
        message: 'This action cannot be undone. The quotation will be permanently removed from the system.',
        confirmText: 'Delete Forever',
        confirmClass: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
        iconBg: 'bg-red-100'
      },
      empty: {
        icon: <Trash2 className="w-12 h-12 text-orange-500" />,
        title: 'Empty Recycle Bin',
        message: `This will permanently delete ALL ${deletedQuotations.length} quotation(s) in the recycle bin. This action CANNOT be undone!`,
        confirmText: 'Empty Bin',
        confirmClass: 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
        iconBg: 'bg-orange-100'
      }
    };

    const config = configs[type];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        />
        
        {/* Glass Modal */}
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-md w-full p-8 animate-slideUp">
          {/* Close Button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200/50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Icon */}
          <div className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {config.icon}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
            {config.title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            {config.message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 text-white font-semibold rounded-xl shadow-lg transition-all ${config.confirmClass}`}
            >
              {config.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Modals */}
      {showModal?.type === 'restore' && (
        <GlassModal type="restore" onConfirm={confirmRestore} onCancel={() => setShowModal(null)} />
      )}
      {showModal?.type === 'delete' && (
        <GlassModal type="delete" onConfirm={confirmDelete} onCancel={() => setShowModal(null)} />
      )}
      {showModal?.type === 'empty' && (
        <GlassModal type="empty" onConfirm={confirmEmptyBin} onCancel={() => setShowModal(null)} />
      )}

      {/* Recycle Bin */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Archive className="w-5 h-5 text-amber-600" />
              Recycle Bin
            </h2>
            <p className="text-sm text-gray-600">
              Deleted quotations are stored here
            </p>
          </div>

          {deletedQuotations.length > 0 && (
            <button
              onClick={handleEmptyRecycleBin}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
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
                      disabled={actionLoading === q._id}
                      className="flex-1 py-2 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-1"
                    >
                      <ArchiveRestore className="w-4 h-4" />
                      Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(q._id)}
                      disabled={actionLoading === q._id}
                      className="flex-1 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-1"
                    >
                      <Trash className="w-4 h-4" />
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
                          <button 
                            onClick={() => handleRestore(q._id)} 
                            disabled={actionLoading === q._id}
                            className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                            title="Restore quotation"
                          >
                            <ArchiveRestore className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handlePermanentDelete(q._id)} 
                            disabled={actionLoading === q._id}
                            className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Permanently delete"
                          >
                            <Trash className="w-4 h-4" />
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

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}