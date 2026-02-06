'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import type { SubscriptionPlan, PlanMutators } from '@ahub/shared/types';

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: SubscriptionPlan | null;
  onSubmit: (data: PlanFormData) => void;
  isPending?: boolean;
}

export interface PlanFormData {
  name: string;
  description: string;
  priceMonthly: number;
  color: string;
  displayOrder: number;
  mutators: PlanMutators;
}

const DEFAULT_MUTATORS: PlanMutators = {
  points_events: 1,
  points_strava: 1,
  points_posts: 1,
  discount_store: 0,
  discount_pdv: 0,
  discount_spaces: 0,
  cashback: 0,
};

const MUTATOR_CONFIG = [
  { key: 'points_events' as const, label: 'Multiplicador Eventos', suffix: 'x', min: 1, max: 5, step: 0.5, help: 'Multiplica pontos ganhos em eventos' },
  { key: 'points_strava' as const, label: 'Multiplicador Strava', suffix: 'x', min: 1, max: 5, step: 0.5, help: 'Multiplica pontos ganhos no Strava' },
  { key: 'points_posts' as const, label: 'Multiplicador Posts', suffix: 'x', min: 1, max: 5, step: 0.5, help: 'Multiplica pontos ganhos em posts' },
  { key: 'discount_store' as const, label: 'Desconto Loja', suffix: '%', min: 0, max: 50, step: 5, help: 'Desconto em compras na loja' },
  { key: 'discount_pdv' as const, label: 'Desconto PDV', suffix: '%', min: 0, max: 50, step: 5, help: 'Desconto em compras no PDV' },
  { key: 'discount_spaces' as const, label: 'Desconto Espacos', suffix: '%', min: 0, max: 50, step: 5, help: 'Desconto em reserva de espacos' },
  { key: 'cashback' as const, label: 'Cashback Extra', suffix: '%', min: 0, max: 20, step: 1, help: 'Percentual extra de cashback' },
];

export function PlanFormDialog({ open, onOpenChange, plan, onSubmit, isPending }: PlanFormDialogProps) {
  const isEdit = !!plan;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceMonthly, setPriceMonthly] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [mutators, setMutators] = useState<PlanMutators>(DEFAULT_MUTATORS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (plan) {
        setName(plan.name);
        setDescription(plan.description);
        setPriceMonthly((plan.priceMonthly / 100).toFixed(2));
        setColor(plan.color || '#8B5CF6');
        setDisplayOrder((plan.displayOrder ?? 1).toString());
        setMutators({ ...DEFAULT_MUTATORS, ...plan.mutators });
      } else {
        setName('');
        setDescription('');
        setPriceMonthly('');
        setColor('#8B5CF6');
        setDisplayOrder('1');
        setMutators(DEFAULT_MUTATORS);
      }
      setErrors({});
    }
  }, [open, plan]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 3) newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    if (!description.trim() || description.trim().length < 10) newErrors.description = 'Descricao deve ter pelo menos 10 caracteres';
    const price = parseFloat(priceMonthly);
    if (isNaN(price) || price <= 0) newErrors.priceMonthly = 'Preco deve ser maior que zero';
    const order = parseInt(displayOrder, 10);
    if (isNaN(order) || order < 1 || order > 3) newErrors.displayOrder = 'Ordem deve ser entre 1 e 3';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      priceMonthly: Math.round(parseFloat(priceMonthly) * 100),
      color,
      displayOrder: parseInt(displayOrder, 10) || 1,
      mutators,
    });
  };

  const updateMutator = (key: keyof PlanMutators, value: string) => {
    setMutators((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Altere as informacoes do plano de assinatura.'
                : 'Preencha as informacoes para criar um novo plano.'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Basic info */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="plan-name">Nome</Label>
                <Input
                  id="plan-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Premium, Gold..."
                  error={errors.name}
                />
              </div>

              <div>
                <Label htmlFor="plan-desc">Descricao</Label>
                <Textarea
                  id="plan-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva os beneficios do plano..."
                  rows={3}
                  className={errors.description ? 'border-error' : ''}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-error-dark">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="plan-price">Preco Mensal (R$)</Label>
                  <Input
                    id="plan-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(e.target.value)}
                    placeholder="49.90"
                    error={errors.priceMonthly}
                  />
                </div>
                <div>
                  <Label htmlFor="plan-order">Ordem de Exibicao</Label>
                  <Input
                    id="plan-order"
                    type="number"
                    min="1"
                    max="3"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    error={errors.displayOrder}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="plan-color">Cor do Plano</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="plan-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border border-input"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#8B5CF6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Mutators */}
            <div>
              <h4 className="mb-2 text-sm font-semibold">Beneficios / Mutadores</h4>
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                {MUTATOR_CONFIG.map((m) => (
                  <div key={m.key} className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-medium">{m.label}</label>
                      <p className="text-xs text-muted-foreground">{m.help}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        step={m.step}
                        min={m.min}
                        max={m.max}
                        value={mutators[m.key] ?? m.min}
                        onChange={(e) => updateMutator(m.key, e.target.value)}
                        className="w-20 text-center"
                      />
                      <span className="text-sm text-muted-foreground">{m.suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEdit ? 'Salvar Alteracoes' : 'Criar Plano'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
