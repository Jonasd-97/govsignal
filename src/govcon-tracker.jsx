import React from 'react';
import { useState, useEffect, useCallback } from "react";

// ── CONSTANTS ──
const NAICS_OPTIONS = [
  { code: "541511", label: "541511 — Custom Computer Programming" },
  { code: "541512", label: "541512 — Computer Systems Design" },
  { code: "541513", label: "541513 — Computer Facilities Management" },
  { code: "541519", label: "541519 — Other Computer Related Services" },
  { code: "541611", label: "541611 — Management Consulting" },
  { code: "541690", label: "541690 — Other Scientific & Technical Consulting" },
  { code: "541715", label: "541715 — R&D in Physical Sciences" },
  { code: "561320", label: "561320 — Temporary Staffing Services" },
  { code: "561410", label: "561410 — Document Preparation Services" },
  { code: "561990", label: "561990 — Other Support Services" },
  { code: "238210", label: "238210 — Electrical Contractors" },
  { code: "332999", label: "332999 — Other Fabricated Metal Products" },
  { code: "423490", label: "423490 — Industrial Equipment Wholesale" },
  { code: "424490", label: "424490 — Grocery & Related Product Wholesale" },
  { code: "511210", label: "511210 — Software Publishers" },
  { code: "517110", label: "517110 — Wired Telecom Carriers" },
  { code: "621111", label: "621111 — Offices of Physicians" },
  { code: "811212", label: "811212 — Computer Repair & Maintenance" },
];

const SET_ASIDE_OPTIONS = [
  { code: "SBA",    label: "Small Business" },
  { code: "8AN",    label: "8(a)" },
  { code: "HZC",    label: "HUBZone" },
  { code: "SDVOSBC",label: "SDVOSB" },
  { code: "WOSB",   label: "WOSB" },
  { code: "EDWOSB", label: "EDWOSB" },
  { code: "VSB",    label: "Veteran-Owned Small Business" },
];

const AGENCY_OPTIONS = [
  "DEPT OF DEFENSE",
  "DEPT OF VETERANS AFFAIRS",
  "DEPT OF HOMELAND SECURITY",
  "GENERAL SERVICES ADMINISTRATION",
  "DEPT OF HEALTH AND HUMAN SERVICES",
  "DEPT OF JUSTICE",
  "DEPT OF TRANSPORTATION",
  "DEPT OF ENERGY",
  "DEPT OF STATE",
  "NASA",
  "ENVIRONMENTAL PROTECTION AGENCY",
  "DEPT OF TREASURY",
  "DEPT OF AGRICULTURE",
  "DEPT OF INTERIOR",
  "DEPT OF LABOR",
];

const TYPE_LABELS = {
  o: "Solicitation", p: "Pre-Sol", k: "Combined", r: "Sources Sought",
  g: "Sale of Surplus", s: "Special Notice", i: "Intent to Bundle", a: "Award Notice",
};

