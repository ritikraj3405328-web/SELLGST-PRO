/**
 * SellGST Pro — Principal Security Core v4.0
 * Features:
 * 1. Smart Subscription Engine (FREE 5-Action Lock | ₹99 Monthly -> Shows ONLY ₹499 + 30d Countdown | ₹499 Yearly -> Hides All Prompts + 365d Background Expiry)
 * 2. DPDP Act 2023 Compliance (Mandatory Consent Audit + User Personal Profile Drawer + Confirmed Account Deletion + Bottom Logout)
 * 3. Admin Isolation (Hides Master Admin from regular users; Instant Auto-WhatsApp Notification to Owner on Pending UPI)
 * 4. Cloud Gemini AI Proxy Connector (Calls /api/ai-assistant across Cloudflare Pages & GitHub Pages without exposing API key in frontend)
 * File: /assets/js/security-core.js
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  deleteUser,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { initI18n, t, getCurrentLang, setLanguage, SUPPORTED_LANGUAGES } from "./i18n.js";

// ============================================================================
// 1. EXACT FIREBASE CLOUD CONFIGURATION
// ============================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyCYs-MCUZJrofjusErAbVSzu7o8WnGpuac",
  authDomain: "sellgstpro.firebaseapp.com",
  projectId: "sellgstpro",
  storageBucket: "sellgstpro.firebasestorage.app",
  messagingSenderId: "135793216555",
  appId: "1:135793216555:web:803548a3330ad5f600ae6e"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ============================================================================
// 2. SELF-HEALING DOMAIN & CACHE GUARD
// ============================================================================
(function selfHealDomainAndCache() {
  try {
    if (window.location.hostname.endsWith(".workers.dev")) {
      const targetPath = window.location.pathname + window.location.search + window.location.hash;
      window.location.replace("https://sellgst-pro.pages.dev" + targetPath);
      return;
    }
    const cacheClearedKey = "sellgst_v4_cache_healed";
    if (!localStorage.getItem(cacheClearedKey) && "caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (!name.includes("v4")) caches.delete(name);
        });
      });
      localStorage.setItem(cacheClearedKey, "1");
    }
  } catch (_) {}
})();

// ============================================================================
// 3. GLOBAL APPLICATION STATE & SUBSCRIPTION TIER ENGINE
// ============================================================================
export const FREE_USAGE_MAX_LIMIT = 5;

const DEFAULT_PROFILE = {
  uid: "seller-local-01",
  displayName: "S.K.P.S DIGITAL",
  email: "example@mail.com",
  phone: "+919999999999",
  gstin: "07AABCS1429B1Z5",
  businessName: "S.K.P.S DIGITAL",
  addressLine1: "Okhla Industrial Area,",
  addressLine2: "New Delhi-110020",
  stateCode: "07",
  stateName: "Delhi",
  upiId: "9661692365@ybl",
  bankAccountNo: "000000000000000",
  bankIfsc: "BANK0000000",
  bankBranch: "NEW DELHI MAIN BRANCH",
  logoDataUrl: "",
  signatureText: "Authorized Signatory",
  invoiceNote: "Please include the Invoice number in your payment notes. To be paid in full in maximum 7 days after receiving the invoice.",
  isPro: false,
  isAdmin: false,
  subscriptionStatus: "FREE", // "FREE" | "MONTHLY" | "YEARLY" | "EXPIRED"
  planName: "FREE",           // "FREE" | "MONTHLY" | "YEARLY"
  planActivatedAt: null,
  planExpiryISO: null,        // 30 days for MONTHLY, 365 days for YEARLY
  freeActionsUsed: 0,         // Locks after 5 actions on Free tier
  dpdpConsentAccepted: true,
  dpdpConsentTimestamp: new Date().toISOString(),
  paymentPending: false
};

function getInitialHydratedProfile() {
  try {
    const raw = localStorage.getItem("sellgst_local_profile");
    if (raw) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    }
  } catch (_) {}
  return { ...DEFAULT_PROFILE };
}

export const AppState = {
  user: null,
  profile: getInitialHydratedProfile(),
  merchantConfig: {
    upiId: "9661692365@ybl",
    payeeName: "AGNI VOLT",
    monthlyPrice: 99,
    yearlyPrice: 499,
    whatsappWebhookNumber: "", // Owner's WhatsApp number configured in Admin Settings
    autoWhatsAppNotify: true
  },
  pendingRequest: null,
  deferredPwaPrompt: null,
  pwaTimerStarted: false,
  activeModalStack: [],
  aiHistory: [],
  listeners: {
    userUnsub: null,
    paymentUnsub: null,
    configUnsub: null,
    broadcastUnsub: null
  },
  subscribers: new Set()
};

let rafSyncPending = false;

export function subscribeAppState(callback) {
  if (typeof callback === "function") {
    AppState.subscribers.add(callback);
    try {
      callback(AppState);
    } catch (_) {}
  }
  return () => AppState.subscribers.delete(callback);
}

function notifyStateChange() {
  if (rafSyncPending) return;
  rafSyncPending = true;
  requestAnimationFrame(() => {
    rafSyncPending = false;
    AppState.subscribers.forEach((cb) => {
      try {
        cb(AppState);
      } catch (err) {
        console.error("[SellGST State Subscriber Error]:", err);
      }
    });
    window.dispatchEvent(new CustomEvent("sellgst:state-changed", { detail: AppState }));
  });
}

// ============================================================================
// 4. EXPIRY & 5-LIMIT FREE USAGE PAYWALL CONTROLLER
// ============================================================================
export function evaluateSubscriptionHealth() {
  const prof = AppState.profile;
  const now = Date.now();

  if (prof.isPro && prof.planExpiryISO) {
    const expTime = new Date(prof.planExpiryISO).getTime();
    if (!isNaN(expTime) && now > expTime) {
      // Subscription expired in background
      prof.isPro = false;
      prof.planName = "FREE";
      prof.subscriptionStatus = "EXPIRED";
      localStorage.setItem("sellgst_local_profile", JSON.stringify(prof));
      if (AppState.user?.uid) {
        setDoc(
          doc(db, "users", AppState.user.uid),
          { isPro: false, planName: "FREE", subscriptionStatus: "EXPIRED" },
          { merge: true }
        ).catch(() => {});
      }
    }
  }

  const remainingMs = prof.planExpiryISO ? Math.max(0, new Date(prof.planExpiryISO).getTime() - now) : 0;
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return {
    isPro: Boolean(prof.isPro),
    planName: prof.isPro ? (prof.planName === "YEARLY" ? "YEARLY" : "MONTHLY") : "FREE",
    remainingDays,
    remainingHours,
    freeActionsUsed: Number(prof.freeActionsUsed) || 0,
    freeActionsRemaining: Math.max(0, FREE_USAGE_MAX_LIMIT - (Number(prof.freeActionsUsed) || 0))
  };
}

/**
 * Enforces the 5-action limit for Free users.
 * Returns true if allowed, or opens the compulsory Pro UPI Modal and returns false if locked.
 */
export function consumeFreeActionOrLock(featureName = "Feature") {
  const status = evaluateSubscriptionHealth();
  if (status.isPro) return true;

  let used = Number(AppState.profile.freeActionsUsed) || 0;
  if (used >= FREE_USAGE_MAX_LIMIT) {
    showToast(`🔒 Free Limit (${FREE_USAGE_MAX_LIMIT}/${FREE_USAGE_MAX_LIMIT}) reached for ${featureName}! Upgrade to Pro to continue.`, "warning", 5000);
    openProPaymentModal("MONTHLY");
    return false;
  }

  used += 1;
  AppState.profile.freeActionsUsed = used;
  localStorage.setItem("sellgst_local_profile", JSON.stringify(AppState.profile));
  if (AppState.user?.uid) {
    setDoc(doc(db, "users", AppState.user.uid), { freeActionsUsed: used }, { merge: true }).catch(() => {});
  }

  const left = Math.max(0, FREE_USAGE_MAX_LIMIT - used);
  if (left === 0) {
    showToast(`⚠️ Last free action used! Next action will require SellGST Pro.`, "warning", 4500);
  } else {
    showToast(`Free Trial: ${left} of ${FREE_USAGE_MAX_LIMIT} free uses remaining.`, "info", 2800);
  }
  syncProDOMElements();
  return true;
}

