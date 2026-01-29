'use client';
import { useState, useEffect } from 'react';
import { customerAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Search, UserCircle, Mail, Phone, Pencil, Trash2 } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const customersPerPage = 10;
  const router = useRouter();

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
    setCurrentPage(1); // reset page on search
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const { data } = await customerAPI.getAll();
      setCustomers(data.customers);
      setFilteredCustomers(data.customers);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const term = searchTerm.toLowerCase();
    setFilteredCustomers(
      customers.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.companyName?.toLowerCase().includes(term)
      )
    );
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerAPI.delete(id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch {
      toast.error('Failed to delete customer');
    }
  };

  /* ================= PAGINATION ================= */
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a1d29] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007d58]/10 rounded-lg flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-[#007d58]" />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#1a1d29]">Customers</h1>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a1d29] text-sm"
            />
          </div>
          <Link
            href="/dashboard/customers/create"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a1d29] text-white rounded-lg hover:bg-[#2a2d39] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Customer
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold">Recent Customers</h2>
          <p className="text-sm text-gray-500">Your latest customer activity</p>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No customers found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Mobile</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentCustomers.map(customer => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{customer.name}</td>
                      <td className="px-6 py-4">{customer.companyName || '-'}</td>
                      <td className="px-6 py-4">{customer.email}</td>
                      <td className="px-6 py-4">{customer.mobile}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/customers/edit/?id=${customer._id}`)
                          }
                          className="p-2"
                        >

                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(customer._id)} className="p-2 text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {currentCustomers.map(customer => (
                <div key={customer._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-medium text-[#1a1d29] mb-1">{customer.name}</div>
                      <div className="text-xs text-gray-500">{customer.companyName || '-'}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/customers/edit/?id=${customer._id}`)
                        }
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{customer.mobile}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 px-4 sm:px-6 py-4 border-t border-gray-200">

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
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

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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