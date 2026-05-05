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
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ClientTicketDetailPage() {
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
          senderName: userData?.name || user?.email,
          senderRole: "client",
          content: reply
        }),
      });

      if (res.ok) {
        setReply("");
        fetchMessages();
        fetchTicket(); // Refresh status
      } else {
        toast.error("Gagal mengirim pesan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div>
    </div>
  );

  if (!ticket) return <div className="text-center py-20 text-gray-500">Tiket tidak ditemukan.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hover:bg-white/5">
            <Link href="/tickets">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{ticket.subject}</h1>
              <Badge className={cn(
                "border-none",
                ticket.status === "CLOSED" ? "bg-gray-700" : "bg-blue-500"
              )}>
                {ticket.status}
              </Badge>
            </div>
            <p className="text-gray-500 text-sm flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Created {format(new Date(ticket.createdAt), "dd MMM yyyy HH:mm")}</span>
              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase text-[10px] font-bold">{ticket.category}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 h-[600px]">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col bg-[#1e1e1e] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.senderRole === "client" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {msg.senderRole === "admin" ? "Support Staff" : "You"}
                  </span>
                  <span className="text-[10px] text-gray-600">{format(new Date(msg.createdAt), "HH:mm")}</span>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.senderRole === "client" 
                    ? "bg-[#1a73e8] text-white rounded-tr-none" 
                    : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {ticket.status !== "CLOSED" && (
            <div className="p-6 bg-white/2 border-t border-white/5">
              <form onSubmit={handleSendReply} className="relative">
                <Textarea 
                  placeholder="Ketik pesan balasan Anda..." 
                  className="bg-white/5 border-white/10 pr-20 min-h-[100px] resize-none"
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
                  disabled={isSending || !reply.trim()}
                  className="absolute bottom-3 right-3 h-10 w-10 p-0 bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white rounded-lg shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-[#1e1e1e] border-none shadow-xl">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-widest">Info Tiket</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Prioritas</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    ticket.priority === "HIGH" ? "bg-red-500" : ticket.priority === "MEDIUM" ? "bg-amber-500" : "bg-blue-500"
                  )} />
                  <span className="text-white font-medium capitalize">{ticket.priority.toLowerCase()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500 font-bold uppercase">ID Tiket</p>
                <p className="text-white font-mono text-xs">#{id?.toString().substring(0, 8).toUpperCase()}</p>
              </div>
            </CardContent>
          </Card>

          <div className="p-5 bg-[#1a73e8]/5 border border-[#1a73e8]/20 rounded-xl text-xs text-[#1a73e8] flex gap-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <p className="leading-relaxed">
              Tim dukungan kami biasanya merespons dalam waktu kurang dari 2 jam selama jam operasional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
