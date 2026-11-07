/**
 * SellGST Pro — Principal Security Core, Firebase Cloud Sync,
 * Semi-Automatic UPI Payment Engine & 24/7 Floating AI Support
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
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { initI18n, t, getCurrentLang, setLanguage, SUPPORTED_LANGUAGES } from "./i18n.js";

// ============================================================================
// 1. EXACT FIREBASE CONFIGURATION
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

// ============================================================================
// 2. GLOBAL APPLICATION STATE
// ============================================================================
export const AppState = {
  user: null,
  profile: {
    uid: null,
    displayName: "Seller Store",
    email: "",
    phone: "",
    gstin: "27AABCU9603R1ZM",
    businessName: "Apex E-Com Enterprises",
    stateCode: "27",
    stateName: "Maharashtra",
    upiId: "9661692365@ybl",
    isPro: false,
    isAdmin: false,
    subscriptionStatus: "FREE",
    paymentPending: false
  },
  merchantConfig: {
    upiId: "9661692365@ybl",
    payeeName: "AGNI VOLT",
    monthlyPrice: 99,
    yearlyPrice: 499,
    whatsappWebhookNumber: "", // Dynamically loaded from Firestore system_config/payment_settings
    autoWhatsAppNotify: true
  },
  pendingRequest: null,
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

export function subscribeAppState(callback) {
  if (typeof callback === "function") {
    AppState.subscribers.add(callback);
    callback(AppState);
  }
  return () => AppState.subscribers.delete(callback);
}

function notifyStateChange() {
  AppState.subscribers.forEach((cb) => {
    try {
      cb(AppState);
    } catch (err) {
      console.error("[SellGST State Subscriber Error]:", err);
    }
  });
  window.dispatchEvent(new CustomEvent("sellgst:state-changed", { detail: AppState }));
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

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(num);
}

// ============================================================================
// 4. NATIVE HARDWARE BACK-BUTTON & MODAL STACK MANAGER
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
  window.addEventListener("popstate", (event) => {
    // 1. If any modal or AI drawer is open, close top-most overlay instead of leaving page
    if (AppState.activeModalStack.length > 0) {
      const topModal = AppState.activeModalStack.pop();
      if (topModal && typeof topModal.close === "function") {
        topModal.close(true);
      }
      return;
    }

    // 2. If user is on an inner tool page and has no history stack, route smoothly to /app.html
    const path = window.location.pathname;
    const isSubToolPage =
      path.includes("invoice") ||
      path.includes("ecom-audit") ||
      path.includes("gst-filing") ||
      path.includes("admin");

    if (isSubToolPage && document.referrer === "") {
      window.location.href = "/app.html";
    }
  });
}

// ============================================================================
// 5. TOAST NOTIFICATION SYSTEM
// ============================================================================
export function showToast(message, type = "success", duration = 4000) {
  let container = document.getElementById("sellgst-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "sellgst-toast-container";
    container.className = "fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0";
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
    <span class="text-lg select-none">${icons[type] || "✅"}</span>
    <div class="text-xs sm:text-sm font-semibold leading-snug flex-1">${sanitizeHTML(message)}</div>
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
// 6. REAL-TIME FIRESTORE LISTENERS (PRO UNLOCK, PENDING BANNER & CONFIG)
// ============================================================================
function startSystemListeners() {
  // Listen to Merchant UPI & Admin Alert Configuration
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

    // Listen to Global Broadcast Banner
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
  } catch (err) {
    console.warn("[SellGST Config Listener Fallback]:", err.message);
  }
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
        // Initialize safe Free-tier profile in Firestore
        const initialProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split("@")[0] || "SellGST Merchant",
          email: user.email || "",
          phone: user.phoneNumber || "",
          businessName: "My E-Com Store",
          gstin: "27AABCU9603R1ZM",
          stateCode: "27",
          stateName: "Maharashtra",
          upiId: "9661692365@ybl",
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

        // Real-Time Instant Unblur Celebration when Admin clicks Approve!
        if (!prevPro && AppState.profile.isPro) {
          showToast("🎉 Payment Verified! SellGST Pro is now ACTIVE in real-time!", "success", 6000);
          closeProPaymentModal();
        }
      }

      syncProDOMElements();
      notifyStateChange();
    },
    (err) => {
      console.warn("[User Snapshot Fallback]:", err.message);
      loadCachedLocalProfile(user);
    }
  );

  // 2. Live Payment Request Status Listener
  const q = query(
    collection(db, "payment_requests"),
    where("uid", "==", user.uid),
    limit(5)
  );

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
    const cached = JSON.parse(localStorage.getItem("sellgst_local_profile") || "{}");
    AppState.profile = {
      ...AppState.profile,
      ...cached,
      uid: user?.uid || "demo-seller",
      displayName: user?.displayName || cached.displayName || "Seller Store",
      email: user?.email || cached.email || ""
    };
    syncProDOMElements();
    renderPendingPaymentBanner();
    notifyStateChange();
  } catch (_) {}
}

// ============================================================================
// 7. REAL-TIME DOM UNBLUR & STATUS BANNER ENGINE
// ============================================================================
export function syncProDOMElements() {
  const isPro = Boolean(AppState.profile.isPro);
  const isAdmin = Boolean(AppState.profile.isAdmin);

  // Update Pro Badges
  document.querySelectorAll("[data-pro-badge]").forEach((el) => {
    if (isPro) {
      el.textContent = "PRO ACTIVE ✨";
      el.className = "px-3 py-1 rounded-full text-xs font-bold bg-[#CBE8BA] text-gray-900 border border-emerald-400/50 shadow-sm";
    } else {
      el.textContent = t("unlock_pro_btn", "Unlock Pro ⚡");
      el.className = "px-3 py-1 rounded-full text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 cursor-pointer transition";
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
    el.textContent = AppState.profile.businessName || AppState.profile.displayName || "Seller Store";
  });

  document.querySelectorAll("[data-user-gstin]").forEach((el) => {
    el.textContent = AppState.profile.gstin || "27AABCU9603R1ZM";
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
    banner.className = "w-full bg-amber-100/95 border-b border-amber-300 text-amber-950 px-4 py-2.5 text-xs sm:text-sm font-medium flex flex-wrap items-center justify-between gap-2 z-40";
    document.body.prepend(banner);
  }

  const utrDisplay = AppState.pendingRequest?.utrNumber || localPending || "Submitted";
  banner.innerHTML = `
    <div class="flex items-center gap-2.5 mx-auto">
      <span class="inline-block animate-spin text-base">⏳</span>
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
    el.className = "w-full bg-gray-900 text-[#CBE8BA] px-4 py-2 text-xs sm:text-sm font-semibold text-center tracking-wide z-40";
    document.body.prepend(el);
  }
  el.innerHTML = `📢 ${sanitizeHTML(data.message)}`;
}

// ============================================================================
// 8. SEMI-AUTOMATIC UPI PAYMENT & 1-CLICK ADMIN APPROVAL MODAL
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
  modal.className = "fixed inset-0 z-[9990] bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto";

  modal.innerHTML = `
    <div class="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 sm:p-7 relative animate-fadeIn my-auto">
      <button type="button" id="close-upi-modal-btn" class="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold">✕</button>

      <div class="flex items-center gap-2.5 mb-2">
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#CBE8BA] text-gray-900">INSTANT UPI UNLOCK</span>
        <span class="text-xs font-semibold text-gray-500">Zero-Commission Direct Bank</span>
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
        <div class="mt-2.5 text-xs text-gray-600 flex items-center justify-center gap-1.5">
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
              class="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900"
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
      userName: AppState.profile.businessName || AppState.profile.displayName || "Seller Store",
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

    // Persist locally so pending banner also shows immediately
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
// 9. FLOATING 3D AI CUSTOMER SUPPORT ASSISTANT (24/7 ZERO-CARE BOT)
// ============================================================================
function injectFloatingAIAssistant() {
  if (document.getElementById("sellgst-ai-orb")) return;

  // 1. Glowing 3D AI Orb Button in Bottom-Right
  const orb = document.createElement("button");
  orb.id = "sellgst-ai-orb";
  orb.type = "button";
  orb.setAttribute("aria-label", "Open SellGST 24/7 AI Assistant");
  orb.className =
    "fixed bottom-20 sm:bottom-6 right-5 z-[9980] group flex items-center gap-2.5 p-1.5 sm:pr-4 rounded-full bg-gray-950 text-white shadow-2xl border border-indigo-400/40 hover:scale-105 transition-all duration-300";

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

  // 2. Slide-Over AI Chat Drawer
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

    <!-- Quick Prompt Chips -->
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
          <li>Exporting Amazon, Flipkart & Meesho CSVs for <strong>RTO (>30 days)</strong> & <strong>Weight Fraud</strong></li>
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
        class="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#F4F5F7] border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
      <button
        type="submit"
        id="ai-chat-send-btn"
        class="px-4 py-2.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs sm:text-sm shadow transition"
      >
        Send
      </button>
    </form>
  `;

  document.body.appendChild(orb);
  document.body.appendChild(drawer);

  orb.addEventListener("click", () => openAIAssistant());
  drawer.querySelector("#close-ai-drawer-btn").addEventListener("click", () => closeAIAssistant());

  // Quick Prompt Chips
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

  // Bind any top search bar or page trigger with `[data-open-ai]`
  document.querySelectorAll("[data-open-ai]").forEach((trigger) => {
    trigger.addEventListener("click", () => openAIAssistant());
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
    }, 150);
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

  // Append User Bubble
  const userDiv = document.createElement("div");
  userDiv.className = "ml-auto max-w-[85%] bg-gray-900 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm text-xs sm:text-sm";
  userDiv.textContent = messageText;
  container.appendChild(userDiv);

  // Append Typing Indicator
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "max-w-[88%] bg-white p-3.5 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm text-gray-500 text-xs flex items-center gap-2";
  loadingDiv.innerHTML = `<span class="animate-pulse">✨</span> <span>SellGST AI is analyzing...</span>`;
  container.appendChild(loadingDiv);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch("/api/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: messageText,
        language: getCurrentLang(),
        pageContext: window.location.pathname,
        history: AppState.aiHistory.slice(-6)
      })
    });

    const data = await res.json();
    const reply = data?.reply || "Please check E-Com Audit (/ecom-audit.html) or GST Filing (/gst-filing.html) to proceed.";

    AppState.aiHistory.push({ role: "user", text: messageText });
    AppState.aiHistory.push({ role: "model", text: reply });

    loadingDiv.className = "max-w-[92%] bg-white p-3.5 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm text-gray-800 leading-relaxed text-xs sm:text-sm";
    loadingDiv.innerHTML = formatAIMarkdown(reply);
  } catch (err) {
    loadingDiv.className = "max-w-[92%] bg-white p-3.5 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm text-gray-800 leading-relaxed text-xs sm:text-sm";
    loadingDiv.innerHTML = formatAIMarkdown(
      "**SellGST AI Instant Guide:**\n1. **E-Com Audit (`/ecom-audit.html`):** Upload Meesho/Flipkart/Amazon CSV to spot RTO >30 days & Weight Fraud.\n2. **GST Billing (`/invoice.html`):** Auto CGST+SGST vs IGST bills with dynamic UPI QR.\n3. **GSTR-1 Filing (`/gst-filing.html`):** Download 1-Click `.JSON` for `gst.gov.in`.\n4. **Unlock Pro:** Click **Unlock Pro**, pay via UPI (`9661692365@ybl`), and submit your 12-digit UTR!"
    );
  }

  container.scrollTop = container.scrollHeight;
}

// ============================================================================
// 10. AUTHENTICATION HELPERS (EMAIL, GOOGLE & PHONE OTP)
// ============================================================================
export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function registerWithEmail(email, password, businessName, gstin) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (businessName) {
    await updateProfile(cred.user, { displayName: businessName.trim() });
  }
  const userRef = doc(db, "users", cred.user.uid);
  await setDoc(
    userRef,
    {
      uid: cred.user.uid,
      displayName: businessName?.trim() || "Seller Store",
      businessName: businessName?.trim() || "Seller Store",
      gstin: (gstin || "27AABCU9603R1ZM").trim().toUpperCase(),
      email: cred.user.email,
      isPro: false,
      isAdmin: false,
      subscriptionStatus: "FREE",
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
  return cred;
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
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
  const formatted = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber.replace(/\D/g, "")}`;
  return signInWithPhoneNumber(auth, formatted, recaptchaVerifier);
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (_) {}
  localStorage.removeItem("sellgst_demo_session");
  window.location.href = "/index.html";
}

// ============================================================================
// 11. AUTOMATIC CORE INITIALIZATION
// ============================================================================
export function initSecurityCore() {
  initI18n();
  initBackButtonManager();
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
  injectFloatingAIAssistant();
  syncProDOMElements();
  renderPendingPaymentBanner();

  // Global delegation for `[data-unlock-pro]` buttons across all pages
  document.body.addEventListener("click", (e) => {
    const unlockBtn = e.target.closest("[data-unlock-pro]");
    if (unlockBtn) {
      e.preventDefault();
      const plan = unlockBtn.getAttribute("data-unlock-pro") || "MONTHLY";
      openProPaymentModal(plan);
    }

    const aiTrigger = e.target.closest("[data-open-ai]");
    if (aiTrigger) {
      e.preventDefault();
      const promptText = aiTrigger.getAttribute("data-open-ai") || "";
      openAIAssistant(promptText);
    }
  });
}

// Initialize immediately & expose on window for convenient inline/module access
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
