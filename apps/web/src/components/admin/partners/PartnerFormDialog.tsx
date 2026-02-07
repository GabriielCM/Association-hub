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
import type { PartnerCategory, AudienceType } from '@ahub/shared/types';
import type { AdminPartnerDetail } from '@/lib/api/partners.api';

interface PartnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: AdminPartnerDetail | null;
  categories: PartnerCategory[];
  onSubmit: (data: PartnerFormData) => void;
  isPending?: boolean;
}

export interface PartnerFormData {
  categoryId: string;
  name: string;
  benefit: string;
  instructions?: string;
  logoUrl?: string;
  bannerUrl?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  businessHours?: Record<string, string>;
  eligibleAudiences?: AudienceType[];
  eligiblePlanIds?: string[];
  showLocked?: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terca' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
];

const AUDIENCE_OPTIONS: { value: AudienceType; label: string }[] = [
  { value: 'ALL', label: 'Todos os associados' },
  { value: 'SUBSCRIBERS', label: 'Apenas assinantes' },
  { value: 'NON_SUBSCRIBERS', label: 'Apenas nao-assinantes' },
  { value: 'SPECIFIC_PLANS', label: 'Planos especificos' },
];

export function PartnerFormDialog({
  open,
  onOpenChange,
  partner,
  categories,
  onSubmit,
  isPending,
}: PartnerFormDialogProps) {
  const isEdit = !!partner;

  // Basic
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [benefit, setBenefit] = useState('');
  const [instructions, setInstructions] = useState('');

  // Media
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Contact
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Business hours
  const [hours, setHours] = useState<Record<string, string>>({});

  // Audience
  const [audiences, setAudiences] = useState<AudienceType[]>(['ALL']);
  const [showLocked, setShowLocked] = useState(true);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (partner) {
        setName(partner.name);
        setCategoryId(partner.category.id);
        setBenefit(partner.benefit);
        setInstructions(partner.instructions || '');
        setLogoUrl(partner.logoUrl || '');
        setBannerUrl(partner.bannerUrl || '');
        setStreet(partner.address?.street || '');
        setCity(partner.address?.city || '');
        setState(partner.address?.state || '');
        setZipCode(partner.address?.zipCode || '');
        setLat(partner.address?.lat?.toString() || '');
        setLng(partner.address?.lng?.toString() || '');
        setPhone(partner.contact?.phone || '');
        setWebsite(partner.contact?.website || '');
        setInstagram(partner.contact?.instagram || '');
        setFacebook(partner.contact?.facebook || '');
        setWhatsapp(partner.contact?.whatsapp || '');
        setHours((partner.businessHours as Record<string, string>) || {});
        setAudiences(partner.eligibleAudiences || ['ALL']);
        setShowLocked(partner.showLocked ?? true);
      } else {
        setName('');
        setCategoryId(categories[0]?.id || '');
        setBenefit('');
        setInstructions('');
        setLogoUrl('');
        setBannerUrl('');
        setStreet('');
        setCity('');
        setState('');
        setZipCode('');
        setLat('');
        setLng('');
        setPhone('');
        setWebsite('');
        setInstagram('');
        setFacebook('');
        setWhatsapp('');
        setHours({});
        setAudiences(['ALL']);
        setShowLocked(true);
      }
      setErrors({});
    }
  }, [open, partner, categories]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    if (!categoryId) newErrors.categoryId = 'Selecione uma categoria';
    if (!benefit.trim() || benefit.trim().length < 3) newErrors.benefit = 'Beneficio deve ter pelo menos 3 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Build business hours object (only non-empty days)
    const bh: Record<string, string> = {};
    for (const day of DAYS) {
      const val = hours[day.key];
      if (val?.trim()) {
        bh[day.key] = val.trim();
      }
    }

    const data: PartnerFormData = {
      categoryId,
      name: name.trim(),
      benefit: benefit.trim(),
      eligibleAudiences: audiences,
      showLocked,
    };
    if (instructions.trim()) data.instructions = instructions.trim();
    if (logoUrl.trim()) data.logoUrl = logoUrl.trim();
    if (bannerUrl.trim()) data.bannerUrl = bannerUrl.trim();
    if (street.trim()) data.street = street.trim();
    if (city.trim()) data.city = city.trim();
    if (state.trim()) data.state = state.trim();
    if (zipCode.trim()) data.zipCode = zipCode.trim();
    if (lat) data.lat = parseFloat(lat);
    if (lng) data.lng = parseFloat(lng);
    if (phone.trim()) data.phone = phone.trim();
    if (website.trim()) data.website = website.trim();
    if (instagram.trim()) data.instagram = instagram.trim();
    if (facebook.trim()) data.facebook = facebook.trim();
    if (whatsapp.trim()) data.whatsapp = whatsapp.trim();
    if (Object.keys(bh).length > 0) data.businessHours = bh;

    onSubmit(data);
  };

  const toggleAudience = (value: AudienceType) => {
    setAudiences((prev) =>
      prev.includes(value)
        ? prev.filter((a) => a !== value)
        : [...prev, value]
    );
  };

  const updateHour = (day: string, value: string) => {
    setHours((prev) => ({ ...prev, [day]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar Parceiro' : 'Novo Parceiro'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Altere as informacoes do parceiro.'
                : 'Preencha as informacoes para cadastrar um novo parceiro.'}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Informacoes Basicas</h4>

              <div>
                <Label htmlFor="p-name">Nome *</Label>
                <Input
                  id="p-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do parceiro"
                  {...(errors.name ? { error: errors.name } : {})}
                />
              </div>

              <div>
                <Label htmlFor="p-category">Categoria *</Label>
                <select
                  id="p-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm ${errors.categoryId ? 'border-error' : 'border-border'}`}
                >
                  <option value="">Selecione...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-xs text-error-dark">{errors.categoryId}</p>
                )}
              </div>

              <div>
                <Label htmlFor="p-benefit">Beneficio *</Label>
                <Input
                  id="p-benefit"
                  value={benefit}
                  onChange={(e) => setBenefit(e.target.value)}
                  placeholder="Ex: 15% de desconto em todos os produtos"
                  {...(errors.benefit ? { error: errors.benefit } : {})}
                />
              </div>

              <div>
                <Label htmlFor="p-instructions">Instrucoes de uso</Label>
                <Textarea
                  id="p-instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Ex: Apresente a carteirinha antes de fechar a conta"
                  rows={2}
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Midia</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="p-logo">URL do Logo</Label>
                  <Input
                    id="p-logo"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="p-banner">URL do Banner</Label>
                  <Input
                    id="p-banner"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Endereco</h4>
              <div>
                <Label htmlFor="p-street">Rua</Label>
                <Input
                  id="p-street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Rua das Flores, 123"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="p-city">Cidade</Label>
                  <Input
                    id="p-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Sao Paulo"
                  />
                </div>
                <div>
                  <Label htmlFor="p-state">Estado</Label>
                  <Input
                    id="p-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="SP"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="p-zip">CEP</Label>
                  <Input
                    id="p-zip"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="01234-567"
                  />
                </div>
                <div>
                  <Label htmlFor="p-lat">Latitude</Label>
                  <Input
                    id="p-lat"
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="-23.5505"
                  />
                </div>
                <div>
                  <Label htmlFor="p-lng">Longitude</Label>
                  <Input
                    id="p-lng"
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="-46.6333"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Contato</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="p-phone">Telefone</Label>
                  <Input
                    id="p-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 1234-5678"
                  />
                </div>
                <div>
                  <Label htmlFor="p-website">Website</Label>
                  <Input
                    id="p-website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="p-instagram">Instagram</Label>
                  <Input
                    id="p-instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@usuario"
                  />
                </div>
                <div>
                  <Label htmlFor="p-facebook">Facebook</Label>
                  <Input
                    id="p-facebook"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="pagina"
                  />
                </div>
                <div>
                  <Label htmlFor="p-whatsapp">WhatsApp</Label>
                  <Input
                    id="p-whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 91234-5678"
                  />
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Horario de Funcionamento</h4>
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                {DAYS.map((day) => (
                  <div key={day.key} className="flex items-center gap-3">
                    <span className="w-20 text-sm font-medium">{day.label}</span>
                    <Input
                      value={hours[day.key] || ''}
                      onChange={(e) => updateHour(day.key, e.target.value)}
                      placeholder="09:00-18:00"
                      className="flex-1"
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Formato: HH:MM-HH:MM ou deixe vazio para fechado
                </p>
              </div>
            </div>

            {/* Audience */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Publico-Alvo</h4>
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                {AUDIENCE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={audiences.includes(opt.value)}
                      onChange={() => toggleAudience(opt.value)}
                      className="rounded border-border"
                    />
                    {opt.label}
                  </label>
                ))}
                <div className="mt-2 border-t border-border pt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showLocked}
                      onChange={(e) => setShowLocked(e.target.checked)}
                      className="rounded border-border"
                    />
                    Mostrar com cadeado para nao elegiveis
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : isEdit ? 'Salvar Alteracoes' : 'Criar Parceiro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
