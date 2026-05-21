import { Stepper } from '@/components/ui/Stepper';

const STEPS = [
  { id: 'type', title: 'Tipo de clase', description: 'Teórica o práctica' },
  { id: 'schedule', title: 'Horario', description: 'Elige cuándo' },
];

interface BookClassStepperProps {
  currentStep: number;
}

export function BookClassStepper({ currentStep }: BookClassStepperProps) {
  return <Stepper steps={STEPS} currentStep={currentStep} />;
}
