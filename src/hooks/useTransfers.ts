import { useState, useEffect } from "react";
import {
  auth,
  db,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  writeBatch,
  handleFirestoreError,
  OperationType,
  logFirestoreRead
} from "../services/firebase";
import { UnitTransfer, BloodStock } from "../types";
import { playSuccessSound } from "../services/audio";

// Shared in-memory cache and singleton listener to prevent redundant transfers reads
let cachedTransfers: UnitTransfer[] | null = null;
let activeUnsub: (() => void) | null = null;
const subscribers = new Set<(items: UnitTransfer[]) => void>();
let disconnectTimeout: any = null;

function subscribeToTransfers() {
  if (activeUnsub) return;
  if (!auth.currentUser) return;

  logFirestoreRead("useTransfers (Singleton Listener)", "transfers (limit 50)");

  const q = query(collection(db, "transfers"), orderBy("timestamp", "desc"), limit(50));
  activeUnsub = onSnapshot(
    q,
    (snapshot) => {
      const items: UnitTransfer[] = [];
      snapshot.docs.forEach((d: any) => {
        items.push({
          id: d.id,
          ...d.data()
        } as UnitTransfer);
      });
      cachedTransfers = items;
      subscribers.forEach((cb) => cb(items));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "transfers");
    }
  );
}

export const useTransfers = () => {
  const [transfers, setTransfers] = useState<UnitTransfer[]>(() => cachedTransfers || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedTransfers);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    if (disconnectTimeout) {
      clearTimeout(disconnectTimeout);
      disconnectTimeout = null;
    }

    const handler = (items: UnitTransfer[]) => {
      setTransfers(items);
      setLoading(false);
    };

    subscribers.add(handler);

    if (cachedTransfers) {
      setTransfers(cachedTransfers);
      setLoading(false);
    }

    subscribeToTransfers();

    return () => {
      subscribers.delete(handler);
      if (subscribers.size === 0 && activeUnsub) {
        disconnectTimeout = setTimeout(() => {
          if (subscribers.size === 0 && activeUnsub) {
            activeUnsub();
            activeUnsub = null;
          }
        }, 45000);
      }
    };
  }, []);

  const transferUnit = async (params: {
    from: string;
    to: string;
    productType: string;
    bloodType: string;
    unitId: string;
    currentInventory: BloodStock[];
  }) => {
    const { from, to, productType, bloodType, unitId, currentInventory } = params;

    const sourceStock = currentInventory.find(
      (s) => s.centerRoute === from && s.productType === productType && s.bloodType === bloodType
    );
    const destStock = currentInventory.find(
      (s) => s.centerRoute === to && s.productType === productType && s.bloodType === bloodType
    );

    const sourceQty = Math.max(0, (sourceStock?.quantity || 0) - 1);
    const destQty = (destStock?.quantity || 0) + 1;

    const batch = writeBatch(db);

    // 1. Update source
    const sourceRef = doc(db, "inventory", `${from}_${productType}_${bloodType}`);
    batch.set(
      sourceRef,
      {
        centerRoute: from,
        productType,
        bloodType,
        quantity: sourceQty,
        lastUpdated: Date.now()
      },
      { merge: true }
    );

    // 2. Update destination
    const destRef = doc(db, "inventory", `${to}_${productType}_${bloodType}`);
    batch.set(
      destRef,
      {
        centerRoute: to,
        productType,
        bloodType,
        quantity: destQty,
        lastUpdated: Date.now()
      },
      { merge: true }
    );

    // 3. Add transfer log record
    const transferRecord = {
      transferFrom: from,
      transferTo: to,
      productType,
      bloodType,
      unitIds: [unitId.trim()],
      timestamp: Date.now()
    };

    await batch.commit();
    await addDoc(collection(db, "transfers"), transferRecord);
    playSuccessSound();
  };

  const deleteTransferLog = async (id: string) => {
    try {
      const docRef = doc(db, "transfers", id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `transfers/${id}`);
    }
  };

  return {
    transfers,
    loading,
    transferUnit,
    deleteTransferLog
  };
};
