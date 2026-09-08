#!/usr/bin/env bash
# Definition of done for the South St. Pete CRA site. Safe to run repeatedly:
# it never writes to the repo.
set -uo pipefail
cd "$(dirname "$0")"

pass=0; fail=0; warn=0
ok()   { printf '  \033[32mPASS\033[0m %s\n' "$1"; pass=$((pass+1)); }
bad()  { printf '  \033[31mFAIL\033[0m %s\n' "$1"; fail=$((fail+1)); }
note() { printf '  \033[33mWARN\033[0m %s\n' "$1"; warn=$((warn+1)); }
head_() { printf '\n\033[1m%s\033[0m\n' "$1"; }

DATA=public/data/program-data.json
SITE_FILES=$(find public -type f \( -name '*.html' -o -name '*.js' \) -not -path 'public/vendor/*')

head_ "1. Files and syntax"
for f in "$DATA" knowledge/CRA_Knowledge_V4.md public/index.html public/styles.css public/calc.js public/app.js netlify/functions/chat.js netlify.toml; do
  [ -f "$f" ] && ok "$f present" || bad "$f missing"
done
if node -e "JSON.parse(require('fs').readFileSync('$DATA','utf8'))" 2>/dev/null; then
  ok "program-data.json is valid JSON"
else
  bad "program-data.json is not valid JSON"
fi
for f in public/calc.js public/app.js netlify/functions/chat.js; do
  node --check "$f" >/dev/null 2>&1 && ok "$f parses" || bad "$f has a syntax error"
done

head_ "2. Assets Josh supplies by hand"
[ -f public/cra_boundary.geojson ] && ok "public/cra_boundary.geojson present" \
  || note "public/cra_boundary.geojson missing - the address check stays switched off until it is added (see scripts/fetch-boundary.md)"
[ -f public/img/hero.jpg ] && ok "public/img/hero.jpg present" \
  || note "public/img/hero.jpg missing - the hero falls back to flat navy until a photo is added"

head_ "3. No program numbers hardcoded in the page"
hits=$(grep -nE '\$[0-9]{1,3}(,[0-9]{3})+|\$[0-9]{4,}' $SITE_FILES || true)
if [ -z "$hits" ]; then
  ok "no hardcoded dollar figures in public HTML/JS"
else
  bad "hardcoded dollar figures found:"; printf '%s\n' "$hits" | sed 's/^/       /'
fi
leaked=$(node -e '
const fs=require("fs");
const data=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));
const vals=new Set();
(function walk(v){ if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v==="object") Object.values(v).forEach(walk);
  else if (typeof v==="number" && v>=1000) vals.add(String(v)); })(data);
const files=process.argv.slice(2);
const out=[];
for (const f of files){ const src=fs.readFileSync(f,"utf8");
  for (const v of vals) if (new RegExp("(?<![0-9.])"+v+"(?![0-9])").test(src)) out.push(f+": "+v); }
console.log(out.join("\n"));
' "$DATA" $SITE_FILES)
if [ -z "$leaked" ]; then
  ok "no program value from the data file is copied into the page"
else
  bad "program values copied into the page:"; printf '%s\n' "$leaked" | sed 's/^/       /'
fi

head_ "4. Calculator"
node -e '
const assert=require("assert");
const c=require("./public/calc.js");
const fs=require("fs");
const data=JSON.parse(fs.readFileSync("'"$DATA"'","utf8"));
const checks=[];
function check(name,fn){ try{ fn(); checks.push(["PASS",name]); }catch(e){ checks.push(["FAIL",name+" -- "+e.message]); } }

check("$300,000 price gives 20% plus the lesser of the allowance and estimated costs", ()=>{
  const est=300000*data.affordability.estClosingCostPct;
  assert.strictEqual(Math.round(c.closingAllowance(data,300000)), Math.round(Math.min(data.assistance.closingCostMax, est)));
  assert.strictEqual(Math.round(c.assistance(data,300000)), Math.round(300000*data.assistance.pctOfPrice + Math.min(data.assistance.closingCostMax, est)));
});
check("$350,000 price is held to the program cap", ()=>
  assert.strictEqual(Math.round(c.assistance(data,350000)), data.assistance.totalCap));
