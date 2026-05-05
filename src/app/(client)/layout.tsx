"use client";

import { ClientSidebar } from "@/components/layout/client-sidebar";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { 
  Bell, 
  HelpCircle, 
  Search, 
  User,
  ChevronRight,
  Menu
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NewsBanner } from "@/components/news-banner";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a73e8]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(p => p);
    return paths.map((p, i) => (
      <div key={i} className="flex items-center gap-1">
        <ChevronRight className="w-4 h-4 text-gray-600" />
        <span className="capitalize">{p.replace(/-/g, ' ')}</span>
      </div>
    ));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#121212] text-gray-200">
      <ClientSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Firebase-style Top Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#121212]">
          <div className="flex items-center gap-4 text-sm font-medium">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="text-gray-400 hover:text-white cursor-pointer transition-colors">
              ClientZone
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              {getBreadcrumbs()}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-white relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ea4335] rounded-full border-2 border-[#121212]"></span>
            </Button>
            
            <div className="h-8 w-px bg-white/5 mx-1" />
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-none mb-1">{user.email?.split('@')[0] || "User"}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">Client</p>
              </div>
              <Avatar className="h-9 w-9 border border-white/10 ring-2 ring-[#1a73e8]/20">
                <AvatarFallback className="bg-[#1a73e8] text-white font-bold text-xs">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <NewsBanner />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
