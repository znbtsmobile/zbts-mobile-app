import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { BloodStock } from "../../types";
import { CENTERS, PRODUCT_TYPES, BLOOD_TYPES } from "../../config/constants";
import { useDataAuth } from "../../hooks/useDataAuth";

interface UnitTransferFormProps {
 inventory: BloodStock[];
 onBack: () => void;
 onTransfer: (params: {
 from: string;
 to: string;
 productType: string;
 bloodType: string;
 unitId: string;
 currentInventory: BloodStock[];
 }) => Promise<void>;
}

export const UnitTransferForm: React.FC<UnitTransferFormProps> = ({
 inventory,
 onBack,
 onTransfer
}) => {
 const { authRow } = useDataAuth();
 const lockedSite = authRow?.hospitalSite || "";

 const [from, setFrom] = useState(lockedSite);
 const [to, setTo] = useState("");
 const [productType, setProductType] = useState("Adult PRC");
 const [bloodType, setBloodType] = useState("O+");
 const [unitId, setUnitId] = useState("");
 const [showSuccess, setShowSuccess] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);

 useEffect(() => {
 if (lockedSite) {
 setFrom(lockedSite);
 }
 }, [lockedSite]);

 const handleTransfer = async () => {
 if (!from || !to || from === to || !unitId.trim()) {
 alert("Please fill in valid transfer details (Source and destination must differ).");
 return;
 }

 if (lockedSite && from !== lockedSite) {
 alert("You only have permission to transfer stock from your assigned hospital.");
 return;
 }

 setIsSubmitting(true);
 try {
 await onTransfer({
 from,
 to,
 productType,
 bloodType,
 unitId,
 currentInventory: inventory
 });

 setShowSuccess(true);
 setTimeout(() => {
 setShowSuccess(false);
 onBack();
 }, 1500);
 } catch (e: any) {
 alert("Failed to execute transfer: " + (e.message || "Unknown error"));
 } finally {
 setIsSubmitting(false);
 }
 };

 return (
 <div className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 relative ">
 {showSuccess && (
 <div className="absolute top-4 left-0 right-0 z-50 animate-in fade-in slide-in-from-top-4 flex justify-center">
 <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2">
 ✅ Inter-Hospital Unit Transferred Successfully
 </div>
 </div>
 )}

 <div className="flex items-center space-x-3 pb-2 pt-2 mb-4">
 <button
 onClick={onBack}
 className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1"
 >
 <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
 </button>
 <h2 className="text-[22px] font-bold text-[#0D47A1]">Inter Hospital Unit Transfer</h2>
 </div>

 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Transfer From (Source)</label>
 <select
 value={from}
 onChange={(e) => setFrom(e.target.value)}
 disabled={!!lockedSite}
 className={`w-full p-3.5 border-2 border-[#1976D2] rounded-xl font-bold ${
 lockedSite ? "bg-slate-100 text-[#1E3A8A]" : "bg-white text-[#0B1E36]"
 }`}
 >
 <option value="">Select Transfer From</option>
 {CENTERS.map((c) => (
 <option key={c.route} value={c.route}>
 {c.title}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Transfer To (Destination)</label>
 <select
 value={to}
 onChange={(e) => setTo(e.target.value)}
 className="w-full p-3.5 border-2 border-[#1976D2] bg-white rounded-xl text-[#0B1E36] font-bold"
 >
 <option value="">Select Transfer To</option>
 {CENTERS.filter((c) => c.route !== from).map((c) => (
 <option key={c.route} value={c.route}>
 {c.title}
 </option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Product Type</label>
 <select
 value={productType}
 onChange={(e) => setProductType(e.target.value)}
 className="w-full p-3.5 border-2 border-[#1976D2] bg-white rounded-xl text-[#0B1E36] font-bold"
 >
 {PRODUCT_TYPES.map((p) => (
 <option key={p} value={p}>
 {p}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Blood Type</label>
 <select
 value={bloodType}
 onChange={(e) => setBloodType(e.target.value)}
 className="w-full p-3.5 border-2 border-[#1976D2] bg-white rounded-xl text-[#0B1E36] font-bold"
 >
 {BLOOD_TYPES.map((b) => (
 <option key={b} value={b}>
 {b}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 mb-1">Unit ID / Serial Number</label>
 <input
 type="text"
 placeholder="e.g. UNT-2026-9812"
 value={unitId}
 onChange={(e) => setUnitId(e.target.value)}
 className="w-full p-3.5 border-2 border-[#1976D2] bg-white rounded-xl text-[#0B1E36] placeholder-[#1E3A8A]/70 font-bold"
 />
 </div>

 <button
 onClick={handleTransfer}
 disabled={isSubmitting || !from || !to || !unitId.trim()}
 className="w-full bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold py-4 rounded-xl shadow-md transition-transform active:scale-98 disabled:opacity-50 text-base"
 >
 {isSubmitting ? "Executing Transfer..." : "Save and Transfer Unit"}
 </button>
 </div>
 </div>
 );
};
