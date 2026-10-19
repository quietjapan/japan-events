const CATS=["팝업스토어","콜라보카페","전시·행사","축제","가챠","쿠지","플리마켓","잡지 부록"];
const STOCK=new Set(["가챠","쿠지"]);const MAG="잡지 부록";const MAG_DAYS=35;
const CATCLS={"팝업스토어":"c-pop","콜라보카페":"c-cafe","전시·행사":"c-expo","축제":"c-fest","가챠":"c-gacha","쿠지":"c-kuji","플리마켓":"c-flea","잡지 부록":"c-mag"};
const st={cat:"",area:"",q:"",s:"all",from:"",to:""};let EV=[];
const today=(()=>{const d=new Date();d.setHours(0,0,0,0);return d})();
const pd=s=>{if(!s)return null;const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const fmt=s=>{const d=pd(s);if(!d)return"";return `${d.getMonth()+1}/${d.getDate()}(${"일월화수목금토"[d.getDay()]})`};
function status(e){const s=pd(e.start),en=pd(e.end);
  if(e.category===MAG){if(!s)return{k:"end"};const age=Math.round((today-s)/864e5);if(age>MAG_DAYS)return{k:"end"};return age<0?{k:"soon",t:"발매 예정"}:{k:"now",t:"발매 중"}}
  const sk=STOCK.has(e.category);
  if(en&&en<today)return{k:"end"};if(!s&&sk)return{k:"soon",t:"입고 예정"};if(s&&s>today)return{k:"soon",t:sk?"입고 예정":"예정"};
  const left=en?Math.round((en-today)/864e5):99;
  return left<=14?{k:"ending",t:left===0?"오늘 종료":`곧 종료 D-${left}`}:{k:"now",t:sk?"입고 중":"진행 중"}}
function urg(e,x){const s=pd(e.start),en=pd(e.end);
  if(x.k==="ending"){const l=Math.round((en-today)/864e5);return{c:l<=7?"u-hot":"u-warm",t:`🔥 ${l===0?"오늘 종료":"D-"+l}`}}
  if((STOCK.has(e.category)||e.category===MAG)&&s&&s>today){const l=Math.round((s-today)/864e5);if(l<=7)return{c:"u-new",t:`🆕 곧 발매 D-${l}`}}
  return null}
const magEnd=e=>{const d=pd(e.start);d.setDate(d.getDate()+MAG_DAYS);return iso(d)};
const inRange=e=>{if(!st.from&&!st.to)return true;const s=e.start||"0000",en=e.end||(e.category===MAG&&e.start?magEnd(e):"9999");
  return(!st.to||s<=st.to)&&(!st.from||en>=st.from)};
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pricet=s=>(window.FX&&FX.annotate)?FX.annotate(s):esc(s);
const CITY={"도쿄":[35.6812,139.7671],"오사카":[34.6937,135.5023],"교토":[35.0116,135.7681],"나고야":[35.1709,136.8815],"후쿠오카":[33.5902,130.4017],"삿포로":[43.0618,141.3545],"요코하마":[35.4437,139.638]};
const WX={0:["☀️","맑음"],1:["🌤️","대체로 맑음"],2:["⛅","구름 조금"],3:["☁️","흐림"],45:["🌫️","안개"],48:["🌫️","안개"],51:["🌦️","약한 이슬비"],53:["🌦️","이슬비"],55:["🌦️","강한 이슬비"],56:["🌧️","어는 이슬비"],57:["🌧️","어는 이슬비"],61:["🌧️","약한 비"],63:["🌧️","비"],65:["🌧️","강한 비"],66:["🌧️","어는 비"],67:["🌧️","어는 비"],71:["🌨️","약한 눈"],73:["🌨️","눈"],75:["🌨️","많은 눈"],77:["🌨️","싸락눈"],80:["🌦️","소나기"],81:["🌦️","소나기"],82:["⛈️","강한 소나기"],85:["🌨️","눈 소나기"],86:["🌨️","눈 소나기"],95:["⛈️","뇌우"],96:["⛈️","뇌우·우박"],99:["⛈️","뇌우·우박"]};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const FC_DAYS=16;const wxCache={};
function coords(e){if(e.lat&&e.lon)return[e.lat,e.lon,true];const c=CITY[e.area];return c?[c[0],c[1],false]:null}
function pickRange(e){if(e.area==="전국"||e.category===MAG||!coords(e)||!e.start)return null;const mn=[e.start,iso(today)].sort()[1];const mx=e.end||e.start;return mn<=mx?[mn,mx]:null}
function dayWx(lat,lon,date){const k=`${lat},${lon}`;
  wxCache[k]=wxCache[k]||fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=${FC_DAYS}`).then(r=>r.json());
  return wxCache[k].then(d=>{const i=d.daily.time.indexOf(date);return i<0?null:{c:d.daily.weather_code[i],hi:d.daily.temperature_2m_max[i],lo:d.daily.temperature_2m_min[i],p:d.daily.precipitation_probability_max[i]}})}
document.addEventListener("change",ev=>{const inp=ev.target;if(!inp.classList||!inp.classList.contains("visit"))return;
  const out=inp.closest(".pick").querySelector(".pickwx");const v=inp.value;if(!v){out.innerHTML="";return}
  const lim=new Date(today);lim.setDate(lim.getDate()+FC_DAYS-1);
  if(pd(v)>lim){out.innerHTML=`<span class="wx-msg">🗓️ ${fmt(v)} · 아직 예보가 없어요 (약 2주 전부터 확인 가능)</span>`;return}
  out.innerHTML='<span class="wx-msg">불러오는 중…</span>';
  dayWx(+inp.dataset.lat,+inp.dataset.lon,v).then(w=>{if(!w){out.innerHTML=`<span class="wx-msg">🗓️ ${fmt(v)} · 아직 예보가 없어요 (약 2주 전부터 확인 가능)</span>`;return}
    const x=WX[w.c]||["🌡️","-"];
    out.innerHTML=`<div class="pw"><span class="pi">${x[0]}</span><div><b>${fmt(v)} ${x[1]}</b><div>최고 ${Math.round(w.hi)}° / 최저 ${Math.round(w.lo)}° · ☔ 강수확률 ${w.p??"-"}%</div><div class="ps">${esc(inp.dataset.src)} 기준 예보 (Open-Meteo)</div></div></div>`})
  .catch(()=>{out.innerHTML='<span class="wx-msg">날씨를 불러오지 못했어요.</span>'})});
function picker(e){const r=pickRange(e);if(!r)return"";const [la,lo,venue]=coords(e);
  return `<div class="pick"><label>📅 방문 날짜 <input type="date" class="visit" min="${r[0]}" max="${r[1]}" data-lat="${la}" data-lon="${lo}" data-src="${venue?"행사장 위치":e.area+" 시내"}"></label><div class="pickwx"><span class="wx-msg">날짜를 고르면 그날 날씨가 보여요</span></div></div>`}
const mapq=e=>e.area!=="전국"&&e.category!==MAG&&e.map_query?e.map_query:"";
const thumb=e=>`<div class="th dt ${CATCLS[e.category]||""}"><span>${esc(e.category)}</span>${e.thumbnail?`<img src="${esc(e.thumbnail)}" alt="" ${e.thumb_pos?`style="object-position:${esc(e.thumb_pos)}"`:""} loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}</div>`;
document.addEventListener("toggle",ev=>{const d=ev.target;if(!(d instanceof HTMLDetailsElement)||!d.open||!d.classList.contains("map"))return;
  const box=d.querySelector(".mapbox");if(!box.firstChild)box.innerHTML=`<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(d.dataset.q)}&output=embed" title="지도"></iframe>`},true);
function render(){
  const q=st.q.trim().normalize("NFKC").toLowerCase();
  const rows=EV.map(e=>({e,x:status(e)})).filter(({e,x})=>x.k!=="end"
    &&(!st.cat||e.category===st.cat)&&(!st.area||e.area===st.area)
    &&(st.s==="all"||(st.s==="soon"?x.k==="soon":x.k!=="soon"))
    &&inRange(e)
    &&(!q||[e.title_ko,e.title_ja,e.venue,e.summary_ko].join(" ").normalize("NFKC").toLowerCase().includes(q)))
   .sort((a,b)=>{const ka=a.e.category===MAG?magEnd(a.e):(a.e.end||"9"),kb=b.e.category===MAG?magEnd(b.e):(b.e.end||"9");return ka.localeCompare(kb)});
  document.getElementById("count").textContent=`${rows.length}건`;
  document.getElementById("magintro").hidden=st.cat!==MAG;
  document.getElementById("list").innerHTML=rows.length?rows.map(({e,x})=>{const u=urg(e,x);return `
  <article class="card${u?" "+u.c:""}" data-i="${EV.indexOf(e)}">${u?`<div class="ub">${u.t}</div>`:""}
  <div class="top">${thumb(e)}<div class="tx"><div class="badges"><span class="b cat ${CATCLS[e.category]||""}">${esc(e.category)}</span><span class="b ${x.k}">${x.t}</span><span class="b">${esc(e.area)}</span></div>
  <h2${(e.gallery&&e.gallery.length)?` class="dt"`:""}>${esc(e.title_ko)}</h2><p class="ja">${esc(e.title_ja||"")}</p></div></div>
  ${e.summary_ko?`<div class="sum"><span class="sumlbl"><a href="${esc(e.summary_source||e.official_url)}" target="_blank" rel="noopener">공식 페이지 요약</a></span><p>${esc(e.summary_ko)}</p></div>`:""}
  ${e.thumbnail?`<p class="credit"><a href="${esc(e.thumbnail_source||e.official_url)}" target="_blank" rel="noopener">이미지 출처</a></p>`:""}
  <dl><dt>${STOCK.has(e.category)||e.category===MAG?"발매":"기간"}</dt><dd>${e.date_label?esc(e.date_label):`${e.start?fmt(e.start):""}${e.end&&e.end!==e.start?" ~ "+fmt(e.end):(!e.end&&!STOCK.has(e.category)&&e.category!==MAG?" ~":"")}`}</dd><dt>장소</dt><dd>${esc(e.venue)}</dd>
  ${e.reservation?`<dt>예약</dt><dd>${esc(e.reservation)}</dd>`:""}${e.price?`<dt>가격</dt><dd>${pricet(e.price)}</dd>`:""}</dl>
  ${e.notes?`<p class="note">📝 ${esc(e.notes)}</p>`:""}${e.verified_at?`<p class="note">✅ 공식 사이트 원문 대조 ${esc(e.verified_at)}</p>`:""}
  ${picker(e)}
  ${mapq(e)?`<details class="map" data-q="${esc(mapq(e))}"><summary>📍 지도 펼치기</summary><div class="mapbox"></div></details>`:""}
  <div class="btns">${(e.gallery&&e.gallery.length)?`<button type="button" class="dt more">자세히 보기</button>`:""}${e.official_url?`<a href="${esc(e.official_url)}" target="_blank" rel="noopener">공식 사이트</a>`:""}${mapq(e)?`<a class="sec" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapq(e))}" target="_blank" rel="noopener">지도 보기</a>`:""}${e.source_url&&e.source_url!==e.official_url?`<a class="sec" href="${esc(e.source_url)}" target="_blank" rel="noopener">출처</a>`:""}</div>
  </article>`}).join(""):`<p class="empty">조건에 맞는 일정이 없어요.</p>`}

const WD=["일","월","화","수","목","금","토"];
const seoulYMD=()=>{const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());const g=t=>p.find(x=>x.type===t).value;return`${g("year")}-${g("month")}-${g("day")}`};
const parseYMD=s=>{const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const fmtMDW=dt=>`${dt.getMonth()+1}/${dt.getDate()}(${WD[dt.getDay()]})`;
function nextMonThuAfter(ymd,{inclusive=false}={}){
  const d=parseYMD(ymd);d.setDate(d.getDate()+(inclusive?0:1));
  for(let i=0;i<8;i++){const w=d.getDay();if(w===1||w===4)return d;d.setDate(d.getDate()+1)}
  return d;
}
function setUpdateLabel(last){
  const el=document.getElementById("upd");if(!el||!last)return;
  const lastD=parseYMD(last);if(Number.isNaN(lastD.getTime()))return;
  let next=nextMonThuAfter(last,{inclusive:false});
  const today=seoulYMD();
  const nextYMD=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,"0")}-${String(next.getDate()).padStart(2,"0")}`;
  if(nextYMD<today) next=nextMonThuAfter(today,{inclusive:true});
  el.textContent=`🗓️ 마지막 업데이트 ${fmtMDW(lastD)} · 다음 업데이트 ${fmtMDW(next)}`;
  el.hidden=false;
}

fetch("events.json",{cache:"no-store"}).then(r=>r.json()).then(d=>{
  EV=d.events||[];document.getElementById("base").textContent=`기준일: ${d.base_date}`;
  setUpdateLabel(d.last_updated);
  if(d.is_sample)document.getElementById("banner").hidden=false;
  const chips=document.getElementById("chips");
  chips.innerHTML=["",...CATS].map(c=>`<button data-c="${c}" class="${c?"":"on"}">${c||"전체"}</button>`).join("");
  chips.onclick=ev=>{const b=ev.target.closest("button");if(!b)return;st.cat=b.dataset.c;chips.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));render()};
  const sel=document.getElementById("area");[...new Set(EV.map(e=>e.area))].forEach(a=>sel.add(new Option(a,a)));
  sel.onchange=()=>{st.area=sel.value;render()};
  const fr=document.getElementById("from"),to=document.getElementById("to");
  const setR=()=>{st.from=fr.value;st.to=to.value;if(st.from&&st.to&&st.from>st.to){st.to=st.from;to.value=st.from}to.min=st.from||"";render()};
  fr.onchange=setR;to.onchange=setR;
  document.getElementById("rreset").onclick=()=>{fr.value=to.value="";setR()};
  document.getElementById("q").oninput=e=>{st.q=e.target.value;render()};
  const tg=document.getElementById("status");tg.onclick=ev=>{const b=ev.target.closest("button");if(!b)return;st.s=b.dataset.s;tg.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));render()};
  render()}).catch(()=>document.getElementById("list").innerHTML='<p class="empty">데이터를 불러오지 못했어요.</p>');

