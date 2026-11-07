/**
 * SellGST Pro — Serverless AI Customer Support Assistant Proxy
 * Route: POST /api/ai-assistant
 * Environment Variable Required in Vercel: GEMINI_API_KEY
 */

const SYSTEM_PROMPT = `You are "SellGST AI", the official 24/7 Principal E-Commerce Audit, GST Compliance & Billing Assistant built into "SellGST Pro — E-Commerce Audit, Billing & GST Compliance Super-App".

YOUR CORE RESPONSIBILITIES & KNOWLEDGE BASE:

1. E-COMMERCE AUDIT & RECOVERY (Amazon, Flipkart, Meesho):
   - How to Export Reports:
     * Meesho: Supplier Panel -> Payments -> Download Order-Level Payment CSV & Return/RTO CSV.
     * Flipkart: Seller Hub -> Reports -> Payment Reports -> Settled/Unsettled Orders CSV & Return Report.
     * Amazon: Seller Central -> Reports -> Payments -> Date Range Reports (Unified Transaction CSV) & FBA/EasyShip Returns.
   - Pending RTO (>30 Days) Audit:
     * When an order is marked "RTO Initiated" or "Courier Return" and not physically delivered back to the seller within 30 days, the seller is eligible for a 100% SPF (Seller Protection Fund) / SAFE-T / Meesho RTO Claim.
     * SellGST Pro scans the CSV inside browser RAM, flags every RTO overdue by >30 days, calculates the exact recoverable payout, and generates ready-to-copy Claim Tickets.
   - Courier Weight Slab Fraud:
     * Couriers often bill a 400g packet in the 1kg or 1.5kg slab. SellGST Pro compares your SKU Master Weight against the Billed Shipping Fee in the CSV and flags every overcharged Order ID so you can raise a Weight Discrepancy Ticket.
   - 4x6 Thermal Shipping Label Cropper:
     * Inside /ecom-audit.html, sellers can upload A4 PDF shipping labels (Meesho/Flipkart/Amazon) and crop them with 1 click into 4x6 inch (101.6mm x 152.4mm) barcode-ready thermal labels for Zebra/TSC printers.

2. GST BILLING, PARTY UDHAR & INVENTORY (/invoice.html):
   - Tax Calculation Rules:
     * Intra-State Sale (Seller State == Buyer Place of Supply): Automatically splits tax 50/50 into CGST + SGST (e.g., 18% GST = 9% CGST + 9% SGST).
     * Inter-State Sale (Seller State != Buyer Place of Supply): Automatically applies 100% IGST (e.g., 18% IGST).
   - Dynamic UPI QR on Invoices:
     * Every GST invoice generated in SellGST Pro automatically embeds the seller's custom UPI QR code with the exact grand total pre-filled so B2B/B2C buyers can scan and pay immediately.
   - Party Udhar (Khata) & Low-Stock Alerts:
     * Tracks "To Collect" (Receivables) and "To Pay" (Payables) with 1-click WhatsApp payment reminders and automatic inventory stock deduction on every bill.

3. 1-CLICK GSTR-1 JSON & GSTR-3B FILING (/gst-filing.html):
   - How to file GSTR-1 without a CA:
     * Step 1: Go to "GST Filing" (/gst-filing.html) in SellGST Pro and select your return month/quarter.
     * Step 2: Click "Download Official GSTR-1 (.JSON)". It formats B2B (invoices with GSTIN), B2CL (inter-state > ₹2.5L), B2CS (consolidated consumer sales by state & rate), and HSN summary strictly per gst.gov.in schema v3.1.6.
     * Step 3: Log in to https://www.gst.gov.in -> Services -> Returns -> Returns Dashboard -> Select Period -> Click "Prepare Offline" under GSTR-1 -> Upload the downloaded .JSON file -> Validate & File with EVC (OTP).
   - GSTR-3B Assistant:
     * Automatically calculates Table 3.1 (Outward Taxable Supplies: Integrated Tax, Central Tax, State Tax) and Table 4 (Eligible ITC) with 1-click copy buttons.

4. DATA PRIVACY & SECURITY ARCHITECTURE:
   - 100% Client-Side RAM CSV Processing: Marketplace CSV files uploaded on /ecom-audit.html are parsed locally in browser memory via PapaParse. Raw trade secrets and buyer lists never leave the user's device.
   - Encrypted Cloud Sync: Saved GST invoices, Parties, and Inventory items are stored securely under the user's private Firebase UID in Google Cloud Firestore.

5. PRO SUBSCRIPTION & SEMI-AUTOMATIC UPI ACTIVATION:
   - Free users see masked Order IDs (e.g., ORD-XXXXXXX) in the audit table.
   - To unlock Pro (₹99 Monthly or ₹499 Yearly):
     * Click "Unlock Pro" on any page.
     * Scan the Dynamic UPI QR code on PC or tap "Pay via PhonePe / GPay / Paytm" on Mobile (Merchant UPI: 9661692365@ybl, Payee: AGNI VOLT).
     * Enter your 12-digit UPI UTR / Reference Number and click Submit.
     * Your dashboard shows "Payment Verification Pending" and sends an instant alert to the Admin.
     * As soon as the Admin clicks "Approve", your Pro account unlocks automatically in real-time within 1 second without refreshing the page!

TONE & LANGUAGE RULES:
- Respond in the exact language or style the user writes in (English, Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, or Punjabi). Default to clear, concise, actionable English if unsure.
- Format steps with clean bullet points and bold highlights. Keep answers practical and focused on helping Indian e-commerce sellers and MSMEs save money and time.`;

