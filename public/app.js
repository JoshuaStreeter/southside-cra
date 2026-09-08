/* Page wiring. Every program figure is read from data/program-data.json at
   load, so changing that file changes the page. Nothing here holds a program
   number of its own. */
(function () {
  "use strict";

  var DATA = null;
  var BOUNDARY = null;
  var CENSUS = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
  var NOMINATIM = "https://nominatim.openstreetmap.org/search";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- formatting ---------- */

  var money0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  function money(n) { return money0.format(Math.round(n)); }

  function percent(fraction) {
    var n = fraction * 100;
    return (Math.round(n * 100) / 100) + "%";
  }

  function longDate(iso) {
    var parts = String(iso).split("-").map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] || 1));
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  }

  function shortDate(iso) {
    var parts = String(iso).split("-").map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] || 1));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }

  function at(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, DATA);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---------- static fills ---------- */

  function fillFromData() {
    $$("[data-money]").forEach(function (n) { n.textContent = money(at(n.getAttribute("data-money"))); });
    $$("[data-pct]").forEach(function (n) { n.textContent = percent(at(n.getAttribute("data-pct"))); });
    $$("[data-num]").forEach(function (n) { n.textContent = String(at(n.getAttribute("data-num"))); });
    $$("[data-text]").forEach(function (n) { n.textContent = String(at(n.getAttribute("data-text"))); });
    $$("[data-date]").forEach(function (n) { n.textContent = longDate(at(n.getAttribute("data-date"))); });
  }

  function buildChips() {
    var a = DATA.assistance;
    var chips = [
      [money(a.totalCap), "the most the city may put toward your purchase"],
      [money(a.maxPurchasePrice), "highest home price the program allows (verify with the city)"],
      [a.occupancyYearsForForgiveness + " yrs", "live there that long and the help may be forgivable"]
    ];
    var list = $("#stat-chips");
    chips.forEach(function (c) {
      var li = el("li", "chip");
      li.appendChild(el("b", null, c[0]));
      li.appendChild(el("span", null, c[1]));
      list.appendChild(li);
    });
  }

  function buildEdges() {
    var edges = DATA.boundary.roughEdges;
    var dl = $("#edges");
    ["north", "east", "south", "west"].forEach(function (side) {
      if (!edges[side]) return;
      var wrapper = el("div");
      wrapper.appendChild(el("dt", null, side.charAt(0).toUpperCase() + side.slice(1)));
      wrapper.appendChild(el("dd", null, edges[side]));
      dl.appendChild(wrapper);
    });
  }

  function crossIcon() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "20"); svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "#A33A2A"); svg.setAttribute("stroke-width", "2.2");
    svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("aria-hidden", "true");
    ["M6 6l12 12", "M18 6 6 18"].forEach(function (d) {
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
    });
    return svg;
  }

  function buildStrings() {
    var years = DATA.assistance.occupancyYearsForForgiveness;
    var items = [
      ["It never touches your hands.", "Your lender applies for it and the city sends it to the closing table."],
      ["You have to live there.", "It has to be your main home. Sell, move out or refinance out before " + years + " years and repayment rules kick in."],
      ["It is for first-time buyers.", "That means no home owned in the last 3 years. If you only owned with a spouse and you are divorced now, you may still count. Bring the paperwork."],
      ["It will not get you a loan.", "You still have to qualify with a lender on your own credit and income."],
      ["You have to sit the class.", "An 8-hour HUD-approved homebuyer class, certificate in hand, before you close. Each buyer signs up separately."],
      ["It is not a sure thing.", "Meeting the rules is not the same as the city having money left this year."]
    ];
    var list = $("#strings");
    items.forEach(function (item) {
      var li = el("li");
      li.appendChild(crossIcon());
      var text = el("div");
      text.appendChild(el("b", null, item[0]));
      text.appendChild(document.createTextNode(" " + item[1]));
      li.appendChild(text);
      list.appendChild(li);
    });
  }

  function programCard(title, amount, tags, body) {
    var card = el("div", "card program");
    var head = el("div", "program__head");
    head.appendChild(el("h3", null, title));
    if (amount) head.appendChild(el("div", "program__amount", amount));
    card.appendChild(head);
    if (tags && tags.length) {
      var row = el("div", "tagrow");
      tags.forEach(function (t) { row.appendChild(el("span", "tag " + t[1], t[0])); });
      card.appendChild(row);
    }
    card.appendChild(el("p", null, body));
    return card;
  }

  function buildPrograms() {
    var p = DATA.programs;
    var host = $("#programs");

    host.appendChild(programCard(
      "Facade grant",
      money(p.facadeGrant.amount),
      [["Cash up front", "tag--up"]],
      "For the outside of the house. This one pays first, unlike the rest. The income limit is not posted clearly, so ask the city what it is before you count on it."
    ));

    var rebate = p.rehabRebate;
    var rebateTags = [["Paid back later", "tag--back"]];
    if (rebate.status !== "active") rebateTags.push(["Call to confirm", "tag--call"]);
    host.appendChild(programCard(
      "Repair rebate",
      percent(rebate.pct),
      rebateTags,
      "The city pays back " + percent(rebate.pct) + " of approved repair work, on at least " + money(rebate.minInvestment) +
      " of work, for households at or below " + rebate.incomeLimitAmi + "% of area median income. You pay the contractor first and the check comes after the work is inspected. It is never money at closing. " +
      rebate.statusNote
    ));

    var grants = p.lenderGrants.filter(function (g) { return g.range; });
    if (grants.length) {
      var low = Math.min.apply(null, grants.map(function (g) { return g.range[0]; }));
      var high = Math.max.apply(null, grants.map(function (g) { return g.range[1]; }));
      var names = grants.map(function (g) { return g.lender; });
      var lastVerified = grants.map(function (g) { return g.verified; }).sort().pop();
      host.appendChild(programCard(
        "Bank grants",
        money(low) + "–" + money(high),
        [["Cash at closing", "tag--up"]],
        names.join(" and ") + " had grants for this area as of " + longDate(lastVerified + "-01") +
        ". They can sit on top of the city money. Ask the lender what is open right now."
      ));
    }

    host.appendChild(programCard(
      "FHA 203(k) repair loan",
      null,
      null,
      "One loan that buys the house and pays for the repairs. The repair money is held by the lender and released as the work is finished and inspected. It is a loan, so you pay it back. Stacking it with the city money should work, but few lenders have done it. Confirm with both the lender and the city before you plan around it."
    ));
  }

  function buildClasses() {
    var c = DATA.classes2026;
    var nhs = DATA.contacts.nhs;
    $("#classes-when").textContent = c.time + ", at " + nhs.address;
    var list = $("#classes");
    c.dates.forEach(function (d) { list.appendChild(el("li", null, shortDate(d))); });
    $("#nhs-phone").href = "tel:" + nhs.phone.replace(/[^0-9+]/g, "");
    $("#nhs-url").href = nhs.url;
    $("#nhs-url").textContent = nhs.url.replace(/^https?:\/\//, "");
  }

  function buildLinks() {
    $("#link-city").href = DATA.contacts.cityProgramUrl;
    $("#link-nhs").href = DATA.contacts.nhs.url;
    $("#link-owner").href = DATA.contacts.owner.url;
    $("#link-owner").textContent = DATA.contacts.owner.name;
    $("#link-citymap").href = DATA.boundary.cityMapUrl;
  }

  /* ---------- map and address check ---------- */

  var map = null, marker = null;

  function ringsOf(geojson) {
    var rings = [];
    function fromGeometry(g) {
      if (!g) return;
      if (g.type === "Polygon") rings.push(g.coordinates);
      else if (g.type === "MultiPolygon") g.coordinates.forEach(function (poly) { rings.push(poly); });
      else if (g.type === "GeometryCollection") g.geometries.forEach(fromGeometry);
    }
    if (geojson.type === "FeatureCollection") geojson.features.forEach(function (f) { fromGeometry(f.geometry); });
    else if (geojson.type === "Feature") fromGeometry(geojson.geometry);
    else fromGeometry(geojson);
    return rings;
  }

  // Ray casting on one ring of [lon, lat] pairs.
  function inRing(lon, lat, ring) {
    var inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  // A polygon's first ring is its outline; the rest are holes.
  function inBoundary(lon, lat) {
    return ringsOf(BOUNDARY).some(function (polygon) {
      if (!inRing(lon, lat, polygon[0])) return false;
      for (var h = 1; h < polygon.length; h++) if (inRing(lon, lat, polygon[h])) return false;
      return true;
    });
  }

  function setUpMap() {
    var fallback = $("#map-fallback");
    if (!BOUNDARY) {
      fallback.textContent = "The boundary file has not been added to this site yet, so addresses cannot be checked here. Use the city's own map in the footer, or call the city.";
      $("#address-submit").disabled = true;
      return;
    }
    if (typeof L === "undefined") {
      fallback.textContent = "The map could not load. The rough streets below still apply, and the city's own map is linked in the footer.";
      return;
    }
    fallback.remove();
    var node = $("#map");
    node.removeAttribute("role");
    node.removeAttribute("aria-label");
    map = L.map(node, { scrollWheelZoom: false });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    var layer = L.geoJSON(BOUNDARY, { style: { color: "#C0563A", weight: 2.5, fillColor: "#C0563A", fillOpacity: 0.16 } }).addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [12, 12] });
  }

  function showVerdict(kind, title, body, offerNext) {
    var box = $("#verdict");
    box.className = "verdict verdict--" + kind;
    $("#verdict-title").textContent = title;
    $("#verdict-body").textContent = body;
    $("#verdict-next").classList.toggle("hidden", !offerNext);
    box.focus();
  }

  function geocodeCensus(address) {
    var url = CENSUS + "?benchmark=Public_AR_Current&format=json&address=" + encodeURIComponent(address);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("census " + r.status);
      return r.json();
    }).then(function (j) {
      var m = j && j.result && j.result.addressMatches && j.result.addressMatches[0];
      if (!m) return null;
      return { lon: m.coordinates.x, lat: m.coordinates.y, label: m.matchedAddress };
    });
  }

  function geocodeNominatim(address) {
    var url = NOMINATIM + "?format=json&limit=1&countrycodes=us&q=" + encodeURIComponent(address);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("nominatim " + r.status);
      return r.json();
    }).then(function (j) {
      if (!j || !j.length) return null;
      return { lon: Number(j[0].lon), lat: Number(j[0].lat), label: j[0].display_name };
    });
  }

  function checkAddress(e) {
    e.preventDefault();
    var raw = $("#address-input").value.trim();
    if (!raw) { showVerdict("unknown", "Type an address first", "Put in a street address, city and state, then press the button again.", false); return; }
    var button = $("#address-submit");
    button.disabled = true;
    button.textContent = "Checking…";

    geocodeCensus(raw)
      .catch(function () { return null; })
      .then(function (hit) { return hit || geocodeNominatim(raw).catch(function () { return null; }); })
      .then(function (hit) {
        if (!hit) {
          showVerdict("unknown", "We could not find that address",
            "Check the spelling, and add the city and state. If it still will not match, the city's own map is linked at the bottom of this page.", false);
          return;
        }
        if (map) {
          map.setView([hit.lat, hit.lon], 15);
          if (marker) marker.remove();
          marker = L.marker([hit.lat, hit.lon]).addTo(map);
          marker.bindPopup(hit.label).openPopup();
        }
        if (inBoundary(hit.lon, hit.lat)) {
          showVerdict("in", "This address is inside",
            hit.label + " sits inside the redevelopment area, so a home here may be eligible. Next, run your own numbers.", true);
        } else {
          showVerdict("out", "This address is outside",
            hit.label + " falls outside the redevelopment area, so this program will not apply to it. If it is close to the edge, ask the city before you rule it out.", false);
        }
      })
      .then(null, function () {
        showVerdict("unknown", "The address check is not answering",
          "Something went wrong looking that address up. Try again in a minute, or use the city's own map linked at the bottom of this page.", false);
      })
      .then(function () {
        button.disabled = false;
        button.textContent = "Check this address";
      });
  }

  /* ---------- calculator ---------- */

  function buildHouseholdChoices() {
    var sizes = Object.keys(DATA.ami.households).map(Number).sort(function (a, b) { return a - b; });
    var host = $("#household");
    sizes.forEach(function (n, i) {
      var last = i === sizes.length - 1;
      var id = "hh-" + n;
      var label = el("label");
      label.setAttribute("for", id);
      var input = document.createElement("input");
      input.type = "radio"; input.name = "household"; input.id = id; input.value = String(n);
      if (n === 2) input.checked = true;
      label.appendChild(input);
      label.appendChild(el("span", null, last ? n + "+" : String(n)));
      host.appendChild(label);
    });
  }

  function figure(label, sub, value) {
    var li = el("li");
    var text = el("div", "label");
    text.appendChild(document.createTextNode(label));
    if (sub) text.appendChild(el("small", null, sub));
    li.appendChild(text);
    li.appendChild(el("div", "value", value));
    return li;
  }

  function noteBox(kind, title, body) {
    var box = el("div", "note note--" + kind);
    var inner = el("div");
    inner.appendChild(el("h3", null, title));
    inner.appendChild(el("p", null, body));
    box.appendChild(inner);
    return box;
  }

  function mayBeForgivable(text) {
    return String(text).replace(/\bforgiven\b/gi, "forgivable");
  }

  function verifyLine() {
    var nhs = DATA.contacts.nhs;
    return el("p", null, "These are estimates — verify with a lender who has closed CRA deals, or " + nhs.name + " at " + nhs.phone + ".");
  }

  function runCalculator(e) {
    e.preventDefault();
    var out = $("#results");
    out.textContent = "";
    out.classList.remove("hidden");

    var size = Number(($("#household input:checked") || {}).value || 1);
    var income = Number($("#income").value);
    var debts = Number($("#debts").value) || 0;
    var rent = Number($("#rent").value) || 0;
    var rate = Number($("#rate").value);
    var credit = Number($("#credit").value);

    if (!(income > 0)) {
      out.appendChild(noteBox("amber", "Put in your yearly income", "The calculator needs your household income before taxes to work out which band you land in."));
      out.focus();
      return;
    }

    var band = CRACalc.amiBand(DATA, size, income);

    if (!band.eligible) {
      out.appendChild(noteBox("red", "This income is over the program limit",
        "For a " + band.sizeUsed + "-person household the program stops at " + money(band.incomeLimit) +
        " a year, so " + money(income) + " a year is over the line for the city's purchase help. " +
        "Household size moves that limit, and how a lender counts your income is not always how you count it, so it is worth confirming."));
      var alt = el("div", "card");
      alt.appendChild(el("p", null, "The bank grants and the repair programs further down this page have their own rules and may still be worth a call."));
      out.appendChild(alt);
      out.appendChild(verifyLine());
      out.focus();
      return;
    }

    var price = CRACalc.maxPurchasePrice(DATA, { annualIncome: income, monthlyDebts: debts, ratePct: rate });

    if (!(price > 0)) {
      out.appendChild(noteBox("amber", "Your monthly debts use up the room",
        "At " + money(income) + " a year, " + money(debts) + " a month in other payments leaves nothing inside the " +
        percent(DATA.affordability.dtiLimit) + " limit lenders work to. Free counseling from " + DATA.contacts.nhs.name +
        " at " + DATA.contacts.nhs.phone + " is the right next call."));
      out.appendChild(verifyLine());
      out.focus();
      return;
    }

    var help = CRACalc.assistance(DATA, price);
    var cash = CRACalc.cashToClose(DATA, price);
    var payment = CRACalc.monthlyHousing(DATA, price, rate);
    var ltv = CRACalc.loanToValue(DATA, price);
    var noMI = CRACalc.noConventionalMI(DATA, price);

    var head = el("div", "headline-figure");
    head.appendChild(el("p", "eyebrow", "What this looks like"));
    head.appendChild(el("p", null, "You may be able to buy a home up to"));
    head.appendChild(el("b", null, money(price)));
    out.appendChild(head);

    var tierBox = el("div", "verdict verdict--" + (band.tier.color === "green" ? "in" : "unknown"));
    tierBox.style.marginTop = "1.25rem";
    var badges = el("div", "badgerow");
    badges.appendChild(el("span", "badge badge--" + (band.tier.color === "green" ? "green" : "amber"), band.tier.label));
    if (band.estimated) badges.appendChild(el("span", "badge badge--outline", "Estimated"));
    tierBox.appendChild(badges);
    tierBox.appendChild(el("p", null,
      "Your income puts you " + band.bandLabel + " of area median income for a " + band.sizeUsed +
      "-person household. The rule for this band: " + mayBeForgivable(band.tier.rule) + "."));
    out.appendChild(tierBox);

    if (band.fundingWarning) {
      var f = DATA.fundingStatus;
      out.appendChild(noteBox("amber", "Money in your band may be waitlisted", f.note.replace(/\s*Re-verify\.\s*$/, "") +
        " You may still apply, but ask the city where funding stands before you write an offer."));
    }

    if (band.sizeCapped) {
      out.appendChild(noteBox("amber", "Bigger households get higher limits",
        "The published table on this site stops at " + band.sizeUsed + " people. Limits rise with household size, so yours is higher than what is shown here. Ask the city for the exact figure."));
    }

    var figures = el("ul", "figures");
    figures.appendChild(figure("City may put in", percent(DATA.assistance.pctOfPrice) + " of the price plus " + money(CRACalc.closingAllowance(DATA, price)) + " toward closing", money(help)));
    figures.appendChild(figure("Cash you bring", "your " + percent(DATA.assistance.buyerContribPct) + " share, plus any closing costs the city's allowance does not cover", money(cash)));
    figures.appendChild(figure("Payment each month", "loan, taxes and insurance", money(payment)));
    out.appendChild(figures);

    var mi = el("div", "callout");
    mi.style.marginTop = ".75rem";
    if (noMI) {
      var fha = CRACalc.fhaMortgageInsurance(DATA, price);
      mi.appendChild(el("h3", null, "You may skip mortgage insurance here"));
      mi.appendChild(el("p", null,
        "The city money acts like a down payment. It brings your loan to about " + Math.round(ltv * 100) +
        "% of the price, under the " + percent(DATA.affordability.conventional.pmiCancelsAtLtv) +
        " line, so a regular loan would carry no mortgage insurance. On an FHA loan the same size you would pay roughly " +
        money(fha.monthlyLow) + " to " + money(fha.monthlyHigh) + " a month for it, plus " + money(fha.upfront) +
        " up front, and it does not fall off on its own."));
    } else {
      mi.appendChild(el("h3", null, "Mortgage insurance would be added"));
      mi.appendChild(el("p", null,
        "At this price your loan is about " + Math.round(ltv * 100) + "% of the value, above the " +
        percent(DATA.affordability.conventional.pmiCancelsAtLtv) +
        " line, so mortgage insurance gets added on top of the payment above and your real maximum is lower. A lender will price it for you."));
    }
    out.appendChild(mi);

    if (rent > 0) {
      var compare = el("div", "card");
      compare.style.marginTop = ".75rem";
      compare.appendChild(el("h3", null, "Against your rent"));
      var row = el("div", "rentcompare");
      var a = el("div");
      a.appendChild(el("div", "fineprint", "Rent now"));
      a.appendChild(el("div", "num num--was", money(rent)));
      row.appendChild(a);
      row.appendChild(el("div", "arrow", "→"));
      var b = el("div");
      b.appendChild(el("div", "fineprint", "Owning"));
      b.appendChild(el("div", "num", money(payment)));
      row.appendChild(b);
      compare.appendChild(row);
      var diff = payment - rent;
      compare.appendChild(el("p", null, diff > 0
        ? "About " + money(diff) + " more a month. Your rent goes up most years. A fixed loan payment does not, and the part you pay down stays yours."
        : "About " + money(-diff) + " less a month than you pay now, and the part you pay down stays yours."));
      out.appendChild(compare);
    }

    if (credit < 620) {
      out.appendChild(noteBox("amber", "Credit is the piece to work on first",
        "Your credit does not change the city's rules, but it decides whether a lender approves you and at what rate. " +
        DATA.contacts.nhs.name + " gives free counseling for exactly this, at " + DATA.contacts.nhs.phone + "."));
    }

    var footnotes = el("div");
    footnotes.style.marginTop = "1.25rem";
    footnotes.style.borderTop = "1px solid var(--line)";
    footnotes.style.paddingTop = "1rem";
    footnotes.appendChild(el("p", "fineprint",
      "Taxes are figured at " + percent(DATA.affordability.propertyTaxPctOfPrice) +
      " of the price. The low tax bill on the seller's current statement resets when the home sells, so it will not be your bill. Insurance is estimated at " +
      money(DATA.affordability.homeownersInsuranceAnnual) + " a year. Closing costs are estimated at " +
      percent(DATA.affordability.estClosingCostPct) + " of the price; the city's allowance of up to " +
      money(DATA.assistance.closingCostMax) + " covers them first, and only what is left over shows up in the cash above."));
    footnotes.appendChild(verifyLine());
    out.appendChild(footnotes);

    out.focus();
  }

  /* ---------- chat ---------- */

  var history = [];
  var sending = false;

  function addMessage(role, text) {
    var box = el("div", "msg msg--" + role);
    String(text).split(/\n{2,}/).forEach(function (para) {
      if (para.trim()) box.appendChild(el("p", null, para.trim()));
    });
    $("#chat-log").appendChild(box);
    box.scrollIntoView({ block: "nearest" });
    return box;
  }

  function send(question) {
    if (sending || !question) return;
    sending = true;
    $("#chat-send").disabled = true;
    addMessage("you", question);
    history.push({ role: "user", content: question });
    var pending = addMessage("bot", "Thinking…");

    fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: history })
    }).then(function (r) {
      if (!r.ok) throw new Error("chat " + r.status);
      return r.json();
    }).then(function (j) {
      pending.remove();
      addMessage("bot", j.text);
      history.push({ role: "assistant", content: j.text });
    }).then(null, function () {
      pending.remove();
      addMessage("error", "That did not go through. Try again in a minute, or call " +
        DATA.contacts.nhs.name + " at " + DATA.contacts.nhs.phone + " — the counseling is free.");
    }).then(function () {
      sending = false;
      $("#chat-send").disabled = false;
    });
  }

  function wireChat() {
    $("#chat-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("#chat-input");
      var q = input.value.trim();
      input.value = "";
      send(q);
    });
    $$("#starters .starter").forEach(function (b) {
      b.addEventListener("click", function () { send(b.textContent.trim()); });
    });
  }

  /* ---------- boot ---------- */

  function boot() {
    fillFromData();
    buildChips();
    buildEdges();
    buildStrings();
    buildPrograms();
    buildClasses();
    buildLinks();
    buildHouseholdChoices();
    $("#rate").value = DATA.affordability.defaultRate;
    $("#address-form").addEventListener("submit", checkAddress);
    $("#calc-form").addEventListener("submit", runCalculator);
    wireChat();
    setUpMap();
  }

  fetch("data/program-data.json")
    .then(function (r) { if (!r.ok) throw new Error("data " + r.status); return r.json(); })
    .then(function (json) {
      DATA = json;
      return fetch(DATA.boundary.geojsonFile)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(null, function () { return null; });
    })
    .then(function (geo) {
      BOUNDARY = geo;
      boot();
    })
    .then(null, function () {
      $("#data-error").classList.remove("hidden");
    });
})();
