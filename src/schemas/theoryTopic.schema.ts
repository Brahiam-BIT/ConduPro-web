import { z } from 'zod';

export const theoryTopicFormSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(160, 'Máximo 160 caracteres'),
  description: z.string().max(2000).optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  sessionCapacity: z.coerce
    .number()
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 estudiante')
    .max(200, 'Máximo 200'),
  estimatedHours: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      const n = Number(val);
      return Number.isNaN(n) ? undefined : n;
    },
    z.number().min(0.5, 'Mínimo 0.5 horas').max(200).optional(),
  ),
});

export type TheoryTopicFormValues = z.infer<typeof theoryTopicFormSchema>;
