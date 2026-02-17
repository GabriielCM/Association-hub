'use client';

import {
  Users,
  Calendar,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

import { useAuthContext } from '@/lib/providers/auth-provider';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';
import { useAdminDashboardStats } from '@/lib/hooks/useAdminDashboard';
import { MembersChart } from './components/MembersChart';
import { PointsDistributionChart } from './components/PointsDistributionChart';
import { EventsActivityChart } from './components/EventsActivityChart';
import { RevenueChart } from './components/RevenueChart';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { data: stats, isLoading, error, refetch } = useAdminDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Bem-vindo, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Aqui esta um resumo da sua associacao
          </p>
        </div>
        {stats?.reports?.pending != null && stats.reports.pending > 0 && (
          <Link href="/dashboard/moderation">
            <Button variant="outline" size="sm">
              <AlertTriangle className="mr-1 h-4 w-4 text-warning-dark" />
              {stats.reports.pending} denuncias pendentes
            </Button>
          </Link>
        )}
      </div>

      {/* Error state */}
      {error && (
        <Card variant="elevated">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertTriangle className="h-8 w-8 text-error-dark" />
              <p className="text-sm text-muted-foreground">
                Erro ao carregar estatisticas
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Total de Membros"
              value={stats.members.total.toLocaleString('pt-BR')}
              change={`${stats.members.changePercent >= 0 ? '+' : ''}${stats.members.changePercent}%`}
              trend={stats.members.changePercent >= 0 ? 'up' : 'down'}
              icon={Users}
              subtitle={`${stats.members.newThisMonth} novos este mes`}
            />
            <StatCard
              title="Eventos Ativos"
              value={String(stats.events.active)}
              change={`${stats.events.changePercent >= 0 ? '+' : ''}${stats.events.changePercent}%`}
              trend={stats.events.changePercent >= 0 ? 'up' : 'down'}
              icon={Calendar}
            />
            <StatCard
              title="Vendas do Mes"
              value={formatCurrency(stats.sales.monthlyRevenue)}
              change={`${stats.sales.changePercent >= 0 ? '+' : ''}${stats.sales.changePercent}%`}
              trend={stats.sales.changePercent >= 0 ? 'up' : 'down'}
              icon={ShoppingBag}
            />
            <StatCard
              title="Pontos Distribuidos"
              value={formatPoints(stats.points.distributedThisMonth)}
              change={`${stats.points.changePercent >= 0 ? '+' : ''}${stats.points.changePercent}%`}
              trend={stats.points.changePercent >= 0 ? 'up' : 'down'}
              icon={TrendingUp}
            />
          </>
        ) : null}
      </div>

      {/* Charts Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <ChartSkeleton title="Membros por Mes" />
          <ChartSkeleton title="Pontos Distribuidos" />
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <MembersChart data={stats.charts.membersByMonth} />
            <PointsDistributionChart data={stats.charts.pointsByDay} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <EventsActivityChart data={stats.charts.eventAttendance} />
            <RevenueChart data={stats.charts.revenueByMonth} />
          </div>
        </>
      ) : null}

      {/* Bottom: Activity Summary + Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Resumo de Atividade</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : stats ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Posts este mes
                  </span>
                  <span className="font-semibold">
                    {stats.posts.thisMonth}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Denuncias pendentes
                  </span>
                  <span className="font-semibold text-warning-dark">
                    {stats.reports.pending}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Novos membros
                  </span>
                  <span className="font-semibold">
                    {stats.members.newThisMonth}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex h-[100px] items-center justify-center text-muted-foreground">
                Sem dados
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Acoes Rapidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/moderation">
                <Button variant="outline" size="sm" className="w-full">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  Moderacao
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="mr-1 h-4 w-4" />
                  Eventos
                </Button>
              </Link>
              <Link href="/members">
                <Button variant="outline" size="sm" className="w-full">
                  <Users className="mr-1 h-4 w-4" />
                  Membros
                </Button>
              </Link>
              <Link href="/points">
                <Button variant="outline" size="sm" className="w-full">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Pontos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  subtitle?: string;
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  subtitle,
}: StatCardProps) {
  return (
    <Card variant="elevated">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-sm">
          {trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4 text-success-dark" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-error-dark" />
          )}
          <span
            className={
              trend === 'up' ? 'text-success-dark' : 'text-error-dark'
            }
          >
            {change}
          </span>
          <span className="text-muted-foreground">vs mes anterior</span>
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card variant="elevated">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
        <div className="mt-4">
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}
