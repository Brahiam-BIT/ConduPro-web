import type { LicenseGroup } from '@/types/curriculum.types';

export const LICENSE_GROUP_LABELS: Record<LicenseGroup, string> = {
  A: 'Categoría A — Motocicletas',
  B: 'Categoría B — Servicio particular',
  C: 'Categoría C — Servicio público',
};

export const LICENSE_GROUP_ORDER: LicenseGroup[] = ['A', 'B', 'C'];