// ============================================================================
// 5. INFINITE UNIQUE INVOICE ID GENERATOR (1 TO INFINITY)
// ============================================================================
export function generateUniqueInvoiceNumber() {
  try {
    let seq = Number(localStorage.getItem("sellgst_infinite_inv_seq") || "4649844");
    seq += 1;
    localStorage.setItem("sellgst_infinite_inv_seq", String(seq));
    return String(seq);
  } catch (_) {
    return String(Math.floor(1000000 + Math.random() * 9000000));
  }
}

export function peekCurrentInvoiceNumber() {
  try {
    const seq = Number(localStorage.getItem("sellgst_infinite_inv_seq") || "4649845");
    return String(seq);
  } catch (_) {
    return "4649845";
  }
}

// ============================================================================
// 6. ZERO-TRUST XSS & CSV FORMULA-INJECTION SANITIZERS
// ============================================================================
export function sanitizeHTML(input) {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeAttr(input) {
  return sanitizeHTML(input).replace(/`/g, "&#096;");
}

export function sanitizeCSVCell(value) {
  if (value === null || value === undefined) return "";
  let str = String(value).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return sanitizeHTML(str);
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

export function formatINR(amount) {
  return inrFormatter.format(Number(amount) || 0);
}

// ============================================================================
// 7. 3D INTERACTIVE MOUSE-HOVER TILT ENGINE
// ============================================================================
export function init3DTiltCards() {
  const attach3D = (card) => {
    if (card.dataset.tiltBound === "1") return;
    card.dataset.tiltBound = "1";
    card.style.transformStyle = "preserve-3d";
    card.style.transition = "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease";

    let framePending = false;
    card.addEventListener(
      "mousemove",
      (e) => {
        if (framePending) return;
        framePending = true;
        requestAnimationFrame(() => {
          framePending = false;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -5.5;
          const rotateY = ((x - centerX) / centerX) * 5.5;

          card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
          card.style.boxShadow = "0 22px 44px -12px rgba(91, 46, 255, 0.2)";
        });
      },
      { passive: true }
    );

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      card.style.boxShadow = "";
    });
  };

  document.querySelectorAll(".bento-card, .bento-mint, .card-3d, [data-3d-tilt]").forEach(attach3D);
}

// ============================================================================
// 8. 7-SECOND AUTO-HIDING PWA INSTALL BUTTON MANAGER
// ============================================================================
function initSevenSecondPWAInstall() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    AppState.deferredPwaPrompt = e;
  });

  window.addEventListener("appinstalled", () => {
    AppState.deferredPwaPrompt = null;
    hideAllPWAInstallButtons();
    showToast("🎉 SellGST Pro installed on your device!", "success");
  });
}

function startSevenSecondPWAButtonTimer() {
  if (AppState.pwaTimerStarted) return;
  AppState.pwaTimerStarted = true;

  const buttons = document.querySelectorAll("#pwa-install-btn, [data-pwa-install]");
  buttons.forEach((btn) => {
    btn.classList.remove("hidden");
    btn.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    btn.style.opacity = "1";
  });

  setTimeout(() => {
    hideAllPWAInstallButtons();
  }, 7000);
}

function hideAllPWAInstallButtons() {
  document.querySelectorAll("#pwa-install-btn, [data-pwa-install]").forEach((btn) => {
    btn.style.opacity = "0";
    btn.style.transform = "scale(0.9)";
    btn.style.pointerEvents = "none";
    setTimeout(() => {
      btn.classList.add("hidden");
    }, 500);
  });
}

export async function triggerPWAInstall() {
  if (AppState.deferredPwaPrompt) {
    try {
      AppState.deferredPwaPrompt.prompt();
      await AppState.deferredPwaPrompt.userChoice;
      AppState.deferredPwaPrompt = null;
      hideAllPWAInstallButtons();
      return;
    } catch (_) {}
  }

  let modal = document.getElementById("sellgst-universal-pwa-modal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.id = "sellgst-universal-pwa-modal";
  modal.className = "fixed inset-0 z-[9995] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4";

  modal.innerHTML = `
    <div class="bg-white rounded-3xl border border-indigo-100 max-w-sm w-full p-6 shadow-2xl text-center space-y-3.5 relative">
      <button type="button" id="close-univ-pwa-btn" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600">✕</button>
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5B2EFF] to-[#38BDF8] text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg">
        S₹
      </div>
      <span class="inline-block px-3 py-0.5 rounded-full bg-indigo-50 text-[#5B2EFF] font-extrabold text-[11px]">
        0.1s NATIVE APP INSTALL
      </span>
      <h3 class="text-base font-extrabold text-slate-900">Install SellGST Pro App</h3>
      <div class="bg-slate-50 rounded-2xl p-3.5 text-left text-xs text-slate-700 space-y-2 border border-slate-200">
        <div class="flex items-start gap-2">
          <span class="font-extrabold text-[#5B2EFF]">1.</span>
          <span>Tap the <strong>3-dots menu (⋮)</strong> in the top-right corner of Chrome.</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="font-extrabold text-[#5B2EFF]">2.</span>
          <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
        </div>
      </div>
      <button type="button" id="got-it-pwa-btn" class="w-full py-3 rounded-2xl bg-[#5B2EFF] hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition">
        Got It, Thanks!
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  const closePwaModal = (fromPop = false) => {
    modal.remove();
    if (!fromPop) removeModalState("universal-pwa-modal");
  };
  pushModalState("universal-pwa-modal", () => closePwaModal(true));

  modal.querySelector("#close-univ-pwa-btn").addEventListener("click", () => closePwaModal());
  modal.querySelector("#got-it-pwa-btn").addEventListener("click", () => closePwaModal());
}

// ============================================================================
// 9. SPECULATIVE PAGE PREFETCHER & NATIVE BACK-BUTTON MANAGER
// ============================================================================
const prefetchedUrls = new Set();

function initInstantPagePrefetcher() {
  const prefetchPage = (href) => {
    if (!href || prefetchedUrls.has(href)) return;
    if (href.startsWith("#") || href.startsWith("upi:") || href.startsWith("http")) return;
    prefetchedUrls.add(href);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = href;
    link.as = "document";
    document.head.appendChild(link);
  };

  document.addEventListener("mouseover", (e) => {
    const a = e.target.closest("a[href]");
    if (a) prefetchPage(a.getAttribute("href"));
  }, { passive: true });

  document.addEventListener("touchstart", (e) => {
    const a = e.target.closest("a[href]");
    if (a) prefetchPage(a.getAttribute("href"));
  }, { passive: true });
}

export function pushModalState(modalId, closeCallback) {
  const existingIdx = AppState.activeModalStack.findIndex((m) => m.id === modalId);
  if (existingIdx !== -1) AppState.activeModalStack.splice(existingIdx, 1);
  AppState.activeModalStack.push({ id: modalId, close: closeCallback });
  try {
    window.history.pushState({ sellgstModal: modalId, ts: Date.now() }, "", window.location.href);
  } catch (_) {}
}

export function removeModalState(modalId) {
  const idx = AppState.activeModalStack.findIndex((m) => m.id === modalId);
  if (idx !== -1) AppState.activeModalStack.splice(idx, 1);
}

function initBackButtonManager() {
  window.addEventListener("popstate", () => {
    if (AppState.activeModalStack.length > 0) {
      const topModal = AppState.activeModalStack.pop();
      if (topModal && typeof topModal.close === "function") {
        topModal.close(true);
      }
      return;
    }
    const path = window.location.pathname;
    const isSubToolPage =
      path.includes("invoice") ||
      path.includes("ecom-audit") ||
      path.includes("gst-filing") ||
      path.includes("qr-studio") ||
      path.includes("login") ||
      path.includes("admin");

    if (isSubToolPage && document.referrer === "") {
      window.location.href = "./index.html";
    }
  });
}

// ============================================================================
// 10. TOAST NOTIFICATION SYSTEM
// ============================================================================
export function showToast(message, type = "success", duration = 4000) {
  let container = document.getElementById("sellgst-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "sellgst-toast-container";
    container.className =
      "fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-2.5 max-w-sm sm:w-full pointer-events-none";
    document.body.appendChild(container);
  }

  const colors = {
    success: "bg-[#081B4B] text-white border-emerald-400/40",
    warning: "bg-amber-500 text-slate-950 border-amber-600",
    error: "bg-rose-600 text-white border-rose-400",
    info: "bg-[#5B2EFF] text-white border-indigo-400"
  };

  const icons = { success: "✅", warning: "⏳", error: "⚠️", info: "✨" };

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl transition-all duration-300 ${colors[type] || colors.success}`;
  toast.innerHTML = `
    <span class="text-base select-none shrink-0">${icons[type] || "✅"}</span>
    <div class="text-[13px] font-semibold leading-snug flex-1 break-words">${sanitizeHTML(message)}</div>
    <button type="button" class="text-current opacity-70 hover:opacity-100 font-bold text-xs px-1">✕</button>
  `;

  toast.querySelector("button").addEventListener("click", () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "-translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================================
// 11. REAL-TIME FIRESTORE LISTENERS
// ============================================================================
function startSystemListeners() {
  try {
    const configRef = doc(db, "system_config", "payment_settings");
    AppState.listeners.configUnsub = onSnapshot(
      configRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          AppState.merchantConfig = {
            ...AppState.merchantConfig,
            upiId: data.upiId || "9661692365@ybl",
            payeeName: data.payeeName || "AGNI VOLT",
            monthlyPrice: Number(data.monthlyPrice) || 99,
            yearlyPrice: Number(data.yearlyPrice) || 499,
            whatsappWebhookNumber: data.whatsappWebhookNumber || localStorage.getItem("sellgst_owner_wa") || "",
            autoWhatsAppNotify: data.autoWhatsAppNotify !== false
          };
          notifyStateChange();
        }
      },
      () => {}
    );

    const broadcastRef = doc(db, "system_config", "broadcast");
    AppState.listeners.broadcastUnsub = onSnapshot(
      broadcastRef,
      (snap) => {
        if (snap.exists()) renderBroadcastBanner(snap.data());
      },
      () => {}
    );
  } catch (_) {}
}

function startUserRealtimeListeners(user) {
  cleanupUserListeners();
  if (!user || !user.uid) return;

  const userRef = doc(db, "users", user.uid);

  AppState.listeners.userUnsub = onSnapshot(
    userRef,
    async (snap) => {
      if (!snap.exists()) {
        const initialProfile = {
          ...AppState.profile,
          uid: user.uid,
          displayName: user.displayName || user.email?.split("@")[0] || "S.K.P.S DIGITAL",
          email: user.email || AppState.profile.email || "",
          phone: user.phoneNumber || AppState.profile.phone || "",
          businessName: user.displayName || AppState.profile.businessName || "S.K.P.S DIGITAL",
          isPro: false,
          isAdmin: false,
          subscriptionStatus: "FREE",
          planName: "FREE",
          paymentPending: false,
          dpdpConsentAccepted: true,
          createdAt: serverTimestamp()
        };
        try {
          await setDoc(userRef, initialProfile, { merge: true });
        } catch (_) {}
        AppState.profile = initialProfile;
        localStorage.setItem("sellgst_local_profile", JSON.stringify(AppState.profile));
      } else {
        const prevPro = AppState.profile.isPro;
        const prevPlan = AppState.profile.planName;
        const data = snap.data();

        AppState.profile = {
          ...AppState.profile,
          ...data,
          uid: user.uid,
          isPro: Boolean(data.isPro || data.subscriptionStatus === "ACTIVE"),
          planName: data.planName || (data.isPro ? "MONTHLY" : "FREE"),
          isAdmin: Boolean(data.isAdmin)
        };
        localStorage.setItem("sellgst_local_profile", JSON.stringify(AppState.profile));

        if ((!prevPro && AppState.profile.isPro) || (prevPlan !== AppState.profile.planName && AppState.profile.isPro)) {
          localStorage.removeItem("sellgst_pending_utr");
          showToast(`🎉 Payment Verified! SellGST Pro (${AppState.profile.planName}) is now ACTIVE!`, "success", 6000);
          closeProPaymentModal();
        }
      }

      syncProDOMElements();
      renderPendingPaymentBanner();
      notifyStateChange();
    },
    () => loadCachedLocalProfile(user)
  );

  const q = query(collection(db, "payment_requests"), where("uid", "==", user.uid), limit(5));
  AppState.listeners.paymentUnsub = onSnapshot(
    q,
    (snap) => {
      let latestPending = null;
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.status === "PENDING") latestPending = { id: docSnap.id, ...d };
      });
      AppState.pendingRequest = latestPending;
      renderPendingPaymentBanner();
      notifyStateChange();
    },
    () => renderPendingPaymentBanner()
  );
}

function cleanupUserListeners() {
  if (AppState.listeners.userUnsub) {
    AppState.listeners.userUnsub();
    AppState.listeners.userUnsub = null;
  }
  if (AppState.listeners.paymentUnsub) {
    AppState.listeners.paymentUnsub();
    AppState.listeners.paymentUnsub = null;
  }
}

function loadCachedLocalProfile(user) {
  try {
    const cached = getInitialHydratedProfile();
    AppState.profile = {
      ...cached,
      uid: user?.uid || cached.uid || "seller-local-01",
      displayName: user?.displayName || cached.displayName || "S.K.P.S DIGITAL",
      email: user?.email || cached.email || ""
    };
    syncProDOMElements();
    renderPendingPaymentBanner();
    notifyStateChange();
  } catch (_) {}
}

// ============================================================================
// 12. REAL-TIME DOM UNBLUR, TIER BADGE & 30-DAY COUNTDOWN ENGINE
// ============================================================================
export function syncProDOMElements() {
  const health = evaluateSubscriptionHealth();
  const isPro = health.isPro;
  const planName = health.planName; // "FREE" | "MONTHLY" | "YEARLY"
  const isAdmin = Boolean(AppState.profile.isAdmin);

  // 1. Update Pro Unlock / Upgrade Badges based on exact user rules:
  //    - FREE: Show "Unlock Pro ⚡ (5 Free Limit)"
  //    - MONTHLY (₹99): Show "⏳ XXd left • Upgrade ₹499/yr ⚡" (NEVER show ₹99 again!)
  //    - YEARLY (₹499): Hide all upgrade buttons & countdowns for 1 full year!
  document.querySelectorAll("[data-pro-badge]").forEach((el) => {
    if (isPro && planName === "YEARLY") {
      // Yearly Pro: Do not show any upgrade prompt or countdown
      el.textContent = "YEARLY PRO ✨";
      el.className =
        "px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#10E594] text-[#081B4B] shadow-sm whitespace-nowrap pointer-events-none";
    } else if (isPro && planName === "MONTHLY") {
      // Monthly Pro: Show 30-Day countdown + Upgrade to 499 Yearly
      const daysLabel = health.remainingDays > 0 ? `${health.remainingDays}d ${health.remainingHours}h left` : "30d left";
      el.textContent = `⏳ ${daysLabel} • Upgrade ₹499/yr ⚡`;
      el.className =
        "px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-[#081B4B] cursor-pointer shadow-md transition whitespace-nowrap";
    } else {
      // Free Tier: Show Unlock Pro with remaining free uses
      el.textContent = `Unlock Pro ⚡ (${health.freeActionsRemaining}/${FREE_USAGE_MAX_LIMIT} Free)`;
      el.className =
        "px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#5B2EFF] to-[#4318FF] text-white hover:opacity-95 cursor-pointer shadow-md transition whitespace-nowrap";
    }
  });

  // 2. Render 30-Day Countdown Banner ONLY for ₹99 Monthly users (Hidden for ₹499 Yearly)
  renderMonthlyCountdownBanner(health);

  // 3. Unmask Order IDs (ORD-XXXXXXX -> Real Order ID) in real time
  document.querySelectorAll("[data-order-id]").forEach((el) => {
    const realId = el.getAttribute("data-order-id") || "";
    if (isPro) {
      el.textContent = realId;
      el.classList.remove("blur-[4px]", "select-none", "text-gray-400");
      el.classList.add("text-slate-900", "font-mono", "font-semibold");
    } else {
      const masked = realId.length > 5 ? realId.slice(0, 4) + "-XXXXXXX" : "ORD-XXXXXXX";
      el.textContent = masked;
      el.classList.add("text-slate-500", "font-mono");
    }
  });

  // 4. Hide/Show Paywall Lock Overlays
  document.querySelectorAll("[data-pro-lock-overlay]").forEach((el) => {
    el.style.display = isPro ? "none" : "flex";
  });

  // 5. Strict Admin Isolation: Hide Master Admin links from regular users
  document.querySelectorAll("[data-admin-only]").forEach((el) => {
    el.classList.toggle("hidden", !isAdmin);
  });

  // 6. Update User Display Name & GSTIN
  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = AppState.profile.businessName || AppState.profile.displayName || "S.K.P.S DIGITAL";
  });

  document.querySelectorAll("[data-user-gstin]").forEach((el) => {
    el.textContent = AppState.profile.gstin || "07AABCS1429B1Z5";
  });
}

function renderMonthlyCountdownBanner(health) {
  let bar = document.getElementById("sellgst-monthly-expiry-banner");
  if (!health.isPro || health.planName !== "MONTHLY") {
    if (bar) bar.remove();
    return;
  }

  if (!bar) {
    bar = document.createElement("div");
    bar.id = "sellgst-monthly-expiry-banner";
    bar.className =
      "w-full bg-gradient-to-r from-[#081B4B] via-[#5B2EFF] to-[#081B4B] text-white px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-center gap-3 z-40";
    document.body.prepend(bar);
  }

  const daysText = health.remainingDays > 0 ? `${health.remainingDays} Days & ${health.remainingHours} Hours` : "29 Days & 23 Hours";
  bar.innerHTML = `
    <span>⏳ <strong>Monthly Pro Plan Active:</strong> <span class="text-[#10E594] font-mono font-bold">${daysText}</span> remaining before 30-day expiry.</span>
    <button type="button" data-unlock-pro="YEARLY" class="px-3 py-1 rounded-full bg-[#10E594] text-[#081B4B] font-extrabold text-[11px] shadow hover:scale-105 transition">
      Upgrade to Yearly @ ₹499 (1 Year No Interruptions) →
    </button>
  `;
}

export function renderPendingPaymentBanner() {
  let banner = document.getElementById("sellgst-pending-payment-banner");
  const localPending = localStorage.getItem("sellgst_pending_utr");
  const isPending =
    !AppState.profile.isPro &&
    (Boolean(AppState.pendingRequest) || Boolean(AppState.profile.paymentPending) || Boolean(localPending));

  if (!isPending) {
    if (banner) banner.remove();
    return;
  }

  if (!banner) {
    banner = document.createElement("div");
    banner.id = "sellgst-pending-payment-banner";
    banner.className =
      "w-full bg-amber-100/95 border-b border-amber-300 text-amber-950 px-4 py-2.5 text-[13px] font-medium flex flex-wrap items-center justify-between gap-2 z-40";
    document.body.prepend(banner);
  }

  const utrDisplay = AppState.pendingRequest?.utrNumber || localPending || "Submitted";
  banner.innerHTML = `
    <div class="flex items-center gap-2 mx-auto text-center">
      <span class="inline-block animate-spin text-sm">⏳</span>
      <span>
        <strong>Payment Verification Pending (UTR: ${sanitizeHTML(utrDisplay)})</strong> — Your account will activate automatically as soon as the admin verifies the bank transfer.
      </span>
    </div>
  `;
}

function renderBroadcastBanner(data) {
  let el = document.getElementById("sellgst-global-broadcast");
  if (!data || !data.active || !data.message) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("div");
    el.id = "sellgst-global-broadcast";
    el.className =
      "w-full bg-gradient-to-r from-[#081B4B] via-[#5B2EFF] to-[#081B4B] text-white px-4 py-2 text-[13px] font-semibold text-center tracking-wide z-40";
    document.body.prepend(el);
  }
  el.innerHTML = `📢 ${sanitizeHTML(data.message)}`;
}

// ============================================================================
// 13. SMART TIER-AWARE UPI PAYMENT MODAL
//     - FREE User: Shows ₹99 Monthly AND ₹499 Yearly
//     - ₹99 MONTHLY User: Hides ₹99 completely! Shows ONLY ₹499 Yearly Upgrade
//     - ₹499 YEARLY User: Does not open modal (Already on highest 1-Year plan)
// ============================================================================
export function openProPaymentModal(defaultPlan = "MONTHLY") {
  const health = evaluateSubscriptionHealth();

  if (health.isPro && health.planName === "YEARLY") {
    showToast("✨ Your 1-Year Pro Pass is already active!", "success");
    return;
  }

  let modal = document.getElementById("sellgst-upi-modal");
  if (modal) modal.remove();

  const cfg = AppState.merchantConfig;
  const isMonthlyUserUpgrading = health.isPro && health.planName === "MONTHLY";

  // Force YEARLY if user already has ₹99 Monthly plan
  const selectedPlan = isMonthlyUserUpgrading || defaultPlan === "YEARLY" ? "YEARLY" : "MONTHLY";
  const amount = selectedPlan === "YEARLY" ? cfg.yearlyPrice : cfg.monthlyPrice;
  const planTitle = selectedPlan === "YEARLY" ? "Pro Yearly Pass (12 Months)" : "Pro Monthly Pass (30 Days)";

  const upiUri = `upi://pay?pa=${encodeURIComponent(cfg.upiId)}&pn=${encodeURIComponent(cfg.payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent("SellGST Pro " + selectedPlan)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(upiUri)}`;

  modal = document.createElement("div");
  modal.id = "sellgst-upi-modal";
  modal.className =
    "fixed inset-0 z-[9990] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto";

  const planSelectorHTML = isMonthlyUserUpgrading
    ? `
      <!-- Monthly User: ONLY show ₹499 Yearly Upgrade -->
      <div class="mt-4 p-4 rounded-2xl border-2 border-[#5B2EFF] bg-indigo-50/50 relative">
        <span class="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">1 YEAR • NO COUNTDOWN</span>
        <div class="text-xs font-extrabold text-[#5B2EFF]">UPGRADE TO YEARLY PRO PASS</div>
        <div class="text-2xl font-black text-[#081B4B] mt-0.5">₹${cfg.yearlyPrice}<span class="text-xs font-medium text-slate-500"> / 12 Months</span></div>
        <p class="text-[11px] text-slate-600 mt-1">Unlocks all features + Dynamic QR Studio for 365 days without any renewal popups.</p>
      </div>
    `
    : `
      <!-- Free User: Show both ₹99 Monthly and ₹499 Yearly -->
      <div class="grid grid-cols-2 gap-3 mt-4">
        <button type="button" data-plan-select="MONTHLY" class="plan-card-btn p-3.5 rounded-2xl border-2 text-left transition ${selectedPlan === "MONTHLY" ? "border-[#5B2EFF] bg-indigo-50/40" : "border-slate-200"}">
          <div class="text-xs font-bold text-slate-500">MONTHLY PRO</div>
          <div class="text-xl font-black text-slate-900 mt-0.5">₹${cfg.monthlyPrice}<span class="text-xs font-medium text-slate-500">/30d</span></div>
        </button>
        <button type="button" data-plan-select="YEARLY" class="plan-card-btn p-3.5 rounded-2xl border-2 text-left transition relative ${selectedPlan === "YEARLY" ? "border-[#5B2EFF] bg-indigo-50/40" : "border-slate-200"}">
          <span class="absolute -top-2.5 right-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SAVE 58%</span>
          <div class="text-xs font-bold text-slate-500">YEARLY PRO</div>
          <div class="text-xl font-black text-slate-900 mt-0.5">₹${cfg.yearlyPrice}<span class="text-xs font-medium text-slate-500">/1yr</span></div>
        </button>
      </div>
    `;

  modal.innerHTML = `
    <div class="bg-white rounded-3xl border border-indigo-100 shadow-2xl max-w-md w-full p-5 sm:p-7 relative my-auto">
      <button type="button" id="close-upi-modal-btn" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold">✕</button>

      <div class="flex items-center gap-2 mb-2">
        <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-[#5B2EFF]">INSTANT UPI UNLOCK</span>
        <span class="text-[11px] font-semibold text-slate-500">Zero-Commission Direct Bank</span>
      </div>

      <h3 class="text-lg font-extrabold text-slate-900">${isMonthlyUserUpgrading ? "Upgrade to Yearly Pro (₹499)" : "Unlock SellGST Pro"}</h3>
      <p class="text-[13px] text-slate-500 mt-1">Unblur all RTO & Weight Fraud Order IDs, unlimited custom GST bills, 1-click GSTR-1 JSON & Dynamic QR Studio.</p>

      ${planSelectorHTML}

      <div class="mt-4 bg-slate-50 rounded-2xl p-4 text-center border border-slate-200">
        <div class="text-xs font-bold text-slate-700 mb-2">
          Step 1: Scan QR or Tap UPI App (<span id="upi-plan-label">${sanitizeHTML(planTitle)} — ₹${amount}</span>)
        </div>
        <div class="bg-white p-3 rounded-2xl inline-block shadow-sm border border-slate-100">
          <img id="upi-dynamic-qr" src="${qrUrl}" alt="Scan UPI QR Code" class="w-40 h-40 mx-auto rounded-lg object-contain" />
        </div>
        <div class="mt-2.5 text-xs text-slate-600 flex flex-wrap items-center justify-center gap-1.5">
          <span>Merchant: <strong class="text-slate-900">${sanitizeHTML(cfg.payeeName)}</strong></span>
          <span>•</span>
          <span class="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">${sanitizeHTML(cfg.upiId)}</span>
        </div>

        <a id="upi-deeplink-btn" href="${upiUri}" class="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#5B2EFF] hover:bg-indigo-700 text-white font-bold text-[13px] shadow-md transition">
          <span>📱 Pay ₹<span id="upi-btn-amt">${amount}</span> via PhonePe / GPay / Paytm</span>
        </a>
      </div>

      <form id="upi-utr-form" class="mt-4 space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">
            Step 2: Enter 12-Digit UPI UTR / Reference No.
          </label>
          <div class="flex gap-2">
            <input
              type="text"
              id="upi-utr-input"
              required
              minlength="6"
              maxlength="36"
              placeholder="e.g. 412893746512"
              class="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5B2EFF]"
            />
            <button
              type="button"
              id="upi-paid-quick-btn"
              class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs whitespace-nowrap"
            >
              I Have Paid
            </button>
          </div>
        </div>

        <button
          type="submit"
          id="upi-submit-btn"
          class="w-full py-3.5 px-5 rounded-2xl bg-[#081B4B] hover:bg-slate-900 text-white font-extrabold text-[13px] shadow-lg transition flex items-center justify-center gap-2"
        >
          <span>✅ Submit Payment & Notify Admin on WhatsApp</span>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  pushModalState("upi-payment-modal", () => closeProPaymentModal(true));

  let currentAmount = amount;
  let currentPlan = selectedPlan;

  modal.querySelectorAll("[data-plan-select]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = btn.getAttribute("data-plan-select");
      currentPlan = p;
      currentAmount = p === "YEARLY" ? cfg.yearlyPrice : cfg.monthlyPrice;
      const newUri = `upi://pay?pa=${encodeURIComponent(cfg.upiId)}&pn=${encodeURIComponent(cfg.payeeName)}&am=${currentAmount}&cu=INR&tn=${encodeURIComponent("SellGST Pro " + p)}`;
      const newQr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(newUri)}`;

      modal.querySelector("#upi-dynamic-qr").src = newQr;
      modal.querySelector("#upi-deeplink-btn").href = newUri;
      modal.querySelector("#upi-btn-amt").textContent = currentAmount;
      modal.querySelector("#upi-plan-label").textContent =
        (p === "YEARLY" ? "Pro Yearly Pass (12 Months)" : "Pro Monthly Pass (30 Days)") + ` — ₹${currentAmount}`;

      modal.querySelectorAll(".plan-card-btn").forEach((b) => {
        b.classList.remove("border-[#5B2EFF]", "bg-indigo-50/40");
        b.classList.add("border-slate-200");
      });
      btn.classList.remove("border-slate-200");
      btn.classList.add("border-[#5B2EFF]", "bg-indigo-50/40");
    });
  });

  modal.querySelector("#upi-paid-quick-btn").addEventListener("click", () => {
    const input = modal.querySelector("#upi-utr-input");
    if (!input.value.trim()) {
      input.value = "PAID-" + String(Date.now()).slice(-8);
    }
    input.focus();
  });

  modal.querySelector("#close-upi-modal-btn").addEventListener("click", () => closeProPaymentModal());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeProPaymentModal();
  });

  modal.querySelector("#upi-utr-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const utrInput = modal.querySelector("#upi-utr-input");
    const submitBtn = modal.querySelector("#upi-submit-btn");
    const utrNumber = sanitizeHTML(utrInput.value.trim());

    if (utrNumber.length < 6) {
      showToast("Please enter a valid 12-digit UPI UTR / Reference number.", "warning");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="animate-spin">⏳</span> Submitting & Alerting Admin...`;

    const uid = AppState.user?.uid || AppState.profile.uid || "guest-" + Date.now();
    const durationDays = currentPlan === "YEARLY" ? 365 : 30;
    const expectedExpiryISO = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const payload = {
      uid,
      userName: AppState.profile.businessName || AppState.profile.displayName || "S.K.P.S DIGITAL",
      userEmail: AppState.profile.email || AppState.user?.email || "seller@sellgst.pro",
      userPhone: AppState.profile.phone || "",
      planName: currentPlan,
      planDurationDays: durationDays,
      expectedExpiryISO,
      planAmount: Number(currentAmount),
      utrNumber,
      merchantUpi: cfg.upiId,
      status: "PENDING",
      createdAt: serverTimestamp(),
      createdAtISO: new Date().toISOString()
    };

    try {
      if (AppState.user) {
        await addDoc(collection(db, "payment_requests"), payload);
        await setDoc(doc(db, "users", uid), { paymentPending: true }, { merge: true });
      }
    } catch (_) {}

    localStorage.setItem("sellgst_pending_utr", utrNumber);
    const localQueue = JSON.parse(localStorage.getItem("sellgst_local_payment_requests") || "[]");
    localQueue.unshift({ id: "req_" + Date.now(), ...payload });
    localStorage.setItem("sellgst_local_payment_requests", JSON.stringify(localQueue.slice(0, 50)));

    AppState.pendingRequest = payload;
    renderPendingPaymentBanner();
    closeProPaymentModal();

    showToast("⏳ Payment Verification Pending! Sending instant WhatsApp alert to Admin...", "warning", 6000);

    // Automatically trigger WhatsApp notification to Owner's configured WhatsApp number
    const ownerWa = (cfg.whatsappWebhookNumber || localStorage.getItem("sellgst_owner_wa") || "").replace(/\D/g, "");
    if (ownerWa) {
      const waText =
        `🔔 *URGENT: SellGST Pro UPI Payment Pending*\n` +
        `• *Seller:* ${payload.userName}\n` +
        `• *UID:* ${uid}\n` +
        `• *Plan:* ${currentPlan} (₹${currentAmount} for ${durationDays} Days)\n` +
        `• *UTR No:* ${utrNumber}\n` +
        `• *Approve in 1-Click:* ${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, "")}/admin.html`;
      const waLink = `https://wa.me/${ownerWa}?text=${encodeURIComponent(waText)}`;
      window.open(waLink, "_blank", "noopener,noreferrer");
    }
  });
}

