/* =========================================================
   RID ACCE — Admin
   Supabase: auth (e-mail + password), products table, product-images bucket.
   Security is enforced by the database rules in supabase/schema.sql.
   ========================================================= */
(() => {
  "use strict";

  // SECURITY: refuse to run inside a frame (anti-clickjacking)
  if (window.top !== window.self) {
    document.documentElement.innerHTML = "";
    try { window.top.location = window.self.location.href; } catch (e) { /* cross-origin parent */ }
    return;
  }

  // The admin page is never hidden by the shop's "wait for translation" rule
  document.documentElement.classList.add("i18n-ready");

  const CFG = window.AURELE_CONFIG || {};
  const BUCKET = "product-images";
  const LANGS = [["ar", "العربية", "rtl"], ["fr", "Français", "ltr"], ["en", "English", "ltr"]];
  const CATS = ["Watches", "Jewellery", "Leather goods", "Eyewear"];
  const GENDERS = [["women", "Women"], ["men", "Men"], ["unisex", "Men & women"]];
  const OCCS = [["anniversary", "Anniversary"], ["wedding", "Wedding"], ["graduation", "Graduation"], ["justbecause", "Just because"]];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => `${Number(n || 0).toLocaleString("en-US")} MAD`;
  const slug = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  const tri = (o) => ({ ar: (o && o.ar) || "", fr: (o && o.fr) || "", en: (o && o.en) || "" });
  const titleOf = (p) => (p.name && (p.name.en || p.name.fr || p.name.ar)) || p.id || "Untitled";

  let toastTimer;
  function toast(msg, bad) {
    const t = $("#toast");
    t.textContent = msg; t.classList.toggle("bad", !!bad); t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), bad ? 6000 : 2800);
  }
  const show = (id) => ["#viewSetup", "#viewLogin", "#viewApp"].forEach((v) => ($(v).hidden = v !== id));
  const explain = (error) => {
    const m = (error && error.message) || String(error);
    if (/row-level security|permission denied|not authorized|violates/i.test(m)) return "Refused by the database: this account is not in the admins table.";
    return m;
  };

  /* ---------------- No configuration yet → setup guide ---------------- */
  if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) { show("#viewSetup"); return; }
  if (!window.supabase || !window.supabase.createClient) {
    show("#viewSetup");
    $("#setupError").textContent = "The Supabase library could not be loaded — check the internet connection and reload.";
    return;
  }
  const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);

  /* ---------------- Auth ---------------- */
  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#loginBtn");
    btn.disabled = true; btn.textContent = "Signing in…"; $("#loginError").textContent = "";
    const { data, error } = await sb.auth.signInWithPassword({ email: $("#loginEmail").value.trim(), password: $("#loginPassword").value });
    btn.disabled = false; btn.textContent = "Sign in";
    if (error) { $("#loginError").textContent = error.message === "Invalid login credentials" ? "Wrong e-mail or password." : error.message; return; }
    enterApp(data.session);
  });
  $("#signOut").addEventListener("click", async () => { await sb.auth.signOut(); location.reload(); });

  async function enterApp(session) {
    show("#viewApp");
    $("#who").textContent = session.user.email;
    $("#signOut").hidden = false;
    const { data: adminRow } = await sb.from("admins").select("email").maybeSingle();
    $("#notAdmin").hidden = !!adminRow;
    await Promise.all([loadProducts(), loadOrders()]);
    setInterval(() => { if (!document.hidden && !$("#tabOrders").hidden) loadOrders(); }, 60000);
  }

  /* ---------------- Product list ---------------- */
  let products = [];
  async function loadProducts() {
    const { data, error } = await sb.from("products").select("*").order("sort", { ascending: true }).order("id");
    if (error) { toast(explain(error), true); return; }
    products = data || [];
    renderList();
  }

  function renderList() {
    const q = $("#search").value.trim().toLowerCase(), c = $("#fCat").value, g = $("#fGender").value;
    const rows = products.filter((p) =>
      (!c || p.cat === c) && (!g || p.gender === g) &&
      (!q || [p.id, p.brand, ...Object.values(p.name || {})].join(" ").toLowerCase().includes(q)));
    const active = products.filter((p) => p.active).length;
    $("#stats").innerHTML = `<div><b>${products.length}</b><span>products</span></div><div><b>${active}</b><span>visible</span></div><div><b>${products.length - active}</b><span>hidden</span></div>`;
    $("#empty").hidden = products.length > 0;
    $("#list").innerHTML = rows.map((p) => {
      const thumb = p.img || ((p.variants || [])[0] || { imgs: [] }).imgs[0] || "";
      const versions = (p.variants || []).length;
      return `
      <article class="ad-row${p.active ? "" : " is-hidden"}" data-id="${esc(p.id)}">
        <div class="ad-thumb">${thumb ? `<img src="${esc(thumb)}" alt="" loading="lazy" />` : ""}</div>
        <div class="ad-row-main">
          ${p.brand ? `<span class="ad-brand">${esc(p.brand)}</span>` : ""}
          <h3>${esc(titleOf(p))}</h3>
          <p class="ad-muted" dir="rtl">${esc((p.name || {}).ar || "")}</p>
          <p class="ad-tags"><span>${esc(p.cat)}</span><span>${esc((GENDERS.find((x) => x[0] === p.gender) || [, p.gender])[1])}</span>${versions > 1 ? `<span>${versions} versions</span>` : ""}</p>
        </div>
        <div class="ad-price">${fmt(p.price)}</div>
        <label class="ad-switch" title="Visible in the shop">
          <input type="checkbox" data-act="toggle" ${p.active ? "checked" : ""} /><span></span>
        </label>
        <button class="btn btn-ghost btn-sm" data-act="edit">Edit</button>
      </article>`;
    }).join("");
  }
  ["#search", "#fCat", "#fGender"].forEach((s) => $(s).addEventListener("input", renderList));

  $("#list").addEventListener("click", (e) => {
    const row = e.target.closest(".ad-row"); if (!row) return;
    const p = products.find((x) => x.id === row.dataset.id);
    if (e.target.closest('[data-act="edit"]')) openEditor(p);
  });
  $("#list").addEventListener("change", async (e) => {
    if (e.target.dataset.act !== "toggle") return;
    const id = e.target.closest(".ad-row").dataset.id, active = e.target.checked;
    const { error } = await sb.from("products").update({ active }).eq("id", id);
    if (error) { toast(explain(error), true); e.target.checked = !active; return; }
    products.find((p) => p.id === id).active = active;
    renderList();
    toast(active ? "Product is now visible in the shop" : "Product hidden from the shop");
  });

  /* ---------------- Import starter catalogue ---------------- */
  $("#importSeed").addEventListener("click", async () => {
    const seed = window.AURELE_SEED || [];
    const have = new Set(products.map((p) => p.id));
    const toAdd = seed.filter((r) => !have.has(r.id));
    if (!toAdd.length) { toast("All starter products are already in the catalogue."); return; }
    if (!confirm(`Add ${toAdd.length} starter product(s)? Existing products are not changed.`)) return;
    const { error } = await sb.from("products").insert(toAdd);
    if (error) { toast(explain(error), true); return; }
    toast(`${toAdd.length} product(s) imported`);
    loadProducts();
  });

  /* ---------------- Editor ---------------- */
  let ed = null, isNew = false, edLang = "ar";
  const editor = $("#editor");

  const blankVariant = (price) => ({ key: "", name: { ar: "", fr: "", en: "" }, price: price || 0, swatch: "#c9a96e", imgs: [] });
  function blankProduct() {
    const maxSort = products.reduce((m, p) => Math.max(m, p.sort || 0), 0);
    return {
      id: "", brand: "", name: tri(), cat: "Watches", gender: "women", price: 0, img: "",
      variants: [blankVariant(0)], chain: [], sub: tri(), description: tri(), specs: { ar: {}, fr: {}, en: {} },
      occasions: [], limited: null, active: true, sort: maxSort + 10,
    };
  }
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function openEditor(p) {
    isNew = !p;
    ed = p ? clone(p) : blankProduct();
    ed.name = tri(ed.name); ed.sub = tri(ed.sub); ed.description = tri(ed.description);
    ed.specs = { ar: (ed.specs || {}).ar || {}, fr: (ed.specs || {}).fr || {}, en: (ed.specs || {}).en || {} };
    if (!Array.isArray(ed.variants) || !ed.variants.length) ed.variants = [{ ...blankVariant(ed.price), imgs: ed.img ? [ed.img] : [] }];
    ed.variants.forEach((v) => { v.name = tri(v.name); v.imgs = v.imgs || []; });
    ed.limited = tri(ed.limited);
    $("#edKicker").textContent = isNew ? "New product" : "Edit product";
    $("#edDelete").hidden = isNew;
    $("#edStatus").textContent = "";
    renderEditor();
    editor.hidden = false;
    document.body.classList.add("locked");
    $(".ad-editor-body", editor).scrollTop = 0;
  }
  function closeEditor() {
    editor.hidden = true; document.body.classList.remove("locked"); ed = null;
  }
  $$("[data-close-editor]").forEach((b) => b.addEventListener("click", closeEditor));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !editor.hidden) closeEditor(); });

  const specsToText = (o) => Object.entries(o || {}).map(([k, v]) => `${k}: ${v}`).join("\n");
  const textToSpecs = (t) => Object.fromEntries(t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const i = l.indexOf(":"); return i < 0 ? [l, ""] : [l.slice(0, i).trim(), l.slice(i + 1).trim()];
  }).filter(([k]) => k));

  function renderEditor() {
    $("#edTitle").textContent = titleOf(ed);
    const L = LANGS.find((l) => l[0] === edLang);
    const multi = ed.variants.length > 1;
    $("#edBody").innerHTML = `
      <section class="ad-sec">
        <h4>1 · Basics</h4>
        <div class="ad-grid">
          <label class="ad-field"><span>Brand <em>(leave empty for the house line)</em></span><input class="input" data-k="brand" value="${esc(ed.brand)}" placeholder="e.g. Cartier" /></label>
          <label class="ad-field"><span>Product ID <em>(used in links, cannot change later)</em></span>
            <input class="input" data-k="id" value="${esc(ed.id)}" ${isNew ? "" : "readonly"} placeholder="filled from the English name" /></label>
          <label class="ad-field"><span>Category</span><select class="input" data-k="cat">${CATS.map((c) => `<option ${c === ed.cat ? "selected" : ""}>${c}</option>`).join("")}</select></label>
          <label class="ad-field"><span>For</span><select class="input" data-k="gender">${GENDERS.map(([v, n]) => `<option value="${v}" ${v === ed.gender ? "selected" : ""}>${n}</option>`).join("")}</select></label>
          <label class="ad-field"><span>Display order <em>(small = first)</em></span><input class="input" type="number" data-k="sort" value="${esc(ed.sort)}" /></label>
          <label class="ad-check"><input type="checkbox" data-k="active" ${ed.active ? "checked" : ""} /><span>Visible in the shop</span></label>
        </div>
      </section>

      <section class="ad-sec">
        <h4>2 · Texts</h4>
        <div class="ad-langs">${LANGS.map(([k, n]) => {
          const done = ed.name[k] && ed.description[k];
          return `<button type="button" class="ad-lang${k === edLang ? " active" : ""}" data-lang="${k}">${n}${done ? " ✓" : ""}</button>`;
        }).join("")}</div>
        <div class="ad-grid" dir="${L[2]}">
          <label class="ad-field ad-span2"><span>Name</span><input class="input" data-t="name" value="${esc(ed.name[edLang])}" /></label>
          <label class="ad-field ad-span2"><span>Short line under the name</span><input class="input" data-t="sub" value="${esc(ed.sub[edLang])}" placeholder="e.g. Steel · diamond indices" /></label>
          <label class="ad-field ad-span2"><span>Description</span><textarea class="input textarea" rows="4" data-t="description">${esc(ed.description[edLang])}</textarea></label>
          <label class="ad-field ad-span2"><span>Specifications <em>(one per line — Label: value)</em></span><textarea class="input textarea ad-mono" rows="5" data-t="specs">${esc(specsToText(ed.specs[edLang]))}</textarea></label>
          <label class="ad-field ad-span2"><span>Limited-edition label <em>(optional, e.g. “25 pieces”)</em></span><input class="input" data-t="limited" value="${esc(ed.limited[edLang])}" /></label>
        </div>
        <p class="ad-muted ad-small">Arabic is the main language of the shop. Empty French/English fields fall back to English, then to the ID.</p>
      </section>

      <section class="ad-sec">
        <h4>3 · Versions, prices &amp; photos</h4>
        <p class="ad-muted ad-small">One version = one price and its photos. Add more versions for different colours or metals — customers pick them in the product window. The first version's price is the price shown on the card.</p>
        <div class="ad-versions">${ed.variants.map((v, i) => `
          <div class="ad-version" data-v="${i}">
            <div class="ad-version-head">
              <b>${multi ? `Version ${i + 1}` : "Price & photos"}</b>
              ${multi ? `<button type="button" class="ad-link" data-vact="up" ${i ? "" : "disabled"}>↑</button><button type="button" class="ad-link ad-danger" data-vact="remove">Remove version</button>` : ""}
            </div>
            <div class="ad-grid">
              <label class="ad-field"><span>Price (MAD)</span><input class="input" type="number" min="0" step="10" data-vk="price" value="${esc(v.price)}" /></label>
              ${multi ? `
              <label class="ad-field"><span>Swatch colour</span><input class="input ad-color" type="color" data-vk="swatch" value="${/^#[0-9a-f]{6}$/i.test(v.swatch) ? v.swatch : "#c9a96e"}" /></label>
              ${LANGS.map(([k, n, d]) => `<label class="ad-field"><span>Version name · ${n}</span><input class="input" dir="${d}" data-vn="${k}" value="${esc(v.name[k])}" placeholder="${k === "en" ? "e.g. Two-tone" : ""}" /></label>`).join("")}` : ""}
            </div>
            <div class="ad-photos">
              ${v.imgs.map((src, j) => `
                <figure class="ad-photo">
                  <img src="${esc(src)}" alt="" />
                  <figcaption>
                    ${j ? `<button type="button" data-pact="first" data-j="${j}" title="Make main photo">★</button>` : `<span title="Main photo">Main</span>`}
                    <button type="button" data-pact="remove" data-j="${j}" title="Remove photo">✕</button>
                  </figcaption>
                </figure>`).join("")}
              <label class="ad-upload">
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple data-upload />
                <span>+ Add photos</span><small>JPG, PNG or WebP · square works best</small>
              </label>
            </div>
          </div>`).join("")}
        </div>
        <button type="button" class="btn btn-ghost btn-sm" id="addVersion">+ Add a version (colour / metal)</button>
      </section>

      <section class="ad-sec">
        <h4>4 · Options &amp; gift finder</h4>
        <div class="ad-grid">
          <label class="ad-field ad-span2"><span>Chain lengths <em>(necklaces — separated by commas, leave empty if none)</em></span>
            <input class="input" data-k="chain" value="${esc((ed.chain || []).join(", "))}" placeholder="40 cm, 42 cm, 45 cm" /></label>
        </div>
        <p class="ad-label">Suggest this piece in the Gift Finder for: <em>(“Birthday” always includes everything)</em></p>
        <div class="ad-checks">${OCCS.map(([k, n]) => `<label class="ad-check"><input type="checkbox" data-occ="${k}" ${ed.occasions.includes(k) ? "checked" : ""} /><span>${n}</span></label>`).join("")}</div>
      </section>`;
  }

  // ---- editor input binding
  $("#edBody").addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.k) {
      const k = el.dataset.k;
      if (k === "active") ed.active = el.checked;
      else if (k === "sort") ed.sort = parseInt(el.value, 10) || 0;
      else if (k === "chain") ed.chain = el.value.split(",").map((x) => x.trim()).filter(Boolean);
      else if (k === "id") ed.id = slug(el.value);
      else ed[k] = el.value;
    } else if (el.dataset.t) {
      const t = el.dataset.t;
      if (t === "specs") ed.specs[edLang] = textToSpecs(el.value);
      else ed[t][edLang] = el.value;
      if (t === "name") {
        $("#edTitle").textContent = titleOf(ed);
        if (isNew && edLang === "en") { ed.id = slug(el.value); const idIn = $('[data-k="id"]'); if (idIn) idIn.value = ed.id; }
      }
    } else if (el.dataset.vk || el.dataset.vn) {
      const v = ed.variants[+el.closest("[data-v]").dataset.v];
      if (el.dataset.vk === "price") v.price = Number(el.value) || 0;
      else if (el.dataset.vk === "swatch") v.swatch = el.value;
      else v.name[el.dataset.vn] = el.value;
    } else if (el.dataset.occ) {
      const k = el.dataset.occ;
      ed.occasions = el.checked ? [...new Set([...ed.occasions, k])] : ed.occasions.filter((o) => o !== k);
    }
  });
  $("#edBody").addEventListener("change", (e) => {
    if (e.target.dataset.k === "active" || e.target.dataset.occ) e.target.dispatchEvent(new Event("input", { bubbles: true }));
    if (e.target.matches("[data-upload]")) upload(e.target);
  });
  $("#edBody").addEventListener("click", (e) => {
    const lang = e.target.closest("[data-lang]");
    if (lang) { edLang = lang.dataset.lang; renderEditor(); return; }
    const vbox = e.target.closest("[data-v]");
    const vact = e.target.closest("[data-vact]");
    if (vact && vbox) {
      const i = +vbox.dataset.v;
      if (vact.dataset.vact === "remove") {
        if (ed.variants[i].imgs.length && !confirm("Remove this version and its photos from the product?")) return;
        ed.variants.splice(i, 1);
      }
      if (vact.dataset.vact === "up" && i > 0) [ed.variants[i - 1], ed.variants[i]] = [ed.variants[i], ed.variants[i - 1]];
      renderEditor(); return;
    }
    const pact = e.target.closest("[data-pact]");
    if (pact && vbox) {
      const v = ed.variants[+vbox.dataset.v], j = +pact.dataset.j;
      if (pact.dataset.pact === "remove") v.imgs.splice(j, 1);
      if (pact.dataset.pact === "first") v.imgs.unshift(v.imgs.splice(j, 1)[0]);
      renderEditor(); return;
    }
    if (e.target.id === "addVersion") {
      if (ed.variants.length === 1 && !ed.variants[0].name.en) ed.variants[0].name.en = "Version 1";
      ed.variants.push(blankVariant(ed.variants[0].price));
      renderEditor();
      const last = $$(".ad-version").pop(); if (last) last.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  // ---- photo upload to Supabase Storage
  async function upload(input) {
    const files = [...input.files];
    if (!files.length) return;
    const vIndex = +input.closest("[data-v]").dataset.v;
    const folder = ed.id || slug(ed.name.en || ed.name.fr) || "product";
    const status = $("#edStatus");
    let done = 0;
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { toast(`${file.name} is larger than 5 MB — please resize it first.`, true); continue; }
      status.textContent = `Uploading photo ${done + 1} of ${files.length}…`;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await sb.storage.from(BUCKET).upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
      if (error) { toast(explain(error), true); continue; }
      const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
      if (ed) ed.variants[vIndex].imgs.push(data.publicUrl);
      done++;
    }
    status.textContent = done ? `${done} photo(s) uploaded — don't forget to save.` : "";
    if (ed) renderEditor();
  }

  // ---- save
  $("#editorForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!ed) return;
    if (isNew && !ed.id) ed.id = slug(ed.name.en || ed.name.fr || ed.brand);
    const problems = [];
    if (!ed.id) problems.push("an ID (or an English name)");
    if (isNew && products.some((p) => p.id === ed.id)) problems.push(`a different ID (“${ed.id}” is already used)`);
    if (!ed.name.ar && !ed.name.en && !ed.name.fr) problems.push("a name");
    if (!ed.variants.length || !ed.variants.some((v) => v.imgs.length)) problems.push("at least one photo");
    if (ed.variants.some((v) => !(v.price > 0))) problems.push("a price for every version");
    if (problems.length) { toast("Please add " + problems.join(", ") + ".", true); return; }

    const keys = new Set();
    const variants = ed.variants.filter((v) => v.imgs.length).map((v, i) => {
      let key = slug(v.name.en || v.name.fr) || `v${i + 1}`;
      while (keys.has(key)) key += "-" + (i + 1);
      keys.add(key);
      return { key, name: v.name, price: Number(v.price), swatch: v.swatch || "", imgs: v.imgs };
    });
    const limited = ed.limited.ar || ed.limited.fr || ed.limited.en ? ed.limited : null;
    const row = {
      id: ed.id, brand: ed.brand.trim(), name: ed.name, cat: ed.cat, gender: ed.gender,
      price: variants[0].price, img: variants[0].imgs[0], variants, chain: ed.chain || [],
      sub: ed.sub, description: ed.description, specs: ed.specs, occasions: ed.occasions,
      limited, active: !!ed.active, sort: ed.sort || 0,
    };
    const btn = $("#edSave");
    btn.disabled = true; btn.textContent = "Saving…";
    const { error } = isNew ? await sb.from("products").insert(row) : await sb.from("products").update(row).eq("id", row.id);
    btn.disabled = false; btn.textContent = "Save product";
    if (error) { toast(explain(error), true); return; }
    toast(isNew ? "Product added to the shop" : "Changes saved");
    closeEditor();
    loadProducts();
  });

  // ---- delete
  $("#edDelete").addEventListener("click", async () => {
    if (!ed || isNew) return;
    if (!confirm(`Delete “${titleOf(ed)}” permanently?\nTip: you can hide it instead with the visibility switch.`)) return;
    const { error } = await sb.from("products").delete().eq("id", ed.id);
    if (error) { toast(explain(error), true); return; }
    toast("Product deleted");
    closeEditor();
    loadProducts();
  });

  $("#newProduct").addEventListener("click", () => openEditor(null));

  /* ---------------- Tabs ---------------- */
  $$(".ad-tab").forEach((b) => b.addEventListener("click", () => {
    $$(".ad-tab").forEach((x) => x.classList.toggle("active", x === b));
    $("#tabOrders").hidden = b.dataset.tab !== "orders";
    $("#tabProducts").hidden = b.dataset.tab !== "products";
    if (b.dataset.tab === "orders") loadOrders();
  }));

  /* ---------------- Orders (cash on delivery) ----------------
     Everything shown here was typed by customers → always escaped with esc(). */
  const STATUSES = [["new", "New"], ["confirmed", "Confirmed"], ["shipped", "Shipped"], ["delivered", "Delivered"], ["cancelled", "Cancelled"]];
  const WAHELLO = {
    ar: (o) => `مرحباً ${o.customer_name}، بخصوص طلبك ${o.ref} من RID ACCE`,
    fr: (o) => `Bonjour ${o.customer_name}, au sujet de votre commande RID ACCE ${o.ref}`,
    en: (o) => `Hello ${o.customer_name}, about your RID ACCE order ${o.ref}`,
  };
  const intlPhone = (p) => (String(p).startsWith("+") ? String(p).slice(1) : "212" + String(p).slice(1)).replace(/\D/g, "");
  let orders = [];

  async function loadOrders() {
    const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) { toast(explain(error), true); return; }
    orders = data || [];
    $("#oUpdated").textContent = "Updated " + new Date().toLocaleTimeString("fr-MA", { hour: "2-digit", minute: "2-digit" });
    renderOrders();
  }

  function renderOrders() {
    const q = $("#oSearch").value.trim().toLowerCase(), st = $("#oStatus").value;
    const rows = orders.filter((o) => (!st || o.status === st) &&
      (!q || [o.ref, o.customer_name, o.phone, o.city].join(" ").toLowerCase().includes(q)));
    const count = (s) => orders.filter((o) => o.status === s).length;
    const open = orders.filter((o) => ["new", "confirmed", "shipped"].includes(o.status));
    $("#orderStats").innerHTML = `<div><b>${count("new")}</b><span>new</span></div><div><b>${open.length}</b><span>in progress</span></div>` +
      `<div><b>${esc(fmt(open.reduce((a, o) => a + Number(o.total), 0)))}</b><span>to collect</span></div>`;
    $("#newCount").textContent = count("new");
    $("#newCount").hidden = !count("new");
    $("#ordersEmpty").hidden = orders.length > 0;
    $("#ordersList").innerHTML = rows.map((o) => {
      const items = (Array.isArray(o.items) ? o.items : []).map((it) => `
        <tr><td>${esc(it.qty)} ×</td><td>${esc([it.brand, it.name].filter(Boolean).join(" "))}${it.variant_name ? ` <em>· ${esc(it.variant_name)}</em>` : ""}${it.size ? ` <em>· ${esc(it.size)}</em>` : ""}</td><td>${esc(fmt(it.line_total))}</td></tr>`).join("");
      const g = o.gift;
      const giftHtml = g ? `<p class="ad-gift">🎁 ${g.wrap === "coffret" ? "Lacquered coffret" : "Signature box"}${g.hide_prices ? " · hide prices" : ""}${g.message ? `<br><span>“${esc(g.message)}”</span>` : ""}</p>` : "";
      const wa = `https://wa.me/${intlPhone(o.phone)}?text=${encodeURIComponent((WAHELLO[o.lang] || WAHELLO.ar)(o))}`;
      return `
      <article class="ad-order is-${esc(o.status)}" data-id="${esc(o.id)}">
        <header class="ad-order-head">
          <div><b class="ad-ref">${esc(o.ref)}</b><span class="ad-muted"> · ${esc(new Date(o.created_at).toLocaleString("fr-MA", { dateStyle: "medium", timeStyle: "short" }))} · ${esc(String(o.lang).toUpperCase())}</span></div>
          <select class="input ad-select ad-status" data-act="status">${STATUSES.map(([v, n]) => `<option value="${v}" ${v === o.status ? "selected" : ""}>${n}</option>`).join("")}</select>
        </header>
        <div class="ad-order-grid">
          <div class="ad-cust">
            <h3>${esc(o.customer_name)}</h3>
            <p class="ad-phone" dir="ltr">${esc(o.phone)}</p>
            <p class="ad-actions"><a class="btn btn-ghost btn-sm" href="tel:${esc(o.phone)}">Call</a><a class="btn btn-ghost btn-sm" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">WhatsApp</a></p>
            <p><b>${esc(o.city)}</b><br>${esc(o.address)}</p>
            ${o.note ? `<p class="ad-note">“${esc(o.note)}”</p>` : ""}
          </div>
          <div class="ad-items">
            <table>${items}</table>
            ${giftHtml}
            <p class="ad-total">${Number(o.wrap_price) ? `<span class="ad-muted">incl. wrapping ${esc(fmt(o.wrap_price))}</span>` : ""}<b>${esc(fmt(o.total))}</b></p>
          </div>
        </div>
        <footer class="ad-order-foot">
          <textarea class="input textarea" data-act="note" rows="1" maxlength="2000" placeholder="Private note (only admins see it)">${esc(o.admin_note || "")}</textarea>
          <button class="btn btn-ghost btn-sm" data-act="saveNote">Save note</button>
          <button class="btn btn-ghost btn-sm ad-danger" data-act="delete">Delete</button>
        </footer>
      </article>`;
    }).join("");
  }
  ["#oSearch", "#oStatus"].forEach((s) => $(s).addEventListener("input", renderOrders));
  $("#oRefresh").addEventListener("click", loadOrders);

  $("#ordersList").addEventListener("change", async (e) => {
    if (e.target.dataset.act !== "status") return;
    const card = e.target.closest(".ad-order"), id = card.dataset.id, status = e.target.value;
    if (!STATUSES.some(([v]) => v === status)) return;
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) { toast(explain(error), true); return loadOrders(); }
    orders.find((o) => o.id === id).status = status;
    renderOrders();
    toast("Status updated");
  });
  $("#ordersList").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const card = b.closest(".ad-order"), id = card.dataset.id, o = orders.find((x) => x.id === id);
    if (b.dataset.act === "saveNote") {
      const admin_note = $('[data-act="note"]', card).value.slice(0, 2000);
      const { error } = await sb.from("orders").update({ admin_note }).eq("id", id);
      if (error) return toast(explain(error), true);
      o.admin_note = admin_note; toast("Note saved");
    }
    if (b.dataset.act === "delete") {
      if (!confirm(`Delete order ${o.ref} permanently?\nTip: set it to “Cancelled” instead to keep a record.`)) return;
      const { error } = await sb.from("orders").delete().eq("id", id);
      if (error) return toast(explain(error), true);
      orders = orders.filter((x) => x.id !== id); renderOrders(); toast("Order deleted");
    }
  });

  /* ---------------- Start ---------------- */
  sb.auth.getSession().then(({ data }) => (data.session ? enterApp(data.session) : show("#viewLogin")));
})();
