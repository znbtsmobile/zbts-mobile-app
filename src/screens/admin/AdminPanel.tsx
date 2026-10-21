import React, { useState } from 'react';
import { EmergencyContact, LabStaff, ShiftType, StaffMember } from '../../types';
import { ContactEditCard } from './ContactEditCard';
import { PrepareFromListPanel } from './PrepareFromListPanel';
import { DataAuthPanel } from './DataAuthPanel';

interface AdminPanelProps {
  contacts: EmergencyContact[];
  roster: LabStaff[];
  staffList?: StaffMember[];
  onLogout: () => void;
  onUpdateContact: (id: number, name: string, phone: string, pos: string) => void;
  onBatchUpdateStaff: (shift: ShiftType, selectedNames: Set<string>, maxAllowed: number) => Promise<void>;
  onAddNewStaff?: (id: string, name: string, phone: string) => Promise<void>;
  onUpdateStaffMember?: (cardId: string, newId: string, newName: string, newPhone: string) => Promise<void>;
  onClearStaffSlot?: (cardId: string, staffName?: string) => Promise<void>;
  onDeleteStaffCard?: (cardId: string, staffName?: string) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  contacts,
  roster,
  staffList = [],
  onLogout,
  onUpdateContact,
  onBatchUpdateStaff,
  onAddNewStaff,
  onUpdateStaffMember,
  onClearStaffSlot,
  onDeleteStaffCard
}) => {
  const [editingSection, setEditingSection] = useState<"contacts" | "roster" | "auth">("contacts");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-[#1976D2] w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm">
            ⚙️
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Admin Panel</h2>
            <p className="text-xs text-slate-500 font-medium">Manage operational contacts, roster & access</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setEditingSection("contacts")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm cursor-pointer ${
            editingSection === "contacts"
              ? "bg-[#D9E6F6] text-[#0D47A1] shadow-sm"
              : "bg-slate-100 text-slate-600 hover:text-slate-900"
          }`}
        >
          Emergency Contacts
        </button>
        <button
          onClick={() => setEditingSection("roster")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm cursor-pointer ${
            editingSection === "roster"
              ? "bg-[#D9E6F6] text-[#0D47A1] shadow-sm"
              : "bg-slate-100 text-slate-600 hover:text-slate-900"
          }`}
        >
          Lab Team Assistance
        </button>
        <button
          onClick={() => setEditingSection("auth")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm cursor-pointer ${
            editingSection === "auth"
              ? "bg-[#D9E6F6] text-[#0D47A1] shadow-sm"
              : "bg-slate-100 text-slate-600 hover:text-slate-900"
          }`}
        >
          Data Authorization
        </button>
      </div>

      {editingSection === "contacts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {contacts.map((c) => (
            <ContactEditCard
              key={c.position}
              contact={c}
              onSave={(n, p) => onUpdateContact(c.id, n, p, c.position)}
            />
          ))}
        </div>
      )}

      {editingSection === "roster" && (
        <PrepareFromListPanel
          roster={roster}
          staffList={staffList}
          onBatchUpdateStaff={onBatchUpdateStaff}
          onAddNewStaff={onAddNewStaff}
          onUpdateStaffMember={onUpdateStaffMember}
          onClearStaffSlot={onClearStaffSlot}
          onDeleteStaffCard={onDeleteStaffCard}
        />
      )}

      {editingSection === "auth" && (
        <DataAuthPanel onBack={() => setEditingSection("contacts")} />
      )}
    </div>
  );
};
