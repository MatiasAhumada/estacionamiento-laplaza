import { z } from "zod";

export const plateFragmentSchema = z
  .string()
  .transform((plateFragment) => plateFragment.trim().toUpperCase())
  .pipe(z.string().regex(/^[A-Z0-9]+$/));

export function normalizePlateFragment(plateFragment: string): string {
  return plateFragment.trim().toUpperCase();
}

export function isValidPlateFragment(plateFragment: string): boolean {
  return plateFragmentSchema.safeParse(plateFragment).success;
}