const host=u=>{try{return new URL(u).hostname.replace(/^www\./,"")}catch{return""}};
const period=e=>e.date_label?e.date_label:`${e.start?fmt(e.start):""}${e.end&&e.end!==e.start?" ~ "+fmt(e.end):""}`;
function detail(e){const g=e.gallery||[];const groups=[...new Set(g.map(x=>x.group||""))];
  return `<div class="dv" role="dialog" aria-modal="true" aria-label="${esc(e.title_ko)} 자세히 보기"><button class="dvx" aria-label="닫기">✕</button>
  <div class="dcard${e.image_fit==="contain"?" dfit":""}">${(e.image_hd||e.thumbnail)?(e.image_fit==="contain"?`<img class="dblur" src="${esc(e.image_hd||e.thumbnail)}" alt="" aria-hidden="true" referrerpolicy="no-referrer">`:"")+`<img class="dbg" src="${esc(e.image_hd||e.thumbnail)}" alt="" ${e.thumb_pos&&e.image_fit!=="contain"?`style="object-position:${esc(e.thumb_pos)}"`:""} referrerpolicy="no-referrer" ${e.image_hd&&e.thumbnail&&e.image_hd!==e.thumbnail?`onerror="this.onerror=null;this.src='${esc(e.thumbnail)}'"`:""}>`:""}
   <div class="dpill">${esc(e.title_ko)}</div>
   <div class="dpanel">${e.title_ja?`<p class="dja">${esc(e.title_ja)}</p>`:""}${e.summary_ko?`<p class="dsum">${esc(e.summary_ko)}</p>`:""}
    <ul><li>📍 ${esc(e.venue)}</li><li>🗓️ ${esc(period(e))}</li>${e.price?`<li>🏷️ ${pricet(e.price)}</li>`:""}</ul>
    <div class="dtag">#${esc(e.category)} · ${esc(e.area)}</div>
    ${e.thumbnail?`<div class="dsrc">이미지 출처: <a href="${esc(e.thumbnail_source||e.official_url)}" target="_blank" rel="noopener">${esc(host(e.thumbnail_source||e.official_url||e.thumbnail))}</a></div>`:""}</div></div>
  ${g.length?groups.map(gr=>`<h3 class="dgh">${esc(gr||"갤러리")}</h3><div class="dgrid">${g.filter(x=>(x.group||"")===gr).map(x=>`<figure><a class="zoom" href="${esc(x.full||x.img)}" target="_blank" rel="noopener" data-cap="${esc(x.caption_ko)}"><img src="${esc(x.img)}" alt="${esc(x.caption_ko)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('figure').remove()"></a><figcaption><b>${esc(x.caption_ko)}</b>${x.caption_ja?`<span>${esc(x.caption_ja)}</span>`:""}${x.kinds||x.size?`<i>${esc([x.kinds,x.size].filter(Boolean).join(" · "))}</i>`:""}${x.price?`<em>${pricet(x.price)}</em>`:""}</figcaption></figure>`).join("")}</div>`).join("")
   +`<p class="dnote">${e.gallery_note?esc(e.gallery_note)+" · ":""}출처: <a href="${esc(e.gallery_source||e.official_url)}" target="_blank" rel="noopener">${esc(host(e.gallery_source||e.official_url))}</a></p>`:""}
  ${e.official_url?`<a class="dlink" href="${esc(e.official_url)}" target="_blank" rel="noopener">공식 사이트에서 확인하기</a>`:""}</div>`}
