'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import {
  useSpaceBlocks,
  useCreateSpaceBlock,
  useCreateBulkBlocks,
  useDeleteSpaceBlock,
  useAdminSpace,
  useUpdateSpace,
} from '@/lib/hooks/useAdminSpaces';
import type { SpaceBlock } from '@/lib/api/spaces.api';

interface SpaceBlocksManagerProps {
  spaceId: string;
}

const WEEKDAY_LABELS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export function SpaceBlocksManager({ spaceId }: SpaceBlocksManagerProps) {
  const { toast } = useToast();
  const { data: blocks } = useSpaceBlocks(spaceId);
  const { data: space } = useAdminSpace(spaceId);
  const createBlock = useCreateSpaceBlock();
  const createBulk = useCreateBulkBlocks();
  const deleteBlock = useDeleteSpaceBlock();
  const updateSpace = useUpdateSpace();

  const [singleDate, setSingleDate] = useState('');
  const [singleReason, setSingleReason] = useState('');
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const [blockedWeekdays, setBlockedWeekdays] = useState<number[]>([]);

  useEffect(() => {
    if (space?.blockedWeekdays) {
      setBlockedWeekdays(space.blockedWeekdays);
    }
  }, [space?.blockedWeekdays]);

  const handleToggleWeekday = (day: number) => {
    setBlockedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  const handleSaveWeekdays = () => {
    updateSpace.mutate(
      { id: spaceId, data: { blockedWeekdays } },
      {
        onSuccess: () => {
          toast({ title: 'Dias da semana bloqueados atualizados!' });
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      },
    );
  };

  const weekdaysChanged =
    space?.blockedWeekdays != null &&
    JSON.stringify([...blockedWeekdays].sort()) !==
      JSON.stringify([...(space.blockedWeekdays || [])].sort());

  const handleAddSingle = () => {
    if (!singleDate) {
      toast({ title: 'Selecione uma data', variant: 'error' });
      return;
    }

    createBlock.mutate(
      {
        spaceId,
        data: {
          date: singleDate,
          ...(singleReason.trim() && { reason: singleReason.trim() }),
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Bloqueio criado!' });
          setSingleDate('');
          setSingleReason('');
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      },
    );
  };

  const handleAddBulk = () => {
    if (!bulkStartDate || !bulkEndDate) {
      toast({ title: 'Selecione data início e fim', variant: 'error' });
      return;
    }

    const dates: string[] = [];
    const current = new Date(bulkStartDate + 'T00:00:00');
    const end = new Date(bulkEndDate + 'T00:00:00');

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0] as string);
      current.setDate(current.getDate() + 1);
    }

    if (dates.length === 0) {
      toast({ title: 'Intervalo inválido', variant: 'error' });
      return;
    }

    createBulk.mutate(
      {
        spaceId,
        data: {
          dates,
          ...(bulkReason.trim() && { reason: bulkReason.trim() }),
        },
      },
      {
        onSuccess: (result) => {
          toast({ title: `${result.created} bloqueios criados!` });
          setBulkStartDate('');
          setBulkEndDate('');
          setBulkReason('');
          setShowBulk(false);
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      },
    );
  };

  const handleDelete = (block: SpaceBlock) => {
    if (!window.confirm(`Remover bloqueio de ${formatDate(block.date)}?`)) return;
    deleteBlock.mutate(
      { spaceId, blockId: block.id },
      {
        onSuccess: () => toast({ title: 'Bloqueio removido!' }),
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Weekday blocking */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Dias da Semana Bloqueados</h3>
        <p className="text-xs text-muted-foreground">
          Selecione os dias da semana em que este espaço não aceita reservas.
        </p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAY_LABELS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleToggleWeekday(value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                blockedWeekdays.includes(value)
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {weekdaysChanged && (
          <Button
            size="sm"
            onClick={handleSaveWeekdays}
            disabled={updateSpace.isPending}
          >
            {updateSpace.isPending ? 'Salvando...' : 'Salvar Dias Bloqueados'}
          </Button>
        )}
      </div>

      <hr className="border-border" />

      {/* Date-specific blocking */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Bloqueios de Datas</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBulk(!showBulk)}
          >
            <Calendar className="mr-1 h-4 w-4" />
            {showBulk ? 'Simples' : 'Em Lote'}
          </Button>
        </div>

        {/* Add single block */}
        {!showBulk && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">Data</label>
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">Motivo (opcional)</label>
              <input
                type="text"
                value={singleReason}
                onChange={(e) => setSingleReason(e.target.value)}
                placeholder="Ex: Manutenção"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              size="sm"
              onClick={handleAddSingle}
              disabled={createBlock.isPending}
            >
              <Plus className="mr-1 h-4 w-4" />
              Bloquear
            </Button>
          </div>
        )}

        {/* Add bulk blocks */}
        {showBulk && (
          <div className="rounded-lg border p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Data início</label>
                <input
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Data fim</label>
                <input
                  type="date"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Motivo (opcional)</label>
              <input
                type="text"
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="Ex: Reforma"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              size="sm"
              onClick={handleAddBulk}
              disabled={createBulk.isPending}
            >
              <Plus className="mr-1 h-4 w-4" />
              {createBulk.isPending ? 'Criando...' : 'Bloquear Período'}
            </Button>
          </div>
        )}

        {/* Existing blocks list */}
        {blocks && blocks.length > 0 ? (
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">Data</th>
                  <th className="px-3 py-2 text-left font-medium">Motivo</th>
                  <th className="px-3 py-2 text-right font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((block) => (
                  <tr key={block.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">{formatDate(block.date)}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {block.reason || '-'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(block)}
                        className="h-7 w-7"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum bloqueio cadastrado.</p>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}
