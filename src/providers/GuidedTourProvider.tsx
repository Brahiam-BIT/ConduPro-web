import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { GuidedTourOverlay } from '@/components/tour/GuidedTourOverlay';
import { getGuidedTourForPath, type GuidedTourStep } from '@/constants/guidedTours';

interface GuidedTourContextValue {
  isActive: boolean;
  stepIndex: number;
  steps: GuidedTourStep[];
  startTour: () => void;
  closeTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  hasTourForCurrentPage: boolean;
}

const GuidedTourContext = createContext<GuidedTourContextValue | null>(null);

export function GuidedTourProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const tourDef = getGuidedTourForPath(pathname);
  const steps = tourDef?.steps ?? [];

  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const closeTour = useCallback(() => {
    setIsActive(false);
    setStepIndex(0);
  }, []);

  const startTour = useCallback(() => {
    if (steps.length === 0) return;
    setStepIndex(0);
    setIsActive(true);
  }, [steps.length]);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      if (i >= steps.length - 1) {
        setIsActive(false);
        return 0;
      }
      return i + 1;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const value = useMemo(
    () => ({
      isActive,
      stepIndex,
      steps,
      startTour,
      closeTour,
      nextStep,
      prevStep,
      hasTourForCurrentPage: steps.length > 0,
    }),
    [isActive, stepIndex, steps, startTour, closeTour, nextStep, prevStep],
  );

  return (
    <GuidedTourContext.Provider value={value}>
      {children}
      <GuidedTourOverlay />
    </GuidedTourContext.Provider>
  );
}

export function useGuidedTour(): GuidedTourContextValue {
  const ctx = useContext(GuidedTourContext);
  if (!ctx) {
    throw new Error('useGuidedTour debe usarse dentro de GuidedTourProvider');
  }
  return ctx;
}
