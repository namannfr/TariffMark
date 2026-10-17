/* Tariffmark website interactions */
(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* ---------- Header ---------- */
  const head = $('.site-head'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = head.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.textContent = open ? 'Close' : 'Menu';
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => { head.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); menuBtn.textContent = 'Menu'; }));
  const navLinks = $$('#nav a:not(.head-cta)');
  const spyIds = navLinks.map(a => a.getAttribute('href').slice(1));
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting){ navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); } });
    }, {rootMargin:'-45% 0px -50% 0px'});
    spyIds.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------- Determination demo ---------- */
  const samples = {
    boots: {
      id:'CB-D-26-00417', srcLabel:'From your commercial invoice',
      src:'INV-2291, line 3. Men’s walking boot, full-grain leather upper, vulcanised rubber outsole, ankle height. 240 pairs. Made in Northampton.',
      attrs:[['Upper','leather'],['Outsole','rubber'],['Covers ankle','yes'],['Destination','Ireland (EU)']],
      code:[['64','Footwear'],['03','Leather uppers, rubber or plastic outer soles'],['91','Covering the ankle']],
      cites:[['GIR 1: heading 6403 applies by its terms',0],['Chapter 64 Note 4(a): the upper is the material with the greatest external surface area',0],['Chapter 64 Note 4(b): the sole is the material with the greatest area in contact with the ground',0],['GIR 6: subheading 6403.91, footwear covering the ankle',0]],
      agr:'UK–EU Trade and Cooperation Agreement', verdict:'Meets the product-specific rule', vClass:'clear',
      detail:'Bill of materials checked: imported Italian leather and outsole units change tariff heading, and no assembled uppers from heading 6406 are used.',
      proof:'statement on origin on the invoice, plus supplier declarations for the leather.',
      conf:.92, gr:[4,4], status:['clear','Ready for approval'],
      route:'<b>Within your approval threshold.</b> Preferential 0% duty is available on entry to the EU. Approve to add this boot to your catalogue.'
    },
    impeller: {
      id:'CB-D-26-00422', srcLabel:'From your packing list',
      src:'PL-0882, item 7. Cast stainless steel impeller, 180 mm, for centrifugal water pump model CP-40. 60 units. Origin: Taiwan.',
      attrs:[['Material','stainless steel'],['Form','cast'],['Function','pump part'],['Direction','import to UK']],
      code:[['84','Machinery and mechanical appliances'],['13','Pumps for liquids'],['91','Parts of pumps']],
      cites:[['Section XV Note 1(f): articles of Section XVI are excluded from the base-metal chapters',0],['Section XVI Note 2(b): parts used solely or principally with one kind of machine go with that machine',1],['GIR 1 and GIR 6: heading 8413, subheading 8413.91',0]],
      agr:'Preferential origin', verdict:'No preference available', vClass:'',
      detail:'The UK has no trade agreement with Taiwan, so the standard third-country duty rate applies once the code is confirmed.',
      proof:'supplier invoice and the drawing showing the CP-40 fitment.',
      conf:.64, gr:[2,3], status:['review','Needs review'],
      route:'<b>Below your 0.80 threshold.</b> Note 2(b) depends on whether this impeller fits only the CP-40 pump. Add the drawing, ask a customs expert, or build an advance tariff ruling dossier.'
    },
    whisky: {
      id:'CB-D-26-00431', srcLabel:'From your export invoice',
      src:'EX-1043. Single malt Scotch whisky, 70 cl, 40% vol. 1,200 bottles. Distilled and matured in Speyside.',
      attrs:[['Product','spirit drink'],['Strength','40% vol'],['Type','whisky'],['Destination','India']],
      code:[['22','Beverages, spirits and vinegar'],['08','Spirits under 80% vol'],['30','Whiskies']],
      cites:[['GIR 1: heading 2208 applies by its terms',0],['GIR 6: subheading 2208.30, whiskies',0],['HS Explanatory Notes to heading 22.08, whiskies',0]],
      agr:'India–UK CETA', verdict:'Originating in the UK', vClass:'clear',
      detail:'Distilled and matured in Scotland from the declared inputs; meets the CETA product-specific rule for heading 2208.',
      proof:'self-certified origin declaration carrying your registration reference (URN); format check passed.',
      conf:.95, gr:[3,3], status:['clear','Ready for approval'],
      route:'<b>Within your approval threshold.</b> India’s preferential CETA rate applies in place of its standard rate. Approve to generate the origin declaration PDF.'
    }
  };
  const body = $('#recBody'), steps = $$('#pipeline li');
  let current = 'boots', timers = [];

  function paint(key){
    const s = samples[key];
    $('#recId').textContent = s.id;
    $('#recSrcLabel').textContent = s.srcLabel;
    $('#recSrc').textContent = s.src;
    $('#recAttrs').innerHTML = s.attrs.map(a => `<span class="attr">${esc(a[0])}: <b>${esc(a[1])}</b></span>`).join('');
    const [c1,c2,c3] = s.code.map(g => g[0]);
    $('#hsCode').innerHTML = `<div class="hs-big" aria-label="${c1}${c2}.${c3}"><span>${c1}</span><span>${c2}</span><span class="dot">.</span><span>${c3}</span><span class="dim" aria-hidden="true">····</span></div>`
      + `<dl class="hs-legend"><div><dt>${c1}</dt><dd>Chapter: ${esc(s.code[0][1])}</dd></div><div><dt>${c1}${c2}</dt><dd>Heading: ${esc(s.code[1][1])}</dd></div><div><dt>${c1}${c2}.${c3}</dt><dd>Subheading: ${esc(s.code[2][1])}</dd></div><div class="pend"><dt>····</dt><dd>8 and 10 digits set from the tariff in force on the shipment date</dd></div></dl>`;
    $('#recCites').innerHTML = s.cites.map(c => `<li class="${c[1] ? 'warn' : ''}">${esc(c[0])}${c[1] ? ' <em>(needs fitment evidence)</em>' : ''}</li>`).join('');
    $('#originAgr').textContent = s.agr;
    const v = $('#originVerdict'); v.textContent = s.verdict; v.style.color = s.vClass ? 'var(--clear)' : 'var(--ink-2)';
    $('#originDetail').textContent = s.detail;
    $('#originProof').textContent = s.proof;
    $('#confV').textContent = s.conf.toFixed(2);
    const cb = $('#confBar'); cb.classList.toggle('low', s.conf < .8); cb.querySelector('span').style.width = (s.conf*100) + '%';
    $('#grV').textContent = `${s.gr[0]} of ${s.gr[1]} citations`;
    const gb = $('#grBar'); gb.classList.toggle('low', s.gr[0] < s.gr[1]); gb.querySelector('span').style.width = (s.gr[0]/s.gr[1]*100) + '%';
    setStatus(s.status[0], s.status[1]);
    const r = $('#route'); r.className = 'route ' + s.status[0];
    $('#routeText').innerHTML = s.route;
    $$('#routeActions button').forEach(b => b.disabled = false);
    $('#routeActions [data-act="approve"]').disabled = s.status[0] === 'review';
  }
  function setStatus(cls, text){ const c = $('#recStatus'); c.className = 'chip ' + cls; c.textContent = text; }
  function clearTimers(){ timers.forEach(clearTimeout); timers = []; }
  function run(key, animate){
    clearTimers(); current = key; paint(key);
    if (!animate || reduce){ steps.forEach(li => { li.className = 'done'; }); return; }
    body.classList.add('running'); setStatus('idle', 'Working');
    steps.forEach(li => li.className = '');
    steps.forEach((li, i) => {
      timers.push(setTimeout(() => { if (i) steps[i-1].className = 'done'; li.className = 'active'; }, i * 520));
    });
    timers.push(setTimeout(() => { steps.forEach(li => li.className = 'done'); body.classList.remove('running'); const s = samples[key]; setStatus(s.status[0], s.status[1]); }, steps.length * 520 + 200));
  }
  $$('.rec-tab').forEach(t => t.addEventListener('click', () => {
    $$('.rec-tab').forEach(x => x.setAttribute('aria-selected', x === t));
    run(t.dataset.sample, true);
  }));
  $('#replay').addEventListener('click', () => run(current, true));
  $('#routeActions').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const act = b.dataset.act, s = samples[current];
    const today = new Date().toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'});
    $$('#routeActions button').forEach(x => x.disabled = true);
    if (act === 'approve'){ setStatus('clear', 'Approved'); $('#routeText').innerHTML = `<b>Approved by you, ${today}.</b> Record ${esc(s.id)} pinned to the tariff and agreement versions in force today and retained for six years.`; }
    if (act === 'info'){ setStatus('review', 'Waiting for information'); $('#routeText').innerHTML = '<b>Information requested.</b> Upload a specification, drawing or supplier declaration and the determination re-runs with the new facts.'; }
    if (act === 'expert'){ setStatus('review', 'With customs expert'); $('#routeText').innerHTML = '<b>Sent to an accredited customs practitioner.</b> Their notes are added to the same record, and the final decision stays with you.'; }
    const undo = document.createElement('button'); undo.className = 'mini'; undo.textContent = 'Reset example';
    undo.addEventListener('click', () => { undo.remove(); paint(current); });
    $('#routeActions').appendChild(undo);
  });
  run('boots', false);

  /* ---------- Layers ---------- */
  const layers = [
    {t:'Government systems', d:'CDS, Online Tariff, rulings', trend:'Being digitised and AI-assisted by HMRC.', body:'The transactional backbone: the Customs Declaration Service, the online tariff and the advance ruling services. HMRC is adding AI to help people understand what codes mean.'},
    {t:'Regulatory content', d:'Tariff, guidance, agreement texts', trend:'Free from HMRC, curated at a premium by enterprise vendors.', body:'The rules themselves are published openly. Raw access is no longer where the value is.'},
    {t:'Classification and origin determination', d:'The judgement in the middle', trend:'No SME-grade product. Enterprise engines cost six figures to implement; AI-native startups stop at classification.', body:'Deciding which code is yours and whether your goods qualify for preference. It is interpretive, it carries liability, and it is where value is accruing. Tariffmark is built for this layer.', cb:true},
    {t:'Declaration preparation and filing', d:'Around 53 listed CDS software developers', trend:'A self-nominated directory, not an accreditation.', body:'Software that submits declarations. Tariffmark plans to hand off CDS-ready data rather than compete as one more filing tool.'},
    {t:'Representation and liability', d:'Intermediaries and declarants', trend:'Formalising and shrinking: 4,880 declarants, down 13.7%. Mandatory registration under consultation.', body:'The people who file 81% of UK declarations. Tariffmark plans to make them more productive and treat them as a sales channel.'},
    {t:'Assurance and enforcement', d:'Audit, advance rulings', trend:'Rising intensity. Advance rulings are free but slow and per product.', body:'Where decisions get tested. Tariffmark’s evidence records and ruling dossiers are designed for this moment.'}
  ];
  const lu = $('#layers'), ld = $('#layerDetail');
  lu.innerHTML = layers.map((l,i) => `<li><button class="layer${l.cb ? ' cb' : ''}" aria-pressed="${l.cb}" data-i="${i}"><span class="ln">L${i+1}</span><span><span class="lt">${esc(l.t)}</span><br><span class="ld">${esc(l.d)}</span></span><span class="ld">${l.cb ? 'Tariffmark' : ''}</span></button></li>`).join('');
  function showLayer(i){
    const l = layers[i];
    $$('.layer', lu).forEach(b => b.setAttribute('aria-pressed', b.dataset.i == i));
    ld.innerHTML = `<span class="kicker">Layer ${i+1} of 6</span><h3>${esc(l.t)}</h3><p>${esc(l.body)}</p><p class="trend">${esc(l.trend)}</p>`;
  }
  lu.addEventListener('click', e => { const b = e.target.closest('.layer'); if (b) showLayer(+b.dataset.i); });
  showLayer(2);

  /* ---------- Architecture ---------- */
  const tiers = [
    ['Input', [
      {k:'doc', t:'Document intelligence', s:'OCR and language-model parsing', lead:'Reads commercial invoices, packing lists and product specifications into structured attributes: material, form, function, value and component origins.', what:'Language models handle the noisy, abbreviated product descriptions small importers actually write far better than older classifiers.', rel:'First release, 2027'}
    ]],
    ['Decision', [
      {k:'cls', t:'Classification workflow', s:'Deterministic, multi-stage', lead:'A fixed sequence over a typed index of the UK Global Tariff: heading candidates, section and chapter notes, cross-chapter exclusions, GIR priority, subheadings.', what:'Classification has to satisfy material, form, function and essential character together. A fixed workflow stops the model fixing one and ignoring the rest.', rel:'First release, 2027'},
      {k:'org', t:'Origin engine', s:'Executable rules of origin', lead:'Encodes each agreement’s product-specific rules (tariff shift, value thresholds, specific processes, cumulation, tolerance) as tests and walks your bill of materials through them.', what:'Returns the verdict and the documents you must keep to defend the claim, versioned by agreement and date.', rel:'TCA at launch in 2027; CETA later in 2027; more agreements in 2028'},
      {k:'score', t:'Confidence and groundedness', s:'Two separate scores', lead:'Confidence asks whether the code is right. Groundedness asks whether the cited authority actually supports it.', what:'Showing calibrated confidence improves human–AI decisions; persuasive explanations alone can increase acceptance of wrong answers.', rel:'First release, 2027'}
    ]],
    ['Human', [
      {k:'route', t:'Review routing', s:'Human-in-the-loop', lead:'Low confidence, weak grounding or high duty exposure sends a case to review, to an accredited practitioner, or to an advance ruling dossier.', what:'You set the thresholds. Target escalation is 15% or less in year one, falling as the corpus grows.', rel:'First release, 2027'}
    ]],
    ['Memory', [
      {k:'corpus', t:'Versioned regulatory corpus', s:'Effective-dated rules', lead:'Every heading, note, origin rule and duty rate is stored with the dates it applied, and every determination is pinned to the versions it used.', what:'A determination made in 2026 can be reproduced under 2026 rules during an audit years later. Rule changes trigger re-checks of affected products.', rel:'Foundation for every release'},
      {k:'bench', t:'UK benchmark and corpus', s:'Published accuracy', lead:'A public benchmark of several hundred expert-adjudicated UK items, with Tariffmark’s score published against it, plus a private corpus of approved outcomes.', what:'No UK-regime benchmark exists today. Approved outcomes improve calibration from year two.', rel:'Benchmark published in 2027'}
    ]],
    ['Output', [
      {k:'ev', t:'Evidence and reporting', s:'Packs, dossiers, archive', lead:'Compliance reports, PAS 41201 evidence packs for intermediaries, and dossiers that support advance tariff and origin rulings.', what:'Six-year retention, quality-control sampling and AI-assistance disclosure are built in for intermediaries.', rel:'Report 2027; intermediary pack late 2027; dossiers 2028'},
      {k:'int', t:'Integrations and API', s:'CDS, ERP, freight', lead:'Forwarder hand-off first, then CDS-ready data through HMRC’s Developer Hub, ERP and freight connectors, and a determination API for platforms.', what:'Integration listing is a filter buyers check. It is never presented as approval.', rel:'CDS data 2028; ERP 2028; API late 2028'},
      {k:'model', t:'Replaceable model layer', s:'Vendor-independent', lead:'Because the workflow and knowledge sit outside the model, the language model can be swapped: frontier models where accuracy needs them, open-weight models where they agree.', what:'Keeps per-determination cost under control in a metered business and removes dependency on any one AI provider.', rel:'Design principle'}
    ]]
  ];
  const am = $('#archMap'), ap = $('#archPanel');
  const flat = {};
  am.innerHTML = tiers.map(([label, nodes]) => `<div class="arch-tier"><span>${label}</span><div class="arch-row">${nodes.map(n => { flat[n.k] = n; return `<button class="node" data-k="${n.k}" aria-pressed="false"><b>${esc(n.t)}</b><small>${esc(n.s)}</small></button>`; }).join('')}</div></div>`).join('');
  function showNode(k){
    const n = flat[k];
    $$('.node', am).forEach(b => b.setAttribute('aria-pressed', b.dataset.k === k));
    ap.innerHTML = `<h3>${esc(n.t)}</h3><p class="lead">${esc(n.lead)}</p><dl><div><dt>Why it matters</dt><dd>${esc(n.what)}</dd></div><div><dt>Planned</dt><dd>${esc(n.rel)}</dd></div></dl>`;
  }
  am.addEventListener('click', e => { const b = e.target.closest('.node'); if (b) showNode(b.dataset.k); });
  showNode('cls');

  /* ---------- Audiences ---------- */
  const auds = [
    {k:'sme', tab:'SME importers and exporters', h:'Growth-stage traders without a customs team', msg:'Know your code and your origin before the goods move, with the reasoning to show HMRC.', who:'Manufacturers, wholesalers and direct-to-consumer brands with 10 to 100 staff, filing roughly 50 to 500 declarations a year, mostly with the EU. First focus: footwear, textiles and apparel, where preference is most often missed, and machinery and components, where classification is hardest.',
      rows:[['Today','Email an invoice to a forwarder and receive a code with no reasoning, while the liability stays with you.'],['With Tariffmark','Upload one real shipping document and get a determination with citations, an origin verdict and the duty position.'],['Planned plans','Starter or Growth, £1,200 to £3,000 a year'],['Buys when','A shipment is held, HMRC sends a query or post-clearance demand, or a preference is lost.']]},
    {k:'int', tab:'Customs intermediaries', h:'Forwarders, agents and Chamber customs services', msg:'Raise throughput per declarant and meet the British Standard without adding headcount.', who:'The 4,880 active declarants who file 81% of UK declarations, now preparing for PAS 41201 and possible mandatory registration while their own numbers fall.',
      rows:[['Today','Classification in spreadsheets, rising audit expectations and fewer qualified people.'],['With Tariffmark','A multi-client workspace, PAS 41201 evidence packs with sampling and AI-disclosure reporting, and a six-year archive.'],['Planned plans','From £6,000 a year per workspace, plus seats; referral credits for clients you bring'],['Design partners','A 60-day shadow pilot on 60 of your real declarations, measuring agreement, escalations and minutes saved.']]},
    {k:'ind', tab:'UK–India corridor traders', h:'Exporters and importers using the CETA', msg:'Stop getting your India origin declarations rejected.', who:'UK exporters shipping to India and Indian importers claiming CETA preference, working through a new self-certification process that has been live since July 2026.',
      rows:[['Today','A manual, prescriptive process with registration and format problems reported soon after go-live.'],['With Tariffmark','Origin tested against CETA rules, a format-checked declaration PDF and your registration reference captured.'],['Planned price','£900 a year, or £15 per declaration for occasional exporters'],['Planned','2027, alongside the published UK benchmark']]}
  ];
  const at = $('#audTabs'), apn = $('#audPanel');
  at.innerHTML = auds.map((a,i) => `<button class="aud-tab" role="tab" aria-selected="${i===0}" data-k="${a.k}">${esc(a.tab)}</button>`).join('');
  function showAud(k){
    const a = auds.find(x => x.k === k);
    $$('.aud-tab', at).forEach(b => b.setAttribute('aria-selected', b.dataset.k === k));
    apn.innerHTML = `<div><h3>${esc(a.h)}</h3><p class="msg">${esc(a.msg)}</p><p class="who">${esc(a.who)}</p></div><dl class="aud-list">${a.rows.map(r => `<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl>`;
  }
  at.addEventListener('click', e => { const b = e.target.closest('.aud-tab'); if (b) showAud(b.dataset.k); });
  showAud('sme');

  /* ---------- Pricing ---------- */
  const plans = [
    {k:'starter', name:'Starter', for:'For traders filing a few declarations a month', m:99, y:1200, inc:60, over:6, feat:['Commodity classification with reasoning and citations','UK–EU TCA origin determination','Confidence score and evidence record','Customs-ready paperwork export']},
    {k:'growth', name:'Growth', for:'For growth-stage traders with a real catalogue', m:250, y:3000, inc:250, over:5, feature:true, feat:['Everything in Starter','Product catalogue with re-checks when rules change','Landed-cost and duty-saving flags','ERP and freight integrations']},
    {k:'inter', name:'Intermediary', for:'For declarants, forwarders and Chambers', m:500, y:6000, inc:1000, over:4, from:true, feat:['Everything in Growth','Multi-client workspace and seats','PAS 41201 evidence pack and six-year archive','Priority support and referral credits']}
  ];
  let bill = 'annual';
  const fmt = n => '£' + Math.round(n).toLocaleString('en-GB');
  function renderPlans(){
    $('#plans').innerHTML = plans.map(p => `<article class="plan${p.feature ? ' feature' : ''}">
      <div><h3>${p.name}</h3><p class="for">${p.for}</p></div>
      <div class="price"><b>${p.from ? '<span style="font-size:1rem;font-weight:500">from </span>' : ''}${bill === 'annual' ? fmt(p.y) : fmt(p.m)}</b><span>${bill === 'annual' ? 'a year' : 'a month'}</span></div>
      <p class="sub">${bill === 'annual' ? 'Equivalent to ' + fmt(p.y/12) + ' a month' : 'Or ' + fmt(p.y) + ' billed annually'}</p>
      <dl><div><dt>Determinations included</dt><dd>${p.inc.toLocaleString('en-GB')} a year</dd></div><div><dt>Each additional one</dt><dd>${fmt(p.over)}</dd></div></dl>
      <ul>${p.feat.map(f => `<li><span>${f}</span></li>`).join('')}</ul>
      <a class="btn ${p.feature ? 'btn-primary' : 'btn-ghost'}" href="#contact" style="justify-content:center">Register interest</a>
    </article>`).join('');
  }
  $$('.bill-toggle button').forEach(b => b.addEventListener('click', () => { bill = b.dataset.bill; $$('.bill-toggle button').forEach(x => x.setAttribute('aria-pressed', x === b)); renderPlans(); }));
  renderPlans();

  const vol = $('#vol');
  function calc(){
    const n = +vol.value;
    $('#volOut').textContent = n.toLocaleString('en-GB');
    const costs = plans.map(p => ({p, c: p.y + Math.max(0, n - p.inc) * p.over}));
    const max = Math.max(...costs.map(x => x.c));
    const best = costs.slice().sort((a,b) => a.c - b.c)[0];
    const human = n * 50;
    $('#calcOut').innerHTML = costs.map(x => `<div class="calc-row${x === best ? ' best' : ''}"><span>${x.p.name}</span><div class="ct"><div class="cf" style="width:${(x.c/max*100).toFixed(1)}%"></div></div><span class="cv">${fmt(x.c)}</span></div>`).join('')
      + `<p class="calc-sum"><b>${best.p.name}</b> is the lowest-cost plan at this volume: about <b>${fmt(best.c / n)}</b> per determination.</p>`
      + `<p class="calc-ctx">For context, HMRC research puts the median customs agent fee at about £50 per declaration, roughly ${fmt(human)} a year at this volume. Tariffmark prepares and evidences the decision; you or your agent still file it.</p>`;
  }
  vol.addEventListener('input', calc); calc();

  /* ---------- Roadmap ---------- */
  const rm = [
    {k:'now', tab:'Now: validation', h:'Prove the demand before the launch', p:'Discovery and pricing interviews with SME traders, three to five intermediary design partners, and a prototype measured on a seeded UK benchmark.', goal:'Exit when: written pilot agreements are signed, accuracy is measured, and pricing is confirmed within 20% of plan.',
      rel:[['P0','Now','Discovery interviews','At least five SME interviews on how they classify, claim preference and pay for it.'],['P0','Now','Design partners','Intermediaries recruited for 60-day shadow pilots on real declarations.'],['P0','Now','Prototype benchmark','Determination core tested against expert-adjudicated UK items.']]},
    {k:'y1', tab:'2027', h:'Ship, measure, publish', p:'Launch the determination core to paying SMEs, then make it visible: a published UK benchmark, the CETA corridor and the intermediary workspace.', goal:'Year-one goal: 50 paying SMEs, 3 paying intermediaries, benchmark published, escalation rate under 15%.',
      rel:[['v1.0','Q1 2027','Launch','Document reading, classification with reasoning, confidence and groundedness, review routing, TCA origin, duty position, reports and billing.'],['v1.1','Q2 2027','Hardening','Missing-information loop, reviewer notes, duty-saving flags and usage analytics.'],['v1.2','Q3 2027','Benchmark and CETA','Public UK benchmark of 300+ adjudicated items with method and score; India–UK CETA origin module.'],['v1.3','Q4 2027','Intermediary workspace','Multi-client seats, PAS 41201 evidence pack, referral credits, and catalogue re-checks on rule changes.']]},
    {k:'y2', tab:'2028', h:'Repeat, expand, beat the 2028 deadline', p:'With the channel working, add what lifts value per customer, let the corpus improve calibration, and ship bulk classification before low-value import relief ends.', goal:'Year-two goal: 400 to 700 customers, modules attached, API in pilot.',
      rel:[['v1.4','Q1 2028','CDS-ready data','Export through HMRC’s Developer Hub, sandbox to production, and forwarder hand-off.'],['v2.0','Q1 2028','Ruling dossiers','Advance tariff and origin ruling dossiers, with ruling outcomes captured.'],['v2.1','Q2 2028','Agreements and ERP','CPTPP, Japan, Australia and other agreement bundles; ERP and freight connectors.'],['v2.2','Q3 2028','Calibration v2','Confidence calibrated from approved outcomes; practitioner marketplace for review.'],['v2.3','Q3 2028','Bulk consignments','High-volume parcel classification live before October 2028.'],['v2.4','Q4 2028','Determination API','API and integrations for forwarder platforms.']]},
    {k:'y3', tab:'2029', h:'Platform and corridor', p:'Take the product to the Indian side of the corridor with local partners, pilot the EU regime for EU-facing forwarders, and test the architecture on an adjacent classification problem.', goal:'Year-three goal: 1,500 to 2,500 customers, £4–6m ARR, at least two platforms on the API, India product live.',
      rel:[['v3.0','H1 2029','India product','Exporter-side origin evidence across India’s trade agreements, with local pricing and partners.'],['v3.1','Q3 2029','EU pilot and UKAS path','EU tariff pilot with forwarders; formal conformance route for PAS 41201.'],['v3.2','Q4 2029','Adjacent pilot','Stage-gated pilot in dual-use or sanctions screening on the same workflow.']]}
  ];
  const rt = $('#rmTabs'), rp = $('#rmPanel');
  rt.innerHTML = rm.map((r,i) => `<button class="rm-tab" role="tab" aria-selected="${i===1}" data-k="${r.k}">${esc(r.tab)}</button>`).join('');
  function showRm(k){
    const r = rm.find(x => x.k === k);
    $$('.rm-tab', rt).forEach(b => b.setAttribute('aria-selected', b.dataset.k === k));
    rp.innerHTML = `<div class="rm-head"><h3>${esc(r.h)}</h3><p>${esc(r.p)}</p></div><div class="releases">${r.rel.map(x => `<div class="rel"><div class="rel-top"><span class="code">${x[0]}</span><span>${x[1]}</span></div><h4>${esc(x[2])}</h4><p>${esc(x[3])}</p></div>`).join('')}</div><p class="rm-goal">${esc(r.goal)}</p>`;
  }
  rt.addEventListener('click', e => { const b = e.target.closest('.rm-tab'); if (b) showRm(b.dataset.k); });
  showRm('y1');

  /* ---------- Form ---------- */
  $('#enq').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, email = f.email.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    $('#emailErr').hidden = ok;
    if (!f.name.value.trim()) { f.name.focus(); return; }
    if (!ok) { f.email.focus(); return; }
    $('#formDone').hidden = false;
  });
})();
