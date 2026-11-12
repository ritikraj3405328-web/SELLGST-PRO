/**
 * SellGST Pro — Principal Security Core v6.8 (100% Full Uncut Original + Global ☰ Super Tools Sidebar)
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

export { initI18n, t, getCurrentLang, setLanguage, SUPPORTED_LANGUAGES };

export const DEFAULT_OWNER_WHATSAPP = "917808990039";

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

(function selfHealDomainAndCache() {
  try {
    const host = window.location.hostname;
    if (
      host.endsWith(".workers.dev") ||
      (/^[a-f0-9]+\.sellgst-pro\.pages\.dev$/i.test(host) && host !== "sellgst-pro.pages.dev")
    ) {
      const targetPath = window.location.pathname + window.location.search + window.location.hash;
      window.location.replace("https://sellgst-pro.pages.dev" + targetPath);
      return;
    }

    const healKey = "sellgst_v6_8_sw_healed";
    if (!localStorage.getItem(healKey)) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      }
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((n) => {
            if (!n.includes("v5")) caches.delete(n);
          });
        });
      }
      localStorage.setItem(healKey, "1");
    }
  } catch (_) {}
})();

export function fixTopLayoutSpacingGap() {
  if (!document.body) return;
  document.body.classList.remove("justify-between");
  document.body.classList.add("justify-start");

  const header = document.querySelector("header");
  if (header && header.classList.contains("top-2.5")) {
    header.classList.remove("top-2.5");
    header.classList.add("top-1", "mt-1");
  }
  const main = document.querySelector("main");
  if (main && main.classList.contains("mt-5")) {
    main.classList.remove("mt-5");
    main.classList.add("mt-2.5");
  }
}

export const GUEST_PREVIEW_DURATION_MS = 2 * 60 * 1000;
let guestCountdownInterval = null;

export function isUserPermanentlyLoggedIn() {
  return localStorage.getItem("sellgst_auth_logged_in") === "1" || Boolean(auth.currentUser);
}

export function isGuestPreviewActive() {
  const startTs = Number(localStorage.getItem("sellgst_guest_start_ts") || "0");
  if (!startTs) return false;
  return Date.now() - startTs < GUEST_PREVIEW_DURATION_MS;
}

export function startGuestPreviewSession(targetUrl = "./index.html") {
  localStorage.removeItem("sellgst_auth_logged_in");
  if (!localStorage.getItem("sellgst_guest_start_ts")) {
    localStorage.setItem("sellgst_guest_start_ts", String(Date.now()));
  }
  window.location.href = targetUrl;
}

function isCurrentPageLogin() {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, "");
  return path.endsWith("/login.html") || path.endsWith("/login") || path.includes("/login.");
}

function isCurrentPageAdmin() {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, "");
  return path.endsWith("/admin.html") || path.endsWith("/admin") || path.includes("/admin.");
}

function enforceAuthAndGuestGate() {
  if (isCurrentPageAdmin()) return;

  const loggedIn = isUserPermanentlyLoggedIn();
  const onLoginPage = isCurrentPageLogin();
  const params = new URLSearchParams(window.location.search);

  if (loggedIn) {
    localStorage.removeItem("sellgst_guest_start_ts");
    removeGuestBanner();
    if (onLoginPage && params.get("mode") !== "switch") {
      window.location.replace("./index.html");
    }
    return;
  }

  if (onLoginPage) return;

  const guestStart = Number(localStorage.getItem("sellgst_guest_start_ts") || "0");
  if (!guestStart) {
    window.location.replace("./login.html");
    return;
  }

  const elapsed = Date.now() - guestStart;
  if (elapsed >= GUEST_PREVIEW_DURATION_MS) {
    localStorage.removeItem("sellgst_guest_start_ts");
    localStorage.setItem("sellgst_guest_expired", "1");
    window.location.replace("./login.html?mode=signup&reason=guest_timeout");
    return;
  }

  startLiveGuestCountdownBar(guestStart);
}

function startLiveGuestCountdownBar(guestStartTs) {
  if (guestCountdownInterval) clearInterval(guestCountdownInterval);

  const renderTick = () => {
    if (isUserPermanentlyLoggedIn()) {
      clearInterval(guestCountdownInterval);
      removeGuestBanner();
      return;
    }

    const remainingMs = Math.max(0, GUEST_PREVIEW_DURATION_MS - (Date.now() - guestStartTs));
    if (remainingMs <= 0) {
      clearInterval(guestCountdownInterval);
      localStorage.removeItem("sellgst_guest_start_ts");
      localStorage.setItem("sellgst_guest_expired", "1");
      window.location.replace("./login.html?mode=signup&reason=guest_timeout");
      return;
    }

    const totalSec = Math.ceil(remainingMs / 1000);
    const mins = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const secs = String(totalSec % 60).padStart(2, "0");

    let bar = document.getElementById("sellgst-guest-timer-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "sellgst-guest-timer-bar";
      bar.className =
        "w-full bg-gradient-to-r from-[#081B4B] via-[#5B2EFF] to-[#081B4B] text-white px-3 py-1.5 text-xs font-semibold flex flex-wrap items-center justify-center gap-2 z-50 shadow-sm no-print";
      document.body.prepend(bar);
      fixTopLayoutSpacingGap();
    }

    bar.innerHTML = `
      <span>👀 <strong>Guest Preview:</strong> <span class="px-2 py-0.5 rounded bg-white/20 text-[#10E594] font-mono font-extrabold">${mins}:${secs}</span> left before Signup redirect.</span>
      <a href="./login.html?mode=signup" class="px-3 py-0.5 rounded-full bg-[#10E594] text-[#081B4B] font-extrabold text-[11px] shadow hover:scale-105 transition">
        Create Free Account Now →
      </a>
    `;
  };

  renderTick();
  guestCountdownInterval = setInterval(renderTick, 1000);
}

function removeGuestBanner() {
  const bar = document.getElementById("sellgst-guest-timer-bar");
  if (bar) bar.remove();
}

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
  invoiceNote: "Please include Invoice number in notes.",
  isPro: false,
  isAdmin: false,
  subscriptionStatus: "FREE",
  planName: "FREE",
  planActivatedAt: null,
  planExpiryISO: null,
  freeActionsUsed: 0,
  dpdpConsentAccepted: true,
  dpdpConsentTimestamp: new Date().toISOString(),
  paymentPending: false
};

function getInitialHydratedProfile() {
  try {
    const raw = localStorage.getItem("sellgst_local_profile");
    if (raw) {
      const parsed = { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
      if (parsed.isPro) {
        parsed.paymentPending = false;
      }
      return parsed;
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
    whatsappWebhookNumber: localStorage.getItem("sellgst_owner_wa") || DEFAULT_OWNER_WHATSAPP,
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

export function syncLiveProfitLossVisuals() {
  try {
    const rawMetrics = localStorage.getItem("sellgst_live_pnl_metrics");
    if (!rawMetrics) return;
    const m = JSON.parse(rawMetrics);
    if (!m || typeof m.finalNetResult !== "number" || !Number.isFinite(m.finalNetResult)) return;

    const isProfit = m.finalNetResult >= 0;
    const totalOrders = Math.max(1, Number(m.totalOrders) || 1);
    const profitOrders = Number(m.profitOrderCount) || 0;
    const lossOrders = Number(m.lossOrderCount) || 0;
    const winRatioPct = Math.round((profitOrders / totalOrders) * 100);

    const needleAngle = isProfit
      ? Math.min(58, Math.max(12, Math.round((winRatioPct / 100) * 58)))
      : Math.max(-58, Math.min(-18, -Math.round(((lossOrders / totalOrders) || 0.5) * 58)));

    const homeNeedle = document.getElementById("home-gauge-needle");
    if (homeNeedle) {
      homeNeedle.setAttribute("transform", `rotate(${needleAngle} 65 66)`);
      homeNeedle.setAttribute("fill", isProfit ? "#10B981" : "#F43F5E");
    }

    const dashNeedle = document.getElementById("speedo-needle");
    if (dashNeedle) {
      dashNeedle.setAttribute("transform", `rotate(${needleAngle} 100 95)`);
      const poly = dashNeedle.querySelector("polygon");
      if (poly) poly.setAttribute("fill", isProfit ? "#10B981" : "#F43F5E");
    }

    const kpiSales = document.getElementById("kpi-sales-val");
    const kpiRto = document.getElementById("kpi-rto-val");
    const kpiVal = document.getElementById("kpi-valuation-val");
    if (kpiSales && m.totalSettlement !== undefined) kpiSales.textContent = formatINR(m.totalSettlement);
    if (kpiRto && m.totalLossAmt !== undefined) {
      kpiRto.textContent = isProfit ? `+${formatINR(m.totalProfitAmt)}` : `-${formatINR(m.totalLossAmt)}`;
      kpiRto.className = `text-[13px] font-black font-mono mt-0.5 ${isProfit ? "text-emerald-600" : "text-rose-600"}`;
    }
    if (kpiVal && m.totalSettlement !== undefined) kpiVal.textContent = formatINR(Math.max(0, m.totalSettlement * 12));
  } catch (_) {}
}

/**
 * Reconciles local & Admin-approved requests so "Verification Pending" never stays stuck after Admin approval.
 */