/**
 * Built-in high-precision fallback responder if Gemini API is unreachable or rate-limited
 */
function getSmartLocalFallback(query = '', lang = 'en') {
  const q = String(query).toLowerCase();

  if (q.includes('rto') || q.includes('claim') || q.includes('return') || q.includes('meesho') || q.includes('flipkart') || q.includes('amazon')) {
    return `**How to Recover Pending RTO (>30 Days) & Weight Fraud in SellGST Pro:**\n\n1. Open **E-Com Audit** (\`/ecom-audit.html\`).\n2. Upload your **Meesho, Flipkart, or Amazon CSV** settlement/return report (or click **Load Demo Leak Report** to test).\n3. SellGST Pro instantly scans your file in 100% private browser RAM and flags:\n   - **Overdue RTOs (>30 Days):** Orders marked RTO Initiated but never delivered back to your warehouse.\n   - **Courier Weight Slab Fraud:** Orders where courier billed a higher weight slab than your SKU weight.\n4. Click **Generate Claim Draft** next to any flagged Order ID to copy a pre-formatted SPF / SAFE-T / Meesho Support claim ticket!`;
  }

  if (q.includes('gstr') || q.includes('json') || q.includes('gst.gov') || q.includes('3b') || q.includes('file') || q.includes('filing')) {
    return `**How to File GSTR-1 in 60 Seconds using SellGST Pro:**\n\n1. Go to **GST Filing** (\`/gst-filing.html\`) and select your filing period.\n2. Review your auto-segregated **B2B Invoices**, **B2CS Summary**, and **HSN Summary**.\n3. Click **Download Official GSTR-1 (.JSON)**.\n4. Log in to **gst.gov.in** → **Returns Dashboard** → Select Month → Click **Prepare Offline** under GSTR-1 → Upload the downloaded \`.JSON\` file → Verify & File with **OTP (EVC)**.\n5. For **GSTR-3B**, use the 1-Click Copy boxes on the same page to paste exact IGST, CGST, and SGST values into Table 3.1.`;
  }

  if (q.includes('pro') || q.includes('upi') || q.includes('pay') || q.includes('utr') || q.includes('unlock') || q.includes('approve') || q.includes('99')) {
    return `**How to Activate SellGST Pro via Instant UPI:**\n\n1. Click **Unlock Pro** on the top navbar or inside the Audit paywall (**₹99/Month** or **₹499/Year**).\n2. **On Desktop:** Scan the dynamic QR code using any UPI app. **On Mobile:** Tap the 1-click **Pay via PhonePe / GPay / Paytm** button (Merchant: **AGNI VOLT**, UPI ID: \`9661692365@ybl\`).\n3. Enter your **12-digit UPI UTR / Reference No.** and click **Submit Verification**.\n4. Your dashboard will show a yellow **Verification Pending** banner and alert our Admin on WhatsApp. Once approved, all masked Order IDs (\`ORD-XXXXXXX\`) unlock live on your screen within 1 second!`;
  }

  if (q.includes('invoice') || q.includes('bill') || q.includes('igst') || q.includes('cgst') || q.includes('udhar') || q.includes('party')) {
    return `**How GST Billing & Automatic Tax Split Works (\`/invoice.html\`):**\n\n- **Auto Tax Split:** Simply select the **Buyer State (Place of Supply)**. If it matches your business state, SellGST Pro automatically splits GST into **50% CGST + 50% SGST**. If the states differ, it applies **100% IGST**.\n- **UPI QR on Bill:** Every printed/PDF invoice automatically displays a dynamic UPI QR code for the exact invoice total.\n- **Party Udhar & Stock:** Saving an invoice automatically updates the customer's **Udhar (Khata) balance** and deducts **SKU inventory stock**.`;
  }

  return `**Welcome to SellGST AI Support (24/7)!** Here is what I can help you with right now:\n\n- **E-Com Audit (\`/ecom-audit.html\`):** Find unreturned RTO orders (>30 days), detect courier weight slab overcharging, and crop A4 PDF labels to **4x6 thermal size**.\n- **GST Billing (\`/invoice.html\`):** Create GST-compliant B2B/B2C bills with auto CGST/SGST/IGST calculation, custom UPI QR code, and Party Udhar tracking.\n- **1-Click GSTR-1 Filing (\`/gst-filing.html\`):** Download ready-to-upload \`gst.gov.in\` JSON files and copy GSTR-3B figures.\n- **Pro Activation:** Pay ₹99/mo via UPI (\`9661692365@ybl\`), submit your 12-digit UTR, and get real-time activation.\n\n*Ask me any question in English, Hindi, Hinglish, or your regional language!*`;
}

