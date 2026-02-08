'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDisplayWebSocket } from '@/features/display/hooks/useDisplayWebSocket';
import { QRCodeDisplay } from './components/QRCodeDisplay';

export default function DisplayPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = params;
  const { data, isConnected, error } = useDisplayWebSocket(eventId);

  // Banner rotation (every 10 seconds) with crossfade
  const banners = useMemo(
    () => data?.event.bannerDisplay ?? [],
    [data?.event.bannerDisplay]
  );
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Reset index if banners array shrinks
  useEffect(() => {
    if (banners.length > 0 && currentBannerIndex >= banners.length) {
      setCurrentBannerIndex(0);
    }
  }, [banners.length, currentBannerIndex]);

  // Loading state
  if (!data && !error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="mb-4 text-6xl">📡</div>
          <p className="text-xl">Carregando display...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="mb-4 text-6xl">⚠️</div>
          <p className="text-xl">{error}</p>
          <p className="mt-2 text-sm text-white/60">
            Tentando reconectar...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { event, association, currentCheckin, qrCode, stats } = data;
  const eventColor = event.color || '#6366F1';

  // CANCELED state
  if (event.status === 'CANCELED') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="mb-4 text-6xl">❌</div>
          <p className="text-3xl font-bold">Evento Cancelado</p>
          <p className="mt-2 text-xl text-white/60">
            Desculpe pelo inconveniente.
          </p>
        </div>
      </div>
    );
  }

  // ENDED state
  if (event.status === 'ENDED') {
    return (
      <div
        className="flex h-screen w-screen flex-col items-center justify-center"
        style={{ backgroundColor: eventColor }}
      >
        <div className="text-center text-white">
          <div className="mb-4 text-6xl">🎉</div>
          <p className="text-3xl font-bold">Evento Encerrado</p>
          <p className="mt-2 text-xl text-white/80">
            Obrigado pela participacao!
          </p>
          <p className="mt-4 text-4xl font-bold">
            {stats.totalCheckIns} check-ins realizados
          </p>
        </div>
      </div>
    );
  }

  // PAUSED state
  if (event.isPaused) {
    return (
      <div
        className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: eventColor }}
      >
        {banners.map((url, i) => (
          <img
            key={url}
            src={url}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === currentBannerIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center text-white">
          <div className="mb-4 text-6xl">⏸️</div>
          <p className="text-3xl font-bold">
            Check-ins temporariamente pausados
          </p>
          <p className="mt-2 text-xl text-white/80">
            Aguarde instrucoes
          </p>
        </div>
        {/* Connection indicator */}
        <div className="absolute bottom-4 right-4 z-10">
          <div
            className={`h-3 w-3 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
        </div>
      </div>
    );
  }

  // SCHEDULED - waiting to start
  if (event.status === 'SCHEDULED' || event.status === 'DRAFT') {
    const startDate = new Date(event.startDate);
    return (
      <div
        className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: eventColor }}
      >
        {banners.map((url, i) => (
          <img
            key={url}
            src={url}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === currentBannerIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white">
          {/* Association name */}
          {association.name && (
            <p className="mb-6 text-lg font-medium text-white/80">
              {association.name}
            </p>
          )}
          <p className="text-4xl font-bold">{event.title}</p>
          <p className="mt-4 text-2xl text-white/80">
            Evento comeca em
          </p>
          <p className="mt-2 text-xl text-white/60">
            {startDate.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}{' '}
            as{' '}
            {startDate.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    );
  }

  // ONGOING - main display with QR code
  return (
    <div
      className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: eventColor }}
    >
      {/* Background banner images with crossfade */}
      {banners.map((url, i) => (
        <img
          key={url}
          src={url}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === currentBannerIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 text-center text-white">
        {/* Association name */}
        {association.name && (
          <p className="text-lg font-medium text-white/80">
            {association.name}
          </p>
        )}

        {/* Event title */}
        <div>
          <h1 className="text-4xl font-bold drop-shadow-lg">
            {event.title}
          </h1>
          <p className="mt-2 text-2xl text-white/80">
            {new Date(event.startDate).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
            })}{' '}
            •{' '}
            {new Date(event.startDate).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            -
            {new Date(event.endDate).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* QR Code */}
        <QRCodeDisplay data={qrCode} />

        {/* Instructions */}
        <div>
          <p className="text-2xl font-medium">
            Escaneie para Check-in
          </p>
          <p className="mt-1 text-xl text-white/80">
            CHECK-IN {currentCheckin.number} de {event.checkinsCount} •{' '}
            <span className="font-bold text-yellow-300">
              +{currentCheckin.points} pontos
            </span>
          </p>
        </div>

        {/* Counter */}
        <p className="text-lg text-white/70">
          ✓ {stats.totalCheckIns} pessoas fizeram check-in
        </p>
      </div>

      {/* Connection indicator */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}
        />
        <span className="text-xs text-white/50">
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}
