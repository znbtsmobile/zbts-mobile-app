import React, { useState, useEffect } from "react";
import { Droplet, List, WifiOff, LogOut, Download, TrendingUp } from "lucide-react";
import { auth, onAuthStateChanged, signOut, seedInitialDataIfEmpty, User } from "./services/firebase";
import { DataAuthProvider } from "./context/DataAuthContext";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { usePwaInstall } from "./hooks/usePwaInstall";

import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { SidebarItem, NavItem } from "./components/Navigation";
import LoginScreen from "./screens/login/LoginScreen";
import BookingsScreen from "./screens/bookings/BookingsScreen";
import InventorySystem from "./screens/inventory/InventorySystem";
import TrendScreen from "./screens/trends/TrendScreen";
import LiveSupportScreen from "./screens/admin/LiveSupportScreen";

export default function App() {
  const [activeTab, setActiveTab] = useState(4);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { isOffline } = useNetworkStatus();
  const { canInstall, installPwa } = usePwaInstall();

  // Clear legacy mock session on mount
  useEffect(() => {
    localStorage.removeItem("zbts_current_user");
  }, []);

  // Check for new deployment and force logout
  useEffect(() => {
    try {
      // @ts-ignore - Defined in vite config
      const currentBuild = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : 'dev';
      const storedBuild = localStorage.getItem('app_build_version');

      if (storedBuild && storedBuild !== currentBuild) {
        console.log('New deployment detected! Forcing session termination...');
        localStorage.setItem('app_build_version', currentBuild);
        
        // Log out immediately
        signOut(auth).then(() => {
          window.location.reload();
        }).catch(console.error);
      } else if (!storedBuild) {
        localStorage.setItem('app_build_version', currentBuild);
      }
    } catch (e) {
      console.error('Error checking build version:', e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        seedInitialDataIfEmpty().catch(console.warn);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOffline && (activeTab === 0 || activeTab === 4)) {
      setActiveTab(2);
    }
  }, [isOffline, activeTab]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col h-[100dvh] w-full justify-center items-center bg-blue-50">
        <Droplet className="text-red-600 fill-red-600 w-12 h-12 animate-pulse mb-4" />
        <p className="text-blue-900 font-bold text-lg">Loading Blood Bank Zanzibar...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-[100dvh] w-full bg-slate-300">
        <LoginScreen />
      </div>
    );
  }

  return (
    <DataAuthProvider>
      <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-slate-300 relative overflow-hidden">
        
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:flex flex-col w-64 bg-slate-300 z-20 shrink-0 border-r border-white/40">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <img
                src="/app-icon.jpg"
                alt="Zanzibar Blood Transfusion Service Logo"
                className="w-9 h-9 rounded-full object-cover shadow-sm border border-slate-200 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="font-bold text-[17px] leading-tight text-[#0B1E36]">Blood Bank Zanzibar</h1>
                <p className="text-[11px] text-[#1565C0] font-semibold">MOH Zanzibar</p>
              </div>
            </div>
          </div>

          <div className="flex-1 py-4 space-y-2 px-4 overflow-y-auto">
            <div className="text-xs font-bold text-[#1976D2] uppercase tracking-wider mb-3 px-2">Menu</div>
            {!isOffline && (
              <SidebarItem
                icon={<List />}
                label="Bookings"
                isActive={activeTab === 4}
                onClick={() => setActiveTab(4)}
              />
            )}
            {!isOffline && (
              <SidebarItem
                icon={<Droplet />}
                label="Inventory"
                isActive={activeTab === 0}
                onClick={() => setActiveTab(0)}
              />
            )}
            <SidebarItem
              icon={<TrendingUp />}
              label="Trend"
              isActive={activeTab === 5}
              onClick={() => setActiveTab(5)}
            />
          </div>

          <div className="p-4 space-y-2">
            {canInstall && (
              <button
                onClick={installPwa}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-200 text-[#0D47A1] rounded-xl font-bold transition-all hover:bg-slate-300 active:bg-slate-400 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Install App
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl text-[#0B1E36] hover:text-[#B71C1C] hover:bg-red-50 transition-all font-bold cursor-pointer border border-slate-200 bg-white shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative h-full overflow-hidden bg-slate-300">
          {/* Mobile Top Bar */}
          <div className="md:hidden bg-slate-100 px-4 py-3 flex items-center justify-between z-10 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src="/app-icon.jpg"
                alt="Zanzibar Blood Transfusion Service Logo"
                className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="font-bold text-lg leading-tight text-[#0B1E36] truncate">Blood Bank Zanzibar</h1>
                <p className="text-xs text-[#1565C0] truncate font-semibold">Ministry Of Health</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canInstall && (
                <button
                  onClick={installPwa}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full text-xs font-bold transition-all cursor-pointer border border-blue-200"
                  aria-label="Install App"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-red-600 bg-red-50 hover:bg-red-100 transition-all cursor-pointer border border-red-200"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {isOffline && (
            <div className="bg-[#F9DEDC] text-[#410E0B] px-4 py-3 flex items-center gap-3 z-50 shadow-sm border-b border-[#F2B8B5]">
              <WifiOff className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold">No active internet connection</span>
            </div>
          )}

          {/* Screen Content Container */}
          <div className={`flex-1 overflow-y-auto relative ${isOffline ? "pointer-events-none opacity-60" : ""}`}>
            <div className="max-w-5xl mx-auto w-full min-h-full md:p-6 pb-32 md:pb-6">
              <ErrorBoundary>
                {activeTab === 0 && !isOffline && <InventorySystem />}
                {activeTab === 5 && !isOffline && <TrendScreen />}
                {activeTab === 2 && <LiveSupportScreen />}
                {activeTab === 4 && !isOffline && <BookingsScreen />}
              </ErrorBoundary>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div
            className={`md:hidden absolute bottom-0 w-full bg-[#F3F4F6] flex justify-around pt-3 pb-6 px-2 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] border-t border-slate-200 z-20 ${
              isOffline ? "pointer-events-none" : ""
            }`}
          >
            {!isOffline && (
              <NavItem
                icon={<List />}
                label="Bookings"
                isActive={activeTab === 4}
                onClick={() => setActiveTab(4)}
              />
            )}
            {!isOffline && (
              <NavItem
                icon={<Droplet />}
                label="Inventory"
                isActive={activeTab === 0}
                onClick={() => setActiveTab(0)}
              />
            )}
            {!isOffline && (
              <NavItem
                icon={<TrendingUp />}
                label="Trend"
                isActive={activeTab === 5}
                onClick={() => setActiveTab(5)}
              />
            )}
          </div>
        </div>
      </div>
    </DataAuthProvider>
  );
}
