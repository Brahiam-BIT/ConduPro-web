import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .min(2, 'Mínimo 2 caracteres')
      .max(50, 'Máximo 50 caracteres'),
    lastName: z
      .string()
      .min(1, 'El apellido es obligatorio')
      .min(2, 'Mínimo 2 caracteres')
      .max(50, 'Máximo 50 caracteres'),
    email: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo válido'),
    phone: z
      .string()
      .min(1, 'El teléfono es obligatorio')
      .transform((v) => v.replace(/\D/g, ''))
      .pipe(z.string().min(10, 'Ingresa un teléfono válido (mín. 10 dígitos)').max(15, 'Teléfono demasiado largo')),
    password: z
      .string()
      .min(1, 'La contraseña es obligatoria')
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[a-z]/, 'Debe incluir una minúscula')
      .regex(/[A-Z]/, 'Debe incluir una mayúscula')
      .regex(/[0-9]/, 'Debe incluir un número'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
