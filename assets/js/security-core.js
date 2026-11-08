/**
 * SellGST Pro — Principal Security Core, 0.1s Zero-Lag Hydration Engine,
 * Real-Time Firebase Cloud Sync, Semi-Automatic UPI Engine, Universal PWA Installer
 * & 24/7 Floating AI Customer Support Assistant
 * File: /assets/js/security-core.js
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
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
// 2. GLOBAL APPLICATION STATE (WITH 0.1s INSTANT LOCAL HYDRATION)
// ============================================================================
const DEFAULT_PROFILE = {
  uid: "seller-local-01",
  displayName: "AgniVolt E-Com Store",
  email: "",
  phone: "",
  gstin: "10AABCA8921K1Z5",
  businessName: "AgniVolt E-Com Store",
  stateCode: "10",
  stateName: "Bihar",
  upiId: "9661692365@ybl",
  isPro: false,
  isAdmin: false,
  subscriptionStatus: "FREE",
  paymentPending: false
};

function getInitialHydratedProfile() {
  try {
    const raw = localStorage.getItem("sellgst_local_profile");
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROFILE, ...parsed };
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
    whatsappWebhookNumber: "",
    autoWhatsAppNotify: true
  },
  pendingRequest: null,
  deferredPwaPrompt: null,
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
    // Execute immediately with 0.1s hydrated state
    try {
      callback(AppState);
    } catch (_) {}
  }
  return () => AppState.subscribers.delete(callback);
}

/**
 * High-performance rAF batched state notifier (Zero UI Jank / Lag)
 */
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
// 3. ZERO-TRUST XSS & CSV FORMULA-INJECTION SANITIZERS
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

/**
 * Prevents CSV Macro / Formula Injection (=, +, -, @, Tab, CR)
 */
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
// 4. 0.1s SPECULATIVE PAGE PREFETCHER (INSTANT NAVIGATION ENGINE)
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

  document.addEventListener(
    "mouseover",
    (e) => {
      const a = e.target.closest("a[href]");
      if (a) prefetchPage(a.getAttribute("href"));
    },
    { passive: true }
  );

  document.addEventListener(
    "touchstart",
    (e) => {
      const a = e.target.closest("a[href]");
      if (a) prefetchPage(a.getAttribute("href"));
    },
    { passive: true }
  );
}

// ============================================================================
// 5. NATIVE HARDWARE BACK-BUTTON & MODAL STACK MANAGER
// ============================================================================
export function pushModalState(modalId, closeCallback) {
  const existingIdx = AppState.activeModalStack.findIndex((m) => m.id === modalId);
  if (existingIdx !== -1) {
    AppState.activeModalStack.splice(existingIdx, 1);
  }
  AppState.activeModalStack.push({ id: modalId, close: closeCallback });
  try {
    window.history.pushState({ sellgstModal: modalId, ts: Date.now() }, "", window.location.href);
  } catch (_) {}
}

export function removeModalState(modalId) {
  const idx = AppState.activeModalStack.findIndex((m) => m.id === modalId);
  if (idx !== -1) {
    AppState.activeModalStack.splice(idx, 1);
  }
}

function initBackButtonManager() {
  window.addEventListener("popstate", () => {
    // 1. If any modal or AI drawer is open, close top-most overlay first
    if (AppState.activeModalStack.length > 0) {
      const topModal = AppState.activeModalStack.pop();
      if (topModal && typeof topModal.close === "function") {
        topModal.close(true);
      }
      return;
    }

    // 2. If user is on an inner tool page and has no history stack, route smoothly to ./app.html
    const path = window.location.pathname;
    const isSubToolPage =
      path.includes("invoice") ||
      path.includes("ecom-audit") ||
      path.includes("gst-filing") ||
      path.includes("admin");

    if (isSubToolPage && document.referrer === "") {
      window.location.href = "./app.html";
    }
  });
}

// ============================================================================
// 6. UNIVERSAL PWA INSTALL MANAGER (WORKS ON ALL PAGES & MOBILE BROWSERS)
// ============================================================================
function initUniversalPWAInstall() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    AppState.deferredPwaPrompt = e;
    document.querySelectorAll("#pwa-install-btn, [data-pwa-install]").forEach((btn) => {
      btn.classList.remove("hidden");
    });
  });

  window.addEventListener("appinstalled", () => {
    AppState.deferredPwaPrompt = null;
    showToast("🎉 SellGST Pro installed on your device!", "success");
  });
}

