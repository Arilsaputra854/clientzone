"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Clock, 
  Shield, 
  Activity, 
  AlertCircle, 
  CreditCard, 
  ExternalLink,
  Settings,
  GitBranch,
  Rocket
} from "lucide-react";
import { toast } from "sonner";
import { format, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

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
        const foundOrder = Array.isArray(orderData) ? orderData.find((o: any) => o.id === id) : orderData;
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

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div>
    </div>
  );
  
  if (!order) return <div className="text-center py-20 text-gray-500">Layanan tidak ditemukan.</div>;

  const pendingInvoice = invoices.find(inv => inv.status === "PENDING" && isAfter(new Date(inv.expiresAt), new Date()));
  const expiredInvoice = invoices.find(inv => inv.status === "PENDING" && !isAfter(new Date(inv.expiresAt), new Date()));

  return (
    <div className="space-y-10 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#1a73e8]/10 flex items-center justify-center text-[#1a73e8] border border-[#1a73e8]/20">
            <Globe className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">{order.productName}</h1>
              <Badge className={cn(
                "border-none text-white font-bold px-3 py-0.5",
                order.status === "ACTIVE" ? "bg-[#34a853]" : 
                order.status === "SUSPENDED" ? "bg-[#ea4335]" : "bg-[#ffa000]"
              )}>
                {order.status}
              </Badge>
            </div>
            <p className="text-gray-500 font-mono text-sm flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {order.domainName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {order.serverCredentials?.deployedUrl && (
            <Button 
              asChild={order.status === "ACTIVE"} 
              disabled={order.status !== "ACTIVE"}
              className={cn(
                "gap-2 h-11 px-6 font-bold transition-all shadow-lg",
                order.status === "ACTIVE" 
                  ? "bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white shadow-blue-500/20" 
                  : "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50 shadow-none"
              )}
            >
              {order.status === "ACTIVE" ? (
                <a href={order.serverCredentials.deployedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              ) : (
                <span>
                  <AlertCircle className="w-4 h-4" />
                  Service Inactive
                </span>
              )}
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-11 w-11 bg-white/5 border-white/10 hover:bg-white/10 text-gray-400">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {order.status === "SUSPENDED" && (
        <div className="bg-[#ea4335]/10 border border-[#ea4335]/30 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex gap-4">
            <div className="bg-[#ea4335]/20 p-3 rounded-xl h-fit">
              <AlertCircle className="w-6 h-6 text-[#ea4335]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg">Layanan Dihentikan (Suspended)</h3>
              <p className="text-sm text-gray-400">
                Layanan ini telah dihentikan oleh administrator. Silakan hubungi tim dukungan kami melalui <Link href="/tickets" className="text-[#1a73e8] underline">tiket bantuan</Link> untuk informasi lebih lanjut.
              </p>
            </div>
          </div>
        </div>
      )}

      {pendingInvoice && order.status !== "SUSPENDED" && (
        <div className="bg-[#ffa000]/10 border border-[#ffa000]/30 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex gap-4">
            <div className="bg-[#ffa000]/20 p-3 rounded-xl h-fit">
              <AlertCircle className="w-6 h-6 text-[#ffa000]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-lg">Pembayaran Tertunda</h3>
              <p className="text-sm text-gray-400">
                Layanan ini akan dinonaktifkan jika pembayaran tidak diterima sebelum <span className="text-[#ffa000] font-bold">{format(new Date(pendingInvoice.expiresAt), "dd MMM yyyy HH:mm")}</span>.
              </p>
            </div>
          </div>
          <Button asChild className="w-full md:w-auto h-12 px-8 bg-[#ffa000] hover:bg-[#ffa000]/90 text-white font-bold gap-2 shadow-lg shadow-orange-500/20">
            <a href={pendingInvoice.xenditInvoiceUrl} target="_blank" rel="noopener noreferrer">
              <CreditCard className="w-4 h-4" />
              Complete Payment
            </a>
          </Button>
        </div>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/2 border border-white/5 h-12 p-1 w-full max-w-md">
          <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">Deployment</TabsTrigger>
          <TabsTrigger value="billing" className="flex-1 data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">Billing History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Deployment Status */}
            <Card className="bg-[#1e1e1e] border-none shadow-2xl relative overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#1a73e8]/10 text-[#1a73e8]">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">Live Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                {order.status === "ACTIVE" && order.serverCredentials?.deployedUrl ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-[#34a853]/5 border border-[#34a853]/10 rounded-xl text-center space-y-4">
                      <div className="w-16 h-16 bg-[#34a853]/10 rounded-full flex items-center justify-center mx-auto">
                        <Globe className="w-8 h-8 text-[#34a853]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-white font-bold text-lg">Your App is Live</h3>
                        <p className="text-gray-500 text-sm">Deployment berhasil dilakukan dan dapat diakses publik.</p>
                      </div>
                      <Button asChild className="w-full bg-[#34a853] hover:bg-[#34a853]/90 text-white font-bold h-12 shadow-lg shadow-green-500/20">
                        <a href={order.serverCredentials.deployedUrl} target="_blank" rel="noopener noreferrer">
                          Open Application
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : order.status === "SUSPENDED" ? (
                  <div className="text-center py-16 px-6 bg-red-500/5 border border-dashed border-red-500/20 rounded-xl space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                    <div className="space-y-1">
                      <h3 className="text-white font-bold">Layanan Nonaktif</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Akses ke aplikasi ini telah dicabut oleh administrator.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 px-6 bg-white/2 border border-dashed border-white/10 rounded-xl">
                    <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium italic leading-relaxed">
                      {order.status === "ON_PROCESS" 
                        ? "Tim kami sedang mendeploy kode Anda ke server. Proses ini biasanya memakan waktu 1-24 jam."
                        : "Deployment akan dimulai secara otomatis setelah pembayaran Anda terverifikasi."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Source Information */}
            <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-white/10 text-white">
                    <GitBranch className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">Source Code</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 p-4 bg-white/2 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Repository URL</span>
                    <a href={order.repoUrl} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-[#1a73e8] transition-colors flex items-center justify-between group">
                      <span className="truncate max-w-[250px]">{order.repoUrl || "Not specified"}</span>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-gray-500 text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Active Since</span>
                    <span className="text-white font-bold">
                      {order.activatedAt ? format(new Date(order.activatedAt), "dd MMM yyyy") : "Pending setup"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-gray-500 text-sm font-medium flex items-center gap-2"><Activity className="w-4 h-4" /> Billing Cycle</span>
                    <Badge variant="outline" className="border-white/10 text-gray-400 capitalize">{order.billingCycle.toLowerCase()}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-500 text-sm font-medium flex items-center gap-2"><Shield className="w-4 h-4" /> Next Due Date</span>
                    <span className="text-[#1a73e8] font-bold">
                      {order.dueDate ? format(new Date(order.dueDate), "dd MMM yyyy") : "Pending setup"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="pt-10 animate-in fade-in duration-500">
          <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-xl font-bold text-white">Invoice History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/2 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase text-[10px] tracking-widest">Billing Date</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase text-[10px] tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-center font-bold text-gray-500 uppercase text-[10px] tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right font-bold text-gray-500 uppercase text-[10px] tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-gray-600 italic">No transactions found.</td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4 text-gray-400">{format(new Date(inv.createdAt), "dd MMM yyyy")}</td>
                          <td className="px-6 py-4 font-bold text-white">Rp {inv.totalAmount?.toLocaleString("id-ID")}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge className={cn(
                              "border-none text-white font-bold px-3 py-0.5",
                              inv.status === "PAID" ? "bg-[#34a853]" : "bg-[#ea4335]"
                            )}>
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {inv.status === "PENDING" && isAfter(new Date(inv.expiresAt), new Date()) && inv.xenditInvoiceUrl && (
                              <Button size="sm" className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold" asChild>
                                <a href={inv.xenditInvoiceUrl} target="_blank" rel="noopener noreferrer">Pay Now</a>
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
