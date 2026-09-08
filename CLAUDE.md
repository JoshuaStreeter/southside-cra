# CODING RULES (Karpathy guidelines — paste at top of every repo CLAUDE.md; cloud sessions don't read ~/.claude)
Adapted from multica-ai/andrej-karpathy-skills (MIT), from Karpathy's notes on LLM coding pitfalls. Bias: caution over speed; use judgment on trivial tasks.

**1. Think before coding.** State assumptions explicitly; if uncertain, ask. If multiple interpretations exist, present them — never pick silently. If a simpler approach exists, say so and push back. If something is unclear, stop and name it.

**2. Simplicity first.** Minimum code that solves the problem. No features beyond what was asked, no abstractions for single-use code, no unrequested "flexibility," no error handling for impossible cases. If 200 lines could be 50, rewrite. Test: would a senior engineer call it overcomplicated?

**3. Surgical changes.** Touch only what the request requires. Don't improve adjacent code, refactor the unbroken, or restyle to taste — match existing style. Mention unrelated dead code; don't delete it. Do remove orphans YOUR change created. Every changed line must trace to the request.

**4. Goal-driven execution.** Convert tasks to verifiable goals: "fix the bug" → "write a failing test that reproduces it, make it pass"; "refactor" → "tests pass before and after." For multi-step work, state a short plan with a verify: check per step, then loop until verified.

Source: https://github.com/multica-ai/andrej-karpathy-skills/blob/main/skills/karpathy-guidelines/SKILL.md

---

# SOUTH ST. PETE CRA HOMEBUYER SITE — PROJECT BRIEF
Owner: Josh (IBuyStPete.com). Real estate broker/investor, no-code instruction-giver on a Chromebook — minimize terminal work, explain in plain English.
Stack: static HTML/CSS/JS in `public/` + one Netlify Function. No framework, no build step. Deploy: Netlify (Josh's account). Repo: GitHub JoshuaStreeter.
Baseline: September 7, 2026.

## Why this site exists
The South St. Pete Community Redevelopment Area gives up to $75,000 toward a home purchase. Working people in the neighborhood don't use it because they don't believe homeownership is possible for them. The city website is wrong and stale. This site's job, in order:
1. **Defeat disbelief** using familiar numbers (rent vs. buying, move-in deposit vs. cash to close), not motivation.
2. Let a visitor check an address, enter household size + income, and see **exactly** what they'd get and whether they should be talking to a lender.
3. Answer questions from a knowledge base Josh maintains with first-hand info from the city employees who run the program.

## Sources of truth (read these first)
- `knowledge/CRA_Knowledge_V4.md` — every program fact, source-tagged. **Section 9 = hard rules for all copy and chat output.** Section 11 = open questions; anything listed there renders as "verify with the city."
- `data/program-data.json` — every number the calculator uses. **Never hardcode a program number in HTML or JS.** Fetch this file at load.
- Nothing in either file is to be "corrected" from your own knowledge. If you think a fact is wrong, say so in chat; don't change it.

## Site flow (single page, mobile-first)
1. **Hero** — full-bleed real photo of the neighborhood (Josh supplies; placeholder `public/img/hero.jpg`). Headline leads with the rent-vs-buy cash comparison. Three stat chips from program-data (max assistance, cap price, "forgivable after 10 yrs" — say *forgivable*, never *forgiven*).
2. **Address check** — Leaflet map + `public/cra_boundary.geojson` overlay. Geocode with US Census Bureau geocoder (`https://geocoding.geo.census.gov/geocoder/locations/onelineaddress`), Nominatim fallback. Client-side point-in-polygon. Three verdicts: inside / outside / can't find. Inside → scroll to calculator. No API keys.
3. **Calculator** — inputs: household size (1–4+), annual income, credit range, monthly debts (optional), current rent (optional), rate (default from JSON). Outputs: AMI tier with forgiveness rule and *funding-status warning for 81–140%*, city assistance (20% + closing allowance, capped), max purchase price (iterative solve — assistance lowers the first mortgage), cash to close (1% + est. costs), monthly payment incl. tax at `propertyTaxPctOfPrice` (Save Our Homes reset — explain the seller's bill isn't theirs), FHA MIP vs conventional (surface when CRA money pushes conventional LTV ≤ 80% → no MI). Rent comparison if rent given. Every AMI figure with `estimated:true` gets a visible "estimated" tag. Color: green fully forgivable / amber partial / red over 140%.
4. **What this program does NOT do** — credibility box. Naming the strings is the proof it's real.
5. **Stacking** — facade grant (cash up front), rehab rebate (reimbursement, status intermittent — "call to confirm"), lender grants, 203(k) with the caveat from the MD.
6. **Who does what** — City administers; lender submits; NHS is class + counseling only. Class dates listed, never "next class" computed.
7. **Chat** — text only. POST `/api/chat` with `{messages}`. Starter chips: How much can I get? / I make $70K — do I qualify? / What are the boundaries? / What classes are available? / I'm divorced — do I still qualify? / I'm pre-approved for $200K — what can I buy? / Can I stack this with other programs? / What's the facade grant?
8. **Lead capture** — name, phone, email, "I'm interested in…" select. Use Netlify Forms (`data-netlify="true"` + honeypot). No third-party CRM. Josh sets the notification email in the Netlify dashboard.
9. **Footer** — "Last verified {lastVerified}" from JSON, disclaimer, city + NHS links.

## Design direction (use `/design` — Josh wants this to read as a neighborhood resource, not an AI product)
- Real photography over illustration. No purple/violet, no gradient blobs, no glassmorphism, no "AI" palette. Avoid anything that looks like a Claude or ChatGPT default.
- Warm, civic, trustworthy: think a good credit union or a well-funded neighborhood nonprofit. Earlier palette Josh liked: deep navy / terracotta / warm gold, Playfair Display + Nunito. Treat as a starting point, not a mandate.
- Big, readable numbers. People will read this on a phone at a kitchen table.
- Plain English everywhere. Sixth-grade reading level for body copy; no condescension.

## Hard rules (from knowledge base Section 9)
- Never "you qualify" → "you may qualify." Never "forgiven" as a promise → "may be forgivable."
- Rehab rebate is never money at closing. Facade grant is cash up front.
- Always show the 81–140% AMI funding warning when income lands there.
- Scenario outputs end with the verify-with-a-lender line.

## Definition of done
- `verify.sh` passes twice from a clean checkout: JSON validates; every number rendered on the page traces to program-data.json (grep for hardcoded dollar figures in HTML/JS → zero); calculator unit checks (e.g. $300K price → $70,000 assistance; $350K → $75,000 cap; 2-person $95,000 income → 81–120% band with funding warning); chat function returns 200 with a stubbed key; Lighthouse mobile ≥ 90 accessibility.
- Deliberate-failure counter-test: change `closingCostMax` to 5000 and confirm the $300K case now shows $65,000.
- Deployed to Netlify with `ANTHROPIC_API_KEY` set in site env, `cra_boundary.geojson` present, address `725 17th Ave S, St Petersburg, FL` returns *inside*.

## Session guidance
- Opus 5 high effort for the design/build session; Sonnet for patches.
- Do NOT use Netlify's embedded agent (it burned Josh's credits once). Deploy via `netlify deploy` or git push only.
- Two commits minimum: scaffold+calculator, then design pass. Ask before adding any dependency beyond Leaflet.
