"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Server, 
  Globe, 
  Key, 
  Clock, 
  Shield, 
  Table as TableIcon, 
  Copy, 
  Check, 
  Activity, 
  AlertCircle, 
  CreditCard, 
  ExternalLink,
  ChevronLeft,
  Settings,
  Terminal,
  Cpu,
  Mail
} from "lucide-react";
import { toast } from "sonner";
import { format, isAfter } from "date-fns";
import Link from "next/link";
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
          <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-[#1a73e8] border border-white/10">
            {order.productCategory === 'HOSTING' ? <Globe className="w-7 h-7" /> : 
             order.productCategory === 'VPS' ? <Cpu className="w-7 h-7" /> : <Mail className="w-7 h-7" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">{order.productName}</h1>
              <Badge className={cn(
                "border-none text-white font-bold px-3 py-0.5",
                order.status === "ACTIVE" ? "bg-[#34a853]" : "bg-[#ffa000]"
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
          {order.serverCredentials?.controlPanelUrl && (
            <Button asChild className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white gap-2 h-11 px-6 font-bold shadow-lg shadow-blue-500/20 transition-all">
              <a href={order.serverCredentials.controlPanelUrl} target="_blank" rel="noopener noreferrer">
                <Terminal className="w-4 h-4" />
                Console Panel
              </a>
            </Button>
          )}
          <Button variant="outline" size="icon" className="h-11 w-11 bg-white/5 border-white/10 hover:bg-white/10 text-gray-400">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {pendingInvoice && (
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

      {expiredInvoice && (
        <div className="bg-[#ea4335]/10 border border-[#ea4335]/30 rounded-xl p-5 flex items-start gap-4">
          <div className="bg-[#ea4335]/20 p-3 rounded-xl h-fit">
            <AlertCircle className="w-6 h-6 text-[#ea4335]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-lg">Tagihan Kadaluarsa</h3>
            <p className="text-sm text-gray-400">
              Link pembayaran sebelumnya sudah tidak aktif. Tim kami akan segera mengirimkan tagihan baru atau Anda dapat menghubungi dukungan pelanggan.
            </p>
          </div>
        </div>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/2 border border-white/5 h-12 p-1 w-full max-w-md">
          <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">Management</TabsTrigger>
          <TabsTrigger value="billing" className="flex-1 data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">Billing & Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Server Credentials */}
            <Card className={cn(
              "bg-[#1e1e1e] border-none shadow-2xl relative overflow-hidden",
              order.status !== "ACTIVE" && "opacity-60 grayscale"
            )}>
              <CardHeader className="border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#1a73e8]/10 text-[#1a73e8]">
                    <Key className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">Service Credentials</CardTitle>
                </div>
                <CardDescription className="text-gray-500">Akses login dan konfigurasi server Anda.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-4">
                {order.status === "ACTIVE" && order.serverCredentials ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 p-4 bg-white/2 rounded-lg border border-white/5 group">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Public IP Address</span>
                      <div className="flex items-center justify-between">
                        <code className="text-lg font-bold text-white font-mono">{order.serverCredentials.serverIp}</code>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white" onClick={() => copyToClipboard(order.serverCredentials.serverIp, "IP Address")}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 p-4 bg-white/2 rounded-lg border border-white/5 group">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Username</span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{order.serverCredentials.serverUsername}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white" onClick={() => copyToClipboard(order.serverCredentials.serverUsername, "Username")}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 p-4 bg-white/2 rounded-lg border border-white/5 group">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">••••••••</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white" onClick={() => copyToClipboard(order.serverCredentials.serverPassword, "Password")}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 px-6 bg-white/2 border border-dashed border-white/10 rounded-xl">
                    <Clock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium italic leading-relaxed">
                      {order.status === "ON_PROCESS" 
                        ? "Server sedang dalam tahap provisioning oleh tim teknis kami. Akses akan muncul di sini segera."
                        : "Credentials akan tersedia secara otomatis setelah status layanan menjadi Active."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#34a853]/10 text-[#34a853]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">Product Summary</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-gray-500 text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Registration Date</span>
                    <span className="text-white font-bold">{format(new Date(order.createdAt), "dd MMM yyyy")}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-gray-500 text-sm font-medium flex items-center gap-2"><Activity className="w-4 h-4" /> Billing Cycle</span>
                    <Badge variant="outline" className="border-white/10 text-gray-400 capitalize">{order.billingCycle.toLowerCase()}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-500 text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Next Due Date</span>
                    <span className="text-[#1a73e8] font-bold">
                      {order.dueDate ? format(new Date(order.dueDate), "dd MMM yyyy") : "Pending setup"}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 bg-white/2 rounded-xl border border-white/5 mt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                    <Activity className="w-3 h-3" />
                    Resource Monitoring
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1a73e8] w-1/3 rounded-full" />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-600 uppercase">
                    <span>Usage: 32%</span>
                    <span>Quota: Unlimited</span>
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
              <CardDescription className="text-gray-500">Monitor seluruh transaksi dan tagihan untuk layanan ini.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/2 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase text-[10px] tracking-widest">Billing Date</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase text-[10px] tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-center font-bold text-gray-500 uppercase text-[10px] tracking-widest">Status</th>
                      <th className="px-6 py-4 text-center font-bold text-gray-500 uppercase text-[10px] tracking-widest">Expiration</th>
                      <th className="px-6 py-4 text-right font-bold text-gray-500 uppercase text-[10px] tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-gray-600 italic">No transactions found for this service.</td>
                      </tr>
                    ) : Array.isArray(invoices) && (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-white/2 transition-colors group">
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
                          <td className="px-6 py-4 text-center text-xs font-mono text-gray-500">
                            {inv.status === "PENDING" ? format(new Date(inv.expiresAt), "dd/MM HH:mm") : "—"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {inv.status === "PENDING" && isAfter(new Date(inv.expiresAt), new Date()) && inv.xenditInvoiceUrl && (
                              <Button size="sm" className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold shadow-lg shadow-blue-500/20" asChild>
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
