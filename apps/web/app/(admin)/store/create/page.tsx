'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { ProductForm } from '@/components/admin/store/ProductForm';
import { useCreateProduct } from '@/lib/hooks/useAdminStore';
import { uploadProductImage } from '@/lib/api/store.api';

export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createProduct = useCreateProduct();

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
          <h1 className="text-2xl font-bold">Novo Produto</h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados para criar um novo produto
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6">
        <ProductForm
          onSubmit={(data, pendingFiles) => {
            createProduct.mutate(data, {
              onSuccess: async (product) => {
                // Upload pending images after product creation
                if (pendingFiles && pendingFiles.length > 0) {
                  try {
                    await Promise.all(
                      pendingFiles.map((file) => uploadProductImage(product.id, file))
                    );
                  } catch {
                    toast({
                      title: 'Produto criado, mas houve erro ao enviar imagens',
                      variant: 'error',
                    });
                  }
                }
                toast({ title: 'Produto criado com sucesso!' });
                router.push('/store');
              },
              onError: (err) => {
                toast({
                  title: 'Erro ao criar produto',
                  description: err.message,
                  variant: 'error',
                });
              },
            });
          }}
          isPending={createProduct.isPending}
          submitLabel="Criar Produto"
        />
      </div>
    </div>
  );
}
