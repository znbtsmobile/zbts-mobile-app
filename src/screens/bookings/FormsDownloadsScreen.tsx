import React, { useState } from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  Eye,
  FileText,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  Search,
  PackageCheck
} from "lucide-react";
import {
  FORMS_METADATA,
  FormId,
  FormMeta,
  downloadFormPdf,
  printFormPdf
} from "../../utils/formPdfGenerators";

interface FormsDownloadsScreenProps {
  onBack: () => void;
}

export const FormsDownloadsScreen: React.FC<FormsDownloadsScreenProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [previewForm, setPreviewForm] = useState<FormMeta | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const categories = ["ALL", "Hospital Requisition", "Cold-Chain Logistics", "Hemovigilance & Clinical Audit", "Blood Donor Management"];

  const filteredForms = FORMS_METADATA.filter((form) => {
    const matchesSearch =
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.swahiliTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "ALL" || form.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDownload = (form: FormMeta) => {
    try {
      downloadFormPdf(form.id);
      setDownloadSuccessToast(`Downloaded: ${form.title} (${form.code}.pdf)`);
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err) {
      console.error("Error downloading form:", err);
    }
  };

  const handlePrint = (form: FormMeta) => {
    try {
      printFormPdf(form.id);
    } catch (err) {
      console.error("Error printing form:", err);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    try {
      for (let i = 0; i < FORMS_METADATA.length; i++) {
        const form = FORMS_METADATA[i];
        downloadFormPdf(form.id);
        // Small stagger so browsers don't block multiple file downloads
        await new Promise((r) => setTimeout(r, 600));
      }
      setDownloadSuccessToast("All 4 official ZNBTS forms downloaded successfully!");
      setTimeout(() => setDownloadSuccessToast(null), 4500);
    } catch (err) {
      console.error("Batch download error:", err);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12 animate-fadeIn">
      {/* Top Notification Toast */}
      {downloadSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#0D47A1] text-white px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-blue-400">
          <CheckCircle2 className="w-5 h-5 text-green-300 animate-bounce" />
          <span className="text-sm font-semibold">{downloadSuccessToast}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0D47A1] transition-colors cursor-pointer"
            title="Return to Booking Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📋</span>
              <h1 className="text-2xl font-black text-[#0B1E36] tracking-tight">
                Forms & Official Downloads
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Fomu Rasmi za ZNBTS na Wizara ya Afya Zanzibar | Printable PDF Templates
            </p>
          </div>
        </div>

        {/* Download All Bundle Button */}
        <button
          onClick={handleDownloadAll}
          disabled={isDownloadingAll}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-[#0D47A1] hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isDownloadingAll ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Downloading All (4)...</span>
            </>
          ) : (
            <>
              <PackageCheck className="w-4 h-4" />
              <span>Download All Forms (Bundle)</span>
            </>
          )}
        </button>
      </div>

      {/* Info Callout Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-start space-x-3.5 shadow-sm">
        <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-[#0D47A1] text-sm mb-0.5">
            Official Ministry of Health & ZNBTS Clinical Documentation
          </p>
          These forms are verified against national transfusion safety regulations. You can download
          and print these standardized A4 forms for offline hospital ward requisition, cold-chain courier transport,
          bedside transfusion vital signs monitoring, and voluntary blood donor registration.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search forms by title, Swahili name, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#0D47A1] text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cat === "ALL" ? "All Forms (4)" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredForms.map((form) => (
          <div
            key={form.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Card Header & Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {form.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#0D47A1] border border-blue-200">
                      {form.code}
                    </span>
                    <h2 className="text-lg font-black text-slate-900 leading-tight mt-1">
                      {form.number}. {form.title}
                    </h2>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                  {form.totalPages} {form.totalPages > 1 ? "Pages" : "Page"} (A4)
                </span>
              </div>

              {/* Swahili Subtitle */}
              <p className="text-xs font-semibold text-[#1976D2] italic mb-2">
                {form.swahiliTitle}
              </p>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {form.description}
              </p>

              {/* Key Highlights list */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 space-y-1.5 text-[11px] text-slate-700">
                <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Key Form Sections:</span>
                </p>
                {form.id === "request" && (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                    <li>Hospital urgency indicator (Routine / Urgent / Emergency)</li>
                    <li>Patient clinical indication & baseline Hb levels</li>
                    <li>Whole Blood, PRBC, FFP, Platelets requisition table</li>
                    <li>Specimen verification & Crossmatch compatibility results</li>
                  </ul>
                )}
                {form.id === "transport" && (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                    <li>Dispatch origin to destination hospital route info</li>
                    <li>Validated cold-chain box temperatures (2°C - 6°C)</li>
                    <li>9-Row consignment manifest with unit barcodes & blood groups</li>
                    <li>Courier custody sign-off & arrival acceptance verification</li>
                  </ul>
                )}
                {form.id === "utilization" && (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                    <li>Two-person bedside pre-transfusion verification</li>
                    <li>Vital signs monitoring grid (Baseline, 15m, 1hr, post-transfusion)</li>
                    <li>Hemovigilance adverse reaction reporting (TRALI, febrile, allergic)</li>
                    <li>Unit completion, wastage reasons, and clinical sign-off</li>
                  </ul>
                )}
                {form.id === "donor" && (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                    <li>Donor demographic data, NIDA ID, and donation history</li>
                    <li>Comprehensive 14-point medical health questionnaire</li>
                    <li>Clinical exam: weight, BP, Hb levels (female ≥12, male ≥12.5)</li>
                    <li>Informed consent, TTI screening agreement & phlebotomy record</li>
                  </ul>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDownload(form)}
                className="flex-1 min-w-[140px] flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#0D47A1] hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Form (PDF)</span>
              </button>

              <button
                onClick={() => setPreviewForm(form)}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                title="Preview form structure and layout"
              >
                <Eye className="w-4 h-4 text-blue-700" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => handlePrint(form)}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                title="Send directly to printer"
              >
                <Printer className="w-4 h-4 text-slate-700" />
                <span>Print</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="font-bold text-slate-700">No forms match your search query</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
            className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="bg-[#0D47A1] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">{previewForm.icon}</span>
                <div>
                  <h3 className="font-black text-base leading-tight">
                    {previewForm.number}. {previewForm.title}
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    {previewForm.code} • {previewForm.swahiliTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewForm(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Preview Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Document Header Representation */}
              <div className="border border-slate-300 rounded-xl p-4 bg-slate-50 text-center space-y-1">
                <div className="text-[10px] font-bold text-slate-700 tracking-wider">
                  REVOLUTIONARY GOVERNMENT OF ZANZIBAR • MINISTRY OF HEALTH
                </div>
                <div className="text-xs font-black text-red-700">
                  ZANZIBAR BLOOD TRANSFUSION SERVICE (ZNBTS)
                </div>
                <div className="text-sm font-bold text-[#0D47A1] pt-1 uppercase">
                  {previewForm.title}
                </div>
                <div className="text-[10px] text-slate-500 italic">
                  {previewForm.swahiliTitle}
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-200 mt-2">
                  <span>Ref: {previewForm.code}</span>
                  <span>{previewForm.version}</span>
                  <span>Standard A4 Printable Template</span>
                </div>
              </div>

              {/* Form Specific Preview Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Document Structure & Fields:</h4>

                {previewForm.id === "request" && (
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                    <p className="font-bold text-[#0D47A1]">Section A: Facility & Urgency</p>
                    <p className="text-slate-600">Hospital name, ward, requesting clinician, phone number, and triage priority (Routine / Urgent / Emergency).</p>
                    
                    <p className="font-bold text-[#0D47A1] pt-1">Section B: Patient Clinical Data</p>
                    <p className="text-slate-600">Patient name, IPN/MRN, age, gender, bed, clinical diagnosis, baseline Hb level, previous transfusion reactions, parity.</p>
                    
                    <p className="font-bold text-[#0D47A1] pt-1">Section C: Product Component Grid</p>
                    <p className="text-slate-600">Whole Blood, Packed Red Cells (PRBC), Fresh Frozen Plasma (FFP), Platelet Concentrates, Cryoprecipitate units and ABO/Rh preferences.</p>

                    <p className="font-bold text-[#0D47A1] pt-1">Section D & E: Specimen, Crossmatch & Authorizations</p>
                    <p className="text-slate-600">Nurse specimen collection record, laboratory crossmatch compatibility testing grid, and official stamps.</p>
                  </div>
                )}

                {previewForm.id === "transport" && (
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                    <p className="font-bold text-[#0D47A1]">Section A: Dispatch Origin & Route</p>
                    <p className="text-slate-600">Origin center, destination health facility, ambulance/vehicle registration, driver name and mobile contact.</p>

                    <p className="font-bold text-[#0D47A1] pt-1">Section B: Cold-Chain Verification</p>
                    <p className="text-slate-600">Cold box serial number, calibrated temperature at dispatch (+2°C to +6°C), ice pack verification, tamper-evident security seal.</p>

                    <p className="font-bold text-[#0D47A1] pt-1">Section C: 9-Row Consignment Inventory Manifest</p>
                    <p className="text-slate-600">Bag barcode DIN, blood group, component type, volume (mL), expiration date, and visual inspection check.</p>

                    <p className="font-bold text-[#0D47A1] pt-1">Section D & E: Custody Transfer & Arrival Verification</p>
                    <p className="text-slate-600">Courier handover signatures, destination arrival temperature check, acceptance or rejection notes, and facility stamp.</p>
                  </div>
                )}

                {previewForm.id === "utilization" && (
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                    <p className="font-bold text-[#0D47A1]">Section A & B: Patient, Unit Identification & Bedside Verification</p>
                    <p className="text-slate-600">Patient IPN, unit barcode, blood group, and bedside verification signatures by 2 registered health professionals.</p>

                    <p className="font-bold text-[#0D47A1] pt-1">Section C: Bedside Vital Signs Monitoring Grid</p>
                    <p className="text-slate-600">Recording of BP, pulse, temperature, and respiration at Baseline (0m), 15 minutes, 1 hour, and completion.</p>

                    <p className="font-bold text-[#0D47A1] pt-1">Section D: Hemovigilance & Reaction Audit</p>
                    <p className="text-slate-600">Adverse reaction checkboxes: Febrile Non-Hemolytic, Allergic/Urticarial, Anaphylactic, TRALI, Acute Hemolytic, TACO, and immediate interventions taken.</p>

                    <p className="font-bold text-[#0D47A1] pt-1">Section E: Final Unit Outcome</p>
                    <p className="text-slate-600">Fully transfused, aborted, or returned unused to blood bank within 30 minutes under cold chain.</p>
                  </div>
                )}

                {previewForm.id === "donor" && (
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                    <p className="font-bold text-[#0D47A1]">Section A & B: Donor Demographics & Donation History</p>
                    <p className="text-slate-600">Full name, NIDA/Zanzibar ID, date of birth, Shehia/District address, phone numbers, and past donation count.</p>

                    <p className="font-bold text-[#0D47A1] pt-1">Section C: 14-Point Medical Health Screening</p>
                    <p className="text-slate-600">General fitness, current medications, surgical/piercing history, malaria/fevers, high-risk exposure, and female donor screening.</p>

                    <p className="font-bold text-[#0D47A1] pt-1">Section D: Physical Assessment & Eligibility</p>
                    <p className="text-slate-600">Weight (min 50kg), blood pressure, pulse, Hb level (female ≥12 g/dL, male ≥12.5 g/dL), and deferral decision.</p>

                    <p className="font-bold text-[#0D47A1] pt-1">Section E & F: Informed Consent & Phlebotomy Collection</p>
                    <p className="text-slate-600">Donor signature for TTI testing consent, unit bag DIN barcode, collection volume (mL), duration, and post-donation care.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setPreviewForm(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs cursor-pointer"
              >
                Close Preview
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePrint(previewForm)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => handleDownload(previewForm)}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-[#0D47A1] hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
