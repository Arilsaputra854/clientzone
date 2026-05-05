"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  LifeBuoy,
  Search
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ClientTicketsPage() {
  const { user, userData } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Ticket State
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "Technical",
    priority: "MEDIUM",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/tickets?userId=${user?.uid}`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          userName: userData?.name || user?.email,
          ...newTicket
        }),
      });

      if (res.ok) {
        toast.success("Tiket berhasil dibuat!");
        setIsCreateOpen(false);
        setNewTicket({ subject: "", category: "Technical", priority: "MEDIUM", message: "" });
        fetchTickets();
      } else {
        toast.error("Gagal membuat tiket");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN": return <Badge className="bg-blue-500">Open</Badge>;
      case "WAITING_ADMIN": return <Badge className="bg-amber-500">Waiting Staff</Badge>;
      case "WAITING_CLIENT": return <Badge className="bg-green-500">Replied</Badge>;
      case "CLOSED": return <Badge variant="outline">Closed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-10 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-[#1a73e8]" />
            Tiket Bantuan
          </h1>
          <p className="text-gray-500 mt-1">Kami siap membantu kendala teknis dan billing Anda 24/7.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger
            render={
              <Button className="bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold gap-2 h-11 px-6 shadow-lg shadow-blue-500/20 transition-all">
                <Plus className="w-4 h-4" />
                Buka Tiket Baru
              </Button>
            }
          />
          <DialogContent className="bg-[#1e1e1e] border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Buat Tiket Baru</DialogTitle>
              <CardDescription className="text-gray-500">Jelaskan kendala Anda sedetail mungkin.</CardDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label>Subjek / Judul</Label>
                <Input 
                  placeholder="Contoh: Gagal deploy dari branch main" 
                  className="bg-white/5 border-white/10"
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={newTicket.category} onValueChange={v => setNewTicket({...newTicket, category: v})}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1e1e] border-white/10 text-white">
                      <SelectItem value="Technical">Teknis</SelectItem>
                      <SelectItem value="Billing">Billing / Pembayaran</SelectItem>
                      <SelectItem value="Sales">Penjualan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioritas</Label>
                  <Select value={newTicket.priority} onValueChange={v => setNewTicket({...newTicket, priority: v})}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1e1e] border-white/10 text-white">
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pesan</Label>
                <Textarea 
                  placeholder="Detail kendala yang Anda alami..." 
                  className="bg-white/5 border-white/10 min-h-[150px]"
                  value={newTicket.message}
                  onChange={e => setNewTicket({...newTicket, message: e.target.value})}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold h-12">
                  {isSubmitting ? "Mengirim..." : "Kirim Tiket"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="bg-[#1e1e1e] border-none shadow-2xl py-20 text-center">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-700">
                <LifeBuoy className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-lg">Belum ada tiket bantuan</p>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">Jika Anda mengalami kendala, jangan ragu untuk menghubungi tim kami melalui tiket.</p>
              </div>
              <Button variant="outline" className="border-white/10 text-gray-400" onClick={() => setIsCreateOpen(true)}>
                Buka Tiket Sekarang
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <Card className="bg-[#1e1e1e] border-none shadow-md hover:shadow-[#1a73e8]/5 hover:translate-x-1 transition-all group">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-6 p-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border",
                        ticket.status === "CLOSED" ? "bg-white/5 border-white/5 text-gray-700" : "bg-[#1a73e8]/5 border-[#1a73e8]/10 text-[#1a73e8]"
                      )}>
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-white truncate">{ticket.subject}</h3>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Updated {format(new Date(ticket.updatedAt), "dd MMM HH:mm")}</span>
                          <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{ticket.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
