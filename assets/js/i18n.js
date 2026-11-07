/**
 * SellGST Pro — 11-Language Localization Engine (Strict Default: English)
 * Languages: English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi,
 *            Gujarati, Kannada, Malayalam, Punjabi
 * File: /assets/js/i18n.js
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English (Default)", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "hinglish", label: "Hinglish", native: "Hinglish (India)" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" }
];

const BASE_EN = {
  app_title: "SellGST Pro — E-Commerce Audit, Billing & GST Compliance",
  nav_dashboard: "Dashboard",
  nav_invoice: "GST Billing",
  nav_audit: "E-Com Audit",
  nav_gst: "GST Filing",
  nav_admin: "Admin Console",
  nav_logout: "Sign Out",
  unlock_pro_btn: "Unlock Pro ⚡",
  ai_search_placeholder: "Ask SellGST AI: How to claim RTO >30 days or file GSTR-1...",
  kpi_net_sales: "Net GST Sales (This Month)",
  kpi_recoverable_rto: "Recoverable E-Com Claims",
  kpi_udhar_collect: "Party Udhar (To Collect)",
  kpi_gst_payable: "Net GST Payable (3B)",
  kpi_low_stock: "Low Stock SKUs",
  kpi_audit_health: "Payout Audit Score",
  btn_create_invoice: "+ Create GST Bill",
  btn_scan_csv: "Scan Marketplace CSV",
  btn_download_gstr1: "Download GSTR-1 (.JSON)",
  btn_crop_labels: "4x6 Label Cropper",
  hero_badge: "INDIA'S #1 E-COM AUDIT & GST SUPER-APP",
  hero_heading: "Stop Losing 12% of Your E-Commerce Payouts to Unclaimed RTOs & Weight Fraud.",
  hero_subtext: "100% Client-Side RAM CSV Audit for Amazon, Flipkart & Meesho + Instant GST Billing, Party Udhar & 1-Click GSTR-1 JSON Filing.",
  login_title: "Sign in to SellGST Pro",
  paywall_banner: "Pro Feature: Unlock full unmasked Order IDs & 1-Click Claim Tickets for ₹99/mo"
};

export const DICTIONARY = {
  en: { ...BASE_EN },

  hi: {
    ...BASE_EN,
    nav_dashboard: "डैशबोर्ड",
    nav_invoice: "GST बिलिंग",
    nav_audit: "ई-कॉमर्स ऑडिट",
    nav_gst: "GST रिटर्न",
    nav_admin: "एडमिन पैनल",
    nav_logout: "लॉग आउट",
    unlock_pro_btn: "Pro अनलॉक करें ⚡",
    ai_search_placeholder: "SellGST AI से पूछें: 30+ दिन के RTO क्लेम या GSTR-1 कैसे फाइल करें...",
    kpi_net_sales: "कुल GST बिक्री (इस माह)",
    kpi_recoverable_rto: "वसूली योग्य RTO और वेट क्लेम",
    kpi_udhar_collect: "पार्टी उधार (लेना बाकी)",
    kpi_gst_payable: "कुल देय GST (GSTR-3B)",
    kpi_low_stock: "कम स्टॉक आइटम",
    kpi_audit_health: "पेआउट ऑडिट स्कोर",
    btn_create_invoice: "+ नया GST बिल बनाएं",
    btn_scan_csv: "CSV रिपोर्ट स्कैन करें",
    btn_download_gstr1: "GSTR-1 (.JSON) डाउनलोड",
    btn_crop_labels: "4x6 थर्मल लेबल क्रॉपर",
    hero_heading: "अनक्लेम्ड RTO और कूरियर वेट फ्रॉड में अपना 12% मुनाफा गँवाना बंद करें।",
    login_title: "SellGST Pro में लॉग इन करें"
  },

  hinglish: {
    ...BASE_EN,
    nav_dashboard: "Dashboard",
    nav_invoice: "GST Bill & Khata",
    nav_audit: "RTO & Weight Audit",
    nav_gst: "GSTR-1 Filing",
    nav_admin: "Admin Panel",
    unlock_pro_btn: "Unlock Pro @ ₹99 ⚡",
    ai_search_placeholder: "SellGST AI se puchein: Pending RTO claim ya GSTR-1 JSON kaise banaye...",
    kpi_net_sales: "Is Mahine Ki Total Sales",
    kpi_recoverable_rto: "Recoverable RTO & Weight Fraud",
    kpi_udhar_collect: "Party Udhar (Lena Baaki)",
    kpi_gst_payable: "Net GST Payable (3B)",
    btn_create_invoice: "+ Naya GST Bill Banaye",
    btn_scan_csv: "Meesho/Flipkart CSV Scan Karein",
    btn_download_gstr1: "1-Click GSTR-1 (.JSON)",
    hero_heading: "Unclaimed RTO aur Courier Weight Fraud se apna 12% payout loss turant rokein."
  },

  bn: {
    ...BASE_EN,
    nav_dashboard: "ড্যাশবোর্ড",
    nav_invoice: "GST বিলিং",
    nav_audit: "ই-কমার্স অডিট",
    nav_gst: "GST ফাইলিং",
    nav_admin: "অ্যাডমিন প্যানেল",
    unlock_pro_btn: "Pro আনলক করুন ⚡",
    kpi_net_sales: "মোট GST বিক্রয়",
    kpi_recoverable_rto: "পুনরুদ্ধারযোগ্য RTO ক্লেইম",
    kpi_udhar_collect: "পার্টি উধার (প্রাপ্য)",
    btn_create_invoice: "+ নতুন GST বিল",
    btn_scan_csv: "CSV রিপোর্ট স্ক্যান করুন",
    btn_download_gstr1: "GSTR-1 (.JSON) ডাউনলোড"
  },

  ta: {
    ...BASE_EN,
    nav_dashboard: "டாஷ்போர்டு",
    nav_invoice: "GST பில்லிங்",
    nav_audit: "இ-காமர்ஸ் தணிக்கை",
    nav_gst: "GST தாக்கல்",
    nav_admin: "நிர்வாக குழு",
    unlock_pro_btn: "Pro திறக்கவும் ⚡",
    kpi_net_sales: "மொத்த GST விற்பனை",
    kpi_recoverable_rto: "மீட்கக்கூடிய RTO உரிமைகோரல்",
    kpi_udhar_collect: "பார்ட்டி பாக்கி (பெற வேண்டியவை)",
    btn_create_invoice: "+ புதிய GST பில்",
    btn_scan_csv: "CSV அறிக்கையை ஸ்கேன் செய்",
    btn_download_gstr1: "GSTR-1 (.JSON) பதிவிறக்கம்"
  },

  te: {
    ...BASE_EN,
    nav_dashboard: "డ్యాష్‌బోర్డ్",
    nav_invoice: "GST బిల్లింగ్",
    nav_audit: "ఇ-కామర్స్ ఆడిట్",
    nav_gst: "GST ఫైలింగ్",
    nav_admin: "అడ్మిన్ ప్యానెల్",
    unlock_pro_btn: "Pro అన్‌లాక్ చేయండి ⚡",
    kpi_net_sales: "నికర GST అమ్మకాలు",
    kpi_recoverable_rto: "రికవరీ చేయగల RTO క్లెయిమ్స్",
    kpi_udhar_collect: "పార్టీ ఉధార్ (రావాల్సినవి)",
    btn_create_invoice: "+ కొత్త GST బిల్లు",
    btn_scan_csv: "CSV రిపోర్ట్ స్కాన్ చేయండి",
    btn_download_gstr1: "GSTR-1 (.JSON) డౌన్‌లోడ్"
  },

  mr: {
    ...BASE_EN,
    nav_dashboard: "डॅशबोर्ड",
    nav_invoice: "GST बिलिंग",
    nav_audit: "ई-कॉमर्स ऑडिट",
    nav_gst: "GST फायलिंग",
    nav_admin: "ॲडमिन पॅनेल",
    unlock_pro_btn: "Pro अनलॉक करा ⚡",
    kpi_net_sales: "एकूण GST विक्री",
    kpi_recoverable_rto: "वसूल करण्यायोग्य RTO क्लेम",
    kpi_udhar_collect: "पार्टी उधार (येणे बाकी)",
    btn_create_invoice: "+ नवीन GST बिल तयार करा",
    btn_scan_csv: "CSV रिपोर्ट स्कॅन करा",
    btn_download_gstr1: "GSTR-1 (.JSON) डाउनलोड"
  },

  gu: {
    ...BASE_EN,
    nav_dashboard: "ડેશબોર્ડ",
    nav_invoice: "GST બિલિંગ",
    nav_audit: "ઈ-કોમર્સ ઓડિટ",
    nav_gst: "GST ફાઇલિંગ",
    nav_admin: "એડમિન પેનલ",
    unlock_pro_btn: "Pro અનલોક કરો ⚡",
    kpi_net_sales: "કુલ GST વેચાણ",
    kpi_recoverable_rto: "રિકવર કરી શકાય તેવા RTO ક્લેમ",
    kpi_udhar_collect: "પાર્ટી ઉધાર (લેવાના બાકી)",
    btn_create_invoice: "+ નવું GST બિલ બનાવો",
    btn_scan_csv: "CSV રિપોર્ટ સ્કેન કરો",
    btn_download_gstr1: "GSTR-1 (.JSON) ડાઉનલોડ"
  },

  kn: {
    ...BASE_EN,
    nav_dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    nav_invoice: "GST ಬಿಲ್ಲಿಂಗ್",
    nav_audit: "ಇ-ಕಾಮರ್ಸ್ ಆಡಿಟ್",
    nav_gst: "GST ಫೈಲಿಂಗ್",
    nav_admin: "ಅಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್",
    unlock_pro_btn: "Pro ಅನ್‌ಲಾಕ್ ಮಾಡಿ ⚡",
    kpi_net_sales: "ಒಟ್ಟು GST ಮಾರಾಟ",
    kpi_recoverable_rto: "ವಸೂಲಿ ಮಾಡಬಹುದಾದ RTO ಕ್ಲೈಮ್",
    kpi_udhar_collect: "ಪಾರ್ಟಿ ಉಧಾರ್ (ಬರಬೇಕಾದ ಬಾಕಿ)",
    btn_create_invoice: "+ ಹೊಸ GST ಬಿಲ್ ರಚಿಸಿ",
    btn_scan_csv: "CSV ವರದಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    btn_download_gstr1: "GSTR-1 (.JSON) ಡೌನ್‌ಲೋಡ್"
  },

  ml: {
    ...BASE_EN,
    nav_dashboard: "ഡാഷ്‌ബോർഡ്",
    nav_invoice: "GST ബില്ലിംഗ്",
    nav_audit: "ഇ-കൊമേഴ്‌സ് ഓഡിറ്റ്",
    nav_gst: "GST ഫയലിംഗ്",
    nav_admin: "അഡ്മിൻ പാനൽ",
    unlock_pro_btn: "Pro അൺലോക്ക് ചെയ്യുക ⚡",
    kpi_net_sales: "മൊത്തം GST വിൽപ്പന",
    kpi_recoverable_rto: "തിരിച്ചുപിടിക്കാവുന്ന RTO ക്ലെയിം",
    kpi_udhar_collect: "പാർട്ടി കടം (ലഭിക്കാനുള്ളത്)",
    btn_create_invoice: "+ പുതിയ GST ബിൽ",
    btn_scan_csv: "CSV റിപ്പോർട്ട് സ്കാൻ ചെയ്യുക",
    btn_download_gstr1: "GSTR-1 (.JSON) ഡൗൺലോഡ്"
  },

  pa: {
    ...BASE_EN,
    nav_dashboard: "ਡੈਸ਼ਬੋਰਡ",
    nav_invoice: "GST ਬਿਲਿੰਗ",
    nav_audit: "ਈ-ਕਾਮਰਸ ਆਡਿਟ",
    nav_gst: "GST ਫਾਈਲਿੰਗ",
    nav_admin: "ਐਡਮਿਨ ਪੈਨਲ",
    unlock_pro_btn: "Pro ਅਨਲੌਕ ਕਰੋ ⚡",
    kpi_net_sales: "ਕੁੱਲ GST ਵਿਕਰੀ",
    kpi_recoverable_rto: "ਵਸੂਲੀਯੋਗ RTO ਕਲੇਮ",
    kpi_udhar_collect: "ਪਾਰਟੀ ਉਧਾਰ (ਲੈਣ ਵਾਲਾ ਬਕਾਇਆ)",
    btn_create_invoice: "+ ਨਵਾਂ GST ਬਿੱਲ ਬਣਾਓ",
    btn_scan_csv: "CSV ਰਿਪੋਰਟ ਸਕੈਨ ਕਰੋ",
    btn_download_gstr1: "GSTR-1 (.JSON) ਡਾਊਨਲੋਡ"
  }
};

const STORAGE_KEY = "sellgst_lang";

export function getCurrentLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTIONARY[saved]) return saved;
  } catch (_) {}
  return "en"; // Strict 100% English Default
}

export function t(key, fallback = "") {
  const lang = getCurrentLang();
  const pack = DICTIONARY[lang] || DICTIONARY.en;
  return pack[key] || DICTIONARY.en[key] || fallback || key;
}

export function setLanguage(langCode) {
  const validCode = DICTIONARY[langCode] ? langCode : "en";
  try {
    localStorage.setItem(STORAGE_KEY, validCode);
  } catch (_) {}
  document.documentElement.lang = validCode === "hinglish" ? "en" : validCode;
  applyTranslationsToDOM();
  window.dispatchEvent(new CustomEvent("sellgst:lang-changed", { detail: { lang: validCode } }));
}

export function applyTranslationsToDOM() {
  const current = getCurrentLang();

  // Translate textContent elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      el.textContent = t(key, el.textContent);
    }
  });

  // Translate input placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      el.setAttribute("placeholder", t(key, el.getAttribute("placeholder") || ""));
    }
  });

  // Sync all Language Switcher <select> dropdowns
  document.querySelectorAll("[data-lang-switcher]").forEach((select) => {
    if (!select.dataset.populated) {
      select.innerHTML = SUPPORTED_LANGUAGES.map(
        (l) => `<option value="${l.code}">${l.native}</option>`
      ).join("");
      select.dataset.populated = "true";
      select.addEventListener("change", (e) => {
        setLanguage(e.target.value);
      });
    }
    select.value = current;
  });
}

export function initI18n() {
  // Ensure strict English default on first visit
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, "en");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTranslationsToDOM);
  } else {
    applyTranslationsToDOM();
  }
}
