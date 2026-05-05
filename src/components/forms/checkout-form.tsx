"use client";

import { useState, useEffect } from "react";
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
  Info, 
  Globe, 
  Clock, 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Search
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function CheckoutForm({ product }: { product: any }) {
  const { user, userData } = useAuth();
  const [domainName, setDomainName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Repo Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [repoData, setRepoData] = useState<any>(null);
  const [validationError, setValidationError] = useState("");

  const checkRepository = async () => {
    if (!repoUrl) return;
    
    setIsValidating(true);
    setValidationError("");
    setRepoData(null);
    setSelectedBranch("");

    try {
      const res = await fetch("/api/repo-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || "Gagal memvalidasi repository");
        toast.error(data.error || "Validasi gagal");
      } else {
        setRepoData(data);
        if (data.branches.includes("main")) setSelectedBranch("main");
        else if (data.branches.includes("master")) setSelectedBranch("master");
        else if (data.branches.length > 0) setSelectedBranch(data.branches[0]);
        
        toast.success("Repository valid!");
      }
    } catch (error) {
      setValidationError("Terjadi kesalahan koneksi");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    if (!repoData || !selectedBranch) {
      toast.error("Mohon validasi repository dan pilih branch terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          userId: user.uid,
          userName: userData?.name || user.email,
          userEmail: user.email,
          domainName,
          repoUrl,
          branch: selectedBranch,
          projectType: repoData.projectType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pesanan");

      toast.success("Pesanan dibuat! Mengarahkan ke pembayaran...");
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
        <Card className="bg-[#1e1e1e] border-none shadow-2xl">
          <CardHeader className="pb-8 border-b border-white/5">
            <CardTitle className="text-2xl font-bold text-white">Konfigurasi Project</CardTitle>
            <CardDescription className="text-gray-500">
              Validasi sumber kode dan pilih branch untuk deployment otomatis.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCheckout}>
            <CardContent className="space-y-10 pt-8">
              {/* Repository URL with Validation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="repo" className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Public GitHub Repository
                  </Label>
                  {repoData && (
                    <Badge className="bg-[#34a853] text-white gap-1 px-2">
                      <CheckCircle2 className="w-3 h-3" />
                      Public & Verified
                    </Badge>
                  )}
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#1a73e8] transition-colors">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <Input
                      id="repo"
                      placeholder="https://github.com/username/repo-name"
                      className={cn(
                        "pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1a73e8] text-lg transition-all",
                        validationError && "border-red-500/50 focus:border-red-500"
                      )}
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={checkRepository}
                    disabled={isValidating || !repoUrl}
                    className="h-14 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2 transition-all font-bold"
                  >
                    {isValidating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    Cek Repo
                  </Button>
                </div>

                {validationError && (
                  <div className="flex gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium">{validationError}</p>
                  </div>
                )}

                {repoData && (
                  <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-4">
                    {/* Branch Selection */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <GitBranch className="w-3 h-3" /> Pilih Branch
                      </Label>
                      <Select value={selectedBranch} onValueChange={v => setSelectedBranch(v as string)}>
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Pilih branch" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e1e] border-white/10 text-white">
                          {repoData.branches.map((branch: string) => (
                            <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Project Type Info */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-3 h-3" /> Tipe Project Terdeteksi
                      </Label>
                      <div className="h-12 flex items-center px-4 bg-[#1a73e8]/10 border border-[#1a73e8]/20 rounded-md text-white font-bold">
                        {repoData.projectType}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Domain Name */}
              <div className="space-y-4">
                <Label htmlFor="domain" className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Custom Domain / Subdomain
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#1a73e8] transition-colors">
                    <Globe className="w-5 h-5" />
                  </div>
                  <Input
                    id="domain"
                    placeholder="contoh: projectku.com"
                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-[#1a73e8] text-lg transition-all"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-white/2 border-t border-white/5 py-8 flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <ShieldCheck className="w-5 h-5 text-[#34a853]" />
                Secure Checkout via Xendit
              </div>
              <Button 
                type="submit" 
                disabled={loading || !repoData || !selectedBranch} 
                className="w-full sm:w-auto h-12 px-10 bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold gap-2 text-base transition-all disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Konfirmasi & Bayar"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="space-y-8">
        <Card className="bg-[#1e1e1e] border border-[#1a73e8]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CreditCard className="w-24 h-24 text-white" />
          </div>
          <CardHeader className="bg-[#1a73e8]/5 border-b border-[#1a73e8]/10 pb-6">
            <CardTitle className="text-xl font-bold text-white">Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-lg text-white mb-1">{product.name}</div>
                <Badge className="bg-white/5 text-gray-400 border border-white/10 uppercase text-[10px] tracking-widest">
                  {product.category}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Siklus Billing</span>
                <span className="text-white font-bold">
                  {product.billingCycle === "MONTHLY" ? "Bulanan" : "Tahunan"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Setup Fee</span>
                <span className="text-[#34a853] font-bold">Free</span>
              </div>
            </div>

            <div className="h-px bg-white/5 my-6" />
            
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-bold text-white">Total Bayar</span>
              <div className="text-right">
                <div className="text-3xl font-black text-[#1a73e8]">
                  Rp {product.price.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Inclusive of Tax</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-sm text-amber-500/80 flex gap-4 shadow-lg">
          <div className="bg-amber-500/10 p-2 rounded-lg h-fit">
            <Clock className="w-5 h-5 flex-shrink-0" />
          </div>
          <p className="leading-relaxed font-medium">
            Sistem kami akan memantau branch <span className="text-white font-bold">{selectedBranch || "yang dipilih"}</span> secara otomatis untuk pembaruan di masa mendatang.
          </p>
        </div>
      </div>
    </div>
  );
}
