"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Server, Save, ArrowLeft, ExternalLink, GitBranch, Globe, User, Phone, MapPin, Mail } from "lucide-react";
import Link from "next/link";

export default function AdminProvisioningDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [setup, setSetup] = useState({
    deployedUrl: "",
    cloudflareZoneId: "",
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?id=${id}`);
        const data = await res.json();
        const found = Array.isArray(data) ? data.find((o: any) => o.id === id) : data;
        setOrder(found);
        if (found?.serverCredentials?.deployedUrl || found?.cloudflareZoneId) {
          setSetup({ 
            deployedUrl: found?.serverCredentials?.deployedUrl || "",
            cloudflareZoneId: found?.cloudflareZoneId || ""
          });
        }
      } catch (error) {
        toast.error("Gagal mengambil data pesanan");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/provisioning/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deployedUrl: setup.deployedUrl,
          cloudflareZoneId: setup.cloudflareZoneId,
          status: "ACTIVE",
        }),
      });

      if (!res.ok) throw new Error("Gagal mengaktifkan layanan");

      toast.success("Layanan berhasil diaktifkan!");
      router.push("/admin/provisioning");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div>
    </div>
  );
  
  if (!order) return <div className="text-center py-20">Pesanan tidak ditemukan.</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-white/5">
          <Link href="/admin/provisioning">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Setup & Aktivasi</h1>
          <p className="text-gray-500">
            {order.type === "DOMAIN" 
              ? `Konfigurasi pendaftaran untuk domain: ${order.domainName}.`
              : `Konfigurasi alamat publik untuk layanan ${order.productName}.`}
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Info Pesanan & Repo */}
        <div className="space-y-8 md:col-span-1">
          <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white">Informasi Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5 text-sm">
              <div className="space-y-1">
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Klien</p>
                <p className="text-white font-medium">{order.userName || order.userEmail || order.userId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Produk</p>
                <p className="text-[#1a73e8] font-bold text-base">{order.productName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Domain/Identitas</p>
                <p className="text-white font-mono">{order.domainName}</p>
              </div>
            </CardContent>
          </Card>

          {order.type === "DOMAIN" ? (
            <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden border-l-4 border-amber-500">
              <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    WHOIS Data
                  </CardTitle>
                  <CardDescription className="text-gray-500">Informasi pemilik domain dari klien.</CardDescription>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-white/5 text-gray-500"><User className="w-4 h-4" /></div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-600 uppercase">Nama Lengkap</p>
                      <p className="text-white text-sm">{order.whoisData?.fullName || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-white/5 text-gray-500"><Mail className="w-4 h-4" /></div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-600 uppercase">Email</p>
                      <p className="text-white text-sm">{order.whoisData?.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-white/5 text-gray-500"><Phone className="w-4 h-4" /></div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-600 uppercase">No. Telepon</p>
                      <p className="text-white text-sm">{order.whoisData?.phone || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-white/5 text-gray-500"><MapPin className="w-4 h-4" /></div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-600 uppercase">Alamat Lengkap</p>
                      <p className="text-white text-xs leading-relaxed">
                        {order.whoisData?.address}, {order.whoisData?.city}, {order.whoisData?.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden border-l-4 border-[#1a73e8]">
              <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    Source Code
                  </CardTitle>
                  <CardDescription className="text-gray-500">Repository publik dari klien.</CardDescription>
                </CardHeader>
              <CardContent>
                {order.repoUrl ? (
                  <Button variant="outline" className="w-full justify-between bg-white/2 border-white/10 hover:bg-white/5 text-white h-12" asChild>
                    <a href={order.repoUrl} target="_blank" rel="noopener noreferrer">
                      <span className="truncate max-w-[180px]">{order.repoUrl}</span>
                      <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
                    </a>
                  </Button>
                ) : (
                  <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium">
                    URL Repository tidak tersedia (Order Lama)
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Setup Form */}
        <Card className="md:col-span-2 bg-[#1e1e1e] border-none shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-8">
            <CardTitle className="text-xl font-bold text-white">
              {order.type === "DOMAIN" ? "Domain Activation" : "Deployment URL"}
            </CardTitle>
            <CardDescription className="text-gray-500">
              {order.type === "DOMAIN" 
                ? "Masukkan URL akses domain (biasanya sama dengan nama domain) setelah Anda mendaftarkannya di registrar."
                : "Masukkan alamat publik yang sudah aktif setelah Anda melakukan deployment."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleActivate}>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="deployedUrl" className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  URL Akses Publik
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#1a73e8] transition-colors">
                    <Globe className="w-5 h-5" />
                  </div>
                  <Input 
                    id="deployedUrl" 
                    placeholder="https://app-name.clientzone.id" 
                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1a73e8] text-lg transition-all"
                    value={setup.deployedUrl}
                    onChange={e => setSetup({ deployedUrl: e.target.value })}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Link ini akan langsung ditampilkan di dashboard klien sebagai tombol akses utama.
                </p>
              </div>

              {order.type === "DOMAIN" && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <Label htmlFor="cloudflareZoneId" className="text-sm font-bold text-amber-500 uppercase tracking-widest">
                    Cloudflare Zone ID
                  </Label>
                  <Input 
                    id="cloudflareZoneId" 
                    placeholder="Contoh: 023e105f4ecef8ad9ca31a8372d0c353" 
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-amber-500 h-12 transition-all"
                    value={setup.cloudflareZoneId}
                    onChange={e => setSetup({ ...setup, cloudflareZoneId: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-500 italic">
                    * Masukkan Zone ID dari Cloudflare untuk mengaktifkan fitur DNS Management di sisi klien.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-white/2 border-t border-white/5 py-8 flex justify-between items-center gap-4">
              <div>
                {order.status === "ACTIVE" && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 font-bold"
                    onClick={async () => {
                      if (!confirm("Stop/Suspend layanan ini? Klien tidak akan bisa mengaksesnya.")) return;
                      setSubmitting(true);
                      try {
                        await fetch(`/api/provisioning/${id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ deployedUrl: setup.deployedUrl, status: "SUSPENDED" }),
                        });
                        toast.success("Layanan dihentikan");
                        window.location.reload();
                      } catch (e) { toast.error("Gagal"); }
                      setSubmitting(false);
                    }}
                  >
                    Suspend Layanan
                  </Button>
                )}
                {order.status === "SUSPENDED" && (
                  <Button 
                    type="button" 
                    className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 font-bold"
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        await fetch(`/api/provisioning/${id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ deployedUrl: setup.deployedUrl, status: "ACTIVE" }),
                        });
                        toast.success("Layanan diaktifkan kembali");
                        window.location.reload();
                      } catch (e) { toast.error("Gagal"); }
                      setSubmitting(false);
                    }}
                  >
                    Aktifkan Kembali
                  </Button>
                )}
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="ghost" className="text-gray-500 hover:text-white" asChild>
                  <Link href="/admin/provisioning">Batal</Link>
                </Button>
                <Button type="submit" disabled={submitting} className="h-12 px-8 bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold gap-2 shadow-lg shadow-blue-500/20">
                  {submitting ? "Memproses..." : order.status === "ACTIVE" ? "Update Konfigurasi" : "Aktifkan Layanan"}
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
