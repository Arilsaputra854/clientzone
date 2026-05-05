"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckoutForm } from "@/components/forms/checkout-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

function CheckoutContent() {
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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/checkout?productId=${productId}`);
    }
  }, [user, authLoading, router, productId]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200">
      <nav className="h-16 border-b border-white/10 bg-[#121212] flex items-center px-8 sticky top-0 z-10">
        <Link href="/catalog" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </nav>

      <main className="container mx-auto py-16 px-6 max-w-6xl space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white tracking-tight">Complete your order</h1>
            <p className="text-gray-500">Selesaikan pembayaran untuk mengaktifkan layanan infrastruktur Anda.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-600 bg-white/2 px-4 py-2 rounded-lg border border-white/5">
            <ShieldCheck className="w-4 h-4 text-[#34a853]" />
            Secure Checkout
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {product && <CheckoutForm product={product} />}
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#121212]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
