/**
 * SellGST Pro — Master Production Security Core v4.2
 * Features:
 * 1. Professional Conversational Gemini AI (Remembers context, solves problems directly, never repeats names/canned text).
 * 2. Real-Data Engine (Shows clean zero/empty state until user uploads CSV or invoices, then calculates actual profit/loss & RTO).
 * 3. Smart Signup/Login Gateway (Auto-prompts new visitors to register so you never lose customer leads).
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

export const FREE_USAGE_MAX_LIMIT = 5;

const DEFAULT_PROFILE = {
  uid: "seller-local-01",
  displayName: "S.K.P.S DIGITAL",
  email: "example@mail.com",
  phone: "+919999999999",
  gstin: "07AABCS1429B1Z5",
  businessName: "S.K.P.S DIGITAL",
  isPro: false,
  isAdmin: false,
  subscriptionStatus: "FREE",
  planName: "FREE",
  freeActionsUsed: 0,
  dpdpConsentAccepted: true
};

function getInitialHydratedProfile() {
  try {
    const raw = localStorage.getItem("sellgst_local_profile");
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
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
    whatsappWebhookNumber: "917808990039"
  },
  aiConversationHistory: [], // Stores last 10 messages for contextual AI memory
  subscribers: new Set()
};

export function subscribeAppState(callback) {
  if (typeof callback === "function") {
    AppState.subscribers.add(callback);
    try { callback(AppState); } catch (_) {}
  }
  return () => AppState.subscribers.delete(callback);
}

function notifyStateChange() {
  AppState.subscribers.forEach((cb) => {
    try { cb(AppState); } catch (_) {}
  });
}

// ============================================================================
// PROFESSIONAL CONVERSATIONAL GEMINI AI ENGINE (MEMORY + DIRECT PROBLEM SOLVING)
// ============================================================================
export async function queryProfessionalGeminiAI(userMessage = "") {
  const msg = String(userMessage || "").trim();
  if (!msg) return "Hello! How can I help you with your business or GST compliance today?";

  // Save to rolling history (max 10 messages)
  AppState.aiConversationHistory.push({ role: "user", text: msg });
  if (AppState.aiConversationHistory.length > 10) {
    AppState.aiConversationHistory.shift();
  }

  // Try calling serverless backend first
  const endpoints = ["./api/ai-assistant", "https://sellgst-pro.pages.dev/api/ai-assistant"];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          language: getCurrentLang(),
          history: AppState.aiConversationHistory.slice(-10)
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.reply) {
          AppState.aiConversationHistory.push({ role: "model", text: data.reply });
          return data.reply;
        }
      }
    } catch (_) {}
  }

  // Intelligent Contextual Fallback (Professional, No Repeating Name)
  const lower = msg.toLowerCase();
  let reply = "";

  if (/^(hi+|hello+|hey+|namaste|hlo)[\s!?.]*$/i.test(lower)) {
    reply = "Hello! 👋 I am your SellGST Pro Business Assistant. How can I assist you with your store calculations, GST invoices, or marketplace reports today?";
  } else if (lower.includes("gst") || lower.includes("tax") || lower.includes("calculate") || lower.includes("%")) {
    const nums = lower.match(/(\d+(?:\.\d+)?)/g);
    if (nums) {
      const amt = Number(nums[0]) || 0;
      const rate = nums[1] ? Number(nums[1]) : 18;
      const tax = (amt * rate) / 100;
      reply = `📊 **GST Breakdown for ₹${amt.toLocaleString("en-IN")} @ ${rate}%:**\n• Taxable Value: ₹${amt.toFixed(2)}\n• CGST (${rate/2}%): ₹${(tax/2).toFixed(2)}\n• SGST (${rate/2}%): ₹${(tax/2).toFixed(2)}\n• Total Payable: **₹${(amt + tax).toFixed(2)}**`;
    } else {
      reply = "Please specify the amount and GST percentage (e.g., 'Calculate 18% GST on 15000'), and I will compute the exact taxable value and tax split for you.";
    }
  } else if (lower.includes("rto") || lower.includes("claim") || lower.includes("loss")) {
    reply = "To check your actual RTO losses or weight discrepancies, please upload your marketplace CSV report on the E-Com Audit page. The system will instantly compute your real recoverable amounts.";
  } else {
    reply = `I understand you are asking about "${msg}". Could you provide a bit more detail so I can give you the exact solution?`;
  }

  AppState.aiConversationHistory.push({ role: "model", text: reply });
  return reply;
}

// ============================================================================
// REAL-DATA EVALUATOR (No fake demo data unless requested)
// ============================================================================
export function getRealClientMetrics() {
  try {
    const invoices = JSON.parse(localStorage.getItem("sellgst_invoices") || "[]");
    const auditData = JSON.parse(localStorage.getItem("sellgst_audit_rows") || "[]");

    const totalSales = invoices.reduce((acc, inv) => acc + (Number(inv.grandTotal) || 0), 0);
    const totalTax = invoices.reduce((acc, inv) => acc + (Number(inv.totalTax) || 0), 0);
    const rtoLoss = auditData.reduce((acc, r) => acc + (Number(r.claimAmount) || 0), 0);

    return {
      hasRealData: invoices.length > 0 || auditData.length > 0,
      totalSales,
      totalTax,
      rtoLoss,
      netProfit: totalSales - rtoLoss
    };
  } catch (_) {
    return { hasRealData: false, totalSales: 0, totalTax: 0, rtoLoss: 0, netProfit: 0 };
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

const inrFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
export function formatINR(amount) { return inrFormatter.format(Number(amount) || 0); }

export function showToast(message, type = "success", duration = 4000) {
  let container = document.getElementById("sellgst-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "sellgst-toast-container";
    container.className = "fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-2.5 max-w-sm sm:w-full pointer-events-none";
    document.body.appendChild(container);
  }
  const colors = { success: "bg-[#081B4B] text-white", warning: "bg-amber-500 text-slate-950", error: "bg-rose-600 text-white", info: "bg-[#5B2EFF] text-white" };
  const toast = document.createElement("div");
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl transition-all duration-300 ${colors[type] || colors.success}`;
  toast.innerHTML = `<div class="text-[13px] font-semibold flex-1">${sanitizeHTML(message)}</div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

export function initSecurityCore() {
  initI18n();
  // Auto-prompt unregistered visitors to login/signup page after 20 seconds if not authenticated
  if (!localStorage.getItem("sellgst_local_profile") && !window.location.pathname.includes("login")) {
    setTimeout(() => {
      if (!localStorage.getItem("sellgst_local_profile")) {
        showToast("Welcome to SellGST Pro! Please sign in or register your store.", "info", 6000);
      }
    }, 20000);
  }
}

initSecurityCore();

window.SellGSTCore = {
  app, auth, db, AppState,
  queryProfessionalGeminiAI,
  getRealClientMetrics,
  sanitizeHTML, formatINR, showToast
};
