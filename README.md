# 🚀 SellGST Pro — E-Commerce Audit, Billing & GST Compliance Super-App

**SellGST Pro** is a 100% production-ready, zero-error, hack-proof Multi-Page Progressive Web App (PWA) built specifically for Indian e-commerce sellers, Amazon/Flipkart/Meesho merchants, and MSMEs.

---

## 🛠️ Complete 12-File Repository Architecture

```text
├── vercel.json                 # Security headers, CSP & serverless routing
├── firestore.rules             # Zero-trust security rules (Strict RBAC)
├── manifest.json               # PWA configuration
├── sw.js                       # Service worker for offline caching
├── README.md                   # Step-by-step deployment guide
├── api/
│   └── ai-assistant.js         # Secure serverless Gemini AI support proxy
├── assets/
│   └── js/
│       ├── security-core.js    # Firebase init, XSS sanitizer, history API, UPI engine & AI chat
│       └── i18n.js             # 11-Language localization dictionary (Default: English)
├── index.html                  # Bento landing page, multi-method auth & calculator
├── app.html                    # Main Bento dashboard (6 KPIs, Spline chart, 3D card)
├── invoice.html                # GST billing, auto CGST/SGST vs IGST split & UPI QR on bill
├── ecom-audit.html             # PapaParse CSV scanner for RTO >30d & 4x6 label cropper
├── gst-filing.html             # Official gst.gov.in GSTR-1 JSON v3.1.6 generator & GSTR-3B assistant
└── admin.html                  # Master admin console with live UPI payment approval queue
