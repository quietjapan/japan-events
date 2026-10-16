(()=>{
const CACHE_KEY="fx_jpy_krw_v1", TTL=12*3600e3;
const FX=window.FX={rate:null,asOf:"",ready:false};

function roundKrw(jpy){return Math.round(jpy*FX.rate/100)*100}
function fmtKrw(n){return n.toLocaleString("ko-KR")}
function yenSpan(jpy){
  const k=roundKrw(jpy);
  return ` <span class="fxkrw">(약 ${fmtKrw(k)}원)</span>`}
/** Escape then append muted KRW next to each yen amount. No-op if no rate. */
FX.annotate=function(raw){
  const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  if(raw==null||raw==="")return"";
  if(!(FX.rate>0))return esc(raw);
  const s=String(raw);
  // ¥12,000 / ¥11,550~13,750 / 1,500엔 / 1,000〜2,000円 / 660엔
  const re=/(¥|￥)\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\s*([~～〜\-–])\s*(\d{1,3}(?:,\d{3})*|\d+))?|(\d{1,3}(?:,\d{3})*|\d+)(?:\s*([~～〜\-–])\s*(\d{1,3}(?:,\d{3})*|\d+))?\s*(円|엔)/g;
  let out="",last=0,m;
  while((m=re.exec(s))){
    out+=esc(s.slice(last,m.index));
    const full=m[0];
    if(m[1]){ // ¥ form
      const a=+m[2].replace(/,/g,""), sep=m[3], b=m[4]?+m[4].replace(/,/g,""):null;
      out+=esc(m[1])+esc(m[2])+yenSpan(a);
      if(b!=null)out+=esc(sep)+esc(m[4])+yenSpan(b);
    }else{
      const a=+m[5].replace(/,/g,""), sep=m[6], b=m[7]?+m[7].replace(/,/g,""):null, unit=m[8];
      if(b!=null){
        out+=esc(m[5])+yenSpan(a)+esc(sep)+esc(m[7])+yenSpan(b)+esc(unit);
      }else{
        out+=esc(m[5])+esc(unit)+yenSpan(a);
      }
    }
    last=m.index+full.length;
  }
  out+=esc(s.slice(last));
  return out;
};

function loadCache(){
  try{const c=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");
    if(c&&c.rate>0&&Date.now()-c.ts<TTL){FX.rate=c.rate;FX.asOf=c.asOf||"";FX.ready=true;return true}}catch{}
  return false}
function saveCache(){
  try{localStorage.setItem(CACHE_KEY,JSON.stringify({rate:FX.rate,asOf:FX.asOf,ts:Date.now()}))}catch{}}
function emit(){window.dispatchEvent(new CustomEvent("fxrate",{detail:{rate:FX.rate,asOf:FX.asOf}}))}

async function fetchRate(force){
  if(!force&&loadCache()){emit();return true}
  const tryApis=[
    async()=>{const r=await fetch("https://open.er-api.com/v6/latest/JPY",{cache:"no-store"});
      if(!r.ok)throw 0;const j=await r.json();
      if(j.result!=="success"||!(j.rates&&j.rates.KRW>0))throw 0;
      return{rate:+j.rates.KRW,asOf:String(j.time_last_update_utc||"").slice(0,16).trim()||new Date().toISOString().slice(0,10)}},
    async()=>{const r=await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/jpy.json",{cache:"no-store"});
      if(!r.ok)throw 0;const j=await r.json();const krw=j.jpy&&j.jpy.krw;
      if(!(krw>0))throw 0;return{rate:+krw,asOf:j.date||new Date().toISOString().slice(0,10)}}
  ];
  for(const fn of tryApis){
    try{const {rate,asOf}=await fn();FX.rate=rate;FX.asOf=asOf;FX.ready=true;saveCache();emit();return true}catch{}}
  FX.ready=true;emit();return false}

/* —— UI —— */
const btn=document.getElementById("fxbtn"), ov=document.getElementById("fxov");
const panel=document.getElementById("fxpanel"), rateEl=document.getElementById("fxrate");
const inp=document.getElementById("fxin"), out=document.getElementById("fxout");
const fromLbl=document.getElementById("fxfromlbl"), toLbl=document.getElementById("fxtolbl");
if(!btn||!ov){loadCache();fetchRate();return}

let jpyToKrw=true;
function fmtNum(n,dec){if(!isFinite(n))return"-";return n.toLocaleString("ko-KR",{maximumFractionDigits:dec,minimumFractionDigits:0})}
function calc(){
  const v=parseFloat(inp.value);
  if(!(FX.rate>0)||!isFinite(v)||v<0){out.textContent="0";return}
  out.textContent=jpyToKrw?fmtNum(v*FX.rate,0):fmtNum(v/FX.rate,2)}
function showRate(){
  if(!(FX.rate>0)){rateEl.textContent=rateEl.dataset.err||"환율 불러오는 중…";return}
  rateEl.innerHTML=`<b>100엔 = ${fmtNum(Math.round(FX.rate*100),0)}원</b>`+(FX.asOf?` · ${FX.asOf}`:"")}
function setDir(toJpy){jpyToKrw=toJpy;fromLbl.textContent=jpyToKrw?"엔화 (JPY)":"원화 (KRW)";toLbl.textContent=jpyToKrw?"원화 (KRW)":"엔화 (JPY)";inp.setAttribute("aria-label",jpyToKrw?"엔화 금액":"원화 금액");calc()}

function open(){ov.hidden=false;btn.setAttribute("aria-expanded","true");
  showRate();calc();
  fetchRate().then(ok=>{if(!ok&&!(FX.rate>0)){rateEl.dataset.err="환율을 불러오지 못했어요. 잠시 후 다시 열어 주세요.";rateEl.textContent=rateEl.dataset.err}
    showRate();calc()});
  setTimeout(()=>inp.focus(),50)}
function close(){ov.hidden=true;btn.setAttribute("aria-expanded","false");btn.focus()}
function toggle(){ov.hidden?open():close()}

btn.addEventListener("click",e=>{e.stopPropagation();toggle()});
document.getElementById("fxx").addEventListener("click",close);
ov.addEventListener("click",e=>{if(e.target===ov)close()});
panel.addEventListener("click",e=>e.stopPropagation());
inp.addEventListener("input",calc);
document.getElementById("fxswap").addEventListener("click",()=>{
  const prev=parseFloat(inp.value);
  const converted=FX.rate>0&&isFinite(prev)?(jpyToKrw?prev*FX.rate:prev/FX.rate):NaN;
  setDir(!jpyToKrw);
  if(isFinite(converted)){inp.value=jpyToKrw?String(Math.round(converted*100)/100):String(Math.round(converted));calc()}
});
document.getElementById("fxquick").addEventListener("click",e=>{
  const b=e.target.closest("button[data-jpy]");if(!b)return;
  if(!jpyToKrw)setDir(true);
  inp.value=String(+b.dataset.jpy);calc();inp.focus()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!ov.hidden){e.stopPropagation();close()}},true);
window.addEventListener("fxrate",()=>{if(!ov.hidden){showRate();calc()}});

loadCache();showRate();fetchRate();
})();
