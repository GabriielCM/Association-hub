'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Building2, CheckCircle, Sparkles, Tag, Search } from 'lucide-react';

import { Button } from '@/components/ui';
import {
  useAdminPartners,
  useAdminPartnerDetail,
  useAdminCategories,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
} from '@/lib/hooks/useAdminPartners';
import { PartnerFormDialog, type PartnerFormData } from '@/components/admin/partners/PartnerFormDialog';
import type { AdminPartnerItem } from '@/lib/api/partners.api';

export default function PartnersManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  const { data: partnersData, isLoading } = useAdminPartners({
    page,
    perPage: 20,
    ...(search ? { search } : {}),
  });
  const { data: categoriesData } = useAdminCategories();
  const { data: editingPartner } = useAdminPartnerDetail(editingPartnerId);

  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();
  const deletePartner = useDeletePartner();

  const partners = partnersData?.partners ?? [];
  const stats = partnersData?.stats;
  const pagination = partnersData?.pagination;
  const categories = categoriesData?.categories ?? [];

  const handleCreate = () => {
    setEditingPartnerId(null);
    setShowForm(true);
  };

  const handleEdit = (partner: AdminPartnerItem) => {
    setEditingPartnerId(partner.id);
    setShowForm(true);
  };

  const handleSubmit = (data: PartnerFormData) => {
    if (editingPartnerId) {
      updatePartner.mutate(
        { partnerId: editingPartnerId, data },
        { onSuccess: () => { setShowForm(false); setEditingPartnerId(null); } }
      );
    } else {
      createPartner.mutate(data, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  const handleDelete = (partnerId: string, name: string) => {
    if (window.confirm(`Desativar o parceiro "${name}"? Ele nao aparecera mais para os usuarios.`)) {
      deletePartner.mutate(partnerId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Parceiros</h1>
          <p className="text-muted-foreground">Gerencie parceiros e beneficios</p>
        </div>
        <div className="flex gap-2">
          <Link href="/partners/categories">
            <Button variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Categorias
            </Button>
          </Link>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Parceiro
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Parceiros"
            value={stats.totalPartners.toString()}
            icon={<Building2 className="h-5 w-5 text-primary" />}
          />
          <StatCard
            label="Ativos"
            value={stats.activePartners.toString()}
            sublabel={`${stats.totalPartners - stats.activePartners} inativos`}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          />
          <StatCard
            label="Novos este mes"
            value={stats.newThisMonth.toString()}
            icon={<Sparkles className="h-5 w-5 text-yellow-500" />}
          />
          <StatCard
            label="Categorias"
            value={stats.totalCategories.toString()}
            icon={<Tag className="h-5 w-5 text-blue-500" />}
          />
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome do parceiro..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted" />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-8 text-center">
          <p className="text-muted-foreground">Nenhum parceiro cadastrado</p>
          <Button className="mt-4" onClick={handleCreate}>
            Cadastrar primeiro parceiro
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Parceiro</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Beneficio</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoria</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cidade/UF</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id} className="border-b border-border/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {partner.logoUrl ? (
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {partner.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">{partner.name}</span>
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                    {partner.benefit}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: partner.category.color }}
                    >
                      {partner.category.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {partner.city && partner.state
                      ? `${partner.city}/${partner.state}`
                      : partner.city || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={partner.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(partner)}
                      >
                        <Edit2 className="mr-1 h-3 w-3" />
                        Editar
                      </Button>
                      {partner.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(partner.id, partner.name)}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Desativar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {pagination.total} resultados
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-2 text-sm">
                  {page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Proximo
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Partner Form Dialog */}
      <PartnerFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingPartnerId(null);
        }}
        partner={editingPartnerId ? editingPartner ?? null : null}
        categories={categories}
        onSubmit={handleSubmit}
        isPending={createPartner.isPending || updatePartner.isPending}
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

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300">
      Ativo
    </span>
  ) : (
    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-900/20 dark:text-gray-300">
      Inativo
    </span>
  );
}
