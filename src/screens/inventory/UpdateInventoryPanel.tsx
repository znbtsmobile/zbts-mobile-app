import React, { useState } from "react";
import { BloodStock } from "../../types";
import { PRODUCT_TYPES, BLOOD_TYPES } from "../../config/constants";

interface UpdateInventoryPanelProps {
 centerRoute: string;
 centerStock: BloodStock[];
 onSaveStock: (
 centerRoute: string,
 updates: Array<{ productType: string; bloodType: string; quantity: number }>
 ) => Promise<boolean>;
 onDone: () => void;
}

export const UpdateInventoryPanel: React.FC<UpdateInventoryPanelProps> = ({
 centerRoute,
 centerStock,
 onSaveStock,
 onDone
}) => {
 const [edits, setEdits] = useState<Record<string, string>>(() => {
 const initial: Record<string, string> = {};
 PRODUCT_TYPES.forEach((p) => {
 BLOOD_TYPES.forEach((b) => {
 const qty = centerStock.find((s) => s.productType === p && s.bloodType === b)?.quantity || 0;
 initial[`${p}_${b}`] = qty.toString();
 });
 });
 return initial;
 });

 const [saving, setSaving] = useState(false);

 const handleSave = async () => {
 setSaving(true);
 try {
 const updates = Object.entries(edits).map(([key, qtyStr]) => {
 const [productType, bloodType] = key.split("_");
 const quantity = Math.max(0, parseInt(qtyStr as string, 10) || 0);
 return { productType, bloodType, quantity };
 });

 await onSaveStock(centerRoute, updates);
 onDone();
 } catch (e: any) {
 alert("Failed to update inventory: " + (e.message || "Unknown error"));
 } finally {
 setSaving(false);
 }
 };

 return (
 <div className="bg-slate-50 p-4 rounded-xl shadow-sm border border-slate-200 ">
 <h3 className="font-bold text-black mb-4 text-lg">Manual Inventory Update</h3>
 <div className="space-y-6">
 {PRODUCT_TYPES.map((pType) => (
 <div key={pType}>
 <h4 className="text-sm font-bold text-[#1976D2] mb-2">{pType}</h4>
 <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
 {BLOOD_TYPES.map((bType) => {
 const key = `${pType}_${bType}`;
 return (
 <div key={bType} className="flex flex-col text-center">
 <label className="text-xs font-bold text-[#0D47A1] mb-1">{bType}</label>
 <input
 type="number"
 min="0"
 value={edits[key]}
 onChange={(e) => setEdits({ ...edits, [key]: e.target.value })}
 className="border-2 border-[#1976D2] bg-white rounded-lg p-2 text-center text-sm font-bold text-[#0B1E36] focus:border-[#1976D2] focus:ring-1 focus:ring-[#1976D2] focus:outline-none"
 />
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>

 <div className="flex gap-3 mt-6">
 <button
 type="button"
 onClick={onDone}
 className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl transition-all"
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={handleSave}
 disabled={saving}
 className="flex-2 bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold py-3 rounded-xl shadow-sm transition-transform active:scale-98 shadow-sm disabled:opacity-50"
 >
 {saving ? "Saving Changes..." : "Save Changes"}
 </button>
 </div>
 </div>
 );
};
