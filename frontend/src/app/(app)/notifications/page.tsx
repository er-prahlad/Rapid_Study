"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi, NotificationDto } from "@/services/notificationApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const TYPE_COLORS: Record<string, string> = {
  SYSTEM:        "bg-gray-100 text-gray-700",
  TEST_REMINDER: "bg-blue-100 text-blue-700",
  STUDY_PLAN:    "bg-green-100 text-green-700",
  ACHIEVEMENT:   "bg-yellow-100 text-yellow-700",
  LEADERBOARD:   "bg-purple-100 text-purple-700",
};

function NotifCard({ n, onRead }: { n: NotificationDto; onRead: (id: number) => void }) {
  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer",
      !n.isRead && "bg-primary/3"
    )} onClick={() => !n.isRead && onRead(n.id)}>
      <div className="shrink-0 mt-0.5">
        {n.isRead
          ? <Bell className="h-4 w-4 text-muted-foreground" />
          : <Circle className="h-3 w-3 fill-primary text-primary mt-0.5" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className={cn("text-sm font-medium", !n.isRead && "font-semibold")}>{n.title}</p>
          <Badge className={cn("text-xs border-0", TYPE_COLORS[n.type] ?? "bg-gray-100 text-gray-700")}>
            {n.type.replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [page, setPage] = useState(0);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationApi.getAll({ page, size: 20 }),
    staleTime: 1000 * 30,
  });

  const { data: countData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: notificationApi.unreadCount,
    staleTime: 1000 * 30,
  });

  const markRead = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unread-count"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  const notifications = data?.data?.content ?? [];
  const totalPages    = data?.data?.totalPages ?? 0;
  const unread        = countData?.data ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />Notifications
          </h1>
          {unread > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">{unread} unread</p>
          )}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}
            loading={markAllRead.isPending}>
            <CheckCheck className="h-4 w-4 mr-1" />Mark all read
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map(n => (
              <NotifCard key={n.id} n={n} onRead={id => markRead.mutate(id)} />
            ))}
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
