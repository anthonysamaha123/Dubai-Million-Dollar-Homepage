Dubai Million Dollar Homepage — Payments + Icons
====================================================

This folder contains a ready-to-run site with:
- Modern pixel board (1000×1000, 10×10 units)
- Built-in icons (favicon.svg + Safari pinned tab)
- Stripe Checkout purchases directly from the calculator

Quick Start
-----------
1) Install Node 18+
2) cd into this folder's "server" directory:
   cd server
3) Copy .env.example to .env and fill:
   - STRIPE_SECRET_KEY (required)
   - STRIPE_PUBLISHABLE_KEY (optional for redirectToCheckout fallback)
   - PRICE_PER_PIXEL_CENTS (default 100 = $1.00)
   - SITE_URL (e.g., http://localhost:4242 or your domain)
4) Install deps:
   npm install
5) Start the server:
   npm start
6) Visit:
   http://localhost:4242

How it works
------------
- The static site (public/*) is served by Express.
- Clicking "Buy this size" calls POST /api/create-checkout-session with w/h.
- The server recomputes price to prevent tampering:
  pixels = (wUnits * hUnits * 100) // because 10×10 unit = 100 px
  totalCents = pixels * PRICE_PER_PIXEL_CENTS
- The server creates a Stripe Checkout Session and responds with session.url.
- Browser redirects to Checkout; on success, you land on /success.html.

Notes
-----
- Add webhooks (optional) to mark blocks as sold and store buyer info.
- Replace the demo DATA array in index.html with your inventory after payment verification.
- Host: set SITE_URL to your public URL (e.g., https://dubaimilliondollarhomepage.com).
- Icons already linked in <head> of index.html.

Security
--------
- Always recompute price server-side (done here).
- Validate and sanitize label/href inputs if you display them.

Enjoy!