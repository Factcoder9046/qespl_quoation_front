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
  const router = useRouter();

  useEffect(() => { fetchCustomers(); }, []);
  useEffect(() => { filterCustomers(); }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const { data } = await customerAPI.getAll();
      setCustomers(data.customers);
      setFilteredCustomers(data.customers);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally { setLoading(false); }
  };

  const filterCustomers = () => {
    if (searchTerm) {
      const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else setFilteredCustomers(customers);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerAPI.delete(id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a1d29] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-6">
       {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007d58]/10 rounded-lg flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-[#007d58]" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1a1d29]">
              Customers
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search customer name, email or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] text-sm"
            />
          </div>
          <Link
            href="/dashboard/customers/create"
            className="flex items-center gap-2 px-6 py-3 bg-[#1a1d29] text-white rounded-lg hover:bg-[#2a2d39] transition-all text-sm font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Customer
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="flex justify-end mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 w-full max-w-sm">
            <div className="flex flex-col items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-gray-600">
                Total Customers
              </h3>
            </div>
            <p className="text-3xl font-bold text-[#1a1d29] text-center">
              {customers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#1a1d29]">Recent Customers</h2>
          <p className="text-sm text-gray-500 mt-1">Your latest customer activity</p>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No customers found</p>
            <p className="text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Add your first customer to get started'}
            </p>
            <Link
              href="/dashboard/customers/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1d29] text-white rounded-lg hover:bg-[#2a2d39] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Add Customer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1a1d29] flex items-center justify-center text-white font-medium text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-[#1a1d29]">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{customer.companyName || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate max-w-xs">{customer.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{customer.mobile}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {customer.address1 ? (
                          <>
                            {customer.address1}
                            {customer.address2 && `, ${customer.address2}`}
                          </>
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/customers/edit/${customer._id}`)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
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
        )}
      </div>
    </div>
  );
}