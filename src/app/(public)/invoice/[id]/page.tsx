"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Printer, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PublicInvoicePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoiceRes, settingsRes] = await Promise.all([
          fetch(`/api/invoices?id=${id}`),
          fetch(`/api/admin/settings`)
        ]);
        
        const invoiceData = await invoiceRes.json();
        const settingsData = await settingsRes.json();
        
        // If invoiceData is an array, find the one
        const invoice = Array.isArray(invoiceData) ? invoiceData.find((i: any) => i.id === id) : invoiceData;
        
        if (invoice) {
          // Fetch order details
          const orderRes = await fetch(`/api/orders?id=${invoice.orderId}`);
          const orderData = await orderRes.json();
          const order = Array.isArray(orderData) ? orderData.find((o: any) => o.id === invoice.orderId) : orderData;
          
          setData({ invoice, order, settings: settingsData });
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Load html2pdf script
    if (typeof window !== "undefined" && !document.getElementById("html2pdf-script")) {
      const script = document.createElement("script");
      script.id = "html2pdf-script";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else if (typeof window !== "undefined" && (window as any).html2pdf) {
      setScriptLoaded(true);
    }
  }, [id]);

  if (loading) return <div className="p-20 text-center">Memuat Invoice...</div>;
  if (!data || !data.invoice) return <div className="p-20 text-center text-red-500">Invoice tidak ditemukan.</div>;

  const { invoice, order, settings } = data;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById("invoice-sheet");
    if (!element) return;
    
    const opt = {
      margin: 0,
      filename: `Invoice-${invoice.externalId || invoice.id.substring(0, 8)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false, 
        letterRendering: true,
        allowTaint: true
      },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    try {
      // @ts-ignore
      const exporter = window.html2pdf || (window as any).html2pdf;
      if (exporter) {
        exporter().set(opt).from(element).save();
      } else {
        // Fallback to print if library is still not available
        window.print();
      }
    } catch (err) {
      console.error("PDF Download error:", err);
      window.print();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.externalId}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link invoice berhasil disalin!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 print:bg-white print:py-0">
      {/* Controls - Hidden on print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center px-4 print:hidden">
        <h1 className="text-xl font-bold text-gray-800">Preview Invoice</h1>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button size="sm" onClick={handleDownload} className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Sheet */}
      <div id="invoice-sheet" className="max-w-4xl mx-auto bg-white shadow-xl min-h-[11in] relative overflow-hidden print:shadow-none print:w-full">
        {/* Status Ribbon */}
        <div className={cn(
          "absolute top-10 -right-16 w-64 py-2 text-center text-white font-bold text-xl rotate-45 uppercase tracking-widest shadow-lg",
          invoice.status === "PAID" ? "bg-[#34a853]" : "bg-[#ea4335]"
        )}>
          {invoice.status}
        </div>

        {/* Header */}
        <div className="p-12 pb-6 flex justify-between items-start">
          <div className="space-y-4">
            {settings.companyLogo ? (
              <img src={settings.companyLogo} alt={settings.companyName} className="h-16 object-contain" />
            ) : (
              <h2 className="text-3xl font-black text-[#1a73e8] tracking-tighter">{settings.companyName}</h2>
            )}
            <p className="text-sm text-gray-500 max-w-[300px] leading-relaxed whitespace-pre-line">
              {settings.companyAddress}
            </p>
          </div>
          <div className="text-right pt-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">INVOICE</h1>
            <p className="text-gray-500 font-mono">#{invoice.externalId || invoice.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="px-12 py-8 bg-gray-50/50 border-y border-gray-100 grid grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Invoiced To</p>
            <div className="space-y-1">
              <p className="font-bold text-gray-800 text-lg">{order.userName}</p>
              <p className="text-gray-600 text-sm">{order.userEmail}</p>
              {order.whoisData && (
                <p className="text-gray-500 text-xs leading-relaxed max-w-[250px]">
                  {order.whoisData.address}, {order.whoisData.city}<br />
                  {order.whoisData.zipCode}, Indonesia
                </p>
              )}
            </div>
          </div>
          <div className="text-right space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice Date</p>
              <p className="text-gray-800 font-medium">{format(new Date(invoice.createdAt), "dd MMM yyyy")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Due Date</p>
              <p className="text-[#ea4335] font-bold">{format(new Date(invoice.expiresAt), "dd MMM yyyy")}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="px-6 py-3 text-left font-bold uppercase text-[10px] tracking-widest">Description</th>
                <th className="px-6 py-3 text-right font-bold uppercase text-[10px] tracking-widest w-40">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-x border-b border-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-8">
                  <p className="font-bold text-gray-800 text-base mb-1">{order.productName}</p>
                  <p className="text-gray-500 text-xs font-mono">{order.domainName}</p>
                  {order.billingCycle && (
                    <p className="text-gray-400 text-[10px] uppercase mt-2">Billing Cycle: {order.billingCycle}</p>
                  )}
                </td>
                <td className="px-6 py-8 text-right font-bold text-gray-800 text-base">
                  Rp {(invoice.totalAmount || invoice.amount || 0).toLocaleString("id-ID")}
                </td>
              </tr>
              {/* If there's extra fees (like PPN) we could add here */}
              <tr className="bg-gray-50/50">
                <td className="px-6 py-4 text-right font-bold text-gray-500 uppercase text-[10px] tracking-widest">Sub Total</td>
                <td className="px-6 py-4 text-right font-bold text-gray-800">Rp {(invoice.totalAmount || invoice.amount || 0).toLocaleString("id-ID")}</td>
              </tr>
              <tr className="bg-gray-100/50">
                <td className="px-6 py-6 text-right font-black text-gray-800 uppercase text-xs tracking-widest">Grand Total</td>
                <td className="px-6 py-6 text-right font-black text-[#1a73e8] text-xl">Rp {invoice.totalAmount?.toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Transactions */}
        <div className="px-12 py-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#1a73e8] rounded-full" />
            Transactions
          </h3>
          <table className="w-full text-xs text-gray-500">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2 text-left font-bold">Date</th>
                <th className="py-2 text-left font-bold">Gateway</th>
                <th className="py-2 text-left font-bold">Transaction ID</th>
                <th className="py-2 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.status === "PAID" ? (
                <tr>
                  <td className="py-3">{format(new Date(invoice.updatedAt || invoice.createdAt), "dd MMM yyyy HH:mm")}</td>
                  <td className="py-3">Xendit Gateway</td>
                  <td className="py-3 font-mono">{invoice.xenditInvoiceId}</td>
                  <td className="py-3 text-right font-bold text-gray-800">Rp {invoice.totalAmount?.toLocaleString("id-ID")}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center italic text-gray-400">No related transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="absolute bottom-12 left-0 right-0 px-12 flex justify-between items-end border-t border-gray-100 pt-8 mx-12">
          <div>
            <p className="text-[10px] text-gray-400 italic">Generated by {settings.companyName} Billing System</p>
            <p className="text-[10px] text-gray-400 italic">{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
          </div>
          {invoice.status === "PAID" && (
            <div className="bg-[#34a853]/10 border border-[#34a853]/20 px-4 py-2 rounded-lg flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-[#34a853]/20 flex items-center justify-center text-[#34a853]">
                 <Printer className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-[#34a853] uppercase">Payment Verified</p>
                 <p className="text-[10px] text-gray-500 italic">This is a computer generated document.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .min-h-screen { background: white !important; padding: 0 !important; }
          button, .print-hidden { display: none !important; }
          .shadow-xl { box-shadow: none !important; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
