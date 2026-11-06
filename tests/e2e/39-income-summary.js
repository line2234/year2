// The summary sheet (tap the donut) also works for income: the same days / weeks / months / years, by category,
// with the comparison and the average, behind a Spending | Income switch; "open in Home" keeps the choice.
const { chromium, appUrl, launchOptions } = require("./harness");
let fails = 0;
const ok = (c, m) => {
  console.log((c ? "PASS " : "FAIL ") + m);
  if (!c) fails++;
};
(async () => {
  const browser = await chromium.launch(launchOptions);
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, locale: "en-US" });
  await ctx.addInitScript(() => {
    window.Android = { getColors: () => null, setBars() {} };
  });
  const page = await ctx.newPage();
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(appUrl);
  await page.evaluate(() => {
    S = blank();
    S.settings.cur = "USD";
    S.settings.lastCheck = today();
    S.accounts.push({ id: "a", name: "Bank", type: "bank", currency: "USD", opening: 1000, archived: false });
    const i1 = inCats()[0].id,
      i2 = inCats()[1].id,
      m = today().slice(0, 7),
      pm = shiftMonth(m, -1);
    S.txns.push(
      { id: "t1", type: "income", account: "a", amount: 300, cat: i1, date: today(), note: "" },
      { id: "t2", type: "income", account: "a", amount: 100, cat: i2, date: today(), note: "" },
      { id: "t3", type: "income", account: "a", amount: 200, cat: i1, date: pm + "-01", note: "" },
      { id: "t4", type: "expense", account: "a", amount: 50, cat: outCats()[0].id, date: today(), note: "" }
    );
    V.period = "month";
    V.anchor = today();
    save();
    render();
  });
  await page.click('[data-act="summary"]');
  const title = () => page.$eval("#sheet h2", e => e.textContent);
  const big = () => page.$eval("#sm .smd .big", e => e.textContent + "|" + e.className);
  const rows = () => page.$$eval("#sm .smtop .tx", e => e.map(x => x.querySelector(".d").textContent.trim() + "=" + x.querySelector(".a").textContent));
  ok((await title()).startsWith("Spending") && /50/.test(await big()), "spending by default: " + (await big()));
  await page.click('[data-act="sm-kind"][data-v="in"]');
  ok((await title()).startsWith("Income"), "the title follows: " + (await title()));
  const b = await big();
  ok(/400/.test(b) && /got/.test(b), "the month adds up the income: " + b);
  const r = await rows();
  ok(r.length === 2 && /300/.test(r[0]) && /100/.test(r[1]), "by category, biggest first: " + r);
  ok(/vs last month/i.test(await page.$eval("#sm .smd", e => e.textContent)), "compared with the month before");
  ok(/received/.test(await page.$eval(".smpie .c span", e => e.textContent)), "the donut says received");
  for (const m of ["d", "w", "y"]) {
    await page.click(`[data-act="sm-mode"][data-v="${m}"]`);
    const v = await big();
    ok(/got/.test(v) && /[1-9]/.test(v) && (m !== "y" || /400|600/.test(v)) , m + ": income shown " + v);
  }
  await page.click('[data-act="sm-mode"][data-v="m"]');
  await page.click('[data-act="sm-open"]');
  ok((await page.evaluate(() => V.kind)) === "in" && (await page.$$('[data-act="ring-kind"][aria-pressed="true"][data-v="in"]')).length === 1, "Home opens on the income ring");
  ok(errors.length === 0, "no page errors " + JSON.stringify(errors));
  await browser.close();
  console.log(fails ? fails + " FAILED" : "ALL PASSED");
  process.exitCode = fails ? 1 : 0;
})().catch(e => {
  console.error(e);
  process.exit(1);
});
