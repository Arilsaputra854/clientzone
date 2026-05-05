"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Check } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen bg-muted/30">
      {/* Navbar */}
      <nav className="h-16 border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary italic">Client Zone</Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Daftar</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-12 px-4 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Pilih Paket Layanan Anda</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Solusi infrastruktur IT yang andal, aman, dan berperforma tinggi untuk bisnis Anda.
          </p>
        </div>

        <div className="flex justify-center">
          <Tabs defaultValue="ALL" onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="ALL">Semua</TabsTrigger>
              <TabsTrigger value="HOSTING">Hosting</TabsTrigger>
              <TabsTrigger value="VPS">VPS</TabsTrigger>
              <TabsTrigger value="EMAIL">Email</TabsTrigger>
              <TabsTrigger value="OTHER">Lainnya</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="h-24 bg-muted rounded m-6"></CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
            Belum ada produk yang tersedia di kategori ini.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col border-2 hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge className="mb-2">{product.category}</Badge>
                    <div className="text-2xl font-bold text-primary">
                      Rp {product.price.toLocaleString("id-ID")}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{product.billingCycle === "MONTHLY" ? "bln" : "thn"}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description || "Layanan infrastruktur berkualitas tinggi."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm">
                    {product.description?.split('\n').map((line: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full gap-2 text-lg py-6">
                    <Link href={`/checkout?productId=${product.id}`}>
                      <ShoppingCart className="w-5 h-5" />
                      Order Sekarang
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t bg-background py-12 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 Client Zone & Billing. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