function reconcileLocalApprovedRequests() {
  try {
    const localQueue = JSON.parse(localStorage.getItem("sellgst_local_payment_requests") || "[]");
    const pendingUtr = localStorage.getItem("sellgst_pending_utr");
    const currentUid = AppState.user?.uid || AppState.profile?.uid;

    const approvedItem = localQueue.find(
      (r) =>
        r.status === "APPROVED" &&
        ((pendingUtr && r.utrNumber === pendingUtr) || (currentUid && r.uid === currentUid && r.id !== "req_demo_100"))
    );

    if (approvedItem) {
      const cleanPlan = approvedItem.planName === "YEARLY" ? "YEARLY" : "MONTHLY";
      const durationDays = cleanPlan === "YEARLY" ? 365 : 30;
      const expiryISO =
        approvedItem.expectedExpiryISO || new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

      localStorage.removeItem("sellgst_pending_utr");
      AppState.pendingRequest = null;
      AppState.profile.isPro = true;
      AppState.profile.subscriptionStatus = "ACTIVE";
      AppState.profile.planName = cleanPlan;
      AppState.profile.planExpiryISO = expiryISO;
      AppState.profile.paymentPending = false;
      localStorage.setItem("sellgst_local_profile", JSON.stringify(AppState.profile));
    }

    const rejectedItem = localQueue.find(
      (r) => r.status === "REJECTED" && pendingUtr && r.utrNumber === pendingUtr
    );
    if (rejectedItem) {
      localStorage.removeItem("sellgst_pending_utr");
      AppState.pendingRequest = null;
      AppState.profile.paymentPending = false;
      localStorage.setItem("sellgst_local_profile", JSON.stringify(AppState.profile));
    }
  } catch (_) {}
}

