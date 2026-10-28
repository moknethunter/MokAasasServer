import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(256),
});

export type LoginInput = z.infer<typeof loginSchema>;

export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', '));
  }
  return result.data;
}