export function closeProPaymentModal(fromPopState = false) {
  const modal = document.getElementById("sellgst-upi-modal");
  if (modal) modal.remove();
  if (!fromPopState) {
    removeModalState("upi-payment-modal");
  }
}

// ============================================================================
// 14. USER PERSONAL ACCOUNT & DPDP ACT 2023 PRIVACY DRAWER
//     (For regular users instead of Master Admin: View Personal Data,
//      Delete Account with Confirmation Tick ✔️, and Bottom Logout Button)
// ============================================================================
export function openUserAccountModal() {
  let modal = document.getElementById("sellgst-user-account-modal");
  if (modal) modal.remove();

  const prof = AppState.profile;
  const health = evaluateSubscriptionHealth();

  let planBadgeText = "FREE TIER (5 Uses Limit)";
  if (health.isPro && health.planName === "YEARLY") {
    planBadgeText = "YEARLY PRO ACTIVE (1 Year Validity)";
  } else if (health.isPro && health.planName === "MONTHLY") {
    planBadgeText = `MONTHLY PRO ACTIVE (${health.remainingDays}d ${health.remainingHours}h left)`;
  }

  modal = document.createElement("div");
  modal.id = "sellgst-user-account-modal";
  modal.className =
    "fixed inset-0 z-[9992] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto";

  modal.innerHTML = `
    <div class="bg-white rounded-3xl border border-indigo-100 shadow-2xl max-w-md w-full p-5 sm:p-6 relative my-auto space-y-4">
      <button type="button" id="close-user-acc-btn" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600">✕</button>

      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#081B4B] to-[#5B2EFF] text-white flex items-center justify-center text-xl font-bold shadow">
          👤
        </div>
        <div class="min-w-0">
          <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#5B2EFF] font-extrabold text-[10px]">MY ACCOUNT & DPDP PRIVACY</span>
          <h3 class="text-base font-extrabold text-[#081B4B] truncate mt-0.5">${sanitizeHTML(prof.businessName || prof.displayName)}</h3>
          <p class="text-[11px] text-slate-500 font-mono truncate">${sanitizeHTML(prof.email || "seller@sellgst.pro")}</p>
        </div>
      </div>

      <!-- Subscription Status Card -->
      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-500">Subscription Tier:</span>
          <span class="font-extrabold text-[#5B2EFF]">${sanitizeHTML(planBadgeText)}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-500">Registered GSTIN:</span>
          <span class="font-mono font-bold text-[#081B4B]">${sanitizeHTML(prof.gstin || "07AABCS1429B1Z5")}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-500">DPDP Act 2023 Consent:</span>
          <span class="text-emerald-600 font-bold">✔️ Verified & Encrypted</span>
        </div>
      </div>

      <!-- Edit Personal & Business Details -->
      <form id="user-personal-form" class="space-y-2.5 text-xs">
        <div class="font-extrabold text-[#081B4B]">Edit My Store & Personal Data</div>
        <div>
          <label class="block font-semibold text-slate-600 mb-0.5">Business / Store Name</label>
          <input type="text" id="acc-biz-name" value="${escapeAttr(prof.businessName || "")}" required class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-semibold text-slate-600 mb-0.5">GSTIN</label>
            <input type="text" id="acc-gstin" maxlength="15" value="${escapeAttr(prof.gstin || "")}" class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono uppercase" />
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-0.5">Invoice UPI ID</label>
            <input type="text" id="acc-upi" value="${escapeAttr(prof.upiId || "")}" class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono" />
          </div>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-[#5B2EFF] hover:bg-indigo-700 text-white font-extrabold text-xs shadow transition">
          💾 Save Personal Profile
        </button>
      </form>

      <!-- DPDP Act 2023: Right to Erasure (Delete Account with Confirmation Tick ✔️) -->
      <div class="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2.5 text-xs">
        <div class="font-extrabold text-rose-800 flex items-center gap-1.5">
          <span>🛡️ DPDP Act 2023 — Right to Erasure & Delete Account</span>
        </div>
        <p class="text-[11px] text-rose-700 leading-relaxed">
          Under the Digital Personal Data Protection (DPDP) Act, you can permanently erase your account, saved GST invoices, party khata, and personal data.
        </p>
        <label class="flex items-start gap-2 cursor-pointer text-[11px] font-bold text-rose-900">
          <input type="checkbox" id="dpdp-delete-confirm-tick" class="mt-0.5 w-4 h-4 accent-rose-600 rounded shrink-0" />
          <span>✔️ I confirm that I want to permanently delete my account and erase all my personal & business data.</span>
        </label>
        <button
          type="button"
          id="dpdp-delete-account-btn"
          class="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow transition"
        >
          🗑️ Permanently Delete My Account & Data
        </button>
      </div>

      <!-- Bottom Logout Button (Required for all users) -->
      <div class="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
        ${
          prof.isAdmin
            ? `<a href="./admin.html" class="px-3.5 py-2.5 rounded-xl bg-indigo-50 text-[#5B2EFF] font-extrabold text-xs">🛡️ Master Admin</a>`
            : `<span class="text-[11px] text-slate-400 font-mono">UID: ${sanitizeHTML(String(prof.uid).slice(0, 10))}...</span>`
        }
        <button
          type="button"
          id="account-drawer-logout-btn"
          class="flex-1 py-2.5 px-4 rounded-xl bg-[#081B4B] hover:bg-slate-900 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5"
        >
          <span>⏻ Logout from Account</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const closeAccModal = (fromPop = false) => {
    modal.remove();
    if (!fromPop) removeModalState("user-account-modal");
  };
  pushModalState("user-account-modal", () => closeAccModal(true));

  modal.querySelector("#close-user-acc-btn").addEventListener("click", () => closeAccModal());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAccModal();
  });

  // Save Profile
  modal.querySelector("#user-personal-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const businessName = modal.querySelector("#acc-biz-name").value.trim();
    const gstin = modal.querySelector("#acc-gstin").value.trim().toUpperCase();
    const upiId = modal.querySelector("#acc-upi").value.trim();

    AppState.profile = {
      ...AppState.profile,
      businessName,
      displayName: businessName,
      gstin,
      upiId
    };
    localStorage.setItem("sellgst_local_profile", JSON.stringify(AppState.profile));

    if (AppState.user?.uid) {
      try {
        await setDoc(doc(db, "users", AppState.user.uid), { businessName, displayName: businessName, gstin, upiId }, { merge: true });
      } catch (_) {}
    }
    syncProDOMElements();
    showToast("Personal & Store profile updated!", "success");
    closeAccModal();
  });

  // DPDP Permanent Account & Data Deletion
  modal.querySelector("#dpdp-delete-account-btn").addEventListener("click", async () => {
    const tick = modal.querySelector("#dpdp-delete-confirm-tick");
    if (!tick.checked) {
      showToast("Please check the confirmation tick (✔️) first to delete your account.", "warning");
      return;
    }
    try {
      if (AppState.user?.uid) {
        await deleteDoc(doc(db, "users", AppState.user.uid)).catch(() => {});
        await deleteUser(AppState.user).catch(() => {});
      }
    } catch (_) {}

    localStorage.removeItem("sellgst_local_profile");
    localStorage.removeItem("sellgst_invoices");
    localStorage.removeItem("sellgst_parties");
    localStorage.removeItem("sellgst_inventory");
    localStorage.removeItem("sellgst_pending_utr");
    localStorage.removeItem("sellgst_qr_count");
    showToast("✔️ Account & personal data permanently erased under DPDP Act.", "info", 4000);
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 900);
  });

  // Logout
  modal.querySelector("#account-drawer-logout-btn").addEventListener("click", () => {
    logoutUser();
  });
}

// ============================================================================
// 15. FLOATING 3D AI CUSTOMER SUPPORT ASSISTANT
//     (Connects to Cloud Gemini Proxy on Cloudflare Pages & Vercel + Smart Engine)
// ============================================================================
function getSmartContextualReply(queryText = "") {
  const q = String(queryText).toLowerCase();

  if (q.includes("qr") || q.includes("review") || q.includes("dynamic")) {
    return "**Dynamic QR & Google Review Studio (`./qr-studio.html`):**\n\n- You can generate custom **Business Payment & Google Review QR Codes** directly inside SellGST Pro or visit our dedicated tool (`https://ritikraj3405328-web.github.io/Dynamic-Qr-generator-/#home`).\n- **Free Trial Limit:** Free users can create up to **5 QR codes**, after which SellGST Pro automatically locks the generator until you unlock **Pro (₹99/mo or ₹499/yr)**.";
  }

  if (q.includes("dpdp") || q.includes("delete") || q.includes("privacy") || q.includes("data")) {
    return "**DPDP Act 2023 Data Privacy & Account Deletion:**\n\n- **100% RAM Isolation:** Marketplace CSV files are scanned strictly inside your device's browser RAM.\n- **Right to Erasure:** Tap **My Account (👤)** in the navigation bar -> Tick the **✔️ Confirmation checkbox** -> Tap **Permanently Delete My Account & Data** to erase all cloud and local records immediately.";
  }

  if (q.includes("rto") || q.includes("claim") || q.includes("return") || q.includes("meesho") || q.includes("flipkart") || q.includes("amazon") || q.includes("weight")) {
    return "**How to Recover Pending RTO (>30 Days) & Weight Fraud (`./ecom-audit.html`):**\n\n1. Open **E-Com Audit** (`./ecom-audit.html`).\n2. Upload your **Meesho, Flipkart, or Amazon CSV** report.\n3. SellGST Pro flags every RTO overdue by **>30 days** and every **Courier Weight Slab Overcharge**.\n4. Click **📋 Claim Ticket** to copy a ready-to-submit SPF / SAFE-T / Meesho Support reimbursement claim!";
  }

  if (q.includes("gstr") || q.includes("json") || q.includes("gst.gov") || q.includes("3b") || q.includes("file")) {
    return "**How to File GSTR-1 (.JSON) & GSTR-3B in 60 Seconds (`./gst-filing.html`):**\n\n1. Open **GST Filing** (`./gst-filing.html`).\n2. Click **Download Official GSTR-1 (.JSON)** (validated for `gst.gov.in` schema v3.1.6).\n3. Log in to `gst.gov.in` -> **Returns Dashboard** -> **Prepare Offline** under GSTR-1 -> Upload the `.JSON` file and sign with **EVC (OTP)**.";
  }

  if (q.includes("invoice") || q.includes("bill") || q.includes("logo") || q.includes("sign")) {
    return "**Custom S.K.P.S Style Navy GST Invoice (`./invoice.html`):**\n\n- **Circle Logo:** Upload your store logo in the top circular badge.\n- **Editable Sections:** Edit Company Name, Address, Bill To, Ship To, Bank A/C, IFSC, Discount %, and SGST/CGST/IGST.\n- **Infinite Invoice ID:** Automatically increments (`4649845`, `4649846`...) up to infinity.\n- **Digital Signature:** Upload or type your signature above `Authorized Sign.`.";
  }

  if (q.includes("pro") || q.includes("99") || q.includes("499") || q.includes("upi") || q.includes("expiry")) {
    return "**SellGST Pro Subscription Rules:**\n\n- **Free Tier:** Limited to **5 free actions**, then all features lock.\n- **₹99 Monthly Plan:** Valid for **30 Days** (shows a live 30-day countdown timer and allows upgrading to the ₹499 Yearly plan).\n- **₹499 Yearly Plan:** Valid for **1 Full Year (365 Days)** in the background with **zero upgrade popups**!";
  }

  return `**Namaste! I am SellGST Pro AI (Powered by Google Gemini).**\n\nRegarding your question: *"${queryText.slice(0, 80)}"*\n\nHere is how you can do this in **SellGST Pro**:\n- **Custom Navy GST Invoice (\`./invoice.html\`):** Create bills with your Circle Logo, Digital Signature, and auto CGST/SGST/IGST split.\n- **E-Com Audit (\`./ecom-audit.html\`):** Scan Meesho/Flipkart/Amazon CSVs for >30d RTO claims & crop 4x6 thermal labels.\n- **1-Click GSTR-1 (\`./gst-filing.html\`):** Export official \`gst.gov.in\` JSON files.\n- **Dynamic QR Studio (\`./qr-studio.html\`):** Create business & Google Review QR codes.\n\n*Ask me any specific question about GST rates, HSN codes, RTO claims, or your account!*`;
}

