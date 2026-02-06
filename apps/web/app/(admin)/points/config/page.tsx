'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui';
import { usePointsConfig, useUpdateConfig } from '@/lib/hooks/useAdminPoints';

export default function PointsConfigPage() {
  const { data: config, isLoading } = usePointsConfig();
  const updateConfig = useUpdateConfig();
  const [sources, setSources] = useState(config?.sources ?? []);
  const [pointsToMoneyRate, setPointsToMoneyRate] = useState(config?.pointsToMoneyRate ?? 0.5);
  const [dailyLimitKm, setDailyLimitKm] = useState(config?.strava?.dailyLimitKm ?? 5);

  useEffect(() => {
    if (config) {
      setSources(config.sources);
      setPointsToMoneyRate(config.pointsToMoneyRate);
      setDailyLimitKm(config.strava.dailyLimitKm);
    }
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate({
      sources: sources.map((s) => ({
        type: s.type,
        isActive: s.isActive,
        defaultPoints: s.defaultPoints,
        pointsPerKm: s.pointsPerKm,
        points: s.points,
      })),
      strava: {
        dailyLimitKm,
        eligibleActivities: config?.strava.eligibleActivities ?? [],
      },
      pointsToMoneyRate,
    });
  };

  const toggleSource = (index: number) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    setSources(updated);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configuracao de Pontos</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuracao de Pontos</h1>
          <p className="text-muted-foreground">Gerencie as fontes de pontos e configuracoes globais</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateConfig.isPending}
        >
          {updateConfig.isPending ? 'Salvando...' : 'Salvar alteracoes'}
        </Button>
      </div>

      {/* Sources */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Fontes de Pontos</h2>
        <div className="space-y-4">
          {sources.map((source, i) => (
            <div
              key={source.type}
              className="flex items-center justify-between border-b border-border pb-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleSource(i)}
                  className={`h-5 w-10 rounded-full transition-colors ${
                    source.isActive ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white transition-transform ${
                      source.isActive ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <div>
                  <span className="font-medium">{source.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">({source.type})</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {source.defaultPoints !== undefined && (
                  <input
                    type="number"
                    value={source.defaultPoints}
                    onChange={(e) => {
                      const updated = [...sources];
                      updated[i] = { ...updated[i], defaultPoints: parseInt(e.target.value) || 0 };
                      setSources(updated);
                    }}
                    className="w-20 rounded border border-border bg-background px-2 py-1 text-sm"
                  />
                )}
                {source.pointsPerKm !== undefined && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={source.pointsPerKm}
                      onChange={(e) => {
                        const updated = [...sources];
                        updated[i] = { ...updated[i], pointsPerKm: parseFloat(e.target.value) || 0 };
                        setSources(updated);
                      }}
                      className="w-20 rounded border border-border bg-background px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">pts/km</span>
                  </div>
                )}
                {source.points !== undefined && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={source.points}
                      onChange={(e) => {
                        const updated = [...sources];
                        updated[i] = { ...updated[i], points: parseInt(e.target.value) || 0 };
                        setSources(updated);
                      }}
                      className="w-20 rounded border border-border bg-background px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">pts</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Config */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Configuracao Global</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Taxa pontos/dinheiro (1 pt = R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={pointsToMoneyRate}
              onChange={(e) => setPointsToMoneyRate(parseFloat(e.target.value) || 0)}
              className="w-full rounded border border-border bg-background px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Limite diario Strava (km)
            </label>
            <input
              type="number"
              step="0.5"
              value={dailyLimitKm}
              onChange={(e) => setDailyLimitKm(parseFloat(e.target.value) || 0)}
              className="w-full rounded border border-border bg-background px-3 py-2"
            />
          </div>
        </div>
      </div>

      {updateConfig.isSuccess && (
        <p className="text-sm text-green-600">Configuracao salva com sucesso!</p>
      )}
      {updateConfig.isError && (
        <p className="text-sm text-red-600">Erro ao salvar: {updateConfig.error.message}</p>
      )}
    </div>
  );
}
