import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  initializeAuth,
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbCreateUser,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  memoryLocalCache,
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDoc,
  getDocFromServer,
  getDocs,
  limit,
  getCountFromServer,
  disableNetwork,
  enableNetwork,
  setLogLevel
} from "firebase/firestore";

export function logFirestoreRead(source: string, collectionName: string) {
  console.log(`[FIRESTORE READ] Source: ${source}, Collection: ${collectionName}`);
}

setLogLevel("silent");

import firebaseAppletConfig from "../../firebase-applet-config.json";
import {
  CENTERS,
  PRODUCT_TYPES,
  BLOOD_TYPES,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_ROSTER
} from "../config/constants";
import { BloodStock, EmergencyContact, LabStaff, BloodRequest, NewsItem, UnitTransfer } from "../types";

export type { FirebaseUser };

export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || "AIzaSyD4SqcOamaOdEMS7U9OYeKZo8jsshsrAoc",
  authDomain: firebaseAppletConfig.authDomain || "zbts-zanzibar.firebaseapp.com",
  projectId: firebaseAppletConfig.projectId || "zbts-zanzibar",
  storageBucket: firebaseAppletConfig.storageBucket || "zbts-zanzibar.firebasestorage.app",
  messagingSenderId: firebaseAppletConfig.messagingSenderId || "59625446282",
  appId: firebaseAppletConfig.appId || "1:59625446282:web:95807112a05a1a1a714673",
  measurementId: firebaseAppletConfig.measurementId || "G-BP4XYRCLJJ"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export const auth = (() => {
  if (typeof window !== "undefined") {
    try {
      return initializeAuth(app, {
        persistence: [browserLocalPersistence, browserSessionPersistence]
      });
    } catch {
      return getAuth(app);
    }
  }
  return getAuth(app);
})();

const databaseId = firebaseAppletConfig.firestoreDatabaseId || "ai-studio-zbtsbloodbank-5a4a2020-6946-4e26-a956-3e4bde959627";

export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
        localCache: memoryLocalCache()
      },
      databaseId
    );
  } catch {
    return getFirestore(app, databaseId);
  }
})();

export {
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDoc,
  getDocFromServer,
  getDocs,
  limit,
  getCountFromServer
};