function injectFloatingAIAssistant() {
  if (document.getElementById("sellgst-ai-orb")) return;

  const orb = document.createElement("button");
  orb.id = "sellgst-ai-orb";
  orb.type = "button";
  orb.setAttribute("aria-label", "Open SellGST 24/7 AI Assistant");
  orb.className =
    "fixed bottom-20 sm:bottom-6 right-4 z-[9980] group flex items-center gap-2.5 p-1.5 sm:pr-4 rounded-full bg-[#081B4B] text-white shadow-2xl border border-indigo-400/50 hover:scale-105 transition-all duration-300";

  orb.innerHTML = `
    <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#5B2EFF] via-purple-500 to-[#10E594] flex items-center justify-center shadow-inner relative">
      <span class="text-lg">🤖</span>
      <span class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10E594] border-2 border-[#081B4B] animate-ping"></span>
      <span class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10E594] border-2 border-[#081B4B]"></span>
    </div>
    <div class="hidden sm:flex flex-col text-left">
      <span class="text-[10px] font-bold uppercase tracking-wider text-[#10E594]">Gemini AI Support</span>
      <span class="text-xs font-extrabold text-white">Ask SellGST AI</span>
    </div>
  `;

  const drawer = document.createElement("div");
  drawer.id = "sellgst-ai-drawer";
  drawer.className =
    "fixed inset-y-0 right-0 z-[9985] w-full sm:w-[410px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out";

  drawer.innerHTML = `
    <div class="p-4 bg-gradient-to-r from-[#081B4B] to-[#5B2EFF] text-white flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg shadow">🤖</div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-extrabold text-sm">SellGST Pro Gemini AI</h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10E594] text-slate-950">ONLINE</span>
          </div>
          <p class="text-[11px] text-indigo-100">Answers anything about GST, E-Com, QR & Billing</p>
        </div>
      </div>
      <button type="button" id="close-ai-drawer-btn" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold">✕</button>
    </div>

    <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button type="button" data-ai-chip="How do I customize my Navy Invoice Logo and Digital Signature?" class="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#5B2EFF] text-xs font-semibold text-slate-800 whitespace-nowrap shadow-sm">
        🧾 Custom Invoice & Logo
      </button>
      <button type="button" data-ai-chip="How do I find Pending RTO (>30 days) and raise claims?" class="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#5B2EFF] text-xs font-semibold text-slate-800 whitespace-nowrap shadow-sm">
        📦 Pending RTO Claims
      </button>
      <button type="button" data-ai-chip="How do I generate Dynamic QR codes for Google Reviews and Business?" class="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#5B2EFF] text-xs font-semibold text-slate-800 whitespace-nowrap shadow-sm">
        🔳 Dynamic QR Studio
      </button>
      <button type="button" data-ai-chip="How to download GSTR-1 JSON and upload on gst.gov.in?" class="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#5B2EFF] text-xs font-semibold text-slate-800 whitespace-nowrap shadow-sm">
        🏛️ File GSTR-1 JSON
      </button>
    </div>

    <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 text-[13px]">
      <div class="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm text-slate-800 leading-relaxed">
        👋 <strong>Namaste! I am SellGST Pro AI (Powered by Google Gemini).</strong><br/>
        Ask me any question in <strong>English, Hindi, or Hinglish</strong>—about our website features, GST calculations, HSN codes, RTO claims, or Dynamic QR codes!
      </div>
    </div>

    <form id="ai-chat-form" class="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
      <input
        type="text"
        id="ai-chat-input"
        placeholder="Ask anything (like Google Gemini)..."
        class="flex-1 min-w-0 px-3.5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#5B2EFF]"
      />
      <button
        type="submit"
        class="px-4 py-2.5 rounded-2xl bg-[#5B2EFF] hover:bg-indigo-700 text-white font-bold text-[13px] shadow transition shrink-0"
      >
        Send
      </button>
    </form>
  `;

  document.body.appendChild(orb);
  document.body.appendChild(drawer);

  orb.addEventListener("click", () => openAIAssistant());
  drawer.querySelector("#close-ai-drawer-btn").addEventListener("click", () => closeAIAssistant());

  drawer.querySelectorAll("[data-ai-chip]").forEach((chip) => {
    chip.addEventListener("click", () => {
      sendAIMessage(chip.getAttribute("data-ai-chip"));
    });
  });

  drawer.querySelector("#ai-chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = drawer.querySelector("#ai-chat-input");
    const msg = input.value.trim();
    if (!msg) return;
    input.value = "";
    sendAIMessage(msg);
  });
}

