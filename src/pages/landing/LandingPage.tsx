import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider';
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
 * LandingPage — página pública principal en `/`.
 *
 * Orquesta todas las secciones de marketing y monta `SmoothScrollProvider`
 * (Lenis) para el scroll suave. La página entera vive bajo `theme-dynamic`
 * (paleta cyan/violeta sobre fondo `#04020F`).
 *
 * Si el usuario ya está autenticado, se redirige al dashboard que corresponde
 * a su rol.
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
    <SmoothScrollProvider>
      <div className="theme-dynamic min-h-screen bg-brand-dark text-brand-light">
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
    </SmoothScrollProvider>
  );
}
