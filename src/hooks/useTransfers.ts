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
  writeBatch,
  handleFirestoreError,
  OperationType
} from "../services/firebase";
import { UnitTransfer, BloodStock } from "../types";
import { playSuccessSound } from "../services/audio";

export const useTransfers = () => {
  const [transfers, setTransfers] = useState<UnitTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "transfers"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: UnitTransfer[] = [];
        snapshot.docs.forEach((d: any) => {
          items.push({
            id: d.id,
            ...d.data()
          } as UnitTransfer);
        });
        setTransfers(items);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "transfers");
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
