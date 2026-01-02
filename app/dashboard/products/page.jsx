'use client';
import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Search, Package, Pencil, Trash2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
    setCurrentPage(1);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getAll();
      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (searchTerm) {
      setFilteredProducts(
        products.filter(
          (p) =>
            p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a1d29] border-t-transparent"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f9fb] p-4 md:p-6">
      {/* Header & Search */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#007d58]/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-[#007d58]" />
            </div>
            <h1 className="text-xl md:text-2xl font-semibold text-[#1a1d29]">Products</h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a1d29] focus:border-transparent text-sm"
            />
          </div>
          <Link
            href="/dashboard/products/create"
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-[#1a1d29] text-white rounded-lg hover:bg-[#2a2d39] transition-all text-sm font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 md:mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200 max-w-sm mx-auto sm:mx-0">
          <h3 className="text-sm font-medium text-gray-600 text-center mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-[#1a1d29] text-center">{products.length}</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base md:text-lg font-semibold text-[#1a1d29]">Recent Products</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Your latest product activity</p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Package className="w-12 md:w-16 h-12 md:h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-base md:text-lg mb-2">No products found</p>
            <p className="text-sm md:text-base text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Add your first product to get started'}
            </p>
            <Link
              href="/dashboard/products/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1d29] text-white rounded-lg hover:bg-[#2a2d39] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#1a1d29]">{product.productName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">{product.description || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#1a1d29]">₹{product.price.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{product.tax}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{product.unitOfMeasure}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/products/edit/${product._id}`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {currentProducts.map((product) => (
                <div key={product._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="text-sm font-medium text-[#1a1d29] mb-1 truncate">{product.productName}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2">{product.description || '-'}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => router.push(`/dashboard/products/edit/${product._id}`)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Price</span>
                      <span className="font-semibold text-[#1a1d29] text-xs">₹{product.price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Tax</span>
                      <span className="text-gray-600 text-xs">{product.tax}%</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Unit</span>
                      <span className="text-gray-600 text-xs truncate block">{product.unitOfMeasure}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
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
                        className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNum
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
