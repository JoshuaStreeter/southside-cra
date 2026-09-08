# South St. Petersburg CRA — Homebuyer Assistance Knowledge Base
**Version 4.0 — reconstructed September 7, 2026**
Maintainer: Josh, IBuyStPete.com
Rebuilt from CRA_GPT_Knowledge_V3 (April 2026) plus corrections from the June and July 2026 work sessions.

## How to read this file
Every fact line carries a tag so the site, the chat assistant, and any human editor know how much to trust it:

- `[DIRECTOR]` — told to Josh directly by the city program director or program staff. Highest trust. Overrides the city website.
- `[CITY-WEB]` — from an official stpete.org page. Reliable on rules, unreliable on status (pages go stale).
- `[HUD/SHIP]` — federal/state definitions or published income limits.
- `[JOSH]` — Josh's own professional experience (broker/investor, Pinellas).
- `[DERIVED]` — math or interpretation built on the above.
- `[UNVERIFIED]` — plausible but not confirmed. Do not present as fact.

Each tag may carry a date, e.g. `[DIRECTOR 2026-04]`. When you learn something new, add a line with today's date rather than silently editing the old one, unless the old line is simply wrong — then replace it and note the change in the Changelog at the bottom.

---

## 1. What the program is

- `[CITY-WEB]` The South St. Petersburg Community Redevelopment Area (CRA) funds a **Purchase Assistance Program** for buyers of homes located inside the CRA boundary.
- `[CITY-WEB]` The money comes from tax-increment financing: property-tax growth inside the CRA is set aside and reinvested in the area, including homebuyer assistance. It is not a loan from a bank and it is not charity — it's the neighborhood's own tax growth being returned to residents.
- `[JOSH]` The audience for this resource is working households — servers, teachers, nurses, police, trades, local families — who either don't know the program exists or don't believe they could qualify. The barrier is disbelief, not information.
- `[JOSH]` The city website is frequently out of date on program status, funding, and income figures. When this file and the city website disagree, this file wins unless the city page is newer than the tag date here.

---

## 2. Boundary

- `[CITY-WEB]` Rough edges: **North** = 2nd Ave N / I-275 / I-175 / Booker Creek. **East** = 4th St S. **South** = 30th Ave S. **West** = 49th St S.
- `[CITY-WEB]` The exact polygon is published on the city's Geohub as "South St. Pete Community Redevelopment Area," dataset ID `81d48cd538f34c7f9aba176f2a85a2e0`. The site uses this GeoJSON for address checks.
- `[JOSH]` Addresses near the edge should be verified with the city before anyone plans around them. The map is a screening tool, not a ruling.

---

## 3. Purchase assistance — the formula

- `[DIRECTOR 2026-09]` Assistance = **20% of purchase price + up to $10,000 toward closing costs**, with a **hard cap of $75,000 total**. The closing-cost portion is inside the cap, not on top of it. (Was $5,000 through April 2026 — city website may still show the old figure.)
- `[CITY-WEB]` Buyer must contribute approximately **1% of the purchase price** from their own funds.
- `[CITY-WEB]` **Maximum purchase price: $544,233.** `[UNVERIFIED]` whether this has been updated for FY2026 — check.
- `[CITY-WEB]` Home must be the buyer's **primary residence**.
- `[DIRECTOR 2026-04]` The **lender** submits the CRA application on the buyer's behalf through the city portal. The buyer does not apply directly, and NHS does not submit it either.
- `[DERIVED]` Worked example: $300,000 price → 20% = $60,000 + $10,000 closing = $70,000 (under cap). $350,000 price → $70,000 + $10,000 = $80,000, capped at $75,000. With the full $10,000 closing allowance the cap is reached at a purchase price of $325,000.

---

## 4. Eligibility

### 4.1 Income (AMI)
- `[CITY-WEB]` Eligibility runs to **140% of Area Median Income** for the Tampa–St. Petersburg–Clearwater MSA, adjusted for household size.
- `[HUD/SHIP 2026-06]` **FY2026 SHIP limits (effective May 2026), 2-person household: 100% AMI = $91,700; 120% AMI = $110,040.** This is the confirmed current figure and it moved substantially from the FY2025 numbers below.
- `[HUD/SHIP FY2025 — STALE]` Prior-year figures, kept for reference until the full FY2026 table is loaded:
  - 1-person: 80% $58,450 · 100% $73,000 · 120% $87,600 · 140% $102,200
  - 2-person: 80% $66,800 · 100% $83,400 · 120% $100,150 · 140% $116,760
  - 3-person: 80% $75,150 · 120% $112,650 (100% and 140% were interpolated, never verified)
  - 4-person: 80% $83,500 · 120% $125,150 (100% and 140% were interpolated, never verified)
