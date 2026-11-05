import { getStore } from "@netlify/blobs";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";

// Netlify > Site settings > Environment variables:  ADMIN_PASSWORD  (required),  TOKEN_SECRET (optional, long random text)
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const secret = () => process.env.TOKEN_SECRET || process.env.ADMIN_PASSWORD || "";
const sign = (exp) => createHmac("sha256", secret()).update(String(exp)).digest("hex");
const same = (a, b) => { const x = createHash("sha256").update(String(a)).digest(), y = createHash("sha256").update(String(b)).digest(); return timingSafeEqual(x, y); };
const makeToken = () => { const exp = Date.now() + 90 * 864e5; return exp + "." + sign(exp); };
const valid = (req) => {
  const t = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const [exp, sig] = t.split(".");
  return !!(secret() && exp && sig && Number(exp) > Date.now() && same(sig, sign(exp)));
};
const KEY = /^(G\d{1,3}|Q\d{1,3}|QF[1-4]|SF[1-2]|F)$/;

export default async (req) => {
  const path = new URL(req.url).pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
  const store = getStore("carrom");
  try {
    if (path === "state" && req.method === "GET")
      return J((await store.get("state", { type: "json" })) || { res: {}, feed: [], iv: 0 });
    if (path === "images" && req.method === "GET")
      return J((await store.get("images", { type: "json" })) || { im: {} });

    if (path === "login" && req.method === "POST") {
      if (!process.env.ADMIN_PASSWORD) return J({ error: "সার্ভারে ADMIN_PASSWORD সেট করা নেই" }, 500);
      const b = await req.json().catch(() => ({}));
      if (typeof b.password === "string" && same(b.password, process.env.ADMIN_PASSWORD)) return J({ token: makeToken() });
      await new Promise((r) => setTimeout(r, 900)); // slow down password guessing
      return J({ error: "পাসওয়ার্ড ভুল" }, 401);
    }

    // everything below needs a valid admin token
    if (!valid(req)) return J({ error: "unauthorized" }, 401);
    if (path === "me") return J({ ok: true });

    if (path === "state" && req.method === "POST") {
      const b = await req.json();
      const res = {};
      for (const [k, v] of Object.entries(b.res || {})) if (KEY.test(k) && (v === "D" || (Number.isInteger(v) && v >= 1 && v <= 11))) res[k] = v;
      const feed = (Array.isArray(b.feed) ? b.feed : []).slice(0, 8).map((f) => ({ tx: String(f.tx || "").slice(0, 300) }));
      const old = (await store.get("state", { type: "json" })) || {};
      await store.setJSON("state", { res, feed, iv: old.iv || 0 });
      return J({ ok: true });
    }
    if (path === "images" && req.method === "POST") {
      const b = await req.json();
      const im = {};
      for (const [k, v] of Object.entries(b.im || {})) if (/^\d{1,2}$/.test(k) && typeof v === "string" && v.length < 600000 && /^(data:image\/|https?:\/\/)/.test(v)) im[k] = v;
      await store.setJSON("images", { im });
      const old = (await store.get("state", { type: "json" })) || { res: {}, feed: [] };
      await store.setJSON("state", { ...old, iv: Date.now() });
      return J({ ok: true });
    }
    return J({ error: "not found" }, 404);
  } catch (e) {
    return J({ error: "server error" }, 500);
  }
};

export const config = { path: "/api/*" };
