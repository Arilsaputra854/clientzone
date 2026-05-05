"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, ExternalLink, Filter, Download } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ClientOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${user.uid}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error("Gagal mengambil riwayat pesanan");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <Badge className="bg-[#34a853] text-white border-none">Active</Badge>;
      case "ON_PROCESS": return <Badge className="bg-[#ffa000] text-white border-none">On Process</Badge>;
      case "UNPAID": return <Badge className="bg-[#ea4335] text-white border-none">Unpaid</Badge>;
      default: return <Badge variant="secondary" className="bg-gray-700 text-gray-300 border-none">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Riwayat Pesanan</h1>
        <p className="text-gray-400">Daftar transaksi dan status pembayaran Anda.</p>
      </div>

      <div className="bg-[#1e1e1e] rounded-xl shadow-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-gray-300 hover:text-white">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-white/2">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4 pl-6">Tanggal</TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4">Layanan</TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4">Identitas</TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4">Harga</TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4 text-center">Status</TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4 text-right pr-6">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-20 text-gray-500">Memuat riwayat transaksi...</TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center py-20 text-gray-500 italic">
                  Belum ada riwayat pesanan.
                </TableCell>
              </TableRow>
            ) : Array.isArray(orders) && (
              orders.map((order) => (
                <TableRow key={order.id} className="border-white/5 hover:bg-white/2 transition-colors group">
                  <TableCell className="py-4 pl-6 text-gray-400">
                    {format(new Date(order.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-bold text-white py-4">{order.productName}</TableCell>
                  <TableCell className="text-gray-500 py-4 font-mono text-xs">{order.domainName}</TableCell>
                  <TableCell className="py-4 text-white font-medium">
                    Rp {order.price.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="py-4 text-center">{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Button variant="ghost" size="sm" asChild className="text-[#1a73e8] hover:bg-[#1a73e8]/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/services/${order.id}`} className="gap-2">
                        View
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
