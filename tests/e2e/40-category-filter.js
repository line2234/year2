// A category's transactions: tapping a category in the summary sheet opens History on that period with only its
// entries (count and total shown); History's category chips switch or clear it; income categories work the same.
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
  const ids = await page.evaluate(() => {
    S = blank();
    S.settings.cur = "USD";
    S.settings.lastCheck = today();
    S.accounts.push({ id: "a", name: "Bank", type: "bank", currency: "USD", opening: 1000, archived: false });
    const o1 = outCats()[0].id,
      o2 = outCats()[1].id,
      i1 = inCats()[0].id,
      m = today().slice(0, 7);
    const mk = (id, type, amount, cat, date) => ({ id, type, account: "a", amount, cat, date, note: "" });
    S.txns.push(
      mk("t1", "expense", 10, o1, m + "-01"),
      mk("t2", "expense", 25, o1, m + "-01"),
      mk("t3", "expense", 7, o2, m + "-01"),
      mk("t4", "income", 300, i1, m + "-01")
    );
    V.period = "month";
    V.anchor = m + "-01";
    save();
    render();
    return { o1, o2, i1 };
  });
  const rows = () => page.$$eval("#app .tx", e => e.length);
  const info = () => page.$$eval("#app .muted.small", e => e.map(x => x.textContent).join("|"));
  // the summary sheet: every category is a button
  await page.click('[data-act="summary"]');
  const cats = await page.$$eval('#sm [data-act="sm-cat"]', e => e.map(x => x.dataset.v));
  ok(cats.join() === [ids.o1, ids.o2].join(), "every category of the period is listed, biggest first: " + cats);
  await page.click(`#sm [data-act="sm-cat"][data-v="${ids.o1}"]`);
  ok((await page.evaluate(() => V.screen)) === "history", "it opens History");
  ok((await rows()) === 2, "only that category's transactions: " + (await rows()));
  ok(/2 entries/.test(await info()) && /35/.test(await info()), "count and total: " + (await info()));
  ok((await page.$$('[data-act="hcat"][aria-pressed="true"]')).length === 1, "its chip is selected");
  // another category from the chips
  await page.click(`[data-act="hcat"][data-v="${ids.o2}"]`);
  ok((await rows()) === 1, "switching category lists the other one");
  // All categories
  await page.click('[data-act="hcat"][data-v=""]');
  ok((await rows()) === 4, "All categories lists everything: " + (await rows()));
  // income from the income summary
  await page.click('[data-act="home"]');
  await page.click('[data-act="ring-kind"][data-v="in"]');
  await page.click('[data-act="summary"]');
  await page.click(`#sm [data-act="sm-cat"][data-v="${ids.i1}"]`);
  ok((await rows()) === 1 && /300/.test(await page.$eval("#app", e => e.textContent)), "an income category works the same");
  // the filter is for that visit only
  await page.click('[data-act="home"]');
  await page.click('[data-act="go"][data-v="history"]');
  ok((await rows()) === 4, "a fresh visit shows everything");
  ok(errors.length === 0, "no page errors " + JSON.stringify(errors));
  await browser.close();
  console.log(fails ? fails + " FAILED" : "ALL PASSED");
  process.exitCode = fails ? 1 : 0;
})().catch(e => {
  console.error(e);
  process.exit(1);
});
