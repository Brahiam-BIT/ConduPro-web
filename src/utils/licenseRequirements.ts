import type { LicenseCategory } from '@/types/curriculum.types';

/** Texto legible de requisitos para obtener la licencia. */
export function formatLicenseRequirements(category: LicenseCategory): {
  theoryLabel: string;
  practiceLabel: string;
  theoryDetail: string;
  practiceDetail: string;
  isTheoryReady: boolean;
  isPracticeConfigured: boolean;
} {
  const activeTopics = category.topicCount;
  const theoryLabel = category.requiresAllTheoryTopics
    ? 'Todos los temas teóricos activos'
    : 'Temario teórico (parcial)';
  const theoryDetail =
    activeTopics === 0
      ? 'Aún no hay temas activos en el temario. Agrégalos antes de matricular estudiantes.'
      : category.requiresAllTheoryTopics
        ? `Completar ${activeTopics} tema${activeTopics === 1 ? '' : 's'} del temario (clases teóricas en grupo).`
        : `Completar el temario teórico configurado (${activeTopics} tema${activeTopics === 1 ? '' : 's'} activos).`;

  const practiceSessions = category.requiredPracticeSessions;
  const practiceLabel = `${practiceSessions} clase${practiceSessions === 1 ? '' : 's'} práctica${practiceSessions === 1 ? '' : 's'}`;
  const practiceDetail =
    practiceSessions === 0
      ? 'Define cuántas clases prácticas (1 estudiante) se exigen para esta licencia.'
      : `Completar ${practiceSessions} clase${practiceSessions === 1 ? '' : 's'} práctica${practiceSessions === 1 ? '' : 's'} individuales (vehículo + instructor).`;

  return {
    theoryLabel,
    practiceLabel,
    theoryDetail,
    practiceDetail,
    isTheoryReady: activeTopics > 0,
    isPracticeConfigured: practiceSessions > 0,
  };
}
