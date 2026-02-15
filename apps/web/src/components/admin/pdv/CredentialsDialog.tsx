'use client';

import { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui';

interface CredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: { apiKey: string; apiSecret: string } | null;
}

export function CredentialsDialog({
  open,
  onOpenChange,
  credentials,
}: CredentialsDialogProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const copyToClipboard = async (text: string, type: 'key' | 'secret') => {
    await navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  if (!credentials) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credenciais do PDV</DialogTitle>
          <DialogDescription>
            Salve estas credenciais agora. O API Secret nao sera exibido
            novamente.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-medium">
              Guarde o API Secret em local seguro!
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">API Key</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border bg-muted p-2 text-xs break-all">
                {credentials.apiKey}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(credentials.apiKey, 'key')}
              >
                {copiedKey ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">API Secret</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border bg-muted p-2 text-xs break-all">
                {credentials.apiSecret}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(credentials.apiSecret, 'secret')}
              >
                {copiedSecret ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Entendi, fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
