"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AuditReceipt } from "@/features/estacionamiento/components/audit-receipt";
import { useDemoState } from "@/features/estacionamiento/demo/demo-provider";
import type { DemoAudit } from "@/features/estacionamiento/domain/demo.types";
import { selectActiveShift } from "@/features/estacionamiento/domain/selectors";

export function EmployeeAuditDialog() {
  const { state, runDemoOperation } = useDemoState();
  const activeShift = selectActiveShift(state);
  const [open, setOpen] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState<string | undefined>();
  const [error, setError] = useState("");
  const selectedAudit = state.audits.find((audit) => audit.id === selectedAuditId) ?? state.audits.at(-1);

  function emitAudit(): void {
    const result = runDemoOperation({ type: "create-audit" });
    if (!result.success) {
      setError(result.message);
      return;
    }
    const newestAudit: DemoAudit | undefined = result.state.audits.at(-1);
    if (newestAudit) setSelectedAuditId(newestAudit.id);
    setError("");
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild><Button className="min-h-11 w-full border-white/35 bg-white text-primary hover:bg-sky-50 sm:w-auto" disabled={!activeShift} variant="outline">Auditoría de playa</Button></DialogTrigger>
      <DialogContent className="max-h-[min(92dvh,54rem)] max-w-3xl overflow-y-auto rounded-2xl p-4 sm:max-w-3xl sm:p-6">
        <DialogHeader><DialogTitle className="font-display text-xl font-bold text-primary">Auditoría de playa</DialogTitle><DialogDescription>Emití una captura inmutable de las estadías activas o consultá y reimprimí auditorías anteriores.</DialogDescription></DialogHeader>
        <div className="grid gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="grid gap-1 text-sm font-medium" htmlFor="audit-record">Auditoría guardada
              <select className="min-h-11 rounded-xl border border-input bg-background px-3 text-sm" id="audit-record" onChange={(event) => setSelectedAuditId(event.target.value)} value={selectedAudit?.id ?? "none"}>
                {state.audits.length === 0 ? <option value="none">Sin auditorías anteriores</option> : null}
                {[...state.audits].toReversed().map((audit) => <option key={audit.id} value={audit.id}>#{audit.number} · {new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeZone: "America/Argentina/Buenos_Aires", timeStyle: "short" }).format(new Date(audit.createdAt))}</option>)}
              </select>
            </label>
            <Button className="min-h-11" disabled={!activeShift} onClick={emitAudit} type="button" variant="action">Emitir auditoría actual</Button>
          </div>
          {!activeShift ? <p className="rounded-xl border border-warning/50 bg-warning/15 p-3 text-sm">Abrí un turno para habilitar nuevas auditorías. Las capturas guardadas siguen disponibles.</p> : null}
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
          {selectedAudit ? <Card className="rounded-2xl shadow-none"><CardContent className="p-4 sm:p-5"><AuditReceipt audit={selectedAudit} shift={state.shifts.find((shift) => shift.id === selectedAudit.shiftId)} printable /></CardContent></Card> : <p className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">Todavía no hay auditorías guardadas.</p>}
          {selectedAudit ? <Button className="min-h-11 w-full sm:w-fit" onClick={() => window.print()} type="button" variant="outline">Imprimir o guardar PDF</Button> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
