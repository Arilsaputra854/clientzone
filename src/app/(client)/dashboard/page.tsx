"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, CreditCard, Clock, Activity, ArrowRight, ExternalLink, Globe, Cpu, Mail, HelpCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    services: 0,
    unpaid: 0,
    activeOrders: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const [ordersRes, invoicesRes] = await Promise.all([
          fetch(`/api/orders?userId=${user.uid}`),
          fetch(`/api/invoices?userId=${user.uid}&status=PENDING`)
        ]);
        const orders = await ordersRes.json();
        const invoices = await invoicesRes.json();
        
        const active = Array.isArray(orders) ? orders.filter((o: any) => o.status === "ACTIVE") : [];
        
        setStats({
          services: active.length,
          unpaid: Array.isArray(invoices) ? invoices.length : 0,
          activeOrders: active.slice(0, 3),
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const analytics = [
    { title: "Layanan Aktif", value: stats.services, detail: "Running smoothly", icon: Package, color: "#1a73e8" },
    { title: "Invoice Tertunda", value: stats.unpaid, detail: "Payment required", icon: CreditCard, color: "#ea4335" },
    { title: "Siklus Billing", value: "Normal", detail: "Next: 25 May", icon: Clock, color: "#ffa000" },
    { title: "Uptime Sistem", value: "99.9%", detail: "Last 30 days", icon: Activity, color: "#34a853" },
  ];

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Project Overview</h1>
            <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 transition-colors px-3 py-1">
              Blaze plan
            </Badge>
          </div>
          <p className="text-gray-400 text-lg">Selamat datang kembali, <span className="text-white font-medium">{user?.email?.split('@')[0]}</span>. Kelola infrastruktur Anda dari sini.</p>
        </div>
        <Button asChild className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white px-6">
          <Link href="/catalog" className="gap-2">
            Add Service
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {analytics.map((item) => (
          <Card key={item.title} className="bg-[#1e1e1e] border-none shadow-xl hover:bg-[#252525] transition-all cursor-default group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">{item.title}</CardTitle>
              <item.icon className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: item.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{loading ? "..." : item.value}</div>
              <p className="text-xs text-gray-500 font-medium">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Product Card */}
        <Card className="lg:col-span-2 bg-[#1e1e1e] border-none shadow-xl overflow-hidden group">
          <CardHeader className="border-b border-white/5 bg-white/2 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-white">Layanan Terbaru</CardTitle>
                <CardDescription className="text-gray-500">Monitor status layanan yang sedang aktif</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-[#1a73e8] hover:bg-[#1a73e8]/10">
                <Link href="/services" className="gap-2">
                  Lihat Semua
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Memuat data...</div>
            ) : stats.activeOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-500 italic">Belum ada layanan aktif.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {stats.activeOrders.map((order: any) => (
                  <div key={order.id} className="p-6 hover:bg-white/2 transition-colors flex items-center justify-between group/row">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[#1a73e8]">
                        {order.productCategory === 'HOSTING' ? <Globe className="w-5 h-5" /> : 
                         order.productCategory === 'VPS' ? <Cpu className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-white">{order.productName}</div>
                        <div className="text-sm text-gray-500">{order.domainName}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <Link href={`/services/${order.id}`} className="text-[#1a73e8] hover:bg-[#1a73e8]/10">Detail</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shortcuts Card */}
        <div className="space-y-6">
          <Card className="bg-[#1e1e1e] border-none shadow-xl group">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button variant="outline" asChild className="justify-start gap-4 h-14 bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300 hover:text-white transition-all">
                <Link href="/services">
                  <Package className="w-5 h-5 text-blue-500" />
                  <span>Kelola Layanan</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start gap-4 h-14 bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300 hover:text-white transition-all">
                <Link href="/orders">
                  <CreditCard className="w-5 h-5 text-red-500" />
                  <span>Bayar Invoice</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start gap-4 h-14 bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300 hover:text-white transition-all">
                <Link href="/catalog">
                  <PlusCircle className="w-5 h-5 text-amber-500" />
                  <span>Order Baru</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Support Card */}
          <div className="bg-gradient-to-br from-[#1a73e8] to-[#1a73e8]/60 rounded-xl p-6 text-white shadow-xl relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-24 h-24" />
            </div>
            <h3 className="font-bold text-xl mb-2 relative z-10">Bantuan Teknis</h3>
            <p className="text-blue-50 text-sm mb-4 relative z-10 opacity-90">Butuh bantuan mengelola infrastruktur? Tim kami siap membantu 24/7.</p>
            <Button className="bg-white text-[#1a73e8] hover:bg-white/90 relative z-10">Buka Tiket</Button>
          </div>
        </div>
      </div>
    </div>
  );
}


