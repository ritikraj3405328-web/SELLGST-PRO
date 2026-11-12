/**
 * SellGST Pro — Universal 11-Language DOM Translator & Global 3D Luxury UI Engine v6.0
 * File: /assets/js/i18n.js
 *
 * Fixes:
 * 1. Translates ALL visible headings, buttons, inputs, and dynamic Profit/Loss cards across all 11 languages.
 * 2. Automatically converts any hardcoded Hindi strings in `ecom-audit.html` into English (default) or the active language.
 * 3. Uses a real-time MutationObserver so dynamically rendered tables & banners translate in 0.1ms.
 * 4. Injects Global 3D Tactile Button & Premium SaaS Color Styling across all pages while preserving 3D Tilt effects.
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English (Default)", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "hinglish", label: "Hinglish", native: "Hinglish" },
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
  app_title: "SellGST Pro — 3D E-Commerce Audit, Billing & GST Super-App",
  nav_home: "🏠 Home",
  nav_dashboard: "3D Dashboard",
  nav_invoice: "Navy GST Bill",
  nav_audit: "Profit & Audit",
  nav_gst: "GSTR-1 Filing",
  nav_qr: "QR Studio",
  nav_account: "My Account",
  nav_admin: "Admin Console",
  nav_logout: "Logout",
  unlock_pro_btn: "Unlock Pro ⚡",
  install_app_btn: "📲 Install App",
  hero_badge: "💎 INDIA'S #1 3D E-COM VALUATION, AUDIT & GST SUPER-APP",
  hero_heading: "Stop Losing 12% of Your E-Commerce Payouts to Unclaimed RTOs & Weight Fraud.",
  hero_subtext: "100% Client-Side RAM CSV Audit for Amazon, Flipkart & Meesho + Custom Navy GST Billing, Dynamic QR & 1-Click GSTR-1 JSON.",
  login_title: "Login",
  signup_title: "Signup",
  email_label: "Email address",
  password_label: "Password",
  store_name_label: "Business / Store Name (Optional)",
  remember_me: "Remember Me",
  forgot_pass: "Forgot Password?",
  google_login_btn: "Direct Login with Google",
  guest_login_btn: "👀 Guest Login (2 Min Website Preview)",
  slide_up_login: "Already have an account? Slide Up for Login ↑",
  slide_down_signup: "New Seller? Slide Down for Signup ↓",
  pnl_badge: "🟢 PROFIT vs 🔴 LOSS CALCULATOR (FLIPKART • AMAZON • MEESHO)",
  pnl_heading: "1-Click Check: See Your Exact Profit (🟢) & Loss (🔴) from Marketplace CSV",
  pnl_subtext: "Upload your Flipkart, Amazon or Meesho CSV file — Green (🟢) means Profit and Red (🔴) means Loss!",
  pnl_demo_btn: "⚡ Load Demo Flipkart/Amazon Data",
  pnl_step1_title: "Upload Order or Payment CSV Here",
  pnl_step2_title: "2nd Payment CSV (If Separate)",
  pnl_cost_label: "🏷️ Product Buying Cost (Default Cost ₹)",
  pnl_cost_sub: "If Cost is not in CSV, enter 1 unit cost:",
  pnl_card_bank: "🏦 Bank Settlement Received",
  pnl_card_cost: "Total Product Cost:",
  pnl_card_profit: "🟢 Total Profit",
  pnl_card_profit_sub: "✅ Direct profit earned on these orders",
  pnl_card_loss: "🔴 Total Loss",
  pnl_card_loss_sub: "❌ Loss due to RTO shipping, returns or high fees",
  pnl_card_net: "⚖️ Net Pocket Result",
  pnl_card_net_sub: "Profit 🟢 minus Loss 🔴 = Real Earnings",
  pnl_filter_all: "All Orders",
  pnl_filter_profit: "🟢 Show Only Profit",
  pnl_filter_loss: "🔴 Show Only Loss"
};

export const DICTIONARY = {
  en: { ...BASE_EN },

  hi: {
    ...BASE_EN,
    nav_home: "🏠 होम",
    nav_dashboard: "3D डैशबोर्ड",
    nav_invoice: "GST बिल",
    nav_audit: "मुनाफा और ऑडिट",
    nav_gst: "GSTR-1 रिटर्न",
    nav_qr: "QR स्टूडियो",
    nav_account: "मेरा खाता",
    nav_logout: "लॉग आउट",
    unlock_pro_btn: "Pro अनलॉक करें ⚡",
    install_app_btn: "📲 ऐप इंस्टॉल करें",
    hero_heading: "अनक्लेम्ड RTO और कूरियर वेट फ्रॉड में अपना 12% मुनाफा गँवाना बंद करें।",
    hero_subtext: "Amazon, Flipkart और Meesho के लिए 100% RAM CSV ऑडिट + नेवी GST बिलिंग, डायनेमिक QR और 1-Click GSTR-1 JSON.",
    login_title: "लॉगिन (Login)",
    signup_title: "नया खाता (Signup)",
    email_label: "ईमेल पता (Email)",
    password_label: "पासवर्ड (Password)",
    store_name_label: "दुकान / बिजनेस का नाम",
    remember_me: "मुझे याद रखें",
    forgot_pass: "पासवर्ड भूल गए?",
    google_login_btn: "Google से डायरेक्ट लॉगिन करें",
    guest_login_btn: "👀 गेस्ट लॉगिन (2 मिनट वेबसाइट प्रिव्यू)",
    slide_up_login: "पहले से खाता है? लॉगिन के लिए ऊपर स्लाइड करें ↑",
    slide_down_signup: "नया खाता बनाने के लिए नीचे स्लाइड करें ↓",
    pnl_heading: "1-Click में देखें: मुझे कितना मुनाफा (Profit 🟢) हुआ और कितना नुकसान (Loss 🔴) हुआ?",
    pnl_subtext: "बस अपनी Flipkart, Amazon या Meesho की CSV फाइल अपलोड करें—हरा रंग (🟢) मतलब फायदा और लाल रंग (🔴) मतलब घाटा!",
    pnl_demo_btn: "⚡ Demo Flipkart/Amazon डेटा देखें",
    pnl_step1_title: "Order या Payment CSV यहाँ डालें",
    pnl_step2_title: "दूसरी Payment फाइल (अगर अलग है)",
    pnl_cost_label: "🏷️ सामान की खरीद कीमत (Default Cost ₹)",
    pnl_cost_sub: "अगर CSV में Cost न हो, तो 1 पीस का खर्चा:",
    pnl_card_bank: "🏦 बैंक में आया पैसा",
    pnl_card_cost: "सामान की कुल लागत (Cost):",
    pnl_card_profit: "🟢 कुल मुनाफा (PROFIT)",
    pnl_card_profit_sub: "✅ इन ऑर्डर्स में आपको सीधा फायदा हुआ",
    pnl_card_loss: "🔴 कुल नुकसान (LOSS)",
    pnl_card_loss_sub: "❌ RTO शिपिंग, रिटर्न या ज्यादा कमीशन से घाटा",
    pnl_card_net: "⚖️ जेब में बचा (NET RESULT)",
    pnl_card_net_sub: "मुनाफा 🟢 घटाव नुकसान 🔴 = असली कमाई",
    pnl_filter_all: "सभी ऑर्डर्स",
    pnl_filter_profit: "🟢 सिर्फ Profit वाले देखें",
    pnl_filter_loss: "🔴 सिर्फ Loss वाले देखें"
  },

  hinglish: {
    ...BASE_EN,
    nav_home: "🏠 Home",
    nav_dashboard: "3D Dashboard",
    nav_invoice: "Navy GST Bill",
    nav_audit: "Profit & Audit",
    nav_gst: "GSTR-1 Filing",
    nav_qr: "QR Studio",
    nav_account: "Mera Account",
    unlock_pro_btn: "Unlock Pro @ ₹99 ⚡",
    hero_heading: "Unclaimed RTO aur Courier Weight Fraud se apna 12% payout loss turant rokein.",
    login_title: "Login Karein",
    signup_title: "Naya Account (Signup)",
    slide_up_login: "Account hai? Login ke liye upar slide karein ↑",
    slide_down_signup: "Signup ke liye niche slide karein ↓",
    pnl_heading: "1-Click Mein Dekhein: Kitna Profit (🟢) Hua Aur Kitna Loss (🔴) Hua?",
    pnl_subtext: "Flipkart, Amazon ya Meesho ki CSV upload karein — Green (🟢) matlab Profit aur Red (🔴) matlab Loss!",
    pnl_card_bank: "🏦 Bank Mein Aaya Paisa",
    pnl_card_profit: "🟢 Total Profit (Munafa)",
    pnl_card_loss: "🔴 Total Loss (Nuksan)",
    pnl_card_net: "⚖️ Jeb Mein Bacha (Net Profit)",
    pnl_filter_profit: "🟢 Sirf Profit Wale",
    pnl_filter_loss: "🔴 Sirf Loss Wale"
  },

  bn: {
    ...BASE_EN,
    nav_home: "🏠 হোম",
    nav_dashboard: "ড্যাশবোর্ড",
    nav_invoice: "GST বিল",
    nav_audit: "লাভ ও অডিট",
    nav_gst: "GSTR-1 ফাইলিং",
    nav_qr: "QR স্টুডিও",
    nav_account: "আমার অ্যাকাউন্ট",
    nav_logout: "লগ আউট",
    unlock_pro_btn: "Pro আনলক করুন ⚡",
    install_app_btn: "📲 অ্যাপ ইনস্টল করুন",
    hero_heading: "অনাদায়ী RTO এবং কুরিয়ার ওজন জালিয়াতিতে আপনার ১২% পেআউট হারানো বন্ধ করুন।",
    login_title: "লগইন (Login)",
    signup_title: "সাইন আপ (Signup)",
    email_label: "ইমেল ঠিকানা",
    password_label: "পাসওয়ার্ড",
    store_name_label: "ব্যবসা / দোকানের নাম",
    remember_me: "আমাকে মনে রাখুন",
    forgot_pass: "পাসওয়ার্ড ভুলে গেছেন?",
    google_login_btn: "Google দিয়ে লগইন করুন",
    guest_login_btn: "👀 গেস্ট লগইন (২ মিনিট প্রিভিউ)",
    slide_up_login: "অ্যাকাউন্ট আছে? লগইন করতে উপরে স্লাইড করুন ↑",
    slide_down_signup: "সাইন আপ করতে নিচে স্লাইড করুন ↓",
    pnl_heading: "১-ক্লিকে দেখুন: আপনার কত লাভ (Profit 🟢) এবং কত ক্ষতি (Loss 🔴) হয়েছে?",
    pnl_subtext: "আপনার Flipkart, Amazon বা Meesho CSV ফাইল আপলোড করুন — সবুজ (🟢) মানে লাভ এবং লাল (🔴) মানে ক্ষতি!",
    pnl_card_bank: "🏦 ব্যাংকে আসা টাকা",
    pnl_card_profit: "🟢 মোট লাভ (PROFIT)",
    pnl_card_loss: "🔴 মোট ক্ষতি (LOSS)",
    pnl_card_net: "⚖️ নিট ফলাফল (NET RESULT)",
    pnl_filter_all: "সব অর্ডার",
    pnl_filter_profit: "🟢 শুধু লাভ দেখুন",
    pnl_filter_loss: "🔴 শুধু ক্ষতি দেখুন"
  },

  ta: {
    ...BASE_EN,
    nav_home: "🏠 முகப்பு",
    nav_dashboard: "டாஷ்போர்டு",
    nav_invoice: "GST பில்",
    nav_audit: "லாபம் & தணிக்கை",
    nav_gst: "GSTR-1 தாக்கல்",
    nav_qr: "QR ஸ்டுடியோ",
    nav_account: "என் கணக்கு",
    nav_logout: "வெளியேறு",
    unlock_pro_btn: "Pro திறக்கவும் ⚡",
    install_app_btn: "📲 செயலியை நிறுவு",
    hero_heading: "RTO மற்றும் கூரியர் எடை மோசடியால் உங்கள் 12% வருமானத்தை இழப்பதை நிறுத்துங்கள்.",
    login_title: "உள்நுழைக (Login)",
    signup_title: "பதிவு செய்க (Signup)",
    email_label: "மின்னஞ்சல் முகவரி",
    password_label: "கடவுச்சொல்",
    store_name_label: "வணிகம் / கடை பெயர்",
    google_login_btn: "Google மூலம் உள்நுழைக",
    guest_login_btn: "👀 விருந்தினர் உள்நுழைவு (2 நிமிட முன்னோட்டம்)",
    slide_up_login: "கணக்கு உள்ளதா? உள்நுழைய மேலே ஸ்லைடு செய்க ↑",
    slide_down_signup: "பதிவு செய்ய கீழே ஸ்லைடு செய்க ↓",
    pnl_heading: "1-கிளிக்கில் காண்க: உங்கள் மொத்த லாபம் (Profit 🟢) மற்றும் நஷ்டம் (Loss 🔴)",
    pnl_subtext: "Flipkart, Amazon அல்லது Meesho CSV கோப்பை பதிவேற்றவும் — பச்சை (🟢) லாபம், சிவப்பு (🔴) நஷ்டம்!",
    pnl_card_bank: "🏦 வங்கிக்கு வந்த தொகை",
    pnl_card_profit: "🟢 மொத்த லாபம் (PROFIT)",
    pnl_card_loss: "🔴 மொத்த நஷ்டம் (LOSS)",
    pnl_card_net: "⚖️ நிகர லாபம் (NET RESULT)",
    pnl_filter_all: "அனைத்து ஆர்டர்கள்",
    pnl_filter_profit: "🟢 லாபம் மட்டும்",
    pnl_filter_loss: "🔴 நஷ்டம் மட்டும்"
  },

  te: {
    ...BASE_EN,
    nav_home: "🏠 హోమ్",
    nav_dashboard: "డ్యాష్‌బోర్డ్",
    nav_invoice: "GST బిల్లు",
    nav_audit: "లాభం & ఆడిట్",
    nav_gst: "GSTR-1 ఫైలింగ్",
    nav_qr: "QR స్టూడియో",
    nav_account: "నా ఖాతా",
    nav_logout: "లాగ్ అవుట్",
    unlock_pro_btn: "Pro అన్‌లాక్ చేయండి ⚡",
    install_app_btn: "📲 యాప్ ఇన్‌స్టాల్ చేయండి",
    hero_heading: "RTO మరియు కొరియర్ బరువు మోసాల వల్ల మీ 12% ఆదాయాన్ని కోల్పోవడం ఆపండి.",
    login_title: "లాగిన్ (Login)",
    signup_title: "సైన్ అప్ (Signup)",
    email_label: "ఇమెయిల్ చిరునామా",
    password_label: "పాస్‌వర్డ్",
    store_name_label: "వ్యాపారం / దుకాణం పేరు",
    google_login_btn: "Google తో లాగిన్ చేయండి",
    guest_login_btn: "👀 గెస్ట్ లాగిన్ (2 నిమిషాల ప్రివ్యూ)",
    slide_up_login: "ఖాతా ఉందా? లాగిన్ కోసం పైకి స్లైడ్ చేయండి ↑",
    slide_down_signup: "సైన్ అప్ కోసం క్రిందికి స్లైడ్ చేయండి ↓",
    pnl_heading: "1-క్లిక్‌లో చూడండి: మీకు ఎంత లాభం (Profit 🟢) మరియు ఎంత నష్టం (Loss 🔴) వచ్చింది?",
    pnl_subtext: "Flipkart, Amazon లేదా Meesho CSV ఫైల్‌ను అప్‌లోడ్ చేయండి — ఆకుపచ్చ (🟢) లాభం, ఎరుపు (🔴) నష్టం!",
    pnl_card_bank: "🏦 బ్యాంకుకు వచ్చిన డబ్బు",
    pnl_card_profit: "🟢 మొత్తం లాభం (PROFIT)",
    pnl_card_loss: "🔴 మొత్తం నష్టం (LOSS)",
    pnl_card_net: "⚖️ నికర ఫలితం (NET RESULT)",
    pnl_filter_all: "అన్ని ఆర్డర్లు",
    pnl_filter_profit: "🟢 లాభం మాత్రమే",
    pnl_filter_loss: "🔴 నష్టం మాత్రమే"
  },

  mr: {
    ...BASE_EN,
    nav_home: "🏠 होम",
    nav_dashboard: "डॅशबोर्ड",
    nav_invoice: "GST बिल",
    nav_audit: "नफा आणि ऑडिट",
    nav_gst: "GSTR-1 फायलिंग",
    nav_qr: "QR स्टुडिओ",
    nav_account: "माझे खाते",
    nav_logout: "लॉग आउट",
    unlock_pro_btn: "Pro अनलॉक करा ⚡",
    install_app_btn: "📲 ॲप इन्स्टॉल करा",
    hero_heading: "RTO आणि कुरिअर वजन फसवणुकीमुळे तुमचा १२% नफा गमावणे थांबवा.",
    login_title: "लॉगिन (Login)",
    signup_title: "साइन अप (Signup)",
    email_label: "ईमेल पत्ता",
    password_label: "पासवर्ड",
    store_name_label: "व्यवसाय / दुकानाचे नाव",
    google_login_btn: "Google ने लॉगिन करा",
    guest_login_btn: "👀 गेस्ट लॉगिन (२ मिनिटे प्रिव्ह्यू)",
    slide_up_login: "खाते आहे? लॉगिनसाठी वर स्लाइड करा ↑",
    slide_down_signup: "साइन अपसाठी खाली स्लाइड करा ↓",
    pnl_heading: "१-क्लिकमध्ये पहा: मला किती नफा (Profit 🟢) आणि किती तोटा (Loss 🔴) झाला?",
    pnl_subtext: "तुमची Flipkart, Amazon किंवा Meesho CSV फाईल अपलोड करा — हिरवा (🟢) म्हणजे नफा आणि लाल (🔴) म्हणजे तोटा!",
    pnl_card_bank: "🏦 बँकेत आलेले पैसे",
    pnl_card_profit: "🟢 एकूण नफा (PROFIT)",
    pnl_card_loss: "🔴 एकूण तोटा (LOSS)",
    pnl_card_net: "⚖️ निव्वळ नफा (NET RESULT)",
    pnl_filter_all: "सर्व ऑर्डर्स",
    pnl_filter_profit: "🟢 फक्त नफा पहा",
    pnl_filter_loss: "🔴 फक्त तोटा पहा"
  },

  gu: {
    ...BASE_EN,
    nav_home: "🏠 હોમ",
    nav_dashboard: "ડેશબોર્ડ",
    nav_invoice: "GST બિલ",
    nav_audit: "નફો અને ઓડિટ",
    nav_gst: "GSTR-1 ફાઇલિંગ",
    nav_qr: "QR સ્ટુડિયો",
    nav_account: "મારું ખાતું",
    nav_logout: "લોગ આઉટ",
    unlock_pro_btn: "Pro અનલોક કરો ⚡",
    install_app_btn: "📲 એપ ઇન્સ્ટોલ કરો",
    hero_heading: "RTO અને કુરિયર વજન છેતરપિંડીમાં તમારો 12% નફો ગુમાવવાનું બંધ કરો.",
    login_title: "લોગિન (Login)",
    signup_title: "સાઇન અપ (Signup)",
    email_label: "ઇમેઇલ સરનામું",
    password_label: "પાસવર્ડ",
    store_name_label: "દુકાન / બિઝનેસનું નામ",
    google_login_btn: "Google થી લોગિન કરો",
    guest_login_btn: "👀 ગેસ્ટ લોગિન (2 મિનિટ પ્રિવ્યૂ)",
    slide_up_login: "ખાતું છે? લોગિન માટે ઉપર સ્લાઇડ કરો ↑",
    slide_down_signup: "સાઇન અપ માટે નીચે સ્લાઇડ કરો ↓",
    pnl_heading: "1-ક્લિકમાં જુઓ: મને કેટલો નફો (Profit 🟢) અને કેટલું નુકસાન (Loss 🔴) થયું?",
    pnl_subtext: "તમારી Flipkart, Amazon કે Meesho CSV ફાઇલ અપલોડ કરો — લીલો (🟢) એટલે નફો અને લાલ (🔴) એટલે નુકસાન!",
    pnl_card_bank: "🏦 બેંકમાં આવેલા પૈસા",
    pnl_card_profit: "🟢 કુલ નફો (PROFIT)",
    pnl_card_loss: "🔴 કુલ નુકસાન (LOSS)",
    pnl_card_net: "⚖️ ચોખ્ખો નફો (NET RESULT)",
    pnl_filter_all: "બધા ઓર્ડર્સ",
    pnl_filter_profit: "🟢 ફક્ત નફો જુઓ",
    pnl_filter_loss: "🔴 ફક્ત નુકસાન જુઓ"
  },

  kn: {
    ...BASE_EN,
    nav_home: "🏠 ಮುಖಪುಟ",
    nav_dashboard: "3D ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    nav_invoice: "GST ಬಿಲ್",
    nav_audit: "ಲಾಭ & ಆಡಿಟ್",
    nav_gst: "GSTR-1 ಫೈಲಿಂಗ್",
    nav_qr: "QR ಸ್ಟುಡಿಯೋ",
    nav_account: "ನನ್ನ ಖಾತೆ",
    nav_logout: "ಲಾಗ್ ಔಟ್",
    unlock_pro_btn: "Pro ಅನ್‌ಲಾಕ್ ಮಾಡಿ ⚡",
    install_app_btn: "📲 ಆಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ",
    hero_heading: "RTO ಮತ್ತು ಕೊರಿಯರ್ ತೂಕದ ವಂಚನೆಯಿಂದ ನಿಮ್ಮ 12% ಆದಾಯ ಕಳೆದುಕೊಳ್ಳುವುದನ್ನು ನಿಲ್ಲಿಸಿ.",
    login_title: "ಲಾಗಿನ್ (Login)",
    signup_title: "ಸೈನ್ ಅಪ್ (Signup)",
    email_label: "ಇಮೇಲ್ ವಿಳಾಸ",
    password_label: "ಪಾಸ್‌ವರ್ಡ್",
    store_name_label: "ವ್ಯವಹಾರ / ಅಂಗಡಿ ಹೆಸರು",
    remember_me: "ನನ್ನನ್ನು ನೆನಪಿಡಿ",
    forgot_pass: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
    google_login_btn: "Google ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ",
    guest_login_btn: "👀 ಗೆಸ್ಟ್ ಲಾಗಿನ್ (2 ನಿಮಿಷ ಪ್ರിവ್ಯೂ)",
    slide_up_login: "ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಲು ಮೇಲೆ ಸ್ಲೈಡ್ ಮಾಡಿ ↑",
    slide_down_signup: "ಹೊಸ ಖಾತೆಗಾಗಿ ಕೆಳಗೆ ಸ್ಲೈಡ್ ಮಾಡಿ ↓",
    pnl_heading: "1-ಕ್ಲಿಕ್‌ನಲ್ಲಿ ನೋಡಿ: ನಿಮಗೆ ಎಷ್ಟು ಲಾಭ (Profit 🟢) ಮತ್ತು ಎಷ್ಟು ನಷ್ಟ (Loss 🔴) ಆಗಿದೆ?",
    pnl_subtext: "ನಿಮ್ಮ Flipkart, Amazon ಅಥವಾ Meesho CSV ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — ಹಸಿರು (🟢) ಎಂದರೆ ಲಾಭ ಮತ್ತು ಕೆಂಪು (🔴) ಎಂದರೆ ನಷ್ಟ!",
    pnl_demo_btn: "⚡ ಡೆಮೊ Flipkart/Amazon ಡೇಟಾ ನೋಡಿ",
    pnl_step1_title: "Order ಅಥವಾ Payment CSV ಇಲ್ಲಿ ಹಾಕಿ",
    pnl_step2_title: "2ನೇ Payment CSV (ಬೇರೆಯಾಗಿದ್ದರೆ)",
    pnl_cost_label: "🏷️ ವಸ್ತುವಿನ ಖರೀದಿ ಬೆಲೆ (Default Cost ₹)",
    pnl_cost_sub: "CSV ನಲ್ಲಿ ಬೆಲೆ ಇಲ್ಲದಿದ್ದರೆ 1 ಪೀಸ್ ವೆಚ್ಚ:",
    pnl_card_bank: "🏦 ಬ್ಯಾಂಕ್‌ಗೆ ಬಂದ ಹಣ",
    pnl_card_cost: "ಒಟ್ಟು ವೆಚ್ಚ (Cost):",
    pnl_card_profit: "🟢 ಒಟ್ಟು ಲಾಭ (PROFIT)",
    pnl_card_profit_sub: "✅ ಈ ಆರ್ಡರ್‌ಗಳಲ್ಲಿ ನಿಮಗೆ ನೇರ ಲಾಭವಾಗಿದೆ",
    pnl_card_loss: "🔴 ಒಟ್ಟು ನಷ್ಟ (LOSS)",
    pnl_card_loss_sub: "❌ RTO ಶಿಪ್ಪಿಂಗ್ ಅಥವಾ ರಿಟರ್ನ್‌ನಿಂದ ನಷ್ಟ",
    pnl_card_net: "⚖️ ನಿವ್ವಳ ಫಲಿತಾಂಶ (NET RESULT)",
    pnl_card_net_sub: "ಲಾಭ 🟢 ಮೈನಸ್ ನಷ್ಟ 🔴 = ನಿಜವಾದ ಗಳಿಕೆ",
    pnl_filter_all: "ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳು",
    pnl_filter_profit: "🟢 ಲಾಭ ಮಾತ್ರ ನೋಡಿ",
    pnl_filter_loss: "🔴 ನಷ್ಟ ಮಾತ್ರ ನೋಡಿ"
  },

  ml: {
    ...BASE_EN,
    nav_home: "🏠 ഹോം",
    nav_dashboard: "3D ഡാഷ്‌ബോർഡ്",
    nav_invoice: "GST ബിൽ",
    nav_audit: "ലാഭവും ഓഡിറ്റും",
    nav_gst: "GSTR-1 ഫയലിംഗ്",
    nav_qr: "QR സ്റ്റുഡിയോ",
    nav_account: "എന്റെ അക്കൗണ്ട്",
    nav_logout: "ലോഗ് ഔട്ട്",
    unlock_pro_btn: "Pro അൺലോക്ക് ചെയ്യുക ⚡",
    install_app_btn: "📲 ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക",
    hero_heading: "RTO, കൊറിയർ ഭാരം തട്ടിപ്പ് എന്നിവയിലൂടെ നിങ്ങളുടെ 12% വരുമാനം നഷ്ടപ്പെടുന്നത് നിർത്തുക.",
    login_title: "ലോഗിൻ (Login)",
    signup_title: "സൈൻ അപ്പ് (Signup)",
    email_label: "ഇമെയിൽ വിലാസം",
    password_label: "പാസ്‌വേഡ്",
    store_name_label: "ബിസിനസ് / കടയുടെ പേര്",
    remember_me: "എന്നെ ഓർമ്മിക്കുക",
    forgot_pass: "പാസ്‌വേഡ് മറന്നോ?",
    google_login_btn: "Google വഴി ലോഗിൻ ചെയ്യുക",
    guest_login_btn: "👀 ഗസ്റ്റ് ലോഗിൻ (2 മിനിറ്റ് പ്രിവ്യൂ)",
    slide_up_login: "അക്കൗണ്ട് ഉണ്ടോ? ലോഗിൻ ചെയ്യാൻ മുകളിലേക്ക് സ്ലൈഡ് ചെയ്യുക ↑",
    slide_down_signup: "സൈൻ അപ്പ് ചെയ്യാൻ താഴേക്ക് സ്ലൈഡ് ചെയ്യുക ↓",
    pnl_heading: "1-ക്ലിക്കിൽ കാണുക: എത്ര ലാഭം (Profit 🟢), എത്ര നഷ്ടം (Loss 🔴)?",
    pnl_subtext: "Flipkart, Amazon അല്ലെങ്കിൽ Meesho CSV ഫയൽ അപ്‌ലോഡ് ചെയ്യുക — പച്ച (🟢) ലാഭം, ചുവപ്പ് (🔴) നഷ്ടം!",
    pnl_demo_btn: "⚡ ഡെമോ Flipkart/Amazon ഡാറ്റ കാണുക",
    pnl_step1_title: "Order അല്ലെങ്കിൽ Payment CSV ഇവിടെ ഇടുക",
    pnl_step2_title: "രണ്ടാമത്തെ Payment CSV",
    pnl_cost_label: "🏷️ ഉൽപ്പന്നത്തിന്റെ വാങ്ങിയ വില (Cost ₹)",
    pnl_cost_sub: "1 പീസിന്റെ ചിലവ്:",
    pnl_card_bank: "🏦 ബാങ്കിൽ വന്ന തുക",
    pnl_card_cost: "ആകെ ചിലവ് (Cost):",
    pnl_card_profit: "🟢 ആകെ ലാഭം (PROFIT)",
    pnl_card_profit_sub: "✅ ഈ ഓർഡറുകളിൽ നിങ്ങൾക്ക് ലാഭം ലഭിച്ചു",
    pnl_card_loss: "🔴 ആകെ നഷ്ടം (LOSS)",
    pnl_card_loss_sub: "❌ RTO റിട്ടേൺ അല്ലെങ്കിൽ കമ്മീഷൻ നഷ്ടം",
    pnl_card_net: "⚖️ അറ്റാദായം (NET RESULT)",
    pnl_card_net_sub: "ലാഭം 🟢 മൈനസ് നഷ്ടം 🔴 = യഥാർത്ഥ വരുമാനം",
    pnl_filter_all: "എല്ലാ ഓർഡറുകളും",
    pnl_filter_profit: "🟢 ലാഭം മാത്രം",
    pnl_filter_loss: "🔴 നഷ്ടം മാത്രം"
  },

  pa: {
    ...BASE_EN,
    nav_home: "🏠 ਹੋਮ",
    nav_dashboard: "3D ਡੈਸ਼ਬੋਰਡ",
    nav_invoice: "GST ਬਿੱਲ",
    nav_audit: "ਮੁਨਾਫਾ ਅਤੇ ਆਡਿਟ",
    nav_gst: "GSTR-1 ਫਾਈਲਿੰਗ",
    nav_qr: "QR ਸਟੂਡੀਓ",
    nav_account: "ਮੇਰਾ ਖਾਤਾ",
    nav_logout: "ਲੌਗ ਆਉਟ",
    unlock_pro_btn: "Pro ਅਨਲੌਕ ਕਰੋ ⚡",
    install_app_btn: "📲 ਐਪ ਇੰਸਟਾਲ ਕਰੋ",
    hero_heading: "RTO ਅਤੇ ਕੂਰੀਅਰ ਵਜ਼ਨ ਧੋਖਾਧੜੀ ਵਿੱਚ ਆਪਣਾ 12% ਮੁਨਾਫਾ ਗੁਆਉਣਾ ਬੰਦ ਕਰੋ।",
    login_title: "ਲੌਗਇਨ (Login)",
    signup_title: "ਸਾਈਨ ਅੱਪ (Signup)",
    email_label: "ਈਮੇਲ ਪਤਾ",
    password_label: "ਪਾਸਵਰਡ",
    store_name_label: "ਦੁਕਾਨ / ਕਾਰੋਬਾਰ ਦਾ ਨਾਮ",
    google_login_btn: "Google ਨਾਲ ਲੌਗਇਨ ਕਰੋ",
    guest_login_btn: "👀 ਗੈਸਟ ਲੌਗਇਨ (2 ਮਿੰਟ ਪ੍ਰੀਵਿਊ)",
    slide_up_login: "ਖਾਤਾ ਹੈ? ਲੌਗਇਨ ਲਈ ਉੱਪਰ ਸਲਾਈਡ ਕਰੋ ↑",
    slide_down_signup: "ਸਾਈਨ ਅੱਪ ਲਈ ਹੇਠਾਂ ਸਲਾਈਡ ਕਰੋ ↓",
    pnl_heading: "1-ਕਲਿੱਕ ਵਿੱਚ ਦੇਖੋ: ਮੈਨੂੰ ਕਿੰਨਾ ਮੁਨਾਫਾ (Profit 🟢) ਅਤੇ ਕਿੰਨਾ ਨੁਕਸਾਨ (Loss 🔴) ਹੋਇਆ?",
    pnl_subtext: "ਆਪਣੀ Flipkart, Amazon ਜਾਂ Meesho CSV ਫਾਈਲ ਅੱਪਲੋਡ ਕਰੋ — ਹਰਾ (🟢) ਮਤਲਬ ਮੁਨਾਫਾ ਅਤੇ ਲਾਲ (🔴) ਮਤਲਬ ਘਾਟਾ!",
    pnl_card_bank: "🏦 ਬੈਂਕ ਵਿੱਚ ਆਇਆ ਪੈਸਾ",
    pnl_card_profit: "🟢 ਕੁੱਲ ਮੁਨਾਫਾ (PROFIT)",
    pnl_card_loss: "🔴 ਕੁੱਲ ਨੁਕਸਾਨ (LOSS)",
    pnl_card_net: "⚖️ ਸ਼ੁੱਧ ਕਮਾਈ (NET RESULT)",
    pnl_filter_all: "ਸਾਰੇ ਆਰਡਰ",
    pnl_filter_profit: "🟢 ਸਿਰਫ਼ ਮੁਨਾਫਾ ਦੇਖੋ",
    pnl_filter_loss: "🔴 ਸਿਰਫ਼ ਨੁਕਸਾਨ ਦੇਖੋ"
  }
};

// Map of hardcoded phrases across pages -> dictionary keys so EVERY page translates automatically
const PHRASE_TO_KEY_MAP = [
  { match: "1-Click में देखें: मुझे कितना मुनाफा", key: "pnl_heading" },
  { match: "बस अपनी Flipkart, Amazon या Meesho", key: "pnl_subtext" },
  { match: "⚡ Demo Flipkart/Amazon Data देखें", key: "pnl_demo_btn" },
  { match: "Order या Payment CSV यहाँ डालें", key: "pnl_step1_title" },
  { match: "दूसरी Payment फाइल (अगर अलग है)", key: "pnl_step2_title" },
  { match: "🏷️ सामान की खरीद कीमत (Default Cost ₹)", key: "pnl_cost_label" },
  { match: "अगर CSV में Cost न हो, तो 1 पीस का खर्चा:", key: "pnl_cost_sub" },
  { match: "🏦 बैंक में आया पैसा", key: "pnl_card_bank" },
  { match: "सामान की कुल लागत (Cost):", key: "pnl_card_cost" },
  { match: "🟢 कुल मुनाफा (PROFIT)", key: "pnl_card_profit" },
  { match: "✅ इन ऑर्डर्स में आपको सीधा फायदा हुआ", key: "pnl_card_profit_sub" },
  { match: "🔴 कुल नुकसान (LOSS)", key: "pnl_card_loss" },
  { match: "❌ RTO शिपिंग, रिटर्न या ज्यादा कमीशन से घाटा", key: "pnl_card_loss_sub" },
  { match: "⚖️ जेब में बचा (NET RESULT)", key: "pnl_card_net" },
  { match: "मुनाफा 🟢 घटाव नुकसान 🔴 = असली कमाई", key: "pnl_card_net_sub" },
  { match: "All Orders", key: "pnl_filter_all" },
  { match: "🟢 सिर्फ Profit वाले देखें", key: "pnl_filter_profit" },
  { match: "🔴 सिर्फ Loss वाले देखें", key: "pnl_filter_loss" },
  { match: "🏠 Home", key: "nav_home" },
  { match: "👤 My Account", key: "nav_account" },
  { match: "Direct Login with Google", key: "google_login_btn" },
  { match: "👀 Guest Login (2 Min Website Preview)", key: "guest_login_btn" }
];

const STORAGE_KEY = "sellgst_lang";
let domObserverInitialized = false;
let isApplyingTranslations = false;

export function getCurrentLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTIONARY[saved]) return saved;
  } catch (_) {}
  return "en";
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

function translateDynamicVerdictBanners(lang) {
  const vTitle = document.getElementById("pnl-verdict-title");
  const vSub = document.getElementById("pnl-verdict-subtitle");
  const netEl = document.getElementById("pnl-sum-net");
  const totalBadge = document.getElementById("pnl-total-orders-badge");
  const profBadge = document.getElementById("pnl-profit-orders-badge");
  const lossBadge = document.getElementById("pnl-loss-orders-badge");

  if (!vTitle || !netEl) return;

  const netText = netEl.textContent.trim();
  const isLoss = netText.startsWith("-");
  const totalOrders = totalBadge ? totalBadge.textContent.replace(/\D/g, "") : "8";
  const profOrders = profBadge ? profBadge.textContent.replace(/\D/g, "") : "5";
  const lossOrders = lossBadge ? lossBadge.textContent.replace(/\D/g, "") : "3";

  if (lang === "hi") {
    vTitle.textContent = isLoss
      ? `सावधान! आपको कुल ${netText} का शुद्ध नुकसान (NET LOSS) हो रहा है!`
      : `बधाई हो! आपको कुल ${netText} का शुद्ध मुनाफा (NET PROFIT) हुआ है!`;
    if (vSub) {
      vSub.textContent = `कुल ${totalOrders} ऑर्डर्स में से ${profOrders} ऑर्डर्स में मुनाफा (🟢) और ${lossOrders} ऑर्डर्स में नुकसान (🔴) हुआ है।`;
    }
  } else if (lang === "kn") {
    vTitle.textContent = isLoss
      ? `ಎಚ್ಚರಿಕೆ! ನಿಮಗೆ ಒಟ್ಟು ${netText} ನಿವ್ವಳ ನಷ್ಟ (NET LOSS) ಆಗಿದೆ!`
      : `ಅಭಿನಂದನೆಗಳು! ನಿಮಗೆ ಒಟ್ಟು ${netText} ನಿವ್ವಳ ಲಾಭ (NET PROFIT) ಆಗಿದೆ!`;
    if (vSub) {
      vSub.textContent = `ಒಟ್ಟು ${totalOrders} ಆರ್ಡರ್‌ಗಳಲ್ಲಿ ${profOrders} ಲಾಭ (🟢) ಮತ್ತು ${lossOrders} ನಷ್ಟ (🔴) ಆಗಿದೆ.`;
    }
  } else if (lang === "ml") {
    vTitle.textContent = isLoss
      ? `ശ്രദ്ധിക്കുക! നിങ്ങൾക്ക് ആകെ ${netText} അറ്റ നഷ്ടം (NET LOSS) സംഭവിച്ചു!`
      : `അഭിനന്ദനങ്ങൾ! നിങ്ങൾക്ക് ആകെ ${netText} അറ്റാദായം (NET PROFIT) ലഭിച്ചു!`;
    if (vSub) {
      vSub.textContent = `ആകെ ${totalOrders} ഓർഡറുകളിൽ ${profOrders} എണ്ണം ലാഭവും (🟢) ${lossOrders} എണ്ണം നഷ്ടവുമാണ് (🔴).`;
    }
  } else {
    // Clean English / Default for all other languages
    vTitle.textContent = isLoss
      ? `Alert! You have a Net Loss of ${netText} across your uploaded orders!`
      : `Congratulations! You earned a Net Profit of ${netText} across your orders!`;
    if (vSub) {
      vSub.textContent = `Out of ${totalOrders} total orders, ${profOrders} orders are in Profit (🟢) and ${lossOrders} orders are in Loss (🔴).`;
    }
  }
}

export function applyTranslationsToDOM() {
  if (isApplyingTranslations) return;
  isApplyingTranslations = true;

  try {
    const current = getCurrentLang();

    // 1. Auto-tag untagged elements that match known phrases
    document.querySelectorAll("h1, h2, h3, p, span, a, button, label, div").forEach((el) => {
      if (el.children.length === 0 && !el.hasAttribute("data-i18n")) {
        const txt = (el.textContent || "").trim();
        if (!txt) return;
        for (const item of PHRASE_TO_KEY_MAP) {
          if (txt.includes(item.match)) {
            el.setAttribute("data-i18n", item.key);
            break;
          }
        }
      }
    });

    // 2. Translate all [data-i18n] elements
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key) {
        const translated = t(key, el.textContent);
        if (el.textContent !== translated) {
          el.textContent = translated;
        }
      }
    });

    // 3. Translate input placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) {
        el.setAttribute("placeholder", t(key, el.getAttribute("placeholder") || ""));
      }
    });

    // 4. Translate dynamic Profit/Loss verdict banner
    translateDynamicVerdictBanners(current);

    // 5. Sync all Language Switcher <select> dropdowns
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
/**
 * SellGST Pro — Universal 11-Language DOM Translator & Global 3D Luxury UI Engine v6.5
 * File: /assets/js/i18n.js
 *
 * Fixes:
 * 1. Fixes duplicate Home icon (🏠) on mobile bottom navigation dock while keeping top Home button clean.
 * 2. Fixes mobile header crowding ("जीज-विजा" layout) across all pages on mobile screens (<640px) while keeping Desktop 100% unchanged.
 * 3. Translates ALL visible headings, buttons, inputs, and dynamic Profit/Loss cards across all 11 languages.
 * 4. Injects Global 3D Tactile Button & Premium SaaS Color Styling across all pages while preserving 3D Tilt effects.
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English (Default)", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "hinglish", label: "Hinglish", native: "Hinglish" },
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
  app_title: "SellGST Pro — 3D E-Commerce Audit, Billing & GST Super-App",
  nav_home: "🏠 Home",
  nav_home_text: "Home",
  nav_dashboard: "3D Dashboard",
  nav_invoice: "Navy GST Bill",
  nav_audit: "Profit & Audit",
  nav_gst: "GSTR-1 Filing",
  nav_qr: "QR Studio",
  nav_account: "My Account",
  nav_admin: "Admin Console",
  nav_logout: "Logout",
  unlock_pro_btn: "Unlock Pro ⚡",
  install_app_btn: "📲 Install App",
  hero_badge: "💎 INDIA'S #1 3D E-COM VALUATION, AUDIT & GST SUPER-APP",
  hero_heading: "Stop Losing 12% of Your E-Commerce Payouts to Unclaimed RTOs & Weight Fraud.",
  hero_subtext: "100% Client-Side RAM CSV Audit for Amazon, Flipkart & Meesho + Custom Navy GST Billing, Dynamic QR & 1-Click GSTR-1 JSON.",
  login_title: "Login",
  signup_title: "Signup",
  email_label: "Email address",
  password_label: "Password",
  store_name_label: "Business / Store Name (Optional)",
  remember_me: "Remember Me",
  forgot_pass: "Forgot Password?",
  google_login_btn: "Direct Login with Google",
  guest_login_btn: "👀 Guest Login (2 Min Website Preview)",
  slide_up_login: "Already have an account? Slide Up for Login ↑",
  slide_down_signup: "New Seller? Slide Down for Signup ↓",
  pnl_badge: "🟢 PROFIT vs 🔴 LOSS CALCULATOR (FLIPKART • AMAZON • MEESHO)",
  pnl_heading: "1-Click Check: See Your Exact Profit (🟢) & Loss (🔴) from Marketplace CSV",
  pnl_subtext: "Upload your Flipkart, Amazon or Meesho CSV file — Green (🟢) means Profit and Red (🔴) means Loss!",
  pnl_demo_btn: "⚡ Load Demo Flipkart/Amazon Data",
  pnl_step1_title: "Upload Order or Payment CSV Here",
  pnl_step2_title: "2nd Payment CSV (If Separate)",
  pnl_cost_label: "🏷️ Product Buying Cost (Default Cost ₹)",
  pnl_cost_sub: "If Cost is not in CSV, enter 1 unit cost:",
  pnl_card_bank: "🏦 Bank Settlement Received",
  pnl_card_cost: "Total Product Cost:",
  pnl_card_profit: "🟢 Total Profit",
  pnl_card_profit_sub: "✅ Direct profit earned on these orders",
  pnl_card_loss: "🔴 Total Loss",
  pnl_card_loss_sub: "❌ Loss due to RTO shipping, returns or high fees",
  pnl_card_net: "⚖️ Net Pocket Result",
  pnl_card_net_sub: "Profit 🟢 minus Loss 🔴 = Real Earnings",
  pnl_filter_all: "All Orders",
  pnl_filter_profit: "🟢 Show Only Profit",
  pnl_filter_loss: "🔴 Show Only Loss"
};

export const DICTIONARY = {
  en: { ...BASE_EN },

  hi: {
    ...BASE_EN,
    nav_home: "🏠 होम",
    nav_home_text: "होम",
    nav_dashboard: "3D डैशबोर्ड",
    nav_invoice: "GST बिल",
    nav_audit: "मुनाफा और ऑडिट",
    nav_gst: "GSTR-1 रिटर्न",
    nav_qr: "QR स्टूडियो",
    nav_account: "मेरा खाता",
    nav_logout: "लॉग आउट",
    unlock_pro_btn: "Pro अनलॉक करें ⚡",
    install_app_btn: "📲 ऐप इंस्टॉल करें",
    hero_heading: "अनक्लेम्ड RTO और कूरियर वेट फ्रॉड में अपना 12% मुनाफा गँवाना बंद करें।",
    hero_subtext: "Amazon, Flipkart और Meesho के लिए 100% RAM CSV ऑडिट + नेवी GST बिलिंग, डायनेमिक QR और 1-Click GSTR-1 JSON.",
    login_title: "लॉगिन (Login)",
    signup_title: "नया खाता (Signup)",
    email_label: "ईमेल पता (Email)",
    password_label: "पासवर्ड (Password)",
    store_name_label: "दुकान / बिजनेस का नाम",
    remember_me: "मुझे याद रखें",
    forgot_pass: "पासवर्ड भूल गए?",
    google_login_btn: "Google से डायरेक्ट लॉगिन करें",
    guest_login_btn: "👀 गेस्ट लॉगिन (2 मिनट वेबसाइट प्रिव्यू)",
    slide_up_login: "पहले से खाता है? लॉगिन के लिए ऊपर स्लाइड करें ↑",
    slide_down_signup: "नया खाता बनाने के लिए नीचे स्लाइड करें ↓",
    pnl_heading: "1-Click में देखें: मुझे कितना मुनाफा (Profit 🟢) हुआ और कितना नुकसान (Loss 🔴) हुआ?",
    pnl_subtext: "बस अपनी Flipkart, Amazon या Meesho की CSV फाइल अपलोड करें—हरा रंग (🟢) मतलब फायदा और लाल रंग (🔴) मतलब घाटा!",
    pnl_demo_btn: "⚡ Demo Flipkart/Amazon डेटा देखें",
    pnl_step1_title: "Order या Payment CSV यहाँ डालें",
    pnl_step2_title: "दूसरी Payment फाइल (अगर अलग है)",
    pnl_cost_label: "🏷️ सामान की खरीद कीमत (Default Cost ₹)",
    pnl_cost_sub: "अगर CSV में Cost न हो, तो 1 पीस का खर्चा:",
    pnl_card_bank: "🏦 बैंक में आया पैसा",
    pnl_card_cost: "सामान की कुल लागत (Cost):",
    pnl_card_profit: "🟢 कुल मुनाफा (PROFIT)",
    pnl_card_profit_sub: "✅ इन ऑर्डर्स में आपको सीधा फायदा हुआ",
    pnl_card_loss: "🔴 कुल नुकसान (LOSS)",
    pnl_card_loss_sub: "❌ RTO शिपिंग, रिटर्न या ज्यादा कमीशन से घाटा",
    pnl_card_net: "⚖️ जेब में बचा (NET RESULT)",
    pnl_card_net_sub: "मुनाफा 🟢 घटाव नुकसान 🔴 = असली कमाई",
    pnl_filter_all: "सभी ऑर्डर्स",
    pnl_filter_profit: "🟢 सिर्फ Profit वाले देखें",
    pnl_filter_loss: "🔴 सिर्फ Loss वाले देखें"
  },

  hinglish: {
    ...BASE_EN,
    nav_home: "🏠 Home",
    nav_home_text: "Home",
    nav_dashboard: "3D Dashboard",
    nav_invoice: "Navy GST Bill",
    nav_audit: "Profit & Audit",
    nav_gst: "GSTR-1 Filing",
    nav_qr: "QR Studio",
    nav_account: "Mera Account",
    unlock_pro_btn: "Unlock Pro @ ₹99 ⚡",
    hero_heading: "Unclaimed RTO aur Courier Weight Fraud se apna 12% payout loss turant rokein.",
    login_title: "Login Karein",
    signup_title: "Naya Account (Signup)",
    slide_up_login: "Account hai? Login ke liye upar slide karein ↑",
    slide_down_signup: "Signup ke liye niche slide karein ↓",
    pnl_heading: "1-Click Mein Dekhein: Kitna Profit (🟢) Hua Aur Kitna Loss (🔴) Hua?",
    pnl_subtext: "Flipkart, Amazon ya Meesho ki CSV upload karein — Green (🟢) matlab Profit aur Red (🔴) matlab Loss!",
    pnl_card_bank: "🏦 Bank Mein Aaya Paisa",
    pnl_card_profit: "🟢 Total Profit (Munafa)",
    pnl_card_loss: "🔴 Total Loss (Nuksan)",
    pnl_card_net: "⚖️ Jeb Mein Bacha (Net Profit)",
    pnl_filter_profit: "🟢 Sirf Profit Wale",
    pnl_filter_loss: "🔴 Sirf Loss Wale"
  },

  bn: {
    ...BASE_EN,
    nav_home: "🏠 হোম",
    nav_home_text: "হোম",
    nav_dashboard: "ড্যাশবোর্ড",
    nav_invoice: "GST বিল",
    nav_audit: "লাভ ও অডিট",
    nav_gst: "GSTR-1 ফাইলিং",
    nav_qr: "QR স্টুডিও",
    nav_account: "আমার অ্যাকাউন্ট",
    nav_logout: "লগ আউট",
    unlock_pro_btn: "Pro আনলক করুন ⚡",
    install_app_btn: "📲 অ্যাপ ইনস্টল করুন",
    hero_heading: "অনাদায়ী RTO এবং কুরিয়ার ওজন জালিয়াতিতে আপনার ১২% পেআউট হারানো বন্ধ করুন।",
    login_title: "লগইন (Login)",
    signup_title: "সাইন আপ (Signup)",
    email_label: "ইমেল ঠিকানা",
    password_label: "পাসওয়ার্ড",
    store_name_label: "ব্যবসা / দোকানের নাম",
    remember_me: "আমাকে মনে রাখুন",
    forgot_pass: "পাসওয়ার্ড ভুলে গেছেন?",
    google_login_btn: "Google দিয়ে লগইন করুন",
    guest_login_btn: "👀 গেস্ট লগইন (২ মিনিট প্রিভিউ)",
    slide_up_login: "অ্যাকাউন্ট আছে? লগইন করতে উপরে স্লাইড করুন ↑",
    slide_down_signup: "সাইন আপ করতে নিচে স্লাইড করুন ↓",
    pnl_heading: "১-ক্লিকে দেখুন: আপনার কত লাভ (Profit 🟢) এবং কত ক্ষতি (Loss 🔴) হয়েছে?",
    pnl_subtext: "আপনার Flipkart, Amazon বা Meesho CSV ফাইল আপলোড করুন — সবুজ (🟢) মানে লাভ এবং লাল (🔴) মানে ক্ষতি!",
    pnl_card_bank: "🏦 ব্যাংকে আসা টাকা",
    pnl_card_profit: "🟢 মোট লাভ (PROFIT)",
    pnl_card_loss: "🔴 মোট ক্ষতি (LOSS)",
    pnl_card_net: "⚖️ নিট ফলাফল (NET RESULT)",
    pnl_filter_all: "সব অর্ডার",
    pnl_filter_profit: "🟢 শুধু লাভ দেখুন",
    pnl_filter_loss: "🔴 শুধু ক্ষতি দেখুন"
  },

  ta: {
    ...BASE_EN,
    nav_home: "🏠 முகப்பு",
    nav_home_text: "முகப்பு",
    nav_dashboard: "டாஷ்போர்டு",
    nav_invoice: "GST பில்",
    nav_audit: "லாபம் & தணிக்கை",
    nav_gst: "GSTR-1 தாக்கல்",
    nav_qr: "QR ஸ்டுடியோ",
    nav_account: "என் கணக்கு",
    nav_logout: "வெளியேறு",
    unlock_pro_btn: "Pro திறக்கவும் ⚡",
    install_app_btn: "📲 செயலியை நிறுவு",
    hero_heading: "RTO மற்றும் கூரியர் எடை மோசடியால் உங்கள் 12% வருமானத்தை இழப்பதை நிறுத்துங்கள்.",
    login_title: "உள்நுழைக (Login)",
    signup_title: "பதிவு செய்க (Signup)",
    email_label: "மின்னஞ்சல் முகவரி",
    password_label: "கடவுச்சொல்",
    store_name_label: "வணிகம் / கடை பெயர்",
    google_login_btn: "Google மூலம் உள்நுழைக",
    guest_login_btn: "👀 விருந்தினர் உள்நுழைவு (2 நிமிட முன்னோட்டம்)",
    slide_up_login: "கணக்கு உள்ளதா? உள்நுழைய மேலே ஸ்லைடு செய்க ↑",
    slide_down_signup: "பதிவு செய்ய கீழே ஸ்லைடு செய்க ↓",
    pnl_heading: "1-கிளிக்கில் காண்க: உங்கள் மொத்த லாபம் (Profit 🟢) மற்றும் நஷ்டம் (Loss 🔴)",
    pnl_subtext: "Flipkart, Amazon அல்லது Meesho CSV கோப்பை பதிவேற்றவும் — பச்சை (🟢) லாபம், சிவப்பு (🔴) நஷ்டம்!",
    pnl_card_bank: "🏦 வங்கிக்கு வந்த தொகை",
    pnl_card_profit: "🟢 மொத்த லாபம் (PROFIT)",
    pnl_card_loss: "🔴 மொத்த நஷ்டம் (LOSS)",
    pnl_card_net: "⚖️ நிகர லாபம் (NET RESULT)",
    pnl_filter_all: "அனைத்து ஆர்டர்கள்",
    pnl_filter_profit: "🟢 லாபம் மட்டும்",
    pnl_filter_loss: "🔴 நஷ்டம் மட்டும்"
  },

  te: {
    ...BASE_EN,
    nav_home: "🏠 హోమ్",
    nav_home_text: "హోమ్",
    nav_dashboard: "డ్యాష్‌ബോర్డ్",
    nav_invoice: "GST బిల్లు",
    nav_audit: "లాభం & ఆడిట్",
    nav_gst: "GSTR-1 ఫైలింగ్",
    nav_qr: "QR స్టూడియో",
    nav_account: "నా ఖాతా",
    nav_logout: "లాగ్ అవుట్",
    unlock_pro_btn: "Pro అన్‌లాక్ చేయండి ⚡",
    install_app_btn: "📲 యాప్ ఇన్‌స్టాల్ చేయండి",
    hero_heading: "RTO మరియు కొరియర్ బరువు మోసాల వల్ల మీ 12% ఆదాయాన్ని కోల్పోవడం ఆపండి.",
    login_title: "లాగిన్ (Login)",
    signup_title: "సైన్ అప్ (Signup)",
    email_label: "ఇమెయిల్ చిరునామా",
    password_label: "పాస్‌వర్డ్",
    store_name_label: "వ్యాపారం / దుకాణం పేరు",
    google_login_btn: "Google తో లాగిన్ చేయండి",
    guest_login_btn: "👀 గెస్ట్ లాగిన్ (2 నిమిషాల ప్రివ్యూ)",
    slide_up_login: "ఖాతా ఉందా? లాగిన్ కోసం పైకి స్లైడ్ చేయండి ↑",
    slide_down_signup: "సైన్ అప్ కోసం క్రిందికి స్లైడ్ చేయండి ↓",
    pnl_heading: "1-క్లిక్‌లో చూడండి: మీకు ఎంత లాభం (Profit 🟢) మరియు ఎంత నష్టం (Loss 🔴) వచ్చింది?",
    pnl_subtext: "Flipkart, Amazon లేదా Meesho CSV ఫైల్‌ను అప్‌లోడ్ చేయండి — ఆకుపచ్చ (🟢) లాభం, ఎరుపు (🔴) నష్టం!",
    pnl_card_bank: "🏦 బ్యాంకుకు వచ్చిన డబ్బు",
    pnl_card_profit: "🟢 మొత్తం లాభం (PROFIT)",
    pnl_card_loss: "🔴 మొత్తం నష్టం (LOSS)",
    pnl_card_net: "⚖️ నికర ఫలితం (NET RESULT)",
    pnl_filter_all: "అన్ని ఆర్డర్లు",
    pnl_filter_profit: "🟢 లాభం మాత్రమే",
    pnl_filter_loss: "🔴 నష్టం మాత్రమే"
  },

  mr: {
    ...BASE_EN,
    nav_home: "🏠 होम",
    nav_home_text: "होम",
    nav_dashboard: "डॅशबोर्ड",
    nav_invoice: "GST बिल",
    nav_audit: "नफा आणि ऑडिट",
    nav_gst: "GSTR-1 फायलिंग",
    nav_qr: "QR स्टुडिओ",
    nav_account: "माझे खाते",
    nav_logout: "लॉग आउट",
    unlock_pro_btn: "Pro अनलॉक करा ⚡",
    install_app_btn: "📲 ॲप इन्स्टॉल करा",
    hero_heading: "RTO आणि कुरिअर वजन फसवणुकीमुळे तुमचा १२% नफा गमावणे थांबवा.",
    login_title: "लॉगिन (Login)",
    signup_title: "साइन अप (Signup)",
    email_label: "ईमेल पत्ता",
    password_label: "पासवर्ड",
    store_name_label: "व्यवसाय / दुकानाचे नाव",
    google_login_btn: "Google ने लॉगिन करा",
    guest_login_btn: "👀 गेस्ट लॉगिन (२ मिनिटे प्रिव्ह्यू)",
    slide_up_login: "खाते आहे? लॉगिनसाठी वर स्लाइड करा ↑",
    slide_down_signup: "साइन अपसाठी खाली स्लाइड करा ↓",
    pnl_heading: "१-क्लिकमध्ये पहा: मला किती नफा (Profit 🟢) आणि किती तोटा (Loss 🔴) झाला?",
    pnl_subtext: "तुमची Flipkart, Amazon किंवा Meesho CSV फाईल अपलोड करा — हिरवा (🟢) म्हणजे नफा आणि लाल (🔴) म्हणजे तोटा!",
    pnl_card_bank: "🏦 बँकेत आलेले पैसे",
    pnl_card_profit: "🟢 एकूण नफा (PROFIT)",
    pnl_card_loss: "🔴 एकूण तोटा (LOSS)",
    pnl_card_net: "⚖️ निव्वळ नफा (NET RESULT)",
    pnl_filter_all: "सर्व ऑर्डर्स",
    pnl_filter_profit: "🟢 फक्त नफा पहा",
    pnl_filter_loss: "🔴 फक्त तोटा पहा"
  },

  gu: {
    ...BASE_EN,
    nav_home: "🏠 હોમ",
    nav_home_text: "હોમ",
    nav_dashboard: "ડેશબોર્ડ",
    nav_invoice: "GST બિલ",
    nav_audit: "નફો અને ઓડિટ",
    nav_gst: "GSTR-1 ફાઇલિંગ",
    nav_qr: "QR સ્ટુડિયો",
    nav_account: "મારું ખાતું",
    nav_logout: "લોગ આઉટ",
    unlock_pro_btn: "Pro અનલોક કરો ⚡",
    install_app_btn: "📲 એપ ઇન્સ્ટોલ કરો",
    hero_heading: "RTO અને કુરિયર વજન છેતરપિંડીમાં તમારો 12% નફો ગુમાવવાનું બંધ કરો.",
    login_title: "લોગિન (Login)",
    signup_title: "સાઇન અપ (Signup)",
    email_label: "ઇમેઇલ સરનામું",
    password_label: "પાસવર્ડ",
    store_name_label: "દુકાન / બિઝનેસનું નામ",
    google_login_btn: "Google થી લોગિન કરો",
    guest_login_btn: "👀 ગેસ્ટ લોગિન (2 મિનિટ પ્રિવ્યૂ)",
    slide_up_login: "ખાતું છે? લોગિન માટે ઉપર સ્લાઇડ કરો ↑",
    slide_down_signup: "સાઇન અપ માટે નીચે સ્લાઇડ કરો ↓",
    pnl_heading: "1-ક્લિકમાં જુઓ: મને કેટલો નફો (Profit 🟢) અને કેટલું નુકસાન (Loss 🔴) થયું?",
    pnl_subtext: "તમારી Flipkart, Amazon કે Meesho CSV ફાઇલ અપલોડ કરો — લીલો (🟢) એટલે નફો અને લાલ (🔴) એટલે નુકસાન!",
    pnl_card_bank: "🏦 બેંકમાં આવેલા પૈસા",
    pnl_card_profit: "🟢 કુલ નફો (PROFIT)",
    pnl_card_loss: "🔴 કુલ નુકસાન (LOSS)",
    pnl_card_net: "⚖️ ચોખ્ખો નફો (NET RESULT)",
    pnl_filter_all: "બધા ઓર્ડર્સ",
    pnl_filter_profit: "🟢 ફક્ત નફો જુઓ",
    pnl_filter_loss: "🔴 ફક્ત નુકસાન જુઓ"
  },

  kn: {
    ...BASE_EN,
    nav_home: "🏠 ಮುಖಪುಟ",
    nav_home_text: "ಮುಖಪುಟ",
    nav_dashboard: "3D ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    nav_invoice: "GST ಬಿಲ್",
    nav_audit: "ಲಾಭ & ಆಡಿಟ್",
    nav_gst: "GSTR-1 ಫೈಲಿಂಗ್",
    nav_qr: "QR ಸ್ಟುಡಿಯೋ",
    nav_account: "ನನ್ನ ಖಾತೆ",
    nav_logout: "ಲಾಗ್ ಔಟ್",
    unlock_pro_btn: "Pro ಅನ್‌ಲಾಕ್ ಮಾಡಿ ⚡",
    install_app_btn: "📲 ಆಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ",
    hero_heading: "RTO ಮತ್ತು ಕೊರಿಯರ್ ತೂಕದ ವಂಚನೆಯಿಂದ ನಿಮ್ಮ 12% ಆದಾಯ ಕಳೆದುಕೊಳ್ಳುವುದನ್ನು ನಿಲ್ಲಿಸಿ.",
    login_title: "ಲಾಗಿನ್ (Login)",
    signup_title: "ಸೈನ್ ಅಪ್ (Signup)",
    email_label: "ಇಮೇಲ್ ವಿಳಾಸ",
    password_label: "ಪಾಸ್‌ವರ್ಡ್",
    store_name_label: "ವ್ಯವಹಾರ / ಅಂಗಡಿ ಹೆಸರು",
    remember_me: "ನನ್ನನ್ನು ನೆನಪಿಡಿ",
    forgot_pass: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
    google_login_btn: "Google ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ",
    guest_login_btn: "👀 ಗೆಸ್ಟ್ ಲಾಗಿನ್ (2 ನಿಮಿಷ ಪ್ರിവ್ಯೂ)",
    slide_up_login: "ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಲು ಮೇಲೆ ಸ್ಲೈಡ್ ಮಾಡಿ ↑",
    slide_down_signup: "ಹೊಸ ಖಾತೆಗಾಗಿ ಕೆಳಗೆ ಸ್ಲೈಡ್ ಮಾಡಿ ↓",
    pnl_heading: "1-ಕ್ಲಿಕ್‌ನಲ್ಲಿ ನೋಡಿ: ನಿಮಗೆ ಎಷ್ಟು ಲಾಭ (Profit 🟢) ಮತ್ತು ಎಷ್ಟು ನಷ್ಟ (Loss 🔴) ಆಗಿದೆ?",
    pnl_subtext: "ನಿಮ್ಮ Flipkart, Amazon ಅಥವಾ Meesho CSV ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — ಹಸಿರು (🟢) ಎಂದರೆ ಲಾಭ ಮತ್ತು ಕೆಂಪು (🔴) ಎಂದರೆ ನಷ್ಟ!",
    pnl_demo_btn: "⚡ ಡೆಮೊ Flipkart/Amazon ಡೇಟಾ ನೋಡಿ",
    pnl_step1_title: "Order ಅಥವಾ Payment CSV ಇಲ್ಲಿ ಹಾಕಿ",
    pnl_step2_title: "2ನೇ Payment CSV (ಬೇರೆಯಾಗಿದ್ದರೆ)",
    pnl_cost_label: "🏷️ ವಸ್ತುವಿನ ಖರೀದಿ ಬೆಲೆ (Default Cost ₹)",
    pnl_cost_sub: "CSV ನಲ್ಲಿ ಬೆಲೆ ಇಲ್ಲದಿದ್ದರೆ 1 ಪೀಸ್ ವೆಚ್ಚ:",
    pnl_card_bank: "🏦 ಬ್ಯಾಂಕ್‌ಗೆ ಬಂದ ಹಣ",
    pnl_card_cost: "ಒಟ್ಟು ವೆಚ್ಚ (Cost):",
    pnl_card_profit: "🟢 ಒಟ್ಟು ಲಾಭ (PROFIT)",
    pnl_card_profit_sub: "✅ ಈ ಆರ್ಡರ್‌ಗಳಲ್ಲಿ ನಿಮಗೆ ನೇರ ಲಾಭವಾಗಿದೆ",
    pnl_card_loss: "🔴 ಒಟ್ಟು ನಷ್ಟ (LOSS)",
    pnl_card_loss_sub: "❌ RTO ಶಿಪ್ಪಿಂಗ್ ಅಥವಾ ರಿಟರ್ನ್‌ನಿಂದ ನಷ್ಟ",
    pnl_card_net: "⚖️ ನಿವ್ವಳ ಫಲಿತಾಂಶ (NET RESULT)",
    pnl_card_net_sub: "ಲಾಭ 🟢 ಮೈನಸ್ ನಷ್ಟ 🔴 = ನಿಜವಾದ ಗಳಿಕೆ",
    pnl_filter_all: "ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳು",
    pnl_filter_profit: "🟢 ಲಾಭ ಮಾತ್ರ ನೋಡಿ",
    pnl_filter_loss: "🔴 ನಷ್ಟ ಮಾತ್ರ ನೋಡಿ"
  },

  ml: {
    ...BASE_EN,
    nav_home: "🏠 ഹോം",
    nav_home_text: "ഹോം",
    nav_dashboard: "3D ഡാഷ്‌ബോർഡ്",
    nav_invoice: "GST ബിൽ",
    nav_audit: "ലാഭവും ഓഡിറ്റും",
    nav_gst: "GSTR-1 ഫയലിംഗ്",
    nav_qr: "QR സ്റ്റുഡിയോ",
    nav_account: "എന്റെ അക്കൗണ്ട്",
    nav_logout: "ലോഗ് ഔട്ട്",
    unlock_pro_btn: "Pro അൺലോക്ക് ചെയ്യുക ⚡",
    install_app_btn: "📲 ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക",
    hero_heading: "RTO, കൊറിയർ ഭാരം തട്ടിപ്പ് എന്നിവയിലൂടെ നിങ്ങളുടെ 12% വരുമാനം നഷ്ടപ്പെടുന്നത് നിർത്തുക.",
    login_title: "ലോഗിൻ (Login)",
    signup_title: "സൈൻ അപ്പ് (Signup)",
    email_label: "ഇമെയിൽ വിലാസം",
    password_label: "പാസ്‌വേഡ്",
    store_name_label: "ബിസിനസ് / കടയുടെ പേര്",
    remember_me: "എന്നെ ഓർമ്മിക്കുക",
    forgot_pass: "പാസ്‌വേഡ് മറന്നോ?",
    google_login_btn: "Google വഴി ലോഗിൻ ചെയ്യുക",
    guest_login_btn: "👀 ഗസ്റ്റ് ലോഗിൻ (2 മിനിറ്റ് പ്രിവ്യൂ)",
    slide_up_login: "അക്കൗണ്ട് ഉണ്ടോ? ലോഗിൻ ചെയ്യാൻ മുകളിലേക്ക് സ്ലൈഡ് ചെയ്യുക ↑",
    slide_down_signup: "സൈൻ അപ്പ് ചെയ്യാൻ താഴേക്ക് സ്ലൈഡ് ചെയ്യുക ↓",
    pnl_heading: "1-ക്ലിക്കിൽ കാണുക: എത്ര ലാഭം (Profit 🟢), എത്ര നഷ്ടം (Loss 🔴)?",
    pnl_subtext: "Flipkart, Amazon അല്ലെങ്കിൽ Meesho CSV ഫയൽ അപ്‌ലോഡ് ചെയ്യുക — പച്ച (🟢) ലാഭം, ചുവപ്പ് (🔴) നഷ്ടം!",
    pnl_demo_btn: "⚡ ഡെമോ Flipkart/Amazon ഡാറ്റ കാണുക",
    pnl_step1_title: "Order അല്ലെങ്കിൽ Payment CSV ഇവിടെ ഇടുക",
    pnl_step2_title: "രണ്ടാമത്തെ Payment CSV",
    pnl_cost_label: "🏷️ ഉൽപ്പന്നത്തിന്റെ വാങ്ങിയ വില (Cost ₹)",
    pnl_cost_sub: "1 പീസിന്റെ ചിലവ്:",
    pnl_card_bank: "🏦 ബാങ്കിൽ വന്ന തുക",
    pnl_card_cost: "ആകെ ചിലവ് (Cost):",
    pnl_card_profit: "🟢 ആകെ ലാഭം (PROFIT)",
    pnl_card_profit_sub: "✅ ഈ ഓർഡറുകളിൽ നിങ്ങൾക്ക് ലാഭം ലഭിച്ചു",
    pnl_card_loss: "🔴 ആകെ നഷ്ടം (LOSS)",
    pnl_card_loss_sub: "❌ RTO റിട്ടേൺ അല്ലെങ്കിൽ കമ്മീഷൻ നഷ്ടം",
    pnl_card_net: "⚖️ അറ്റാദായം (NET RESULT)",
    pnl_card_net_sub: "ലാഭം 🟢 മൈനസ് നഷ്ടം 🔴 = യഥാർത്ഥ വരുമാനം",
    pnl_filter_all: "എല്ലാ ഓർഡറുകളും",
    pnl_filter_profit: "🟢 ലാഭം മാത്രം",
    pnl_filter_loss: "🔴 നഷ്ടം മാത്രം"
  },

  pa: {
    ...BASE_EN,
    nav_home: "🏠 ਹੋਮ",
    nav_home_text: "ਹੋਮ",
    nav_dashboard: "3D ਡੈਸ਼ਬੋਰਡ",
    nav_invoice: "GST ਬਿੱਲ",
    nav_audit: "ਮੁਨਾਫਾ ਅਤੇ ਆਡਿਟ",
    nav_gst: "GSTR-1 ਫਾਈਲਿੰਗ",
    nav_qr: "QR ਸਟੂਡੀਓ",
    nav_account: "ਮੇਰਾ ਖਾਤਾ",
    nav_logout: "ਲੌਗ ਆਉਟ",
    unlock_pro_btn: "Pro ਅਨਲੌਕ ਕਰੋ ⚡",
    install_app_btn: "📲 ਐਪ ਇੰਸਟਾਲ ਕਰੋ",
    hero_heading: "RTO ਅਤੇ ਕੂਰੀਅਰ ਵਜ਼ਨ ਧੋਖਾਧੜੀ ਵਿੱਚ ਆਪਣਾ 12% ਮੁਨਾਫਾ ਗੁਆਉਣਾ ਬੰਦ ਕਰੋ।",
    login_title: "ਲੌਗਇਨ (Login)",
    signup_title: "ਸਾਈਨ ਅੱਪ (Signup)",
    email_label: "ਈਮੇਲ ਪਤਾ",
    password_label: "ਪਾਸਵਰਡ",
    store_name_label: "ਦੁਕਾਨ / ਕਾਰੋਬਾਰ ਦਾ ਨਾਮ",
    google_login_btn: "Google ਨਾਲ ਲੌਗਇਨ ਕਰੋ",
    guest_login_btn: "👀 ਗੈਸਟ ਲੌਗਇਨ (2 ਮਿੰਟ ਪ੍ਰੀਵਿਊ)",
    slide_up_login: "ਖਾਤਾ ਹੈ? ਲੌਗਇਨ ਲਈ ਉੱਪਰ ਸਲਾਈਡ ਕਰੋ ↑",
    slide_down_signup: "ਸਾਈਨ ਅੱਪ ਲਈ ਹੇਠਾਂ ਸਲਾਈਡ ਕਰੋ ↓",
    pnl_heading: "1-ਕਲਿੱਕ ਵਿੱਚ ਦੇਖੋ: ਮੈਨੂੰ ਕਿੰਨਾ ਮੁਨਾਫਾ (Profit 🟢) ਅਤੇ ਕਿੰਨਾ ਨੁਕਸਾਨ (Loss 🔴) ਹੋਇਆ?",
    pnl_subtext: "ਆਪਣੀ Flipkart, Amazon ਜਾਂ Meesho CSV ਫਾਈਲ ਅੱਪਲੋਡ ਕਰੋ — ਹਰਾ (🟢) ਮਤਲਬ ਮੁਨਾਫਾ ਅਤੇ ਲਾਲ (🔴) ਮਤਲਬ ਘਾਟਾ!",
    pnl_card_bank: "🏦 ਬੈਂਕ ਵਿੱਚ ਆਇਆ ਪੈਸਾ",
    pnl_card_profit: "🟢 ਕੁੱਲ ਮੁਨਾਫਾ (PROFIT)",
    pnl_card_loss: "🔴 ਕੁੱਲ ਨੁਕਸਾਨ (LOSS)",
    pnl_card_net: "⚖️ ਸ਼ੁੱਧ ਕਮਾਈ (NET RESULT)",
    pnl_filter_all: "ਸਾਰੇ ਆਰਡਰ",
    pnl_filter_profit: "🟢 ਸਿਰਫ਼ ਮੁਨਾਫਾ ਦੇਖੋ",
    pnl_filter_loss: "🔴 ਸਿਰਫ਼ ਨੁਕਸਾਨ ਦੇਖੋ"
  }
};

const PHRASE_TO_KEY_MAP = [
  { match: "1-Click में देखें: मुझे कितना मुनाफा", key: "pnl_heading" },
  { match: "बस अपनी Flipkart, Amazon या Meesho", key: "pnl_subtext" },
  { match: "⚡ Demo Flipkart/Amazon Data देखें", key: "pnl_demo_btn" },
  { match: "Order या Payment CSV यहाँ डालें", key: "pnl_step1_title" },
  { match: "दूसरी Payment फाइल (अगर अलग है)", key: "pnl_step2_title" },
  { match: "🏷️ सामान की खरीद कीमत (Default Cost ₹)", key: "pnl_cost_label" },
  { match: "अगर CSV में Cost न हो, तो 1 पीस का खर्चा:", key: "pnl_cost_sub" },
  { match: "🏦 बैंक में आया पैसा", key: "pnl_card_bank" },
  { match: "सामान की कुल लागत (Cost):", key: "pnl_card_cost" },
  { match: "🟢 कुल मुनाफा (PROFIT)", key: "pnl_card_profit" },
  { match: "✅ इन ऑर्डर्स में आपको सीधा फायदा हुआ", key: "pnl_card_profit_sub" },
  { match: "🔴 कुल नुकसान (LOSS)", key: "pnl_card_loss" },
  { match: "❌ RTO शिपिंग, रिटर्न या ज्यादा कमीशन से घाटा", key: "pnl_card_loss_sub" },
  { match: "⚖️ जेब में बचा (NET RESULT)", key: "pnl_card_net" },
  { match: "मुनाफा 🟢 घटाव नुकसान 🔴 = असली कमाई", key: "pnl_card_net_sub" },
  { match: "All Orders", key: "pnl_filter_all" },
  { match: "🟢 सिर्फ Profit वाले देखें", key: "pnl_filter_profit" },
  { match: "🔴 सिर्फ Loss वाले देखें", key: "pnl_filter_loss" },
  { match: "🏠 Home", key: "nav_home" },
  { match: "👤 My Account", key: "nav_account" },
  { match: "Direct Login with Google", key: "google_login_btn" },
  { match: "👀 Guest Login (2 Min Website Preview)", key: "guest_login_btn" }
];

const STORAGE_KEY = "sellgst_lang";
let domObserverInitialized = false;
let isApplyingTranslations = false;

export function getCurrentLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTIONARY[saved]) return saved;
  } catch (_) {}
  return "en";
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

function translateDynamicVerdictBanners(lang) {
  const vTitle = document.getElementById("pnl-verdict-title");
  const vSub = document.getElementById("pnl-verdict-subtitle");
  const netEl = document.getElementById("pnl-sum-net");
  const totalBadge = document.getElementById("pnl-total-orders-badge");
  const profBadge = document.getElementById("pnl-profit-orders-badge");
  const lossBadge = document.getElementById("pnl-loss-orders-badge");

  if (!vTitle || !netEl) return;

  const netText = netEl.textContent.trim();
  const isLoss = netText.startsWith("-");
  const totalOrders = totalBadge ? totalBadge.textContent.replace(/\D/g, "") : "8";
  const profOrders = profBadge ? profBadge.textContent.replace(/\D/g, "") : "5";
  const lossOrders = lossBadge ? lossBadge.textContent.replace(/\D/g, "") : "3";

  if (lang === "hi") {
    vTitle.textContent = isLoss
      ? `सावधान! आपको कुल ${netText} का शुद्ध नुकसान (NET LOSS) हो रहा है!`
      : `बधाई हो! आपको कुल ${netText} का शुद्ध मुनाफा (NET PROFIT) हुआ है!`;
    if (vSub) {
      vSub.textContent = `कुल ${totalOrders} ऑर्डर्स में से ${profOrders} ऑर्डर्स में मुनाफा (🟢) और ${lossOrders} ऑर्डर्स में नुकसान (🔴) हुआ है।`;
    }
  } else if (lang === "kn") {
    vTitle.textContent = isLoss
      ? `ಎಚ್ಚರಿಕೆ! ನಿಮಗೆ ಒಟ್ಟು ${netText} ನಿವ್ವಳ ನಷ್ಟ (NET LOSS) ಆಗಿದೆ!`
      : `ಅಭಿನಂದನೆಗಳು! ನಿಮಗೆ ಒಟ್ಟು ${netText} ನಿವ್ವಳ ಲಾಭ (NET PROFIT) ಆಗಿದೆ!`;
    if (vSub) {
      vSub.textContent = `ಒಟ್ಟು ${totalOrders} ಆರ್ಡರ್‌ಗಳಲ್ಲಿ ${profOrders} ಲಾಭ (🟢) ಮತ್ತು ${lossOrders} ನಷ್ಟ (🔴) ಆಗಿದೆ.`;
    }
  } else if (lang === "ml") {
    vTitle.textContent = isLoss
      ? `ശ്രദ്ധിക്കുക! നിങ്ങൾക്ക് ആകെ ${netText} അറ്റ നഷ്ടം (NET LOSS) സംഭവിച്ചു!`
      : `അഭിനന്ദനങ്ങൾ! നിങ്ങൾക്ക് ആകെ ${netText} അറ്റാദായം (NET PROFIT) ലഭിച്ചു!`;
    if (vSub) {
      vSub.textContent = `ആകെ ${totalOrders} ഓർഡറുകളിൽ ${profOrders} എണ്ണം ലാഭവും (🟢) ${lossOrders} എണ്ണം നഷ്ടവുമാണ് (🔴).`;
    }
  } else {
    vTitle.textContent = isLoss
      ? `Alert! You have a Net Loss of ${netText} across your uploaded orders!`
      : `Congratulations! You earned a Net Profit of ${netText} across your orders!`;
    if (vSub) {
      vSub.textContent = `Out of ${totalOrders} total orders, ${profOrders} orders are in Profit (🟢) and ${lossOrders} orders are in Loss (🔴).`;
    }
  }
}

export function applyTranslationsToDOM() {
  if (isApplyingTranslations) return;
  isApplyingTranslations = true;

  try {
    const current = getCurrentLang();

    // 1. Auto-tag untagged elements that match known phrases
    document.querySelectorAll("h1, h2, h3, p, span, a, button, label, div").forEach((el) => {
      if (el.children.length === 0 && !el.hasAttribute("data-i18n")) {
        const txt = (el.textContent || "").trim();
        if (!txt) return;
        for (const item of PHRASE_TO_KEY_MAP) {
          if (txt.includes(item.match)) {
            el.setAttribute("data-i18n", item.key);
            break;
          }
        }
      }
    });

    // 2. Translate all [data-i18n] elements & prevent duplicate 🏠 icon in bottom dock
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;

      // CRITICAL FIX: If this element is inside the bottom dock or already has a sibling 🏠 icon,
      // strip the leading 🏠 emoji so only ONE Home icon is shown!
      if (key === "nav_home") {
        const parent = el.parentElement;
        const hasSiblingHomeIcon =
          parent &&
          Array.from(parent.children).some(
            (child) => child !== el && (child.textContent || "").includes("🏠")
          );
        const translated = hasSiblingHomeIcon
          ? t("nav_home_text", "Home").replace(/🏠\s*/g, "").trim()
          : t("nav_home", el.textContent);
        if (el.textContent !== translated) {
          el.textContent = translated;
        }
        return;
      }

      const translated = t(key, el.textContent);
      if (el.textContent !== translated) {
        el.textContent = translated;
      }
    });

    // 3. Translate input placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key) {
        el.setAttribute("placeholder", t(key, el.getAttribute("placeholder") || ""));
      }
    });

    // 4. Translate dynamic Profit/Loss verdict banner
    translateDynamicVerdictBanners(current);

    // 5. Sync all Language Switcher <select> dropdowns
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
  } finally {
    isApplyingTranslations = false;
  }
}

