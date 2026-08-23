"use client";
import { Bell, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

const pageTitles: Record<string, string> = {
  "/dashboard":      "Dashboard",
  "/exams":          "Exams",
  "/tests":          "Mock Tests",
  "/practice":       "Practice",
  "/bookmarks":      "Bookmarks",
  "/leaderboard":    "Leaderboard",
  "/study-plan":     "Study Plan",
  "/notifications":  "Notifications",
  "/profile":        "Profile",
  "/admin":          "Admin Panel",
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const pathname  = usePathname();
  const router    = useRouter();

  const title = Object.entries(pageTitles).find(([p]) => pathname.startsWith(p))?.[1] ?? "RapidStudy";

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out" });
    router.push("/login");
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 bg-background/95 backdrop-blur border-b z-40 flex items-center px-4 gap-4">
      {/* Mobile menu */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title */}
      <h1 className="font-semibold text-lg flex-1">{title}</h1>

      {/* Search */}
      <Button variant="ghost" size="icon" asChild>
        <Link href="/search">
          <Search className="h-5 w-5" />
        </Link>
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" asChild className="relative">
        <Link href="/notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
        </Link>
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.profileImage} />
              <AvatarFallback className="text-xs">{getInitials(user?.name || "U")}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">My Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/study-plan">Study Plan</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