- `[TODO]` Load the full FY2026 SHIP table for 1–8 person households at 80/100/120/140% from the City of St. Petersburg's official FY2026 income limits. Until then, any figure other than the 2-person FY2026 line must be labeled "estimated" on the site.
- `[DIRECTOR 2026-04]` **Funding status: as of April 2026 the city was over its spending limit for applications in the 81–140% AMI band.** Applicants in that band may be waitlisted or declined for funding reasons even though they meet the rules. Applicants at or below 80% AMI were still being funded. `[TODO]` Re-verify — this is the single most important status fact on the site.

### 4.2 Forgiveness tiers
- `[CITY-WEB]` **At or below 80% AMI:** 100% forgiven after 10 years of owner occupancy.
- `[CITY-WEB]` **81–120% AMI (inside the CRA):** 100% forgiven after 10 years of owner occupancy.
- `[CITY-WEB]` **121–140% AMI:** Deferred for 5 years, then 50% of the assistance is repaid over the following 5 years.
- `[JOSH]` Never tell a visitor the assistance "will be forgiven." Say "may be forgivable if you stay and occupy for 10 years." Sale, refinance-out, or moving before the term triggers repayment rules.

### 4.3 First-time homebuyer
- `[CITY-WEB]` Required. Defined as **not having owned a home in the last 3 years**.
- `[HUD/SHIP]` The program uses the HUD/SHIP definition, which is broader than people assume. These count as first-time buyers even if they owned recently:
  - Divorced or legally separated individuals who only owned a home jointly with a spouse
  - Single parents who only owned with a former spouse while married
  - Displaced homemakers who owned only with a spouse
  - Documentation of the divorce/separation is required.
- `[CITY-WEB]` If either spouse meets the test, the couple is treated as first-time buyers.

### 4.4 Homebuyer education
- `[CITY-WEB]` An **8-hour HUD-approved homebuyer education class** must be completed, with certificate, before closing.
- `[JOSH]` Each co-applicant must register and attend separately.
- `[JOSH]` Certificate expiration rules vary by provider and lender — confirm with the lender and NHS before choosing a provider other than NHS.

---

## 5. HUD-approved education providers

**Never compute "the next class date" from today's date. List the dates and let the person choose.**

### Neighborhood Home Solutions (NHS) — primary, St. Pete
- 1600 Dr. Martin Luther King Jr. St. S, St. Petersburg, FL 33701
- (727) 821-6897 · nhsfl.org · English and Spanish
- 2026 classes, all Saturdays 8:30am–4:45pm: Jan 24 · Feb 28 · Mar 28 · Apr 25 · May 23 · Jun 20 · Jul 18 · Aug 15 · **Sep 19** · Oct 17 · Nov 14 · Dec 12
- Flyer: https://nhsfl.org/wp-content/uploads/2026/01/HOMEBUYER-EDUCATION-FLYER-2026-2.pdf
- `[TODO]` 2027 schedule when published.

### Suncoast Housing Connections — Clearwater
- (727) 442-7075 · suncoasthousingconnections.org · monthly classes, Pinellas and Pasco

### Solita's House — Tampa, virtual
- (813) 425-4847 · solitashouse.org · virtual Saturday classes

### Foundation for Debt Management — online, free for Florida residents
- (727) 254-5353 · homebuyercert.org · code **FLNJ** · self-paced

### Catholic Charities of St. Petersburg
- (727) 893-1313 · ccdosp.org · English, Spanish, French, Arabic

### REACH — Tampa
- (561) 491-1670 · reach4housing.org

---

## 6. Who does what (this is where the city site confuses people)

- `[DIRECTOR 2026-04]` **The City of St. Petersburg** administers CRA purchase assistance, the rehab rebate, and the facade grant. Applications go through the city portal, submitted by the lender.
- `[DIRECTOR 2026-04]` **Neighborhood Home Solutions (NHS)** is completely separate from the city and the CRA. NHS provides the education class, financial counseling, and lender referrals. NHS does not administer, approve, or fund any of the city programs. Send people to NHS for the certificate and counseling — not to "apply."
- `[JOSH]` **The lender** is the gatekeeper. A lender who has closed CRA deals before is worth far more than a slightly better rate from one who hasn't.

---

## 7. Other programs that can stack

