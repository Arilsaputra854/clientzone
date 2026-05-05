"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Receipt, 
  Settings, 
  LogOut, 
  Server, 
  Newspaper, 
  LifeBuoy,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { auth } from "@/../firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Produk", href: "/admin/products", icon: Package },
  { name: "Klien", href: "/admin/clients", icon: Users },
  { name: "Invoices", href: "/admin/invoices", icon: Receipt },
  { name: "Keuangan", href: "/admin/finance", icon: Wallet },
  { name: "Provisioning", href: "/admin/provisioning", icon: Server },
  { name: "Tiket Bantuan", href: "/admin/tickets", icon: LifeBuoy },
  { name: "News & Updates", href: "/admin/news", icon: Newspaper },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-full w-64 bg-[#121212] border-r border-white/5 select-none">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1a73e8] rounded flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            A
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Admin Console</h2>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                isActive
                  ? "bg-[#1a73e8] text-white shadow-lg shadow-blue-500/10"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-500 hover:text-red-500 hover:bg-red-500/5 transition-colors"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
