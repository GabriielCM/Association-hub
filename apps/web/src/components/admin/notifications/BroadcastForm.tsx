'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useSendBroadcast } from '@/lib/hooks/useAdminNotifications';

const CATEGORY_OPTIONS = [
  { value: 'SYSTEM', label: 'Sistema' },
  { value: 'EVENTS', label: 'Eventos' },
  { value: 'POINTS', label: 'Pontos' },
  { value: 'SOCIAL', label: 'Social' },
];

const AUDIENCE_OPTIONS = [
  { value: 'ALL', label: 'Todos os membros' },
  { value: 'SUBSCRIBERS', label: 'Apenas assinantes' },
  { value: 'NON_SUBSCRIBERS', label: 'Não assinantes' },
];

export function BroadcastForm() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('SYSTEM');
  const [audience, setAudience] = useState('ALL');
  const [showPreview, setShowPreview] = useState(false);

  const sendBroadcast = useSendBroadcast();

  const handleSend = () => {
    if (!title.trim() || !body.trim()) return;

    sendBroadcast.mutate(
      {
        title: title.trim(),
        body: body.trim(),
        category,
        targetAudience: audience as 'ALL' | 'SUBSCRIBERS' | 'NON_SUBSCRIBERS',
      },
      {
        onSuccess: (result) => {
          setTitle('');
          setBody('');
          setShowPreview(false);
          alert(`Notificacao enviada para ${result.sent} usuarios!`);
        },
        onError: (error) => {
          alert(`Erro ao enviar: ${error.message}`);
        },
      }
    );
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">Enviar Notificacao</h3>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Titulo</label>
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Titulo da notificacao..."
            maxLength={100}
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            {title.length}/100
          </span>
        </div>

        {/* Body */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Mensagem</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Corpo da notificacao..."
            maxLength={500}
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            {body.length}/500
          </span>
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Audience */}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Publico alvo</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {AUDIENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        {showPreview && title && body && (
          <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Preview
            </p>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Categoria: {CATEGORY_OPTIONS.find((c) => c.value === category)?.label} |
              Publico: {AUDIENCE_OPTIONS.find((a) => a.value === audience)?.label}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            disabled={!title || !body}
          >
            {showPreview ? 'Ocultar preview' : 'Preview'}
          </Button>
          <Button
            onClick={handleSend}
            disabled={!title.trim() || !body.trim() || sendBroadcast.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {sendBroadcast.isPending ? 'Enviando...' : 'Enviar broadcast'}
          </Button>
        </div>
      </div>
    </div>
  );
}
