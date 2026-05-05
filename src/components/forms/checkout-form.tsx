"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowRight, ShieldCheck } from "lucide-react";

export function CheckoutForm({ product }: { product: any }) {
  const { user, userData } = useAuth();
  const [domainName, setDomainName] = useState("");
  const [loading, setLoading] = useState(false);

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
          productId: product.id,
          userId: user.uid,
          userName: userData?.name || user.email,
          userEmail: user.email,
          domainName,
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
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Layanan</CardTitle>
            <CardDescription>
              Tentukan identitas untuk layanan {product.name} Anda.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCheckout}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Nama Domain / Identitas Server</Label>
                <Input
                  id="domain"
                  placeholder="contoh: domainku.com atau myserver-01"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Identitas ini akan digunakan sebagai rujukan utama setup layanan Anda.
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 border-t py-6 flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Pembayaran Aman via Xendit
              </div>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? "Memproses..." : "Bayar Sekarang"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-primary/50 shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{product.name}</span>
              <Badge variant="outline">{product.category}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Siklus Billing</span>
              <span className="font-medium">
                {product.billingCycle === "MONTHLY" ? "Bulanan" : "Tahunan"}
              </span>
            </div>
            <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">
                Rp {product.price.toLocaleString("id-ID")}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex gap-3">
          <CreditCard className="w-5 h-5 flex-shrink-0" />
          <p>
            Setelah pembayaran berhasil, tim kami akan segera memproses provisioning layanan Anda secara manual. Estimasi waktu 1-24 jam.
          </p>
        </div>
      </div>
    </div>
  );
}
