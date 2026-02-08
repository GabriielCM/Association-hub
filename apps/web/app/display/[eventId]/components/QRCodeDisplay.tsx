'use client';

import { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  data: {
    type: string;
    event_id: string;
    checkin_number: number;
    security_token: string;
    timestamp: number;
    expires_at: number;
  };
}

export function QRCodeDisplay({ data }: QRCodeDisplayProps) {
  const qrContent = useMemo(() => JSON.stringify(data), [data]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flex items-center justify-center rounded-2xl bg-white p-6 shadow-2xl"
        style={{ width: 400, height: 400 }}
      >
        <QRCodeSVG
          value={qrContent}
          size={340}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
    </div>
  );
}
