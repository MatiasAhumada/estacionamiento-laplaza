"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import { DEMO_SESSION_KEY } from "@/constants/demo.constant";
import { parseDemoSession, resolveDemoSessionUser } from "./demo-auth";
import type { DemoEmployee } from "../domain/demo.types";
import type {
  DemoLoginCredentials,
  DemoSessionUser,
} from "./demo-session.types";

type DemoAuthenticationResult =
  | { status: "authenticated"; user: DemoSessionUser }
  | { status: "invalid-credentials" }
  | { status: "storage-unavailable" };

interface DemoAuthState {
  isSessionReady: boolean;
  sessionUser: DemoSessionUser | undefined;
}

type DemoAuthAction =
  | { type: "restore"; sessionUser: DemoSessionUser | undefined }
  | { type: "authenticate"; sessionUser: DemoSessionUser }
  | { type: "logout" };

interface DemoAuthContextValue {
  isSessionReady: boolean;
  sessionUser: DemoSessionUser | undefined;
  authenticate: (
    credentials: DemoLoginCredentials,
    employees: DemoEmployee[],
  ) => DemoAuthenticationResult;
  logout: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextValue | undefined>(
  undefined,
);

function demoAuthReducer(
  state: DemoAuthState,
  action: DemoAuthAction,
): DemoAuthState {
  if (action.type === "restore") {
    return { isSessionReady: true, sessionUser: action.sessionUser };
  }

  if (action.type === "authenticate") {
    return { isSessionReady: true, sessionUser: action.sessionUser };
  }

  return { isSessionReady: true, sessionUser: undefined };
}

export function DemoAuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [authState, dispatch] = useReducer(demoAuthReducer, {
    isSessionReady: false,
    sessionUser: undefined,
  });

  useEffect(() => {
    let restoredSession: DemoSessionUser | undefined;

    try {
      const serializedSession =
        globalThis.sessionStorage.getItem(DEMO_SESSION_KEY);

      if (serializedSession) {
        restoredSession = parseDemoSession(serializedSession);

        if (!restoredSession) {
          globalThis.sessionStorage.removeItem(DEMO_SESSION_KEY);
        }
      }
    } catch {
      restoredSession = undefined;
    }

    dispatch({ type: "restore", sessionUser: restoredSession });
  }, []);

  const authenticate = useCallback(
    (
      credentials: DemoLoginCredentials,
      employees: DemoEmployee[],
    ): DemoAuthenticationResult => {
      const resolvedUser = resolveDemoSessionUser(credentials, employees);

      if (!resolvedUser) {
        return { status: "invalid-credentials" };
      }

      try {
        globalThis.sessionStorage.setItem(
          DEMO_SESSION_KEY,
          JSON.stringify(resolvedUser),
        );
      } catch {
        return { status: "storage-unavailable" };
      }

      dispatch({ type: "authenticate", sessionUser: resolvedUser });
      return { status: "authenticated", user: resolvedUser };
    },
    [],
  );

  const logout = useCallback(() => {
    try {
      globalThis.sessionStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      dispatch({ type: "logout" });
      return;
    }

    dispatch({ type: "logout" });
  }, []);

  const contextValue = useMemo(
    () => ({ ...authState, authenticate, logout }),
    [authState, authenticate, logout],
  );

  return (
    <DemoAuthContext.Provider value={contextValue}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth(): DemoAuthContextValue {
  const context = useContext(DemoAuthContext);

  if (!context) {
    throw new Error("useDemoAuth debe utilizarse dentro de DemoAuthProvider.");
  }

  return context;
}
