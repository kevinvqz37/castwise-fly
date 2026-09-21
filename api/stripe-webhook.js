// api/stripe-webhook.js — flips users/{doc}.isPro when Stripe subscriptions start/end.
//
// Vercel env vars required:
//   STRIPE_SECRET_KEY          sk_live_...
//   STRIPE_WEBHOOK_SECRET      whsec_...  (from Stripe → Developers → Webhooks → this endpoint)
//   FIREBASE_SERVICE_ACCOUNT   full JSON of a Firebase service-account key (Project settings → Service accounts)
//
// Stripe webhook endpoint: https://castwise-fly.vercel.app/api/stripe-webhook
// Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted

import Stripe from "stripe";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

function db() {
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  return getFirestore();
}

async function rawBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

async function findUserRef(field, value) {
  if (!value) return null;
  const snap = await db().collection("users").where(field, "==", value).limit(1).get();
  return snap.empty ? null : snap.docs[0].ref;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  let event;
  try {
    const buf = await rawBody(req);
    event = stripe.webhooks.constructEvent(buf, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("Webhook signature failed:", e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      const uid = s.client_reference_id;
      let ref = await findUserRef("uid", uid);
      if (!ref && uid) ref = db().collection("users").doc(); // user doc missing — create it
      if (ref) {
        await ref.set({
          uid, isPro: true,
          stripeCustomerId: s.customer || null,
          stripeSubscriptionId: s.subscription || null,
          proSince: Date.now(),
        }, { merge: true });
      } else {
        console.warn("checkout completed without client_reference_id", s.id);
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const active = event.type !== "customer.subscription.deleted" && ["active", "trialing", "past_due"].includes(sub.status);
      const ref = await findUserRef("stripeCustomerId", sub.customer);
      if (ref) await ref.set({ isPro: active, stripeStatus: sub.status }, { merge: true });
    }
  } catch (e) {
    console.error("Webhook handler error:", e);
    return res.status(500).json({ error: "handler failed" });
  }

  return res.status(200).json({ received: true });
}
