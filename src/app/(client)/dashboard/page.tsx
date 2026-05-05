"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CreditCard, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    services: 0,
    unpaid: 0,
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
        
        setStats({
          services: orders.filter((o: any) => o.status === "ACTIVE").length,
          unpaid: invoices.length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const cards = [
    { title: "Layanan Aktif", value: stats.services, icon: Package, color: "text-blue-500" },
    { title: "Invoice Belum Bayar", value: stats.unpaid, icon: CreditCard, color: "text-red-500" },
    { title: "Masa Aktif", value: stats.services > 0 ? "Normal" : "-", icon: Clock, color: "text-amber-500" },
    { title: "Status Sistem", value: "Online", icon: Activity, color: "text-green-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Klien</h1>
          <p className="text-muted-foreground">Kelola layanan IT Anda di sini.</p>
        </div>
        <Button asChild>
          <Link href="/catalog">Beli Layanan Baru</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" asChild className="h-20 flex-col gap-2">
            <Link href="/services">
              <Package className="w-5 h-5" />
              Kelola Layanan
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-20 flex-col gap-2">
            <Link href="/orders">
              <CreditCard className="w-5 h-5" />
              Bayar Invoice
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-20 flex-col gap-2">
            <Link href="/catalog">
              <Activity className="w-5 h-5" />
              Upgrade Paket
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
