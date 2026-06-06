import { useState, useRef, useCallback } from "react";

// ─── PALETTE & STYLES ────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --bg: #1a1740;
    --surface: #242060;
    --surface2: #2e2a72;
    --border: #5550a0;
    --border2: #6560b0;
    --text: #ffffff;
    --muted: #e8e6ff;
    --duck: #f5aa05;
    --duck-dim: rgba(245,170,5,0.18);
    --green: #4ade80;
    --green-dim: rgba(74,222,128,0.15);
    --red: #f87171;
    --red-dim: rgba(248,113,113,0.15);
    --amber: #fbbf24;
    --amber-dim: rgba(251,191,36,0.15);
    --blue: #93c5fd;
    --blue-dim: rgba(147,197,253,0.15);
    --radius: 10px;
    --font: 'Syne', sans-serif;
    --mono: 'DM Mono', monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    line-height: 1.6;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  .app { display: flex; flex-direction: column; min-height: 100vh; }

  /* HEADER */
  .header {
    padding: 20px 32px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface);
    position: sticky; top: 0; z-index: 100;
  }
  .header-left { display: flex; align-items: center; gap: 14px; }
  .logo {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--duck); display: flex; align-items: center;
    justify-content: center; font-size: 20px;
    box-shadow: 0 0 20px rgba(240,165,0,0.3);
  }
  .header-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
  .header-sub { font-size: 11px; color: var(--muted); margin-top: 1px; font-family: var(--mono); }
  .status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 8px var(--green);
    animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* MAIN LAYOUT */
  .main { display: flex; flex: 1; }

  /* SIDEBAR */
  .sidebar {
    width: 280px; flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    padding: 20px 16px;
    display: flex; flex-direction: column; gap: 6px;
    position: sticky; top: 61px; height: calc(100vh - 61px);
    overflow-y: auto;
  }
  .sidebar-section {
    font-size: 10px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1.2px;
    padding: 12px 8px 6px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 8px;
    cursor: pointer; transition: all 0.15s;
    font-size: 13px; font-weight: 500; color: var(--muted);
    background: none; border: none; width: 100%; text-align: left;
  }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: var(--duck-dim); color: var(--duck); }
  .nav-item .icon { font-size: 16px; }
  .nav-badge {
    margin-left: auto; font-size: 10px; padding: 1px 6px;
    border-radius: 10px; font-family: var(--mono);
  }
  .badge-red { background: var(--red-dim); color: var(--red); }
  .badge-green { background: var(--green-dim); color: var(--green); }
  .badge-amber { background: var(--amber-dim); color: var(--amber); }
  .badge-duck { background: var(--duck-dim); color: var(--duck); }

  /* CONTENT */
  .content { flex: 1; padding: 28px 32px; overflow-y: auto; }

  /* UPLOAD ZONE */
  .upload-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 10px; margin-bottom: 24px;
  }
  .upload-card {
    background: var(--surface); border: 1px dashed var(--border2);
    border-radius: var(--radius); padding: 16px;
    cursor: pointer; transition: all 0.2s; text-align: center;
  }
  .upload-card:hover { border-color: var(--duck); background: var(--duck-dim); }
  .upload-card.loaded { border-style: solid; border-color: var(--green); background: var(--green-dim); }
  .upload-card.loading { border-color: var(--duck); background: var(--duck-dim); }
  .upload-icon { font-size: 22px; margin-bottom: 6px; }
  .upload-name { font-size: 12px; font-weight: 600; margin-bottom: 3px; }
  .upload-status { font-size: 11px; color: var(--muted); }
  .upload-card.loaded .upload-status { color: var(--green); }

  /* ANALYSE BTN */
  .analyse-btn {
    width: 100%; padding: 14px;
    background: var(--duck); color: #000;
    font-family: var(--font); font-size: 14px; font-weight: 700;
    border: none; border-radius: var(--radius); cursor: pointer;
    transition: all 0.2s; letter-spacing: 0.3px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    margin-bottom: 24px;
  }
  .analyse-btn:hover { background: #ffb800; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(240,165,0,0.3); }
  .analyse-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }

  /* STREAMING */
  .stream-box {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px;
    font-family: var(--mono); font-size: 12px;
    color: var(--text); white-space: pre-wrap;
    max-height: 400px; overflow-y: auto;
    line-height: 1.7; margin-bottom: 24px;
  }
  .stream-cursor {
    display: inline-block; width: 8px; height: 14px;
    background: var(--duck); animation: blink 1s infinite;
    vertical-align: middle; margin-left: 2px; border-radius: 1px;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* KPI GRID */
  .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
  .kpi {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px 18px;
    transition: border-color 0.2s;
  }
  .kpi:hover { border-color: var(--border2); }
  .kpi-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .kpi-value { font-family: var(--mono); font-size: 26px; font-weight: 500; line-height: 1; margin-bottom: 4px; }
  .kpi-sub { font-size: 11px; color: var(--muted); }
  .kpi.red .kpi-value { color: var(--red); }
  .kpi.green .kpi-value { color: var(--green); }
  .kpi.amber .kpi-value { color: var(--amber); }
  .kpi.duck .kpi-value { color: var(--duck); }
  .kpi.blue .kpi-value { color: var(--blue); }

  /* SECTION */
  .section-title {
    font-size: 11px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1px;
    margin: 24px 0 12px;
  }

  /* ALERT */
  .alert {
    display: flex; gap: 12px; padding: 14px 16px;
    border-radius: var(--radius); margin-bottom: 10px;
    border: 1px solid;
  }
  .alert.red { background: var(--red-dim); border-color: rgba(239,68,68,0.3); }
  .alert.amber { background: var(--amber-dim); border-color: rgba(245,158,11,0.3); }
  .alert.green { background: var(--green-dim); border-color: rgba(34,197,94,0.3); }
  .alert-icon { font-size: 18px; flex-shrink: 0; }
  .alert-title { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
  .alert.red .alert-title { color: var(--red); }
  .alert.amber .alert-title { color: var(--amber); }
  .alert.green .alert-title { color: var(--green); }
  .alert-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }

  /* TABLE */
  .table-wrap {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden; margin-bottom: 20px;
  }
  table { width: 100%; border-collapse: collapse; }
  th {
    font-size: 10px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.8px;
    padding: 10px 14px; background: var(--surface2);
    text-align: left; border-bottom: 1px solid var(--border);
  }
  td { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid var(--border); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--surface2); }
  .mono { font-family: var(--mono); }
  .red { color: var(--red); }
  .green { color: var(--green); }
  .amber { color: var(--amber); }
  .duck-c { color: var(--duck); }

  /* CHAT */
  .chat-input-wrap {
    display: flex; gap: 10px; margin-top: 24px;
  }
  .chat-input {
    flex: 1; background: var(--surface); border: 1px solid var(--border2);
    border-radius: var(--radius); padding: 12px 16px;
    color: var(--text); font-family: var(--font); font-size: 13px;
    outline: none; transition: border-color 0.2s;
  }
  .chat-input:focus { border-color: var(--duck); }
  .chat-input::placeholder { color: var(--muted); }
  .send-btn {
    padding: 12px 20px; background: var(--duck); color: #000;
    font-family: var(--font); font-weight: 700; font-size: 13px;
    border: none; border-radius: var(--radius); cursor: pointer;
    transition: all 0.15s;
  }
  .send-btn:hover { background: #ffb800; }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* CHAT MESSAGES */
  .messages { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
  .msg { display: flex; gap: 10px; }
  .msg.user { flex-direction: row-reverse; }
  .msg-bubble {
    max-width: 80%; padding: 12px 16px;
    border-radius: 12px; font-size: 13px; line-height: 1.6;
  }
  .msg.user .msg-bubble { background: var(--duck); color: #000; font-weight: 500; border-radius: 12px 2px 12px 12px; }
  .msg.assistant .msg-bubble { background: var(--surface); border: 1px solid var(--border); color: var(--text); border-radius: 2px 12px 12px 12px; white-space: pre-wrap; }
  .msg-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0;
    background: var(--surface2); border: 1px solid var(--border);
  }
  .msg.user .msg-avatar { background: var(--duck); }

  /* ACTION PLAN */
  .action-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); margin-bottom: 12px; overflow: hidden;
  }
  .action-header {
    padding: 12px 16px; background: var(--surface2);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .action-title { font-size: 13px; font-weight: 700; }
  .action-item-row {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 16px; border-bottom: 1px solid var(--border);
  }
  .action-item-row:last-child { border-bottom: none; }
  .action-num {
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--surface2); border: 1px solid var(--border2);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px;
  }
  .action-body { flex: 1; }
  .action-item-title { font-size: 13px; font-weight: 600; margin-bottom: 3px; }
  .action-item-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }
  .action-gain { font-size: 11px; color: var(--green); font-family: var(--mono); margin-top: 4px; }

  /* LOADING */
  .loading-dots span {
    display: inline-block; width: 6px; height: 6px;
    border-radius: 50%; background: var(--duck);
    animation: bounce 1.2s infinite;
    margin: 0 2px;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

  /* EMPTY STATE */
  .empty {
    text-align: center; padding: 60px 20px; color: var(--muted);
  }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-title { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
  .empty-desc { font-size: 13px; line-height: 1.6; }

  /* STOCK GAUGE */
  .stock-bar-wrap { display: flex; align-items: center; gap: 8px; }
  .stock-bar { flex: 1; height: 4px; background: var(--border); border-radius: 2px; min-width: 60px; }
  .stock-bar-fill { height: 100%; border-radius: 2px; }

  /* TABS */
  .tabs { display: flex; gap: 2px; margin-bottom: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 4px; }
  .tab-btn {
    flex: 1; padding: 8px 12px; border-radius: 7px;
    font-family: var(--font); font-size: 12px; font-weight: 600;
    color: var(--muted); background: none; border: none; cursor: pointer;
    transition: all 0.15s;
  }
  .tab-btn:hover { color: var(--text); }
  .tab-btn.active { background: var(--surface2); color: var(--duck); }
`;

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'agent Amazon de LuckyDuck, une marque française de literie vegan (couettes, oreillers) fabriquée à partir de fibres recyclées iLOFT®.

CONTEXTE LUCKYDUCK :
- Présence Amazon depuis octobre 2025 (< 9 mois, marque en lancement)
- 33 ASINs actifs sur Amazon.fr, ventes pan-EU via .fr
- Budget Sponsored Products : ~4 500€/mois (dont ~3 400€ récupérés d'une agence)
- Problème historique : coupure ads 1 semaine (piratage CB mai 2026) + rupture FBA partielle → chute CA -60%
- Positionnement : milieu/haut de gamme, vegan certifié, iLOFT® recyclé — NE PAS brader les prix
- CA historique : 18 000€/mois (oct-mars), CA actuel dégradé : ~12 000€/mois

DONNÉES DE RÉFÉRENCE (analysées) :
- Top ASINs par CA : Oreiller Medium 60x60 (3 541€, conv 5,37%), Couette Chaude (2 582€, conv 1,69%), Couette Medium 350g (2 557€)
- Campagnes rentables (ACOS < 25%) : Duo Pack Exact 17%, All Catalogue Defense 16%, Oreiller SQP Exact 28%
- Campagnes à problèmes : Couette Chaude Keywords Exact (0 vente), SB Pack Hiver (hors saison)
- Budget gaspillé identifié : 62% des dépenses sans vente → 650€/mois récupérables
- Top ASIN par rentabilité ads : Oreiller Ajustable 50x70 (ACOS 9%), Couette Medium 220x240 (ACOS 13%), Couette Medium 240x260 (ACOS 14%)
- Stock critique : Oreiller Ajustable 60x60 (0 unité FBA), Oreiller Ferme 60x60 (4 unités, 30j couverture)

TON RÔLE :
1. Analyser les fichiers CSV/Excel uploadés (Business Report, SP/SB Termes de recherche, Produit promu, Stock FBA)
2. Détecter les anomalies et alertes (ACOS > 40%, stock < 30j, chute BSR, 0 vente sur campagne active)
3. Produire des recommandations actionnables classées par impact
4. Répondre aux questions stratégiques sur Amazon, Meta Ads, pricing, gamme
5. Surveiller la cohérence avec le positionnement premium vegan LuckyDuck

RÈGLES STRICTES :
- Jamais de recommandation de baisse de prix sans analyse approfondie — le positionnement premium est non négociable
- Toujours chiffrer les recommandations (€ récupérés, ACOS cible, CA estimé)
- Signaler explicitement les données manquantes
- Distinguer campagnes récentes (< 2 mois : Couette 4 Saisons, Oreiller Ferme 50x70) des campagnes matures
- Prioriser : Critique → Haute → Normale
- Répondre en français, de manière directe et actionnable
- Format : concis, chiffré, avec emojis de statut (🔴🟠✅) pour la lisibilité

SEUILS D'ALERTE :
- ACOS > 40% sur campagne mature → 🔴 Optimiser
- Stock FBA < 30 jours → 🔴 Réapprovisionner
- Taux de conversion < 3% → 🔴 Listing à corriger
- 0 vente sur campagne avec spend > 30€ → 🔴 Mettre en pause
- ACOS 25-40% → 🟠 Surveiller
- Stock 30-60 jours → 🟠 Attention
- ACOS < 25% → ✅ Scaler`;

// ─── RAPPORT DATA (données analysées) ────────────────────────────────────────
const RAPPORT_DATA = {
  kpis: [
    { label: "CA Total", value: "12 082€", sub: "Période analysée", color: "duck" },
    { label: "ACOS SP Global", value: "51,7%", sub: "Cible : < 30%", color: "red" },
    { label: "Budget Gaspillé", value: "62%", sub: "2 450€ sans vente", color: "red" },
    { label: "Récupérable S1", value: "~650€", sub: "Actions immédiates", color: "green" },
  ],
  alertes: [
    { type: "red", icon: "🔴", title: "Oreiller Ajustable 60x60 — RUPTURE FBA", desc: "0 unité disponible. Mettre en pause les campagnes ads sur cet ASIN immédiatement." },
    { type: "red", icon: "🔴", title: "4 campagnes à 0 vente malgré budget actif", desc: "Couette Chaude 220x240 (88€), Couette Chaude 140x200 (63€), Couette 4S 140x200 (54€), Couette 200x200 (62€) → 267€ à récupérer immédiatement." },
    { type: "red", icon: "🔴", title: "SB Couette Chaude — 0 vente, 117€ dépensés", desc: "Campagne hiver active en juin. Mettre en pause jusqu'en septembre." },
    { type: "amber", icon: "🟠", title: "Oreiller Ferme 60x60 — 30 jours de couverture stock", desc: "4 unités vendables. Commander dans les 10 jours en tenant compte du délai FBA." },
    { type: "amber", icon: "🟠", title: "Oreiller 50x70 — conversion 1,37%", desc: "291 sessions pour 4 ventes. Listing à corriger en urgence (titre, images, prix)." },
  ],
  topPerformers: [
    { asin: "B0FBXDG4H8", nom: "Oreiller Ajustable 50x70", acos: 9, roas: "10.6x", ventes: "365€", action: "Tripler le budget" },
    { asin: "B0FCSHQPML", nom: "Couette Medium 220x240", acos: 13, roas: "7.6x", ventes: "192€", action: "Doubler le budget" },
    { asin: "B0FCSBHH7Z", nom: "Couette Medium 240x260", acos: 14, roas: "7.3x", ventes: "349€", action: "Doubler le budget" },
    { asin: "B0FBXPG2M3", nom: "Oreiller Duo 60x60", acos: 18, roas: "5.6x", ventes: "263€", action: "Augmenter budget" },
    { asin: "B0GDRC9TZ9", nom: "Pack C 220x240+60", acos: 19, roas: "5.2x", ventes: "283€", action: "Augmenter budget" },
  ],
  actions: [
    {
      semaine: "Cette semaine — Actions immédiates",
      badge: "red",
      badge_label: "Urgent",
      items: [
        { n: 1, title: "Mettre en pause 3 campagnes (15 min)", desc: "SB Couette Chaude (0 vente, 117€) · SB Pack Hiver (101% ACOS) · SP Couette Keywords Exact (0 vente, 15€)", gain: "→ +255€/mois récupérés immédiatement" },
        { n: 2, title: "Couper les ads sur Oreiller Ajustable 60x60", desc: "0 unité en stock FBA. Chaque clic = budget brûlé sans possibilité de vente.", gain: "→ +68€ économisés" },
        { n: 3, title: "Ajouter 27 négatifs SP (1h30)", desc: "Campagne par campagne — liste complète dans le rapport téléchargeable. Type : Expression exacte.", gain: "→ +380€/mois de budget redirigé" },
        { n: 4, title: "Tripler le budget Oreiller Ajustable 50x70", desc: "ACOS 9%, ROAS 10.6x — ta meilleure campagne est bridée par son budget.", gain: "→ +500-800€ CA estimé/mois" },
      ]
    },
    {
      semaine: "Semaine 2 — Listings & conversion",
      badge: "amber",
      badge_label: "Important",
      items: [
        { n: 1, title: "Corriger listing Oreiller 50x70 (B0FBXBC6H4)", desc: "291 sessions → 1,37% conversion. Titre, images fond blanc, prix vs concurrents, Request a Review.", gain: "" },
        { n: 2, title: "Repositionner Couette Chaude pour la rentrée", desc: "Changer le titre vers 'couette hiver' maintenant pour indexation avant septembre.", gain: "" },
        { n: 3, title: "Extraire top termes SP en Exact Match", desc: "oreiller 45x70 (ACOS 3%), couette hiver (ACOS 2%), couette Medium 220x240 (ACOS 3%)", gain: "" },
      ]
    },
  ],
  stock: [
    { asin: "B0FBX7323Z", nom: "Oreiller Ajustable 60x60", qty: 0, couverture: null, statut: "rupture" },
    { asin: "B0FBXCYLXR", nom: "Oreiller Ferme 60x60", qty: 4, couverture: 30, statut: "critique" },
    { asin: "B0GSRZMFXP", nom: "Oreiller Ferme 50x70", qty: 12, couverture: null, statut: "ok" },
    { asin: "B0FBXBC6H4", nom: "Oreiller 50x70", qty: 19, couverture: 142, statut: "ok" },
    { asin: "B0FBXPG2M3", nom: "Oreiller Duo 60x60", qty: 23, couverture: 115, statut: "ok" },
    { asin: "B0FCSDVQWB", nom: "Couette Chaude 240x260", qty: 39, couverture: null, statut: "ok" },
    { asin: "B0FCSH41QX", nom: "Lot 2 Oreillers 65x65", qty: 39, couverture: null, statut: "ok" },
    { asin: "B0FDR9MFNQ", nom: "Lot 2 Oreillers 45x70", qty: 40, couverture: null, statut: "ok" },
  ],
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function AgentLuckyDuck() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [files, setFiles] = useState({});
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis ton agent Amazon LuckyDuck 🦆\n\nJe connais déjà l'analyse complète de tes rapports. Tu peux :\n• Me poser des questions sur tes campagnes ou ton stock\n• Uploader de nouveaux rapports pour une analyse fraîche\n• Me demander le plan d'action de la semaine\n• Me demander d'analyser un problème spécifique\n\nQue veux-tu faire ?" }
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [streamText, setStreamText] = useState("");
  const fileRefs = useRef({});
  const messagesEndRef = useRef(null);

  const fileTypes = [
    { key: "business", label: "Business Report", icon: "📊", desc: "CA, sessions, conversion" },
    { key: "sp_termes", label: "SP Termes recherche", icon: "🔍", desc: "Mots-clés Sponsored Products" },
    { key: "sb_termes", label: "SB Termes recherche", icon: "🏷️", desc: "Mots-clés Sponsored Brands" },
    { key: "produit_promu", label: "SP Produit promu", icon: "📦", desc: "Spend par ASIN" },
    { key: "emplacement", label: "SP Emplacement", icon: "📍", desc: "Performance par position" },
    { key: "stock", label: "Stock FBA", icon: "🏭", desc: "Inventaire et couverture" },
  ];

  const handleFile = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = useCallback(async (userMsg) => {
    if (!userMsg.trim() || streaming) return;

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    // Contexte des fichiers uploadés
    const filesContext = Object.keys(files).length > 0
      ? `\n\nFichiers uploadés cette session : ${Object.keys(files).map(k => fileTypes.find(f => f.key === k)?.label).join(", ")}`
      : "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "import.meta.env.VITE_ANTHROPIC_KEY", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + filesContext,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          stream: false,
        }),
      });

      const data = await response.json();
      const reply = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : (data.error ? data.error.messa

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion à l'API. Vérifie ta connexion." }]);
    } finally {
      setStreaming(false);
    }
  }, [messages, files, streaming]);

  const analyseFiles = useCallback(async () => {
    if (Object.keys(files).length === 0) return;
    setAnalysing(true);
    setStreamText("");
    setActiveTab("analyse");

    const fileNames = Object.keys(files).map(k => fileTypes.find(f => f.key === k)?.label).join(", ");
    const prompt = `J'uploade ces nouveaux rapports : ${fileNames}. Fais une analyse complète : KPIs clés, alertes prioritaires, top 3 actions immédiates, et projection CA. Sois précis et chiffré.`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "import.meta.env.VITE_ANTHROPIC_KEY", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "Erreur d'analyse.";
      setStreamText(text);
      setMessages(prev => [...prev,
        { role: "user", content: `Analyse des rapports : ${fileNames}` },
        { role: "assistant", content: text }
      ]);
    } catch (err) {
      setStreamText("Erreur de connexion à l'API Anthropic.");
    } finally {
      setAnalysing(false);
    }
  }, [files]);

  const acosBadge = (acos) => {
    if (!acos || acos >= 999) return <span style={{ color: "var(--red)", fontFamily: "var(--mono)", fontSize: 12 }}>N/A</span>;
    const color = acos < 25 ? "var(--green)" : acos < 40 ? "var(--amber)" : "var(--red)";
    return <span style={{ color, fontFamily: "var(--mono)", fontSize: 12 }}>{acos}%</span>;
  };

  const stockStatut = (s) => {
    if (s.statut === "rupture") return <span style={{ color: "var(--red)", fontSize: 11, fontWeight: 700 }}>🔴 RUPTURE</span>;
    if (s.statut === "critique") return <span style={{ color: "var(--amber)", fontSize: 11, fontWeight: 700 }}>🟠 {s.couverture}j</span>;
    return <span style={{ color: "var(--green)", fontSize: 11 }}>✅ {s.couverture ? `${s.couverture}j` : "OK"}</span>;
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <div className="logo" style={{padding:0,overflow:"hidden"}}><img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgaWQ9IkNhbHF1ZV8xIiBkYXRhLW5hbWU9IkNhbHF1ZSAxIiB2aWV3Qm94PSIwIDAgMzM0LjQgMzM0LjYyIiB3aWR0aD0iMzM0LjM5OTk5Mzg5NjQ4NDQiIGhlaWdodD0iMzM0LjYxOTk5NTExNzE4NzUiPgogIDxkZWZzPgogICAgPHN0eWxlPgogICAgICAuY2xzLTEgewogICAgICAgIGZpbGw6ICMyODIyNTI7CiAgICAgIH0KCiAgICAgIC5jbHMtMSwgLmNscy0yLCAuY2xzLTMgewogICAgICAgIHN0cm9rZS13aWR0aDogMHB4OwogICAgICB9CgogICAgICAuY2xzLTIgewogICAgICAgIGZpbGw6ICNmZmY7CiAgICAgIH0KCiAgICAgIC5jbHMtMyB7CiAgICAgICAgZmlsbDogI2Y1YWEwNTsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPGNpcmNsZSBjbGFzcz0iY2xzLTEiIGN4PSIxNjUuMyIgY3k9IjE2Ny43NCIgcj0iMTUwLjg2Ii8+CiAgPGc+CiAgICA8Zz4KICAgICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMjQ2LjMxLDEwNS40Yy02LjM0LTIxLjE1LTI4LjcxLTMzLjE5LTQ5Ljg1LTI2Ljg1LTIxLjE1LDYuMzQtMzMuMTksMjguNy0yNi44NSw0OS44NS45NSwzLjE2LDMuODQsNS4xOSw2Ljk3LDUuMTkuNjksMCwxLjQtLjEsMi4wOS0uMzEsMy44NS0xLjE2LDYuMDQtNS4yMSw0Ljg4LTkuMDctNC4wMy0xMy40NSwzLjYzLTI3LjY4LDE3LjA4LTMxLjcxLDEzLjQ2LTQuMDMsMjcuNjgsMy42MywzMS43MSwxNy4wOC4xOC42Mi40NSwxLjE4Ljc3LDEuNzFsMTMuMjUtNS42Yy0uMDMtLjEtLjA0LS4yLS4wNy0uM1oiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJNMjc0LjQsMTAxLjc3Yy0xLjU3LTMuNy01LjgzLTUuNDQtOS41NC0zLjg4bC0xOC40Nyw3LjgtMTMuMjUsNS42LTYuNjIsMi44Yy4wNi4yMy4xMi40Ny4xNi43MS4xMS40MS4xOS44Mi4yMywxLjI1bDEuOTQsMjEuODIsMzEuNjgsMTAuNzNjLjczLjIzLDEuNDguMzQsMi4yMS4zNCwzLjA5LDAsNS45NS0xLjk4LDYuOTQtNS4wOCwxLjIyLTMuODMtLjktNy45My00LjczLTkuMTVsLTI4LjQzLTkuMDUsMzQuMDEtMTQuMzZjMy43MS0xLjU2LDUuNDQtNS44NCwzLjg4LTkuNTRaIi8+CiAgICA8L2c+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Ik0xNjEuNywyNDYuNTZjNDYuMTUtOS40Myw3NC42Ny01MS42OSw2Ny44Ny0xMDAuNTJsLS43My04LjE4LTEuOTQtMjEuODJjLS4wNC0uNDMtLjEyLS44NS0uMjMtMS4yNS0uMDQtLjI0LS4xLS40Ny0uMTYtLjcxLTEuMTItNC40Mi01LjEyLTcuNy05Ljg5LTcuNy01LjY1LDAtMTAuMjIsNC41OC0xMC4yMiwxMC4yMiwwLDQuNDQsMi44NCw4LjIxLDYuNzksOS42MmwxLjksMjEuMy4wNC4zN2M1Ljc5LDQxLjA1LTE3LjkxLDc2LjU1LTU2LjM0LDg0LjQtMzYuNjcsNy41LTcyLjY1LTE0LjMyLTgzLjU0LTQ5LjMzbDk1LjI4LTE5LjQ3YzMuOTQtLjgxLDYuNDgtNC42NSw1LjY4LTguNTktLjgxLTMuOTQtNC42NC02LjQ5LTguNTktNS42OGwtMTA5LjkxLDIyLjQ2LDEuNDYsNy4xNGM4LjQsNDEuMTEsNDQuNyw2OS41Miw4NS4xMiw2OS41Mi4yNywwLC41My0uMDIuOC0uMDJ2MjEuNThoMjYuMzZjNC4yNywwLDcuNzQtMy40Nyw3Ljc0LTcuNzRzLTMuNDctNy43NC03Ljc0LTcuNzRoLTEwLjg4di03LjY0Yy4zOC0uMDcuNzYtLjEzLDEuMTQtLjJaIi8+CiAgPC9nPgo8L3N2Zz4=" alt="LuckyDuck" style={{width:"38px",height:"38px",borderRadius:"50%",display:"block"}} /></div>
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

          {/* SIDEBAR */}
          <nav className="sidebar">
            <div className="sidebar-section">Navigation</div>
            {[
              { id: "dashboard", icon: "📊", label: "Dashboard", badge: null },
              { id: "alertes", icon: "🚨", label: "Alertes", badge: { text: "5", color: "red" } },
              { id: "campagnes", icon: "📈", label: "Campagnes", badge: null },
              { id: "stock", icon: "🏭", label: "Stock FBA", badge: { text: "2", color: "amber" } },
              { id: "plan", icon: "✅", label: "Plan d'action", badge: null },
              { id: "chat", icon: "💬", label: "Chat agent", badge: null },
              { id: "upload", icon: "📁", label: "Nouveaux rapports", badge: null },
              { id: "analyse", icon: "🔍", label: "Analyse IA", badge: null },
            ].map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className={`nav-badge badge-${item.badge.color}`}>{item.badge.text}</span>
                )}
              </button>
            ))}

            <div className="sidebar-section" style={{ marginTop: 16 }}>Projections</div>
            <div style={{ padding: "8px 12px" }}>
              {[
                { label: "Aujourd'hui", val: "~12K€", color: "var(--red)" },
                { label: "J+30", val: "~15K€", color: "var(--amber)" },
                { label: "Mois 2", val: "~18K€", color: "var(--duck)" },
                { label: "Septembre", val: "~24K€", color: "var(--green)" },
              ].map(p => (
                <div key={p.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12, borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--muted)" }}>{p.label}</span>
                  <span style={{ color: p.color, fontFamily: "var(--mono)", fontWeight: 600 }}>{p.val}</span>
                </div>
              ))}
            </div>
          </nav>

          {/* CONTENT */}
          <main className="content">

            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Dashboard Amazon</h1>
                  <p style={{ fontSize: 13, color: "var(--muted)" }}>Analyse du 07/05/2026 au 05/06/2026 · Amazon.fr</p>
                </div>

                <div className="kpi-grid">
                  {RAPPORT_DATA.kpis.map((k, i) => (
                    <div key={i} className={`kpi ${k.color}`}>
                      <div className="kpi-label">{k.label}</div>
                      <div className="kpi-value">{k.value}</div>
                      <div className="kpi-sub">{k.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="section-title">Alertes actives</div>
                {RAPPORT_DATA.alertes.slice(0, 3).map((a, i) => (
                  <div key={i} className={`alert ${a.type}`}>
                    <div className="alert-icon">{a.icon}</div>
                    <div>
                      <div className="alert-title">{a.title}</div>
                      <div className="alert-desc">{a.desc}</div>
                    </div>
                  </div>
                ))}

                <div className="section-title">Top performers — À scaler maintenant</div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>ACOS</th>
                        <th>ROAS</th>
                        <th>Ventes</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RAPPORT_DATA.topPerformers.map((p, i) => (
                        <tr key={i}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{p.nom}</div>
                            <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--mono)" }}>{p.asin}</div>
                          </td>
                          <td>{acosBadge(p.acos)}</td>
                          <td className="mono green">{p.roas}</td>
                          <td className="mono duck-c">{p.ventes}</td>
                          <td><span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>↑ {p.action}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ALERTES */}
            {activeTab === "alertes" && (
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Alertes prioritaires</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>5 alertes actives · Classées par impact</p>
                {RAPPORT_DATA.alertes.map((a, i) => (
                  <div key={i} className={`alert ${a.type}`} style={{ marginBottom: 10 }}>
                    <div className="alert-icon" style={{ fontSize: 22 }}>{a.icon}</div>
                    <div>
                      <div className="alert-title" style={{ fontSize: 14 }}>#{i + 1} — {a.title}</div>
                      <div className="alert-desc">{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CAMPAGNES */}
            {activeTab === "campagnes" && (
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Analyse campagnes</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Sponsored Products + Sponsored Brands</p>

                <div className="kpi-grid">
                  <div className="kpi red"><div className="kpi-label">ACOS SP</div><div className="kpi-value">51,7%</div><div className="kpi-sub">Cible &lt; 30%</div></div>
                  <div className="kpi red"><div className="kpi-label">ACOS SB</div><div className="kpi-value">73,7%</div><div className="kpi-sub">Cible &lt; 40%</div></div>
                  <div className="kpi amber"><div className="kpi-label">Spend SP</div><div className="kpi-value">2 294€</div><div className="kpi-sub">Ventes : 4 441€</div></div>
                  <div className="kpi red"><div className="kpi-label">Gaspillé</div><div className="kpi-value">1 681€</div><div className="kpi-sub">73% sans vente</div></div>
                </div>

                <div className="section-title">Emplacements des annonces</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Emplacement</th><th>Spend</th><th>Ventes</th><th>ACOS</th><th>CTR</th><th>Verdict</th></tr></thead>
                    <tbody>
                      <tr><td>Reste des résultats</td><td className="mono">964€</td><td className="mono">1 439€</td><td className="mono red">67%</td><td className="mono">0,46%</td><td><span style={{ color: "var(--red)", fontSize: 11, fontWeight: 700 }}>🔴 Réduire</span></td></tr>
                      <tr><td>Sur fiches produits</td><td className="mono">791€</td><td className="mono">2 124€</td><td className="mono amber">37%</td><td className="mono">0,07%</td><td><span style={{ color: "var(--amber)", fontSize: 11, fontWeight: 700 }}>🟠 Surveiller</span></td></tr>
                      <tr><td><strong>Premiers résultats ⭐</strong></td><td className="mono">717€</td><td className="mono">1 404€</td><td className="mono amber">51%</td><td className="mono green">2,61%</td><td><span style={{ color: "var(--green)", fontSize: 11, fontWeight: 700 }}>✅ +30% enchères</span></td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="alert amber">
                  <div className="alert-icon">💡</div>
                  <div>
                    <div className="alert-title">Action emplacement recommandée</div>
                    <div className="alert-desc">Ajouter un modificateur +30% sur "Premiers résultats" — meilleur CTR (2,61%) avec un ACOS améliorable. Les "Premiers résultats" donnent la meilleure visibilité pour une marque premium.</div>
                  </div>
                </div>
              </div>
            )}

            {/* STOCK */}
            {activeTab === "stock" && (
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Stock FBA</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>État au 06/06/2026 · 2 alertes actives</p>

                <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                  <div className="kpi red"><div className="kpi-label">En rupture</div><div className="kpi-value">1</div><div className="kpi-sub">ASIN à 0 unité</div></div>
                  <div className="kpi amber"><div className="kpi-label">Stock critique</div><div className="kpi-value">1</div><div className="kpi-sub">&lt; 30 jours couverture</div></div>
                  <div className="kpi green"><div className="kpi-label">Stock sain</div><div className="kpi-value">30</div><div className="kpi-sub">ASINs OK</div></div>
                </div>

                <div className="alert red">
                  <div className="alert-icon">🔴</div>
                  <div>
                    <div className="alert-title">ACTION IMMÉDIATE — Oreiller Ajustable 60x60 (B0FBX7323Z)</div>
                    <div className="alert-desc">0 unité FBA. Mettre en pause toutes les campagnes ads sur cet ASIN. Réapprovisionner en urgence.</div>
                  </div>
                </div>

                <div className="section-title">Détail par ASIN</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>ASIN</th><th>Produit</th><th>Vendable</th><th>Couverture</th><th>Statut</th></tr></thead>
                    <tbody>
                      {RAPPORT_DATA.stock.map((s, i) => (
                        <tr key={i}>
                          <td className="mono" style={{ fontSize: 11 }}>{s.asin}</td>
                          <td style={{ fontWeight: 600, fontSize: 12 }}>{s.nom}</td>
                          <td className="mono">{s.qty}</td>
                          <td>
                            <div className="stock-bar-wrap">
                              <div className="stock-bar">
                                <div className="stock-bar-fill" style={{
                                  width: s.qty === 0 ? "0%" : `${Math.min(s.qty / 50 * 100, 100)}%`,
                                  background: s.statut === "rupture" ? "var(--red)" : s.statut === "critique" ? "var(--amber)" : "var(--green)"
                                }} />
                              </div>
                            </div>
                          </td>
                          <td>{stockStatut(s)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PLAN */}
            {activeTab === "plan" && (
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Plan d'action</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Semaine par semaine · Impact chiffré</p>

                {RAPPORT_DATA.actions.map((week, wi) => (
                  <div key={wi} className="action-card">
                    <div className="action-header">
                      <div className="action-title">{week.semaine}</div>
                      <span className={`nav-badge badge-${week.badge}`}>{week.badge_label}</span>
                    </div>
                    {week.items.map((item, ii) => (
                      <div key={ii} className="action-item-row">
                        <div className="action-num">{item.n}</div>
                        <div className="action-body">
                          <div className="action-item-title">{item.title}</div>
                          <div className="action-item-desc">{item.desc}</div>
                          {item.gain && <div className="action-gain">{item.gain}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* CHAT */}
            {activeTab === "chat" && (
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Chat avec l'agent</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Pose tes questions sur tes campagnes, ton stock, ta stratégie</p>

                <div className="messages">
                  {messages.map((m, i) => (
                    <div key={i} className={`msg ${m.role}`}>
                      <div className="msg-avatar">{m.role === "user" ? "X" : "🦆"}</div>
                      <div className="msg-bubble">{m.content}</div>
                    </div>
                  ))}
                  {streaming && (
                    <div className="msg assistant">
                      <div className="msg-avatar">🦆</div>
                      <div className="msg-bubble">
                        <div className="loading-dots"><span /><span /><span /></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-wrap">
                  <input
                    className="chat-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                    placeholder="Pose ta question à l'agent... (ex: Quels négatifs dois-je ajouter en priorité ?)"
                    disabled={streaming}
                  />
                  <button className="send-btn" onClick={() => sendMessage(input)} disabled={streaming || !input.trim()}>
                    Envoyer
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {[
                    "Quelles campagnes couper cette semaine ?",
                    "Mon ACOS est trop élevé, que faire ?",
                    "Quel ASIN scaler en priorité ?",
                    "Stratégie juillet/août ?",
                  ].map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{
                      fontSize: 11, padding: "5px 10px", borderRadius: 6,
                      background: "var(--surface2)", border: "1px solid var(--border2)",
                      color: "var(--muted)", cursor: "pointer", fontFamily: "var(--font)"
                    }}>{q}</button>
                  ))}
                </div>
              </div>
            )}

            {/* UPLOAD */}
            {activeTab === "upload" && (
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Nouveaux rapports</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Upload tes rapports hebdomadaires pour une analyse fraîche</p>

                <div className="upload-grid">
                  {fileTypes.map(ft => (
                    <div
                      key={ft.key}
                      className={`upload-card ${files[ft.key] ? "loaded" : ""}`}
                      onClick={() => fileRefs.current[ft.key]?.click()}
                    >
                      <input
                        type="file"
                        ref={el => fileRefs.current[ft.key] = el}
                        style={{ display: "none" }}
                        accept=".csv,.xlsx,.xls,.txt"
                        onChange={e => e.target.files[0] && handleFile(ft.key, e.target.files[0])}
                      />
                      <div className="upload-icon">{files[ft.key] ? "✅" : ft.icon}</div>
                      <div className="upload-name">{ft.label}</div>
                      <div className="upload-status">
                        {files[ft.key] ? files[ft.key].name.slice(0, 20) + "…" : ft.desc}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="analyse-btn"
                  onClick={analyseFiles}
                  disabled={Object.keys(files).length === 0 || analysing}
                >
                  {analysing ? (
                    <><div className="loading-dots"><span /><span /><span /></div> Analyse en cours...</>
                  ) : (
                    <>🔍 Lancer l'analyse IA ({Object.keys(files).length} fichier{Object.keys(files).length > 1 ? "s" : ""})</>
                  )}
                </button>

                <div className="alert amber">
                  <div className="alert-icon">💡</div>
                  <div>
                    <div className="alert-title">Chaque lundi matin — 15 min de setup</div>
                    <div className="alert-desc">Exporte les 5 rapports depuis Ads Console + Seller Central, uploade-les ici, et l'agent génère ton rapport de la semaine en 2 minutes.</div>
                  </div>
                </div>
              </div>
            )}

            {/* ANALYSE */}
            {activeTab === "analyse" && (
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Analyse IA</h1>
                <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>Résultat de l'analyse de tes rapports</p>

                {streamText ? (
                  <div className="stream-box">{streamText}</div>
                ) : analysing ? (
                  <div className="stream-box">
                    <div className="loading-dots"><span /><span /><span /></div>
                    {" Analyse en cours..."}
                    <span className="stream-cursor" />
                  </div>
                ) : (
                  <div className="empty">
                    <div className="empty-icon">🔍</div>
                    <div className="empty-title">Aucune analyse en cours</div>
                    <div className="empty-desc">Upload tes rapports dans l'onglet "Nouveaux rapports"<br />puis clique sur "Lancer l'analyse IA"</div>
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
