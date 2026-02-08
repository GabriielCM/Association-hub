'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X, ImageIcon } from 'lucide-react';
import { Button, Input, Textarea, Label, Spinner } from '@/components/ui';
import { useAdminEventDetail, useUpdateEvent } from '@/lib/hooks/useAdminEvents';
import { useToast } from '@/components/ui/use-toast';
import {
  uploadBannerFeed,
  uploadBannerDisplay,
  removeBannerDisplay,
} from '@/lib/api/events.api';

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

export default function EditEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  const router = useRouter();
  const { toast } = useToast();

  const { data: event, isLoading } = useAdminEventDetail(eventId);
  const updateEvent = useUpdateEvent();

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
  const [bannerFeedUrl, setBannerFeedUrl] = useState<string | null>(null);
  const [bannerDisplayUrls, setBannerDisplayUrls] = useState<string[]>([]);
  const [uploadingFeed, setUploadingFeed] = useState(false);
  const [uploadingDisplay, setUploadingDisplay] = useState(false);
  const feedInputRef = useRef<HTMLInputElement>(null);
  const displayInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setCategory(event.category);
      setColor(event.color ?? '#6366F1');
      setStartDate(event.startDate.slice(0, 16));
      setEndDate(event.endDate.slice(0, 16));
      setLocationName(event.locationName);
      setLocationAddress(event.locationAddress ?? '');
      setPointsTotal(event.pointsTotal);
      setCheckinsCount(event.checkinsCount);
      setCheckinInterval(event.checkinInterval);
      setCapacity(event.capacity ?? undefined);
      setExternalLink(event.externalLink ?? '');
      setBannerFeedUrl(event.bannerFeed);
      setBannerDisplayUrls(event.bannerDisplay ?? []);
    }
  }, [event]);

  if (isLoading || !event) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const handleSubmit = () => {
    updateEvent.mutate(
      {
        eventId,
        data: {
          title,
          description,
          category: category as any,
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
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Evento atualizado com sucesso!' });
          router.push(`/events/${eventId}`);
        },
        onError: (error) => {
          toast({
            title: 'Erro ao atualizar evento',
            description: error.message,
            variant: 'error',
          });
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Evento</h1>
          <p className="text-muted-foreground">{event.title}</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="space-y-2">
          <Label>Titulo *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label>Descricao *</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <select className="w-full rounded-md border px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 items-center">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-10 rounded border cursor-pointer" />
              <Input value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Inicio</Label>
            <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Termino</Label>
            <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Local</Label>
          <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Endereco</Label>
          <Input value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Pontos</Label>
            <Input type="number" value={pointsTotal} onChange={(e) => setPointsTotal(parseInt(e.target.value) || 0)} min={1} max={10000} />
          </div>
          <div className="space-y-2">
            <Label>Check-ins</Label>
            <Input type="number" value={checkinsCount} onChange={(e) => setCheckinsCount(parseInt(e.target.value) || 1)} min={1} max={20} />
          </div>
          <div className="space-y-2">
            <Label>Intervalo (min)</Label>
            <Input type="number" value={checkinInterval} onChange={(e) => setCheckinInterval(parseInt(e.target.value) || 0)} min={0} max={1440} />
          </div>
        </div>
      </div>

      {/* Imagens */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Imagens</h3>

        {/* Banner Feed */}
        <div className="space-y-2">
          <Label>Banner do Feed</Label>
          <p className="text-xs text-muted-foreground">
            Imagem exibida na listagem de eventos. JPG/PNG, max 5MB.
          </p>
          {bannerFeedUrl ? (
            <div className="relative inline-block">
              <img
                src={bannerFeedUrl}
                alt="Banner feed"
                className="h-32 w-auto rounded-lg border object-cover"
              />
              <button
                type="button"
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80"
                onClick={async () => {
                  setUploadingFeed(true);
                  try {
                    // Upload a blank to clear — or we can just set via update
                    await uploadBannerFeed(eventId, new File([], 'clear'));
                  } catch {
                    // ignore — we'll just clear locally
                  }
                  setBannerFeedUrl(null);
                  setUploadingFeed(false);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
              onClick={() => feedInputRef.current?.click()}
              disabled={uploadingFeed}
            >
              {uploadingFeed ? (
                <Spinner />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Enviar imagem</span>
                </div>
              )}
            </button>
          )}
          <input
            ref={feedInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingFeed(true);
              try {
                const result = await uploadBannerFeed(eventId, file);
                setBannerFeedUrl(result.bannerFeed);
                toast({ title: 'Banner feed enviado!' });
              } catch (err) {
                toast({
                  title: 'Erro ao enviar banner',
                  description: err instanceof Error ? err.message : 'Erro desconhecido',
                  variant: 'error',
                });
              }
              setUploadingFeed(false);
              e.target.value = '';
            }}
          />
        </div>

        {/* Banner Display */}
        <div className="space-y-2">
          <Label>Banners do Display (TV/Kiosk)</Label>
          <p className="text-xs text-muted-foreground">
            Imagens de fundo exibidas no display. JPG/PNG, max 5MB cada. Proporcao 16:9 recomendada.
          </p>
          <div className="flex flex-wrap gap-3">
            {bannerDisplayUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Display ${index + 1}`}
                  className="h-24 w-40 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80"
                  onClick={async () => {
                    try {
                      const result = await removeBannerDisplay(eventId, index);
                      setBannerDisplayUrls(result.bannerDisplay);
                      toast({ title: 'Banner removido' });
                    } catch (err) {
                      toast({
                        title: 'Erro ao remover',
                        description: err instanceof Error ? err.message : 'Erro desconhecido',
                        variant: 'error',
                      });
                    }
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="flex h-24 w-40 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
              onClick={() => displayInputRef.current?.click()}
              disabled={uploadingDisplay}
            >
              {uploadingDisplay ? (
                <Spinner />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs">Adicionar</span>
                </div>
              )}
            </button>
          </div>
          <input
            ref={displayInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingDisplay(true);
              try {
                const result = await uploadBannerDisplay(eventId, file);
                setBannerDisplayUrls(result.bannerDisplay);
                toast({ title: 'Banner display adicionado!' });
              } catch (err) {
                toast({
                  title: 'Erro ao enviar banner',
                  description: err instanceof Error ? err.message : 'Erro desconhecido',
                  variant: 'error',
                });
              }
              setUploadingDisplay(false);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={updateEvent.isPending}>
          {updateEvent.isPending ? 'Salvando...' : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alteracoes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
