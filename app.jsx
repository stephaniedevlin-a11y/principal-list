/* Principal List — dashboard + weekly/monthly checklist
   Schema mirrors the FWISD-Houston hybrid sheet (ownership = "Tab" column,
   bucket = "Principal Bucket" column). */

const { useState, useMemo, useEffect } = React;

/* Persist checkbox state per principal in their own browser only. */
const STORAGE_KEY = "fwisd-principal-list-checks-v1";
function useLocalChecks() {
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(done)); } catch {}
  }, [done]);
  return [done, setDone];
}
const D = window.LIST_DATA;
const { TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle, TweakSelect } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tone": "default",
  "density": "default",
  "actionColor": "coral",
  "view": "dashboard",
  "showOffPlateRail": true,
  "groupBy": "bucket"
}/*EDITMODE-END*/;

/* ---------- helpers ---------- */
const bucketLabel = id => D.buckets.find(b => b.id === id)?.label ?? id;
const bucketColor = id => ({
  action: "var(--accent-red)", oversight: "var(--accent-amber)",
  awareness: "var(--accent-blue)", events: "var(--accent-violet)", assess: "var(--accent-teal)"
}[id]);
const ownLabel = id => D.ownershipStates.find(o => o.id === id)?.short ?? id;
const ownFull  = id => D.ownershipStates.find(o => o.id === id)?.label ?? id;
const isOnPlate = id => !!D.ownershipStates.find(o => o.id === id)?.onPlate;

const groupBy = (arr, key) => arr.reduce((m, x) => { (m[x[key]] ??= []).push(x); return m; }, {});

const dueBadgeClass = (due) => {
  if (!due) return "";
  if (/aug 1[89]|aug 2[012]/i.test(due)) return "due-soon";
  if (/aug|sep 0[1-9]/i.test(due))       return "due-week";
  if (/ongoing/i.test(due))               return "ongoing";
  return "";
};

/* ---------- Topbar ---------- */
function Topbar() {
  return (
    <div className="topbar">
      <div className="brand">
        Principal List
        <span className="sub">{D.meta.audienceNote}</span>
      </div>
      <div className="meta">
        <span className="week">Week of {D.meta.weekOf}</span>
        <span>School Year {D.meta.schoolYear} · {D.meta.district}</span>
      </div>
    </div>
  );
}

