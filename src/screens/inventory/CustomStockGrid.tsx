import React from "react";
import { BloodStock } from "../../types";
import { PRODUCT_TYPES, BLOOD_TYPES } from "../../config/constants";
import { StockLevelBadge } from "../../components/common/StatusBadge";

interface CustomStockGridProps {
 stocks: BloodStock[];
}

export const CustomStockGrid: React.FC<CustomStockGridProps> = ({ stocks }) => {
 const grouped = PRODUCT_TYPES.map((pType) => ({
 type: pType,
 items: BLOOD_TYPES.map((bType) => {
 const match = stocks.find((s) => s.productType === pType && s.bloodType === bType);
 return { bloodType: bType, quantity: match?.quantity || 0 };
 })
 }));

 return (
 <div className="space-y-6">
 {grouped.map((group) => (
 <div key={group.type}>
 <h3 className="font-bold text-black mb-3 ml-1 text-lg">{group.type}</h3>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
 {group.items.map((item) => {
 const bg =
 item.quantity === 0
 ? "bg-red-50 border-red-200"
 : item.quantity <= 5
 ? "bg-amber-50 border-amber-200"
 : "bg-slate-100 border-slate-200";

 const badgeBg =
 item.quantity === 0
 ? "bg-[#B71C1C]"
 : item.quantity <= 5
 ? "bg-[#D97706]"
 : "bg-[#059669]";

 return (
 <div
 key={item.bloodType}
 className={`${bg} rounded-xl p-3 flex justify-between items-center shadow-sm border`}
 >
 <div
 className={`${badgeBg} text-white font-extrabold w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-sm shrink-0`}
 >
 {item.bloodType}
 </div>
 <div className="text-right flex flex-col items-end">
 <p className="font-bold text-lg text-black leading-tight">
 {item.quantity} <span className="text-xs font-semibold text-slate-700">Units</span>
 </p>
 <div className="mt-1">
 <StockLevelBadge quantity={item.quantity} />
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>
 );
};
