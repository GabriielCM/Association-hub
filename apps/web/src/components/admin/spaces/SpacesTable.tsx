'use client';

import Link from 'next/link';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { resolveUploadUrl } from '@/config/constants';
import { SpaceStatusBadge } from './SpaceStatusBadge';
import { SpacePeriodLabel } from './SpacePeriodLabel';
import type { SpaceItem } from '@/lib/api/spaces.api';

interface SpacesTableProps {
  spaces: SpaceItem[];
  onEdit: (space: SpaceItem) => void;
  onDelete: (id: string, name: string) => void;
}

function formatFee(fee: number): string {
  if (fee <= 0) return 'Grátis';
  return `R$ ${(fee / 100).toFixed(2)}`;
}

export function SpacesTable({ spaces, onEdit, onDelete }: SpacesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Espaço</th>
            <th className="px-4 py-3 text-center font-medium">Capacidade</th>
            <th className="px-4 py-3 text-left font-medium">Período</th>
            <th className="px-4 py-3 text-left font-medium">Taxa</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-center font-medium">Reservas</th>
            <th className="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {spaces.map((space) => (
            <tr key={space.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {space.mainImageUrl ? (
                    <img
                      src={resolveUploadUrl(space.mainImageUrl) ?? ''}
                      alt={space.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-lg">
                      🏢
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{space.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {space.description}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-center">{space.capacity}</td>
              <td className="px-4 py-3">
                <SpacePeriodLabel type={space.periodType} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {formatFee(space.fee)}
              </td>
              <td className="px-4 py-3">
                <SpaceStatusBadge status={space.status} />
              </td>
              <td className="px-4 py-3 text-center">
                {space._count?.bookings ?? 0}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/spaces/${space.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(space)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(space.id, space.name)}
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