/* ---------- Tabs ---------- */
function Tabs({ value, onChange, items }) {
  return (
    <div className="tabs" role="tablist">
      {items.map(t => (
        <button key={t.id}
          className="tab"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}>
          {t.label}
          {t.count != null && <span className="count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- KPI strip ---------- */
function KPIStrip({ items }) {
  const total = items.length;
  const actionReq = items.filter(i => i.bucket === "action").length;
  const offPlate = items.filter(i => !isOnPlate(i.ownership)).length;
  const dueSoon = items.filter(i => dueBadgeClass(i.due) === "due-soon").length;
  const offPct = total ? Math.round((offPlate / total) * 100) : 0;

  const cards = [
    { label: "Items this period", value: total, delta: "—" },
    { label: "Action required", value: actionReq, delta: `${total ? Math.round(actionReq/total*100) : 0}% of total`, tint: "action" },
    { label: "Kept off principal's plate", value: offPlate, delta: `${offPct}% of all items`, deltaCls: "up", tint: "offplate" },
    { label: "Due this week", value: dueSoon, delta: dueSoon ? "act now" : "clear", tint: dueSoon ? "due" : null },
    { label: "Off-plate wins logged", value: D.offPlateLog.length, delta: "month-to-date", deltaCls: "up", tint: "offplate" }
  ];
  return (
    <div className="kpi-row">
      {cards.map((c, i) => (
        <div className={`kpi ${c.tint ? "tint-" + c.tint : ""}`} key={i}>
          <div className="label">{c.label}</div>
          <div className="value">{c.value}</div>
          <div className={`delta ${c.deltaCls || ""}`}>{c.delta}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Dashboard: Department load (stacked bar) ---------- */
function DeptLoadChart({ items }) {
  const byDept = groupBy(items, "dept");
  const rows = Object.entries(byDept)
    .map(([dept, list]) => {
      const counts = {};
      for (const it of list) counts[it.bucket] = (counts[it.bucket] || 0) + 1;
      return { dept, total: list.length, counts };
    })
    .sort((a, b) => b.total - a.total);
  const max = Math.max(...rows.map(r => r.total), 1);

  return (
    <div className="card">
      <h3>Department load — who is sending items</h3>
      <div className="sub">Stacked by principal bucket. Bigger bars = bigger ask on the principal.</div>
      {rows.map(r => (
        <div className="stacked-row" key={r.dept}>
          <div className="name">{r.dept}</div>
          <div className="bar">
            {D.buckets.map(b => {
              const c = r.counts[b.id] || 0;
              if (!c) return null;
              const w = (c / max) * 100;
              return <span key={b.id} className={`b-${b.id}`} style={{ width: `${w}%` }} title={`${b.label}: ${c}`} />;
            })}
          </div>
          <div className="total">{r.total}</div>
        </div>
      ))}
      <div className="legend">
        {D.buckets.map(b => (
          <span key={b.id}><span className="sw" style={{ background: bucketColor(b.id) }} />{b.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Dashboard: Bucket mix + ownership mix ---------- */
function BucketMixCard({ items }) {
  const total = items.length;
  const bucketCounts = {};
  for (const it of items) bucketCounts[it.bucket] = (bucketCounts[it.bucket] || 0) + 1;
  const ownCounts = {};
  for (const it of items) ownCounts[it.ownership] = (ownCounts[it.ownership] || 0) + 1;

  return (
    <div className="card">
      <h3>Where the load lives</h3>
      <div className="sub">By principal bucket (top) and by ownership state (bottom).</div>
      {D.buckets.map(b => {
        const c = bucketCounts[b.id] || 0;
        const pct = total ? (c / total) * 100 : 0;
        return (
          <div className="bucket-row" key={b.id}>
            <div className="name"><span className="dot" style={{ background: bucketColor(b.id) }} />{b.label}</div>
            <div className="meter"><span style={{ width: `${pct}%`, background: bucketColor(b.id) }} /></div>
            <div className="total">{c} · {Math.round(pct)}%</div>
          </div>
        );
      })}
      <div style={{ height: 14 }} />
      <h3 style={{ fontSize: 13 }}>Ownership distribution</h3>
      <div className="sub">Items in <strong>Principal DO</strong> are fully on the plate. Items in <strong>Central Office</strong> are off the plate.</div>
      {D.ownershipStates.map(o => {
        const c = ownCounts[o.id] || 0;
        const pct = total ? (c / total) * 100 : 0;
        return (
          <div className="bucket-row" key={o.id}>
            <div className="name"><span className={`own ${o.id}`} style={{ padding: "1px 6px" }}>{o.short}</span>&nbsp;{o.label.replace(/\/.*$/, "")}</div>
            <div className="meter"><span style={{ width: `${pct}%`, background: o.onPlate ? "var(--accent-red)" : "var(--accent-green)" }} /></div>
            <div className="total">{c}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Dashboard: Off-plate ---------- */
function OffPlateCard() {
  const log = D.offPlateLog;
  const hrsTotal = log.reduce((s, l) => s + (parseFloat(l.timeSaved.match(/[\d.]+/)?.[0] || 0)), 0);
  return (
    <div className="card off-plate-card">
      <h3>Taking it off the plate — this month</h3>
      <div className="sub">Items moved from <em>Principal DO</em> to a delegate or central office.</div>
      <div className="off-stats">
        <div className="off-stat">
          <div className="v">{log.length}</div>
          <div className="l">Items moved</div>
        </div>
        <div className="off-stat">
          <div className="v">~{Math.round(hrsTotal)}h</div>
          <div className="l">Saved / principal</div>
        </div>
        <div className="off-stat">
          <div className="v">{new Set(log.map(l => l.sender)).size}</div>
          <div className="l">Departments helping</div>
        </div>
      </div>
      {log.map(l => (
        <div className="off-row" key={l.id}>
          <div className="when">{l.date}</div>
          <div className="what">
            <div className="title">{l.item}</div>
            <div className="note">
              <span className={`own ${l.from}`}>{ownLabel(l.from)}</span>
              {" → "}
              <span className={`own ${l.to}`}>{ownLabel(l.to)}</span>
              {" · "}{l.note}
            </div>
          </div>
          <div className="meta-r">
            <span className="saved">{l.timeSaved}</span>
            <span className="approver">approved by {l.approver}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Item row ---------- */
function ItemRow({ item, done, onToggle, dense }) {
  return (
    <div className={`row ${done ? "done" : ""}`}>
      <div className={`check ${done ? "done" : ""}`} onClick={onToggle} role="checkbox" aria-checked={done} />
      <div className="cell title-cell">
        {item.title}
        {!dense && <span className="sub">{item.success}</span>}
      </div>
      <div className="cell"><span className="badge dept">{item.dept}</span></div>
      <div className="cell truncate" title={item.delegate}>{item.delegate || "—"}</div>
      <div className="cell">
        <span className={`badge ${dueBadgeClass(item.due)}`}>{item.due}</span>
      </div>
      <div className="cell"><span className={`own ${item.ownership}`}>{ownLabel(item.ownership)}</span></div>
      <div className="cell"><button className="iconbtn">Open</button></div>
    </div>
  );
}

/* ---------- Group of items by bucket ---------- */
function ItemGroup({ bucketId, items, done, setDone, dense }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="group-header">
        <span className={`pill ${bucketId}`}>{bucketLabel(bucketId)}</span>
        <h4>{items.length} {items.length === 1 ? "item" : "items"}</h4>
        <span className="count">· grouped by principal bucket</span>
      </div>
      <div className="table">
        <div className="row header">
          <div />
          <div className="cell">Item</div>
          <div className="cell">Dept</div>
          <div className="cell">Delegate</div>
          <div className="cell">Due</div>
          <div className="cell">Ownership</div>
          <div className="cell">Link</div>
        </div>
        {items.map(it => (
          <ItemRow key={it.id} item={it} dense={dense}
            done={!!done[it.id]}
            onToggle={() => setDone(s => ({ ...s, [it.id]: !s[it.id] }))} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Weekly view ---------- */
function WeeklyView({ showOffPlateRail, dense }) {
  const [done, setDone] = useLocalChecks();
  const items = D.items.filter(i => i.scope === "week");
  const byBucket = groupBy(items, "bucket");
  const order = ["action", "oversight", "awareness", "events", "assess"];

  const main = (
    <div>
      <div className="week-header">
        <h2>This Week — {D.meta.weekOf}</h2>
        <div className="actions">
          <button className="btn" onClick={() => window.print()}>Print</button>
          <button className="btn subtle" onClick={() => { if (confirm("Clear all your checkmarks?")) setDone({}); }}>Clear checks</button>
        </div>
      </div>
      <div className="privacy-note">
        <strong>Your checks save only on your device.</strong> Nothing is sent to central office — this is for your own tracking. Refresh anytime; your progress stays. Print or screenshot if you want a record.
      </div>
      {order.map(b => (
        <ItemGroup key={b} bucketId={b} items={byBucket[b] || []} done={done} setDone={setDone} dense={dense} />
      ))}
    </div>
  );

  if (!showOffPlateRail) return main;

  const recentWins = D.offPlateLog.slice(0, 4);
  const hrsTotal = D.offPlateLog.reduce((s, l) => s + (parseFloat(l.timeSaved.match(/[\d.]+/)?.[0] || 0)), 0);

  return (
    <div className="week-layout">
      {main}
      <aside className="rail">
        <h3>Off your plate this week</h3>
        <div className="rail-card">
          <div className="headline"><span className="num">{D.offPlateLog.length}</span> items handled for you</div>
          <div className="lede">~{Math.round(hrsTotal)} hours back per principal, month-to-date.</div>
          {recentWins.map(w => (
            <div className="item" key={w.id}>
              <div className="what">{w.item}</div>
              <div className="why">{w.note}</div>
            </div>
          ))}
        </div>
        <div className="rail-note">
          <strong>Need to move something off your plate?</strong> Flag it to your Regional Chief or Sr ED of School Ops; they'll route to the right central office team.
        </div>
      </aside>
    </div>
  );
}

/* ---------- Monthly view (flat list, grouped by department) ---------- */
function MonthlyView({ dense }) {
  const [done, setDone] = useLocalChecks();
  const items = [...D.items];
  const byDept = groupBy(items, "dept");
  const sortedDepts = Object.keys(byDept).sort((a, b) => byDept[b].length - byDept[a].length);

  return (
    <div>
      <div className="week-header">
        <h2>This Month — {D.meta.monthOf}</h2>
        <div className="actions">
          <button className="btn" onClick={() => window.print()}>Print</button>
          <button className="btn subtle" onClick={() => { if (confirm("Clear all your checkmarks?")) setDone({}); }}>Clear checks</button>
        </div>
      </div>
      {sortedDepts.map(dept => (
        <div key={dept}>
          <div className="group-header">
            <span className="pill">{dept}</span>
            <h4>{byDept[dept].length} {byDept[dept].length === 1 ? "item" : "items"}</h4>
          </div>
          <div className="table">
            <div className="row header">
              <div />
              <div className="cell">Item</div>
              <div className="cell">Bucket</div>
              <div className="cell">Delegate</div>
              <div className="cell">Due</div>
              <div className="cell">Ownership</div>
              <div className="cell">Link</div>
            </div>
            {byDept[dept].map(it => (
              <div className={`row ${done[it.id] ? "done" : ""}`} key={it.id}>
                <div className={`check ${done[it.id] ? "done" : ""}`} onClick={() => setDone(s => ({ ...s, [it.id]: !s[it.id] }))} />
                <div className="cell title-cell">
                  {it.title}
                  {!dense && <span className="sub">{it.success}</span>}
                </div>
                <div className="cell">
                  <span className="badge" style={{ background: `color-mix(in oklch, ${bucketColor(it.bucket)} 12%, transparent)`, color: bucketColor(it.bucket), borderColor: "transparent" }}>
                    {bucketLabel(it.bucket)}
                  </span>
                </div>
                <div className="cell truncate" title={it.delegate}>{it.delegate || "—"}</div>
                <div className="cell"><span className={`badge ${dueBadgeClass(it.due)}`}>{it.due}</span></div>
                <div className="cell"><span className={`own ${it.ownership}`}>{ownLabel(it.ownership)}</span></div>
                <div className="cell"><button className="iconbtn">Open</button></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Off-plate log view ---------- */
function OffPlateView() {
  return (
    <div style={{ maxWidth: 920 }}>
      <div className="week-header">
        <h2>Off the Plate — Log</h2>
        <div className="right">Items moved out of <em>Principal DO</em> this month</div>
      </div>
      <div className="card">
        <h3>How items move</h3>
        <div className="sub">When a Regional Chief, ED of Instruction, or Sr ED of School Ops approves a re-ownership, it's logged here.</div>
        <div className="table" style={{ marginTop: 8 }}>
          <div className="row header" style={{ gridTemplateColumns: "100px 1fr 220px 160px 110px" }}>
            <div className="cell">Date</div>
            <div className="cell">Item</div>
            <div className="cell">Move</div>
            <div className="cell">Approver</div>
            <div className="cell">Saved</div>
          </div>
          {D.offPlateLog.map(l => (
            <div className="row" key={l.id} style={{ gridTemplateColumns: "100px 1fr 220px 160px 110px" }}>
              <div className="cell" style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{l.date}</div>
              <div className="cell title-cell">
                {l.item}
                <span className="sub">{l.note}</span>
              </div>
              <div className="cell">
                <span className={`own ${l.from}`}>{ownLabel(l.from)}</span>
                {" → "}
                <span className={`own ${l.to}`}>{ownLabel(l.to)}</span>
              </div>
              <div className="cell" style={{ fontSize: 12 }}>{l.approver}</div>
              <div className="cell" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--accent-green)" }}>{l.timeSaved}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Design notes view ---------- */
function NotesView() {
  return (
    <div className="notes">
      <h2>About this Principal List</h2>
      <p>The work that's gone into supporting our principals — the current Principal Packet, the Comprehensive Principal Requirements workbook, and the partnership across central office to keep them informed — has built a strong foundation for our campuses. This draft builds on that foundation with a refreshed format for 2026–27, aimed at giving principals a weekly view that's quick to read and easy to act on, and giving central office a clearer way to see and celebrate the support we're providing.</p>
      <p>It's a working draft, and your feedback will shape where it goes next.</p>

      <p>Three things shaped this draft, all of which I've heard from Dr. Soliz:</p>
      <ol>
        <li>Take things off principals' plates — and show that we're doing it.</li>
        <li>Make it easy for central office to see what's being asked of campuses each week.</li>
        <li>Give principals a list they can actually read, reference, and check off throughout the week.</li>
      </ol>

      <h3>What's being proposed</h3>
      <p>One principal-facing artifact, published weekly, with a leadership dashboard behind it. The weekly view groups items by what a principal is being asked to do (Action, Oversight, Awareness) rather than by the department sending them. The monthly view flips that — items grouped by department — so cabinet can see the full picture of what's flowing to campuses.</p>

      <p>The dashboard tracks the work being moved <em>off</em> principals' plates. Every time a Regional Chief, EDI, or Sr ED of School Operations reassigns an item from "Principal DO" to a delegate or to central office, it's logged so we can point to the progress.</p>

      <p>The goal is something principals look forward to opening — clear, current, and quietly proof that we're listening.</p>

      <h3>A note on the items shown</h3>
      <p>The items on the Weekly and Monthly views are pulled from last year's Principal Packet so there's something real to react to. The 2026–27 items will replace these once the format is settled. Resource links are placeholders for now — they'll connect to actual one-pagers and forms in the build.</p>

      <h3>What I need from you</h3>
      <ol>
        <li>Does this format work, or is there a piece worth rethinking?</li>
        <li>Are the right metrics on the dashboard? Anything missing?</li>
        <li>How does the overall look and feel land — does it feel right for our principals?</li>
      </ol>
    </div>
  );
}

/* ---------- Tweaks ---------- */
function Tweaks() {
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Visual tone">
        <TweakRadio label="Mode" value={t.tone}
          onChange={v => setT("tone", v)}
          options={[
            { value: "default",   label: "Editorial" },
            { value: "sheets",    label: "Sheets-native" },
            { value: "ops",       label: "Ops console" }
          ]} />
      </TweakSection>
      <TweakSection title="Action Required color">
        <TweakRadio label="Color" value={t.actionColor}
          onChange={v => setT("actionColor", v)}
          options={[
            { value: "coral", label: "Coral" },
            { value: "green", label: "Green" },
            { value: "amber", label: "Amber" }
          ]} />
      </TweakSection>
      <TweakSection title="Density">
        <TweakRadio label="Row height" value={t.density}
          onChange={v => setT("density", v)}
          options={[
            { value: "compact",     label: "Compact" },
            { value: "default",     label: "Default" },
            { value: "comfortable", label: "Comfortable" }
          ]} />
      </TweakSection>
      <TweakSection title="Weekly layout">
        <TweakToggle label="Show off-plate rail" value={t.showOffPlateRail}
          onChange={v => setT("showOffPlateRail", v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

/* ---------- App ---------- */
function App() {
  const [t] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useState("dashboard");

  const weekItems = D.items.filter(i => i.scope === "week");
  const allItems  = D.items;

  const tone = t.tone === "default" ? "editorial" : t.tone;
  const density = t.density === "default" ? "" : t.density;

  return (
    <div className="app" data-tone={tone} data-density={density} data-action-color={t.actionColor === "coral" ? "" : t.actionColor} data-screen-label="01 Principal List">
      <Topbar />
      <Tabs value={tab} onChange={setTab}
        items={[
          { id: "dashboard", label: "Dashboard" },
          { id: "weekly",    label: "This Week",  count: weekItems.length },
          { id: "monthly",   label: "This Month", count: allItems.length },
          { id: "offplate",  label: "Off-Plate Log", count: D.offPlateLog.length }
        ]} />

      {tab === "dashboard" && (<>
        <KPIStrip items={allItems} />
        <div className="dash">
          <DeptLoadChart items={allItems} />
          <BucketMixCard items={allItems} />
        </div>
        <div className="spacer-lg" />
        <OffPlateCard />
      </>)}

      {tab === "weekly"   && <WeeklyView showOffPlateRail={t.showOffPlateRail} dense={t.density === "compact"} />}
      {tab === "monthly"  && <MonthlyView dense={t.density === "compact"} />}
      {tab === "offplate" && <OffPlateView />}

      <Tweaks />
    </div>
  );
}

/* Wait for the Sheet loader (if any) before first paint so the list
   shows real data immediately instead of flashing the fallback. */
(window.__listDataReady || Promise.resolve()).then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
});
