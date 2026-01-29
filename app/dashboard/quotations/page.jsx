// 'use client';
// import { useState, useEffect, useMemo } from 'react';
// import { quotationAPI } from '@/lib/api';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import toast from 'react-hot-toast';
// import { useAuth } from '@/contexts/AuthContext';
// import {
//   Plus,
//   Search,
//   Eye,
//   Pencil,
//   Trash2,
//   FileText,
//   MoreVertical,
//   CheckCircle2,
//   XCircle
// } from 'lucide-react';



// export default function QuotationsPage() {
//   const [quotations, setQuotations] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [debouncedSearch, setDebouncedSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [actionSheet, setActionSheet] = useState(null);
//   const [statusInfo, setStatusInfo] = useState(null);
//   const [openMenu, setOpenMenu] = useState(null);
//   const [total, setTotal] = useState(0);

//   const limit = 10;
//   const router = useRouter();

//   const { hasPermission } = useAuth();


//   useEffect(() => {
//     fetchQuotations(currentPage);
//   }, [currentPage, debouncedSearch, statusFilter]);



//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebouncedSearch(searchTerm);
//       setCurrentPage(1);
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [searchTerm]);


//   const fetchQuotations = async (page = 1) => {
//     try {
//       setLoading(true);
//       const { data } = await quotationAPI.getAll({
//         page,
//         limit,
//         search: debouncedSearch,
//         status: statusFilter
//       });

//       setQuotations(data.quotations);
//       setTotal(data.total);
//     } catch {
//       toast.error('Failed to load quotations');
//     } finally {
//       setLoading(false);
//     }
//   };



//   const handleDelete = async (id) => {
//     if (!confirm('Move this quotation to recycle bin?')) return;

//     try {
//       await quotationAPI.delete(id);
//       toast.success('Quotation moved to recycle bin');
//       fetchQuotations();
//     } catch (error) {
//       toast.error('Failed to delete quotation');
//     }
//   };

//   const STATUS_LABEL = {
//     in_process: 'In Process',
//     complete: 'Complete',
//     failed: 'Failed'
//   };


//   const getStatusBadge = (status) => {
//     const badges = {
//       in_process: 'bg-yellow-100 text-yellow-800',
//       complete: 'bg-green-100 text-green-700',
//       failed: 'bg-red-100 text-red-700'
//     };

//     return badges[status] || 'bg-gray-100 text-gray-800';
//   };


//   const getLastStatusHistory = (q) => {
//     if (!q.statusHistory || q.statusHistory.length === 0) return null;
//     return q.statusHistory[q.statusHistory.length - 1];
//   };


//   const handleStatusUpdate = async (id, status) => {
//     if (!confirm(`Are you sure you want to mark as ${status}?`)) return;

//     try {
//       const { data } = await quotationAPI.updateStatus(id, status);

//       toast.success('Status updated successfully');

//       // 🔥 UI instantly update
//       setQuotations(prev =>
//         prev.map(q =>
//           q._id === id ? { ...q, status: data.quotation.status } : q
//         )
//       );
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to update status');
//     }
//   };



//   const totalPages = Math.ceil(total / limit);


//   if (loading) {
//     return (
//       <div className="p-6 space-y-3 animate-pulse">
//         {[...Array(6)].map((_, i) => (
//           <div key={i} className="h-6 bg-gray-200 rounded" />
//         ))}
//       </div>
//     );
//   }

//   if (!hasPermission('quotation', 'read')) {
//     return (
//       <div className="p-10 text-center">
//         <h2 className="text-xl font-semibold text-gray-900">
//           Access Denied
//         </h2>
//         <p className="text-gray-600 mt-2">
//           You don’t have permission to view quotations.
//         </p>
//       </div>
//     );
//   }


//   return (
//     <div className="space-y-6 p-6 lg:p-8">
//       {/* Header */}

//       <div className="flex items-center gap-3">
//         <div className="w-10 h-10 bg-[#007d58]/10 rounded-lg flex items-center justify-center">
//           <FileText className="w-6 h-6 text-[#007d58]" />
//         </div>

//         <h1 className="text-2xl font-semibold text-[#1a1d29] mb-1">
//           Quotations
//         </h1>
//       </div>

