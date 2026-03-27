#!/usr/bin/env node
/**
 * create_stripe_links.js
 * Creates Stripe Products, Prices, and Payment Links for all 9 Titan Exchange AI / 18 Legends tiers.
 * Run once: node create_stripe_links.js
 * Output: stripe_payment_links.json (paste URLs into index_us.html)
 */

const Stripe = require('stripe');
const fs = require('fs');

// Set STRIPE_SECRET_KEY env var before running (key already used — links saved in stripe_payment_links.json)
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');

const PRODUCTS = [
  { id: 'p1', name: '18 Legends — Debate Chamber',         price: 9900,   tier: 'Starter',      desc: '3 Legends debating any stock or crypto ticker in real time. Titan Signal casting vote.' },
  { id: 'p2', name: '18 Legends — Council of 8',           price: 24900,  tier: 'Growth',       desc: '8 Legends simultaneously. Higher conviction signals across more philosophies.' },
  { id: 'p3', name: '18 Legends — Full Council (All 18)',   price: 49900,  tier: 'Professional', desc: 'All 18 Legends in session. Complete war room.' },
  { id: 'p4', name: '18 Legends — Legend Oracle',           price: 59900,  tier: 'Prediction',   desc: '18 Legends on Polymarket, Kalshi, Manifold, PredictIt. Consensus probability engine.' },
  { id: 'p5', name: '18 Legends — Legend Spotlight',        price: 69900,  tier: 'Intelligence', desc: 'Follow one Legend exclusively. Daily AI briefings in their documented voice.' },
  { id: 'p6', name: '18 Legends — Titan Signal Solo',       price: 99900,  tier: 'Alpha',        desc: 'Pure Titan Signal consensus layer. Institutional order flow, dark pool data, macro signals.' },
  { id: 'p7', name: '18 Legends — CryptoVault + Legends',   price: 129900, tier: 'Crypto',       desc: 'All 18 Legends applied to crypto. On-chain whale tracking + debate.' },
  { id: 'p8', name: '18 Legends — Portfolio Builder',       price: 179900, tier: 'Portfolio',    desc: 'Blend Legends in custom allocations. AI manages rebalancing.' },
  { id: 'p9', name: '18 Legends — Command Center',          price: 249900, tier: 'Institutional',desc: 'Full institutional access. API, WebSocket, white-label, quant support.' },
];

async function run() {
  const results = [];

  for (const p of PRODUCTS) {
    try {
      console.log(`Creating: ${p.name} ($${p.price / 100}/mo)...`);

      // 1. Create Product
      const product = await stripe.products.create({
        name: p.name,
        description: p.desc,
        metadata: { tier: p.tier, platform: '18_legends' },
      });

      // 2. Create recurring Price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.price,
        currency: 'usd',
        recurring: { interval: 'month' },
        nickname: `${p.tier} Monthly`,
      });

      // 3. Create Payment Link
      const link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1 }],
        subscription_data: {
          metadata: { product_id: p.id, tier: p.tier },
        },
        after_completion: {
          type: 'redirect',
          redirect: { url: 'https://titanexchangeai.com/welcome' },
        },
        metadata: { tier: p.tier },
      });

      results.push({
        id: p.id,
        tier: p.tier,
        name: p.name,
        price_usd: p.price / 100,
        product_id: product.id,
        price_id: price.id,
        payment_link: link.url,
      });

      console.log(`  ✅ ${p.tier}: ${link.url}`);
    } catch (err) {
      console.error(`  ❌ Failed ${p.name}: ${err.message}`);
      results.push({ id: p.id, tier: p.tier, name: p.name, error: err.message });
    }
  }

  fs.writeFileSync('stripe_payment_links.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Done. Links written to stripe_payment_links.json');
  console.log('\n── Paste these into index_us.html ──');
  results.forEach(r => {
    if (r.payment_link) console.log(`${r.tier}: ${r.payment_link}`);
  });
}

run();
