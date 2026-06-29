/* =========================================================
   summer.os — window manager + terminal + Shiba chatbot
   ========================================================= */

const isMobile = () => window.matchMedia("(max-width:760px)").matches;

/* ---------- Clock ---------- */
function tick(){
  const d = new Date();
  const t = d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  document.getElementById("clock").textContent = t;
  const lt = document.getElementById("lock-time");
  if(lt) lt.textContent = t;
  const ld = document.getElementById("lock-date");
  if(ld) ld.textContent = d.toLocaleDateString([], {weekday:"long", month:"long", day:"numeric"});
}
tick(); setInterval(tick, 10000);

/* ---------- Window manager ---------- */
let zTop = 10;
const mbActive = document.getElementById("mb-active");

function focusWin(win){
  win.style.zIndex = ++zTop;
  mbActive.textContent = win.dataset.app;
  document.querySelectorAll(".dock-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.toggle === win.id));
}
function openWin(id){
  const win = document.getElementById(id);
  if(!win) return;
  win.hidden = false;
  win.classList.remove("opening"); void win.offsetWidth; win.classList.add("opening");
  focusWin(win);
  if(isMobile()) win.scrollIntoView({behavior:"smooth", block:"center"});
}
function closeWin(id){
  const win = document.getElementById(id);
  if(!win) return;
  win.hidden = true;
  document.querySelector(`.dock-btn[data-toggle="${id}"]`)?.classList.remove("active");
  if(id === "win-chat"){ shiba.classList.remove("parked"); setShibaPose("sit"); }
}
function toggleWin(id){
  const win = document.getElementById(id);
  if(win.hidden) openWin(id); else closeWin(id);
}

/* dock + launch buttons + close dots */
document.querySelectorAll("[data-toggle]").forEach(b =>
  b.addEventListener("click", () => toggleWin(b.dataset.toggle)));
document.querySelectorAll("[data-open]").forEach(b =>
  b.addEventListener("click", () => openWin(b.dataset.open)));
document.querySelectorAll("[data-close]").forEach(b =>
  b.addEventListener("click", e => { e.stopPropagation(); closeWin(b.dataset.close); }));

/* focus on click */
document.querySelectorAll(".window").forEach(w =>
  w.addEventListener("pointerdown", () => focusWin(w)));

/* ---------- Dragging ---------- */
function makeDraggable(win){
  const bar = win.querySelector(".window-bar");
  bar.addEventListener("pointerdown", e => {
    if(isMobile() || e.target.closest("[data-close]")) return;
    focusWin(win);
    const r = win.getBoundingClientRect();
    const offX = e.clientX - r.left, offY = e.clientY - r.top;
    // pin via left/top, clear right/bottom anchors
    win.style.left = r.left + "px";
    win.style.top  = r.top  + "px";
    win.style.right = "auto"; win.style.bottom = "auto";
    bar.setPointerCapture(e.pointerId);
    const move = ev => {
      const x = Math.min(Math.max(0, ev.clientX - offX), innerWidth  - 80);
      const y = Math.min(Math.max(40, ev.clientY - offY), innerHeight - 50);
      win.style.left = x + "px";
      win.style.top  = y + "px";
    };
    const up = () => {
      bar.releasePointerCapture(e.pointerId);
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
  });
}
document.querySelectorAll(".window").forEach(makeDraggable);

/* ---------- Terminal boot animation ---------- */
const termOut = document.getElementById("term-out");
const termLaunch = document.getElementById("term-launch");
const BOOT = [
  {t:"summer@os ~ % ", c:"dim"},
  {t:"whoami\n", c:"acc"},
  {t:"Xiayu “Summer” Chen\n", c:""},
  {t:"Assistant Professor · School of Social Work · UCF\n", c:"dim"},
  {t:"\nsummer@os ~ % ", c:"dim"},
  {t:"cat focus.txt\n", c:"acc"},
  {t:"▸ digital equity × healthy aging × AI for social good\n", c:"ok"},
  {t:"\nsummer@os ~ % ", c:"dim"},
  {t:"open --help", c:"acc"},
];
let bi = 0, ci = 0, curSpan = null;
function typeBoot(){
  if(bi >= BOOT.length){
    termOut.insertAdjacentHTML("beforeend", '<span class="cursor"></span>');
    termLaunch.hidden = false;
    return;
  }
  const seg = BOOT[bi];
  if(ci === 0){
    curSpan = document.createElement("span");
    if(seg.c) curSpan.className = seg.c;
    termOut.appendChild(curSpan);
  }
  curSpan.textContent += seg.t[ci];
  termOut.parentElement.scrollTop = termOut.parentElement.scrollHeight;
  ci++;
  if(ci >= seg.t.length){ bi++; ci = 0; }
  setTimeout(typeBoot, seg.c === "acc" ? 40 : 13);
}

/* ---------- Publications ---------- *
   Edit this array to add / update publications.                */
const PUBLICATIONS = [
  {year:2026, title:"Artificial Intelligence-based social assistive robots in dementia care: a systematic review and meta-analysis", authors:"Chen XS, Jiang L, Sun F, Feng Y", venue:"The Gerontologist", cites:2},
  {year:2026, title:"The utilization of Artificial Intelligence-based conversational agents on mental health care for older adults: a scoping review", authors:"Chen XS, Wen W, Choi S, Andrade FCD, Mejía ST", venue:"Aging & Mental Health"},
  {year:2026, title:"The Evolution of Social Work Education in China in the New Decade", authors:"Gao S, Chen XS", venue:"Social Work in Asia"},
  {year:2026, title:"Harnessing Technology for Social Good as a Grand Challenge", authors:"Anderson SG, Chen XS, Feng Y", venue:"Oxford Bibliographies in Social Work"},
  {year:2025, title:"Rural–Urban Comparison in Cognitive Health Among Brazilian Older Adults", authors:"Chen XS, Rodriguez TM, Wu R, Andrade F", venue:"Journal of Applied Gerontology", cites:3},
  {year:2025, title:"Supporting US Caregivers’ Mental Health", authors:"Yao J, Chen XS, Zhou S, Raj M", venue:"American Journal of Health Promotion"},
  {year:2025, title:"Multinational Comparisons of Factors Associated with Internet Use Among Older Adults", authors:"Gu D, Feng Q, Wang K, Zhu H, Chen XS", venue:"ICT Use and Healthy Longevity"},
  {year:2025, title:"Social media communication, traditional social interactions, and loneliness in later life", authors:"Wang K, Chen XS, Shuai Y, et al.", venue:"The Journals of Gerontology, Series B", cites:3},
  {year:2025, title:"The long-term impact of childhood grandparent co-residence", authors:"Wang K, Dong Y, Chen XS, Wei W, Ma Z", venue:"The Journals of Gerontology, Series B"},
  {year:2025, title:"Development and validation of equations to estimate body fat percentage", authors:"Fernandes LV, de Oliveira GB, Guerra RS, Chen XS, Andrade FCD, et al.", venue:"Clinical Nutrition ESPEN"},
  {year:2025, title:"A social engagement technology-based randomized controlled trial for older adults", authors:"Mois G, Lydon EA, Danilovich MK, Myers D, Chen XS, Mudar RA, et al.", venue:"Contemporary Clinical Trials Communications", cites:4},
  {year:2025, title:"Loneliness among older caregivers", authors:"Chen XS, Lydon EA, Mathias VF, Rogers WA, Mudar RA, Raj M", venue:"Journal of Applied Gerontology 44(7), 1193-1204", cites:7},
  {year:2025, title:"Interactive AI Technology for Dementia Caregivers", authors:"Sun F, Jiang L, Chen XS, Feng Y", venue:"Journal of Technology in Human Services 43(2), 91-116", cites:5},
  {year:2025, title:"The digital displacement on everyday activities and happiness among Chinese older adults", authors:"Chen XS, Yu Z, Xu Q", venue:"International Journal of Social Welfare 34(2), e70012", cites:4},
  {year:2025, title:"Exploring the use of generative artificial intelligence in systematic searching", authors:"Chen XS, Feng Y", venue:"IFLA Journal 51(1), 84-93", cites:24},
  {year:2025, title:"Bridging the access gap: A decade of narrowing the digital divide for Hispanic older adults", authors:"Wang K, Chen XS, Dong Y, Sanabria Vázquez KG, Gu D", venue:"Journal of Aging and Health 37(3-4), 182-191", cites:17},
  {year:2025, title:"The use of portable A-mode ultrasound in appendicular lean mass measurements", authors:"Fernandes LV, de Oliveira GB, Ripka WL, Chen XS, Andrade FCD, et al.", venue:"European Journal of Clinical Nutrition 79(2), 136-141", cites:8},
  {year:2024, title:"Cognitive trajectories and associated social and behavioral determinants among racial/ethnic minority older adults", authors:"Wang K, Chen XS, Zeng X, Wu B, Liu J, Daquin J, Li C", venue:"The Gerontologist 64(12), gnae147", cites:3},
  {year:2024, title:"Examining first- and second-level digital divide at the intersection of race/ethnicity, gender, and socioeconomic status", authors:"Wang K, Chen XS, Gu D, Smith BD, Dong Y, Peet JZ", venue:"The Gerontologist 64(9), gnae079", cites:29},
  {year:2024, title:"Gender disparities in telehealth use among older adults during the COVID-19 pandemic", authors:"Chen XS, Wang K", venue:"International Journal of Population Studies 10(4), 114-124", cites:4},
];
(function renderPublications(){
  const root = document.getElementById("pub-list");
  const years = [...new Set(PUBLICATIONS.map(p=>p.year))].sort((a,b)=>b-a);
  years.forEach(y=>{
    const h = document.createElement("h3"); h.className="pub-year"; h.textContent=y; root.appendChild(h);
    PUBLICATIONS.filter(p=>p.year===y).forEach(p=>{
      const el=document.createElement("article"); el.className="pub";
      el.innerHTML=`<div class="pub-title">${p.title}</div>
        <div class="pub-meta">${p.authors} · <em>${p.venue}</em>${p.cites?`<span class="pub-cites">${p.cites} cites</span>`:""}</div>`;
      root.appendChild(el);
    });
  });
})();

/* ---------- Boot / launch ---------- */
let launched = false;
function launch(){
  if(launched) return; launched = true;
  document.getElementById("boot").classList.add("off");
  focusWin(document.getElementById("win-term"));
  typeBoot();                                  // start terminal typing
  if(!isMobile()) setTimeout(()=>openWin("win-about"), 900);
}
const boot = document.getElementById("boot");
document.getElementById("boot-btn").addEventListener("click", e=>{ e.stopPropagation(); launch(); });
boot.addEventListener("click", launch);
boot.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); launch(); } });
window.addEventListener("keydown", e=>{ if(!launched && e.key==="Enter") launch(); });

