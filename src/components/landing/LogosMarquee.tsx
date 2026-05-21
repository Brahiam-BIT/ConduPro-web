/**
 * LogosMarquee — banda minimalista de "marcas asociadas" en loop.
 *
 * Implementación CSS pura: dos copias del listado fluyendo a la izquierda
 * con `@keyframes` inline. Mask en los bordes para fundir con el fondo.
 */
const SCHOOLS = [
  'AutoAcademia Bogotá',
  'Conduce Medellín',
  'Drive&Go Cali',
  'EscuelaPro',
  'RutaSegura',
  'MotorAcademia',
  'ConduSur',
  'Pista Maestra',
  'CarrilAcademy',
] as const;

export function LogosMarquee() {
  return (
    <section
      aria-label="Escuelas que confían en ConduPro"
      className="overflow-hidden border-y border-border bg-bg-secondary py-12"
    >
      <p className="mb-8 text-center text-sm font-medium text-text-tertiary">
        Confían en ConduPro
      </p>

      <div
        className="relative"
        style={{
          maskImage:
            'linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)',
        }}
      >
        <div className="logos-marquee flex w-max gap-12 will-change-transform">
          {[...SCHOOLS, ...SCHOOLS].map((name, i) => (
            <span
              key={i}
              className="shrink-0 text-xl font-semibold tracking-tight text-text-tertiary"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .logos-marquee {
          animation: marquee-scroll 32s linear infinite;
        }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .logos-marquee { animation: none; }
        }
      `}</style>
    </section>
  );
}

export default LogosMarquee;
