# Painprenelle — v2 redesign proposal

Preview: open `v2/index.html` locally. After a push it's at **https://painprenelle.be/v2/**.
Nothing outside `v2/` was changed.

## What I found reviewing the current site

**Bugs**
- The footer email link on every page is misspelled: `mailto:info@painprennelle.be` (double "n"), so it never reaches Caroline.
- The page body still contains Mobirise filler text ("free css templates", "bootstrap template", "portfolio website templates").
- The order form posts through Mobirise's form relay (an encrypted token tied to the Mobirise app). If that service changes, orders silently stop arriving.
- Typo on the presentation page: "La pain a toujours été…"
- Footer still says © 2024.

**Stale or exposed content**
- `index2.html` and `video.html` are still live with the old phone number, old prices, old bread names and old hours (orders "jusqu'au jeudi 20h").
- `backup.zip` (7.5 MB, a full Mobirise project backup) is committed and publicly downloadable at painprenelle.be/backup.zip.
- `assets/images/background1.jpg` is a stock photo of an office.
- Duplicate images are named both with and without spaces/accents.

**UX**
- There's no strong hero and no visual identity, even though Caroline has a beautiful watercolour logo and professional photos that are mostly unused.
- The holiday notice has to be edited by hand in two places (home and Actualités).
- On mobile, all the content is one long stack of identical-looking blocks.

## What v2 does

| | |
|---|---|
| **Visual identity** | Palette taken from the watercolour: cream paper, leaf green, wheat gold. Serif headlines (Fraunces) with a handwritten accent (Caveat). Uses the real workshop photos: kneading, flour, wood fire. |
| **Order form** | Same as today: Nom, Email, Téléphone, Commande, sent through the same Formoid/Mobirise relay with the same encrypted address token, so orders arrive exactly as before. It's only restyled. (jQuery + `formoid.min.js` are copied into `v2/vendor/` for this.) |
| **Live status** | "Ouvert maintenant · jusqu'à 20h" / "Fermé · prochaine vente vendredi à 16h" / "En congé jusqu'au…", plus a highlight on today's card and the current Saturday season. |
| **One place to edit** | Holidays, season months and email live in the `REGLAGES` block at the top of `script.js`. The holiday banner disappears by itself after the last day off. |
| **Notre histoire** | All of Caroline's original text is kept (only typos fixed), as a chaptered read with a sticky table of contents. It adds the nutrition figures as small stat cards, a stone mill vs. steel rollers comparison, and the 4 benefits of levain as cards. |
| **Technical** | Two HTML pages + 1 CSS + 1 JS. Bootstrap and the Mobirise runtime are gone; only jQuery + Formoid are kept for the order form. Images are resized (heaviest 160 KB). It also adds schema.org `Bakery` data for Google, real alt text, keyboard focus styles, reduced-motion support, and pages tested at desktop and 390 px phone width. |

## Decisions for you / Caroline

1. **Order sending.** Unchanged for now (Formoid relay). It's still a dependency on Mobirise's service; replacing it later (e.g. Formspree) would be a small change.
2. **Saturday season.** The old text says "novembre à avril" *and* "avril à octobre". v2 treats **April as market season**. Change `marche.debutMois` if that's wrong.
3. **"35 ans"** in the bio may be out of date.
4. **Going live.** Remove the `<meta name="robots" content="noindex">` line from both pages and move `v2/*` to the root, or point links at it. If Mobirise is still used to publish, it would overwrite the root, so decide whether to keep editing in Mobirise or switch to these hand-written files.
5. Consider deleting `backup.zip`, `index2.html` and `video.html` from the live site.
