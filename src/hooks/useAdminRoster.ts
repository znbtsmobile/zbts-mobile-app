import { useState, useEffect, useMemo, useCallback } from "react";
import {
  auth,
  db,
  doc,
  onSnapshot,
  setDoc,
  handleFirestoreError,
  OperationType,
  logFirestoreRead
} from "../services/firebase";
import { EmergencyContact, LabStaff, ShiftType, StaffMember } from "../types";
import {
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_ROSTER,
  ALL_LAB_STAFF,
  SHIFT_MAX_STAFF
} from "../config/constants";
import { playSuccessSound } from "../services/audio";

const normalizeStaffList = (list: StaffMember[]): StaffMember[] => {
  return list.map((s, idx) => ({
    id: (s.id && String(s.id).trim()) || `Lab ${idx + 1}`,
    name: (s.name && String(s.name).trim()) || "",
    phone: (s.phone && String(s.phone).trim()) || ""
  }));
};

const ensureUniformSlots = (items: LabStaff[]): LabStaff[] => {
  const shifts: ShiftType[] = ["Morning", "Evening", "Weekend"];
  const result: LabStaff[] = [];

  shifts.forEach((shift) => {
    const max = SHIFT_MAX_STAFF[shift] || 4;
    const currentShiftItems = items.filter((s) => s.shift === shift);
    for (let i = 0; i < max; i++) {
      if (currentShiftItems[i]) {
        result.push({
          ...currentShiftItems[i],
          labId: currentShiftItems[i].labId || `Lab ${i + 1}`
        });
      } else {
        result.push({
          id: `${shift.toLowerCase()}_slot_${i + 1}`,
          shift,
          name: "",
          phone: "",
          labId: `Lab ${i + 1}`
        });
      }
    }
  });

  return result;
};

// In-memory cache and singleton listener to prevent redundant settings reads
let cachedContacts: EmergencyContact[] = INITIAL_EMERGENCY_CONTACTS;
let cachedRoster: LabStaff[] = ensureUniformSlots(INITIAL_ROSTER);
let cachedStaffList: StaffMember[] = [];
let hasLoadedSettings = false;
let activeRosterUnsubs: (() => void)[] = [];
const rosterSubscribers = new Set<(data: { contacts: EmergencyContact[]; roster: LabStaff[]; staffList: StaffMember[] }) => void>();
let rosterDisconnectTimeout: any = null;

function subscribeToAdminRoster() {
  if (activeRosterUnsubs.length > 0) return;
  if (!auth.currentUser) return;

  logFirestoreRead("useAdminRoster (Singleton Listener)", "settings/emergency_contacts");
  const unsubContacts = onSnapshot(
    doc(db, "settings", "emergency_contacts"),
    (docSnap) => {
      if (docSnap.exists() && docSnap.data().contacts) {
        cachedContacts = docSnap.data().contacts;
      } else {
        cachedContacts = INITIAL_EMERGENCY_CONTACTS;
      }
      rosterSubscribers.forEach((cb) => cb({ contacts: cachedContacts, roster: cachedRoster, staffList: cachedStaffList }));
    },
    (err) => handleFirestoreError(err, OperationType.GET, "settings/emergency_contacts")
  );

  logFirestoreRead("useAdminRoster (Singleton Listener)", "settings/lab_roster");
  const unsubRoster = onSnapshot(
    doc(db, "settings", "lab_roster"),
    (docSnap) => {
      if (docSnap.exists() && docSnap.data().roster) {
        cachedRoster = ensureUniformSlots(docSnap.data().roster);
      } else {
        cachedRoster = ensureUniformSlots(INITIAL_ROSTER);
      }
      hasLoadedSettings = true;
      rosterSubscribers.forEach((cb) => cb({ contacts: cachedContacts, roster: cachedRoster, staffList: cachedStaffList }));
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, "settings/lab_roster");
    }
  );

  logFirestoreRead("useAdminRoster (Singleton Listener)", "settings/lab_staff_list");
  const unsubStaffList = onSnapshot(
    doc(db, "settings", "lab_staff_list"),
    (docSnap) => {
      if (docSnap.exists() && docSnap.data().staffList) {
        cachedStaffList = docSnap.data().staffList;
      }
      rosterSubscribers.forEach((cb) => cb({ contacts: cachedContacts, roster: cachedRoster, staffList: cachedStaffList }));
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, "settings/lab_staff_list");
    }
  );

  activeRosterUnsubs = [unsubContacts, unsubRoster, unsubStaffList];
}

