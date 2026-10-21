import { useState, useEffect } from "react";
import {
  auth,
  db,
  collection,
  onSnapshot,
  doc,
  writeBatch,
  handleFirestoreError,
  OperationType
} from "../services/firebase";
import { BloodStock } from "../types";
import { playSuccessSound } from "../services/audio";

export const useInventory = () => {
  const [inventory, setInventory] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "inventory"),
      (snapshot) => {
        const items: BloodStock[] = [];
        snapshot.docs.forEach((d: any) => {
          items.push({
            id: d.id,
            ...d.data()
          } as BloodStock);
        });
        setInventory(items);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "inventory");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateCenterStock = async (
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
  };

  return {
    inventory,
    loading,
    updateCenterStock
  };
};
