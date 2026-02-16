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
import { Button, Select } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import type { OrderStatus } from '@ahub/shared/types';

interface UpdateStatusDialogProps {
  open: boolean;
  onClose: () => void;
  currentStatus: string;
  onConfirm: (status: string, notes: string) => void;
}

const validTransitions: Record<string, Array<{ value: OrderStatus; label: string }>> = {
  PENDING: [{ value: 'CONFIRMED', label: 'Confirmado' }],
  CONFIRMED: [{ value: 'READY', label: 'Pronto para Retirada' }],
  READY: [{ value: 'COMPLETED', label: 'Concluido' }],
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  READY: 'Pronto',
  COMPLETED: 'Concluido',
  CANCELLED: 'Cancelado',
};

export function UpdateStatusDialog({
  open,
  onClose,
  currentStatus,
  onConfirm,
}: UpdateStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

  const transitions = validTransitions[currentStatus] ?? [];
  const options = transitions.map((t) => ({ value: t.value, label: t.label }));

  const handleConfirm = () => {
    if (!selectedStatus) return;
    onConfirm(selectedStatus, notes);
    setSelectedStatus('');
    setNotes('');
  };

  const handleClose = () => {
    setSelectedStatus('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Status do Pedido</DialogTitle>
          <DialogDescription>
            Status atual: {statusLabels[currentStatus] ?? currentStatus}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {options.length > 0 ? (
            <Select
              label="Novo status"
              placeholder="Selecione o proximo status"
              options={options}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma transicao disponivel para o status atual.
            </p>
          )}

          <Textarea
            label="Observacoes (opcional)"
            placeholder="Adicione uma observacao sobre a alteracao..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedStatus || options.length === 0}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
