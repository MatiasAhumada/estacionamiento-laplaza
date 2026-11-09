import type { DemoStayCategory, DemoTariff } from "./demo.types";

export interface DemoStayPrice {
  billableMinutes: number;
  blocks: number;
  fractionMinutes: number;
  tariffPerFractionCents: number;
  totalCents: number;
}

export function calculateStayPrice(
  enteredAt: string,
  exitedAt: string,
  tariff: DemoTariff,
): DemoStayPrice | null {
  const enteredTime = Date.parse(enteredAt);
  const exitedTime = Date.parse(exitedAt);

  if (!Number.isFinite(enteredTime) || !Number.isFinite(exitedTime)) {
    return null;
  }

  const elapsedMinutes = (exitedTime - enteredTime) / 60_000;

  if (elapsedMinutes < 0 || tariff.fractionMinutes < 1 || tariff.hourlyCents < 0) {
    return null;
  }

  const billableMinutes = Math.max(1, Math.ceil(elapsedMinutes));

  const tariffPerFractionCents = Math.ceil(
    (tariff.hourlyCents * tariff.fractionMinutes) / 60,
  );
  const blocks = Math.ceil(billableMinutes / tariff.fractionMinutes);

  return {
    billableMinutes,
    blocks,
    fractionMinutes: tariff.fractionMinutes,
    tariffPerFractionCents,
    totalCents: blocks * tariffPerFractionCents,
  };
}

export function findTariff(
  tariffs: DemoTariff[],
  category: DemoStayCategory,
): DemoTariff | undefined {
  return tariffs.find((tariff) => tariff.category === category);
}
