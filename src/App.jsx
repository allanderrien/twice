import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   TWICE v2.1 — Digital Twin Risk Assessment
   FM Global — Centenarian Event Sandbox
   NEW: DAG-based infra→infra dependency resolution (Kahn's algo)
   ═══════════════════════════════════════════════════════════════ */

// ── i18n ────────────────────────────────────────────────────────
const DICT = {
  FR: {
    title: "TWICE v2.2", subtitle: "Bac à sable — Événements Centenaires",
    chooseContext: "Choisissez le contexte de votre jumeau",
    contextLabel: "Contexte", contextChange: "Changer de contexte",
    contextWarning: "Changer de contexte réinitialisera les scénarios et peut modifier les seuils par défaut. Les assets existants sont conservés.",
    contextChanged: "Contexte mis à jour :",
    ctx_mountain: "Montagne", ctx_plain: "Plaine continentale", ctx_coastal: "Côtier",
    ctx_mixed: "Mixte", ctx_urban: "Urbain dense",
    ctx_mountain_desc: "Risques neige, avalanche, grand froid, tempête alpine",
    ctx_plain_desc: "Risques canicule, grêle, orage, gel tardif",
    ctx_coastal_desc: "Risques tempête maritime, submersion, houle, sel",
    ctx_mixed_desc: "Combinaison de risques multi-terrain",
    ctx_urban_desc: "Risques inondation rapide, îlot de chaleur, surcharge réseau",
    createTwin: "Créer le jumeau",
    tabs: ["Assets", "Scénarios", "Résultats", "Sauvegardes"],
    addAsset: "Cliquer sur la carte pour ajouter un asset",
    assetName: "Nom de l'asset", assetType: "Type", caJour: "CA Journalier (EUR)",
    sector: "Secteur géographique", save: "Enregistrer", cancel: "Annuler",
    deleteAsset: "Supprimer", editAsset: "Modifier",
    infra: "Infrastructure critique", revenue: "Asset de revenu", support: "Support",
    linkMode: "Mode Liaison", linkModeOff: "Quitter Liaison",
    linkHint: "Cliquez sur deux assets pour les relier",
    weight: "Poids dépendance",
    scenarioLib: "Bibliothèque de scénarios",
    runSimulation: "Lancer la simulation",
    wind: "Vent max (km/h)", snow: "Neige (cm/h)", temp: "Température (°C)", duration: "Durée (h)",
    returnPeriod: "Période de retour",
    totalLoss: "Perte totale estimée", assetsImpacted: "Assets impactés", assetsStopped: "Assets arrêtés",
    activityRate: "Taux d'activité", accessibility: "Accessibilité", hourlyLoss: "Perte horaire",
    cumulLoss: "Pertes cumulées dans le temps",
    saveTwin: "Sauvegarder le jumeau", twinName: "Nom du jumeau",
    myTwins: "Mes Jumeaux", load: "Charger", rename: "Renommer", duplicate: "Dupliquer", deleteTwin: "Supprimer",
    exportJSON: "Exporter JSON", importJSON: "Importer JSON",
    noTwin: "Aucun jumeau sauvegardé",
    noAssets: "Aucun asset — cliquez sur la carte pour commencer",
    noResults: "Lancez une simulation pour voir les résultats",
    lastSim: "Dernière simulation :",
    simHistory: "Historique des simulations",
    open: "Ouvert", reduced: "Réduit", closed: "Fermé",
    lang: "Langue", exportPDF: "Exporter PDF",
    twinLoaded: "Jumeau chargé :", unsavedChanges: "Modifications non sauvegardées",
    deleteConfirm: "Supprimer définitivement ?", yes: "Oui", no: "Non",
    editTwin: "Modifier le jumeau", newTwin: "Nouveau jumeau", clearAll: "Tout effacer",
    infrastructures: "Infrastructures", revenue_assets: "Assets de revenu", by: "par",
    infraDeps: "Dépendances infra→infra",
    infraDepsHint: "Cette infrastructure dépend de :",
    cycleError: "⚠ Cycle détecté — liaison impossible (boucle infinie)",
    cycleWarning: "Cycle détecté dans les dépendances infra. Simulation annulée.",
    resolveOrder: "Ordre de résolution",
    infraStatus: "Statut des infrastructures",
    directImpact: "Impact météo direct",
    inheritedImpact: "Impact hérité",
  },
  EN: {
    title: "TWICE v2.2", subtitle: "Sandbox — Centenarian Events",
    chooseContext: "Choose your twin's context",
    contextLabel: "Context", contextChange: "Change context",
    contextWarning: "Changing context will reset scenarios and may alter default thresholds. Existing assets are preserved.",
    contextChanged: "Context updated:",
    ctx_mountain: "Mountain", ctx_plain: "Continental plain", ctx_coastal: "Coastal",
    ctx_mixed: "Mixed", ctx_urban: "Dense urban",
    ctx_mountain_desc: "Snow, avalanche, extreme cold, alpine storm risks",
    ctx_plain_desc: "Heatwave, hail, storm, late frost risks",
    ctx_coastal_desc: "Maritime storm, submersion, swell, salt spray risks",
    ctx_mixed_desc: "Combination of multi-terrain risks",
    ctx_urban_desc: "Flash flood, heat island, grid overload risks",
    createTwin: "Create twin",
    tabs: ["Assets", "Scenarios", "Results", "Saves"],
    addAsset: "Click on map to add an asset",
    assetName: "Asset name", assetType: "Type", caJour: "Daily Revenue (EUR)",
    sector: "Geographic sector", save: "Save", cancel: "Cancel",
    deleteAsset: "Delete", editAsset: "Edit",
    infra: "Critical infrastructure", revenue: "Revenue asset", support: "Support",
    linkMode: "Link Mode", linkModeOff: "Exit Link Mode",
    linkHint: "Click two assets to link them",
    weight: "Dependency weight",
    scenarioLib: "Scenario Library", runSimulation: "Run Simulation",
    wind: "Max wind (km/h)", snow: "Snow (cm/h)", temp: "Temperature (°C)", duration: "Duration (h)",
    returnPeriod: "Return period",
    totalLoss: "Estimated total loss", assetsImpacted: "Assets impacted", assetsStopped: "Assets stopped",
    activityRate: "Activity rate", accessibility: "Accessibility", hourlyLoss: "Hourly loss",
    cumulLoss: "Cumulative losses over time",
    saveTwin: "Save Twin", twinName: "Twin name",
    myTwins: "My Twins", load: "Load", rename: "Rename", duplicate: "Duplicate", deleteTwin: "Delete",
    exportJSON: "Export JSON", importJSON: "Import JSON",
    noTwin: "No saved twins", noAssets: "No assets — click on the map to start",
    noResults: "Run a simulation to see results",
    lastSim: "Last simulation:", simHistory: "Simulation history",
    open: "Open", reduced: "Reduced", closed: "Closed",
    lang: "Language", exportPDF: "Export PDF",
    twinLoaded: "Twin loaded:", unsavedChanges: "Unsaved changes",
    deleteConfirm: "Permanently delete?", yes: "Yes", no: "No",
    editTwin: "Edit twin", newTwin: "New twin", clearAll: "Clear all",
    infrastructures: "Infrastructures", revenue_assets: "Revenue assets", by: "per",
    infraDeps: "Infra→infra dependencies",
    infraDepsHint: "This infrastructure depends on:",
    cycleError: "⚠ Cycle detected — link impossible (infinite loop)",
    cycleWarning: "Cycle detected in infra dependencies. Simulation aborted.",
    resolveOrder: "Resolution order",
    infraStatus: "Infrastructure status",
    directImpact: "Direct weather impact",
    inheritedImpact: "Inherited impact",
  },
  DE: {
    title: "TWICE v2.2", subtitle: "Sandbox — Zentenarische Ereignisse",
    chooseContext: "Kontext Ihres Zwillings wählen",
    contextLabel: "Kontext", contextChange: "Kontext ändern",
    contextWarning: "Kontextwechsel setzt Szenarien zurück und kann Standardschwellen ändern. Bestehende Assets bleiben erhalten.",
    contextChanged: "Kontext aktualisiert:",
    ctx_mountain: "Gebirge", ctx_plain: "Kontinentalebene", ctx_coastal: "Küste",
    ctx_mixed: "Gemischt", ctx_urban: "Dichtes Stadtgebiet",
    ctx_mountain_desc: "Schnee, Lawine, extreme Kälte, Alpinsturm",
    ctx_plain_desc: "Hitzewelle, Hagel, Gewitter, Spätfrost",
    ctx_coastal_desc: "Seesturm, Überflutung, Wellengang, Salz",
    ctx_mixed_desc: "Kombination von Multigelände-Risiken",
    ctx_urban_desc: "Sturzflut, Wärmeinsel, Netzüberlastung",
    createTwin: "Zwilling erstellen",
    tabs: ["Assets", "Szenarien", "Ergebnisse", "Speicher"],
    addAsset: "Karte anklicken, um Asset hinzuzufügen",
    assetName: "Asset-Name", assetType: "Typ", caJour: "Tagesumsatz (EUR)",
    sector: "Geografischer Sektor", save: "Speichern", cancel: "Abbrechen",
    deleteAsset: "Löschen", editAsset: "Bearbeiten",
    infra: "Kritische Infrastruktur", revenue: "Umsatz-Asset", support: "Support",
    linkMode: "Verknüpfungsmodus", linkModeOff: "Modus beenden",
    linkHint: "Klicken Sie auf zwei Assets, um sie zu verknüpfen",
    weight: "Abhängigkeitsgewicht",
    scenarioLib: "Szenariobibliothek", runSimulation: "Simulation starten",
    wind: "Max. Wind (km/h)", snow: "Schnee (cm/h)", temp: "Temperatur (°C)", duration: "Dauer (h)",
    returnPeriod: "Wiederkehrperiode",
    totalLoss: "Geschätzter Gesamtverlust", assetsImpacted: "Betroffene Assets", assetsStopped: "Gestoppte Assets",
    activityRate: "Aktivitätsrate", accessibility: "Zugänglichkeit", hourlyLoss: "Stündlicher Verlust",
    cumulLoss: "Kumulierte Verluste",
    saveTwin: "Zwilling speichern", twinName: "Name des Zwillings",
    myTwins: "Meine Zwillinge", load: "Laden", rename: "Umbenennen", duplicate: "Duplizieren", deleteTwin: "Löschen",
    exportJSON: "JSON exportieren", importJSON: "JSON importieren",
    noTwin: "Keine gespeicherten Zwillinge", noAssets: "Keine Assets — Karte anklicken",
    noResults: "Simulation starten für Ergebnisse",
    lastSim: "Letzte Simulation:", simHistory: "Simulationshistorie",
    open: "Offen", reduced: "Reduziert", closed: "Geschlossen",
    lang: "Sprache", exportPDF: "PDF exportieren",
    twinLoaded: "Zwilling geladen:", unsavedChanges: "Ungespeicherte Änderungen",
    deleteConfirm: "Endgültig löschen?", yes: "Ja", no: "Nein",
    editTwin: "Zwilling bearbeiten", newTwin: "Neuer Zwilling", clearAll: "Alles löschen",
    infrastructures: "Infrastrukturen", revenue_assets: "Umsatz-Assets", by: "pro",
    infraDeps: "Infra→Infra-Abhängigkeiten",
    infraDepsHint: "Diese Infrastruktur hängt ab von:",
    cycleError: "⚠ Zyklus erkannt — Verknüpfung unmöglich",
    cycleWarning: "Zyklus in Infra-Abhängigkeiten erkannt. Simulation abgebrochen.",
    resolveOrder: "Auflösungsreihenfolge",
    infraStatus: "Infrastrukturstatus",
    directImpact: "Direkter Wettereinfluss",
    inheritedImpact: "Geerbter Einfluss",
  },
  LB: {
    title: "TWICE v2.2", subtitle: "Sandbox — Zentenäresch Eventer",
    chooseContext: "Kontext vum Zwilling wielen",
    contextLabel: "Kontext", contextChange: "Kontext änneren",
    contextWarning: "Kontextwiessel setzt Scenarien zréck a kann Standardschwellen änneren. Bestoend Assets bleiwen erhalen.",
    contextChanged: "Kontext aktualiséiert:",
    ctx_mountain: "Bierg", ctx_plain: "Kontinentale Ebene", ctx_coastal: "Küst",
    ctx_mixed: "Gemëscht", ctx_urban: "Dicht urban",
    ctx_mountain_desc: "Schnéi, Lawinn, extrem Käll, Alpin-Stuerm",
    ctx_plain_desc: "Hëtzwell, Héilecht, Gewitter, spéide Frost",
    ctx_coastal_desc: "Miersstuerm, Iwwerschwemmung, Wellen, Salz",
    ctx_mixed_desc: "Kombinatioun vu Multi-Terrain-Risiken",
    ctx_urban_desc: "Sturzflut, Wärmeinsel, Netziwwerlaaschung",
    createTwin: "Zwilling erstellen",
    tabs: ["Assets", "Scenarien", "Resultater", "Späicherung"],
    addAsset: "Kaart uklicken fir Asset derbäi",
    assetName: "Asset Numm", assetType: "Typ", caJour: "Deeglechen Ëmsaz (EUR)",
    sector: "Geografesch Regioun", save: "Späicheren", cancel: "Ofbriechen",
    deleteAsset: "Läschen", editAsset: "Änneren",
    infra: "Kritesch Infrastruktur", revenue: "Ëmsaz-Asset", support: "Support",
    linkMode: "Verknüpfungsmodus", linkModeOff: "Modus verloossen",
    linkHint: "Zwee Assets uklicken fir ze verbannen",
    weight: "Ofhängegkeetsgewiicht",
    scenarioLib: "Szenario-Bibliothéik", runSimulation: "Simulatioun starten",
    wind: "Max Wand (km/h)", snow: "Schnéi (cm/h)", temp: "Temperatur (°C)", duration: "Dauer (h)",
    returnPeriod: "Rückkéierperiod",
    totalLoss: "Geschate Gesamtverlust", assetsImpacted: "Betraffe Assets", assetsStopped: "Gestoppte Assets",
    activityRate: "Aktivitéitsquot", accessibility: "Accessibilitéit", hourlyLoss: "Stënnleche Verlust",
    cumulLoss: "Kumuléiert Verloschter",
    saveTwin: "Zwilling späicheren", twinName: "Zwillingsnumm",
    myTwins: "Meng Zwillinger", load: "Lueden", rename: "Ëmbenennen", duplicate: "Duplizéieren", deleteTwin: "Läschen",
    exportJSON: "JSON exportéieren", importJSON: "JSON importéieren",
    noTwin: "Keng gespäichert Zwillinger", noAssets: "Keng Assets — Kaart uklicken",
    noResults: "Simulatioun starten fir Resultater",
    lastSim: "Lescht Simulatioun:", simHistory: "Simulatiounsgeschicht",
    open: "Op", reduced: "Reduzéiert", closed: "Zou",
    lang: "Sprooch", exportPDF: "PDF exportéieren",
    twinLoaded: "Zwilling gelueden:", unsavedChanges: "Net gespäichert Ännerungen",
    deleteConfirm: "Definitiv läschen?", yes: "Jo", no: "Neen",
    editTwin: "Zwilling änneren", newTwin: "Neie Zwilling", clearAll: "Alles läschen",
    infrastructures: "Infrastrukturen", revenue_assets: "Ëmsaz-Assets", by: "pro",
    infraDeps: "Infra→Infra Ofhängegkeeten",
    infraDepsHint: "Dës Infrastruktur hänkt of vun:",
    cycleError: "⚠ Zyklus erkannt — Verknüpfung onméiglech",
    cycleWarning: "Zyklus erkannt. Simulatioun ofgebrach.",
    resolveOrder: "Opléisungsreihenfolg",
    infraStatus: "Infrastrukturstatut",
    directImpact: "Direkt Wiederimpakt",
    inheritedImpact: "Geierfte Impakt",
  },
};

// ═══════════════════════════════════════════════════════════════
// CONTEXTS — v2.2
// Each context defines: id, icon, default map center, scenario ids,
// and a custom calcIndiceAlea function override
// ═══════════════════════════════════════════════════════════════
const CONTEXTS = {
  mountain: {
    id: "mountain",
    icon: "⛰️",
    color: "#60a5fa",
    defaultCenter: [45.448, 6.985], // Tarentaise
    defaultZoom: 13,
    scenarioIds: ["s1", "s2", "s3", "s4", "custom"],
    calcIndice: ({ vent, neige, temp }) => {
      let idx = Math.max(vent / 80, neige / 20);
      if (temp < -15) idx += 0.2;
      return Math.min(idx, 2.0);
    },
    paramLabels: { vent: true, neige: true, temp: true, duree: true },
    paramRanges: { vent: [0, 200], neige: [0, 100], temp: [-40, 20], duree: [1, 168] },
  },
  plain: {
    id: "plain",
    icon: "🌾",
    color: "#f59e0b",
    defaultCenter: [48.856, 2.352], // Paris basin
    defaultZoom: 10,
    scenarioIds: ["p1", "p2", "p3", "p4", "custom"],
    calcIndice: ({ vent, neige, temp, pluie = 0 }) => {
      let idx = Math.max(vent / 100, pluie / 50);
      if (temp > 35) idx += 0.25;
      if (temp < -5 && neige > 0) idx += 0.15;
      return Math.min(idx, 2.0);
    },
    paramLabels: { vent: true, neige: true, temp: true, pluie: true, duree: true },
    paramRanges: { vent: [0, 180], neige: [0, 50], temp: [-20, 45], pluie: [0, 120], duree: [1, 168] },
  },
  coastal: {
    id: "coastal",
    icon: "🌊",
    color: "#06b6d4",
    defaultCenter: [47.218, -1.553], // Nantes / Loire-Atlantique
    defaultZoom: 11,
    scenarioIds: ["c1", "c2", "c3", "c4", "custom"],
    calcIndice: ({ vent, houle = 0, surge = 0, temp }) => {
      let idx = Math.max(vent / 90, houle / 8, surge / 3);
      if (temp < 0) idx += 0.1;
      return Math.min(idx, 2.0);
    },
    paramLabels: { vent: true, houle: true, surge: true, temp: true, duree: true },
    paramRanges: { vent: [0, 200], houle: [0, 15], surge: [0, 5], temp: [-10, 25], duree: [1, 120] },
  },
  mixed: {
    id: "mixed",
    icon: "🗺️",
    color: "#a78bfa",
    defaultCenter: [45.0, 4.5], // Rhône valley
    defaultZoom: 10,
    scenarioIds: ["s1", "s2", "p1", "p2", "c1", "custom"],
    calcIndice: ({ vent, neige, temp, pluie = 0, houle = 0 }) => {
      let idx = Math.max(vent / 90, neige / 20, pluie / 60, houle / 8);
      if (temp < -10) idx += 0.15;
      if (temp > 35) idx += 0.15;
      return Math.min(idx, 2.0);
    },
    paramLabels: { vent: true, neige: true, temp: true, pluie: true, duree: true },
    paramRanges: { vent: [0, 200], neige: [0, 80], temp: [-30, 45], pluie: [0, 120], duree: [1, 168] },
  },
  urban: {
    id: "urban",
    icon: "🏙️",
    color: "#f97316",
    defaultCenter: [48.856, 2.352], // Paris
    defaultZoom: 13,
    scenarioIds: ["u1", "u2", "u3", "u4", "custom"],
    calcIndice: ({ vent, pluie = 0, temp, humidite = 60 }) => {
      let idx = Math.max(vent / 120, pluie / 40);
      if (temp > 38) idx += 0.3;
      if (temp > 38 && humidite > 60) idx += 0.1;
      return Math.min(idx, 2.0);
    },
    paramLabels: { vent: true, pluie: true, temp: true, humidite: true, duree: true },
    paramRanges: { vent: [0, 150], pluie: [0, 100], temp: [-10, 50], humidite: [20, 100], duree: [1, 96] },
  },
};

// ── Predefined Scenarios ────────────────────────────────────────
const SCENARIOS = [
  {
    id: "s1", icon: "⛰️",
    name: { FR: "Tempête centennale alpine", EN: "Alpine Centennial Storm", DE: "Alpines Jahrhundertsturm", LB: "Alpin Joerhonnertstuerm" },
    period: "1/100 ans",
    desc: { FR: "Vent 110 km/h, neige 30 cm/h, 48h — événement de référence IPCC.", EN: "Wind 110 km/h, snow 30 cm/h, 48h — IPCC reference event.", DE: "Wind 110 km/h, Schnee 30 cm/h, 48h — IPCC-Referenzereignis.", LB: "Wand 110 km/h, Schnéi 30 cm/h, 48h." },
    params: { vent: 110, neige: 30, temp: -12, duree: 48 },
  },
  {
    id: "s2", icon: "🌨️",
    name: { FR: "Blizzard exceptionnel", EN: "Exceptional Blizzard", DE: "Außergewöhnlicher Blizzard", LB: "Aussergewéinleche Blizzard" },
    period: "1/100 ans",
    desc: { FR: "Vent 60 km/h, neige 45 cm/h, 72h — accumulation record.", EN: "Wind 60 km/h, snow 45 cm/h, 72h — record accumulation.", DE: "Wind 60 km/h, Schnee 45 cm/h, 72h.", LB: "Wand 60 km/h, Schnéi 45 cm/h, 72h." },
    params: { vent: 60, neige: 45, temp: -8, duree: 72 },
  },
  {
    id: "s3", icon: "🥶",
    name: { FR: "Vague de froid extrême", EN: "Extreme Cold Wave", DE: "Extreme Kältewelle", LB: "Extrem Källewell" },
    period: "1/100 ans",
    desc: { FR: "Vent 40 km/h, -28°C, 96h — paralysie des équipements.", EN: "Wind 40 km/h, -28°C, 96h — equipment freeze.", DE: "Wind 40 km/h, -28°C, 96h — Geräteausfall.", LB: "Wand 40 km/h, -28°C, 96h." },
    params: { vent: 40, neige: 5, temp: -28, duree: 96 },
  },
  {
    id: "s4", icon: "🌡️",
    name: { FR: "Redoux catastrophique", EN: "Catastrophic Thaw", DE: "Katastrophaler Tauwetter", LB: "Katastrophale Daut" },
    period: "1/100 ans",
    desc: { FR: "Vent 20 km/h, +12°C, 48h — fonte brutale, risque avalanche.", EN: "Wind 20 km/h, +12°C, 48h — brutal melt, avalanche risk.", DE: "Wind 20 km/h, +12°C, 48h — Lawinengefahr.", LB: "Wand 20 km/h, +12°C, 48h." },
    params: { vent: 20, neige: 0, temp: 12, duree: 48 },
  },
  {
    id: "custom", icon: "⚙️",
    name: { FR: "Scénario personnalisé", EN: "Custom Scenario", DE: "Benutzerdefiniert", LB: "Personaliséiert" },
    period: "—",
    desc: { FR: "Définissez vos propres paramètres.", EN: "Define your own parameters.", DE: "Eigene Parameter.", LB: "Eege Parameteren." },
    params: { vent: 80, neige: 20, temp: -10, duree: 48 },
  },
  // ── PLAIN scenarios ──────────────────────────────────────────
  {
    id: "p1", icon: "🌡️", contexts: ["plain", "mixed"],
    name: { FR: "Canicule centennale", EN: "Centennial Heatwave", DE: "Jahrhunderthitzewelle", LB: "Joerhonnertkäschtswell" },
    period: "1/100 ans",
    desc: { FR: "Vent 20 km/h, 44°C, pluie 0, 120h — vague de chaleur record.", EN: "Wind 20 km/h, 44°C, 0 rain, 120h — record heat event.", DE: "Wind 20 km/h, 44°C, 0 Regen, 120h.", LB: "Wand 20 km/h, 44°C, 0 Reen, 120h." },
    params: { vent: 20, neige: 0, temp: 44, pluie: 0, duree: 120 },
  },
  {
    id: "p2", icon: "⛈️", contexts: ["plain", "mixed"],
    name: { FR: "Orage de grêle exceptionnel", EN: "Exceptional Hailstorm", DE: "Außergewöhnlicher Hagelsturm", LB: "Aussergewéinleche Gréschtestuerm" },
    period: "1/100 ans",
    desc: { FR: "Vent 90 km/h, pluie 80 mm/h, grêle 5 cm, 8h — destruction cultures et toitures.", EN: "Wind 90 km/h, rain 80 mm/h, 5 cm hail, 8h.", DE: "Wind 90 km/h, Regen 80 mm/h, 5 cm Hagel, 8h.", LB: "Wand 90 km/h, 80 mm/h Reen, 8h." },
    params: { vent: 90, neige: 0, temp: 22, pluie: 80, duree: 8 },
  },
  {
    id: "p3", icon: "🌬️", contexts: ["plain", "mixed"],
    name: { FR: "Tempête hivernale centennale", EN: "Centennial Winter Storm", DE: "Jahrhundertwintersturm", LB: "Joerhonnert-Wanterstuerm" },
    period: "1/100 ans",
    desc: { FR: "Vent 130 km/h, -8°C, pluie verglacée 20 mm/h, 36h.", EN: "Wind 130 km/h, -8°C, ice rain 20 mm/h, 36h.", DE: "Wind 130 km/h, -8°C, Eisregen, 36h.", LB: "Wand 130 km/h, -8°C, Äisreen, 36h." },
    params: { vent: 130, neige: 15, temp: -8, pluie: 20, duree: 36 },
  },
  {
    id: "p4", icon: "❄️", contexts: ["plain", "mixed"],
    name: { FR: "Gel tardif catastrophique", EN: "Catastrophic Late Frost", DE: "Katastrophaler Spätfrost", LB: "Katastrophale spéide Frost" },
    period: "1/100 ans",
    desc: { FR: "Vent 10 km/h, -14°C, 72h après dégel — rupture canalisations, pertes agricoles.", EN: "Wind 10 km/h, -14°C, 72h after thaw — pipes, crop losses.", DE: "Wind 10 km/h, -14°C, 72h nach Tauwetter.", LB: "Wand 10 km/h, -14°C, 72h." },
    params: { vent: 10, neige: 5, temp: -14, pluie: 0, duree: 72 },
  },
  // ── COASTAL scenarios ────────────────────────────────────────
  {
    id: "c1", icon: "🌀", contexts: ["coastal", "mixed"],
    name: { FR: "Tempête maritime centennale", EN: "Centennial Maritime Storm", DE: "Jahrhundertseesturm", LB: "Joerhonnert-Miersstuerm" },
    period: "1/100 ans",
    desc: { FR: "Vent 150 km/h, houle 12 m, surcote 2.5 m, 48h — submersion côtière majeure.", EN: "Wind 150 km/h, 12 m swell, 2.5 m surge, 48h.", DE: "Wind 150 km/h, 12 m Wellen, 2.5 m Sturmflut, 48h.", LB: "Wand 150 km/h, 12 m Well, 2.5 m Stuermflut, 48h." },
    params: { vent: 150, houle: 12, surge: 2.5, temp: 8, duree: 48 },
  },
  {
    id: "c2", icon: "🌊", contexts: ["coastal", "mixed"],
    name: { FR: "Submersion marine exceptionnelle", EN: "Exceptional Coastal Submersion", DE: "Außergewöhnliche Küstenüberschwemmung", LB: "Aussergewéinlech Küsteniwwerschwemmung" },
    period: "1/100 ans",
    desc: { FR: "Vent 80 km/h, houle 6 m, surcote 4 m, 24h — inondation des zones basses.", EN: "Wind 80 km/h, 6 m swell, 4 m surge, 24h — flooding low areas.", DE: "Wind 80 km/h, 6 m Wellen, 4 m Sturmflut, 24h.", LB: "Wand 80 km/h, 6 m Well, 4 m Stuermflut, 24h." },
    params: { vent: 80, houle: 6, surge: 4, temp: 12, duree: 24 },
  },
  {
    id: "c3", icon: "🧊", contexts: ["coastal"],
    name: { FR: "Tempête hivernale côtière", EN: "Coastal Winter Storm", DE: "Küstenwintertsurm", LB: "Küst-Wanterstuerm" },
    period: "1/100 ans",
    desc: { FR: "Vent 120 km/h, houle 9 m, -4°C, embruns givreux, 60h.", EN: "Wind 120 km/h, 9 m swell, -4°C, freezing spray, 60h.", DE: "Wind 120 km/h, 9 m Wellen, -4°C, 60h.", LB: "Wand 120 km/h, 9 m Well, -4°C, 60h." },
    params: { vent: 120, houle: 9, surge: 1.5, temp: -4, duree: 60 },
  },
  {
    id: "c4", icon: "☀️", contexts: ["coastal"],
    name: { FR: "Canicule maritime et recul du trait de côte", EN: "Maritime Heatwave & Shoreline Retreat", DE: "Meereshitzewelle", LB: "Mieres-Käschtswell" },
    period: "1/100 ans",
    desc: { FR: "Vent 15 km/h, 38°C, houle 3 m, 96h — effets corrosion et dessèchement.", EN: "Wind 15 km/h, 38°C, 3 m swell, 96h — corrosion & drying.", DE: "Wind 15 km/h, 38°C, 3 m Wellen, 96h.", LB: "Wand 15 km/h, 38°C, 3 m Well, 96h." },
    params: { vent: 15, houle: 3, surge: 0.5, temp: 38, duree: 96 },
  },
  // ── URBAN scenarios ──────────────────────────────────────────
  {
    id: "u1", icon: "🌧️", contexts: ["urban"],
    name: { FR: "Inondation urbaine soudaine", EN: "Sudden Urban Flood", DE: "Plötzliche Stadtüberschwemmung", LB: "Plötzlech Stadtiwwerschwemmung" },
    period: "1/100 ans",
    desc: { FR: "Vent 60 km/h, pluie 80 mm/h, 6h — saturation réseaux, tunnels, sous-sols.", EN: "Wind 60 km/h, 80 mm/h rain, 6h — sewer overflow, tunnels.", DE: "Wind 60 km/h, 80 mm/h Regen, 6h.", LB: "Wand 60 km/h, 80 mm/h Reen, 6h." },
    params: { vent: 60, pluie: 80, temp: 20, humidite: 95, duree: 6 },
  },
  {
    id: "u2", icon: "🔥", contexts: ["urban"],
    name: { FR: "Canicule urbaine extrême", EN: "Extreme Urban Heatwave", DE: "Extreme Stadthitzewelle", LB: "Extrem urban Käschtswell" },
    period: "1/100 ans",
    desc: { FR: "Vent 10 km/h, 42°C, humidité 70%, 144h — surcharge réseau électrique, hospitalisations.", EN: "Wind 10 km/h, 42°C, 70% humidity, 144h — grid overload.", DE: "Wind 10 km/h, 42°C, 70% Luftfeuchtigkeit, 144h.", LB: "Wand 10 km/h, 42°C, 70% Feuchtegkeet, 144h." },
    params: { vent: 10, pluie: 0, temp: 42, humidite: 70, duree: 144 },
  },
  {
    id: "u3", icon: "❄️", contexts: ["urban"],
    name: { FR: "Blizzard urbain paralysant", EN: "Paralyzing Urban Blizzard", DE: "Lähmender Stadtblizzard", LB: "Lähmt Stadtblizzard" },
    period: "1/100 ans",
    desc: { FR: "Vent 80 km/h, pluie verglacée 10 mm/h, -10°C, 48h — paralysie transport.", EN: "Wind 80 km/h, ice rain 10 mm/h, -10°C, 48h — transport failure.", DE: "Wind 80 km/h, -10°C, Eisregen, 48h.", LB: "Wand 80 km/h, -10°C, Äisreen, 48h." },
    params: { vent: 80, pluie: 10, temp: -10, humidite: 85, duree: 48 },
  },
  {
    id: "u4", icon: "⛈️", contexts: ["urban"],
    name: { FR: "Tempête convective urbaine", EN: "Urban Convective Storm", DE: "Urbaner Konvektivsturm", LB: "Urban konvektive Stuerm" },
    period: "1/100 ans",
    desc: { FR: "Vent 110 km/h, pluie 60 mm/h, grêle, 4h — dégâts toitures, coupures.", EN: "Wind 110 km/h, 60 mm/h rain, hail, 4h — roof damage, outages.", DE: "Wind 110 km/h, 60 mm/h Regen, Hagel, 4h.", LB: "Wand 110 km/h, 60 mm/h Reen, 4h." },
    params: { vent: 110, pluie: 60, temp: 28, humidite: 80, duree: 4 },
  },
];

// ═══════════════════════════════════════════════════════════════
// DAG ENGINE — Kahn's topological sort + cycle detection
// ═══════════════════════════════════════════════════════════════

/**
 * topoSort(infrastructures)
 * Returns { order: [id, ...], hasCycle: bool }
 * 
 * Each infra can have: infra_dependances: [{ infrastructure_id, poids }]
 * Edge direction: A depends on B → B must be resolved before A
 * In Kahn's algo: edge B→A (B is a prerequisite of A)
 */
function topoSort(infrastructures) {
  const ids = infrastructures.map(i => i.id);
  // Build adjacency: prereq → [dependents]
  const adj = {};      // adj[prereqId] = [dependentId, ...]
  const inDegree = {}; // inDegree[id] = number of prerequisites
  ids.forEach(id => { adj[id] = []; inDegree[id] = 0; });

  infrastructures.forEach(inf => {
    (inf.infra_dependances || []).forEach(dep => {
      const prereq = dep.infrastructure_id;
      if (!adj[prereq]) return; // unknown id, skip
      adj[prereq].push(inf.id);
      inDegree[inf.id] = (inDegree[inf.id] || 0) + 1;
    });
  });

  // Queue: all nodes with no prerequisites
  const queue = ids.filter(id => inDegree[id] === 0);
  const order = [];

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    (adj[node] || []).forEach(dependent => {
      inDegree[dependent]--;
      if (inDegree[dependent] === 0) queue.push(dependent);
    });
  }

  const hasCycle = order.length !== ids.length;
  return { order, hasCycle };
}

