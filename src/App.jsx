import { useState, useRef, useCallback } from "react";

const SYSTEM_PROMPT = `Tu es l'agent Amazon de LuckyDuck, une marque française de literie vegan (couettes, oreillers) fabriquée à partir de fibres recyclées iLOFT.

CONTEXTE : CA actuel 12 000 euros/mois (objectif 18 000), 33 ASINs, budget SP 4 500 euros/mois, 62% gaspillé.
Top ASIN : Oreiller Ajustable 50x70 (ACOS 9%), Couette Medium 220x240 (ACOS 13%).
Stock critique : Oreiller Ajustable 60x60 (rupture 0 unité), Oreiller Ferme 60x60 (4 unités).
Réponds en français, de manière directe et chiffrée.`;

const RAPPORT_DATA = {
  kpis: [
    { label: "CA Total", value: "12 082EUR", sub: "Période analysée", color: "duck" },
    { label: "ACOS SP Global", value: "51,7%", sub: "Cible : < 30%", color: "red" },
    { label: "Budget Gaspillé", value: "62%", sub: "2 450EUR sans vente", color: "red" },
    { label: "Récupérable S1", value: "~650EUR", sub: "Actions immédiates", color: "green" },
  ],
  alertes: [
    { type: "red", icon: "🔴", title: "Oreiller Ajustable 60x60 — RUPTURE FBA", desc: "0 unité disponible. Mettre en pause les campagnes ads sur cet ASIN immédiatement." },
    { type: "red", icon: "🔴", title: "4 campagnes à 0 vente malgré budget actif", desc: "267EUR à récupérer immédiatement sur Couette Chaude 220x240, 140x200, 4S 140x200, Couette 200x200." },
    { type: "red", icon: "🔴", title: "SB Couette Chaude — 0 vente, 117EUR dépensés", desc: "Campagne hiver active en juin. Mettre en pause jusqu'en septembre." },
    { type: "amber", icon: "🟠", title: "Oreiller Ferme 60x60 — 30 jours de couverture stock", desc: "4 unités vendables. Commander dans les 10 jours." },
    { type: "amber", icon: "🟠", title: "Oreiller 50x70 — conversion 1,37%", desc: "291 sessions pour 4 ventes. Listing à corriger en urgence." },
  ],
  topPerformers: [
    { asin: "B0FBXDG4H8", nom: "Oreiller Ajustable 50x70", acos: 9, roas: "10.6x", ventes: "365EUR", action: "Tripler le budget" },
    { asin: "B0FCSHQPML", nom: "Couette Medium 220x240", acos: 13, roas: "7.6x", ventes: "192EUR", action: "Doubler le budget" },
    { asin: "B0FCSBHH7Z", nom: "Couette Medium 240x260", acos: 14, roas: "7.3x", ventes: "349EUR", action: "Doubler le budget" },
    { asin: "B0FBXPG2M3", nom: "Oreiller Duo 60x60", acos: 18, roas: "5.6x", ventes: "263EUR", action: "Augmenter budget" },
  ],
  stock: [
    { asin: "B0FBX7323Z", nom: "Oreiller Ajustable 60x60", qty: 0, statut: "rupture" },
    { asin: "B0FBXCYLXR", nom: "Oreiller Ferme 60x60", qty: 4, couverture: 30, statut: "critique" },
    { asin: "B0GSRZMFXP", nom: "Oreiller Ferme 50x70", qty: 12, statut: "ok" },
    { asin: "B0FBXBC6H4", nom: "Oreiller 50x70", qty: 19, couverture: 142, statut: "ok" },
    { asin: "B0FBXPG2M3", nom: "Oreiller Duo 60x60", qty: 23, couverture: 115, statut: "ok" },
    { asin: "B0FCSDVQWB", nom: "Couette Chaude 240x260", qty: 39, statut: "ok" },
  ],
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
  :root {
    --bg:#1a1740;--surface:#242060;--surface2:#2e2a72;
    --border:#5550a0;--border2:#6560b0;--text:#ffffff;--muted:#e8e6ff;
    --duck:#f5aa05;--duck-dim:rgba(245,170,5,0.18);
    --green:#4ade80;--green-dim:rgba(74,222,128,0.15);
    --red:#f87171;--red-dim:rgba(248,113,113,0.15);
    --amber:#fbbf24;--amber-dim:rgba(251,191,36,0.15);
    --radius:10px;--font:'Syne',sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.6;min-height:100vh;}
  .app{display:flex;flex-direction:column;min-height:100vh;}
  .header{padding:16px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--surface);position:sticky;top:0;z-index:100;}
  .header-left{display:flex;align-items:center;gap:12px;}
  .logo{width:36px;height:36px;border-radius:50%;overflow:hidden;background:var(--duck);}
  .logo img{width:36px;height:36px;display:block;}
  .header-title{font-size:17px;font-weight:700;}
  .header-sub{font-size:11px;color:var(--muted);}
  .status-dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:pulse 2s infinite;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  .main{display:flex;flex:1;}
  .sidebar{width:260px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);padding:16px 12px;display:flex;flex-direction:column;gap:4px;position:sticky;top:57px;height:calc(100vh - 57px);overflow-y:auto;}
  .nav-section{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;padding:10px 8px 4px;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:var(--muted);background:none;border:none;width:100%;text-align:left;transition:all 0.15s;}
  .nav-item:hover{background:var(--surface2);color:var(--text);}
  .nav-item.active{background:var(--duck-dim);color:var(--duck);}
  .nav-badge{margin-left:auto;font-size:10px;padding:1px 6px;border-radius:10px;}
  .badge-red{background:var(--red-dim);color:var(--red);}
  .badge-amber{background:var(--amber-dim);color:var(--amber);}
  .content{flex:1;padding:24px 28px;overflow-y:auto;}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
  .kpi{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;}
  .kpi-label{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;}
  .kpi-value{font-size:22px;font-weight:700;line-height:1;margin-bottom:4px;}
  .kpi-sub{font-size:11px;color:var(--muted);}
  .kpi.red .kpi-value{color:var(--red);}
  .kpi.green .kpi-value{color:var(--green);}
  .kpi.amber .kpi-value{color:var(--amber);}
  .kpi.duck .kpi-value{color:var(--duck);}
  .section-title{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin:20px 0 10px;}
  .alert{display:flex;gap:12px;padding:12px 14px;border-radius:var(--radius);margin-bottom:8px;border:1px solid;}
  .alert.red{background:var(--red-dim);border-color:rgba(248,113,113,0.3);}
  .alert.amber{background:var(--amber-dim);border-color:rgba(251,191,36,0.3);}
  .alert-icon{font-size:18px;flex-shrink:0;}
  .alert-title{font-size:13px;font-weight:600;margin-bottom:2px;}
  .alert.red .alert-title{color:var(--red);}
  .alert.amber .alert-title{color:var(--amber);}
  .alert-desc{font-size:12px;color:var(--muted);line-height:1.5;}
  .table-wrap{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-bottom:16px;}
  table{width:100%;border-collapse:collapse;}
  th{font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.8px;padding:10px 14px;background:var(--surface2);text-align:left;border-bottom:1px solid var(--border);}
  td{padding:10px 14px;font-size:12px;border-bottom:1px solid var(--border);}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:var(--surface2);}
  .c-red{color:var(--red);}
  .c-green{color:var(--green);}
  .c-amber{color:var(--amber);}
  .c-duck{color:var(--duck);}
  .messages{display:flex;flex-direction:column;gap:14px;margin-bottom:14px;min-height:300px;}
  .msg{display:flex;gap:10px;}
  .msg.user{flex-direction:row-reverse;}
  .msg-bubble{max-width:80%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.6;}
  .msg.user .msg-bubble{background:var(--duck);color:#000;font-weight:500;border-radius:12px 2px 12px 12px;}
  .msg.assistant .msg-bubble{background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:2px 12px 12px 12px;white-space:pre-wrap;}
  .msg-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;background:var(--surface2);border:1px solid var(--border);}
  .chat-wrap{display:flex;gap:8px;margin-top:16px;}
  .chat-in{flex:1;background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius);padding:10px 14px;color:var(--text);font-family:var(--font);font-size:13px;outline:none;}
  .chat-in:focus{border-color:var(--duck);}
  .chat-in::placeholder{color:var(--muted);}
  .send-btn{padding:10px 18px;background:var(--duck);color:#000;font-family:var(--font);font-weight:700;font-size:13px;border:none;border-radius:var(--radius);cursor:pointer;}
  .send-btn:disabled{opacity:0.4;cursor:not-allowed;}
  .dots span{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--duck);animation:bounce 1.2s infinite;margin:0 2px;}
  .dots span:nth-child(2){animation-delay:0.2s;}
  .dots span:nth-child(3){animation-delay:0.4s;}
  @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
  .upload-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
  .up-card{background:var(--surface);border:1px dashed var(--border2);border-radius:var(--radius);padding:14px;cursor:pointer;text-align:center;transition:all 0.2s;}
  .up-card:hover{border-color:var(--duck);background:var(--duck-dim);}
  .up-card.loaded{border-style:solid;border-color:var(--green);background:var(--green-dim);}
  .up-icon{font-size:20px;margin-bottom:6px;}
  .up-name{font-size:12px;font-weight:600;margin-bottom:2px;}
  .up-status{font-size:11px;color:var(--muted);}
  .up-card.loaded .up-status{color:var(--green);}
  .analyse-btn{width:100%;padding:12px;background:var(--duck);color:#000;font-family:var(--font);font-size:14px;font-weight:700;border:none;border-radius:var(--radius);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:20px;}
  .analyse-btn:disabled{opacity:0.4;cursor:not-allowed;}
  .stream-box{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;font-size:12px;color:var(--text);white-space:pre-wrap;max-height:400px;overflow-y:auto;line-height:1.7;}
  .empty{text-align:center;padding:50px 20px;color:var(--muted);}
  .empty-icon{font-size:44px;margin-bottom:14px;}
  .empty-title{font-size:15px;font-weight:600;color:var(--text);margin-bottom:6px;}
`;

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [files, setFiles] = useState({});
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis ton agent Amazon LuckyDuck 🦆\n\nJe connais déjà l'analyse complète de tes rapports. Pose-moi tes questions sur tes campagnes, ton stock, ou ta stratégie.\n\nQue veux-tu faire ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [streamText, setStreamText] = useState("");
  const fileRefs = useRef({});
  const endRef = useRef(null);

  const fileTypes = [
    { key: "business", label: "Business Report", icon: "📊", desc: "CA, sessions, conversion" },
    { key: "sp_termes", label: "SP Termes recherche", icon: "🔍", desc: "Mots-clés SP" },
    { key: "sb_termes", label: "SB Termes recherche", icon: "🏷️", desc: "Mots-clés SB" },
    { key: "produit_promu", label: "SP Produit promu", icon: "📦", desc: "Spend par ASIN" },
    { key: "emplacement", label: "SP Emplacement", icon: "📍", desc: "Performance position" },
    { key: "stock", label: "Stock FBA", icon: "🏭", desc: "Inventaire" },
  ];

  const scroll = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  const sendMessage = useCallback(async (msg) => {
    if (!msg.trim() || loading) return;
    const newMsgs = [...messages, { role: "user", content: msg }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content && data.content[0] && data.content[0].text
        ? data.content[0].text
        : data.error ? "Erreur : " + data.error.message : "Erreur de réponse.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setTimeout(scroll, 100);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const analyseFiles = useCallback(async () => {
    if (!Object.keys(files).length) return;
    setAnalysing(true);
    setStreamText("");
    setTab("analyse");
    const names = Object.keys(files).map(k => fileTypes.find(f => f.key === k)?.label).join(", ");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: "Analyse ces rapports : " + names + ". KPIs clés, alertes, top 3 actions, projection CA. Sois précis et chiffré." }],
        }),
      });
      const data = await res.json();
      const text = data.content && data.content[0] && data.content[0].text ? data.content[0].text : "Erreur.";
      setStreamText(text);
    } catch (e) {
      setStreamText("Erreur de connexion.");
    } finally {
      setAnalysing(false);
    }
  }, [files]);

  const LOGO = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDMzNC40IDMzNC42MiI+PGRlZnM+PHN0eWxlPi5he2ZpbGw6IzI4MjI1Mjt9LmJ7ZmlsbDojZmZmO30uY3tmaWxsOiNmNWFhMDU7fTwvc3R5bGU+PC9kZWZzPjxjaXJjbGUgY2xhc3M9ImEiIGN4PSIxNjUuMyIgY3k9IjE2Ny43NCIgcj0iMTUwLjg2Ii8+PGc+PGc+PHBhdGggY2xhc3M9ImIiIGQ9Ik0yNDYuMzEsMTA1LjRjLTYuMzQtMjEuMTUtMjguNzEtMzMuMTktNDkuODUtMjYuODUtMjEuMTUsNi4zNC0zMy4xOSwyOC43LTI2Ljg1LDQ5Ljg1Ljk1LDMuMTYsMy44NCw1LjE5LDYuOTcsNS4xOS42OSwwLDEuNC0uMSwyLjA5LS4zMSwzLjg1LTEuMTYsNi4wNC01LjIxLDQuODgtOS4wNy00LjAzLTEzLjQ1LDMuNjMtMjcuNjgsMTcuMDgtMzEuNzEsMTMuNDYtNC4wMywyNy42OCwzLjYzLDMxLjcxLDE3LjA4LjE4LjYyLjQ1LDEuMTguNzcsMS43MWwxMy4yNS01LjZjLS4wMy0uMS0uMDQtLjItLjA3LS4zWiIvPjxwYXRoIGNsYXNzPSJjIiBkPSJNMjc0LjQsMTAxLjc3Yy0xLjU3LTMuNy01LjgzLTUuNDQtOS41NC0zLjg4bC0xOC40Nyw3LjgtMTMuMjUsNS42LTYuNjIsMi44Yy4wNi4yMy4xMi40Ny4xNi43MS4xMS40MS4xOS44Mi4yMywxLjI1bDEuOTQsMjEuODIsMzEuNjgsMTAuNzNjLjczLjIzLDEuNDguMzQsMi4yMS4zNCwzLjA5LDAsNS45NS0xLjk4LDYuOTQtNS4wOCwxLjIyLTMuODMtLjktNy45My00LjczLTkuMTVsLTI4LjQzLTkuMDUsMzQuMDEtMTQuMzZjMy43MS0xLjU2LDUuNDQtNS44NCwzLjg4LTkuNTRaIi8+PC9nPjxwYXRoIGNsYXNzPSJiIiBkPSJNMTYxLjcsMjQ2LjU2YzQ2LjE1LTkuNDMsNzQuNjctNTEuNjksNjcuODctMTAwLjUybC0uNzMtOC4xOC0xLjk0LTIxLjgyYy0uMDQtLjQzLS4xMi0uODUtLjIzLTEuMjUtLjA0LS4yNC0uMS0uNDctLjE2LS43MS0xLjEyLTQuNDItNS4xMi03LjctOS44OS03LjctNS42NSwwLTEwLjIyLDQuNTgtMTAuMjIsMTAuMjIsMCw0LjQ0LDIuODQsOC4yMSw2Ljc5LDkuNjJsMS45LDIxLjMuMDQuMzdjNS43OSw0MS4wNS0xNy45MSw3Ni41NS01Ni4zNCw4NC40LTM2LjY3LDcuNS03Mi42NS0xNC4zMi04My41NC00OS4zM2w5NS4yOC0xOS40N2MzLjk0LS44MSw2LjQ4LTQuNjUsNS42OC04LjU5LS44MS0zLjk0LTQuNjQtNi40OS04LjU5LTUuNjhsLTEwOS45MSwyMi40NiwxLjQ2LDcuMTRjOC40LDQxLjExLDQ0LjcsNjkuNTIsODUuMTIsNjkuNTIuMjcsMCwuNTMtLjAyLjgtLjAydjIxLjU4aDI2LjM2YzQuMjcsMCw3Ljc0LTMuNDcsNy43NC03Ljc0cy0zLjQ3LTcuNzQtNy43NC03Ljc0aC0xMC44OHYtNy42NGMuMzgtLjA3Ljc2LS4xMywxLjE0LS4yWiIvPjwvZz48L3N2Zz4=";

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "alertes", icon: "🚨", label: "Alertes", badge: { text: "5", color: "red" } },
    { id: "campagnes", icon: "📈", label: "Campagnes" },
    { id: "stock", icon: "🏭", label: "Stock FBA", badge: { text: "2", color: "amber" } },
    { id: "plan", icon: "✅", label: "Plan d'action" },
    { id: "chat", icon: "💬", label: "Chat agent" },
    { id: "upload", icon: "📁", label: "Nouveaux rapports" },
    { id: "analyse", icon: "🔍", label: "Analyse IA" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="header-left">
            <div className="logo"><img src={LOGO} alt="LuckyDuck" /></div>
            <div>
              <div className="header-title">LuckyDuck Agent</div>
              <div className="header-sub">Amazon Intelligence · Powered by Claude</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="status-dot" />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Agent actif</span>
          </div>
        </header>

        <div className="main">
          <nav className="sidebar">
            <div className="nav-section">Navigation</div>
            {navItems.map(item => (
              <button key={item.id} className={"nav-item" + (tab === item.id ? " active" : "")} onClick={() => setTab(item.id)}>
                <span>{item.icon}</span>
                {item.label}
                {item.badge && <span className={"nav-badge badge-" + item.badge.color}>{item.badge.text}</span>}
              </button>
            ))}
            <div className="nav-section" style={{ marginTop: 12 }}>Projections</div>
            {[["Aujourd'hui", "~12K€", "var(--red)"], ["J+30", "~15K€", "var(--amber)"], ["Mois 2", "~18K€", "var(--duck)"], ["Septembre", "~24K€", "var(--green)"]].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 12px", fontSize: 12, borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--muted)" }}>{l}</span>
                <span style={{ color: c, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </nav>

          <main className="content">

            {tab === "dashboard" && (
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Dashboard Amazon</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Analyse du 07/05/2026 au 05/06/2026 · Amazon.fr</p>
                <div className="kpi-grid">
                  {RAPPORT_DATA.kpis.map((k, i) => (
                    <div key={i} className={"kpi " + k.color}>
                      <div className="kpi-label">{k.label}</div>
                      <div className="kpi-value">{k.value}</div>
                      <div className="kpi-sub">{k.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="section-title">Alertes actives</div>
                {RAPPORT_DATA.alertes.slice(0, 3).map((a, i) => (
                  <div key={i} className={"alert " + a.type}>
                    <div className="alert-icon">{a.icon}</div>
                    <div>
                      <div className="alert-title">{a.title}</div>
                      <div className="alert-desc">{a.desc}</div>
                    </div>
                  </div>
                ))}
                <div className="section-title">Top performers</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Produit</th><th>ACOS</th><th>ROAS</th><th>Ventes</th><th>Action</th></tr></thead>
                    <tbody>
                      {RAPPORT_DATA.topPerformers.map((p, i) => (
                        <tr key={i}>
                          <td><div style={{ fontWeight: 600 }}>{p.nom}</div><div style={{ fontSize: 10, color: "var(--muted)" }}>{p.asin}</div></td>
                          <td><span style={{ color: p.acos < 25 ? "var(--green)" : p.acos < 40 ? "var(--amber)" : "var(--red)" }}>{p.acos}%</span></td>
                          <td className="c-green">{p.roas}</td>
                          <td className="c-duck">{p.ventes}</td>
                          <td><span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>↑ {p.action}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "alertes" && (
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Alertes prioritaires</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>5 alertes actives · Classées par impact</p>
                {RAPPORT_DATA.alertes.map((a, i) => (
                  <div key={i} className={"alert " + a.type}>
                    <div className="alert-icon">{a.icon}</div>
                    <div>
                      <div className="alert-title">#{i + 1} — {a.title}</div>
                      <div className="alert-desc">{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "campagnes" && (
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Analyse campagnes</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Sponsored Products + Sponsored Brands</p>
                <div className="kpi-grid">
                  <div className="kpi red"><div className="kpi-label">ACOS SP</div><div className="kpi-value">51,7%</div><div className="kpi-sub">Cible &lt; 30%</div></div>
                  <div className="kpi red"><div className="kpi-label">ACOS SB</div><div className="kpi-value">73,7%</div><div className="kpi-sub">Cible &lt; 40%</div></div>
                  <div className="kpi amber"><div className="kpi-label">Spend SP</div><div className="kpi-value">2 294EUR</div><div className="kpi-sub">Ventes : 4 441EUR</div></div>
                  <div className="kpi red"><div className="kpi-label">Gaspillé</div><div className="kpi-value">1 681EUR</div><div className="kpi-sub">73% sans vente</div></div>
                </div>
                <div className="section-title">Emplacements</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Emplacement</th><th>Spend</th><th>ACOS</th><th>CTR</th><th>Verdict</th></tr></thead>
                    <tbody>
                      <tr><td>Reste des résultats</td><td>964EUR</td><td className="c-red">67%</td><td>0,46%</td><td><span className="c-red" style={{ fontSize: 11, fontWeight: 700 }}>🔴 Réduire</span></td></tr>
                      <tr><td>Sur fiches produits</td><td>791EUR</td><td className="c-amber">37%</td><td>0,07%</td><td><span className="c-amber" style={{ fontSize: 11, fontWeight: 700 }}>🟠 Surveiller</span></td></tr>
                      <tr><td>Premiers résultats ⭐</td><td>717EUR</td><td className="c-amber">51%</td><td className="c-green">2,61%</td><td><span className="c-green" style={{ fontSize: 11, fontWeight: 700 }}>✅ +30% enchères</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "stock" && (
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Stock FBA</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>État au 06/06/2026</p>
                <div className="alert red" style={{ marginBottom: 20 }}>
                  <div className="alert-icon">🔴</div>
                  <div>
                    <div className="alert-title">ACTION IMMÉDIATE — Oreiller Ajustable 60x60</div>
                    <div className="alert-desc">0 unité FBA. Mettre en pause les campagnes ads. Réapprovisionner en urgence.</div>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>ASIN</th><th>Produit</th><th>Unités</th><th>Statut</th></tr></thead>
                    <tbody>
                      {RAPPORT_DATA.stock.map((s, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 11, color: "var(--muted)" }}>{s.asin}</td>
                          <td style={{ fontWeight: 600 }}>{s.nom}</td>
                          <td>{s.qty}</td>
                          <td>
                            {s.statut === "rupture" && <span className="c-red" style={{ fontWeight: 700 }}>🔴 RUPTURE</span>}
                            {s.statut === "critique" && <span className="c-amber" style={{ fontWeight: 700 }}>🟠 {s.couverture}j</span>}
                            {s.statut === "ok" && <span className="c-green">✅ {s.couverture ? s.couverture + "j" : "OK"}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "plan" && (
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Plan d'action</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Semaine par semaine · Impact chiffré</p>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>#</th><th>Action</th><th>Gain estimé</th></tr></thead>
                    <tbody>
                      <tr><td>1</td><td><strong>Mettre en pause 3 campagnes</strong><br /><span style={{ fontSize: 11, color: "var(--muted)" }}>SB Couette Chaude, SB Pack Hiver, SP Couette Keywords Exact</span></td><td className="c-green">+255EUR/mois</td></tr>
                      <tr><td>2</td><td><strong>Couper ads Oreiller Ajustable 60x60</strong><br /><span style={{ fontSize: 11, color: "var(--muted)" }}>0 unité FBA — budget brûlé inutilement</span></td><td className="c-green">+68EUR</td></tr>
                      <tr><td>3</td><td><strong>Ajouter 27 négatifs SP</strong><br /><span style={{ fontSize: 11, color: "var(--muted)" }}>Expression exacte, campagne par campagne</span></td><td className="c-green">+380EUR/mois</td></tr>
                      <tr><td>4</td><td><strong>Tripler budget Oreiller Ajustable 50x70</strong><br /><span style={{ fontSize: 11, color: "var(--muted)" }}>ACOS 9%, ROAS 10.6x — bridé par son budget</span></td><td className="c-green">+500-800EUR/mois</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "chat" && (
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Chat avec l'agent</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Pose tes questions sur tes campagnes, ton stock, ta stratégie</p>
                <div className="messages">
                  {messages.map((m, i) => (
                    <div key={i} className={"msg " + m.role}>
                      <div className="msg-av">{m.role === "user" ? "X" : "🦆"}</div>
                      <div className="msg-bubble">{m.content}</div>
                    </div>
                  ))}
                  {loading && (
                    <div className="msg assistant">
                      <div className="msg-av">🦆</div>
                      <div className="msg-bubble"><div className="dots"><span /><span /><span /></div></div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
                <div className="chat-wrap">
                  <input className="chat-in" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage(input)} placeholder="Pose ta question à l'agent..." disabled={loading} />
                  <button className="send-btn" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>Envoyer</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {["Quelles campagnes couper ?", "Mon ACOS est trop élevé", "Quel ASIN scaler ?", "Stratégie juillet/août ?"].map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--muted)", cursor: "pointer", fontFamily: "var(--font)" }}>{q}</button>
                  ))}
                </div>
              </div>
            )}

            {tab === "upload" && (
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Nouveaux rapports</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Upload tes rapports hebdomadaires</p>
                <div className="upload-grid">
                  {fileTypes.map(ft => (
                    <div key={ft.key} className={"up-card" + (files[ft.key] ? " loaded" : "")} onClick={() => fileRefs.current[ft.key]?.click()}>
                      <input type="file" ref={el => fileRefs.current[ft.key] = el} style={{ display: "none" }} accept=".csv,.xlsx,.xls,.txt" onChange={e => e.target.files[0] && setFiles(prev => ({ ...prev, [ft.key]: e.target.files[0] }))} />
                      <div className="up-icon">{files[ft.key] ? "✅" : ft.icon}</div>
                      <div className="up-name">{ft.label}</div>
                      <div className="up-status">{files[ft.key] ? files[ft.key].name.slice(0, 20) + "…" : ft.desc}</div>
                    </div>
                  ))}
                </div>
                <button className="analyse-btn" onClick={analyseFiles} disabled={!Object.keys(files).length || analysing}>
                  {analysing ? "Analyse en cours..." : "🔍 Lancer l'analyse IA (" + Object.keys(files).length + " fichier" + (Object.keys(files).length > 1 ? "s" : "") + ")"}
                </button>
              </div>
            )}

            {tab === "analyse" && (
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Analyse IA</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Résultat de l'analyse de tes rapports</p>
                {streamText ? (
                  <div className="stream-box">{streamText}</div>
                ) : analysing ? (
                  <div className="stream-box"><div className="dots"><span /><span /><span /></div>{" Analyse en cours..."}</div>
                ) : (
                  <div className="empty">
                    <div className="empty-icon">🔍</div>
                    <div className="empty-title">Aucune analyse en cours</div>
                    <div>Upload tes rapports dans l'onglet "Nouveaux rapports" puis clique sur "Lancer l'analyse IA"</div>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
