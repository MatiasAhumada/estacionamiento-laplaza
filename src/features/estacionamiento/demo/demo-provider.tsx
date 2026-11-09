"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

import { DEMO_SEED_STATE } from "@/constants/demo-fixture.constant";
import type {
  DemoContextValue,
  DemoOperationAction,
  DemoOperationInput,
  DemoOperationResult,
  DemoStorageLoadResult,
  DemoStayCategory,
} from "../domain/demo.types";
import { applyDemoAction, demoReducer } from "../domain/demo.operations";
import { readDemoState, removeDemoState, writeDemoState } from "./demo-storage";

const DemoContext = createContext<DemoContextValue | undefined>(undefined);

export function DemoProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, dispatch] = useReducer(demoReducer, DEMO_SEED_STATE);
  const [isHydrated, markHydrated] = useReducer(() => true, false);
  const [storageStatus, updateStorageStatus] = useReducer(
    (_current: DemoStorageLoadResult["status"], next: DemoStorageLoadResult["status"]) => next,
    "empty" as DemoStorageLoadResult["status"],
  );
  const skipNextPersistence = useRef(false);

  useEffect(() => {
    const loadResult = readDemoState();

    if (loadResult.status === "restored") {
      dispatch({ type: "hydrate", state: loadResult.state });
    }

    if (loadResult.status === "corrupt" || loadResult.status === "outdated") {
      dispatch({ type: "hydrate", state: DEMO_SEED_STATE });
    }

    updateStorageStatus(loadResult.status);
    markHydrated();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (skipNextPersistence.current) {
      skipNextPersistence.current = false;
      return;
    }

    if (!writeDemoState(state)) {
      updateStorageStatus("unavailable");
      return;
    }

    if (storageStatus === "corrupt" || storageStatus === "outdated" || storageStatus === "empty") {
      updateStorageStatus("restored");
    }
  }, [isHydrated, state, storageStatus]);

  const resetDemo = useCallback((): void => {
    const removed = removeDemoState();
    skipNextPersistence.current = true;
    dispatch({ type: "reset", state: { ...DEMO_SEED_STATE } });

    if (removed) {
      updateStorageStatus("empty");
    }

    if (!removed) {
      updateStorageStatus("unavailable");
    }
  }, []);

  const dispatchOperation = useCallback((action: DemoOperationAction): void => {
    dispatch(action);
  }, []);

  const registerStayEntry = useCallback((category: DemoStayCategory, plateFragment: string): DemoOperationResult => {
    const action = createDemoAction({ type: "register-entry", category, plateFragment });
    const operationResult = applyDemoAction(state, action);

    if (!operationResult.success) {
      return operationResult;
    }

    if (!writeDemoState(operationResult.state)) {
      updateStorageStatus("unavailable");
      return {
        success: false,
        state: operationResult.state,
        message: "No se pudo guardar el ingreso en esta sesión. Revisá el almacenamiento e intentá nuevamente.",
      };
    }

    dispatch(action);
    updateStorageStatus("restored");
    return operationResult;
  }, [state]);

  const value = useMemo<DemoContextValue>(
    () => ({ state, isHydrated, storageStatus, dispatch: dispatchOperation, registerStayEntry, resetDemo }),
    [state, isHydrated, storageStatus, dispatchOperation, registerStayEntry, resetDemo],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemoState(): DemoContextValue {
  const context = useContext(DemoContext);

  if (!context) {
    throw new Error("useDemoState debe utilizarse dentro de DemoProvider.");
  }

  return context;
}

export function createDemoAction(action: DemoOperationInput): DemoOperationAction {
  const generatedDetails = {
    id: globalThis.crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
  };

  if (action.type === "register-entry") {
    return { ...action, ...generatedDetails };
  }

  if (action.type === "confirm-payment-and-exit") {
    return { ...action, ...generatedDetails };
  }

  if (action.type === "record-cash-adjustment") {
    return { ...action, ...generatedDetails };
  }

  if (action.type === "count-cash") {
    return { ...action, ...generatedDetails };
  }

  return { ...action, ...generatedDetails };
}
