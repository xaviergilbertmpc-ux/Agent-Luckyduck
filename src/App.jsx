import { useState, useRef, useCallback } from "react";

const SYSTEM_PROMPT = `Tu es l'agent LuckyDuck, assistant expert pour la marque LuckyDuck (luckyduck.ooo), une marque française de literie vegan et éco-responsable.

CONTEXTE MARQUE :
- Produits : couettes et oreillers en fibre recyclée iLOFT® (sans plume animale)
- Positionnement : milieu/haut de gamme, CSP+, urbains, 30-55 ans, conscience écologique
- Certifications : Vegan Certified, GRS (Global Recycled Standard), Oeko-Tex
- CA Amazon actuel : ~12 000€/mois (pic historique : 18 000€/mois)
- Objectif luckyduck.ooo : moteur de marge, Amazon = moteur de volume
- Expansion prévue : Allemagne, Espagne, Italie + nouvelles marketplaces FR

CANAL AMAZON :
- Présence FR active, avis 4,7/5
- KPIs cibles : BSR < 5000 catégorie literie, ACoS < 25%, taux conversion > 12%
- Alertes : rupture stock FBA, BSR dégradé, ACoS élevé, avis négatifs
- Rapport hebdo : Business Report (Rapports → Ventes → Ventes par ASIN) + FBA (Rapports → Réalisation)

CANAL META ADS :
- Budget lancement : 400€/mois (TOFU 150€ + MOFU 150€ + BOFU 100€)
- Objectif ROAS : 2x mois 1, 3x mois 2-3
- KPIs cibles : CPM < 15€, CTR > 1,5%, CPC < 1€, CPA < 30€
- Architecture : 3 niveaux TOFU (notoriété audience froide) / MOFU (retargeting visiteurs) / BOFU (abandon panier)
- Pixel Meta installé via Shopify ✅, HubSpot connecté ✅

BIBLIOTHÈQUE CRÉATIVE (11 visuels) :
- V11 (caneton sur oreiller) : ouverture lancement, texte "Il garde ses plumes. Vous gardez le confort. 🦆" — PRIORITÉ ABSOLUE organique
- V8 (réveil canards + Amazon 4,7/5) : meilleur TOFU payant, accroche poétique
- V7 (main sur oreiller) : TOFU sensoriel
- V6 (confort duvet + note 4,7/5) : retargeting/BOFU avec preuve sociale
- V4 (femme endormie) : retargeting MOFU
- V5 (homme endormi) : A/B masculin vs V4
- V2 (femme lifestyle) : engagement féminin Instagram
- V9 (homme discret) : version safe de V3, humour sans risque Meta
- V10 (certification Vegan) : cible éthique/minimaliste
- V1 (produit lit hôtel) : premium TOFU
- V3 (homme torse nu) : à tester en dernier, risque refus Meta

TEXTES VALIDÉS (à utiliser dans les posts) :
- T7 : "Certaines choses sont mieux sans plumes. Comme votre oreiller. Comme votre couette. Comme vous." — LE MEILLEUR
- T2 : "Vous aimez les couettes gonflantes et moelleuses ? Nous aussi." — TOFU
- T4 : "Une sensation de légèreté. Un confort enveloppant. Et aucune plume animale." — retargeting
- T6 : texte pour visuel personne qui dort (corrigé sans commentaires agence)
- T9 : texte avec "fibre recyclée iLOFT®" (corrigé, accent + symbole ®)
- V11 : "Il garde ses plumes. Vous gardez le confort. 🦆 Couettes et oreillers LuckyDuck — le confort du duvet, sans plume animale. luckyduck.ooo"

PLANNING META JUIN 2026 :
Semaine 1 (9-13 juin) :
- Lun 9 juin : ORGANIQUE — V11 caneton 🦆 (ouverture émotionnelle, Instagram + Facebook)
- Mar 10 juin : PAYANT démarre — V8+V6 A/B, objectif Trafic, 5€/jour, audience froide CSP+ 30-55 ans France
- Mer 11 juin : ORGANIQUE — V8 "Le réveil est plus doux" (preuve sociale Amazon)
- Ven 13 juin : ORGANIQUE — V2 "Mon produit de beauté" (engagement féminin)
Semaine 2 (16-20 juin) :
- Lun 16 juin : ORGANIQUE — V5 homme endormi (cible masculine)
- Mar 17 juin : PAYANT — si V11 a généré engagement → activer V11 en TOFU payant
- Mer 18 juin : ORGANIQUE — V9 "À poil mais sans plumes" (humour safe)
- Ven 20 juin : ORGANIQUE — V1 focus certification Vegan
- Continu : lancer MOFU retargeting visiteurs 30j — V4+V5, 5€/jour
Semaine 3 (23-27 juin) :
- Lun 23 juin : ORGANIQUE — carrousel produits (à créer Canva)
- Mer 25 juin : ORGANIQUE — V2 avec témoignage client
- Ven 27 juin : ORGANIQUE — coulisses LuckyDuck / atelier Abeil
- Payant : couper le visuel le moins performant, doubler le meilleur → 10€/jour TOFU
Semaine 4 (30 juin - 4 juil) :
- Lun 30 juin : ORGANIQUE — V4 focus rentrée literie
- Mer 2 juil : ORGANIQUE — best performer semaine 1-2
- Ven 4 juil : ORGANIQUE — post éducatif "Pourquoi couette vegan ?"
- Payant : lancer BOFU abandon panier — V6 — 3€/jour
- Budget total juin : 400€

PRÉVISIONS CA luckyduck.ooo 2026 (scénario réaliste) :
Juin 760€ | Juillet 1 070€ | Août 1 350€ | Septembre 2 440€ | Octobre 3 010€ | Novembre 5 804€ | Décembre 7 970€
Objectif Nov+Déc : ~11 780€ (dans la fourchette 10-15K€)
Conditions : lancer Meta maintenant, budget sept ≥ 500€, stock FBA renforcé en octobre

RÈGLES DE RÉPONSE :
- Toujours répondre en français
- Être direct, concis, orienté action
- Pour les KPIs : dire clairement si c'est bon, moyen ou à corriger
- Ne jamais recommander de baisser les prix (positionnement premium assumé)
- Hashags recommandés : #literiebio #vegan #sommeil #couettevegan #luckyduck #madeinfrance #iLOFT #literiefrance`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "alertes", label: "Alertes", icon: "🚨" },
  { id: "campagnes", label: "Campagnes Amazon", icon: "📦" },
  { id: "meta", label: "Planning Meta", icon: "📱" },
  { id: "kpis-meta", label: "KPIs Meta", icon: "📈" },
  { id: "stock", label: "Stock FBA", icon: "🏭" },
  { id: "plan", label: "Plan d'action", icon: "✅" },
  { id: "previsions", label: "Prévisions CA", icon: "🎯" },
  { id: "chat", label: "Agent Chat", icon: "🦆" },
  { id: "rapports", label: "Nouveaux rapports", icon: "📂" },
];