/**
 * wouldCreateCycle(infrastructures, fromId, toId)
 * Check if adding edge fromId→toId (fromId depends on toId) would create a cycle.
 * We do a DFS from toId following existing dep edges; if we reach fromId, cycle.
 */
function wouldCreateCycle(infrastructures, fromId, toId) {
  // Build reachability from toId following "depends on" edges
  // i.e. follow infra_dependances chains from toId
  const visited = new Set();
  const stack = [toId];
  while (stack.length > 0) {
    const cur = stack.pop();
    if (cur === fromId) return true;
    if (visited.has(cur)) continue;
    visited.add(cur);
    const inf = infrastructures.find(i => i.id === cur);
    if (!inf) continue;
    (inf.infra_dependances || []).forEach(d => stack.push(d.infrastructure_id));
  }
  return false;
}

// ── Calculation Engine ──────────────────────────────────────────
// Context-aware: delegates to CONTEXTS[context].calcIndice, fallback to mountain
function calcIndiceAlea(params, context = "mountain") {
  const ctx = CONTEXTS[context] || CONTEXTS.mountain;
  return ctx.calcIndice(params);
}

function infraStatusFromIndice(indice, seuil_impact = 0.45, seuil_fermeture = 0.75) {
  if (indice >= seuil_fermeture) return "closed";
  if (indice >= seuil_impact) return "reduced";
  return "open";
}

