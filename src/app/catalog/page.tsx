"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Check, ArrowLeft, Search, Filter } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PublicCatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.filter((p: any) => p.isActive));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = filter === "ALL" 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 selection:bg-[#1a73e8]/30">
      {/* Navbar */}
      <nav className="h-16 border-b border-white/10 bg-[#121212] sticky top-0 z-10">
        <div className="container mx-auto h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white font-bold italic">CZ</div>
              <span className="text-xl font-bold text-white tracking-tight">ClientZone</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white px-6">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-16 px-6 space-y-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
            Build with the best <span className="text-[#1a73e8]">infrastructure</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Solusi cloud dan hosting yang andal, aman, dan mudah dikelola untuk mempercepat pertumbuhan bisnis Anda.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Tabs defaultValue="ALL" onValueChange={setFilter} className="w-full max-w-2xl">
            <TabsList className="grid grid-cols-5 h-12 bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="ALL" className="data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="HOSTING" className="data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">Hosting</TabsTrigger>
              <TabsTrigger value="VPS" className="data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">VPS</TabsTrigger>
              <TabsTrigger value="EMAIL" className="data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">Email</TabsTrigger>
              <TabsTrigger value="OTHER" className="data-[state=active]:bg-[#1a73e8] data-[state=active]:text-white">Other</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#1e1e1e] rounded-xl h-96 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 text-gray-500 border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
            No products available in this category.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col bg-[#1e1e1e] border-none shadow-2xl group hover:-translate-y-1 transition-all duration-300">
                <CardHeader className="pb-8">
                  <div className="flex justify-between items-start mb-6">
                    <Badge className="bg-white/5 text-gray-400 border border-white/10 px-3 py-1 uppercase tracking-widest text-[10px] font-bold">
                      {product.category}
                    </Badge>
                    <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Popular
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-white mb-2">{product.name}</CardTitle>
                  <CardDescription className="text-gray-500 text-base">
                    {product.description || "Layanan infrastruktur berkualitas tinggi."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-gray-500 font-medium italic">Rp</span>
                    <span className="text-4xl font-black text-white">{product.price.toLocaleString("id-ID")}</span>
                    <span className="text-sm text-gray-500 font-medium">
                      /{product.billingCycle === "MONTHLY" ? "mo" : "yr"}
                    </span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <ul className="space-y-4 text-sm text-gray-400">
                    {product.description?.split('\n').map((line: string, i: number) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="bg-[#34a853]/10 p-1 rounded-full">
                          <Check className="w-3 h-3 text-[#34a853]" />
                        </div>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-8">
                  <Button asChild className="w-full bg-white/5 hover:bg-[#1a73e8] text-gray-300 hover:text-white border border-white/10 hover:border-[#1a73e8] h-14 transition-all text-base font-bold">
                    <Link href={`/checkout?productId=${product.id}`}>
                      Get Started
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 bg-[#121212] py-20 mt-20">
        <div className="container mx-auto px-6 grid gap-12 md:grid-cols-4">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white font-bold italic">CZ</div>
              <span className="text-xl font-bold text-white tracking-tight">ClientZone</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Platform management infrastruktur IT nomor satu di Indonesia. Cepat, aman, dan skalabel.
            </p>
          </div>
          {/* Footer columns could go here */}
        </div>
        <div className="container mx-auto px-6 pt-20 mt-20 border-t border-white/5 text-center text-gray-600 text-sm">
          <p>&copy; 2026 ClientZone & Billing. Powered by Firebase Aesthetics.</p>
        </div>
      </footer>
    </div>
  );
}
