/**
 * SellGST Pro — Zero-Trust Cloudflare Pages Serverless Gemini AI Backend v5.2
 * Path: /functions/api/ai-assistant.js (Automatically serves POST /api/ai-assistant)
 *
 * Security & Reliability Upgrades:
 * 1. Reads `env.GEMINI_API_KEY` strictly from Cloudflare Environment Variables (100% hidden from public GitHub).
 * 2. Triple-Model Automatic Fallback (`gemini-2.5-flash` -> `gemini-2.0-flash` -> `gemini-1.5-flash`).
 * 3. Full CORS support for both `sellgst-pro.pages.dev` and `ritikraj3405328-web.github.io`.
 * 4. Natural, conversational Problem-Solving Assistant (like Google Gemini) — never dumps raw .html lists on "Hi".
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json; charset=utf-8"
};

const SYSTEM_PROMPT = `You are SellGST Pro AI, a warm, intelligent, conversational problem-solving assistant powered by Google Gemini for Indian e-commerce sellers (Meesho, Flipkart, Amazon) and GST business owners.

CRITICAL CONVERSATIONAL RULES:
1. ACT LIKE GOOGLE GEMINI: Talk naturally like a smart, helpful human expert.
2. NEVER SPAM FEATURE LISTS ON GREETINGS: If the user says "Hi", "Hello", "Namaste", "Kaise ho", or a casual greeting, reply warmly in 1-2 short sentences (e.g., "Hi! 👋 Main SellGST Pro AI hoon. Bataiye, aaj main aapki kya madad kar sakta hoon? Aap mujhse GST calculation, invoice, RTO claims ya apne business se juda koi bhi sawal puch sakte hain.") — DO NOT list .html file names or dump a wall of features unless they ask about features.
3. SOLVE PROBLEMS DIRECTLY:
   - If the user asks a math or GST tax question (e.g., "12000 ka 18% GST kitna hoga"), calculate the exact CGST, SGST, IGST, and Grand Total step-by-step.
   - If the user asks about HSN codes, GSTR-1, GSTR-3B, ITC, e-commerce RTO claims, courier weight discrepancy, or business strategy, give clear, practical, accurate advice.
   - Only mention SellGST Pro tools (Navy GST Invoice Maker, E-Com CSV Audit, 1-Click GSTR-1 JSON, or Dynamic QR Studio) when directly relevant to solving the user's stated problem.
4. LANGUAGE ADAPTATION: Match the user's language naturally (Hindi, Hinglish, English, or regional Indian languages). Keep formatting clean and concise.`;

/**
 * Intelligent conversational problem-solver fallback if API key is not yet configured in Cloudflare env
 */
