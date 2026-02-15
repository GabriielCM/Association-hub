'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import {
  useCreateSpace,
  useUpdateSpace,
  useUploadSpaceImage,
  useRemoveSpaceImage,
} from '@/lib/hooks/useAdminSpaces';
import type { SpaceItem, BookingPeriodType, Shift } from '@/lib/api/spaces.api';
import { SpaceImageUpload } from './SpaceImageUpload';

interface SpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space?: SpaceItem | null;
}

export function SpaceDialog({ open, onOpenChange, space }: SpaceDialogProps) {
  const { toast } = useToast();
  const createSpace = useCreateSpace();
  const updateSpace = useUpdateSpace();
  const uploadImage = useUploadSpaceImage();
  const removeImage = useRemoveSpaceImage();
  const isEditing = !!space;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [periodType, setPeriodType] = useState<BookingPeriodType>('DAY');
  const [fee, setFee] = useState(0);
  const [minAdvanceDays, setMinAdvanceDays] = useState(1);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(60);
  const [bookingIntervalMonths, setBookingIntervalMonths] = useState(0);

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // SHIFT fields
  const [shifts, setShifts] = useState<Shift[]>([
    { name: 'Manhã', startTime: '08:00', endTime: '12:00' },
  ]);

  // HOUR fields
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('22:00');
  const [minDurationHours, setMinDurationHours] = useState(1);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (space) {
      setName(space.name);
      setDescription(space.description);
      setCapacity(space.capacity);
      setPeriodType(space.periodType);
      setFee(space.fee);
      setMinAdvanceDays(space.minAdvanceDays);
      setMaxAdvanceDays(space.maxAdvanceDays);
      setBookingIntervalMonths(space.bookingIntervalMonths);
      setImages(space.images || []);
      if (space.shifts && space.shifts.length > 0) setShifts(space.shifts);
      if (space.openingTime) setOpeningTime(space.openingTime);
      if (space.closingTime) setClosingTime(space.closingTime);
      if (space.minDurationHours) setMinDurationHours(space.minDurationHours);
    } else {
      resetForm();
    }
  }, [space, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 3) newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    if (!description.trim() || description.trim().length < 10) newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
    if (capacity < 1) newErrors.capacity = 'Capacidade deve ser pelo menos 1';
    if (periodType === 'SHIFT' && shifts.length === 0) newErrors.shifts = 'Adicione pelo menos um turno';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = useCallback(
    (file: File) => {
      if (isEditing && space) {
        uploadImage.mutate(
          { spaceId: space.id, file },
          {
            onSuccess: (updated) => {
              setImages(updated.images || []);
              toast({ title: 'Imagem enviada!' });
            },
            onError: (err) => {
              toast({ title: 'Erro ao enviar imagem', description: err.message, variant: 'error' });
            },
          },
        );
      } else {
        setPendingFiles((prev) => [...prev, file]);
      }
    },
    [isEditing, space, uploadImage, toast],
  );

  const handleImageRemove = useCallback(
    (imageUrl: string) => {
      if (isEditing && space) {
        removeImage.mutate(
          { spaceId: space.id, imageUrl },
          {
            onSuccess: (updated) => {
              setImages(updated.images || []);
              toast({ title: 'Imagem removida!' });
            },
            onError: (err) => {
              toast({ title: 'Erro ao remover imagem', description: err.message, variant: 'error' });
            },
          },
        );
      }
    },
    [isEditing, space, removeImage, toast],
  );

  const handleRemovePending = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const uploadPendingFiles = async (spaceId: string) => {
    for (const file of pendingFiles) {
      try {
        await uploadImage.mutateAsync({ spaceId, file });
      } catch {
        // Continue with remaining files even if one fails
      }
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const baseData = {
      name: name.trim(),
      description: description.trim(),
      capacity,
      periodType,
      minAdvanceDays,
      maxAdvanceDays,
      bookingIntervalMonths,
      ...(fee > 0 && { fee }),
    };

    const periodData =
      periodType === 'SHIFT'
        ? { shifts }
        : periodType === 'HOUR'
          ? { openingTime, closingTime, minDurationHours }
          : {};

    const data = { ...baseData, ...periodData };

    if (isEditing && space) {
      updateSpace.mutate(
        { id: space.id, data },
        {
          onSuccess: () => {
            toast({ title: 'Espaço atualizado!' });
            onOpenChange(false);
          },
          onError: (err) => {
            toast({ title: 'Erro', description: err.message, variant: 'error' });
          },
        },
      );
    } else {
      createSpace.mutate(data, {
        onSuccess: async (created) => {
          if (pendingFiles.length > 0) {
            await uploadPendingFiles(created.id);
          }
          toast({ title: 'Espaço criado!' });
          resetForm();
          onOpenChange(false);
        },
        onError: (err) => {
          toast({ title: 'Erro', description: err.message, variant: 'error' });
        },
      });
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCapacity(10);
    setPeriodType('DAY');
    setFee(0);
    setMinAdvanceDays(1);
    setMaxAdvanceDays(60);
    setBookingIntervalMonths(0);
    setImages([]);
    setPendingFiles([]);
    setShifts([{ name: 'Manhã', startTime: '08:00', endTime: '12:00' }]);
    setOpeningTime('08:00');
    setClosingTime('22:00');
    setMinDurationHours(1);
    setErrors({});
  };

  const addShift = () => {
    setShifts((prev) => [...prev, { name: '', startTime: '', endTime: '' }]);
  };

  const removeShift = (index: number) => {
    setShifts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateShift = (index: number, field: keyof Shift, value: string) => {
    setShifts((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const isPending = createSpace.isPending || updateSpace.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Espaço' : 'Novo Espaço'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os dados do espaço.'
              : 'Preencha os dados para criar um novo espaço.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Churrasqueira Principal"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descreva o espaço..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Images */}
          <SpaceImageUpload
            images={images}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            pendingFiles={pendingFiles}
            onRemovePending={handleRemovePending}
            isUploading={uploadImage.isPending}
          />

          {/* Capacity + Period Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Capacidade</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={1}
                max={1000}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tipo de período</label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as BookingPeriodType)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="DAY">Diária</option>
                <option value="SHIFT">Turnos</option>
                <option value="HOUR">Horário</option>
              </select>
            </div>
          </div>

          {/* Fee */}
          <div>
            <label className="mb-1 block text-sm font-medium">Taxa (centavos, 0 = grátis)</label>
            <input
              type="number"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              min={0}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {fee > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                R$ {(fee / 100).toFixed(2)}
              </p>
            )}
          </div>

          {/* Advance & Interval */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Min. dias antecedência</label>
              <input
                type="number"
                value={minAdvanceDays}
                onChange={(e) => setMinAdvanceDays(Number(e.target.value))}
                min={0}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max. dias antecedência</label>
              <input
                type="number"
                value={maxAdvanceDays}
                onChange={(e) => setMaxAdvanceDays(Number(e.target.value))}
                min={1}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Intervalo (meses)</label>
              <input
                type="number"
                value={bookingIntervalMonths}
                onChange={(e) => setBookingIntervalMonths(Number(e.target.value))}
                min={0}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">0 = sem restrição</p>
            </div>
          </div>

          {/* SHIFT: Shifts array */}
          {periodType === 'SHIFT' && (
            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Turnos</label>
                <Button size="sm" variant="outline" onClick={addShift}>
                  <Plus className="mr-1 h-3 w-3" /> Turno
                </Button>
              </div>
              {errors.shifts && <p className="text-xs text-red-500">{errors.shifts}</p>}
              {shifts.map((shift, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shift.name}
                    onChange={(e) => updateShift(i, 'name', e.target.value)}
                    placeholder="Nome"
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="time"
                    value={shift.startTime}
                    onChange={(e) => updateShift(i, 'startTime', e.target.value)}
                    className="rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-xs text-muted-foreground">até</span>
                  <input
                    type="time"
                    value={shift.endTime}
                    onChange={(e) => updateShift(i, 'endTime', e.target.value)}
                    className="rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeShift(i)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* HOUR: Opening/Closing/MinDuration */}
          {periodType === 'HOUR' && (
            <div className="rounded-lg border p-3 space-y-3">
              <label className="text-sm font-medium">Configuração de horário</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Abertura</label>
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Fechamento</label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Min. horas</label>
                  <input
                    type="number"
                    value={minDurationHours}
                    onChange={(e) => setMinDurationHours(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          )}
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
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? 'Salvando...'
              : isEditing
                ? 'Atualizar'
                : 'Criar Espaço'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
