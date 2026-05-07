import { z } from 'zod';

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Task title is required')
      .max(200, 'Title must not exceed 200 characters')
      .trim(),
    description: z
      .string()
      .max(5000, 'Description must not exceed 5000 characters')
      .trim()
      .optional()
      .nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    due_date: z
      .string()
      .datetime({ message: 'Invalid date format. Use ISO 8601.' })
      .optional()
      .nullable(),
    assigned_to: z
      .string()
      .uuid('Invalid user ID format')
      .optional()
      .nullable(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Task title cannot be empty')
      .max(200, 'Title must not exceed 200 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(5000, 'Description must not exceed 5000 characters')
      .trim()
      .optional()
      .nullable(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    due_date: z
      .string()
      .datetime({ message: 'Invalid date format. Use ISO 8601.' })
      .optional()
      .nullable(),
    assigned_to: z
      .string()
      .uuid('Invalid user ID format')
      .optional()
      .nullable(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const updateTaskStatusSchema = z
  .object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
      errorMap: () => ({ message: 'Status must be TODO, IN_PROGRESS, or DONE' }),
    }),
  })
  .strict();

export const taskQuerySchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  assigned_to: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .refine((n) => n <= 100, 'Limit cannot exceed 100')
    .default('20'),
});