function statusValue(status) {
  if (status === "open") return 1.0;
  if (status === "reduced") return 0.5;
  return 0.0;
}

function statusFromValue(val) {
  if (val >= 0.75) return "open";
  if (val >= 0.35) return "reduced";
  return "closed";
}

/**
 * resolveInfraStatuses(infrastructures, indice)
 * 
 * 1. Topological sort (Kahn)
 * 2. For each infra in topo order:
 *    - Compute direct weather status
 *    - If it has infra_dependances, compute inherited status
 *      (weighted avg of parent statuses)
 *    - Final status = worst of direct + inherited
 * 
 * Returns { statusMap, resolveOrder, hasCycle }
 * statusMap: { id → { status, directStatus, inheritedStatus, source } }
 */
function resolveInfraStatuses(infrastructures, indice) {
  const { order, hasCycle } = topoSort(infrastructures);
  if (hasCycle) return { statusMap: {}, resolveOrder: [], hasCycle: true };

  const statusMap = {}; // id → { status, directStatus, inheritedStatus }

  order.forEach(id => {
    const inf = infrastructures.find(i => i.id === id);
    if (!inf) return;

    // Direct weather impact
    const directStatus = infraStatusFromIndice(indice, inf.seuil_impact, inf.seuil_fermeture);
    const directVal = statusValue(directStatus);

    // Inherited from parent infras
    const deps = inf.infra_dependances || [];
    let inheritedVal = 1.0; // default: no penalty from parents
    let inheritedStatus = "open";

    if (deps.length > 0) {
      let totalWeight = 0, weightedVal = 0;
      deps.forEach(dep => {
        const parent = statusMap[dep.infrastructure_id];
        if (parent) {
          const w = dep.poids || 1;
          weightedVal += statusValue(parent.status) * w;
          totalWeight += w;
        }
      });
      if (totalWeight > 0) {
        inheritedVal = weightedVal / totalWeight;
        inheritedStatus = statusFromValue(inheritedVal);
      }
    }

    // Final = worst of direct and inherited
    const finalVal = Math.min(directVal, inheritedVal);
    const finalStatus = statusFromValue(finalVal);

    statusMap[id] = {
      status: finalStatus,
      directStatus,
      inheritedStatus: deps.length > 0 ? inheritedStatus : null,
      hasDeps: deps.length > 0,
    };
  });

  return { statusMap, resolveOrder: order, hasCycle: false };
}

