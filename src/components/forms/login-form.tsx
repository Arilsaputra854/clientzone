"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "@/../firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      toast.success("Login berhasil!");
      
      if (userData?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal login. Periksa email dan password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Create basic profile if new
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: "CLIENT",
          createdAt: serverTimestamp(),
        });
      }

      const userData = userDoc.data();
      
      // Safety: Prevent Admin from logging in via Google if not allowed
      if (userData?.role === "ADMIN") {
         toast.error("Admin tidak diperbolehkan login menggunakan Google SSO.");
         await auth.signOut();
         return;
      }

      toast.success("Login Google berhasil!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Gagal login dengan Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-[#1e1e1e] border-white/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
      <CardHeader className="border-b border-white/5 pb-8">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
          <Lock className="w-6 h-6 text-[#1a73e8]" />
          Login ClientZone
        </CardTitle>
        <CardDescription className="text-gray-500">
          Akses dashboard dan kelola layanan Anda.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-6 pt-8">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-500 uppercase">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
              <Input
                type="email"
                placeholder="name@company.com"
                className="pl-10 h-12 bg-white/5 border-white/10 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-gray-500 uppercase">Password</Label>
              <a href="#" className="text-[10px] text-[#1a73e8] hover:underline">Lupa Password?</a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#1a73e8]" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-10 h-12 bg-white/5 border-white/10 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 bg-[#1a73e8] hover:bg-[#1a73e8]/90 text-white font-bold gap-2" disabled={loading}>
            {loading ? "Memproses..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#1e1e1e] px-2 text-gray-600 font-bold">Atau lanjut dengan</span>
            </div>
          </div>

          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 gap-3"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 py-8 border-t border-white/5">
          <p className="text-sm text-center text-gray-500">
            Belum punya akun? <a href="/register" className="text-[#1a73e8] font-bold hover:underline">Daftar sekarang</a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
