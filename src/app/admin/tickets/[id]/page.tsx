"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  User, 
  ShieldCheck, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminTicketDetailPage() {
  const { id } = useParams();
  const { user, userData } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchTicket();
      fetchMessages();
    }
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets?id=${id}`);
      const data = await res.json();
      setTicket(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/tickets/messages?ticketId=${id}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/tickets/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: id,
          senderId: user?.uid,
          senderName: "Support Team",
          senderRole: "admin",
          content: reply
        }),
      });

      if (res.ok) {
        setReply("");
        fetchMessages();
        fetchTicket(); 
      } else {
        toast.error("Gagal mengirim balasan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!confirm("Tutup tiket ini? Klien tidak akan bisa membalas lagi.")) return;
    
    try {
      const res = await fetch(`/api/tickets?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      });

      if (res.ok) {
        toast.success("Tiket ditutup");
        fetchTicket(); // Refresh ticket data
      } else {
        toast.error("Gagal menutup tiket");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div>
    </div>
  );

  if (!ticket) return <div className="text-center py-20 text-gray-500">Tiket tidak ditemukan.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-white/5">
            <Link href="/admin/tickets">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{ticket.subject}</h1>
              <Badge className={cn(
                "border-none",
                ticket.status === "CLOSED" ? "bg-gray-700" : "bg-red-500"
              )}>
                {ticket.status}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-4">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Client: {ticket.userName}</span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase">ID: {id?.toString().substring(0, 8)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white" onClick={handleCloseTicket}>
            <XCircle className="w-4 h-4 mr-2" />
            Tutup Tiket
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4 h-[650px]">
        {/* Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-[#1e1e1e] border-none shadow-xl">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Metadata Tiket</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-600 font-bold uppercase">Kategori</p>
                <p className="text-white font-medium">{ticket.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-600 font-bold uppercase">Prioritas</p>
                <Badge variant="outline" className={cn(
                  "px-2 py-0.5",
                  ticket.priority === "HIGH" ? "border-red-500/50 text-red-500" : "border-white/10 text-gray-400"
                )}>
                  {ticket.priority}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-600 font-bold uppercase">Dibuka Pada</p>
                <p className="text-white text-xs">{format(new Date(ticket.createdAt), "dd MMM yyyy HH:mm")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.senderRole === "admin" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-center gap-2 mb-2 px-2">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    msg.senderRole === "admin" ? "text-[#1a73e8]" : "text-gray-500"
                  )}>
                    {msg.senderRole === "admin" ? "YOU (SUPPORT)" : ticket.userName}
                  </span>
                  <span className="text-[10px] text-gray-600">{format(new Date(msg.createdAt), "HH:mm")}</span>
                </div>
                <div className={cn(
                  "p-5 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                  msg.senderRole === "admin" 
                    ? "bg-[#1a73e8] text-white rounded-tr-none" 
                    : "bg-white/5 text-gray-200 border border-white/10 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-white/2 border-t border-white/5">
            <form onSubmit={handleSendReply} className="relative">
              <Textarea 
                placeholder="Balas tiket ini sebagai Admin..." 
                className="bg-white/5 border-white/10 pr-24 min-h-[120px] resize-none text-white focus:border-[#1a73e8] transition-all"
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={isSending || !reply.trim() || ticket.status === "CLOSED"}
                className="absolute bottom-4 right-4 h-11 px-6 bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold rounded-lg shadow-xl gap-2"
              >
                {isSending ? "..." : "Balas"}
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
