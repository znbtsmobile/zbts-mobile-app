import { Center, EmergencyContact, LabStaff, ShiftType } from "../types";

export const SECURITY_PINS = {
 VERIFICATION: "1020",
 ADMIN_LOGIN: "2030"
};

export const TIMEZONE = "Africa/Dar_es_Salaam";

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const PRODUCT_TYPES = ["Adult PRC", "PedPRC", "FFP", "Platelets", "Cryo"] as const;

export const MAX_URGENT_UNITS_PER_BLOOD_TYPE = 2;

export const MAX_AUTH_SLOTS = 1000;

export const SHIFT_MAX_STAFF: Record<ShiftType, number> = {
 Morning: 10,
 Evening: 4,
 Weekend: 2
};

export const CENTERS: Center[] = [
 { route: "zanzibar", title: "Zanzibar Main Depot (ZNBTS)", category: "Main Depot", district: "Urban" },
 { route: "alrahma", title: "Alrahma Hospital", category: "Hospital", district: "Urban" },
 { route: "afya_first", title: "Afya first", category: "Hospital", district: "Urban" },
 { route: "chumbuni", title: "Chumbuni Hospital", category: "Hospital", district: "Urban" },
 { route: "bububu_military", title: "Bububu Military", category: "Military Hospital", district: "West A" },
 { route: "ijitimai", title: "Ijitimai Hospital", category: "Hospital", district: "Urban" },
 { route: "jku", title: "JKU Hospital", category: "Hospital", district: "West B" },
 { route: "kitogani", title: "Kitogani Hospital", category: "Hospital", district: "South" },
 { route: "kivunge", title: "Kivunge Hospital", category: "Hospital", district: "North A" },
 { route: "kmkm", title: "KMKM Hospital", category: "Special Forces Hospital", district: "Urban" },
 { route: "lumumba_regional", title: "Lumumba Regional", category: "Regional Hospital", district: "Urban" },
 { route: "mbuzini", title: "Mbuzini Hospital", category: "Hospital", district: "West A" },
 { route: "mwera_pongwe", title: "Mwera Pongwe Hospital", category: "Hospital", district: "Central" },
 { route: "mnazi_mmoja", title: "Mnazi Mmoja Hospital", category: "Referral Hospital", district: "Urban" },
 { route: "tasakhta_ampola", title: "Tasakhta Ampola", category: "Hospital", district: "Urban" },
 { route: "tawakal", title: "Tawakal Hospital", category: "Hospital", district: "Urban" },
 { route: "pangatupu", title: "Pangatupu Hospital", category: "Hospital", district: "Urban" }
];

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
 { id: 1, name: "dk.Masud", phone: "000000000", position: "Program manager" },
 { id: 2, name: "Usi", phone: "000000000", position: "Acting Administrator" },
 { id: 3, name: "Mwajuma", phone: "000000000", position: "Operating Officer" },
 { id: 4, name: "Najma", phone: "000000000", position: "Quality officer" },
 { id: 5, name: "Fakih", phone: "000000000", position: "Head of Donation" },
 { id: 6, name: "Mahmud", phone: "000000000", position: "Head of Laboratory" },
 { id: 7, name: "Aisha", phone: "000000000", position: "Head of Recruitment" }
];

export const ALL_LAB_STAFF: { id: string; name: string; phone: string }[] = [
  { id: "Lab 1", name: "Ali Hassan Khamis", phone: "+255777212101" },
  { id: "Lab 2", name: "Zuleikha Bakari Omar", phone: "+255777212102" },
  { id: "Lab 3", name: "Hamad Juma Mussa", phone: "+255777212103" },
  { id: "Lab 4", name: "Amina Salim Nassor", phone: "+255777212104" },
  { id: "Lab 5", name: "Said Abdalla Rashid", phone: "+255777212105" },
  { id: "Lab 6", name: "Maimuna Othman Ali", phone: "+255777212106" },
  { id: "Lab 7", name: "Nassor Said Mohammed", phone: "+255777212107" },
  { id: "Lab 8", name: "Rukia Khamis Saleh", phone: "+255777212108" },
  { id: "Lab 9", name: "Iddi Makame Vuai", phone: "+255777212109" },
  { id: "Lab 10", name: "Maryam Juma Faki", phone: "+255777212110" },
  { id: "Lab 11", name: "Yussuf Ali Hamad", phone: "+255777212111" },
  { id: "Lab 12", name: "Fatma Haji Mwalim", phone: "+255777212112" }
];

export const INITIAL_ROSTER: LabStaff[] = [
  { id: "1", labId: "Lab 1", shift: "Morning", name: "Ali Hassan Khamis", phone: "+255777212101" },
  { id: "2", labId: "Lab 2", shift: "Morning", name: "Zuleikha Bakari Omar", phone: "+255777212102" },
  { id: "3", labId: "Lab 3", shift: "Morning", name: "Hamad Juma Mussa", phone: "+255777212103" },
  { id: "4", labId: "Lab 4", shift: "Morning", name: "Amina Salim Nassor", phone: "+255777212104" },
  { id: "5", labId: "Lab 5", shift: "Evening", name: "Said Abdalla Rashid", phone: "+255777212105" },
  { id: "6", labId: "Lab 6", shift: "Evening", name: "Maimuna Othman Ali", phone: "+255777212106" },
  { id: "7", labId: "Lab 7", shift: "Weekend", name: "Nassor Said Mohammed", phone: "+255777212107" },
  { id: "8", labId: "Lab 8", shift: "Weekend", name: "Rukia Khamis Saleh", phone: "+255777212108" }
];
