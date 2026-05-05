"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Receipt, Server } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    services: 0,
    revenue: 0,
    queue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        
        const revenue = invoices.reduce((acc: number, inv: any) => acc + (inv.totalAmount || 0), 0);

        setStats({
          clients: clients.length,
          services: orders.filter((o: any) => o.status === "ACTIVE").length,
          revenue,
          queue: queue.length,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cardItems = [
    { title: "Total Klien", value: stats.clients, icon: Users, description: "Klien terdaftar" },
    { title: "Layanan Aktif", value: stats.services, icon: Package, description: "Layanan berjalan" },
    { title: "Total Pendapatan", value: `Rp ${stats.revenue.toLocaleString("id-ID")}`, icon: Receipt, description: "Seluruh waktu" },
    { title: "Antrean Setup", value: stats.queue, icon: Server, description: "Butuh provisioning" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">Ringkasan operasional sistem Client Zone.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardItems.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