check("a 2-person household at $95,000 lands in the 81-120% band", ()=>{
  const b=c.amiBand(data,2,95000);
  assert.ok(b.eligible,"should be eligible");
  assert.strictEqual(b.bandMax,120);
  assert.strictEqual(b.bandLabel,"between 81% and 120%");
});
check("that household gets the funding warning", ()=>
  assert.ok(c.amiBand(data,2,95000).fundingWarning));
check("a household at or below the 80% limit gets no funding warning", ()=>{
  const b=c.amiBand(data,2,data.ami.households["2"]["80"]);
  assert.strictEqual(b.bandMax,80);
  assert.strictEqual(b.fundingWarning,false);
});
check("income over the top limit is not eligible", ()=>
  assert.strictEqual(c.amiBand(data,2,data.ami.households["2"]["140"]+1).eligible,false));
check("no income limit is flagged estimated", ()=>{
  assert.strictEqual(c.amiBand(data,2,95000).estimated,false);
  for (const [size,row] of Object.entries(data.ami.households))
    assert.strictEqual(row.estimated,false,"household "+size+" is flagged estimated");
});
check("max price stays inside the DTI limit", ()=>{
  const income=68000, debts=400;
  const p=c.maxPurchasePrice(data,{annualIncome:income,monthlyDebts:debts});
  const budget=income/12*data.affordability.dtiLimit-debts;
  const pay=c.monthlyHousing(data,p,data.affordability.defaultRate);
  assert.ok(pay<=budget+1,"payment "+pay.toFixed(0)+" over budget "+budget.toFixed(0));
  assert.ok(pay>budget-2,"solver left room on the table: "+pay.toFixed(0)+" vs "+budget.toFixed(0));
});
check("max price never exceeds the program price cap", ()=>
  assert.ok(c.maxPurchasePrice(data,{annualIncome:500000,monthlyDebts:0}) <= data.assistance.maxPurchasePrice));
check("assistance pushes this buyer under the no-mortgage-insurance line", ()=>{
  const p=c.maxPurchasePrice(data,{annualIncome:68000,monthlyDebts:400});
  assert.ok(c.noConventionalMI(data,p),"LTV was "+c.loanToValue(data,p).toFixed(3));
});
check("the $68,000 2-person case pins to a $304,010 purchase price", ()=>{
  const p=c.maxPurchasePrice(data,{annualIncome:68000,monthlyDebts:400});
  assert.strictEqual(Math.round(p),304010,"max price moved to "+Math.round(p));
  assert.strictEqual(Math.round(c.assistance(data,p)),68402);
  assert.strictEqual(Math.round(c.cashToClose(data,p)),3040);
  assert.strictEqual(Math.round(c.monthlyHousing(data,p,data.affordability.defaultRate)),2150);
  assert.ok(c.noConventionalMI(data,p),"LTV was "+c.loanToValue(data,p).toFixed(3));
});
check("the $68,000 2-person case is at or below 80% with no funding warning", ()=>{
  const b=c.amiBand(data,2,68000);
  assert.strictEqual(b.bandMax,80);
  assert.strictEqual(b.bandLabel,"at or below 80%");
  assert.strictEqual(b.fundingWarning,false);
  assert.strictEqual(b.tier.color,"green");
});
check("the FY2026 SHIP table matches the published limits for households 1-8", ()=>{
  const want={
    "1":{80:64250,100:80300,120:96360,140:112420},
    "2":{80:73400,100:91700,120:110040,140:128380},
    "3":{80:82600,100:103200,120:123840,140:144480},
    "4":{80:91750,100:114700,120:137640,140:160580},
    "5":{80:99100,100:123900,120:148680,140:173460},
    "6":{80:106450,100:133100,120:159720,140:186340},
    "7":{80:113800,100:142300,120:170760,140:199220},
    "8":{80:121150,100:151400,120:181680,140:211960}
  };
  assert.deepStrictEqual(Object.keys(data.ami.households).sort(), Object.keys(want).sort());
  for (const [size,row] of Object.entries(want))
    for (const pct of [80,100,120,140])
      assert.strictEqual(data.ami.households[size][String(pct)], row[pct], "household "+size+" at "+pct+"%");
  assert.strictEqual(data.ami.fiscalYear,"FY2026");
  assert.strictEqual(data.ami.effective,"2026-05-01");
});
check("every household size resolves to its own published row", ()=>{
  for (const size of [1,2,3,4,5,6,7,8]) {
    const picked=c.amiRow(data,size);
    assert.strictEqual(picked.sizeUsed,size);
    assert.strictEqual(picked.sizeCapped,false);
  }
  assert.strictEqual(c.amiRow(data,9).sizeCapped,true);
});
check("cash to close is only the buyer share while the allowance covers closing costs", ()=>{
  const p=300000;
  assert.ok(p*data.affordability.estClosingCostPct <= data.assistance.closingCostMax, "precondition failed");
  assert.strictEqual(Math.round(c.cashToClose(data,p)), Math.round(c.buyerContribution(data,p)));
});
check("cash to close picks up closing costs above the allowance", ()=>{
  const p=data.assistance.maxPurchasePrice;
  const over=p*data.affordability.estClosingCostPct - data.assistance.closingCostMax;
  assert.ok(over>0,"precondition failed");
  assert.strictEqual(Math.round(c.cashToClose(data,p)), Math.round(c.buyerContribution(data,p)+over));
});
check("COUNTER-TEST: halving the closing allowance lowers the $300,000 figure", ()=>{
  const bent=JSON.parse(JSON.stringify(data));
  bent.assistance.closingCostMax=5000;
  const expected=300000*data.assistance.pctOfPrice+5000;
  assert.strictEqual(Math.round(c.assistance(bent,300000)),expected);
  assert.notStrictEqual(Math.round(c.assistance(bent,300000)),Math.round(c.assistance(data,300000)));
});
for(const [status,name] of checks) console.log(status+"\t"+name);
process.exit(checks.some(x=>x[0]==="FAIL")?1:0);
' 2>&1 | while IFS=$'\t' read -r status name; do
  [ "$status" = "PASS" ] && ok "$name" || bad "${status} ${name}"
