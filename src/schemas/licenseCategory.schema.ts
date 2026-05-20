import { z } from 'zod';

export const licenseCategoryFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(120),
  description: z.string().min(1, 'La descripción es obligatoria'),
  defaultTheoryCapacity: z.coerce
    .number()
    .int()
    .min(1, 'Mínimo 1')
    .max(200, 'Máximo 200'),
});

export type LicenseCategoryFormValues = z.infer<typeof licenseCategoryFormSchema>;