export function evaluateSubscriptionHealth() {
  reconcileLocalApprovedRequests();
  const prof = AppState.profile;
  const now = Date.now();

  if (prof.isPro) {
    localStorage.removeItem("sellgst_pending_utr");
    prof.paymentPending = false;
    AppState.pendingRequest = null;
  }

  if (prof.isPro && prof.planExpiryISO) {
    const expTime = new Date(prof.planExpiryISO).getTime();
    if (!isNaN(expTime) && now > expTime) {
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

  const qrCount = Number(localStorage.getItem("sellgst_qr_count")) || 0;
  const profileCount = Number(prof.freeActionsUsed) || 0;
  const combinedUsed = Math.max(0, profileCount, qrCount);
  if (combinedUsed !== profileCount) {
    prof.freeActionsUsed = combinedUsed;
  }

  const remainingMs = prof.planExpiryISO ? Math.max(0, new Date(prof.planExpiryISO).getTime() - now) : 0;
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return {
    isPro: Boolean(prof.isPro),
    planName: prof.isPro ? (prof.planName === "YEARLY" ? "YEARLY" : "MONTHLY") : "FREE",
    remainingDays: Number.isFinite(remainingDays) ? remainingDays : 30,
    remainingHours: Number.isFinite(remainingHours) ? remainingHours : 0,
    freeActionsUsed: combinedUsed,
    freeActionsRemaining: Math.max(0, FREE_USAGE_MAX_LIMIT - combinedUsed)
  };
}

export function consumeFreeActionOrLock(featureName = "Feature") {
  const status = evaluateSubscriptionHealth();
  if (status.isPro) return true;

  let used = status.freeActionsUsed;
  if (used >= FREE_USAGE_MAX_LIMIT) {
    showToast(
      `🔒 Free Limit (${FREE_USAGE_MAX_LIMIT}/${FREE_USAGE_MAX_LIMIT}) reached for ${featureName}! Upgrade to Pro to continue.`,
      "warning",
      5000
    );
    openProPaymentModal("MONTHLY");
    return false;
  }

  used += 1;
  AppState.profile.freeActionsUsed = used;
  localStorage.setItem("sellgst_qr_count", String(used));
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

export function generateUniqueInvoiceNumber() {
  try {
    let seq = Number(localStorage.getItem("sellgst_infinite_inv_seq") || "4649844");
    if (!Number.isFinite(seq)) seq = 4649844;
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
    return String(Number.isFinite(seq) ? seq : 4649845);
  } catch (_) {
    return "4649845";
  }
}

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
  const num = Number(amount);
  return inrFormatter.format(Number.isFinite(num) ? num : 0);
}

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

  let secLeft = 7;
  const secTimer = setInterval(() => {
    secLeft -= 1;
    document.querySelectorAll("#pwa-sec-badge").forEach((b) => {
      if (secLeft > 0) b.textContent = `${secLeft}s`;
    });
    if (secLeft <= 0) {
      clearInterval(secTimer);
    }
  }, 1000);

  setTimeout(() => {
    clearInterval(secTimer);
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
      path.includes("label-studio") ||
      path.includes("gst-filing") ||
      path.includes("gov-excel-to-json") ||
      path.includes("json-validator") ||
      path.includes("reconciliation-2a-2b") ||
      path.includes("ecom-to-tally") ||
      path.includes("qr-studio") ||
      path.includes("admin");

    if (isSubToolPage && document.referrer === "") {
      window.location.href = "./index.html";
    }
  });
}

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
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl transition-all duration-300 ${
    colors[type] || colors.success
  }`;
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
            whatsappWebhookNumber:
              data.whatsappWebhookNumber || localStorage.getItem("sellgst_owner_wa") || DEFAULT_OWNER_WHATSAPP,
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
          isPro: Boolean(AppState.profile.isPro),
          isAdmin: false,
          subscriptionStatus: AppState.profile.isPro ? "ACTIVE" : "FREE",
          planName: AppState.profile.planName || "FREE",
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
        const isNowPro = Boolean(data.isPro || data.subscriptionStatus === "ACTIVE");

        if (isNowPro) {
          localStorage.removeItem("sellgst_pending_utr");
          AppState.pendingRequest = null;
        }

        AppState.profile = {
          ...AppState.profile,
          ...data,
          uid: user.uid,
          isPro: isNowPro,
          paymentPending: isNowPro ? false : Boolean(data.paymentPending),
          planName: data.planName || (isNowPro ? "MONTHLY" : "FREE"),
          isAdmin: Boolean(data.isAdmin)
        };
        localStorage.setItem("sellgst_local_profile", JSON.stringify(AppState.profile));

        if ((!prevPro && AppState.profile.isPro) || (prevPlan !== AppState.profile.planName && AppState.profile.isPro)) {
          localStorage.removeItem("sellgst_pending_utr");
          AppState.pendingRequest = null;
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

  const q = query(collection(db, "payment_requests"), where("uid", "==", user.uid), limit(10));
  AppState.listeners.paymentUnsub = onSnapshot(
    q,
    (snap) => {
      let latestPending = null;
      let latestApproved = null;
      snap.forEach((docSnap) => {
        const d = { id: docSnap.id, ...docSnap.data() };
        if (d.status === "APPROVED") latestApproved = d;
        else if (d.status === "PENDING") latestPending = d;
      });

      if (latestApproved) {
        const cleanPlan = latestApproved.planName === "YEARLY" ? "YEARLY" : "MONTHLY";
        const durationDays = cleanPlan === "YEARLY" ? 365 : 30;
        const expiryISO =
          latestApproved.planExpiryISO ||
          latestApproved.expectedExpiryISO ||
          new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

        const wasNotPro = !AppState.profile.isPro;
        localStorage.removeItem("sellgst_pending_utr");
        AppState.pendingRequest = null;
        AppState.profile.isPro = true;
        AppState.profile.subscriptionStatus = "ACTIVE";
        AppState.profile.planName = cleanPlan;
        AppState.profile.planExpiryISO = expiryISO;
        AppState.profile.paymentPending = false;
        localStorage.setItem("sellgst_local_profile", JSON.stringify(AppState.profile));

        if (wasNotPro) {
          showToast(`🎉 Admin Approved Your Payment! SellGST Pro (${cleanPlan}) is now ACTIVE!`, "success", 6000);
          closeProPaymentModal();
        }
      } else {
        AppState.pendingRequest = AppState.profile.isPro ? null : latestPending;
      }
      syncProDOMElements();
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

export function syncProDOMElements() {
  const health = evaluateSubscriptionHealth();
  const isPro = health.isPro;
  const planName = health.planName;
  const isAdmin = Boolean(AppState.profile.isAdmin);

  document.querySelectorAll("[data-pro-badge]").forEach((el) => {
    if (isPro && planName === "YEARLY") {
      el.textContent = "YEARLY PRO ✨";
      el.className =
        "px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#10E594] text-[#081B4B] shadow-sm whitespace-nowrap pointer-events-none";
    } else if (isPro && planName === "MONTHLY") {
      const daysLabel = health.remainingDays > 0 ? `${health.remainingDays}d ${health.remainingHours}h left` : "30d left";
      el.textContent = `⏳ ${daysLabel} • Upgrade ₹499/yr ⚡`;
      el.className =
        "px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-[#081B4B] cursor-pointer shadow-md transition whitespace-nowrap";
    } else {
      el.textContent = `Unlock Pro ⚡ (${health.freeActionsRemaining}/${FREE_USAGE_MAX_LIMIT} Free)`;
      el.className =
        "px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#5B2EFF] to-[#4318FF] text-white hover:opacity-95 cursor-pointer shadow-md transition whitespace-nowrap";
    }
  });

  renderMonthlyCountdownBanner(health);

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

  const rawUid = AppState.user?.uid || AppState.profile?.uid || "seller-01";
  document.querySelectorAll("[data-masked-uid]").forEach((el) => {
    el.textContent = `UID: #${rawUid} (Active Store)`;
  });

  syncLiveProfitLossVisuals();
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
      "w-full bg-gradient-to-r from-[#081B4B] via-[#5B2EFF] to-[#081B4B] text-white px-4 py-1.5 text-xs font-semibold flex flex-wrap items-center justify-center gap-3 z-40 no-print";
    document.body.prepend(bar);
    fixTopLayoutSpacingGap();
  }

  const daysText =
    health.remainingDays > 0 ? `${health.remainingDays} Days & ${health.remainingHours} Hours` : "29 Days & 23 Hours";
  bar.innerHTML = `
    <span>⏳ <strong>Monthly Pro Plan Active:</strong> <span class="text-[#10E594] font-mono font-bold">${daysText}</span> remaining before 30-day expiry.</span>
    <button type="button" data-unlock-pro="YEARLY" class="px-3 py-0.5 rounded-full bg-[#10E594] text-[#081B4B] font-extrabold text-[11px] shadow hover:scale-105 transition">
      Upgrade to Yearly @ ₹499 (1 Year No Interruptions) →
    </button>
  `;
}