done
calcstatus=${PIPESTATUS[0]}

head_ "5. Chat function"
node -e '
const assert=require("assert");
process.env.ANTHROPIC_API_KEY="sk-ant-stub-for-verify";
global.fetch = async () => ({
  ok: true, status: 200,
  json: async () => ({ content: [{ type: "text", text: "stubbed reply" }] })
});
(async () => {
  const { handler } = require("./netlify/functions/chat.js");
  const good = await handler({ httpMethod: "POST", body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }) });
  assert.strictEqual(good.statusCode, 200, "expected 200, got " + good.statusCode);
  assert.strictEqual(JSON.parse(good.body).text, "stubbed reply");
  const bad = await handler({ httpMethod: "GET" });
  assert.strictEqual(bad.statusCode, 405);
  const empty = await handler({ httpMethod: "POST", body: "{}" });
  assert.strictEqual(empty.statusCode, 400);
})().catch(e => { console.error(e.message); process.exit(1); });
' >/dev/null 2>&1 \
  && ok "handler returns 200 with a stubbed key, 405 on GET, 400 on an empty body" \
  || bad "chat handler did not behave as expected"

head_ "6. Accessibility"
if command -v lighthouse >/dev/null 2>&1; then
  tmp=$(mktemp -d)
  npx --yes http-server public -p 8099 -s >/dev/null 2>&1 &
  server=$!; sleep 2
  lighthouse http://localhost:8099 --only-categories=accessibility --preset=desktop \
    --chrome-flags="--headless --no-sandbox" --output=json --output-path="$tmp/lh.json" --quiet >/dev/null 2>&1
  kill $server 2>/dev/null
  score=$(node -e "console.log(Math.round(require('$tmp/lh.json').categories.accessibility.score*100))" 2>/dev/null || echo 0)
  rm -rf "$tmp"
  [ "$score" -ge 90 ] && ok "Lighthouse accessibility $score (needs 90)" || bad "Lighthouse accessibility $score (needs 90)"
else
  note "lighthouse not installed - run 'npx lighthouse http://localhost:8888 --only-categories=accessibility' against 'netlify dev' to check the 90 threshold"
fi

head_ "Result"
printf '  %d passed, %d failed, %d warnings\n\n' "$pass" "$fail" "$warn"
[ "$fail" -eq 0 ] && [ "${calcstatus:-0}" -eq 0 ] || exit 1
exit 0
