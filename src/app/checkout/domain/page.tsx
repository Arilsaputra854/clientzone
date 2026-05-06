"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DomainCheckoutForm } from "@/components/forms/domain-checkout-form";
import { ChevronLeft, ShieldCheck, Lock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

function DomainCheckoutContent() {
  const searchParams = useSearchParams();
  const domain = searchParams.get("domain");
  const priceStr = searchParams.get("price");
  const price = priceStr ? parseInt(priceStr) : 0;
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!domain || !price) {
      router.push("/domains");
    }
  }, [domain, price, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/checkout/domain?domain=${domain}&price=${price}`);
    }
  }, [user, authLoading, router, domain, price]);

  if (authLoading || !domain) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200">
      <nav className="h-16 border-b border-white/10 bg-[#121212] flex items-center px-8 sticky top-0 z-10">
        <Link href="/domains" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to Domain Search
        </Link>
      </nav>

      <main className="container mx-auto py-16 px-6 max-w-6xl space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#1a73e8]/10 rounded-lg">
                <Globe className="w-6 h-6 text-[#1a73e8]" />
              </div>
              <Badge variant="outline" className="border-[#1a73e8]/30 text-[#1a73e8] uppercase tracking-widest text-[10px] font-bold">Domain Registration</Badge>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Amankan Domain Anda</h1>
            <p className="text-gray-500 max-w-xl">Lengkapi data pendaftaran untuk domain <span className="text-white font-bold">{domain}</span>.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-gray-600 bg-white/2 px-4 py-2 rounded-xl border border-white/5">
            <ShieldCheck className="w-4 h-4 text-[#34a853]" />
            Secure Checkout
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <DomainCheckoutForm domain={domain} price={price} />
      </main>
    </div>
  );
}


import { cn } from "@/lib/utils";

export default function DomainCheckoutPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#121212]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div></div>}>
      <DomainCheckoutContent />
    </Suspense>
  );
}
