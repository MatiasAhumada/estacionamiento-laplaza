"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDemoState } from "@/features/estacionamiento/demo/demo-provider";

export function DemoResetControl() {
  const { resetDemo } = useDemoState();
  const [isOpen, setIsOpen] = useState(false);

  function resetSession(): void {
    resetDemo();
    setIsOpen(false);
  }

  return (
    <>
      <Button
        className="min-h-11 whitespace-nowrap rounded-xl px-3 sm:px-4"
        onClick={() => setIsOpen(true)}
        type="button"
        variant="outline"
      >
        Reiniciar demo
      </Button>
      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-primary">
              ¿Reiniciar esta sesión?
            </DialogTitle>
            <DialogDescription>
              Se restaurarán los datos de ejemplo y se perderán los movimientos de esta sesión de demostración.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row">
            <Button
              className="min-h-11 rounded-xl"
              onClick={() => setIsOpen(false)}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              className="min-h-11 rounded-xl"
              onClick={resetSession}
              type="button"
              variant="action"
            >
              Reiniciar datos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
