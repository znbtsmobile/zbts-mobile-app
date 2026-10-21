import React, { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { UnitTransfer } from "../../types";
import { CENTERS } from "../../config/constants";
import { formatDateTime } from "../../utils/dateFormatter";
import { PinModal } from "../../components/common/PinModal";

interface TransferHistoryProps {
 transfers: UnitTransfer[];
 onBack: () => void;
 onDeleteTransfer: (id: string) => Promise<void> | void;
}

export const TransferHistory: React.FC<TransferHistoryProps> = ({
 transfers,
 onBack,
 onDeleteTransfer
}) => {
 const [deleteId, setDeleteId] = useState<string | null>(null);

 const getHospitalName = (route: string) => {
 return CENTERS.find((c) => c.route === route)?.title || route;
 };

 return (
 <div className="space-y-4">
 <div className="flex items-center space-x-3 pb-2 pt-2">
 <button
 onClick={onBack}
 className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1"
 >
 <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
 </button>
 <h2 className="text-[22px] font-bold text-[#0D47A1]">Transfer History</h2>
 </div>

 {transfers.length === 0 ? (
 <p className="text-center py-12 text-[#1E3A8A] font-medium">
 No transfer history found.
 </p>
 ) : (
 <div className="space-y-3">
 {transfers.map((t) => {
 const fromName = getHospitalName(t.transferFrom);
 const toName = getHospitalName(t.transferTo);

 return (
 <div
 key={t.id}
 className="bg-slate-50 p-4 rounded-[1.25rem] shadow-sm border border-slate-200"
 >
 <div className="flex justify-between items-center mb-2">
 <span className="text-xs text-[#1D4ED8] font-bold">
 {formatDateTime(t.timestamp)}
 </span>
 <button
 onClick={() => setDeleteId(t.id)}
 title="Delete Transfer Record"
 className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EF5350] via-[#D32F2F] to-[#B71C1C] text-white flex items-center justify-center shadow-sm border border-red-200/40 transition-transform active:scale-90"
 >
 <Trash2 className="w-4 h-4 text-white stroke-[2.2]" />
 </button>
 </div>
 <div className="space-y-1 text-sm text-[#0B1E36]">
 <p>
 <strong className="text-[#0D47A1]">From:</strong> {fromName}
 </p>
 <p>
 <strong className="text-[#0D47A1]">To:</strong> {toName}
 </p>
 <p className="pt-1">
 <strong className="text-[#0D47A1]">Product:</strong> {t.productType} (
 {t.bloodType || "N/A"})
 </p>
 <p className="text-xs text-slate-500 font-medium">
 Unit IDs: {t.unitIds.join(", ")}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Pin Modal for transfer log deletion */}
 <PinModal
 isOpen={!!deleteId}
 title="Delete Transfer Record"
 description="Please enter the verification PIN to delete this transfer history record."
 onConfirm={async () => {
 if (deleteId) {
 await onDeleteTransfer(deleteId);
 setDeleteId(null);
 }
 }}
 onCancel={() => setDeleteId(null)}
 />
 </div>
 );
};
