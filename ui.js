/* --- Habillage moderne + fiches joueurs entierement en francais --- */
(function(){
var NAT={"France":"Française","Senegal":"Sénégalaise","Mali":"Malienne","Ivory Coast":"Ivoirienne","Portugal":"Portugaise","Spain":"Espagnole","Italy":"Italienne","Germany":"Allemande","England":"Anglaise","Brazil":"Brésilienne","Argentina":"Argentine","Algeria":"Algérienne","Morocco":"Marocaine","Tunisia":"Tunisienne","Cameroon":"Camerounaise","Nigeria":"Nigériane","Ghana":"Ghanéenne","Belgium":"Belge","Netherlands":"Néerlandaise","Switzerland":"Suisse","Croatia":"Croate","Serbia":"Serbe","Poland":"Polonaise","Denmark":"Danoise","Sweden":"Suédoise","Norway":"Norvégienne","Austria":"Autrichienne","Greece":"Grecque","Turkey":"Turque","Ukraine":"Ukrainienne","Japan":"Japonaise","South Korea":"Sud-coréenne","United States":"Américaine","Canada":"Canadienne","Guinea":"Guinéenne","DR Congo":"Congolaise","Congo":"Congolaise","Burkina Faso":"Burkinabè","Benin":"Béninoise","Togo":"Togolaise","Gabon":"Gabonaise","Comoros":"Comorienne","Madagascar":"Malgache","Cape Verde":"Cap-verdienne","Angola":"Angolaise","Mauritania":"Mauritanienne","Albania":"Albanaise","Kosovo":"Kosovare","Romania":"Roumaine","Georgia":"Géorgienne","Armenia":"Arménienne","Israel":"Israélienne","Colombia":"Colombienne","Uruguay":"Uruguayenne","Chile":"Chilienne","Paraguay":"Paraguayenne","Mexico":"Mexicaine","Ireland":"Irlandaise","Scotland":"Écossaise","Wales":"Galloise","Czech Republic":"Tchèque","Slovakia":"Slovaque","Slovenia":"Slovène","Hungary":"Hongroise","Finland":"Finlandaise","Iceland":"Islandaise"};
var STA={"Active":"En activité","Retired":"Retraité","Injured":"Blessé","Suspended":"Suspendu","On Loan":"Prêté","Loan":"Prêté"};
var POSM={"Goalkeeper":"gardien","Goalkeeping Coach":"entraîneur des gardiens","Defender":"défenseur","Centre-Back":"défenseur central","Center-Back":"défenseur central","Right-Back":"arrière droit","Left-Back":"arrière gauche","Sweeper":"libéro","Midfielder":"milieu de terrain","Defensive Midfield":"milieu défensif","Central Midfield":"milieu central","Attacking Midfield":"milieu offensif","Left Midfield":"milieu gauche","Right Midfield":"milieu droit","Left Wing":"ailier gauche","Right Wing":"ailier droit","Left Winger":"ailier gauche","Right Winger":"ailier droit","Forward":"attaquant","Attacker":"attaquant","Centre-Forward":"avant-centre","Center-Forward":"avant-centre","Striker":"buteur","Second Striker":"second attaquant","Coach":"entraîneur","Assistant Coach":"entraîneur adjoint","Manager":"manager"};

function frOne(card){
  if(!card || card.__fr) return; card.__fr=true;
  card.querySelectorAll(".pl-f").forEach(function(f){
    var k=f.querySelector(".k"), v=f.querySelector(".v");
    if(!k||!v) return;
    var key=k.textContent.trim(), val=v.textContent.trim();
    if(key==="Nationalité" && NAT[val]) v.textContent=NAT[val];
    if(key==="Statut" && STA[val]) v.textContent=STA[val];
    if(key==="Poids"){ var m=/^([\d.]+)\s*lbs$/i.exec(val); if(m) v.textContent=Math.round(parseFloat(m[1])*0.4536)+" kg"; }
  });
  var bio=card.querySelector(".pl-bio");
  var get=function(label){ var r=null;
    card.querySelectorAll(".pl-f").forEach(function(f){
      if(f.querySelector(".k").textContent.trim()===label) r=f.querySelector(".v").textContent.trim(); });
    return r; };
  var nom=card.querySelector("h3")?card.querySelector("h3").textContent.trim():"";
  var poste=get("Poste"), nat=get("Nationalité"), ne=get("Né le"), lieu=get("Lieu de naissance"),
      taille=get("Taille"), poids=get("Poids"), num=get("Numéro"),
      club=card.querySelector(".sub")?card.querySelector(".sub").textContent.trim():"";
  var t1 = poste ? (nom+" évolue au poste de "+(POSM[poste]||poste.toLowerCase())) : nom;
  if(club) t1 += " au "+club;
  if(num) t1 += ", sous le numéro "+num;
  t1 += ".";
  var p2=[];
  if(ne) p2.push("Né le "+ne.replace(/\s*\(.*\)$/,"")+(lieu?" à "+lieu:""));
  if(nat) p2.push("de nationalité "+nat.toLowerCase());
  var t2 = p2.length ? p2.join(", ")+"." : "";
  var p3=[]; if(taille) p3.push(taille); if(poids) p3.push(poids);
  var t3 = p3.length ? "Gabarit : "+p3.join(" · ")+"." : "";
  var texte=[t1,t2,t3].filter(Boolean).join(" ");
  if(bio){ bio.textContent=texte; }
  else if(texte){ var d=document.createElement("div"); d.className="pl-bio"; d.textContent=texte; card.appendChild(d); }
}
new MutationObserver(function(){ document.querySelectorAll(".pl-card").forEach(frOne); })
  .observe(document.body,{childList:true,subtree:true});
document.querySelectorAll(".pl-card").forEach(frOne);

var css=document.createElement("style");
css.textContent=
'header.site{transition:background-color .3s ease,box-shadow .3s ease,backdrop-filter .3s ease}'
+'header.site.scrolled{background:rgba(7,31,75,.82);backdrop-filter:saturate(160%) blur(14px);box-shadow:0 10px 30px -18px rgba(0,0,0,.7)}'
+'@keyframes lcZoom{from{transform:scale(1.10)}to{transform:scale(1.015)}}'
+'@keyframes lcUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}'
+'.hero::before{animation:lcZoom 18s ease-out forwards;transform-origin:50% 60%}'
+'.hero-copy>*{animation:lcUp .8s cubic-bezier(.22,.9,.3,1) both}'
+'.hero-copy>*:nth-child(2){animation-delay:.10s}.hero-copy>*:nth-child(3){animation-delay:.18s}'
+'.hero-copy>*:nth-child(4){animation-delay:.26s}.hero-copy>*:nth-child(5){animation-delay:.34s}'
+'.ticket{animation:lcUp .9s cubic-bezier(.22,.9,.3,1) .22s both}'
+'.lc-rv{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.22,.9,.3,1),transform .7s cubic-bezier(.22,.9,.3,1)}'
+'.lc-rv.in{opacity:1;transform:none}'
+'.btn{border-radius:999px;transition:transform .18s cubic-bezier(.22,.9,.3,1),box-shadow .18s ease,filter .18s ease}'
+'.btn:hover{transform:translateY(-2px);box-shadow:0 12px 24px -14px rgba(7,31,75,.75)}'
+'.p-card{border-radius:16px;transition:transform .22s cubic-bezier(.22,.9,.3,1),box-shadow .22s ease}'
+'.p-card:hover{transform:translateY(-4px)}'
+'.cal-wrap,.squads,.fs,ul.dir,.vid{border-radius:18px}'
+'table.cal tbody tr{transition:background-color .18s ease}'
+'table.cal tbody tr:hover td{background:rgba(84,199,238,.07)}'
+'.vid{transition:transform .22s cubic-bezier(.22,.9,.3,1),box-shadow .22s ease}'
+'.vid:hover{transform:translateY(-4px);box-shadow:0 18px 36px -22px rgba(7,31,75,.7)}'
+'.vid .play span{transition:transform .2s ease}.vid .fr:hover .play span{transform:scale(1.12)}'
+'@keyframes lcPop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}'
+'.pl-card{animation:lcPop .32s cubic-bezier(.22,.9,.3,1) both;border-radius:20px}'
+'@keyframes lcFade{from{opacity:0}to{opacity:1}}'
+'.pl-modal{animation:lcFade .25s ease both}'
+'.dir-item{transition:background-color .18s ease}.dir-item:hover{background:rgba(84,199,238,.06)}'
+'.cta-band{border-radius:24px}'
+'@media (prefers-reduced-motion: reduce){.hero::before,.hero-copy>*,.ticket,.pl-card,.pl-modal{animation:none!important}'
+'.lc-rv{opacity:1!important;transform:none!important;transition:none!important}'
+'.btn:hover,.p-card:hover,.vid:hover{transform:none!important}}';
document.head.appendChild(css);

var hdr=document.querySelector("header.site");
function onScroll(){ if(hdr) hdr.classList.toggle("scrolled", window.scrollY>24); }
addEventListener("scroll",onScroll,{passive:true}); onScroll();

var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!reduce && "IntersectionObserver" in window){
  var io=new IntersectionObserver(function(es){
    es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); } });
  },{rootMargin:"0px 0px -8% 0px",threshold:.05});
  var mark=function(){
    document.querySelectorAll(".section-head,.p-card,.host-card,.steps,.cal-wrap,.dir-item,.vid,.fs,.banner-frame,.cta-band")
      .forEach(function(el){ if(!el.__rv){ el.__rv=true; el.classList.add("lc-rv"); io.observe(el); } });
  };
  mark();
  new MutationObserver(mark).observe(document.body,{childList:true,subtree:true});
}
})();
/* --- Tous les partenaires en encadres (meme style que Kalliste Partners) --- */
(function(){
var GEN="Partenaire de La Loge Corse, présent aux rencontres du Paris FC au Stade Jean-Bouin.";
/* [nom, site, contact, description, mono, confirme] */
var P=[
["ELYDAN","https://elydan.eu","",GEN,"EL",1],
["City Sécurité","https://citysecurite.com","",GEN,"CS",1],
["IE Pro","https://iepro.fr","",GEN,"IE",1],
["Busca","https://busca.fr","",'Membre du groupe BME. '+GEN,"BU",1],
["Groupe MC","https://www.mc-groupe.com","",GEN,"MC",1],
["Zaloc","https://zaloc.fr","",GEN,"ZA",1],
["Braxton Retail","https://braxton-im.com","",GEN,"BR",1],
["Triangul Invest","http://www.triangul.fr","Seyhan Selçuk",GEN,"TI",0]
];
function e(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML;}

/* 0. Style du monogramme (logo non fourni) */
var st=document.createElement("style");
st.textContent='.p-card .logo-box .mono{font-family:"Barlow Condensed";font-weight:800;font-size:18px;letter-spacing:.03em;color:var(--navy);line-height:1}'
+'.p-card .logo-box.mono-box{background:rgba(84,199,238,.14);border-color:rgba(84,199,238,.35)}';
document.head.appendChild(st);

/* 1. Titre : "Nos marques référencées." -> "Tous nos partenaires." */
document.querySelectorAll("#partenaires h2").forEach(function(h){
  if(/marques\s+référenc/i.test(h.textContent)){
    h.innerHTML='Tous nos<br><span class="accent">partenaires.</span>';
  }
});

/* 2. Suppression de l'annuaire en liste (remplacé par des encadrés) */
document.querySelectorAll("#partenaires .section-head").forEach(function(sh){
  var eb=sh.querySelector(".eyebrow");
  if(eb&&/annuaire\s+complet/i.test(eb.textContent)) sh.remove();
});
document.querySelectorAll("ul.dir").forEach(function(u){u.remove();});

/* 3. Un encadré pour chaque partenaire manquant */
var grid=document.getElementById("partnersGrid");
if(grid){
  var have={};
  grid.querySelectorAll(".p-card h4").forEach(function(h){have[h.textContent.trim().toLowerCase()]=1;});
  var ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 17 17 7M9 7h8v8"></path></svg>';
  P.forEach(function(p){
    if(have[p[0].toLowerCase()])return;
    var a=document.createElement("article");
    a.className="p-card";
    var h='<div class="p-top"><span class="logo-box mono-box"><span class="mono">'+e(p[4])+'</span></span>'
      +'<span class="p-tag'+(p[5]?'':' tech')+'">'+(p[5]?"Partenaire référencé":"En cours de référencement")+'</span></div>'
      +'<h4>'+e(p[0])+'</h4>'
      +'<p class="desc">'+e(p[3])+'</p>';
    if(p[2]) h+='<div class="p-contact">'+e(p[2])+'</div>';
    h+= p[1]
      ? '<a class="p-link" href="'+e(p[1])+'" target="_blank" rel="noopener">Découvrir la marque '+ARROW+'</a>'
      : '<span class="p-link disabled">Site à confirmer</span>';
    a.innerHTML=h;
    grid.appendChild(a);
  });
}
})();