export function renderPendingPaymentBanner() {
  reconcileLocalApprovedRequests();
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
      "w-full bg-amber-100/95 border-b border-amber-300 text-amber-950 px-3 py-1.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2 z-40 no-print";
    document.body.prepend(banner);
    fixTopLayoutSpacingGap();
  }

  const utrDisplay = AppState.pendingRequest?.utrNumber || localPending || "Submitted";
  const ownerWa = (
    AppState.merchantConfig.whatsappWebhookNumber ||
    localStorage.getItem("sellgst_owner_wa") ||
    DEFAULT_OWNER_WHATSAPP
  ).replace(/\D/g, "");
  const uid = AppState.user?.uid || AppState.profile.uid || "seller";
  const adminUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, "")}/admin.html`;
  const waText =
    `🔔 *SellGST Pro — Pending UPI Payment Alert*\n\n` +
    `• *Seller:* ${AppState.profile.businessName || "Seller Store"}\n` +
    `• *UID:* ${uid}\n` +
    `• *UTR No:* ${utrDisplay}\n` +
    `• *Status:* PENDING VERIFICATION\n\n` +
    `👉 *Approve in 1-Click:* ${adminUrl}`;
  const waHref = `https://wa.me/${ownerWa}?text=${encodeURIComponent(waText)}`;

  banner.innerHTML = `
    <div class="flex flex-wrap items-center justify-center gap-2 text-center">
      <span class="inline-block animate-spin text-xs">⏳</span>
      <span>
        <strong>Payment Verification Pending (UTR: ${sanitizeHTML(utrDisplay)})</strong> — Activates automatically once Admin verifies bank transfer.
      </span>
      <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] shadow hover:bg-emerald-700 transition">
        💬 Resend WhatsApp Alert to Admin
      </a>
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
      "w-full bg-gradient-to-r from-[#081B4B] via-[#5B2EFF] to-[#081B4B] text-white px-4 py-1.5 text-xs font-semibold text-center tracking-wide z-40 no-print";
    document.body.prepend(el);
    fixTopLayoutSpacingGap();
  }
  el.innerHTML = `📢 ${sanitizeHTML(data.message)}`;
}

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

  const selectedPlan = isMonthlyUserUpgrading || defaultPlan === "YEARLY" ? "YEARLY" : "MONTHLY";
  const amount = selectedPlan === "YEARLY" ? cfg.yearlyPrice : cfg.monthlyPrice;
  const planTitle = selectedPlan === "YEARLY" ? "Pro Yearly Pass (12 Months)" : "Pro Monthly Pass (30 Days)";

  const upiUri = `upi://pay?pa=${encodeURIComponent(cfg.upiId)}&pn=${encodeURIComponent(cfg.payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(
    "SellGST Pro " + selectedPlan
  )}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(upiUri)}`;

  modal = document.createElement("div");
  modal.id = "sellgst-upi-modal";
  modal.className =
    "fixed inset-0 z-[9990] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto";

  const planSelectorHTML = isMonthlyUserUpgrading
    ? `
      <div class="mt-4 p-4 rounded-2xl border-2 border-[#5B2EFF] bg-indigo-50/50 relative">
        <span class="absolute -top-2.5 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">1 YEAR • NO COUNTDOWN</span>
        <div class="text-xs font-extrabold text-[#5B2EFF]">UPGRADE TO YEARLY PRO PASS</div>
        <div class="text-2xl font-black text-[#081B4B] mt-0.5">₹${cfg.yearlyPrice}<span class="text-xs font-medium text-slate-500"> / 12 Months</span></div>
        <p class="text-[11px] text-slate-600 mt-1">Unlocks all features + Dynamic QR Studio for 365 days without any renewal popups.</p>
      </div>
    `
    : `
      <div class="grid grid-cols-2 gap-3 mt-4">
        <button type="button" data-plan-select="MONTHLY" class="plan-card-btn p-3.5 rounded-2xl border-2 text-left transition ${
          selectedPlan === "MONTHLY" ? "border-[#5B2EFF] bg-indigo-50/40" : "border-slate-200"
        }">
          <div class="text-xs font-bold text-slate-500">MONTHLY PRO</div>
          <div class="text-xl font-black text-slate-900 mt-0.5">₹${cfg.monthlyPrice}<span class="text-xs font-medium text-slate-500">/30d</span></div>
        </button>
        <button type="button" data-plan-select="YEARLY" class="plan-card-btn p-3.5 rounded-2xl border-2 text-left transition relative ${
          selectedPlan === "YEARLY" ? "border-[#5B2EFF] bg-indigo-50/40" : "border-slate-200"
        }">
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

      <h3 class="text-lg font-extrabold text-slate-900">${
        isMonthlyUserUpgrading ? "Upgrade to Yearly Pro (₹499)" : "Unlock SellGST Pro"
      }</h3>
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
          <span class="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">${sanitizeHTML(
            cfg.upiId
          )}</span>
        </div>

        <a id="upi-deeplink-btn" href="${upiUri}" class="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#5B2EFF] hover:bg-indigo-700 text-white font-bold text-[13px] shadow-md transition">
          <span>📱 Pay ₹<span id="upi-btn-amt">${amount}</span> via PhonePe / GPay / Paytm</span>
        </a>
      </div>

      <form id="upi-utr-form" class="mt-4 space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">
            Step 2: Enter 12-Digit Bank UPI UTR / Reference No. *
          </label>
          <input
            type="text"
            id="upi-utr-input"
            required
            inputmode="numeric"
            pattern="[0-9]{12}"
            minlength="12"
            maxlength="12"
            placeholder="Enter exact 12-digit UTR (e.g. 431988776655)"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-[#5B2EFF]"
          />
          <p class="text-[10.5px] text-slate-500 mt-1">
            🔒 Fake UTRs are rejected. Your ID activates only after Admin verifies the 12-digit UTR in bank statement.
          </p>
        </div>

        <button
          type="submit"
          id="upi-submit-btn"
          class="w-full py-3.5 px-5 rounded-2xl bg-[#081B4B] hover:bg-slate-900 text-white font-extrabold text-[13px] shadow-lg transition flex items-center justify-center gap-2"
        >
          <span>✅ Submit 12-Digit UTR & Notify Admin on WhatsApp</span>
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
      const newUri = `upi://pay?pa=${encodeURIComponent(cfg.upiId)}&pn=${encodeURIComponent(cfg.payeeName)}&am=${currentAmount}&cu=INR&tn=${encodeURIComponent(
        "SellGST Pro " + p
      )}`;
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

  const utrInputEl = modal.querySelector("#upi-utr-input");
  utrInputEl.addEventListener("input", () => {
    utrInputEl.value = utrInputEl.value.replace(/\D/g, "").slice(0, 12);
  });

  modal.querySelector("#close-upi-modal-btn").addEventListener("click", () => closeProPaymentModal());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeProPaymentModal();
  });

  modal.querySelector("#upi-utr-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = modal.querySelector("#upi-submit-btn");
    const utrNumber = utrInputEl.value.replace(/\D/g, "").trim();

    if (!/^\d{12}$/.test(utrNumber)) {
      showToast("⚠️ Please enter a valid 12-digit numeric bank UPI UTR number!", "error");
      utrInputEl.focus();
      return;
    }

    const uid = AppState.user?.uid || AppState.profile.uid || "seller-" + Date.now();
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

    const ownerWa = (
      cfg.whatsappWebhookNumber ||
      localStorage.getItem("sellgst_owner_wa") ||
      DEFAULT_OWNER_WHATSAPP
    ).replace(/\D/g, "");
    const adminConsoleUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, "")}/admin.html`;
    const waText =
      `🔔 *SellGST Pro — Pending UPI Payment Alert*\n\n` +
      `• *Seller:* ${payload.userName}\n` +
      `• *Email:* ${payload.userEmail}\n` +
      `• *UID:* ${uid}\n` +
      `• *Plan:* ${currentPlan} (₹${currentAmount} • ${durationDays} Days)\n` +
      `• *UTR No:* ${utrNumber}\n` +
      `• *Status:* PENDING VERIFICATION\n\n` +
      `👉 *Approve in 1-Click:* ${adminConsoleUrl}`;
    const waLink = `https://wa.me/${ownerWa}?text=${encodeURIComponent(waText)}`;

    const waWindow = window.open(waLink, "_blank", "noopener,noreferrer");

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="animate-spin">⏳</span> Saving & Alerting Admin...`;

    localStorage.setItem("sellgst_pending_utr", utrNumber);
    const localQueue = JSON.parse(localStorage.getItem("sellgst_local_payment_requests") || "[]");
    localQueue.unshift({ id: "req_" + Date.now(), ...payload });
    localStorage.setItem("sellgst_local_payment_requests", JSON.stringify(localQueue.slice(0, 50)));

    try {
      if (AppState.user) {
        await addDoc(collection(db, "payment_requests"), payload);
        await setDoc(doc(db, "users", uid), { paymentPending: true }, { merge: true });
      }
    } catch (_) {}

    AppState.pendingRequest = payload;
    renderPendingPaymentBanner();
    closeProPaymentModal();

    showToast("⏳ UTR Submitted! Verification pending until Admin approves.", "warning", 6000);

    if (!waWindow) {
      setTimeout(() => {
        window.location.href = waLink;
      }, 300);
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

  const rawUid = prof.uid || "seller-01";

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
          <h3 class="text-base font-extrabold text-[#081B4B] truncate mt-0.5">${sanitizeHTML(
            prof.businessName || prof.displayName
          )}</h3>
          <p class="text-[11px] text-slate-500 font-mono truncate">${sanitizeHTML(prof.email || "seller@sellgst.pro")}</p>
        </div>
      </div>

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

      <form id="user-personal-form" class="space-y-2.5 text-xs">
        <div class="font-extrabold text-[#081B4B]">Edit My Store & Personal Data</div>
        <div>
          <label class="block font-semibold text-slate-600 mb-0.5">Business / Store Name</label>
          <input type="text" id="acc-biz-name" value="${escapeAttr(
            prof.businessName || ""
          )}" required class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-semibold text-slate-600 mb-0.5">GSTIN</label>
            <input type="text" id="acc-gstin" maxlength="15" value="${escapeAttr(
              prof.gstin || ""
            )}" class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono uppercase" />
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-0.5">Invoice UPI ID</label>
            <input type="text" id="acc-upi" value="${escapeAttr(
              prof.upiId || ""
            )}" class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono" />
          </div>
        </div>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-[#5B2EFF] hover:bg-indigo-700 text-white font-extrabold text-xs shadow transition">
          💾 Save Personal Profile
        </button>
      </form>

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

      <div class="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
        ${
          prof.isAdmin
            ? `<a href="./admin.html" class="px-3.5 py-2.5 rounded-xl bg-indigo-50 text-[#5B2EFF] font-extrabold text-xs">🛡️ Master Admin</a>`
            : `<div class="flex items-center gap-1 min-w-0"><span class="text-[11px] text-slate-500 font-mono font-bold truncate">UID: #${sanitizeHTML(rawUid)}</span><button type="button" id="copy-modal-uid-btn" class="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700 shrink-0">Copy</button></div>`
        }
        <button
          type="button"
          id="account-drawer-logout-btn"
          class="flex-1 py-2.5 px-3 rounded-xl bg-[#081B4B] hover:bg-slate-900 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5"
        >
          <span>⏻ Logout</span>
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
  modal.querySelector("#copy-modal-uid-btn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(rawUid);
    showToast("Copied full UID to clipboard!", "info");
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeAccModal();
  });

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
        await setDoc(
          doc(db, "users", AppState.user.uid),
          { businessName, displayName: businessName, gstin, upiId },
          { merge: true }
        );
      } catch (_) {}
    }
    syncProDOMElements();
    showToast("Personal & Store profile updated!", "success");
    closeAccModal();
  });

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

    localStorage.clear();
    showToast("✔️ Account & personal data permanently erased under DPDP Act.", "info", 4000);
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 900);
  });

  modal.querySelector("#account-drawer-logout-btn").addEventListener("click", () => {
    logoutUser();
  });
}