const PLANNING_META = [
  // SEMAINE 1
  { date: "Lun 9 juin", type: "organique", visuel: "V11 — Caneton sur oreiller 🦆", caption: "Il garde ses plumes. Vous gardez le confort. 🦆", plateforme: "Instagram + Facebook", objectif: "Viralité / Émotion — OUVERTURE 🦆", budget: "—", kpi: "Partages > 20", statut: "🦆 OUVERTURE" },
  { date: "Mar 10 juin", type: "payant", visuel: "V8 + V6 — A/B test", caption: "T7 vs T2 — test automatique Meta", plateforme: "Instagram + Facebook", objectif: "Notoriété — audience froide CSP+ 30–55 ans", budget: "5€/jour", kpi: "CPM < 15€ · CTR > 1,5%", statut: "🚀 Lancer" },
  { date: "Mer 11 juin", type: "organique", visuel: "V8 — Le réveil est plus doux", caption: "Le réveil est plus doux quand les canards gardent leurs plumes.", plateforme: "Instagram + Facebook", objectif: "Notoriété", budget: "—", kpi: "Portée > 500", statut: "À publier" },
  { date: "Ven 13 juin", type: "organique", visuel: "V2 — Mon produit de beauté", caption: "Le confort d'un oreiller ne devrait pas dépendre d'une plume.", plateforme: "Instagram", objectif: "Engagement féminin", budget: "—", kpi: "Likes > 50", statut: "À publier" },
  // SEMAINE 2
  { date: "Lun 16 juin", type: "organique", visuel: "V7 — Main sur oreiller", caption: "Certaines choses sont mieux sans plumes. Comme votre oreiller.", plateforme: "Instagram", objectif: "Engagement", budget: "—", kpi: "Portée > 400", statut: "À planifier" },
  { date: "Mar 17 juin", type: "payant", visuel: "Best A/B S1 + V4 retargeting", caption: "T6 corrigé — retargeting visiteurs luckyduck.ooo 30 derniers jours", plateforme: "Instagram + Facebook", objectif: "Conversion MOFU — visiteurs 30j", budget: "10€/jour", kpi: "ROAS > 2x · CPC < 1€", statut: "📊 Analyser S1 d'abord" },
  { date: "Mer 18 juin", type: "organique", visuel: "V9 — À poil, mais sans plumes", caption: "Une sensation de légèreté. Un confort enveloppant. Et aucune plume animale.", plateforme: "Instagram + Facebook", objectif: "Viralité", budget: "—", kpi: "Partages > 10", statut: "À planifier" },
  { date: "Ven 20 juin", type: "organique", visuel: "V10 — Aussi léger qu'un nuage", caption: "Le confort du duvet n'a pas besoin de plumes.", plateforme: "Facebook", objectif: "Éducation marque / cible éthique", budget: "—", kpi: "Commentaires > 5", statut: "À planifier" },
  // SEMAINE 3
  { date: "Lun 23 juin", type: "organique", visuel: "V1 — Le confort et l'éthique", caption: "Tout le confort du duvet. Sans plume animale.", plateforme: "Instagram", objectif: "Notoriété", budget: "—", kpi: "Clics > 30", statut: "À planifier" },
  { date: "Mar 24 juin", type: "payant", visuel: "Best performer S1+S2", caption: "Doubler budget sur meilleur ROAS — couper le perdant", plateforme: "Instagram + Facebook", objectif: "Conversion — optimisation", budget: "10€/jour", kpi: "ROAS > 2,5x", statut: "📊 Optimiser" },
  { date: "Mer 25 juin", type: "organique", visuel: "V4 — Femme endormie + avis client", caption: "Une sensation de légèreté. Un confort enveloppant.", plateforme: "Instagram + Facebook", objectif: "Preuve sociale", budget: "—", kpi: "Saves > 20", statut: "À planifier" },
  { date: "Ven 27 juin", type: "organique", visuel: "V5 — Homme endormi", caption: "Une sensation de légèreté. Un confort enveloppant.", plateforme: "Facebook", objectif: "Engagement masculin", budget: "—", kpi: "Portée > 400", statut: "À planifier" },
  // SEMAINE 4
  { date: "Lun 30 juin", type: "organique", visuel: "V8 — Relance angle rentrée", caption: "Le réveil est plus doux quand les canards gardent leurs plumes.", plateforme: "Instagram", objectif: "Conversion — angle rentrée", budget: "—", kpi: "Clics > 40", statut: "À planifier" },
  { date: "Mar 1 juil", type: "payant", visuel: "V6 — Abandon panier", caption: "T2 — Audience : ajout panier sans achat · message de rappel doux", plateforme: "Instagram + Facebook", objectif: "Conversion BOFU — abandon panier", budget: "15€/jour", kpi: "ROAS > 3x · CPA < 30€", statut: "🎯 Lancer" },
  { date: "Mer 2 juil", type: "organique", visuel: "V6 — Relance preuve sociale", caption: "Vous aimez les couettes gonflantes et moelleuses ? Nous aussi.", plateforme: "Instagram + Facebook", objectif: "Conversion", budget: "—", kpi: "Clics > 35", statut: "À planifier" },
  { date: "Ven 4 juil", type: "organique", visuel: "Post éducatif — Pourquoi vegan ?", caption: "Le duvet n'a plus le monopole du confort. Notre fibre iLOFT®...", plateforme: "Facebook", objectif: "Notoriété + SEO social", budget: "—", kpi: "Partages > 15", statut: "À planifier" },
];

const PREVISIONS = [
  { mois: "Juin", budget: "400€", roas_cible: "—", ca_prudent: "450€", ca_realiste: "760€", ca_optimiste: "1 200€" },
  { mois: "Juillet", budget: "400€", roas_cible: "2x", ca_prudent: "700€", ca_realiste: "1 070€", ca_optimiste: "1 800€" },
  { mois: "Août", budget: "400€", roas_cible: "2x", ca_prudent: "850€", ca_realiste: "1 350€", ca_optimiste: "2 100€" },
  { mois: "Septembre", budget: "500€", roas_cible: "3x", ca_prudent: "1 400€", ca_realiste: "2 440€", ca_optimiste: "3 800€" },
  { mois: "Octobre", budget: "500€", roas_cible: "3x", ca_prudent: "1 700€", ca_realiste: "3 010€", ca_optimiste: "4 500€" },
  { mois: "Novembre", budget: "700€", roas_cible: "4x", ca_prudent: "3 200€", ca_realiste: "5 804€", ca_optimiste: "8 000€" },
  { mois: "Décembre", budget: "700€", roas_cible: "4x", ca_prudent: "4 500€", ca_realiste: "7 970€", ca_optimiste: "11 000€" },
];

