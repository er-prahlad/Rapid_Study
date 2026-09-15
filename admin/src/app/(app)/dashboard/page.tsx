'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { StatCard, Card, Skeleton, Badge } from '@/components/ui';
import { formatNumber, formatDate } from '@/lib/utils';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

const EXAM_COLORS = ['#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3b0764', '#2e1065'];

function UsersIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function AttemptIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>; }
function QuestionIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function TodayIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; }

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await dashboardApi.get();
      return res.data.data;
    },
  });

  // Placeholder data if API doesn't return charts yet
  const userGrowth = data?.userGrowth?.length
    ? data.userGrowth
    : [
      { label: 'Jan', value: 120 }, { label: 'Feb', value: 190 },
      { label: 'Mar', value: 280 }, { label: 'Apr', value: 350 },
      { label: 'May', value: 410 }, { label: 'Jun', value: 520 },
      { label: 'Jul', value: 680 },
    ];

  const attemptTrend = data?.attemptTrend?.length
    ? data.attemptTrend
    : [
      { label: 'Mon', value: 45 }, { label: 'Tue', value: 62 },
      { label: 'Wed', value: 38 }, { label: 'Thu', value: 71 },
      { label: 'Fri', value: 89 }, { label: 'Sat', value: 120 },
      { label: 'Sun', value: 55 },
    ];

  const popularExams = data?.popularExams?.length
    ? data.popularExams
    : [
      { examName: 'SSC CGL', attemptCount: 1240 },
      { examName: 'UPSC', attemptCount: 980 },
      { examName: 'Banking', attemptCount: 760 },
      { examName: 'BPSC', attemptCount: 540 },
      { examName: 'Railway', attemptCount: 420 },
      { examName: 'SSC CHSL', attemptCount: 310 },
    ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-lg">
        <h2 className="text-xl font-bold">Welcome back, Admin! 👋</h2>
        <p className="text-violet-200 text-sm mt-1">
          Here&apos;s what&apos;s happening on RapidStudy today.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">
            {formatNumber(data?.attemptsToday ?? 0)} attempts today
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full">
            {formatNumber(data?.recentRegistrations ?? 0)} new users this week
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={formatNumber(data?.totalUsers ?? 0)}
          change={`${data?.activeUsers ?? 0} active`}
          changeType="positive"
          icon={<UsersIcon />}
          iconBg="bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
        />
        <StatCard
          title="Total Questions"
          value={formatNumber(data?.totalQuestions ?? 0)}
          change={`${data?.totalExams ?? 0} exams`}
          changeType="neutral"
          icon={<QuestionIcon />}
          iconBg="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
        <StatCard
          title="Total Attempts"
          value={formatNumber(data?.totalAttempts ?? 0)}
          change={`${data?.totalTests ?? 0} tests available`}
          changeType="positive"
          icon={<AttemptIcon />}
          iconBg="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
        />
        <StatCard
          title="Today's Attempts"
          value={formatNumber(data?.attemptsToday ?? 0)}
          change="Live activity"
          changeType="positive"
          icon={<TodayIcon />}
          iconBg="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card title="User Growth" description="Monthly registrations">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={userGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#7c3aed' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Attempt Trend */}
        <Card title="Attempt Trend" description="Daily test attempts this week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attemptTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {attemptTrend.map((_, i) => (
                  <Cell key={i} fill={i === attemptTrend.length - 1 ? '#7c3aed' : '#a78bfa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Exams */}
        <Card title="Popular Exams" description="By number of attempts">
          <div className="space-y-3 mt-1">
            {popularExams.map((exam, i) => {
              const max = popularExams[0]?.attemptCount ?? 1;
              const pct = Math.round((exam.attemptCount / max) * 100);
              return (
                <div key={exam.examName} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground truncate">{exam.examName}</span>
                      <span className="text-muted-foreground shrink-0">{formatNumber(exam.attemptCount)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Links */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/users', label: 'Manage Users', emoji: '👥', color: 'border-violet-200 hover:bg-violet-50 dark:border-violet-800 dark:hover:bg-violet-950' },
              { href: '/exams', label: 'Manage Exams', emoji: '📚', color: 'border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950' },
              { href: '/questions', label: 'Add Questions', emoji: '❓', color: 'border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950' },
              { href: '/tests', label: 'Create Test', emoji: '📝', color: 'border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950' },
              { href: '/ai-drafts', label: 'Review AI Drafts', emoji: '🤖', color: 'border-pink-200 hover:bg-pink-50 dark:border-pink-800 dark:hover:bg-pink-950' },
              { href: 'http://localhost:8080/swagger-ui.html', label: 'API Docs', emoji: '🔗', color: 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800', external: true },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className={`flex flex-col gap-2 p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer ${item.color}`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
