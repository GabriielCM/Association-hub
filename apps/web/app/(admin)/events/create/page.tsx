'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save, Upload, X, ImageIcon } from 'lucide-react';
import { Button, Input, Textarea, Label } from '@/components/ui';
import { useCreateEvent } from '@/lib/hooks/useAdminEvents';
import { useToast } from '@/components/ui/use-toast';
import { uploadBannerFeed, uploadBannerDisplay } from '@/lib/api/events.api';
import type { CreateEventInput } from '@ahub/shared/validation';

const STEPS = [
  'Informacoes Basicas',
  'Local',
  'Pontos e Check-ins',
  'Imagens e Publicacao',
];

const categoryOptions = [
  { value: 'SOCIAL', label: 'Social' },
  { value: 'SPORTS', label: 'Esportes' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'EDUCATIONAL', label: 'Educacional' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'GASTRO', label: 'Gastronomia' },
  { value: 'MUSIC', label: 'Musica' },
  { value: 'ART', label: 'Arte' },
  { value: 'GAMES', label: 'Jogos' },
  { value: 'INSTITUTIONAL', label: 'Institucional' },
];

export default function CreateEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createEvent = useCreateEvent();
  const [step, setStep] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SOCIAL');
  const [color, setColor] = useState('#6366F1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [pointsTotal, setPointsTotal] = useState(100);
  const [checkinsCount, setCheckinsCount] = useState(1);
  const [checkinInterval, setCheckinInterval] = useState(0);
  const [capacity, setCapacity] = useState<number | undefined>();
  const [externalLink, setExternalLink] = useState('');

  // Image state (files held locally until event is created)
  const [feedFile, setFeedFile] = useState<File | null>(null);
  const [feedPreview, setFeedPreview] = useState<string | null>(null);
  const [displayFiles, setDisplayFiles] = useState<File[]>([]);
  const [displayPreviews, setDisplayPreviews] = useState<string[]>([]);
  const feedInputRef = useRef<HTMLInputElement>(null);
  const displayInputRef = useRef<HTMLInputElement>(null);

  const handleFeedSelect = (file: File) => {
    if (feedPreview) URL.revokeObjectURL(feedPreview);
    setFeedFile(file);
    setFeedPreview(URL.createObjectURL(file));
  };

  const handleFeedRemove = () => {
    if (feedPreview) URL.revokeObjectURL(feedPreview);
    setFeedFile(null);
    setFeedPreview(null);
  };

  const handleDisplayAdd = (file: File) => {
    setDisplayFiles((prev) => [...prev, file]);
    setDisplayPreviews((prev) => [...prev, URL.createObjectURL(file)]);
  };

  const handleDisplayRemove = (index: number) => {
    const url = displayPreviews[index];
    if (url) URL.revokeObjectURL(url);
    setDisplayFiles((prev) => prev.filter((_, i) => i !== index));
    setDisplayPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const data: CreateEventInput = {
      title,
      description,
      category: category as CreateEventInput['category'],
      color: color || undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      locationName,
      locationAddress: locationAddress || undefined,
      pointsTotal,
      checkinsCount,
      checkinInterval: checkinInterval || undefined,
      capacity: capacity || undefined,
      externalLink: externalLink || undefined,
    };

    createEvent.mutate(data, {
      onSuccess: async (createdEvent) => {
        // Upload images if any were selected
        const hasImages = feedFile || displayFiles.length > 0;
        if (hasImages) {
          try {
            // Feed can go first (single field, no race condition)
            if (feedFile) {
              await uploadBannerFeed(createdEvent.id, feedFile);
            }
            // Display banners must be sequential to avoid race condition
            // (each append reads current array from DB)
            for (const file of displayFiles) {
              await uploadBannerDisplay(createdEvent.id, file);
            }
            toast({ title: 'Evento criado com imagens!' });
          } catch {
            toast({
              title: 'Evento criado, mas houve erro ao enviar imagens',
              description:
                'Voce pode adicionar imagens pela pagina de edicao.',
              variant: 'error',
            });
          }
        } else {
          toast({ title: 'Evento criado com sucesso!' });
        }
        router.push('/events');
      },
      onError: (error) => {
        toast({
          title: 'Erro ao criar evento',
          description: error.message,
          variant: 'error',
        });
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Criar Evento</h1>
          <p className="text-muted-foreground">
            Etapa {step + 1} de {STEPS.length}: {STEPS[step]}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded ${
              i <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        {step === 0 && (
          <>
            <div className="space-y-2">
              <Label>Titulo *</Label>
              <Input
                placeholder="Nome do evento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Descricao *</Label>
              <Textarea
                placeholder="Descreva o evento..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Cor do evento</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#6366F1"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Inicio *</Label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Termino *</Label>
                <Input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label>Nome do Local *</Label>
              <Input
                placeholder="Salao Principal"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label>Endereco</Label>
              <Input
                placeholder="Av. Paulista, 1000 - Sao Paulo, SP"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="space-y-2">
              <Label>Capacidade maxima</Label>
              <Input
                type="number"
                placeholder="Ilimitado"
                value={capacity ?? ''}
                onChange={(e) =>
                  setCapacity(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Link externo</Label>
              <Input
                placeholder="https://..."
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label>Total de pontos *</Label>
              <Input
                type="number"
                value={pointsTotal}
                onChange={(e) => setPointsTotal(parseInt(e.target.value) || 0)}
                min={1}
                max={10000}
              />
              <p className="text-xs text-muted-foreground">
                Entre 1 e 10.000 pontos
              </p>
            </div>
            <div className="space-y-2">
              <Label>Quantidade de check-ins *</Label>
              <Input
                type="number"
                value={checkinsCount}
                onChange={(e) =>
                  setCheckinsCount(parseInt(e.target.value) || 1)
                }
                min={1}
                max={20}
              />
              <p className="text-xs text-muted-foreground">
                Entre 1 e 20 check-ins
              </p>
            </div>
            <div className="space-y-2">
              <Label>Intervalo entre check-ins (minutos)</Label>
              <Input
                type="number"
                value={checkinInterval}
                onChange={(e) =>
                  setCheckinInterval(parseInt(e.target.value) || 0)
                }
                min={0}
                max={1440}
              />
              <p className="text-xs text-muted-foreground">
                0 = todos disponiveis imediatamente
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium">Distribuicao de pontos</p>
              <p className="text-sm text-muted-foreground mt-1">
                {checkinsCount > 0
                  ? `${Math.floor(pointsTotal / checkinsCount)} pontos por check-in`
                  : '–'}
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Banner Feed */}
            <div className="space-y-2">
              <Label>Banner do Feed</Label>
              <p className="text-xs text-muted-foreground">
                Imagem exibida na listagem de eventos. JPG/PNG, max 5MB.
              </p>
              {feedPreview ? (
                <div className="relative inline-block">
                  <img
                    src={feedPreview}
                    alt="Banner feed"
                    className="h-32 w-auto rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80"
                    onClick={handleFeedRemove}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
                  onClick={() => feedInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="h-6 w-6" />
                    <span className="text-xs">Enviar imagem</span>
                  </div>
                </button>
              )}
              <input
                ref={feedInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFeedSelect(file);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Banners Display */}
            <div className="space-y-2">
              <Label>Banners do Display (TV/Kiosk)</Label>
              <p className="text-xs text-muted-foreground">
                Imagens de fundo exibidas no display. JPG/PNG, max 5MB cada.
                Proporcao 16:9 recomendada.
              </p>
              <div className="flex flex-wrap gap-3">
                {displayPreviews.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Display ${index + 1}`}
                      className="h-24 w-40 rounded-lg border object-cover"
                    />
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80"
                      onClick={() => handleDisplayRemove(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="flex h-24 w-40 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
                  onClick={() => displayInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-xs">Adicionar</span>
                  </div>
                </button>
              </div>
              <input
                ref={displayInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleDisplayAdd(file);
                  e.target.value = '';
                }}
              />
            </div>

            <div className="rounded-lg bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">Resumo do Evento</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted-foreground">Titulo:</p>
                <p>{title || '–'}</p>
                <p className="text-muted-foreground">Categoria:</p>
                <p>
                  {categoryOptions.find((c) => c.value === category)
                    ?.label ?? '–'}
                </p>
                <p className="text-muted-foreground">Inicio:</p>
                <p>{startDate || '–'}</p>
                <p className="text-muted-foreground">Termino:</p>
                <p>{endDate || '–'}</p>
                <p className="text-muted-foreground">Local:</p>
                <p>{locationName || '–'}</p>
                <p className="text-muted-foreground">Pontos:</p>
                <p>
                  {pointsTotal} ({checkinsCount} check-ins)
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              O evento sera criado como rascunho. Voce podera publicar
              pela pagina de edicao.
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>
            Proximo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createEvent.isPending}
          >
            {createEvent.isPending ? (
              'Criando...'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Criar Evento
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
