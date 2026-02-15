'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  FolderOpen,
  MessageSquare,
  Package,
  TrendingUp,
  Tag,
  Search,
} from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { ProductsTable } from '@/components/admin/store/ProductsTable';
import {
  useAdminProducts,
  useAdminCategories,
  useDeleteProduct,
} from '@/lib/hooks/useAdminStore';
import type { ProductType } from '@ahub/shared/types';

export default function StorePage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProductType | ''>('');
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');

  const { data: categories } = useAdminCategories();
  const { data, isLoading } = useAdminProducts({
    page,
    perPage: 20,
    ...(search ? { search } : {}),
    ...(categoryFilter ? { categoryId: categoryFilter } : {}),
    ...(typeFilter ? { type: typeFilter as ProductType } : {}),
    ...(activeFilter ? { isActive: activeFilter === 'true' } : {}),
  });

  const deleteProduct = useDeleteProduct();

  const products = data?.data ?? [];
  const stats = data?.stats;
  const meta = data?.meta;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Excluir produto "${name}"? Esta acao nao pode ser desfeita.`)) return;
    deleteProduct.mutate(id, {
      onSuccess: () => toast({ title: 'Produto excluido!' }),
      onError: (err) => {
        toast({ title: 'Erro', description: err.message, variant: 'error' });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loja</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie produtos, categorias e avaliacoes
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/store/reviews">
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-1 h-4 w-4" />
              Reviews
            </Button>
          </Link>
          <Link href="/store/categories">
            <Button variant="outline" size="sm">
              <FolderOpen className="mr-1 h-4 w-4" />
              Categorias
            </Button>
          </Link>
          <Link href="/store/create">
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
                <p className="text-xs text-muted-foreground">Total Produtos</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeProducts}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.promotionalProducts}</p>
                <p className="text-xs text-muted-foreground">Em Promocao</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                <p className="text-xs text-muted-foreground">Reviews Pendentes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar produtos..."
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleSearch}>
            Buscar
          </Button>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todas categorias</option>
          {(categories ?? []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as ProductType | ''); setPage(1); }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos tipos</option>
          <option value="PHYSICAL">Fisico</option>
          <option value="VOUCHER">Voucher</option>
          <option value="SERVICE">Servico</option>
        </select>

        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value as '' | 'true' | 'false'); setPage(1); }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
          <Package className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-semibold">Nenhum produto encontrado</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Crie seu primeiro produto para comecar a vender.
          </p>
          <Link href="/store/create">
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Criar Produto
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <ProductsTable products={products} onDelete={handleDelete} />

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Pagina {meta.currentPage} de {meta.totalPages} ({meta.totalCount} produtos)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Proximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
