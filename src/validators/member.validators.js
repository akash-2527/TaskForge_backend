import { z } from 'zod';

export const addMemberSchema = z
  .object({
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
  })
  .strict();

export const updateMemberRoleSchema = z
  .object({
    role: z.enum(['ADMIN', 'MEMBER'], {
      errorMap: () => ({ message: 'Role must be ADMIN or MEMBER' }),
    }),
  })
  .strict();
