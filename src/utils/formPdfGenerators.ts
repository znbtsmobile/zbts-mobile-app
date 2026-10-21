import { jsPDF } from "jspdf";

export type FormId = "request" | "transport" | "utilization" | "donor";

export interface FormMeta {
  id: FormId;
  number: number;
  code: string;
  title: string;
  swahiliTitle: string;
  category: string;
  description: string;
  icon: string;
  version: string;
  totalPages: number;
}

export const FORMS_METADATA: FormMeta[] = [
  {
    id: "request",
    number: 1,
    code: "ZNBTS-FRM-REQ-001",
    title: "Blood Request Form",
    swahiliTitle: "Fomu ya Maombi ya Damu na Vyakula vyake",
    category: "Hospital Requisition",
    description:
      "Standard clinical requisition form for physicians and ward staff to request blood components (Whole Blood, PRBC, FFP, Platelets) for patients.",
    icon: "🩸",
    version: "Rev. 3.2 / 2026",
    totalPages: 1
  },
  {
    id: "transport",
    number: 2,
    code: "ZNBTS-FRM-TRN-002",
    title: "Blood Transportation Form",
    swahiliTitle: "Fomu ya Usafirishaji na Mnyororo Baridi wa Damu",
    category: "Cold-Chain Logistics",
    description:
      "Cold-chain logistics and custody transfer voucher documenting dispatch, cold box temperatures, unit barcodes, and courier acceptance.",
    icon: "🚐",
    version: "Rev. 2.1 / 2026",
    totalPages: 1
  },
  {
    id: "utilization",
    number: 3,
    code: "ZNBTS-FRM-UTL-003",
    title: "Blood Utilization Form",
    swahiliTitle: "Fomu ya Matumizi na Ufuatiliaji wa Madhara ya Damu",
    category: "Hemovigilance & Clinical Audit",
    description:
      "Bedside transfusion recording and hemovigilance form tracking administration, baseline vitals, reactions, and unit outcomes.",
    icon: "📋",
    version: "Rev. 2.0 / 2026",
    totalPages: 1
  },
  {
    id: "donor",
    number: 4,
    code: "ZNBTS-FRM-DNR-004",
    title: "Donor Registration Form",
    swahiliTitle: "Fomu ya Usajili, Uchunguzi na Idhini ya Mchangiaji Damu",
    category: "Blood Donor Management",
    description:
      "Voluntary donor demographic registration, health screening questionnaire, physical assessment, and informed consent declaration.",
    icon: "❤️",
    version: "Rev. 4.0 / 2026",
    totalPages: 2
  }
];

