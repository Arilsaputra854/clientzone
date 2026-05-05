"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Settings2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminProvisioningPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders?status=ON_PROCESS");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Antrean Provisioning</h1>
        <p className="text-muted-foreground">
          Daftar layanan yang sudah dibayar dan menunggu setup manual.
        </p>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu Bayar</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Domain/Identitas</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Memuat data...</TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Tidak ada antrean provisioning saat ini.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {order.paidAt ? format(new Date(order.paidAt), "dd/MM/yyyy HH:mm") : "-"}
                  </TableCell>
                  <TableCell className="font-medium">{order.productName}</TableCell>
                  <TableCell>{order.domainName}</TableCell>
                  <TableCell className="text-sm">{order.userEmail || order.userId}</TableCell>
                  <TableCell>
                    <Badge className="bg-amber-500">Wait Setup</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" className="gap-2" asChild>
                      <Link href={`/admin/provisioning/${order.id}`}>
                        <Settings2 className="w-4 h-4" />
                        Setup & Aktifkan
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
