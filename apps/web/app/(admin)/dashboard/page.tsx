'use client';

import {
  Users,
  Calendar,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

import { useAuthContext } from '@/lib/providers/auth-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { formatPoints, formatCurrency } from '@ahub/shared/utils';

export default function DashboardPage() {
  const { user } = useAuthContext();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Bem-vindo, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua associação
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Membros"
          value="1,234"
          change="+12%"
          trend="up"
          icon={Users}
        />
        <StatCard
          title="Eventos Ativos"
          value="8"
          change="+2"
          trend="up"
          icon={Calendar}
        />
        <StatCard
          title="Vendas do Mês"
          value={formatCurrency(15420)}
          change="-5%"
          trend="down"
          icon={ShoppingBag}
        />
        <StatCard
          title="Pontos Distribuídos"
          value={formatPoints(45600)}
          change="+18%"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Charts section placeholder */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Membros por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Gráfico será implementado na Fase 8
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Lista de eventos será implementada na Fase 3
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            Nenhuma atividade recente
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({ title, value, change, trend, icon: Icon }: StatCardProps) {
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
            className={trend === 'up' ? 'text-success-dark' : 'text-error-dark'}
          >
            {change}
          </span>
          <span className="text-muted-foreground">vs mês anterior</span>
        </div>
      </CardContent>
    </Card>
  );
}
