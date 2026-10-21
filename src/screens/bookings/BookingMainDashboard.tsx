import React from "react";
import { BookingNav } from "../../types";
import { useDataAuth } from "../../hooks/useDataAuth";
import { TIMEZONE } from "../../config/constants";

interface BookingMainDashboardProps {
  isConnected: boolean;
  onNavigate: (nav: BookingNav) => void;
  newsCount: number;
}

export const BookingMainDashboard: React.FC<BookingMainDashboardProps> = ({
  isConnected,
  onNavigate,
  newsCount
}) => {
  const { authRow } = useDataAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { timeZone: TIMEZONE, day: "numeric" });
  const monthStr = now.toLocaleDateString("en-US", { timeZone: TIMEZONE, month: "short" }).toUpperCase();

  const darDay = new Date(new Date().toLocaleString("en-US", { timeZone: TIMEZONE })).getDay();
  const isWeekend = darDay === 0 || darDay === 6;

  const canViewRequestHistory = authRow ? authRow.requestHistoryRead !== "DENIED" : true;

  return (
    <div className="space-y-6 flex-1">
      <div className="bg-blue-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
        <div className="text-3xl">🩸</div>
        <div>
          <h1 className="text-xl font-bold text-black">Mfumo wa Maombi ya Damu</h1>
          <p className="text-[#1976D2] font-bold text-sm">Request Management System</p>
        </div>
      </div>

      {!isConnected && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-xl text-center space-y-2">
          <div className="text-2xl font-bold">⚠️ No Active Internet Connection</div>
          <p className="text-xs">
            The booking system cannot load or display requests because there is no active internet connection.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate(BookingNav.TODAYS_REQUESTS)}
          className="bg-blue-100 hover:bg-blue-200 text-[#0D47A1] rounded-2xl p-6 flex flex-col items-center justify-center font-bold text-center space-y-3 transition-transform active:scale-95 shadow-sm cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center w-14 bg-slate-50 rounded-lg shadow-sm border border-blue-200 overflow-hidden">
            <div className="bg-[#B71C1C] text-white text-[10px] w-full text-center py-1 font-bold uppercase tracking-wider leading-none">
              {monthStr}
            </div>
            <div className="text-2xl font-bold text-[#0B1E36] leading-none py-2">
              {dateStr}
            </div>
          </div>
          <span>Today's Blood Requests</span>
          <span className="text-xs font-semibold opacity-90 mt-1">
            {isWeekend ? "Regular: 7:00am - 12:00pm" : "Regular: 7:00am - 3:00pm"}
          </span>
        </button>

        {canViewRequestHistory && (
          <button
            onClick={() => onNavigate(BookingNav.REQUEST_BUCKET)}
            className="bg-slate-50 hover:bg-slate-200 text-[#0B1E36] rounded-2xl p-6 flex flex-col items-center justify-center font-bold text-center space-y-3 transition-transform active:scale-95 shadow-sm cursor-pointer"
          >
            <span className="text-4xl leading-none py-2">🗂️</span>
            <span>Request History</span>
          </button>
        )}

        <button
          onClick={() => onNavigate(BookingNav.NEWS)}
          className="bg-purple-100 hover:bg-purple-200 text-[#311B92] rounded-2xl p-6 flex flex-col items-center justify-center font-bold text-center space-y-3 transition-transform active:scale-95 shadow-sm relative cursor-pointer"
        >
          <div className="relative">
            <span className="text-4xl leading-none py-2 block">📰</span>
            {newsCount > 0 && (
              <span className="absolute -top-1 -right-3 bg-red-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow animate-pulse">
                {newsCount}
              </span>
            )}
          </div>
          <div className="flex flex-col items-center">
            <span>News & Updates</span>
            <span className="text-xs font-normal text-purple-800 opacity-80">Habari na Taarifa</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate(BookingNav.FORM_DOWNLOADS)}
          className="bg-emerald-50 hover:bg-emerald-100 text-[#00695C] rounded-2xl p-6 flex flex-col items-center justify-center font-bold text-center space-y-3 transition-transform active:scale-95 shadow-sm cursor-pointer"
        >
          <span className="text-4xl leading-none py-2">📥</span>
          <span>Form Downloads</span>
        </button>

        <button
          onClick={() => onNavigate(BookingNav.LIVE_SUPPORT)}
          className="bg-sky-50 hover:bg-sky-100 text-[#0277BD] rounded-2xl p-6 flex flex-col items-center justify-center font-bold text-center space-y-3 transition-transform active:scale-95 shadow-sm cursor-pointer"
        >
          <span className="text-4xl leading-none py-2">🎧</span>
          <div className="flex flex-col items-center">
            <span>Live Support</span>
            <span className="text-xs font-normal text-sky-800 opacity-80">Lab Team & Admins</span>
          </div>
        </button>
      </div>
    </div>
  );
};
