'use client';

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CheckInsChartProps {
  checkinsByNumber: Array<{ checkinNumber: number; count: number }>;
  checkinTimeline: Array<{ time: string; count: number }>;
  color?: string | undefined;
}

export function CheckInsChart({
  checkinsByNumber,
  checkinTimeline,
  color = '#6366F1',
}: CheckInsChartProps) {
  const barData = checkinsByNumber.map((item) => ({
    name: `Check-in ${item.checkinNumber}`,
    count: item.count,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Check-ins by Number */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="mb-4 text-sm font-semibold text-muted-foreground">
          Check-ins por Numero
        </h4>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                allowDecimals={false}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Nenhum dado disponivel
          </div>
        )}
      </div>

      {/* Check-ins Timeline */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="mb-4 text-sm font-semibold text-muted-foreground">
          Timeline de Check-ins
        </h4>
        {checkinTimeline.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={checkinTimeline}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                allowDecimals={false}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={color}
                fill={`${color}33`}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Nenhum dado disponivel
          </div>
        )}
      </div>
    </div>
  );
}
