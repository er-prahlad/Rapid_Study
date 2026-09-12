"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, AdminUser } from "@/services/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, PowerOff, Power, Shield, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { getInitials, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>();
  const [page, setPage] = useState(0);
  const debSearch = useDebounce(search, 350);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", debSearch, roleFilter, activeFilter, page],
    queryFn: () => adminApi.getUsers({
      search: debSearch || undefined,
      role: roleFilter || undefined,
      isActive: activeFilter,
      page, size: 20,
    }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => adminApi.setStatus(id, active),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "Status updated" }); },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message, variant: "destructive" }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) => adminApi.setRole(id, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "Role updated" }); },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message, variant: "destructive" }),
  });

  const users = data?.data?.content ?? [];
  const total = data?.data?.totalElements ?? 0;
  const totalPages = data?.data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{total} users total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name or email…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
        </div>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(0); }}>
          <option value="">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={activeFilter === undefined ? "" : String(activeFilter)}
          onChange={e => { setActiveFilter(e.target.value === "" ? undefined : e.target.value === "true"); setPage(0); }}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">No users found</div>
          ) : (
            <div className="divide-y">
              {users.map((u: AdminUser) => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={u.profileImage} />
                    <AvatarFallback className="text-xs">{getInitials(u.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{u.name}</span>
                      <Badge variant={u.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                        {u.role === "ADMIN" ? <Shield className="h-3 w-3 mr-1 inline" /> : <User className="h-3 w-3 mr-1 inline" />}
                        {u.role}
                      </Badge>
                      <Badge variant={u.isActive ? "success" : "destructive"} className="text-xs">
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email} · {u.testsCompleted} tests · {formatDate(u.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2"
                      onClick={() => roleMutation.mutate({ id: u.id, role: u.role === "ADMIN" ? "STUDENT" : "ADMIN" })}>
                      {u.role === "ADMIN" ? "→ Student" : "→ Admin"}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => statusMutation.mutate({ id: u.id, active: !u.isActive })}>
                      {u.isActive
                        ? <PowerOff className="h-4 w-4 text-destructive" />
                        : <Power className="h-4 w-4 text-green-600" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
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
