import { z } from "zod";

export const movementRangeSchema = z
  .object({
    from: z.union([z.literal(""), z.iso.date("Ingresá una fecha válida.")]),
    to: z.union([z.literal(""), z.iso.date("Ingresá una fecha válida.")]),
  })
  .superRefine((range, context) => {
    if (range.from && range.to && range.from > range.to) {
      context.addIssue({
        code: "custom",
        message: "La fecha de inicio debe ser anterior o igual a la fecha de fin.",
        path: ["to"],
      });
    }
  });
