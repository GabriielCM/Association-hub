'use client';

import { Bell } from 'lucide-react';
import { NotificationCenter } from '@/components/admin/notifications/NotificationCenter';
import { BroadcastForm } from '@/components/admin/notifications/BroadcastForm';

export default function NotificationsAdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Notificacoes</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie e envie notificacoes para os membros
          </p>
        </div>
      </div>

      {/* Broadcast Form */}
      <BroadcastForm />

      {/* Notification History */}
      <NotificationCenter />
    </div>
  );
}
