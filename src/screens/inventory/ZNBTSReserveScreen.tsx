import React, { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { BloodStock } from "../../types";
import { CustomStockGrid } from "./CustomStockGrid";
import { UpdateInventoryPanel } from "./UpdateInventoryPanel";

interface ZNBTSReserveScreenProps {
 inventory: BloodStock[];
 onBack: () => void;
 onSaveStock: (
 centerRoute: string,
 updates: Array<{ productType: string; bloodType: string; quantity: number }>
 ) => Promise<boolean>;
}

export const ZNBTSReserveScreen: React.FC<ZNBTSReserveScreenProps> = ({
 inventory,
 onBack,
 onSaveStock
}) => {
 const [isEditing, setIsEditing] = useState(false);
 const znbtsStock = useMemo(() => {
 return inventory.filter(
 (s) => s.centerRoute === "zanzibar" && s.productType !== "PRC"
 );
 }, [inventory]);

 return (
 <div className="space-y-4">
 <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl shadow-sm">
 <div className="flex items-center space-x-3">
 <button
 onClick={() => (isEditing ? setIsEditing(false) : onBack())}
 className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1"
 >
 <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
 </button>
 <div>
 <h2 className="text-[20px] font-bold text-[#0D47A1]">Zanzibar Hifadhi ya Damu</h2>
 <p className="text-xs text-[#1E3A8A] font-semibold">Main Blood Bank Depot</p>
 </div>
 </div>
 <button
 onClick={() => setIsEditing(!isEditing)}
 className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-sm ${
 isEditing
 ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
 : "bg-[#1976D2] hover:bg-[#1565C0] text-white"
 }`}
 >
 {isEditing ? "Cancel" : "Update Stock"}
 </button>
 </div>

 {isEditing ? (
 <UpdateInventoryPanel
 centerRoute="zanzibar"
 centerStock={znbtsStock}
 onSaveStock={onSaveStock}
 onDone={() => setIsEditing(false)}
 />
 ) : (
 <CustomStockGrid stocks={znbtsStock} />
 )}
 </div>
 );
};
