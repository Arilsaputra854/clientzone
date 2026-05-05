"use client";

import { ClientSidebar } from "@/components/layout/client-sidebar";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ClientSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-8 bg-background">
          <div className="text-sm text-muted-foreground font-medium">
            Selamat datang, <span className="text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Topbar actions like notifications, profile can go here */}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/20 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
