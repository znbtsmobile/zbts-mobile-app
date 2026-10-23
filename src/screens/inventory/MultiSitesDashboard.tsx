import React, { useState, useMemo } from "react";
import { ArrowLeft, Building2, ChevronRight, Search } from "lucide-react";
import { BloodStock, Center } from "../../types";
import { CENTERS, BLOOD_TYPES } from "../../config/constants";
import { useDataAuth } from "../../hooks/useDataAuth";
import { CustomStockGrid } from "./CustomStockGrid";
import { UpdateInventoryPanel } from "./UpdateInventoryPanel";

interface MultiSitesDashboardProps {
  inventory: BloodStock[];
  onBack: () => void;
  onSaveStock: (
    centerRoute: string,
    updates: Array<{ productType: string; bloodType: string; quantity: number }>
  ) => Promise<boolean>;
}

export const MultiSitesDashboard: React.FC<MultiSitesDashboardProps> = ({
  inventory,
  onBack,
  onSaveStock
}) => {
  const [search, setSearch] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { authRow } = useDataAuth();

  const partners = useMemo(() => {
    const term = search.trim().toLowerCase();
    return CENTERS.filter(
      (c) => c.route !== "zanzibar" && c.title.toLowerCase().includes(term)
    );
  }, [search]);

  // Pre-aggregate inventory per center route for O(1) card lookups
  const hospitalStockMap = useMemo(() => {
    const map = new Map<string, number>();
    const validBloodTypes = new Set(BLOOD_TYPES as readonly string[]);
    inventory.forEach((s) => {
      if (s.productType !== "PRC" && validBloodTypes.has(s.bloodType)) {
        map.set(s.centerRoute, (map.get(s.centerRoute) || 0) + Number(s.quantity || 0));
      }
    });
    return map;
  }, [inventory]);

  const centerStock = useMemo(() => {
    if (!selectedCenter) return [];
    return inventory.filter(
      (s) => s.centerRoute === selectedCenter.route && s.productType !== "PRC"
    );
  }, [inventory, selectedCenter]);

  if (selectedCenter) {
    const canEdit = !authRow?.hospitalSite || authRow.hospitalSite === selectedCenter.route;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 pt-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => (isEditing ? setIsEditing(false) : setSelectedCenter(null))}
              className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1 cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <h2 className="text-[22px] font-bold text-[#0D47A1]">{selectedCenter.title}</h2>
          </div>
          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-sm cursor-pointer ${
                isEditing
                  ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  : "bg-[#1976D2] hover:bg-[#1565C0] text-white"
              }`}
            >
              {isEditing ? "Cancel" : "Update Stock"}
            </button>
          )}
        </div>

        {isEditing && canEdit ? (
          <UpdateInventoryPanel
            centerRoute={selectedCenter.route}
            centerStock={centerStock}
            onSaveStock={onSaveStock}
            onDone={() => setIsEditing(false)}
          />
        ) : (
          <CustomStockGrid stocks={centerStock} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center space-x-3 pb-2 pt-2">
        <button
          onClick={onBack}
          className="text-[#1976D2] hover:text-[#1565C0] transition-transform active:scale-95 p-1 cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>
        <h2 className="text-[22px] font-bold text-[#0D47A1]">Partner Hospitals</h2>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#1976D2]" />
        </div>
        <input
          type="text"
          placeholder="Search partner hospitals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white rounded-[1.25rem] border-2 border-[#1976D2] focus:ring-2 focus:ring-[#1976D2]/30 focus:outline-none text-[#0B1E36] placeholder-[#1E3A8A]/70 font-semibold shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {partners.map((hospital) => {
          const totalUnits = hospitalStockMap.get(hospital.route) || 0;

          return (
            <div
              key={hospital.route}
              onClick={() => setSelectedCenter(hospital)}
              className="bg-slate-50 p-4 rounded-[1.25rem] shadow-sm cursor-pointer transition-transform active:scale-98 flex justify-between items-center border border-white/60 hover:bg-slate-100/80"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
                  <Building2 className="text-[#1976D2] w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-black text-lg leading-tight">{hospital.title}</h3>
                  <p className="text-sm text-slate-700 font-bold mt-0.5">{totalUnits} total stock units</p>
                </div>
              </div>
              <ChevronRight className="text-[#1976D2] w-6 h-6 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
