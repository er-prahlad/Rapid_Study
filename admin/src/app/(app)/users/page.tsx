'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import { Button, Badge, Skeleton, Pagination, EmptyState, Modal, Alert, Select, Toggle } from '@/components/ui';
import { formatDate, formatDateTime, getInitials, debounce } from '@/lib/utils';
import type { AdminUser } from '@/types/api';

type RoleFilter = '' | 'STUDENT' | 'ADMIN';

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage]           = useState(0);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState<RoleFilter>('');
  const [activeFilter, setActive] = useState<'' | 'true' | 'false'>('');
  const [selected, setSelected]   = useState<AdminUser | null>(null);
  const [alert, setAlert]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(debounce((v: string) => {
    setSearch(v);
    setPage(0);
  }, 400), []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, activeFilter],
    queryFn: async () => {
      const res = await usersApi.list({
        search: search || undefined,
        role: roleFilter || undefined,
        isActive: activeFilter === '' ? undefined : activeFilter === 'true',
        page,
        size: 20,
      });
      return res.data.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      usersApi.setStatus(id, isActive),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setAlert({ type: 'success', msg: `User ${res.data.data.isActive ? 'activated' : 'deactivated'} successfully.` });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to update user status.' }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      usersApi.setRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setSelected(null);
      setAlert({ type: 'success', msg: 'User role updated successfully.' });
    },
    onError: () => setAlert({ type: 'error', msg: 'Failed to update user role.' }),
  });

  const [newRole, setNewRole] = useState('STUDENT');

  return (
    <div className="space-y-5 animate-in">
      {alert && (
        <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            id="users-search"
            placeholder="Search by name or email…"
            onChange={e => debouncedSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Select
          id="users-role-filter"
          options={[
            { value: 'STUDENT', label: 'Student' },
            { value: 'ADMIN',   label: 'Admin' },
          ]}
          placeholder="All Roles"
          value={roleFilter}
          onChange={e => { setRole(e.target.value as RoleFilter); setPage(0); }}
          className="w-36"
        />
        <Select
          id="users-status-filter"
          options={[
            { value: 'true',  label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]}
          placeholder="All Status"
          value={activeFilter}
          onChange={e => { setActive(e.target.value as '' | 'true' | 'false'); setPage(0); }}
          className="w-36"
        />
        <span className="text-sm text-muted-foreground ml-auto">
          {data ? `${data.totalElements} users` : ''}
        </span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th>Attempts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}><Skeleton className="h-8 w-full" /></td>
                  </tr>
                ))
              ) : data?.content.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="No users found"
                      description="Try adjusting your search or filters."
                    />
                  </td>
                </tr>
              ) : (
                data?.content.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate max-w-[160px]">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={user.role === 'ADMIN' ? 'purple' : 'info'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <Toggle
                        checked={user.isActive}
                        onChange={(v) => statusMutation.mutate({ id: user.id, isActive: v })}
                        disabled={statusMutation.isPending}
                      />
                    </td>
                    <td className="text-muted-foreground">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}</td>
                    <td className="text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="font-medium">{user.totalAttempts ?? 0}</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSelected(user); setNewRole(user.role); }}
                      >
                        Edit Role
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && data.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            size={20}
            onChange={setPage}
          />
        )}
      </div>

      {/* Role Change Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Change User Role"
        description={selected?.email}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              loading={roleMutation.isPending}
              onClick={() => roleMutation.mutate({ id: selected!.id, role: newRole })}
            >
              Save Role
            </Button>
          </>
        }
      >
        <Select
          label="Select Role"
          id="change-role-select"
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
          options={[
            { value: 'STUDENT', label: 'Student' },
            { value: 'ADMIN',   label: 'Admin' },
          ]}
        />
      </Modal>
    </div>
  );
}
