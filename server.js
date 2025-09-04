// Minimal Express + Stripe Checkout server
// Serves the static site and exposes /api/create-checkout-session
// 1) Copy .env.example to .env and fill in STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY
// 2) npm install
// 3) npm start

import express from "express";
import path from "path";
import dotenv from "dotenv";
import Stripe from "stripe";
import cors from "cors";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY; // used in index.html optionally
const PRICE_PER_PIXEL_CENTS = Number(process.env.PRICE_PER_PIXEL_CENTS || 100); // $1/pixel default
const SITE_URL = process.env.SITE_URL || "http://localhost:4242";

if (!STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

// Create Checkout Session (server recomputes price from w/h to prevent tampering)
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { wUnits = 10, hUnits = 10, label = "", href = "" } = req.body || {};
    const w = Math.max(1, Math.min(100, Number(wUnits) || 1));
    const h = Math.max(1, Math.min(100, Number(hUnits) || 1));
    const pixels = w * h * 100; // 10x10 units => 100 pixels per unit block

    const totalCents = pixels * PRICE_PER_PIXEL_CENTS;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Dubai MDH Block ${w}x${h} (${pixels.toLocaleString()} px)`,
              description: (label ? `${label} • ` : "") + (href || ""),
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/?canceled=1`,
      metadata: {
        wUnits: String(w),
        hUnits: String(h),
        pixels: String(pixels),
        label,
        href,
      },
    });

    // Prefer returning "url" (Checkout hosted link)
    res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message || "Failed to create session");
  }
});

// Serve static site
app.use(express.static(path.join(__dirname, "..", "public")));

// Start server
const PORT = Number(process.env.PORT || 4242);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
