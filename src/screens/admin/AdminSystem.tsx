import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminTab } from "../../types";
import { SECURITY_PINS } from "../../config/constants";
import { useAdminRoster } from "../../hooks/useAdminRoster";
import { useDataAuth } from "../../hooks/useDataAuth";
import { WeeklyRosterScreen } from "./WeeklyRosterScreen";
import { EmergencyContactsScreen } from "./EmergencyContactsScreen";

interface AdminSystemProps {
  initialTab?: AdminTab;
}

export const AdminSystem: React.FC<AdminSystemProps> = ({ initialTab = "LAB_TEAM" }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const { authRow, loading: authLoading } = useDataAuth();
  const {
    contacts,
    roster,
    staffList,
    loading: rosterLoading,
    updateContact,
    batchUpdateStaffShift,
    addNewStaff,
    updateStaffMember,
    clearStaffSlot,
    deleteStaffCard
  } = useAdminRoster();

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    localStorage.getItem("is_admin_logged_in") === "true"
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleAdminLogin = (pin: string): boolean => {
    if (pin === SECURITY_PINS.ADMIN_LOGIN) {
      setIsAdminLoggedIn(true);
      localStorage.setItem("is_admin_logged_in", "true");
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("is_admin_logged_in");
  };

  const loading = authLoading || rosterLoading;

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full min-h-[400px] justify-center items-center py-20 bg-transparent font-sans">
        <Loader2 className="text-[#1976D2] w-12 h-12 animate-spin mb-4" />
        <p className="text-[#0D47A1] font-medium">Loading Admin Data...</p>
      </div>
    );
  }

  return (
    <div className="bg-transparent text-[#0B1E36] font-sans w-full flex flex-col">
      <div className="flex-1 p-4 pb-32">
        {activeTab === "LAB_TEAM" ? (
          <WeeklyRosterScreen roster={roster} />
        ) : (
          <EmergencyContactsScreen
            contacts={contacts}
            roster={roster}
            staffList={staffList}
            isAdminLoggedIn={isAdminLoggedIn}
            onLogin={handleAdminLogin}
            onLogout={handleAdminLogout}
            onUpdateContact={updateContact}
            onBatchUpdateStaff={batchUpdateStaffShift}
            onAddNewStaff={addNewStaff}
            onUpdateStaffMember={updateStaffMember}
            onClearStaffSlot={clearStaffSlot}
            onDeleteStaffCard={deleteStaffCard}
            canAdminLogin={authRow ? authRow.adminLogin !== "DENIED" : true}
          />
        )}
      </div>
    </div>
  );
};

export default AdminSystem;
