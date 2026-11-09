import { z } from "zod";

export const receivedCashSchema = z
  .string()
  .trim()
  .regex(/^\d+(?:[,.]\d{1,2})?$/, "Ingresá un importe válido, con hasta dos decimales.")
  .transform((amount) => {
    const normalizedAmount = amount.replace(",", ".");
    const [wholeUnits = "0", fractionalUnits = ""] = normalizedAmount.split(".");
    const cents = Number(wholeUnits) * 100 + Number(fractionalUnits.padEnd(2, "0"));

    return cents;
  })
  .refine(Number.isSafeInteger, "El importe es demasiado grande.")
  .pipe(z.number().int().positive("El efectivo recibido debe ser mayor que cero."));
