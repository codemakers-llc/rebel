// REBEL reusable dashboard rendering; the consuming project provides all API data.
// REBEL Genesis: request operations dashboard with telemetry patterns adapted from Payroll / Elections.
// All domain metrics are read from REST endpoints; no fabricated infrastructure status.
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e};
const box=(title)=>{const section=el('section','panel telemetry-panel');section.append(el('h3','',title));return section};
const metric=(label,value)=>{const e=el('div','metric');e.append(el('strong','',value),el('small','',label));return e};
const spark=(points)=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 240 48');svg.setAttribute('role','img');svg.setAttribute('aria-label','Recent request trend');svg.classList.add('rebel-spark');const values=points.length?points:[0,0,0,0,0,0,0];const max=Math.max(1,...values);const poly=document.createElementNS(svg.namespaceURI,'polyline');poly.setAttribute('points',values.map((v,i)=>`${5+i*(230/Math.max(1,values.length-1))},${42-v/max*34}`).join(' '));poly.setAttribute('fill','none');poly.setAttribute('stroke','currentColor');poly.setAttribute('stroke-width','2.7');poly.setAttribute('stroke-linecap','round');poly.setAttribute('stroke-linejoin','round');svg.append(poly);return svg};
const progress=(parent,label,value,total)=>{const row=el('div','telemetry-row');const head=el('div','telemetry-row-head');head.append(el('span','',label),el('strong','',`${value} / ${total}`));const track=el('div','telemetry-track'),fill=el('i');fill.style.width=`${total?Math.min(100,Math.max(0,value/total*100)):0}%`;track.append(fill);row.append(head,track);parent.append(row)};
export function createTelemetryDashboardView({title='Request Operations',description='Live demo telemetry',fetchData}){return {title,components:[],async onMount({host,api}){
 const root=el('div','rebel-dashboard-layout');const main=el('div','rebel-dashboard-main'),side=el('aside','rebel-telemetry-sidebar');side.setAttribute('aria-label','Live operations telemetry');root.append(main,side);host.append(root);
 const heading=el('section','panel dashboard-intro');heading.append(el('h3','','Request Management Overview'),el('p','muted',description));main.append(heading);
 const cards=el('section','metric-grid');main.append(cards);
 const charts=el('section','rebel-dashboard-charts');const trend=box('Request Submissions'),distribution=box('Workflow Status');charts.append(trend,distribution);main.append(charts);
 const recent=box('Recent Requests');main.append(recent);
 const widgetTitles=['API Response','Processing Queue','Review Throughput','Evaluation Progress','Request Activity'];
 const widgets=Object.fromEntries(widgetTitles.map(t=>[t,box(t)]));for(const name of widgetTitles)side.append(widgets[name]);
 let active=true;async function update(){const start=performance.now();try{
  const [stats,tel,req]=await fetchData(api);if(!active)return;
  cards.replaceChildren(...[['Total Requests',stats.total],['Pending Review',stats.pending],['Approved',stats.approved],['Changes Requested',stats.changes]].map(([name,value])=>metric(name,value)));
  trend.replaceChildren(el('h3','','Request Submissions'),spark(tel.trends.map(x=>x.count)));trend.append(el('p','muted',tel.trends.length?`${tel.trends.length} active submission dates`:'No submissions recorded yet'));
  distribution.replaceChildren(el('h3','','Workflow Status'));for(const [key,name] of [['draft','Draft'],['pending','Pending'],['changes','Changes Requested'],['approved','Approved']])progress(distribution,name,stats[key],stats.total);
  recent.replaceChildren(el('h3','','Recent Requests'));const table=el('table','admin-table cv-generic-table'),thead=el('thead'),tr=el('tr');for(const h of ['ID','Request','Status','Priority'])tr.append(el('th','',h));thead.append(tr);table.append(thead);const tbody=el('tbody');for(const r of req.items.slice(-5).reverse()){const tr=el('tr');for(const [name,value] of [['ID',r.id],['Request',r.title],['Status',r.status],['Priority',r.priority]]){const td=el('td','',value);td.dataset.label=name;tr.append(td)}tbody.append(tr)}table.append(tbody);recent.append(table);
  const health=widgets['API Response'];health.replaceChildren(el('h3','','API Response'),el('div','telemetry-value',`${Math.round(performance.now()-start)} ms`),el('p','muted','Measured request round trip · live browser metric'));
  const queue=widgets['Processing Queue'];queue.replaceChildren(el('h3','','Processing Queue'),el('div','telemetry-value',tel.queue.pending),el('p','muted','Requests awaiting evaluation'));progress(queue,'Evaluated',tel.queue.processed,tel.queue.total);
  const throughput=widgets['Review Throughput'];throughput.replaceChildren(el('h3','','Review Throughput'),el('div','telemetry-value',`${tel.throughput.approvalRate}%`),el('p','muted','Approval rate among evaluated requests'),spark(tel.trends.map(x=>x.count)));
  const evaluation=widgets['Evaluation Progress'];evaluation.replaceChildren(el('h3','','Evaluation Progress'));progress(evaluation,'Processed',tel.queue.processed,tel.queue.total);evaluation.append(el('p','muted',`Average score: ${tel.scores.average??'—'} / 5`));
  const activity=widgets['Request Activity'];activity.replaceChildren(el('h3','','Request Activity'));const list=el('ul','telemetry-activity');for(const event of tel.activity.slice(0,5)){const li=el('li');li.append(el('strong','',event.action),el('span','',`#${event.id} · ${event.title}`));list.append(li)}if(!list.children.length)list.append(el('li','', 'No recent activity'));activity.append(list);activity.append(el('small','muted',`API updated ${new Date(tel.updatedAt).toLocaleTimeString('en-US')}`));
 }catch(err){if(active){const warning=el('p','muted',`Could not load dashboard: ${err.message}`);main.append(warning)}}}
 await update();return ()=>{active=false};
}};}
