"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  History, 
  LogOut, 
  Globe, 
  Cpu, 
  PlusCircle,
  ChevronDown,
  MessageSquare,
  ChevronRight,
  LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/../firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const menuItems = [
    { name: "Project Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Order Baru", href: "/catalog", icon: PlusCircle, highlight: true },
  ];

  const buildItems = [
    { name: "Semua Layanan", href: "/services", icon: Package },
    { name: "Riwayat Pesanan", href: "/orders", icon: History },
    { name: "Tiket Bantuan", href: "/tickets", icon: LifeBuoy },
  ];

  const productCategories = [
    { name: "Beli Domain", href: "/domains", icon: Globe },
    { name: "Hosting", href: "/services?cat=HOSTING", icon: Globe },
  ];

  const SidebarItem = ({ item, active }: { item: any, active: boolean }) => (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all relative",
        active 
          ? "text-[#1a73e8] bg-[#1a73e8]/10" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1a73e8]" />}
      <item.icon className={cn("w-5 h-5", active ? "text-[#1a73e8]" : "text-gray-400 group-hover:text-gray-200")} />
      <span className="flex-1">{item.name}</span>
      {active && <ChevronRight className="w-4 h-4" />}
    </Link>
  );

  return (
    <div className="flex flex-col h-full w-64 bg-[#1e1e1e] border-r border-white/10 select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-white font-bold italic shadow-lg shadow-amber-500/20">
          CZ
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white truncate">ClientZone</h2>
          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Blaze Plan
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>

      <div className="flex-1 overflow-y-auto pt-4 pb-2">
        {/* Main Menu */}
        <div className="space-y-1 mb-8">
          {menuItems.map((item) => (
            <SidebarItem key={item.href} item={item} active={pathname === item.href} />
          ))}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <p className="px-4 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest opacity-50">
            Build
          </p>
          <div className="space-y-0.5">
            {buildItems.map((item) => (
              <SidebarItem key={item.href} item={item} active={pathname === item.href || pathname.startsWith(item.href + "/")} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="px-4 mb-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest opacity-50">
            Products
          </p>
          <div className="space-y-0.5">
            {productCategories.map((item) => (
              <SidebarItem key={item.href} item={item} active={pathname === item.href} />
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-auto border-t border-white/10 p-3">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