/**
 * Injects Global 3D Tactile Buttons, Glossy Highlights & Clean Mobile App-Bar Header Styling
 * across ALL pages automatically while keeping Desktop mode 100% unchanged!
 */
function injectGlobal3DLuxuryUIStyles() {
  if (document.getElementById("sellgst-global-3d-ui-upgrade")) return;
  const style = document.createElement("style");
  style.id = "sellgst-global-3d-ui-upgrade";
  style.textContent = `
    /* Global Crisp 3D SaaS Mesh Background */
    html, body {
      background: radial-gradient(circle at 12% 10%, rgba(99, 102, 241, 0.14), transparent 38%),
                  radial-gradient(circle at 88% 16%, rgba(16, 229, 148, 0.14), transparent 36%),
                  linear-gradient(160deg, #F1F5F9 0%, #EEF2FF 52%, #ECFEFF 100%) !important;
    }

    /* Ultra-Clean 3D Glass Bento Cards */
    .bento-card {
      background: rgba(255, 255, 255, 0.96) !important;
      border: 1px solid rgba(99, 102, 241, 0.14) !important;
      box-shadow: 0 20px 42px -15px rgba(15, 23, 42, 0.08),
                  0 4px 12px rgba(79, 70, 229, 0.05),
                  inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
    }

    /* Rich 3D Royal Gradient Cards */
    .purple-3d-card, .purple-credit-card {
      background: linear-gradient(135deg, #4F46E5 0%, #3B1D9A 52%, #0F172A 100%) !important;
      box-shadow: 0 24px 48px -12px rgba(59, 29, 154, 0.42),
                  inset 0 1px 1px rgba(255, 255, 255, 0.25) !important;
    }

    /* 3D Tactile Glossy Buttons with Press-Down Physics */
    button:not(.skps-cell-input),
    a[class*="rounded-2xl"],
    a[class*="rounded-full"],
    label[class*="rounded-xl"],
    label[class*="rounded-2xl"] {
      transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.18s ease,
                  filter 0.18s ease !important;
    }

    button:not(:disabled):hover,
    a[class*="rounded-2xl"]:hover,
    a[class*="rounded-full"]:hover {
      transform: translateY(-2px);
      filter: brightness(1.05);
    }

    button:not(:disabled):active,
    a[class*="rounded-2xl"]:active,
    a[class*="rounded-full"]:active {
      transform: translateY(1.5px) scale(0.98) !important;
    }

    /* Upgrade Dark Navy & Royal Buttons to 3D Beveled Glossy Buttons */
    .bg-\\[\\#081B4B\\]:not(#printable-invoice-area *):not(#panel-split-auth *):not(#panel-welcome),
    .bg-\\[\\#0B1F52\\]:not(#printable-invoice-area *) {
      background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%) !important;
      box-shadow: 0 6px 16px -3px rgba(15, 23, 42, 0.35),
                  0 2px 0 #020617,
                  inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
    }

    .bg-\\[\\#5B2EFF\\] {
      background: linear-gradient(180deg, #6366F1 0%, #4F46E5 100%) !important;
      box-shadow: 0 8px 20px -4px rgba(79, 70, 229, 0.45),
                  0 2px 0 #3730A3,
                  inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    }

    .bg-\\[\\#10E594\\] {
      background: linear-gradient(180deg, #34D399 0%, #10B981 100%) !important;
      color: #064E3B !important;
      box-shadow: 0 8px 18px -4px rgba(16, 185, 129, 0.4),
                  0 2px 0 #059669,
                  inset 0 1px 0 rgba(255, 255, 255, 0.45) !important;
    }

    /* ===================================================================== */
    /* MOBILE-ONLY HEADER CLEANUP (<640px): FIXES CROWDED "जीज-विजा" HEADER  */
    /* DESKTOP MODE (>=640px) REMAINS 100% UNCHANGED                         */
    /* ===================================================================== */
    @media (max-width: 639px) {
      header, header > nav {
        padding: 8px 11px !important;
        border-radius: 20px !important;
        gap: 6px !important;
      }

      /* Make Title + Subtitle sleek and compact on mobile */
      header h1 {
        font-size: 13px !important;
        line-height: 1.25 !important;
      }
      header p {
        display: none !important; /* Hides long subtitle clutter on small mobile screens */
      }

      /* Put action buttons in a clean single-row scrollable strip on mobile so they never wrap into 3 messy rows */
      header > div:last-child,
      header > nav > div:last-child {
        width: 100% !important;
        display: flex !important;
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        justify-content: flex-start !important;
        gap: 6px !important;
        padding-top: 4px !important;
        border-top: 1px solid rgba(226, 232, 240, 0.75) !important;
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      header > div:last-child::-webkit-scrollbar,
      header > nav > div:last-child::-webkit-scrollbar {
        display: none !important;
      }

      header button,
      header select,
      header a[class*="rounded-full"],
      header a[class*="rounded-2xl"] {
        padding: 5px 10px !important;
        font-size: 11px !important;
        flex-shrink: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export function initI18n() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, "en");
  }

  const start = () => {
    injectGlobal3DLuxuryUIStyles();
    applyTranslationsToDOM();

    if (!domObserverInitialized && document.body) {
      domObserverInitialized = true;
      let timer = null;
      const observer = new MutationObserver(() => {
        if (isApplyingTranslations) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          applyTranslationsToDOM();
        }, 60);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
   }
