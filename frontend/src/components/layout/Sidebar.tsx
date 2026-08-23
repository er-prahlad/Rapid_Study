"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, FileText, PenTool, Bookmark,
  Trophy, CalendarCheck, Bell, User, Settings, LogOut,
  ChevronRight, GraduationCap, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

const studentNav = [
  { label: "Dashboard",     href: "/dashboard",    icon: LayoutDashboard },
  { label: "Exams",         href: "/exams",         icon: GraduationCap },
  { label: "Mock Tests",    href: "/tests",         icon: FileText },
  { label: "Practice",      href: "/practice",      icon: PenTool },
  { label: "Bookmarks",     href: "/bookmarks",     icon: Bookmark },
  { label: "Leaderboard",   href: "/leaderboard",   icon: Trophy },
  { label: "Study Plan",    href: "/study-plan",    icon: CalendarCheck },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

const adminNav = [
  { label: "Admin Panel",   href: "/admin",               icon: Shield },
  { label: "Users",         href: "/admin/users",          icon: User },
  { label: "Exams",         href: "/admin/exams",          icon: GraduationCap },
  { label: "Questions",     href: "/admin/questions",      icon: BookOpen },
  { label: "Tests",         href: "/admin/tests",          icon: FileText },
  { label: "Analytics",     href: "/admin/analytics",      icon: Trophy },
];

function NavItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} />
      <span>{label}</span>
      {active && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
    </Link>
  );
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out", description: "See you soon!" });
    router.push("/login");
    onClose?.();
  };

  const navItems = user?.role === "ADMIN" ? adminNav : studentNav;

  return (
    <aside className="flex flex-col h-full bg-background border-r">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b shrink-0">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="font-bold text-lg text-foreground">RapidStudy</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      <Separator />

      {/* Profile + Logout */}
      <div className="p-3 space-y-1">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback className="text-xs">{getInitials(user?.name || "U")}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
