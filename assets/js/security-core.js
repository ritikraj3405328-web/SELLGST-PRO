/**
 * SellGST Pro — Principal Security Core, 3D Interactive Physics Engine,
 * 7-Second Auto-Hide PWA Installer, Infinite Invoice ID Generator,
 * Firebase Cloud Sync & 24/7 Floating AI Assistant
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
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
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
// 2. CLOUDFLARE & GITHUB PAGES SELF-HEALING URL / CACHE GUARD
// ============================================================================
(function selfHealDomainAndCache() {
  try {
    // If user accidentally opened blocked *.workers.dev domain, redirect to fast *.pages.dev
    if (window.location.hostname.endsWith(".workers.dev")) {
      const targetPath = window.location.pathname + window.location.search + window.location.hash;
      window.location.replace("https://sellgst-pro.pages.dev" + targetPath);
      return;
    }
    // Clear legacy v1 caches once so new 3D UI loads in 0.1s
    const cacheClearedKey = "sellgst_v3_cache_healed";
    if (!localStorage.getItem(cacheClearedKey) && "caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          if (!name.includes("v3")) caches.delete(name);
        });
      });
      localStorage.setItem(cacheClearedKey, "1");
    }
  } catch (_) {}
})();

// ============================================================================
// 3. GLOBAL APPLICATION STATE (WITH 0.1s INSTANT LOCAL HYDRATION)
// ============================================================================
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
  signatureDataUrl: "",
  signatureText: "Authorized Signatory",
  invoiceNote: "Please include the Invoice number in your payment notes. To be paid in full in maximum 7 days after receiving the invoice.",
  isPro: false,
  isAdmin: false,
  subscriptionStatus: "FREE",
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
    whatsappWebhookNumber: "",
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
// 4. INFINITE UNIQUE INVOICE ID GENERATOR (1 TO INFINITY + RANDOM ENTROPY)
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
// 5. ZERO-TRUST XSS & CSV FORMULA-INJECTION SANITIZERS
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
// 6. 3D INTERACTIVE MOUSE-HOVER TILT & GLOSSY SPOTLIGHT ENGINE
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
          const rotateX = ((y - centerY) / centerY) * -6.5;
          const rotateY = ((x - centerX) / centerX) * 6.5;

          card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale3d(1.01, 1.01, 1.01)`;
          card.style.boxShadow = "0 24px 48px -12px rgba(91, 46, 255, 0.22)";
        });
      },
      { passive: true }
    );

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)";
      card.style.boxShadow = "";
    });
  };

  document.querySelectorAll(".bento-card, .bento-mint, .card-3d, [data-3d-tilt]").forEach(attach3D);
}

// ============================================================================
// 7. 7-SECOND AUTO-HIDING PWA INSTALL BUTTON MANAGER
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

  // Hide automatically after exactly 7 seconds (7000 ms) as requested
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
  modal.className =
    "fixed inset-0 z-[9995] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4";

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
        <div class="flex items-start gap-2">
          <span class="font-extrabold text-[#5B2EFF]">3.</span>
          <span>Launch <strong>SellGST Pro</strong> from your home screen with 0.1s speed!</span>
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
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closePwaModal();
  });
}

// ============================================================================
// 8. SPECULATIVE PAGE PREFETCHER & NATIVE BACK-BUTTON MANAGER
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
      path.includes("admin");

    if (isSubToolPage && document.referrer === "") {
      window.location.href = "./app.html";
    }
  });
}

// ============================================================================
// 9. TOAST NOTIFICATION SYSTEM (MEDIUM BALANCED TYPOGRAPHY)
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
    success: "bg-[#0B1F52] text-white border-emerald-400/40",
    warning: "bg-amber-500 text-slate-950 border-amber-600",
    error: "bg-rose-600 text-white border-rose-400",
    info: "bg-[#5B2EFF] text-white border-indigo-400"
  };

  const icons = {
    success: "✅",
    warning: "⏳",
    error: "⚠️",
    info: "✨"
  };

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
// 10. REAL-TIME FIRESTORE LISTENERS (PRO UNLOCK, PENDING BANNER & CONFIG)
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
          paymentPending: false,
          createdAt: serverTimestamp()
        };
        try {
          await setDoc(userRef, initialProfile, { merge: true });
        } catch (_) {}
        AppState.profile = initialProfile;
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
// 11. REAL-TIME DOM UNBLUR & STATUS BANNER ENGINE
// ============================================================================
export function syncProDOMElements() {
  const isPro = Boolean(AppState.profile.isPro);
  const isAdmin = Boolean(AppState.profile.isAdmin);

  document.querySelectorAll("[data-pro-badge]").forEach((el) => {
    if (isPro) {
      el.textContent = "PRO ACTIVE ✨";
      el.className =
        "px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-400 text-slate-950 shadow-sm whitespace-nowrap";
    } else {
      el.textContent = t("unlock_pro_btn", "Unlock Pro ⚡");
      el.className =
        "px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#5B2EFF] to-[#4318FF] text-white hover:opacity-95 cursor-pointer shadow-md transition whitespace-nowrap";
    }
  });

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

  document.querySelectorAll("[data-pro-lock-overlay]").forEach((el) => {
    el.style.display = isPro ? "none" : "flex";
  });

  document.querySelectorAll("[data-admin-only]").forEach((el) => {
    el.classList.toggle("hidden", !isAdmin);
  });

  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = AppState.profile.businessName || AppState.profile.displayName || "S.K.P.S DIGITAL";
  });

  document.querySelectorAll("[data-user-gstin]").forEach((el) => {
    el.textContent = AppState.profile.gstin || "07AABCS1429B1Z5";
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
      "w-full bg-gradient-to-r from-[#0B1F52] via-[#5B2EFF] to-[#0B1F52] text-white px-4 py-2 text-[13px] font-semibold text-center tracking-wide z-40";
    document.body.prepend(el);
  }
  el.innerHTML = `📢 ${sanitizeHTML(data.message)}`;
}

// ============================================================================
// 12. SEMI-AUTOMATIC UPI PAYMENT & 1-CLICK ADMIN APPROVAL MODAL
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
    "fixed inset-0 z-[9990] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto";

  modal.innerHTML = `
    <div class="bg-white rounded-3xl border border-indigo-100 shadow-2xl max-w-md w-full p-5 sm:p-7 relative my-auto">
      <button type="button" id="close-upi-modal-btn" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold">✕</button>

      <div class="flex items-center gap-2 mb-2">
        <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-[#5B2EFF]">INSTANT UPI UNLOCK</span>
        <span class="text-[11px] font-semibold text-slate-500">Zero-Commission Direct Bank</span>
      </div>

      <h3 class="text-lg font-extrabold text-slate-900">Unlock SellGST Pro</h3>
      <p class="text-[13px] text-slate-500 mt-1">Unblur all RTO & Weight Fraud Order IDs, unlimited custom GST bills & 1-click GSTR-1 JSON export.</p>

      <div class="grid grid-cols-2 gap-3 mt-4">
        <button type="button" data-plan-select="MONTHLY" class="plan-card-btn p-3.5 rounded-2xl border-2 text-left transition ${selectedPlan === "MONTHLY" ? "border-[#5B2EFF] bg-indigo-50/40" : "border-slate-200"}">
          <div class="text-xs font-bold text-slate-500">MONTHLY PRO</div>
          <div class="text-xl font-black text-slate-900 mt-0.5">₹${cfg.monthlyPrice}<span class="text-xs font-medium text-slate-500">/mo</span></div>
        </button>
        <button type="button" data-plan-select="YEARLY" class="plan-card-btn p-3.5 rounded-2xl border-2 text-left transition relative ${selectedPlan === "YEARLY" ? "border-[#5B2EFF] bg-indigo-50/40" : "border-slate-200"}">
          <span class="absolute -top-2.5 right-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">SAVE 58%</span>
          <div class="text-xs font-bold text-slate-500">YEARLY PRO</div>
          <div class="text-xl font-black text-slate-900 mt-0.5">₹${cfg.yearlyPrice}<span class="text-xs font-medium text-slate-500">/yr</span></div>
        </button>
      </div>

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
          class="w-full py-3.5 px-5 rounded-2xl bg-[#0B1F52] hover:bg-slate-900 text-white font-extrabold text-[13px] shadow-lg transition flex items-center justify-center gap-2"
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
    submitBtn.innerHTML = `<span class="animate-spin">⏳</span> Submitting Verification...`;

    const uid = AppState.user?.uid || AppState.profile.uid || "guest-" + Date.now();
    const payload = {
      uid,
      userName: AppState.profile.businessName || AppState.profile.displayName || "S.K.P.S DIGITAL",
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
    } catch (_) {}

    localStorage.setItem("sellgst_pending_utr", utrNumber);
    const localQueue = JSON.parse(localStorage.getItem("sellgst_local_payment_requests") || "[]");
    localQueue.unshift({ id: "req_" + Date.now(), ...payload });
    localStorage.setItem("sellgst_local_payment_requests", JSON.stringify(localQueue.slice(0, 50)));

    AppState.pendingRequest = payload;
    renderPendingPaymentBanner();
    closeProPaymentModal();

    showToast("⏳ Payment Verification Pending! Admin has been notified.", "warning", 6000);

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
// 13. FLOATING 3D AI CUSTOMER SUPPORT ASSISTANT
// ============================================================================
function getLocalExpertAIReply(queryText = "") {
  const q = String(queryText).toLowerCase();
  if (q.includes("rto") || q.includes("claim") || q.includes("return") || q.includes("meesho") || q.includes("flipkart") || q.includes("amazon")) {
    return "**How to Recover Pending RTO (>30 Days) & Weight Fraud in SellGST Pro:**\n\n1. Open **E-Com Audit** (`./ecom-audit.html`).\n2. Upload your **Meesho, Flipkart, or Amazon CSV** report.\n3. SellGST Pro scans your file in 100% private browser RAM in `0.1s` and flags Overdue RTOs (>30 Days) & Courier Weight Slab Fraud.\n4. Tap **Claim Ticket** next to any flagged Order ID to copy a pre-formatted SPF / SAFE-T / Meesho claim ticket!";
  }
  if (q.includes("gstr") || q.includes("json") || q.includes("gst.gov") || q.includes("3b") || q.includes("file")) {
    return "**How to File GSTR-1 in 60 Seconds using SellGST Pro:**\n\n1. Open **GST Filing** (`./gst-filing.html`).\n2. Click **Download Official GSTR-1 (.JSON)**.\n3. Log in to `gst.gov.in` → **Returns Dashboard** → **Prepare Offline** under GSTR-1 → Upload the `.JSON` file and file with **EVC (OTP)**.";
  }
  if (q.includes("invoice") || q.includes("bill") || q.includes("logo") || q.includes("sign")) {
    return "**How Custom Navy GST Invoice & Logo/Signature Work (`./invoice.html`):**\n\n- **Circular Logo:** Click the circular logo in the top header curve to upload your own store/brand logo.\n- **100% Editable Sections:** Every field (Company Name, Bill To, Ship To, Bank Account, IFSC, Notes, Discount, CGST/SGST/IGST) is editable.\n- **Digital Signature:** Draw or type your signature above `Authorized Sign.`.\n- **Infinite Unique Invoice ID:** Automatically increments (`4649845`, `4649846`...) up to infinity!";
  }
  return "**Welcome to SellGST AI Support (24/7)!**\n- **Custom GST Invoice (`./invoice.html`):** S.K.P.S Digital style Navy Wave Invoice with custom circle logo, digital signature & auto tax split.\n- **E-Com Audit (`./ecom-audit.html`):** Find RTO >30 days, Weight Fraud & crop 4x6 thermal labels.\n- **1-Click GSTR-1 (`./gst-filing.html`):** Download official `gst.gov.in` JSON.";
}

function injectFloatingAIAssistant() {
  if (document.getElementById("sellgst-ai-orb")) return;

  const orb = document.createElement("button");
  orb.id = "sellgst-ai-orb";
  orb.type = "button";
  orb.setAttribute("aria-label", "Open SellGST 24/7 AI Assistant");
  orb.className =
    "fixed bottom-20 sm:bottom-6 right-4 z-[9980] group flex items-center gap-2.5 p-1.5 sm:pr-4 rounded-full bg-[#0B1F52] text-white shadow-2xl border border-indigo-400/50 hover:scale-105 transition-all duration-300";

  orb.innerHTML = `
    <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-[#5B2EFF] via-purple-500 to-emerald-400 flex items-center justify-center shadow-inner relative">
      <span class="text-lg">🤖</span>
      <span class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0B1F52] animate-ping"></span>
      <span class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0B1F52]"></span>
    </div>
    <div class="hidden sm:flex flex-col text-left">
      <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-300">24/7 AI Support</span>
      <span class="text-xs font-extrabold text-white">Ask SellGST AI</span>
    </div>
  `;

  const drawer = document.createElement("div");
  drawer.id = "sellgst-ai-drawer";
  drawer.className =
    "fixed inset-y-0 right-0 z-[9985] w-full sm:w-[400px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out";

  drawer.innerHTML = `
    <div class="p-4 bg-gradient-to-r from-[#0B1F52] to-[#5B2EFF] text-white flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg shadow">🤖</div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-extrabold text-sm">SellGST Pro AI</h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-950">ONLINE</span>
          </div>
          <p class="text-[11px] text-indigo-100">Trained on GST Filing, RTO Claims & Billing</p>
        </div>
      </div>
      <button type="button" id="close-ai-drawer-btn" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold">✕</button>
    </div>

    <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button type="button" data-ai-chip="How do I customize my Invoice Logo, Bank Details and Digital Signature?" class="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#5B2EFF] text-xs font-semibold text-slate-800 whitespace-nowrap shadow-sm">
        🧾 Custom Invoice & Logo
      </button>
      <button type="button" data-ai-chip="How do I find Pending RTO (>30 days) and raise claims?" class="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#5B2EFF] text-xs font-semibold text-slate-800 whitespace-nowrap shadow-sm">
        📦 Pending RTO Claims
      </button>
      <button type="button" data-ai-chip="How to download GSTR-1 JSON and upload on gst.gov.in?" class="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#5B2EFF] text-xs font-semibold text-slate-800 whitespace-nowrap shadow-sm">
        🏛️ File GSTR-1 JSON
      </button>
    </div>

    <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 text-[13px]">
      <div class="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm text-slate-800 leading-relaxed">
        👋 <strong>Namaste! I am SellGST AI.</strong><br/>
        Ask me anything about customizing your <strong>Navy GST Invoice, Circle Logo, Digital Signature, RTO Claims, or GSTR-1 JSON Filing</strong>!
      </div>
    </div>

    <form id="ai-chat-form" class="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
      <input
        type="text"
        id="ai-chat-input"
        placeholder="Ask about invoices, RTO claims, GST..."
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
    if (!res.ok) throw new Error("Fallback");
    const data = await res.json();
    const reply = data?.reply || getLocalExpertAIReply(messageText);
    AppState.aiHistory.push({ role: "user", text: messageText }, { role: "model", text: reply });
    loadingDiv.innerHTML = formatAIMarkdown(reply);
  } catch (_) {
    const fallbackReply = getLocalExpertAIReply(messageText);
    AppState.aiHistory.push({ role: "user", text: messageText }, { role: "model", text: fallbackReply });
    loadingDiv.innerHTML = formatAIMarkdown(fallbackReply);
  }
  container.scrollTop = container.scrollHeight;
}

// ============================================================================
// 14. AUTHENTICATION HELPERS (EMAIL, SIGNUP, GOOGLE, REMEMBER ME, RESET PASSWORD)
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

export async function registerWithEmail(email, password, businessName, gstin, rememberMe = true) {
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
  return signInWithPhoneNumber(auth, `+91${digits}`, recaptchaVerifier);
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (_) {}
  localStorage.removeItem("sellgst_demo_session");
  window.location.href = "./index.html";
}

// ============================================================================
// 15. AUTOMATIC INITIALIZATION
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
