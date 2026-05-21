/**
 * LogosMarquee — banda de "marcas asociadas" en loop infinito.
 *
 * Implementación CSS: dos copias del listado fluyendo a la izquierda con
 * `animation: marquee` (definida en `tailwind.config.ts`). El gradient mask
 * funde los bordes para que sea armónico con el resto.
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
      className="relative overflow-hidden border-y border-brand-mid/30 bg-brand-dark py-10"
    >
      <p className="mb-6 text-center font-mono-brand text-[11px] uppercase tracking-[0.35em] text-brand-light/55">
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
        <div className="flex w-max animate-marquee gap-14 will-change-transform">
          {[...SCHOOLS, ...SCHOOLS].map((name, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-3 font-hero text-2xl font-semibold tracking-tight text-brand-light/55"
            >
              <span className="size-2 rounded-full bg-gradient-dynamic" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LogosMarquee;
