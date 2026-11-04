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
    if (req.method !== 'GET' || name.includes('..') || name.includes('/api/') || !(name.startsWith('credit-runtime/') || name.startsWith('assets/') || ['index.html','ueber-uns.html','karriere.html','app.js','style.css','header.js','antrag.html','application.js','application-layout.js','application.css'].includes(name))) {res.writeHead(403).end();return;}
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
    await page.setViewportSize({width:1440,height:1000});
    const wordGap = await page.locator('.header__consult').evaluate(el => el.children[1].getBoundingClientRect().left - el.children[0].getBoundingClientRect().right);
    assert.ok(wordGap >= 2,'Desktop consultation words have visible spacing');
    assert.deepEqual(await page.locator('#credit-journey li h3').allTextContents(),['Budget einschätzen','Antrag vorbereiten','Prüfung durch die Kreditgeberin']);
    assert.match(await page.locator('#credit-journey').textContent(),/Nach Freischaltung der Übermittlung/);
    assert.match(await page.locator('#credit-journey').textContent(),/keine Daten gesendet/);
    await page.locator('#credit-journey').screenshot({path:path.join(evidence,'journey-1440.png')});
    await page.setViewportSize({width:390,height:1000});
    await page.locator('#credit-journey').screenshot({path:path.join(evidence,'journey-390.png')});
    await page.locator('[data-go="1"]').first().click();
    await page.locator('#ink').fill('6000'); await page.locator('#miete').fill('1500');
    await page.locator('#married').selectOption('no'); await page.locator('#children').fill('0');
    await page.locator('.step[data-step="1"] [data-go="2"]').click();
    await page.locator('#credit-apply').click();
    await page.waitForSelector('#request-form');
    await page.waitForFunction(()=>document.querySelector('#application-form').getAttribute('aria-busy')==='false');
    await page.evaluate(()=>document.fonts.ready);
    await page.setViewportSize({width:390,height:844});
    const mobileStart = await page.locator('#request-amount').evaluate(el=>({firstInputTop:el.getBoundingClientRect().top+scrollY,firstInputBottom:el.getBoundingClientRect().bottom+scrollY}));
    assert.ok(mobileStart.firstInputBottom <= 844,'First amount input fits in initial 390x844 viewport: '+JSON.stringify(mobileStart));
    await page.screenshot({path:path.join(evidence,'application-mobile-start.png'),fullPage:true});
    assert.equal(await page.locator('.application__steps').getAttribute('open'),null);
    await page.locator('.application__steps summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#request-steps').isVisible(),true);
    assert.equal(await page.locator('[data-request-goto="1"]').isDisabled(),true,'Unreached steps stay disabled');
    await page.locator('#request-next').click();
    assert.equal(await page.locator('[data-request-step="0"]').isVisible(),true);
    assert.equal(await page.locator('#request-errors').isVisible(),true);
    assert.notEqual(await page.locator('.application__steps').getAttribute('open'),null);
    await page.locator('.application__steps summary').click();
    checks.push('Compact intro puts the full first input in the initial mobile viewport; step disclosure works by keyboard and retains validation failures');
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
      const {compactStepNavigation}=await import('/application-layout.js?v=2026-11-04-compact');
      compactStepNavigation(host);
      const trigger=document.createElement('a');trigger.id='calc-cta';trigger.href='#anfrage';trigger.textContent='Synthetic fixture';
      trigger.addEventListener('click',()=>{host.hidden=false;api.setCredit();});
      document.body.append(trigger);
      await import(`/credit-runtime/dev-tools/autofill.js?v=${runtime.assetVersion}`);
    });
    await page.waitForFunction(()=>!!window.__bkTestmodus);
    assert.equal(await page.evaluate(()=>window.__bkTestmodus.run('without-docs')),true,await page.locator('.dev-fill').textContent());
    assert.equal(await page.locator('[data-request-step="review"]').isVisible(),true);
    await page.screenshot({path:path.join(evidence,'review-synthetic.png'),fullPage:true});
    await page.locator('.application__steps summary').click();
    await page.locator('[data-request-goto="0"]').click();
    const validAmount=await page.locator('#request-amount').inputValue();
    await page.locator('#request-amount').fill('');
    await page.locator('.application__steps summary').click();
    await page.locator('[data-request-goto="1"]').click();
    assert.equal(await page.locator('[data-request-step="0"]').isVisible(),true,'Forward step selection cannot bypass validation');
    assert.equal(await page.locator('.application__steps').evaluate(el=>el.open),true,'Rejected step selection keeps navigation open');
    assert.equal(await page.locator('#request-errors').isVisible(),true);
    await page.locator('#request-amount').fill(validAmount);
    await page.setViewportSize({width:320,height:1000});
    for (const zoom of ['100%', '200%']) {
      await page.evaluate(value=>{document.documentElement.style.fontSize=value;},zoom);
      for (let step=0;step<6;step++) {
        if (!await page.locator('.application__steps').evaluate(el=>el.open)) await page.locator('.application__steps summary').click();
        await page.locator(`[data-request-goto="${step}"]`).click();
        assert.equal(await page.locator(`[data-request-step="${step}"]`).isVisible(),true);
        assert.equal(await page.locator('.application__steps').evaluate(el=>el.open),false,'Successful step navigation collapses the disclosure');
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
    await page.goto(origin+'/antrag.html?amount=350000&months=84');
    await page.waitForFunction(()=>document.querySelector('#application-form')?.getAttribute('aria-busy')==='false');
    await page.locator('#application-back').click();
    await page.waitForSelector('#rechner');
    assert.equal((await page.locator('#betrag').inputValue()).replace(/[^\d]/g,''),'350000');
    assert.equal(await page.locator('#betrag').getAttribute('aria-invalid'),'true');
    assert.match(await page.locator('#betrag-err').textContent(),/300'000/);
    assert.equal(await page.locator('#rate').textContent(),'–');
    assert.equal(await page.locator('#credit-apply').getAttribute('href'),null);
    checks.push('Application amount above calculator ceiling stays visible with existing range validation instead of silently resetting');
    for (const changed of [{mode:'live'}, {namespace:'another-site'}]) {
      let reads=0;
      await page.route('**/credit-runtime/shared/runtime.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(++reads === 1 ? descriptor : {...descriptor,...changed})}));
      await page.goto(origin+'/antrag.html');
      await page.waitForFunction(()=>document.querySelector('#application-form').getAttribute('aria-busy')==='false');
      assert.match(await page.locator('#application-status').textContent(),/nicht verfügbar/);
      assert.equal(await page.locator('#request-form').count(),0);
      await page.unroute('**/credit-runtime/shared/runtime.json');
    }
    checks.push('Descriptor changes from prepare to live or another namespace fail before mounting the form');
    await page.route('**/credit-runtime/shared/runtime.json', route=>route.fulfill({status:404,body:''}));
    await page.goto(origin+'/antrag.html');
    await page.waitForFunction(()=>document.querySelector('#application-form').getAttribute('aria-busy')==='false');
    assert.match(await page.locator('#application-status').textContent(),/nicht verfügbar/);
    assert.equal(await page.locator('#request-form').count(),0);
    await page.locator('.header__consult').click();
    await page.waitForURL('**/#kontakt');
    checks.push('Missing runtime fails visibly and retains the consultation route');
    await page.unroute('**/credit-runtime/shared/runtime.json');
    await page.goto(origin);
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('.nav a[href="ueber-uns.html"]').click();
    await page.waitForURL('**/ueber-uns.html');
    for (const name of ['ueber-uns','karriere']) {
      if (name === 'karriere') {
        await page.locator('.nav a[href="karriere.html"]').click();
        await page.waitForURL('**/karriere.html');
      }
      await page.evaluate(()=>document.fonts.ready);
      assert.match(await page.locator('.development-note').textContent(),/Platzhalter/);
      assert.equal(await page.locator('h1').count(),1);
      if(name==='ueber-uns') {
        assert.match(await page.locator('#application-operator').textContent(),/Best-Finance GmbH als Betreiber/);
        assert.equal(await page.locator('.role-placeholders dd').count(),2);
        for(const value of await page.locator('.role-placeholders dd').allTextContents())assert.match(value,/Platzhalter/);
        await page.locator('#application-operator').screenshot({path:path.join(evidence,'operator-section.png')});
      } else {
        assert.equal(await page.locator('#hiring-process li').count(),3);
        assert.match(await page.locator('#hiring-process').textContent(),/Platzhalter/);
        assert.match(await page.locator('#hiring-process').textContent(),/kein Bewerbungsversand/);
        assert.equal(await page.locator('#hiring-process a, #hiring-process button, #hiring-process input').count(),0,'Hiring placeholders create no false working application channel');
        await page.locator('#hiring-process').screenshot({path:path.join(evidence,'hiring-section.png')});
      }
      assert.equal(await page.locator('.nav [aria-current="page"]').getAttribute('href'),name+'.html');
      assert.match(await page.locator('.nav [aria-current="page"]').evaluate(el=>getComputedStyle(el).textDecorationLine),/underline/);
      for (const [width,zoom] of [[1440,'100%'],[900,'100%'],[390,'100%'],[320,'100%'],[320,'200%']]) {
        await page.setViewportSize({width,height:1000});
        await page.evaluate(value=>{document.documentElement.style.fontSize=value;},zoom);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${name} overflow ${width}/${zoom}`);
        assert.equal(await page.locator('.header__consult').isVisible(),true);
        assert.equal(await page.locator('.skip').evaluate(el=>el.getBoundingClientRect().bottom<=0),true,'Unfocused skip link stays fully offscreen at enlarged text');
        if (await page.locator('.burger').isVisible()) {
          await page.locator('.burger').click();
          assert.equal(await page.locator('.nav [aria-current="page"]').isVisible(),true);
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Expanded mobile menu stays within viewport');
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('.burger').getAttribute('aria-expanded'),'false');
          assert.equal(await page.locator('.burger').evaluate(el=>el===document.activeElement),true);
          await page.locator('.burger').blur();
        }
        await page.screenshot({path:path.join(evidence,`${name}-${width}-${zoom.replace('%','')}.png`),fullPage:true});
      }
      await page.evaluate(()=>{document.documentElement.style.fontSize='100%';});
      await page.setViewportSize({width:1440,height:1000});
      await page.locator('.skip').focus();
      assert.equal(await page.locator('.skip').evaluate(el=>el.getBoundingClientRect().top>=0),true,'Skip link appears on keyboard focus');
      await page.locator('.skip').blur();
    }
    assert.match(await page.locator('.development-note').textContent(),/keine aktuellen Stellenausschreibungen/);
    await page.locator('.job-placeholder summary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.job-placeholder details').evaluate(el=>el.open),true);
    await page.locator('.header__consult').click();
    await page.waitForURL('**/#kontakt');
    for (const name of ['ueber-uns','karriere']) {
      await page.locator(`.photo[href="${name}.html"]`).click();
      await page.waitForURL(`**/${name}.html`);
      await page.goto(origin);
    }
    await page.setViewportSize({width:390,height:1000});
    await page.locator('.burger').click();
    await page.locator('.nav a[href="karriere.html"]').click();
    await page.waitForURL('**/karriere.html');
    assert.equal(await page.locator('.burger').getAttribute('aria-expanded'),'false');
    checks.push('Separate About/Careers pages reachable from desktop/mobile navigation and homepage cards; explicit placeholders, active page, keyboard job disclosure and consultation return verified; no overflow through 320px/200% text');
    checks.push('Customer journey distinguishes estimate, preparation and future bank assessment; confirmed form operator is named with relationship placeholders; hiring process is explicitly a placeholder without sending');
    assert.deepEqual(requests,[],'No external or non-GET requests');
    assert.deepEqual(errors,[],'Browser runtime errors');
    const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
    const sourceHasTrackedChanges=Boolean(execFileSync('git',['status','--porcelain','--untracked-files=normal'],{cwd:root,encoding:'utf8'}).trim());
    const report={sourceRevision,sourceHasTrackedChanges,operator:configured?'Confirmed Best-Finance default, branch AA; synthetic applicants':'Synthetic operator TEST, not production configuration',site,mobileStart,core:'eeb52f8b29191627867059833b146391046d889a',checks,requests,errors};
    await fs.writeFile(path.join(evidence,'checks.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