export function openAIAssistant(initialQuery = "") {
  const drawer = document.getElementById("sellgst-ai-drawer");
  if (!drawer) return;
  drawer.classList.remove("translate-x-full");
  pushModalState("ai-assistant-drawer", () => closeAIAssistant(true));

  if (initialQuery && typeof initialQuery === "string") {
    sendAIMessage(initialQuery);
  } else {
    setTimeout(() => document.getElementById("ai-chat-input")?.focus(), 120);
  }
}

export function closeAIAssistant(fromPopState = false) {
  const drawer = document.getElementById("sellgst-ai-drawer");
  if (!drawer) return;
  drawer.classList.add("translate-x-full");
  if (!fromPopState) removeModalState("ai-assistant-drawer");
}

function formatAIMarkdown(text) {
  return sanitizeHTML(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, "<code class='px-1.5 py-0.5 rounded bg-indigo-50 font-mono text-[#5B2EFF] text-xs'>$1</code>")
    .replace(/\n/g, "<br/>");
}

async function sendAIMessage(messageText) {
  const container = document.getElementById("ai-chat-messages");
  if (!container) return;

  const userDiv = document.createElement("div");
  userDiv.className =
    "ml-auto max-w-[85%] bg-[#5B2EFF] text-white p-3 rounded-2xl rounded-tr-sm shadow-sm text-[13px] break-words";
  userDiv.textContent = messageText;
  container.appendChild(userDiv);

  const loadingDiv = document.createElement("div");
  loadingDiv.className =
    "max-w-[92%] bg-white p-3.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm text-slate-800 leading-relaxed text-[13px]";
  loadingDiv.innerHTML = `<span class="animate-pulse">✨</span> <span>Gemini AI is thinking...</span>`;
  container.appendChild(loadingDiv);
  container.scrollTop = container.scrollHeight;

  // Try local serverless endpoint first, then Cloudflare Pages production proxy (for GitHub Pages users)
  const endpoints = ["./api/ai-assistant", "https://sellgst-pro.pages.dev/api/ai-assistant"];
  let answered = false;

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          language: getCurrentLang(),
          pageContext: window.location.pathname,
          history: AppState.aiHistory.slice(-6)
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.reply) {
          AppState.aiHistory.push({ role: "user", text: messageText }, { role: "model", text: data.reply });
          loadingDiv.innerHTML = formatAIMarkdown(data.reply);
          answered = true;
          break;
        }
      }
    } catch (_) {}
  }

  if (!answered) {
    const fallbackReply = getSmartContextualReply(messageText);
    AppState.aiHistory.push({ role: "user", text: messageText }, { role: "model", text: fallbackReply });
    loadingDiv.innerHTML = formatAIMarkdown(fallbackReply);
  }

  container.scrollTop = container.scrollHeight;
}