### 7.1 Facade Beautification Grant (city name: Affordable Single-Family Facade Improvement Grant)
- `[DIRECTOR 2026-04]` **$15,000** for exterior improvements.
- `[DIRECTOR 2026-09]` **Paid up front as cash** — this is the exception among the rehab programs, which are reimbursements. Do not describe it as a reimbursement.
- `[CITY-WEB 2026-09]` For income-eligible owner-occupants of single-family homes. `[TODO]` Confirm the current income limit and whether it's CRA-only — do not assume a figure.

### 7.2 Rebates for Affordable Residential Rehabs
- Source page: https://www.stpete.org/residents/grants___loans/rebates_for_affordable_residential_rehabs.php
- `[CITY-WEB]` City rebates **40% of pre-approved construction cost**, paid as a check **after** work is done and inspected. Buyer pays the contractor, then gets the rebate.
- `[CITY-WEB]` **Minimum $10,000** investment per unit. `[JOSH]` There is a maximum but it's high.
- `[CITY-WEB]` Income limit **at or below 120% AMI**. Licensed contractors required.
- `[CITY-WEB]` Eligible work: structural, roof, electrical, plumbing, HVAC, windows, doors, kitchen, bath, ADUs.
- `[DIRECTOR 2026-04]` Program is now **citywide**, not CRA-only. First-come, first-served until funding is exhausted.
- `[JOSH 2026-09]` This and the other repair programs are **reimbursements** — buyer pays, then gets the check. Only the facade grant is up-front cash.
- **Status, checked 2026-09-07:** the city page still carries the "applications temporarily on hold" notice and the portal still lists the program. `[DIRECTOR 2026-06]` said active. No first-hand knowledge since June. Site should show: "Program exists; accepting applications is on-and-off — call the city to confirm before planning around it." `[TODO]` Ask staff whether the hold notice is real or stale.

### 7.3 FHA 203(k) renovation loan
- `[HUD 2026-09]` One FHA-insured **first mortgage** covering purchase + rehab. At closing the seller is paid and the rehab money goes into a lender-held escrow, released to the contractor in draws as inspected work is completed (up to about 6 months). Not a second mortgage and nothing gets "rolled in" later — it's a single loan from day one, sized on the after-repair value.
- `[HUD]` Two flavors: **Limited** (smaller, non-structural projects, no consultant) and **Standard** (larger/structural, requires a HUD 203(k) consultant, minimum $5,000 rehab). Standard FHA MIP applies. Contingency reserve of 10–20% of the rehab bid is financed into the loan.
- `[JOSH]` It's a loan; it is repaid. The 40% rehab rebate, if active, can offset part of what the escrow paid for.
- `[DIRECTOR 2026-04]` Stacking 203(k) + CRA purchase assistance + the 40% rehab rebate in one deal *should* be possible. **Big caveat:** it's complex, few lenders have done it, and it must be confirmed with both the lender and the city before anyone plans around it.

### 7.4 Lender grants
- `[JOSH 2026-06]` **Bank of America** and **Fifth Third** offer $8,000–$15,000 in grants/credits for purchases in this area. These can stack with CRA assistance. Confirm current programs with the lender.
- `[UNVERIFIED 2026-09]` **U.S. Bank** may offer something similar — Josh is finding out.

### 7.5 Programs to leave out
- `[JOSH]` Hometown Heroes and flood-zone content were deliberately excluded from prior builds. Don't add unless Josh says so.

---

## 8. Affordability model (site defaults)

- `[DERIVED]` Max total DTI **45%**. Taxes + insurance estimate **$700/month** (rough). 30-year term. Default rate **6.5%** (editable).
- `[CHECKED 2026-09]` **Property tax — the 0.88% figure is wrong for a new buyer.** ~0.9–1.0% is the *citywide median* effective rate, pulled down by long-time owners under the Save Our Homes 3% cap. That cap **resets at sale**. Year-1 math for a new homesteaded buyer: just value (typically 85–95% of price) minus $50,000 homestead exemption, × combined millage of roughly 18–22 mills. On a $300,000 purchase that's about $4,000–$4,800/yr ≈ **1.3–1.6% of purchase price**. Use **1.5%** as the site default, and show visitors that the seller's current bill is not their bill. After year 1, assessed value growth is capped at 3%/yr.
- `[CHECKED 2026-09]` The Legislature passed a proposed $250,000 homestead exemption (non-school taxes) in June 2026; it needs 60% voter approval in **November 2026**. If it passes, year-1 taxes for these buyers drop sharply. Revisit after the election.
- `[CHECKED 2026-09]` FHA MIP: **1.75% upfront** (usually financed) + **0.55%/yr** on a 30-year loan with under 5% down (**0.50%** with 5–10% down). The 0.85% figure is the pre-March-2023 rate and is outdated. Duration: **11 years if original LTV ≤ 90%, otherwise life of loan.** It does not cancel on its own — only refinance or payoff removes it. Conventional PMI cancels at 80% LTV (automatically at 78%). Rule of thumb: about $46/month per $100K borrowed. Note for the calculator: CRA assistance lowers the first-mortgage LTV, so a buyer with 20% CRA money may land at or below 80% LTV and avoid MI on a conventional loan entirely — a big monthly savings worth surfacing.
- `[DERIVED]` Purchase price is solved iteratively: the CRA contribution reduces the first mortgage, which raises the price the same monthly payment supports.