export async function triggerPWAInstall() {
  if (AppState.deferredPwaPrompt) {
    try {
      AppState.deferredPwaPrompt.prompt();
      await AppState.deferredPwaPrompt.userChoice;
      AppState.deferredPwaPrompt = null;
      return;
    } catch (_) {}
  }

  // Fallback Visual Guide Modal when browser native install prompt is deferred or on iOS/Android
  let modal = document.getElementById("sellgst-universal-pwa-modal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.id = "sellgst-universal-pwa-modal";
  modal.className =
    "fixed inset-0 z-[9995] bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-4";

  modal.innerHTML = `
    <div class="bg-white rounded-3xl border border-gray-200 max-w-sm w-full p-6 shadow-2xl text-center space-y-3.5 relative">
      <button type="button" id="close-univ-pwa-btn" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-600">✕</button>
      <div class="w-14 h-14 rounded-2xl bg-gray-900 text-[#CBE8BA] flex items-center justify-center font-black text-xl mx-auto shadow-md">
        S₹
      </div>
      <span class="inline-block px-3 py-0.5 rounded-full bg-[#CBE8BA] text-gray-900 font-extrabold text-[10px]">
        0.1s NATIVE APP MODE
      </span>
      <h3 class="text-lg font-extrabold text-gray-900">Install SellGST Pro App</h3>
      <div class="bg-[#F4F5F7] rounded-2xl p-3.5 text-left text-xs text-gray-700 space-y-2 border border-gray-200">
        <div class="flex items-start gap-2">
          <span class="font-extrabold text-gray-900">1.</span>
          <span>Tap the <strong>3-dots menu (⋮)</strong> in the top-right corner of Chrome (or Share icon on Safari).</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="font-extrabold text-gray-900">2.</span>
          <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="font-extrabold text-gray-900">3.</span>
          <span>Launch <strong>SellGST Pro</strong> directly from your home screen with full offline & 0.1s speed!</span>
        </div>
      </div>
      <button type="button" id="got-it-pwa-btn" class="w-full py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-xs shadow transition">
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
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePwaModal();
  });
}

// ============================================================================
// 7. TOAST NOTIFICATION SYSTEM
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
    success: "bg-gray-900 text-white border-emerald-500/40",
    warning: "bg-amber-500 text-gray-950 border-amber-600",
    error: "bg-rose-600 text-white border-rose-400",
    info: "bg-indigo-600 text-white border-indigo-400"
  };

  const icons = {
    success: "✅",
    warning: "⏳",
    error: "⚠️",
    info: "✨"
  };

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 ${colors[type] || colors.success}`;
  toast.innerHTML = `
    <span class="text-lg select-none shrink-0">${icons[type] || "✅"}</span>
    <div class="text-xs sm:text-sm font-semibold leading-snug flex-1 break-words">${sanitizeHTML(message)}</div>
    <button type="button" class="text-current opacity-70 hover:opacity-100 font-bold text-sm px-1">✕</button>
  `;

  toast.querySelector("button").addEventListener("click", () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "-translate-y-2");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================================
// 8. REAL-TIME FIRESTORE LISTENERS (PRO UNLOCK, PENDING BANNER & CONFIG)
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
            whatsappWebhookNumber: data.whatsappWebhookNumber || "",
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
        if (snap.exists()) {
          renderBroadcastBanner(snap.data());
        }
      },
      () => {}
    );
  } catch (_) {}
}

function startUserRealtimeListeners(user) {
  cleanupUserListeners();
  if (!user || !user.uid) return;

  const userRef = doc(db, "users", user.uid);

  // 1. Live User Profile & Instant Pro Activation Listener
  AppState.listeners.userUnsub = onSnapshot(
    userRef,
    async (snap) => {
      if (!snap.exists()) {
        const initialProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split("@")[0] || "SellGST Merchant",
          email: user.email || "",
          phone: user.phoneNumber || "",
          businessName: user.displayName || AppState.profile.businessName || "AgniVolt E-Com Store",
          gstin: AppState.profile.gstin || "10AABCA8921K1Z5",
          stateCode: AppState.profile.stateCode || "10",
          stateName: AppState.profile.stateName || "Bihar",
          upiId: AppState.profile.upiId || "9661692365@ybl",
          isPro: false,
          isAdmin: false,
          subscriptionStatus: "FREE",
          paymentPending: false,
          createdAt: serverTimestamp()
        };
        try {
          await setDoc(userRef, initialProfile, { merge: true });
        } catch (_) {}
        AppState.profile = { ...AppState.profile, ...initialProfile };
        localStorage.setItem("sellgst_local_profile", JSON.stringify(AppState.profile));
      } else {
        const prevPro = AppState.profile.isPro;
        const data = snap.data();
        AppState.profile = {
          ...AppState.profile,
          ...data,
          uid: user.uid,
          isPro: Boolean(data.isPro || data.subscriptionStatus === "ACTIVE"),
          isAdmin: Boolean(data.isAdmin)
        };
        localStorage.setItem("sellgst_local_profile", JSON.stringify(AppState.profile));

        // Real-Time Instant Unblur Celebration when Admin clicks Approve!
        if (!prevPro && AppState.profile.isPro) {
          localStorage.removeItem("sellgst_pending_utr");
          showToast("🎉 Payment Verified! SellGST Pro is now ACTIVE in real-time!", "success", 6000);
          closeProPaymentModal();
        }
      }

      syncProDOMElements();
      renderPendingPaymentBanner();
      notifyStateChange();
    },
    () => {
      loadCachedLocalProfile(user);
    }
  );

  // 2. Live Payment Request Status Listener
  const q = query(collection(db, "payment_requests"), where("uid", "==", user.uid), limit(5));

  AppState.listeners.paymentUnsub = onSnapshot(
    q,
    (snap) => {
      let latestPending = null;
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.status === "PENDING") {
          latestPending = { id: docSnap.id, ...d };
        }
      });
      AppState.pendingRequest = latestPending;
      renderPendingPaymentBanner();
      notifyStateChange();
    },
    () => {
      renderPendingPaymentBanner();
    }
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
      displayName: user?.displayName || cached.displayName || "AgniVolt E-Com Store",
      email: user?.email || cached.email || ""
    };
    syncProDOMElements();
    renderPendingPaymentBanner();
    notifyStateChange();
  } catch (_) {}
}