function buildConversationalFallback(userMessage = "") {
  const msg = String(userMessage || "").trim();
  const lower = msg.toLowerCase();

  // 1. Natural Greetings ("Hi", "Hello", "Namaste", "Kaise ho")
  if (/^(hi+|hello+|hey+|namaste|hlo|hola|kaise ho|kya haal hai|good morning|good evening|radhe radhe|jai shree ram)[\s!?.]*$/i.test(lower)) {
    return "Hi! 👋 Main bilkul theek hoon. Bataiye, aaj main aapki kya madad kar sakta hoon? Aap mujhse koi bhi GST calculation, HSN code, e-commerce RTO claim, ya apne business se juda koi bhi sawal puch sakte hain!";
  }

  // 2. "Who are you" / "Tum kaun ho"
  if (lower.includes("kaun ho") || lower.includes("who are you") || lower.includes("kya kar sakte")) {
    return "Main aapka **SellGST Pro AI Helper** hoon! Main aapke business, GST tax calculation, HSN codes, e-commerce RTO/weight fraud claims, aur billing se judi har problem solve karne ke liye banaya gaya hoon. Bataiye, abhi aapko kis cheez mein help chahiye?";
  }

  // 3. Live GST & Reverse-GST Math Solver
  const numbers = lower.match(/(\d+(?:\.\d+)?)/g);
  if (numbers && (lower.includes("gst") || lower.includes("tax") || lower.includes("%") || lower.includes("hisab") || lower.includes("calculate") || lower.includes("kitna"))) {
    const baseAmt = Number(numbers[0]) || 0;
    const gstRate = numbers[1] ? Number(numbers[1]) : 18;
    const gstVal = (baseAmt * gstRate) / 100;
    const totalVal = baseAmt + gstVal;
    const reverseTaxable = baseAmt / (1 + gstRate / 100);
    const reverseGst = baseAmt - reverseTaxable;

    return (
      `📊 **₹${baseAmt.toLocaleString("en-IN")} par ${gstRate}% GST Calculation:**\n\n` +
      `**1. Exclusive GST (Agar ₹${baseAmt} Taxable Value hai):**\n` +
      `• **CGST (${gstRate / 2}%):** ₹${(gstVal / 2).toFixed(2)}\n` +
      `• **SGST (${gstRate / 2}%):** ₹${(gstVal / 2).toFixed(2)}\n` +
      `• **Total GST (${gstRate}%):** ₹${gstVal.toFixed(2)}\n` +
      `• **Grand Total Bill:** **₹${totalVal.toFixed(2)}**\n\n` +
      `**2. Inclusive GST (Agar ₹${baseAmt} MRP mein GST juda hua hai):**\n` +
      `• **Net Taxable Value:** ₹${reverseTaxable.toFixed(2)}\n` +
      `• **Included GST (${gstRate}%):** ₹${reverseGst.toFixed(2)}`
    );
  }

  // 4. HSN Code Guidance
  if (lower.includes("hsn")) {
    return (
      "📋 **Common E-Commerce HSN Codes & GST Rates:**\n\n" +
      "• **Electronic Controllers / Kits / Switches:** HSN `8537` / `8536` (18% GST)\n" +
      "• **Plastic / Stationery / Pencil Boxes:** HSN `3926` (18% GST)\n" +
      "• **Readymade Garments (Up to ₹1000):** HSN `61` / `62` (5% GST)\n" +
      "• **Mobile Accessories / Chargers / Cables:** HSN `8504` / `8544` (18% GST)\n\n" +
      "Aap kis product ka exact HSN code aur GST rate janna chahte hain? Product ka naam likhiye!"
    );
  }

  // 5. E-Commerce RTO / Weight Claim Problem Solving
  if (lower.includes("rto") || lower.includes("claim") || lower.includes("meesho") || lower.includes("flipkart") || lower.includes("amazon") || lower.includes("weight")) {
    return (
      "📦 **E-Commerce RTO & Weight Fraud Claim Guide:**\n\n" +
      "1. **Overdue RTO (30 din se upar):** Agar order `RTO Initiated` dikha raha hai par 30 din baad bhi aapko physical packet nahi mila, to aap Seller Support mein **Unreturned RTO / SPF / SAFE-T Claim** daal sakte hain.\n" +
      "2. **Weight Discrepancy:** Apne product ka kitchen scale par photo aur dimension lekar courier weight slab dispute raise karein.\n\n" +
      "Bataiye, aapko Meesho, Flipkart ya Amazon—kis platform ke claim mein dikkat aa rahi hai?"
    );
  }

  // 6. Invoice / Logo / Signature Help
  if (lower.includes("invoice") || lower.includes("bill") || lower.includes("logo") || lower.includes("sign")) {
    return (
      "🧾 **Custom Navy Invoice & Logo Help:**\n\n" +
      "• **Logo Change:** Bill ke upar gol `LOGO` circle par click karke apna brand logo lagayein.\n" +
      "• **Direct Edit:** Bill ke kisi bhi naam, GSTIN, Bank A/C, ya item par click karke seedha edit karein.\n" +
      "• **Signature:** Niche `Draw Sign ✍️` par click karke ungli se sign banayein ya naam type karein.\n\n" +
      "Bill banate waqt koi aur cheez change karni hai to bataiye!"
    );
  }

  // 7. Empathetic Open-Ended Problem Solver
  return (
    `Main aapki baat samajh gaya! Aapne pucha: **"${msg}"**\n\n` +
    `Bataiye, ismein aapko exact kya dikkat aa rahi hai ya aap kya calculate/solve karna chahte hain? Aap apna sawal bilkul aam bhasha (Hindi ya Hinglish) mein likh sakte hain, main turant uska step-by-step solution dunga!`
  );
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json().catch(() => ({}));
    const userMessage = String(body.message || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!userMessage) {
      return new Response(
        JSON.stringify({ reply: "Hi! 👋 Bataiye, aaj main aapki kya madad kar sakta hoon?" }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const apiKey = context.env?.GEMINI_API_KEY || context.env?.GOOGLE_API_KEY || "";

    if (apiKey) {
      const contents = [];
      history.slice(-6).forEach((turn) => {
        if (turn && turn.text) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: String(turn.text).slice(0, 1500) }]
          });
        }
      });

      contents.push({
        role: "user",
        parts: [{ text: userMessage }]
      });

      // Try models in order of speed and availability
      const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

      for (const modelName of models) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const geminiRes = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_PROMPT }]
              },
              contents,
              generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 700
              }
            })
          });

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              return new Response(
                JSON.stringify({ reply: candidateText.trim(), engine: modelName }),
                { status: 200, headers: CORS_HEADERS }
              );
            }
          }
        } catch (_) {}
      }
    }

    const fallbackReply = buildConversationalFallback(userMessage);
    return new Response(
      JSON.stringify({ reply: fallbackReply, engine: "sellgst-conversational-ai" }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        reply: "Hi! 👋 Main aapka SellGST Pro AI Helper hoon. Bataiye, aaj aapko kis cheez mein madad chahiye?"
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }
}