// Helper to draw standard Ministry / ZNBTS document header
function drawHeader(
  doc: jsPDF,
  formCode: string,
  formTitle: string,
  swahiliTitle: string,
  version: string
) {
  // Top Banner
  doc.setFillColor(13, 71, 161); // ZNBTS Primary Blue
  doc.rect(10, 10, 190, 4, "F");

  // Country & Ministry
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text("REVOLUTIONARY GOVERNMENT OF ZANZIBAR", 105, 19, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text("MINISTRY OF HEALTH | WIZARA YA AFYA ZANZIBAR", 105, 23.5, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(183, 28, 28); // Crimson Red
  doc.text("ZANZIBAR BLOOD TRANSFUSION SERVICE (ZNBTS)", 105, 28.5, { align: "center" });

  // Title Box
  doc.setFillColor(240, 244, 248);
  doc.setDrawColor(13, 71, 161);
  doc.setLineWidth(0.4);
  doc.roundedRect(10, 31, 190, 12, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(13, 71, 161);
  doc.text(formTitle.toUpperCase(), 105, 36.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(swahiliTitle, 105, 41, { align: "center" });

  // Meta Badges
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 100, 100);
  doc.text(`DOC REF: ${formCode}`, 12, 47);
  doc.text(`VERSION: ${version}`, 105, 47, { align: "center" });
  doc.text("DISTRIBUTION: ORIGINAL (ZNBTS) | COPY (FACILITY)", 198, 47, { align: "right" });

  doc.setDrawColor(200, 200, 200);
  doc.line(10, 49, 200, 49);
}

// Helper to draw section title
function drawSection(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(230, 238, 248);
  doc.rect(10, y, 190, 5, "F");
  doc.setDrawColor(13, 71, 161);
  doc.setLineWidth(0.6);
  doc.line(10, y, 10, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(13, 71, 161);
  doc.text(title, 13, y + 3.8);

  return y + 7;
}

// Helper to draw footer
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(10, 285, 200, 285);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text("ZNBTS Head Office, Mnazi Mmoja, P.O. Box 236, Zanzibar | Hotline: +255 24 223 1234 | Emergency: 115", 10, 289);
  doc.text(`Page ${pageNum} of ${totalPages}`, 200, 289, { align: "right" });
}

// -------------------------------------------------------------
// 1. Blood Request Form (ZNBTS-FRM-REQ-001)
// -------------------------------------------------------------
export function createBloodRequestPdf(): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  drawHeader(
    doc,
    "ZNBTS-FRM-REQ-001",
    "Clinical Blood & Blood Components Requisition Form",
    "Fomu Rasmi ya Maombi ya Damu na Vyakula vyake kwa Ajili ya Wagonjwa",
    "Rev. 3.2 / 2026"
  );

  let y = 52;

  // SECTION A: Hospital & Clinical Urgency
  y = drawSection(doc, "SECTION A: REQUESTING HEALTH FACILITY & CLINICAL URGENCY", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  doc.text("Health Facility / Hospital: ___________________________________", 12, y + 4);
  doc.text("Ward / Unit: _______________________", 120, y + 4);
  doc.text("Date: ____/____/2026", 168, y + 4);

  doc.text("Requesting Clinician / Doctor: ________________________________", 12, y + 10);
  doc.text("Designation: _______________________", 120, y + 10);
  doc.text("Phone / Ext: ________________", 168, y + 10);

  doc.setFont("helvetica", "bold");
  doc.text("CLINICAL URGENCY LEVEL:", 12, y + 16);
  doc.setFont("helvetica", "normal");
  doc.text("[  ] EMERGENCY (Immediate STAT, life-threatening)", 58, y + 16);
  doc.text("[  ] URGENT (Within 4 - 6 hours)", 126, y + 16);
  doc.text("[  ] ROUTINE (24 hours)", 170, y + 16);

  y += 21;

  // SECTION B: Patient Identification & Clinical Diagnosis
  y = drawSection(doc, "SECTION B: PATIENT DETAILS & CLINICAL INDICATION", y);

  doc.text("Patient Full Name (Jina la Mgonjwa): __________________________________________", 12, y + 4);
  doc.text("Hospital IPN / File No: _______________", 140, y + 4);

  doc.text("Age: _______ Yrs", 12, y + 10);
  doc.text("Gender: [  ] Male  [  ] Female", 48, y + 10);
  doc.text("Bed No: _________", 96, y + 10);
  doc.text("Weight (kg): ________", 136, y + 10);
  doc.text("Known Blood Group: ________", 168, y + 10);

  doc.text("Clinical Diagnosis / Surgical Procedure: ____________________________________________________________________", 12, y + 16);
  doc.text("Reason for Transfusion: _____________________________________", 12, y + 22);
  doc.text("Current Hb Level: ______ g/dL", 115, y + 22);
  doc.text("Transfusion Date Required: ____/____/2026", 155, y + 22);

  doc.text("Previous Transfusion History?  [  ] NO   [  ] YES   (If YES, approximate date: ____________ Adverse reaction? [  ] No [  ] Yes)", 12, y + 28);
  doc.text("For Female Patients - Obstetric History: Number of Pregnancies (Parity): _______  History of HDN in child? [  ] No [  ] Yes", 12, y + 34);

  y += 39;

  // SECTION C: Blood Components Requested
  y = drawSection(doc, "SECTION C: BLOOD COMPONENTS REQUIRED (Vipengele vya Damu Vinavyohitajika)", y);

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(10, y, 190, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 30, 30);
  doc.text("NO", 12, y + 4.2);
  doc.text("BLOOD PRODUCT / COMPONENT", 22, y + 4.2);
  doc.text("GROUP PREFERENCE", 90, y + 4.2);
  doc.text("UNITS REQ", 132, y + 4.2);
  doc.text("SPECIAL REQUIREMENTS (Leuko-depleted / Paediatric / etc.)", 150, y + 4.2);

  const products = [
    { no: "1", name: "Whole Blood (WB)", grp: "ABO: ____  Rh: [ ]Pos [ ]Neg", units: "_____ Units", spec: "________________________" },
    { no: "2", name: "Packed Red Blood Cells (PRBC)", grp: "ABO: ____  Rh: [ ]Pos [ ]Neg", units: "_____ Units", spec: "________________________" },
    { no: "3", name: "Fresh Frozen Plasma (FFP)", grp: "ABO: ____  Rh: [ ]Pos [ ]Neg", units: "_____ Units", spec: "________________________" },
    { no: "4", name: "Platelet Concentrates (PLT)", grp: "ABO: ____  Rh: [ ]Pos [ ]Neg", units: "_____ Units", spec: "________________________" },
    { no: "5", name: "Cryoprecipitate", grp: "ABO: ____  Rh: [ ]Pos [ ]Neg", units: "_____ Units", spec: "________________________" }
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  let rowY = y + 6;
  products.forEach((p) => {
    doc.rect(10, rowY, 190, 6);
    doc.text(p.no, 13, rowY + 4.2);
    doc.text(p.name, 22, rowY + 4.2);
    doc.text(p.grp, 90, rowY + 4.2);
    doc.text(p.units, 132, rowY + 4.2);
    doc.text(p.spec, 150, rowY + 4.2);
    rowY += 6;
  });

  y = rowY + 3;

  // SECTION D: Specimen & Clinician Signature
  y = drawSection(doc, "SECTION D: SPECIMEN COLLECTION & CLINICAL AUTHORIZATION", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Blood Sample Drawn By (Nurse/Phlebotomist): ___________________________", 12, y + 4);
  doc.text("Date: ____/____/2026", 120, y + 4);
  doc.text("Time: ______ hrs", 168, y + 4);

  doc.text("Requesting Clinician Signature: ____________________________________", 12, y + 10);
  doc.text("Official Hospital Stamp:", 120, y + 10);

  // Stamp Box
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1, 1], 0);
  doc.rect(120, y + 12, 45, 18);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text("Official Stamp Here", 132, y + 22);

  y += 33;

  // SECTION E: For Blood Bank / Laboratory Use Only
  y = drawSection(doc, "SECTION E: FOR ZNBTS / HOSPITAL BLOOD BANK LABORATORY USE ONLY", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);

  doc.text("Specimen Received By: __________________________", 12, y + 4);
  doc.text("Date: ____/____/2026", 90, y + 4);
  doc.text("Time: _______ hrs", 130, y + 4);
  doc.text("Visual Check: [  ] Good  [  ] Hemolyzed", 160, y + 4);

  doc.text("Patient Confirmatory ABO Group: ________  Rh(D): [  ] Positive  [  ] Negative    Antibody Screen: [  ] Neg  [  ] Pos", 12, y + 9);

  // Crossmatch mini table
  doc.rect(10, y + 12, 190, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("UNIT BAG NO.", 14, y + 15.5);
  doc.text("DONOR GROUP", 55, y + 15.5);
  doc.text("EXPIRY DATE", 92, y + 15.5);
  doc.text("COMPATIBILITY RESULT", 125, y + 15.5);
  doc.text("TECHNOLOGIST INITIALS", 165, y + 15.5);

  for (let i = 0; i < 3; i++) {
    const cy = y + 17 + i * 5;
    doc.rect(10, cy, 190, 5);
    doc.setFont("helvetica", "normal");
    doc.text("________________", 12, cy + 3.8);
    doc.text("___________", 55, cy + 3.8);
    doc.text("____/____/2026", 92, cy + 3.8);
    doc.text("[  ] COMPATIBLE   [  ] INCOMPATIBLE", 125, cy + 3.8);
    doc.text("____________", 168, cy + 3.8);
  }

  const endY = y + 34;
  doc.setFontSize(7.5);
  doc.text("Released By (Lab Technologist): ____________________________", 12, endY + 4);
  doc.text("Signature: __________________", 100, endY + 4);
  doc.text("Issue Date/Time: ____/____/2026 ____:____", 145, endY + 4);

  drawFooter(doc, 1, 1);

  return doc;
}

// -------------------------------------------------------------
// 2. Blood Transportation Form (ZNBTS-FRM-TRN-002)
// -------------------------------------------------------------
export function createBloodTransportationPdf(): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  drawHeader(
    doc,
    "ZNBTS-FRM-TRN-002",
    "Blood & Blood Products Cold-Chain Transportation Voucher",
    "Fomu ya Usafirishaji wa Damu na Uzingatiaji wa Mnyororo Baridi (Cold-Chain)",
    "Rev. 2.1 / 2026"
  );

  let y = 52;

  // SECTION A: Dispatch & Route Information
  y = drawSection(doc, "SECTION A: DISPATCH ORIGIN, DESTINATION & LOGISTICS ROUTE", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  doc.text("Origin / Dispatching Center: [  ] ZNBTS Central Reserve   [  ] MMH Blood Bank   [  ] Wete Depot   [  ] Other: __________________", 12, y + 4);
  doc.text("Destination Health Facility: __________________________________________________", 12, y + 10);
  doc.text("Department / Ward: __________________", 150, y + 10);

  doc.text("Dispatch Date: ____/____/2026", 12, y + 16);
  doc.text("Dispatch Time: ______ hrs (EAT)", 70, y + 16);
  doc.text("Transport Mode: [  ] Dedicated Ambulance  [  ] Logistics Van  [  ] Ferry", 125, y + 16);

  doc.text("Vehicle Registration No: ____________________", 12, y + 22);
  doc.text("Driver / Courier Name: _______________________________", 80, y + 22);
  doc.text("Phone: ________________", 160, y + 22);

  y += 28;

  // SECTION B: Cold Chain Packaging Verification
  y = drawSection(doc, "SECTION B: COLD-CHAIN INTEGRITY & PACKAGING SPECIFICATION", y);

  doc.text("Cooler / Transport Box Serial No: ________________________", 12, y + 4);
  doc.text("Container Type: [  ] Validated Passive Cold Box   [  ] Active Electric Cooler", 110, y + 4);

  doc.text("Refrigerant Used: [  ] Conditioned Ice Packs (0°C)   [  ] Phase-Change Material   [  ] Dry Ice (Frozen only)", 12, y + 10);

  doc.setFont("helvetica", "bold");
  doc.text("COLD BOX TEMPERATURE AT DISPATCH: ________ °C", 12, y + 16);
  doc.setFont("helvetica", "normal");
  doc.text("(Standard target: Whole Blood/PRBC = +2°C to +6°C | Platelets = +20°C to +24°C | FFP = <-18°C)", 85, y + 16);

  doc.text("Tamper-Evident Security Seal Number: ________________________", 12, y + 22);
  doc.text("Digital Data Logger Attached?  [  ] YES (Serial: ___________________)   [  ] NO", 110, y + 22);

  y += 28;

  // SECTION C: Consignment Inventory Manifest
  y = drawSection(doc, "SECTION C: CONSIGNMENT INVENTORY MANIFEST (Orodha ya Damu Inayosafirishwa)", y);

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(10, y, 190, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(30, 30, 30);
  doc.text("NO", 12, y + 4.2);
  doc.text("UNIT BAG DIN / BARCODE", 22, y + 4.2);
  doc.text("BLOOD GRP", 68, y + 4.2);
  doc.text("COMPONENT", 92, y + 4.2);
  doc.text("VOL (mL)", 120, y + 4.2);
  doc.text("EXPIRY DATE", 140, y + 4.2);
  doc.text("VISUAL INSPECTION (Normal/Defect)", 162, y + 4.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  let rowY = y + 6;
  for (let i = 1; i <= 9; i++) {
    doc.rect(10, rowY, 190, 5.5);
    doc.text(String(i), 13, rowY + 3.8);
    doc.text("__________________________", 22, rowY + 3.8);
    doc.text("ABO: ___ Rh: [ ]+/-", 68, rowY + 3.8);
    doc.text("[ ]WB [ ]PRBC [ ]FFP", 92, rowY + 3.8);
    doc.text("_______", 121, rowY + 3.8);
    doc.text("____/____/2026", 140, rowY + 3.8);
    doc.text("[  ] PASS   [  ] REJECT", 165, rowY + 3.8);
    rowY += 5.5;
  }

  y = rowY + 3;

  // SECTION D: Dispatch Custody Handover
  y = drawSection(doc, "SECTION D: DISPATCH CUSTODY & HANDOVER DECLARATION", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("I certify that the blood units listed above have been inspected, packed in accordance with national cold-chain standards.", 12, y + 3.5);

  doc.text("Dispatched By (Laboratory Officer): _________________________________", 12, y + 9);
  doc.text("Signature: _______________________", 115, y + 9);
  doc.text("Date: ____/____/2026", 165, y + 9);

  doc.text("Courier / Transporter Acceptance: __________________________________", 12, y + 15);
  doc.text("Signature: _______________________", 115, y + 15);
  doc.text("Time: _______ hrs", 165, y + 15);

  y += 21;

  // SECTION E: Receipt & Acceptance at Destination Facility
  y = drawSection(doc, "SECTION E: RECEIPT & COLD-CHAIN ACCEPTANCE AT DESTINATION FACILITY", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  doc.text("Arrival Date: ____/____/2026", 12, y + 4);
  doc.text("Arrival Time: _______ hrs", 60, y + 4);
  doc.setFont("helvetica", "bold");
  doc.text("TEMPERATURE AT ARRIVAL: ________ °C", 110, y + 4);
  doc.setFont("helvetica", "normal");

  doc.text("Security Seal Condition: [  ] Intact / Undamaged   [  ] Broken / Tampered", 12, y + 10);
  doc.text("Consignment Acceptance Status: [  ] FULLY ACCEPTED   [  ] PARTIALLY ACCEPTED   [  ] REJECTED", 100, y + 10);

  doc.text("Discrepancies / Cold-Chain Breach Remarks: ____________________________________________________________________", 12, y + 16);

  doc.text("Received By (Hospital Lab Technologist): ____________________________", 12, y + 22);
  doc.text("Signature: ____________________", 115, y + 22);
  doc.text("Official Stamp:", 165, y + 22);

  // Mini stamp box
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1, 1], 0);
  doc.rect(165, y + 15, 33, 14);
  doc.setLineDashPattern([], 0);

  drawFooter(doc, 1, 1);

  return doc;
}

// -------------------------------------------------------------
// 3. Blood Utilization Form (ZNBTS-FRM-UTL-003)
// -------------------------------------------------------------
export function createBloodUtilizationPdf(): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  drawHeader(
    doc,
    "ZNBTS-FRM-UTL-003",
    "Blood Utilization & Hemovigilance Adverse Event Report",
    "Fomu ya Matumizi ya Damu, Ufuatiliaji wa Mgonjwa na Ripoti ya Madhara",
    "Rev. 2.0 / 2026"
  );

  let y = 52;

  // SECTION A: Hospital & Patient Details
  y = drawSection(doc, "SECTION A: HOSPITAL, PATIENT & CLINICAL WARD PARTICULARS", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  doc.text("Health Facility / Hospital: ___________________________________", 12, y + 4);
  doc.text("Ward / Unit: _______________________", 120, y + 4);
  doc.text("Date: ____/____/2026", 168, y + 4);

  doc.text("Patient Full Name (Jina Kamili): ____________________________________________", 12, y + 10);
  doc.text("IPN / File No: _________________", 145, y + 10);

  doc.text("Age: ______ Yrs", 12, y + 16);
  doc.text("Gender: [  ] Male  [  ] Female", 45, y + 16);
  doc.text("Bed No: ________", 95, y + 16);
  doc.text("Patient Blood Group: ABO: _______ Rh: [ ]Pos [ ]Neg", 130, y + 16);

  y += 22;

  // SECTION B: Transfused Unit Particulars
  y = drawSection(doc, "SECTION B: TRANSFUSED UNIT SPECIFICATIONS & VERIFICATION", y);

  doc.text("Unit DIN / Bag Barcode: ___________________________________", 12, y + 4);
  doc.text("Unit Blood Group: ABO: ______ Rh: [ ]Pos [ ]Neg", 110, y + 4);

  doc.text("Component Type: [  ] Whole Blood   [  ] PRBC   [  ] FFP   [  ] Platelets   [  ] Cryo", 12, y + 10);
  doc.text("Unit Expiry Date: ____/____/2026", 145, y + 10);

  doc.text("Pre-Transfusion Bedside Crosscheck: Verified by 2 Registered Health Professionals:", 12, y + 16);
  doc.text("Staff 1 (Name & Sign): ____________________________________", 15, y + 22);
  doc.text("Staff 2 (Name & Sign): ____________________________________", 110, y + 22);

  y += 27;

  // SECTION C: Transfusion Administration & Vital Signs Monitoring
  y = drawSection(doc, "SECTION C: BEDSIDE VITAL SIGNS MONITORING RECORD", y);

  doc.text("Transfusion Start Time: ______ hrs (EAT)", 12, y + 4);
  doc.text("Transfusion End Time: ______ hrs (EAT)", 80, y + 4);
  doc.text("Total Volume Infused: _______ mL", 150, y + 4);

  // Monitoring Table
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(180, 180, 180);
  doc.rect(10, y + 7, 190, 5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("TIME INTERVAL", 14, y + 10.5);
  doc.text("TIME (Hrs)", 55, y + 10.5);
  doc.text("BP (mmHg)", 82, y + 10.5);
  doc.text("PULSE (bpm)", 110, y + 10.5);
  doc.text("TEMP (°C)", 138, y + 10.5);
  doc.text("RESP (bpm)", 162, y + 10.5);
  doc.text("INITIALS", 185, y + 10.5);

  const intervals = [
    "Baseline (Immediate Pre-transfusion)",
    "15 Minutes after Start (Crucial check)",
    "1 Hour into Transfusion",
    "End of Transfusion (Post-completion)",
    "4 Hours Post-Transfusion"
  ];

  doc.setFont("helvetica", "normal");
  let tY = y + 12;
  intervals.forEach((item) => {
    doc.rect(10, tY, 190, 5);
    doc.text(item, 12, tY + 3.8);
    doc.text("______", 55, tY + 3.8);
    doc.text("____/____", 82, tY + 3.8);
    doc.text("______", 112, tY + 3.8);
    doc.text("______", 140, tY + 3.8);
    doc.text("______", 164, tY + 3.8);
    doc.text("______", 186, tY + 3.8);
    tY += 5;
  });

  y = tY + 3;

  // SECTION D: Hemovigilance & Adverse Transfusion Reactions
  y = drawSection(doc, "SECTION D: HEMOVIGILANCE & ADVERSE TRANSFUSION REACTION REPORT", y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("WAS ANY ADVERSE TRANSFUSION REACTION OBSERVED?   [  ] NO (Uneventful)    [  ] YES (Report Below)", 12, y + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("If YES, select reaction category & clinical symptoms observed:", 12, y + 9);

  doc.text("[  ] Febrile Non-Hemolytic (Temperature rise >= 1°C, rigors, chills)", 15, y + 14);
  doc.text("[  ] Allergic / Urticarial (Itching, hives, localized rash)", 110, y + 14);

  doc.text("[  ] Anaphylactic / Severe (Bronchospasm, stridor, hypotension)", 15, y + 19);
  doc.text("[  ] Acute Hemolytic (Loin/back pain, red/dark urine, hypotension)", 110, y + 19);

  doc.text("[  ] TRALI (Transfusion-Related Acute Lung Injury / Severe hypoxia)", 15, y + 24);
  doc.text("[  ] TACO (Transfusion-Associated Circulatory Overload / Edema)", 110, y + 24);

  doc.text("Immediate Clinical Actions Taken: [  ] Stopped Transfusion immediately   [  ] IV Line kept open with 0.9% Normal Saline", 12, y + 30);
  doc.text("[  ] Blood Bank Notified   [  ] Blood bag & post-transfusion patient samples returned to ZNBTS Laboratory for workup", 12, y + 35);

  y += 40;

  // SECTION E: Final Unit Outcome & Sign-Off
  y = drawSection(doc, "SECTION E: UNIT OUTCOME, DISPOSAL & CLINICAL SIGN-OFF", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Final Unit Status: [  ] Transfused completely in full    [  ] Transfusion aborted prematurely    [  ] Returned unused    [  ] Wasted/Discarded", 12, y + 4);
  doc.text("Reason for Non-use or Discard (if applicable): ____________________________________________________________________", 12, y + 9);

  doc.text("Transfusion Administered By (Staff Nurse): ____________________________", 12, y + 15);
  doc.text("Signature: ____________________", 100, y + 15);
  doc.text("Date: ____/____/2026", 155, y + 15);

  doc.text("Attending Medical Officer / Doctor: __________________________________", 12, y + 21);
  doc.text("Signature: ____________________", 100, y + 21);
  doc.text("Hospital Stamp:", 155, y + 21);

  // Mini stamp
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([1, 1], 0);
  doc.rect(155, y + 12, 38, 14);
  doc.setLineDashPattern([], 0);

  drawFooter(doc, 1, 1);

  return doc;
}

// -------------------------------------------------------------
// 4. Donor Registration Form (ZNBTS-FRM-DNR-004) - 2 Pages
// -------------------------------------------------------------
export function createDonorRegistrationPdf(): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // === PAGE 1 ===
  drawHeader(
    doc,
    "ZNBTS-FRM-DNR-004",
    "Voluntary Blood Donor Registration & Screening Questionnaire",
    "Fomu ya Usajili, Uchunguzi wa Afya na Idhini ya Mchangiaji wa Hiari",
    "Rev. 4.0 / 2026"
  );

  let y = 52;

  // SECTION A: Donor Demographics
  y = drawSection(doc, "SECTION A: DONOR DEMOGRAPHICS & CONTACT DETAILS (Taarifa Binafsi za Mchangiaji)", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  doc.text("Donor Card ID / Barcode: __________________________", 12, y + 4);
  doc.text("Registration Date: ____/____/2026", 130, y + 4);

  doc.text("Surname (Jina la Ukoo): ____________________________", 12, y + 10);
  doc.text("First Name: _______________________", 90, y + 10);
  doc.text("Middle Name: ________________", 150, y + 10);

  doc.text("National ID (NIDA) / Zanzibar Resident ID: ________________________", 12, y + 16);
  doc.text("Date of Birth: ____/____/________", 110, y + 16);
  doc.text("Age: ______ Yrs", 165, y + 16);

  doc.text("Gender: [  ] Male (Mwanaume)   [  ] Female (Mwanamke)", 12, y + 22);
  doc.text("Marital Status: [  ] Single  [  ] Married  [  ] Other", 110, y + 22);

  doc.text("Primary Phone / Simu: ________________________", 12, y + 28);
  doc.text("WhatsApp Number: ________________________", 90, y + 28);
  doc.text("Occupation: __________________", 150, y + 28);

  doc.text("Physical Residence: Region: ___________________  District (Wilaya): ___________________  Shehia: ___________________", 12, y + 34);

  y += 39;

  // SECTION B: Donation Category
  y = drawSection(doc, "SECTION B: DONATION TYPE & DONATION HISTORY (Historia ya Kuchangia Damu)", y);

  doc.text("Donation Type: [  ] Voluntary Non-Remunerated (Hiari)   [  ] Family Replacement (Ndugu)   [  ] Mobile Drive (Kambi)", 12, y + 4);
  doc.text("Have you ever donated blood before?  [  ] YES    [  ] NO", 12, y + 10);
  doc.text("If YES, approximate total donations: ________ times", 90, y + 10);
  doc.text("Date of last donation: ____/____/________", 145, y + 10);

  doc.text("Known Blood Group (if any): [  ] A   [  ] B   [  ] AB   [  ] O   |  Rh: [  ] Positive   [  ] Negative   [  ] Unknown", 12, y + 16);

  y += 21;

  // SECTION C: Donor Medical Screening Questionnaire (Part 1)
  y = drawSection(doc, "SECTION C: MEDICAL HEALTH SCREENING QUESTIONNAIRE (Maswali ya Afya ya Mchangiaji)", y);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.text("Please answer all questions truthfully. Your honesty protects both your own health and the patient who receives the blood.", 12, y + 3.5);

  const questionsPage1 = [
    "1. Do you feel well, healthy, and fit today? (Je, unajisikia mwenye afya nzuri leo?)",
    "2. Have you eaten a balanced meal and drunk fluids in the last 4 hours? (Je, umekula chakula katika saa 4 zilizopita?)",
    "3. Have you taken any medications in the last 48 hours (aspirin, antibiotics, analgesics)?",
    "4. In the past 6 months, have you had dental surgery, major surgery, or received a blood transfusion?",
    "5. In the past 6 months, have you had a body piercing, tattoo, circumcision, or scarification?",
    "6. Have you had an unexplained fever, chronic cough, night sweats, or sudden weight loss in the last month?",
    "7. Have you been treated for Malaria, Typhoid, or any febrile illness within the past 4 weeks?",
    "8. Have you ever been diagnosed with Heart Disease, Hypertension, Asthma, Epilepsy, or Kidney Disease?",
    "9. Have you ever had Hepatitis (Jaundice/Ugonjwa wa manjano) or liver problems?"
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  let qY = y + 7;
  questionsPage1.forEach((q) => {
    doc.text(q, 12, qY + 3.5);
    doc.text("[  ] YES   [  ] NO", 168, qY + 3.5);
    doc.setDrawColor(230, 230, 230);
    doc.line(10, qY + 5.2, 200, qY + 5.2);
    qY += 6;
  });

  drawFooter(doc, 1, 2);

  // === PAGE 2 ===
  doc.addPage();
  drawHeader(
    doc,
    "ZNBTS-FRM-DNR-004",
    "Voluntary Blood Donor Registration & Screening (Continuation)",
    "Fomu ya Usajili, Uchunguzi wa Afya na Idhini ya Mchangiaji (Ukurasa wa 2)",
    "Rev. 4.0 / 2026"
  );

  y = 52;

  // SECTION C Continued: High Risk & Female Specific
  y = drawSection(doc, "SECTION C (CONT): HIGH RISK ASSESSMENT & FEMALE DONOR SCREENING", y);

  const questionsPage2 = [
    "10. FOR FEMALE DONORS ONLY: Are you currently pregnant, delivered in the past 6 months, or breastfeeding?",
    "11. FOR FEMALE DONORS ONLY: Are you currently experiencing heavy menstrual flow today?",
    "12. In the past 12 months, have you engaged in sexual intercourse with multiple partners or without protection?",
    "13. Have you ever injected illegal drugs or shared needles / sharp instruments?",
    "14. Have you ever tested positive for HIV, Hepatitis B, Hepatitis C, or Syphilis?"
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  let q2Y = y + 2;
  questionsPage2.forEach((q) => {
    doc.text(q, 12, q2Y + 3.5);
    doc.text("[  ] YES   [  ] NO", 168, q2Y + 3.5);
    doc.setDrawColor(230, 230, 230);
    doc.line(10, q2Y + 5.2, 200, q2Y + 5.2);
    q2Y += 6;
  });

  y = q2Y + 4;

  // SECTION D: Pre-Donation Physical Assessment (Completed by Nurse / Medical Officer)
  y = drawSection(doc, "SECTION D: PRE-DONATION CLINICAL & PHYSICAL EXAMINATION (Kipimo cha Afya)", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  doc.text("Body Weight (Uzito): _______ kg (Min 50kg)", 12, y + 4);
  doc.text("Height: _______ cm", 75, y + 4);
  doc.text("Blood Pressure: _______ / _______ mmHg", 115, y + 4);
  doc.text("Pulse: ______ bpm", 170, y + 4);

  doc.text("Hemoglobin (Hb) Level: ________ g/dL (Criteria: Female >= 12.0 g/dL, Male >= 12.5 g/dL)", 12, y + 10);
  doc.text("Vein Suitability: [  ] Good / Bilateral  [  ] Left only  [  ] Right only", 12, y + 16);

  doc.setFont("helvetica", "bold");
  doc.text("DONOR ELIGIBILITY DECISION:", 12, y + 22);
  doc.setFont("helvetica", "normal");
  doc.text("[  ] ACCEPTED FOR DONATION", 65, y + 22);
  doc.text("[  ] TEMPORARILY DEFERRED", 115, y + 22);
  doc.text("[  ] PERMANENTLY DEFERRED", 160, y + 22);

  doc.text("Deferral Reason (if deferred): __________________________________________________  Deferral Duration: ____________", 12, y + 28);
  doc.text("Screening Nurse / Officer Name: __________________________________", 12, y + 34);
  doc.text("Signature: _______________________", 120, y + 34);
  doc.text("Date: ____/____/2026", 165, y + 34);

  y += 40;

  // SECTION E: Informed Consent & Declaration
  y = drawSection(doc, "SECTION E: INFORMED CONSENT & DECLARATION (Idhini na Tamko la Mchangiaji)", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    "1. I confirm that I have understood the questions asked above and have answered them truthfully to the best of my knowledge.",
    12,
    y + 3.5
  );
  doc.text(
    "2. I voluntarily give my blood to Zanzibar Blood Transfusion Service (ZNBTS) to be used for patients requiring transfusion.",
    12,
    y + 7.5
  );
  doc.text(
    "3. I understand and consent that my blood will be tested for Transfusion-Transmissible Infections (HIV, Hepatitis B, Hepatitis C, and Syphilis).",
    12,
    y + 11.5
  );
  doc.text(
    "4. I agree that if any test is reactive, ZNBTS may contact me confidentially for confirmatory counseling and post-test care.",
    12,
    y + 15.5
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Donor Signature / Thumbprint (Saini ya Mchangiaji): __________________________", 12, y + 24);
  doc.text("Date: ____/____/2026", 130, y + 24);

  y += 30;

  // SECTION F: Phlebotomy & Collection Details
  y = drawSection(doc, "SECTION F: PHLEBOTOMY COLLECTION RECORD (Taarifa ya Utoaji Damu)", y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  doc.text("Unit DIN / Bag Barcode: ___________________________________", 12, y + 4);
  doc.text("Bag Type: [  ] Single (350ml)   [  ] Double (450ml)   [  ] Triple CPDA-1", 110, y + 4);

  doc.text("Venipuncture Site: [  ] Left Antecubital   [  ] Right Antecubital", 12, y + 10);
  doc.text("Bleed Start Time: ______ hrs", 90, y + 10);
  doc.text("Bleed End: ______ hrs", 130, y + 10);
  doc.text("Volume: _______ mL", 168, y + 10);

  doc.text("Post-Donation Donor Status: [  ] Uneventful / Well   [  ] Vasovagal / Dizziness   [  ] Hematoma   [  ] Other: __________________", 12, y + 16);

  doc.text("Phlebotomist Name: __________________________________", 12, y + 22);
  doc.text("Signature: _______________________", 110, y + 22);
  doc.text("Date: ____/____/2026", 165, y + 22);

  drawFooter(doc, 2, 2);

  return doc;
}

// -------------------------------------------------------------
// Download & Preview Helpers
// -------------------------------------------------------------
export function getPdfDocument(formId: FormId): jsPDF {
  switch (formId) {
    case "request":
      return createBloodRequestPdf();
    case "transport":
      return createBloodTransportationPdf();
    case "utilization":
      return createBloodUtilizationPdf();
    case "donor":
      return createDonorRegistrationPdf();
  }
}

export function downloadFormPdf(formId: FormId) {
  const meta = FORMS_METADATA.find((m) => m.id === formId);
  const doc = getPdfDocument(formId);
  const filename = meta
    ? `${meta.code}_${meta.title.replace(/\s+/g, "_")}.pdf`
    : `ZNBTS_Form_${formId}.pdf`;

  doc.save(filename);
}

export function printFormPdf(formId: FormId) {
  const doc = getPdfDocument(formId);
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = blobUrl;

  document.body.appendChild(iframe);

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error("Print failed:", e);
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 30000);
      }
    }, 500);
  };
}
