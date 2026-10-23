import { useState, useEffect, useCallback } from "react";
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
  handleFirestoreError,
  OperationType
} from "../services/firebase";
import { BloodRequest, RequestedItem, UrgencyLevel, RequestStatus } from "../types";
import { playSuccessSound } from "../services/audio";

export const useBloodRequests = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "requests"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: BloodRequest[] = [];
        snapshot.docs.forEach((d: any) => {
          fetched.push({
            id: d.id,
            ...d.data()
          } as BloodRequest);
        });
        setRequests(fetched);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "requests");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createBloodRequest = useCallback(async (
    hospitalName: string,
    items: RequestedItem[],
    urgency: UrgencyLevel | string
  ): Promise<string> => {
    try {
      const newRequest = {
        hospitalName: hospitalName.trim(),
        status: "Pending" as RequestStatus,
        urgency: urgency as UrgencyLevel,
        items,
        timestamp: Date.now()
      };

      const docRef = await addDoc(collection(db, "requests"), newRequest);
      playSuccessSound();
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "requests");
      throw err;
    }
  }, []);

  const updateBloodRequestStatus = useCallback(async (id: string, newStatus: string | RequestStatus) => {
    try {
      const docRef = doc(db, "requests", id);
      await updateDoc(docRef, { status: newStatus as RequestStatus });
      playSuccessSound();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `requests/${id}`);
      throw err;
    }
  }, []);

  const deleteBloodRequest = useCallback(async (id: string) => {
    try {
      const docRef = doc(db, "requests", id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `requests/${id}`);
      throw err;
    }
  }, []);

  const batchDeleteBloodRequests = useCallback(async (ids: string[]) => {
    try {
      const batch = writeBatch(db);
      ids.forEach((id) => {
        const docRef = doc(db, "requests", id);
        batch.delete(docRef);
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, "requests");
      throw err;
    }
  }, []);

  return {
    requests,
    loading,
    createBloodRequest,
    updateBloodRequestStatus,
    deleteBloodRequest,
    batchDeleteBloodRequests
  };
};
