// src/utils/pf.js
const toHex = (buf) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

export async function sha256Hex(str) {
   const enc = new TextEncoder();
   const digest = await crypto.subtle.digest("SHA-256", enc.encode(str));
   return toHex(digest);
}

export async function hmacSha256Hex(keyStr, msgStr) {
   const enc = new TextEncoder();
   const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(keyStr),              // ВАЖНО: ключом является строковый serverSeed
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
   );
   const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msgStr));
   return toHex(sig);
}

export function rngFromDigestHex(dhex) {
   const n = parseInt(dhex.slice(0, 13), 16); // 52 бита
   return n / Math.pow(2, 52);
}

export function almostEqual(a, b, eps = 1e-12) {
   return Math.abs(parseFloat(a) - parseFloat(b)) <= eps;
}
