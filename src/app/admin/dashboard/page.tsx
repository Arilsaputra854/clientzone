"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Package, Receipt, Server, Activity, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    services: 0,
    revenue: 0,
    queue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [clientsRes, ordersRes, invoicesRes, queueRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/orders"),
        fetch("/api/invoices?status=PAID"),
        fetch("/api/orders?status=ON_PROCESS")
      ]);
      
      const clients = await clientsRes.json();
      const orders = await ordersRes.json();
      const invoices = await invoicesRes.json();
      const queue = await queueRes.json();
      
      const revenue = Array.isArray(invoices) ? invoices.reduce((acc: number, inv: any) => acc + (inv.totalAmount || 0), 0) : 0;

      setStats({
        clients: Array.isArray(clients) ? clients.length : 0,
        services: Array.isArray(orders) ? orders.filter((o: any) => o.status === "ACTIVE").length : 0,
        revenue,
        queue: Array.isArray(queue) ? queue.length : 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanUptime = async () => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/uptime/scan");
      const data = await res.json();
      if (res.ok) {
        toast.success(`Scan selesai: ${data.processed} layanan diperiksa.`);
        fetchStats();
      } else {
        toast.error(data.error || "Gagal melakukan scan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat scan");
    } finally {
      setIsScanning(false);
    }
  };

  const cardItems = [
    { title: "Total Klien", value: stats.clients, icon: Users, description: "Klien terdaftar", color: "text-blue-500" },
    { title: "Layanan Aktif", value: stats.services, icon: Package, description: "Layanan berjalan", color: "text-green-500" },
    { title: "Total Pendapatan", value: `Rp ${stats.revenue.toLocaleString("id-ID")}`, icon: Receipt, description: "Seluruh waktu", color: "text-amber-500" },
    { title: "Antrean Setup", value: stats.queue, icon: Server, description: "Butuh provisioning", color: "text-red-500" },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Ringkasan operasional sistem ClientZone secara real-time.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleScanUptime} 
            disabled={isScanning}
            className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold h-11 px-6 shadow-lg shadow-blue-500/20 gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isScanning && "animate-spin")} />
            {isScanning ? "Scanning..." : "Scan Uptime Now"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cardItems.map((stat) => (
          <Card key={stat.title} className="bg-[#1e1e1e] border-none shadow-2xl hover:bg-[#252525] transition-all group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{stat.title}</CardTitle>
              <stat.icon className={cn("h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity", stat.color)} />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white mb-1">{loading ? "..." : stat.value}</div>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">{stat.description}</p>
            </CardContent>
            {/* Background Accent */}
            <div className={cn("absolute -right-4 -bottom-4 w-20 h-20 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity", stat.color)}>
              <stat.icon className="w-full h-full" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-[#1e1e1e] border-none shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1a73e8]" />
              Status Monitor
            </CardTitle>
            <CardDescription className="text-gray-500">Log kesehatan sistem dan respon server klien.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center space-y-4">
             <div className="w-16 h-16 bg-white/2 rounded-full flex items-center justify-center mx-auto">
               <CheckCircle2 className="w-8 h-8 text-[#34a853] opacity-20" />
             </div>
             <p className="text-gray-500 text-sm italic">Gunakan tombol "Scan Uptime Now" untuk memperbarui status kesehatan seluruh layanan klien.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border-none shadow-2xl">
           <CardHeader>
             <CardTitle className="text-lg font-bold text-white">System Alerts</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                 <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                 <div>
                   <p className="text-sm font-bold text-red-500">Antrean Setup</p>
                   <p className="text-[11px] text-red-500/70">Ada {stats.queue} layanan yang menunggu provisioning manual.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                 <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
                 <div>
                   <p className="text-sm font-bold text-blue-500">Sistem Normal</p>
                   <p className="text-[11px] text-blue-500/70">Semua layanan inti ClientZone berjalan optimal.</p>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
