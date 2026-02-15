'use client';

import type { PdvSaleItem } from '@/lib/api/pdv.api';

interface PdvSalesTableProps {
  sales: PdvSaleItem[];
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const paymentLabels: Record<string, string> = {
  POINTS: 'Pontos',
  MONEY: 'PIX',
  MIXED: 'Misto',
};

export function PdvSalesTable({ sales }: PdvSalesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-left font-medium">Usuario</th>
            <th className="px-4 py-3 text-center font-medium">Itens</th>
            <th className="px-4 py-3 text-left font-medium">Pagamento</th>
            <th className="px-4 py-3 text-right font-medium">Pontos</th>
            <th className="px-4 py-3 text-right font-medium">R$</th>
            <th className="px-4 py-3 text-right font-medium">Cashback</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3 text-muted-foreground">
                {formatDate(sale.createdAt)}
              </td>
              <td className="px-4 py-3">
                {sale.userName ?? sale.userId.slice(0, 8)}
              </td>
              <td className="px-4 py-3 text-center">{sale.items.length}</td>
              <td className="px-4 py-3">
                {paymentLabels[sale.paymentMethod] ?? sale.paymentMethod}
              </td>
              <td className="px-4 py-3 text-right">
                {sale.totalPoints > 0 ? `${sale.totalPoints} pts` : '-'}
              </td>
              <td className="px-4 py-3 text-right">
                {sale.totalMoney > 0
                  ? `R$ ${(sale.totalMoney / 100).toFixed(2)}`
                  : '-'}
              </td>
              <td className="px-4 py-3 text-right text-green-600">
                {sale.cashbackEarned > 0 ? `+${sale.cashbackEarned} pts` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