export const useAdminRoster = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => cachedContacts);
  const [roster, setRoster] = useState<LabStaff[]>(() => cachedRoster);
  const [persistedStaff, setPersistedStaff] = useState<StaffMember[]>(() => cachedStaffList);
  const [loading, setLoading] = useState<boolean>(() => !hasLoadedSettings);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    if (rosterDisconnectTimeout) {
      clearTimeout(rosterDisconnectTimeout);
      rosterDisconnectTimeout = null;
    }

    const handler = (data: { contacts: EmergencyContact[]; roster: LabStaff[]; staffList: StaffMember[] }) => {
      setContacts(data.contacts);
      setRoster(data.roster);
      setPersistedStaff(data.staffList);
      setLoading(false);
    };

    rosterSubscribers.add(handler);

    if (hasLoadedSettings) {
      setContacts(cachedContacts);
      setRoster(cachedRoster);
      setPersistedStaff(cachedStaffList);
      setLoading(false);
    }

    subscribeToAdminRoster();

    return () => {
      rosterSubscribers.delete(handler);
      if (rosterSubscribers.size === 0 && activeRosterUnsubs.length > 0) {
        rosterDisconnectTimeout = setTimeout(() => {
          if (rosterSubscribers.size === 0 && activeRosterUnsubs.length > 0) {
            activeRosterUnsubs.forEach((u) => u());
            activeRosterUnsubs = [];
          }
        }, 45000);
      }
    };
  }, []);

  const staffList = useMemo<StaffMember[]>(() => {
    if (persistedStaff && persistedStaff.length > 0) {
      return normalizeStaffList(persistedStaff);
    }
    return normalizeStaffList(ALL_LAB_STAFF);
  }, [persistedStaff]);

  const updateContact = useCallback(async (
    id: number,
    name: string,
    phone: string,
    position: string
  ) => {
    const updated = contacts.map((c) =>
      c.id === id || c.position === position ? { ...c, id, name, phone, position } : c
    );
    if (!updated.some((c) => c.position === position)) {
      updated.push({ id, name, phone, position });
    }
    await setDoc(doc(db, "settings", "emergency_contacts"), { contacts: updated });
    playSuccessSound();
  }, [contacts]);

  const batchUpdateStaffShift = useCallback(async (
    shift: ShiftType,
    selectedNames: Set<string>,
    maxAllowed: number
  ) => {
    const selectedNamesLower = new Set(
      Array.from(selectedNames).map((n) => (n || "").trim().toLowerCase())
    );

    const otherStaff = roster
      .filter((s) => s.shift !== shift)
      .map((s) => {
        if (s.name && s.name.trim() && selectedNamesLower.has(s.name.trim().toLowerCase())) {
          return { ...s, name: "", phone: "", labId: "" };
        }
        return s;
      });

    const existingShiftSlots = roster.filter((s) => s.shift === shift);
    const namesArray = Array.from(selectedNames).slice(0, maxAllowed);
    const newShiftStaff: LabStaff[] = [];

    const getStaffDetails = (nameToFind: string) => {
      const searchTarget = (nameToFind || "").trim().toLowerCase();
      const fromStaffList = staffList.find(
        (s) => (s.name || "").trim().toLowerCase() === searchTarget
      );
      if (fromStaffList) return fromStaffList;
      const fromRoster = roster.find(
        (s) => (s.name || "").trim().toLowerCase() === searchTarget
      );
      if (fromRoster) return { id: fromRoster.labId || "", name: fromRoster.name, phone: fromRoster.phone };
      const fromAll = ALL_LAB_STAFF.find(
        (s) => (s.name || "").trim().toLowerCase() === searchTarget
      );
      return { id: fromAll?.id || "", name: nameToFind, phone: fromAll?.phone || "" };
    };

    for (let i = 0; i < maxAllowed; i++) {
      const existingSlotId = existingShiftSlots[i]?.id || `${shift.toLowerCase()}_slot_${i + 1}`;
      const defaultSlotLabId = `Lab ${i + 1}`;
      if (i < namesArray.length) {
        const staffName = (namesArray[i] || "").trim();
        const details = getStaffDetails(staffName);
        newShiftStaff.push({
          id: existingSlotId,
          shift,
          name: staffName,
          phone: details.phone || "",
          labId: details.id || defaultSlotLabId
        });
      } else {
        newShiftStaff.push({
          id: existingSlotId,
          shift,
          name: "",
          phone: "",
          labId: defaultSlotLabId
        });
      }
    }

    const updatedRoster = [...otherStaff, ...newShiftStaff];
    setRoster(updatedRoster);
    await setDoc(doc(db, "settings", "lab_roster"), { roster: updatedRoster });
    playSuccessSound();
  }, [roster, staffList]);

  const addNewStaff = useCallback(async (id: string, name: string, phone: string) => {
    const trimmedId = (id || "").trim() || `Lab ${staffList.length + 1}`;
    const trimmedName = (name || "").trim();
    const trimmedPhone = (phone || "").trim();

    const baseList = normalizeStaffList(staffList);
    const updatedStaffList = [...baseList, { id: trimmedId, name: trimmedName, phone: trimmedPhone }];
    setPersistedStaff(updatedStaffList);
    await setDoc(doc(db, "settings", "lab_staff_list"), { staffList: updatedStaffList });
    playSuccessSound();
  }, [staffList]);

  const updateStaffMember = useCallback(async (
    cardId: string,
    newId: string,
    newName: string,
    newPhone: string
  ) => {
    const targetKey = (cardId || "").trim().toLowerCase();
    const trimmedId = (newId || "").trim() || (cardId || "").trim() || "Lab";
    const trimmedName = (newName || "").trim();
    const trimmedPhone = (newPhone || "").trim();

    const baseList = normalizeStaffList(staffList);
    const targetCard = baseList.find(
      (s) =>
        (s.id && s.id.trim().toLowerCase() === targetKey) ||
        (s.name && s.name.trim().toLowerCase() === targetKey)
    );
    const oldName = targetCard?.name || "";
    const oldNameLower = (oldName || "").trim().toLowerCase();

    const updatedStaffList = baseList.map((s) => {
      const sId = (s.id || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      if ((targetKey && sId === targetKey) || (targetKey && sName === targetKey)) {
        return { id: trimmedId, name: trimmedName, phone: trimmedPhone };
      }
      return s;
    });

    setPersistedStaff(updatedStaffList);
    await setDoc(doc(db, "settings", "lab_staff_list"), { staffList: updatedStaffList });

    const updatedRoster = roster.map((s) => {
      const sLabId = (s.labId || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      if (
        (targetKey && sLabId === targetKey) ||
        (targetKey && sName === targetKey) ||
        (oldNameLower && sName === oldNameLower)
      ) {
        return { ...s, labId: trimmedId, name: trimmedName, phone: trimmedPhone };
      }
      return s;
    });
    setRoster(updatedRoster);
    await setDoc(doc(db, "settings", "lab_roster"), { roster: updatedRoster });
    playSuccessSound();
  }, [roster, staffList]);

  const clearStaffSlot = useCallback(async (cardId: string, staffName?: string) => {
    const targetId = (cardId || "").trim().toLowerCase();
    const targetName = (staffName || "").trim().toLowerCase();

    const baseList = normalizeStaffList(staffList);
    const targetCard = baseList.find((s) => {
      const sId = (s.id || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      return (targetId && sId === targetId) || (targetName && sName === targetName);
    });
    const oldName = targetCard?.name || staffName || "";
    const oldNameLower = (oldName || "").trim().toLowerCase();

    const updatedStaffList = baseList.map((s) => {
      const sId = (s.id || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      if ((targetId && sId === targetId) || (targetName && sName === targetName)) {
        return { ...s, name: "", phone: "" };
      }
      return s;
    });

    setPersistedStaff(updatedStaffList);
    await setDoc(doc(db, "settings", "lab_staff_list"), { staffList: updatedStaffList });

    const updatedRoster = roster.map((s) => {
      const sLabId = (s.labId || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      if (
        (targetId && sLabId === targetId) ||
        (targetName && sName === targetName) ||
        (oldNameLower && sName === oldNameLower)
      ) {
        return { ...s, name: "", phone: "" };
      }
      return s;
    });
    setRoster(updatedRoster);
    await setDoc(doc(db, "settings", "lab_roster"), { roster: updatedRoster });
    playSuccessSound();
  }, [roster, staffList]);

  const deleteStaffCard = useCallback(async (cardId: string, staffName?: string) => {
    const targetId = (cardId || "").trim().toLowerCase();
    const targetName = (staffName || "").trim().toLowerCase();

    const baseList = normalizeStaffList(staffList);
    const targetCard = baseList.find((s) => {
      const sId = (s.id || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      return (targetId && sId === targetId) || (targetName && sName === targetName);
    });
    const oldName = targetCard?.name || staffName || "";
    const oldNameLower = (oldName || "").trim().toLowerCase();

    const updatedStaffList = baseList.filter((s) => {
      const sId = (s.id || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      if (targetId && sId === targetId) return false;
      if (targetName && sName === targetName) return false;
      return true;
    });

    setPersistedStaff(updatedStaffList);
    await setDoc(doc(db, "settings", "lab_staff_list"), { staffList: updatedStaffList });

    const updatedRoster = roster.map((s) => {
      const sLabId = (s.labId || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      if (
        (targetId && sLabId === targetId) ||
        (targetName && sName === targetName) ||
        (oldNameLower && sName === oldNameLower)
      ) {
        return { ...s, name: "", phone: "" };
      }
      return s;
    });
    setRoster(updatedRoster);
    await setDoc(doc(db, "settings", "lab_roster"), { roster: updatedRoster });
    playSuccessSound();
  }, [roster, staffList]);

  return {
    contacts,
    roster,
    staffList,
    loading,
    updateContact,
    batchUpdateStaffShift,
    addNewStaff,
    updateStaffMember,
    clearStaffSlot,
    deleteStaffCard
  };
};
