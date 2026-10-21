import React, { useState, useEffect, useRef } from "react";
import { Mail, User, Trash2 } from "lucide-react";
import { auth, db, doc, onSnapshot, setDoc, handleFirestoreError, OperationType } from "../../services/firebase";
import { AuthRow } from "../../types";
import { CENTERS, MAX_AUTH_SLOTS } from "../../config/constants";
import { playSuccessSound } from "../../services/audio";

export const DataAuthPanel: React.FC<{ onBack?: () => void }> = () => {
  const [activePage, setActivePage] = useState<"lab_team" | "admin">("lab_team");
  const [rows, setRows] = useState<AuthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "settings", "data_authorizations"),
      (docSnap) => {
        if (docSnap.exists()) {
          const raw = docSnap.data().authorizations || [];
          const formatted: AuthRow[] = raw.map((item: any, idx: number) => ({
            id: item.id ? String(item.id) : String(idx + 1),
            email: item.email || "",
            category: item.category || (item.adminLogin === "ALLOWED" ? "admin" : "lab_team"),
            requestHistoryRead: item.requestHistoryRead || null,
            znbtsReserveStockRead: item.znbtsReserveStockRead || null,
            postManagement: item.postManagement || null,
            adminLogin: item.adminLogin || null,
            internalMemo: item.internalMemo || null,
            hospitalSite: item.hospitalSite || ""
          }));
          if (!isDirtyRef.current) {
            setRows(formatted);
          }
        } else {
          if (!isDirtyRef.current) {
            setRows([
              { id: "1", email: "", category: "lab_team", requestHistoryRead: null, znbtsReserveStockRead: null, postManagement: null, adminLogin: null, internalMemo: null, hospitalSite: "" },
              { id: "2", email: "", category: "lab_team", requestHistoryRead: null, znbtsReserveStockRead: null, postManagement: null, adminLogin: null, internalMemo: null, hospitalSite: "" },
              { id: "3", email: "znbtsmobile@gmail.com", category: "admin", requestHistoryRead: "ALLOWED", znbtsReserveStockRead: "ALLOWED", postManagement: "ALLOWED", adminLogin: "ALLOWED", internalMemo: "ALLOWED", hospitalSite: "" }
            ]);
          }
        }
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "settings/data_authorizations");
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const updateRow = (id: string, field: keyof AuthRow, value: any) => {
    isDirtyRef.current = true;
    setRows((prevRows) =>
      prevRows.map((r) => (String(r.id) === String(id) ? { ...r, [field]: value } : r))
    );
  };

  const addRow = () => {
    isDirtyRef.current = true;
    setRows((prevRows) => {
      if (prevRows.length >= MAX_AUTH_SLOTS) return prevRows;
      return [
        ...prevRows,
        {
          id: Date.now().toString(),
          email: "",
          category: activePage,
          requestHistoryRead: null,
          znbtsReserveStockRead: null,
          postManagement: null,
          adminLogin: activePage === "admin" ? "ALLOWED" : null,
          internalMemo: null,
          hospitalSite: ""
        }
      ];
    });
  };

  const removeRow = (id: string) => {
    isDirtyRef.current = true;
    setRows((prevRows) => prevRows.filter((r) => String(r.id) !== String(id)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "data_authorizations"), {
        authorizations: rows
      });
      isDirtyRef.current = false;
      playSuccessSound();
      alert("Data authorizations saved successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to save data authorizations.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading data authorizations...
      </div>
    );
  }

  const displayedRows = rows.filter((r) => {
    const rowCategory = r.category || (r.adminLogin === "ALLOWED" ? "admin" : "lab_team");
    return rowCategory === activePage;
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-hidden space-y-4">
      {/* Control Panel: Page Switcher */}
      <div className="flex bg-slate-200 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setActivePage("lab_team")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activePage === "lab_team"
              ? "bg-white text-[#0D47A1] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Lab team
        </button>
        <button
          type="button"
          onClick={() => setActivePage("admin")}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activePage === "admin"
              ? "bg-white text-[#0D47A1] shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Admin
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {activePage === "lab_team" ? "Lab Team Data Authorization" : "Admin Data Authorization"}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {activePage === "lab_team"
              ? "Manage data access permissions and site assignments for laboratory team members"
              : "Manage operational privileges and administrative authorizations"}
          </p>
        </div>
        <div className="text-sm font-semibold text-slate-500">
          {displayedRows.length} {activePage === "lab_team" ? "Lab team" : "Admin"} / {rows.length} total slots used
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300 text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-3 w-12 text-center text-slate-800 font-bold">#</th>
              <th className="border border-slate-300 p-3 min-w-[260px] text-center text-slate-800 font-bold uppercase">
                Email / User ID
              </th>
              <th className="border border-slate-300 p-3 text-center text-slate-800 font-bold uppercase">
                Request History View
              </th>
              <th className="border border-slate-300 p-3 text-center text-slate-800 font-bold uppercase">
                ZNBTS Reserve Stock View
              </th>
              <th className="border border-slate-300 p-3 text-center text-slate-800 font-bold uppercase">
                Post Management
              </th>
              <th className="border border-slate-300 p-3 text-center text-slate-800 font-bold uppercase">
                Admin login
              </th>
              <th className="border border-slate-300 p-3 text-center text-slate-800 font-bold uppercase">
                Internal memo
              </th>
              <th className="border border-slate-300 p-3 text-center text-slate-800 font-bold uppercase">
                Assigned Hospital Site
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 italic font-medium">
                  No {activePage === "lab_team" ? "Lab team" : "Admin"} authorization slots yet. Click &quot;+ Add User Slot&quot; below to add one.
                </td>
              </tr>
            ) : (
              displayedRows.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border border-slate-300 p-3 text-center font-bold text-slate-800 relative group">
                    {index + 1}
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="absolute -left-2 top-1/2 -translate-y-1/2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all -ml-5 shadow-sm cursor-pointer"
                      title="Remove user slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="border border-slate-300 p-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {row.email ? (
                          <Mail className="w-4 h-4 text-slate-400" />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <input
                        type="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        autoComplete="off"
                        placeholder="Enter user email..."
                        value={row.email || ""}
                        onFocus={() => {
                          isDirtyRef.current = true;
                        }}
                        onChange={(e) => updateRow(row.id, "email", e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white font-medium text-sm"
                      />
                    </div>
                  </td>
                  {(
                    [
                      "requestHistoryRead",
                      "znbtsReserveStockRead",
                      "postManagement",
                      "adminLogin",
                      "internalMemo"
                    ] as const
                  ).map((field) => (
                    <td key={field} className="border border-slate-300 p-2 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateRow(
                              row.id,
                              field,
                              row[field] === "ALLOWED" ? null : "ALLOWED"
                            )
                          }
                          className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                            row[field] === "ALLOWED"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          ALLOW
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateRow(
                              row.id,
                              field,
                              row[field] === "DENIED" ? null : "DENIED"
                            )
                          }
                          className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                            row[field] === "DENIED"
                              ? "bg-red-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          DENY
                        </button>
                      </div>
                    </td>
                  ))}
                  <td className="border border-slate-300 p-3">
                    <select
                      value={row.hospitalSite || ""}
                      onChange={(e) => updateRow(row.id, "hospitalSite", e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All / Unrestricted</option>
                      {CENTERS.map((c) => (
                        <option key={c.route} value={c.route}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_AUTH_SLOTS}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          + Add User Slot
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1976D2] hover:bg-[#1565C0] text-white px-7 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : "Save Authorizations"}
        </button>
      </div>
    </div>
  );
};