// ============================================================================
// 9. REAL-TIME DOM UNBLUR & STATUS BANNER ENGINE
// ============================================================================
export function syncProDOMElements() {
  const isPro = Boolean(AppState.profile.isPro);
  const isAdmin = Boolean(AppState.profile.isAdmin);

  // Update Pro Badges
  document.querySelectorAll("[data-pro-badge]").forEach((el) => {
    if (isPro) {
      el.textContent = "PRO ACTIVE ✨";
      el.className =
        "px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold bg-[#CBE8BA] text-gray-900 border border-emerald-400/60 shadow-sm whitespace-nowrap";
    } else {
      el.textContent = t("unlock_pro_btn", "Unlock Pro ⚡");
      el.className =
        "px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 cursor-pointer transition whitespace-nowrap";
    }
  });

  // Unmask Order IDs (ORD-XXXXXXX -> Real Order ID) in real time without refresh!
  document.querySelectorAll("[data-order-id]").forEach((el) => {
    const realId = el.getAttribute("data-order-id") || "";
    if (isPro) {
      el.textContent = realId;
      el.classList.remove("blur-[4px]", "select-none", "text-gray-400");
      el.classList.add("text-gray-900", "font-mono", "font-semibold");
    } else {
      const masked = realId.length > 5 ? realId.slice(0, 4) + "-XXXXXXX" : "ORD-XXXXXXX";
      el.textContent = masked;
      el.classList.add("text-gray-500", "font-mono");
    }
  });

  // Hide/Show Paywall Lock Overlays
  document.querySelectorAll("[data-pro-lock-overlay]").forEach((el) => {
    el.style.display = isPro ? "none" : "flex";
  });

  // Show/Hide Admin Navigation Links
  document.querySelectorAll("[data-admin-only]").forEach((el) => {
    el.classList.toggle("hidden", !isAdmin);
  });

  // Update User Display Name & Business Info in Navbar
  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = AppState.profile.businessName || AppState.profile.displayName || "AgniVolt E-Com Store";
  });

  document.querySelectorAll("[data-user-gstin]").forEach((el) => {
    el.textContent = AppState.profile.gstin || "10AABCA8921K1Z5";
  });
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
      "w-full bg-amber-100/95 border-b border-amber-300 text-amber-950 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium flex flex-wrap items-center justify-between gap-2 z-40";
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
      "w-full bg-gray-900 text-[#CBE8BA] px-4 py-2 text-xs sm:text-sm font-semibold text-center tracking-wide z-40";
    document.body.prepend(el);
  }
  el.innerHTML = `📢 ${sanitizeHTML(data.message)}`;
}