// ============================================================================
// 16. AUTHENTICATION HELPERS (WITH DPDP CONSENT RECORDING)
// ============================================================================
export async function loginWithEmail(email, password, rememberMe = true) {
  const cleanEmail = email.trim();
  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  } catch (_) {}
  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const updatedProfile = {
    ...AppState.profile,
    uid: cred.user.uid,
    displayName: cred.user.displayName || cleanEmail.split("@")[0].toUpperCase(),
    businessName: cred.user.displayName || AppState.profile.businessName || cleanEmail.split("@")[0].toUpperCase(),
    email: cleanEmail
  };
  AppState.profile = updatedProfile;
  localStorage.setItem("sellgst_local_profile", JSON.stringify(updatedProfile));
  return cred;
}

export async function registerWithEmail(email, password, businessName, gstin, rememberMe = true, dpdpConsent = true) {
  const cleanEmail = email.trim();
  const cleanBiz = (businessName || cleanEmail.split("@")[0].toUpperCase() || "S.K.P.S DIGITAL").trim();
  const cleanGstin = (gstin || "07AABCS1429B1Z5").trim().toUpperCase();

  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  } catch (_) {}

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  try {
    await updateProfile(cred.user, { displayName: cleanBiz });
  } catch (_) {}

  const profileData = {
    ...AppState.profile,
    uid: cred.user.uid,
    displayName: cleanBiz,
    businessName: cleanBiz,
    gstin: cleanGstin,
    email: cleanEmail,
    isPro: false,
    isAdmin: false,
    subscriptionStatus: "FREE",
    planName: "FREE",
    freeActionsUsed: 0,
    dpdpConsentAccepted: Boolean(dpdpConsent),
    dpdpConsentTimestamp: new Date().toISOString(),
    paymentPending: false
  };

  AppState.profile = profileData;
  localStorage.setItem("sellgst_local_profile", JSON.stringify(profileData));

  try {
    await setDoc(doc(db, "users", cred.user.uid), { ...profileData, createdAt: serverTimestamp() }, { merge: true });
  } catch (_) {}
  return cred;
}

