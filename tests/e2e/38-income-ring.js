// Home's ring switches between spending and income (Spending | Income above it): income by category in the same
// style, percentages of the income, a tap on a category adds income in it, and the choice is not kept.
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
    const id = inCats()[0].id,
      id2 = inCats()[1].id;
    S.txns.push(
      { id: "t1", type: "income", account: "a", amount: 300, cat: id, date: today(), note: "" },
      { id: "t2", type: "income", account: "a", amount: 100, cat: id2, date: today(), note: "" },
      { id: "t3", type: "expense", account: "a", amount: 50, cat: outCats()[0].id, date: today(), note: "" }
    );
    save();
    render();
  });
  const tiles = () => page.$$eval("#ring .cat", e => e.map(b => b.dataset.v));
  const outIds = await page.evaluate(() => outCats().map(c => c.id));
  const inIds = await page.evaluate(() => inCats().map(c => c.id));
  ok((await tiles()).join() === outIds.join(), "spending ring by default");
  ok((await page.$$('[data-act="ring-kind"]')).length === 2, "a Spending | Income switch is shown");
  await page.click('[data-act="ring-kind"][data-v="in"]');
  ok((await tiles()).join() === inIds.join(), "the income categories fill the ring");
  const pct = await page.$$eval("#ring .cat .cp", e => e.map(x => x.textContent).filter(Boolean));
  ok(pct.join() === "75%,25%", "percentages are shares of the income: " + pct);
  const mid = await page.$eval(".dcenter .s", e => e.textContent);
  ok(/\+.*400/.test(mid), "the centre shows the income: " + mid);
  await page.click("#ring .cat");
  const sheet = await page.evaluate(() => ({ h2: $("#sheet h2").textContent, cat: F.cat, type: F.type }));
  ok(sheet.cat === inIds[0] && /income/i.test(sheet.h2 + sheet.type), "a tap on a category adds income in it: " + JSON.stringify(sheet));
  await page.evaluate(() => closeSheet());
  await page.click('[data-act="ring-kind"][data-v="out"]');
  ok((await tiles()).join() === outIds.join(), "back to spending");
  await page.click("#ring .cat");
  const s2 = await page.evaluate(() => ({ cat: F.cat, type: F.type }));
  ok(s2.cat === outIds[0] && !/income/i.test(s2.type), "and a tap adds spending: " + JSON.stringify(s2));
  ok(errors.length === 0, "no page errors " + JSON.stringify(errors));
  await browser.close();
  console.log(fails ? fails + " FAILED" : "ALL PASSED");
  process.exitCode = fails ? 1 : 0;
})().catch(e => {
  console.error(e);
  process.exit(1);
});