const DEMO_OPPS = [
  {
    noticeId: "DEMO-001",
    title: "Information Technology Support Services for Federal Agency",
    fullParentPathName: "DEPT OF VETERANS AFFAIRS > VA TECHNOLOGY ACQUISITION CENTER",
    naicsCode: "541512",
    type: "o",
    postedDate: "2026-03-01",
    responseDeadLine: "2026-03-28T17:00:00",
    baseType: "Solicitation",
    typeOfSetAsideDescription: "Small Business Set-Aside",
    award: null,
    uiLink: "https://sam.gov/opportunities",
    description: "The Department of Veterans Affairs requires IT support services including help desk operations, systems administration, and cybersecurity monitoring.",
  },
  {
    noticeId: "DEMO-002",
    title: "Cybersecurity Assessment and Penetration Testing Services",
    fullParentPathName: "DEPT OF HOMELAND SECURITY > CISA",
    naicsCode: "541519",
    type: "o",
    postedDate: "2026-03-03",
    responseDeadLine: "2026-03-31T17:00:00",
    baseType: "Solicitation",
    typeOfSetAsideDescription: "8(a) Set-Aside",
    award: null,
    uiLink: "https://sam.gov/opportunities",
  },
  {
    noticeId: "DEMO-003",
    title: "Cloud Migration and DevSecOps Support — Phase II",
    fullParentPathName: "GENERAL SERVICES ADMINISTRATION > FAS",
    naicsCode: "541511",
    type: "k",
    postedDate: "2026-03-04",
    responseDeadLine: "2026-04-04T17:00:00",
    baseType: "Combined Synopsis",
    typeOfSetAsideDescription: "HUBZone Set-Aside",
    award: null,
    uiLink: "https://sam.gov/opportunities",
  },
  {
    noticeId: "DEMO-004",
    title: "Management Consulting for Operational Process Improvement",
    fullParentPathName: "DEPT OF DEFENSE > DEFENSE LOGISTICS AGENCY",
    naicsCode: "541611",
    type: "r",
    postedDate: "2026-03-05",
    responseDeadLine: "2026-03-21T17:00:00",
    baseType: "Sources Sought",
    typeOfSetAsideDescription: "SDVOSB Set-Aside",
    award: null,
    uiLink: "https://sam.gov/opportunities",
  },
  {
    noticeId: "DEMO-005",
    title: "IT Staffing Augmentation — Software Developers and Data Scientists",
    fullParentPathName: "DEPT OF HEALTH AND HUMAN SERVICES > CDC",
    naicsCode: "561320",
    type: "o",
    postedDate: "2026-03-06",
    responseDeadLine: "2026-04-14T17:00:00",
    baseType: "Solicitation",
    typeOfSetAsideDescription: "Women-Owned Small Business",
    award: null,
    uiLink: "https://sam.gov/opportunities",
  },
];

function scoreOpportunity(opp, profile) {
  let score = 50;
  const reasons = [];
  if (profile.naics && opp.naicsCode === profile.naics) {
    score += 25; reasons.push("NAICS match");
  }
  if (profile.setAside && opp.typeOfSetAsideDescription?.toLowerCase().includes(
    SET_ASIDE_OPTIONS.find(s => s.code === profile.setAside)?.label?.toLowerCase() || ""
  )) {
    score += 20; reasons.push("Set-aside match");
  }
  if (opp.type === "o" || opp.type === "k") { score += 5; }
  const deadline = new Date(opp.responseDeadLine);
  const daysLeft = Math.ceil((deadline - new Date()) / 86400000);
  if (daysLeft > 14) { score += 5; reasons.push("Good lead time"); }
  if (daysLeft < 5) { score -= 15; reasons.push("Tight deadline"); }
  if (profile.agency && opp.fullParentPathName?.includes(profile.agency)) {
    score += 15; reasons.push("Target agency");
  }
  return { score: Math.min(99, Math.max(10, score)), reasons };
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Math.ceil((d - new Date()) / 86400000);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ScoreBadge({ score }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#6b7280";
  const bg = score >= 75 ? "#d1fae5" : score >= 50 ? "#fef3c7" : "#f3f4f6";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: bg, color, borderRadius: 20, padding: "2px 10px",
      fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace"
    }}>
      <span style={{ fontSize: 10 }}>▲</span> {score}
    </div>
  );
}