// ============================================================================
// 10. SEMI-AUTOMATIC UPI PAYMENT & 1-CLICK ADMIN APPROVAL MODAL
// ============================================================================
export function openProPaymentModal(defaultPlan = "MONTHLY") {
  let modal = document.getElementById("sellgst-upi-modal");
  if (modal) modal.remove();

  const cfg = AppState.merchantConfig;
  const selectedPlan = defaultPlan === "YEARLY" ? "YEARLY" : "MONTHLY";
  const amount = selectedPlan === "YEARLY" ? cfg.yearlyPrice : cfg.monthlyPrice;
  const planTitle = selectedPlan === "YEARLY" ? "Pro Yearly Pass (12 Months)" : "Pro Monthly Pass (30 Days)";

  const upiUri = `upi://pay?pa=${encodeURIComponent(cfg.upiId)}&pn=${encodeURIComponent(cfg.payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent("SellGST Pro Subscription")}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(upiUri)}`;

  modal = document.createElement("div");
  modal.id = "sellgst-upi-modal";
  modal.className =
    "fixed inset-0 z-[9990] bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto";

  modal.innerHTML = `
    <div class="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-5 sm:p-7 relative my-auto">
      <button type="button" id="close-upi-modal-btn" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold">✕</button>

      <div class="flex items-center gap-2 mb-2">
        <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-[#CBE8BA] text-gray-900">INSTANT UPI UNLOCK</span>
        <span class="text-[11px] font-semibold text-gray-500">Zero-Commission Direct Bank</span>
      </div>

      <h3 class="text-xl font-extrabold text-gray-900">Unlock SellGST Pro</h3>
      <p class="text-xs text-gray-500 mt-1">Unblur all RTO & Weight Fraud Order IDs, unlimited GST bills & 1-click GSTR-1 JSON export.</p>

      <!-- Plan Switcher -->
      <div class="grid grid-cols-2 gap-3 mt-4">
        <button type="button" data-plan-select="MONTHLY" class="plan-card-btn p-3.5 rounded-2xl border-2 text-left transition ${selectedPlan === "MONTHLY" ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"}">
          <div class="text-xs font-bold text-gray-500">MONTHLY PRO</div>
          <div class="text-xl font-black text-gray-900 mt-0.5">₹${cfg.monthlyPrice}<span class="text-xs font-medium text-gray-500">/mo</span></div>
        </button>
        <button type="button" data-plan-select="YEARLY" class="plan-card-btn p-3.5 rounded-2xl border-2 text-left transition relative ${selectedPlan === "YEARLY" ? "border-gray-900 bg-[#CBE8BA]/25" : "border-gray-200 hover:border-gray-300"}">
          <span class="absolute -top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SAVE 58%</span>
          <div class="text-xs font-bold text-gray-500">YEARLY PRO</div>
          <div class="text-xl font-black text-gray-900 mt-0.5">₹${cfg.yearlyPrice}<span class="text-xs font-medium text-gray-500">/yr</span></div>
        </button>
      </div>

      <!-- Step 1: Dynamic QR & Deep Link -->
      <div class="mt-4 bg-[#F4F5F7] rounded-2xl p-4 text-center border border-gray-200">
        <div class="text-xs font-bold text-gray-700 mb-2">
          Step 1: Scan QR or Tap UPI App (<span id="upi-plan-label">${sanitizeHTML(planTitle)} — ₹${amount}</span>)
        </div>
        <div class="bg-white p-3 rounded-2xl inline-block shadow-sm border border-gray-100">
          <img id="upi-dynamic-qr" src="${qrUrl}" alt="Scan UPI QR Code" class="w-40 h-40 mx-auto rounded-lg object-contain" />
        </div>
        <div class="mt-2.5 text-xs text-gray-600 flex flex-wrap items-center justify-center gap-1.5">
          <span>Merchant: <strong class="text-gray-900">${sanitizeHTML(cfg.payeeName)}</strong></span>
          <span>•</span>
          <span class="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-900">${sanitizeHTML(cfg.upiId)}</span>
        </div>

        <!-- Mobile 1-Click Intent Button -->
        <a id="upi-deeplink-btn" href="${upiUri}" class="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition">
          <span>📱 Pay ₹<span id="upi-btn-amt">${amount}</span> via PhonePe / GPay / Paytm</span>
        </a>
      </div>

      <!-- Step 2: Submit 12-Digit UTR -->
      <form id="upi-utr-form" class="mt-4 space-y-3">
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">
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
              class="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="button"
              id="upi-paid-quick-btn"
              title="Auto-fill timestamp reference if paid via mobile intent"
              class="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs whitespace-nowrap"
            >
              I Have Paid
            </button>
          </div>
        </div>

        <button
          type="submit"
          id="upi-submit-btn"
          class="w-full py-3.5 px-5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2"
        >
          <span>✅ Submit Payment for Instant Activation</span>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  pushModalState("upi-payment-modal", () => closeProPaymentModal(true));

  let currentAmount = amount;
  let currentPlan = selectedPlan;

  // Plan Switcher Handler
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
        b.classList.remove("border-gray-900", "bg-gray-50", "bg-[#CBE8BA]/25");
        b.classList.add("border-gray-200");
      });
      btn.classList.remove("border-gray-200");
      btn.classList.add("border-gray-900", p === "YEARLY" ? "bg-[#CBE8BA]/25" : "bg-gray-50");
    });
  });

  // "I Have Paid" quick helper
  modal.querySelector("#upi-paid-quick-btn").addEventListener("click", () => {
    const input = modal.querySelector("#upi-utr-input");
    if (!input.value.trim()) {
      input.value = "PAID-" + String(Date.now()).slice(-8);
    }
    input.focus();
  });

  // Close Button
  modal.querySelector("#close-upi-modal-btn").addEventListener("click", () => closeProPaymentModal());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeProPaymentModal();
  });

  // Form Submission -> Firestore `payment_requests` + Instant Admin Alert
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
    submitBtn.innerHTML = `<span class="animate-spin">⏳</span> Submitting Verification...`;

    const uid = AppState.user?.uid || AppState.profile.uid || "guest-" + Date.now();
    const payload = {
      uid,
      userName: AppState.profile.businessName || AppState.profile.displayName || "AgniVolt E-Com Store",
      userEmail: AppState.profile.email || AppState.user?.email || "seller@sellgst.pro",
      userPhone: AppState.profile.phone || "",
      planName: currentPlan,
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
    } catch (err) {
      console.warn("[Firestore Payment Queue Fallback]:", err.message);
    }

    // Persist locally so pending banner and local Admin testing work in 0.1s
    localStorage.setItem("sellgst_pending_utr", utrNumber);
    const localQueue = JSON.parse(localStorage.getItem("sellgst_local_payment_requests") || "[]");
    localQueue.unshift({ id: "req_" + Date.now(), ...payload });
    localStorage.setItem("sellgst_local_payment_requests", JSON.stringify(localQueue.slice(0, 50)));

    AppState.pendingRequest = payload;
    renderPendingPaymentBanner();
    closeProPaymentModal();

    showToast("⏳ Payment Verification Pending! Admin has been notified for instant activation.", "warning", 6000);

    // Trigger optional WhatsApp Instant Notification if configured by Admin in Firestore
    if (cfg.whatsappWebhookNumber && cfg.autoWhatsAppNotify) {
      const waText = `🔔 *New SellGST Pro UPI Payment*\n• *Seller:* ${payload.userName}\n• *UID:* ${uid}\n• *Plan:* ${currentPlan} (₹${currentAmount})\n• *UTR:* ${utrNumber}\n• *Approve Now:* ${window.location.origin}/admin.html`;
      const waLink = `https://wa.me/${encodeURIComponent(cfg.whatsappWebhookNumber.replace(/\D/g, ""))}?text=${encodeURIComponent(waText)}`;
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
// 11. FLOATING 3D AI CUSTOMER SUPPORT ASSISTANT (WITH ALL 4 CHIPS & FALLBACK)
// ============================================================================
function getLocalExpertAIReply(queryText = "") {
  const q = String(queryText).toLowerCase();
  if (q.includes("rto") || q.includes("claim") || q.includes("return") || q.includes("meesho") || q.includes("flipkart") || q.includes("amazon")) {
    return "**How to Recover Pending RTO (>30 Days) & Weight Fraud in SellGST Pro:**\n\n1. Open **E-Com Audit** (`./ecom-audit.html`).\n2. Upload your **Meesho, Flipkart, or Amazon CSV** settlement/return report (or tap **Load Realistic Leak Report**).\n3. SellGST Pro scans your file in 100% private browser RAM in `0.1s` and flags:\n   - **Overdue RTOs (>30 Days):** Orders marked RTO Initiated but never physically returned to your warehouse.\n   - **Courier Weight Slab Fraud:** Orders where courier billed 1kg/1.5kg instead of your SKU's actual weight.\n4. Tap **Claim Ticket** next to any flagged Order ID to copy a pre-formatted SPF / SAFE-T / Meesho Support claim ticket!";
  }
  if (q.includes("gstr") || q.includes("json") || q.includes("gst.gov") || q.includes("3b") || q.includes("file") || q.includes("filing")) {
    return "**How to File GSTR-1 in 60 Seconds using SellGST Pro:**\n\n1. Go to **GST Filing** (`./gst-filing.html`) and choose your return period.\n2. Review your auto-segregated **B2B Invoices**, **B2CS Summary**, and **HSN Summary**.\n3. Click **Download Official GSTR-1 (.JSON)**.\n4. Log in to `gst.gov.in` → **Returns Dashboard** → Select Month → Click **Prepare Offline** under GSTR-1 → Upload the downloaded `.JSON` file → Verify & File with **OTP (EVC)**.\n5. For **GSTR-3B**, use the 1-Click Copy boxes on the same page to paste exact IGST, CGST, and SGST values into Table 3.1.";
  }
  if (q.includes("pro") || q.includes("upi") || q.includes("pay") || q.includes("utr") || q.includes("unlock") || q.includes("99")) {
    return "**How to Activate SellGST Pro via Instant UPI:**\n\n1. Click **Unlock Pro** on the top navbar (**₹99/Month** or **₹499/Year**).\n2. **On Desktop:** Scan the dynamic QR code. **On Mobile:** Tap **Pay via PhonePe / GPay / Paytm** (Merchant: **AGNI VOLT**, UPI ID: `9661692365@ybl`).\n3. Enter your **12-digit UPI UTR / Reference No.** and click **Submit**.\n4. Once Admin clicks **Approve** in `./admin.html`, all masked Order IDs (`ORD-XXXXXXX`) unblur live on your screen within 1 second!";
  }
  if (q.includes("invoice") || q.includes("bill") || q.includes("igst") || q.includes("cgst") || q.includes("udhar") || q.includes("party")) {
    return "**How GST Billing & Automatic Tax Split Works (`./invoice.html`):**\n\n- **Auto Tax Split:** Select the **Buyer State (Place of Supply)**. If it matches your Seller State, SellGST Pro automatically splits GST into **50% CGST + 50% SGST**. If the states differ, it applies **100% IGST**.\n- **UPI QR on Bill:** Every printed/PDF invoice automatically embeds a dynamic UPI QR code for the exact invoice total.\n- **Party Udhar & Stock:** Saving an invoice automatically updates the customer's **Udhar (Khata) balance** and deducts **SKU inventory stock**.";
  }
  return "**Welcome to SellGST AI Support (24/7)!** Here is what I can help you with right now:\n\n- **E-Com Audit (`./ecom-audit.html`):** Find unreturned RTO orders (>30 days), detect courier weight slab overcharging, and crop A4 sheets to **4x6 thermal labels**.\n- **GST Billing (`./invoice.html`):** Create GST-compliant B2B/B2C bills with auto CGST/SGST/IGST calculation, custom UPI QR code, and Party Udhar tracking.\n- **1-Click GSTR-1 Filing (`./gst-filing.html`):** Download ready-to-upload `gst.gov.in` JSON files and copy GSTR-3B figures.\n- **Pro Activation:** Pay ₹99/mo via UPI (`9661692365@ybl`), submit your 12-digit UTR, and get real-time activation.";
}

function injectFloatingAIAssistant() {
  if (document.getElementById("sellgst-ai-orb")) return;

  // 1. Glowing 3D AI Orb Button in Bottom-Right
  const orb = document.createElement("button");
  orb.id = "sellgst-ai-orb";
  orb.type = "button";
  orb.setAttribute("aria-label", "Open SellGST 24/7 AI Assistant");
  orb.className =
    "fixed bottom-20 sm:bottom-6 right-4 z-[9980] group flex items-center gap-2.5 p-1.5 sm:pr-4 rounded-full bg-gray-950 text-white shadow-2xl border border-indigo-400/40 hover:scale-105 transition-all duration-300";

  orb.innerHTML = `
    <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-emerald-400 flex items-center justify-center shadow-inner relative">
      <span class="text-lg">🤖</span>
      <span class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#CBE8BA] border-2 border-gray-950 animate-ping"></span>
      <span class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#CBE8BA] border-2 border-gray-950"></span>
    </div>
    <div class="hidden sm:flex flex-col text-left">
      <span class="text-[10px] font-bold uppercase tracking-wider text-[#CBE8BA]">24/7 AI Support</span>
      <span class="text-xs font-extrabold text-white">Ask SellGST AI</span>
    </div>
  `;

  // 2. Slide-Over AI Chat Drawer with ALL 4 Quick Prompt Chips
  const drawer = document.createElement("div");
  drawer.id = "sellgst-ai-drawer";
  drawer.className =
    "fixed inset-y-0 right-0 z-[9985] w-full sm:w-[410px] bg-white shadow-2xl border-l border-gray-200 flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out";

  drawer.innerHTML = `
    <!-- Header -->
    <div class="p-4 sm:p-5 bg-gray-950 text-white flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-500 to-emerald-400 flex items-center justify-center text-lg shadow">
          🤖
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-extrabold text-sm">SellGST Pro AI</h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#CBE8BA] text-gray-950">ONLINE</span>
          </div>
          <p class="text-[11px] text-gray-400">Trained on GST Filing, RTO Claims & Billing</p>
        </div>
      </div>
      <button type="button" id="close-ai-drawer-btn" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold">✕</button>
    </div>

    <!-- All 4 Quick Prompt Chips -->
    <div class="px-4 py-2.5 bg-[#F4F5F7] border-b border-gray-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button type="button" data-ai-chip="How do I find Pending RTO (>30 days) and raise claims?" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-gray-900 text-[11px] font-semibold text-gray-800 whitespace-nowrap shadow-sm">
        📦 Pending RTO Claims
      </button>
      <button type="button" data-ai-chip="How to download GSTR-1 JSON and upload on gst.gov.in?" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-gray-900 text-[11px] font-semibold text-gray-800 whitespace-nowrap shadow-sm">
        🏛️ File GSTR-1 JSON
      </button>
      <button type="button" data-ai-chip="How to unlock Pro via UPI and how fast is activation?" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-gray-900 text-[11px] font-semibold text-gray-800 whitespace-nowrap shadow-sm">
        ⚡ Unlock Pro UPI
      </button>
      <button type="button" data-ai-chip="How does CGST+SGST vs IGST auto-calculation work?" class="px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-gray-900 text-[11px] font-semibold text-gray-800 whitespace-nowrap shadow-sm">
        🧾 GST Invoice Rules
      </button>
    </div>

    <!-- Messages Container -->
    <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F4F5F7]/50 text-xs sm:text-sm">
      <div class="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm text-gray-800 leading-relaxed">
        👋 <strong>Namaste! I am SellGST AI.</strong><br/>
        Ask me anything in <strong>English, Hindi, Hinglish</strong>, or your regional language about:
        <ul class="list-disc pl-4 mt-1.5 space-y-1 text-xs text-gray-600">
          <li>Exporting Amazon, Flipkart & Meesho CSVs for <strong>RTO (&gt;30 days)</strong> & <strong>Weight Fraud</strong></li>
          <li>Creating GST Bills with <strong>Dynamic UPI QR</strong> & Party Udhar</li>
          <li>1-Click <strong>GSTR-1 .JSON</strong> filing on <code>gst.gov.in</code></li>
          <li>Instant <strong>Pro Activation</strong> via UPI (<code>9661692365@ybl</code>)</li>
        </ul>
      </div>
    </div>

    <!-- Input Bar -->
    <form id="ai-chat-form" class="p-3.5 bg-white border-t border-gray-200 flex items-center gap-2">
      <input
        type="text"
        id="ai-chat-input"
        placeholder="Ask about RTO claims, GST filing, bills..."
        class="flex-1 min-w-0 px-3.5 py-2.5 rounded-2xl bg-[#F4F5F7] border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      <button
        type="submit"
        id="ai-chat-send-btn"
        class="px-4 py-2.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs sm:text-sm shadow transition shrink-0"
      >
        Send
      </button>
    </form>
  `;

  document.body.appendChild(orb);
  document.body.appendChild(drawer);

  orb.addEventListener("click", () => openAIAssistant());
  drawer.querySelector("#close-ai-drawer-btn").addEventListener("click", () => closeAIAssistant());

  // Bind Quick Prompt Chips
  drawer.querySelectorAll("[data-ai-chip]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const q = chip.getAttribute("data-ai-chip");
      sendAIMessage(q);
    });
  });

  // Form Submit
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
    setTimeout(() => {
      document.getElementById("ai-chat-input")?.focus();
    }, 120);
  }
}

