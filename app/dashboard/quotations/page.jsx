'use client';
import { useState, useEffect, useMemo } from 'react';
import { quotationAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  FileText,
  MoreVertical
} from 'lucide-react';



export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const limit = 10;
  const router = useRouter();
  
  useEffect(() => {
  fetchQuotations();
}, []);

  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm);
    setCurrentPage(1);
  }, 400);

  return () => clearTimeout(timer);
}, [searchTerm]);


  const fetchQuotations = async () => {
    try {
      const { data } = await quotationAPI.getAll();
      setQuotations(data.quotations);
    } catch (error) {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

 const filteredQuotations = useMemo(() => {
  if (!debouncedSearch && statusFilter === 'all') return quotations;

  const term = debouncedSearch.toLowerCase();

  return quotations
    .filter(q =>
      (q.quotationNumber || '').toLowerCase().includes(term) ||
      (q.customerName || '').toLowerCase().includes(term) ||
      (q.customerEmail || '').toLowerCase().includes(term)
    )
    .filter(q =>
      statusFilter === 'all' ? true : q.status === statusFilter
    );
}, [quotations, debouncedSearch, statusFilter]);


  const handleDelete = async (id) => {
    if (!confirm('Move this quotation to recycle bin?')) return;

    try {
      await quotationAPI.delete(id);
      toast.success('Quotation moved to recycle bin');
      fetchQuotations();
    } catch (error) {
      toast.error('Failed to delete quotation');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-yellow-100 text-yellow-700',
      sent: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.ceil(filteredQuotations.length / limit);
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

 if (loading) {
  return (
    <div className="p-6 space-y-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-6 bg-gray-200 rounded" />
      ))}
    </div>
  );
}

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#007d58]/10 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-[#007d58]" />
        </div>

        <h1 className="text-2xl font-semibold text-[#1a1d29] mb-1">
          Quotations
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by quotation number or customer name email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl 
            focus:ring-2 focus:ring-gray-900 focus:border-transparent 
            outline-none bg-white text-sm"
          />
        </div>

        <div className="flex items-center">

          <Link
            href="/dashboard/quotations/create"
            className="inline-flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Quotation
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200">
        {paginatedQuotations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotations found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first quotation</p>
            <Link
              href="/dashboard/quotations/create"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Quotation
            </Link>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-2xl">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quotation #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedQuotations.map((q) => (
                    <tr key={q._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{q.quotationNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{q.customerName}</div>
                        <div className="text-sm text-gray-500">{q.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{Number(q.total).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg ${getStatusBadge(q.status)}`}>
                          {(q.status || 'draft').charAt(0).toUpperCase() + (q.status || 'draft').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {q.createdBy?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/quotations/${q._id}`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/quotations/${q._id}/edit`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(q._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {paginatedQuotations.map((q) => (
                <div key={q._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{q.quotationNumber}</span>
                      <div className="text-sm text-gray-500 mt-1">{new Date(q.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg ${getStatusBadge(q.status)}`}>
                      {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-900">{q.customerName}</div>
                    <div className="text-sm text-gray-500">{q.customerEmail}</div>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{Number(q.total).toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-gray-600">
                      {q.createdBy?.name || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/quotations/${q._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/quotations/${q._id}/edit`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 px-4 sm:px-6 py-4 border-t border-gray-200">


                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}