//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="w-full max-w-md relative">
//           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search by quotation number or customer name email..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl 
//             focus:ring-2 focus:ring-gray-900 focus:border-transparent 
//             outline-none bg-white text-sm"
//           />
//         </div>

//         <div className="flex items-center">

//           {hasPermission('quotation', 'create') && (
//             <Link
//               href="/dashboard/quotations/create"
//               className="inline-flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm"
//             >
//               <Plus className="w-4 h-4" />
//               Add Quotation
//             </Link>
//           )}
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-2xl border border-gray-200">
//         {quotations.length === 0 ? (
//           <div className="p-12 text-center">
//             <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//               <FileText className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotations found</h3>
//             <p className="text-gray-600 mb-6">Get started by creating your first quotation</p>
//             <Link
//               href="/dashboard/quotations/create"
//               className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
//             >
//               <Plus className="w-4 h-4" />
//               Create Quotation
//             </Link>
//           </div>
//         ) : (
//           <div>
//             {/* Desktop Table View */}
//             <div className="hidden md:block overflow-x-auto overflow-y-visible rounded-2xl">

//               <table className="w-full min-w-[600px]">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Quotation #
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Customer
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Total
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Created By
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {quotations.map((q) => (
//                     <tr key={q._id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="text-sm font-semibold text-gray-900">{q.quotationNumber}</span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm font-medium text-gray-900">{q.customerName}</div>
//                         <div className="text-sm text-gray-500">{q.customerEmail}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="text-sm font-bold text-gray-900">
//                           ₹{Number(q.total).toLocaleString('en-IN')}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         {q.status === 'in_process' ? (
//                           <span className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg ${getStatusBadge(q.status)}`}>
//                             In Process
//                           </span>
//                         ) : (
//                           <div className="relative group inline-block">
//                             <span
//                               className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg cursor-pointer ${getStatusBadge(q.status)}`}
//                             >
//                               {STATUS_LABEL[q.status] || 'Unknown'}

//                             </span>

//                             {/* Hover tooltip */}
//                             {getLastStatusHistory(q) && (
//                               <div
//                                 className="
//       absolute left-0 top-full mt-2
//       z-50 hidden group-hover:block
//       w-64 p-3 text-xs text-gray-700
//       bg-white border border-gray-200
//       rounded-xl shadow-lg
//     "
//                               >
//                                 <p className="font-semibold text-gray-900 mb-1">
//                                   Status History
//                                 </p>

//                                 <p>
//                                   <span className="font-medium">Status:</span>{' '}
//                                   {STATUS_LABEL[getLastStatusHistory(q).status]}
//                                 </p>

//                                 <p>
//                                   <span className="font-medium">Updated By:</span>{' '}
//                                   {getLastStatusHistory(q).updatedBy?.name || 'N/A'}
//                                 </p>

//                                 <p>
//                                   <span className="font-medium">Role:</span>{' '}
//                                   {getLastStatusHistory(q).role || 'N/A'}
//                                 </p>


//                                 <p>
//                                   <span className="font-medium">At:</span>{' '}
//                                   {new Date(getLastStatusHistory(q).at).toLocaleString('en-IN')}
//                                 </p>
//                               </div>
//                             )}

//                           </div>
//                         )}
//                       </td>

//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {q.createdBy?.name || 'N/A'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {new Date(q.createdAt).toLocaleDateString()}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-center">
//                         <button
//                           onClick={() => setOpenMenu(openMenu === q._id ? null : q._id)}
//                           className="p-2 rounded-lg hover:bg-gray-100"
//                         >
//                           <MoreVertical className="w-4 h-4" />
//                         </button>


//                         {/* Dropdown */}
//                         {openMenu === q._id && (
//                           <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50">

//                             {hasPermission('quotation', 'read') && (
//                               <button
//                                 onClick={() => router.push(`/dashboard/quotations/view?id=${q._id}`)}
//                                 className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
//                               >
//                                 <Eye className="w-4 h-4" /> View
//                               </button>
//                             )}

//                             {hasPermission('quotation', 'update') && (
//                               <button
//                                 onClick={() => router.push(`/dashboard/quotations/edit?id=${q._id}`)}
//                                 className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
//                               >
//                                 <Pencil className="w-4 h-4" /> Edit
//                               </button>
//                             )}

//                             {q.status === 'in_process' && hasPermission('quotation', 'update') && (
//                               <>
//                                 <button
//                                   onClick={() => handleStatusUpdate(q._id, 'complete')}
//                                   className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50"
//                                 >
//                                   <CheckCircle2 className="w-4 h-4" /> Mark Complete
//                                 </button>

//                                 <button
//                                   onClick={() => handleStatusUpdate(q._id, 'failed')}
//                                   className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
//                                 >
//                                   <XCircle className="w-4 h-4" /> Mark Failed
//                                 </button>
//                               </>
//                             )}

//                             {hasPermission('quotation', 'delete') && (
//                               <button
//                                 onClick={() => handleDelete(q._id)}
//                                 className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                               >
//                                 <Trash2 className="w-4 h-4" /> Delete
//                               </button>
//                             )}
//                           </div>
//                         )}


//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Card View */}
//             <div className="md:hidden divide-y divide-gray-200">
//               {quotations.map((q) => (
//                 <div key={q._id} className="p-4 hover:bg-gray-50 transition-colors">
//                   <div className="flex justify-between items-start mb-3">
//                     <div>
//                       <span className="text-sm font-semibold text-gray-900">{q.quotationNumber}</span>
//                       <div className="text-sm text-gray-500 mt-1">{new Date(q.createdAt).toLocaleDateString()}</div>
//                     </div>
//                     {q.status === 'in_process' ? (
//                       <span
//                         className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg ${getStatusBadge(q.status)}`}
//                       >
//                         In Process
//                       </span>
//                     ) : (
//                       <button
//                         onClick={() => setStatusInfo(q)}
//                         className={`px-3 py-1.5 inline-flex text-xs font-semibold rounded-lg ${getStatusBadge(q.status)}`}
//                       >
//                         {STATUS_LABEL[q.status] || 'Unknown'}

//                       </button>
//                     )}

//                   </div>

//                   <div className="mb-3">
//                     <div className="text-sm font-medium text-gray-900">{q.customerName}</div>
//                     <div className="text-sm text-gray-500">{q.customerEmail}</div>
//                   </div>

//                   <div className="flex justify-between items-center mb-3">
//                     <span className="text-sm font-bold text-gray-900">
//                       ₹{Number(q.total).toLocaleString('en-IN')}
//                     </span>
//                     <span className="text-sm text-gray-600">
//                       {q.createdBy?.name || 'N/A'}
//                     </span>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     {hasPermission('quotation', 'read') && (
//                       <button
//                         onClick={() => router.push(`/dashboard/quotations/view?id=${q._id}`)}
//                         className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
//                       >
//                         <Eye className="w-4 h-4" />
//                         View
//                       </button>
//                     )}

//                     {hasPermission('quotation', 'update') && (
//                       <button
//                         onClick={() => router.push(`/dashboard/quotations/edit?id=${q._id}`)}
//                         className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
//                       >
//                         <Pencil className="w-4 h-4" />
//                         Edit
//                       </button>
//                     )}

//                     {q.status === 'in_process' && hasPermission('quotation', 'update') && (
//                       <>
//                         <button
//                           onClick={() => handleStatusUpdate(q._id, 'complete')}
//                           className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-green-700 bg-green-50 rounded-lg"
//                         >
//                           <CheckCircle2 className="w-4 h-4" />
//                           Complete
//                         </button>

//                         <button
//                           onClick={() => handleStatusUpdate(q._id, 'failed')}
//                           className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-700 bg-red-50 rounded-lg"
//                         >
//                           <XCircle className="w-4 h-4" />
//                           Failed
//                         </button>
//                       </>
//                     )}


//                     {hasPermission('quotation', 'delete') && (
//                       <button
//                         onClick={() => handleDelete(q._id)}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     )}

//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex flex-col sm:flex-row justify-end items-center gap-4 px-4 sm:px-6 py-4 border-t border-gray-200">


//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     Previous
//                   </button>

//                   <div className="flex items-center gap-1">
//                     {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                       let pageNum;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }

//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => setCurrentPage(pageNum)}
//                           className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === pageNum
//                             ? 'bg-gray-900 text-white'
//                             : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
//                             }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <button
//                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                     className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}

//             {statusInfo && (
//               <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden">
//                 <div className="w-full bg-white rounded-t-2xl p-5 animate-slide-up">

//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       Status Details
//                     </h3>
//                     <button
//                       onClick={() => setStatusInfo(null)}
//                       className="text-gray-500 text-xl"
//                     >
//                       ✕
//                     </button>
//                   </div>

//                   {getLastStatusHistory(statusInfo) ? (
//                     <div className="space-y-2 text-sm text-gray-700">
//                       <p>
//                         <span className="font-medium">Status:</span>{' '}
//                         {STATUS_LABEL[statusInfo.status] || 'Unknown'}
//                       </p>
//                       <p>
//                         <span className="font-medium">Updated By:</span>{' '}
//                         {getLastStatusHistory(statusInfo).updatedBy?.name || 'N/A'}
//                       </p>
//                       <p>
//                         <span className="font-medium">Role:</span>{' '}
//                         {getLastStatusHistory(statusInfo).role || 'N/A'}
//                       </p>

//                       <p>
//                         <span className="font-medium">At:</span>{' '}
//                         {new Date(getLastStatusHistory(statusInfo).at).toLocaleString('en-IN')}
//                       </p>
//                     </div>
//                   ) : (
//                     <p className="text-sm text-gray-500">
//                       No status history available
//                     </p>
//                   )}
//                 </div>
//               </div>
//             )}

//           </div>
//         )
//         }
//       </div >
//     </div >
//   );
// }

'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { quotationAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  FileText,
  MoreVertical,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  AlertCircle,
  CheckCheck,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const STATUS_LABEL = {
  in_process: 'In Process',
  revised: 'Revised',
  complete: 'Complete',
  failed: 'Failed'
};

const getStatusBadge = (status) => {
  return badges[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
};

const STATUS_COLORS = {
  in_process: {
    icon: 'bg-blue-100 text-blue-600',
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 border-blue-200'
  },
  revised: {
    icon: 'bg-yellow-100 text-yellow-600',
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-50 border-yellow-200'
  },
  complete: {
    icon: 'bg-green-100 text-green-600',
    dot: 'bg-green-500',
    badge: 'bg-green-50 border-green-200'
  },
  failed: {
    icon: 'bg-red-100 text-red-600',
    dot: 'bg-red-500',
    badge: 'bg-red-50 border-red-200'
  }
};

// Helper Functions
const getStatusTimeline = (q) => q?.statusHistory || [];

const badges = {
  in_process: 'bg-blue-100 text-blue-700 border border-blue-200',
  revised: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  complete: 'bg-green-100 text-green-700 border border-green-200',
  failed: 'bg-red-100 text-red-700 border border-red-200'
};


const getStatusIcon = (status) => {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'failed':
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const diffSnapshot = (before, after) => {
  if (!before || !after) return null;

  const diff = {};
  ['customerName', 'customerEmail', 'customerPhone', 'customerAddress', 'total']
    .forEach((key) => {
      if (before[key] !== after[key]) {
        diff[key] = { old: before[key], new: after[key] };
      }
    });

  return Object.keys(diff).length ? diff : null;
};


// Status Timeline Component
function StatusTimeline({ statusInfo, onClose }) {
  if (!statusInfo) return null;

  const timeline = getStatusTimeline(statusInfo);

  return (
    <>
      {/* Desktop Overlay */}
      <div className="hidden md:block fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          className="absolute right-8 top-20 w-[480px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Status History</h3>
                <p className="text-xs text-gray-500 mt-0.5">Track all changes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Timeline Content */}
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {timeline.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No status changes yet</p>
              </div>
            ) : (
              <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-gray-200" />

                {timeline.map((step, i, arr) => {
                  const diff = diffSnapshot(
                    step.snapshot?.before,
                    step.snapshot?.after
                  );

                  const colors = STATUS_COLORS[step.status] || {
                    icon: 'bg-gray-100 text-gray-600',
                    dot: 'bg-gray-400',
                    badge: 'bg-gray-50 border-gray-200'
                  };

                  const statusIcon =
                    step.status === 'complete' ? (
                      <CheckCheck className="w-5 h-5" />
                    ) : step.status === 'failed' ? (
                      <XCircle className="w-5 h-5" />
                    ) : step.status === 'revised' ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    );

                  return (
                    <div key={i} className="relative pl-20">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[27px] top-1.5 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${colors.icon} shadow-md`}>
                        {statusIcon}
                      </div>

                      {/* Card */}
                      <div className={`border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 ${colors.badge}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900 text-sm">
                            {STATUS_LABEL[step.status]}
                          </span>
                          <span className="text-xs text-gray-600 bg-white/60 px-2.5 py-1 rounded-lg">
                            {new Date(step.at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit'
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 mb-3 flex items-center gap-1.5">
                          <span className="font-medium">{step.updatedBy?.name}</span>
                          <span className="text-gray-400">•</span>
                          <span>{new Date(step.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>

                        {diff && Object.keys(diff).length > 0 && (
                          <div className="mt-4 space-y-2 border-t border-gray-300/30 pt-3">
                            <p className="text-xs font-medium text-gray-700">Changes:</p>
                            {Object.entries(diff).map(([k, v]) => (
                              <div
                                key={k}
                                className="bg-white/70 rounded-lg p-2.5 text-xs grid grid-cols-2 gap-2"
                              >
                                <div>
                                  <p className="text-gray-500 uppercase tracking-wide text-[10px] font-semibold mb-1">
                                    {k}
                                  </p>
                                  <p className="text-red-500 line-through text-xs">
                                    {String(v.old).substring(0, 20)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 uppercase tracking-wide text-[10px] font-semibold mb-1">
                                    New Value
                                  </p>
                                  <p className="text-green-600 font-semibold text-xs">
                                    {String(v.new).substring(0, 20)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden fixed inset-0 z-50">
        <div
          className="fixed inset-0 bg-black/40"
          onClick={onClose}
        />
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-96 duration-300">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1.5 w-12 rounded-full bg-gray-300" />
          </div>

          {/* Content */}
          <div className="max-h-[75vh] overflow-y-auto px-4 pb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Status History</h3>
            </div>

            {timeline.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No status changes yet</p>
              </div>
            ) : (
              <div className="space-y-4 relative border-l-2 border-blue-300 pl-4">
                {timeline.map((step, i, arr) => {
                  const diff = diffSnapshot(
                    step.snapshot?.before,
                    step.snapshot?.after
                  );

                  const colors = STATUS_COLORS[step.status];

                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[13px] top-1.5 w-3.5 h-3.5 rounded-full ${colors.dot} border-4 border-white`} />
                      <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-gray-900">
                            {STATUS_LABEL[step.status]}
                          </span>
                          <span className="text-xs text-gray-600">
                            {new Date(step.at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {step.updatedBy?.name} • {new Date(step.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {diff && Object.entries(diff).map(([k, v]) => (
                          <div key={k} className="bg-white p-2 rounded-lg text-xs mb-2">
                            <p className="text-gray-500 mb-1 font-medium">{k}</p>
                            <div className="flex gap-2">
                              <span className="text-red-500 line-through">{String(v.old).substring(0, 15)}</span>
                              <span className="text-green-600 font-semibold">{String(v.new).substring(0, 15)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Action Menu Component - SIMPLE AND RELIABLE
function ActionMenu({
  quotation,
  buttonRect,
  onClose,
  onView,
  onEdit,
  onDelete,
  onStatusUpdate,
  hasPermissions
}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!buttonRect) return;

    const updatePosition = () => {
      const padding = 16;
      const gap = 8;
      const menuWidth = 224; // w-56
      const approxMenuHeight = 200; // safe fixed height

      let newPos = {};

      /* =========================
         HORIZONTAL (Responsive)
      ========================= */
      if (window.innerWidth >= 768) {
        const rightSpace = window.innerWidth - buttonRect.right;

        if (rightSpace >= menuWidth + padding) {
          newPos.right = rightSpace;
          newPos.left = 'auto';
        } else {
          newPos.left = Math.max(padding, buttonRect.left - menuWidth - gap);
          newPos.right = 'auto';
        }
      } else {
        // Mobile → full width with padding
        newPos.left = padding;
        newPos.right = padding;
      }

      /* =========================
         VERTICAL (FIXED LOGIC 🔥)
      ========================= */
      const screenMid = window.innerHeight / 2;

      if (buttonRect.top > screenMid) {
        // 👆 last rows → open UP
        newPos.top = buttonRect.top - approxMenuHeight;
      } else {
        // 👇 top rows → open DOWN
        newPos.top = buttonRect.bottom + gap;
      }

      setPosition(newPos);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => window.removeEventListener('resize', updatePosition);
  }, [buttonRect]);

  if (!position) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        ref={menuRef}
        className="fixed z-50 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: `${position.top}px`,
          left: position.left !== 'auto' ? `${position.left}px` : 'auto',
          right: position.right !== 'auto' ? `${position.right}px` : 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {hasPermissions.read && (
          <button
            onClick={() => {
              onView();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-blue-50 border-b"
          >
            <Eye className="w-4 h-4 text-blue-600" />
            View
          </button>
        )}

        {hasPermissions.update && (
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-purple-50 border-b"
          >
            <Pencil className="w-4 h-4 text-purple-600" />
            Edit
          </button>
        )}

        {['in_process', 'revised'].includes(quotation.status) &&
          hasPermissions.update && (
            <>
              <button
                onClick={() => {
                  onStatusUpdate('complete');
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-green-50 border-b"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Mark Complete
              </button>

              <button
                onClick={() => {
                  onStatusUpdate('failed');
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-red-50 border-b"
              >
                <XCircle className="w-4 h-4 text-red-600" />
                Mark Failed
              </button>
            </>
          )}

        {hasPermissions.delete && (
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            Delete
          </button>
        )}
      </div>
    </>
  );
}


// Confirmation Dialog Component
function ConfirmDialog({ dialog, onConfirm, onCancel }) {
  if (!dialog) return null;

  const isDangerous = dialog.type === 'delete' || dialog.isDangerous;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 animate-in zoom-in-95 duration-300">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isDangerous ? 'bg-red-100' : 'bg-blue-100'}`}>
              {isDangerous ? (
                <AlertCircle className={`w-6 h-6 ${isDangerous ? 'text-red-600' : 'text-blue-600'}`} />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{dialog.title}</h2>
              <p className="text-sm text-gray-600">{dialog.message}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            >
              {dialog.cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-3 text-sm font-medium text-white rounded-lg transition-colors duration-150 ${isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {dialog.confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Main Quotations Page Component
export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusInfo, setStatusInfo] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [buttonRect, setButtonRect] = useState(null);
  const [total, setTotal] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const limit = 10;
  const router = useRouter();
  const { hasPermission } = useAuth();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch quotations
  useEffect(() => {
    fetchQuotations(currentPage);
  }, [currentPage, debouncedSearch, statusFilter]);

  const fetchQuotations = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await quotationAPI.getAll({
        page,
        limit,
        search: debouncedSearch,
        status: statusFilter
      });
      setQuotations(data.quotations);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (e, quotationId) => {
    e.preventDefault();
    e.stopPropagation();

    if (openMenuId === quotationId) {
      // Close menu
      setOpenMenuId(null);
      setButtonRect(null);
    } else {
      // Open menu
      const rect = e.currentTarget.getBoundingClientRect();
      setButtonRect({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height
      });
      setOpenMenuId(quotationId);
    }
  };

  const handleStatusUpdate = (id, status) => {
    setConfirmDialog({
      type: 'status',
      id,
      status,
      title: `Mark as ${status === 'complete' ? 'Complete' : 'Failed'}?`,
      message: `This quotation will be marked as ${status}.`,
      confirmText: status === 'complete' ? 'Mark Complete' : 'Mark Failed',
      cancelText: 'Cancel',
      isDangerous: status === 'failed'
    });
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      type: 'delete',
      id,
      title: 'Delete Quotation?',
      message: 'This quotation will be moved to the recycle bin and cannot be recovered.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true
    });
  };

  const executeConfirmAction = async () => {
    try {
      if (confirmDialog.type === 'delete') {
        await quotationAPI.delete(confirmDialog.id);
        toast.success('Quotation deleted successfully');
        setOpenMenuId(null);
        setButtonRect(null);
        fetchQuotations();
      } else if (confirmDialog.type === 'status') {
        const { data } = await quotationAPI.updateStatus(confirmDialog.id, confirmDialog.status);
        toast.success('Status updated successfully');
       setQuotations(prev =>
  prev.map(q =>
    q._id === confirmDialog.id ? data.quotation : q
  )
);
        setOpenMenuId(null);
        setButtonRect(null);
      }
      setConfirmDialog(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasPermission('quotation', 'read')) {
    return (
      <div className="p-10 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">You do not have permission to view quotations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FileText className="w-6 h-6 text-[#007d58]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quotations</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and track all your quotations</p>
          </div>
        </div>
        {hasPermission('quotation', 'create') && (
          <Link
            href="/dashboard/quotations/create"
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-[#1a1d29] text-white rounded-lg hover:bg-[#2a2d39] transition-all text-sm font-medium whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Create Quotation
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
          />
        </div>

        <div className="w-full sm:w-auto relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="in_process">In Process</option>
            <option value="revised">Revised</option>
            <option value="complete">Complete</option>
            <option value="failed">Failed</option>

          </select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        {quotations.length === 0 ? (
          <div className="p-8 sm:p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotations found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first quotation</p>
            {hasPermission('quotation', 'create') && (
              <Link
                href="/dashboard/quotations/create"
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Quotation
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
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
                  {quotations.map((q) => (
                    <tr key={q._id} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{q.quotationNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{q.customerName}</div>
                        <div className="text-xs text-gray-500">{q.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{Number(q.total).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setStatusInfo(q)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg ${getStatusBadge(
                            q.status
                          )} hover:shadow-md transition-all cursor-pointer`}
                        >
                          {getStatusIcon(q.status)}
                          {STATUS_LABEL[q.status]}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{q.createdBy?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(q.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={(e) => handleMenuClick(e, q._id)}
                          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-all group inline-flex"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
                        </button>

                        {openMenuId === q._id && buttonRect && (
                          <ActionMenu
                            quotation={q}
                            buttonRect={buttonRect}
                            onClose={() => {
                              setOpenMenuId(null);
                              setButtonRect(null);
                            }}
                            onView={() => router.push(`/dashboard/quotations/view?id=${q._id}`)}
                            onEdit={() => router.push(`/dashboard/quotations/edit?id=${q._id}`)}
                            onDelete={() => handleDelete(q._id)}
                            onStatusUpdate={(status) => handleStatusUpdate(q._id, status)}
                            hasPermissions={{
                              read: hasPermission('quotation', 'read'),
                              update: hasPermission('quotation', 'update'),
                              delete: hasPermission('quotation', 'delete')
                            }}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {quotations.map((q) => (
                <div key={q._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{q.quotationNumber}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(q.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <button
                      onClick={() => setStatusInfo(q)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${getStatusBadge(q.status)}`}
                    >
                      {STATUS_LABEL[q.status]}
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-900">{q.customerName}</div>
                    <div className="text-xs text-gray-500">{q.customerEmail}</div>
                  </div>

                  <div className="flex justify-between mb-4">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{Number(q.total).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-600">{q.createdBy?.name || 'N/A'}</span>
                  </div>

                  <button
                    onClick={(e) => handleMenuClick(e, q._id)}
                    className="w-full py-2.5 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Actions
                  </button>

                  {openMenuId === q._id && buttonRect && (
                    <ActionMenu
                      quotation={q}
                      buttonRect={buttonRect}
                      onClose={() => {
                        setOpenMenuId(null);
                        setButtonRect(null);
                      }}
                      onView={() => router.push(`/dashboard/quotations/view?id=${q._id}`)}
                      onEdit={() => router.push(`/dashboard/quotations/edit?id=${q._id}`)}
                      onDelete={() => handleDelete(q._id)}
                      onStatusUpdate={(status) => handleStatusUpdate(q._id, status)}
                      hasPermissions={{
                        read: hasPermission('quotation', 'read'),
                        update: hasPermission('quotation', 'update'),
                        delete: hasPermission('quotation', 'delete')
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                          className={`px-3 py-2 text-sm rounded-lg transition-all ${currentPage === pageNum
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
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
                    className="p-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600 order-first sm:order-last">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Timeline Modal */}
      <StatusTimeline
        statusInfo={statusInfo}
        onClose={() => setStatusInfo(null)}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        dialog={confirmDialog}
        onConfirm={executeConfirmAction}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}