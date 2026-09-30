# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are people in Brazil evaluating electric and plug-in hybrid cars, at any stage of the journey — from EV-curious people who don't yet know if switching makes financial sense, to active shoppers close to a purchase decision, narrowing down 2-4 finalists before visiting a dealership. The site serves both stages equally by design: the first-visit tutorial, persona filters (Urbano, Família, Aventura, Performance, Custo-Benefício) and monthly cost simulator lower the barrier for newcomers, while side-by-side comparison (up to 4 cars) and full specs serve people ready to decide.

## Product Purpose

Escolha seu EV helps people in Brazil compare every electric and plug-in hybrid car sold officially in the country, and see what switching would actually cost or save them personally — whether they currently drive a gas car, rely on Uber/public transport, or don't have a car at all. Success is a visitor shortlisting real, current, unbiased options and seeing a believable personal cost delta, without having to visit multiple dealer or manufacturer sites and do that math themselves.

## Positioning

Two things combined, neither alone is the pitch: (1) an independent, always-current catalog of every EV/PHEV sold officially in Brazil in one place, free of dealership bias, kept current by a weekly automated scan for new launches plus a dataset that ships with the code as source of truth; and (2) translating those specs into the visitor's own numbers — monthly savings vs. their current car or their Uber/transporte público spend — rather than leaving them to work that out themselves.

## Operating Context

- Catalog data lives in Supabase (`cars` table), synced automatically from `src/App.jsx`'s `SEED_CARS` constant on every push to `main` via a GitHub Action; the code is the editorial source of truth, Supabase is the shared read path all visitors hit.
- If Supabase is unreachable or unconfigured, the site falls back to the embedded `SEED_CARS` catalog and never breaks.
- A separate weekly GitHub Action scans 6 YouTube channels for likely EV/PHEV Brazil launch videos and opens a PR with candidates for manual review — it never updates the site on its own.
- Personal visitor state (theme, "minha mobilidade" profile, tutorial-seen flag) lives only in browser localStorage, deliberately not synced across devices or shared between visitors.
- Deployed on Vercel from the GitHub repo.

## Capabilities and Constraints

- Persona-based reordering (Urbano, Família, Aventura, Performance, Custo-Benefício), category and price-range filtering, text search.
- Side-by-side comparison of up to 4 selected cars.
- "Minha mobilidade" flow: visitor registers either their current car or their non-car transport spend (Uber/99/transporte público), and every EV/PHEV then shows an estimated personal monthly savings.
- First-visit guided tutorial (localStorage-gated) that spotlights the persona row, filters, badges, compare button, and mobility button.
- Light/dark theme, persisted per visitor.
- PWA-installable (manifest, iOS home-screen meta, app icon) — no native app.
- Undecided: monetization and long-term scope. The project started as an independent side project, but has real outside interest from people it has already been shown to — whether it stays purely independent or grows further is explicitly open. Future design work should not assume or lock in "hobby project, no monetization" as a constraint.

## Evidence on Hand

- Full existing car catalog with real specs (price, power, battery, range, wallbox, warranty, etc.) in `src/App.jsx` (`SEED_CARS_DETAILED` + `BULK_CARS`), each priced/verified with its source noted in the commit that added or corrected it.
- No testimonials, press, or case studies on file — do not fabricate any.

## Brand Commitments

Product name "Escolha seu EV" and its existing app icon/PWA identity are established. No other binding voice or visual constraints confirmed yet.

## Product Principles

- Data neutrality is the trust asset: no dealership or manufacturer bias, sourced and dated, never fabricated.
- Meet visitors wherever they are in the journey — curiosity and near-decision are both first-class, not one funnel forced onto the other.
- Personal economics over spec sheets: what matters is what switching costs or saves *this* visitor, not just the numbers on their own.
- Never break: catalog fallback and non-blocking errors take priority over showing nothing.
- Personal data stays personal: visitor-specific state is local-only by default, and that's a deliberate choice, not a gap.
