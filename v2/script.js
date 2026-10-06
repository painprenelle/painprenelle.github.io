/* ==========================================================================
   Painprenelle — v2
   --------------------------------------------------------------------------
   RÉGLAGES — c'est le seul endroit à modifier pour les congés et les
   horaires. Tout le site (bandeau, statut « ouvert / fermé », dates de
   retrait proposées dans le formulaire) se met à jour automatiquement.
   ========================================================================== */

const REGLAGES = {
  email: "info@painprenelle.be",

  // Prochains congés. Le bandeau s'affiche jusqu'au jour « au » inclus,
  // puis disparaît tout seul. Mettre fermeture: null s'il n'y en a pas.
  fermeture: {
    du: "2026-10-19",
    au: "2026-10-25",
    message: "Atelier fermé la semaine du 19 au 25 octobre 2026. Merci pour votre fidélité et à très bientôt !",
  },

  // Mois (1–12) pendant lesquels le samedi se fait au marché, 9h–13h.
  // Le reste de l'année : vente à l'atelier, 8h30–12h30.
  marche: { debutMois: 4, finMois: 10 },
};

/* ========================================================================== */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const hhmm = (h) => {
    const m = Math.round((h % 1) * 60);
    return Math.floor(h) + "h" + (m ? String(m).padStart(2, "0") : "");
  };
  const dateLongue = (d) => `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;

  /* ---------- Calendrier ---------- */

  const parseJour = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const ferme = REGLAGES.fermeture;
  const fermeDu = ferme && parseJour(ferme.du);
  const fermeAu = ferme && new Date(parseJour(ferme.au).getTime() + 86400000 - 1);
  const estEnConge = (d) => !!ferme && d >= fermeDu && d <= fermeAu;
  const estSaisonMarche = (d) => {
    const m = d.getMonth() + 1;
    return m >= REGLAGES.marche.debutMois && m <= REGLAGES.marche.finMois;
  };

  // Créneau de vente d'un jour donné, ou null.
  function creneau(d) {
    if (d.getDay() === 5) {
      return { debut: 16, fin: 20, lieu: "Atelier (self-service au comptoir) et dépôts" };
    }
    if (d.getDay() === 6) {
      return estSaisonMarche(d)
        ? { debut: 9, fin: 13, lieu: "Marché, place du village" }
        : { debut: 8.5, fin: 12.5, lieu: "Vente à l'atelier" };
    }
    return null;
  }

  const aHeure = (d, h) => { const x = new Date(d); x.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0); return x; };

  // Les n prochains créneaux (en sautant les congés), à partir de `depuis`.
  function prochainsCreneaux(depuis, n) {
    const out = [];
    const d = new Date(depuis); d.setHours(0, 0, 0, 0);
    for (let i = 0; i < 60 && out.length < n; i++, d.setDate(d.getDate() + 1)) {
      const c = creneau(d);
      if (!c || estEnConge(d) || aHeure(d, c.fin) <= depuis) continue;
      out.push({ ...c, date: new Date(d) });
    }
    return out;
  }

  /* ---------- Bandeau d'annonce ---------- */

  const now = new Date();
  const annonce = $("[data-annonce]");
  if (annonce && ferme && now <= fermeAu) {
    annonce.innerHTML = `<strong>Congés —</strong> ${ferme.message}`;
    annonce.hidden = false;
  }

  /* ---------- Statut ouvert / fermé ---------- */

  function majStatut() {
    const t = new Date();
    const el = $$("[data-statut]");
    if (!el.length) return;
    let state, texte;
    const c = creneau(t);
    if (estEnConge(t)) {
      state = "holiday";
      texte = `En congé jusqu'au ${dateLongue(parseJour(ferme.au))}`;
    } else if (c && t >= aHeure(t, c.debut) && t < aHeure(t, c.fin)) {
      state = "open";
      texte = `Ouvert maintenant · jusqu'à ${hhmm(c.fin)}`;
    } else {
      const [p] = prochainsCreneaux(t, 1);
      state = "closed";
      if (p) {
        const demain = new Date(t); demain.setDate(t.getDate() + 1);
        const quand = p.date.toDateString() === t.toDateString() ? "aujourd'hui"
          : p.date.toDateString() === demain.toDateString() ? "demain"
          : JOURS[p.date.getDay()];
        texte = `Fermé · prochaine vente ${quand} à ${hhmm(p.debut)}`;
      } else {
        texte = "Fermé pour le moment";
      }
    }
    el.forEach((s) => { s.dataset.state = state; $(".txt", s).textContent = texte; });
  }
  majStatut();
  setInterval(majStatut, 60000);

  // Carte « aujourd'hui » et saison en cours dans les horaires.
  $$(".day[data-jour]").forEach((day) => {
    if (Number(day.dataset.jour) === now.getDay() && !estEnConge(now)) day.classList.add("is-today");
  });
  const saison = estSaisonMarche(now) ? "ete" : "hiver";
  $$("[data-saison]").forEach((s) => {
    const actuel = s.dataset.saison === saison;
    s.classList.toggle("is-dim", !actuel);
    const badge = $(".season-badge", s);
    if (badge) badge.hidden = !actuel;
  });

  /* ---------- En-tête & navigation ---------- */

  const header = $(".site-header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  if (toggle && nav) {
    const fermer = () => { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); };
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", fermer));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") fermer(); });
  }

  $$("[data-annee]").forEach((el) => { el.textContent = now.getFullYear(); });

  /* ---------- Apparition au défilement ---------- */

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal, .stat").forEach((el) => io.observe(el));
  } else {
    $$(".reveal, .stat").forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Sommaire actif (page « Notre pain ») ---------- */

  const tocLinks = $$(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map(tocLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tocLinks.forEach((a) => a.classList.remove("is-active"));
        const a = map.get(e.target.id);
        if (a) a.classList.add("is-active");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }
})();
