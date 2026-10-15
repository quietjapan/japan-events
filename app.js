const CATS=["팝업스토어","콜라보카페","전시·행사","축제","가챠","쿠지","플리마켓"];
const STOCK=new Set(["가챠","쿠지"]);
const CATCLS={"팝업스토어":"c-pop","콜라보카페":"c-cafe","전시·행사":"c-expo","축제":"c-fest","가챠":"c-gacha","쿠지":"c-kuji","플리마켓":"c-flea"};
const st={cat:"",area:"",q:"",s:"all"};let EV=[];
const today=(()=>{const d=new Date();d.setHours(0,0,0,0);return d})();
const pd=s=>{if(!s)return null;const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const fmt=s=>{const d=pd(s);if(!d)return"";return `${d.getMonth()+1}/${d.getDate()}(${"일월화수목금토"[d.getDay()]})`};
function status(e){const s=pd(e.start),en=pd(e.end);
  const sk=STOCK.has(e.category);
  if(en&&en<today)return{k:"end"};if(!s&&sk)return{k:"soon",t:"입고 예정"};if(s&&s>today)return{k:"soon",t:sk?"입고 예정":"예정"};
  const left=en?Math.round((en-today)/864e5):99;
  return left<=7?{k:"ending",t:left===0?"오늘 종료":`곧 종료 D-${left}`}:{k:"now",t:sk?"입고 중":"진행 중"}}
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const mapq=e=>e.area!=="전국"&&e.map_query?e.map_query:"";
const thumb=e=>`<div class="th ${CATCLS[e.category]||""}"><span>${esc(e.category)}</span>${e.thumbnail?`<img src="${esc(e.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}</div>`;
document.addEventListener("toggle",ev=>{const d=ev.target;if(!(d instanceof HTMLDetailsElement)||!d.open||!d.classList.contains("map"))return;
  const box=d.querySelector(".mapbox");if(!box.firstChild)box.innerHTML=`<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(d.dataset.q)}&output=embed" title="지도"></iframe>`},true);
function render(){
  const q=st.q.trim().toLowerCase();
  const rows=EV.map(e=>({e,x:status(e)})).filter(({e,x})=>x.k!=="end"
    &&(!st.cat||e.category===st.cat)&&(!st.area||e.area===st.area)
    &&(st.s==="all"||(st.s==="soon"?x.k==="soon":x.k!=="soon"))
    &&(!q||[e.title_ko,e.title_ja,e.venue].join(" ").toLowerCase().includes(q)))
   .sort((a,b)=>(a.e.end||"9").localeCompare(b.e.end||"9"));
  document.getElementById("count").textContent=`${rows.length}건`;
  document.getElementById("list").innerHTML=rows.length?rows.map(({e,x})=>`
  <article class="card">
  <div class="top">${thumb(e)}<div class="tx"><div class="badges"><span class="b cat ${CATCLS[e.category]||""}">${esc(e.category)}</span><span class="b ${x.k}">${x.t}</span><span class="b">${esc(e.area)}</span></div>
  <h2>${esc(e.title_ko)}</h2>${e.title_ja?`<p class="ja">${esc(e.title_ja)}</p>`:""}</div></div>
  ${e.thumbnail?`<p class="credit"><a href="${esc(e.thumbnail_source||e.official_url)}" target="_blank" rel="noopener">이미지 출처: 공식 사이트</a></p>`:""}
  <dl><dt>기간</dt><dd>${e.start?fmt(e.start):""} ~ ${fmt(e.end)}</dd><dt>장소</dt><dd>${esc(e.venue)}</dd>
  ${e.reservation?`<dt>예약</dt><dd>${esc(e.reservation)}</dd>`:""}${e.price?`<dt>가격</dt><dd>${esc(e.price)}</dd>`:""}</dl>
  ${e.notes?`<p class="note">📝 ${esc(e.notes)}</p>`:""}${e.verified_at?`<p class="note">✅ 공식 사이트 원문 대조 ${esc(e.verified_at)}</p>`:""}
  ${mapq(e)?`<details class="map" data-q="${esc(mapq(e))}"><summary>📍 지도 펼치기</summary><div class="mapbox"></div></details>`:""}
  <div class="btns">${e.official_url?`<a href="${esc(e.official_url)}" target="_blank" rel="noopener">공식 사이트</a>`:""}${mapq(e)?`<a class="sec" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapq(e))}" target="_blank" rel="noopener">지도 보기</a>`:""}${e.source_url&&e.source_url!==e.official_url?`<a class="sec" href="${esc(e.source_url)}" target="_blank" rel="noopener">출처</a>`:""}</div>
  </article>`).join(""):`<p class="empty">조건에 맞는 일정이 없어요.</p>`}
fetch("events.json",{cache:"no-store"}).then(r=>r.json()).then(d=>{
  EV=d.events||[];document.getElementById("base").textContent=`기준일: ${d.base_date}`;
  if(d.is_sample)document.getElementById("banner").hidden=false;
  const chips=document.getElementById("chips");
  chips.innerHTML=["",...CATS].map(c=>`<button data-c="${c}" class="${c?"":"on"}">${c||"전체"}</button>`).join("");
  chips.onclick=ev=>{const b=ev.target.closest("button");if(!b)return;st.cat=b.dataset.c;chips.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));render()};
  const sel=document.getElementById("area");[...new Set(EV.map(e=>e.area))].forEach(a=>sel.add(new Option(a,a)));
  sel.onchange=()=>{st.area=sel.value;render()};
  document.getElementById("q").oninput=e=>{st.q=e.target.value;render()};
  const tg=document.getElementById("status");tg.onclick=ev=>{const b=ev.target.closest("button");if(!b)return;st.s=b.dataset.s;tg.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));render()};
  render()}).catch(()=>document.getElementById("list").innerHTML='<p class="empty">데이터를 불러오지 못했어요.</p>');
