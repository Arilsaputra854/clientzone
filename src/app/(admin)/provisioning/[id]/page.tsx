"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Server, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminProvisioningDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [credentials, setCredentials] = useState({
    serverIp: "",
    serverUsername: "",
    serverPassword: "",
    controlPanelUrl: "",
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?id=${id}`);
        const data = await res.json();
        // Since the generic GET returns an array
        const found = Array.isArray(data) ? data.find(o => o.id === id) : data;
        setOrder(found);
        if (found?.serverCredentials) {
          setCredentials(found.serverCredentials);
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
          ...credentials,
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

  if (loading) return <div className="flex justify-center py-20 animate-spin"><Server /></div>;
  if (!order) return <div className="text-center py-20">Pesanan tidak ditemukan.</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/provisioning">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Setup Layanan</h1>
          <p className="text-muted-foreground">Aktifkan layanan {order.productName} untuk {order.domainName}.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Info Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Produk</p>
              <p className="font-medium">{order.productName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Identitas/Domain</p>
              <p className="font-medium">{order.domainName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Klien</p>
              <p className="font-medium">{order.userEmail || order.userId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Harga</p>
              <p className="font-medium">Rp {order.price?.toLocaleString("id-ID")}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Kredensial Server</CardTitle>
            <CardDescription>Masukkan detail akses yang akan dikirimkan ke klien.</CardDescription>
          </CardHeader>
          <form onSubmit={handleActivate}>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serverIp">IP Address</Label>
                  <Input 
                    id="serverIp" 
                    placeholder="1.2.3.4" 
                    value={credentials.serverIp}
                    onChange={e => setCredentials({...credentials, serverIp: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="controlPanelUrl">Control Panel URL</Label>
                  <Input 
                    id="controlPanelUrl" 
                    placeholder="https://panel.example.com" 
                    value={credentials.controlPanelUrl}
                    onChange={e => setCredentials({...credentials, controlPanelUrl: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="serverUsername">Username</Label>
                  <Input 
                    id="serverUsername" 
                    placeholder="root" 
                    value={credentials.serverUsername}
                    onChange={e => setCredentials({...credentials, serverUsername: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serverPassword">Password</Label>
                  <Input 
                    id="serverPassword" 
                    type="text" 
                    placeholder="Pa$$w0rd" 
                    value={credentials.serverPassword}
                    onChange={e => setCredentials({...credentials, serverPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4 border-t pt-6">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/provisioning">Batal</Link>
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? "Memproses..." : "Simpan & Aktifkan"}
                <Save className="w-4 h-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
