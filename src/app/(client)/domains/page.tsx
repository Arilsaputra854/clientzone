"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Globe, Check, X, AlertCircle, ShoppingCart, ArrowRight, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DomainsPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;

    let searchDomain = query.trim().toLowerCase();
    if (!searchDomain.includes(".")) {
      searchDomain += ".com";
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/domains/check?domain=${searchDomain}`);
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setResult(data);
      }
    } catch (error) {
      toast.error("Gagal mengecek domain. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a73e8] to-[#0d47a1] p-12 text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-black/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 backdrop-blur-md">
            New Feature: Domain Registry
          </Badge>
          <h1 className="text-5xl font-black tracking-tight leading-tight">
            Temukan Identitas <br />
            <span className="text-amber-400">Digital Anda.</span>
          </h1>
          <p className="text-lg text-blue-100 font-medium max-w-lg">
            Cek ketersediaan domain dan amankan sekarang juga dengan harga terbaik dan dukungan 24/7.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl bg-white/10 p-2 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="flex-1 relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200" />
              <Input
                placeholder="Cari domain impian Anda (misal: bisnissaya.com)"
                className="pl-12 bg-transparent border-none text-white placeholder:text-blue-200 h-14 text-lg focus-visible:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-white text-[#0d47a1] hover:bg-amber-400 hover:text-black font-bold px-8 h-14 rounded-xl transition-all shadow-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-current border-t-transparent animate-spin rounded-full" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Cek Sekarang
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="grid gap-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Main Result */}
          <Card className={cn(
            "border-none overflow-hidden transition-all duration-500",
            result.available 
              ? "bg-[#1e1e1e] ring-2 ring-emerald-500/50 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]" 
              : "bg-[#1e1e1e] ring-2 ring-red-500/20"
          )}>
            <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-white">{result.domain}</h2>
                  <Badge className={cn(
                    "px-3 py-1 font-bold",
                    result.available ? "bg-emerald-500 text-white" : "bg-red-500/10 text-red-500 border border-red-500/20"
                  )}>
                    {result.available ? "Available" : "Taken"}
                  </Badge>
                </div>
                <p className="text-gray-500 font-medium">Ketersediaan real-time untuk domain pilihan Anda.</p>
              </div>
              {result.available && (
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Mulai dari</p>
                  <p className="text-4xl font-black text-white">{formatPrice(result.price)}<span className="text-sm text-gray-500 font-medium ml-1">/thn</span></p>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-8">
              {result.available ? (
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 text-emerald-400 font-bold">
                      <Check className="w-6 h-6" />
                      Kabar Baik! Domain ini tersedia untuk didaftarkan.
                    </div>
                    <ul className="space-y-2">
                      {["Full DNS Control", "Privacy Protection Ready", "Email Forwarding"].map((feat, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={() => router.push(`/checkout/domain?domain=${result.domain}&price=${result.price}`)}
                    className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white px-10 h-16 rounded-2xl text-lg font-black shadow-2xl shadow-[#1a73e8]/20 flex items-center gap-3"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Amankan Domain
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                    <X className="w-10 h-10 text-red-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Yah, domain ini sudah dimiliki orang lain.</h3>
                    <p className="text-gray-500 max-w-md">Jangan khawatir, kami telah menyiapkan beberapa alternatif menarik di bawah ini yang mungkin Anda sukai.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alternatives */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Alternatif Domain Lainnya
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.alternatives.map((alt: any, i: number) => (
                  <Card key={i} className="bg-[#1e1e1e] border-white/5 hover:border-[#1a73e8]/50 transition-all group">
                    <CardHeader className="p-5 pb-2">
                      <h4 className="font-bold text-white group-hover:text-[#1a73e8] transition-colors">{alt.domain}</h4>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                      <p className="text-2xl font-black text-white">{formatPrice(alt.price)}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">per tahun</p>
                    </CardContent>
                    <CardFooter className="p-5 pt-0">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/checkout/domain?domain=${alt.domain}&price=${alt.price}`)}
                        className="w-full justify-between text-[#1a73e8] hover:bg-[#1a73e8]/10 px-0"
                      >
                        Pilih Domain
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      {!result && !loading && (
        <div className="grid md:grid-cols-3 gap-8 py-12 border-t border-white/5">
          <div className="space-y-4 p-6 rounded-3xl bg-white/2 hover:bg-white/5 transition-colors group">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Check className="w-6 h-6 text-amber-500" />
            </div>
            <h4 className="text-lg font-bold text-white">Instan & Mudah</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Proses pengecekan real-time dengan akses ke ratusan ekstensi domain populer.</p>
          </div>
          <div className="space-y-4 p-6 rounded-3xl bg-white/2 hover:bg-white/5 transition-colors group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ExternalLink className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="text-lg font-bold text-white">Manajemen Terpusat</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Kelola semua domain Anda dalam satu dashboard terintegrasi dengan hosting.</p>
          </div>
          <div className="space-y-4 p-6 rounded-3xl bg-white/2 hover:bg-white/5 transition-colors group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Check className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="text-lg font-bold text-white">Aman & Terpercaya</h4>
            <p className="text-sm text-gray-500 leading-relaxed">Perlindungan privasi WHOIS gratis untuk menjaga data pribadi Anda dari publik.</p>
          </div>
        </div>
      )}
    </div>
  );
}