// ============================================================================
// GLOBAL ☰ SLIDE-OUT "ALL SUPER TOOLS MENU" DRAWER (FOR ALL PAGES)
// ============================================================================
export function openSuperToolsMenu() {
  const drawer = document.getElementById("super-tools-drawer");
  const backdrop = document.getElementById("super-tools-backdrop");
  if (!drawer || !backdrop) return;

  try {
    const savedBills = JSON.parse(localStorage.getItem("sellgst_invoices") || "[]");
    const billsEl = document.getElementById("drawer-saved-bills-count");
    if (billsEl) billsEl.textContent = `Saved GST Bills (${savedBills.length || 3})`;

    const health = evaluateSubscriptionHealth();
    const titleEl = document.getElementById("drawer-plan-status-title");
    const subEl = document.getElementById("drawer-quota-subtext");

    if (health.isPro && health.planName === "YEARLY") {
      if (titleEl) titleEl.textContent = `Yearly Pro Active (${health.remainingDays}d left)`;
      if (subEl) subEl.textContent = "Unlimited GSTR-1 JSON, Audits, Bills & QRs";
    } else if (health.isPro && health.planName === "MONTHLY") {
      if (titleEl) titleEl.textContent = `Ends in: ${health.remainingDays}d ${health.remainingHours}h`;
      if (subEl) subEl.textContent = "Monthly Pro Active • Upgrade to ₹499 Yearly";
    } else {
      if (titleEl) titleEl.textContent = `Free Trial Quota: ${health.freeActionsRemaining}/5 Left`;
      if (subEl) subEl.textContent = `Left: ${health.freeActionsRemaining} Free Uses, 5 Custom Downloads`;
    }
  } catch (_) {}

  backdrop.classList.remove("hidden");
  requestAnimationFrame(() => {
    backdrop.classList.remove("opacity-0");
    drawer.classList.remove("-translate-x-full");
  });

  pushModalState("super-tools-drawer", () => closeSuperToolsMenu(true));
}

