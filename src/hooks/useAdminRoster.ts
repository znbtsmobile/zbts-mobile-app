import { useState, useEffect, useMemo } from "react";
import { auth, db, doc, onSnapshot, setDoc, handleFirestoreError, OperationType } from "../services/firebase";
import { EmergencyContact, LabStaff, ShiftType, StaffMember } from "../types";
import {
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_ROSTER,
  ALL_LAB_STAFF,
  SHIFT_MAX_STAFF
} from "../config/constants";
import { playSuccessSound } from "../services/audio";

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

export const useAdminRoster = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(INITIAL_EMERGENCY_CONTACTS);
  const [roster, setRoster] = useState<LabStaff[]>(() => ensureUniformSlots(INITIAL_ROSTER));
  const [persistedStaff, setPersistedStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const unsubContacts = onSnapshot(
      doc(db, "settings", "emergency_contacts"),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().contacts) {
          setContacts(docSnap.data().contacts);
        } else {
          setContacts(INITIAL_EMERGENCY_CONTACTS);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, "settings/emergency_contacts")
    );

    const unsubRoster = onSnapshot(
      doc(db, "settings", "lab_roster"),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().roster) {
          setRoster(ensureUniformSlots(docSnap.data().roster));
        } else {
          setRoster(ensureUniformSlots(INITIAL_ROSTER));
        }
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "settings/lab_roster");
        setLoading(false);
      }
    );

    const unsubStaffList = onSnapshot(
      doc(db, "settings", "lab_staff_list"),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().staffList) {
          setPersistedStaff(docSnap.data().staffList);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "settings/lab_staff_list");
      }
    );

    return () => {
      unsubContacts();
      unsubRoster();
      unsubStaffList();
    };
  }, []);

  const staffList = useMemo<StaffMember[]>(() => {
    if (persistedStaff && persistedStaff.length > 0) {
      return persistedStaff.map((s, idx) => ({
        id: (s.id && String(s.id).trim()) || `Lab ${idx + 1}`,
        name: (s.name && String(s.name).trim()) || "",
        phone: (s.phone && String(s.phone).trim()) || ""
      }));
    }
    return ALL_LAB_STAFF.map((s, idx) => ({
      id: s.id || `Lab ${idx + 1}`,
      name: s.name || "",
      phone: s.phone || ""
    }));
  }, [persistedStaff]);

  const updateContact = async (
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
  };

  const batchUpdateStaffShift = async (
    shift: ShiftType,
    selectedNames: Set<string>,
    maxAllowed: number
  ) => {
    const selectedNamesLower = new Set(
      Array.from(selectedNames).map((n) => n.trim().toLowerCase())
    );

    const otherStaff = roster
      .filter((s) => s.shift !== shift)
      .map((s) => {
        if (s.name.trim() && selectedNamesLower.has(s.name.trim().toLowerCase())) {
          return { ...s, name: "", phone: "", labId: "" };
        }
        return s;
      });

    const existingShiftSlots = roster.filter((s) => s.shift === shift);
    const namesArray = Array.from(selectedNames).slice(0, maxAllowed);
    const newShiftStaff: LabStaff[] = [];

    const getStaffDetails = (nameToFind: string) => {
      const fromStaffList = staffList.find(
        (s) => s.name.trim().toLowerCase() === nameToFind.trim().toLowerCase()
      );
      if (fromStaffList) return fromStaffList;
      const fromRoster = roster.find(
        (s) => s.name.trim().toLowerCase() === nameToFind.trim().toLowerCase()
      );
      if (fromRoster) return { id: fromRoster.labId || "", name: fromRoster.name, phone: fromRoster.phone };
      const fromAll = ALL_LAB_STAFF.find(
        (s) => s.name.trim().toLowerCase() === nameToFind.trim().toLowerCase()
      );
      return { id: fromAll?.id || "", name: nameToFind, phone: fromAll?.phone || "" };
    };

    for (let i = 0; i < maxAllowed; i++) {
      const existingSlotId = existingShiftSlots[i]?.id || `${shift.toLowerCase()}_slot_${i + 1}`;
      const defaultSlotLabId = `Lab ${i + 1}`;
      if (i < namesArray.length) {
        const staffName = namesArray[i].trim();
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
  };

  const addNewStaff = async (id: string, name: string, phone: string) => {
    const trimmedId = id.trim() || `Lab ${staffList.length + 1}`;
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    const baseList = staffList.map((s, idx) => ({
      id: (s.id && String(s.id).trim()) || `Lab ${idx + 1}`,
      name: (s.name && String(s.name).trim()) || "",
      phone: (s.phone && String(s.phone).trim()) || ""
    }));

    const updatedStaffList = [...baseList, { id: trimmedId, name: trimmedName, phone: trimmedPhone }];
    setPersistedStaff(updatedStaffList);
    await setDoc(doc(db, "settings", "lab_staff_list"), { staffList: updatedStaffList });
    playSuccessSound();
  };

  const updateStaffMember = async (
    cardId: string,
    newId: string,
    newName: string,
    newPhone: string
  ) => {
    const targetKey = (cardId || "").trim().toLowerCase();
    const trimmedId = (newId || "").trim() || (cardId || "").trim() || "Lab";
    const trimmedName = (newName || "").trim();
    const trimmedPhone = (newPhone || "").trim();

    const baseList = staffList.map((s, idx) => ({
      id: (s.id && String(s.id).trim()) || `Lab ${idx + 1}`,
      name: (s.name && String(s.name).trim()) || "",
      phone: (s.phone && String(s.phone).trim()) || ""
    }));

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
  };

  const clearStaffSlot = async (cardId: string, staffName?: string) => {
    const targetId = (cardId || "").trim().toLowerCase();
    const targetName = (staffName || "").trim().toLowerCase();

    const baseList = staffList.map((s, idx) => ({
      id: (s.id && String(s.id).trim()) || `Lab ${idx + 1}`,
      name: (s.name && String(s.name).trim()) || "",
      phone: (s.phone && String(s.phone).trim()) || ""
    }));

    const targetCard = baseList.find((s) => {
      const sId = (s.id || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      return (targetId && sId === targetId) || (targetName && sName === targetName);
    });
    const oldName = targetCard?.name || staffName || "";
    const oldNameLower = (oldName || "").trim().toLowerCase();

    // Clear name and contact number saved in related card
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

    // Clear from roster if assigned
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
  };

  const deleteStaffCard = async (cardId: string, staffName?: string) => {
    const targetId = (cardId || "").trim().toLowerCase();
    const targetName = (staffName || "").trim().toLowerCase();

    const baseList = staffList.map((s, idx) => ({
      id: (s.id && String(s.id).trim()) || `Lab ${idx + 1}`,
      name: (s.name && String(s.name).trim()) || "",
      phone: (s.phone && String(s.phone).trim()) || ""
    }));

    const targetCard = baseList.find((s) => {
      const sId = (s.id || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      return (targetId && sId === targetId) || (targetName && sName === targetName);
    });
    const oldName = targetCard?.name || staffName || "";
    const oldNameLower = (oldName || "").trim().toLowerCase();

    // Remove specific card completely
    const updatedStaffList = baseList.filter((s) => {
      const sId = (s.id || "").trim().toLowerCase();
      const sName = (s.name || "").trim().toLowerCase();
      if (targetId && sId === targetId) return false;
      if (targetName && sName === targetName) return false;
      return true;
    });

    setPersistedStaff(updatedStaffList);
    await setDoc(doc(db, "settings", "lab_staff_list"), { staffList: updatedStaffList });

    // Clear from roster if assigned
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
  };

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
