export const DEMO_STORAGE_KEY = "la-plaza-demo-state";
export const DEMO_STORAGE_VERSION = 1;
export const DEMO_CAPACITY = 80;
export const DEMO_CURRENCY = "ARS";
export const DEMO_LOCALE = "es-AR";

export const DEMO_MESSAGES = {
  invalidPlate: "Ingresá al menos una letra o un número de patente.",
  noOpenShift: "No hay un turno abierto para registrar esta operación.",
  missingStay: "La estadía seleccionada ya no está activa.",
  invalidPayment: "Revisá el importe y el medio de pago seleccionado.",
  insufficientCash: "El efectivo recibido no alcanza para cubrir el total.",
  invalidCash: "Ingresá un importe válido para el arqueo o ajuste.",
  invalidReason: "Ingresá el motivo del ajuste de caja.",
  insufficientDrawer: "El egreso supera el efectivo disponible en caja.",
  cashCountRequired: "Registrá un arqueo actualizado antes de cerrar el turno.",
} as const;
