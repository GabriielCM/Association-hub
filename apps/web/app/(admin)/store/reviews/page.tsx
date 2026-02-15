'use client';

import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { ReviewsTable } from '@/components/admin/store/ReviewsTable';
import {
  useAdminPendingReviews,
  useModerateReview,
} from '@/lib/hooks/useAdminStore';

export default function ReviewsPage() {
  const { toast } = useToast();
  const { data: reviews, isLoading } = useAdminPendingReviews();
  const moderateReview = useModerateReview();

  const handleModerate = (id: string, status: 'APPROVED' | 'REJECTED') => {
    moderateReview.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast({
            title: status === 'APPROVED' ? 'Review aprovada!' : 'Review rejeitada!',
          });
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/store">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Reviews Pendentes</h1>
          <p className="text-sm text-muted-foreground">
            Modere avaliacoes de produtos
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12">
          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-semibold">Nenhuma review pendente</p>
          <p className="text-sm text-muted-foreground">
            Todas as avaliacoes foram moderadas.
          </p>
        </div>
      ) : (
        <ReviewsTable
          reviews={reviews}
          onModerate={handleModerate}
          isPending={moderateReview.isPending}
        />
      )}
    </div>
  );
}
