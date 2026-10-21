import React, { useState } from "react";
import { ArrowRightLeft, Building2, History, Network, Loader2, PackageCheck } from "lucide-react";
import { useInventory } from "../../hooks/useInventory";
import { useTransfers } from "../../hooks/useTransfers";
import { useDataAuth } from "../../hooks/useDataAuth";

import { ZNBTSReserveScreen } from "./ZNBTSReserveScreen";
import { MultiSitesDashboard } from "./MultiSitesDashboard";
import { UnitTransferForm } from "./UnitTransferForm";
import { TransferHistory } from "./TransferHistory";
import { BloodReceptionScreen } from "./BloodReceptionScreen";

type InventoryScreenState =
  | "SELECTION"
  | "ZNBTS_STOCK"
  | "MULTI_SITES"
  | "UNIT_TRANSFER"
  | "HISTORY"
  | "BLOOD_RECEPTION";

export const InventorySystem: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<InventoryScreenState>("SELECTION");

  const { inventory, loading: inventoryLoading, updateCenterStock } = useInventory();
  const { transfers, transferUnit, deleteTransferLog } = useTransfers();
  const { authRow, loading: authLoading } = useDataAuth();

  const canViewZnbts = authRow ? authRow.znbtsReserveStockRead !== "DENIED" : true;

  const renderSelection = () => {
    if (inventoryLoading || authLoading) {
      return (
        <div className="flex flex-col h-full w-full min-h-[400px] justify-center items-center py-20">
          <Loader2 className="text-[#1976D2] w-12 h-12 animate-spin mb-4" />
          <p className="text-[#0D47A1] font-medium">Loading Inventory Modules...</p>
        </div>
      );
    }

    return (
      <div className="bg-slate-50 p-6 rounded-[1.25rem] shadow-sm border border-slate-200 space-y-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#0D47A1]">Stock Module Types</h2>
          <p className="text-sm text-[#0B1E36] font-medium mt-1">
            Select the stock module you want to access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {canViewZnbts && (
            <button
              onClick={() => setCurrentScreen("ZNBTS_STOCK")}
              className="w-full bg-[#ECEFF1] hover:bg-[#CFD8DC] border-2 border-blue-500 text-black font-extrabold py-4 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center gap-3 cursor-pointer"
            >
              <Building2 className="w-8 h-8 text-[#0D47A1] shrink-0" />
              <span>ZNBTS Reserve Stock</span>
            </button>
          )}

          <button
            onClick={() => setCurrentScreen("MULTI_SITES")}
            className="w-full bg-[#ECEFF1] hover:bg-[#CFD8DC] border-2 border-blue-500 text-black font-extrabold py-4 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center gap-3 cursor-pointer"
          >
            <Network className="w-8 h-8 text-[#0D47A1] shrink-0" />
            <span>Multi sites Reserve Stock</span>
          </button>

          <button
            onClick={() => setCurrentScreen("BLOOD_RECEPTION")}
            className="w-full bg-[#ECEFF1] hover:bg-[#CFD8DC] border-2 border-blue-500 text-black font-extrabold py-4 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center gap-3 cursor-pointer"
          >
            <PackageCheck className="w-8 h-8 text-[#0D47A1] shrink-0" />
            <span>Blood Reception</span>
          </button>

          <button
            onClick={() => setCurrentScreen("UNIT_TRANSFER")}
            className="w-full bg-[#ECEFF1] hover:bg-[#CFD8DC] border-2 border-blue-500 text-black font-extrabold py-4 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center gap-3 cursor-pointer"
          >
            <ArrowRightLeft className="w-8 h-8 text-[#0D47A1] shrink-0" />
            <span>Inter Hospital Unit Transfer</span>
          </button>

          <button
            onClick={() => setCurrentScreen("HISTORY")}
            className="w-full bg-[#ECEFF1] hover:bg-[#CFD8DC] border-2 border-blue-500 text-black font-extrabold py-4 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center gap-3 cursor-pointer"
          >
            <History className="w-8 h-8 text-[#0D47A1] shrink-0" />
            <span>Transfer History</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-transparent p-4 font-sans w-full min-h-full text-[#0B1E36]">
      <div className="mb-6 flex items-center justify-between bg-blue-100 p-4 rounded-xl shadow-sm">
        <h1 className="font-bold text-[#0D47A1] text-lg">Blood Bank Zanzibar - Inventory</h1>
      </div>

      {currentScreen === "SELECTION" && renderSelection()}

      {currentScreen === "ZNBTS_STOCK" && (
        <ZNBTSReserveScreen
          inventory={inventory}
          onBack={() => setCurrentScreen("SELECTION")}
          onSaveStock={updateCenterStock}
        />
      )}

      {currentScreen === "MULTI_SITES" && (
        <MultiSitesDashboard
          inventory={inventory}
          onBack={() => setCurrentScreen("SELECTION")}
          onSaveStock={updateCenterStock}
        />
      )}

      {currentScreen === "BLOOD_RECEPTION" && (
        <BloodReceptionScreen
          inventory={inventory}
          onBack={() => setCurrentScreen("SELECTION")}
        />
      )}

      {currentScreen === "UNIT_TRANSFER" && (
        <UnitTransferForm
          inventory={inventory}
          onBack={() => setCurrentScreen("SELECTION")}
          onTransfer={transferUnit}
        />
      )}

      {currentScreen === "HISTORY" && (
        <TransferHistory
          transfers={transfers}
          onBack={() => setCurrentScreen("SELECTION")}
          onDeleteTransfer={deleteTransferLog}
        />
      )}
    </div>
  );
};

export default InventorySystem;
