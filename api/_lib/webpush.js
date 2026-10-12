// Minimal Web Push sender (RFC 8291 aes128gcm + RFC 8292 VAPID) using only node:crypto,
// so no extra npm package is needed.
//
// Env (Vercel → Settings → Environment Variables):
//   VAPID_PUBLIC_KEY   base64url, 65-byte uncompressed P-256 point
//   VAPID_PRIVATE_KEY  base64url, 32-byte private scalar
//   VAPID_SUBJECT      mailto:you@example.com
// Generate a pair (same format as `npx web-push generate-vapid-keys`):
//   node -e "const c=require('crypto').createECDH('prime256v1');c.generateKeys();console.log('VAPID_PUBLIC_KEY='+c.getPublicKey('base64url'));console.log('VAPID_PRIVATE_KEY='+c.getPrivateKey('base64url'))"
import crypto from "node:crypto";

const b64u = b => Buffer.from(b).toString("base64url");
const fromB64u = s => Buffer.from(String(s).replace(/=+$/, ""), "base64url");
const hmac = (key, data) => crypto.createHmac("sha256", key).update(data).digest();

export function vapidKeys() {
  const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return null;
  return { publicKey: pub.trim(), privateKey: priv.trim(), subject: (process.env.VAPID_SUBJECT || "mailto:admin@castwise-fly.vercel.app").trim() };
}

function vapidAuth(endpoint, keys) {
  const pub = fromB64u(keys.publicKey);
  const jwk = { kty: "EC", crv: "P-256", d: b64u(fromB64u(keys.privateKey)), x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)) };
  const key = crypto.createPrivateKey({ key: jwk, format: "jwk" });
  const head = b64u(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const body = b64u(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: keys.subject }));
  const sig = crypto.sign("sha256", Buffer.from(`${head}.${body}`), { key, dsaEncoding: "ieee-p1363" });
  return `vapid t=${head}.${body}.${b64u(sig)}, k=${keys.publicKey}`;
}

// Encrypts `payload` for a PushSubscription ({ endpoint, keys: { p256dh, auth } }).
export function encrypt(sub, payload) {
  const uaPublic = fromB64u(sub.keys.p256dh), authSecret = fromB64u(sub.keys.auth);
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();
  const secret = ecdh.computeSecret(uaPublic);
  const salt = crypto.randomBytes(16);

  const prkKey = hmac(authSecret, secret);
  const ikm = hmac(prkKey, Buffer.concat([Buffer.from("WebPush: info\0"), uaPublic, asPublic, Buffer.from([1])]));
  const prk = hmac(salt, ikm);
  const cek = hmac(prk, Buffer.from("Content-Encoding: aes128gcm\0\x01", "binary")).subarray(0, 16);
  const nonce = hmac(prk, Buffer.from("Content-Encoding: nonce\0\x01", "binary")).subarray(0, 12);

  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const body = Buffer.concat([cipher.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
  const rs = Buffer.alloc(4); rs.writeUInt32BE(4096);
  return Buffer.concat([salt, rs, Buffer.from([asPublic.length]), asPublic, body]);
}

// → { ok, status, gone } — gone=true means the subscription expired and should be deleted.
export async function sendPush(sub, data, { ttl = 6 * 3600, urgency = "normal" } = {}) {
  const keys = vapidKeys();
  if (!keys) throw new Error("VAPID keys are not set");
  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: String(ttl),
      Urgency: urgency,
      Authorization: vapidAuth(sub.endpoint, keys),
    },
    body: encrypt(sub, JSON.stringify(data)),
  });
  return { ok: res.ok, status: res.status, gone: res.status === 404 || res.status === 410 };
}
