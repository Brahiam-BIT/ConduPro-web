import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { LogosMarquee } from '@/components/landing/LogosMarquee';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { RolesSection } from '@/components/landing/RolesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CtaFinalSection } from '@/components/landing/CtaFinalSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { ROLE_DEFAULT_ROUTE } from '@/constants/routes';
import type { Role } from '@/constants/roles';

/**
 * LandingPage — página pública en `/`.
 *
 * Apple-minimal: blanco, gris y un único acento azul. El hero es la única
 * sección con 3D / scroll-driven motion; el resto es tipografía y micro-animaciones
 * Framer Motion sobre fondo blanco/gris.
 *
 * Si el usuario está autenticado, redirige a su dashboard por rol.
 */
export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      const target = ROLE_DEFAULT_ROUTE[user.role as Role];
      navigate(target, { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <LandingNav />
      <main>
        <HeroSection />
        <LogosMarquee />
        <FeaturesSection />
        <ShowcaseSection />
        <RolesSection />
        <StatsSection />
        <CtaFinalSection />
      </main>
      <LandingFooter />
    </div>
  );
}