function DeadlinePill({ dateStr }) {
  const days = daysUntil(dateStr);
  if (days === null) return <span style={{ color: "#9ca3af", fontSize: 12 }}>No deadline</span>;
  const color = days <= 5 ? "#ef4444" : days <= 14 ? "#f59e0b" : "#10b981";
  const bg = days <= 5 ? "#fef2f2" : days <= 14 ? "#fffbeb" : "#f0fdf4";
  return (
    <span style={{ background: bg, color, borderRadius: 12, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {days <= 0 ? "EXPIRED" : `${days}d left`}
    </span>
  );
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [apiKey, setApiKey] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [opportunities, setOpportunities] = useState(DEMO_OPPS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedOpps, setSavedOpps] = useState([]);
  const [pastPerf, setPastPerf] = useState([]);
  const [showAddPerf, setShowAddPerf] = useState(false);
  const [newPerf, setNewPerf] = useState({ title: "", agency: "", value: "", year: "", outcome: "Won" });
  const [profile, setProfile] = useState({ naics: "", setAside: "", agency: "", companyName: "" });
  const [filters, setFilters] = useState({
    naics: "", setAside: "", agency: "", minValue: "", maxValue: "",
    postedFrom: "", keyword: "", type: ""
  });
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");
  const [usingDemo, setUsingDemo] = useState(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchOpportunities = useCallback(async () => {
    if (!apiKey) {
      setUsingDemo(true);
      setOpportunities(DEMO_OPPS);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const today = new Date();
      const from = new Date(today); from.setDate(from.getDate() - 30);
      const fmt = d => `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${d.getFullYear()}`;
      const params = new URLSearchParams({
        api_key: apiKey, limit: 25,
        postedFrom: fmt(from), postedTo: fmt(today),
      });
      if (filters.naics) params.append("naicsCode", filters.naics);
      if (filters.type) params.append("ptype", filters.type);
      if (filters.keyword) params.append("title", filters.keyword);
      const res = await fetch(`https://api.sam.gov/prod/opportunities/v2/search?${params}`);
      if (!res.ok) throw new Error(`SAM.gov returned ${res.status}. Check your API key.`);
      const data = await res.json();
      const opps = (data.opportunitiesData || []);
      setOpportunities(opps.length ? opps : DEMO_OPPS);
      setUsingDemo(opps.length === 0);
      if (opps.length) showToast(`Loaded ${opps.length} live opportunities from SAM.gov`);
    } catch (e) {
      setError(e.message);
      setOpportunities(DEMO_OPPS);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, [apiKey, filters.naics, filters.type, filters.keyword]);

  useEffect(() => { fetchOpportunities(); }, []);

  const scoredOpps = opportunities.map(o => ({ ...o, ...scoreOpportunity(o, profile) }))
    .sort((a, b) => b.score - a.score);

  const filteredOpps = scoredOpps.filter(o => {
    if (filters.agency && !o.fullParentPathName?.includes(filters.agency)) return false;
    if (filters.setAside) {
      const label = SET_ASIDE_OPTIONS.find(s => s.code === filters.setAside)?.label || "";
      if (!o.typeOfSetAsideDescription?.toLowerCase().includes(label.toLowerCase())) return false;
    }
    return true;
  });

  const toggleSave = (opp) => {
    const exists = savedOpps.find(s => s.noticeId === opp.noticeId);
    if (exists) {
      setSavedOpps(prev => prev.filter(s => s.noticeId !== opp.noticeId));
      showToast("Removed from watchlist");
    } else {
      setSavedOpps(prev => [...prev, opp]);
      showToast("Added to watchlist ✓");
    }
  };

  const isSaved = (id) => savedOpps.some(s => s.noticeId === id);

  const upcomingDeadlines = [...scoredOpps]
    .filter(o => o.responseDeadLine && daysUntil(o.responseDeadLine) > 0)
    .sort((a, b) => new Date(a.responseDeadLine) - new Date(b.responseDeadLine))
    .slice(0, 5);

  const styles = {
    app: { fontFamily: "'Inter', system-ui, sans-serif", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0" },
    sidebar: {
      width: 220, background: "#1e293b", height: "100vh", position: "fixed",
      left: 0, top: 0, borderRight: "1px solid #334155", display: "flex", flexDirection: "column",
    },
    logo: { padding: "20px 20px 16px", borderBottom: "1px solid #334155" },
    navItem: (active) => ({
      display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
      cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400,
      color: active ? "#f59e0b" : "#94a3b8",
      background: active ? "rgba(245,158,11,0.08)" : "transparent",
      borderLeft: active ? "3px solid #f59e0b" : "3px solid transparent",
      transition: "all 0.15s",
    }),
    main: { marginLeft: 220, padding: "28px 32px", minHeight: "100vh" },
    card: {
      background: "#1e293b", border: "1px solid #334155", borderRadius: 12,
      padding: 20, marginBottom: 16,
    },
    oppCard: (isSelected) => ({
      background: isSelected ? "#1e3a5f" : "#1e293b",
      border: `1px solid ${isSelected ? "#3b82f6" : "#334155"}`,
      borderRadius: 10, padding: 16, marginBottom: 10, cursor: "pointer",
      transition: "all 0.15s",
    }),
    input: {
      background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
      color: "#e2e8f0", padding: "8px 12px", fontSize: 13, outline: "none", width: "100%",
    },
    select: {
      background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
      color: "#e2e8f0", padding: "8px 12px", fontSize: 13, outline: "none", width: "100%",
    },
    btn: (variant = "primary") => ({
      padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13,
      fontWeight: 600, transition: "all 0.15s",
      background: variant === "primary" ? "#f59e0b" : variant === "danger" ? "#ef4444" : "#334155",
      color: variant === "primary" ? "#000" : "#fff",
    }),
    label: { fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" },
    h1: { fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px" },
    h2: { fontSize: 16, fontWeight: 700, color: "#f1f5f9", margin: "0 0 12px" },
    tag: (color = "#334155") => ({
      display: "inline-block", background: color, borderRadius: 6,
      padding: "2px 8px", fontSize: 11, fontWeight: 600, color: "#e2e8f0", marginRight: 4
    }),
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
    statCard: { background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: 16 },
    toast: {
      position: "fixed", bottom: 24, right: 24, background: "#10b981",
      color: "#fff", padding: "10px 18px", borderRadius: 10, fontWeight: 600,
      fontSize: 13, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      transform: toast ? "translateY(0)" : "translateY(20px)",
      opacity: toast ? 1 : 0, transition: "all 0.25s",
    },
  };

  const navItems = [
    { id: "dashboard", icon: "⬡", label: "Dashboard" },
    { id: "opportunities", icon: "◈", label: "Opportunities" },
    { id: "watchlist", icon: "◎", label: "Watchlist", badge: savedOpps.length },
    { id: "calendar", icon: "▦", label: "Deadlines" },
    { id: "performance", icon: "◆", label: "Past Performance" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  // ── VIEWS ──

  const DashboardView = () => (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={styles.h1}>
          {profile.companyName ? `Welcome, ${profile.companyName}` : "GovCon Intelligence"}
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
          {usingDemo ? "Showing demo data — add your SAM.gov API key in Settings to load live opportunities" : `Live data from SAM.gov · Last updated just now`}
        </p>
      </div>

      {usingDemo && (
        <div style={{ ...styles.card, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#f59e0b" }}>Connect to live SAM.gov data</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>Add your free API key in Settings → get yours at sam.gov under your profile</div>
            </div>
            <button style={{ ...styles.btn("primary"), marginLeft: "auto", whiteSpace: "nowrap" }} onClick={() => setView("settings")}>
              Add API Key →
            </button>
          </div>
        </div>
      )}

      <div style={styles.grid4}>
        {[
          { label: "Active Opportunities", value: scoredOpps.length, color: "#3b82f6" },
          { label: "Watchlisted", value: savedOpps.length, color: "#f59e0b" },
          { label: "Deadlines This Week", value: scoredOpps.filter(o => daysUntil(o.responseDeadLine) <= 7 && daysUntil(o.responseDeadLine) > 0).length, color: "#ef4444" },
          { label: "High-Match Score (75+)", value: scoredOpps.filter(o => o.score >= 75).length, color: "#10b981" },
        ].map((s, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...styles.grid2, marginTop: 20 }}>
        <div style={styles.card}>
          <h2 style={styles.h2}>Top Matches</h2>
          {filteredOpps.slice(0, 4).map(o => (
            <div key={o.noticeId} onClick={() => { setSelected(o); setView("opportunities"); }}
              style={{ padding: "10px 0", borderBottom: "1px solid #1e293b", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, marginRight: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 3, lineHeight: 1.4 }}>{o.title}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{o.fullParentPathName?.split(">")[0]?.trim()}</div>
              </div>
              <ScoreBadge score={o.score} />
            </div>
          ))}
          <button style={{ ...styles.btn("ghost"), width: "100%", marginTop: 12, fontSize: 12 }} onClick={() => setView("opportunities")}>
            View All Opportunities →
          </button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.h2}>Upcoming Deadlines</h2>
          {upcomingDeadlines.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: 13 }}>No upcoming deadlines</p>
          ) : upcomingDeadlines.map(o => (
            <div key={o.noticeId} style={{ padding: "10px 0", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1, marginRight: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4, marginBottom: 2 }}>{o.title?.slice(0, 55)}{o.title?.length > 55 ? "…" : ""}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{formatDate(o.responseDeadLine)}</div>
              </div>
              <DeadlinePill dateStr={o.responseDeadLine} />
            </div>
          ))}
          <button style={{ ...styles.btn("ghost"), width: "100%", marginTop: 12, fontSize: 12 }} onClick={() => setView("calendar")}>
            View Full Calendar →
          </button>
        </div>
      </div>
    </div>
  );

  const OpportunitiesView = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={styles.h1}>Opportunities</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{filteredOpps.length} results · sorted by AI fit score</p>
        </div>
        <button style={styles.btn("primary")} onClick={fetchOpportunities} disabled={loading}>
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...styles.card, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label style={styles.label}>NAICS Code</label>
            <select style={styles.select} value={filters.naics} onChange={e => setFilters(p => ({ ...p, naics: e.target.value }))}>
              <option value="">All NAICS</option>
              {NAICS_OPTIONS.map(n => <option key={n.code} value={n.code}>{n.code}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Set-Aside</label>
            <select style={styles.select} value={filters.setAside} onChange={e => setFilters(p => ({ ...p, setAside: e.target.value }))}>
              <option value="">All</option>
              {SET_ASIDE_OPTIONS.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Agency</label>
            <select style={styles.select} value={filters.agency} onChange={e => setFilters(p => ({ ...p, agency: e.target.value }))}>
              <option value="">All Agencies</option>
              {AGENCY_OPTIONS.map(a => <option key={a} value={a}>{a.split(" ").slice(0, 3).join(" ")}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Opp Type</label>
            <select style={styles.select} value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Title Search</label>
            <input style={styles.input} placeholder="Keyword…" value={filters.keyword}
              onChange={e => setFilters(p => ({ ...p, keyword: e.target.value }))} />
          </div>
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button style={styles.btn("primary")} onClick={fetchOpportunities}>Apply Filters</button>
          <button style={styles.btn("ghost")} onClick={() => setFilters({ naics: "", setAside: "", agency: "", minValue: "", maxValue: "", postedFrom: "", keyword: "", type: "" })}>
            Clear
          </button>
        </div>
      </div>

      {error && <div style={{ ...styles.card, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", marginBottom: 12 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: 16 }}>
        <div>
          {filteredOpps.map(o => (
            <div key={o.noticeId} style={styles.oppCard(selected?.noticeId === o.noticeId)}
              onClick={() => setSelected(selected?.noticeId === o.noticeId ? null : o)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ flex: 1, marginRight: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", lineHeight: 1.4, marginBottom: 4 }}>{o.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{o.fullParentPathName?.split(">").slice(0, 2).join(" › ")}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <ScoreBadge score={o.score} />
                  <DeadlinePill dateStr={o.responseDeadLine} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={styles.tag()}>{TYPE_LABELS[o.type] || o.type || "Notice"}</span>
                {o.naicsCode && <span style={styles.tag("#1e3a5f")}>{o.naicsCode}</span>}
                {o.typeOfSetAsideDescription && (
                  <span style={styles.tag("#1a3a2a")}>{o.typeOfSetAsideDescription?.split(" ").slice(0, 3).join(" ")}</span>
                )}
                <button style={{ ...styles.btn(isSaved(o.noticeId) ? "primary" : "ghost"), padding: "2px 10px", fontSize: 11, marginLeft: "auto" }}
                  onClick={e => { e.stopPropagation(); toggleSave(o); }}>
                  {isSaved(o.noticeId) ? "★ Saved" : "☆ Save"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ ...styles.card, position: "sticky", top: 20, height: "fit-content", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={styles.tag("#1e3a5f")}>{TYPE_LABELS[selected.type] || "Notice"}</span>
              <button style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <h2 style={{ ...styles.h2, fontSize: 15, lineHeight: 1.5 }}>{selected.title}</h2>
            <div style={{ marginBottom: 16 }}>
              <ScoreBadge score={selected.score} />
              {selected.reasons?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {selected.reasons.map((r, i) => (
                    <span key={i} style={{ ...styles.tag("#0f2a1a"), color: "#10b981", marginBottom: 4 }}>✓ {r}</span>
                  ))}
                </div>
              )}
            </div>
            {[
              ["Agency", selected.fullParentPathName],
              ["NAICS Code", selected.naicsCode],
              ["Set-Aside", selected.typeOfSetAsideDescription || "None"],
              ["Posted", formatDate(selected.postedDate)],
              ["Response Deadline", formatDate(selected.responseDeadLine)],
              ["Notice ID", selected.noticeId],
            ].map(([label, val]) => val && (
              <div key={label} style={{ marginBottom: 10 }}>
                <label style={styles.label}>{label}</label>
                <div style={{ fontSize: 13, color: "#e2e8f0" }}>{val}</div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button style={{ ...styles.btn("primary"), flex: 1 }}
                onClick={() => window.open(selected.uiLink || "https://sam.gov/opportunities", "_blank")}>
                View on SAM.gov ↗
              </button>
              <button style={{ ...styles.btn(isSaved(selected.noticeId) ? "primary" : "ghost") }}
                onClick={() => toggleSave(selected)}>
                {isSaved(selected.noticeId) ? "★" : "☆"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const WatchlistView = () => (
    <div>
      <h1 style={styles.h1}>Watchlist</h1>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>{savedOpps.length} saved opportunities</p>
      {savedOpps.length === 0 ? (
        <div style={{ ...styles.card, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>☆</div>
          <div style={{ color: "#64748b", fontSize: 14 }}>No saved opportunities yet.</div>
          <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Click the Save button on any opportunity to track it here.</div>
          <button style={{ ...styles.btn("primary"), marginTop: 16 }} onClick={() => setView("opportunities")}>Browse Opportunities</button>
        </div>
      ) : savedOpps.map(o => (
        <div key={o.noticeId} style={styles.oppCard(false)}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ flex: 1, marginRight: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>{o.title}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{o.fullParentPathName?.split(">")[0]?.trim()}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <ScoreBadge score={o.score || 50} />
              <DeadlinePill dateStr={o.responseDeadLine} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...styles.btn("primary"), fontSize: 12 }}
              onClick={() => window.open(o.uiLink || "https://sam.gov/opportunities", "_blank")}>
              View on SAM.gov ↗
            </button>
            <button style={{ ...styles.btn("danger"), fontSize: 12 }} onClick={() => toggleSave(o)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );

  const CalendarView = () => {
    const allWithDeadlines = [...scoredOpps, ...savedOpps]
      .filter((o, i, arr) => o.responseDeadLine && arr.findIndex(x => x.noticeId === o.noticeId) === i)
      .sort((a, b) => new Date(a.responseDeadLine) - new Date(b.responseDeadLine));
    const groups = allWithDeadlines.reduce((acc, o) => {
      const key = formatDate(o.responseDeadLine);
      if (!acc[key]) acc[key] = [];
      acc[key].push(o);
      return acc;
    }, {});
    return (
      <div>
        <h1 style={styles.h1}>Deadline Tracker</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>All upcoming response deadlines, sorted chronologically</p>
        {Object.keys(groups).length === 0 ? (
          <div style={{ ...styles.card, textAlign: "center", padding: 40, color: "#64748b" }}>No deadline data available</div>
        ) : Object.entries(groups).map(([date, opps]) => {
          const days = daysUntil(opps[0].responseDeadLine);
          return (
            <div key={date} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{date}</div>
                <DeadlinePill dateStr={opps[0].responseDeadLine} />
              </div>
              {opps.map(o => (
                <div key={o.noticeId} style={{ ...styles.card, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 }}>{o.title}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{o.fullParentPathName?.split(">")[0]?.trim()}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <ScoreBadge score={o.score || 50} />
                      <button style={{ ...styles.btn("primary"), fontSize: 11, padding: "4px 10px" }}
                        onClick={() => window.open(o.uiLink || "https://sam.gov/opportunities", "_blank")}>
                        Open ↗
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const PerformanceView = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={styles.h1}>Past Performance Log</h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Track contract wins to strengthen future proposals</p>
        </div>
        <button style={styles.btn("primary")} onClick={() => setShowAddPerf(true)}>+ Add Entry</button>
      </div>

      {showAddPerf && (
        <div style={{ ...styles.card, border: "1px solid #f59e0b", marginBottom: 20 }}>
          <h2 style={{ ...styles.h2, color: "#f59e0b" }}>New Past Performance Entry</h2>
          <div style={styles.grid2}>
            {[
              { key: "title", label: "Contract Title", placeholder: "IT Support Services for..." },
              { key: "agency", label: "Agency", placeholder: "Dept of Veterans Affairs" },
              { key: "value", label: "Contract Value ($)", placeholder: "125000" },
              { key: "year", label: "Year", placeholder: "2025" },
            ].map(f => (
              <div key={f.key}>
                <label style={styles.label}>{f.label}</label>
                <input style={styles.input} placeholder={f.placeholder} value={newPerf[f.key]}
                  onChange={e => setNewPerf(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={styles.label}>Outcome</label>
            <select style={{ ...styles.select, width: 200 }} value={newPerf.outcome}
              onChange={e => setNewPerf(p => ({ ...p, outcome: e.target.value }))}>
              <option>Won</option><option>Lost</option><option>Ongoing</option><option>Completed</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={styles.btn("primary")} onClick={() => {
              if (!newPerf.title) return;
              setPastPerf(p => [...p, { ...newPerf, id: Date.now() }]);
              setNewPerf({ title: "", agency: "", value: "", year: "", outcome: "Won" });
              setShowAddPerf(false);
              showToast("Past performance entry added ✓");
            }}>Save Entry</button>
            <button style={styles.btn("ghost")} onClick={() => setShowAddPerf(false)}>Cancel</button>
          </div>
        </div>
      )}

      {pastPerf.length === 0 && !showAddPerf ? (
        <div style={{ ...styles.card, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>◆</div>
          <div style={{ color: "#64748b", fontSize: 14 }}>No past performance entries yet.</div>
          <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Log your contract history to strengthen future proposals.</div>
          <button style={{ ...styles.btn("primary"), marginTop: 16 }} onClick={() => setShowAddPerf(true)}>Add First Entry</button>
        </div>
      ) : pastPerf.map(p => (
        <div key={p.id} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{p.agency} · {p.year}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {p.value && <span style={styles.tag("#1e3a5f")}>
                  ${Number(p.value).toLocaleString()}
                </span>}
                <span style={styles.tag(p.outcome === "Won" ? "#0f2a1a" : p.outcome === "Lost" ? "#2a0f0f" : "#1a1f2a")}>
                  {p.outcome}
                </span>
              </div>
            </div>
            <button style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}
              onClick={() => setPastPerf(prev => prev.filter(x => x.id !== p.id))}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );

  const SettingsView = () => (
    <div>
      <h1 style={styles.h1}>Settings</h1>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Configure your company profile and API connection</p>

      <div style={styles.card}>
        <h2 style={styles.h2}>Company Profile</h2>
        <p style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>Your profile is used to calculate AI fit scores for each opportunity.</p>
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Company Name</label>
            <input style={styles.input} placeholder="Bastion Supply Group LLC"
              value={profile.companyName} onChange={e => setProfile(p => ({ ...p, companyName: e.target.value }))} />
          </div>
          <div>
            <label style={styles.label}>Primary NAICS Code</label>
            <select style={styles.select} value={profile.naics}
              onChange={e => setProfile(p => ({ ...p, naics: e.target.value }))}>
              <option value="">Select NAICS…</option>
              {NAICS_OPTIONS.map(n => <option key={n.code} value={n.code}>{n.label}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Set-Aside Certification</label>
            <select style={styles.select} value={profile.setAside}
              onChange={e => setProfile(p => ({ ...p, setAside: e.target.value }))}>
              <option value="">None / Not certified</option>
              {SET_ASIDE_OPTIONS.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Target Agency (optional)</label>
            <select style={styles.select} value={profile.agency}
              onChange={e => setProfile(p => ({ ...p, agency: e.target.value }))}>
              <option value="">No preference</option>
              {AGENCY_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <button style={{ ...styles.btn("primary"), marginTop: 16 }}
          onClick={() => { showToast("Profile saved — scores updated ✓"); }}>
          Save Profile
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.h2}>SAM.gov API Key</h2>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
          Get your free personal API key at <strong style={{ color: "#f59e0b" }}>sam.gov</strong> → log in → Profile → Public API Key → Request API Key. It's free and takes about 2 minutes.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input style={{ ...styles.input, flex: 1 }} type="password"
            placeholder="Paste your SAM.gov API key here…"
            value={apiKey} onChange={e => { setApiKey(e.target.value); setApiKeySaved(false); }} />
          <button style={styles.btn("primary")} onClick={() => {
            setApiKeySaved(true);
            fetchOpportunities();
            showToast("API key saved — fetching live data…");
          }}>Connect</button>
        </div>
        {apiKeySaved && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#10b981" }}>
            ✓ Connected — fetching live opportunities from SAM.gov
          </div>
        )}
        <div style={{ marginTop: 12, padding: 12, background: "#0f172a", borderRadius: 8, fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
          <strong style={{ color: "#94a3b8" }}>Rate limits:</strong> Free personal key = 10 requests/day. This app caches results to stay within limits. For higher volume, a system account gives 1,000 requests/day.
        </div>
      </div>
    </div>
  );

  const views = { dashboard: DashboardView, opportunities: OpportunitiesView, watchlist: WatchlistView, calendar: CalendarView, performance: PerformanceView, settings: SettingsView };
  const CurrentView = views[view] || DashboardView;

  return (
    <div style={styles.app}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
            <span style={{ color: "#f59e0b" }}>◈</span> GovSignal
          </div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>Federal Bid Intelligence</div>
        </div>

        <nav style={{ flex: 1, paddingTop: 8 }}>
          {navItems.map(item => (
            <div key={item.id} style={styles.navItem(view === item.id)} onClick={() => setView(item.id)}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ marginLeft: "auto", background: "#f59e0b", color: "#000", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #334155" }}>
          <div style={{ fontSize: 10, color: "#334155", marginBottom: 4 }}>DATA SOURCE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: usingDemo ? "#f59e0b" : "#10b981" }} />
            <span style={{ fontSize: 11, color: usingDemo ? "#f59e0b" : "#10b981" }}>
              {usingDemo ? "Demo Data" : "Live SAM.gov"}
            </span>
          </div>
        </div>
      </div>

      <main style={styles.main}>
        <CurrentView />
      </main>

      <div style={styles.toast}>{toast}</div>
    </div>
  );
}