/* ---------- Shiba chatbot (Rumi) ---------- */
const shiba = document.getElementById("shiba");
const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatQuick = document.getElementById("chat-quick");

const QUICK = ["who are you?","research?","education?","recent papers","contact"];

const KB = [
  {k:["who are you","your name","rumi","what are you"],
   a:"Woof! I'm <b>Rumi</b> 🐕 — Summer's research pup. Ask me about Dr. Xiayu “Summer” Chen's work, background, and papers!"},
  {k:["who is summer","who is she","about summer","tell me about","who is xiayu","about you","whoami"],
   a:"<b>Xiayu “Summer” Chen</b> is an Assistant Professor in the School of Social Work at the University of Central Florida — a trained oncology social worker working at the intersection of gerontology, health disparities, and tech for social good. 🌻"},
  {k:["research","study","work on","interest","focus"],
   a:"Summer studies <b>digital equity for aging populations</b> — technology acceptance among older adults, culturally responsive digital interventions, and <b>AI conversational agents</b> (like me!) that promote well-being and social inclusion for marginalized older adults."},
  {k:["ai","conversational agent","chatbot","robot","artificial intelligence"],
   a:"A big part of her work is <b>AI conversational agents & assistive robots</b> for older adults — including a meta-analysis of social assistive robots in dementia care and a scoping review of AI agents in elder mental health care. 🤖"},
  {k:["education","degree","phd","school","university","tsinghua","nyu","illinois"],
   a:"🎓 <b>Ph.D.</b> Social Work — Univ. of Illinois Urbana-Champaign · <b>M.S.W.</b> — NYU · <b>B.S.</b> Psychology — Tsinghua University, China."},
  {k:["paper","publication","recent","published","article","scholar"],
   a:"20+ publications, 226 citations, h-index 9. Recent: <i>AI social assistive robots in dementia care</i> (The Gerontologist, 2026) & <i>AI conversational agents in elder mental health</i> (Aging & Mental Health, 2026). Full list on <a href=\"https://scholar.google.com/citations?hl=en&user=ELKdtu0AAAAJ&view_op=list_works&sortby=pubdate\" target=\"_blank\">Google Scholar ↗</a>."},
  {k:["digital divide","equity","disparit","hispanic","minority"],
   a:"She studies the <b>digital divide</b> at the intersection of race/ethnicity, gender & socioeconomic status — including a decade narrowing the divide for Hispanic older adults. Some of her most-cited work!"},
  {k:["contact","email","reach","touch"],
   a:"📥 <a href=\"mailto:chen.xiayu@ucf.edu\">chen.xiayu@ucf.edu</a> · <a href=\"https://healthprofessions.ucf.edu/person/summer-chen/\" target=\"_blank\">UCF page ↗</a>"},
  {k:["design","portfolio"],
   a:"The <b>AI Design</b> window is where Summer will showcase AI-driven design projects — just getting started, check back soon! ✨"},
  {k:["hello","hi","hey","yo","woof"],
   a:"Woof woof! 🐕 Ask me anything about Summer's research, background, or papers."},
  {k:["thank","thanks","bye","cool","nice","great"],
   a:"Happy to help! 🐾 Ask me anything else, or explore the windows!"},
];
function botReply(text){
  const q=text.toLowerCase(); let best=null,score=0;
  for(const it of KB){ const s=it.k.reduce((a,kw)=>a+(q.includes(kw)?kw.length:0),0); if(s>score){score=s;best=it;} }
  return best ? best.a : "Hmm, I'm a little pup with fixed tricks 🐶 — try <b>research</b>, <b>education</b>, <b>papers</b>, or <b>contact</b>.";
}
function addMsg(text, who){
  const el=document.createElement("div"); el.className="msg "+who; el.innerHTML=text;
  chatLog.appendChild(el); chatLog.scrollTop=chatLog.scrollHeight;
}
function setShibaPose(pose){       // swap the single static image (no animation)
  const img = shiba.querySelector(".shiba-pose");
  if(img) img.src = "assets/rumi-" + pose + ".png";
}
function openChat(){
  openWin("win-chat");
  if(!isMobile()) shiba.classList.add("parked");
  setShibaPose("wave");
  if(!chatLog.dataset.greeted){
    addMsg("Woof! 🐕 I'm <b>Rumi</b>, Summer's research pup. Ask me anything — or tap a suggestion below!","bot");
    chatLog.dataset.greeted="1";
  }
  setTimeout(()=>chatInput.focus(),50);
}
shiba.addEventListener("click", openChat);
shiba.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){e.preventDefault();openChat();} });
document.querySelector('.dock-btn[data-toggle="win-chat"]').addEventListener("click", e=>{
  e.stopImmediatePropagation();
  if(document.getElementById("win-chat").hidden) openChat(); else closeWin("win-chat");
}, true);

chatForm.addEventListener("submit", e=>{
  e.preventDefault();
  const t=chatInput.value.trim(); if(!t) return;
  addMsg(t,"user"); chatInput.value="";
  setTimeout(()=>addMsg(botReply(t),"bot"),320);
});
QUICK.forEach(q=>{
  const b=document.createElement("button"); b.textContent=q;
  b.addEventListener("click",()=>{ addMsg(q,"user"); setTimeout(()=>addMsg(botReply(q),"bot"),280); });
  chatQuick.appendChild(b);
});

/* ---------------------------------------------------------------
   OPTIONAL: connect Rumi to a real LLM (Claude).
   The bot above is fully offline (no key, safe for public hosting).
   To use Claude live, run a tiny backend holding your API key and
   replace botReply() with a fetch to it. Never put a key in this file.
   --------------------------------------------------------------- */
