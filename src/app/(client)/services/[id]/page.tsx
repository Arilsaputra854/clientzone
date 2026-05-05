"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Globe, Key, Clock, Shield, Table as TableIcon, Copy, Check, Activity, AlertCircle, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format, isAfter } from "date-fns";
import Link from "next/link";

export default function ClientServiceDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, invoicesRes] = await Promise.all([
          fetch(`/api/orders?id=${id}`),
          fetch(`/api/invoices?orderId=${id}`)
        ]);
        
        const orderData = await orderRes.json();
        const foundOrder = Array.isArray(orderData) ? orderData.find(o => o.id === id) : orderData;
        setOrder(foundOrder);
        
        const invoicesData = await invoicesRes.json();
        setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      } catch (error) {
        toast.error("Gagal mengambil detail layanan");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} disalin!`);
  };

  if (loading) return <div className="flex justify-center py-20 animate-spin"><Server /></div>;
  if (!order) return <div className="text-center py-20">Layanan tidak ditemukan.</div>;

  const pendingInvoice = invoices.find(inv => inv.status === "PENDING" && isAfter(new Date(inv.expiresAt), new Date()));
  const expiredInvoice = invoices.find(inv => inv.status === "PENDING" && !isAfter(new Date(inv.expiresAt), new Date()));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{order.productName}</h1>
            <Badge className={order.status === "ACTIVE" ? "bg-green-500" : "bg-amber-500"}>
              {order.status}
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {order.domainName}
          </p>
        </div>
        <div className="flex gap-2">
          {order.serverCredentials?.controlPanelUrl && (
            <Button asChild variant="outline" className="gap-2">
              <a href={order.serverCredentials.controlPanelUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="w-4 h-4" />
                Buka Panel
              </a>
            </Button>
          )}
        </div>
      </div>

      {pendingInvoice && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-3">
            <div className="bg-amber-100 p-2 rounded-full h-fit">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900">Menunggu Pembayaran</h3>
              <p className="text-sm text-amber-800">
                Segera selesaikan pembayaran sebelum <strong>{format(new Date(pendingInvoice.expiresAt), "dd MMM yyyy HH:mm")}</strong> agar layanan tetap aktif.
              </p>
            </div>
          </div>
          <Button asChild className="w-full md:w-auto gap-2 bg-amber-600 hover:bg-amber-700">
            <a href={pendingInvoice.xenditInvoiceUrl} target="_blank" rel="noopener noreferrer">
              <CreditCard className="w-4 h-4" />
              Bayar Sekarang
            </a>
          </Button>
        </div>
      )}

      {expiredInvoice && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-3">
            <div className="bg-red-100 p-2 rounded-full h-fit">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-900">Link Pembayaran Kadaluarsa</h3>
              <p className="text-sm text-red-800">
                Link pembayaran sebelumnya sudah tidak aktif. Silakan hubungi admin untuk generate link baru.
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Server Credentials */}
            <Card className={order.status !== "ACTIVE" ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  <CardTitle>Akses Layanan</CardTitle>
                </div>
                <CardDescription>
                  Detail login untuk mengelola infrastruktur Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.status === "ACTIVE" && order.serverCredentials ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 py-2 border-b">
                      <span className="text-sm text-muted-foreground">IP Address</span>
                      <div className="col-span-2 flex items-center justify-between">
                        <code className="bg-muted px-1 rounded">{order.serverCredentials.serverIp}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(order.serverCredentials.serverIp, "IP Address")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-2 border-b">
                      <span className="text-sm text-muted-foreground">Username</span>
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="font-mono">{order.serverCredentials.serverUsername}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(order.serverCredentials.serverUsername, "Username")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-2">
                      <span className="text-sm text-muted-foreground">Password</span>
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="font-mono">********</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(order.serverCredentials.serverPassword, "Password")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground italic">
                    {order.status === "ON_PROCESS" 
                      ? "Layanan sedang dalam proses setup oleh admin."
                      : "Akses akan muncul setelah layanan aktif."}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle>Informasi Layanan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Terdaftar Sejak</span>
                  <span className="font-medium">{format(new Date(order.createdAt), "dd MMM yyyy")}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Jatuh Tempo Berikutnya</span>
                  <span className="font-medium text-primary">
                    {order.dueDate ? format(new Date(order.dueDate), "dd MMM yyyy") : "-"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Siklus Billing</span>
                  <span className="font-medium">{order.billingCycle === "MONTHLY" ? "Bulanan" : "Tahunan"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Invoice</CardTitle>
              <CardDescription>Semua transaksi terkait layanan ini.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                      <th className="px-4 py-3 text-left font-medium">Nominal</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Batas Waktu</th>
                      <th className="px-4 py-3 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Tidak ada riwayat invoice.</td>
                      </tr>
                    ) : Array.isArray(invoices) && (
                      invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="px-4 py-3">{format(new Date(inv.createdAt), "dd/MM/yyyy")}</td>
                          <td className="px-4 py-3 font-medium">Rp {inv.totalAmount?.toLocaleString("id-ID")}</td>
                          <td className="px-4 py-3">
                            <Badge variant={inv.status === "PAID" ? "default" : "outline"} className={inv.status === "PAID" ? "bg-green-500" : ""}>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {inv.status === "PENDING" ? format(new Date(inv.expiresAt), "dd/MM/yyyy HH:mm") : "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {inv.status === "PENDING" && isAfter(new Date(inv.expiresAt), new Date()) && inv.xenditInvoiceUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={inv.xenditInvoiceUrl} target="_blank" rel="noopener noreferrer">Bayar</a>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
