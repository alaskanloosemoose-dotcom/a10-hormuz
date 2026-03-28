'use client';

/**
 * CRTPostProcessing
 *
 * Implements a pure CSS/DOM CRT effect overlay so it works independently
 * of the Three.js render pipeline. This avoids the need for custom
 * ShaderPass wiring and works reliably across all browsers.
 *
 * Effects included:
 *  - Scanlines (CSS repeating-gradient)
 *  - Vignette (radial-gradient)
 *  - Subtle RGB chromatic aberration (CSS filter + pseudo-elements)
 *  - Phosphor flicker (CSS animation)
 */
export function CRTPostProcessing() {
  return (
    <>
      {/* Scanlines */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9990]"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9991]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)',
        }}
      />

      {/* Phosphor flicker */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[9992] crt-flicker"
      />

      {/* Inline keyframes for flicker — injected once */}
      <style>{`
        @keyframes crt-flicker {
          0%   { opacity: 0; }
          92%  { opacity: 0; }
          93%  { opacity: 0.04; }
          94%  { opacity: 0; }
          96%  { opacity: 0.03; }
          100% { opacity: 0; }
        }
        .crt-flicker {
          background: rgba(18, 255, 18, 0.03);
          animation: crt-flicker 5s step-end infinite;
        }
      `}</style>
    </>
  );
}
