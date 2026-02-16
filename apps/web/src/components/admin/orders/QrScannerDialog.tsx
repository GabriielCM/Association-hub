'use client';

import { useState } from 'react';
import { QrCode, Search, Package, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button, Input } from '@/components/ui';
import { OrderStatusBadge } from './OrderStatusBadge';

interface QrScannerResult {
  orderCode?: string;
  status?: string;
  statusLabel?: string;
  itemsCount?: number;
  canComplete?: boolean;
  valid?: boolean;
  error?: string;
}

interface QrScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onValidate: (code: string) => void;
  result?: QrScannerResult | undefined;
}

export function QrScannerDialog({
  open,
  onClose,
  onValidate,
  result,
}: QrScannerDialogProps) {
  const [code, setCode] = useState('');

  const handleValidate = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onValidate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  const handleClose = () => {
    setCode('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Validar Retirada
          </DialogTitle>
          <DialogDescription>
            Insira o codigo do pedido para validar a retirada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Manual code entry */}
          <div className="flex gap-2">
            <Input
              placeholder="Codigo do pedido (ex: ORD-ABC123)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleValidate} disabled={!code.trim()}>
              <Search className="mr-1 h-4 w-4" />
              Validar
            </Button>
          </div>

          {/* Validation result */}
          {result && (
            <div className="rounded-lg border border-border p-4 space-y-3">
              {result.valid === false || result.error ? (
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-700">
                      Codigo invalido
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.error ?? 'O codigo informado nao foi encontrado.'}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Pedido Encontrado</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {result.orderCode}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-muted/50 p-2">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <div className="mt-1">
                        {result.status ? (
                          <OrderStatusBadge status={result.status} />
                        ) : (
                          <span className="text-sm">-</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <p className="text-xs text-muted-foreground">Itens</p>
                      <div className="mt-1 flex items-center gap-1">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {result.itemsCount ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {result.canComplete && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (result.orderCode) {
                          onValidate(result.orderCode);
                        }
                      }}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Confirmar Retirada
                    </Button>
                  )}

                  {result.canComplete === false && (
                    <p className="text-center text-xs text-muted-foreground">
                      Este pedido nao pode ser concluido no status atual.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
