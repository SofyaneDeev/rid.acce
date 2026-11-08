/* =========================================================
   RID ACCE — app logic
   - Procedural SVG renderers: watches (live hands) + accessories
   - Collection grid with Men/Women + category filters, product modal
   - Atelier watch configurator
   - Bag (localStorage) + drawer
   ========================================================= */
(async () => {
  "use strict";

  /* ---------------- Language (Arabic default, RTL) ---------------- */
  const I18N = window.AURELE_I18N || { defaultLang: "en", langs: { en: { dir: "ltr" } }, ui: { en: {} }, names: {}, products: {} };
  const LANG = (() => { try { const l = localStorage.getItem("aurele-lang"); if (I18N.langs[l]) return l; } catch { /* storage unavailable */ } return I18N.defaultLang; })();
  const UI = Object.assign({}, I18N.ui.en, I18N.ui[LANG] || {});
  const t = (key, x) => { const v = UI[key] !== undefined ? UI[key] : key; return x === undefined ? v : v.replace(/\{x\}/g, x); };
  document.documentElement.lang = LANG;
  document.documentElement.dir = I18N.langs[LANG].dir;

  /* ---------------- Materials ---------------- */
  const METALS = {
    steel: { name: "Polished steel", stops: ["#fbfbfb", "#c5c8cc", "#767a80", "#e9eaec", "#9ea2a7"], price: 0 },
    gold:  { name: "18k yellow gold", stops: ["#fff3c9", "#e2b960", "#8f6a22", "#f6d98d", "#b8912f"], price: 68200 },
    rose:  { name: "18k rose gold", stops: ["#ffe2d2", "#d99a7b", "#7f4a33", "#f2c2a8", "#b27659"], price: 63800 },
    white: { name: "18k white gold", stops: ["#ffffff", "#d9dadc", "#8c8f94", "#f1f1ef", "#b4b6b9"], price: 70400 },
    noir:  { name: "Black DLC titanium", stops: ["#6a6a70", "#2c2c30", "#0c0c0e", "#4a4a50", "#1c1c20"], price: 9900 },
  };
  const LEATHERS = {
    black:    { name: "Black calfskin",    color: "#1b1b1b" },
    cognac:   { name: "Cognac calfskin",   color: "#7a4a28" },
    bordeaux: { name: "Bordeaux calfskin", color: "#5e1a26" },
    navy:     { name: "Navy calfskin",     color: "#1a2742" },
    taupe:    { name: "Taupe calfskin",    color: "#8a7360" },
  };
  const FRAMES = {
    tortoise: { name: "Tortoiseshell", color: "#6b3a22" },
    black:    { name: "Black acetate", color: "#151515" },
    honey:    { name: "Honey acetate", color: "#b5793a" },
    ivory:    { name: "Ivory acetate", color: "#d9cfbb" },
  };
  const LENSES = {
    brown: { name: "Brown gradient", color: "#3b2316" },
    g15:   { name: "G-15 green",     color: "#23382c" },
    grey:  { name: "Smoke grey",     color: "#2a2d33" },
    rose:  { name: "Rose",           color: "#7a3a46" },
    blue:  { name: "Ocean blue",     color: "#1f3550" },
  };
  const DIALS = {
    midnight: { name: "Midnight blue", c1: "#2a3d66", c2: "#0a1226", ink: "#ece6da" },
    forest:   { name: "Forest green",  c1: "#2c5440", c2: "#0b1d13", ink: "#ece6da" },
    ivory:    { name: "Grand feu ivory", c1: "#fbf7ee", c2: "#d8cfbb", ink: "#1a1712" },
    pearl:    { name: "Mother-of-pearl", c1: "#fffaf7", c2: "#d7cdd6", ink: "#2a2422" },
    salmon:   { name: "Salmon",        c1: "#f0c0a6", c2: "#b9745a", ink: "#2a160d" },
    onyx:     { name: "Onyx",          c1: "#333336", c2: "#050506", ink: "#ece6da" },
    glacier:  { name: "Glacier",       c1: "#dcebf0", c2: "#8fb1bd", ink: "#0f2530" },
    bordeaux: { name: "Bordeaux",      c1: "#6e2230", c2: "#24060b", ink: "#f1e4d4" },
  };
  const LIGHT_DIALS = ["ivory", "pearl", "glacier", "salmon"];
  const STRAPS = {
    cognac:   { name: "Cognac alligator", color: "#7a4a28", price: 0 },
    black:    { name: "Black alligator",  color: "#1a1a1a", price: 0 },
    blush:    { name: "Blush alligator",  color: "#b98a7c", price: 0 },
    navy:     { name: "Navy rubber",      color: "#1a2742", price: 0 },
    olive:    { name: "Olive canvas",     color: "#4a4c32", price: 0 },
    bracelet: { name: "Matching bracelet", color: null, price: 15400 },
  };
  const MARKERS = { baton: "Baton", roman: "Roman", arabic: "Arabic", dots: "Dots" };
  const COMPS = {
    time:   { name: "Time only", price: 0 },
    date:   { name: "Date", price: 2750 },
    diver:  { name: "Diver bezel", price: 7150 },
    chrono: { name: "Chronograph", price: 28600 },
  };
  const GEMS = {
    diamond:  { name: "Diamond",  c: ["#ffffff", "#d6ecf7", "#7fa3bb"] },
    ruby:     { name: "Ruby",     c: ["#ffb0bb", "#c2142f", "#4f0410"] },
    sapphire: { name: "Sapphire", c: ["#a9c8ff", "#1f4fb3", "#081943"] },
    emerald:  { name: "Emerald",  c: ["#a8f2cb", "#18905a", "#05341f"] },
    onyx:     { name: "Onyx",     c: ["#6a6a70", "#161618", "#000000"] },
    pearl:    { name: "Pearl",    c: ["#ffffff", "#f1e8de", "#b9a794"] },
  };

  /* ---------------- Catalogue ---------------- */
  /* Catalogue: loaded at start-up from Supabase (see config.js), or from products-seed.js as a fallback.
     Manage it from admin.html. */
  let PRODUCTS = [];

  // Localise material names + product copy for the active language (English is the source).
  (() => {
    const N = (I18N.names || {})[LANG];
    if (N) {
      const apply = (table, map) => map && Object.keys(map).forEach((k) => { if (table[k]) table[k].name = map[k]; });
      apply(METALS, N.metal); apply(DIALS, N.dial); apply(STRAPS, N.strap); apply(COMPS, N.comp);
      apply(GEMS, N.gem); apply(LEATHERS, N.leather); apply(FRAMES, N.frame); apply(LENSES, N.lens);
      if (N.markers) Object.assign(MARKERS, N.markers);
    }
  })();

  /* ---------------- Helpers ---------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // Prices are stored in Moroccan dirhams (MAD)
  const num = (n) => { const g = Math.round(Math.abs(n)).toLocaleString("en-US"); return LANG === "fr" ? g.replace(/,/g, "\u202F") : g; };
  const fmt = (n) => (n < 0 ? "−" : "") + (LANG === "ar" ? `${num(n)} درهم` : LANG === "fr" ? `${num(n)} DH` : `MAD ${num(n)}`);
  const countLabel = (n) => n === 1 ? t("shop.count.one")
    : LANG === "ar" && n === 2 ? t("shop.count.two")
    : LANG === "ar" && n >= 3 && n <= 10 ? t("shop.count.few", n) : t("shop.count", n);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const visual = (p) => { const { desc, specs, ...rest } = p; return rest; };
  const isWatch = (cfg) => !cfg.kind || cfg.kind === "watch";
  const subtitle = (p) => p.sub || (p.metal && p.dial ? `${METALS[p.metal].name} · ${DIALS[p.dial].name}` : "");
  const loc = (o) => (o && typeof o === "object" ? o[LANG] || o.en : o);
  const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,80}$/;
  const safeUrl = (u) => (typeof u === "string" && !u.includes("..") &&
    (/^https:\/\/[a-z0-9.-]+(:\d+)?\/[^\s"'<>()\\]*$/i.test(u) || /^images\/[a-z0-9._\/-]+$/i.test(u)) ? u : "");
  const safeCss = (c) => (typeof c === "string" && c.length <= 200 && /^[#a-z0-9(),.%\s-]*$/i.test(c) && !/url|expression|image-set/i.test(c) ? c : "");
  // Photo products: the selected variant's first photo (or the product's single photo)
  const variantOf = (cfg) => (cfg.variants || []).find((v) => v.key === cfg.variant) || (cfg.variants || [])[0];
  const photoOf = (cfg) => { const v = variantOf(cfg); return v ? v.imgs[0] : cfg.img; };
  const photoHTML = (cfg) => `<img class="product-photo" src="${escapeHTML(safeUrl(photoOf(cfg)))}" alt="${escapeHTML([cfg.brand, cfg.name].filter(Boolean).join(" "))}" loading="lazy" decoding="async" />`;
  const render = (cfg) => (cfg.kind === "photo" ? photoHTML(cfg) : isWatch(cfg) ? watchSVG(cfg) : accessorySVG(cfg));

  /* ---------------- Catalogue loading: Supabase → fallback products-seed.js ---------------- */
  const CFG = window.AURELE_CONFIG || {};
  /* SECURITY: product data comes from the database, so it is validated here and escaped when displayed.
     - ids / variant keys: lowercase slugs only
     - category, gender, occasions: fixed lists
     - photos: https:// URLs or files in images/ only (no javascript:, data:, quotes…)
     - swatch colours: plain colour / gradient syntax only (no url(), no quotes) */
  const str = (v, max = 2000) => (typeof v === "string" ? v.slice(0, max) : v == null ? "" : String(v).slice(0, max));
  const toPrice = (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0; };
  const locText = (o, max) => str(loc(o), max);
  const CATS = ["Watches", "Jewellery", "Leather goods", "Eyewear", "Packs"], GENDERS = ["men", "women", "unisex"];
  const OCC_KEYS = ["anniversary", "wedding", "graduation", "justbecause"];
  const hydrate = (r) => {
    if (!r || typeof r.id !== "string" || !SAFE_ID.test(r.id)) return null;
    const variants = (Array.isArray(r.variants) ? r.variants : []).slice(0, 12)
      .map((v, i) => v && {
        key: typeof v.key === "string" && SAFE_ID.test(v.key) ? v.key : "v" + (i + 1),
        name: v.name && typeof v.name === "object" ? { ar: str(v.name.ar, 120), fr: str(v.name.fr, 120), en: str(v.name.en, 120) } : str(v.name, 120),
        price: toPrice(v.price) || toPrice(r.price),
        was: toPrice(v.was),   // price before discount (0 = no discount)
        swatch: safeCss(v.swatch),
        imgs: (Array.isArray(v.imgs) ? v.imgs : []).map(safeUrl).filter(Boolean).slice(0, 12),
      })
      .filter((v) => v && v.imgs.length);
    variants.forEach((v) => { if (!(v.was > v.price)) v.was = 0; });
    const specsSrc = (r.specs && typeof r.specs === "object" && (r.specs[LANG] || r.specs.en)) || {};
    const specs = Object.fromEntries(Object.entries(specsSrc).slice(0, 20).map(([k, v]) => [str(k, 80), str(v, 300)]));
    return {
      id: r.id, kind: "photo", brand: str(r.brand, 80),
      cat: CATS.includes(r.cat) ? r.cat : "Watches",
      gender: GENDERS.includes(r.gender) ? r.gender : "women",
      price: toPrice(r.price) || (variants[0] ? variants[0].price : 0),
      img: safeUrl(r.img) || (variants[0] ? variants[0].imgs[0] : ""),
      variants,
      chain: Array.isArray(r.chain) && r.chain.length ? r.chain.slice(0, 12).map((c) => str(c, 30)) : null,
      occasions: Array.isArray(r.occasions) ? r.occasions.filter((o) => OCC_KEYS.includes(o)) : [],
      name: locText(r.name, 160) || r.id,
      sub: locText(r.sub, 200),
      desc: locText(r.description, 2000),
      specs,
      limited: locText(r.limited, 80),
      stock: Number.isInteger(r.stock) && r.stock >= 0 ? r.stock : null,
      pack: Array.isArray(r.pack) && r.pack.length
        ? r.pack.filter((c) => c && typeof c.pid === "string" && SAFE_ID.test(c.pid)).slice(0, 12)
            .map((c) => ({ pid: c.pid, qty: Math.min(5, Math.max(1, parseInt(c.qty, 10) || 1)) }))
        : null,
    };
  };
  async function loadCatalogue() {
    if (CFG.supabaseUrl && CFG.supabaseAnonKey) {
      try {
        const url = `${CFG.supabaseUrl.replace(/\/$/, "")}/rest/v1/products?select=*&active=eq.true&order=sort.asc,id.asc`;
        const res = await fetch(url, { headers: { apikey: CFG.supabaseAnonKey, Authorization: `Bearer ${CFG.supabaseAnonKey}` } });
        if (!res.ok) throw new Error("HTTP " + res.status);
        return (await res.json()).map(hydrate).filter(Boolean);
      } catch (e) {
        console.warn("RID ACCE: products could not be loaded from Supabase — showing the local catalogue.", e);
      }
    }
    return (window.AURELE_SEED || []).filter((r) => r.active !== false).sort((x, y) => (x.sort || 0) - (y.sort || 0)).map(hydrate).filter(Boolean);
  }
  PRODUCTS = await loadCatalogue();
  // packs: unless the admin set a "before" price, it is the price of the pieces bought separately
  PRODUCTS.forEach((p) => {
    if (!p.pack) return;
    const sep = p.pack.reduce((a, c) => { const q = PRODUCTS.find((x) => x.id === c.pid); return a + (q ? q.price * c.qty : 0); }, 0);
    p.variants.forEach((v) => { if (!v.was && sep > v.price) v.was = sep; });
  });

  let uid = 0;
  function metalDefs(id, metal) {
    const m = METALS[metal || "steel"];
    return `
      <linearGradient id="${id}metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${m.stops[0]}"/><stop offset=".3" stop-color="${m.stops[1]}"/>
        <stop offset=".55" stop-color="${m.stops[2]}"/><stop offset=".8" stop-color="${m.stops[3]}"/><stop offset="1" stop-color="${m.stops[4]}"/>
      </linearGradient>
      <linearGradient id="${id}metalH" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${m.stops[2]}"/><stop offset=".25" stop-color="${m.stops[0]}"/><stop offset=".5" stop-color="${m.stops[1]}"/>
        <stop offset=".75" stop-color="${m.stops[3]}"/><stop offset="1" stop-color="${m.stops[2]}"/>
      </linearGradient>
      <linearGradient id="${id}hand" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${m.stops[3]}"/><stop offset=".5" stop-color="${m.stops[0]}"/><stop offset="1" stop-color="${m.stops[2]}"/>
      </linearGradient>`;
  }
  const ellipsePath = (cx, cy, rx, ry) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0 Z`;

  /* ---------------- Watch renderer ---------------- */
  const ROMAN = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

  function watchSVG(cfg) {
    const id = "w" + (++uid);
    const d = DIALS[cfg.dial], s = STRAPS[cfg.strap];
    const isDiver = cfg.comp === "diver", isChrono = cfg.comp === "chrono";
    const dialR = isDiver ? 62 : 68;
    const ink = d.ink;
    const light = LIGHT_DIALS.includes(cfg.dial);
    const accent = light && cfg.dial !== "salmon" ? "#a8322a" : "#d9b878";
    const handFill = cfg.metal === "noir" ? "#d9b878" : (light ? "#1d1b18" : "url(#" + id + "hand)");
    const p = [];

    p.push(`<svg viewBox="0 -40 200 280" xmlns="http://www.w3.org/2000/svg" class="watch-svg" data-watch role="img" aria-label="${escapeHTML(cfg.name || "RID ACCE watch")}">`);
    p.push(`<defs>${metalDefs(id, cfg.metal)}
      <radialGradient id="${id}dial" cx=".42" cy=".36" r=".75">
        <stop offset="0" stop-color="${d.c1}"/><stop offset="1" stop-color="${d.c2}"/>
      </radialGradient>
      <linearGradient id="${id}glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="${id}strap" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".2" stop-color="#000" stop-opacity="0"/>
        <stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/>
      </linearGradient>
      <linearGradient id="${id}pearl" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f6d9e6" stop-opacity=".35"/><stop offset=".5" stop-color="#d4ecf2" stop-opacity=".25"/><stop offset="1" stop-color="#efe3c8" stop-opacity=".35"/>
      </linearGradient>
    </defs>`);

    // strap / bracelet
    if (s.color) {
      p.push(`<path d="M70 -40 H130 V40 H70 Z" fill="${s.color}"/><path d="M70 160 H130 V240 H70 Z" fill="${s.color}"/>`);
      p.push(`<rect x="70" y="-40" width="60" height="80" fill="url(#${id}strap)"/><rect x="70" y="160" width="60" height="80" fill="url(#${id}strap)"/>`);
      if (["cognac", "black", "blush"].includes(cfg.strap)) {
        for (let y = -36; y < 40; y += 9) p.push(`<path d="M73 ${y} H127" stroke="#000" stroke-opacity=".25" stroke-width=".6"/>`);
        for (let y = 164; y < 240; y += 9) p.push(`<path d="M73 ${y} H127" stroke="#000" stroke-opacity=".25" stroke-width=".6"/>`);
        p.push(`<path d="M73 -40 V40 M127 -40 V40 M73 160 V240 M127 160 V240" stroke="#fff" stroke-opacity=".15" stroke-dasharray="2 2" stroke-width=".6"/>`);
      }
      if (cfg.strap === "navy") {
        for (let y = -34; y < 40; y += 12) p.push(`<rect x="80" y="${y}" width="40" height="5" rx="2.5" fill="#000" fill-opacity=".3"/>`);
        for (let y = 170; y < 240; y += 12) p.push(`<rect x="80" y="${y}" width="40" height="5" rx="2.5" fill="#000" fill-opacity=".3"/>`);
      }
    } else {
      p.push(`<rect x="68" y="-40" width="64" height="80" fill="url(#${id}metalH)"/><rect x="68" y="160" width="64" height="80" fill="url(#${id}metalH)"/>`);
      for (let y = -40; y < 40; y += 13) p.push(`<path d="M68 ${y} H132" stroke="#000" stroke-opacity=".35" stroke-width=".8"/>`);
      for (let y = 166; y < 240; y += 13) p.push(`<path d="M68 ${y} H132" stroke="#000" stroke-opacity=".35" stroke-width=".8"/>`);
      p.push(`<path d="M89 -40 V40 M111 -40 V40 M89 160 V240 M111 160 V240" stroke="#000" stroke-opacity=".3" stroke-width=".8"/>`);
    }

    // lugs, crown, pushers
    p.push(`<path d="M62 46 L66 14 H80 L82 40 Z M138 46 L134 14 H120 L118 40 Z M62 154 L66 186 H80 L82 160 Z M138 154 L134 186 H120 L118 160 Z" fill="url(#${id}metal)"/>`);
    p.push(`<rect x="178" y="91" width="10" height="18" rx="2" fill="url(#${id}metal)"/>`);
    p.push(`<path d="M180 92 V108 M182.5 92 V108 M185 92 V108" stroke="#000" stroke-opacity=".3" stroke-width=".6"/>`);
    if (isChrono) {
      p.push(`<rect x="166" y="52" width="9" height="12" rx="2" transform="rotate(42 170 58)" fill="url(#${id}metal)"/>`);
      p.push(`<rect x="166" y="136" width="9" height="12" rx="2" transform="rotate(-42 170 142)" fill="url(#${id}metal)"/>`);
    }

    // case
    p.push(`<circle cx="100" cy="100" r="81" fill="#000" fill-opacity=".5"/>`);
    p.push(`<circle cx="100" cy="100" r="80" fill="url(#${id}metal)"/>`);
    p.push(`<circle cx="100" cy="100" r="74" fill="url(#${id}metalH)" opacity=".9"/>`);

    // diamond-set bezel
    if ((cfg.diamonds === true || cfg.diamonds === "yes") && !isDiver) {
      for (let i = 0; i < 36; i++) {
        const a = (i * 10) * Math.PI / 180, x = 100 + Math.cos(a) * 74.5, y = 100 + Math.sin(a) * 74.5;
        p.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4.6" fill="url(#${id}metal)"/><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.5" fill="#f4fbff"/><path d="M${x - 2} ${y} L${x} ${y - 2} L${x + 2} ${y} L${x} ${y + 2}Z" fill="#9fc0d4" opacity=".7"/>`);
      }
    }

    // diver bezel
    if (isDiver) {
      const bez = light ? "#1d2a33" : "#0e0f12";
      p.push(`<circle cx="100" cy="100" r="76" fill="${bez}"/>`);
      for (let i = 1; i < 60; i++) {
        const major = i % 5 === 0;
        if (i < 15 || major) p.push(`<line x1="100" y1="${major ? 26 : 27}" x2="100" y2="${major ? 32 : 30}" stroke="#ece6da" stroke-width="${major ? 1.6 : .6}" transform="rotate(${i * 6} 100 100)"/>`);
      }
      [15, 30, 45].forEach((n) => {
        const a = (n * 6 - 90) * Math.PI / 180;
        p.push(`<text x="${100 + Math.cos(a) * 70}" y="${100 + Math.sin(a) * 70 + 2.6}" text-anchor="middle" font-family="Manrope,sans-serif" font-size="7.5" font-weight="600" fill="#ece6da">${n}</text>`);
      });
      p.push(`<path d="M100 31 L95 25 H105 Z" fill="${accent}" stroke="#ece6da" stroke-width=".5"/>`);
      p.push(`<circle cx="100" cy="100" r="${dialR + 1.5}" fill="url(#${id}metal)"/>`);
    }

    // dial
    p.push(`<circle cx="100" cy="100" r="${dialR}" fill="url(#${id}dial)"/>`);
    if (cfg.dial === "pearl") p.push(`<circle cx="100" cy="100" r="${dialR}" fill="url(#${id}pearl)"/>`);
    if (!["ivory", "pearl"].includes(cfg.dial)) {
      for (let i = 0; i < 90; i++) p.push(`<line x1="100" y1="100" x2="100" y2="${100 - dialR}" stroke="#fff" stroke-opacity="${i % 2 ? .025 : .045}" stroke-width=".9" transform="rotate(${i * 4} 100 100)"/>`);
    }

    // minute track
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      p.push(`<line x1="100" y1="${100 - dialR + 3}" x2="100" y2="${100 - dialR + 5.5}" stroke="${ink}" stroke-opacity=".6" stroke-width=".5" transform="rotate(${i * 6} 100 100)"/>`);
    }

    // hour markers
    const r = dialR;
    for (let i = 0; i < 12; i++) {
      const a = i * 30, rad = (a - 90) * Math.PI / 180;
      const hide = (isChrono && (i === 3 || i === 6 || i === 9)) || (cfg.comp === "date" && i === 3);
      if (hide) continue;
      if (cfg.markers === "roman") {
        const tr = r - 15, x = 100 + Math.cos(rad) * tr, y = 100 + Math.sin(rad) * tr;
        p.push(`<text x="${x}" y="${y + 3.4}" text-anchor="middle" font-family="Fraunces,serif" font-size="${i % 3 === 0 ? 10 : 8}" fill="${ink}" transform="rotate(${a} ${x} ${y})">${ROMAN[i]}</text>`);
      } else if (cfg.markers === "arabic" && i % 3 === 0) {
        const tr = r - 16;
        p.push(`<text x="${100 + Math.cos(rad) * tr}" y="${100 + Math.sin(rad) * tr + 4.5}" text-anchor="middle" font-family="Manrope,sans-serif" font-weight="600" font-size="13" fill="${ink}">${i === 0 ? 12 : i}</text>`);
      } else if (cfg.markers === "dots") {
        const tr = r - 10;
        p.push(`<circle cx="${100 + Math.cos(rad) * tr}" cy="${100 + Math.sin(rad) * tr}" r="${i % 3 === 0 ? 3 : 2}" fill="url(#${id}hand)" stroke="${ink}" stroke-opacity=".4" stroke-width=".3"/>`);
      } else if (cfg.markers === "baton") {
        const len = i % 3 === 0 ? 12 : 8, w = i === 0 ? 2.2 : 2.6;
        if (i === 0) {
          p.push(`<rect x="95.4" y="${100 - r + 7}" width="${w}" height="${len}" fill="url(#${id}hand)" stroke="#000" stroke-opacity=".3" stroke-width=".2"/>`);
          p.push(`<rect x="102.4" y="${100 - r + 7}" width="${w}" height="${len}" fill="url(#${id}hand)" stroke="#000" stroke-opacity=".3" stroke-width=".2"/>`);
        } else {
          p.push(`<rect x="${100 - w / 2}" y="${100 - r + 7}" width="${w}" height="${len}" fill="url(#${id}hand)" stroke="#000" stroke-opacity=".3" stroke-width=".2" transform="rotate(${a} 100 100)"/>`);
        }
      }
    }
    if (cfg.markers === "arabic") {
      for (let i = 0; i < 12; i++) if (i % 3) p.push(`<rect x="99" y="${100 - r + 7}" width="2" height="7" fill="${ink}" transform="rotate(${i * 30} 100 100)"/>`);
    }

    // brand + labels
    p.push(`<text x="100" y="${isChrono ? 70 : 74}" text-anchor="middle" font-family="Fraunces,serif" font-size="8" letter-spacing="1.8" fill="${ink}">RID ACCE</text>`);
    if (!isChrono) {
      p.push(`<text x="100" y="134" text-anchor="middle" font-family="Manrope,sans-serif" font-size="4.2" letter-spacing="1.6" fill="${ink}" fill-opacity=".75">MONTRES · ACCESSOIRES</text>`);
      p.push(`<text x="100" y="140" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="4.4" fill="${accent}">Maroc</text>`);
    }

    if (cfg.comp === "date") {
      p.push(`<rect x="${100 + r - 22}" y="94" width="14" height="12" rx="1" fill="#f8f5ee" stroke="url(#${id}hand)" stroke-width="1"/>`);
      p.push(`<text x="${100 + r - 15}" y="103" text-anchor="middle" font-family="Manrope,sans-serif" font-weight="600" font-size="8" fill="#1a1712">${new Date().getDate()}</text>`);
    }

    if (isChrono) {
      const sub = cfg.dial === "ivory" ? "#1d1b18" : "#000";
      const subInk = cfg.dial === "ivory" ? "#ece6da" : ink;
      [[72, 100, "sec"], [128, 100, "min30"], [100, 128, "hr12"]].forEach(([cx, cy, type]) => {
        p.push(`<circle cx="${cx}" cy="${cy}" r="14" fill="${sub}" fill-opacity="${cfg.dial === "ivory" ? .92 : .35}" stroke="url(#${id}hand)" stroke-width=".8"/>`);
        for (let i = 0; i < 12; i++) p.push(`<line x1="${cx}" y1="${cy - 13}" x2="${cx}" y2="${cy - (i % 3 ? 11.5 : 10)}" stroke="${subInk}" stroke-width=".5" transform="rotate(${i * 30} ${cx} ${cy})"/>`);
        p.push(`<g class="h-${type}" data-cx="${cx}" data-cy="${cy}"><line x1="${cx}" y1="${cy + 2}" x2="${cx}" y2="${cy - 11}" stroke="${type === "sec" ? accent : subInk}" stroke-width="1"/></g>`);
        p.push(`<circle cx="${cx}" cy="${cy}" r="1.4" fill="${subInk}"/>`);
      });
      p.push(`<text x="100" y="80" text-anchor="middle" font-family="Manrope,sans-serif" font-size="3.8" letter-spacing="1.4" fill="${ink}" fill-opacity=".75">CHRONOGRAPHE</text>`);
    }

    // hands
    p.push(`<g class="h-hour"><path d="M100 112 L96.6 100 L100 ${100 - r * .55} L103.4 100 Z" fill="${handFill}" stroke="#000" stroke-opacity=".35" stroke-width=".3"/><path d="M100 98 L100 ${100 - r * .5}" stroke="#fff" stroke-opacity=".25" stroke-width=".6"/></g>`);
    p.push(`<g class="h-min"><path d="M100 114 L97.6 100 L100 ${100 - r * .86} L102.4 100 Z" fill="${handFill}" stroke="#000" stroke-opacity=".35" stroke-width=".3"/><path d="M100 98 L100 ${100 - r * .8}" stroke="#fff" stroke-opacity=".25" stroke-width=".5"/></g>`);
    p.push(`<g class="h-sec"><line x1="100" y1="118" x2="100" y2="${100 - r + 4}" stroke="${accent}" stroke-width=".9"/><circle cx="100" cy="114" r="2.2" fill="${accent}"/></g>`);
    p.push(`<circle cx="100" cy="100" r="3.2" fill="${accent}"/><circle cx="100" cy="100" r="1.2" fill="#111"/>`);

    p.push(`<circle cx="100" cy="100" r="${dialR}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`);
    p.push(`<path d="M${100 - dialR} 100 A${dialR} ${dialR} 0 0 1 ${100 + dialR * .7} ${100 - dialR * .7} L${100 - dialR * .3} ${100 + dialR * .3} Z" fill="url(#${id}glass)"/>`);
    p.push(`</svg>`);
    return p.join("");
  }

  /* ---------------- Accessory renderer ---------------- */
  function accessorySVG(cfg) {
    const id = "a" + (++uid);
    const g = GEMS[cfg.gem || "diamond"].c;
    const leather = (LEATHERS[cfg.leather] || {}).color || cfg.leather || "#3a2a20";
    const lensColor = (LENSES[cfg.lens] || {}).color || cfg.lens || "#222";
    const initials = escapeHTML((cfg.initials || "").toUpperCase());
    const mono = initials || "A";
    const monoSize = (base) => base * [1, 1, .72, .56][Math.min(mono.length, 3)];
    const M = `url(#${id}metal)`, MH = `url(#${id}metalH)`, GEM = `url(#${id}gem)`, SHADE = `url(#${id}shade)`;
    const p = [];
    p.push(`<svg viewBox="0 -40 200 280" xmlns="http://www.w3.org/2000/svg" class="acc-svg" role="img" aria-label="${escapeHTML(cfg.name || "RID ACCE accessory")}">`);
    p.push(`<defs>${metalDefs(id, cfg.metal)}
      <radialGradient id="${id}gem" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${g[0]}"/><stop offset=".5" stop-color="${g[1]}"/><stop offset="1" stop-color="${g[2]}"/></radialGradient>
      <linearGradient id="${id}shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
      <radialGradient id="${id}shadow"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}lens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lensColor}" stop-opacity=".98"/><stop offset="1" stop-color="${lensColor}" stop-opacity=".7"/></linearGradient>
    </defs>`);
    const shadow = (cy, rx) => p.push(`<ellipse cx="100" cy="${cy}" rx="${rx}" ry="9" fill="url(#${id}shadow)"/>`);
    const sparkle = (x, y, s = 5) => p.push(`<path d="M${x} ${y - s} L${x + s * .22} ${y - s * .22} L${x + s} ${y} L${x + s * .22} ${y + s * .22} L${x} ${y + s} L${x - s * .22} ${y + s * .22} L${x - s} ${y} L${x - s * .22} ${y - s * .22}Z" fill="#fff" opacity=".9"/>`);
    const leatherShape = (d, extra = "") => p.push(`<path d="${d}" fill="${leather}" ${extra}/><path d="${d}" fill="${SHADE}"/>`);

    switch (cfg.kind) {
      case "ring": {
        shadow(196, 58);
        p.push(`<path fill-rule="evenodd" d="${ellipsePath(100, 125, 58, 60)} ${ellipsePath(100, 128, 47, 48)}" fill="${M}"/>`);
        p.push(`<path d="M52 120 A50 52 0 0 1 76 80" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round"/>`);
        p.push(`<path d="M150 140 A52 52 0 0 1 120 176" stroke="#000" stroke-opacity=".3" stroke-width="3" fill="none"/>`);
        if (cfg.style === "signet") {
          p.push(`<path d="M66 82 Q100 98 134 82 L130 66 Q100 76 70 66Z" fill="${MH}"/>`);
          p.push(`<ellipse cx="100" cy="64" rx="34" ry="16" fill="${M}"/>`);
          p.push(`<ellipse cx="100" cy="63" rx="27" ry="11.5" fill="${GEM}"/>`);
          p.push(`<text x="100" y="68" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="${monoSize(14)}" fill="${METALS[cfg.metal].stops[1]}" transform="scale(1 .85) translate(0 11)">${mono}</text>`);
          p.push(`<path d="M80 58 Q92 54 104 55" stroke="#fff" stroke-opacity=".35" stroke-width="1.5" fill="none"/>`);
        } else {
          p.push(`<path d="M86 74 L84 50 M114 74 L116 50 M94 76 L93 52 M106 76 L107 52" stroke="${M}" stroke-width="3" stroke-linecap="round"/>`);
          p.push(`<path d="M84 72 H116 L108 82 H92Z" fill="${M}"/>`);
          p.push(`<path d="M74 46 L86 32 H114 L126 46 L100 74Z" fill="${GEM}"/>`);
          p.push(`<path d="M74 46 H126 M86 32 L93 46 L100 32 L107 46 L114 32 M93 46 L100 74 L107 46" stroke="#fff" stroke-opacity=".55" stroke-width=".6" fill="none"/>`);
          sparkle(118, 34, 7); sparkle(80, 56, 3.5);
        }
        break;
      }
      case "bracelet": {
        shadow(176, 82);
        const cx = 100, cy = 110, rx = 74, ry = 40;
        if (cfg.style === "cuff") {
          p.push(`<path fill-rule="evenodd" d="${ellipsePath(cx, cy + 10, rx, ry)} ${ellipsePath(cx, cy + 4, rx - 9, ry - 9)}" fill="${M}" opacity=".55"/>`);
          p.push(`<path fill-rule="evenodd" d="${ellipsePath(cx, cy, rx, ry)} ${ellipsePath(cx, cy - 2, rx - 9, ry - 9)}" fill="${M}"/>`);
          p.push(`<path d="M${cx - rx + 6} ${cy + 8} Q${cx} ${cy + ry + 16} ${cx + rx - 6} ${cy + 8}" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" fill="none"/>`);
          for (let i = 0; i < 11; i++) {
            const t = Math.PI * (0.25 + i * 0.05), x = cx + Math.cos(t) * (rx - 4.5), y = cy + 2 + Math.sin(t) * (ry - 4.5);
            p.push(`<circle cx="${x}" cy="${y}" r="3.2" fill="${GEM}" stroke="${M}" stroke-width="1"/>`);
          }
          sparkle(cx - 6, cy + ry - 2, 6);
        } else {
          const N = cfg.style === "tennis" ? 40 : 30;
          const links = [];
          for (let i = 0; i < N; i++) {
            const t = (i / N) * Math.PI * 2, x = cx + Math.cos(t) * rx, y = cy + Math.sin(t) * ry;
            const ang = Math.atan2(ry * Math.cos(t), -rx * Math.sin(t)) * 180 / Math.PI;
            links.push({ x, y, ang, front: Math.sin(t) > 0 });
          }
          const draw = (l) => cfg.style === "tennis"
            ? `<g opacity="${l.front ? 1 : .55}"><circle cx="${l.x}" cy="${l.y}" r="5.4" fill="${M}"/><circle cx="${l.x}" cy="${l.y}" r="3.8" fill="${GEM}"/></g>`
            : `<ellipse cx="${l.x}" cy="${l.y}" rx="8.5" ry="5" transform="rotate(${l.ang} ${l.x} ${l.y})" fill="none" stroke="${M}" stroke-width="3.4" opacity="${l.front ? 1 : .55}"/>`;
          links.filter((l) => !l.front).forEach((l) => p.push(draw(l)));
          links.filter((l) => l.front).forEach((l) => p.push(draw(l)));
          p.push(`<rect x="${cx + rx - 9}" y="${cy - 7}" width="16" height="14" rx="3" fill="${M}"/>`);
          if (cfg.style === "tennis") { sparkle(cx - 20, cy + ry, 6); sparkle(cx + 34, cy + ry - 6, 4); }
        }
        break;
      }
      case "necklace": {
        shadow(214, 40);
        const chain = "M30 -40 C 30 60, 70 132, 100 136 C 130 132, 170 60, 170 -40";
        p.push(`<path d="${chain}" fill="none" stroke="${M}" stroke-width="2.6"/>`);
        p.push(`<path d="${chain}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="2.6" stroke-dasharray="1.5 2.5"/>`);
        p.push(`<circle cx="100" cy="141" r="5" fill="none" stroke="${M}" stroke-width="2"/>`);
        if (cfg.style === "disc") {
          p.push(`<circle cx="100" cy="172" r="26" fill="${M}"/><circle cx="100" cy="172" r="21" fill="none" stroke="#000" stroke-opacity=".3"/>`);
          p.push(`<path d="M100 154 L104 172 L100 190 L96 172Z M82 172 L100 168 L118 172 L100 176Z" fill="#000" fill-opacity=".35"/>`);
          p.push(`<text x="100" y="161" text-anchor="middle" font-family="Fraunces,serif" font-size="5" fill="#000" fill-opacity=".5">N</text>`);
          p.push(`<path d="M80 160 A24 24 0 0 1 96 148" stroke="#fff" stroke-opacity=".6" stroke-width="1.5" fill="none"/>`);
        } else {
          const drop = "M100 147 C 114 164, 120 180, 100 198 C 80 180, 86 164, 100 147Z";
          p.push(`<path d="${drop}" fill="${GEM}" stroke="${M}" stroke-width="3"/>`);
          p.push(`<path d="M100 152 L92 180 L100 194 L108 180Z M86 172 H114" stroke="#fff" stroke-opacity=".35" stroke-width=".6" fill="none"/>`);
          sparkle(94, 166, 5);
        }
        break;
      }
      case "earrings": {
        shadow(176, 64);
        [[66, 0], [134, 14]].forEach(([x, dy]) => {
          p.push(`<path d="M${x} ${70 + dy} C ${x} ${36 + dy}, ${x + 22} ${32 + dy}, ${x + 20} ${58 + dy}" fill="none" stroke="${M}" stroke-width="2.2" stroke-linecap="round"/>`);
          p.push(`<circle cx="${x}" cy="${74 + dy}" r="5" fill="${M}"/>`);
          p.push(`<line x1="${x}" y1="${78 + dy}" x2="${x}" y2="${98 + dy}" stroke="${M}" stroke-width="2"/>`);
          p.push(`<circle cx="${x}" cy="${120 + dy}" r="22" fill="${GEM}"/>`);
          p.push(`<ellipse cx="${x - 7}" cy="${112 + dy}" rx="7" ry="5" fill="#fff" opacity=".7" transform="rotate(-30 ${x - 7} ${112 + dy})"/>`);
          p.push(`<circle cx="${x}" cy="${98 + dy}" r="3" fill="${M}"/>`);
        });
        break;
      }
      case "cufflinks": {
        shadow(194, 66);
        [[74, 92], [128, 138]].forEach(([x, y]) => {
          p.push(`<rect x="${x + 10}" y="${y + 18}" width="10" height="26" rx="3" fill="${M}" opacity=".7" transform="rotate(-30 ${x} ${y})"/>`);
          p.push(`<circle cx="${x}" cy="${y}" r="34" fill="${M}"/>`);
          p.push(`<circle cx="${x}" cy="${y}" r="26" fill="${GEM}"/>`);
          p.push(`<circle cx="${x}" cy="${y}" r="26" fill="none" stroke="${MH}" stroke-width="1.5"/>`);
          p.push(`<text x="${x}" y="${y + 10}" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="${monoSize(28)}" fill="${METALS[cfg.metal].stops[1]}">${mono}</text>`);
          p.push(`<path d="M${x - 28} ${y - 10} A30 30 0 0 1 ${x - 8} ${y - 31}" stroke="#fff" stroke-opacity=".55" stroke-width="2" fill="none" stroke-linecap="round"/>`);
        });
        break;
      }
      case "sunglasses": {
        shadow(176, 84);
        const aviator = cfg.style === "aviator";
        const lensL = aviator
          ? "M28 88 C 28 76, 48 72, 68 74 C 88 76, 94 84, 92 96 C 90 120, 76 138, 58 136 C 38 134, 26 112, 28 88Z"
          : "M22 82 C 22 70, 42 64, 66 70 C 86 74, 94 80, 94 92 C 94 114, 80 126, 60 126 C 38 126, 24 108, 22 82Z";
        const frame = aviator ? M : ((FRAMES[cfg.frame] || {}).color || cfg.frame || "#222");
        const sw = aviator ? 2.8 : 7;
        [false, true].forEach((mirror) => {
          const tf = mirror ? `transform="translate(200 0) scale(-1 1)"` : "";
          p.push(`<g ${tf}>`);
          p.push(`<path d="${aviator ? "M30 84 L8 78" : "M24 78 L6 70"}" stroke="${frame}" stroke-width="${aviator ? 2.5 : 6}" stroke-linecap="round"/>`);
          p.push(`<path d="${lensL}" fill="url(#${id}lens)" stroke="${frame}" stroke-width="${sw}"/>`);
          if (!aviator) p.push(`<path d="${lensL}" fill="none" stroke="#2a1408" stroke-opacity=".55" stroke-width="${sw}" stroke-dasharray="3 5 1 4"/>`);
          p.push(`<path d="M38 88 C 44 80, 58 78, 70 80" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>`);
          if (aviator) p.push(`<circle cx="86" cy="110" r="3" fill="#fff" fill-opacity=".35" stroke="${M}" stroke-width=".8"/>`);
          p.push(`</g>`);
        });
        if (aviator) {
          p.push(`<path d="M92 88 Q100 82 108 88" stroke="${M}" stroke-width="2.6" fill="none"/>`);
          p.push(`<path d="M66 75 Q100 68 134 75" stroke="${M}" stroke-width="2.4" fill="none"/>`);
        } else {
          p.push(`<path d="M93 86 Q100 78 107 86" stroke="${frame}" stroke-width="6" fill="none"/>`);
        }
        break;
      }
      case "wallet": {
        shadow(196, 76);
        p.push(`<g transform="rotate(-8 100 110)">`);
        p.push(`<rect x="96" y="44" width="62" height="40" rx="4" fill="#c9a96e"/><rect x="104" y="40" width="50" height="40" rx="4" fill="#2a4a6a"/>`);
        leatherShape("M34 56 H166 Q172 56 172 62 V164 Q172 170 166 170 H34 Q28 170 28 164 V62 Q28 56 34 56Z");
        p.push(`<rect x="34" y="62" width="132" height="102" rx="4" fill="none" stroke="#fff" stroke-opacity=".28" stroke-dasharray="3 2.5" stroke-width=".8"/>`);
        p.push(`<path d="M30 60 V166" stroke="#000" stroke-opacity=".4" stroke-width="3"/>`);
        p.push(`<text x="100" y="118" text-anchor="middle" font-family="Fraunces,serif" font-size="11" letter-spacing="4" fill="#000" fill-opacity=".45">RID ACCE</text>`);
        p.push(`<text x="100" y="117" text-anchor="middle" font-family="Fraunces,serif" font-size="11" letter-spacing="4" fill="${METALS[cfg.metal].stops[1]}" fill-opacity=".55">RID ACCE</text>`);
        if (initials) p.push(`<text x="148" y="160" text-anchor="end" font-family="Fraunces,serif" font-style="italic" font-size="10" letter-spacing="1.5" fill="${METALS[cfg.metal].stops[1]}" fill-opacity=".8">${initials}</text>`);
        p.push(`</g>`);
        break;
      }
      case "belt": {
        shadow(190, 86);
        p.push(`<g transform="rotate(-16 100 110)">`);
        leatherShape("M70 96 H178 L192 110 L178 124 H70Z");
        p.push(`<path d="M74 100 H178 M74 120 H178" stroke="#fff" stroke-opacity=".3" stroke-dasharray="3 2.5" stroke-width=".7"/>`);
        [130, 142, 154, 166].forEach((x) => p.push(`<circle cx="${x}" cy="110" r="2.2" fill="#000" fill-opacity=".7"/>`));
        leatherShape("M4 96 H52 V124 H4Z");
        p.push(`<path d="M4 100 H50 M4 120 H50" stroke="#fff" stroke-opacity=".3" stroke-dasharray="3 2.5" stroke-width=".7"/>`);
        p.push(`<rect x="76" y="92" width="9" height="36" rx="2" fill="${leather}"/><rect x="76" y="92" width="9" height="36" rx="2" fill="#000" fill-opacity=".35"/>`);
        p.push(`<rect x="44" y="86" width="30" height="48" rx="6" fill="none" stroke="${M}" stroke-width="6"/>`);
        p.push(`<path d="M44 110 H86" stroke="${M}" stroke-width="3.4" stroke-linecap="round"/>`);
        p.push(`<path d="M48 88 H70" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/>`);
        p.push(`</g>`);
        break;
      }
      case "handbag": {
        shadow(214, 80);
        p.push(`<path d="M68 96 C 66 26, 134 26, 132 96" fill="none" stroke="${leather}" stroke-width="9" stroke-linecap="round"/>`);
        p.push(`<path d="M68 96 C 66 26, 134 26, 132 96" fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="2"/>`);
        leatherShape("M42 92 H158 L172 196 Q172 206 162 206 H38 Q28 206 28 196Z");
        p.push(`<path d="M42 92 H158 L163 146 Q100 164 37 146Z" fill="#000" fill-opacity=".2"/>`);
        p.push(`<path d="M41 98 H159 L162 142 Q100 158 38 142Z" fill="none" stroke="#fff" stroke-opacity=".25" stroke-dasharray="3 2.5" stroke-width=".7"/>`);
        p.push(`<rect x="62" y="88" width="12" height="10" rx="3" fill="${M}"/><rect x="126" y="88" width="12" height="10" rx="3" fill="${M}"/>`);
        p.push(`<rect x="86" y="144" width="28" height="18" rx="5" fill="${M}"/>`);
        p.push(`<text x="100" y="158" text-anchor="middle" font-family="Fraunces,serif" font-style="italic" font-size="13" fill="#000" fill-opacity=".45">A</text>`);
        break;
      }
    }
    p.push(`</svg>`);
    return p.join("");
  }

  /* ---------------- Live hands loop ---------------- */
  let hands = [];
  function collectHands() {
    hands = $$("[data-watch]").map((svg) => ({
      h: $(".h-hour", svg), m: $(".h-min", svg), s: $(".h-sec:not([data-cx])", svg),
      sub: $$("[data-cx]", svg),
    }));
  }
  const liveTime = $("#liveTime");
  function tick() {
    const now = new Date();
    const sec = now.getSeconds() + now.getMilliseconds() / 1000;
    const min = now.getMinutes() + sec / 60, hr = (now.getHours() % 12) + min / 60;
    const aS = sec * 6, aM = min * 6, aH = hr * 30;
    for (const w of hands) {
      if (w.h) w.h.setAttribute("transform", `rotate(${aH} 100 100)`);
      if (w.m) w.m.setAttribute("transform", `rotate(${aM} 100 100)`);
      if (w.s) w.s.setAttribute("transform", `rotate(${aS} 100 100)`);
      w.sub.forEach((g) => {
        const cls = g.getAttribute("class");
        const a = cls === "h-sec" ? aS : cls === "h-min30" ? (min % 30) * 12 : hr * 30;
        g.setAttribute("transform", `rotate(${a} ${g.dataset.cx} ${g.dataset.cy})`);
      });
    }
    if (liveTime) liveTime.textContent = now.toLocaleTimeString("en-GB");
    requestAnimationFrame(tick);
  }

  /* =========================================================
     PAGE WIRING — each block only runs if its elements exist,
     so one script serves index.html, shop.html and gifts.html
     ========================================================= */
  const root = document.documentElement;
  // Translate static markup: data-i18n (text), data-i18n-html (markup), data-i18n-ph (placeholder)
  if (LANG !== "en") {
    $$("[data-i18n]").forEach((el) => { const k = el.dataset.i18n; if (UI[k] !== undefined) el.textContent = UI[k]; });
    $$("[data-i18n-html]").forEach((el) => { const k = el.dataset.i18nHtml; if (UI[k] !== undefined) el.innerHTML = UI[k]; });
    $$("[data-i18n-ph]").forEach((el) => { const k = el.dataset.i18nPh; if (UI[k] !== undefined) el.placeholder = UI[k]; });
  }
  const pageKey = document.body.dataset.page;
  if (pageKey && UI["meta.title." + pageKey]) document.title = UI["meta.title." + pageKey];
  root.classList.add("i18n-ready");

  // Language switch: remember the choice and reload in that language
  $$("[data-lang]").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === LANG);
    b.setAttribute("aria-pressed", b.dataset.lang === LANG);
    b.addEventListener("click", () => {
      if (b.dataset.lang === LANG) return;
      try { localStorage.setItem("aurele-lang", b.dataset.lang); } catch { /* storage unavailable */ }
      location.reload();
    });
  });
  // Light / dark theme (the choice is remembered; dark is the brand default)
  const themeBtn = $("#themeBtn");
  const paintTheme = () => {
    const label = root.dataset.theme === "light" ? t("theme.toDark") : t("theme.toLight");
    themeBtn.setAttribute("aria-label", label); themeBtn.title = label;
  };
  if (themeBtn) {
    paintTheme();
    themeBtn.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      try { localStorage.setItem("aurele-theme", root.dataset.theme); } catch { /* storage unavailable */ }
      paintTheme();
    });
  }

  const params = new URLSearchParams(location.search);
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const LOW_STOCK = 3;
  const soldOut = (p) => !!p && (p.stock === 0 ||
    (!!p.pack && p.pack.some((c) => { const q = byId(c.pid); return q && Number.isInteger(q.stock) && q.stock < c.qty; })));
  // discounts: "was" = price before discount of a version (first version for the card)
  const wasOf = (p, v) => { v = v || (p.variants || [])[0]; return v && v.was > v.price ? v.was : 0; };
  const pctOff = (was, price) => (was > price ? Math.round((1 - price / was) * 100) : 0);
  const isDeal = (p) => !!(wasOf(p) || p.pack);
  const packCount = (p) => (p.pack || []).reduce((a, c) => a + c.qty, 0);
  const lowLeft = (p) => !!p && Number.isInteger(p.stock) && p.stock > 0 && p.stock <= LOW_STOCK;
  const cardHTML = (p, tag) => `
    <button class="card${soldOut(p) ? " is-soldout" : ""}${isDeal(p) ? " is-deal" : ""}" data-id="${escapeHTML(p.id)}" data-cat="${escapeHTML(p.cat)}" data-gender="${escapeHTML(p.gender)}" data-price="${Number(p.price) || 0}" data-deal="${isDeal(p) ? 1 : 0}">
      ${soldOut(p) ? `<span class="card-tag card-out">${escapeHTML(t("stock.out"))}</span>`
        : p.pack ? `<span class="card-tag card-pack">${escapeHTML(t("deal.pack"))}${wasOf(p) ? ` <bdi dir="ltr">−${pctOff(wasOf(p), (p.variants[0] || p).price)}%</bdi>` : ""}</span>`
        : wasOf(p) ? `<span class="card-tag card-sale"><bdi dir="ltr">−${pctOff(wasOf(p), (p.variants[0] || p).price)}%</bdi></span>` : tag ? `<span class="card-tag">${escapeHTML(tag)}</span>` : p.limited ? `<span class="card-tag">${escapeHTML(t("tag.limited", p.limited))}</span>` : ""}
      <span class="card-gender">${t("cat." + p.cat)}</span>
      <div class="card-visual${p.kind === "photo" ? " is-photo" : ""}">${render(p)}</div>
      ${p.brand ? `<span class="card-brand">${escapeHTML(p.brand)}</span>` : ""}
      <div class="card-row"><h3>${escapeHTML(p.name)}</h3><span class="price">${wasOf(p) ? `<s class="was">${fmt(wasOf(p))}</s>` : ""}${fmt(p.price)}</span></div>
      ${p.pack ? `<span class="card-packline">${escapeHTML(t("deal.includes", packCount(p)))}</span>` : ""}
      <p>${escapeHTML(subtitle(p))}</p>
    </button>`;

  // Lacquered gift box with a gold ribbon (home teaser + gifts page)
  function giftBoxSVG() {
    const id = "g" + (++uid);
    return `<svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="RID ACCE gift box">
      <defs>${metalDefs(id, "gold")}
        <linearGradient id="${id}lac" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2e2e30"/><stop offset=".5" stop-color="#141415"/><stop offset="1" stop-color="#060606"/></linearGradient>
        <radialGradient id="${id}sh"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      </defs>
      <ellipse cx="100" cy="190" rx="78" ry="9" fill="url(#${id}sh)"/>
      <rect x="38" y="92" width="124" height="94" rx="3" fill="url(#${id}lac)"/>
      <rect x="32" y="74" width="136" height="26" rx="3" fill="url(#${id}lac)" stroke="#fff" stroke-opacity=".08"/>
      <path d="M36 77 H164" stroke="#fff" stroke-opacity=".18"/>
      <rect x="92" y="74" width="16" height="112" fill="url(#${id}metalH)"/>
      <rect x="32" y="82" width="136" height="9" fill="url(#${id}metal)" opacity=".95"/>
      <path d="M100 76 C 74 44, 46 58, 62 76 C 70 84, 88 80, 100 76Z" fill="url(#${id}metal)"/>
      <path d="M100 76 C 126 44, 154 58, 138 76 C 130 84, 112 80, 100 76Z" fill="url(#${id}metal)"/>
      <path d="M96 78 L82 104 L90 102 L94 110 L100 80Z M104 78 L118 104 L110 102 L106 110 L100 80Z" fill="url(#${id}metal)" opacity=".9"/>
      <ellipse cx="100" cy="76" rx="8" ry="6" fill="url(#${id}hand)"/>
      <path d="M70 60 Q78 56 86 64" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" fill="none"/>
      <text x="100" y="160" text-anchor="middle" font-family="Fraunces,serif" font-size="9" letter-spacing="3" fill="#d9b878" fill-opacity=".85">RID ACCE</text>
    </svg>`;
  }

  /* ---------------- Home: hero ---------------- */
  const hero = $("#heroWatch");
  if (hero) {
    hero.innerHTML = watchSVG({ kind: "watch", metal: "gold", dial: "ivory", strap: "cognac", markers: "roman", comp: "date", name: "RID ACCE" });
    const heroVisual = $("#heroVisual");
    if (matchMedia("(pointer:fine)").matches) {
      heroVisual.addEventListener("mousemove", (e) => {
        const r = heroVisual.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        hero.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(10px)`;
      });
      heroVisual.addEventListener("mouseleave", () => (hero.style.transform = ""));
    }
  }
  // "Pieces in the collection" counter = real number of products
  $$("[data-count-products]").forEach((el) => (el.dataset.count = String(PRODUCTS.length)));
  const teaser = $("#teaserGift");
  if (teaser) teaser.innerHTML = giftBoxSVG();

  /* For Him / For Her tiles use fixed lifestyle photos (images/brand/), set in the HTML. */
  const dealsGrid = $("#dealsGrid");
  if (dealsGrid) {
    const deals = PRODUCTS.filter((p) => isDeal(p) && !soldOut(p));
    if (deals.length) { dealsGrid.innerHTML = deals.slice(0, 8).map((p) => cardHTML(p)).join(""); $("#deals").hidden = false; }
  }

  /* ---------------- Shop page ---------------- */
  const grid = $("#grid");
  const GENDER_COPY = Object.fromEntries(["men", "women"].map((g) => [g, {
    eyebrow: t(`edit.${g}.eyebrow`), title: t(`edit.${g}.title`), em: t(`edit.${g}.em`), sub: t(`edit.${g}.sub`),
    name: t(`nav.${g}`), photo: `images/brand/edit-${g}.webp`,
  }]));
  const filter = {
    gender: ["men", "women"].includes(params.get("g")) ? params.get("g") : null,
    cat: ["Watches", "Jewellery", "Leather goods", "Eyewear", "Packs", "deals"].includes(params.get("c")) ? params.get("c") : "all",
  };

  function applyFilter() {
    let n = 0;
    $$(".card", grid).forEach((c) => {
      const show = (c.dataset.gender === filter.gender || c.dataset.gender === "unisex") &&
        (filter.cat === "all" || (filter.cat === "deals" ? c.dataset.deal === "1" : c.dataset.cat === filter.cat));
      c.classList.toggle("hide", !show);
      if (show) { n++; c.classList.add("in"); }
    });
    $$("#catFilters .filter").forEach((b) => b.classList.toggle("active", b.dataset.cat === filter.cat));
    // "Packs" and "Offers" only appear when there is something to show
    const mine = PRODUCTS.filter((p) => p.gender === filter.gender || p.gender === "unisex");
    const pp = $('#catFilters [data-cat="Packs"]'), dd = $('#catFilters [data-cat="deals"]');
    if (pp) pp.hidden = !mine.some((p) => p.pack) && filter.cat !== "Packs";
    if (dd) dd.hidden = !mine.some(isDeal) && filter.cat !== "deals";
    $("#resultCount").textContent = countLabel(n);
    $("#listTitle").textContent = `${t(filter.cat === "all" ? "list.all" : "cat." + filter.cat)} ${t("for." + filter.gender)}`;
    $("#gridEmpty").hidden = n > 0;
    const c = GENDER_COPY[filter.gender];
    $("#shopEyebrow").textContent = c.eyebrow;
    $("#shopTitle").textContent = c.title + " ";
    $("#shopTitle").appendChild(Object.assign(document.createElement("em"), { textContent: c.em }));
    $("#shopSub").textContent = c.sub;
    $("#crumbGender").textContent = c.name;
    if (!$("#editPhoto").src.endsWith(c.photo)) $("#editPhoto").src = c.photo;
    document.title = `${c.name} — RID ACCE`;
    const q = new URLSearchParams({ g: filter.gender });
    if (filter.cat !== "all") q.set("c", filter.cat);
    history.replaceState(null, "", "shop.html?" + q);
    setActiveNav(filter.gender);
    const giftLink = $("#giftBandLink");
    if (giftLink) giftLink.href = `gifts.html?g=${filter.gender}`;
  }

  if (grid) {
    const choosing = !filter.gender;
    $("#chooser").hidden = !choosing;
    $("#shopMain").hidden = choosing;
    if (!choosing) {
      grid.innerHTML = PRODUCTS.map((p) => cardHTML(p)).join("");
      $$(".card", grid).forEach((c, i) => (c.dataset.idx = String(i)));
      // sort: featured (catalogue order) or by price
      $("#sortSel").addEventListener("change", (e) => {
        const mode = e.target.value;
        const key = (c) => mode === "featured" ? +c.dataset.idx : +c.dataset.price;
        $$(".card", grid).sort((x, y) => mode === "desc" ? key(y) - key(x) : key(x) - key(y)).forEach((c) => grid.appendChild(c));
      });
      $("#catFilters").addEventListener("click", (e) => {
        const b = e.target.closest(".filter"); if (!b) return;
        filter.cat = b.dataset.cat; applyFilter();
      });
    }
  }

  /* ---------------- Product options (per product type) ----------------
     Each group: { key, label, type: swatch|chip|text, values, name(v), price(v), bg(v) }
     Price shown = product price + (option price − price of the product's default option). */
  const named = (src) => (v) => src[v].name;
  const swatch = (key, label, src, values, price, bg) => ({ key, label, type: "swatch", values, name: named(src), price: price || (() => 0), bg });
  const chip = (key, label, values, name, price) => ({ key, label, type: "chip", values, name: name || ((v) => v), price: price || (() => 0) });
  const text = (key, label, ph, max) => ({ key, label, type: "text", ph, max });
  const priced = (map) => (v) => map[v] || 0;
  const bgMetal = (k) => { const s = METALS[k].stops; return `linear-gradient(135deg, ${s[0]}, ${s[1]} 40%, ${s[2]})`; };
  const bgGem = (k) => { const c = GEMS[k].c; return `radial-gradient(circle at 35% 30%, ${c[0]}, ${c[1]} 55%, ${c[2]})`; };
  const bgColor = (src) => (k) => src[k].color;
  const metalOpt = (values, map, label = t("opt.metal")) => swatch("metal", label, METALS, values, priced(map || {}), bgMetal);
  const gemOpt = (values, map, label = t("opt.stone")) => swatch("gem", label, GEMS, values, priced(map || {}), bgGem);
  const leatherOpt = (values) => swatch("leather", t("opt.leather"), LEATHERS, values, null, bgColor(LEATHERS));
  const sizes = (label, values) => chip("size", label, values.map(String), (v) => v);

  function optionGroups(p) {
    switch (p.kind) {
      case "watch":
        if (p.limited) return [
          swatch("strap", t("opt.strap"), STRAPS, Object.keys(STRAPS), (v) => STRAPS[v].price, (k) => k === "bracelet" ? "repeating-linear-gradient(90deg,#d7d9dc 0 6px,#8d9196 6px 7px)" : STRAPS[k].color),
          text("engraving", t("opt.casebackEngraving"), t("ph.24"), 24),
        ];
        return [
          metalOpt(["steel", "gold", "rose", "white", "noir"], Object.fromEntries(Object.entries(METALS).map(([k, m]) => [k, m.price])), t("opt.caseMetal")),
          swatch("dial", t("opt.dial"), DIALS, Object.keys(DIALS), null, (k) => `radial-gradient(circle at 35% 30%, ${DIALS[k].c1}, ${DIALS[k].c2})`),
          chip("markers", t("opt.markers"), Object.keys(MARKERS), (v) => MARKERS[v]),
          chip("comp", t("opt.comp"), Object.keys(COMPS), (v) => COMPS[v].name, (v) => COMPS[v].price),
          { ...chip("diamonds", t("opt.bezel"), ["no", "yes"], (v) => (v === "yes" ? t("bezel.diamond") : t("bezel.polished")), priced({ yes: 52800 })), disabledIf: (s) => s.comp === "diver" },
          swatch("strap", t("opt.strap"), STRAPS, Object.keys(STRAPS), (v) => STRAPS[v].price, (k) => k === "bracelet" ? "repeating-linear-gradient(90deg,#d7d9dc 0 6px,#8d9196 6px 7px)" : STRAPS[k].color),
          text("engraving", t("opt.casebackEngraving"), t("ph.24"), 24),
        ];
      case "ring":
        return p.style === "signet"
          ? [metalOpt(["gold", "rose", "white"], { white: 2000 }), gemOpt(["onyx", "sapphire", "emerald"], { sapphire: 3850, emerald: 3850 }, t("opt.tableStone")),
             sizes(t("opt.size"), [58, 60, 62, 64, 66, 68, 70]), text("initials", t("opt.initialsTable"), t("ph.3"), 3)]
          : [metalOpt(["rose", "gold", "white"], { white: 2000 }), gemOpt(["diamond", "sapphire", "ruby", "emerald"], { sapphire: -6600, ruby: -5500, emerald: -6050 }, t("opt.centreStone")),
             sizes(t("opt.size"), [48, 50, 52, 54, 56, 58]), text("engraving", t("opt.insideEngraving"), t("ph.20"), 20)];
      case "bracelet":
        if (p.style === "chain") return [metalOpt(["steel", "gold", "noir"], { gold: 15400, noir: 1000 }), sizes(t("opt.length"), ["19 cm", "20 cm", "21 cm"])];
        return [metalOpt(["gold", "rose", "white"], { white: 2750 }),
          gemOpt(p.style === "tennis" ? ["diamond", "sapphire", "ruby", "emerald"] : ["diamond", "sapphire", "ruby"], { sapphire: -7700, ruby: -6600, emerald: -7150 }, p.style === "tennis" ? t("opt.stones") : t("opt.pave")),
          sizes(t("opt.size"), ["S · 16 cm", "M · 17 cm", "L · 18 cm"])];
      case "necklace":
        if (p.style === "disc") return [metalOpt(["steel", "gold", "noir"], { gold: 9900, noir: 650 }), sizes(t("opt.chain"), ["50 cm", "55 cm", "60 cm"]), text("engraving", t("opt.reverseEngraving"), t("ph.20"), 20)];
        return [metalOpt(["rose", "gold", "white"], { white: 1300 }), gemOpt(["ruby", "sapphire", "emerald", "diamond"], { diamond: 8800 }), sizes(t("opt.chain"), ["40 cm", "42 cm", "45 cm"])];
      case "earrings":
        return [metalOpt(["gold", "rose", "white"], { white: 1000 }), gemOpt(["pearl", "diamond", "sapphire"], { diamond: 13200, sapphire: 6600 }, t("opt.drop"))];
      case "cufflinks":
        return [metalOpt(["gold", "rose", "white", "steel"], { white: 1300, steel: -3300 }), gemOpt(["onyx", "sapphire", "pearl"], { sapphire: 1650, pearl: 1000 }, t("opt.inlay")),
          text("initials", t("opt.monogram"), t("ph.3A"), 3)];
      case "sunglasses":
        return p.style === "aviator"
          ? [metalOpt(["gold", "steel", "noir"], {}, t("opt.frame")), swatch("lens", t("opt.lens"), LENSES, ["g15", "grey", "brown", "blue"], null, bgColor(LENSES))]
          : [swatch("frame", t("opt.frame"), FRAMES, Object.keys(FRAMES), null, bgColor(FRAMES)), swatch("lens", t("opt.lens"), LENSES, ["brown", "grey", "rose", "g15"], null, bgColor(LENSES))];
      case "wallet":
        return [leatherOpt(["black", "cognac", "navy", "bordeaux", "taupe"]), text("initials", t("opt.hotStamp"), t("ph.3"), 3)];
      case "belt":
        return [leatherOpt(["cognac", "black", "navy"]), metalOpt(["steel", "gold", "noir"], { gold: 1300, noir: 450 }, t("opt.buckle")),
          sizes(t("opt.size"), ["85", "90", "95", "100", "105", "110"])];
      case "handbag":
        return [leatherOpt(["bordeaux", "black", "cognac", "taupe", "navy"]), metalOpt(["gold", "steel"], {}, t("opt.hardware"))];
      case "photo": {
        const gs = [];
        if (p.variants && p.variants.length > 1) {
          const src = Object.fromEntries(p.variants.map((v) => [v.key, { name: loc(v.name) }]));
          const byKey = (k) => p.variants.find((v) => v.key === k);
          gs.push(swatch("variant", t("opt.version"), src, p.variants.map((v) => v.key), (k) => byKey(k).price || p.price, (k) => byKey(k).swatch));
        }
        if (p.chain) gs.push(sizes(t("opt.chain"), p.chain));
        return gs;
      }
      default:
        return [];
    }
  }
  const defaultOf = (g, p) => {
    if (g.type === "text") return "";
    if (g.key === "diamonds") return p.diamonds ? "yes" : "no";
    if (g.key === "size") return g.values[Math.floor((g.values.length - 1) / 2)];
    return g.values.includes(p[g.key]) ? p[g.key] : g.values[0];
  };

  /* ---------------- Product modal = mini atelier (shop) ---------------- */
  const modal = $("#modal");
  let current = null, groups = [], sel = {}, base = {};
  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
  }
  // selection → visual config the renderers understand
  function configured() {
    const cfg = visual(current);
    groups.forEach((g) => {
      if (g.type === "text") { if (g.key === "initials") cfg.initials = sel.initials; return; }
      if (g.key === "size") return;
      cfg[g.key] = sel[g.key];
    });
    if (cfg.comp === "diver") cfg.diamonds = "no";
    return cfg;
  }
  const optionPrice = (g, v) => (g.type === "text" ? 0 : g.price(v));
  function modalPrice() {
    return current.price + groups.reduce((sum, g) => {
      if (g.type === "text" || (g.disabledIf && g.disabledIf(sel))) return sum + (g.disabledIf && g.disabledIf(sel) ? -optionPrice(g, base[g.key]) : 0);
      return sum + optionPrice(g, sel[g.key]) - optionPrice(g, base[g.key]);
    }, 0);
  }
  // Readable summary of a selection, in the current language (also used to re-label bag items)
  function summaryFor(p, s) {
    return optionGroups(p).filter((g) => g.type !== "text" && s[g.key] !== undefined && !(g.disabledIf && g.disabledIf(s)))
      .map((g) => (g.key === "size" ? `${g.label} ${s[g.key]}` : g.name(s[g.key]))).join(" · ");
  }
  const selectionSummary = () => summaryFor(current, sel);
  const isCustomised = () => groups.some((g) => sel[g.key] !== base[g.key]);

  function buildOptionsUI() {
    const box = $("#modalOptions");
    box.hidden = !groups.length;
    box.innerHTML = groups.length ? `<p class="options-title">${t("options.title")}</p>` + groups.map((g, i) => {
      const head = `<div class="opt-label"><span>${String(i + 1).padStart(2, "0")}</span> ${g.label} <b data-lbl="${g.key}"></b></div>`;
      if (g.type === "text") return `<div class="opt-group">${head}<input class="input" data-text="${g.key}" maxlength="${g.max}" placeholder="${g.ph}" value="${escapeHTML(sel[g.key])}" /></div>`;
      const btns = g.values.map((v) => {
        const d = optionPrice(g, v) - optionPrice(g, base[g.key]);
        const delta = d ? ` <small>${d > 0 ? "+" : "−"}${fmt(Math.abs(d))}</small>` : "";
        return g.type === "swatch"
          ? `<button class="swatch" data-key="${g.key}" data-v="${escapeHTML(v)}" title="${escapeHTML(g.name(v))}${d ? ` (${d > 0 ? "+" : "−"}${fmt(Math.abs(d))})` : ""}" aria-label="${escapeHTML(g.name(v))}" style="background:${escapeHTML(safeCss(g.bg(v)) || "#888")}"></button>`
          : `<button class="chip" data-key="${g.key}" data-v="${escapeHTML(v)}">${escapeHTML(g.name(v))}${delta}</button>`;
      }).join("");
      return `<div class="opt-group">${head}<div class="${g.type === "swatch" ? "swatches" : "chips"}">${btns}</div></div>`;
    }).join("") : "";
  }
  let modalQty = 1, qtyWarn = "";
  const qtyRoom = () => (current ? Math.max(0, Math.min(10, roomFor(current.id))) : 10);
  function updateModal() {
    const now = configured(), visualBox = $("#modalWatch");
    visualBox.innerHTML = render(now);
    visualBox.classList.toggle("is-photo", now.kind === "photo");
    const v = now.kind === "photo" ? variantOf(now) : null;
    if (v && v.imgs.length > 1) {
      visualBox.insertAdjacentHTML("beforeend", `<div class="photo-thumbs">${v.imgs.map((src, i) =>
        `<button class="thumb${i ? "" : " active"}" data-src="${escapeHTML(src)}" aria-label="${i + 1}"><img src="${escapeHTML(src)}" alt="" /></button>`).join("")}</div>`);
    }
    collectHands();
    groups.forEach((g) => {
      const off = g.disabledIf && g.disabledIf(sel);
      const lbl = $(`[data-lbl="${g.key}"]`, modal);
      if (g.type === "text") lbl.textContent = sel[g.key] ? t("opt.complimentary") : t("opt.optional");
      else lbl.textContent = off ? t("opt.notWithDiver") : (g.key === "size" ? sel[g.key] : g.name(sel[g.key]));
      $$(`[data-key="${g.key}"]`, modal).forEach((b) => {
        b.classList.toggle("active", !off && b.dataset.v === sel[g.key]);
        b.disabled = !!off;
      });
    });
    const price = fmt(modalPrice());
    const vNow = v || (now.variants || [])[0], wasNow = vNow ? wasOf(now, vNow) : 0;
    $("#modalPrice").innerHTML = (wasNow ? `<s>${escapeHTML(fmt(wasNow))}</s> ` : "") + escapeHTML(price) +
      (wasNow ? ` <span class="save-badge" dir="ltr">−${pctOff(wasNow, vNow.price)}%</span>` : "");
    $("#modalSave").hidden = !wasNow;
    if (wasNow) $("#modalSave").textContent = t("deal.save", fmt((wasNow - vNow.price) * modalQty));
    $("#modalBuyPrice").textContent = fmt(modalPrice() * modalQty);
    $("#modalBuyNote").textContent = isCustomised() ? t("buy.custom") : t("buy.asShown");
    $("#modalReset").hidden = !isCustomised();
    // stock
    const addBtn = $("#modalAdd");
    if (!addBtn.dataset.label) addBtn.dataset.label = addBtn.textContent;
    const out = soldOut(current);
    addBtn.disabled = out;
    addBtn.textContent = out ? t("stock.out") : addBtn.dataset.label;
    const room = qtyRoom(), full = !out && room <= 0;
    if (full) { addBtn.disabled = true; addBtn.textContent = addBtn.dataset.label; }
    const note = $("#modalBuyNote");
    if (out) note.textContent = t("stock.out");
    else if (full) note.textContent = t("stock.allInBag");
    else if (qtyWarn) note.textContent = qtyWarn;
    note.classList.toggle("is-warn", out || full || !!qtyWarn);
    // quantity picker
    $("#modalQty").hidden = out;
    $("#modalQtyIn").value = modalQty;
    $("#modalQtyIn").max = String(Math.max(1, room));
    $('#modalQty [data-q="-1"]').disabled = modalQty <= 1;
    $('#modalQty [data-q="1"]').disabled = full || modalQty >= room;
  }

  if (modal) {
    $("#modalPrice").insertAdjacentHTML("afterend", `<p class="modal-save" id="modalSave" hidden></p>`);
    $("#modalDesc").insertAdjacentHTML("afterend", `<div class="modal-pack" id="modalPack" hidden></div>`);
    $("#modalAdd").insertAdjacentHTML("beforebegin", `
      <div class="qty-pick" id="modalQty" role="group" aria-label="${escapeHTML(t("qty.label"))}">
        <button type="button" data-q="-1" aria-label="−">−</button>
        <input id="modalQtyIn" type="number" inputmode="numeric" min="1" max="10" value="1" aria-label="${escapeHTML(t("qty.label"))}" />
        <button type="button" data-q="1" aria-label="+">+</button>
      </div>`);
    // asked for more than we have → keep the maximum and say how many are available
    const setQty = (n) => {
      const room = qtyRoom();
      n = Math.floor(Number(n)) || 1;
      qtyWarn = "";
      if (n > room) {
        n = Math.max(1, room);
        qtyWarn = room < 10 ? t("stock.notEnough") : t("qty.max", 10);
        toast(qtyWarn);
      }
      modalQty = Math.max(1, n);
      updateModal();
    };
    $("#modalQty").addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]"); if (!b || b.disabled) return;
      setQty(modalQty + Number(b.dataset.q));
    });
    $("#modalQtyIn").addEventListener("change", (e) => setQty(e.target.value));
    const openModal = (p) => {
      current = p;
      modalQty = 1; qtyWarn = "";
      groups = optionGroups(p);
      sel = {}; groups.forEach((g) => (sel[g.key] = defaultOf(g, p)));
      base = { ...sel };
      $("#modalCat").textContent = (p.brand ? p.brand + " · " : "") + `${t("cat." + p.cat)} · ${t("gender." + p.gender)}` + (p.limited ? " · " + p.limited : "");
      $("#modalName").textContent = p.name;
      $("#modalDesc").textContent = p.desc + (p.limited ? t("modal.limitedNote") : "");
      const packBox = $("#modalPack");
      packBox.hidden = !p.pack;
      if (p.pack) {
        const pieces = p.pack.map((c) => ({ c, q: byId(c.pid) })).filter((x) => x.q);
        const sep = pieces.reduce((a, x) => a + x.q.price * x.c.qty, 0);
        packBox.innerHTML = `<p class="pack-head">${escapeHTML(t("deal.packTitle"))}</p><ul class="pack-list">${pieces.map(({ c, q }) => `
          <li><span class="pack-img">${q.img ? `<img src="${escapeHTML(q.img)}" alt="" loading="lazy" />` : ""}</span>
            <span class="pack-name">${c.qty > 1 ? `${c.qty} × ` : ""}${escapeHTML(q.name)}${q.brand ? `<small>${escapeHTML(q.brand)}</small>` : ""}</span>
            <span class="pack-price">${escapeHTML(fmt(q.price * c.qty))}</span></li>`).join("")}</ul>
          ${sep > p.price ? `<p class="pack-sep">${escapeHTML(t("deal.separately", fmt(sep)))}</p>` : ""}`;
      }
      $("#modalSpecs").innerHTML = Object.entries(p.specs).map(([k, v]) => `<dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd>`).join("");
      buildOptionsUI();
      updateModal();
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("locked");
      $(".modal-card", modal).scrollTop = 0;
      $(".modal-info", modal).scrollTop = 0;
    };
    document.addEventListener("click", (e) => {
      const card = e.target.closest(".card[data-id]");
      if (card) openModal(byId(card.dataset.id));
    });
    $("#modalWatch").addEventListener("click", (e) => {
      const th = e.target.closest(".thumb"); if (!th) return;
      const src = safeUrl(th.dataset.src); if (src) $(".product-photo", modal).src = src;
      $$(".thumb", modal).forEach((b) => b.classList.toggle("active", b === th));
    });
    $("#modalOptions").addEventListener("click", (e) => {
      const b = e.target.closest("[data-key]");
      if (!b || b.disabled) return;
      sel[b.dataset.key] = b.dataset.v;
      updateModal();
    });
    $("#modalOptions").addEventListener("input", (e) => {
      const k = e.target.dataset.text; if (!k) return;
      sel[k] = e.target.value.trim();
      updateModal();
    });
    $("#modalReset").addEventListener("click", () => { sel = { ...base }; buildOptionsUI(); updateModal(); });
    $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
    $("#modalAdd").addEventListener("click", () => {
      if (soldOut(current)) return;
      const note = sel.engraving || sel.initials || "";
      addToBag({
        qty: modalQty,
        key: current.id + "|" + JSON.stringify(sel),
        name: current.name, price: modalPrice(), cfg: configured(),
        sub: selectionSummary() || subtitle(current), engraving: note, pid: current.id, sel: { ...sel },
      });
      closeModal();
    });
  }

  /* ---------------- Gift Finder (gifts.html) ---------------- */
  const OCCASIONS = {
    birthday:    { name: t("occ.birthday"), all: true },
    anniversary: { name: t("occ.anniversary") },
    wedding:     { name: t("occ.wedding") },
    graduation:  { name: t("occ.graduation") },
    justbecause: { name: t("occ.justbecause") },
  };
  // Budgets in dirhams
  const BUDGETS = {
    b1: { min: 0, max: 5000 },
    b2: { min: 5000, max: 20000 },
    b3: { min: 20000, max: 50000 },
    b4: { min: 50000, max: Infinity },
  };
  Object.values(BUDGETS).forEach((b) => (b.name = b.min === 0 ? t("budget.under", fmt(b.max))
    : b.max === Infinity ? t("budget.over", fmt(b.min)) : LANG === "en" ? `${fmt(b.min)} – ${num(b.max)}` : `${num(b.min)} – ${fmt(b.max)}`));
  const finder = $("#finder");
  if (finder) {
    const pick = {
      g: ["men", "women"].includes(params.get("g")) ? params.get("g") : null,
      o: OCCASIONS[params.get("o")] ? params.get("o") : null,
      b: BUDGETS[params.get("b")] ? params.get("b") : null,
    };
    $$('[data-pick="b"]', finder).forEach((b) => ($("b", b).textContent = BUDGETS[b.dataset.v].name));
    const giftArt = $("#giftHeroArt");
    if (giftArt) giftArt.innerHTML = giftBoxSVG();

    function findGifts() {
      const occ = OCCASIONS[pick.o], bud = BUDGETS[pick.b];
      const inBud = (p) => p.price >= bud.min && p.price < bud.max;
      const inOcc = (p) => occ.all || p.occasions.includes(pick.o);
      const forWho = PRODUCTS.filter((p) => (p.gender === pick.g || p.gender === "unisex") && !soldOut(p));
      let picks = forWho.filter((p) => inOcc(p) && inBud(p));
      let note = "";
      if (picks.length < 3) picks = picks.concat(forWho.filter((p) => inBud(p) && !picks.includes(p)));
      if (picks.length < 3) {
        const target = bud.max === Infinity ? bud.min : (bud.min + bud.max) / 2;
        picks = picks.concat(forWho.filter((p) => !picks.includes(p))
          .sort((a, b) => Math.abs(a.price - target) - Math.abs(b.price - target)).slice(0, 4 - picks.length));
        note = t("gifts.note");
      }
      const score = (p) => (!occ.all && p.occasions.includes(pick.o) ? 2 : 0) + (inBud(p) ? 1 : 0);
      picks.sort((a, b) => score(b) - score(a) || b.price - a.price);
      // one piece per category first, for variety
      const seen = new Set(), first = [], rest = [];
      picks.forEach((p) => (seen.has(p.cat) ? rest : (seen.add(p.cat), first)).push(p));
      return { picks: [...first, ...rest].slice(0, 4), note };
    }

    function paint(scroll) {
      $$("[data-pick]", finder).forEach((b) => b.classList.toggle("active", pick[b.dataset.pick] === b.dataset.v));
      const vals = [pick.g, pick.o, pick.b];
      $$(".step", finder).forEach((s, i) => {
        s.classList.toggle("done", !!vals[i]);
        s.classList.toggle("locked", i > 0 && !vals[i - 1]);
        const out = $(".step-choice", s);
        out.textContent = !vals[i] ? "" : i === 0 ? t("gender." + pick.g) : i === 1 ? OCCASIONS[pick.o].name : BUDGETS[pick.b].name;
      });
      const q = new URLSearchParams(Object.entries(pick).filter(([, v]) => v));
      history.replaceState(null, "", "gifts.html" + (q.toString() ? "?" + q : ""));
      setActiveNav("gifts");

      const box = $("#giftResults");
      if (!(pick.g && pick.o && pick.b)) { box.hidden = true; return; }
      const { picks, note } = findGifts();
      $("#giftHeadline").innerHTML = `${t(pick.g === "men" ? "gifts.headMen" : "gifts.headWomen", picks.length)}<br /><em>${OCCASIONS[pick.o].name} · ${BUDGETS[pick.b].name}</em>`;
      $("#giftNote").textContent = note;
      $("#giftNote").hidden = !note;
      $("#giftGrid").innerHTML = picks.map((p, i) => cardHTML(p, i === 0 ? t("gifts.topPick") : "")).join("");
      $("#giftBrowse").href = `shop.html?g=${pick.g}`;
      $("#giftBrowse").textContent = t(pick.g === "men" ? "gifts.browseMen" : "gifts.browseWomen");
      box.hidden = false;
      $$(".card", box).forEach((c) => c.classList.add("in"));
      collectHands();
      if (scroll) box.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    finder.addEventListener("click", (e) => {
      const b = e.target.closest("[data-pick]");
      if (!b) return;
      pick[b.dataset.pick] = b.dataset.v;
      const complete = pick.g && pick.o && pick.b;
      paint(complete && b.dataset.pick === "b");
      if (!complete) {
        const next = $(".step:not(.done)", finder);
        if (next && matchMedia("(max-width: 860px)").matches) next.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    $("#giftRestart").addEventListener("click", () => {
      pick.g = pick.o = pick.b = null;
      paint();
      finder.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    paint();
  }

  /* ---------------- Bag (every page) ---------------- */
  // Bag is stored in dirhams. The key is versioned so carts saved in euros (older version) are not reused.
  const BAG_KEY = "aurele-bag-mad";
  try { localStorage.removeItem("aurele-bag"); } catch { /* storage unavailable */ }
  let bag = store.get(BAG_KEY, []);
  bag = (Array.isArray(bag) ? bag : [])
    .filter((i) => i && typeof i === "object" && typeof i.key === "string" && (typeof i.pid === "string" || (i.cfg && typeof i.cfg === "object")))
    .map((i) => ({ ...i, name: typeof i.name === "string" ? i.name : "", qty: Math.min(10, Math.max(1, parseInt(i.qty, 10) || 1)), price: Number(i.price) || 0 }));
  const drawer = $("#drawer");
  function saveBag() { store.set(BAG_KEY, bag); renderBag(); }
  const inBagOf = (pid) => bag.reduce((a, i) => a + (i.pid === pid ? i.qty : 0), 0);
  const roomFor = (pid) => {
    const p = pid && byId(pid); if (!p) return 10;
    let room = Number.isInteger(p.stock) ? p.stock - inBagOf(pid) : 10;
    // a pack is limited by the pieces inside it too
    (p.pack || []).forEach((c) => { const q = byId(c.pid); if (q && Number.isInteger(q.stock)) room = Math.min(room, Math.floor((q.stock - inBagOf(q.id)) / c.qty) - inBagOf(pid)); });
    return room;
  };
  function addToBag(item) {
    const p = item.pid && byId(item.pid);
    if (soldOut(p)) { toast(t("stock.out")); return; }
    const n = Math.min(10, Math.max(1, Math.floor(item.qty) || 1)), room = roomFor(item.pid);
    if (room <= 0) { toast(t("stock.allInBag")); return; }
    if (n > room) { toast(t("stock.notEnough")); return; }
    const found = bag.find((i) => i.key === item.key);
    if (found) found.qty = Math.min(10, found.qty + n); else bag.push({ ...item, qty: n });
    saveBag();
    toast(t("toast.added", n > 1 ? `${n} × ${item.name}` : item.name));
    const c = $("#bagCount"); c.classList.add("bump"); setTimeout(() => c.classList.remove("bump"), 300);
  }
  /* gift options (stored with the bag) */
  const WN = ((I18N.names || {})[LANG] || {}).wrap || {};
  const WRAPS = { signature: { name: WN.signature || "Signature box", price: 0 }, coffret: { name: WN.coffret || "Lacquered coffret", price: 500 } };
  const gift = Object.assign({ on: false, msg: "", wrap: "signature", hide: false }, store.get("aurele-gift", {}));
  if (!WRAPS[gift.wrap]) gift.wrap = "signature";
  const giftCost = () => (gift.on && bag.length ? WRAPS[gift.wrap].price : 0);
  $(".drawer-foot").insertAdjacentHTML("afterbegin", `
    <div class="gift-box" id="giftBox">
      <label class="check"><input type="checkbox" id="giftOn" /><span>${t("gift.toggle")}<small>${t("gift.toggleSub")}</small></span></label>
      <div class="gift-fields" id="giftFields">
        <textarea id="giftMsg" class="input textarea" maxlength="200" rows="3" placeholder="${t("gift.msgPh")}"></textarea>
        <small class="gift-count" id="giftCount">0 / 200</small>
        <div class="chips" id="giftWrap">
          <button class="chip" data-wrap="signature">${t("gift.wrapSignature")}</button>
          <button class="chip" data-wrap="coffret">${t("gift.wrapCoffret", fmt(WRAPS.coffret.price))}</button>
        </div>
        <label class="check"><input type="checkbox" id="giftHide" /><span>${t("gift.hide")}</span></label>
      </div>
    </div>
    <div class="row muted" id="giftRow"><span id="giftRowName"></span><span id="giftRowPrice"></span></div>`);
  function paintGift() {
    $("#giftOn").checked = gift.on;
    $("#giftHide").checked = gift.hide;
    $("#giftMsg").value = gift.msg;
    $("#giftCount").textContent = `${gift.msg.length} / 200`;
    $("#giftFields").hidden = !gift.on;
    $$("#giftWrap .chip").forEach((c) => c.classList.toggle("active", c.dataset.wrap === gift.wrap));
  }
  function saveGift() { store.set("aurele-gift", gift); renderBag(); }
  $("#giftOn").addEventListener("change", (e) => { gift.on = e.target.checked; paintGift(); saveGift(); });
  $("#giftHide").addEventListener("change", (e) => { gift.hide = e.target.checked; saveGift(); });
  $("#giftMsg").addEventListener("input", (e) => { gift.msg = e.target.value; $("#giftCount").textContent = `${gift.msg.length} / 200`; store.set("aurele-gift", gift); });
  $("#giftWrap").addEventListener("click", (e) => {
    const c = e.target.closest("[data-wrap]"); if (!c) return;
    gift.wrap = c.dataset.wrap; paintGift(); saveGift();
  });
  paintGift();

  // Keep bag prices in line with the catalogue (the database recomputes them anyway when ordering)
  function syncBagPrices() {
    bag.forEach((i) => {
      const p = i.pid && byId(i.pid);
      i.unavailable = !p || soldOut(p);
      i.soldOut = soldOut(p);
      if (!p) return;
      // stock went down since it was added: ask the customer to lower the quantity
      i.overStock = Number.isInteger(p.stock) && p.stock > 0 && inBagOf(p.id) > p.stock;
      const v = (p.variants || []).find((x) => x.key === (i.sel && i.sel.variant)) || (p.variants || [])[0];
      i.price = v ? v.price : p.price;
    });
  }
  const bagSubtotal = () => bag.reduce((a, i) => a + (i.unavailable ? 0 : i.qty * i.price), 0);
  const orderTotal = () => bagSubtotal() + giftCost();
  function renderBag() {
    syncBagPrices();
    $("#bagCount").textContent = bag.reduce((a, i) => a + i.qty, 0);
    $("#drawerTotal").textContent = fmt(orderTotal());
    $("#giftBox").hidden = !bag.length;
    $("#giftRow").hidden = !(gift.on && bag.length);
    $("#giftRowName").textContent = WRAPS[gift.wrap].name + (gift.hide ? t("gift.pricesHidden") : "");
    $("#giftRowPrice").textContent = WRAPS[gift.wrap].price ? fmt(WRAPS[gift.wrap].price) : t("common.free");
    const box = $("#drawerItems");
    if (!bag.length) {
      box.innerHTML = `<div class="drawer-empty"><p>${t("bag.empty.title")}</p><span>${t("bag.empty.sub")}</span><div class="drawer-empty-actions"><a class="btn btn-ghost" href="shop.html">${t("bag.browse")}</a><a class="btn btn-ghost" href="gifts.html">${t("bag.findGift")}</a></div></div>`;
      return;
    }
    const bagPhoto = (i) => {
      const p = i.pid && byId(i.pid);
      if (p) {
        const v = (p.variants || []).find((x) => x.key === (i.sel && i.sel.variant)) || (p.variants || [])[0];
        const src = (v && v.imgs && v.imgs[0]) || p.img;
        if (src) return `<img class="product-photo" src="${escapeHTML(src)}" alt="" loading="lazy" decoding="async" />`;
      }
      return i.cfg && typeof i.cfg === "object" ? render(i.cfg) : "";
    };
    const bagSub = (i) => {
      const p = i.pid && byId(i.pid);
      return (p && i.sel ? summaryFor(p, i.sel) : "") || i.sub || (i.cfg && typeof i.cfg === "object" ? subtitle(i.cfg) : "");
    };
    const safeRow = (fn) => { try { return fn(); } catch (err) { console.warn("RID ACCE: bag item could not be drawn", err); return ""; } };
    box.innerHTML = bag.map((i, idx) => `
      <div class="bag-item">
        <div>${safeRow(() => bagPhoto(i))}</div>
        <div>
          <h4>${escapeHTML(i.name || (byId(i.pid) || {}).name || "")}</h4>
          <small>${escapeHTML(safeRow(() => bagSub(i)))}${i.engraving ? `<br>${escapeHTML(t("bag.engraved", i.engraving))}` : ""}</small>
          ${i.overStock && !i.unavailable ? `<small class="bag-warn">${t("stock.notEnough")}</small>` : ""}
          ${i.unavailable ? `<small class="bag-warn">${i.soldOut ? t("stock.out") + " — " + t("bag.removeIt") : t("bag.unavailable")}</small>` : ""}
          <div class="qty"><button data-act="dec" data-i="${idx}" aria-label="Decrease">−</button><span>${i.qty}</span><button data-act="inc" data-i="${idx}" aria-label="Increase">+</button></div>
        </div>
        <div class="right"><strong>${fmt(i.price * i.qty)}</strong><button class="remove" data-act="rm" data-i="${idx}">${t("bag.remove")}</button></div>
      </div>`).join("");
    collectHands();
  }
  $("#drawerItems").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const i = +b.dataset.i;
    if (b.dataset.act === "inc") {
      if (roomFor(bag[i].pid) <= 0) { toast(t("stock.allInBag")); return; }
      bag[i].qty = Math.min(10, bag[i].qty + 1);
    }
    if (b.dataset.act === "dec") bag[i].qty = Math.max(1, bag[i].qty - 1);
    if (b.dataset.act === "rm") bag.splice(i, 1);
    saveBag();
  });
  function openDrawer() { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); document.body.classList.add("locked"); }
  function closeDrawer() {
    drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); document.body.classList.remove("locked");
    const done = $("#checkoutDone"); if (done && done.hidden && $("#checkoutForm") && !$("#checkoutForm").hidden) setView("bag");
  }
  $("#bagBtn").addEventListener("click", openDrawer);
  $$("[data-close-drawer]").forEach((el) => el.addEventListener("click", closeDrawer));
  /* ---------------- Checkout: cash on delivery (+ optional WhatsApp) ----------------
     The order goes to the database function place_order(), which validates everything and
     recomputes every price from the catalogue — the prices sent from this page are never trusted. */
  const WA = String(CFG.whatsappNumber || "").replace(/\D/g, "");
  const canOrderOnline = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);
  const panel = $(".drawer-panel");
  if (WA) {
    $("#checkoutBtn").insertAdjacentHTML("afterend",
      `<a class="btn btn-ghost btn-block wa-btn" id="waBtn" href="#" target="_blank" rel="noopener noreferrer">${t("wa.button")}</a>`);
  }
  panel.insertAdjacentHTML("beforeend", `
    <form class="checkout" id="checkoutForm" hidden novalidate>
      <div class="checkout-body">
        <button type="button" class="reset-link co-back" id="coBack">${t("co.back")}</button>
        <h4 class="co-title">${t("co.title")}</h4>
        <label class="co-field"><span>${t("co.name")}</span><input class="input" name="name" autocomplete="name" maxlength="100" required /></label>
        <label class="co-field"><span>${t("co.phone")}</span><input class="input" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="06 12 34 56 78" dir="ltr" required /></label>
        <label class="co-field"><span>${t("co.city")}</span><input class="input" name="city" autocomplete="address-level2" maxlength="80" required /></label>
        <label class="co-field"><span>${t("co.address")}</span><textarea class="input textarea" name="address" rows="2" autocomplete="street-address" maxlength="300" required></textarea></label>
        <label class="co-field"><span>${t("co.note")}</span><textarea class="input textarea" name="note" rows="2" maxlength="500"></textarea></label>
        <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <label class="check"><input type="checkbox" name="consent" /><span>${t("co.consent")}</span></label>
        <p class="co-pay">${t("co.payment")}</p>
        <p class="co-error" id="coError" role="alert"></p>
      </div>
      <div class="checkout-foot">
        <div class="row"><span>${t("co.totalLabel")}</span><strong id="coTotal"></strong></div>
        <button class="btn btn-gold btn-block" type="submit" id="coSubmit">${t("co.submit")}</button>
      </div>
    </form>
    <div class="checkout-done" id="checkoutDone" hidden>
      <div class="done-mark" aria-hidden="true">✓</div>
      <h4>${t("co.done.title")}</h4>
      <p id="coDoneText"></p>
      <a class="btn btn-ghost" id="coDoneWa" href="#" target="_blank" rel="noopener noreferrer" hidden>${t("wa.followUp")}</a>
      <button class="btn btn-gold" type="button" id="coDoneClose">${t("co.done.close")}</button>
    </div>`);
  const coForm = $("#checkoutForm");
  function setView(v) {
    $("#drawerItems").hidden = v !== "bag";
    $(".drawer-foot").hidden = v !== "bag";
    coForm.hidden = v !== "form";
    $("#checkoutDone").hidden = v !== "done";
    if (v === "form") { $("#coTotal").textContent = fmt(orderTotal()); $("#coError").textContent = ""; }
  }
  // WhatsApp message with the bag (and order reference once ordered)
  function waText(ref) {
    const lines = [t("wa.intro"), ""];
    bag.filter((i) => !i.unavailable).forEach((i) => {
      const p = byId(i.pid), opts = p && i.sel ? summaryFor(p, i.sel) : "";
      lines.push(`• ${[p && p.brand, i.name].filter(Boolean).join(" ")}${opts ? " (" + opts + ")" : ""} × ${i.qty} — ${fmt(i.qty * i.price)}`);
    });
    if (gift.on) lines.push(`• ${WRAPS[gift.wrap].name}${WRAPS[gift.wrap].price ? " — " + fmt(WRAPS[gift.wrap].price) : ""}`);
    lines.push("", `${t("wa.total")}: ${fmt(orderTotal())}`);
    if (ref) lines.push(`${t("wa.ref")}: ${ref}`);
    return lines.join("\n");
  }
  const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  if (WA) $("#waBtn").addEventListener("click", (e) => {
    if (!bag.length) { e.preventDefault(); return toast(t("toast.empty")); }
    e.currentTarget.href = waLink(waText());
  });

  $("#checkoutBtn").addEventListener("click", () => {
    if (!bag.length) return toast(t("toast.empty"));
    if (bag.some((i) => i.unavailable)) return toast(t("co.err.items"));
    if (bag.some((i) => i.overStock)) return toast(t("co.err.qty"));
    if (!canOrderOnline) return toast(t("co.err.generic"));
    setView("form");
    $('[name="name"]', coForm).focus();
  });
  $("#coBack").addEventListener("click", () => setView("bag"));
  $("#coDoneClose").addEventListener("click", () => { setView("bag"); closeDrawer(); });

  const PHONE_RE = /^(\+212[5-7][0-9]{8}|0[5-7][0-9]{8})$/;
  const normPhone = (s) => { let p = String(s).replace(/[\s.()-]/g, ""); if (p.startsWith("00212")) p = "+212" + p.slice(5); return p; };
  const ERR = {
    invalid_name: "co.err.name", invalid_phone: "co.err.phone", invalid_city: "co.err.city", invalid_address: "co.err.address",
    consent_required: "co.err.consent", product_unavailable: "co.err.items", invalid_option: "co.err.items", invalid_items: "co.err.items",
    too_many_orders: "co.err.tooMany", out_of_stock: "co.err.stock",
  };
  let sending = false;
  coForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;
    const f = (n) => String(coForm.elements[n].value || "").trim();
    const fail = (k) => { $("#coError").textContent = t(k); };
    const customer = { name: f("name"), phone: normPhone(f("phone")), city: f("city"), address: f("address"), note: f("note"),
      lang: LANG, consent: coForm.elements.consent.checked, website: f("website") };
    if (customer.name.length < 2) return fail("co.err.name");
    if (!PHONE_RE.test(customer.phone)) return fail("co.err.phone");
    if (customer.city.length < 2) return fail("co.err.city");
    if (customer.address.length < 5) return fail("co.err.address");
    if (!customer.consent) return fail("co.err.consent");
    if (!bag.length || bag.some((i) => i.unavailable || !i.pid)) return fail("co.err.items");
    if (bag.some((i) => i.overStock)) return fail("co.err.qty");
    const items = bag.map((i) => ({ pid: i.pid, qty: i.qty, variant: (i.sel && i.sel.variant) || null, size: (i.sel && i.sel.size) || null }));
    const giftData = gift.on ? { on: true, wrap: gift.wrap, msg: gift.msg, hide: gift.hide } : null;
    const btn = $("#coSubmit");
    sending = true; btn.disabled = true; btn.textContent = t("co.sending"); $("#coError").textContent = "";
    try {
      const res = await fetch(`${CFG.supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/place_order`, {
        method: "POST",
        headers: { apikey: CFG.supabaseAnonKey, Authorization: `Bearer ${CFG.supabaseAnonKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ customer, items, gift: giftData }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ref) return fail(ERR[data.message] || "co.err.generic");
      const followUp = waText(data.ref);
      bag = []; saveBag();
      gift.on = false; gift.msg = ""; paintGift(); saveGift();
      coForm.reset();
      $("#coDoneText").textContent = t("co.done.text", data.ref) + " " + t("co.done.total", fmt(data.total));
      const wa = $("#coDoneWa"); wa.hidden = !WA; if (WA) wa.href = waLink(followUp);
      setView("done");
    } catch (err) {
      fail("co.err.generic");
    } finally {
      sending = false; btn.disabled = false; btn.textContent = t("co.submit");
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); closeDrawer(); } });
  // keep bag in sync if it changes in another tab
  addEventListener("storage", (e) => { if (e.key === BAG_KEY) { bag = store.get(BAG_KEY, []); renderBag(); } });

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------------- Header, nav, reveal, counters, newsletter ---------------- */
  function setActiveNav(key) { $$("#nav [data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === key)); }
  setActiveNav(finder ? "gifts" : grid ? (filter.gender || "shop") : "home");

  const header = $("#header");
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 30);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const menuBtn = $("#menuBtn"), nav = $("#nav");
  menuBtn.addEventListener("click", () => { menuBtn.classList.toggle("open"); nav.classList.toggle("open"); });
  $$("a", nav).forEach((a) => a.addEventListener("click", () => { menuBtn.classList.remove("open"); nav.classList.remove("open"); }));

  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    const num = en.target.querySelector("[data-count]");
    if (num) countUp(num);
    io.unobserve(en.target);
  }), { threshold: .15 });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el); });

  function countUp(el) {
    const end = +el.dataset.count, t0 = performance.now(), dur = 1800;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e).toLocaleString("en-US").replace(/,/g, " ");
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const newsForm = $("#newsForm");
  if (newsForm) newsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.reset();
    toast(t("toast.news"));
  });

  /* ---------------- Init ---------------- */
  renderBag();
  if (grid && filter.gender) applyFilter();
  collectHands();
  requestAnimationFrame(tick);
})();
