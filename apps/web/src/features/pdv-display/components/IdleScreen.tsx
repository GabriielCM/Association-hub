'use client';

interface IdleScreenProps {
  onStart: () => void;
  pdvName?: string | undefined;
  logoUrl?: string;
}

/**
 * Full-screen idle/attract screen displayed when the PDV kiosk is inactive.
 *
 * Features a pulsing "Toque para comecar" prompt with a dark gradient
 * background. Any click or touch triggers the `onStart` callback to
 * transition into the catalog browsing flow.
 */
export function IdleScreen({ onStart, pdvName, logoUrl }: IdleScreenProps) {
  return (
    <button
      type="button"
      onClick={onStart}
      onTouchStart={onStart}
      className="flex min-h-screen w-full cursor-pointer flex-col items-center justify-center bg-gradient-to-b from-dark-background via-[#1e1e3a] to-dark-background focus:outline-none"
      aria-label="Toque para comecar"
    >
      {/* Logo or PDV name at top */}
      <div className="absolute top-16 flex flex-col items-center gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={pdvName ?? 'Logo'}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : null}
        {pdvName ? (
          <h2 className="text-xl font-semibold tracking-wide text-gray-400">
            {pdvName}
          </h2>
        ) : null}
      </div>

      {/* Centered pulsing prompt */}
      <div className="flex flex-col items-center gap-8">
        {/* Decorative ring */}
        <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-primary/30">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-primary/50">
            <svg
              className="h-12 w-12 text-primary"
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

        <p className="animate-pulse text-4xl font-light tracking-widest text-white/90 md:text-5xl">
          Toque para comecar
        </p>

        <p className="text-lg text-gray-500">
          Navegue e faca seu pedido
        </p>
      </div>
    </button>
  );
}
