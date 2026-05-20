import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const vehicleFormSchema = z.object({
  plate: z
    .string()
    .min(1, 'La placa es obligatoria')
    .min(5, 'Mínimo 5 caracteres')
    .max(10, 'Máximo 10 caracteres')
    .transform((v) => v.toUpperCase().trim()),
  brand: z.string().min(1, 'La marca es obligatoria').min(2, 'Mínimo 2 caracteres'),
  model: z.string().min(1, 'El modelo es obligatorio').min(2, 'Mínimo 2 caracteres'),
  year: z.coerce
    .number({ invalid_type_error: 'Año inválido' })
    .int('Debe ser un año entero')
    .min(1990, 'Año mínimo 1990')
    .max(currentYear + 1, `Año máximo ${currentYear + 1}`),
  available: z.boolean(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
