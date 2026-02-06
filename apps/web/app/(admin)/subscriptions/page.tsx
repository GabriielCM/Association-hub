'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Users, Crown, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui';
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useSubscriptionReport,
} from '@/lib/hooks/useAdminSubscriptions';
import { formatCurrency } from '@ahub/shared/utils';
import { PlanFormDialog, type PlanFormData } from '@/components/admin/subscriptions/PlanFormDialog';
import type { SubscriptionPlan } from '@ahub/shared/types';

export default function SubscriptionsManagementPage() {
  const { data: plansData, isLoading } = useAdminPlans();
  const { data: report } = useSubscriptionReport();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const plans = plansData?.plans ?? [];
  const stats = plansData?.stats;
  const activePlans = plans.filter((p) => p.isActive);

  const handleCreate = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleSubmit = (data: PlanFormData) => {
    if (editingPlan) {
      updatePlan.mutate(
        { planId: editingPlan.id, data },
        { onSuccess: () => setShowForm(false) }
      );
    } else {
      createPlan.mutate(data, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  const handleDelete = (planId: string, name: string) => {
    if (window.confirm(`Desativar o plano "${name}"? Assinantes atuais manterao os beneficios.`)) {
      deletePlan.mutate(planId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assinaturas</h1>
          <p className="text-muted-foreground">Gerencie planos e assinantes</p>
        </div>
        <div className="flex gap-2">
          <Link href="/subscriptions/subscribers">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Assinantes
            </Button>
          </Link>
          <Button
            onClick={handleCreate}
            disabled={activePlans.length >= 3}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </div>
      </div>

      {activePlans.length >= 3 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          Limite de 3 planos ativos atingido. Desative um plano para criar outro.
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Planos"
            value={stats.totalPlans.toString()}
            sublabel={`${stats.activePlans} ativos`}
            icon={<Crown className="h-5 w-5 text-primary" />}
          />
          <StatCard
            label="Total Assinantes"
            value={stats.totalSubscribers.toString()}
            icon={<Users className="h-5 w-5 text-blue-500" />}
          />
          <StatCard
            label="Receita Mensal"
            value={formatCurrency(stats.monthlyRevenue)}
            icon={<DollarSign className="h-5 w-5 text-green-500" />}
          />
          {report && (
            <StatCard
              label="Taxa de Churn"
              value={`${report.summary.churnRate.toFixed(1)}%`}
              icon={<Users className="h-5 w-5 text-red-500" />}
            />
          )}
        </div>
      )}

      {/* Plans List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-muted-foreground">Nenhum plano criado ainda.</p>
          <Button className="mt-4" onClick={handleCreate}>
            Criar primeiro plano
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border bg-surface p-6 ${
                plan.isActive ? 'border-border' : 'border-border/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {plan.color && (
                    <div
                      className="h-10 w-2 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      {!plan.isActive && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(plan.priceMonthly)}/mes
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    {plan.subscribersCount} assinantes
                  </span>
                </div>
              </div>

              {/* Mutators */}
              <div className="mt-3 flex flex-wrap gap-2">
                {plan.mutators.points_events && plan.mutators.points_events !== 1 && (
                  <MutatorBadge label={`${plan.mutators.points_events}x eventos`} />
                )}
                {plan.mutators.points_strava && plan.mutators.points_strava !== 1 && (
                  <MutatorBadge label={`${plan.mutators.points_strava}x strava`} />
                )}
                {plan.mutators.points_posts && plan.mutators.points_posts !== 1 && (
                  <MutatorBadge label={`${plan.mutators.points_posts}x posts`} />
                )}
                {plan.mutators.discount_store && plan.mutators.discount_store > 0 && (
                  <MutatorBadge label={`${plan.mutators.discount_store}% loja`} />
                )}
                {plan.mutators.discount_pdv && plan.mutators.discount_pdv > 0 && (
                  <MutatorBadge label={`${plan.mutators.discount_pdv}% PDV`} />
                )}
                {plan.mutators.discount_spaces && plan.mutators.discount_spaces > 0 && (
                  <MutatorBadge label={`${plan.mutators.discount_spaces}% espacos`} />
                )}
                {plan.mutators.cashback && plan.mutators.cashback > 0 && (
                  <MutatorBadge label={`${plan.mutators.cashback}% cashback`} />
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                  <Edit2 className="mr-1 h-3 w-3" />
                  Editar
                </Button>
                {plan.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan.id, plan.name)}
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Desativar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Form Dialog */}
      <PlanFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        plan={editingPlan}
        onSubmit={handleSubmit}
        isPending={createPlan.isPending || updatePlan.isPending}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  icon,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}

function MutatorBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
      {label}
    </span>
  );
}
