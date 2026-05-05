"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { 
  Plus, 
  Megaphone, 
  Trash2, 
  Calendar,
  AlertCircle,
  Wrench,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "INFO",
    isActive: true
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data);
    } catch (error) {
      toast.error("Gagal mengambil data berita");
    } finally {
      setLoading(false);
    }
  };

  const handlePostNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Berita berhasil diposting!");
        setFormData({ title: "", content: "", type: "INFO", isActive: true });
        fetchNews();
      } else {
        toast.error("Gagal memposting berita");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus berita ini?")) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Berita dihapus");
        fetchNews();
      }
    } catch (error) {
      toast.error("Gagal menghapus");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MAINTENANCE": return <Wrench className="w-4 h-4 text-amber-500" />;
      case "ALERT": return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-[#1a73e8]" />
          News & Updates
        </h1>
        <p className="text-gray-500 mt-1">Kelola pengumuman dan jadwal maintenance untuk klien.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Post Form */}
        <div className="lg:col-span-1">
          <Card className="bg-[#1e1e1e] border-none shadow-2xl sticky top-8">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg font-bold text-white">Buat Pengumuman</CardTitle>
            </CardHeader>
            <form onSubmit={handlePostNews}>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Judul Singkat</Label>
                  <Input 
                    placeholder="Contoh: Jadwal Maintenance" 
                    className="bg-white/5 border-white/10 text-white"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipe Alert</Label>
                  <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v as string})}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1e1e] border-white/10 text-white">
                      <SelectItem value="INFO">Informasi Umum</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="ALERT">Critical Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Isi Pengumuman</Label>
                  <Textarea 
                    placeholder="Jelaskan detail pengumuman..." 
                    className="bg-white/5 border-white/10 text-white min-h-[120px]"
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    required
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold h-12 gap-2">
                  <Plus className="w-4 h-4" />
                  {isSubmitting ? "Memproses..." : "Posting Pengumuman"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* News List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Riwayat Berita</h2>
          {loading ? (
            <div className="p-12 text-center text-gray-500">Memuat data...</div>
          ) : news.length === 0 ? (
            <div className="p-12 bg-white/2 rounded-xl border border-dashed border-white/10 text-center text-gray-500 italic">
              Belum ada berita yang diposting.
            </div>
          ) : (
            news.map((item) => (
              <Card key={item.id} className="bg-[#1e1e1e] border-none shadow-md overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 p-6">
                    <div className="p-3 bg-white/5 rounded-lg">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h3 className="font-bold text-white truncate">{item.title}</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.content}</p>
                      <div className="flex items-center gap-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(item.createdAt), "dd MMM yyyy")}</span>
                        <span className="bg-white/5 px-2 py-0.5 rounded">{item.type}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
