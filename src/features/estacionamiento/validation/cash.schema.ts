import { z } from "zod";

const cashAmountSchema = z
  .string()
  .trim()
  .regex(/^\d+(?:[,.]\d{1,2})?$/, "Ingresá un importe válido, con hasta dos decimales.")
  .transform((amount) => {
    const normalizedAmount = amount.replace(",", ".");
    const [wholeUnits = "0", fractionalUnits = ""] = normalizedAmount.split(".");

    return Number(wholeUnits) * 100 + Number(fractionalUnits.padEnd(2, "0"));
  })
  .refine(Number.isSafeInteger, "El importe es demasiado grande.");

export const cashAdjustmentSchema = z.object({
  amount: cashAmountSchema.pipe(z.number().int().positive("El importe debe ser mayor que cero.")),
  reason: z.string().trim().min(1, "Ingresá el motivo del ajuste."),
  direction: z.enum(["in", "out"]),
});

export const cashCountSchema = z.object({
  countedAmount: cashAmountSchema.pipe(z.number().int().nonnegative("El efectivo contado no puede ser negativo.")),
});
