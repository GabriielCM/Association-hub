'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/config/constants';

export default function PdvDisplaySetupPage() {
  const { pdvId } = useParams<{ pdvId: string }>();
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim() || !apiSecret.trim()) {
      setError('Preencha ambos os campos.');
      return;
    }

    setTesting(true);

    try {
      // Test credentials by fetching products
      const res = await fetch(`${API_URL}/pdv/${pdvId}/products`, {
        headers: {
          'x-pdv-api-key': apiKey.trim(),
          'x-pdv-api-secret': apiSecret.trim(),
        },
      });

      if (!res.ok) {
        throw new Error('Credenciais invalidas ou PDV nao encontrado.');
      }

      // Store credentials in localStorage
      localStorage.setItem(
        `pdv-display-${pdvId}`,
        JSON.stringify({ apiKey: apiKey.trim(), apiSecret: apiSecret.trim() })
      );

      // Navigate to display
      router.replace(`/display/pdv/${pdvId}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao validar credenciais.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Configurar Display PDV</h1>
          <p className="mt-2 text-sm text-gray-400">
            Insira as credenciais de API do PDV para ativar o display.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="pdv_..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              API Secret
            </label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Secret do PDV"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={testing}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Validando...' : 'Ativar Display'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          As credenciais podem ser obtidas no painel administrativo do PDV.
        </p>
      </div>
    </div>
  );
}
