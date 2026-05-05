"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt, 
  TrendingUp, 
  Calendar,
  Search,
  Download,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminFinancePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidCount: 0,
  });

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      const allInvoices = Array.isArray(data) ? data : [];
      
      const paid = allInvoices.filter((inv: any) => inv.status === "PAID");
      const pending = allInvoices.filter((inv: any) => inv.status === "PENDING");
      
      const totalRevenue = paid.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
      const pendingAmount = pending.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
      
      setInvoices(allInvoices.slice(0, 20)); // Last 20 mutations
      setStats({
        totalRevenue,
        pendingAmount,
        paidCount: paid.length,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#1a73e8]" />
            Keuangan & Mutasi
          </h1>
          <p className="text-gray-500 mt-1">Pantau arus kas, pendapatan, dan status pembayaran invoice.</p>
        </div>

        <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white gap-2">
          <Download className="w-4 h-4" />
          Export Laporan
        </Button>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Pendapatan</CardDescription>
            <CardTitle className="text-3xl font-bold text-white">{formatIDR(stats.totalRevenue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-[#34a853] font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {stats.paidCount} Transaksi Berhasil
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border-none shadow-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Piutang Tertunda</CardDescription>
            <CardTitle className="text-3xl font-bold text-white">{formatIDR(stats.pendingAmount)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
              <Clock className="w-3.5 h-3.5" />
              Menunggu Pembayaran
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border-none shadow-2xl border-l-4 border-[#1a73e8]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Efisiensi Billing</CardDescription>
            <CardTitle className="text-3xl font-bold text-white">94%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-xs text-[#1a73e8] font-bold">
              <Calendar className="w-3.5 h-3.5" />
              Rata-rata Pembayaran 1.2 Hari
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-[#1e1e1e] border-none shadow-2xl">
        <CardHeader className="border-b border-white/5 bg-white/2 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-white">Mutasi Transaksi Terakhir</CardTitle>
              <CardDescription className="text-gray-500">Daftar riwayat invoice dan pembayaran terbaru.</CardDescription>
            </div>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
               <input 
                 placeholder="Cari ID Invoice..." 
                 className="bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#1a73e8]"
               />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Memuat data mutasi...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Invoice / Klien</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Metode</th>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            inv.status === "PAID" ? "bg-[#34a853]/10 text-[#34a853]" : "bg-white/5 text-gray-500"
                          )}>
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white uppercase font-mono">#{inv.id.toString().substring(0, 8)}</div>
                            <div className="text-[10px] text-gray-500">{inv.userName || inv.userEmail || "Anonymous"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant="outline" className={cn(
                          "px-2 py-0.5 text-[10px] border-none",
                          inv.status === "PAID" ? "bg-[#34a853]/10 text-[#34a853]" : "bg-amber-500/10 text-amber-500"
                        )}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-xs text-gray-400">
                        {inv.paymentMethod || "Xendit Virtual Account"}
                      </td>
                      <td className="px-6 py-5 text-xs text-gray-500">
                        {format(new Date(inv.paidAt || inv.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-white text-sm">
                        {formatIDR(inv.totalAmount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
