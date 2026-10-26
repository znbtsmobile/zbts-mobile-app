import { useState, useEffect } from "react";
import {
  auth,
  db,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc,
  doc,
  writeBatch,
  handleFirestoreError,
  OperationType,
  logFirestoreRead
} from "../services/firebase";
import { BloodReception, ReceptionStatus, BloodStock } from "../types";
import { playSuccessSound } from "../services/audio";

// Shared in-memory cache and singleton listener to prevent redundant receptions reads
let cachedReceptions: BloodReception[] | null = null;
let activeUnsub: (() => void) | null = null;
const subscribers = new Set<(items: BloodReception[]) => void>();
let disconnectTimeout: any = null;

function subscribeToReceptions() {
  if (activeUnsub) return;
  if (!auth.currentUser) return;

  logFirestoreRead("useBloodReceptions (Singleton Listener)", "receptions (limit 50)");

  const q = query(collection(db, "receptions"), orderBy("timestamp", "desc"), limit(50));
  activeUnsub = onSnapshot(
    q,
    (snapshot) => {
      const items: BloodReception[] = [];
      snapshot.docs.forEach((d) => {
        items.push({
          id: d.id,
          ...d.data()
        } as BloodReception);
      });
      cachedReceptions = items;
      subscribers.forEach((cb) => cb(items));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "receptions");
    }
  );
}

export const useBloodReceptions = () => {
  const [receptions, setReceptions] = useState<BloodReception[]>(() => cachedReceptions || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedReceptions);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    if (disconnectTimeout) {
      clearTimeout(disconnectTimeout);
      disconnectTimeout = null;
    }

    const handler = (items: BloodReception[]) => {
      setReceptions(items);
      setLoading(false);
    };

    subscribers.add(handler);

    if (cachedReceptions) {
      setReceptions(cachedReceptions);
      setLoading(false);
    }

    subscribeToReceptions();

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

  const addReception = async (
    receptionData: Omit<BloodReception, "id">,
    currentInventory?: BloodStock[]
  ) => {
    try {
      const batch = writeBatch(db);
      const receptionRef = doc(collection(db, "receptions"));

      batch.set(receptionRef, {
        ...receptionData,
        id: receptionRef.id
      });

      // If accepted and inventory sync is enabled, update stock levels for the receiving facility
      if (receptionData.status === "Accepted" && receptionData.updatedInventory) {
        for (const item of receptionData.items) {
          if (item.quantity > 0) {
            const cleanProduct = (item.productType || "Whole Blood").replace(/[\/\s]+/g, "-").trim();
            const cleanBlood = (item.bloodType || "Consignment").replace(/[\/\s]+/g, "-").trim();
            const stockId = `${receptionData.receivingFacility}_${cleanProduct}_${cleanBlood}`;
            
            if (stockId && !stockId.includes("/")) {
              const stockRef = doc(db, "inventory", stockId);

              let currentQty = 0;
              if (currentInventory) {
                const matched = currentInventory.find(
                  (s) =>
                    s.centerRoute === receptionData.receivingFacility &&
                    s.productType === item.productType &&
                    s.bloodType === item.bloodType
                );
                if (matched) {
                  currentQty = matched.quantity;
                }
              }

              batch.set(
                stockRef,
                {
                  id: stockId,
                  centerRoute: receptionData.receivingFacility,
                  productType: item.productType,
                  bloodType: item.bloodType,
                  quantity: currentQty + item.quantity,
                  lastUpdated: Date.now()
                },
                { merge: true }
              );
            }
          }
        }
      }

      await batch.commit();
      playSuccessSound();
      return receptionRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "receptions");
      throw error;
    }
  };

  const updateReceptionStatus = async (
    id: string,
    status: ReceptionStatus,
    reception: BloodReception,
    currentInventory?: BloodStock[]
  ) => {
    try {
      const batch = writeBatch(db);
      const receptionRef = doc(db, "receptions", id);

      batch.update(receptionRef, { status });

      if (status === "Accepted" && !reception.updatedInventory) {
        batch.update(receptionRef, { updatedInventory: true });
        for (const item of reception.items) {
          if (item.quantity > 0) {
            const cleanProduct = (item.productType || "Whole Blood").replace(/[\/\s]+/g, "-").trim();
            const cleanBlood = (item.bloodType || "Consignment").replace(/[\/\s]+/g, "-").trim();
            const stockId = `${reception.receivingFacility}_${cleanProduct}_${cleanBlood}`;

            if (stockId && !stockId.includes("/")) {
              const stockRef = doc(db, "inventory", stockId);

              let currentQty = 0;
              if (currentInventory) {
                const matched = currentInventory.find(
                  (s) =>
                    s.centerRoute === reception.receivingFacility &&
                    s.productType === item.productType &&
                    s.bloodType === item.bloodType
                );
                if (matched) {
                  currentQty = matched.quantity;
                }
              }

              batch.set(
                stockRef,
                {
                  id: stockId,
                  centerRoute: reception.receivingFacility,
                  productType: item.productType,
                  bloodType: item.bloodType,
                  quantity: currentQty + item.quantity,
                  lastUpdated: Date.now()
                },
                { merge: true }
              );
            }
          }
        }
      }

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `receptions/${id}`);
      throw error;
    }
  };

  const deleteReception = async (id: string) => {
    try {
      await deleteDoc(doc(db, "receptions", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `receptions/${id}`);
      throw error;
    }
  };

  return {
    receptions,
    loading,
    addReception,
    updateReceptionStatus,
    deleteReception
  };
};
