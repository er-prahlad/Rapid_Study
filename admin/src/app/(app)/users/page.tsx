'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/services/api';
import { Button, Skeleton, Pagination, EmptyState, Modal, Alert, Select, Toggle } from '@/components/ui';
import { formatDate, formatDateTime, getInitials, debounce } from '@/lib/utils';
import type { AdminUser, UserRole } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

type RoleFilter = '' | UserRole;

const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'Student / Candidate' },
  { value: 'CONTENT_CREATOR', label: 'Content Creator (Drafts & Uploads)' },
  { value: 'REVIEWER', label: 'Reviewer (Verifies & Approves)' },
  { value: 'ADMIN', label: 'Admin (System Management)' },
  { value: 'SUPER_ADMIN', label: 'Super Admin (Full System Control)' },
];

function RoleBadgeView({ role }: { role: string }) {
  switch (role) {
    case 'SUPER_ADMIN':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
          Super Admin
        </span>
      );
    case 'ADMIN':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
          Admin
        </span>
      );
    case 'REVIEWER':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          Reviewer
        </span>
      );
    case 'CONTENT_CREATOR':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          Content Creator
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          Student
        </span>
      );
  }
}

export default function UsersPage() {
  const qc = useQueryClient();
  const { isSuperAdmin } = useAuth();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRole] = useState<RoleFilter>('');
  const [activeFilter, setActive] = useState<'' | 'true' | 'false'>('');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((v: unknown) => {
      setSearch(String(v));
      setPage(0);
    }, 400),
    []
  );

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
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update user role.';
      setAlert({ type: 'error', msg });
    },
  });

  const [newRole, setNewRole] = useState('STUDENT');

  return (
    <div className="space-y-5 animate-in">
      {alert && (
        <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />
      )}

      {/* Role explanation header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Staff & Sub-Admins Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assign granular roles: <strong>Content Creator</strong> (types/uploads questions), <strong>Reviewer</strong> (verifies/approves questions), or <strong>Admin / Super Admin</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">Content Creator</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">Reviewer</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">Admin</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">Super Admin</span>
        </div>
      </div>

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
            { value: '', label: 'All Roles' },
            { value: 'CONTENT_CREATOR', label: 'Content Creator' },
            { value: 'REVIEWER', label: 'Reviewer' },
            { value: 'ADMIN', label: 'Admin' },
            { value: 'SUPER_ADMIN', label: 'Super Admin' },
            { value: 'STUDENT', label: 'Student' },
          ]}
          placeholder="All Roles"
          value={roleFilter}
          onChange={e => { setRole(e.target.value as RoleFilter); setPage(0); }}
          className="w-44"
        />
        <Select
          id="users-status-filter"
          options={[
            { value: 'true', label: 'Active' },
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
                      <RoleBadgeView role={user.role} />
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
        title="Change Staff / User Role"
        description={`Configure role for ${selected?.name} (${selected?.email})`}
        size="md"
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
        <div className="space-y-4">
          <Select
            label="Select Role"
            id="change-role-select"
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            options={
              isSuperAdmin
                ? ROLE_OPTIONS
                : ROLE_OPTIONS.filter(r => r.value !== 'SUPER_ADMIN')
            }
          />

          <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5 border border-border">
            <p className="font-semibold text-foreground">Role Permissions Overview:</p>
            {newRole === 'CONTENT_CREATOR' && (
              <p className="text-muted-foreground">
                ✍️ <strong>CONTENT_CREATOR</strong>: Can type questions, import CSV/Excel questions, and generate AI drafts. Cannot publish or activate questions live.
              </p>
            )}
            {newRole === 'REVIEWER' && (
              <p className="text-muted-foreground">
                🔍 <strong>REVIEWER</strong>: Can review, verify, approve, and activate questions. Can also review mock tests.
              </p>
            )}
            {newRole === 'ADMIN' && (
              <p className="text-muted-foreground">
                🛠️ <strong>ADMIN</strong>: System manager with access to dashboard, analytics, exams, subjects, questions, mock tests, and users.
              </p>
            )}
            {newRole === 'SUPER_ADMIN' && (
              <p className="text-muted-foreground">
                👑 <strong>SUPER_ADMIN</strong>: Full system control including managing other Super Admins and critical system configurations.
              </p>
            )}
            {newRole === 'STUDENT' && (
              <p className="text-muted-foreground">
                🎓 <strong>STUDENT</strong>: Standard platform user. Access to student frontend only.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
