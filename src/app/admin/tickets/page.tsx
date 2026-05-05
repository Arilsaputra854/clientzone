"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  User,
  Filter,
  LifeBuoy
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === "ALL") return true;
    if (filter === "OPEN") return t.status === "OPEN" || t.status === "WAITING_ADMIN";
    if (filter === "CLOSED") return t.status === "CLOSED";
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN": return <Badge className="bg-blue-500">Open</Badge>;
      case "WAITING_ADMIN": return <Badge className="bg-red-500">Waiting Admin</Badge>;
      case "WAITING_CLIENT": return <Badge className="bg-amber-500">Waiting Client</Badge>;
      case "CLOSED": return <Badge variant="outline">Closed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-[#1a73e8]" />
            Helpdesk & Tickets
          </h1>
          <p className="text-gray-500 mt-1">Kelola permintaan dukungan dari seluruh klien.</p>
        </div>

        <div className="flex items-center gap-2 bg-[#1e1e1e] p-1 rounded-lg border border-white/5">
          {["ALL", "OPEN", "CLOSED"].map((f) => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 px-4 text-xs font-bold transition-all",
                filter === f ? "bg-[#1a73e8] text-white" : "text-gray-500 hover:text-white"
              )}
              onClick={() => setFilter(f)}
            >
              {f === "OPEN" ? "Perlu Respon" : f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Memuat data...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-20 text-center bg-[#1e1e1e] rounded-xl border border-dashed border-white/10 text-gray-500 italic">
            Tidak ada tiket yang ditemukan.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`}>
              <Card className="bg-[#1e1e1e] border-none shadow-md hover:shadow-blue-500/5 hover:translate-x-1 transition-all group">
                <CardContent className="p-0">
                  <div className="flex items-center gap-6 p-6">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border",
                      ticket.status === "WAITING_ADMIN" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/5 text-gray-500"
                    )}>
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-white truncate">{ticket.subject}</h3>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {ticket.userName}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {format(new Date(ticket.updatedAt), "dd MMM HH:mm")}</span>
                        <span className="uppercase text-[10px] font-bold tracking-widest opacity-50">{ticket.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className={cn(
                         "text-[10px] font-bold px-2 py-1 rounded",
                         ticket.priority === "HIGH" ? "text-red-500 bg-red-500/10" : "text-gray-500 bg-white/5"
                       )}>
                         {ticket.priority}
                       </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