function runSimulation(twin, params) {
  const { vent, neige, temp, duree } = params;
  const context = twin.context || "mountain";
  const indice = calcIndiceAlea(params, context);
  const assets = twin.assets || [];
  const infrastructures = twin.infrastructures || [];

  // Resolve infra statuses via DAG
  const { statusMap, resolveOrder, hasCycle } = resolveInfraStatuses(infrastructures, indice);
  if (hasCycle) return { hasCycle: true };

  // Resolve asset results
  const assetResults = assets.filter(a => a.type !== "infrastructure_critique").map(asset => {
    const deps = asset.dependances || [];
    let accessibility = 1.0;

    if (deps.length > 0) {
      let totalWeight = 0, weightedVal = 0;
      deps.forEach(dep => {
        const infStatus = statusMap[dep.infrastructure_id];
        if (infStatus) {
          const w = dep.poids || 1;
          weightedVal += statusValue(infStatus.status) * w;
          totalWeight += w;
        }
      });
      accessibility = totalWeight > 0 ? weightedVal / totalWeight : 1.0;
    }

    const SEUIL_ARRET = 0.4, SEUIL_PLEIN = 0.7;
    let taux;
    if (accessibility <= SEUIL_ARRET) taux = 0;
    else if (accessibility >= SEUIL_PLEIN) taux = 1;
    else taux = (accessibility - SEUIL_ARRET) / (SEUIL_PLEIN - SEUIL_ARRET);

    const ca_jour = asset.ca_jour || 0;
    const perte_horaire = (ca_jour / 10) * (1 - taux);

    return { ...asset, accessibility, taux, perte_horaire, perte_totale: perte_horaire * duree };
  });

  const infraResults = infrastructures.map(inf => ({
    ...inf,
    ...(statusMap[inf.id] || { status: "open", directStatus: "open", inheritedStatus: null }),
  }));

  const perte_totale = assetResults.reduce((s, a) => s + a.perte_totale, 0);
  const assets_impactes = assetResults.filter(a => a.taux < 1).length;
  const assets_arretes = assetResults.filter(a => a.taux === 0).length;

  const steps = Math.min(duree, 96);
  const cumul = Array.from({ length: steps }, (_, i) => ({
    h: i + 1,
    loss: assetResults.reduce((s, a) => s + a.perte_horaire * (i + 1), 0),
  }));

  return {
    indice, assetResults, infraResults, statusMap,
    resolveOrder, perte_totale, assets_impactes, assets_arretes,
    cumul, params, hasCycle: false,
  };
}

// ── Utilities ───────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = n => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const fmtK = n => n >= 1e6 ? `${(n / 1e6).toFixed(2)}M €` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}k €` : `${Math.round(n)} €`;
const pct = n => `${Math.round(n * 100)}%`;

const TYPE_COLORS = {
  infrastructure_critique: "#ef4444",
  revenue_asset: "#3b82f6",
  support: "#6b7280",
};
const ACTIVITY_COLOR = (taux) => taux >= 0.7 ? "#22c55e" : taux >= 0.3 ? "#f59e0b" : "#ef4444";
const STATUS_COLOR = (status) => status === "open" ? "#22c55e" : status === "reduced" ? "#f59e0b" : "#ef4444";

// ── Styles ──────────────────────────────────────────────────────
const labelStyle = { display: "block", color: "#9ca3af", fontSize: 11, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 };
const inputStyle = { width: "100%", background: "#111827", border: "1px solid #374151", color: "#e2e8f0", borderRadius: 5, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" };
const btnStyle = (bg, extra = {}) => ({ background: bg, color: "#fff", border: "none", borderRadius: 5, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5, ...extra });

// ── Leaflet Map ─────────────────────────────────────────────────
function LeafletMap({ twin, onMapClick, onAssetClick, simResults }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const linesRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }
    const initMap = () => {
      if (typeof window.L === "undefined") { setTimeout(initMap, 200); return; }
      const L = window.L;
      const centre = twin.centre || [45.448, 6.985];
      const map = L.map(mapRef.current, { center: centre, zoom: twin.zoom || 13 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 19,
      }).addTo(map);
      map.on("click", e => onMapClick && onMapClick(e.latlng));
      mapInstanceRef.current = map;
      renderAll();
    };
    if (typeof window.L !== "undefined") initMap();
    else {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      s.onload = initMap; document.head.appendChild(s);
    }
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  const renderAll = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof window.L === "undefined") return;
    const L = window.L;

    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};
    linesRef.current.forEach(l => map.removeLayer(l));
    linesRef.current = [];

    const allItems = [...(twin.infrastructures || []), ...(twin.assets || [])];

    // ── Draw infra→infra dependency lines (dashed orange)
    (twin.infrastructures || []).forEach(inf => {
      (inf.infra_dependances || []).forEach(dep => {
        const parent = (twin.infrastructures || []).find(i => i.id === dep.infrastructure_id);
        if (!parent) return;
        const line = L.polyline([[inf.lat, inf.lon], [parent.lat, parent.lon]], {
          color: "#f59e0b", weight: 1.5 + dep.poids * 0.3, opacity: 0.6, dashArray: "6,3",
        }).addTo(map);
        linesRef.current.push(line);
      });
    });

    // ── Draw asset→infra dependency lines (dashed blue)
    (twin.assets || []).forEach(asset => {
      (asset.dependances || []).forEach(dep => {
        const inf = (twin.infrastructures || []).find(i => i.id === dep.infrastructure_id);
        if (!inf) return;
        const line = L.polyline([[asset.lat, asset.lon], [inf.lat, inf.lon]], {
          color: "#2563eb", weight: 1 + dep.poids * 0.3, opacity: 0.45, dashArray: "3,4",
        }).addTo(map);
        linesRef.current.push(line);
      });
    });

    // ── Draw markers
    allItems.forEach(item => {
      const isInfra = !!(twin.infrastructures || []).find(i => i.id === item.id);
      let color = TYPE_COLORS[item.type] || "#6b7280";

      if (simResults) {
        if (isInfra && simResults.statusMap?.[item.id]) {
          color = STATUS_COLOR(simResults.statusMap[item.id].status);
        } else if (!isInfra) {
          const r = simResults.assetResults?.find(a => a.id === item.id);
          if (r) color = ACTIVITY_COLOR(r.taux);
        }
      }

      const size = isInfra ? 16 : 12;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;border-radius:${isInfra ? "3px" : "50%"};background:${color};border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 8px rgba(0,0,0,0.5);cursor:pointer;transition:transform 0.15s;" onmouseover="this.style.transform='scale(1.5)'" onmouseout="this.style.transform='scale(1)'"></div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2],
      });
      const marker = L.marker([item.lat, item.lon], { icon })
        .addTo(map)
        .bindTooltip(`<b>${item.nom}</b><br><span style="color:#9ca3af;font-size:11px">${item.type}</span>`, { direction: "top", offset: [0, -10] });
      marker.on("click", e => { e.originalEvent?.stopPropagation(); onAssetClick && onAssetClick(item); });
      markersRef.current[item.id] = marker;
    });
  }, [twin, simResults, onAssetClick]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => { mapInstanceRef.current.invalidateSize(); renderAll(); }, 100);
    }
  }, [twin, simResults, renderAll]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: 400 }} />;
}

// ── Cumulative Chart ────────────────────────────────────────────
function CumulChart({ cumul }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !cumul) return;
    const init = () => {
      if (typeof window.Chart === "undefined") { setTimeout(init, 200); return; }
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new window.Chart(canvasRef.current, {
        type: "line",
        data: {
          labels: cumul.map(c => `H${c.h}`),
          datasets: [{ label: "Pertes (EUR)", data: cumul.map(c => c.loss), borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)", fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: "#6b7280", maxTicksLimit: 10, font: { size: 10 } }, grid: { color: "#1f2937" } },
            y: { ticks: { color: "#6b7280", font: { size: 10 }, callback: v => fmtK(v) }, grid: { color: "#1f2937" } },
          },
        },
      });
    };
    if (typeof window.Chart === "undefined") {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
      s.onload = init; document.head.appendChild(s);
    } else init();
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [cumul]);
  return <canvas ref={canvasRef} style={{ width: "100%", height: 180 }} />;
}

// ── Asset Form Modal ────────────────────────────────────────────
function AssetForm({ lang, initial, onSave, onCancel }) {
  const t = DICT[lang];
  const [form, setForm] = useState(initial || { nom: "", type: "revenue_asset", ca_jour: 50000, secteur: "", seuil_impact: 0.45, seuil_fermeture: 0.75 });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal>
      <ModalTitle>{initial ? t.editAsset : t.addAsset}</ModalTitle>
      {["nom", "secteur"].map(field => (
        <Field key={field} label={field === "nom" ? t.assetName : t.sector}>
          <input value={form[field] || ""} onChange={e => set(field, e.target.value)} style={inputStyle} />
        </Field>
      ))}
      <Field label={t.assetType}>
        <select value={form.type} onChange={e => set("type", e.target.value)} style={inputStyle}>
          <option value="infrastructure_critique">{t.infra}</option>
          <option value="revenue_asset">{t.revenue}</option>
          <option value="support">{t.support}</option>
        </select>
      </Field>
      {form.type !== "infrastructure_critique" && (
        <Field label={t.caJour}>
          <input type="number" value={form.ca_jour} onChange={e => set("ca_jour", parseFloat(e.target.value) || 0)} style={inputStyle} />
        </Field>
      )}
      {form.type === "infrastructure_critique" && (
        <>
          <Field label="Seuil d'impact (indice)">
            <input type="number" step="0.05" value={form.seuil_impact ?? 0.45} onChange={e => set("seuil_impact", parseFloat(e.target.value))} style={inputStyle} />
          </Field>
          <Field label="Seuil de fermeture (indice)">
            <input type="number" step="0.05" value={form.seuil_fermeture ?? 0.75} onChange={e => set("seuil_fermeture", parseFloat(e.target.value))} style={inputStyle} />
          </Field>
        </>
      )}
      <ModalActions>
        <button onClick={() => onSave(form)} style={btnStyle("#2563eb")}>{t.save}</button>
        <button onClick={onCancel} style={btnStyle("#374151")}>{t.cancel}</button>
      </ModalActions>
    </Modal>
  );
}

