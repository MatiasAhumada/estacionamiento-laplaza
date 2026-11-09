import { z } from "zod";

export const staySearchSchema = z
  .string()
  .transform((plateFragment) => plateFragment.trim().toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9]*$/));
