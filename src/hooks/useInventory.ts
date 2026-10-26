import { useState, useEffect, useCallback } from "react";
import {
  auth,
  db,
  collection,
  onSnapshot,
  doc,
  writeBatch,
  handleFirestoreError,
  OperationType,
  logFirestoreRead
} from "../services/firebase";
import { BloodStock } from "../types";
import { playSuccessSound } from "../services/audio";

// Shared in-memory cache and singleton listener to prevent redundant collection reads
let cachedInventory: BloodStock[] | null = null;
let activeUnsub: (() => void) | null = null;
const subscribers = new Set<(items: BloodStock[]) => void>();
let disconnectTimeout: any = null;

function subscribeToInventory() {
  if (activeUnsub) return;
  if (!auth.currentUser) return;

  logFirestoreRead("useInventory (Singleton Listener)", "inventory");

  activeUnsub = onSnapshot(
    collection(db, "inventory"),
    (snapshot) => {
      const items: BloodStock[] = [];
      snapshot.docs.forEach((d: any) => {
        items.push({
          id: d.id,
          ...d.data()
        } as BloodStock);
      });
      cachedInventory = items;
      subscribers.forEach((cb) => cb(items));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "inventory");
    }
  );
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<BloodStock[]>(() => cachedInventory || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedInventory);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    if (disconnectTimeout) {
      clearTimeout(disconnectTimeout);
      disconnectTimeout = null;
    }

    const handler = (items: BloodStock[]) => {
      setInventory(items);
      setLoading(false);
    };

    subscribers.add(handler);

    if (cachedInventory) {
      setInventory(cachedInventory);
      setLoading(false);
    }

    subscribeToInventory();

    return () => {
      subscribers.delete(handler);
      // Keep listener alive across tab transitions for 45 seconds to avoid re-reading 160 items
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

  const updateCenterStock = useCallback(async (
    centerRoute: string,
    updates: Array<{ productType: string; bloodType: string; quantity: number }>
  ): Promise<boolean> => {
    try {
      const batch = writeBatch(db);
      updates.forEach((u) => {
        const docId = `${centerRoute}_${u.productType}_${u.bloodType}`;
        const docRef = doc(db, "inventory", docId);
        batch.set(
          docRef,
          {
            centerRoute,
            productType: u.productType,
            bloodType: u.bloodType,
            quantity: Number(u.quantity),
            lastUpdated: Date.now()
          },
          { merge: true }
        );
      });

      await batch.commit();
      playSuccessSound();
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, "inventory");
      return false;
    }
  }, []);

  return {
    inventory,
    loading,
    updateCenterStock
  };
};
