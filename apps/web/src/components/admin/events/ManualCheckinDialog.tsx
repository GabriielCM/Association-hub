'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { useManualCheckin } from '@/lib/hooks/useAdminEvents';

interface ManualCheckinDialogProps {
  eventId: string;
  checkinsCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManualCheckinDialog({
  eventId,
  checkinsCount,
  open,
  onOpenChange,
}: ManualCheckinDialogProps) {
  const { toast } = useToast();
  const manualCheckin = useManualCheckin();

  const [userId, setUserId] = useState('');
  const [checkinNumber, setCheckinNumber] = useState(1);
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!userId.trim()) {
      newErrors.userId = 'ID do membro e obrigatorio';
    }

    if (checkinNumber < 1 || checkinNumber > checkinsCount) {
      newErrors.checkinNumber = `Numero deve estar entre 1 e ${checkinsCount}`;
    }

    if (!reason.trim()) {
      newErrors.reason = 'Motivo e obrigatorio';
    } else if (reason.trim().length < 5) {
      newErrors.reason = 'Motivo deve ter pelo menos 5 caracteres';
    } else if (reason.length > 500) {
      newErrors.reason = 'Motivo deve ter no maximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    manualCheckin.mutate(
      {
        eventId,
        data: {
          userId: userId.trim(),
          checkinNumber,
          reason: reason.trim(),
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Check-in manual realizado com sucesso!' });
          resetForm();
          onOpenChange(false);
        },
        onError: (err) => {
          toast({
            title: 'Erro ao realizar check-in',
            description: err.message,
            variant: 'error',
          });
        },
      }
    );
  };

  const resetForm = () => {
    setUserId('');
    setCheckinNumber(1);
    setReason('');
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-in Manual</DialogTitle>
          <DialogDescription>
            Realize o check-in manual de um membro neste evento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User ID */}
          <div>
            <label
              htmlFor="userId"
              className="mb-1 block text-sm font-medium"
            >
              ID do Membro
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Ex: usr_abc123"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.userId && (
              <p className="mt-1 text-xs text-red-500">{errors.userId}</p>
            )}
          </div>

          {/* Checkin Number */}
          <div>
            <label
              htmlFor="checkinNumber"
              className="mb-1 block text-sm font-medium"
            >
              Numero do Check-in
            </label>
            <select
              id="checkinNumber"
              value={checkinNumber}
              onChange={(e) => setCheckinNumber(Number(e.target.value))}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Array.from({ length: checkinsCount }, (_, i) => i + 1).map(
                (num) => (
                  <option key={num} value={num}>
                    Check-in {num}
                  </option>
                )
              )}
            </select>
            {errors.checkinNumber && (
              <p className="mt-1 text-xs text-red-500">
                {errors.checkinNumber}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label
              htmlFor="reason"
              className="mb-1 block text-sm font-medium"
            >
              Motivo
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Usuario teve problemas tecnicos com o QR Code"
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-1 flex justify-between">
              {errors.reason ? (
                <p className="text-xs text-red-500">{errors.reason}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted-foreground">
                {reason.length}/500
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={manualCheckin.isPending}
          >
            {manualCheckin.isPending
              ? 'Processando...'
              : 'Realizar Check-in'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