const QUESTIONS_TYPES = [
  { q: "Quel visuel publier aujourd'hui ?", contexte: "Consulte le planning Meta juin 2026 et dis-moi quel visuel ou campagne est prévu aujourd'hui ou dans les prochains jours, et comment procéder." },
  { q: "Mon CTR est à 0,8% — c'est normal ?", contexte: "Mon CTR Meta est à 0,8% cette semaine. Est-ce normal pour un lancement ? Que dois-je faire ?" },
  { q: "Mon ROAS est à 1,5x — que faire ?", contexte: "Mon ROAS Meta est à 1,5x cette semaine. Est-ce suffisant ? Dois-je modifier mes campagnes ?" },
  { q: "Comment lire mon rapport Amazon ?", contexte: "Explique-moi comment extraire et interpréter les données clés du Business Report Amazon pour LuckyDuck (ventes par ASIN, sessions, taux de conversion)." },
  { q: "Stock FBA à risque — que faire ?", contexte: "J'ai un produit LuckyDuck dont le stock FBA est bas. Quelles actions urgentes dois-je prendre ?" },
  { q: "Comment optimiser une campagne Meta ?", contexte: "Mes campagnes Meta tournent depuis 2 semaines. Donne-moi les 3 optimisations prioritaires à faire maintenant." },
  { q: "Résumé de la stratégie pour mon épouse", contexte: "Fais un résumé clair et simple de la stratégie Meta LuckyDuck pour juin 2026 : quoi publier, quand, quel budget, et quels chiffres surveiller chaque semaine." },
];

