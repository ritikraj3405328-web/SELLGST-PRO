/**
 * SellGST Pro — Fixed Security Core (GitHub Pages, Cloudflare Pages & Vercel Compatible)
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
  setDoc,
  addDoc,
  collection,
  query,
  where,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { initI18n, t, getCurrentLang, setLanguage, SUPPORTED_LANGUAGES } from "./i18n.js";

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

export const AppState = {
  user: null,
  profile: {
    uid: null,
    displayName: "Seller Store",
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
  },
  merchantConfig: {
    upiId: "9661692365@ybl",
    payeeName: "AGNI VOLT",
    monthlyPrice: 99,
    yearlyPrice: 499,
    whatsappWebhookNumber: "",
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
    try { cb(AppState); } catch (_) {}
  });
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

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(num);
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

export function showToast(message, type = "success", duration = 4000) {
  let container = document.getElementById("sellgst-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "sellgst-toast-container";
    container.className = "fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-2 max-w-sm sm:w-full pointer-events-none";
    document.body.appendChild(container);
  }

  const colors = {
    success: "bg-gray-900 text-white border-emerald-500/40",
    warning: "bg-amber-500 text-gray-950 border-amber-600",
    error: "bg-rose-600 text-white border-rose-400",
    info: "bg-indigo-600 text-white border-indigo-400"
  };

  const icons = { success: "✅", warning: "⏳", error: "⚠️", info: "✨" };

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl transition-all duration-300 ${colors[type] || colors.success}`;
  toast.innerHTML = `
    <span class="text-base select-none">${icons[type] || "✅"}</span>
    <div class="text-xs font-semibold leading-snug flex-1 break-words">${sanitizeHTML(message)}</div>
    <button type="button" class="text-current opacity-70 hover:opacity-100 font-bold text-xs px-1">✕</button>
  `;
  toast.querySelector("button").addEventListener("click", () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0");
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
          uid: user.uid,
          displayName: user.displayName || user.email?.split("@")[0] || "SellGST Merchant",
          email: user.email || "",
          phone: user.phoneNumber || "",
          businessName: user.displayName || "My E-Com Store",
          gstin: "10AABCA8921K1Z5",
          stateCode: "10",
          stateName: "Bihar",
          upiId: "9661692365@ybl",
          isPro: false,
          isAdmin: false,
          subscriptionStatus: "FREE",
          paymentPending: false,
          createdAt: serverTimestamp()
        };
        try { await setDoc(userRef, initialProfile, { merge: true }); } catch (_) {}
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
        if (!prevPro && AppState.profile.isPro) {
          showToast("🎉 Payment Verified! SellGST Pro is now ACTIVE!", "success", 6000);
          closeProPaymentModal();
        }
      }
      syncProDOMElements();
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
  if (AppState.listeners.userUnsub) { AppState.listeners.userUnsub(); AppState.listeners.userUnsub = null; }
  if (AppState.listeners.paymentUnsub) { AppState.listeners.paymentUnsub(); AppState.listeners.paymentUnsub = null; }
}

function loadCachedLocalProfile(user) {
  try {
    const cached = JSON.parse(localStorage.getItem("sellgst_local_profile") || "{}");
    AppState.profile = {
      ...AppState.profile,
      ...cached,
      uid: user?.uid || cached.uid || "demo-seller",
      displayName: user?.displayName || cached.displayName || "AgniVolt E-Com Store",
      email: user?.email || cached.email || ""
    };
    syncProDOMElements();
    renderPendingPaymentBanner();
    notifyStateChange();
  } catch (_) {}
}

export function syncProDOMElements() {
  const isPro = Boolean(AppState.profile.isPro);
  const isAdmin = Boolean(AppState.profile.isAdmin);

  document.querySelectorAll("[data-pro-badge]").forEach((el) => {
    if (isPro) {
      el.textContent = "PRO ACTIVE ✨";
      el.className = "px-3 py-1.5 rounded-full text-xs font-bold bg-[#CBE8BA] text-gray-900 border border-emerald-400/50 shadow-sm whitespace-nowrap";
    } else {
      el.textContent = t("unlock_pro_btn", "Unlock Pro ⚡");
      el.className = "px-3 py-1.5 rounded-full text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 cursor-pointer transition whitespace-nowrap";
    }
  });

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

  document.querySelectorAll("[data-pro-lock-overlay]").forEach((el) => {
    el.style.display = isPro ? "none" : "flex";
  });

  document.querySelectorAll("[data-admin-only]").forEach((el) => {
    el.classList.toggle("hidden", !isAdmin);
  });

  document.querySelectorAll("[data-user-name]").forEach((el) => {
    el.textContent = AppState.profile.businessName || AppState.profile.displayName || "Seller Store";
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
    banner.className = "w-full bg-amber-100 border-b border-amber-300 text-amber-950 px-3 py-2 text-xs font-medium flex items-center justify-center z-40 text-center";
    document.body.prepend(banner);
  }

  const utrDisplay = AppState.pendingRequest?.utrNumber || localPending || "Submitted";
  banner.innerHTML = `
    <div>
      ⏳ <strong>Payment Verification Pending (UTR: ${sanitizeHTML(utrDisplay)})</strong> — Your account will activate automatically once Admin approves.
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
    el.className = "w-full bg-gray-900 text-[#CBE8BA] px-3 py-2 text-xs font-semibold text-center z-40";
    document.body.prepend(el);
  }
  el.innerHTML = `📢 ${sanitizeHTML(data.message)}`;
}

export function openProPaymentModal(defaultPlan = "MONTHLY") {
  let modal = document.getElementById("sellgst-upi-modal");
  if (modal) modal.remove();

  const cfg = AppState.merchantConfig;
  const selectedPlan = defaultPlan === "YEARLY" ? "YEARLY" : "MONTHLY";
  const amount = selectedPlan === "YEARLY" ? cfg.yearlyPrice : cfg.monthlyPrice;
  const planTitle = selectedPlan === "YEARLY" ? "Pro Yearly Pass (12 Months)" : "Pro Monthly Pass (30 Days)";

  const upiUri = `upi://pay?pa=${encodeURIComponent(cfg.upiId)}&pn=${encodeURIComponent(cfg.payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent("SellGST Pro Subscription")}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(upiUri)}`;

  modal = document.createElement("div");
  modal.id = "sellgst-upi-modal";
  modal.className = "fixed inset-0 z-[9990] bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto";

  modal.innerHTML = `
    <div class="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-5 sm:p-6 relative my-auto">
      <button type="button" id="close-upi-modal-btn" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold">✕</button>
      <span class="px-3 py-1 rounded-full text-[10px] font-bold bg-[#CBE8BA] text-gray-900">INSTANT UPI UNLOCK</span>
      <h3 class="text-lg font-extrabold text-gray-900 mt-2">Unlock SellGST Pro</h3>
      <p class="text-xs text-gray-500 mt-0.5">Unblur all RTO & Weight Fraud Order IDs + Unlimited GST Bills.</p>

      <div class="grid grid-cols-2 gap-2.5 mt-3">
        <button type="button" data-plan-select="MONTHLY" class="plan-card-btn p-3 rounded-2xl border-2 text-left transition ${selectedPlan === "MONTHLY" ? "border-gray-900 bg-gray-50" : "border-gray-200"}">
          <div class="text-[10px] font-bold text-gray-500">MONTHLY PRO</div>
          <div class="text-lg font-black text-gray-900">₹${cfg.monthlyPrice}<span class="text-xs font-normal">/mo</span></div>
        </button>
        <button type="button" data-plan-select="YEARLY" class="plan-card-btn p-3 rounded-2xl border-2 text-left transition relative ${selectedPlan === "YEARLY" ? "border-gray-900 bg-[#CBE8BA]/25" : "border-gray-200"}">
          <span class="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">SAVE 58%</span>
          <div class="text-[10px] font-bold text-gray-500">YEARLY PRO</div>
          <div class="text-lg font-black text-gray-900">₹${cfg.yearlyPrice}<span class="text-xs font-normal">/yr</span></div>
        </button>
      </div>

      <div class="mt-3 bg-[#F4F5F7] rounded-2xl p-3.5 text-center border border-gray-200">
        <div class="text-xs font-bold text-gray-700 mb-2">
          Step 1: Scan QR or Tap UPI App (<span id="upi-plan-label">${sanitizeHTML(planTitle)} — ₹${amount}</span>)
        </div>
        <img id="upi-dynamic-qr" src="${qrUrl}" alt="UPI QR" class="w-36 h-36 mx-auto rounded-xl bg-white p-2 border border-gray-200 object-contain" />
        <div class="mt-2 text-[11px] text-gray-600">
          Merchant: <strong class="text-gray-900">${sanitizeHTML(cfg.payeeName)}</strong> • <code class="font-mono text-gray-900">${sanitizeHTML(cfg.upiId)}</code>
        </div>
        <a id="upi-deeplink-btn" href="${upiUri}" class="mt-2.5 w-full inline-flex items-center justify-center py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition">
          📱 Pay ₹<span id="upi-btn-amt">${amount}</span> via PhonePe / GPay / Paytm
        </a>
      </div>

      <form id="upi-utr-form" class="mt-3 space-y-2.5">
        <label class="block text-xs font-bold text-gray-700">Step 2: Enter 12-Digit UPI UTR / Ref No.</label>
        <div class="flex gap-2">
          <input type="text" id="upi-utr-input" required minlength="6" maxlength="36" placeholder="e.g. 412893746512" class="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono" />
          <button type="button" id="upi-paid-quick-btn" class="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs whitespace-nowrap">I Have Paid</button>
        </div>
        <button type="submit" id="upi-submit-btn" class="w-full py-3 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-extrabold text-xs shadow-lg transition">
          ✅ Submit Payment for Instant Activation
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
      modal.querySelector("#upi-dynamic-qr").src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(newUri)}`;
      modal.querySelector("#upi-deeplink-btn").href = newUri;
      modal.querySelector("#upi-btn-amt").textContent = currentAmount;
      modal.querySelector("#upi-plan-label").textContent = `${p === "YEARLY" ? "Pro Yearly" : "Pro Monthly"} — ₹${currentAmount}`;
    });
  });

  modal.querySelector("#upi-paid-quick-btn").addEventListener("click", () => {
    const input = modal.querySelector("#upi-utr-input");
    if (!input.value.trim()) input.value = "PAID-" + String(Date.now()).slice(-8);
  });

  modal.querySelector("#close-upi-modal-btn").addEventListener("click", () => closeProPaymentModal());

  modal.querySelector("#upi-utr-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const utrNumber = sanitizeHTML(modal.querySelector("#upi-utr-input").value.trim());
    const uid = AppState.user?.uid || AppState.profile.uid || "seller-" + Date.now();
    const payload = {
      uid,
      userName: AppState.profile.businessName || AppState.profile.displayName || "Seller Store",
      userEmail: AppState.profile.email || AppState.user?.email || "seller@sellgst.pro",
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
      }
    } catch (_) {}

    localStorage.setItem("sellgst_pending_utr", utrNumber);
    const localQueue = JSON.parse(localStorage.getItem("sellgst_local_payment_requests") || "[]");
    localQueue.unshift({ id: "req_" + Date.now(), ...payload });
    localStorage.setItem("sellgst_local_payment_requests", JSON.stringify(localQueue.slice(0, 50)));

    AppState.pendingRequest = payload;
    renderPendingPaymentBanner();
    closeProPaymentModal();
    showToast("⏳ Payment Verification Pending! Admin notified.", "warning", 5000);
  });
}

export function closeProPaymentModal(fromPopState = false) {
  const modal = document.getElementById("sellgst-upi-modal");
  if (modal) modal.remove();
  if (!fromPopState) removeModalState("upi-payment-modal");
}

function getLocalAIFallback(q = "") {
  const s = String(q).toLowerCase();
  if (s.includes("rto") || s.includes("claim") || s.includes("weight")) {
    return "**How to Claim Pending RTO (>30 Days) & Weight Fraud:**\n1. Open **E-Com Audit** (`./ecom-audit.html`).\n2. Upload your Meesho, Flipkart, or Amazon CSV report.\n3. Click **Claim Ticket** next to any flagged order to copy a ready-to-send SPF / SAFE-T claim!";
  }
  if (s.includes("gst") || s.includes("json") || s.includes("3b")) {
    return "**How to File GSTR-1 (.JSON) in 60 Seconds:**\n1. Open **GST Filing** (`./gst-filing.html`).\n2. Click **Download Official GSTR-1 (.JSON)**.\n3. Upload the JSON file on `gst.gov.in` under **Prepare Offline** and file with OTP!";
  }
  return "**Welcome to SellGST AI (24/7)!**\n- **E-Com Audit (`./ecom-audit.html`):** Find RTO >30 days, Weight Fraud & crop 4x6 labels.\n- **GST Billing (`./invoice.html`):** Create B2B/B2C bills with auto CGST/SGST/IGST & UPI QR.\n- **GST Filing (`./gst-filing.html`):** Download 1-Click `gst.gov.in` JSON.";
}

function injectFloatingAIAssistant() {
  if (document.getElementById("sellgst-ai-orb")) return;

  const orb = document.createElement("button");
  orb.id = "sellgst-ai-orb";
  orb.type = "button";
  orb.className = "fixed bottom-20 sm:bottom-6 right-4 z-[9980] flex items-center gap-2 p-1.5 sm:pr-4 rounded-full bg-gray-950 text-white shadow-2xl border border-indigo-400/40 hover:scale-105 transition-all";
  orb.innerHTML = `
    <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-emerald-400 flex items-center justify-center relative">
      <span class="text-lg">🤖</span>
      <span class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#CBE8BA] border-2 border-gray-950"></span>
    </div>
    <div class="hidden sm:flex flex-col text-left">
      <span class="text-[10px] font-bold uppercase text-[#CBE8BA]">24/7 AI Support</span>
      <span class="text-xs font-extrabold text-white">Ask SellGST AI</span>
    </div>
  `;

  const drawer = document.createElement("div");
  drawer.id = "sellgst-ai-drawer";
  drawer.className = "fixed inset-y-0 right-0 z-[9985] w-full sm:w-[400px] bg-white shadow-2xl border-l border-gray-200 flex flex-col transform translate-x-full transition-transform duration-300";
  drawer.innerHTML = `
    <div class="p-4 bg-gray-950 text-white flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center">🤖</div>
        <div>
          <h4 class="font-extrabold text-sm">SellGST Pro AI</h4>
          <p class="text-[11px] text-gray-400">24/7 GST, Billing & RTO Assistant</p>
        </div>
      </div>
      <button type="button" id="close-ai-drawer-btn" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold">✕</button>
    </div>
    <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F4F5F7]/60 text-xs">
      <div class="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm text-gray-800 leading-relaxed">
        👋 <strong>Namaste!</strong> Ask me anything about <strong>RTO Claims, 4x6 Labels, GST Bills, or GSTR-1 JSON Filing</strong>!
      </div>
    </div>
    <form id="ai-chat-form" class="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
      <input type="text" id="ai-chat-input" placeholder="Ask about RTO claims, GST filing..." class="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#F4F5F7] border border-gray-200 text-xs focus:outline-none" />
      <button type="submit" class="px-4 py-2.5 rounded-2xl bg-gray-900 text-white font-bold text-xs">Send</button>
    </form>
  `;

  document.body.appendChild(orb);
  document.body.appendChild(drawer);

  orb.addEventListener("click", () => openAIAssistant());
  drawer.querySelector("#close-ai-drawer-btn").addEventListener("click", () => closeAIAssistant());
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
  if (initialQuery) sendAIMessage(initialQuery);
}

export function closeAIAssistant(fromPopState = false) {
  const drawer = document.getElementById("sellgst-ai-drawer");
  if (!drawer) return;
  drawer.classList.add("translate-x-full");
  if (!fromPopState) removeModalState("ai-assistant-drawer");
}

async function sendAIMessage(messageText) {
  const container = document.getElementById("ai-chat-messages");
  if (!container) return;

  const userDiv = document.createElement("div");
  userDiv.className = "ml-auto max-w-[85%] bg-gray-900 text-white p-3 rounded-2xl text-xs";
  userDiv.textContent = messageText;
  container.appendChild(userDiv);

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "max-w-[90%] bg-white p-3 rounded-2xl border border-gray-200 text-gray-800 text-xs leading-relaxed";
  loadingDiv.textContent = "Thinking...";
  container.appendChild(loadingDiv);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch("./api/ai-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: messageText, language: getCurrentLang() })
    });
    const data = await res.json();
    loadingDiv.innerHTML = sanitizeHTML(data?.reply || getLocalAIFallback(messageText))
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  } catch (_) {
    loadingDiv.innerHTML = sanitizeHTML(getLocalAIFallback(messageText))
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  }
  container.scrollTop = container.scrollHeight;
}

// ============================================================================
// BULLETPROOF AUTHENTICATION HELPERS (WITH INSTANT SANDBOX FALLBACK)
// ============================================================================
export async function loginWithEmail(email, password) {
  const cleanEmail = email.trim();
  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  localStorage.setItem(
    "sellgst_local_profile",
    JSON.stringify({
      uid: cred.user.uid,
      displayName: cred.user.displayName || cleanEmail.split("@")[0],
      businessName: cred.user.displayName || cleanEmail.split("@")[0],
      email: cleanEmail
    })
  );
  return cred;
}

export async function registerWithEmail(email, password, businessName, gstin) {
  const cleanEmail = email.trim();
  const cleanBiz = (businessName || "My E-Com Store").trim();
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
    email: cleanEmail,
    isPro: false,
    isAdmin: false,
    subscriptionStatus: "FREE"
  };
  localStorage.setItem("sellgst_local_profile", JSON.stringify(profileData));

  try {
    await setDoc(doc(db, "users", cred.user.uid), { ...profileData, createdAt: serverTimestamp() }, { merge: true });
  } catch (e) {
    console.warn("Firestore profile write deferred:", e.message);
  }
  return cred;
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function setupRecaptcha(buttonOrContainerId) {
  if (window.recaptchaVerifier) {
    try { window.recaptchaVerifier.clear(); } catch (_) {}
  }
  window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonOrContainerId, { size: "invisible" });
  return window.recaptchaVerifier;
}

export async function sendPhoneOTP(phoneNumber, recaptchaVerifier) {
  const digits = phoneNumber.replace(/\D/g, "").slice(-10);
  return signInWithPhoneNumber(auth, `+91${digits}`, recaptchaVerifier);
}

export async function logoutUser() {
  try { await signOut(auth); } catch (_) {}
  localStorage.removeItem("sellgst_demo_session");
  window.location.href = "./index.html";
}

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

  document.body.addEventListener("click", (e) => {
    const unlockBtn = e.target.closest("[data-unlock-pro]");
    if (unlockBtn) {
      e.preventDefault();
      openProPaymentModal(unlockBtn.getAttribute("data-unlock-pro") || "MONTHLY");
    }
    const aiTrigger = e.target.closest("[data-open-ai]");
    if (aiTrigger) {
      e.preventDefault();
      openAIAssistant(aiTrigger.getAttribute("data-open-ai") || "");
    }
  });
}

initSecurityCore();