let DETAIL_E=null;
function openDetail(e){closeDetail();DETAIL_E=e;const o=document.createElement("div");o.className="dov";o.innerHTML=detail(e);document.body.appendChild(o);document.body.style.overflow="hidden";o.querySelector(".dvx").focus();
  o.addEventListener("click",ev=>{if(ev.target===o||ev.target.closest(".dvx"))closeDetail()})}
function closeDetail(){const o=document.querySelector(".dov");if(o){o.remove();document.body.style.overflow="";DETAIL_E=null}}
function closeLB(){const l=document.querySelector(".lb");if(l){l.remove();return true}return false}
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"){if(!closeLB())closeDetail()}});
document.addEventListener("click",ev=>{const a=ev.target.closest(".dgrid a.zoom");if(!a)return;ev.preventDefault();ev.stopPropagation();closeLB();
  const l=document.createElement("div");l.className="lb";l.setAttribute("role","dialog");l.setAttribute("aria-label","사진 크게 보기");
  l.innerHTML=`<button class="dvx" aria-label="닫기">✕</button><img src="${esc(a.getAttribute("href"))}" alt="" referrerpolicy="no-referrer"><p>${esc(a.dataset.cap||"")} · <a href="${esc(a.getAttribute("href"))}" target="_blank" rel="noopener">원본 열기</a></p>`;
  l.addEventListener("click",e2=>{if(!e2.target.closest("p a"))l.remove()});document.body.appendChild(l)},true);
document.addEventListener("click",ev=>{const t=ev.target.closest(".card .dt");if(!t)return;const c=t.closest(".card");const e=EV[+c.dataset.i];if(e)openDetail(e)});

window.addEventListener("fxrate",()=>{if(typeof render==="function")render();if(DETAIL_E){const e=DETAIL_E;closeDetail();openDetail(e)}});
