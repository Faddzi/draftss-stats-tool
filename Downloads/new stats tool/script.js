const columns=['Month','Total Leads Generated','New Leads','Reactivated Leads','FT Started','FT to Paid','Total Hot Leads','Total Warm Leads','Total Cold Leads','Calls Scheduled','Call No Show','Calls Completed','FT via Call','Converted via Call','Total Emailer Replies','Positive Replies','Negative Replies','FT via Emailer','Converted via Emailer','Total Leads via Google Ads','FT via Google Ads','Converted via GAds','Total Converted','Total Not Converted','Total Follow-up Later','Conversion Rate'];
const translations={
  en:{
    appTitle:'Funnel Stats',
    brandSubtitle:'Monthly lead, free trial and paid conversion performance',
    dashboardTab:'Dashboard',
    rawTab:'Raw data',
    connectSheet:'Connect sheet',
    refresh:'↻ Refresh',
    funnelOverviewTitle:'Funnel overview',
    funnelOverviewText:"See exactly where this month's leads are converting or dropping off.",
    selectedMonth:'Selected month',
    overallConversion:'Overall conversion',
    performanceOverTime:'Performance over time',
    performanceOverTimeText:'Volume and conversion quality across every available month.',
    funnelVolume:'Funnel volume',
    monthly:'Monthly',
    conversionRates:'Conversion rates',
    monthlyPercent:'Monthly %',
    acquisitionChannels:'Acquisition channel performance',
    acquisitionChannelsText:'Which sources create trials and customers, not just activity.',
    leadQualityOutcomes:'Lead quality & outcomes',
    leadQualityOutcomesText:'A quick read on the mix and final destination of your leads.',
    leadQuality:'Lead quality',
    shareTotalLeads:'Share of total leads',
    leadOutcome:'Lead outcome',
    whatHappened:'What happened to leads',
    callPerformance:'Call performance',
    callPerformanceText:'Track the progression from scheduled conversations to revenue.',
    emailerPerformance:'Emailer performance',
    emailerPerformanceText:'Understand reply quality and downstream conversion.',
    adsPerformance:'Google Ads performance',
    adsPerformanceText:'Paid acquisition funnel at a glance.',
    keyInsights:'Key insights',
    keyInsightsText:'Factual observations from the selected period.',
    leads:'Leads',
    freeTrials:'Free trials',
    paid:'Paid',
    leadToFt:'Lead → FT',
    ftToPaid:'FT → Paid',
    leadToPaid:'Lead → Paid',
    totalLeads:'Total leads',
    totalFreeTrials:'Free trials',
    totalPaid:'Paid customers',
    totalLeadsFrom:'Leads generated',
    ofTotalLeads:'of total leads',
    ofFreeTrials:'of free trials',
    overallConversionShort:'overall conversion',
    leadToFreeTrial:'Lead → free trial',
    freeTrialToPaid:'Free trial → paid',
    calls:'Calls',
    emailers:'Emailers',
    googleAds:'Google Ads',
    scheduled:'Scheduled',
    completed:'Completed',
    freeTrial:'Free trial',
    replies:'Replies',
    positive:'Positive',
    noShow:'No-show',
    showRate:'Show rate',
    positiveReply:'Positive reply',
    negativeReply:'Negative reply',
    hotLeads:'Hot Leads',
    warmLeads:'Warm Leads',
    coldLeads:'Cold Leads',
    converted:'Converted',
    notConverted:'Not converted',
    followUpLater:'Follow-up later',
    rawMonthlyData:'Raw monthly data',
    rawMonthlyDataText:'Underlying values imported from the Monthly Data tab.',
    searchMonths:'Search months...',
    demoData:'Demo data',
    updatedJustNow:'updated just now',
    connectSheetModalTitle:'Connect your Google Sheet',
    connectSheetModalText:'Paste a published or accessible Google Sheet URL. Funnel Stats will read the Monthly Data tab and calculate all metrics in your browser.',
    loadingData:'Loading Monthly Data…',
    sheetError:'Could not load that sheet. Make sure the Monthly Data tab exists and the sheet is shared or published.',
    connected:'Connected ✓',
    monthsLoaded:'months loaded.',
    allMonths:'All Months',
    monthlyData:'Monthly Data',
    followUpLaterShort:'Follow-up later'
  }
};
const demo=[
['Jun 2026',980,700,280,286,92,210,370,400,180,31,149,48,21,260,108,75,64,22,390,96,49,162,626,192],
['Jul 2026',1080,760,320,342,112,248,411,421,212,34,178,61,27,302,132,91,77,28,430,110,57,197,684,199],
['Aug 2026',1180,830,350,371,141,284,448,448,246,39,207,77,35,341,154,103,91,34,472,128,69,244,731,205],
['Sep 2026',1240,880,360,386,142,312,470,458,268,42,226,86,39,374,171,112,102,38,508,146,81,260,768,212]
].map(r=>Object.fromEntries(columns.map((c,i)=>[c,r[i]??0])));
let rows=[...demo], selected='Sep 2026';
function t(key){return translations.en[key] || key;}
const n=v=>{const x=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(x)?x:0}; const pct=(a,b)=>b>0?`${(a/b*100).toFixed(1)}%`:'N/A'; const sum=(list,k)=>list.reduce((t,r)=>t+n(r[k]),0);
function aggregate(list){const out={Month:list.length===1?list[0].Month:'All Months'}; columns.slice(1).forEach(k=>out[k]=sum(list,k)); out['Conversion Rate']=pct(out['Total Converted'],out['Total Leads Generated']); return out}
function prevFor(){let i=rows.findIndex(r=>r.Month===selected);return i>0?rows[i-1]:null}
function current(){return selected==='All Months'?aggregate(rows):rows.find(r=>r.Month===selected)||aggregate(rows)}
function trendSvg(data, keys, colors, percent=false){const w=620,h=220,p={l:36,r:10,t:12,b:28};const max=percent?100:Math.max(...data.flatMap(r=>keys.map(k=>n(r[k]))),1);const x=i=>p.l+i*((w-p.l-p.r)/Math.max(data.length-1,1));const y=v=>h-p.b-(v/max)*(h-p.t-p.b);let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Monthly trend chart">`;[0,.5,1].forEach(t=>{let yy=y(max*t);svg+=`<line x1="${p.l}" x2="${w-p.r}" y1="${yy}" y2="${yy}" stroke="#edf0f5"/><text x="0" y="${yy+4}" fill="#9aa6b8" font-size="10">${percent?Math.round(max*t):Math.round(max*t).toLocaleString()}</text>`});keys.forEach((key,ki)=>{const pts=data.map((r,i)=>`${x(i)},${y(n(r[key]))}`).join(' ');svg+=`<polyline points="${pts}" fill="none" stroke="${colors[ki]}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;data.forEach((r,i)=>svg+=`<circle cx="${x(i)}" cy="${y(n(r[key]))}" r="3.5" fill="${colors[ki]}" stroke="#fff" stroke-width="2"><title>${r.Month}: ${percent?pct(n(r[key]),100):n(r[key]).toLocaleString()}</title></circle>`)});data.forEach((r,i)=>svg+=`<text x="${x(i)}" y="${h-5}" text-anchor="middle" fill="#9aa6b8" font-size="10">${r.Month.split(' ')[0]}</text>`);return svg+'</svg>'}
function render(){const d=current(), prev=prevFor(); renderLanguageUI(); document.getElementById('funnelMonth').textContent=d.Month;document.getElementById('overallRate').textContent=pct(n(d['FT to Paid']),n(d['Total Leads Generated']));
 const kpis=[[t('totalLeads'),'Total Leads Generated','↗',pct(n(d['Total Leads Generated']),n(d['Total Leads Generated'])),t('totalLeadsFrom')],[t('freeTrials'),'FT Started','✦',pct(n(d['FT Started']),n(d['Total Leads Generated'])),t('ofTotalLeads')],[t('totalPaid'),'FT to Paid','✓',pct(n(d['FT to Paid']),n(d['FT Started'])),t('ofFreeTrials')],[t('leadToPaid'),'FT to Paid','↗',`${n(d['FT to Paid']).toLocaleString()} customers from ${n(d['Total Leads Generated']).toLocaleString()} leads`,t('overallConversionShort')]];document.getElementById('kpis').innerHTML=kpis.map((k,i)=>{let change='';if(prev&&i<3){const a=n(d[k[1]]),b=n(prev[k[1]]);change=`<span class="${a>=b?'delta':'delta down'}">${b?((a-b)/b*100).toFixed(1):'0'}% vs previous</span>`}return `<div class="card kpi"><div class="eyebrow"><span>${k[0]}</span><span class="icon">${k[2]}</span></div><strong>${i===3?pct(n(d['FT to Paid']),n(d['Total Leads Generated'])):n(d[k[1]]).toLocaleString()}</strong><small>${i===3?k[3]:k[3]} ${change}</small></div>`}).join('');
 document.getElementById('funnel').innerHTML=`<div class="funnel-stage leads"><span class="stage-name">${t('leads').toUpperCase()}</span><div><strong>${n(d['Total Leads Generated']).toLocaleString()}</strong><span>100%</span></div></div><div class="arrow-rate">↓ ${pct(n(d['FT Started']),n(d['Total Leads Generated']))} converted</div><div class="funnel-stage trials"><span class="stage-name">${t('freeTrials').toUpperCase()}</span><div><strong>${n(d['FT Started']).toLocaleString()}</strong><span>${pct(n(d['FT Started']),n(d['Total Leads Generated']))}</span></div></div><div class="arrow-rate">↓ ${pct(n(d['FT to Paid']),n(d['FT Started']))} converted</div><div class="funnel-stage paid"><span class="stage-name">${t('paid').toUpperCase()}</span><div><strong>${n(d['FT to Paid']).toLocaleString()}</strong><span>${pct(n(d['FT to Paid']),n(d['Total Leads Generated']))} of leads</span></div></div>`;
 document.getElementById('funnelRates').innerHTML=[[t('leadToFreeTrial'),pct(n(d['FT Started']),n(d['Total Leads Generated']))],[t('freeTrialToPaid'),pct(n(d['FT to Paid']),n(d['FT Started']))],[t('leadToPaid'),pct(n(d['FT to Paid']),n(d['Total Leads Generated']))]].map(x=>`<div class="metric-line"><label>${x[0]}</label><strong>${x[1]}</strong></div>`).join('');
 const trends=rows.length?rows:demo; document.getElementById('volumeChart').innerHTML=trendSvg(trends,['Total Leads Generated','FT Started','FT to Paid'],['#386bed','#79a1f4','#23a477']); const rates=trends.map(r=>({...r,'Lead → FT':n(r['FT Started'])/n(r['Total Leads Generated'])*100,'FT → Paid':n(r['FT to Paid'])/n(r['FT Started'])*100,'Lead → Paid':n(r['FT to Paid'])/n(r['Total Leads Generated'])*100}));document.getElementById('rateChart').innerHTML=trendSvg(rates,['Lead → FT','FT → Paid','Lead → Paid'],['#386bed','#23a477','#d7962d'],true);
 const channels=[[t('calls'),'Calls Completed','FT via Call','Converted via Call'],[t('emailers'),'Total Emailer Replies','FT via Emailer','Converted via Emailer'],[t('googleAds'),'Total Leads via Google Ads','FT via Google Ads','Converted via GAds']];document.getElementById('channels').innerHTML=channels.map(c=>`<div class="card channel"><div class="channel-head"><span class="channel-name">${c[0]}</span><span class="channel-badge">${pct(n(d[c[3]]),n(d[c[1]]))} paid</span></div><div class="subtle">Free trial conversion</div><div class="progress"><span style="width:${Math.min(100,n(d[c[2]])/Math.max(1,n(d[c[1]]))*100)}%"></span></div><div class="channel-stats"><div><b>${n(d[c[1]]).toLocaleString()}</b><small>STARTING</small></div><div><b>${n(d[c[2]]).toLocaleString()}</b><small>FREE TRIALS</small></div><div><b>${n(d[c[3]]).toLocaleString()}</b><small>PAID</small></div></div><div class="subtle" style="margin-top:17px">FT rate <b>${pct(n(d[c[2]]),n(d[c[1]]))}</b> · Paid rate <b>${pct(n(d[c[3]]),n(d[c[1]]))}</b></div></div>`).join('');
 const q=[[t('hotLeads'),'Total Hot Leads',''],[t('warmLeads'),'Total Warm Leads','warm'],[t('coldLeads'),'Total Cold Leads','cold']]; const total=n(d['Total Leads Generated']);document.getElementById('qualityList').innerHTML=q.map(x=>`<div class="quality-row"><i class="dot ${x[2]}"></i><label>${x[0]}</label><b>${n(d[x[1]]).toLocaleString()}</b><small>${pct(n(d[x[1]]),total)}</small></div>`).join('');const q1=n(d['Total Hot Leads'])/Math.max(total,1)*100,q2=(n(d['Total Hot Leads'])+n(d['Total Warm Leads']))/Math.max(total,1)*100;document.getElementById('qualityDonut').style.background=`conic-gradient(var(--blue) 0 ${q1}%,#79a1f4 ${q1}% ${q2}%,#cbd8f7 ${q2}% 100%)`;
 const out=[[t('converted'),'Total Converted',''],[t('notConverted'),'Total Not Converted','warm'],[t('followUpLaterShort'),'Total Follow-up Later','cold']];document.getElementById('outcomeList').innerHTML=out.map(x=>`<div class="quality-row"><i class="dot ${x[2]}"></i><label>${x[0]}</label><b>${n(d[x[1]]).toLocaleString()}</b><small>${pct(n(d[x[1]]),total)}</small></div>`).join('');let o1=n(d['Total Converted'])/Math.max(total,1)*100,o2=(n(d['Total Converted'])+n(d['Total Not Converted']))/Math.max(total,1)*100;document.getElementById('outcomeDonut').style.background=`conic-gradient(var(--green) 0 ${o1}%,#f0a1a0 ${o1}% ${o2}%,#f4d28a ${o2}% 100%)`;
 renderProgress('callPanel',[[t('scheduled'),'Calls Scheduled'],[t('completed'),'Calls Completed'],[t('freeTrial'),'FT via Call'],[t('paid'),'Converted via Call']],[['Show rate',pct(n(d['Calls Completed']),n(d['Calls Scheduled']))],['No-show rate',pct(n(d['Call No Show']),n(d['Calls Scheduled']))],['Call → FT',pct(n(d['FT via Call']),n(d['Calls Completed']))],['Call → paid',pct(n(d['Converted via Call']),n(d['Calls Completed']))]]);renderProgress('emailPanel',[[t('replies'),'Total Emailer Replies'],[t('positive'),'Positive Replies'],[t('freeTrial'),'FT via Emailer'],[t('paid'),'Converted via Emailer']],[['Positive reply',pct(n(d['Positive Replies']),n(d['Total Emailer Replies']))],['Negative reply',pct(n(d['Negative Replies']),n(d['Total Emailer Replies']))],['Reply → FT',pct(n(d['FT via Emailer']),n(d['Total Emailer Replies']))],['Reply → paid',pct(n(d['Converted via Emailer']),n(d['Total Emailer Replies']))]]);renderProgress('adsPanel',[[t('leads'),'Total Leads via Google Ads'],[t('freeTrial'),'FT via Google Ads'],[t('paid'),'Converted via GAds']],[['Lead → FT',pct(n(d['FT via Google Ads']),n(d['Total Leads via Google Ads']))],['Lead → paid',pct(n(d['Converted via GAds']),n(d['Total Leads via Google Ads']))]]);
 document.getElementById('insights').innerHTML=[`${n(d['Total Leads Generated']).toLocaleString()} leads generated ${selected==='All Months'?'across the selected period':'this month'}.`,`${n(d['FT Started']).toLocaleString()} leads started a free trial, a ${pct(n(d['FT Started']),total)} trial rate.`,`${n(d['FT to Paid']).toLocaleString()} free trials converted to paid.`, `Overall lead → paid conversion is ${pct(n(d['FT to Paid']),total)}.`].map(t=>`<div class="card insight"><span class="bullet">●</span><span>${t}</span></div>`).join('');renderRaw();}
 function renderProgress(id,nodes,rates){document.getElementById(id).innerHTML=`<div class="progression">${nodes.map((x,i)=>(i?'<div class="connector"></div>':'')+`<div class="node"><div class="circle">${n(current()[x[1]]).toLocaleString()}</div><label>${x[0]}</label></div>`).join('')}</div><div class="rate-grid">${rates.map(x=>`<div><b>${x[1]}</b><small>${x[0]}</small></div>`).join('')}</div>`}
 function renderRaw(){document.getElementById('rawHead').innerHTML='<tr>'+columns.map(c=>`<th>${c}</th>`).join('')+'</tr>';const query=(document.getElementById('rawSearch').value||'').toLowerCase();document.getElementById('rawBody').innerHTML=rows.filter(r=>r.Month.toLowerCase().includes(query)).map(r=>'<tr>'+columns.map(c=>`<td>${c==='Month'?r[c]:c==='Conversion Rate'?pct(n(r['Total Converted']),n(r['Total Leads Generated'])):n(r[c]).toLocaleString()}</td>`).join('')+'</tr>').join('')}
 function populate(){const sel=document.getElementById('monthSelect');sel.innerHTML='<option>All Months</option>'+rows.slice().reverse().map(r=>`<option>${r.Month}</option>`).join('');sel.value=selected}
 function parseCsv(text){const lines=text.trim().split(/\r?\n/).map(line=>line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(v=>v.replace(/^\"|\"$/g,'').trim()));const headers=lines.shift();return lines.filter(r=>r.length>1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||'']))).filter(r=>r.Month)}
function renderLanguageUI(){
  document.getElementById('appTitle').textContent=t('appTitle');
  document.getElementById('brandSubtitle').textContent=t('brandSubtitle');
  document.querySelector('[data-view="dashboard"]').textContent=t('dashboardTab');
  document.querySelector('[data-view="raw"]').textContent=t('rawTab');
  document.getElementById('connectBtn').textContent=t('connectSheet');
  document.getElementById('refreshBtn').textContent=t('refresh');
  document.getElementById('funnelOverviewTitle').textContent=t('funnelOverviewTitle');
  document.getElementById('funnelOverviewText').textContent=t('funnelOverviewText');
  document.getElementById('timePerformanceTitle').textContent=t('performanceOverTime');
  document.getElementById('timePerformanceText').textContent=t('performanceOverTimeText');
  document.getElementById('funnelVolumeLabel').textContent=t('funnelVolume');
  document.getElementById('monthlyLabel').textContent=t('monthly');
  document.getElementById('conversionRatesLabel').textContent=t('conversionRates');
  document.getElementById('monthlyPercentLabel').textContent=t('monthlyPercent');
  document.getElementById('leadsLegend').textContent=t('leads');
  document.getElementById('freeTrialsLegend').textContent=t('freeTrials');
  document.getElementById('paidLegend').textContent=t('paid');
  document.getElementById('leadFtLegend').textContent=t('leadToFt');
  document.getElementById('ftPaidLegend').textContent=t('ftToPaid');
  document.getElementById('leadPaidLegend').textContent=t('leadToPaid');
  document.getElementById('channelPerformanceTitle').textContent=t('acquisitionChannels');
  document.getElementById('channelPerformanceText').textContent=t('acquisitionChannelsText');
  document.getElementById('qualityOutcomeTitle').textContent=t('leadQualityOutcomes');
  document.getElementById('qualityOutcomeText').textContent=t('leadQualityOutcomesText');
  document.getElementById('leadQualityLabel').textContent=t('leadQuality');
  document.getElementById('qualityShareLabel').textContent=t('shareTotalLeads');
  document.getElementById('leadOutcomeLabel').textContent=t('leadOutcome');
  document.getElementById('leadOutcomeTextLabel').textContent=t('whatHappened');
  document.getElementById('callPerformanceTitle').textContent=t('callPerformance');
  document.getElementById('callPerformanceText').textContent=t('callPerformanceText');
  document.getElementById('emailPerformanceTitle').textContent=t('emailerPerformance');
  document.getElementById('emailPerformanceText').textContent=t('emailerPerformanceText');
  document.getElementById('adsPerformanceTitle').textContent=t('adsPerformance');
  document.getElementById('adsPerformanceText').textContent=t('adsPerformanceText');
  document.getElementById('keyInsightsTitle').textContent=t('keyInsights');
  document.getElementById('keyInsightsText').textContent=t('keyInsightsText');
  document.getElementById('rawHead').innerHTML = '<tr>'+columns.map(c=>`<th>${c}</th>`).join('')+'</tr>';
}
 document.getElementById('monthSelect').onchange=e=>{selected=e.target.value;render()};document.getElementById('refreshBtn').onclick=()=>{document.getElementById('updatedLabel').textContent='Updated just now';render()};document.getElementById('rawSearch').oninput=renderRaw;document.querySelectorAll('.tab').forEach(tab=>tab.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');document.getElementById('dashboard').classList.toggle('hide',tab.dataset.view!=='dashboard');document.getElementById('raw').classList.toggle('show',tab.dataset.view==='raw')});document.getElementById('connectBtn').onclick=()=>document.getElementById('connectModal').classList.add('open');document.getElementById('cancelConnect').onclick=()=>document.getElementById('connectModal').classList.remove('open');document.getElementById('doConnect').onclick=async()=>{const status=document.getElementById('connectStatus'),url=document.getElementById('sheetUrl').value;status.className='status';status.textContent=t('loadingData');try{const m=url.match(/\/d\/([\w-]+)/);if(!m)throw Error();const res=await fetch(`https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv&sheet=Monthly%20Data`);if(!res.ok)throw Error();const imported=parseCsv(await res.text());if(!imported.length)throw Error();rows=imported;selected='All Months';populate();render();status.textContent=`${t('connected')} ${rows.length} ${t('monthsLoaded')}`;setTimeout(()=>document.getElementById('connectModal').classList.remove('open'),900)}catch(e){status.className='status error';status.textContent=t('sheetError')}};
 populate();render();
/*
let rows=[...demo], selected='Sep 2026', currentLang='en';
function t(key){return (translations[currentLang]&&translations[currentLang][key]) || translations.en[key] || key;}
const n=v=>{const x=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(x)?x:0}; const pct=(a,b)=>b>0?`${(a/b*100).toFixed(1)}%`:'N/A'; const sum=(list,k)=>list.reduce((t,r)=>t+n(r[k]),0);
function aggregate(list){const out={Month:list.length===1?list[0].Month:'All Months'}; columns.slice(1).forEach(k=>out[k]=sum(list,k)); out['Conversion Rate']=pct(out['Total Converted'],out['Total Leads Generated']); return out}
function prevFor(){let i=rows.findIndex(r=>r.Month===selected);return i>0?rows[i-1]:null}
function current(){return selected==='All Months'?aggregate(rows):rows.find(r=>r.Month===selected)||aggregate(rows)}
function trendSvg(data, keys, colors, percent=false){const w=620,h=220,p={l:36,r:10,t:12,b:28};const max=percent?100:Math.max(...data.flatMap(r=>keys.map(k=>n(r[k]))),1);const x=i=>p.l+i*((w-p.l-p.r)/Math.max(data.length-1,1));const y=v=>h-p.b-(v/max)*(h-p.t-p.b);let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Monthly trend chart">`;[0,.5,1].forEach(t=>{let yy=y(max*t);svg+=`<line x1="${p.l}" x2="${w-p.r}" y1="${yy}" y2="${yy}" stroke="#edf0f5"/><text x="0" y="${yy+4}" fill="#9aa6b8" font-size="10">${percent?Math.round(max*t):Math.round(max*t).toLocaleString()}</text>`});keys.forEach((key,ki)=>{const pts=data.map((r,i)=>`${x(i)},${y(n(r[key]))}`).join(' ');svg+=`<polyline points="${pts}" fill="none" stroke="${colors[ki]}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;data.forEach((r,i)=>svg+=`<circle cx="${x(i)}" cy="${y(n(r[key]))}" r="3.5" fill="${colors[ki]}" stroke="#fff" stroke-width="2"><title>${r.Month}: ${percent?pct(n(r[key]),100):n(r[key]).toLocaleString()}</title></circle>`)});data.forEach((r,i)=>svg+=`<text x="${x(i)}" y="${h-5}" text-anchor="middle" fill="#9aa6b8" font-size="10">${r.Month.split(' ')[0]}</text>`);return svg+'</svg>'}
function render(){const d=current(), prev=prevFor(); renderLanguageUI(); document.getElementById('funnelMonth').textContent=d.Month;document.getElementById('overallRate').textContent=pct(n(d['FT to Paid']),n(d['Total Leads Generated']));
 const kpis=[[t('totalLeads'),'Total Leads Generated','↗',pct(n(d['Total Leads Generated']),n(d['Total Leads Generated'])),t('totalLeadsFrom')],[t('freeTrials'),'FT Started','✦',pct(n(d['FT Started']),n(d['Total Leads Generated'])),t('ofTotalLeads')],[t('totalPaid'),'FT to Paid','✓',pct(n(d['FT to Paid']),n(d['FT Started'])),t('ofFreeTrials')],[t('leadToPaid'),'FT to Paid','↗',`${n(d['FT to Paid']).toLocaleString()} customers from ${n(d['Total Leads Generated']).toLocaleString()} leads`,t('overallConversionShort')]];document.getElementById('kpis').innerHTML=kpis.map((k,i)=>{let change='';if(prev&&i<3){const a=n(d[k[1]]),b=n(prev[k[1]]);change=`<span class="${a>=b?'delta':'delta down'}">${b?((a-b)/b*100).toFixed(1):'0'}% vs previous</span>`}return `<div class="card kpi"><div class="eyebrow"><span>${k[0]}</span><span class="icon">${k[2]}</span></div><strong>${i===3?pct(n(d['FT to Paid']),n(d['Total Leads Generated'])):n(d[k[1]]).toLocaleString()}</strong><small>${i===3?k[3]:k[3]} ${change}</small></div>`}).join('');
 document.getElementById('funnel').innerHTML=`<div class="funnel-stage leads"><span class="stage-name">${t('leads').toUpperCase()}</span><div><strong>${n(d['Total Leads Generated']).toLocaleString()}</strong><span>100%</span></div></div><div class="arrow-rate">↓ ${pct(n(d['FT Started']),n(d['Total Leads Generated']))} converted</div><div class="funnel-stage trials"><span class="stage-name">${t('freeTrials').toUpperCase()}</span><div><strong>${n(d['FT Started']).toLocaleString()}</strong><span>${pct(n(d['FT Started']),n(d['Total Leads Generated']))}</span></div></div><div class="arrow-rate">↓ ${pct(n(d['FT to Paid']),n(d['FT Started']))} converted</div><div class="funnel-stage paid"><span class="stage-name">${t('paid').toUpperCase()}</span><div><strong>${n(d['FT to Paid']).toLocaleString()}</strong><span>${pct(n(d['FT to Paid']),n(d['Total Leads Generated']))} of leads</span></div></div>`;
 document.getElementById('funnelRates').innerHTML=[[t('leadToFreeTrial'),pct(n(d['FT Started']),n(d['Total Leads Generated']))],[t('freeTrialToPaid'),pct(n(d['FT to Paid']),n(d['FT Started']))],[t('leadToPaid'),pct(n(d['FT to Paid']),n(d['Total Leads Generated']))]].map(x=>`<div class="metric-line"><label>${x[0]}</label><strong>${x[1]}</strong></div>`).join('');
 const trends=rows.length?rows:demo; document.getElementById('volumeChart').innerHTML=trendSvg(trends,['Total Leads Generated','FT Started','FT to Paid'],['#386bed','#79a1f4','#23a477']); const rates=trends.map(r=>({...r,'Lead → FT':n(r['FT Started'])/n(r['Total Leads Generated'])*100,'FT → Paid':n(r['FT to Paid'])/n(r['FT Started'])*100,'Lead → Paid':n(r['FT to Paid'])/n(r['Total Leads Generated'])*100}));document.getElementById('rateChart').innerHTML=trendSvg(rates,['Lead → FT','FT → Paid','Lead → Paid'],['#386bed','#23a477','#d7962d'],true);
 const channels=[[t('calls'),'Calls Completed','FT via Call','Converted via Call'],[t('emailers'),'Total Emailer Replies','FT via Emailer','Converted via Emailer'],[t('googleAds'),'Total Leads via Google Ads','FT via Google Ads','Converted via GAds']];document.getElementById('channels').innerHTML=channels.map(c=>`<div class="card channel"><div class="channel-head"><span class="channel-name">${c[0]}</span><span class="channel-badge">${pct(n(d[c[3]]),n(d[c[1]]))} paid</span></div><div class="subtle">Free trial conversion</div><div class="progress"><span style="width:${Math.min(100,n(d[c[2]])/Math.max(1,n(d[c[1]]))*100)}%"></span></div><div class="channel-stats"><div><b>${n(d[c[1]]).toLocaleString()}</b><small>STARTING</small></div><div><b>${n(d[c[2]]).toLocaleString()}</b><small>FREE TRIALS</small></div><div><b>${n(d[c[3]]).toLocaleString()}</b><small>PAID</small></div></div><div class="subtle" style="margin-top:17px">FT rate <b>${pct(n(d[c[2]]),n(d[c[1]]))}</b> · Paid rate <b>${pct(n(d[c[3]]),n(d[c[1]]))}</b></div></div>`).join('');
 const q=[[t('hotLeads'),'Total Hot Leads',''],[t('warmLeads'),'Total Warm Leads','warm'],[t('coldLeads'),'Total Cold Leads','cold']]; const total=n(d['Total Leads Generated']);document.getElementById('qualityList').innerHTML=q.map(x=>`<div class="quality-row"><i class="dot ${x[2]}"></i><label>${x[0]}</label><b>${n(d[x[1]]).toLocaleString()}</b><small>${pct(n(d[x[1]]),total)}</small></div>`).join('');const q1=n(d['Total Hot Leads'])/Math.max(total,1)*100,q2=(n(d['Total Hot Leads'])+n(d['Total Warm Leads']))/Math.max(total,1)*100;document.getElementById('qualityDonut').style.background=`conic-gradient(var(--blue) 0 ${q1}%,#79a1f4 ${q1}% ${q2}%,#cbd8f7 ${q2}% 100%)`;
 const out=[[t('converted'),'Total Converted',''],[t('notConverted'),'Total Not Converted','warm'],[t('followUpLaterShort'),'Total Follow-up Later','cold']];document.getElementById('outcomeList').innerHTML=out.map(x=>`<div class="quality-row"><i class="dot ${x[2]}"></i><label>${x[0]}</label><b>${n(d[x[1]]).toLocaleString()}</b><small>${pct(n(d[x[1]]),total)}</small></div>`).join('');let o1=n(d['Total Converted'])/Math.max(total,1)*100,o2=(n(d['Total Converted'])+n(d['Total Not Converted']))/Math.max(total,1)*100;document.getElementById('outcomeDonut').style.background=`conic-gradient(var(--green) 0 ${o1}%,#f0a1a0 ${o1}% ${o2}%,#f4d28a ${o2}% 100%)`;
 renderProgress('callPanel',[[t('scheduled'),'Calls Scheduled'],[t('completed'),'Calls Completed'],[t('freeTrial'),'FT via Call'],[t('paid'),'Converted via Call']],[['Show rate',pct(n(d['Calls Completed']),n(d['Calls Scheduled']))],['No-show rate',pct(n(d['Call No Show']),n(d['Calls Scheduled']))],['Call → FT',pct(n(d['FT via Call']),n(d['Calls Completed']))],['Call → paid',pct(n(d['Converted via Call']),n(d['Calls Completed']))]]);renderProgress('emailPanel',[[t('replies'),'Total Emailer Replies'],[t('positive'),'Positive Replies'],[t('freeTrial'),'FT via Emailer'],[t('paid'),'Converted via Emailer']],[['Positive reply',pct(n(d['Positive Replies']),n(d['Total Emailer Replies']))],['Negative reply',pct(n(d['Negative Replies']),n(d['Total Emailer Replies']))],['Reply → FT',pct(n(d['FT via Emailer']),n(d['Total Emailer Replies']))],['Reply → paid',pct(n(d['Converted via Emailer']),n(d['Total Emailer Replies']))]]);renderProgress('adsPanel',[[t('leads'),'Total Leads via Google Ads'],[t('freeTrial'),'FT via Google Ads'],[t('paid'),'Converted via GAds']],[['Lead → FT',pct(n(d['FT via Google Ads']),n(d['Total Leads via Google Ads']))],['Lead → paid',pct(n(d['Converted via GAds']),n(d['Total Leads via Google Ads']))]]);
 document.getElementById('insights').innerHTML=[`${n(d['Total Leads Generated']).toLocaleString()} leads generated ${selected==='All Months'?'across the selected period':'this month'}.`,`${n(d['FT Started']).toLocaleString()} leads started a free trial, a ${pct(n(d['FT Started']),total)} trial rate.`,`${n(d['FT to Paid']).toLocaleString()} free trials converted to paid.`, `Overall lead → paid conversion is ${pct(n(d['FT to Paid']),total)}.`].map(t=>`<div class="card insight"><span class="bullet">●</span><span>${t}</span></div>`).join('');renderRaw();}
 function renderProgress(id,nodes,rates){document.getElementById(id).innerHTML=`<div class="progression">${nodes.map((x,i)=>(i?'<div class="connector"></div>':'')+`<div class="node"><div class="circle">${n(current()[x[1]]).toLocaleString()}</div><label>${x[0]}</label></div>`).join('')}</div><div class="rate-grid">${rates.map(x=>`<div><b>${x[1]}</b><small>${x[0]}</small></div>`).join('')}</div>`}
 function renderRaw(){document.getElementById('rawHead').innerHTML='<tr>'+columns.map(c=>`<th>${c}</th>`).join('')+'</tr>';const query=(document.getElementById('rawSearch').value||'').toLowerCase();document.getElementById('rawBody').innerHTML=rows.filter(r=>r.Month.toLowerCase().includes(query)).map(r=>'<tr>'+columns.map(c=>`<td>${c==='Month'?r[c]:c==='Conversion Rate'?pct(n(r['Total Converted']),n(r['Total Leads Generated'])):n(r[c]).toLocaleString()}</td>`).join('')+'</tr>').join('')}
 function populate(){const sel=document.getElementById('monthSelect');sel.innerHTML='<option>All Months</option>'+rows.slice().reverse().map(r=>`<option>${r.Month}</option>`).join('');sel.value=selected}
 function parseCsv(text){const lines=text.trim().split(/\r?\n/).map(line=>line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(v=>v.replace(/^\"|\"$/g,'').trim()));const headers=lines.shift();return lines.filter(r=>r.length>1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]||'']))).filter(r=>r.Month)}
function renderLanguageUI(){
  document.getElementById('appTitle').textContent=t('appTitle');
  document.getElementById('brandSubtitle').textContent=t('brandSubtitle');
  document.querySelector('[data-view="dashboard"]').textContent=t('dashboardTab');
  document.querySelector('[data-view="raw"]').textContent=t('rawTab');
  document.getElementById('connectBtn').textContent=t('connectSheet');
  document.getElementById('refreshBtn').textContent=t('refresh');
  document.getElementById('funnelOverviewTitle').textContent=t('funnelOverviewTitle');
  document.getElementById('funnelOverviewText').textContent=t('funnelOverviewText');
  document.getElementById('timePerformanceTitle').textContent=t('performanceOverTime');
  document.getElementById('timePerformanceText').textContent=t('performanceOverTimeText');
  document.getElementById('funnelVolumeLabel').textContent=t('funnelVolume');
  document.getElementById('monthlyLabel').textContent=t('monthly');
  document.getElementById('conversionRatesLabel').textContent=t('conversionRates');
  document.getElementById('monthlyPercentLabel').textContent=t('monthlyPercent');
  document.getElementById('leadsLegend').textContent=t('leads');
  document.getElementById('freeTrialsLegend').textContent=t('freeTrials');
  document.getElementById('paidLegend').textContent=t('paid');
  document.getElementById('leadFtLegend').textContent=t('leadToFt');
  document.getElementById('ftPaidLegend').textContent=t('ftToPaid');
  document.getElementById('leadPaidLegend').textContent=t('leadToPaid');
  document.getElementById('channelPerformanceTitle').textContent=t('acquisitionChannels');
  document.getElementById('channelPerformanceText').textContent=t('acquisitionChannelsText');
  document.getElementById('qualityOutcomeTitle').textContent=t('leadQualityOutcomes');
  document.getElementById('qualityOutcomeText').textContent=t('leadQualityOutcomesText');
  document.getElementById('leadQualityLabel').textContent=t('leadQuality');
  document.getElementById('qualityShareLabel').textContent=t('shareTotalLeads');
  document.getElementById('leadOutcomeLabel').textContent=t('leadOutcome');
  document.getElementById('leadOutcomeTextLabel').textContent=t('whatHappened');
  document.getElementById('callPerformanceTitle').textContent=t('callPerformance');
  document.getElementById('callPerformanceText').textContent=t('callPerformanceText');
  document.getElementById('emailPerformanceTitle').textContent=t('emailerPerformance');
  document.getElementById('emailPerformanceText').textContent=t('emailerPerformanceText');
  document.getElementById('adsPerformanceTitle').textContent=t('adsPerformance');
  document.getElementById('adsPerformanceText').textContent=t('adsPerformanceText');
  document.getElementById('keyInsightsTitle').textContent=t('keyInsights');
  document.getElementById('keyInsightsText').textContent=t('keyInsightsText');
  document.getElementById('rawHead').innerHTML = '<tr>'+columns.map(c=>`<th>${c}</th>`).join('')+'</tr>';
}
 document.getElementById('monthSelect').onchange=e=>{selected=e.target.value;render()};document.getElementById('refreshBtn').onclick=()=>{document.getElementById('updatedLabel').textContent='Updated just now';render()};document.getElementById('rawSearch').oninput=renderRaw;document.querySelectorAll('.tab').forEach(tab=>tab.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');document.getElementById('dashboard').classList.toggle('hide',tab.dataset.view!=='dashboard');document.getElementById('raw').classList.toggle('show',tab.dataset.view==='raw')});document.getElementById('connectBtn').onclick=()=>document.getElementById('connectModal').classList.add('open');document.getElementById('cancelConnect').onclick=()=>document.getElementById('connectModal').classList.remove('open');document.getElementById('doConnect').onclick=async()=>{const status=document.getElementById('connectStatus'),url=document.getElementById('sheetUrl').value;status.className='status';status.textContent=t('loadingData');try{const m=url.match(/\/d\/([\w-]+)/);if(!m)throw Error();const res=await fetch(`https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv&sheet=Monthly%20Data`);if(!res.ok)throw Error();const imported=parseCsv(await res.text());if(!imported.length)throw Error();rows=imported;selected='All Months';populate();render();status.textContent=`${t('connected')} ${rows.length} ${t('monthsLoaded')}`;setTimeout(()=>document.getElementById('connectModal').classList.remove('open'),900)}catch(e){status.className='status error';status.textContent=t('sheetError')}};
 populate();render();
*/