async function testConnection() {
  try {
    if (auth.currentUser) {
      logFirestoreRead("testConnection", "test/connection");
      await getDocFromServer(doc(db, "test", "connection"));
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Please check your Firebase configuration or internet connection.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  return errInfo;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export const createUserWithEmailAndPassword = async (
  _authRef: any,
  email: string,
  password: string
) => {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fbCreateUser(auth, cleanEmail, password);
    return { user: res.user };
  } catch (err: any) {
    if (err.code === "auth/email-already-in-use") {
      throw new Error("This email is already registered. Please sign in with your password.");
    }
    if (err.code === "auth/weak-password") {
      throw new Error("Password must be at least 6 characters long.");
    }
    if (err.code === "auth/invalid-email") {
      throw new Error("Invalid email address format.");
    }
    throw err;
  }
};

export const signInWithEmailAndPassword = async (
  _authRef: any,
  email: string,
  password: string
) => {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fbSignIn(auth, cleanEmail, password);
    return { user: res.user };
  } catch (err: any) {
    if (
      err.code === "auth/user-not-found" ||
      err.code === "auth/wrong-password" ||
      err.code === "auth/invalid-credential" ||
      err.code === "auth/invalid-login-credentials"
    ) {
      throw new Error("Invalid email or password. Authentication rejected.");
    }
    if (err.code === "auth/invalid-email") {
      throw new Error("Invalid email address format.");
    }
    if (err.code === "auth/too-many-requests") {
      throw new Error("Too many failed attempts. Please try again later.");
    }
    throw err;
  }
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  return { user: res.user };
};

export const signOut = async (_authRef?: any) => {
  localStorage.removeItem("zbts_current_user");
  try {
    await fbSignOut(auth);
  } catch (e) {
    console.warn("SignOut notice:", e);
  }
};

export const onAuthStateChanged = (
  _authRef: any,
  callback: (user: any | null) => void
) => {
  return fbOnAuthStateChanged(auth, (user) => {
    if (!user) {
      localStorage.removeItem("zbts_current_user");
    }
    callback(user);
  });
};

export const seedInitialDataIfEmpty = async () => {
  if (!auth.currentUser) {
    return;
  }
  // Client-side guard: Skip entirely if already checked this browser session
  if (typeof window !== "undefined" && localStorage.getItem("zbts_db_seeded_v1")) {
    return;
  }

  try {
    // Check if seeding was already performed in Firestore
    const seedStatusRef = doc(db, "settings", "seed_status");
    logFirestoreRead("seedInitialDataIfEmpty", "settings/seed_status");
    const seedSnap = await getDoc(seedStatusRef);
    if (seedSnap.exists()) {
      if (typeof window !== "undefined") {
        localStorage.setItem("zbts_db_seeded_v1", "true");
      }
      return;
    }

    // 1. Check settings / authorizations
    const authDocRef = doc(db, "settings", "data_authorizations");
    logFirestoreRead("seedInitialDataIfEmpty", "settings/data_authorizations");
    const authSnap = await getDoc(authDocRef);
    if (!authSnap.exists()) {
      const defaultAuth = [
        {
          id: "1",
          email: "znbtsmobile@gmail.com",
          requestHistoryRead: "ALLOWED",
          znbtsReserveStockRead: "ALLOWED",
          postManagement: "ALLOWED",
          adminLogin: "ALLOWED",
          internalMemo: "ALLOWED",
          hospitalSite: ""
        },
        {
          id: "2",
          email: "mnazimmoja.lab@zbts.go.tz",
          requestHistoryRead: "ALLOWED",
          znbtsReserveStockRead: "DENIED",
          postManagement: "DENIED",
          adminLogin: "DENIED",
          internalMemo: "ALLOWED",
          hospitalSite: "mnazi_mmoja"
        }
      ];
      await setDoc(authDocRef, { authorizations: defaultAuth });
    }

    // 2. Emergency Contacts
    const contactsDocRef = doc(db, "settings", "emergency_contacts");
    logFirestoreRead("seedInitialDataIfEmpty", "settings/emergency_contacts");
    const contactsSnap = await getDoc(contactsDocRef);
    if (!contactsSnap.exists()) {
      await setDoc(contactsDocRef, { contacts: INITIAL_EMERGENCY_CONTACTS });
    }

    // 3. Lab Roster
    const rosterDocRef = doc(db, "settings", "lab_roster");
    logFirestoreRead("seedInitialDataIfEmpty", "settings/lab_roster");
    const rosterSnap = await getDoc(rosterDocRef);
    if (!rosterSnap.exists()) {
      await setDoc(rosterDocRef, { roster: INITIAL_ROSTER });
    }

    // 4. Initial Requests (Bounded limit(1) check)
    const reqCol = collection(db, "requests");
    logFirestoreRead("seedInitialDataIfEmpty", "requests (limit 1)");
    const reqSnap = await getDocs(query(reqCol, limit(1)));
    if (reqSnap.empty) {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const initialRequests: BloodRequest[] = [
        {
          id: "req_today_01",
          hospitalName: "Mnazi Mmoja Referral Hospital",
          status: "Processing",
          urgency: "Urgent",
          timestamp: now - 1000 * 60 * 45,
          items: [
            { bloodType: "O+", productType: "Adult PRC", quantity: 2 },
            { bloodType: "B+", productType: "PedPRC", quantity: 1 }
          ]
        },
        {
          id: "req_today_02",
          hospitalName: "Kivunge Cottage Hospital",
          status: "Received",
          urgency: "Regular 24hrs",
          timestamp: now - 1000 * 60 * 120,
          items: [
            { bloodType: "A+", productType: "Adult PRC", quantity: 4 },
            { bloodType: "O+", productType: "Adult PRC", quantity: 3 }
          ]
        },
        {
          id: "req_today_03",
          hospitalName: "Makunduchi Cottage Hospital",
          status: "Ready to Collect",
          urgency: "Regular 24hrs",
          timestamp: now - 1000 * 60 * 200,
          items: [
            { bloodType: "AB+", productType: "Adult PRC", quantity: 2 },
            { bloodType: "O-", productType: "Adult PRC", quantity: 1 }
          ]
        },
        {
          id: "req_past_01",
          hospitalName: "Chake Chake Hospital (Pemba)",
          status: "Pending",
          urgency: "Regular 24hrs",
          timestamp: now - oneDay * 2,
          items: [{ bloodType: "O+", productType: "Adult PRC", quantity: 5 }]
        }
      ];
      for (const req of initialRequests) {
        await setDoc(doc(db, "requests", req.id), req);
      }
    }

    // 5. Initial News (Bounded limit(1) check)
    const newsCol = collection(db, "news");
    logFirestoreRead("seedInitialDataIfEmpty", "news (limit 1)");
    const newsSnap = await getDocs(query(newsCol, limit(1)));
    if (newsSnap.empty) {
      const now = Date.now();
      const initialNews: NewsItem[] = [
        {
          id: "news_01",
          title: "Uhaba wa Damu Kundi O- na B- (Blood Alert)",
          content:
            "Tunatoa wito kwa vituo vyote vya afya na jamii kuhusu upungufu wa damu ya kundi O- na B- katika ghala kuu la ZNBTS. Shughuli za ukusanyaji wa hiari zinaendelea Visiwani.",
          category: "Urgent",
          author: "ZNBTS Director",
          timestamp: now - 1000 * 60 * 60 * 3
        },
        {
          id: "news_02",
          title: "Ratiba Mpya ya Utoaji Damu Masaa 24",
          content:
            "Huduma za utoaji damu kwa maombi ya dharura zinaendelea masaa 24. Tafadhali hakikisha fomu rasmi inakabidhiwa wakati wa kuchukua damu.",
          category: "Announcement",
          author: "Lab Operations Head",
          timestamp: now - 1000 * 60 * 60 * 24
        },
        {
          id: "news_03",
          title: "Mwongozo wa Uhamisho wa Damu baina ya Hospitali",
          content:
            "Hospitali zote zinazofanya uhamisho wa damu (Inter-Hospital Transfer) zinakumbushwa kujaza mfumo wa kidijitali mara moja ili kuzuia upotevu wa taarifa za akiba.",
          category: "Internal memo",
          author: "Quality Manager",
          timestamp: now - 1000 * 60 * 60 * 48
        }
      ];
      for (const item of initialNews) {
        await setDoc(doc(db, "news", item.id), item);
      }
    }

    // 6. Initial Inventory (Bounded limit(1) check instead of fetching all 160 items)
    const invCol = collection(db, "inventory");
    logFirestoreRead("seedInitialDataIfEmpty", "inventory (limit 1)");
    const invSnap = await getDocs(query(invCol, limit(1)));
    if (invSnap.empty) {
      const batch = writeBatch(db);
      CENTERS.forEach((c) => {
        PRODUCT_TYPES.forEach((p) => {
          BLOOD_TYPES.forEach((b) => {
            const stockId = `${c.route}_${p}_${b}`;
            let baseQty = 0;
            if (c.route === "zanzibar") {
              baseQty = b === "O+" || b === "A+" ? 18 : b.includes("-") ? 4 : 10;
            } else if (c.route === "mnazi_mmoja") {
              baseQty = b === "O+" || b === "A+" ? 9 : 3;
            } else {
              baseQty = b === "O+" || b === "B+" ? 4 : 1;
            }
            const ref = doc(db, "inventory", stockId);
            batch.set(ref, {
              id: stockId,
              centerRoute: c.route,
              productType: p,
              bloodType: b,
              quantity: baseQty,
              lastUpdated: Date.now()
            });
          });
        });
      });
      await batch.commit();
    }

    // Mark as seeded in Firestore and localStorage
    await setDoc(seedStatusRef, { seeded: true, timestamp: Date.now() });
    if (typeof window !== "undefined") {
      localStorage.setItem("zbts_db_seeded_v1", "true");
    }
  } catch (error) {
    console.warn("Firestore seed note:", error);
  }
};
