'use client';

import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui';
import type { AdminPendingReview } from '@/lib/api/store.api';

interface ReviewsTableProps {
  reviews: AdminPendingReview[];
  onModerate: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  isPending?: boolean;
}

function renderStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

export function ReviewsTable({
  reviews,
  onModerate,
  isPending,
}: ReviewsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Produto</th>
            <th className="px-4 py-3 text-left font-medium">Usuario</th>
            <th className="px-4 py-3 text-center font-medium">Nota</th>
            <th className="px-4 py-3 text-left font-medium">Comentario</th>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-right font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">
                {review.product?.name ?? '-'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {review.user.avatarUrl ? (
                    <img
                      src={review.user.avatarUrl}
                      alt=""
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {review.user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm">{review.user.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-center text-yellow-500">
                {renderStars(review.rating)}
              </td>
              <td className="max-w-xs px-4 py-3 text-muted-foreground">
                <p className="line-clamp-2">{review.comment ?? '-'}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => onModerate(review.id, 'APPROVED')}
                    title="Aprovar"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => onModerate(review.id, 'REJECTED')}
                    title="Rejeitar"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
