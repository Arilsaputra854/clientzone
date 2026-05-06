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
  Rocket,
  User,
  CheckCircle2,
  Database,
  Plus,
  Trash2,
  ArrowUpDown,
  History,
  Activity as ActivityIcon
} from "lucide-react";
import { toast } from "sonner";
import { format, isAfter } from "date-fns";
import { cn } from "@/lib/utils";

export default function ClientServiceDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [dnsRecords, setDnsRecords] = useState<any[]>([]);
  const [loadingDns, setLoadingDns] = useState(false);
  const [newRecord, setNewRecord] = useState({ type: "A", name: "", content: "", proxied: true, priority: 10 });
  const [addingDns, setAddingDns] = useState(false);

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

  useEffect(() => {
    if (activeTab === "dns" && order?.type === "DOMAIN" && order?.cloudflareZoneId) {
      fetchDnsRecords();
    }
  }, [activeTab, order]);

  const fetchDnsRecords = async () => {
    setLoadingDns(true);
    try {
      const res = await fetch(`/api/domains/dns/${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDnsRecords(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingDns(false);
    }
  };

  const handleAddDns = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingDns(true);
    try {
      const payload = { ...newRecord };
      if (newRecord.type !== "MX") delete (payload as any).priority;
      if (["TXT", "MX", "NS", "SRV"].includes(newRecord.type)) payload.proxied = false;

      const res = await fetch(`/api/domains/dns/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal menambah record DNS");
      }
      toast.success("Record DNS berhasil ditambahkan");
      setNewRecord({ type: "A", name: "", content: "", proxied: true, priority: 10 });
      fetchDnsRecords();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAddingDns(false);
    }
  };

  const handleDeleteDns = async (recordId: string) => {
    if (!confirm("Hapus record DNS ini?")) return;
    try {
      const res = await fetch(`/api/domains/dns/${id}?recordId=${recordId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Gagal menghapus record DNS");
      toast.success("Record DNS berhasil dihapus");
      fetchDnsRecords();
    } catch (error: any) {
      toast.error(error.message);
    }
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
        <TabsList className="bg-white/2 border border-white/5 h-12 p-1 w-full max-w-2xl">
          <TabsTrigger value="overview" onClick={() => setActiveTab("overview")} className="flex-1 data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">
            {order.type === "DOMAIN" ? "Management" : "Deployment"}
          </TabsTrigger>
          {order.type === "DOMAIN" && (
            <TabsTrigger value="dns" onClick={() => setActiveTab("dns")} className="flex-1 data-[state=active]:bg-amber-500 data-[state=active]:text-white">DNS Management</TabsTrigger>
          )}
          <TabsTrigger value="billing" onClick={() => setActiveTab("billing")} className="flex-1 data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">Billing History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Deployment Status */}
            <Card className="bg-[#1e1e1e] border-none shadow-2xl relative overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#1a73e8]/10 text-[#1a73e8]">
                    {order.type === "DOMAIN" ? <Globe className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    {order.type === "DOMAIN" ? "Domain Status" : "Live Status"}
                  </CardTitle>
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
                        <h3 className="text-white font-bold text-lg">
                          {order.type === "DOMAIN" ? "Domain is Active" : "Your App is Live"}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {order.type === "DOMAIN" 
                            ? "Domain Anda telah berhasil didaftarkan dan aktif." 
                            : "Deployment berhasil dilakukan dan dapat diakses publik."}
                        </p>
                      </div>
                      <Button asChild className="w-full bg-[#34a853] hover:bg-[#34a853]/90 text-white font-bold h-12 shadow-lg shadow-green-500/20">
                        <a href={order.type === "DOMAIN" ? `http://${order.domainName}` : order.serverCredentials.deployedUrl} target="_blank" rel="noopener noreferrer">
                          {order.type === "DOMAIN" ? "Visit Domain" : "Open Application"}
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
                      {order.type === "DOMAIN"
                        ? (order.status === "ON_PROCESS" 
                           ? "Admin kami sedang memproses pendaftaran domain Anda. Mohon tunggu 1-24 jam."
                           : "Pendaftaran domain akan diproses setelah pembayaran terverifikasi.")
                        : (order.status === "ON_PROCESS" 
                           ? "Tim kami sedang mendeploy kode Anda ke server. Proses ini biasanya memakan waktu 1-24 jam."
                           : "Deployment akan dimulai secara otomatis setelah pembayaran Anda terverifikasi.")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-white/10 text-white">
                    {order.type === "DOMAIN" ? <User className="w-5 h-5" /> : <GitBranch className="w-5 h-5" />}
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    {order.type === "DOMAIN" ? "Domain Info" : "Source Code"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="space-y-4">
                  {order.type !== "DOMAIN" ? (
                    <div className="flex flex-col gap-2 p-4 bg-white/2 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Repository URL</span>
                      <a href={order.repoUrl} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-[#1a73e8] transition-colors flex items-center justify-between group">
                        <span className="truncate max-w-[250px]">{order.repoUrl || "Not specified"}</span>
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 p-4 bg-white/2 rounded-lg border border-white/5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Registered To</span>
                      <div className="text-white font-bold">{order.whoisData?.fullName || order.userName}</div>
                      <div className="text-xs text-gray-500">{order.whoisData?.email || order.userEmail}</div>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-gray-500 text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Active Since</span>
                    <span className="text-white font-bold">
                      {order.activatedAt ? format(new Date(order.activatedAt), "dd MMM yyyy") : "Pending setup"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-gray-500 text-sm font-medium flex items-center gap-2"><Activity className="w-4 h-4" /> Billing Cycle</span>
                    <Badge variant="outline" className="border-white/10 text-gray-400 capitalize">{order.billingCycle?.toLowerCase()}</Badge>
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

        <TabsContent value="dns" className="pt-10 space-y-8 animate-in fade-in duration-500">
          {!order.cloudflareZoneId ? (
            <Card className="bg-[#1e1e1e] border-none shadow-2xl p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
                <Shield className="w-10 h-10" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <CardTitle className="text-2xl font-bold text-white">DNS Management Belum Aktif</CardTitle>
                <p className="text-gray-500">
                  Fitur pengaturan DNS belum dikonfigurasi untuk domain ini. Silakan hubungi admin atau tunggu hingga proses pendaftaran selesai.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Record Form */}
              <Card className="bg-[#1e1e1e] border-none shadow-2xl h-fit lg:sticky lg:top-24">
                <CardHeader className="border-b border-white/5 pb-6">
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-amber-500" />
                    Tambah Record
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleAddDns} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white outline-none focus:border-amber-500 text-sm transition-all"
                        value={newRecord.type}
                        onChange={e => setNewRecord({...newRecord, type: e.target.value})}
                      >
                        {["A", "AAAA", "CNAME", "TXT", "MX", "SRV", "NS"].map(t => (
                          <option key={t} value={t} className="bg-[#1e1e1e]">{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white outline-none focus:border-amber-500 text-sm transition-all"
                        placeholder="e.g. www atau @"
                        value={newRecord.name}
                        onChange={e => setNewRecord({...newRecord, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {newRecord.type === "A" ? "IP Address (IPv4)" :
                         newRecord.type === "AAAA" ? "IP Address (IPv6)" :
                         newRecord.type === "CNAME" ? "Target Domain" :
                         newRecord.type === "MX" ? "Mail Server" :
                         newRecord.type === "TXT" ? "Text Content" : "Content"}
                      </label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white outline-none focus:border-amber-500 text-sm transition-all"
                        placeholder={
                          newRecord.type === "A" ? "e.g. 1.2.3.4" :
                          newRecord.type === "CNAME" ? "e.g. ghs.google.com" :
                          newRecord.type === "MX" ? "e.g. mail.example.com" : "Value"
                        }
                        value={newRecord.content}
                        onChange={e => setNewRecord({...newRecord, content: e.target.value})}
                        required
                      />
                    </div>

                    {newRecord.type === "MX" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Priority</label>
                        <input 
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white outline-none focus:border-amber-500 text-sm transition-all"
                          value={newRecord.priority}
                          onChange={e => setNewRecord({...newRecord, priority: parseInt(e.target.value)})}
                          required
                        />
                      </div>
                    )}

                    {!["TXT", "MX", "NS"].includes(newRecord.type) && (
                      <div className="flex items-center gap-3 pt-2">
                        <input 
                          type="checkbox" 
                          id="proxied"
                          className="w-4 h-4 rounded border-white/10 bg-white/5 accent-amber-500"
                          checked={newRecord.proxied}
                          onChange={e => setNewRecord({...newRecord, proxied: e.target.checked})}
                        />
                        <label htmlFor="proxied" className="text-xs text-gray-400 font-medium">Cloudflare Proxy (Orange Cloud)</label>
                      </div>
                    )}
                    <Button type="submit" disabled={addingDns} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold h-11 mt-2 shadow-lg shadow-amber-500/10">
                      {addingDns ? <ActivityIcon className="w-4 h-4 animate-spin" /> : "Tambah DNS Record"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Records List */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-white/2 border-b border-white/5">
                          <th className="px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">Type</th>
                          <th className="px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">Name</th>
                          <th className="px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest">Content</th>
                          <th className="px-6 py-4 font-bold text-gray-500 uppercase text-[10px] tracking-widest text-center">Proxy</th>
                          <th className="px-6 py-4 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {loadingDns ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-24 text-center">
                              <ActivityIcon className="w-8 h-8 animate-spin mx-auto text-amber-500" />
                              <p className="text-gray-500 mt-4 font-medium">Sinkronisasi Cloudflare...</p>
                            </td>
                          </tr>
                        ) : dnsRecords.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-24 text-center text-gray-600 italic">
                              DNS Records tidak ditemukan di Cloudflare.
                            </td>
                          </tr>
                        ) : (
                          dnsRecords.map((rec) => (
                            <tr key={rec.id} className="hover:bg-white/1 transition-colors">
                              <td className="px-6 py-4">
                                <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-amber-500/20">
                                  {rec.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-white">{rec.name}</td>
                              <td className="px-6 py-4 text-gray-400 font-mono text-[11px] truncate max-w-[150px] md:max-w-xs">{rec.content}</td>
                              <td className="px-6 py-4 text-center">
                                {rec.proxied ? (
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold">
                                    <Globe className="w-3 h-3" /> Proxied
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 text-[10px] font-bold">
                                    <ArrowUpDown className="w-3 h-3" /> DNS Only
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-9 w-9 text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                  onClick={() => handleDeleteDns(rec.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-4 animate-in fade-in duration-700">
                  <div className="bg-amber-500/20 p-2 rounded-lg h-fit">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">Propagasi DNS</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Perubahan DNS mungkin memerlukan waktu hingga 24 jam untuk tersebar di seluruh internet. Gunakan opsi <b>Proxied</b> untuk mendapatkan proteksi keamanan dan optimasi kecepatan dari Cloudflare.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" asChild>
                              <a href={`/invoice/${inv.id}`} target="_blank" rel="noopener noreferrer">Invoice</a>
                            </Button>
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
