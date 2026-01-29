'use client';
import { useState, useEffect } from 'react';
import { quotationAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Mail, Phone, MapPin, Download, Trash2, FileSpreadsheet } from 'lucide-react';

export default function ViewQuotationPage() {
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    fetchQuotation();
  }, [id]);
  const fetchQuotation = async () => {
    try {
      const { data } = await quotationAPI.getOne(id);
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
      await quotationAPI.delete(id);
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
      const leftMargin = 30;
      const rightMargin = 20;

      /* ================= HELPER ================= */
      const getItemDescription = (item) => {
        let text = '';

        // ITEM NAME
        text += `${item.productName}\n`;

        // MAKE
        if (item.description) {
          text += `Make: ${item.description}\n`;
        }

        // PARAMETERS
        if (item.parameters?.length) {
          text += `\nParameters:\n`;

          item.parameters.forEach(param => {
            text += `• ${param.title}\n`;

            param.specs.forEach(s => {
              text += `   ${s.label} : ${s.value}\n`;
            });
          });
        }

        // GENERAL SPECIFICATIONS
        if (item.generalSpecifications?.length) {
          text += `\nGeneral Specification:\n`;
          item.generalSpecifications.forEach(gs => {
            text += `• ${gs.text}\n`;
          });
        }


        // NOTES 
        if (quotation.notes) {
          text += `\nNotes:\n`;
          quotation.notes.split('\n').forEach(n => {
            text += `• ${n}\n`;
          });
        }
        return text.trim();
      };


      // ================= PAGE 1 =================
      doc.addImage('/letterhead-image.jpeg', 'JPEG', 0, 0, pageWidth, pageHeight);

      let y = 65;

      // TO
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.text('To', leftMargin, y);
      y += 6;

      // CUSTOMER NAME
      doc.setFontSize(11);
      doc.text(`Mr ${quotation.customerName}`, leftMargin, y);
      y += 6;

      // COMPANY NAME
      if (quotation.customerCompanyName) {
        doc.setFontSize(11);
        doc.text(quotation.customerCompanyName, leftMargin, y);
        y += 6;
      }

      // COUNTRY
      doc.text('India.', leftMargin, y);

      // WHITE SPACE AFTER TO BLOCK
      // y += 22;

      // -------- RIGHT SIDE DATE & REF (SAFE) --------
      const rightX = pageWidth - rightMargin;

      doc.setTextColor(0, 51, 153);
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.text(
        `Quotation Date: ${new Date(quotation.createdAt).toLocaleDateString('en-GB')}`,
        rightX,
        y - 30,
        { align: 'right' }
      );

      y += 6;

      doc.text(
        `Quotation Ref: ${quotation.quotationNumber}`,
        rightX,
        y - 30,
        { align: 'right' }
      );

      doc.setTextColor(0, 0, 0);
      doc.setFont('times', 'normal');


      // GAP BEFORE SUBJECT
      y += 20;

      // SUBJECT
      const productName =
        quotation.items[0]?.productName ||
        quotation.items[0]?.description ||
        'Product';

      doc.setFont('times', 'bold');
      doc.setFontSize(11);

      // 1️⃣ "Sub:" → BLACK
      doc.setTextColor(0, 0, 0);
      doc.text('Sub:', leftMargin, y);

      let x = leftMargin + doc.getTextWidth('Sub: ');

      // 2️⃣ Middle text → BLUE
      doc.setTextColor(0, 51, 153);
      const middleText = 'Quotation as per your requirement ';
      doc.text(middleText, x, y);

      x += doc.getTextWidth(middleText);

      // 3️⃣ Product name → BLACK
      doc.setTextColor(0, 0, 0);
      doc.text(`${productName}.`, x, y);

      // reset (important)
      doc.setFont('times', 'normal');


      // GAP BEFORE BODY (watermark safe)
      y += 18;

      doc.setFont('times', 'normal');
      doc.setFontSize(11);

      const maxWidth = pageWidth - leftMargin - rightMargin;
      const lineHeight = 5;

      doc.text('Dear Sir,', leftMargin, y);
      y += lineHeight * 2;

      // Full paragraph with inline bold productName
      const fullPara = `In response to your inquiry for ${productName}, we are pleased to submit herewith our Company Quotation. We are pleased to provide the best offer for your requirement. We hope you will find our proposal in line with your requirement and our prices competitive.
Assuring you of our best services and looking forward to build a long-term business relation with your esteemed organization. For any further assistance please feel free to contact us. We look forward to receiving your valuable order and ensure our best attention to your requirement.`;

      // Split full paragraph to lines using full maxWidth
      let allLines = doc.splitTextToSize(fullPara, maxWidth);

      // Render lines with inline bold handling for first line (productName)
      let currentY = y;
      for (let i = 0; i < allLines.length; i++) {
        let lineText = allLines[i];
        let renderX = leftMargin;

        // Check if this line contains productName and needs inline bold (typically first line)
        if (i === 0 && productName && fullPara.includes(productName)) {
          // Split first line around productName for inline bold
          const beforeProduct = lineText.split(productName)[0];
          const afterProduct = lineText.split(productName)[1] || '';

          // Render before part (normal)
          if (beforeProduct) {
            doc.text(beforeProduct, renderX, currentY);
            renderX += doc.getTextWidth(beforeProduct);
          }

          // Render productName (bold)
          doc.setFont('times', 'bold');
          doc.text(productName, renderX, currentY);
          renderX += doc.getTextWidth(productName);
          doc.setFont('times', 'normal');

          // Render after part (normal)
          if (afterProduct) {
            doc.text(afterProduct, renderX, currentY);
          }
        } else {
          // Normal line
          doc.text(lineText, renderX, currentY);
        }

        currentY += lineHeight;
      }

      y = currentY + 10;


      // ================= CLOSING + SIGNATURE (ONE BLOCK) =================
      const closingFontSize = 11;
      const lh = 5;

      doc.setFontSize(closingFontSize);
      doc.setFont('times', 'normal');

      // Small gap after body
      y += lh * 2;

      // Thanking you
      doc.text('Thanking you in advance', leftMargin, y);
      y += lh;

      // Yours faithfully
      doc.text('Yours faithfully,', leftMargin, y);
      y += lh;

      // Company name (bold but SAME size)
      doc.setFont('times', 'normal');
      doc.text('Quick Engineering Solutions', leftMargin, y);
      y += lh;

      // Person name
      doc.setFont('times', 'normal');
      doc.text(quotation.createdBy?.name || 'qes', leftMargin, y);
      y += lh;

      // Phone
      doc.text(
        `${String(quotation.createdBy.phone)}`,
        leftMargin,
        y
      );



      // ================= PAGE 2 =================
      doc.addPage();

      // Title
      doc.setFont('times', 'normal');
      doc.setFontSize(20);
      doc.text('QUOTATION', pageWidth / 2, 30, { align: 'center' });

      let startY = 45;

      quotation.items.forEach((item, index) => {
        doc.autoTable({
          startY,

          head: [[
            'S No.',
            'Item Description',
            'Rate',
            'Qty',
            'Amount'
          ]],

          body: [[
            index + 1,
            getItemDescription(item),
            `${item.rate}/-`,
            item.quantity,
            `${item.rate * item.quantity}/-`
          ]],

          theme: 'grid',

          headStyles: {
            fillColor: [0, 82, 155],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 10.5,
            halign: 'center',
            valign: 'middle',
            minCellHeight: 14,
            overflow: 'hidden'
          }, 

          styles: {
            fontSize: 10.5,        //bigger text
            cellPadding: 7,        //more space
            valign: 'top',
            lineHeight: 1.6,       //readability
            textColor: 30
          },

          bodyStyles: {
            minCellHeight: 12
          },

          columnStyles: {
            0: { cellWidth: 23, halign: 'center' },
            1: { cellWidth: 90 },      
            2: { cellWidth: 28, halign: 'center' },
            3: { cellWidth: 21, halign: 'center' },
            4: { cellWidth: 30, halign: 'right' }
          },

          didParseCell: function (data) {
            if (data.section === 'body' && data.column.index === 1) {
              data.cell.styles.cellPadding = {
                top: 4,
                right: 1,
                bottom: 4,
                left: 1
              };
            }
          }
        });

        startY = doc.lastAutoTable.finalY + 1;
      });

      // ================= TOTALS TABLE =================
      doc.autoTable({
        startY,

        body: [
          ['Installation Charges', `${quotation.installationCharges || 0}/-`],
          ['Freight Charges', `${quotation.freightCharges || 0}/-`],
          ['Sub Total', `${quotation.subtotal.toFixed(2)}/-`],
          ['GST %', `${quotation.tax.toFixed(2)}/-`],
          [
            {
              content: 'Grand Total',
              styles: {
                fillColor: [0, 82, 155],
                textColor: 255,
                fontStyle: 'bold',
                cellPadding: 2
              }
            },
            {
              content: `${quotation.total.toFixed(2)}/-`,
              styles: {
                fillColor: [0, 82, 155],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center',
                cellPadding: 2
              }
            }
          ]
        ],

        theme: 'grid',

        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: 0
        },

        columnStyles: {
          0: { cellWidth: 113 },
          1: { cellWidth: 76.2, halign: 'center' }
        }
      });



      // ================= PAGE 3 =================
      doc.addPage();
      doc.addImage('/pdf/terms-bank-clients.jpeg', 'JPEG', 0, 0, pageWidth, pageHeight);

      // ================= PAGE 4 =================
      doc.addPage();
      doc.addImage('/pdf/company-profile.jpeg', 'JPEG', 0, 0, pageWidth, pageHeight);

      doc.save(`Quotation-${quotation.quotationNumber}.pdf`);
      toast.success('PDF downloaded successfully');

    } catch (error) {
      console.error(error);
      toast.error('PDF generation failed');
    } finally {
      setDownloading(false);
    }
  };

  const downloadCSV = () => {
    try {
      // Prepare CSV headers
      const headers = ['Product Name', 'Description', 'Parameters', 'Quantity', 'Rate (₹)', 'Tax (%)', 'Amount (₹)'];

      // Prepare CSV rows
      const rows = quotation.items.map(item => {
        const parametersText = item.parameters?.length > 0
          ? item.parameters
            .map(p => `${p.title}: ${p.specs.map(s => `${s.label}=${s.value}`).join(', ')}`)
            .join(' | ')
          : '';

        const amount = (
          item.quantity * item.rate +
          (item.quantity * item.rate * (item.tax || 0)) / 100
        ).toFixed(2);

        return [
          `"${item.productName || ''}"`,
          `"${item.description || ''}"`,
          `"${parametersText}"`,
          item.quantity,
          item.rate.toFixed(2),
          (item.tax || 0).toFixed(2),
          amount
        ].join(',');
      });

      // Add summary rows
      const safeSubtotal = quotation.subtotal ?? quotation.items.reduce((s, i) => s + i.quantity * i.rate, 0);
      rows.push('');
      rows.push(`"Subtotal",,,,,,"₹${safeSubtotal.toFixed(2)}"`);
      rows.push(`"Tax",,,,,,"₹${quotation.tax.toFixed(2)}"`);
      rows.push(`"Total",,,,,,"₹${quotation.total.toFixed(2)}"`);

      // Add customer info at the top
      const customerInfo = [
        `"Quotation Number","${quotation.quotationNumber}"`,
        `"Date","${new Date(quotation.createdAt).toLocaleDateString()}"`,
        `"Customer Name","${quotation.customerName}"`,
        quotation.customerCompanyName && `"Company","${quotation.customerCompanyName}"`,
        quotation.customerEmail && `"Email","${quotation.customerEmail}"`,
        quotation.customerPhone && `"Phone","${quotation.customerPhone}"`,
        quotation.customerAddress && `"Address","${quotation.customerAddress}"`,
        quotation.shippingDetails && `"Shipping Details","${quotation.shippingDetails}"`,
        '',
        ''
      ].filter(Boolean);

      // Combine all parts
      const csv = [
        ...customerInfo,
        headers.join(','),
        ...rows
      ].join('\n');

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Quotation-${quotation.quotationNumber}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV downloaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('CSV generation failed');
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
    </div>
  );

  if (!quotation) return null;

  return (
    <div className="space-y-6 p-6 lg:p-8">
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
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download CSV
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
        <div className="lg:col-span-2 space-y-6">
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

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Parameters</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotation.items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.productName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.description}
                        {item.tax > 0 && (
                          <span className="block text-xs text-gray-500 mt-1">Tax: {item.tax}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.parameters?.length > 0 ? (
                          <div className="space-y-1">
                            {item.parameters.map((param, pi) => (
                              <div key={pi} className="text-xs">
                                <span className="font-semibold">{param.title}:</span>{" "}
                                {param.specs.map(s => `${s.label}: ${s.value}`).join(", ")}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">₹{item.rate.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        ₹{(
                          item.quantity * item.rate +
                          (item.quantity * item.rate * (item.tax || 0)) / 100
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="max-w-xs ml-auto space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{(
                    quotation.subtotal ??
                    quotation.items.reduce((s, i) => s + i.quantity * i.rate, 0)
                  ).toFixed(2)}
                  </span>
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

          {quotation.notes && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{quotation.notes}</p>
            </div>
          )}
        </div>

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