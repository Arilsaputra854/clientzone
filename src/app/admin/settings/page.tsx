"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Settings, 
  Mail, 
  Send, 
  MessageSquare, 
  Save, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    smtpHost: "",
    smtpPort: "465",
    smtpUser: "",
    smtpPass: "",
    smtpFromName: "ClientZone",
    telegramToken: "",
    telegramChatId: "",
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      toast.error("Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Pengaturan berhasil disimpan!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch("/api/admin/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "EMAIL" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setTestingEmail(false);
    }
  };

  const testTelegram = async () => {
    setTestingTelegram(true);
    try {
      const res = await fetch("/api/admin/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TELEGRAM" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setTestingTelegram(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500 italic">Memuat sistem...</div>;

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="pb-6 border-b border-white/5">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#1a73e8]" />
          System Settings
        </h1>
        <p className="text-gray-500 mt-1">Konfigurasi SMTP untuk OTP dan Telegram untuk notifikasi admin.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* SMTP Configuration */}
        <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden border-l-4 border-[#1a73e8]">
          <CardHeader className="border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#1a73e8]/10 text-[#1a73e8]">
                  <Mail className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-bold text-white">SMTP Gateway</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={testEmail} 
                disabled={testingEmail}
                className="text-gray-500 hover:text-[#1a73e8] gap-2"
              >
                {testingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Test
              </Button>
            </div>
            <CardDescription className="text-gray-500">Kirim kode OTP registrasi klien via email.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Host</Label>
                <Input 
                  placeholder="smtp.gmail.com" 
                  className="bg-white/5 border-white/10 text-white h-11"
                  value={settings.smtpHost}
                  onChange={e => setSettings({...settings, smtpHost: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Port</Label>
                <Input 
                  placeholder="465" 
                  className="bg-white/5 border-white/10 text-white h-11"
                  value={settings.smtpPort}
                  onChange={e => setSettings({...settings, smtpPort: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Username / Email</Label>
              <Input 
                placeholder="noreply@domain.id" 
                className="bg-white/5 border-white/10 text-white h-11"
                value={settings.smtpUser}
                onChange={e => setSettings({...settings, smtpUser: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Password / App Key</Label>
              <Input 
                type="password"
                placeholder="••••••••••••" 
                className="bg-white/5 border-white/10 text-white h-11"
                value={settings.smtpPass}
                onChange={e => setSettings({...settings, smtpPass: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Sender Name</Label>
              <Input 
                placeholder="ClientZone Support" 
                className="bg-white/5 border-white/10 text-white h-11"
                value={settings.smtpFromName}
                onChange={e => setSettings({...settings, smtpFromName: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Telegram Configuration */}
        <div className="space-y-8">
          <Card className="bg-[#1e1e1e] border-none shadow-2xl overflow-hidden border-l-4 border-[#0088cc]">
            <CardHeader className="border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#0088cc]/10 text-[#0088cc]">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">Telegram Alerts</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={testTelegram} 
                  disabled={testingTelegram}
                  className="text-gray-500 hover:text-[#0088cc] gap-2"
                >
                  {testingTelegram ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Test
                </Button>
              </div>
              <CardDescription className="text-gray-500">Notifikasi real-time untuk order & tiket baru.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Bot Token</Label>
                <Input 
                  placeholder="123456789:ABCDEF..." 
                  className="bg-white/5 border-white/10 text-white h-11"
                  value={settings.telegramToken}
                  onChange={e => setSettings({...settings, telegramToken: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Target Chat ID</Label>
                <Input 
                  placeholder="-100..." 
                  className="bg-white/5 border-white/10 text-white h-11"
                  value={settings.telegramChatId}
                  onChange={e => setSettings({...settings, telegramChatId: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="bg-[#1a73e8]/5 border border-[#1a73e8]/20 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#1a73e8] font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              Security Note
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Pengaturan ini disimpan dengan enkripsi standar di database Cloud. Kami sangat menyarankan untuk menggunakan <b>App Password</b> jika Anda menggunakan Gmail/Outlook.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button 
          className="h-12 px-10 bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold gap-2 shadow-lg shadow-blue-500/20"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Semua Pengaturan
        </Button>
      </div>
    </div>
  );
}