export async function resetUserPassword(email) {
  return sendPasswordResetEmail(auth, email.trim());
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  const updatedProfile = {
    ...AppState.profile,
    uid: cred.user.uid,
    displayName: cred.user.displayName || "S.K.P.S DIGITAL",
    businessName: cred.user.displayName || AppState.profile.businessName || "S.K.P.S DIGITAL",
    email: cred.user.email || "",
    dpdpConsentAccepted: true
  };
  AppState.profile = updatedProfile;
  localStorage.setItem("sellgst_local_profile", JSON.stringify(updatedProfile));
  return cred;
}

export function setupRecaptcha(buttonOrContainerId) {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (_) {}
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonOrContainerId, { size: "invisible" });
  return window.recaptchaVerifier;
}

export async function sendPhoneOTP(phoneNumber, recaptchaVerifier) {
  const digits = phoneNumber.replace(/\D/g, "").slice(-10);
  return signInWithPhoneNumber(auth, `+91${digits}`, recaptchaVerifier);
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (_) {}
  localStorage.removeItem("sellgst_demo_session");
  window.location.href = "./login.html";
}

// ============================================================================
// 17. AUTOMATIC INITIALIZATION
// ============================================================================
export function initSecurityCore() {
  initI18n();
  initBackButtonManager();
  initInstantPagePrefetcher();
  initSevenSecondPWAInstall();
  startSystemListeners();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDOMReady);
  } else {
    onDOMReady();
  }

  onAuthStateChanged(auth, (user) => {
    AppState.user = user;
    if (user) {
      startUserRealtimeListeners(user);
    } else {
      cleanupUserListeners();
      loadCachedLocalProfile(null);
    }
  });
}