export default async function handler(req, res) {
  // Set strict CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method Not Allowed. Use POST /api/ai-assistant.'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const rawMessage = String(body.message || '').trim();
    const language = String(body.language || 'en').trim().slice(0, 10);
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const pageContext = String(body.pageContext || 'dashboard').trim().slice(0, 40);

    if (!rawMessage) {
      return res.status(400).json({
        ok: false,
        error: 'Please enter a valid question for SellGST AI.'
      });
    }

    // Sanitize and cap message length to prevent token abuse
    const sanitizedMessage = rawMessage
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .slice(0, 1500);

    // Retrieve Gemini API Key strictly from server environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback if Vercel env variable hasn't been configured yet
      return res.status(200).json({
        ok: true,
        source: 'local-knowledge-engine',
        reply: getSmartLocalFallback(sanitizedMessage, language)
      });
    }

    // Build multi-turn conversation payload for Gemini
    const contents = [];

    for (const turn of history) {
      if (turn && typeof turn.text === 'string' && turn.text.trim()) {
        contents.push({
          role: turn.role === 'model' ? 'model' : 'user',
          parts: [{ text: turn.text.slice(0, 800) }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [
        {
          text: `[User Current Page: ${pageContext} | Preferred UI Language Code: ${language}]\nUser Question: ${sanitizedMessage}`
        }
      ]
    });

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents,
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 700
        }
      })
    });

    if (!response.ok) {
      // Fallback to built-in expert knowledge engine if upstream API returns non-200
      return res.status(200).json({
        ok: true,
        source: 'fallback-knowledge-engine',
        reply: getSmartLocalFallback(sanitizedMessage, language)
      });
    }

    const data = await response.json();
    const aiReply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('\n')
        .trim() || getSmartLocalFallback(sanitizedMessage, language);

    return res.status(200).json({
      ok: true,
      source: 'gemini-cloud',
      reply: aiReply
    });
  } catch (error) {
    console.error('[SellGST AI Assistant Error]:', error?.message || error);
    const safeQuery = (typeof req.body === 'object' && req.body?.message) ? req.body.message : '';
    return res.status(200).json({
      ok: true,
      source: 'resilient-fallback',
      reply: getSmartLocalFallback(safeQuery, 'en')
    });
  }
}
