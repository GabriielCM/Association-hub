'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useLowStockProducts } from '@/lib/hooks/useAdminStoreReports';

export function LowStockAlert() {
  const { data: products } = useLowStockProducts();

  if (!products || products.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300">
            Estoque Baixo ({products.length} {products.length === 1 ? 'produto' : 'produtos'})
          </h3>
          <div className="mt-2 space-y-1">
            {products.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <Link
                  href={`/store/${p.id}`}
                  className="text-amber-700 underline-offset-2 hover:underline dark:text-amber-400"
                >
                  {p.name}
                </Link>
                <span className="font-mono text-xs text-amber-600 dark:text-amber-500">
                  {p.stockCount ?? 0} un.
                </span>
              </div>
            ))}
            {products.length > 5 && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                e mais {products.length - 5} produto(s)...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
