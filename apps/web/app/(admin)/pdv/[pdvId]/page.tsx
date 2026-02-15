'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit2,
  Key,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Box,
} from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { PdvStatusBadge } from '@/components/admin/pdv/PdvStatusBadge';
import { PdvProductsTable } from '@/components/admin/pdv/PdvProductsTable';
import { PdvProductDialog } from '@/components/admin/pdv/PdvProductDialog';
import { PdvStockDialog } from '@/components/admin/pdv/PdvStockDialog';
import { PdvSalesTable } from '@/components/admin/pdv/PdvSalesTable';
import { PdvDialog } from '@/components/admin/pdv/PdvDialog';
import { CredentialsDialog } from '@/components/admin/pdv/CredentialsDialog';
import {
  useAdminPdv,
  useAdminPdvProducts,
  useAdminPdvSales,
  useRegenerateCredentials,
  useRemovePdvProduct,
} from '@/lib/hooks/useAdminPdv';
import type { PdvProductItem } from '@/lib/api/pdv.api';

export default function PdvDetailPage() {
  const { pdvId } = useParams<{ pdvId: string }>();
  const { toast } = useToast();

  const { data: pdv, isLoading } = useAdminPdv(pdvId);
  const { data: products } = useAdminPdvProducts(pdvId, { includeInactive: true });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { data: salesData } = useAdminPdvSales(pdvId, {
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  });

  const regenerateCredentials = useRegenerateCredentials();
  const removePdvProduct = useRemovePdvProduct();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PdvProductItem | null>(null);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentials, setCredentials] = useState<{
    apiKey: string;
    apiSecret: string;
  } | null>(null);

  const handleRegenerate = () => {
    if (!window.confirm('Regenerar credenciais? As credenciais atuais serao invalidadas.')) return;
    regenerateCredentials.mutate(pdvId, {
      onSuccess: (data) => {
        setCredentials(data);
        setCredentialsOpen(true);
        toast({ title: 'Credenciais regeneradas!' });
      },
      onError: (err) => {
        toast({ title: 'Erro', description: err.message, variant: 'error' });
      },
    });
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: PdvProductItem) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
  };

  const handleRemoveProduct = (productId: string, name: string) => {
    if (!window.confirm(`Remover produto "${name}"?`)) return;
    removePdvProduct.mutate(
      { pdvId, productId },
      {
        onSuccess: () => toast({ title: 'Produto removido!' }),
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      }
    );
  };

  if (isLoading || !pdv) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const sales = salesData?.sales ?? [];
  const summary = salesData?.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pdv">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{pdv.name}</h1>
              <PdvStatusBadge status={pdv.status} />
            </div>
            <p className="text-sm text-muted-foreground">{pdv.location}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerateCredentials.isPending}
          >
            <Key className="mr-1 h-4 w-4" />
            Regenerar Credenciais
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit2 className="mr-1 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{products?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Produtos</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{summary.totalSales}</p>
                <p className="text-xs text-muted-foreground">Total Vendas</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{summary.totalPoints} pts</p>
                <p className="text-xs text-muted-foreground">Pontos Recebidos</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-3">
              <Box className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  R$ {((summary.totalMoney ?? 0) / 100).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Dinheiro Recebido</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Produtos</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStockDialogOpen(true)}
            >
              Ajustar Estoque
            </Button>
            <Button size="sm" onClick={handleAddProduct}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>

        {!products || products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum produto cadastrado neste PDV.
          </p>
        ) : (
          <PdvProductsTable
            products={products}
            onEdit={handleEditProduct}
            onRemove={handleRemoveProduct}
          />
        )}
      </div>

      {/* Sales section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Vendas</h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">ate</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {sales.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma venda encontrada no periodo.
          </p>
        ) : (
          <PdvSalesTable sales={sales} />
        )}
      </div>

      {/* Dialogs */}
      <PdvDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        pdv={pdv}
      />

      <PdvProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        pdvId={pdvId}
        product={editingProduct}
      />

      {products && products.length > 0 && (
        <PdvStockDialog
          open={stockDialogOpen}
          onOpenChange={setStockDialogOpen}
          pdvId={pdvId}
          products={products}
        />
      )}

      <CredentialsDialog
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        credentials={credentials}
      />
    </div>
  );
}
