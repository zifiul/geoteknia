import { z } from 'zod';

export const createUserFormSchema = z.object({
  fullName: z.string().trim().min(1, 'El nombre es obligatorio').max(200),
  email: z.string().trim().email('Email no válido').max(320),
  roleId: z.string().uuid('Selecciona un rol'),
});

export const updateUserFormSchema = createUserFormSchema;

export type CreateUserFormInput = z.infer<typeof createUserFormSchema>;
export type UpdateUserFormInput = z.infer<typeof updateUserFormSchema>;
