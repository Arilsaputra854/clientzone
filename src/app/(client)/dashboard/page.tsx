"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, CreditCard, Clock, Activity, ArrowRight, ExternalLink, Globe, Cpu, Mail, HelpCircle, PlusCircle, AlertCircle, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format, isAfter } from "date-fns";

export default function ClientDashboard() {
  const { user, userData } = useAuth();
  const [stats, setStats] = useState({
    services: 0,
    unpaid: 0,
    activeOrders: [] as any[],
    nextDue: null as Date | null,
    uptime: "99.9%",
    news: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const [ordersRes, invoicesRes, newsRes] = await Promise.all([
          fetch(`/api/orders?userId=${user.uid}`),
          fetch(`/api/invoices?userId=${user.uid}&status=PENDING`),
          fetch("/api/news?active=true")
        ]);
        const orders = await ordersRes.json();
        const invoices = await invoicesRes.json();
        const news = await newsRes.json();
        
        const active = Array.isArray(orders) ? orders.filter((o: any) => o.status === "ACTIVE") : [];
        
        // Calculate real uptime percentage
        // (This is a simplified version, ideally you'd average from uptime_logs)
        const upCount = active.filter((o: any) => o.isUp !== false).length;
        const uptimePercent = active.length > 0 ? (upCount / active.length) * 100 : 100;
        
        // Find nearest due date
        let nextDue = null;
        if (active.length > 0) {
          const sorted = [...active].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
          nextDue = new Date(sorted[0].dueDate);
        }
        
        setStats({
          services: active.length,
          unpaid: Array.isArray(invoices) ? invoices.length : 0,
          activeOrders: active.slice(0, 3),
          nextDue,
          uptime: active.length > 0 ? `${uptimePercent.toFixed(2)}%` : "100%",
          news: Array.isArray(news) ? news.slice(0, 2) : [],
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
    { title: "Layanan Aktif", value: stats.services, detail: stats.services > 0 ? "Running smoothly" : "No active services", icon: Package, color: "#1a73e8" },
    { title: "Invoice Tertunda", value: stats.unpaid, detail: stats.unpaid > 0 ? "Action required" : "All clear", icon: CreditCard, color: "#ea4335" },
    { 
      title: "Siklus Billing", 
      value: stats.nextDue ? format(stats.nextDue, "dd MMM") : "N/A", 
      detail: stats.nextDue ? `Next: ${format(stats.nextDue, "yyyy")}` : "No upcoming due", 
      icon: Clock, 
      color: "#ffa000" 
    },
    { title: "Uptime Sistem", value: stats.uptime, detail: "Across all services", icon: Activity, color: "#34a853" },
  ];

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">Project Overview</h1>
            <Badge variant="outline" className="border-[#1a73e8]/50 text-[#1a73e8] bg-[#1a73e8]/10 px-3 py-1">
              Active Dashboard
            </Badge>
          </div>
          <p className="text-gray-400 text-lg">Selamat datang kembali, <span className="text-white font-bold">{userData?.name || user?.email?.split('@')[0]}</span>.</p>
        </div>
        <Button asChild className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white px-6 font-bold h-11">
          <Link href="/catalog" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Service
          </Link>
        </Button>
      </div>

      {/* News Section */}
      {(stats.news?.length ?? 0) > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.news.map((item: any) => (
            <div key={item.id} className={cn(
              "p-4 rounded-xl border flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500",
              item.type === "MAINTENANCE" ? "bg-amber-500/5 border-amber-500/10" :
              item.type === "ALERT" ? "bg-red-500/5 border-red-500/10" :
              "bg-[#1a73e8]/5 border-[#1a73e8]/10"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                item.type === "MAINTENANCE" ? "bg-amber-500/10 text-amber-500" :
                item.type === "ALERT" ? "bg-red-500/10 text-red-500" :
                "bg-[#1a73e8]/10 text-[#1a73e8]"
              )}>
                {item.type === "MAINTENANCE" ? <Clock className="w-5 h-5" /> :
                 item.type === "ALERT" ? <AlertCircle className="w-5 h-5" /> :
                 <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white mb-0.5">{item.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {analytics.map((item) => (
          <Card key={item.title} className="bg-[#1e1e1e] border-none shadow-xl hover:bg-[#252525] transition-all cursor-default group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: item.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{loading ? "..." : item.value}</div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Product Card */}
        <Card className="lg:col-span-2 bg-[#1e1e1e] border-none shadow-xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/2 pb-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-white">Layanan Terbaru</CardTitle>
                <CardDescription className="text-gray-500 text-xs">Monitor status infrastruktur Anda</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-[#1a73e8] hover:bg-[#1a73e8]/10 text-xs font-bold">
                <Link href="/services" className="gap-2">
                  Lihat Semua
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Memuat data...</div>
            ) : (stats.activeOrders?.length ?? 0) === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-700">
                  <Globe className="w-8 h-8" />
                </div>
                <p className="text-gray-500 text-sm italic">Belum ada layanan aktif.</p>
                <Button variant="outline" size="sm" asChild className="border-white/10 text-gray-400">
                  <Link href="/catalog">Mulai Sekarang</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {stats.activeOrders.map((order: any) => (
                  <div key={order.id} className="p-6 hover:bg-white/2 transition-colors flex items-center justify-between group/row">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#1a73e8]/5 flex items-center justify-center text-[#1a73e8] border border-[#1a73e8]/10">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {order.productName}
                          <Badge className="bg-[#34a853] text-[8px] h-4">ACTIVE</Badge>
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{order.domainName}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-gray-400 hover:text-white hover:bg-white/5">
                      <Link href={`/services/${order.id}`}>Kelola</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shortcuts Card */}
        <div className="space-y-6">
          <Card className="bg-[#1e1e1e] border-none shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-widest opacity-50">Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                { label: "Kelola Layanan", icon: Package, href: "/services", color: "text-blue-500" },
                { label: "Bayar Invoice", icon: CreditCard, href: "/orders", color: "text-red-500" },
                { label: "Tiket Bantuan", icon: LifeBuoy, href: "/tickets", color: "text-green-500" }
              ].map((link) => (
                <Button key={link.href} variant="outline" asChild className="justify-start gap-4 h-12 bg-white/2 border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300 transition-all group">
                  <Link href={link.href}>
                    <link.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", link.color)} />
                    <span className="text-xs font-bold">{link.label}</span>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
          
          {/* Support Card */}
          <div className="bg-[#1a73e8] rounded-xl p-6 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 p-4 opacity-10 group-hover:scale-110 transition-transform rotate-12">
              <LifeBuoy className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-xl">Bantuan Teknis</h3>
                <p className="text-blue-100 text-xs opacity-80 leading-relaxed">Tim kami siap membantu kendala teknis Anda 24/7 melalui sistem tiket.</p>
              </div>
              <Button className="w-full bg-white text-[#1a73e8] hover:bg-white/90 font-bold" asChild>
                <Link href="/tickets">Buka Tiket</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
