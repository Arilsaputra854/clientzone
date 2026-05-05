"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server, 
  Settings2, 
  Clock, 
  CheckCircle2, 
  Search,
  ExternalLink,
  GitBranch,
  Globe
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AdminProvisioningPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "ACTIVE" | "SUSPENDED">("PENDING");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter out UNPAID/CANCELLED orders for provisioning view
          const provOrders = data.filter(o => o.status === "ON_PROCESS" || o.status === "ACTIVE" || o.status === "SUSPENDED");
          setOrders(provOrders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error(error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const pendingOrders = orders.filter(o => o.status === "ON_PROCESS");
  const completedOrders = orders.filter(o => o.status === "ACTIVE");
  const suspendedOrders = orders.filter(o => o.status === "SUSPENDED");

  const displayOrders = 
    activeTab === "PENDING" ? pendingOrders : 
    activeTab === "ACTIVE" ? completedOrders : suspendedOrders;

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1a73e8]/10 rounded-xl flex items-center justify-center text-[#1a73e8]">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Provisioning Console</h1>
            <p className="text-gray-500 mt-1">Kelola setup infrastruktur dan aktivasi layanan klien.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#1e1e1e] p-1 rounded-xl border border-white/5 shadow-inner">
          <Button
            variant="ghost"
            className={cn(
              "h-10 px-6 rounded-lg font-bold text-xs transition-all",
              activeTab === "PENDING" ? "bg-[#1a73e8] text-white shadow-lg" : "text-gray-500 hover:text-white"
            )}
            onClick={() => setActiveTab("PENDING")}
          >
            <Clock className="w-4 h-4 mr-2" />
            Perlu Setup ({pendingOrders.length})
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "h-10 px-6 rounded-lg font-bold text-xs transition-all",
              activeTab === "ACTIVE" ? "bg-[#34a853] text-white shadow-lg" : "text-gray-500 hover:text-white"
            )}
            onClick={() => setActiveTab("ACTIVE")}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Sudah Aktif ({completedOrders.length})
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "h-10 px-6 rounded-lg font-bold text-xs transition-all",
              activeTab === "SUSPENDED" ? "bg-[#ea4335] text-white shadow-lg" : "text-gray-500 hover:text-white"
            )}
            onClick={() => setActiveTab("SUSPENDED")}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Suspended ({suspendedOrders.length})
          </Button>
        </div>
      </div>

      <div className="bg-[#1e1e1e] border border-white/5 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Table>
          <TableHeader className="bg-white/2 border-b border-white/5">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-widest pl-6 py-4">Informasi Layanan</TableHead>
              <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-widest py-4">Klien</TableHead>
              <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-widest py-4">Source Code</TableHead>
              <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-widest py-4">Waktu Bayar</TableHead>
              <TableHead className="text-gray-500 font-bold uppercase text-[10px] tracking-widest py-4">Status</TableHead>
              <TableHead className="text-right text-gray-500 font-bold uppercase text-[10px] tracking-widest pr-6 py-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div>
                    <p className="text-gray-500 text-sm">Menghubungkan ke server...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : displayOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-32">
                   <div className="flex flex-col items-center gap-4 text-gray-700">
                     <div className="w-16 h-16 bg-white/2 rounded-full flex items-center justify-center">
                        <Server className="w-8 h-8" />
                     </div>
                     <p className="italic text-sm font-medium">Tidak ada antrean {activeTab.toLowerCase()} saat ini.</p>
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              displayOrders.map((order) => (
                <TableRow key={order.id} className="border-b border-white/5 hover:bg-white/2 transition-colors group">
                  <TableCell className="pl-6 py-6">
                    <div className="space-y-1">
                      <div className="font-bold text-white group-hover:text-[#1a73e8] transition-colors">{order.productName}</div>
                      <div className="text-xs font-mono text-gray-500 bg-white/5 w-fit px-2 py-0.5 rounded border border-white/5">{order.domainName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-300">{order.userName || "No Name"}</div>
                      <div className="text-[10px] text-gray-600 uppercase tracking-tighter">{order.userEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    {order.repoUrl ? (
                       <a href={order.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#1a73e8] hover:underline">
                         <GitBranch className="w-3.5 h-3.5" />
                         <span>View Repo</span>
                       </a>
                    ) : <span className="text-xs text-gray-700">-</span>}
                  </TableCell>
                  <TableCell className="py-6">
                    <div className="text-xs text-gray-400">
                      {order.paidAt ? format(new Date(order.paidAt), "dd MMM yyyy") : "-"}
                    </div>
                    <div className="text-[10px] text-gray-600 font-mono">
                      {order.paidAt ? format(new Date(order.paidAt), "HH:mm:ss") : ""}
                    </div>
                  </TableCell>
                  <TableCell className="py-6">
                    <Badge className={cn(
                      "px-3 py-1 text-[10px] font-bold border-none",
                      order.status === "ACTIVE" ? "bg-[#34a853]/10 text-[#34a853]" : 
                      order.status === "SUSPENDED" ? "bg-red-500/10 text-red-500" :
                      "bg-amber-500/10 text-amber-500 animate-pulse"
                    )}>
                      {order.status === "ACTIVE" ? "LIVE" : order.status === "SUSPENDED" ? "STOPPED" : "WAIT SETUP"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-6">
                    <Button size="sm" variant={order.status === "ACTIVE" ? "outline" : "default"} className={cn(
                      "gap-2 h-10 px-4 transition-all shadow-lg",
                      order.status === "ACTIVE" 
                        ? "border-white/10 text-gray-400 hover:text-white hover:bg-white/5 bg-transparent" 
                        : "bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white shadow-blue-500/20"
                    )} asChild>
                      <Link href={`/admin/provisioning/${order.id}`}>
                        <Settings2 className="w-4 h-4" />
                        {order.status === "ACTIVE" ? "Re-configure" : order.status === "SUSPENDED" ? "Manage/Resume" : "Setup Now"}
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
