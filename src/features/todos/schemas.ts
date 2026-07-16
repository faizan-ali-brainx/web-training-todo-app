import { z } from 'zod';

export const todoFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
});
export type TodoFormValues = z.infer<typeof todoFormSchema>;
