'use client';
import { useState, useEffect } from 'react';
import { quotationAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Mail, Phone, MapPin, Download, Trash2, Printer } from 'lucide-react';

export default function ViewQuotationPage() {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchQuotation();
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      const { data } = await quotationAPI.getOne(params.id);
      setQuotation(data.quotation);
    } catch (error) {
      toast.error('Failed to load quotation');
      router.push('/dashboard/quotations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quotation?')) return;
    try {
      await quotationAPI.delete(params.id);
      toast.success('Quotation deleted successfully');
      router.push('/dashboard/quotations');
    } catch {
      toast.error('Failed to delete quotation');
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      doc.addImage('/letterhead.png.jpeg', 'JPEG', 0, 0, pageWidth, pageHeight);

      let yPos = 95;
      const leftMargin = 20;
      const rightMargin = 20;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('QUOTATION', pageWidth / 2, yPos, { align: 'center' });

      yPos += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Quotation No: ${quotation.quotationNumber}`, pageWidth - rightMargin, yPos, { align: 'right' });
      yPos += 6;
      doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, pageWidth - rightMargin, yPos, { align: 'right' });

      yPos += 14;
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', leftMargin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(quotation.customerName, leftMargin, yPos);
      if (quotation.customerEmail) { yPos += 5; doc.text(quotation.customerEmail, leftMargin, yPos); }
      if (quotation.customerPhone) { yPos += 5; doc.text(quotation.customerPhone, leftMargin, yPos); }
      if (quotation.customerAddress) { yPos += 5; doc.text(doc.splitTextToSize(quotation.customerAddress, 80), leftMargin, yPos); }

      yPos += 18;
      doc.autoTable({
        startY: yPos,
        margin: { left: leftMargin, right: rightMargin },
        head: [['Description','Qty','Rate (₹)','Tax (%)','Amount (₹)']],
        body: quotation.items.map(i => [i.description,i.quantity.toString(),i.rate.toFixed(2),i.tax.toFixed(2),i.amount.toFixed(2)]),
        styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
        headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold', halign: 'center' },
        columnStyles: {0:{cellWidth:70,halign:'left'},1:{cellWidth:15,halign:'center'},2:{cellWidth:25,halign:'right'},3:{cellWidth:20,halign:'center'},4:{cellWidth:30,halign:'right'}},
        theme: 'grid'
      });

      yPos = doc.lastAutoTable.finalY + 12;
      const totalsX = pageWidth - rightMargin - 60;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      doc.text('Subtotal:', totalsX, yPos);
      doc.text(`₹ ${quotation.subtotal.toFixed(2)}`, pageWidth - rightMargin, yPos, { align: 'right' });
      yPos += 6;
      doc.text('Tax:', totalsX, yPos);
      doc.text(`₹ ${quotation.tax.toFixed(2)}`, pageWidth - rightMargin, yPos, { align: 'right' });
      yPos += 8; doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
      doc.text('Total:', totalsX, yPos);
      doc.text(`₹ ${quotation.total.toFixed(2)}`, pageWidth - rightMargin, yPos, { align: 'right' });

      if (quotation.notes) {
        yPos += 15;
        doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text('Notes:', leftMargin, yPos);
        yPos += 5;
        doc.setFont('helvetica','normal');
        doc.text(doc.splitTextToSize(quotation.notes, pageWidth - leftMargin - rightMargin), leftMargin, yPos);
      }

      doc.save(`Quotation-${quotation.quotationNumber}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error(error); toast.error('PDF generation failed');
    } finally { setDownloading(false); }
  };

  const printQuotation = () => window.print();

  const getStatusBadge = (status) => {
    const badges = { 
      draft: 'bg-yellow-100 text-yellow-700', 
      sent: 'bg-blue-100 text-blue-700', 
      accepted: 'bg-green-100 text-green-700', 
      rejected: 'bg-red-100 text-red-700' 
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
    </div>
  );

  if (!quotation) return null;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link href="/dashboard/quotations" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Quotations
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Quotation {quotation.quotationNumber}</h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${getStatusBadge(quotation.status)}`}>
              {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" /> {new Date(quotation.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={downloadPDF} 
            disabled={downloading} 
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium text-sm"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Download className="w-4 h-4"/> 
                Download PDF
              </>
            )}
          </button>
          <button 
            onClick={printQuotation} 
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button 
            onClick={handleDelete} 
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Name</p>
                <p className="font-semibold text-gray-900 text-base">{quotation.customerName}</p>
                {quotation.customerCompanyName && (
                  <p className="text-sm font-medium text-gray-700 mt-1">{quotation.customerCompanyName}</p>
                )}
              </div>
              {quotation.customerEmail && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-gray-500" /> 
                  <span className="text-sm">{quotation.customerEmail}</span>
                </div>
              )}
              {quotation.customerPhone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-500" /> 
                  <span className="text-sm">{quotation.customerPhone}</span>
                </div>
              )}
              {quotation.customerAddress && (
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" /> 
                  <span className="text-sm">{quotation.customerAddress}</span>
                </div>
              )}
              {quotation.shippingDetails && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Shipping Details:</p>
                  <p className="text-sm text-blue-800">{quotation.shippingDetails}</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotation.items.map((item,i)=>(
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.description}
                        {item.tax > 0 && (
                          <span className="block text-xs text-gray-500 mt-1">Tax: {item.tax}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">₹{item.rate.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="max-w-xs ml-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{quotation.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold text-gray-900">₹{quotation.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-200">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">₹{quotation.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quotation.notes && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{quotation.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-5">Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Created By</p>
                <p className="font-medium text-gray-900">{quotation.createdBy?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Created At</p>
                <p className="font-medium text-gray-900">{new Date(quotation.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Last Updated</p>
                <p className="font-medium text-gray-900">{new Date(quotation.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}