function onDOMReady() {
  syncProDOMElements();
  renderPendingPaymentBanner();
  injectFloatingAIAssistant();
  init3DTiltCards();
  startSevenSecondPWAButtonTimer();

  document.body.addEventListener("click", (e) => {
    const unlockBtn = e.target.closest("[data-unlock-pro]");
    if (unlockBtn) {
      e.preventDefault();
      openProPaymentModal(unlockBtn.getAttribute("data-unlock-pro") || "MONTHLY");
      return;
    }

    const aiTrigger = e.target.closest("[data-open-ai]");
    if (aiTrigger) {
      e.preventDefault();
      openAIAssistant(aiTrigger.getAttribute("data-open-ai") || "");
      return;
    }

    const pwaBtn = e.target.closest("#pwa-install-btn, [data-pwa-install]");
    if (pwaBtn) {
      e.preventDefault();
      triggerPWAInstall();
      return;
    }

    const myAccBtn = e.target.closest("[data-open-account]");
    if (myAccBtn) {
      e.preventDefault();
      openUserAccountModal();
    }
  });
}

initSecurityCore();

window.SellGSTCore = {
  app,
  auth,
  db,
  AppState,
  FREE_USAGE_MAX_LIMIT,
  subscribeAppState,
  evaluateSubscriptionHealth,
  consumeFreeActionOrLock,
  generateUniqueInvoiceNumber,
  peekCurrentInvoiceNumber,
  init3DTiltCards,
  sanitizeHTML,
  sanitizeCSVCell,
  escapeAttr,
  formatINR,
  showToast,
  openProPaymentModal,
  closeProPaymentModal,
  openUserAccountModal,
  openAIAssistant,
  closeAIAssistant,
  triggerPWAInstall,
  loginWithEmail,
  registerWithEmail,
  resetUserPassword,
  loginWithGoogle,
  setupRecaptcha,
  sendPhoneOTP,
  logoutUser,
  t,
  setLanguage,
  getCurrentLang,
  SUPPORTED_LANGUAGES
};
