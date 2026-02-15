'use client';

import Link from 'next/link';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { PdvStatusBadge } from './PdvStatusBadge';
import type { PdvItem } from '@/lib/api/pdv.api';

interface PdvsTableProps {
  pdvs: PdvItem[];
  onEdit: (pdv: PdvItem) => void;
  onDelete: (id: string, name: string) => void;
}

export function PdvsTable({ pdvs, onEdit, onDelete }: PdvsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Nome</th>
            <th className="px-4 py-3 text-left font-medium">Localizacao</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-center font-medium">Produtos</th>
            <th className="px-4 py-3 text-left font-medium">API Key</th>
            <th className="px-4 py-3 text-right font-medium">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {pdvs.map((pdv) => (
            <tr key={pdv.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{pdv.name}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {pdv.location}
              </td>
              <td className="px-4 py-3">
                <PdvStatusBadge status={pdv.status} />
              </td>
              <td className="px-4 py-3 text-center">
                {pdv.productsCount ?? '-'}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {pdv.apiKey ? `${pdv.apiKey.slice(0, 12)}...` : '-'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/pdv/${pdv.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(pdv)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(pdv.id, pdv.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
