import React from 'react';

interface NavItemProps {
 icon: React.ReactElement;
 label: string;
 isActive: boolean;
 onClick: () => void;
}

export function SidebarItem({ icon, label, isActive, onClick }: NavItemProps) {
 return (
 <button 
 onClick={onClick} 
 className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
 isActive 
 ? 'text-[#0D47A1] font-bold bg-slate-200 shadow-sm' 
 : 'text-[#0B1E36] hover:bg-slate-100 hover:text-[#0D47A1] font-medium bg-transparent'
 }`}
 >
 <div className={`${isActive ? 'text-[#1976D2]' : 'text-slate-500'}`}>
 {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
 </div>
 <span>{label}</span>
 </button>
 );
}

export function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
 return (
 <button 
 onClick={onClick} 
 className="flex flex-col items-center justify-center min-w-[64px] gap-1 cursor-pointer group bg-transparent border-none p-0 outline-none"
 >
 <div className={`relative px-5 py-1 rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden ${isActive ? 'bg-[#C2E7FF]' : 'bg-transparent hover:bg-slate-200/50'}`}>
 {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
 className: `w-6 h-6 relative z-10 transition-colors duration-300 ${isActive ? 'text-[#001D35] fill-[#001D35]/20 stroke-[2.5]' : 'text-[#44474E] stroke-[2] group-hover:text-black'}` 
 })}
 </div>
 <span className={`text-[12px] font-medium transition-colors duration-300 ${isActive ? 'text-[#001D35] font-bold' : 'text-[#44474E]'}`}>{label}</span>
 </button>
 );
}
