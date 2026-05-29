/* ============================================================
   sheet-loader.js  —  pulls the weekly list from a published
   Google Sheet CSV and feeds it into the app.

   Safe by design:
     • No URL set  → uses the built-in list in data.js (looks identical)
     • Fetch fails → falls back to the built-in list, never blanks out
   Only the LIST ITEMS and the week/month labels come from the Sheet.
   Buckets, ownership colors, and the off-plate log stay in data.js.
   ============================================================ */

(function () {
  // ---- tiny robust CSV parser (handles quotes, commas, newlines) ----
  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", i = 0, inQ = false;
    text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    while (i < text.length) {
      const c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"') { inQ = true; i++; continue; }
      if (c === ",") { row.push(field); field = ""; i++; continue; }
      if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
      field += c; i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function rowsToObjects(rows) {
    if (!rows.length) return [];
    const header = rows[0].map(h => h.trim().toLowerCase());
    return rows.slice(1)
      .filter(r => r.some(c => c && c.trim() !== ""))
      .map(r => {
        const o = {};
        header.forEach((h, idx) => { o[h] = (r[idx] != null ? r[idx].trim() : ""); });
        return o;
      });
  }

  // ---- forgiving value normalizers (accept friendly labels OR slugs) ----
  function norm(s) { return (s || "").toLowerCase().trim(); }

  function mapBucket(v) {
    const n = norm(v);
    if (n.startsWith("action")) return "action";
    if (n.startsWith("oversight")) return "oversight";
    if (n.startsWith("aware")) return "awareness";
    if (n.startsWith("event")) return "events";
    if (n.startsWith("assess")) return "assess";
    return n || "awareness";
  }
  function mapOwnership(v) {
    const n = norm(v);
    if (n.includes("principal do") || n === "principal-do" || n === "p-do") return "principal-do";
    if (n.includes("principal verify") || n === "principal-verify" || n === "p-vrf") return "principal-verify";
    if (n.includes("campus") || n === "campus-do" || n === "camp") return "campus-do";
    if (n.includes("central") || n === "central-do" || n === "co") return "central-do";
    return n || "central-do";
  }
  function mapAction(v) {
    const n = norm(v);
    return (n === "action" || n === "action required" || n === "yes") ? "action" : "fyi";
  }

  function buildItems(objs) {
    return objs.map((o, idx) => ({
      id: o.id ? (isNaN(+o.id) ? o.id : +o.id) : idx + 1,
      scope: norm(o.scope) === "month" ? "month" : "week",
      title: o.title || "(untitled item)",
      dept: o.dept || "",
      senderName: o.sender || o.sendername || "",
      bucket: mapBucket(o.bucket),
      ownership: mapOwnership(o.ownership),
      delegate: o.delegate || "",
      due: o.due || "",
      action: mapAction(o.action),
      priority: norm(o.priority) || "med",
      success: o.success || "",
      resource: o.resource || "",
      division: o.division || ""
    }));
  }

  window.__listDataReady = (async function () {
    const cfg = window.SHEET_CONFIG || {};
    const url = (cfg.csvUrl || "").trim();
    if (!url) return { source: "built-in" };  // use data.js as-is

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const text = await res.text();
      const objs = rowsToObjects(parseCSV(text));
      const items = buildItems(objs);
      if (!items.length) throw new Error("no rows parsed");

      // Mutate the existing object in place so references stay valid.
      window.LIST_DATA.items = items;
      const metaRow = objs.find(o => o.weekof || o.monthof);
      if (metaRow) {
        if (metaRow.weekof)  window.LIST_DATA.meta.weekOf  = metaRow.weekof;
        if (metaRow.monthof) window.LIST_DATA.meta.monthOf = metaRow.monthof;
      }
      console.info("Principal List: loaded " + items.length + " items from Google Sheet.");
      return { source: "sheet", count: items.length };
    } catch (e) {
      console.warn("Principal List: could not load Sheet, using built-in list. (" + e.message + ")");
      return { source: "fallback", error: e.message };
    }
  })();
})();