export function closeAIAssistant(fromPopState = false) {
  const drawer = document.getElementById("sellgst-ai-drawer");
  if (!drawer) return;
  drawer.classList.add("translate-x-full");
  if (!fromPopState) {
    removeModalState("ai-assistant-drawer");
  }
}

function formatAIMarkdown(text) {
  const safe = sanitizeHTML(text);
  return safe
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, "<code class='px-1.5 py-0.5 rounded bg-gray-100 font-mono text-indigo-700 text-xs'>$1</code>")
    .replace(/\n/g, "<br/>");
}

async function sendAIMessage(messageText) {
  const container = document.getElementById("ai-chat-messages");
  if (!container) return;

  const userDiv = document.createElement("div");
  userDiv.className =
    "ml-auto max-w-[85%] bg-gray-900 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm text-xs sm:text-sm break-words";
  userDiv.textContent = messageText;
  container.appendChild(userDiv);

  const loadingDiv = document.createElement("div");
  loadingDiv.className =
    "max-w-[92%] bg-white p-3.5 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm text-gray-800 leading-relaxed text-xs sm:text-sm";
  loadingDiv.innerHTML = `<span class="animate-pulse">✨</span> <span>SellGST AI is analyzing...</span>`;
  container.appendChild(loadingDiv);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch("./api/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: messageText,
        language: getCurrentLang(),
        pageContext: window.location.pathname,
        history: AppState.aiHistory.slice(-6)
      })
    });

    if (!res.ok) throw new Error("Fallback to local AI engine");
    const data = await res.json();
    const reply = data?.reply || getLocalExpertAIReply(messageText);

    AppState.aiHistory.push({ role: "user", text: messageText });
    AppState.aiHistory.push({ role: "model", text: reply });
    loadingDiv.innerHTML = formatAIMarkdown(reply);
  } catch (_) {
    // 0.1s Instant Local Knowledge Engine (Works even on static GitHub Pages & Cloudflare Pages)
    const fallbackReply = getLocalExpertAIReply(messageText);
    AppState.aiHistory.push({ role: "user", text: messageText });
    AppState.aiHistory.push({ role: "model", text: fallbackReply });
    loadingDiv.innerHTML = formatAIMarkdown(fallbackReply);
  }

  container.scrollTop = container.scrollHeight;
}

