"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search, Globe, Cpu, Mail, MoreVertical } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ClientServicesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${user.uid}`);
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => 
    order.productName?.toLowerCase().includes(search.toLowerCase()) ||
    order.domainName?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <Badge className="bg-[#34a853] text-white border-none">Active</Badge>;
      case "ON_PROCESS": return <Badge className="bg-[#ffa000] text-white border-none">On Process</Badge>;
      case "UNPAID": return <Badge className="bg-[#ea4335] text-white border-none">Unpaid</Badge>;
      case "SUSPENDED": return <Badge variant="outline" className="text-gray-400 border-gray-600">Suspended</Badge>;
      default: return <Badge variant="secondary" className="bg-gray-700 text-gray-300 border-none">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Semua Layanan</h1>
        <p className="text-gray-400">Monitor dan kelola seluruh infrastruktur IT Anda dalam satu tempat.</p>
      </div>

      <div className="bg-[#1e1e1e] rounded-xl shadow-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Filter by name or domain..." 
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1a73e8] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-white/2">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4 pl-6">Produk & Layanan</TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4">Domain/Identitas</TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4 text-center">Harga</TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4 text-center">Jatuh Tempo</TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4 text-center">Status</TableHead>
              <TableHead className="text-gray-400 font-bold uppercase text-[11px] tracking-widest py-4 text-right pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-20 text-gray-500">Memuat infrastruktur...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={6} className="text-center py-20 text-gray-500 italic">
                  Belum ada layanan yang terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-white/5 hover:bg-white/2 transition-colors group">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-[#1a73e8]">
                        {order.productCategory === 'HOSTING' ? <Globe className="w-4 h-4" /> : 
                         order.productCategory === 'VPS' ? <Cpu className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-white">{order.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400 py-4 font-mono text-xs">{order.domainName}</TableCell>
                  <TableCell className="py-4 text-center">
                    <div className="text-white font-medium">Rp {order.price.toLocaleString("id-ID")}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-tighter">
                      /{order.billingCycle === "MONTHLY" ? "Bulan" : "Tahun"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center text-gray-400">
                    {order.dueDate ? format(new Date(order.dueDate), "dd MMM yyyy") : "-"}
                  </TableCell>
                  <TableCell className="py-4 text-center">{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Button variant="ghost" size="sm" asChild className="text-[#1a73e8] hover:bg-[#1a73e8]/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/services/${order.id}`} className="gap-2">
                        Manage
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
