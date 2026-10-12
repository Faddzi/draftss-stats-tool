const columns=['Month','Total Leads Generated','New Leads','Reactivated Leads','FT Started','FT to Paid','Total Hot Leads','Total Warm Leads','Total Cold Leads','Calls Scheduled','Call No Show','Calls Completed','FT via Call','Converted via Call','Total Emailer Replies','Positive Replies','Negative Replies','FT via Emailer','Converted via Emailer','Total Leads via Google Ads','FT via Google Ads','Converted via GAds','Total Converted','Total Not Converted','Total Follow-up Later','Conversion Rate'];
const unavailableMetrics=['Total Emailer Replies','Positive Replies','Negative Replies','FT via Emailer','Converted via Emailer'];
const translations={
  en:{
    appTitle:'Funnel Stats',
    brandSubtitle:'Leads, trial cohorts and lead source performance',
    dashboardTab:'Overview',
    rawTab:'Monthly data',
    connectSheet:'Connect sheet',
    refresh:'Refresh',
    funnelOverviewTitle:'Funnel overview',
    funnelOverviewText:'Choose a date range to see lead and trial activity.',
    selectedMonth:'Selected month',
    overallConversion:'Overall conversion',
    performanceOverTime:'Performance over time',
    performanceOverTimeText:'Leads use their generated date. Trial starts and their eventual paid conversions use the trial-start date.',
    funnelVolume:'Funnel events by month',
    monthly:'Monthly',
    conversionRates:'Conversion rate trend',
    monthlyPercent:'Monthly',
    acquisitionChannels:'Lead source performance',
    acquisitionChannelsText:'Lead, trial and paid counts are filtered using their corresponding event dates.',
    leadQualityOutcomes:'Lead quality & outcomes',
    leadQualityOutcomesText:'A quick read on the mix and final destination of your leads.',
    leadQuality:'Lead quality',
    shareTotalLeads:'Share of classified leads',
    leadOutcome:'Lead outcome',
    whatHappened:'Share of leads with an outcome',
    callPerformance:'Call performance',
    callPerformanceText:'Calls are filtered by scheduled date; trials and paid conversions use the trial-start date.',
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
    overallConversionShort:'trial cohort paid rate',
    leadToFreeTrial:'Trial starts ÷ leads generated',
    freeTrialToPaid:'Trial cohort → paid',
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
    rawMonthlyDataText:'Monthly event summaries from the connected lead records.',
    searchMonths:'Search months...',
    demoData:'Demo data',
    updatedJustNow:'updated just now',
    connectSheetModalTitle:'Connect your Google Sheet',
    connectSheetModalText:'Paste a published or accessible Google Sheet URL. Funnel Stats will read the Monthly Data tab and calculate all metrics in your browser.',
    loadingData:'Loading sheet…',
    sheetError:'Could not load that sheet. Make sure it is shared or published.',
    connected:'Connected ✓',
    monthsLoaded:'monthly periods loaded.',
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
const defaultSheetUrl='https://docs.google.com/spreadsheets/d/1rpEdzpY4cpMC2rf9oLLzkbLkZLVO6Wp45gBRM1yLNo0/edit?usp=sharing';
let rows=[...demo], dateRange=null, dateRangePreset='All time', draftRange=null, draftPreset='All time';
let calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1);
let sourceRecords=[],sourceSort='leads',sourceSortDirection=-1;
function t(key){return translations.en[key] || key;}
const n=v=>{const x=Number(String(v??'').replace(/[^0-9.-]/g,''));return Number.isFinite(x)?x:0}; const pct=(a,b)=>b>0?`${(a/b*100).toFixed(1)}%`:'N/A'; const sum=(list,k)=>list.reduce((t,r)=>t+n(r[k]),0);
function aggregate(list){const out={Month:rangeLabel(dateRange)};columns.slice(1).forEach(k=>out[k]=sum(list,k));out['Total Dead Leads']=sum(list,'Total Dead Leads');out['Conversion Rate']=pct(out['FT to Paid'],out['FT Started']);return out}
function current(){return aggregate(rows)}
function trialCohortEventDate(trialDate,outcomeDate){
  return monthFor(trialDate)?trialDate:outcomeDate;
}
function monthFor(value){const date=value instanceof Date?value:parseSheetDate(value);return date?`${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}`:''}
function dateKey(value){
  const date=value instanceof Date?value:parseSheetDate(value);
  return date?`${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`:'';
}
function formatDateKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function addDays(date,amount){const next=new Date(date);next.setDate(next.getDate()+amount);return next}
function formatDate(value){return value?new Date(`${value}T00:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):''}
function rangeLabel(range){
  if(!range)return 'All time';
  return range.start===range.end?formatDate(range.start):`${formatDate(range.start)} – ${formatDate(range.end)}`;
}
function isInRange(value,range){
  if(!range)return true;
  const key=dateKey(value);
  return Boolean(key&&key>=range.start&&key<=range.end);
}
function parseSheetDate(value){
  if(!value)return null;
  const text=String(value).trim();
  const iso=text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const us=text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const date=iso?new Date(Date.UTC(Number(iso[1]),Number(iso[2])-1,Number(iso[3]))):
    us?new Date(Date.UTC(Number(us[3]),Number(us[1])-1,Number(us[2]))):
    /^[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}$/.test(text)?new Date(`${text} UTC`):
    /^[A-Za-z]{3,9}\s+\d{4}$/.test(text)?new Date(`${text} 1 UTC`):new Date(text);
  return Number.isNaN(date.getTime())?null:date;
}
function monthLabel(key){const [year,month]=key.split('-').map(Number);return new Date(Date.UTC(year,month-1,1)).toLocaleDateString('en-US',{month:'short',year:'numeric',timeZone:'UTC'})}
function buildMonthlyRows(records,range=null){
  const buckets=new Map();
  const add=(date,field,amount=1)=>{
    if(!isInRange(date,range))return;
    const key=monthFor(date);
    if(!key)return;
    if(!buckets.has(key)){const row={Month:monthLabel(key),_monthKey:key};columns.slice(1).forEach(column=>row[column]=0);row['Total Dead Leads']=0;buckets.set(key,row)}
    buckets.get(key)[field]+=amount;
  };
  const yes=value=>/^(yes|y|true|1)$/i.test(String(value||'').trim());
  records.forEach(record=>{
    const leadDate=record['Lead Generated Date'];
    const trialDate=record['Free Trial Start Date']||record['Free Trial Converted']||leadDate;
    const outcomeDate=record['Outcome Date']||record['Status Date']||leadDate;
    const paidDate=trialCohortEventDate(trialDate,outcomeDate);
    const callDate=record['Call Scheduled For']||record['Call Booked On']||leadDate;
    const outcome=String(record.Outcome||'').trim().toLowerCase();
    const leadType=String(record['Lead Type']||'').trim().toLowerCase();
    const quality=String(record['Lead Quality']||'').trim().toLowerCase();
    const source=String(record['Lead Source']||'').trim().toLowerCase();
    const started=yes(record['FT Started'])||Boolean(record['Free Trial Start Date']||record['Free Trial Converted']);
    const converted=outcome==='converted';
    const callScheduled=yes(record['Call Scheduled'])||Boolean(record['Call Booked On']);
    add(leadDate,'Total Leads Generated');
    if(leadType==='new')add(leadDate,'New Leads');
    if(leadType==='reactivated')add(leadDate,'Reactivated Leads');
    if(started)add(trialDate,'FT Started');
    if(converted){add(paidDate,'Total Converted');if(started)add(paidDate,'FT to Paid')}
    if(outcome==='not converted')add(outcomeDate,'Total Not Converted');
    if(outcome.includes('follow'))add(outcomeDate,'Total Follow-up Later');
    const qualityDate=record['Status Date']||leadDate;
    if(quality==='hot')add(qualityDate,'Total Hot Leads');
    if(quality==='warm')add(qualityDate,'Total Warm Leads');
    if(quality==='cold')add(qualityDate,'Total Cold Leads');
    if(quality==='dead')add(qualityDate,'Total Dead Leads');
    if(callScheduled)add(callDate,'Calls Scheduled');
    if(String(record['Call Status']||'').trim().toLowerCase()==='no show')add(callDate,'Call No Show');
    if(String(record['Call Status']||'').trim().toLowerCase()==='completed')add(callDate,'Calls Completed');
    if(callScheduled&&started)add(trialDate,'FT via Call');
    if(callScheduled&&converted)add(paidDate,'Converted via Call');
    if(source.includes('google ads')){
      add(leadDate,'Total Leads via Google Ads');
      if(started)add(trialDate,'FT via Google Ads');
      if(converted)add(paidDate,'Converted via GAds');
    }
  });
  return [...buckets.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([,row])=>{
    unavailableMetrics.forEach(metric=>row[metric]=null);
    return row;
  });
}
function sourcePerformance(records,range){
  const sources=new Map();
  const getSource=record=>{
    const label=String(record['Lead Source']||'').trim()||'Not specified';
    const key=label.toLocaleLowerCase();
    if(!sources.has(key))sources.set(key,{source:label,leads:0,trials:0,paid:0});
    return sources.get(key);
  };
  records.forEach(record=>{
    const source=getSource(record);
    const hasTrialDate=Boolean(record['Free Trial Start Date']||record['Free Trial Converted']);
    const trialDate=record['Free Trial Start Date']||record['Free Trial Converted']||record['Lead Generated Date'];
    const trialMonth=monthFor(trialDate);
    const outcomeDate=record['Outcome Date']||record['Status Date'];
    const paidDate=trialCohortEventDate(trialDate,outcomeDate);
    const started=/^(yes|y|true|1)$/i.test(String(record['FT Started']||'').trim())||hasTrialDate;
    const converted=String(record.Outcome||'').trim().toLowerCase()==='converted';
    if(monthFor(record['Lead Generated Date'])&&isInRange(record['Lead Generated Date'],range))source.leads++;
    if(trialMonth&&started&&isInRange(trialDate,range))source.trials++;
    if(monthFor(paidDate)&&started&&converted&&isInRange(paidDate,range))source.paid++;
  });
  return [...sources.values()]
    .filter(source=>!range||source.leads||source.trials||source.paid)
    .sort((a,b)=>b.leads-a.leads||b.trials-a.trials||a.source.localeCompare(b.source));
}
const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value||0);
function renderSnapshot(){
  const qualities=[['Hot','Total Hot Leads','hot'],['Warm','Total Warm Leads','warm'],['Cold','Total Cold Leads','cold'],['Dead','Total Dead Leads','dead']];
  const leadTotals={count:0,pricedCount:0,value:0};
  const qualityTotals=qualities.map(([label,,style])=>({label,style,count:0,value:0}));
  const trials={total:0,value:0,outcomes:[
    {label:'Paid',count:0,value:0,style:'paid'},
    {label:'Not converted',count:0,value:0,style:'dead'},
    {label:'Follow-up later',count:0,value:0,style:'warm'},
    {label:'No outcome recorded',count:0,value:0,style:'unclassified'}
  ]};
  const calls={total:0,statuses:[
    {label:'Completed',count:0,style:'paid'},
    {label:'No show',count:0,style:'dead'},
    {label:'Declined',count:0,style:'warm'},
    {label:'Future call',count:0,style:'blue'},
    {label:'Other / pending',count:0,style:'unclassified'}
  ]};
  const reasons=new Map();
  const today=formatDateKey(new Date());
  sourceRecords.forEach(record=>{
    const value=n(record['Plan Value']);
    const hasPlanValue=Boolean(String(record['Plan Value']||'').trim());
    const leadDate=record['Lead Generated Date'];
    if(monthFor(leadDate)&&isInRange(leadDate,dateRange)){
      leadTotals.count++;
      if(hasPlanValue){leadTotals.pricedCount++;leadTotals.value+=value}
      const quality=qualityTotals.find(item=>item.label.toLowerCase()===String(record['Lead Quality']||'').trim().toLowerCase());
      if(quality){quality.count++;if(hasPlanValue)quality.value+=value}
    }
    const trialDate=record['Free Trial Start Date']||record['Free Trial Converted']||leadDate;
    const started=/^(yes|y|true|1)$/i.test(String(record['FT Started']||'').trim())||Boolean(record['Free Trial Start Date']||record['Free Trial Converted']);
    if(started&&isInRange(trialDate,dateRange)){
      trials.total++;if(hasPlanValue)trials.value+=value;
      const outcome=String(record.Outcome||'').trim().toLowerCase();
      const bucket=trials.outcomes.find(item=>
        item.label==='Paid'&&outcome==='converted'||
        item.label==='Not converted'&&outcome==='not converted'||
        item.label==='Follow-up later'&&outcome==='follow-up later'||
        item.label==='No outcome recorded'&&!outcome
      );
      const target=bucket||trials.outcomes[3];
      target.count++;if(hasPlanValue)target.value+=value;
    }
    const reason=String(record['Reasons-No Sign Ups']||'').trim();
    if(reason&&monthFor(leadDate)&&isInRange(leadDate,dateRange)){
      const key=reason.toLocaleLowerCase();
      const item=reasons.get(key)||{label:reason,count:0,value:0};
      item.count++;if(hasPlanValue)item.value+=value;reasons.set(key,item);
    }
    const callDate=record['Call Scheduled For']||record['Call Booked On']||leadDate;
    const callStatus=String(record['Call Status']||'').trim().toLowerCase();
    const scheduled=/^(yes|y|true|1)$/i.test(String(record['Call Scheduled']||'').trim())||Boolean(record['Call Booked On']||record['Call Scheduled For']);
    if(scheduled&&isInRange(callDate,dateRange)){
      calls.total++;
      const bucket=calls.statuses.find(item=>
        item.label.toLowerCase()===callStatus||
        item.label==='Future call'&&dateKey(callDate)>today&& !['completed','no show','declined'].includes(callStatus)
      );
      (bucket||calls.statuses[4]).count++;
    }
  });
  if(!sourceRecords.length){
    document.getElementById('snapshotRangeText').textContent=`Detailed lead records are not loaded; these breakdowns will appear when the Google Sheet connects. ${rangeLabel(dateRange)}.`;
    document.getElementById('leadValueTotal').textContent='—';
    document.getElementById('leadValueCount').textContent='No detailed records';
    document.getElementById('trialCountTotal').textContent='—';
    document.getElementById('callCountTotal').textContent='—';
    document.getElementById('noSignupCountTotal').textContent='—';
    ['leadValueBreakdown','trialOutcomeBreakdown','callBreakdown','noSignupBreakdown'].forEach(id=>{
      document.getElementById(id).innerHTML='<div class="snapshot-empty">Connect the Google Sheet to view this breakdown.</div>';
    });
    return;
  }
  document.getElementById('snapshotRangeText').textContent=`Dollar sums use recorded Plan Value only; lead, trial and call counts use their own event dates. ${rangeLabel(dateRange)}.`;
  document.getElementById('leadValueTotal').textContent=money(leadTotals.value);
  document.getElementById('leadValueCount').textContent=`${leadTotals.pricedCount.toLocaleString()} of ${leadTotals.count.toLocaleString()} leads priced`;
  document.getElementById('leadValueBreakdown').innerHTML=qualityTotals.map(item=>`<div class="snapshot-row"><span><i class="snapshot-dot ${item.style}"></i>${item.label}</span><strong>${item.count.toLocaleString()} <small>${money(item.value)}</small></strong></div>`).join('');
  document.getElementById('trialCountTotal').textContent=trials.total.toLocaleString();
  document.getElementById('trialOutcomeBreakdown').innerHTML=trials.outcomes.map(item=>`<div class="snapshot-row"><span><i class="snapshot-dot ${item.style}"></i>${item.label}</span><strong>${item.count.toLocaleString()} <small>${money(item.value)}</small></strong></div>`).join('');
  document.getElementById('callCountTotal').textContent=calls.total.toLocaleString();
  document.getElementById('callBreakdown').innerHTML=calls.statuses.map(item=>`<div class="snapshot-row"><span><i class="snapshot-dot ${item.style}"></i>${item.label}</span><strong>${item.count.toLocaleString()}</strong></div>`).join('');
  const reasonRows=[...reasons.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));
  document.getElementById('noSignupCountTotal').textContent=`${reasonRows.reduce((total,item)=>total+item.count,0).toLocaleString()} records`;
  document.getElementById('noSignupBreakdown').innerHTML=reasonRows.length?
    reasonRows.map(item=>`<div class="snapshot-row"><span><i class="snapshot-dot warm"></i>${escapeHtml(item.label)}</span><strong>${item.count.toLocaleString()} <small>${money(item.value)}</small></strong></div>`).join(''):
    '<div class="snapshot-empty">No reasons recorded in this range.</div>';
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function renderSourceTable(){
  const columns=[['source','Lead Source'],['leads','Leads generated'],['trials','Free trials started'],['paid','Paid from trial cohort'],['rate','Trial → paid']];
  document.getElementById('sourceHead').innerHTML=`<tr>${columns.map(([key,label])=>`<th><button class="sort-button" type="button" data-source-sort="${key}" aria-pressed="${sourceSort===key}">${label}<span>${sourceSort===key?(sourceSortDirection===1?'↑':'↓'):'↕'}</span></button></th>`).join('')}</tr>`;
  const query=(document.getElementById('sourceSearch').value||'').trim().toLocaleLowerCase();
  const summary=sourcePerformance(sourceRecords,dateRange)
    .filter(source=>source.source.toLocaleLowerCase().includes(query))
    .sort((a,b)=>{
      const first=sourceSort==='rate'?a.paid/Math.max(a.trials,1):a[sourceSort];
      const second=sourceSort==='rate'?b.paid/Math.max(b.trials,1):b[sourceSort];
      return (typeof first==='string'?first.localeCompare(second):first-second)*sourceSortDirection;
    });
  document.getElementById('sourceBody').innerHTML=summary.map(source=>`<tr>
    <td>${escapeHtml(source.source)}</td>
    <td>${source.leads.toLocaleString()}</td>
    <td>${source.trials.toLocaleString()}</td>
    <td>${source.paid.toLocaleString()}</td>
    <td>${pct(source.paid,source.trials)}</td>
  </tr>`).join('')||`<tr><td colspan="5">${query?'No sources match your search.':'No source data for this period.'}</td></tr>`;
  document.querySelectorAll('[data-source-sort]').forEach(button=>button.onclick=()=>{
    if(sourceSort===button.dataset.sourceSort)sourceSortDirection*=-1;
    else{sourceSort=button.dataset.sourceSort;sourceSortDirection=sourceSort==='source'?1:-1}
    renderSourceTable();
  });
}
function rangeForPreset(name){
  const today=new Date(),todayKey=formatDateKey(today);
  const yesterday=formatDateKey(addDays(today,-1));
  const monthStart=new Date(today.getFullYear(),today.getMonth(),1);
  const lastMonthStart=new Date(today.getFullYear(),today.getMonth()-1,1);
  const lastMonthEnd=new Date(today.getFullYear(),today.getMonth(),0);
  const monday=addDays(today,-((today.getDay()+6)%7));
  const ranges={
    Today:{start:todayKey,end:todayKey},
    Yesterday:{start:yesterday,end:yesterday},
    'This week (Mon – Today)':{start:formatDateKey(monday),end:todayKey},
    'Last 7 days':{start:formatDateKey(addDays(today,-6)),end:todayKey},
    'Last 14 days':{start:formatDateKey(addDays(today,-13)),end:todayKey},
    'This month':{start:formatDateKey(monthStart),end:todayKey},
    'Last 30 days':{start:formatDateKey(addDays(today,-29)),end:todayKey},
    'Last month':{start:formatDateKey(lastMonthStart),end:formatDateKey(lastMonthEnd)}
  };
  return name==='All time'?null:ranges[name];
}
function applyDateRange(range,preset='Custom'){
  dateRange=range?{start:range.start,end:range.end}:null;
  dateRangePreset=preset;
  rows=sourceRecords.length?buildMonthlyRows(sourceRecords,dateRange):demo.filter(row=>{
    if(!dateRange)return true;
    const key=row._monthKey||monthFor(row.Month);
    if(!key)return false;
    const [year,month]=key.split('-').map(Number);
    const monthStart=`${key}-01`,monthEnd=`${key}-${String(new Date(Date.UTC(year,month,0)).getUTCDate()).padStart(2,'0')}`;
    return monthStart<=dateRange.end&&monthEnd>=dateRange.start;
  });
  render();
  closeDatePicker();
}
function closeDatePicker(){
  document.getElementById('datePickerPanel').hidden=true;
  document.getElementById('dateRangeToggle').setAttribute('aria-expanded','false');
}
function positionDatePicker(){
  const panel=document.getElementById('datePickerPanel'),trigger=document.getElementById('dateRangeToggle');
  const triggerRect=trigger.getBoundingClientRect();
  if(window.matchMedia('(max-width: 760px)').matches){
    const top=Math.min(triggerRect.bottom+10,window.innerHeight-220);
    panel.style.top=`${top}px`;panel.style.left='12px';panel.style.right='auto';
    panel.style.width=`calc(100vw - 24px)`;panel.style.height=`${window.innerHeight-top-12}px`;
    return;
  }
  panel.style.width='';panel.style.height='';panel.style.right='auto';
  panel.style.top=`${triggerRect.bottom+10}px`;
  panel.style.left=`${Math.max(16,Math.min(triggerRect.right-panel.offsetWidth,window.innerWidth-panel.offsetWidth-16))}px`;
}
function calendarMarkup(year,month){
  const first=new Date(year,month,1),monthName=first.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const offset=(first.getDay()+6)%7,days=new Date(year,month+1,0).getDate();
  const start=draftRange?.start||'',end=draftRange?.end||'';
  let cells='';
  for(let index=0;index<42;index++){
    const day=index-offset+1;
    if(day<1||day>days){cells+='<span class="calendar-empty"></span>';continue}
    const key=formatDateKey(new Date(year,month,day));
    const classes=['calendar-day'];
    if(key===start)classes.push('range-start');
    if(key===end)classes.push('range-end');
    if(start&&end&&key>start&&key<end)classes.push('in-range');
    cells+=`<button class="${classes.join(' ')}" type="button" data-calendar-date="${key}" aria-pressed="${key===start||key===end}">${day}</button>`;
  }
  return `<section class="calendar-month"><h3>${monthName}</h3><div class="calendar-grid calendar-weekdays" aria-hidden="true">${['M','T','W','T','F','S','S'].map(day=>`<span>${day}</span>`).join('')}</div><div class="calendar-grid">${cells}</div></section>`;
}
function renderDatePicker(){
  const panel=document.getElementById('datePickerPanel');
  panel.onclick=event=>event.stopPropagation();
  const presets=['Custom','Today','Yesterday','This week (Mon – Today)','Last 7 days','Last 14 days','This month','Last 30 days','Last month','All time'];
  const start=draftRange?.start||'',end=draftRange?.end||'';
  const firstMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),1);
  const secondMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);
  panel.innerHTML=`<div class="date-picker-presets"><div class="preset-heading">Date ranges</div>${presets.map(name=>`<button class="date-preset${draftPreset===name?' active':''}" type="button" data-date-preset="${name}">${name}</button>`).join('')}</div>
    <div class="date-picker-calendar">
      <div class="date-fields">
        <label>Start date<input id="rangeStartInput" type="date" value="${start}" aria-label="Start date"></label>
        <span class="date-separator">—</span>
        <label>End date<input id="rangeEndInput" type="date" value="${end}" aria-label="End date"></label>
      </div>
      <div class="calendar-navigation"><button type="button" id="calendarPrevious" aria-label="Previous month">‹</button><button type="button" id="calendarNext" aria-label="Next month">›</button></div>
      <div class="calendar-months">${calendarMarkup(firstMonth.getFullYear(),firstMonth.getMonth())}${calendarMarkup(secondMonth.getFullYear(),secondMonth.getMonth())}</div>
      <p class="date-range-error" id="dateRangeError" aria-live="polite"></p>
      <div class="date-picker-actions"><button class="date-cancel" type="button" id="dateRangeCancel">Cancel</button><button class="date-apply" type="button" id="dateRangeApply">Apply</button></div>
    </div>`;
  panel.querySelectorAll('[data-date-preset]').forEach(button=>button.onclick=()=>{
    const preset=button.dataset.datePreset;
    draftPreset=preset;draftRange=rangeForPreset(preset);
    if(draftRange){const date=new Date(`${draftRange.start}T00:00:00`);calendarMonth=new Date(date.getFullYear(),date.getMonth(),1)}
    renderDatePicker();
  });
  panel.querySelectorAll('[data-calendar-date]').forEach(button=>button.onclick=()=>{
    const value=button.dataset.calendarDate;
    if(draftPreset!=='Custom'||!draftRange||draftRange.start&&draftRange.end){draftRange={start:value,end:''}}
    else if(value<draftRange.start)draftRange={start:value,end:draftRange.start};
    else draftRange={start:draftRange.start,end:value};
    draftPreset='Custom';renderDatePicker();
  });
  panel.querySelector('#rangeStartInput').onchange=event=>{
    draftRange={start:event.target.value,end:draftRange?.end||''};draftPreset='Custom';renderDatePicker();
  };
  panel.querySelector('#rangeEndInput').onchange=event=>{
    draftRange={start:draftRange?.start||'',end:event.target.value};draftPreset='Custom';renderDatePicker();
  };
  panel.querySelector('#calendarPrevious').onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);renderDatePicker()};
  panel.querySelector('#calendarNext').onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);renderDatePicker()};
  panel.querySelector('#dateRangeCancel').onclick=closeDatePicker;
  panel.querySelector('#dateRangeApply').onclick=()=>{
    if(draftPreset==='All time'){applyDateRange(null,'All time');return}
    if(!draftRange?.start||!draftRange?.end||draftRange.start>draftRange.end){
      panel.querySelector('#dateRangeError').textContent='Choose a valid start date and end date.';
      return;
    }
    applyDateRange(draftRange,draftPreset);
  };
}
document.getElementById('dateRangeToggle').onclick=()=>{
  const panel=document.getElementById('datePickerPanel'),isOpen=!panel.hidden;
  if(isOpen){closeDatePicker();return}
  draftRange=dateRange?{...dateRange}:null;draftPreset=dateRangePreset;
  if(dateRange){const date=new Date(`${dateRange.start}T00:00:00`);calendarMonth=new Date(date.getFullYear(),date.getMonth(),1)}
  renderDatePicker();panel.hidden=false;positionDatePicker();
  document.getElementById('dateRangeToggle').setAttribute('aria-expanded','true');
};
document.addEventListener('click',event=>{
  const wrapper=document.querySelector('.date-range-wrap'),panel=document.getElementById('datePickerPanel');
  if(!wrapper.contains(event.target)&&!panel.contains(event.target))closeDatePicker();
});
document.body.appendChild(document.getElementById('datePickerPanel'));
window.addEventListener('resize',()=>{if(!document.getElementById('datePickerPanel').hidden)positionDatePicker()});
function trendSvg(data,keys,colors,percent=false){
  const w=620,h=220,p={l:36,r:10,t:12,b:28};
  const observedMax=Math.max(...data.flatMap(row=>keys.map(key=>n(row[key]))),0);
  const max=percent?Math.max(100,Math.ceil(observedMax/10)*10):Math.max(observedMax,1);
  const x=index=>p.l+index*((w-p.l-p.r)/Math.max(data.length-1,1));
  const y=value=>h-p.b-(value/max)*(h-p.t-p.b);
  let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Monthly trend chart">`;
  [0,.5,1].forEach(tick=>{
    const yy=y(max*tick);
    svg+=`<line x1="${p.l}" x2="${w-p.r}" y1="${yy}" y2="${yy}" stroke="#edf0f5"/><text x="0" y="${yy+4}" fill="#9aa6b8" font-size="10">${percent?Math.round(max*tick):Math.round(max*tick).toLocaleString()}</text>`;
  });
  keys.forEach((key,keyIndex)=>{
    const points=data.map((row,index)=>`${x(index)},${y(n(row[key]))}`).join(' ');
    svg+=`<polyline points="${points}" fill="none" stroke="${colors[keyIndex]}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    data.forEach((row,index)=>{
      svg+=`<circle cx="${x(index)}" cy="${y(n(row[key]))}" r="3.5" fill="${colors[keyIndex]}" stroke="#fff" stroke-width="2" role="button" tabindex="0" data-month="${escapeHtml(row.Month)}" aria-label="${escapeHtml(`Show ${row.Month}`)}"><title>${row.Month}: ${percent?pct(n(row[key]),100):n(row[key]).toLocaleString()}</title></circle>`;
    });
  });
  const tickEvery=Math.max(1,Math.ceil(data.length/12));
  const hasMultipleYears=new Set(data.map(row=>row.Month.split(' ')[1])).size>1;
  data.forEach((row,index)=>{
    if(index%tickEvery!==0&&index!==data.length-1)return;
    const [month,year]=row.Month.split(' ');
    const label=hasMultipleYears?`${month} '${year.slice(-2)}`:month;
    svg+=`<text x="${x(index)}" y="${h-5}" text-anchor="middle" fill="#9aa6b8" font-size="10">${label}</text>`;
  });
  return svg+'</svg>';
}
function render(){
 const d=current();
 renderLanguageUI();
 document.getElementById('dateRangeText').textContent=rangeLabel(dateRange);
 document.getElementById('funnelMonth').textContent=d.Month;
 document.getElementById('heroMonth').textContent=d.Month;
 document.getElementById('overallRate').textContent=pct(n(d['FT to Paid']),n(d['FT Started']));
 const missingLeadDates=sourceRecords.filter(record=>!monthFor(record['Lead Generated Date'])).length;
 document.getElementById('funnelOverviewText').textContent=`Leads are counted by generated date. Trials and paid conversions are counted by trial-start date. ${rangeLabel(dateRange)}.${missingLeadDates?` ${missingLeadDates.toLocaleString()} rows have no lead date.`:''}`;
 document.getElementById('overallRateCaption').textContent='Paid to date from trials started in this range';
 document.getElementById('monthlyPercentLabel').textContent=dateRange?'Selected range':'Monthly';
 const kpis=[
   [t('totalLeads'),'Total Leads Generated','↗',t('totalLeadsFrom')],
   [t('freeTrials'),'FT Started','✦','Trial starts in selected range'],
   ['Paid from trial cohort','FT to Paid','✓','Attributed to trial-start range'],
   ['Trial cohort paid rate','FT to Paid','↗','Paid to date ÷ free trials started']
 ];
 document.getElementById('kpis').innerHTML=kpis.map((k,index)=>{
   const value=index===3?pct(n(d['FT to Paid']),n(d['FT Started'])):n(d[k[1]]).toLocaleString();
   return `<div class="card kpi"><div class="eyebrow"><span>${k[0]}</span><span class="icon">${k[2]}</span></div><strong>${value}</strong><small>${k[3]}</small></div>`;
 }).join('');
 renderSnapshot();
 document.getElementById('funnel').innerHTML=`<div class="funnel-stage leads"><span class="stage-name">LEADS GENERATED</span><div><strong>${n(d['Total Leads Generated']).toLocaleString()}</strong><span>lead date</span></div></div><div class="arrow-rate">↓ ${n(d['FT Started']).toLocaleString()} trials started in this range</div><div class="funnel-stage trials"><span class="stage-name">FREE TRIALS STARTED</span><div><strong>${n(d['FT Started']).toLocaleString()}</strong><span>trial-start date</span></div></div><div class="arrow-rate">↓ ${pct(n(d['FT to Paid']),n(d['FT Started']))} of this trial cohort paid</div><div class="funnel-stage paid"><span class="stage-name">PAID FROM TRIAL COHORT</span><div><strong>${n(d['FT to Paid']).toLocaleString()}</strong><span>${pct(n(d['FT to Paid']),n(d['FT Started']))}</span></div></div>`;
 document.getElementById('funnelRates').innerHTML=[
   ['Leads generated in range',n(d['Total Leads Generated']).toLocaleString()],
   ['Trial starts in range',n(d['FT Started']).toLocaleString()],
   ['Paid to date from this range’s trial cohort',`${n(d['FT to Paid']).toLocaleString()} · ${pct(n(d['FT to Paid']),n(d['FT Started']))}`]
 ].map(item=>`<div class="metric-line"><label>${item[0]}</label><strong>${item[1]}</strong></div>`).join('');
 const trends=rows;
 document.getElementById('volumeChart').innerHTML=trendSvg(trends,['Total Leads Generated','FT Started','FT to Paid'],['#386bed','#79a1f4','#23a477']);
 const rates=trends.map(row=>({...row,'Lead → FT':n(row['FT Started'])/Math.max(n(row['Total Leads Generated']),1)*100,'FT → Paid':n(row['FT to Paid'])/Math.max(n(row['FT Started']),1)*100,'Lead → Paid':n(row['FT to Paid'])/Math.max(n(row['Total Leads Generated']),1)*100}));
 document.getElementById('rateChart').innerHTML=trendSvg(rates,['Lead → FT','FT → Paid','Lead → Paid'],['#386bed','#23a477','#d7962d'],true);
 attachChartInteractions();
 renderSourceTable();
 const q=[[t('hotLeads'),'Total Hot Leads','','var(--blue)'],[t('warmLeads'),'Total Warm Leads','warm','#79a1f4'],[t('coldLeads'),'Total Cold Leads','cold','#cbd8f7'],['Dead','Total Dead Leads','dead','#e56a68']]; const total=n(d['Total Leads Generated']),qualityTotal=n(d['Total Hot Leads'])+n(d['Total Warm Leads'])+n(d['Total Cold Leads'])+n(d['Total Dead Leads']);document.getElementById('qualityList').innerHTML=q.map(x=>`<div class="quality-row"><i class="dot ${x[2]}"></i><label>${x[0]}</label><b>${n(d[x[1]]).toLocaleString()}</b><small>${pct(n(d[x[1]]),qualityTotal)}</small></div>`).join('');const qualityDenominator=Math.max(qualityTotal,1),q1=n(d['Total Hot Leads'])/qualityDenominator*100,q2=(n(d['Total Hot Leads'])+n(d['Total Warm Leads']))/qualityDenominator*100,q3=(n(d['Total Hot Leads'])+n(d['Total Warm Leads'])+n(d['Total Cold Leads']))/qualityDenominator*100;document.getElementById('qualityDonut').style.background=`conic-gradient(var(--blue) 0 ${q1}%,#79a1f4 ${q1}% ${q2}%,#cbd8f7 ${q2}% ${q3}%,#e56a68 ${q3}% 100%)`;
 const out=[[t('converted'),'Total Converted',''],[t('notConverted'),'Total Not Converted','warm'],[t('followUpLaterShort'),'Total Follow-up Later','cold']],outcomeTotal=n(d['Total Converted'])+n(d['Total Not Converted'])+n(d['Total Follow-up Later']);document.getElementById('outcomeList').innerHTML=out.map(x=>`<div class="quality-row"><i class="dot ${x[2]}"></i><label>${x[0]}</label><b>${n(d[x[1]]).toLocaleString()}</b><small>${pct(n(d[x[1]]),outcomeTotal)}</small></div>`).join('');let outcomeDenominator=Math.max(outcomeTotal,1),o1=n(d['Total Converted'])/outcomeDenominator*100,o2=(n(d['Total Converted'])+n(d['Total Not Converted']))/outcomeDenominator*100;document.getElementById('outcomeDonut').style.background=`conic-gradient(var(--green) 0 ${o1}%,#f0a1a0 ${o1}% ${o2}%,#f4d28a ${o2}% 100%)`;
 renderProgress('callPanel',[[t('scheduled'),'Calls Scheduled'],[t('completed'),'Calls Completed'],[t('freeTrial'),'FT via Call'],[t('paid'),'Converted via Call']],[['Show rate',pct(n(d['Calls Completed']),n(d['Calls Scheduled']))],['No-show rate',pct(n(d['Call No Show']),n(d['Calls Scheduled']))],['Call → FT',pct(n(d['FT via Call']),n(d['Calls Completed']))],['Call → paid',pct(n(d['Converted via Call']),n(d['Calls Completed']))]]);
 const insightItems=[
   `${n(d['Total Leads Generated']).toLocaleString()} leads were generated in the selected date range.`,
   `${n(d['FT Started']).toLocaleString()} free trials started in the selected date range.`,
   `${n(d['FT to Paid']).toLocaleString()} trials from the selected date range later converted to paid.`,
   `Paid conversion rate for this trial cohort: ${pct(n(d['FT to Paid']),n(d['FT Started']))}.`
 ];
 document.getElementById('insights').innerHTML=insightItems.map(text=>`<div class="card insight"><span class="bullet">●</span><span>${text}</span></div>`).join('');
 renderRaw();
}
 function renderProgress(id,nodes,rates){document.getElementById(id).innerHTML=`<div class="progression">${nodes.map((x,i)=>(i?'<div class="connector"></div>':'')+`<div class="node"><div class="circle">${n(current()[x[1]]).toLocaleString()}</div><label>${x[0]}</label></div>`).join('')}</div><div class="rate-grid">${rates.map(x=>`<div><b>${x[1]}</b><small>${x[0]}</small></div>`).join('')}</div>`}
 function renderRaw(){const rawColumns=[...columns,'Total Dead Leads'];document.getElementById('rawHead').innerHTML='<tr>'+rawColumns.map(c=>`<th>${c==='Conversion Rate'?'Trial cohort paid rate':c}</th>`).join('')+'</tr>';const query=(document.getElementById('rawSearch').value||'').toLowerCase();document.getElementById('rawBody').innerHTML=rows.filter(r=>r.Month.toLowerCase().includes(query)).map(r=>'<tr>'+rawColumns.map(c=>`<td>${c==='Month'?r[c]:unavailableMetrics.includes(c)?'N/A':c==='Conversion Rate'?pct(n(r['FT to Paid']),n(r['FT Started'])):n(r[c]).toLocaleString()}</td>`).join('')+'</tr>').join('')}
 function attachChartInteractions(){
   document.querySelectorAll('#volumeChart circle[data-month],#rateChart circle[data-month]').forEach(point=>{
     const selectMonth=()=>{
        const row=rows.find(item=>item.Month===point.dataset.month);
        const key=row?._monthKey||monthFor(row?.Month);
        if(key){
          const [year,month]=key.split('-').map(Number);
          const end=new Date(Date.UTC(year,month,0)).getUTCDate();
          applyDateRange({start:`${key}-01`,end:`${key}-${String(end).padStart(2,'0')}`});
        }
      };
     point.onclick=selectMonth;
     point.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectMonth()}};
   });
 }
 function parseCsv(text){
   const records=[];let row=[],field='',quoted=false;
   for(let i=0;i<text.length;i++){
     const char=text[i];
     if(quoted&&char==='"'&&text[i+1]==='"'){field+='"';i++}
     else if(char==='"')quoted=!quoted;
     else if(char===','&&!quoted){row.push(field);field=''}
     else if((char==='\n'||char==='\r')&&!quoted){
       if(char==='\r'&&text[i+1]==='\n')i++;
       row.push(field);field='';
       if(row.some(value=>value.trim()))records.push(row);
       row=[];
     }else field+=char;
   }
   if(quoted)throw Error('The sheet contains an unterminated quoted field.');
   if(field||row.length){row.push(field);if(row.some(value=>value.trim()))records.push(row)}
   if(!records.length)throw Error('The sheet is empty.');
   const headers=records.shift().map((header,index)=>(index===0?header.replace(/^\uFEFF/,''):header).trim());
   if(new Set(headers).size!==headers.length)throw Error('The sheet has duplicate column names.');
   const required=['Lead Generated Date','Lead Quality','Lead Status','Outcome','Lead Source'];
   const missing=required.filter(header=>!headers.includes(header));
   if(missing.length)throw Error(`Missing required sheet columns: ${missing.join(', ')}`);
   return records.filter(values=>values.some(value=>value.trim())).map(values=>Object.fromEntries(headers.map((header,index)=>[header,(values[index]||'').trim()])));
 }
