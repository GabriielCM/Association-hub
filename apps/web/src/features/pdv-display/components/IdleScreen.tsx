'use client';

interface IdleScreenProps {
  onStart: () => void;
  pdvName?: string | undefined;
  logoUrl?: string;
}

/**
 * Full-screen idle/attract screen with floating orb animation and a
 * glowing CTA. Any touch triggers `onStart` to enter the catalog.
 */
export function IdleScreen({ onStart, pdvName, logoUrl }: IdleScreenProps) {
  return (
    <button
      type="button"
      onClick={onStart}
      onTouchStart={onStart}
      className="relative flex min-h-screen w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-dark-background focus:outline-none"
      aria-label="Toque para começar"
    >
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0">
        {/* Orb 1 - Large purple */}
        <div
          className="absolute animate-float-orb rounded-full"
          style={{
            width: 400,
            height: 400,
            top: '10%',
            left: '15%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '20s',
          }}
        />
        {/* Orb 2 - Blue */}
        <div
          className="absolute animate-float-orb rounded-full"
          style={{
            width: 350,
            height: 350,
            top: '50%',
            right: '10%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '25s',
            animationDelay: '-5s',
          }}
        />
        {/* Orb 3 - Indigo */}
        <div
          className="absolute animate-float-orb rounded-full"
          style={{
            width: 300,
            height: 300,
            bottom: '10%',
            left: '40%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '22s',
            animationDelay: '-10s',
          }}
        />
        {/* Orb 4 - Cyan accent */}
        <div
          className="absolute animate-float-orb rounded-full"
          style={{
            width: 250,
            height: 250,
            top: '30%',
            left: '60%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '18s',
            animationDelay: '-8s',
          }}
        />
        {/* Orb 5 - Small pink */}
        <div
          className="absolute animate-float-orb rounded-full"
          style={{
            width: 200,
            height: 200,
            bottom: '30%',
            right: '25%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '15s',
            animationDelay: '-3s',
          }}
        />
      </div>

      {/* Logo / PDV name - top */}
      <div className="absolute top-16 z-10 flex flex-col items-center gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={pdvName ?? 'Logo'}
            className="h-20 w-20 rounded-full object-cover shadow-glow-purple-sm"
          />
        ) : null}
        {pdvName ? (
          <h2 className="text-xl font-semibold tracking-wide text-white/60">
            {pdvName}
          </h2>
        ) : null}
      </div>

      {/* Center CTA */}
      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Glowing ring */}
        <div className="animate-pulse-glow flex h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <svg
              className="h-14 w-14 text-white/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-3">
          <p className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-5xl font-light tracking-widest text-transparent">
            Toque para começar
          </p>
          <p className="text-lg text-white/40">
            Navegue e faça seu pedido
          </p>
        </div>
      </div>
    </button>
  );
}
