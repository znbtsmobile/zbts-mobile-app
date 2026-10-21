import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { UrgencyLevel, RequestStatus } from '../../types';

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel }> = ({ urgency }) => {
 const isUrgent = urgency === "Urgent";
 return (
 <div className="flex items-center gap-1.5">
 {isUrgent ? (
 <AlertTriangle className="w-4 h-4 text-[#C62828] fill-[#C62828]/20" />
 ) : (
 <Clock className="w-4 h-4 text-[#1976D2]" />
 )}
 <span className={`text-sm font-bold ${isUrgent ? "text-[#C62828]" : "text-[#1976D2]"}`}>
 {urgency}
 </span>
 </div>
 );
};

export const RequestStatusBadge: React.FC<{ status: RequestStatus; onClick?: () => void; editable?: boolean }> = ({
 status,
 onClick,
 editable = false
}) => {
 const getStyles = () => {
 switch (status) {
 case "Ready to Collect":
 return "bg-emerald-100 text-emerald-800 border-emerald-300";
 case "Processing":
 return "bg-amber-100 text-amber-800 border-amber-300";
 case "Received":
 return "bg-blue-100 text-blue-800 border-blue-300";
 case "Pending":
 default:
 return "bg-slate-100 text-slate-700 border-slate-300";
 }
 };

 const getIcon = () => {
 switch (status) {
 case "Ready to Collect":
 return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />;
 case "Processing":
 return <Loader2 className="w-3.5 h-3.5 text-amber-700 animate-spin shrink-0" />;
 case "Received":
 return <Sparkles className="w-3.5 h-3.5 text-blue-700 shrink-0" />;
 default:
 return <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />;
 }
 };

 if (editable && onClick) {
 return (
 <button
 onClick={onClick}
 className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all active:scale-95 ${getStyles()} hover:opacity-90`}
 >
 {getIcon()}
 <span>{status}</span>
 <span className="opacity-70 text-[10px]">✏️</span>
 </button>
 );
 }

 return (
 <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 border ${getStyles()}`}>
 {getIcon()}
 <span>{status}</span>
 </span>
 );
};

export const StockLevelBadge: React.FC<{ quantity: number }> = ({ quantity }) => {
 const isOutOfStock = quantity === 0;
 const isLowStock = quantity > 0 && quantity <= 5;

 const bg = isOutOfStock
 ? "bg-red-100 text-[#B71C1C] border-red-200"
 : isLowStock
 ? "bg-amber-100 text-[#D97706] border-amber-200"
 : "bg-emerald-100 text-[#059669] border-emerald-200";

 const label = isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "Normal Stock";

 return (
 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${bg}`}>
 {label}
 </span>
 );
};
