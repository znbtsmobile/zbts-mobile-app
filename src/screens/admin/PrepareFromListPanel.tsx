import React, { useState, useEffect } from 'react';
import { LabStaff, ShiftType, StaffMember } from '../../types';
import { SHIFT_MAX_STAFF } from '../../config/constants';
import { Phone, Plus, UserPlus, XCircle, Trash2, Edit2 } from 'lucide-react';

interface PrepareFromListPanelProps {
  roster: LabStaff[];
  staffList?: StaffMember[];
  onBatchUpdateStaff: (shift: ShiftType, selectedNames: Set<string>, maxAllowed: number) => Promise<void>;
  onAddNewStaff?: (id: string, name: string, phone: string) => Promise<void>;
  onUpdateStaffMember?: (cardId: string, newId: string, newName: string, newPhone: string) => Promise<void>;
  onClearStaffSlot?: (cardId: string, staffName?: string) => Promise<void>;
  onDeleteStaffCard?: (cardId: string, staffName?: string) => Promise<void>;
}

export const PrepareFromListPanel: React.FC<PrepareFromListPanelProps> = ({
  roster,
  staffList = [],
  onBatchUpdateStaff,
  onAddNewStaff,
  onUpdateStaffMember,
  onClearStaffSlot,
  onDeleteStaffCard
}) => {
  const [shift, setShift] = useState<ShiftType>("Morning");
  const [saveStatus, setSaveStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffId, setNewStaffId] = useState("");
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const maxAllowed = SHIFT_MAX_STAFF[shift] || 4;

  const assignedInShift = new Set(
    roster.filter((s) => s.shift === shift && s.name.trim() !== "").map((s) => s.name.trim())
  );
  const [checked, setChecked] = useState<Set<string>>(assignedInShift);

  useEffect(() => {
    setChecked(
      new Set(roster.filter((s) => s.shift === shift && s.name.trim() !== "").map((s) => s.name.trim()))
    );
    setSaveStatus("");
  }, [shift, roster]);

  // Identify staff members assigned in any OTHER shift
  const otherShiftStaff = roster.filter((s) => s.shift !== shift && s.name.trim() !== "");
  const otherShiftMap = new Map(
    otherShiftStaff.map((s) => [s.name.trim().toLowerCase(), s.shift])
  );

  const toggleCheck = (name: string, isOther: boolean) => {
    if (isOther || !name.trim()) return;
    setSaveStatus("");
    const next = new Set(checked);
    if (next.has(name)) {
      next.delete(name);
    } else if (next.size < maxAllowed) {
      next.add(name);
    }
    setChecked(next);
  };

  const handleClearSlot = async (cardId: string, staffName: string) => {
    if (staffName) {
      const next = new Set(checked);
      next.delete(staffName.trim());
      setChecked(next);
    }
    if (onClearStaffSlot) {
      await onClearStaffSlot(cardId, staffName);
    }
  };

  const handleDeleteCard = async (cardId: string, staffName: string) => {
    if (staffName) {
      const next = new Set(checked);
      next.delete(staffName.trim());
      setChecked(next);
    }
    if (onDeleteStaffCard) {
      await onDeleteStaffCard(cardId, staffName);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onBatchUpdateStaff(shift, checked, maxAllowed);
      setSaveStatus("Saved");
    } catch (e) {
      console.error(e);
      setSaveStatus("Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddNewStaff) return;
    const generatedId = newStaffId.trim() || `Lab ${staffList.length + 1}`;
    await onAddNewStaff(generatedId, newStaffName.trim(), newStaffPhone.trim());
    if (newStaffName.trim() && checked.size < maxAllowed) {
      const next = new Set(checked);
      next.add(newStaffName.trim());
      setChecked(next);
    }
    setNewStaffId("");
    setNewStaffName("");
    setNewStaffPhone("");
    setShowAddStaff(false);
  };

  const handleStartEdit = (staff: StaffMember) => {
    setEditingCardId(staff.id);
    setEditId(staff.id);
    setEditName(staff.name || "");
    setEditPhone(staff.phone || "");
  };

  const handleSaveEdit = async (cardId: string) => {
    if (!onUpdateStaffMember) return;
    await onUpdateStaffMember(cardId, editId.trim() || cardId, editName.trim(), editPhone.trim());
    setEditingCardId(null);
  };

  return (
    <div className="space-y-4">
      {/* Shift Switcher */}
      <div className="flex bg-slate-200 p-1.5 rounded-2xl">
        {(["Morning", "Evening", "Weekend"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setShift(s)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              shift === s
                ? "bg-white text-[#0D47A1] shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Header Info & Add Staff button */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-[#0B1E36]">
            Select Staff for {shift} Shift
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Staff name is hidden on user view screen (only Lab ID and Contact are shown)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600">
            Selected: <span className="font-bold text-[#0D47A1]">{checked.size}</span> / {maxAllowed}
          </span>
          {onAddNewStaff && (
            <button
              onClick={() => setShowAddStaff(!showAddStaff)}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#1976D2] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {showAddStaff ? "Cancel" : "Add Staff"}
            </button>
          )}
        </div>
      </div>

      {/* Add Staff Form (Collapsible) */}
      {showAddStaff && onAddNewStaff && (
        <form
          onSubmit={handleCreateStaff}
          className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-3"
        >
          <p className="text-xs font-bold text-[#0D47A1]">Register New Lab Staff Card</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Lab ID</label>
              <input
                type="text"
                value={newStaffId}
                onChange={(e) => setNewStaffId(e.target.value)}
                placeholder="e.g. Lab 1"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-semibold text-[#0B1E36] outline-none focus:ring-2 focus:ring-[#1976D2]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Staff Name</label>
              <input
                type="text"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="Full Name (Admin only)"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-semibold text-[#0B1E36] outline-none focus:ring-2 focus:ring-[#1976D2]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">Contact Number</label>
              <input
                type="text"
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                placeholder="e.g. +255777123456"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm font-semibold text-[#0B1E36] outline-none focus:ring-2 focus:ring-[#1976D2]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#1976D2] hover:bg-[#1565C0] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to Staff List
            </button>
          </div>
        </form>
      )}

      {/* Staff Cards */}
      <div className="space-y-2.5 bg-slate-100 p-2.5 sm:p-4 rounded-[1.25rem] shadow-sm max-h-[30rem] overflow-y-auto border border-slate-200">
        {staffList.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-4">No staff members found.</p>
        ) : (
          staffList.map((staff, index) => {
            const isEditing = editingCardId === staff.id;
            const staffNameTrimmed = (staff.name || "").trim();
            const hasName = Boolean(staffNameTrimmed);
            const isChecked = hasName && checked.has(staffNameTrimmed);
            const assignedOtherShift = hasName ? otherShiftMap.get(staffNameTrimmed.toLowerCase()) : undefined;
            const isOther = Boolean(assignedOtherShift);
            const isSlotFilled = hasName || Boolean((staff.phone || "").trim());

            if (isEditing) {
              return (
                <div
                  key={`edit-${staff.id || 'slot'}-${index}`}
                  className="p-3 sm:p-4 bg-white border-2 border-blue-400 rounded-2xl space-y-3 shadow-md"
                >
                  <p className="text-xs font-bold text-[#0D47A1] uppercase tracking-wide">
                    Edit Lab Staff Card
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 mb-1 block">Lab ID</label>
                      <input
                        type="text"
                        value={editId}
                        onChange={(e) => setEditId(e.target.value)}
                        placeholder="Lab ID (e.g. Lab 1)"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-semibold text-[#0B1E36] outline-none focus:ring-2 focus:ring-[#1976D2]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 mb-1 block">Name (Admin only)</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Staff Name"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-semibold text-[#0B1E36] outline-none focus:ring-2 focus:ring-[#1976D2]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 mb-1 block">Contact Number</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Contact number"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-semibold text-[#0B1E36] outline-none focus:ring-2 focus:ring-[#1976D2]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingCardId(null)}
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(staff.id)}
                      className="px-4 py-2 bg-[#1976D2] hover:bg-[#1565C0] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer active:scale-95 transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`card-${staff.id || 'slot'}-${index}`}
                onClick={() => {
                  if (hasName) toggleCheck(staffNameTrimmed, isOther);
                }}
                className={`p-3 sm:p-3.5 rounded-2xl transition-all border ${
                  isOther
                    ? "opacity-60 cursor-not-allowed bg-slate-200/50 border-slate-200"
                    : isChecked
                    ? "bg-blue-50/90 border-blue-300 shadow-xs cursor-pointer"
                    : hasName
                    ? "bg-white hover:bg-slate-50 border-slate-200 shadow-xs cursor-pointer"
                    : "bg-slate-50/70 border-dashed border-slate-300"
                }`}
              >
                <div className="flex flex-col gap-2.5">
                  {/* Top: Checkbox & Info */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isOther || !hasName}
                      readOnly
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-[#1976D2] focus:ring-[#1976D2] pointer-events-none shrink-0 disabled:opacity-40"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-[#1976D2] text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-2xs shrink-0">
                          {staff.id || "Lab"}
                        </span>
                        {hasName ? (
                          <span className="font-bold text-sm sm:text-base text-[#0B1E36] break-words">
                            {staff.name}
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm text-slate-400 font-semibold italic">
                            Empty slot (No staff name)
                          </span>
                        )}
                        {isOther && (
                          <span className="text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            in {assignedOtherShift}
                          </span>
                        )}
                        {isChecked && (
                          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            in {shift}
                          </span>
                        )}
                      </div>

                      {staff.phone ? (
                        <div className="text-xs text-slate-600 font-medium flex items-center mt-1">
                          <Phone className="w-3.5 h-3.5 text-[#1976D2] mr-1 shrink-0" />
                          <span className="font-semibold text-[#0D47A1] mr-1">Contact:</span>
                          <span className="text-slate-800 font-semibold break-all">{staff.phone}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic mt-0.5">
                          No contact number
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Row: clearly aligned, comfortable touch size, clean responsive layout */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/70">
                    {/* Edit Button */}
                    {onUpdateStaffMember && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(staff);
                        }}
                        className="flex items-center justify-center gap-1 bg-white hover:bg-blue-50 text-[#1976D2] px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    {/* Clear Slot Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSlot(staff.id, staff.name || "");
                      }}
                      disabled={!isSlotFilled}
                      title={isSlotFilled ? "Clear name and contact number in this card" : "Card is already empty"}
                      className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isSlotFilled
                          ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 active:scale-95 cursor-pointer"
                          : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Clear Slot</span>
                    </button>

                    {/* Delete Card Button */}
                    {onDeleteStaffCard && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(staff.id, staff.name || "");
                        }}
                        title="Delete this lab staff card completely"
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-red-50 hover:bg-red-100 text-red-600 border-red-200 active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Save Shift Button & Status */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saveStatus && (
          <span className="text-sm font-bold text-emerald-600 animate-fadeIn">
            {saveStatus === "Saved" ? "✓ Successfully Saved & Integrated" : "Failed to save"}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#1976D2] hover:bg-[#1565C0] text-white px-6 py-2.5 rounded-xl font-bold disabled:opacity-50 transition-transform active:scale-95 shadow-sm cursor-pointer"
        >
          {isSaving ? "Saving..." : "Save Shift Roster"}
        </button>
      </div>
    </div>
  );
};