function renderLanguageUI(){
  document.getElementById('appTitle').textContent=t('appTitle');
  document.getElementById('brandSubtitle').textContent=t('brandSubtitle');
  document.querySelector('[data-view="dashboard"]').innerHTML=`<span>01</span> ${t('dashboardTab')}`;
  document.querySelector('[data-view="raw"]').innerHTML=`<span>02</span> ${t('rawTab')}`;
  document.getElementById('connectBtn').innerHTML=`<span class="button-icon">↗</span> ${t('connectSheet')}`;
  document.getElementById('refreshBtn').innerHTML=`<span class="refresh-icon">↻</span> ${t('refresh')}`;
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
  document.getElementById('keyInsightsTitle').textContent=t('keyInsights');
  document.getElementById('keyInsightsText').textContent=t('keyInsightsText');
  document.getElementById('rawHead').innerHTML = '<tr>'+columns.map(c=>`<th>${c}</th>`).join('')+'</tr>';
}
 async function loadSheet(url){
   const match=url.match(/\/spreadsheets\/d\/([\w-]+)/);
   if(!match)throw Error('Enter a valid Google Sheets URL.');
   const response=await fetch(`https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`,{cache:'no-store'});
   if(!response.ok)throw Error(`Google Sheets returned HTTP ${response.status}.`);
   const imported=parseCsv(await response.text());
   if(!imported.length)throw Error('No lead rows were found in the selected sheet tab.');
   if(!buildMonthlyRows(imported).length)throw Error('No rows have a valid lead, trial, outcome, or call date.');
   sourceRecords=imported;rows=buildMonthlyRows(imported,dateRange);render();
   const undated=imported.filter(record=>!monthFor(record['Lead Generated Date'])).length;
   const datedLeads=imported.length-undated;
   document.getElementById('updatedLabel').textContent=`Google Sheet · ${datedLeads.toLocaleString()} dated leads · ${undated.toLocaleString()} missing lead dates`;
   document.querySelector('.data-status').classList.remove('is-error');
   return imported.length;
 }
 document.getElementById('refreshBtn').onclick=async()=>{
   const button=document.getElementById('refreshBtn'),status=document.getElementById('updatedLabel');
   button.classList.add('is-loading');button.disabled=true;status.textContent='Refreshing sheet…';
   try{await loadSheet(document.getElementById('sheetUrl').value||defaultSheetUrl)}
   catch(error){status.textContent=`Refresh failed: ${error.message}`;document.querySelector('.data-status').classList.add('is-error')}
   finally{button.classList.remove('is-loading');button.disabled=false}
 };
 document.getElementById('rawSearch').oninput=renderRaw;
 document.getElementById('sourceSearch').oninput=renderSourceTable;
 document.querySelectorAll('.tab').forEach(tab=>tab.onclick=()=>{
   document.querySelectorAll('.tab').forEach(item=>item.classList.remove('active'));
   tab.classList.add('active');
   document.getElementById('dashboard').classList.toggle('hide',tab.dataset.view!=='dashboard');
   document.getElementById('raw').classList.toggle('show',tab.dataset.view==='raw');
 });
 document.getElementById('sheetUrl').value=defaultSheetUrl;
 document.getElementById('connectBtn').onclick=()=>document.getElementById('connectModal').classList.add('open');
 document.getElementById('cancelConnect').onclick=()=>document.getElementById('connectModal').classList.remove('open');
 document.getElementById('connectModal').onclick=event=>{
   if(event.target===event.currentTarget)event.currentTarget.classList.remove('open');
 };
 document.addEventListener('keydown',event=>{
   if(event.key==='Escape'){
     document.getElementById('connectModal').classList.remove('open');
     closeDatePicker();
   }
 });
 document.getElementById('doConnect').onclick=async()=>{
   const status=document.getElementById('connectStatus');status.className='status';status.textContent=t('loadingData');
   try{
     const count=await loadSheet(document.getElementById('sheetUrl').value.trim());
     const undated=sourceRecords.filter(record=>!monthFor(record['Lead Generated Date'])).length;
     status.textContent=`${t('connected')} ${count.toLocaleString()} rows; ${undated.toLocaleString()} missing lead dates.`;
     setTimeout(()=>document.getElementById('connectModal').classList.remove('open'),900);
   }catch(error){status.className='status error';status.textContent=error.message}
 };
 render();
 loadSheet(defaultSheetUrl).catch(error=>{
   document.getElementById('updatedLabel').textContent=`Sheet unavailable; showing demo data: ${error.message}`;
   document.querySelector('.data-status').classList.add('is-error');
 });
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
 function parseCsv(text){
   const records=[];let row=[],field='',quoted=false;
   for(let i=0;i<text.length;i++){
     const char=text[i];
     if(quoted&&char==='"'&&text[i+1]==='"'){field+='"';i++}
     else if(char==='"')quoted=!quoted;
     else if(char===','&&!quoted){row.push(field);field=''}
     else if((char==='\n'||char==='\r')&&!quoted){
       if(char==='\r'&&text[i+1]==='\n')i++;
       row.push(field);field='';
       if(row.some(value=>value.trim()))records.push(row);
       row=[];
     }else field+=char;
   }
   if(field||row.length){row.push(field);if(row.some(value=>value.trim()))records.push(row)}
   if(quoted)throw Error('The sheet contains an unterminated quoted field.');
   if(!records.length)throw Error('The sheet is empty.');
   const headers=records.shift().map((header,index)=>(index===0?header.replace(/^\uFEFF/,''):header).trim());
   if(new Set(headers).size!==headers.length)throw Error('The sheet has duplicate column names.');
   const required=['Lead Generated Date','Lead Quality','Lead Status','Outcome','Lead Source'];
   const missing=required.filter(header=>!headers.includes(header));
   if(missing.length)throw Error(`Missing required sheet columns: ${missing.join(', ')}`);
   return records.filter(values=>values.some(value=>value.trim())).map(values=>Object.fromEntries(headers.map((header,index)=>[header,(values[index]||'').trim()])));
 }
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
