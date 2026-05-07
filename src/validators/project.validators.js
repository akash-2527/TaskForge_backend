import { z } from 'zod';

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Project name is required')
      .max(200, 'Project name must not exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .trim()
      .optional()
      .nullable(),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Project name is required')
      .max(200, 'Project name must not exceed 200 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Description must not exceed 2000 characters')
      .trim()
      .optional()
      .nullable(),
    is_archived: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