export default function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [kpisMeta, setKpisMeta] = useState({ semaine: "", cpm: "", ctr: "", cpc: "", roas: "", depense: "", ca: "" });
  const [kpiSaved, setKpiSaved] = useState(false);
  const [rapportFile, setRapportFile] = useState(null);
  const [rapportFiles, setRapportFiles] = useState([]);
  const [rapportAnalyse, setRapportAnalyse] = useState("");
  const [rapportLoading, setRapportLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const sendMessage = useCallback(async (messageText) => {
    const text = messageText || input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: newMessages }),
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text || "Erreur de réponse.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Erreur de connexion à l'agent." }]);
    }
    setLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [input, messages, loading]);

  const analyserRapport = useCallback(async () => {
    const files = rapportFiles.length > 0 ? rapportFiles : (rapportFile ? [rapportFile] : []);
    if (files.length === 0) return;
    setRapportLoading(true);
    try {
      const contenus = await Promise.all(files.map(f => new Promise((res) => {
        const reader = new FileReader();
        reader.onload = (e) => res(`--- Fichier : ${f.name} ---\n${e.target.result.substring(0, 3000)}`);
        reader.readAsText(f);
      })));
      const contenuTotal = contenus.join("\n\n");
      const prompt = `Voici les données de ${files.length} rapport(s) Amazon/Meta pour LuckyDuck. Analyse-les et donne : 1) les KPIs clés par fichier, 2) les alertes éventuelles, 3) les 3 actions prioritaires.\n\nDonnées :\n${contenuTotal}`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      setRapportAnalyse(data?.content?.[0]?.text || "Erreur d'analyse.");
    } catch {
      setRapportAnalyse("Erreur de connexion.");
    }
    setRapportLoading(false);
  }, [rapportFiles, rapportFile]);

  const evaluerKpis = () => {
    const { cpm, ctr, cpc, roas } = kpisMeta;
    const alerts = [];
    if (parseFloat(cpm) > 15) alerts.push("⚠️ CPM > 15€ — audience trop large ou créatif peu engageant");
    if (parseFloat(ctr) < 1.5) alerts.push("⚠️ CTR < 1,5% — tester un nouveau visuel ou accroche");
    if (parseFloat(cpc) > 1) alerts.push("⚠️ CPC > 1€ — optimiser l'audience ou le visuel");
    if (parseFloat(roas) < 2) alerts.push("⚠️ ROAS < 2x — vérifier la page produit et le tunnel de conversion");
    if (alerts.length === 0) alerts.push("✅ Tous les KPIs sont dans les cibles — continuer sans toucher aux campagnes");
    return alerts;
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const styles = {
    app: { display: "flex", height: "100vh", background: "#0f1521", color: "#e8e4dc", fontFamily: "'Segoe UI', sans-serif", overflow: "hidden", flexDirection: "row" },
    sidebar: { width: "240px", background: "#282252", borderRight: "1px solid #1e2a4a", display: "flex", flexDirection: "column", flexShrink: 0 },
    logo: { padding: "20px 16px 16px", borderBottom: "1px solid #1e2a4a", background: "#282252" },
    logoTitle: { fontSize: "18px", fontWeight: "700", color: "#f5c842", letterSpacing: "0.5px" },
    logoSub: { fontSize: "11px", color: "#8888cc", marginTop: "2px" },
    nav: { flex: 1, padding: "12px 0", overflowY: "auto" },
    navItem: (active) => ({ display: "flex", alignItems: "center", gap: "10px", padding: "10px 20px", cursor: "pointer", fontSize: "13px", color: active ? "#f5c842" : "#aaaadd", background: active ? "rgba(245,200,66,0.10)" : "transparent", borderLeft: active ? "3px solid #f5c842" : "3px solid transparent", transition: "all 0.15s" }),
    main: { flex: 1, overflow: "auto", padding: "28px 32px" },
    title: { fontSize: "22px", fontWeight: "700", color: "#f5c842", marginBottom: "6px" },
    subtitle: { fontSize: "13px", color: "#6b8aaa", marginBottom: "24px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" },
    card: { background: "#131d2e", border: "1px solid #1e2a3a", borderRadius: "10px", padding: "18px" },
    cardTitle: { fontSize: "11px", color: "#6b8aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" },
    kpiVal: { fontSize: "26px", fontWeight: "700", color: "#f5c842" },
    kpiSub: { fontSize: "12px", color: "#4a6a80", marginTop: "4px" },
    badge: (color) => ({ display: "inline-block", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", background: color === "green" ? "rgba(52,199,89,0.15)" : color === "orange" ? "rgba(255,159,10,0.15)" : color === "red" ? "rgba(255,69,58,0.15)" : "rgba(245,200,66,0.15)", color: color === "green" ? "#34c759" : color === "orange" ? "#ff9f0a" : color === "red" ? "#ff453a" : "#f5c842" }),
    table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
    th: { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #1e2a3a", color: "#6b8aaa", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.6px" },
    td: { padding: "11px 12px", borderBottom: "1px solid #111827", verticalAlign: "top" },
    rowOrga: { background: "rgba(10,100,200,0.06)", borderLeft: "3px solid #2c6fad" },
    rowPayant: { background: "rgba(245,200,66,0.05)", borderLeft: "3px solid #f5c842" },
    btn: { background: "#f5c842", color: "#0a0f1a", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: "700", fontSize: "13px", cursor: "pointer" },
    btnGhost: { background: "transparent", color: "#f5c842", border: "1px solid #f5c842", borderRadius: "8px", padding: "8px 16px", fontWeight: "600", fontSize: "12px", cursor: "pointer" },
    input: { background: "#0a0f1a", border: "1px solid #1e2a3a", borderRadius: "8px", padding: "10px 14px", color: "#e8e4dc", fontSize: "13px", width: "100%", boxSizing: "border-box" },
    chatBubble: (role) => ({ maxWidth: "78%", padding: "12px 16px", borderRadius: role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: role === "user" ? "#1e3a5c" : "#131d2e", border: role === "assistant" ? "1px solid #1e2a3a" : "none", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }),
    chatRow: (role) => ({ display: "flex", justifyContent: role === "user" ? "flex-end" : "flex-start", marginBottom: "12px" }),
    prevRow: (i) => ({ background: i % 2 === 0 ? "#131d2e" : "#0f1826" }),
    alertItem: (type) => ({ padding: "12px 16px", borderRadius: "8px", marginBottom: "10px", background: type === "warning" ? "rgba(255,159,10,0.1)" : "rgba(255,69,58,0.1)", border: `1px solid ${type === "warning" ? "rgba(255,159,10,0.3)" : "rgba(255,69,58,0.3)"}`, fontSize: "13px" }),
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div>
            <div style={styles.title}>Dashboard LuckyDuck 🦆</div>
            <div style={styles.subtitle}>Vue d'ensemble Amazon + Meta Ads</div>
            <div className="ld-grid4" style={styles.grid4}>
              {[
                { label: "CA Amazon", val: "~12 000€", sub: "/mois — pic 18K€", color: "yellow" },
                { label: "Avis Amazon", val: "4,7/5 ⭐", sub: "Note produits FR", color: "green" },
                { label: "Budget Meta", val: "400€", sub: "/mois — lancement juin", color: "yellow" },
                { label: "Objectif Nov-Déc", val: "~11 780€", sub: "CA luckyduck.ooo", color: "green" },
              ].map((k, i) => (
                <div key={i} style={styles.card}>
                  <div style={styles.cardTitle}>{k.label}</div>
                  <div style={styles.kpiVal}>{k.val}</div>
                  <div style={styles.kpiSub}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div className="ld-grid2" style={styles.grid2}>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Statut canaux</div>
                {[
                  ["Amazon FR", "Actif", "green"],
                  ["Pixel Meta / Shopify", "Connecté ✅", "green"],
                  ["HubSpot / Shopify", "Connecté ✅", "green"],
                  ["Meta Ads Manager", "Configuré — lancement imminant", "orange"],
                  ["luckyduck.ooo", "Opérationnel ✅", "green"],
                ].map(([label, val, color], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e2a3a" }}>
                    <span style={{ fontSize: "13px" }}>{label}</span>
                    <span style={styles.badge(color)}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={styles.card}>
                <div style={styles.cardTitle}>Actions cette semaine</div>
                {[
                  "🦆 Publier V11 (caneton) — Lun 9 juin organique",
                  "📱 Lancer campagne Meta TOFU — Mar 10 juin",
                  "📊 Vérifier rapport Amazon hebdo",
                  "📧 Configurer popup HubSpot -10% première commande",
                  "📦 Contrôler stock FBA avant juillet",
                ].map((a, i) => (
                  <div key={i} style={{ fontSize: "13px", padding: "7px 0", borderBottom: "1px solid #111827", color: "#c8d8e8" }}>
                    {a}
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Architecture Meta Ads — 3 niveaux</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "10px" }}>
                {[
                  { level: "TOFU", label: "Notoriété", budget: "150€/mois", desc: "Audience froide CSP+ 30-55 ans France\nVisuels : V11, V8, V7\nObjectif : Trafic / Notoriété", color: "#2c6fad" },
                  { level: "MOFU", label: "Conviction", budget: "150€/mois", desc: "Visiteurs luckyduck.ooo 30 derniers jours\nVisuels : V4, V5\nObjectif : Ventes — reciblage", color: "#f5c842" },
                  { level: "BOFU", label: "Conversion", budget: "100€/mois", desc: "Abandon panier\nVisuel : V6 (note 4,7/5)\nObjectif : Ventes — abandon panier", color: "#34c759" },
                ].map((l, i) => (
                  <div key={i} style={{ background: "#0a0f1a", borderRadius: "8px", padding: "14px", borderTop: `3px solid ${l.color}` }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: l.color, marginBottom: "4px" }}>{l.level} — {l.label}</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#f5c842", marginBottom: "8px" }}>{l.budget}</div>
                    <div style={{ fontSize: "12px", color: "#6b8aaa", whiteSpace: "pre-line" }}>{l.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "alertes":
        return (
          <div>
            <div style={styles.title}>Alertes & Surveillance 🚨</div>
            <div style={styles.subtitle}>Seuils à surveiller chaque semaine</div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Alertes Amazon — seuils critiques</div>
              {[
                { type: "warning", msg: "BSR > 5 000 en catégorie literie → vérifier prix, stock, avis récents" },
                { type: "danger", msg: "ACoS > 25% → pauser les campagnes les moins performantes" },
                { type: "warning", msg: "Stock FBA < 2 semaines de vente → réapprovisionner immédiatement" },
                { type: "warning", msg: "Taux de conversion < 12% → optimiser listing (photos, titre, bullets)" },
              ].map((a, i) => (
                <div key={i} style={styles.alertItem(a.type)}>{a.msg}</div>
              ))}
            </div>
            <div style={{ ...styles.card, marginTop: "16px" }}>
              <div style={styles.cardTitle}>Alertes Meta Ads — KPIs hebdomadaires</div>
              {[
                { type: "warning", msg: "CPM > 15€ → audience trop large ou créatif peu engageant — réduire l'audience ou tester nouveau visuel" },
                { type: "warning", msg: "CTR < 1,5% → accroche insuffisante — tester V11 ou V8 en remplacement" },
                { type: "danger", msg: "ROAS < 2x en mois 1 → vérifier tunnel : page produit, temps de chargement, prix" },
                { type: "warning", msg: "CPC > 1€ → réduire enchère ou améliorer score de pertinence du visuel" },
                { type: "danger", msg: "0 achat après 150€ dépensés → problème tunnel, pas campagne — auditer luckyduck.ooo" },
              ].map((a, i) => (
                <div key={i} style={styles.alertItem(a.type)}>{a.msg}</div>
              ))}
            </div>
            <div style={{ ...styles.card, marginTop: "16px" }}>
              <div style={styles.cardTitle}>Règle d'or Meta — ne pas toucher trop tôt</div>
              <div style={{ fontSize: "13px", color: "#c8d8e8", lineHeight: "1.7" }}>
                Les 7 premiers jours d'une campagne Meta sont la <strong style={{ color: "#f5c842" }}>phase d'apprentissage</strong>. Ne modifier aucune campagne avant 7 jours minimum et 50 événements d'optimisation. Observer uniquement CPM et CTR. Couper uniquement si CPM &gt; 25€ ou CTR &lt; 0,5% après 5 jours.
              </div>
            </div>
          </div>
        );

      case "campagnes":
        return (
          <div>
            <div style={styles.title}>Campagnes Amazon 📦</div>
            <div style={styles.subtitle}>Suivi performance et recommandations</div>
            <div className="ld-grid4" style={styles.grid4}>
              {[
                { label: "ACoS cible", val: "< 25%", sub: "Coût pub / CA" },
                { label: "Taux conversion cible", val: "> 12%", sub: "Sessions → achats" },
                { label: "BSR cible", val: "< 5 000", sub: "Catégorie literie" },
                { label: "Avis", val: "4,7/5 ⭐", sub: "Amazon FR" },
              ].map((k, i) => (
                <div key={i} style={styles.card}>
                  <div style={styles.cardTitle}>{k.label}</div>
                  <div style={styles.kpiVal}>{k.val}</div>
                  <div style={styles.kpiSub}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Comment extraire les rapports Amazon</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "10px" }}>
                <div style={{ background: "#0a0f1a", borderRadius: "8px", padding: "14px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#f5c842", marginBottom: "8px" }}>Business Report (ventes)</div>
                  <div style={{ fontSize: "12px", color: "#6b8aaa", lineHeight: "1.7" }}>Rapports → Ventes → Ventes par ASIN<br/>Colonne clés : Sessions, Taux conversion, Unités commandées, CA commandé</div>
                </div>
                <div style={{ background: "#0a0f1a", borderRadius: "8px", padding: "14px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#f5c842", marginBottom: "8px" }}>Stock FBA</div>
                  <div style={{ fontSize: "12px", color: "#6b8aaa", lineHeight: "1.7" }}>Rapports → Réalisation → Inventaire FBA actuel<br/>Colonne clés : Unités disponibles, Jours de stock estimés</div>
                </div>
              </div>
            </div>
            <div style={{ ...styles.card, marginTop: "16px" }}>
              <div style={styles.cardTitle}>Expansion Europe prévue</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginTop: "10px" }}>
                {[
                  { pays: "🇩🇪 Allemagne", statut: "En projet", priorite: "Haute — marché literie premium fort" },
                  { pays: "🇪🇸 Espagne", statut: "En projet", priorite: "Moyenne — après Allemagne" },
                  { pays: "🇮🇹 Italie", statut: "En projet", priorite: "Moyenne — après Espagne" },
                ].map((p, i) => (
                  <div key={i} style={{ background: "#0a0f1a", borderRadius: "8px", padding: "14px" }}>
                    <div style={{ fontSize: "15px", marginBottom: "6px" }}>{p.pays}</div>
                    <span style={styles.badge("orange")}>{p.statut}</span>
                    <div style={{ fontSize: "12px", color: "#6b8aaa", marginTop: "8px" }}>{p.priorite}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "meta":
        return (
          <div>
            <div style={styles.title}>Planning Meta Ads — Juin 2026 📱</div>
            <div style={styles.subtitle}>Parutions chronologiques — organique + payant</div>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                <div style={{ width: "14px", height: "14px", background: "rgba(10,100,200,0.15)", border: "1px solid #2c6fad", borderRadius: "3px" }}></div>
                🔵 Organique (à publier manuellement)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                <div style={{ width: "14px", height: "14px", background: "rgba(245,200,66,0.1)", border: "1px solid #f5c842", borderRadius: "3px" }}></div>
                🟡 Payant (Meta Ads Manager)
              </div>
            </div>
            <div style={{ ...styles.card, padding: "0", overflow: "hidden" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#0a0f1a" }}>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Visuel</th>
                    <th style={styles.th}>Message clé</th>
                    <th style={styles.th}>Plateforme</th>
                    <th style={styles.th}>Objectif</th>
                    <th style={styles.th}>Budget/j</th>
                    <th style={styles.th}>KPI cible</th>
                    <th style={styles.th}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {PLANNING_META.map((row, i) => (
                    <tr key={i} style={row.type === "organique" ? styles.rowOrga : styles.rowPayant}>
                      <td style={{ ...styles.td, fontWeight: "600", whiteSpace: "nowrap" }}>{row.date}</td>
                      <td style={styles.td}><span style={styles.badge(row.type === "organique" ? "blue" : "yellow")}>{row.type === "organique" ? "🔵 Org." : "🟡 Payant"}</span></td>
                      <td style={{ ...styles.td, fontSize: "12px", color: "#c8d8e8" }}>{row.visuel}</td>
                      <td style={{ ...styles.td, fontSize: "11px", color: "#6b8aaa", maxWidth: "180px" }}>{row.caption}</td>
                      <td style={{ ...styles.td, fontSize: "12px" }}>{row.plateforme}</td>
                      <td style={{ ...styles.td, fontSize: "12px", color: "#8aabb0" }}>{row.objectif}</td>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#f5c842", whiteSpace: "nowrap" }}>{row.budget}</td>
                      <td style={{ ...styles.td, fontSize: "11px", color: "#34c759" }}>{row.kpi}</td>
                      <td style={{ ...styles.td, fontSize: "11px", whiteSpace: "nowrap" }}>{row.statut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ ...styles.card, marginTop: "16px" }}>
              <div style={styles.cardTitle}>Règles d'or des captions</div>
              <div style={{ fontSize: "13px", color: "#c8d8e8", lineHeight: "1.8" }}>
                • <strong style={{ color: "#f5c842" }}>Accroche forte</strong> sur la 1ère ligne (s'affiche avant "voir plus")<br />
                • Terminer par un <strong style={{ color: "#f5c842" }}>CTA clair</strong> : "Découvrez sur luckyduck.ooo" ou "Lien en bio"<br />
                • <strong style={{ color: "#f5c842" }}>5 à 8 hashtags</strong> : #literiebio #vegan #sommeil #couettevegan #luckyduck #madeinfrance #iLOFT #literiefrance<br />
                • Longueur : 3 à 5 lignes Instagram, un peu plus Facebook<br /><br />
                <strong style={{ color: "#f5c842" }}>Budget juin total : ~280€</strong> · 12 posts organiques · 4 campagnes payantes · ROAS cible 3x fin juin
              </div>
            </div>
          </div>
        );

      case "kpis-meta":
        return (
          <div>
            <div style={styles.title}>Suivi KPIs Meta 📈</div>
            <div style={styles.subtitle}>Renseigner chaque lundi — l'agent analyse et conseille</div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Saisie hebdomadaire</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginTop: "12px" }}>
                {[
                  { key: "semaine", label: "Semaine (ex: 9-13 juin)", placeholder: "9-13 juin" },
                  { key: "cpm", label: "CPM (€) — cible < 15€", placeholder: "ex: 12.5" },
                  { key: "ctr", label: "CTR (%) — cible > 1,5%", placeholder: "ex: 1.8" },
                  { key: "cpc", label: "CPC (€) — cible < 1€", placeholder: "ex: 0.85" },
                  { key: "roas", label: "ROAS — cible > 2x mois 1", placeholder: "ex: 2.3" },
                  { key: "depense", label: "Dépense totale (€)", placeholder: "ex: 95" },
                  { key: "ca", label: "CA généré (€)", placeholder: "ex: 220" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <div style={{ fontSize: "11px", color: "#6b8aaa", marginBottom: "6px" }}>{label}</div>
                    <input
                      style={styles.input}
                      placeholder={placeholder}
                      value={kpisMeta[key]}
                      onChange={e => setKpisMeta({ ...kpisMeta, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button style={styles.btn} onClick={() => setKpiSaved(true)}>Analyser les KPIs</button>
                {kpiSaved && <button style={styles.btnGhost} onClick={() => sendMessage(`Analyse mes KPIs Meta de la semaine ${kpisMeta.semaine} : CPM ${kpisMeta.cpm}€, CTR ${kpisMeta.ctr}%, CPC ${kpisMeta.cpc}€, ROAS ${kpisMeta.roas}x, Dépense ${kpisMeta.depense}€, CA ${kpisMeta.ca}€. Dis-moi ce qui est bon, ce qui est à corriger et les 3 actions prioritaires.`) || setActiveSection("chat")}>Demander à l'agent 🦆</button>}
              </div>
            </div>
            {kpiSaved && (
              <div style={{ ...styles.card, marginTop: "16px" }}>
                <div style={styles.cardTitle}>Analyse automatique — semaine {kpisMeta.semaine}</div>
                {evaluerKpis().map((a, i) => (
                  <div key={i} style={{ ...styles.alertItem(a.startsWith("⚠️") ? "warning" : "ok"), marginBottom: "8px" }}>{a}</div>
                ))}
                <div style={{ marginTop: "12px", fontSize: "12px", color: "#6b8aaa" }}>
                  Pour une analyse approfondie et des recommandations personnalisées → onglet Agent Chat 🦆
                </div>
              </div>
            )}
            <div style={{ ...styles.card, marginTop: "16px" }}>
              <div style={styles.cardTitle}>Cibles KPIs par phase</div>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#0a0f1a" }}>
                    <th style={styles.th}>Métrique</th>
                    <th style={styles.th}>Mois 1 (juin)</th>
                    <th style={styles.th}>Mois 2-3</th>
                    <th style={styles.th}>Signal d'alerte</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["CPM", "< 15€", "< 12€", "> 20€"],
                    ["CTR", "> 1,5%", "> 2%", "< 0,8%"],
                    ["CPC", "< 1€", "< 0,80€", "> 1,50€"],
                    ["ROAS", "> 2x", "> 3x", "< 1,5x"],
                    ["CPA (coût / acquisition)", "< 40€", "< 30€", "> 60€"],
                  ].map(([m, m1, m2, alerte], i) => (
                    <tr key={i} style={styles.prevRow(i)}>
                      <td style={{ ...styles.td, fontWeight: "600" }}>{m}</td>
                      <td style={{ ...styles.td, color: "#34c759" }}>{m1}</td>
                      <td style={{ ...styles.td, color: "#34c759" }}>{m2}</td>
                      <td style={{ ...styles.td, color: "#ff453a" }}>{alerte}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "stock":
        return (
          <div>
            <div style={styles.title}>Stock FBA 🏭</div>
            <div style={styles.subtitle}>Surveillance et alertes réapprovisionnement</div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Règle de gestion stock FBA</div>
              <div style={{ fontSize: "13px", color: "#c8d8e8", lineHeight: "1.8" }}>
                Seuil critique : <strong style={{ color: "#ff453a" }}>{"< 2 semaines de stock"}</strong> → réapprovisionner immédiatement<br />
                Seuil vigilance : <strong style={{ color: "#ff9f0a" }}>{"< 4 semaines de stock"}</strong> → préparer le réapprovisionnement<br />
                Période critique : <strong style={{ color: "#f5c842" }}>Octobre–Novembre</strong> — renforcer avant la saison literie<br />
                <br />
                ⚠️ Une rupture de stock FBA en période Meta active = perte de l'ensemble du budget pub investi
              </div>
            </div>
            <div style={{ ...styles.card, marginTop: "16px" }}>
              <div style={styles.cardTitle}>Calendrier réapprovisionnement recommandé</div>
              {[
                { date: "Fin juillet", action: "Vérifier niveaux FBA — préparer envoi août", urgence: "normale" },
                { date: "Fin août", action: "Réapprovisionner avant rentrée septembre — +30% vs volumes habituels", urgence: "haute" },
                { date: "1er octobre", action: "Stock renforcé obligatoire — saison literie novembre-décembre", urgence: "critique" },
                { date: "1er novembre", action: "Vérifier stock Black Friday / Noël — objectif 0 rupture", urgence: "critique" },
              ].map((r, i) => (
                <div key={i} style={{ ...styles.alertItem(r.urgence === "critique" ? "danger" : r.urgence === "haute" ? "warning" : "ok"), marginBottom: "8px" }}>
                  <strong>{r.date}</strong> — {r.action}
                </div>
              ))}
            </div>
          </div>
        );

      case "plan":
        return (
          <div>
            <div style={styles.title}>Plan d'action ✅</div>
            <div style={styles.subtitle}>Actions prioritaires classées par urgence</div>
            {[
              {
                semaine: "Cette semaine — 9 juin",
                actions: [
                  { done: false, label: "Publier V11 (caneton) — Lun 9 juin, Instagram + Facebook", prio: "critique" },
                  { done: false, label: "Lancer campagne TOFU Meta — V8+V6 A/B, 5€/jour", prio: "critique" },
                  { done: true, label: "Configurer compte Meta Ads Manager (page + paiement)", prio: "done" },
                  { done: true, label: "Vérifier Pixel Meta via Shopify", prio: "done" },
                  { done: false, label: "Créer popup HubSpot -10% première commande sur luckyduck.ooo", prio: "haute" },
                ],
              },
              {
                semaine: "Semaine 2 — 16 juin",
                actions: [
                  { done: false, label: "Analyser résultats semaine 1 (CPM, CTR, engagement V11)", prio: "haute" },
                  { done: false, label: "Activer V11 en payant si engagement organique > 20 interactions", prio: "haute" },
                  { done: false, label: "Lancer MOFU retargeting visiteurs 30j — V4+V5", prio: "haute" },
                  { done: false, label: "Créer carrousel produits Canva (couette + oreiller)", prio: "normale" },
                ],
              },
              {
                semaine: "Fin juin — juillet",
                actions: [
                  { done: false, label: "Lancer BOFU abandon panier — V6, 3€/jour", prio: "haute" },
                  { done: false, label: "Couper visuel TOFU le moins performant, doubler le meilleur", prio: "haute" },
                  { done: false, label: "Préparer séquence email HubSpot (3 emails sur 7 jours)", prio: "normale" },
                  { done: false, label: "Vérifier niveaux stock FBA — préparer réappro août", prio: "haute" },
                ],
              },
              {
                semaine: "Septembre — conditions de succès Nov-Déc",
                actions: [
                  { done: false, label: "Budget Meta → 500€/mois minimum en septembre", prio: "critique" },
                  { done: false, label: "Stock FBA renforcé avant le 1er octobre", prio: "critique" },
                  { done: false, label: "Séquence email HubSpot active avant novembre", prio: "haute" },
                  { done: false, label: "Audience look-alike Meta créée depuis liste HubSpot", prio: "haute" },
                ],
              },
            ].map((bloc, bi) => (
              <div key={bi} style={{ ...styles.card, marginBottom: "16px" }}>
                <div style={styles.cardTitle}>{bloc.semaine}</div>
                {bloc.actions.map((a, ai) => (
                  <div key={ai} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", borderBottom: "1px solid #111827" }}>
                    <div style={{ width: "18px", height: "18px", borderRadius: "4px", background: a.done ? "#34c759" : a.prio === "critique" ? "rgba(255,69,58,0.2)" : a.prio === "haute" ? "rgba(255,159,10,0.2)" : "rgba(10,100,200,0.2)", border: `1px solid ${a.done ? "#34c759" : a.prio === "critique" ? "#ff453a" : a.prio === "haute" ? "#ff9f0a" : "#2c6fad"}`, flexShrink: 0, marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px" }}>{a.done ? "✓" : ""}</div>
                    <div style={{ fontSize: "13px", color: a.done ? "#4a6a80" : "#c8d8e8", textDecoration: a.done ? "line-through" : "none" }}>{a.label}</div>
                    {!a.done && <span style={{ ...styles.badge(a.prio === "critique" ? "red" : a.prio === "haute" ? "orange" : "blue"), flexShrink: 0 }}>{a.prio}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );

      case "previsions":
        return (
          <div>
            <div style={styles.title}>Prévisions CA luckyduck.ooo 🎯</div>
            <div style={styles.subtitle}>Objectif Nov+Déc : 10 000€ – 15 000€ — Scénario réaliste : ~11 780€</div>
            <div style={{ ...styles.card, padding: "0", overflow: "hidden" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#0a0f1a" }}>
                    <th style={styles.th}>Mois</th>
                    <th style={styles.th}>Budget Meta</th>
                    <th style={styles.th}>ROAS cible</th>
                    <th style={styles.th}>CA prudent</th>
                    <th style={styles.th}>CA réaliste</th>
                    <th style={styles.th}>CA optimiste</th>
                  </tr>
                </thead>
                <tbody>
                  {PREVISIONS.map((r, i) => (
                    <tr key={i} style={styles.prevRow(i)}>
                      <td style={{ ...styles.td, fontWeight: "700", color: (r.mois === "Novembre" || r.mois === "Décembre") ? "#f5c842" : "#e8e4dc" }}>{r.mois}{(r.mois === "Novembre" || r.mois === "Décembre") ? " ⭐" : ""}</td>
                      <td style={{ ...styles.td, color: "#f5c842" }}>{r.budget}</td>
                      <td style={styles.td}>{r.roas_cible}</td>
                      <td style={{ ...styles.td, color: "#4a6a80" }}>{r.ca_prudent}</td>
                      <td style={{ ...styles.td, color: "#34c759", fontWeight: "600" }}>{r.ca_realiste}</td>
                      <td style={{ ...styles.td, color: "#ff9f0a" }}>{r.ca_optimiste}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "#0a0f1a", borderTop: "2px solid #f5c842" }}>
                    <td style={{ ...styles.td, fontWeight: "700", color: "#f5c842" }}>NOV + DÉC</td>
                    <td style={{ ...styles.td, color: "#f5c842" }}>1 400€</td>
                    <td style={styles.td}>4x</td>
                    <td style={{ ...styles.td, color: "#4a6a80", fontWeight: "700" }}>7 700€</td>
                    <td style={{ ...styles.td, color: "#34c759", fontWeight: "700" }}>~11 780€ ✅</td>
                    <td style={{ ...styles.td, color: "#ff9f0a", fontWeight: "700" }}>19 000€</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ ...styles.card, marginTop: "16px" }}>
              <div style={styles.cardTitle}>3 conditions de succès pour atteindre l'objectif</div>
              {[
                { num: "1", label: "Lancer Meta maintenant (juin)", desc: "Les algorithmes ont besoin de 90 jours pour apprendre avant le pic de novembre. Chaque semaine de retard = performance dégradée en novembre." },
                { num: "2", label: "Budget septembre ≥ 500€", desc: "Septembre est le mois charnière literie. C'est là que l'algorithme atteint sa maturité et que le coût d'acquisition chute." },
                { num: "3", label: "Stock FBA renforcé avant octobre", desc: "Une rupture stock en période Meta active + saison détruit tout le travail des 4 mois précédents." },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", padding: "12px 0", borderBottom: "1px solid #111827" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f5c842", color: "#0a0f1a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", flexShrink: 0 }}>{c.num}</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#f5c842", marginBottom: "4px" }}>{c.label}</div>
                    <div style={{ fontSize: "12px", color: "#6b8aaa" }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "chat":
        return (
          <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "16px" }}>
            <div>
              <div style={styles.title}>Agent Chat LuckyDuck 🦆</div>
              <div style={styles.subtitle}>Amazon + Meta Ads — posez vos questions directement</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                {QUESTIONS_TYPES.map((qt, i) => (
                  <button key={i} style={{ ...styles.btnGhost, fontSize: "11px", padding: "6px 12px" }} onClick={() => sendMessage(qt.contexte)}>
                    {qt.q}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", background: "#0a0f1a", borderRadius: "10px", padding: "16px", border: "1px solid #1e2a3a", minHeight: "300px" }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", color: "#4a6a80", marginTop: "40px", fontSize: "13px" }}>
                  🦆 Bonjour ! Je suis l'agent LuckyDuck.<br />Je connais votre stratégie Amazon + Meta, vos visuels et vos objectifs.<br />Posez-moi n'importe quelle question.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} style={styles.chatRow(m.role)}>
                  <div style={styles.chatBubble(m.role)}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div style={styles.chatRow("assistant")}>
                  <div style={styles.chatBubble("assistant")}>🦆 En cours de réflexion…</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                style={{ ...styles.input, flex: 1 }}
                placeholder="Posez votre question à l'agent LuckyDuck…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <button style={styles.btn} onClick={() => sendMessage()}>Envoyer</button>
            </div>
          </div>
        );

      case "rapports":
        return (
          <div>
            <div style={styles.title}>Analyse de rapports 📂</div>
            <div style={styles.subtitle}>Importer un rapport Amazon ou Meta — l'agent l'analyse automatiquement</div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Importer un rapport (CSV ou TXT)</div>
              <div style={{ fontSize: "13px", color: "#6b8aaa", marginBottom: "14px" }}>
                Accepte plusieurs fichiers simultanément — CSV Amazon (Business Report, FBA) et Meta Ads. Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs fichiers.
              </div>
              <input type="file" accept=".csv,.txt,.xlsx" ref={fileInputRef} style={{ display: "none" }} multiple onChange={e => { setRapportFiles(Array.from(e.target.files)); setRapportFile(e.target.files[0] || null); }} />
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button style={styles.btnGhost} onClick={() => fileInputRef.current.click()}>
                  {rapportFiles.length > 1 ? `📄 ${rapportFiles.length} fichiers sélectionnés` : rapportFile ? `📄 ${rapportFile.name}` : "Choisir un ou plusieurs fichiers"}
                </button>
                {(rapportFiles.length > 0 || rapportFile) && <button style={styles.btn} onClick={analyserRapport} disabled={rapportLoading}>{rapportLoading ? "Analyse en cours…" : `Analyser ${rapportFiles.length > 1 ? rapportFiles.length + " fichiers" : "avec l'agent"} 🦆`}</button>}
              </div>
            </div>
            {rapportAnalyse && (
              <div style={{ ...styles.card, marginTop: "16px" }}>
                <div style={styles.cardTitle}>Analyse de l'agent 🦆</div>
                <div style={{ fontSize: "13px", color: "#c8d8e8", lineHeight: "1.7", whiteSpace: "pre-wrap", marginTop: "10px" }}>{rapportAnalyse}</div>
              </div>
            )}
            <div style={{ ...styles.card, marginTop: "16px" }}>
              <div style={styles.cardTitle}>Où trouver les rapports Amazon</div>
              <div style={{ fontSize: "13px", color: "#c8d8e8", lineHeight: "1.8" }}>
                <strong style={{ color: "#f5c842" }}>Business Report (ventes par ASIN) :</strong><br />
                Seller Central → Rapports → Ventes → Ventes par ASIN<br />
                Sélectionner période, exporter CSV<br /><br />
                <strong style={{ color: "#f5c842" }}>Stock FBA :</strong><br />
                Seller Central → Rapports → Réalisation → Inventaire FBA actuel<br /><br />
                <strong style={{ color: "#f5c842" }}>Meta Ads :</strong><br />
                Meta Business Suite → Gestionnaire de publicités → Exporter → CSV
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.app}>
      {/* BARRE MOBILE EN HAUT */}
      <style>{`
        @media (max-width: 767px) {
          .ld-sidebar { display: none !important; }
          .ld-sidebar.open { display: flex !important; position: fixed; top: 52px; left: 0; right: 0; bottom: 0; z-index: 100; width: 100% !important; }
          .ld-topbar { display: flex !important; }
          .ld-main { padding: 16px !important; }
          .ld-grid4 { grid-template-columns: 1fr 1fr !important; }
          .ld-grid2 { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 768px) {
          .ld-topbar { display: none !important; }
          .ld-sidebar { display: flex !important; }
        }
        .ld-topbar { display: none; align-items: center; justify-content: space-between; background: #282252; padding: 0 16px; height: 52px; position: fixed; top: 0; left: 0; right: 0; z-index: 200; border-bottom: 1px solid #1e2a4a; }
        .ld-burger { background: none; border: none; color: #f5c842; font-size: 24px; cursor: pointer; padding: 8px; }
        .ld-mobile-content { padding-top: 52px; flex: 1; overflow: auto; }
        @media (min-width: 768px) { .ld-mobile-content { padding-top: 0; } }
      `}</style>

      {/* TOPBAR MOBILE */}
      <div className="ld-topbar">
        <div style={{ color: "#f5c842", fontWeight: "700", fontSize: "16px" }}>🦆 LuckyDuck</div>
        <div style={{ color: "#aaaadd", fontSize: "12px" }}>{NAV_ITEMS.find(n => n.id === activeSection)?.label}</div>
        <button className="ld-burger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`ld-sidebar${menuOpen ? " open" : ""}`} style={styles.sidebar}>
        <div style={styles.logo}>
          <img
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwLCA1KSBzY2FsZSgwLjU1KSI+CiAgICA8cGF0aCBkPSJNNDAgNjAgUTIwIDYwIDE1IDQ1IFExMCAzMCAyNSAyMCBRMzUgMTIgNTAgMTggTDU1IDE1IFE2NSA4IDc1IDE1IFE4MCAyMCA3NSAyOCBMNzAgMzAgUTc4IDM4IDcyIDUyIFE2NiA2NCA1MCA2NCBaIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogICAgPGNpcmNsZSBjeD0iNjIiIGN5PSIxOCIgcj0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNSIvPgogICAgPHBhdGggZD0iTTcyIDE2IEw4NSAxMyBMODMgMTkgWiIgZmlsbD0iI0Y1QTYyMyIgc3Ryb2tlPSJub25lIi8+CiAgICA8cGF0aCBkPSJNNzIgMjAgTDg1IDIyIEw4MyAxOSBaIiBmaWxsPSIjRjVBNjIzIiBzdHJva2U9Im5vbmUiLz4KICAgIDxsaW5lIHgxPSIzOCIgeTE9IjY0IiB4Mj0iMzgiIHkyPSI3NSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgIDxsaW5lIHgxPSIzOCIgeTE9Ijc1IiB4Mj0iMjgiIHkyPSI3OCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgIDxsaW5lIHgxPSIzOCIgeTE9Ijc1IiB4Mj0iNDgiIHkyPSI3OCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8L2c+CiAgPHRleHQgeD0iNjAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwgQmxhY2ssIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI5MDAiIGZvbnQtc2l6ZT0iMjIiIGZpbGw9IndoaXRlIiBsZXR0ZXItc3BhY2luZz0iMSI+TFVDS1k8dHNwYW4gZmlsbD0iI0Y1QTYyMyI+RFVDSzwvdHNwYW4+PC90ZXh0PgogIDx0ZXh0IHg9IjYwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iNzAwIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiBsZXR0ZXItc3BhY2luZz0iMC41Ij5MRSBDT05GT1JUIERVIERVVkVUIDx0c3BhbiBmaWxsPSIjRjVBNjIzIj5TQU5TPC90c3Bhbj4gUExVTUUgQU5JTUFMRTwvdGV4dD4KPC9zdmc+"
            alt="LuckyDuck"
            style={{ width: "210px", display: "block" }}
          />
          <div style={{ fontSize: "11px", color: "#8888cc", marginTop: "6px" }}>Agent Amazon + Meta Ads</div>
        </div>
        <nav style={styles.nav}>
          {NAV_ITEMS.map(item => (
            <div key={item.id} style={styles.navItem(activeSection === item.id)} onClick={() => { setActiveSection(item.id); setMenuOpen(false); }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e2a4a", background: "#282252", fontSize: "11px", color: "#8888cc" }}>
          agent-luckyduck.vercel.app<br />Juin 2026
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="ld-mobile-content" style={{ flex: 1, overflow: "auto" }}>
        <main className="ld-main" style={styles.main}>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