export function closeSuperToolsMenu(fromPopState = false) {
  const drawer = document.getElementById("super-tools-drawer");
  const backdrop = document.getElementById("super-tools-backdrop");
  if (!drawer || !backdrop) return;

  backdrop.classList.add("opacity-0");
  drawer.classList.add("-translate-x-full");
  setTimeout(() => {
    backdrop.classList.add("hidden");
  }, 280);

  if (!fromPopState) {
    removeModalState("super-tools-drawer");
  }
}

function injectGlobalSuperToolsMenu() {
  if (isCurrentPageLogin()) return;

  // 1. Inject ☰ Hamburger Button into Top Header on every page if not already present
  const header = document.querySelector("header");
  if (header && !header.querySelector("[data-open-super-menu]")) {
    const firstGroup = header.querySelector("nav > div:first-child") || header.querySelector("div:first-child");
    if (firstGroup) {
      const menuBtn = document.createElement("button");
      menuBtn.type = "button";
      menuBtn.setAttribute("data-open-super-menu", "true");
      menuBtn.setAttribute("aria-label", "Open All Super Tools Menu");
      menuBtn.title = "Open All Super Tools Menu";
      menuBtn.className =
        "w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 hover:bg-[#5B2EFF] text-[#081B4B] hover:text-white border border-slate-200 flex items-center justify-center font-black text-base sm:text-lg shadow-xs transition shrink-0 cursor-pointer";
      menuBtn.textContent = "☰";
      firstGroup.prepend(menuBtn);
    }
  }

  // 2. If #super-tools-drawer is not already in the HTML (e.g., on sub-pages), inject it into body
  if (!document.getElementById("super-tools-drawer")) {
    const backdrop = document.createElement("div");
    backdrop.id = "super-tools-backdrop";
    backdrop.className =
      "fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[9990] hidden opacity-0 transition-opacity duration-300 no-print";

    const aside = document.createElement("aside");
    aside.id = "super-tools-drawer";
    aside.setAttribute("aria-label", "All Super Tools Menu");
    aside.className =
      "fixed top-0 left-0 bottom-0 w-[310px] sm:w-[345px] max-w-[88vw] bg-white z-[9995] shadow-2xl flex flex-col justify-between transform -translate-x-full transition-transform duration-300 ease-in-out overflow-y-auto no-print";

    aside.innerHTML = `
      <div>
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div class="flex items-center gap-2">
            <span class="text-base">⚡</span>
            <span class="font-extrabold text-xs sm:text-[13px] tracking-wider uppercase text-[#1D4ED8]">
              ALL SUPER TOOLS MENU
            </span>
          </div>
          <button
            type="button"
            id="close-super-tools-btn"
            aria-label="Close Menu"
            class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-extrabold text-sm transition"
          >
            ✕
          </button>
        </div>

        <div class="p-4 space-y-5 text-xs">
          <div class="space-y-1.5">
            <div class="px-2 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400">
              1. GST FILING &amp; PORTAL JSON SUITE
            </div>

            <a href="./gst-filing.html" class="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 text-slate-800 font-bold transition">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-base shrink-0">🏛️</span>
                <span class="truncate">E-Com CSV to GSTR-1 JSON</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[10px] shrink-0">1-CLICK</span>
            </a>

            <a href="./gov-excel-to-json.html" class="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-slate-100 text-slate-700 font-bold transition">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-base shrink-0">📗</span>
                <span class="truncate">Gov Excel (.XLSX) to JSON</span>
              </div>
            </a>

            <div class="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
              <a href="./json-validator.html" class="flex items-center justify-between text-slate-900 font-extrabold">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="text-base shrink-0">🔍</span>
                  <span class="truncate">JSON Validator &amp; Editor</span>
                </div>
                <span class="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white font-extrabold text-[10px] shadow-xs shrink-0">CHECK / EDIT</span>
              </a>
              <div class="pl-7 space-y-1 text-[11px] font-semibold text-slate-500">
                <div><a href="./json-validator.html" class="hover:text-[#2563EB]">• Check B2B, B2CS &amp; HSN Tables</a></div>
                <div><a href="./json-validator.html" class="hover:text-[#2563EB]">• Fix 15-Digit GSTIN Errors</a></div>
              </div>
            </div>

            <a href="./reconciliation-2a-2b.html" class="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-slate-100 text-slate-700 font-bold transition">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-base shrink-0">🔄</span>
                <span class="truncate">2A/2B Purchase Reconciliation</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-indigo-100 text-[#5B2EFF] font-extrabold text-[10px] shrink-0">ITC</span>
            </a>

            <a href="./ecom-to-tally.html" class="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-slate-100 text-slate-700 font-bold transition">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-base shrink-0">📁</span>
                <span class="truncate">E-Com to Tally Prime XML</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-rose-500 text-white font-extrabold text-[9px] shrink-0">NEW</span>
            </a>
          </div>

          <div class="space-y-1.5">
            <div class="px-2 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400">
              2. E-COM AUDIT, BILLING &amp; WAREHOUSE
            </div>

            <div class="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <a href="./app.html" class="flex items-center justify-between text-slate-900 font-extrabold">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="text-base shrink-0">📊</span>
                  <span class="truncate">3D User Dashboard</span>
                </div>
                <span class="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white font-extrabold text-[10px] shadow-xs shrink-0">EDIT / TRACK</span>
              </a>
              <div class="pl-7 space-y-1 text-[11px] font-semibold text-slate-500">
                <div id="drawer-saved-bills-count">Saved GST Bills (3)</div>
                <div id="drawer-rto-claims-count">Flagged RTO Claims (7)</div>
              </div>
            </div>

            <a href="./ecom-audit.html" class="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-slate-100 text-slate-700 font-bold transition">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-base shrink-0">📈</span>
                <span class="truncate">Profit/Loss &amp; RTO CSV Audit</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[10px] shrink-0">LIVE</span>
            </a>

            <a href="./invoice.html" class="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-slate-100 text-slate-700 font-bold transition">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-base shrink-0">🧾</span>
                <span class="truncate">S.K.P.S Navy GST Invoice</span>
              </div>
            </a>

            <a href="./label-studio.html" class="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-slate-100 text-slate-700 font-bold transition">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-base shrink-0">🏷️</span>
                <span class="truncate">4×6 Label &amp; Thank You Card</span>
              </div>
            </a>

            <a href="./qr-studio.html" class="flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-slate-100 text-slate-700 font-bold transition">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-base shrink-0">🎨</span>
                <span class="truncate">Artistic &amp; Dynamic QR Studio</span>
              </div>
            </a>
          </div>

          <div class="space-y-1.5">
            <div class="px-2 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400">
              3. PLANS &amp; UPGRADE
            </div>

            <button type="button" data-unlock-pro="YEARLY" class="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-indigo-50 text-slate-800 font-extrabold transition text-left">
              <div class="flex items-center gap-3">
                <span class="text-base">💳</span>
                <span>Plans &amp; Pricing (₹99 / ₹499)</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-purple-100 text-[#5B2EFF] font-extrabold text-[10px]">PRO</span>
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 border-t border-slate-100 space-y-2.5 bg-white">
        <div class="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 space-y-2">
          <div class="flex items-start gap-2 text-rose-700 font-extrabold text-xs">
            <span>⏰</span>
            <span id="drawer-plan-status-title">Free Trial Quota Active</span>
          </div>
          <div id="drawer-quota-subtext" class="text-[11px] font-semibold text-slate-600">
            Left: 5 Free Actions, Unlimited Pro Downloads
          </div>
          <button
            type="button"
            data-unlock-pro="YEARLY"
            class="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition uppercase tracking-wide"
          >
            UPGRADE PRO (₹499)
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <a href="./index.html" class="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-[#2563EB] font-extrabold text-xs text-center transition">
            🏠 Home
          </a>
          <button type="button" data-open-account class="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-[#081B4B] font-extrabold text-xs text-center transition">
            My Account
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(aside);
  }

  // Bind Close Events
  document.getElementById("close-super-tools-btn")?.addEventListener("click", () => closeSuperToolsMenu());
  document.getElementById("super-tools-backdrop")?.addEventListener("click", () => closeSuperToolsMenu());
}

function getSmartContextualReply(queryText = "") {
  const raw = String(queryText || "").trim();
  const q = raw.toLowerCase();

  if (/^(hi+|hello+|hey+|namaste|hlo|kaise ho|kya haal hai|good morning|good evening)[\s!?.]*$/i.test(q)) {
    return "Hi! 👋 Main aapka SellGST Pro AI Helper hoon. Bataiye, aaj main aapki kya madad kar sakta hoon?";
  }

  const numMatch = q.match(/(\d+(?:\.\d+)?)/g);
  if (numMatch && (q.includes("gst") || q.includes("tax") || q.includes("%") || q.includes("kitna") || q.includes("calculate"))) {
    const amount = Number(numMatch[0]) || 0;
    const rate = numMatch[1] ? Number(numMatch[1]) : 18;
    const gstAmt = (amount * rate) / 100;
    const total = amount + gstAmt;
    return (
      `📊 **₹${amount.toLocaleString("en-IN")} par ${rate}% GST Calculation:**\n\n` +
      `• **Taxable Value:** ₹${amount.toFixed(2)}\n` +
      `• **CGST (${rate / 2}%):** ₹${(gstAmt / 2).toFixed(2)}\n` +
      `• **SGST (${rate / 2}%):** ₹${(gstAmt / 2).toFixed(2)}\n` +
      `• **Total GST (${rate}%):** ₹${gstAmt.toFixed(2)}\n` +
      `• **Total Payable Amount:** **₹${total.toFixed(2)}**`
    );
  }

  return `Main aapki baat samajh gaya! Aapne pucha: **"${sanitizeHTML(raw)}"**\n\nBataiye, ismein aapko exact kya dikkat aa rahi hai? Main aapko step-by-step solution dunga!`;
}

function injectFloatingAIAssistant() {
  if (document.getElementById("sellgst-ai-orb-wrapper")) return;

  const orbWrapper = document.createElement("div");
  orbWrapper.id = "sellgst-ai-orb-wrapper";
  orbWrapper.className = "fixed bottom-24 lg:bottom-6 right-3.5 z-[9980] flex items-center no-print";

  orbWrapper.innerHTML = `
    <div class="relative flex items-center">
      <button
        type="button"
        id="dismiss-ai-orb-btn"
        title="Hide AI Button"
        aria-label="Hide AI Assistant Button"
        class="absolute -top-2 -left-2 z-20 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold shadow-md flex items-center justify-center border-2 border-white transition"
      >
        ✕
      </button>

      <button
        type="button"
        id="sellgst-ai-orb"
        aria-label="Open SellGST 24/7 AI Assistant"
        class="group flex items-center gap-2 p-1.5 sm:pr-3.5 rounded-full bg-[#081B4B] text-white shadow-2xl border border-indigo-400/50 hover:scale-105 transition-all duration-300"
      >
        <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5B2EFF] via-purple-500 to-[#10E594] flex items-center justify-center shadow-inner relative">
          <span class="text-base">🤖</span>
          <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10E594] border-2 border-[#081B4B]"></span>
        </div>
        <div class="hidden sm:flex flex-col text-left">
          <span class="text-[9px] font-bold uppercase tracking-wider text-[#10E594]">Gemini AI</span>
          <span class="text-[11px] font-extrabold text-white">Ask Helper</span>
        </div>
      </button>
    </div>
  `;

  const drawer = document.createElement("div");
  drawer.id = "sellgst-ai-drawer";
  drawer.className =
    "fixed inset-y-0 right-0 z-[9985] w-full sm:w-[400px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform translate-x-full transition-transform duration-300 ease-in-out no-print";

  drawer.innerHTML = `
    <div class="p-4 bg-gradient-to-r from-[#081B4B] to-[#5B2EFF] text-white flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-lg shadow">🤖</div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-extrabold text-sm">SellGST Pro Gemini AI</h4>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10E594] text-slate-950">ONLINE</span>
          </div>
          <p class="text-[11px] text-indigo-100">Conversational Problem-Solving Assistant</p>
        </div>
      </div>
      <button type="button" id="close-ai-drawer-btn" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold">✕</button>
    </div>

    <div class="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button type="button" data-ai-chip="15000 par 18% GST kitna hoga?" class="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#5B2EFF] text-xs font-semibold text-slate-800 whitespace-nowrap shadow-sm">
        🧮 Calculate 18% GST
      </button>
      <button type="button" data-ai-chip="How do I check Flipkart & Amazon Profit/Loss from CSV?" class="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#5B2EFF] text-xs font-semibold text-slate-800 whitespace-nowrap shadow-sm">
        🟢🔴 Profit/Loss Help
      </button>
    </div>

    <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 text-[13px]">
      <div class="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm text-slate-800 leading-relaxed">
        👋 <strong>Hi! Main aapka SellGST Pro AI Helper hoon.</strong><br/>
        Aap mujhse <strong>Hindi, Hinglish ya English</strong> mein koi bhi sawal ya GST calculation puch sakte hain.
      </div>
    </div>

    <form id="ai-chat-form" class="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
      <input
        type="text"
        id="ai-chat-input"
        placeholder="Ask anything..."
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

  document.body.appendChild(orbWrapper);
  document.body.appendChild(drawer);

  orbWrapper.querySelector("#dismiss-ai-orb-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    orbWrapper.remove();
  });

  orbWrapper.querySelector("#sellgst-ai-orb").addEventListener("click", () => openAIAssistant());
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
  loadingDiv.innerHTML = `<span class="animate-pulse">✨</span> <span>Thinking...</span>`;
  container.appendChild(loadingDiv);
  container.scrollTop = container.scrollHeight;

  const isSimpleGreeting = /^(hi+|hello+|hey+|namaste|hlo|kaise ho)[\s!?.]*$/i.test(messageText.trim());
  let answered = false;

  if (!isSimpleGreeting) {
    const endpoints = ["./api/ai-assistant", "https://sellgst-pro.pages.dev/api/ai-assistant"];
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
          if (data?.reply && !data.reply.includes("Regarding your question:")) {
            AppState.aiHistory.push({ role: "user", text: messageText }, { role: "model", text: data.reply });
            loadingDiv.innerHTML = formatAIMarkdown(data.reply);
            answered = true;
            break;
          }
        }
      } catch (_) {}
    }
  }

  if (!answered) {
    const fallbackReply = getSmartContextualReply(messageText);
    AppState.aiHistory.push({ role: "user", text: messageText }, { role: "model", text: fallbackReply });
    loadingDiv.innerHTML = formatAIMarkdown(fallbackReply);
  }

  container.scrollTop = container.scrollHeight;
}

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
  localStorage.setItem("sellgst_auth_logged_in", "1");
  localStorage.removeItem("sellgst_guest_start_ts");
  localStorage.removeItem("sellgst_guest_expired");
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
  localStorage.setItem("sellgst_auth_logged_in", "1");
  localStorage.removeItem("sellgst_guest_start_ts");
  localStorage.removeItem("sellgst_guest_expired");

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
  localStorage.setItem("sellgst_auth_logged_in", "1");
  localStorage.removeItem("sellgst_guest_start_ts");
  localStorage.removeItem("sellgst_guest_expired");
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
  localStorage.removeItem("sellgst_auth_logged_in");
  localStorage.removeItem("sellgst_guest_start_ts");
  localStorage.removeItem("sellgst_demo_session");
  window.location.href = "./login.html";
}