// ============================================================================
// 12. BULLETPROOF AUTHENTICATION HELPERS (EMAIL, GOOGLE & PHONE OTP)
// ============================================================================
export async function loginWithEmail(email, password) {
  const cleanEmail = email.trim();
  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const updatedProfile = {
    ...AppState.profile,
    uid: cred.user.uid,
    displayName: cred.user.displayName || cleanEmail.split("@")[0],
    businessName: cred.user.displayName || AppState.profile.businessName || cleanEmail.split("@")[0],
    email: cleanEmail
  };
  AppState.profile = updatedProfile;
  localStorage.setItem("sellgst_local_profile", JSON.stringify(updatedProfile));
  return cred;
}

export async function registerWithEmail(email, password, businessName, gstin) {
  const cleanEmail = email.trim();
  const cleanBiz = (businessName || "AgniVolt E-Com Store").trim();
  const cleanGstin = (gstin || "10AABCA8921K1Z5").trim().toUpperCase();

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  try {
    await updateProfile(cred.user, { displayName: cleanBiz });
  } catch (_) {}

  const profileData = {
    uid: cred.user.uid,
    displayName: cleanBiz,
    businessName: cleanBiz,
    gstin: cleanGstin,
    stateCode: cleanGstin.slice(0, 2) || "10",
    stateName: "Bihar",
    upiId: "9661692365@ybl",
    email: cleanEmail,
    isPro: false,
    isAdmin: false,
    subscriptionStatus: "FREE",
    paymentPending: false
  };

  AppState.profile = profileData;
  localStorage.setItem("sellgst_local_profile", JSON.stringify(profileData));

  try {
    await setDoc(doc(db, "users", cred.user.uid), { ...profileData, createdAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn("[Firestore Registration Profile Sync Deferred]:", err.message);
  }
  return cred;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  const updatedProfile = {
    ...AppState.profile,
    uid: cred.user.uid,
    displayName: cred.user.displayName || "Seller Store",
    businessName: cred.user.displayName || AppState.profile.businessName || "Seller Store",
    email: cred.user.email || ""
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
  window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonOrContainerId, {
    size: "invisible"
  });
  return window.recaptchaVerifier;
}

export async function sendPhoneOTP(phoneNumber, recaptchaVerifier) {
  const digits = phoneNumber.replace(/\D/g, "").slice(-10);
  const formatted = `+91${digits}`;
  return signInWithPhoneNumber(auth, formatted, recaptchaVerifier);
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (_) {}
  localStorage.removeItem("sellgst_demo_session");
  window.location.href = "./index.html";
}

// ============================================================================
// 13. AUTOMATIC CORE INITIALIZATION
// ============================================================================
export function initSecurityCore() {
  initI18n();
  initBackButtonManager();
  initInstantPagePrefetcher();
  initUniversalPWAInstall();
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
  // Hydrate DOM in <10ms from local cache before network completes
  syncProDOMElements();
  renderPendingPaymentBanner();
  injectFloatingAIAssistant();

  // Global Event Delegation for Pro Unlock, AI Drawer & Universal PWA Install
  document.body.addEventListener("click", (e) => {
    const unlockBtn = e.target.closest("[data-unlock-pro]");
    if (unlockBtn) {
      e.preventDefault();
      const plan = unlockBtn.getAttribute("data-unlock-pro") || "MONTHLY";
      openProPaymentModal(plan);
      return;
    }

    const aiTrigger = e.target.closest("[data-open-ai]");
    if (aiTrigger) {
      e.preventDefault();
      const promptText = aiTrigger.getAttribute("data-open-ai") || "";
      openAIAssistant(promptText);
      return;
    }

    const pwaBtn = e.target.closest("#pwa-install-btn, [data-pwa-install]");
    if (pwaBtn) {
      e.preventDefault();
      triggerPWAInstall();
    }
  });
}

initSecurityCore();

window.SellGSTCore = {
  app,
  auth,
  db,
  AppState,
  subscribeAppState,
  sanitizeHTML,
  sanitizeCSVCell,
  escapeAttr,
  formatINR,
  showToast,
  openProPaymentModal,
  closeProPaymentModal,
  openAIAssistant,
  closeAIAssistant,
  triggerPWAInstall,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  setupRecaptcha,
  sendPhoneOTP,
  logoutUser,
  t,
  setLanguage,
  getCurrentLang,
  SUPPORTED_LANGUAGES
};
