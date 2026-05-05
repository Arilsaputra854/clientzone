"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, User, Phone, Building, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    company: ""
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("OTP telah dikirim ke email Anda");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await fetch("/api/auth/otp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error);

      // 2. Create User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        role: "CLIENT",
        createdAt: serverTimestamp(),
      });

      toast.success("Registrasi berhasil!");
      
      // Notify Admin via Telegram (Fire and forget)
      fetch("/api/admin/notify-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "NEW_USER",
          data: { name: formData.name, email: formData.email }
        }),
      }).catch(console.error);

      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-[#1e1e1e] border-white/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
      <CardHeader className="border-b border-white/5 pb-8">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
          {step === 1 ? <User className="w-6 h-6 text-[#1a73e8]" /> : <ShieldCheck className="w-6 h-6 text-[#34a853]" />}
          {step === 1 ? "Daftar Akun" : "Verifikasi Email"}
        </CardTitle>
        <CardDescription className="text-gray-500">
          {step === 1 
            ? "Lengkapi data diri Anda untuk bergabung dengan ClientZone." 
            : `Masukkan 6 digit kode yang kami kirimkan ke ${formData.email}`}
        </CardDescription>
      </CardHeader>

      {step === 1 ? (
        <form onSubmit={handleSendOTP}>
          <CardContent className="space-y-5 pt-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">Nama Lengkap</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
                  <Input
                    placeholder="John Doe"
                    className="pl-10 bg-white/5 border-white/10 text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
                  <Input
                    placeholder="0812..."
                    className="pl-10 bg-white/5 border-white/10 text-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
                <Input
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-white/5 border-white/10 text-white"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 py-8 border-t border-white/5">
            <Button type="submit" className="w-full h-12 bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold gap-2" disabled={loading}>
              {loading ? "Memproses..." : "Lanjut Verifikasi"}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-sm text-center text-gray-500">
              Sudah punya akun? <a href="/login" className="text-[#1a73e8] font-bold hover:underline">Login</a>
            </p>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndRegister}>
          <CardContent className="space-y-6 pt-10 text-center">
            <div className="flex justify-center gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-10 h-14 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-2xl font-bold text-[#34a853]">
                  {otp[i] || ""}
                </div>
              ))}
            </div>
            <Input 
              type="text" 
              maxLength={6} 
              className="absolute opacity-0" 
              autoFocus
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Masukkan 6 digit kode verifikasi</p>
              <Button 
                variant="ghost" 
                type="button" 
                className="text-[#1a73e8] text-xs gap-2"
                onClick={handleSendOTP}
                disabled={loading}
              >
                <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                Kirim ulang kode
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 py-8 border-t border-white/5">
            <Button type="submit" className="w-full h-12 bg-[#34a853] hover:bg-[#34a853]/90 text-white font-bold" disabled={loading || otp.length < 6}>
              {loading ? "Memverifikasi..." : "Verifikasi & Buat Akun"}
            </Button>
            <Button variant="ghost" className="text-gray-500" onClick={() => setStep(1)}>
              Kembali
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
