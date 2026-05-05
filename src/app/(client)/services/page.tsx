"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

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

  const filteredOrders = orders.filter(order => 
    order.productName?.toLowerCase().includes(search.toLowerCase()) ||
    order.domainName?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <Badge className="bg-green-500">Active</Badge>;
      case "ON_PROCESS": return <Badge className="bg-amber-500">On Process</Badge>;
      case "UNPAID": return <Badge variant="destructive">Unpaid</Badge>;
      case "SUSPENDED": return <Badge variant="outline" className="text-red-500 border-red-500">Suspended</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Layanan Saya</h1>
        <p className="text-muted-foreground">Daftar semua paket layanan yang Anda miliki.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari layanan atau domain..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk & Layanan</TableHead>
              <TableHead>Domain/Identitas</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Jatuh Tempo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Memuat data...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Belum ada layanan.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.productName}</TableCell>
                  <TableCell className="text-muted-foreground">{order.domainName}</TableCell>
                  <TableCell>
                    Rp {order.price.toLocaleString("id-ID")}
                    <span className="text-xs text-muted-foreground ml-1">
                      /{order.billingCycle === "MONTHLY" ? "bln" : "thn"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {order.dueDate ? format(new Date(order.dueDate), "dd MMM yyyy") : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="gap-2">
                      <Link href={`/services/${order.id}`}>
                        Kelola
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
