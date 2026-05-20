import { z } from 'zod';
import { ROLES } from '@/constants/roles';

const roleEnum = z.enum([ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN]);

export const userFormSchema = z
  .object({
    firstName: z.string().min(1, 'El nombre es obligatorio').min(2, 'Mínimo 2 caracteres'),
    lastName: z.string().min(1, 'El apellido es obligatorio').min(2, 'Mínimo 2 caracteres'),
    email: z.string().min(1, 'El correo es obligatorio').email('Correo inválido'),
    phone: z.string().optional(),
    role: roleEnum,
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== undefined && data.password.length > 0 && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La contraseña debe tener al menos 8 caracteres',
        path: ['password'],
      });
    }
  });

export type UserFormValues = z.infer<typeof userFormSchema>;

export const userCreateSchema = userFormSchema.superRefine((data, ctx) => {
  if (!data.password || data.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La contraseña es obligatoria (mín. 8 caracteres)',
      path: ['password'],
    });
  }
});
