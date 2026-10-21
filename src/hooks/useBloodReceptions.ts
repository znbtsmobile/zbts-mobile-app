import { useState, useEffect } from "react";
import {
  auth,
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  getDoc,
  handleFirestoreError,
  OperationType
} from "../services/firebase";
import { BloodReception, ReceptionStatus, BloodStock } from "../types";
import { playSuccessSound } from "../services/audio";

export const useBloodReceptions = () => {
  const [receptions, setReceptions] = useState<BloodReception[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "receptions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: BloodReception[] = [];
        snapshot.docs.forEach((d) => {
          items.push({
            id: d.id,
            ...d.data()
          } as BloodReception);
        });
        setReceptions(items);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "receptions");
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
            
            // Only proceed if stockId is a valid non-empty single document segment
            if (stockId && !stockId.includes("/")) {
              const stockRef = doc(db, "inventory", stockId);

              // Calculate new quantity
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
              } else {
                try {
                  const snap = await getDoc(stockRef);
                  if (snap.exists()) {
                    currentQty = snap.data().quantity || 0;
                  }
                } catch (e) {
                  console.warn("Could not fetch current stock, defaulting to 0:", e);
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

      // If changing to Accepted from non-accepted, and wasn't previously synced to inventory
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