// ── Asset Dependency Modal (revenue asset → infras) ─────────────
function AssetLinkModal({ lang, asset, infrastructures, onSave, onCancel }) {
  const t = DICT[lang];
  const [links, setLinks] = useState(asset.dependances || []);

  const toggle = (infId) => {
    const exists = links.find(l => l.infrastructure_id === infId);
    if (exists) setLinks(links.filter(l => l.infrastructure_id !== infId));
    else setLinks([...links, { infrastructure_id: infId, poids: 3 }]);
  };
  const setW = (infId, w) => setLinks(links.map(l => l.infrastructure_id === infId ? { ...l, poids: w } : l));

  return (
    <Modal wide>
      <ModalTitle>Liaisons — {asset.nom}</ModalTitle>
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>
        {t.infraDepsHint.replace("infra", "asset")} {t.revenue_assets.toLowerCase()}
      </div>
      {infrastructures.length === 0 && <div style={{ color: "#6b7280", fontSize: 13 }}>Aucune infrastructure définie.</div>}
      {infrastructures.map(inf => {
        const lnk = links.find(l => l.infrastructure_id === inf.id);
        return (
          <div key={inf.id} style={{ marginBottom: 10, padding: "10px 12px", background: "#111827", borderRadius: 6, border: `1px solid ${lnk ? "#2563eb" : "#2d3748"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={!!lnk} onChange={() => toggle(inf.id)} style={{ accentColor: "#2563eb" }} />
              <span style={{ color: "#e2e8f0", fontSize: 13 }}>{inf.nom}</span>
            </div>
            {lnk && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <label style={labelStyle}>{t.weight}</label>
                  <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{lnk.poids}</span>
                </div>
                <input type="range" min={1} max={5} value={lnk.poids} onChange={e => setW(inf.id, parseInt(e.target.value))} style={{ width: "100%", accentColor: "#2563eb" }} />
              </div>
            )}
          </div>
        );
      })}
      <ModalActions>
        <button onClick={() => onSave({ ...asset, dependances: links })} style={btnStyle("#2563eb")}>{t.save}</button>
        <button onClick={onCancel} style={btnStyle("#374151")}>{t.cancel}</button>
      </ModalActions>
    </Modal>
  );
}

// ── Infra Dependency Modal (infra → infra) ──────────────────────
function InfraLinkModal({ lang, infra, allInfrastructures, onSave, onCancel }) {
  const t = DICT[lang];
  // All infras except self
  const others = allInfrastructures.filter(i => i.id !== infra.id);
  const [links, setLinks] = useState(infra.infra_dependances || []);
  const [cycleIds, setCycleIds] = useState([]);

  // Detect which links would create cycle if added
  useEffect(() => {
    const bad = others.filter(other => {
      const exists = links.find(l => l.infrastructure_id === other.id);
      if (exists) return false;
      // Simulate adding this link
      const testInfras = allInfrastructures.map(i =>
        i.id === infra.id
          ? { ...i, infra_dependances: [...(i.infra_dependances || []), { infrastructure_id: other.id, poids: 1 }] }
          : i
      );
      return topoSort(testInfras).hasCycle;
    }).map(o => o.id);
    setCycleIds(bad);
  }, [links, infra, allInfrastructures, others]);

  const toggle = (otherId) => {
    const exists = links.find(l => l.infrastructure_id === otherId);
    if (exists) {
      setLinks(links.filter(l => l.infrastructure_id !== otherId));
    } else {
      // Check would create cycle
      const testInfras = allInfrastructures.map(i =>
        i.id === infra.id
          ? { ...i, infra_dependances: [...(i.infra_dependances || []), { infrastructure_id: otherId, poids: 3 }] }
          : i
      );
      if (topoSort(testInfras).hasCycle) return; // silently blocked (already shown in UI)
      setLinks([...links, { infrastructure_id: otherId, poids: 3 }]);
    }
  };
  const setW = (otherId, w) => setLinks(links.map(l => l.infrastructure_id === otherId ? { ...l, poids: w } : l));

  return (
    <Modal wide>
      <ModalTitle>{t.infraDeps} — {infra.nom}</ModalTitle>
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 14 }}>{t.infraDepsHint}</div>
      {others.length === 0 && <div style={{ color: "#6b7280", fontSize: 13 }}>Aucune autre infrastructure.</div>}
      {others.map(other => {
        const lnk = links.find(l => l.infrastructure_id === other.id);
        const isCycleRisk = cycleIds.includes(other.id);
        return (
          <div key={other.id} style={{ marginBottom: 10, padding: "10px 12px", background: "#111827", borderRadius: 6, border: `1px solid ${lnk ? "#f59e0b" : isCycleRisk ? "#7f1d1d" : "#2d3748"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" checked={!!lnk} onChange={() => toggle(other.id)}
                disabled={isCycleRisk && !lnk} style={{ accentColor: "#f59e0b" }} />
              <span style={{ color: isCycleRisk && !lnk ? "#6b7280" : "#e2e8f0", fontSize: 13 }}>
                {other.nom}
              </span>
              {isCycleRisk && !lnk && (
                <span style={{ fontSize: 10, color: "#ef4444", marginLeft: "auto" }}>{t.cycleError}</span>
              )}
            </div>
            {lnk && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <label style={labelStyle}>{t.weight}</label>
                  <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{lnk.poids}</span>
                </div>
                <input type="range" min={1} max={5} value={lnk.poids} onChange={e => setW(other.id, parseInt(e.target.value))} style={{ width: "100%", accentColor: "#f59e0b" }} />
              </div>
            )}
          </div>
        );
      })}
      <ModalActions>
        <button onClick={() => onSave({ ...infra, infra_dependances: links })} style={btnStyle("#f59e0b", { color: "#000" })}>{t.save}</button>
        <button onClick={onCancel} style={btnStyle("#374151")}>{t.cancel}</button>
      </ModalActions>
    </Modal>
  );
}

// ── Modal helpers ───────────────────────────────────────────────
const Modal = ({ children, wide }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "#1e2433", border: "1px solid #2d3748", borderRadius: 10, padding: 28, width: wide ? 440 : 380, maxWidth: "95vw", maxHeight: "85vh", overflowY: "auto" }}>
      {children}
    </div>
  </div>
);
const ModalTitle = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 18, letterSpacing: 1, textTransform: "uppercase" }}>{children}</div>
);
const ModalActions = ({ children }) => (
  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>{children}</div>
);
const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

