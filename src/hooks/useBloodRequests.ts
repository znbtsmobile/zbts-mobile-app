import { useState, useEffect, useCallback } from "react";
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
  updateDoc,
  writeBatch,
  handleFirestoreError,
  OperationType,
  logFirestoreRead
} from "../services/firebase";
import { BloodRequest, RequestedItem, UrgencyLevel, RequestStatus } from "../types";
import { playSuccessSound } from "../services/audio";

// Shared in-memory cache and singleton listener to avoid unbounded duplicate reads across Bookings & Trend
let cachedRequests: BloodRequest[] | null = null;
let activeUnsub: (() => void) | null = null;
const subscribers = new Set<(items: BloodRequest[]) => void>();
let disconnectTimeout: any = null;

function subscribeToRequests() {
  if (activeUnsub) return;
  if (!auth.currentUser) return;

  logFirestoreRead("useBloodRequests (Singleton Listener)", "requests (limit 50)");

  const q = query(collection(db, "requests"), orderBy("timestamp", "desc"), limit(50));
  activeUnsub = onSnapshot(
    q,
    (snapshot) => {
      const fetched: BloodRequest[] = [];
      snapshot.docs.forEach((d: any) => {
        fetched.push({
          id: d.id,
          ...d.data()
        } as BloodRequest);
      });
      cachedRequests = fetched;
      subscribers.forEach((cb) => cb(fetched));
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, "requests");
    }
  );
}

export const useBloodRequests = () => {
  const [requests, setRequests] = useState<BloodRequest[]>(() => cachedRequests || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedRequests);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    if (disconnectTimeout) {
      clearTimeout(disconnectTimeout);
      disconnectTimeout = null;
    }

    const handler = (items: BloodRequest[]) => {
      setRequests(items);
      setLoading(false);
    };

    subscribers.add(handler);

    if (cachedRequests) {
      setRequests(cachedRequests);
      setLoading(false);
    }

    subscribeToRequests();

    return () => {
      subscribers.delete(handler);
      // Keep listener alive across tab transitions for 45s to prevent re-querying
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
