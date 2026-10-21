import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { auth, onAuthStateChanged, db, doc, onSnapshot, handleFirestoreError, OperationType } from "../services/firebase";
import { AuthRow, DataAuthContextType } from "../types";

const DataAuthContext = createContext<DataAuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "znbtsmobile@gmail.com";

const DEFAULT_ADMIN_AUTH: AuthRow = {
  id: "admin_default",
  email: ADMIN_EMAIL,
  requestHistoryRead: "ALLOWED",
  znbtsReserveStockRead: "ALLOWED",
  postManagement: "ALLOWED",
  adminLogin: "ALLOWED",
  internalMemo: "ALLOWED",
  hospitalSite: ""
};

export const DataAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authRow, setAuthRow] = useState<AuthRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      if (!user || !user.email || !auth.currentUser) {
        setLoading(false);
        setAuthRow(null);
        return;
      }

      const isRootAdmin = user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

      try {
        unsubSnapshot = onSnapshot(
          doc(db, "settings", "data_authorizations"),
          (docSnap) => {
            if (docSnap.exists()) {
              const authorizations: AuthRow[] = docSnap.data().authorizations || [];
              const userAuth = authorizations.find(
                (a) => a.email && a.email.trim().toLowerCase() === user.email?.trim().toLowerCase()
              );
              setAuthRow(userAuth || (isRootAdmin ? DEFAULT_ADMIN_AUTH : null));
            } else {
              setAuthRow(isRootAdmin ? DEFAULT_ADMIN_AUTH : null);
            }
            setLoading(false);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, "settings/data_authorizations");
            setAuthRow(isRootAdmin ? DEFAULT_ADMIN_AUTH : null);
            setLoading(false);
          }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "settings/data_authorizations");
        setAuthRow(isRootAdmin ? DEFAULT_ADMIN_AUTH : null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) {
        unsubSnapshot();
      }
    };
  }, []);

  return (
    <DataAuthContext.Provider value={{ authRow, loading }}>
      {children}
    </DataAuthContext.Provider>
  );
};

export const useDataAuth = (): DataAuthContextType => {
  const context = useContext(DataAuthContext);
  if (context !== undefined) {
    return context;
  }

  // Standalone fallback hook when rendered outside of provider
  const [authRow, setAuthRow] = useState<AuthRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user: any) => {
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      if (!user || !user.email || !auth.currentUser) {
        setLoading(false);
        setAuthRow(null);
        return;
      }

      const isRootAdmin = user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

      try {
        unsubSnapshot = onSnapshot(
          doc(db, "settings", "data_authorizations"),
          (docSnap) => {
            if (docSnap.exists()) {
              const authorizations: AuthRow[] = docSnap.data().authorizations || [];
              const userAuth = authorizations.find(
                (a) => a.email && a.email.trim().toLowerCase() === user.email?.trim().toLowerCase()
              );
              setAuthRow(userAuth || (isRootAdmin ? DEFAULT_ADMIN_AUTH : null));
            } else {
              setAuthRow(isRootAdmin ? DEFAULT_ADMIN_AUTH : null);
            }
            setLoading(false);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, "settings/data_authorizations");
            setAuthRow(isRootAdmin ? DEFAULT_ADMIN_AUTH : null);
            setLoading(false);
          }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "settings/data_authorizations");
        setAuthRow(isRootAdmin ? DEFAULT_ADMIN_AUTH : null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) {
        unsubSnapshot();
      }
    };
  }, []);

  return { authRow, loading };
};
