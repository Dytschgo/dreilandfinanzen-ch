/* Actual consumer UI. --configured also verifies the confirmed operator/runtime; applicants remain synthetic. */
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('../dist/qa/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const fixture = path.join(root, 'dist/qa/application-fixture/public');
const configured = process.argv.includes('--configured');
const packageIndex = process.argv.indexOf('--package');
const site = packageIndex === -1 ? root : path.resolve(process.argv[packageIndex + 1]);
const evidence = path.join(root, 'dist/qa/evidence', configured ? 'application-configured' : 'application');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
(async () => {
  execFileSync('python', [path.join(__dirname, 'application_fixture.py')], {cwd: root});
  const fixtureDescriptor = JSON.parse(await fs.readFile(path.join(fixture, 'credit-runtime/shared/runtime.json')));
  const descriptor = configured ? JSON.parse(await fs.readFile(path.join(site, 'credit-runtime/shared/runtime.json'))) : fixtureDescriptor;
  if (configured) {
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(site, 'credit-runtime/shared/contacts.json'))), JSON.parse(await fs.readFile(path.join(root, 'credit-core/shared/contacts.json'))));
    assert.equal(JSON.parse(await fs.readFile(path.join(root,'credit-core.brand.json'))).filiale,'AA');
    assert.equal(descriptor.namespace,'dreilandfinanzen');
    assert.equal(descriptor.mode,'prepare');
  }
  if (packageIndex !== -1) {
    for (const forbidden of ['credit-core', 'credit-runtime/api', 'credit-runtime/dev-tools', 'credit-core.consumer.json', 'credit-core.brand.json', '.gitmodules']) {
      await assert.rejects(fs.access(path.join(site,forbidden)),{code:'ENOENT'},'Internal asset in package: '+forbidden);
    }
    const metadata=JSON.parse(await fs.readFile(path.join(site,'release.json')));
    assert.equal(metadata.core,descriptor.revision);
    assert.equal(metadata.mode,'prepare');
    const {createHash}=require('node:crypto');
    for (const [name,expected] of Object.entries(metadata.sha256)) {
      assert.equal(createHash('sha256').update(await fs.readFile(path.join(site,name))).digest('hex'),expected,'Packaged file changed: '+name);
    }
  }
  await fs.mkdir(evidence, {recursive:true});
  const requests = [], errors = [], checks = [];
  const server = http.createServer(async (req,res) => {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\//,'') || 'index.html';
    if (req.method !== 'GET' || name.includes('..') || name.includes('/api/') || !(name.startsWith('credit-runtime/') || name.startsWith('assets/') || ['index.html','app.js','style.css','header.js','antrag.html','application.js','application.css'].includes(name))) {res.writeHead(403).end();return;}
    const helper = name.startsWith('credit-runtime/dev-tools/');
    const source = helper || (name.startsWith('credit-runtime/') && !configured) ? fixture : site;
    try {
      let data = await fs.readFile(path.join(source,name));
      // Only the test harness exposes synthetic autofill helpers; they are absent from release packages.
      if (helper) data = Buffer.from(data.toString().replaceAll(fixtureDescriptor.assetVersion,descriptor.assetVersion));
      res.writeHead(200,{'Content-Type':types[path.extname(name)] || 'application/octet-stream'});res.end(data);
    }
    catch {res.writeHead(404).end();}
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({channel:'chrome', headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:1000},reducedMotion:'reduce'});
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(r.method()!=='GET' || !r.url().startsWith(origin)) requests.push({method:r.method(),url:r.url()});});
    await page.goto(origin);
    await page.locator('[data-go="1"]').first().click();
    await page.locator('#ink').fill('6000'); await page.locator('#miete').fill('1500');
    await page.locator('#married').selectOption('no'); await page.locator('#children').fill('0');
    await page.locator('.step[data-step="1"] [data-go="2"]').click();
    await page.locator('#credit-apply').click();
    await page.waitForSelector('#request-form');
    await page.waitForFunction(()=>document.querySelector('#application-form').getAttribute('aria-busy')==='false');
    assert.equal(new URL(page.url()).pathname, '/antrag.html');
    assert.equal(new URL(page.url()).search,'?amount=20000&months=48');
    assert.equal(await page.locator('#request-amount').inputValue(), '20’000');
    assert.match(await page.locator('#request-estimate').textContent(), /48/);
    assert.match(await page.locator('#application-attribution').textContent(), /swisstopo/i);
    if (configured) assert.ok((await page.locator('.request-card').textContent()).includes('Best-Finance GmbH'),'Confirmed operator is named in the form disclosure');
    checks.push('Real calculator-to-application route passes only amount and months; mounted core form and required attribution');
    for(const width of [1440,900,390,320]) {
      await page.setViewportSize({width,height:1000});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true, 'Application overflow '+width);
      assert.equal(await page.locator('.header__consult').isVisible(),true);
      await page.screenshot({path:path.join(evidence,`application-${width}.png`),fullPage:true});
    }
    await page.locator('#request-next').click();
    assert.equal(await page.locator('#request-errors').isVisible(),true);
    checks.push('Form validation is active; application and persistent consultation work at 1440/900/390/320px');
    await page.evaluate(async()=>{
      const runtime=await (await fetch('/credit-runtime/shared/runtime.json')).json();
      // The core autofill helper expects its synthetic single-page fixture navigation.
      // The real cross-page handoff is tested above; remount only for synthetic full-form filling.
      const host=document.querySelector('#application-form');
      host.replaceChildren(); host.id='anfrage';
      const {mountCreditRequest}=await import(runtime.entrypoints.bootstrap);
      const api=await mountCreditRequest(host,runtime,{locale:'de-CH',onBackToCalculator:()=>{host.hidden=true;}});
      const trigger=document.createElement('a');trigger.id='calc-cta';trigger.href='#anfrage';trigger.textContent='Synthetic fixture';
      trigger.addEventListener('click',()=>{host.hidden=false;api.setCredit();});
      document.body.append(trigger);
      await import(`/credit-runtime/dev-tools/autofill.js?v=${runtime.assetVersion}`);
    });
    await page.waitForFunction(()=>!!window.__bkTestmodus);
    assert.equal(await page.evaluate(()=>window.__bkTestmodus.run('without-docs')),true,await page.locator('.dev-fill').textContent());
    assert.equal(await page.locator('[data-request-step="review"]').isVisible(),true);
    await page.screenshot({path:path.join(evidence,'review-synthetic.png'),fullPage:true});
    await page.setViewportSize({width:320,height:1000});
    for (const zoom of ['100%', '200%']) {
      await page.evaluate(value=>{document.documentElement.style.fontSize=value;},zoom);
      for (let step=0;step<6;step++) {
        await page.locator(`[data-request-goto="${step}"]`).click();
        assert.equal(await page.locator(`[data-request-step="${step}"]`).isVisible(),true);
        const layout = await page.evaluate(()=>({ok:document.documentElement.scrollWidth<=innerWidth,overflow:[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1&&el.getBoundingClientRect().width>0).slice(0,12).map(el=>({tag:el.tagName,cls:el.className,id:el.id,right:el.getBoundingClientRect().right}))}));
        assert.equal(layout.ok,true,`Step ${step} at ${zoom}: ${JSON.stringify(layout.overflow)}`);
        await page.screenshot({path:path.join(evidence,`step-${step}-${zoom.replace('%','')}.png`),fullPage:true});
      }
    }
    await page.evaluate(()=>{document.documentElement.style.fontSize='100%';});
    await page.locator('#request-next').click();
    assert.equal(await page.locator('[data-request-step="review"]').isVisible(),true);
    checks.push('All six form steps at 320px and 200% text without horizontal overflow');
    await page.evaluate(()=>{document.querySelector('.dev-fill__panel').open=true;});
    await page.locator('[data-mode="release"]').click();
    await page.locator('#request-consent').check();
    await page.locator('#request-next').click();
    await page.waitForFunction(()=>!document.querySelector('#request-send-error').hidden);
    assert.match(await page.locator('#request-send-error').textContent(),/nicht gesendet/);
    checks.push('Synthetic full application reaches review; preparation mode prevents final transmission');
    const syntheticFirstName = await page.locator('#request-firstname').inputValue();
    const selectedAmount = (await page.locator('#request-amount').inputValue()).replace(/[^\d]/g,'');
    await page.locator('#application-back').click();
    await page.waitForSelector('#rechner');
    assert.equal((await page.locator('#betrag').inputValue()).replace(/[^\d]/g,''),selectedAmount);
    checks.push('Return to calculator preserves the credit wish');
    await page.goto(origin+'/antrag.html?amount=21000&months=36&annualRate=99');
    await page.waitForFunction(()=>document.querySelector('#application-form')?.getAttribute('aria-busy')==='false');
    assert.equal((await page.locator('#request-amount').inputValue()).replace(/[^\d]/g,''),'21000');
    assert.equal(await page.locator('#request-firstname').inputValue(),syntheticFirstName);
    assert.match(await page.locator('#request-estimate').textContent(),/7,9/);
    await page.goto(origin+'/antrag.html?amount=1&months=120');
    await page.waitForFunction(()=>document.querySelector('#application-form')?.getAttribute('aria-busy')==='false');
    assert.match(await page.locator('#application-status').textContent(),/ungültig/);
    assert.equal((await page.locator('#request-amount').inputValue()).replace(/[^\d]/g,''),'20000');
    checks.push('Warm draft retains applicant fields; deliberate credit handoff wins, arbitrary rates ignored, invalid credit resets safely');
    await page.route('**/credit-runtime/shared/runtime.json', route=>route.fulfill({status:404,body:''}));
    await page.goto(origin+'/antrag.html');
    await page.waitForFunction(()=>document.querySelector('#application-form').getAttribute('aria-busy')==='false');
    assert.match(await page.locator('#application-status').textContent(),/nicht verfügbar/);
    assert.equal(await page.locator('#request-form').count(),0);
    await page.locator('.header__consult').click();
    await page.waitForURL('**/#kontakt');
    checks.push('Missing runtime fails visibly and retains the consultation route');
    assert.deepEqual(requests,[],'No external or non-GET requests');
    assert.deepEqual(errors,[],'Browser runtime errors');
    const report={operator:configured?'Confirmed Best-Finance default, branch AA; synthetic applicants':'Synthetic operator TEST, not production configuration',site,core:'eeb52f8b29191627867059833b146391046d889a',checks,requests,errors};
    await fs.writeFile(path.join(evidence,'checks.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
