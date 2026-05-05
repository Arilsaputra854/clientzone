"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckoutForm } from "@/components/forms/checkout-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!productId) {
      router.push("/catalog");
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        toast.error("Produk tidak ditemukan");
        router.push("/catalog");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // Handle Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/checkout?productId=${productId}`);
    }
  }, [user, authLoading, router, productId]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <nav className="h-16 border-b bg-background flex items-center px-8">
        <Link href="/catalog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Katalog
        </Link>
      </nav>

      <main className="container mx-auto py-12 px-4 max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground">Selesaikan pesanan Anda untuk mulai menggunakan layanan.</p>
        </div>

        {product && <CheckoutForm product={product} />}
      </main>
    </div>
  );
}
