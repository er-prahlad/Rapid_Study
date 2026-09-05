"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";

import {
  LayoutDashboard,
  BookOpen,
  FileText,
  PenTool,
  Bookmark,
  Trophy,
  CalendarCheck,
  Bell,
  User,
  LogOut,
  ChevronRight,
  GraduationCap,
  Shield,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { getInitials } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const studentNav = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Exams",
    href: "/exams",
    icon: GraduationCap,
  },
  {
    label: "Mock Tests",
    href: "/tests",
    icon: FileText,
  },
  {
    label: "Practice",
    href: "/practice",
    icon: PenTool,
  },
  {
    label: "Performance",
    href: "/analysis/performance",
    icon: TrendingUp,
  },
  {
    label: "Bookmarks",
    href: "/bookmarks",
    icon: Bookmark,
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
  {
    label: "Study Plan",
    href: "/study-plan",
    icon: CalendarCheck,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
];


const adminNav = [
  {
    label: "Admin Panel",
    href: "/admin",
    icon: Shield,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: User,
  },
  {
    label: "Exams",
    href: "/admin/exams",
    icon: GraduationCap,
  },
  {
    label: "Questions",
    href: "/admin/questions",
    icon: BookOpen,
  },
  {
    label: "Tests",
    href: "/admin/tests",
    icon: FileText,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: Trophy,
  },
];


/**
 * Prefetch all navigation routes in the background
 * after 2 seconds so navigation is faster.
 */
function usePrefetchRoutes(hrefs: string[]) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      hrefs.forEach((href) => {
        router.prefetch(href);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [hrefs, router]);
}


/**
 * Individual navigation item
 */
const NavItem = memo(function NavItem({
  href,
  icon: Icon,
  label,
  onClose,
}: {
  href: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const active =
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      prefetch={true}
      onClick={() => {
        onClose?.();
      }}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon
        className="shrink-0"
        style={{
          width: 18,
          height: 18,
        }}
      />

      <span>{label}</span>

      {active && (
        <ChevronRight className="ml-auto h-3.5 w-3.5" />
      )}
    </Link>
  );
});


export function Sidebar({
  onClose,
}: {
  onClose?: () => void;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Logout confirmation dialog state
  const [logoutDialogOpen, setLogoutDialogOpen] =
    useState(false);

  const navItems =
    user?.role === "ADMIN"
      ? adminNav
      : studentNav;


  // Prefetch all navigation routes
  usePrefetchRoutes(
    navItems.map((item) => item.href)
  );


  /**
   * Actual logout function.
   * This will only run after user confirms.
   */
  const handleLogout = async () => {
    try {
      await logout();

      toast({
        title: "Logged out",
      });

      setLogoutDialogOpen(false);

      router.push("/login");

      onClose?.();
    } catch (error) {
      console.error("Logout failed:", error);

      toast({
        title: "Logout failed",
        description:
          "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <>
      <aside className="flex flex-col h-full bg-background border-r">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              R
            </span>
          </div>

          <span className="font-bold text-lg text-foreground">
            RapidStudy
          </span>
        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              onClose={onClose}
            />
          ))}
        </nav>


        <Separator />


        {/* Profile + Logout */}
        <div className="p-3 space-y-1">

          {/* Profile */}
          <Link
            href="/profile"
            prefetch={true}
            onClick={() => onClose?.()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage
                src={user?.profileImage}
              />

              <AvatarFallback className="text-xs">
                {getInitials(
                  user?.name || "U"
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name}
              </p>

              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </Link>


          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() =>
              setLogoutDialogOpen(true)
            }
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />

            <span>
              Sign out
            </span>
          </button>

        </div>

      </aside>


      {/* Logout Confirmation Dialog */}
      <AlertDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      >
        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle>
              Are you sure you want to sign out?
            </AlertDialogTitle>

            <AlertDialogDescription>
              You will be logged out of your RapidStudy
              account and redirected to the login page.
            </AlertDialogDescription>

          </AlertDialogHeader>


          <AlertDialogFooter>

            {/* Cancel */}
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>


            {/* Confirm Logout */}
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sign out
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}