// ── Asset Row ───────────────────────────────────────────────────
function AssetRow({ asset, t, onEdit, onEditLinks, onDelete, showCA, infraCount }) {
  return (
    <div className="asset-row" style={{ padding: "7px 10px", background: "transparent", borderRadius: 5, marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 12, color: "#e2e8f0" }}>{asset.nom}</div>
        {showCA && <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{fmt(asset.ca_jour)} / jour</div>}
        {asset.dependances?.length > 0 && (
          <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{asset.dependances.length} liaison{asset.dependances.length > 1 ? "s" : ""} asset→infra</div>
        )}
        {asset.infra_dependances?.length > 0 && (
          <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 2 }}>{asset.infra_dependances.length} liaison{asset.infra_dependances.length > 1 ? "s" : ""} infra→infra</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {onEditLinks && (
          <button onClick={onEditLinks} style={{ ...btnStyle("#1e2433"), fontSize: 10, padding: "3px 7px", border: "1px solid #374151", color: "#f59e0b" }} className="action-btn">
            {asset.type === "infrastructure_critique" ? "⬡" : "⬡"}
          </button>
        )}
        <button onClick={onEdit} style={{ ...btnStyle("#1e2433"), fontSize: 10, padding: "3px 7px", border: "1px solid #374151" }} className="action-btn">{t.editAsset}</button>
        <button onClick={onDelete} style={{ ...btnStyle("#1e2433"), fontSize: 10, padding: "3px 7px", border: "1px solid #374151", color: "#ef4444" }} className="action-btn">✕</button>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("FR");
  const t = DICT[lang];
  const [activeTab, setActiveTab] = useState(0);
  const [twin, setTwin] = useState({
    nom: "Nouveau jumeau", context: "mountain", centre: [45.448, 6.985], zoom: 13,
    infrastructures: [], assets: [], simulations: [],
  });
  const [dirty, setDirty] = useState(false);

  // Onboarding: shown when creating a new twin (context not yet chosen)
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingName, setOnboardingName] = useState("Nouveau jumeau");

  // Context change confirm modal
  const [contextChangeModal, setContextChangeModal] = useState(null); // null | "mountain"|"plain"|...

  // Modals
  const [pendingClick, setPendingClick] = useState(null);
  const [assetForm, setAssetForm] = useState(null);
  const [assetLinkModal, setAssetLinkModal] = useState(null);   // revenue asset → infras
  const [infraLinkModal, setInfraLinkModal] = useState(null);   // infra → infras

  // Scenario
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [customParams, setCustomParams] = useState({ vent: 80, neige: 20, temp: -10, duree: 48 });

  // Simulation
  const [simResults, setSimResults] = useState(null);
  const [cycleError, setCycleError] = useState(false);

  // Saves
  const [savedTwins, setSavedTwins] = useState([]);
  const [saveNameInput, setSaveNameInput] = useState("");
  const [renameId, setRenameId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const importRef = useRef(null);

  // ── Storage ──────────────────────────────────────────────────
  const loadSavedList = useCallback(async () => {
    try {
      const result = await window.storage.list("twin:");
      if (!result) return;
      const twins = [];
      for (const key of result.keys) {
        try { const r = await window.storage.get(key); if (r) twins.push({ key, data: JSON.parse(r.value) }); } catch {}
      }
      twins.sort((a, b) => (b.data.updated_at || "").localeCompare(a.data.updated_at || ""));
      setSavedTwins(twins);
    } catch {}
  }, []);

  useEffect(() => { loadSavedList(); }, [loadSavedList]);

  useEffect(() => {
    (async () => {
      try {
        const last = await window.storage.get("last_twin_key");
        if (last) { const r = await window.storage.get(last.value); if (r) setTwin(JSON.parse(r.value)); }
      } catch {}
    })();
  }, []);

  const saveTwin = async (name) => {
    const key = `twin:${uid()}`;
    const data = { ...twin, nom: name || twin.nom, version: "2.2", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    try {
      await window.storage.set(key, JSON.stringify(data));
      await window.storage.set("last_twin_key", key);
      setDirty(false); loadSavedList();
    } catch (e) { alert("Erreur: " + e.message); }
  };

  const loadTwin = async (key) => {
    try {
      const r = await window.storage.get(key);
      if (r) { setTwin(JSON.parse(r.value)); setSimResults(null); setDirty(false); setCycleError(false); await window.storage.set("last_twin_key", key); }
    } catch {}
  };

  const deleteSavedTwin = async (key) => { await window.storage.delete(key); loadSavedList(); };

  const duplicateTwin = async (key) => {
    const r = await window.storage.get(key); if (!r) return;
    const data = JSON.parse(r.value);
    await window.storage.set(`twin:${uid()}`, JSON.stringify({ ...data, nom: data.nom + " (copie)", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }));
    loadSavedList();
  };

  const renameSavedTwin = async (key, name) => {
    const r = await window.storage.get(key); if (!r) return;
    const data = JSON.parse(r.value);
    await window.storage.set(key, JSON.stringify({ ...data, nom: name, updated_at: new Date().toISOString() }));
    loadSavedList(); setRenameId(null);
  };

  // ── Twin mutations ───────────────────────────────────────────
  const updateTwin = fn => { setTwin(prev => fn(prev)); setDirty(true); };

  const addAsset = (latlng, formData) => {
    const isInfra = formData.type === "infrastructure_critique";
    const item = {
      id: (isInfra ? "inf_" : "ast_") + uid(),
      nom: formData.nom || "Asset",
      type: formData.type,
      lat: latlng.lat, lon: latlng.lng,
      secteur: formData.secteur || "",
      ...(isInfra
        ? { seuil_impact: parseFloat(formData.seuil_impact) || 0.45, seuil_fermeture: parseFloat(formData.seuil_fermeture) || 0.75, infra_dependances: [] }
        : { ca_jour: parseFloat(formData.ca_jour) || 0, dependances: [] }
      ),
    };
    updateTwin(prev => isInfra
      ? { ...prev, infrastructures: [...prev.infrastructures, item] }
      : { ...prev, assets: [...prev.assets, item] }
    );
  };

  const editAsset = (updated) => {
    const isInfra = !!(twin.infrastructures || []).find(i => i.id === updated.id);
    if (isInfra) updateTwin(prev => ({ ...prev, infrastructures: prev.infrastructures.map(i => i.id === updated.id ? { ...i, ...updated } : i) }));
    else updateTwin(prev => ({ ...prev, assets: prev.assets.map(a => a.id === updated.id ? { ...a, ...updated } : a) }));
  };

  const deleteAsset = (id) => {
    updateTwin(prev => ({
      ...prev,
      infrastructures: prev.infrastructures.filter(i => i.id !== id).map(i => ({ ...i, infra_dependances: (i.infra_dependances || []).filter(d => d.infrastructure_id !== id) })),
      assets: prev.assets.filter(a => a.id !== id).map(a => ({ ...a, dependances: (a.dependances || []).filter(d => d.infrastructure_id !== id) })),
    }));
  };

  // ── Map interactions ─────────────────────────────────────────
  const handleMapClick = (latlng) => {
    setPendingClick(latlng);
    setAssetForm({ mode: "add" });
  };

  const handleAssetClick = (item) => {
    const isInfra = !!(twin.infrastructures || []).find(i => i.id === item.id);
    if (isInfra) {
      // Click on infra → open infra-link modal
      setInfraLinkModal(item);
    } else if (item.type === "revenue_asset") {
      // Click on revenue asset → open asset-link modal
      setAssetLinkModal(item);
    } else {
      setAssetForm({ mode: "edit", asset: { ...item } });
    }
  };

  // ── Simulation ───────────────────────────────────────────────
  const handleRunSim = () => {
    const params = selectedScenario.id === "custom" ? customParams : selectedScenario.params;
    const results = runSimulation(twin, params);
    if (results.hasCycle) { setCycleError(true); setSimResults(null); setActiveTab(2); return; }
    setCycleError(false);
    setSimResults(results);
    const rec = {
      id: "sim_" + uid(), scenario: selectedScenario.name[lang], date: new Date().toISOString(), params,
      resultats: { perte_totale: results.perte_totale, assets_impactes: results.assets_impactes, assets_arretes: results.assets_arretes },
    };
    updateTwin(prev => ({ ...prev, simulations: [rec, ...(prev.simulations || [])].slice(0, 20) }));
    setActiveTab(2);
  };

  // ── Export / Import ──────────────────────────────────────────
  const [jsonModal, setJsonModal] = useState(null); // null | string (JSON text)
  const [jsonCopied, setJsonCopied] = useState(false);

  const exportJSON = () => {
    const text = JSON.stringify(twin, null, 2);
    setJsonModal(text);
    setJsonCopied(false);
  };

  const copyJSON = () => {
    const text = jsonModal;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => { setJsonCopied(true); setTimeout(() => setJsonCopied(false), 2000); });
    } else {
      // Fallback: select textarea
      const el = document.getElementById("json-export-area");
      if (el) { el.select(); document.execCommand("copy"); setJsonCopied(true); setTimeout(() => setJsonCopied(false), 2000); }
    }
  };

  const importJSON = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { try { setTwin(JSON.parse(ev.target.result)); setDirty(true); setSimResults(null); setCycleError(false); } catch { alert("JSON invalide"); } };
    reader.readAsText(file); e.target.value = "";
  };

  const importFromText = (text) => {
    try { setTwin(JSON.parse(text)); setDirty(true); setSimResults(null); setCycleError(false); setJsonModal(null); }
    catch { alert("JSON invalide"); }
  };

  // ── Derived ──────────────────────────────────────────────────
  const allItems = [...(twin.infrastructures || []), ...(twin.assets || [])];
  const revenueAssets = (twin.assets || []).filter(a => a.type === "revenue_asset");
  const supportAssets = (twin.assets || []).filter(a => a.type === "support");

  // Detect cycle in current twin for UI warning
  const { hasCycle: currentHasCycle } = topoSort(twin.infrastructures || []);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: "#0f1117", color: "#e2e8f0", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #374151; }
        input, select { outline: none; font-family: inherit; }
        input:focus, select:focus { border-color: #2563eb !important; }
        .tab-btn:hover { background: #1f2937 !important; }
        .scenario-card:hover { border-color: #2563eb !important; }
        .asset-row:hover { background: #1f2937 !important; }
        .action-btn:hover { opacity: 0.8; }
        .leaflet-tooltip { font-family: 'IBM Plex Mono', monospace !important; font-size: 12px !important; background: #1e2433 !important; border: 1px solid #374151 !important; color: #e2e8f0 !important; }
        .leaflet-tooltip::before { border-top-color: #374151 !important; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ background: "#1e2433", borderBottom: "1px solid #2d3748", padding: "0 20px", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#2563eb", letterSpacing: 2, textTransform: "uppercase" }}>{t.title}</span>
          <span style={{ fontSize: 10, color: "#4b5563", letterSpacing: 2, textTransform: "uppercase", display: "none" }}>{t.subtitle}</span>
          <span style={{ fontSize: 10, color: "#6b7280", background: "#111827", padding: "2px 8px", borderRadius: 3, border: "1px solid #374151" }}>
            {twin.nom}{dirty && <span style={{ color: "#f59e0b", marginLeft: 6 }}>●</span>}
          </span>
          {/* Context badge */}
          {(() => {
            const ctx = CONTEXTS[twin.context] || CONTEXTS.mountain;
            return (
              <button onClick={() => setContextChangeModal("pick")}
                style={{ display: "flex", alignItems: "center", gap: 4, background: "#111827", border: `1px solid ${ctx.color}44`, borderRadius: 3, padding: "2px 8px", cursor: "pointer", fontFamily: "inherit" }}
                title={t.contextChange}>
                <span style={{ fontSize: 11 }}>{ctx.icon}</span>
                <span style={{ fontSize: 9, color: ctx.color, letterSpacing: 1, textTransform: "uppercase" }}>{t[`ctx_${ctx.id}`]}</span>
              </button>
            );
          })()}
          {currentHasCycle && (
            <span style={{ fontSize: 10, color: "#ef4444", background: "#1f0000", padding: "2px 8px", borderRadius: 3, border: "1px solid #ef4444" }}>⚠ Cycle détecté</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {["FR", "EN", "DE", "LB"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? "#2563eb" : "transparent", color: lang === l ? "#fff" : "#6b7280", border: `1px solid ${lang === l ? "#2563eb" : "#374151"}`, borderRadius: 4, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "inherit", letterSpacing: 1 }}>{l}</button>
          ))}
          <button onClick={() => {
            if (dirty) {
              const ok = window.confirm("Des modifications non sauvegardées existent. Sauvegarder avant de continuer ?");
              if (ok) { saveTwin(twin.nom); }
            }
            setOnboardingName("Nouveau jumeau");
            setShowOnboarding(true);
          }} style={{ ...btnStyle("#1f2937"), fontSize: 10, padding: "4px 10px", border: "1px solid #374151", color: "#22c55e" }} className="action-btn">+ {t.newTwin}</button>
          <button onClick={exportJSON} style={{ ...btnStyle("#1f2937"), fontSize: 10, padding: "4px 10px", border: "1px solid #374151" }} className="action-btn">↓ JSON</button>
          <button onClick={() => importRef.current?.click()} style={{ ...btnStyle("#1f2937"), fontSize: 10, padding: "4px 10px", border: "1px solid #374151" }} className="action-btn">↑ JSON</button>
          <input ref={importRef} type="file" accept=".json" style={{ display: "none" }} onChange={importJSON} />
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Map */}
        <div style={{ flex: "0 0 60%", position: "relative", overflow: "hidden" }}>
          <LeafletMap twin={twin} onMapClick={handleMapClick} onAssetClick={handleAssetClick} simResults={simResults} />

          {/* Map legend */}
          <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 500, background: "rgba(15,17,23,0.92)", border: "1px solid #2d3748", borderRadius: 6, padding: "10px 12px", fontSize: 10 }}>
            <div style={{ color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Légende</div>
            {[["#ef4444", "■", t.infra], ["#3b82f6", "●", t.revenue], ["#6b7280", "●", t.support]].map(([c, sh, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <span style={{ color: c, fontSize: 10 }}>{sh}</span>
                <span style={{ color: "#6b7280" }}>{l}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #1f2937", marginTop: 6, paddingTop: 6 }}>
              {[["#f59e0b", "— —", "Infra→Infra"], ["#2563eb", "···", "Asset→Infra"]].map(([c, dash, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ color: c, fontSize: 12, fontWeight: 700 }}>{dash}</span>
                  <span style={{ color: "#6b7280" }}>{l}</span>
                </div>
              ))}
            </div>
            {simResults && (
              <div style={{ borderTop: "1px solid #1f2937", marginTop: 6, paddingTop: 6 }}>
                <div style={{ color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Simulation</div>
                {[["#22c55e", "≥ 70%"], ["#f59e0b", "30–70%"], ["#ef4444", "< 30%"]].map(([c, l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                    <span style={{ color: "#6b7280" }}>{l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Click hint */}
          <div style={{ position: "absolute", top: 12, left: 12, zIndex: 500, background: "rgba(15,17,23,0.85)", border: "1px solid #2d3748", borderRadius: 5, padding: "5px 10px", fontSize: 10, color: "#6b7280" }}>
            + clic carte = asset · clic infra = liaisons infra · clic asset = liaisons
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: "0 0 40%", background: "#111827", borderLeft: "1px solid #2d3748", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #2d3748", flexShrink: 0 }}>
            {t.tabs.map((tab, i) => (
              <button key={i} onClick={() => setActiveTab(i)} className="tab-btn"
                style={{ flex: 1, padding: "12px 4px", background: activeTab === i ? "#1e2433" : "transparent", color: activeTab === i ? "#e2e8f0" : "#6b7280", border: "none", borderBottom: `2px solid ${activeTab === i ? "#2563eb" : "transparent"}`, cursor: "pointer", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", fontFamily: "inherit" }}>
                {tab}
                {i === 2 && (simResults || cycleError) && <span style={{ marginLeft: 3, color: cycleError ? "#ef4444" : "#22c55e", fontSize: 9 }}>●</span>}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

            {/* ══ ASSETS TAB ════════════════════════════════ */}
            {activeTab === 0 && (
              <div>
                {/* Context display + change in Assets tab */}
                {(() => {
                  const ctx = CONTEXTS[twin.context] || CONTEXTS.mountain;
                  return (
                    <div style={{ background: `${ctx.color}0d`, border: `1px solid ${ctx.color}33`, borderRadius: 6, padding: "8px 12px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1 }}>{t.contextLabel}</div>
                        <div style={{ fontSize: 12, color: ctx.color, fontWeight: 600, marginTop: 2 }}>{ctx.icon} {t[`ctx_${ctx.id}`]}</div>
                        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>{t[`ctx_${ctx.id}_desc`]}</div>
                      </div>
                      <button onClick={() => setContextChangeModal("pick")}
                        style={{ ...btnStyle("#1f2937"), fontSize: 9, padding: "4px 8px", border: `1px solid ${ctx.color}44`, color: ctx.color }} className="action-btn">
                        ✎ {t.contextChange}
                      </button>
                    </div>
                  );
                })()}

                <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, marginBottom: 14, textTransform: "uppercase" }}>
                  {t.addAsset}
                </div>

                {/* Infrastructures */}
                {twin.infrastructures.length > 0 && (
                  <Section color="#ef4444" title={`${t.infrastructures} (${twin.infrastructures.length})`}>
                    <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 8 }}>
                      Cliquer sur une infra sur la carte pour gérer ses dépendances infra→infra (lignes orange)
                    </div>
                    {twin.infrastructures.map(inf => (
                      <AssetRow key={inf.id} asset={inf} t={t}
                        onEdit={() => setAssetForm({ mode: "edit", asset: { ...inf } })}
                        onEditLinks={() => setInfraLinkModal(inf)}
                        onDelete={() => deleteAsset(inf.id)}
                      />
                    ))}
                  </Section>
                )}

                {/* Revenue assets */}
                {revenueAssets.length > 0 && (
                  <Section color="#3b82f6" title={`${t.revenue_assets} (${revenueAssets.length})`}>
                    <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 8 }}>
                      Cliquer sur un asset sur la carte pour gérer ses liaisons vers les infras (lignes bleues)
                    </div>
                    {revenueAssets.map(a => (
                      <AssetRow key={a.id} asset={a} t={t}
                        onEdit={() => setAssetForm({ mode: "edit", asset: { ...a } })}
                        onEditLinks={() => setAssetLinkModal(a)}
                        onDelete={() => deleteAsset(a.id)}
                        showCA
                      />
                    ))}
                  </Section>
                )}

                {/* Support */}
                {supportAssets.length > 0 && (
                  <Section color="#6b7280" title={`Support (${supportAssets.length})`}>
                    {supportAssets.map(a => (
                      <AssetRow key={a.id} asset={a} t={t}
                        onEdit={() => setAssetForm({ mode: "edit", asset: { ...a } })}
                        onDelete={() => deleteAsset(a.id)}
                      />
                    ))}
                  </Section>
                )}

                {allItems.length === 0 && (
                  <div style={{ color: "#4b5563", fontSize: 12, textAlign: "center", marginTop: 48, lineHeight: 2 }}>{t.noAssets}</div>
                )}

                {allItems.length > 0 && (
                  <button onClick={() => { if (window.confirm(t.deleteConfirm)) { setTwin(prev => ({ ...prev, infrastructures: [], assets: [] })); setDirty(true); setSimResults(null); } }}
                    style={{ ...btnStyle("#1f2937"), fontSize: 10, border: "1px solid #374151", marginTop: 16, width: "100%", color: "#ef4444" }} className="action-btn">
                    {t.clearAll}
                  </button>
                )}
              </div>
            )}

            {/* ══ SCENARIOS TAB ════════════════════════════════ */}
            {activeTab === 1 && (
              <div>
                <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{t.scenarioLib}</div>
                {/* Context filter info */}
                {(() => {
                  const ctx = CONTEXTS[twin.context] || CONTEXTS.mountain;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${ctx.color}11`, border: `1px solid ${ctx.color}33`, borderRadius: 6, padding: "6px 10px", marginBottom: 12 }}>
                      <span style={{ fontSize: 14 }}>{ctx.icon}</span>
                      <span style={{ fontSize: 10, color: ctx.color }}>{t[`ctx_${ctx.id}`]} — {t[`ctx_${ctx.id}_desc`]}</span>
                    </div>
                  );
                })()}
                {(() => {
                  const ctx = CONTEXTS[twin.context] || CONTEXTS.mountain;
                  const filtered = SCENARIOS.filter(sc => !sc.contexts || ctx.scenarioIds.includes(sc.id));
                  return filtered.map(sc => (
                  <div key={sc.id} className="scenario-card"
                    onClick={() => setSelectedScenario(sc)}
                    style={{ marginBottom: 8, padding: "12px 14px", background: "#0f1117", border: `1px solid ${selectedScenario.id === sc.id ? "#2563eb" : "#2d3748"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{sc.icon} {sc.name[lang]}</div>
                      <div style={{ fontSize: 10, color: "#4b5563", background: "#1f2937", padding: "2px 8px", borderRadius: 3 }}>{sc.period}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 5 }}>{sc.desc[lang]}</div>
                    {sc.id !== "custom" && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {Object.entries(sc.params).filter(([k]) => k !== "duree").map(([k, v]) => {
                          const units = { vent: "km/h", neige: "cm/h", temp: "°C", pluie: "mm/h", houle: "m", surge: "m", humidite: "%" };
                          const icons = { vent: "💨", neige: "🌨️", temp: "🌡️", pluie: "🌧️", houle: "🌊", surge: "📈", humidite: "💧" };
                          return <div key={k} style={{ fontSize: 10, color: "#9ca3af", background: "#1f2937", padding: "2px 7px", borderRadius: 3 }}>{icons[k] || "•"} {v}{units[k] || ""}</div>;
                        })}
                        <div style={{ fontSize: 10, color: "#9ca3af", background: "#1f2937", padding: "2px 7px", borderRadius: 3 }}>⏱️ {sc.params.duree}h</div>
                      </div>
                    )}
                  </div>
                ));
                })()}

                {selectedScenario.id === "custom" && (
                  <div style={{ background: "#0f1117", border: "1px solid #374151", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                    {(() => {
                      const ctx = CONTEXTS[twin.context] || CONTEXTS.mountain;
                      const paramLabels = { vent: t.wind, neige: t.snow, temp: t.temp, duree: t.duration, pluie: "Pluie (mm/h)", houle: "Houle (m)", surge: "Surcote (m)", humidite: "Humidité (%)" };
                      return Object.entries(ctx.paramLabels).filter(([, show]) => show).map(([key]) => {
                        const [min, max] = ctx.paramRanges[key] || [0, 100];
                        return (
                          <div key={key} style={{ marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                              <label style={labelStyle}>{paramLabels[key] || key}</label>
                              <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{customParams[key] ?? 0}</span>
                            </div>
                            <input type="range" min={min} max={max} value={customParams[key] ?? min}
                              onChange={e => setCustomParams(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
                              style={{ width: "100%", accentColor: "#2563eb" }} />
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}

                {currentHasCycle && (
                  <div style={{ background: "#1f0000", border: "1px solid #ef4444", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: "#ef4444", marginBottom: 12 }}>
                    {t.cycleWarning}
                  </div>
                )}

                <button onClick={handleRunSim}
                  disabled={allItems.length === 0 || currentHasCycle}
                  style={{ ...btnStyle(allItems.length === 0 || currentHasCycle ? "#374151" : "#2563eb"), width: "100%", padding: 12, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", opacity: (allItems.length === 0 || currentHasCycle) ? 0.5 : 1 }}>
                  ▶ {t.runSimulation}
                </button>
              </div>
            )}

            {/* ══ RESULTS TAB ══════════════════════════════════ */}
            {activeTab === 2 && (
              <div>
                {cycleError && (
                  <div style={{ background: "#1f0000", border: "1px solid #ef4444", borderRadius: 8, padding: "14px 16px", marginBottom: 16, fontSize: 12, color: "#ef4444" }}>
                    {t.cycleWarning}
                  </div>
                )}

                {!simResults && !cycleError && (
                  <div style={{ color: "#4b5563", fontSize: 12, textAlign: "center", marginTop: 48 }}>{t.noResults}</div>
                )}

                {simResults && (
                  <>
                    {/* KPIs */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                      {[[t.totalLoss, fmtK(simResults.perte_totale), "#ef4444"], [t.assetsImpacted, simResults.assets_impactes, "#f59e0b"], [t.assetsStopped, simResults.assets_arretes, "#ef4444"]].map(([label, val, color]) => (
                        <div key={label} style={{ background: "#0f1117", border: "1px solid #2d3748", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color }}>{val}</div>
                          <div style={{ fontSize: 9, color: "#6b7280", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Scenario params */}
                    <div style={{ background: "#0f1117", border: "1px solid #2d3748", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Scénario actif</div>
                      <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{selectedScenario.name[lang]}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        {[["💨", simResults.params.vent, "km/h"], ["🌨️", simResults.params.neige, "cm/h"], ["🌡️", simResults.params.temp, "°C"], ["⏱️", simResults.params.duree, "h"]].map(([ico, v, u]) => (
                          <div key={u} style={{ fontSize: 10, color: "#9ca3af", background: "#1f2937", padding: "2px 7px", borderRadius: 3 }}>{ico} {v}{u}</div>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>
                        Indice aléa: <span style={{ color: "#f59e0b", fontWeight: 600 }}>{simResults.indice.toFixed(3)}</span>
                      </div>
                    </div>

                    {/* Infra results — show DAG resolution order */}
                    {simResults.infraResults.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                          {t.infraStatus} — <span style={{ color: "#4b5563" }}>{t.resolveOrder}: {simResults.resolveOrder.map(id => simResults.infraResults.find(i => i.id === id)?.nom?.split(" ")[0]).join(" → ")}</span>
                        </div>
                        {simResults.resolveOrder.map(id => {
                          const inf = simResults.infraResults.find(i => i.id === id);
                          if (!inf) return null;
                          return (
                            <div key={id} style={{ padding: "8px 10px", background: "#0f1117", borderRadius: 5, marginBottom: 4, borderLeft: `3px solid ${STATUS_COLOR(inf.status)}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 12, color: "#e2e8f0" }}>{inf.nom}</span>
                                <span style={{ fontSize: 11, color: STATUS_COLOR(inf.status), fontWeight: 600 }}>{t[inf.status]}</span>
                              </div>
                              {inf.hasDeps && (
                                <div style={{ marginTop: 4, display: "flex", gap: 10 }}>
                                  <span style={{ fontSize: 10, color: "#6b7280" }}>
                                    {t.directImpact}: <span style={{ color: STATUS_COLOR(inf.directStatus) }}>{t[inf.directStatus]}</span>
                                  </span>
                                  {inf.inheritedStatus && (
                                    <span style={{ fontSize: 10, color: "#6b7280" }}>
                                      {t.inheritedImpact}: <span style={{ color: STATUS_COLOR(inf.inheritedStatus) }}>{t[inf.inheritedStatus]}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Asset results */}
                    {simResults.assetResults.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: "#3b82f6", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{t.revenue_assets}</div>
                        {simResults.assetResults.sort((a, b) => b.perte_totale - a.perte_totale).map(asset => (
                          <div key={asset.id} style={{ padding: "8px 10px", background: "#0f1117", borderRadius: 5, marginBottom: 4 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 500 }}>{asset.nom}</span>
                              <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>{fmtK(asset.perte_totale)}</span>
                            </div>
                            <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 10, color: "#6b7280" }}>{t.activityRate}: <span style={{ color: ACTIVITY_COLOR(asset.taux) }}>{pct(asset.taux)}</span></span>
                              <span style={{ fontSize: 10, color: "#6b7280" }}>{t.accessibility}: <span style={{ color: "#9ca3af" }}>{pct(asset.accessibility)}</span></span>
                              <span style={{ fontSize: 10, color: "#6b7280" }}>{fmtK(asset.perte_horaire)}/h</span>
                            </div>
                            <div style={{ height: 2, background: "#1f2937", borderRadius: 2, marginTop: 6 }}>
                              <div style={{ height: 2, background: ACTIVITY_COLOR(asset.taux), width: pct(asset.taux), borderRadius: 2, transition: "width 0.6s" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cumul chart */}
                    <div style={{ background: "#0f1117", border: "1px solid #2d3748", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{t.cumulLoss}</div>
                      <CumulChart cumul={simResults.cumul} />
                    </div>

                    {/* Sim history */}
                    {twin.simulations?.length > 1 && (
                      <div>
                        <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{t.simHistory}</div>
                        {twin.simulations.slice(1).map(sim => (
                          <div key={sim.id} style={{ padding: "7px 10px", background: "#0f1117", borderRadius: 5, marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>{sim.scenario}</div>
                              <div style={{ fontSize: 10, color: "#4b5563" }}>{new Date(sim.date).toLocaleDateString()}</div>
                            </div>
                            <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>{fmtK(sim.resultats.perte_totale)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ══ SAVES TAB ════════════════════════════════════ */}
            {activeTab === 3 && (
              <div>
                <div style={{ background: "#0f1117", border: "1px solid #2d3748", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{t.saveTwin}</div>
                  <input value={saveNameInput || twin.nom} onChange={e => setSaveNameInput(e.target.value)} placeholder={t.twinName} style={{ ...inputStyle, marginBottom: 10 }} />
                  <button onClick={() => saveTwin(saveNameInput || twin.nom)} style={{ ...btnStyle("#2563eb"), width: "100%", padding: 10, fontSize: 12 }}>
                    💾 {t.saveTwin}
                  </button>
                </div>

                <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{t.myTwins}</div>
                {savedTwins.length === 0 && <div style={{ color: "#4b5563", fontSize: 12, textAlign: "center", padding: 20 }}>{t.noTwin}</div>}
                {savedTwins.map(({ key, data }) => (
                  <div key={key} style={{ background: "#0f1117", border: "1px solid #2d3748", borderRadius: 8, padding: "12px 14px", marginBottom: 8 }}>
                    {renameId === key ? (
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <input value={renameVal} onChange={e => setRenameVal(e.target.value)} style={{ ...inputStyle, flex: 1 }} autoFocus />
                        <button onClick={() => renameSavedTwin(key, renameVal)} style={btnStyle("#2563eb")}>✓</button>
                        <button onClick={() => setRenameId(null)} style={btnStyle("#374151")}>✕</button>
                      </div>
                    ) : (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 }}>{data.nom}</div>
                        <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>
                          {new Date(data.updated_at || data.created_at).toLocaleString()} · {(data.infrastructures?.length || 0) + (data.assets?.length || 0)} assets
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button onClick={() => loadTwin(key)} style={{ ...btnStyle("#2563eb"), fontSize: 10, padding: "4px 10px" }} className="action-btn">⤓ {t.load}</button>
                      <button onClick={() => { setRenameId(key); setRenameVal(data.nom); }} style={{ ...btnStyle("#374151"), fontSize: 10, padding: "4px 10px" }} className="action-btn">✎ {t.rename}</button>
                      <button onClick={() => duplicateTwin(key)} style={{ ...btnStyle("#374151"), fontSize: 10, padding: "4px 10px" }} className="action-btn">⧉ {t.duplicate}</button>
                      {deleteConfirm === key
                        ? <>
                          <button onClick={() => { deleteSavedTwin(key); setDeleteConfirm(null); }} style={{ ...btnStyle("#ef4444"), fontSize: 10, padding: "4px 10px" }}>{t.yes}</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ ...btnStyle("#374151"), fontSize: 10, padding: "4px 10px" }}>{t.no}</button>
                        </>
                        : <button onClick={() => setDeleteConfirm(key)} style={{ ...btnStyle("#1f2937"), fontSize: 10, padding: "4px 10px", color: "#ef4444", border: "1px solid #374151" }} className="action-btn">✕ {t.deleteTwin}</button>
                      }
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                  <button onClick={exportJSON} style={{ ...btnStyle("#1f2937"), flex: 1, fontSize: 11, border: "1px solid #374151" }} className="action-btn">↓ {t.exportJSON}</button>
                  <button onClick={() => importRef.current?.click()} style={{ ...btnStyle("#1f2937"), flex: 1, fontSize: 11, border: "1px solid #374151" }} className="action-btn">↑ {t.importJSON}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      {assetForm && (
        <AssetForm lang={lang} initial={assetForm.mode === "edit" ? assetForm.asset : null}
          onSave={formData => {
            if (assetForm.mode === "add" && pendingClick) addAsset(pendingClick, formData);
            else if (assetForm.mode === "edit") editAsset({ ...assetForm.asset, ...formData });
            setAssetForm(null); setPendingClick(null);
          }}
          onCancel={() => { setAssetForm(null); setPendingClick(null); }}
        />
      )}

      {assetLinkModal && (
        <AssetLinkModal lang={lang} asset={assetLinkModal} infrastructures={twin.infrastructures}
          onSave={updated => { editAsset(updated); setAssetLinkModal(null); }}
          onCancel={() => setAssetLinkModal(null)}
        />
      )}

      {infraLinkModal && (
        <InfraLinkModal lang={lang} infra={infraLinkModal} allInfrastructures={twin.infrastructures}
          onSave={updated => { editAsset(updated); setInfraLinkModal(null); }}
          onCancel={() => setInfraLinkModal(null)}
        />
      )}

      {/* ── Onboarding Modal (new twin context selection) ───── */}
      {showOnboarding && (
        <OnboardingModal lang={lang} nameInit={onboardingName}
          onConfirm={(name, contextId) => {
            const ctx = CONTEXTS[contextId];
            setTwin({
              nom: name,
              context: contextId,
              centre: ctx.defaultCenter,
              zoom: ctx.defaultZoom,
              infrastructures: [], assets: [], simulations: [],
            });
            setSimResults(null); setCycleError(false); setDirty(false); setSaveNameInput("");
            setSelectedScenario(SCENARIOS.find(s => ctx.scenarioIds[0] === s.id) || SCENARIOS[0]);
            setCustomParams({ vent: 80, neige: 20, temp: -10, duree: 48 });
            setShowOnboarding(false);
          }}
          onCancel={() => setShowOnboarding(false)}
        />
      )}

      {/* ── Context Change Modal ─────────────────────────────── */}
      {contextChangeModal === "pick" && (
        <ContextPickModal lang={lang} currentContext={twin.context}
          onConfirm={(contextId) => {
            const ctx = CONTEXTS[contextId];
            setTwin(prev => ({ ...prev, context: contextId, centre: ctx.defaultCenter, zoom: ctx.defaultZoom }));
            setSelectedScenario(SCENARIOS.find(s => ctx.scenarioIds[0] === s.id) || SCENARIOS[0]);
            setDirty(true);
            setContextChangeModal(null);
          }}
          onCancel={() => setContextChangeModal(null)}
        />
      )}

      {/* ── JSON Modal ────────────────────────────────────────── */}
      {jsonModal !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#1e2433", border: "1px solid #2d3748", borderRadius: 10, padding: 24, width: 560, maxWidth: "95vw", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              Export JSON — {twin.nom}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>
              Copie ce JSON et colle-le dans un fichier <code style={{ color: "#9ca3af" }}>.json</code> pour le sauvegarder sur ton poste. Pour réimporter, colle un JSON dans la zone et clique "Importer".
            </div>
            <textarea
              id="json-export-area"
              defaultValue={jsonModal}
              readOnly={false}
              style={{ flex: 1, minHeight: 320, background: "#0f1117", border: "1px solid #374151", color: "#9ca3af", borderRadius: 6, padding: 12, fontSize: 11, fontFamily: "inherit", resize: "vertical", outline: "none" }}
              onChange={e => setJsonModal(e.target.value)}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={copyJSON}
                style={{ ...btnStyle(jsonCopied ? "#22c55e" : "#2563eb"), flex: 1, fontSize: 12 }}>
                {jsonCopied ? "✓ Copié !" : "📋 Copier le JSON"}
              </button>
              <button onClick={() => importFromText(jsonModal)}
                style={{ ...btnStyle("#f59e0b", { color: "#000" }), fontSize: 12 }}>
                ↑ Importer ce JSON
              </button>
              <button onClick={() => setJsonModal(null)}
                style={{ ...btnStyle("#374151"), fontSize: 12 }}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Onboarding Modal ────────────────────────────────────────────
function OnboardingModal({ lang, nameInit, onConfirm, onCancel }) {
  const t = DICT[lang];
  const [name, setName] = useState(nameInit || "Nouveau jumeau");
  const [selectedCtx, setSelectedCtx] = useState("mountain");

  const ctxList = Object.values(CONTEXTS);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1e2433", border: "1px solid #2d3748", borderRadius: 12, padding: 32, width: 520, maxWidth: "96vw", maxHeight: "92vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🔬</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", letterSpacing: 1.5, textTransform: "uppercase" }}>{t.title}</div>
          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4, letterSpacing: 1 }}>{t.chooseContext}</div>
        </div>

        {/* Twin name */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>{t.twinName}</label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} autoFocus />
        </div>

        {/* Context cards grid */}
        <div style={{ fontSize: 10, color: "#4b5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>{t.contextLabel}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
          {ctxList.map(ctx => (
            <div key={ctx.id}
              onClick={() => setSelectedCtx(ctx.id)}
              style={{ padding: "14px 16px", background: selectedCtx === ctx.id ? `${ctx.color}18` : "#0f1117", border: `2px solid ${selectedCtx === ctx.id ? ctx.color : "#2d3748"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{ctx.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: selectedCtx === ctx.id ? ctx.color : "#e2e8f0", marginBottom: 4 }}>{t[`ctx_${ctx.id}`]}</div>
              <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.4 }}>{t[`ctx_${ctx.id}_desc`]}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onConfirm(name || "Nouveau jumeau", selectedCtx)}
            style={{ ...btnStyle(CONTEXTS[selectedCtx]?.color || "#2563eb"), flex: 1, padding: 12, fontSize: 12, letterSpacing: 1 }}>
            {CONTEXTS[selectedCtx]?.icon} {t.createTwin}
          </button>
          <button onClick={onCancel} style={{ ...btnStyle("#374151"), fontSize: 12 }}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Context Pick Modal (change context on existing twin) ────────
function ContextPickModal({ lang, currentContext, onConfirm, onCancel }) {
  const t = DICT[lang];
  const [selectedCtx, setSelectedCtx] = useState(currentContext);
  const [confirmed, setConfirmed] = useState(false);
  const ctxList = Object.values(CONTEXTS);

  const handleConfirm = () => {
    if (selectedCtx === currentContext) { onCancel(); return; }
    if (!confirmed) { setConfirmed(true); return; }
    onConfirm(selectedCtx);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1e2433", border: "1px solid #2d3748", borderRadius: 12, padding: 28, width: 480, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{t.contextChange}</div>

        {confirmed && selectedCtx !== currentContext && (
          <div style={{ background: "#1c1400", border: "1px solid #f59e0b", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: "#f59e0b", marginBottom: 16 }}>
            ⚠ {t.contextWarning}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
          {ctxList.map(ctx => (
            <div key={ctx.id}
              onClick={() => { setSelectedCtx(ctx.id); setConfirmed(false); }}
              style={{ padding: "12px 14px", background: selectedCtx === ctx.id ? `${ctx.color}18` : "#0f1117", border: `2px solid ${selectedCtx === ctx.id ? ctx.color : ctx.id === currentContext ? "#374151" : "#2d3748"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.15s", position: "relative" }}>
              {ctx.id === currentContext && (
                <div style={{ position: "absolute", top: 5, right: 7, fontSize: 8, color: "#4b5563", textTransform: "uppercase" }}>actuel</div>
              )}
              <div style={{ fontSize: 18, marginBottom: 4 }}>{ctx.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: selectedCtx === ctx.id ? ctx.color : "#e2e8f0" }}>{t[`ctx_${ctx.id}`]}</div>
              <div style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>{t[`ctx_${ctx.id}_desc`]}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleConfirm}
            style={{ ...btnStyle(confirmed && selectedCtx !== currentContext ? "#f59e0b" : CONTEXTS[selectedCtx]?.color || "#2563eb", confirmed && selectedCtx !== currentContext ? { color: "#000" } : {}), flex: 1, padding: 10, fontSize: 12 }}>
            {confirmed && selectedCtx !== currentContext ? `⚠ ${t.yes} — ${t.contextChange}` : `✓ ${t.save}`}
          </button>
          <button onClick={onCancel} style={{ ...btnStyle("#374151"), fontSize: 12 }}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Section helper ──────────────────────────────────────────────
function Section({ color, title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${color}22` }}>
        {title}
      </div>
      {children}
    </div>
  );
}