---

## 9. Voice and rules for the chat assistant

- Assume South St. Pete CRA unless told otherwise. Answer first, clarify second.
- Plain English, 2–4 short paragraphs, under 150 words unless a full scenario is requested. No headers, no bullets in chat replies.
- Never say "you qualify." Say "you may qualify" or "this looks promising."
- Never say "will be forgiven." Say "may be forgivable."
- Never present the rehab rebate or facade grant as money at closing.
- Always flag the 81–140% AMI funding status when income lands in that band.
- End scenario answers with: "These are estimates — verify with a lender who has closed CRA deals, or Neighborhood Home Solutions at (727) 821-6897."
- Do not dumb things down for people who clearly know real estate.

---

## 10. Official links
- City purchase assistance: https://www.stpete.org/residents/grants___loans/purchase_assistance_program.php
- CRA housing grants: https://www.stpete.org/residents/grants___loans/cra_housing-based_grants.php
- Rehab rebates: https://www.stpete.org/residents/grants___loans/rebates_for_affordable_residential_rehabs.php
- HUD income limits: https://www.huduser.gov/portal/datasets/il.html (use the Tampa–St. Petersburg–Clearwater MSA table)
- CRA boundary GeoJSON: https://geohub-csp.opendata.arcgis.com/datasets/81d48cd538f34c7f9aba176f2a85a2e0
- NHS: https://nhsfl.org

---

## 11. Open questions — verify with city staff
1. Full FY2026 AMI table, 1–8 persons, 80/100/120/140%.
2. Current funding status for the 81–140% band. Waitlist? Reopening date?
3. Is the $544,233 purchase price cap still current?
8. Is the $10,000 closing-cost allowance formally in the program guidelines yet, or staff practice?
9. Facade grant: current income limit, CRA-only or citywide, and whether it can stack with the rehab rebate on the same property.
4. Rehab rebate: active or on hold today? Maximum rebate amount?
5. Facade grant: exact income limit and whether it's CRA-only.
6. Which lenders have actually closed CRA deals in the last 12 months (for the site's referral list).
7. Does the city accept education certificates from all six providers above, or only some?

---

## Changelog
- **2026-09-08 V4.2** — `[DERIVED 2026-09]` Added `estClosingCostPct` 0.025 to the site's affordability defaults (typical Pinellas buyer costs; the city's closing allowance offsets it). "Cash you bring" is now the 1% buyer contribution plus any estimated closing costs above the city's allowance, floored at the 1% contribution. `[DERIVED 2026-09]` All 80% and 140% AMI figures are now derived from each household's 100% figure at 0.8x and 1.4x, replacing the mixed FY2025/FY2026 rows — a 2-person household at $68,000 (74% of the verified FY2026 100% figure) was landing above the stale FY2025 80% limit of $66,800 and being shown the 81–140% waitlist warning. All rows stay `estimated: true` until the full FY2026 SHIP table is loaded (open question 1). Note that HUD does not publish 80% limits as a straight 0.8x of the 100% figure, so these remain a stopgap.
- **2026-09-07 V4.1** — Closing-cost allowance $5K→$10K (employee). Facade grant is up-front cash, not reimbursement. 203(k) structure corrected (single first mortgage with escrow, not a second). Property tax default 0.88%→1.5% (SOH reset). FHA MIP 0.85%→0.55%. Rehab rebate status re-checked (city still shows hold). U.S. Bank grant flagged unverified. Nov 2026 homestead ballot noted.
- **2026-09-07 V4.0** — Reconstructed from V3 chat record. Added source tags, FY2026 2-person AMI, homestead tax rate, FHA MIP rules, lender grants, rehab-rebate status conflict, and the open-questions list. Marked FY2025 AMI figures stale.
- **2026-04-29 V3** — Forgiveness tiers, first-time buyer/divorce rules, six education providers, rehab rebate detail, NHS role clarified.
