"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Building,
  CheckCircle2,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DomainCheckoutForm({ domain, price }: { domain: string, price: number }) {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // WHOIS Form State
  const [formData, setFormData] = useState({
    fullName: userData?.name || "",
    email: user?.email || "",
    phone: "",
    organization: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Indonesia"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DOMAIN",
          domainName: domain,
          customPrice: price,
          userId: user.uid,
          userName: formData.fullName,
          userEmail: formData.email,
          whoisData: formData
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pesanan");

      toast.success("Pesanan domain dibuat! Mengarahkan ke pembayaran...");
      window.location.href = data.paymentUrl;
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-12 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <form onSubmit={handleCheckout}>
          <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden">
            <CardHeader className="pb-8 border-b border-white/5 bg-white/2">
              <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <User className="w-6 h-6 text-[#1a73e8]" />
                Data Pemilik Domain (WHOIS)
              </CardTitle>
              <CardDescription className="text-gray-500">
                Informasi ini diperlukan oleh Registrar untuk pendaftaran resmi domain Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              {/* Basic Info */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nama Lengkap</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
                    <Input id="fullName" value={formData.fullName} onChange={handleInputChange} required className="pl-11 bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required className="pl-11 bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nomor Telepon</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
                    <Input id="phone" placeholder="+62..." value={formData.phone} onChange={handleInputChange} required className="pl-11 bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="organization" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Organisasi (Opsional)</Label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
                    <Input id="organization" value={formData.organization} onChange={handleInputChange} className="pl-11 bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Address Info */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Alamat Lengkap</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
                    <Input id="address" value={formData.address} onChange={handleInputChange} required className="pl-11 bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kota</Label>
                    <Input id="city" value={formData.city} onChange={handleInputChange} required className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="state" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Provinsi</Label>
                    <Input id="state" value={formData.state} onChange={handleInputChange} required className="bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="zip" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Kode Pos</Label>
                    <Input id="zip" value={formData.zip} onChange={handleInputChange} required className="bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-white/2 border-t border-white/5 py-8 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <ShieldCheck className="w-5 h-5 text-[#34a853]" />
                Secure Checkout
              </div>
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full sm:w-auto h-12 px-10 bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold gap-2 text-base transition-all"
              >
                {loading ? "Memproses..." : "Konfirmasi & Bayar"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      <div className="space-y-8">
        <Card className="bg-[#1e1e1e] border border-[#1a73e8]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Globe className="w-24 h-24 text-white" />
          </div>
          <CardHeader className="bg-[#1a73e8]/5 border-b border-[#1a73e8]/10 pb-6">
            <CardTitle className="text-xl font-bold text-white">Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-xl text-white mb-1">{domain}</div>
                <Badge className="bg-[#1a73e8]/10 text-[#1a73e8] border border-[#1a73e8]/20 uppercase text-[10px] tracking-widest font-bold">
                  Domain Registration
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Durasi</span>
                <span className="text-white font-bold">1 Tahun</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Privacy Protection</span>
                <span className="text-[#34a853] font-bold">Termasuk</span>
              </div>
            </div>

            <div className="h-px bg-white/5 my-6" />
            
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-bold text-white">Total Bayar</span>
              <div className="text-right">
                <div className="text-3xl font-black text-[#1a73e8]">
                  Rp {price.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Inclusive of Tax</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-blue-400 font-bold">
            <Lock className="w-5 h-5" />
            Aman & Terjamin
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Data WHOIS Anda akan dikirimkan secara aman ke registrar. Kami bertindak sebagai perantara resmi untuk memastikan proses pendaftaran berjalan lancar.
          </p>
        </div>
      </div>
    </div>
  );
}