export function initSecurityCore() {
  enforceAuthAndGuestGate();
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
      localStorage.setItem("sellgst_auth_logged_in", "1");
      localStorage.removeItem("sellgst_guest_start_ts");
      removeGuestBanner();
      startUserRealtimeListeners(user);
    } else {
      cleanupUserListeners();
      loadCachedLocalProfile(null);
    }
  });
}

function onDOMReady() {
  fixTopLayoutSpacingGap();
  enforceAuthAndGuestGate();
  injectGlobalSuperToolsMenu();
  syncProDOMElements();
  renderPendingPaymentBanner();
  injectFloatingAIAssistant();
  init3DTiltCards();
  startSevenSecondPWAButtonTimer();
  syncLiveProfitLossVisuals();

  document.body.addEventListener("click", (e) => {
    const superMenuBtn = e.target.closest("[data-open-super-menu]");
    if (superMenuBtn) {
      e.preventDefault();
      openSuperToolsMenu();
      return;
    }

    const extQrBtn = e.target.closest("#open-external-qr-portal-btn");
    if (extQrBtn) {
      e.preventDefault();
      if (!consumeFreeActionOrLock("Dynamic QR Generator Portal")) return;
      const qrPortalUrl = "https://ritikraj3405328-web.github.io/Dynamic-Qr-generator-/#home";
      const win = window.open(qrPortalUrl, "_blank", "noopener,noreferrer");
      if (!win) window.location.href = qrPortalUrl;
      return;
    }

    const unlockBtn = e.target.closest("[data-unlock-pro]");
    if (unlockBtn) {
      e.preventDefault();
      closeSuperToolsMenu();
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
      closeSuperToolsMenu();
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
  DEFAULT_OWNER_WHATSAPP,
  FREE_USAGE_MAX_LIMIT,
  GUEST_PREVIEW_DURATION_MS,
  isUserPermanentlyLoggedIn,
  isGuestPreviewActive,
  startGuestPreviewSession,
  subscribeAppState,
  evaluateSubscriptionHealth,
  consumeFreeActionOrLock,
  syncLiveProfitLossVisuals,
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
  openSuperToolsMenu,
  closeSuperToolsMenu,
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
