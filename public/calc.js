/* Program math. Every figure comes from data/program-data.json - nothing here
   hardcodes a program number. Loaded as a plain script in the browser and
   required by verify.sh under node. */
(function (root) {
  "use strict";

  function monthlyPI(principal, annualRatePct, termMonths) {
    if (principal <= 0) return 0;
    var r = annualRatePct / 100 / 12;
    if (r === 0) return principal / termMonths;
    var growth = Math.pow(1 + r, termMonths);
    return principal * r * growth / (growth - 1);
  }

  // 20% of the price plus the closing allowance, held to the program cap.
  function assistance(data, price) {
    var a = data.assistance;
    return Math.min(price * a.pctOfPrice + a.closingCostMax, a.totalCap);
  }

  // The buyer's own required share of the price.
  function buyerContribution(data, price) {
    return price * data.assistance.buyerContribPct;
  }

  /* What the buyer actually writes a check for: their required share, plus any
     estimated closing costs the city's allowance does not cover. Never less
     than the required share. */
  function cashToClose(data, price) {
    var a = data.assistance;
    var estimated = price * data.affordability.estClosingCostPct;
    return buyerContribution(data, price) + Math.max(0, estimated - a.closingCostMax);
  }

  function firstMortgage(data, price) {
    return Math.max(0, price - assistance(data, price) - buyerContribution(data, price));
  }

  function loanToValue(data, price) {
    return price > 0 ? firstMortgage(data, price) / price : 0;
  }

  function noConventionalMI(data, price) {
    return loanToValue(data, price) <= data.affordability.conventional.pmiCancelsAtLtv;
  }

  // Loan, taxes and insurance. Mortgage insurance is reported separately
  // because whether it applies depends on the loan type the buyer chooses.
  function monthlyHousing(data, price, annualRatePct) {
    var aff = data.affordability;
    return monthlyPI(firstMortgage(data, price), annualRatePct, aff.loanTermMonths)
      + price * aff.propertyTaxPctOfPrice / 12
      + aff.homeownersInsuranceAnnual / 12;
  }

  function fhaMortgageInsurance(data, price) {
    var loan = firstMortgage(data, price);
    var fha = data.affordability.fha;
    return {
      monthlyLow: loan * fha.annualMip5to10Down / 12,
      monthlyHigh: loan * fha.annualMipUnder5Down / 12,
      upfront: loan * fha.upfrontMip
    };
  }

  /* The assistance lowers the first mortgage, which raises the price the same
     payment supports, so price cannot be solved directly. Housing cost rises
     with price throughout, so bisect. */
  function maxPurchasePrice(data, opts) {
    var aff = data.affordability;
    var rate = opts.ratePct == null ? aff.defaultRate : opts.ratePct;
    var budget = opts.annualIncome / 12 * aff.dtiLimit - (opts.monthlyDebts || 0);
    var ceiling = data.assistance.maxPurchasePrice;
    if (!(budget > 0)) return 0;
    if (monthlyHousing(data, ceiling, rate) <= budget) return ceiling;
    var lo = 0, hi = ceiling;
    for (var i = 0; i < 60; i++) {
      var mid = (lo + hi) / 2;
      if (monthlyHousing(data, mid, rate) <= budget) lo = mid; else hi = mid;
    }
    return lo;
  }

  // Household sizes above the largest published row fall back to that row.
  // HUD limits rise with household size, so that is the conservative read.
  function amiRow(data, householdSize) {
    var sizes = Object.keys(data.ami.households).map(Number).sort(function (a, b) { return a - b; });
    var largest = sizes[sizes.length - 1];
    var used = Math.min(Math.max(householdSize, sizes[0]), largest);
    return { row: data.ami.households[String(used)], sizeUsed: used, sizeCapped: householdSize > largest };
  }

  /* Which forgiveness tier an income lands in, by comparing against the
     published limits rather than computing a percentage - the limits are what
     the city applies. */
  function amiBand(data, householdSize, annualIncome) {
    var picked = amiRow(data, householdSize);
    var row = picked.row;
    var tiers = data.forgiveness;
    var result = {
      sizeUsed: picked.sizeUsed,
      sizeCapped: picked.sizeCapped,
      limits: row,
      estimated: row.estimated === true,
      eligible: false,
      tier: null,
      bandLabel: null,
      bandMax: null,
      incomeLimit: null,
      fundingWarning: false
    };
    var floor = 0;
    for (var i = 0; i < tiers.length; i++) {
      var tier = tiers[i];
      var limit = row[String(tier.amiMax)];
      if (limit == null) continue;
      if (annualIncome <= limit) {
        result.eligible = true;
        result.tier = tier;
        result.bandMax = tier.amiMax;
        result.incomeLimit = limit;
        result.bandLabel = floor === 0 ? "at or below " + tier.amiMax + "%" : "between " + (floor + 1) + "% and " + tier.amiMax + "%";
        break;
      }
      floor = tier.amiMax;
    }
    if (result.eligible) {
      var lowest = tiers[0].amiMax;
      var highest = tiers[tiers.length - 1].amiMax;
      result.fundingWarning = data.fundingStatus.band81to140 === "over-budget"
        && annualIncome > row[String(lowest)]
        && annualIncome <= row[String(highest)];
    } else {
      result.bandMax = tiers[tiers.length - 1].amiMax;
      result.incomeLimit = row[String(result.bandMax)];
    }
    return result;
  }

  var api = {
    monthlyPI: monthlyPI,
    assistance: assistance,
    buyerContribution: buyerContribution,
    cashToClose: cashToClose,
    firstMortgage: firstMortgage,
    loanToValue: loanToValue,
    noConventionalMI: noConventionalMI,
    monthlyHousing: monthlyHousing,
    fhaMortgageInsurance: fhaMortgageInsurance,
    maxPurchasePrice: maxPurchasePrice,
    amiRow: amiRow,
    amiBand: amiBand
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CRACalc = api;
})(typeof window !== "undefined" ? window : globalThis);
