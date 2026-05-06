"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/invoices");
        const data = await res.json();
        setInvoices(data);
      } catch (error) {
        toast.error("Gagal mengambil data invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Semua Invoices</h1>
        <p className="text-muted-foreground">Monitor semua transaksi dan status pembayaran.</p>
      </div>

      <div className="bg-background border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Klien</TableHead>
              <TableHead>ID Invoice</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tgl Bayar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Memuat data...</TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Belum ada transaksi.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium text-sm">
                    {inv.userName || inv.userEmail || inv.userId}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{inv.xenditInvoiceId}</TableCell>
                  <TableCell>
                    {inv.createdAt ? format(new Date(inv.createdAt?.seconds * 1000 || inv.createdAt), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell className="font-medium">Rp {inv.totalAmount?.toLocaleString("id-ID")}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === "PAID" ? "default" : "outline"} className={inv.status === "PAID" ? "bg-green-500" : ""}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inv.paidAt ? format(new Date(inv.paidAt?.seconds * 1000 || inv.paidAt), "dd/MM/yyyy HH:mm") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild title="Cetak Invoice">
                      <a href={`/invoice/${inv.id}`} target="_blank" rel="noopener noreferrer">
                        <Receipt className="w-4 h-4" />
                      </a>
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
