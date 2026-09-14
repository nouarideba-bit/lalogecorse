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
/* --- Logos des partenaires (extraits du fichier fourni par le client) --- */
(function(){
var L={"ELYDAN":"data:image/webp;base64,UklGRkAEAABXRUJQVlA4IDQEAABwFQCdASpgABoAPpVKnEqlpKKhqBqpyLASiWwAsvtZ+83d9sg/d6CtsTz0HoW83L0hf9j7D/7GdPL7Mv+Yr7P7N4O+Ejy97M5xX64/nv6Znrv7d4AOwJ4z/QNC043bxDz++fXne+l/YH/ln9Y/6ARmdQLC5cIhF1MIP0xgBDpOa7AphAY6zcMGpIy44f2J8CqvzmUqs+51sPAJkUGiU3gf51C1qaDUyQt8gl4muHRacOO1pAAA/vsudf/2XsNBuPAtf276joouAK2N4HrpsrtqKzupFgrIz3IdH5keDZMDeOt6bQmXbDz19mSAuQoLHe4+/ZKy7tpMMsAYpiBgLq+ybsy66AKvBTnjeF75+WpfKmzvAXfIxvvl3vdHoSQhWgvs1y66mxMzsq3DOzvFqbqC//kYaJh5CU55ODe8RwpsmsstljenEtANyqxfO6OAxSwUCzeBbJYXE9wjYFEDL308HO1mfD10clI1iQmnHTsVJqz1pxLLuyzbXCe/ej+vcKzDwmp8tGjE8vu8fR6GPI+mVT9mwwxMSabWcy+JBxW2FFrV4p97hpYGkGbh2ceIlCJn+Etj02qWaCUGHcyuakG5UObaQwRfEYDPjyMc7ixbHvymW6RVApgBEe2ZaON4wRPRJIzyK/jPSwuSH4vhftgLGCuX/TUNnkgxOsND6umRc7xLOJoBp/MUZgz7mLXOJrzq33Wm7VIvbD0m8QOd6bevDwMMvx7mmj3j9ZwFjhI+FHQI2iVoauDTXllTiDZGwfzpHcUv7vFRLlv6uKUzLlvZyhxj+9n+sHUKbssV2N2eus+l4Mah/OwWaUrn8PO0OCHLJoZALxt4Tz/vG2FzQkl6/VkD8Ukpc2/OEH0p6+Prjq99/X8/q2J0DBNmK0ypZ+UUCt7glSz+UYRkCR65+Hrp84Hf4vf60dsUVdv8aP+Q1TInbKYfcYz4ENTG/kFz5pL9pVv22zesX5bY1zv7arnoBZ3hksjia/wg7wgObZZT5PHbSAtaai4/IPhCa6vzzOiuEPjMjaCyutVdb4f4v/+YDdeqJb00llKD72eSm0jPy0VoqbKI33dWVHdyRb3YCayPeIPyEa4DW/fic89iRQudXBHB+pdlINAwKf2JMGGdarGKpoAkaC73IWlT82SXdjGDkW4j5FhEp2bJya1XrgfcVbowKPqhUf2m/zl/XAjAFcfDhgWTFJDxvYf/tCc1R8sHeBAmzW5twNW7ljB/tXWrQqtn8ViXjuzWQzepS8w9DtF+Y8yV6if4k5f9ezpY9upf8yzfraVgCNUEf82KmR12Ny2vbnVhOFHf9VZRL98EueVXXe8mm1AzGa16SXUXz/krHYQtpfH90zdEuoHd4SeS0iEUXbAlfxL/KT+vcAnmtApXKAeIMkw40Ezpv8C/oxG5EosshMS0WmhOJakfi+t3xLAAAA==","CITY SÉCURITÉ":"data:image/webp;base64,UklGRjIDAABXRUJQVlA4ICYDAACQDgCdASpgABUAPpU6mUgloyKhMBqqqLASiWQAwtWgNtbz2OmQbzJXYX1XlrDivC/KCON/0biA+sGto9x+dj/b+oBncekPYHEP5UYZoIawrYsaHFtEfhCrM4vw1EjzBgo/fKouMgPmcmrYLIu6XwqjzHLP0cp1v7qCc8tDAAD++yyV9jKlFlaOksEP571qu/X712/tBO1DSLLpNvjJgf/zfft31s7tYWNdfz/+/NAmM4OW42laI4HqayQL3glSiV+9fZ4tFzcasPdl9/Xl0yqczP/5oe5CDgxEOXnC8VH4h2X8IGbbxnIby+JAGyrq83MMq9X0XlN3fTZ3s1RUWLzSQ3ruybIeklRSoO9YG84n++zvL+bPzzGicU/J/C+W8tATzrvwb0yWZq/X5t6Tj+Z4k782PD8dOvd+xy+f/+5OU1ye2qykHXYWWDzGYzFVSVjPXsJuLJExcXX8IlPCzy6SgPJSO80KyTQ6LTu+ZnEUeHJ6E2b5iRhrunRhGTrgHtrG/BKeWXiWDe4JIFsv5Dvsr+/RhRPa9+RAFHN1JfTNT9bF1mPl/cZ9NpTw8bX9eKqYzaaMd1UEGKjcMJJEYCKIRMugc2bZ2xcgcYJZ6OjTZiB37ykitJWI4RPggwguwR8EzJCLHsM3RYXjqmhFFYuyyrh8MVDLjdiBMA293h5buVnn/EzXOFgkRxQJpG6SiteidcG+66dvqLoFhDkGNkfF298XT82aQ7MqNmJeMfuaU/Vb2ut6eSpsIO/2cc/l9Uc3mfCqcI5NiFF4GZ1HbZTLnsT5QaFy5IwSQZfHwM+rygJgjedzzGLSjGSrWRtY3aIvCs1SU7ImtZi0uE+5AXecOPr1nAzfVyPEEUGv40ZaFmSzKe3Y1J/Q00wfJFLSef8b/g/c+CXkPwXj4lqiMhdzgDy1Ol/upE0m1IAPFu1l0bGOJhywmCQ+Ia0QDaLyEI+zdnS0aYFWZr9uErSnChCLCbOpeJ9jEmHyCgFvmSHAla+0OuYdgAnW6HGPzpMOtGJARJCg1HrEHrwxV/OBkXCdJ5pL/4xPuzzUykZQq2Y/rrtgAAAAAA==","IE PRO":"data:image/webp;base64,UklGRsoEAABXRUJQVlA4IL4EAADwFQCdASpgABsAPpU+m0glo6KhKBquMLASiWwAt+tQwCjt+PXoz3t/X0Acsr6ivMB5S/qT3gz9qvYA/W704P2d+DX9yPSGug3hL5RPacnEi38n8SO1N/bd7kyNxAaZjH56q/9v/3vMB9O+wH+uv+64FUJWZ0JoK/PFuaQQ8P5NWqz6m/ozLwjfG9KL5Dlh+Y2j5GCydEQdlozkjfTks+5WrDe1w+iggF+5d07Do2U7a0cKIF0nlQAAAP77MVolHFIRS6vrl0PqQFL88vEn5T7qKuhucIXe427UdnJzuDXD2Lr8r7I3FAnKsb0DOmlMimu3muRCqm3/F0Wu2EuHTF7luhraNzXjymmPyDBYvKCVLMRqyLG04SHE8SJji+mmWHHjh4+25dFDog2kqHdEB/E67qQKsF9JeSHgW1D0f+Hd6a1E6Fxz+U1iTVFPKML7TXL9UejWDslmcMGVYnl8ZSuVdcwbRIMTLzkF9lC6fr419+WqUZB3ofitWXkCBl1ryjBxtb69pZ0K5Nf16rAHwtdlK6vOtkuvc+/kltW/3DuWVKFj4fKweEIblQM1h9vxO/Wj8MbG+AYiZgX7nvvF/GVK8HvDv5M80wuei/N6ji9SN/NiQaL7Z/5nV1/t/viDNuDUkyld3e5NO1YSsxYcw3qIprGe2E0QeY6IgV3L4CrkIsdbuq1LzK17cWCJgqi5Pkix1G5RHAyAgqQV30QFtfOcmo7t0i/bmmz4ULEsPjh0SGvcU2RbLW2CeBxrVwoHMeU8A1Sr6cd9Cpe/CyiHsxjxX4mcMn4WxLLX4AWn4u66761X/DPheCVArzW+dyaVYyH0lm54vVgXQgM+fPX5+i5ndPkwJlD6oeUmiTdgcX+Oq726BGtWmKX0Cbfq4UkP16PqHyILpaHKDTTcXJO9h2GZmXCbdpj35qMxFcvfqVNCBJOmJ4Bo+0+PC8TaezDMMc41Nii0Jn2Gqc1K265JvWvhjpTn4dGt+hxsJ39wDmduHHx7jLt7/pNRvi38++CETxIwznn/X9Dy/7kmxf9zR0xIptYv47/2eS75PIH1egB/vvCrVnpYHucl9vhcZAj12g3hclpsNRo2WEKRdJYS53toZmVYywA/hVaA1l8cBjOX3dS/xfgAqlWjdbzKVNDhaGoE5cb9tUMf7wJRbnfGBO+FddFJyWBurakDYrAwFW4IQXw9wcNd0jgg+RKtnGv6IeNYqh56c2tXGXRK2ahseVumk/qlCYiTjBfClnixtJ+MuSc/5mHVofYM9CESTK0XN/lFlUr2GsSYcs0gNf/KjdV+Frz/T9qNmQsVJTP6b+/ZUMHbLzvb1jYoMGI+WJGDNQoPUl4iAaV+QGHdx078TP0J6Fb5A6eHwNpYYH855LiOALfhQSqkdpwbZ2UTV4VLxrCseeFOC5wRE3/iZo7d5doiqHSbpTDmFlnjzmpILFNj4H/lS751At/+DajEoPQbiZ+aPjwJG3VhhtdyaT6tw5SmrkwtKd9rS3Xm5H45u+yflM9gLzLbP0XxjIGnQlRaiYn6rLZ2G9g1Zm3ZsbnHBEyqzi8/aFYdlWTyKRR5UW0wfuRZOno/t1+Fc5fUbqhouRXtqjucReOTfgcY6AAAAA==","BUSCA":"data:image/webp;base64,UklGRt4DAABXRUJQVlA4INIDAACQEgCdASpgABgAPpVAmkklo6IhMBgIALASiWwAnTLjjfD1vWvU6yXqI2wHmA/ZD1YPQ//jd8c9ADpXZ9Zyq+Xj578FwgyqjkX7UeC9qlK3Bnvkh+qvYM/WIMy1FVYLTeEH53CBXgC6wPAuKpaJH89fraBuKxsfGZjHcxXxEJUUPFKU6eNwx1LcfIl1u3ebUxUikTDRVNTnhcQWBsAAAP77QYoo/hBK6pbT4vMn+ToRXCgvkSYt2xG6M8szKlANHunvRuHURyDX3hFXn7W32PLQB4bhqCOqjHYRF6rIIIyMR1/HqSL/qR16jkxIdpCEUyApoyPVt/SLNYGn3W9+KxY0hubhtr+1yqcbltGvSSe6u43+KQWIrtg3zhufVG8JZAxj5Om4ebmX+Bn7MGWL4FBB5l/MiUrY0e2mzNUUcxZ5szFXguJEk9z/DhGRsg9fEYtNMXEU04tPvESvlBK1i4WZ+NWvb/4xPOqS4WfOW4uL+iKwiH7p6G5OMMmBgHpV8O3RdIcO9XTkfpvEjagjXJAKPIK8zdmips/8bqTj4haOeVkwuqH+F6sPk0j6f4ifVMYGJvMbAcRcikxoOMcGuzYv0fjjUfObzJ+rN061joWcMbTfW0Y5U3+8r+5x8nr+XL0h2RoZn3lREKduP4guUcmtb5mveVWhyUez1SBbzwJaaU6DcucTW3URgpgwL0ZPcrSQBvfdhvTPl6DVz5hPPBK6XLwDMfObHP9a96RTkdhLXEduaknYbsHHK0C4i4UlYOCodWC3ZHkjYUYeKNTZy66ABUh+dv/iQrnBhZsxJw9AMnOPG1dHsL3H/b+0LNY8De/o4Hvu8g60ge2+J6Vj+JX/UzILx6ys1EBtHgTgXqeg0M6uHC71+0X978qn9y4FIzI52KjuST5SlsJg6msppFp5ik5c71q7LGYD5ANqzPxyc2CpeHRtCjUZ4O4VBG9ElSdVa4d6DNtV+s/NlkXLe+9QMx2SbV8/lIw6YUjH4MILKQXWmbcctZvVZVz8ub1BBvqEADANz1nxm2BY7KD5G6GJLn2aN2qL37sqgdIfBb9cfu1ifzsCFSjzqdSRGz0AjN2qPtHPtmg+mOz+sM+8UCkbbvEHYofQho94vhnPkKxQT+a/9pRrww+eVvz7uXhAmSpFMa8MsOmgfb3jrL6fn5n5UqAYpL1iw7r3zjJCJOKqc2Bksh2GIi9LSNgsJXBVHfztdEXrE1cH31bh/XLa9y7iioEJgyKKQXzTNz4ep/hKAcmrYpxaUmR+vuC/LRE01N/Gbj/lt7yZOTTd+R4pQjrAAAA=","GROUPE MC":"data:image/webp;base64,UklGRuwCAABXRUJQVlA4IOACAADQDgCdASpGACsAPpU8mUglo6KhMRQNsLASiUAaNCbeyFWN+h58mH+USO0xVkHdrXF48/PKzlfPnsDfq/0N3sX/scqyw5Vher78afXy8ust4P1jvIPoHZ2yNn0vVtqMZRodEo0Yf45o81BoIz9NXmnEOU8/xWCwa+2dHOKwUE7wAP7+k40s/mbyb/bZb+qPvoZpcchyD8qvooXkj7644z35md6HMmv7spjDuLhEiy1uVFAW3CAc45fl8hiJoCSnZD8UgRigzbMNlm+3waP+3Wt28fjM+Qc95ZL5TaOsbdCOcMYRlNRUOHJX6KkUSqYDO4IcPb3dsm6mxe928TP/hjmSJWbNPwU/iWBpjSfoQReJUtSRnf+aID5WuQi77kOVDlADXlDEV4UunX2WjEhcQpj3X/cY9gpfsj5U/333450HQ7yO+1rGGJAMRrKg4vS2mF2Z5ggIWalDwit1V7em9xpo6JY/I8T7VymahaiqgM9SB1Vmr7R+YPiH2elYBkVY5hynasWcVUNCKIwGYSukS2lhLON86KZaG/ercp8CZehvOq69aaWWPu3Csg/VvOyLdlf402DRc/R1lP7LP+oif+SuniNpOyBmP7fpGOeAH/AxxhVjZvT/c41SJCwYpspQ3uHFB9VcrqC3/2AbuNhDSbc/4pCVzOyxsmv/+Kf0n5M3pF8ZzJJES7TP6DMzHblDptZds//rliVIXjXBFpDqWmXVMdCN8ywxbsenHUWRbyAXU3toERbh39AqmpU05Ay54U54EiRN0yZoMshwXqACg3UTipf9/kU9m6uUpr01u4JjON3zxjah6Iv7GHqmt4uTF0YNyg+qSgLauvio6tvTMksUaQORXp3bs7r3wOKBkkmMl+vHHPFpfCgI1Cxf9zjGn0Ch6Fefv15yOaKSMqKSzqrUsuf1kXT4qI2usq7r/HdxB8DcUVf4r7nHu/ubOBcgKlDkh3DXfxyQP9jXLdQHgAAA","ZALOC":"data:image/webp;base64,UklGRgIEAABXRUJQVlA4IPYDAABwFACdASpgABkAPpVGnUslo6KhpWmYsBKJZADOZ5X6bTO8ADbAXZz6AHlk+yRXif3zonPVPs7nGPrj+T/K71G7wdrj/Kfk9wxWVeIvS+zKvHR+Zf4n/ye4R+sX/D7B37K+x7+0ChRmXaPRFhleZExYBrhUk0VtBQbzbh+cqJLNPV5TfWhmX3w0V3mViws0eulyZ2+zEhofmBfmG3y1VJaWF19tgfwjV+9w6hQYAP7SvoIX5bbw3hHOW8DsR/H6tV/hmNiOlncPl5LHtZ5zx7Qy9Abd+P2ync63mMhkejpNGln7MBj83jWXvaYFqP8/6Q8i58DPmsaXlRuXte1+XlWP+xVLB9RkQj07By+pjHSoB8tf0MZzUThiYfZMJNdYCKL2Gzw+LzzhX/8fhnj3RGlPuJoh3o1joXEeDeaW9nGyr/aMyrut8HFv2q0M/4d7npX6LyJnv5p0u/9z+sX9fHYxt4bxwdAQaMbEd+0HT5rHbzIesycXcavzkvZp/jn3JlVofIaIH94oagkfkB8rhMW+J/H/IRAqztTlL9/eta3Xq9fMDFzHWONU1+mFQ5ZZkpY3bi8ecPIDVNuidHRpft4+1QTNoufkNnoYhR+74b8eZ34nySvs86FGtbO4D2VdLeXo/ZT+u9gto321WFTeUJlNy+y8OHy/6/HudGShijVKYGLgzlZfeyStAbZuOGhQYCQGYbmfEuW1SRulAuyiLxJfyFecDnd431UQP5/7XzvGwOjlbhpjxVcXKoTR4ZFtbg9FwJGZTubJGcShcY7wO3BQvLEHmhyHKdMCz7qcEQDIDZM8+fW/h2f5YYSf94NOcjfb5QfD8hcC4ole6FR8DpylOIJgUTKK/3o0s/tcj2PHemYDOg3fSWKkxOwV8gdWrFIAtFwFtiWhUcijwx4ct0nv/wC4duJNE/LSaT/IST+BDrpTHeXxFozLyyZb4BvDDtTiGz2vnUTWIczaGsrFpPAv6vN8TjWPjcuQvp1iWk1XUugrv/mbMzCK+KWeQah5oX8HUslPMR952fE3L1ElzS2KIoov+Y7B5HKb9SZz8qbIFuQPLtcTzxP7v/3/2fjHVFOw7rj6knMXnJog2Snr8aqwVg6S2hBIDVvYOqGCjN33tGtrkbeEjBi2VtDdKNKzQnjFCN/L+PcD30wbwZuPSExH44zCaw+YfP1GeV75IV14m38mkJUcc5z5al44jMiL/+KR3+jYCHck19nXlW/9UVZ13IjlgcHMSbLqgk1BU8IVcbtz/Q1u124xiVoyqFp3v7CgYfeNH1kPMzGu8XNclXV+AM3gniZJHC6VmUYro1jiUGsld5CzsMZKQbiAa6mfnMKUTcAAAAA=","BRAXTON RETAIL":"data:image/webp;base64,UklGRqYFAABXRUJQVlA4IJoFAADQGgCdASpgAD8APpVAmUmlo6IhLBcbuLASiWUA1SV6CI7cbnctNN6MH1QK7C+jeDvhI84e3XpqY751j4zhZ+D+gl/JP8t/QuDfrt6AXd76RvSC1EeqD0Sf9t5UHhJeO+wB+Tf+t/Y/dZ/tfGh+Z/5j2Bv1q341scOR1gsvXoJV2vJf7O9nB9dOaSVeYNpChRB533AY5CN9pj4N9gJnBXwXKcDkaqqZ08ZfibIqwfJv08itKUbc9g9yaB/fGaTrdECRMLBV7Z4BiBr9l7HsMAtvQlADYuyfQFWi3Ua6l3QAAP789AtOa4e655ioGFe/WU1B1pBvOIHXyArkR49JuVounDUu9qASOmrEnTGbUZnD2TgLVTIyCbISXlELTZqnZZ5abwIO2qVooxPqC657PxVJr919DpWhZM0ZmF+WOhJI/2HN+w56grV23bgwt74yrlgGvjpFtVw8L+YbPotuxhj4jnp91CwJ/fVUWjAl+fk6AvaLCFHXd1wt5L8afA++fw1NkiFr6B6S/+7K9dnrpgkGvRxk8TJcUPtnanSq0OlBSpRjeiV+TQEbxKlQMK/2q1aT6zW4QR5fM35v2GCMjD9o7UNvWS4CEWBQMzx/rXlrAqxgg+QmYGgH7HphItjZuq/+cYAWS1XDTvWYMIUOgCpPeyWwlweGAp6yb5rrHfF5RyT/rCrKaiGee1PC/Gzhza/2AJKlWz84v5I+H6BnQ3FL6EnyNL/RngyAo84dywF/j97ktWbXap8dFA0NpW+M0PSSx9ed1ZSifme0cuWusyDLg7HH+Llz6g5Xmxyl5yx5WQVRHKd/00ffokb+aeRW8/48h3FanPu4YhzDJiQ1hqSf8ThiD5Ww+3n8vbxP7eeM4uHVjBLjZX/9Hn+L+QyVD57w7LVYy0pqUmJU+AykFwn0ADtMkvQkw/5fV3UpAb3aQOv42KsSq1YPzfd3CYNv8Nq+PdTFsAqzkI7fmWmyHv9skeN1dkH5en1zFSc+d+b8oHj/YeHG1nxjClv9vC146nx/3nHIwoeCl2Qg1YwRPxpN3SRvLkmk8DJOc5+dVoco4+uDUKRxYbajkPmGp8EJc1D6/uCFkni/mlSCxtjx8VJqLt3Lr69f53x38BMMahcJwzGosejZ41+lCldX1lj3F79QX2mrIaMhOZ97udPMZw0xwyt0Ec73qQ/VS//1HKQ71p6Fo8ITl6JIzOWEDZPbjZX/lSNrM0BnkX9v+hIfjpNcWysmympdonBtrITxfTW3hN2GOtK7fus/Wa6EtEVjawwef3xofoV49TtQ4eSKhM0su8X2No5rw6dHuA+JQfeR0qH6UJmfFvofptglK12Ax6DO0mcxbl5/n/1Fc5xLanjEiAeE+8Y+0HYozj3RO4TOPF56SBdVsprsde61CTvgeDWpigxxPggcRX1EuVOgyxaMtVmBF9lYOmtuHsP0um+mn/b+hpQqajRPo3EnR6MonjE7ROItX8PuenoCCYJl7UhaEpISmm4Sf8Zf4Rj8yxfYR7orbQARIN2O7RKe5I/OPF1/WutaK6NtMe5TldiNOVi7ko+aH6e0KjqgaARKduj5KenOFTo6X7YotOFjPz6go1b9fL33hl+UmaSX72W8Af2skJzg9oTBfp/50m7Lb2Ar2etO2ufB0CiRQ14b9NV3aT/G5R56ruaiOQLAxVd9WBaPSlxouYJI4XL1zbRgtuh0WXKHPaI+icbtr7f1w5EAJTclHQkKysyI3QZCS/lMBMUE/Nz4ipRJKU74p2ji1tIsKNZoB22Qcql2FwSIrMnyvy4SfT+1OJPZJaHWvcne6m4GllaQSSYgwJ5/3ILDCeRnpptbTyktTneX+vSaEad88n/804NqL+ivDwfwNuNmC2ILTD1/znb3IOIteD0INrt8iQccMWvpvXy4AAA=","TRIANGUL INVEST":"data:image/webp;base64,UklGRo4CAABXRUJQVlA4IIICAADwDwCdASpgAGAAPpVEnUolo6KhqPgKKLASiUAayyEazG3ucZtsv//0T2mtKBkdIuHVZ80PyQ/T5RscCUZc4iyDYRRfFyiBajmTZNEHCyDhFkos33t7wvU7wQtaVc2K/EaBhwNkY1tMCSnle3U2JedMBN9F/rLvCLWRZUMSPOggkh20mc5tEM4AAP76kAKtKrfBr3yaJ78e/WU6jb0EoGvfy1sQvv3239k3KH4wr7HpbjpaiOlz3phx+/YhJoruhr4KccTj1tsyNeVv16LdQ8kjfxbu2saKp44dBXysjZvDsjAWLSiQ6yvL/EspVJSG7DgqpUECSlz+Tr/F0Y2tmQkTRAAJWIS3KRt452Z6tZ3DO+c3+LqnLmKDfFvd/lYU8ujV2KjAq9/es4+Leb/egVLTl7UBz0iXM5WGUQxVGI57XKz4Jdg4ZKPcIlSfHQNYhiRs/UoFHMb2+Sa+2MGI1wM7OxcHrVJMDQ8vpYrURfnqtOr2H6ya3tBYGXizo07tbTnNgTLU9pk9NHJ3ZzGHCc8Lh4q9IVfcE0W+oynXj9Y0/hYHKCMGo4hnUxtaBrUIFY8w+uoyByQt7wruCv2QR3NYJnRani+bkBUXAFvTaU/l8ykUYox1MqPQZQpzI2ivBasXl0KkRDvNPO+Lensbxd604Rvu2VsksXTVWTBzY4asbK8KsUp1Q9z5pbhy4sXIq96VWBTheI5hFRfXhvciT2LGFX3gie0cSzsekkaUPWm9nXZV7dL3nvkDTqpuMvhuQq6o8Y5fAHmqdubfGHEyQ6S3iBKCxPvlZYUFDCrDTuDj/15p0n9OKbIuwC7DOO3eCTrbelE3V3iDpqWppB2QsIIAAAA="};
document.querySelectorAll("#partnersGrid .p-card").forEach(function(c){
  var h=c.querySelector("h4"); if(!h) return;
  var d=L[h.textContent.trim().toUpperCase()]; if(!d) return;
  var box=c.querySelector(".logo-box"); if(!box) return;
  box.classList.remove("mono-box");
  var i=document.createElement("img"); i.src=d; i.alt="Logo "+h.textContent.trim();
  box.innerHTML=""; box.appendChild(i);
});
})();

/* --- Videos : un lien valide vers YouTube sur chaque resume --- */
(function(){
var st=document.createElement("style");
st.textContent='.vid .meta .vid-link{display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:12.5px;font-weight:600;color:var(--navy);text-decoration:none;border-top:1px solid var(--line);padding-top:10px;width:100%}'
+'.vid .meta .vid-link:hover{color:var(--coral)}'
+'.vid-note a{color:var(--navy);text-decoration:underline}';
document.head.appendChild(st);
var CH='https://www.youtube.com/@Ligue1';
function go(){
  document.querySelectorAll("#vidGrid .vid").forEach(function(v){
    if(v.__lk)return;
    var img=v.querySelector(".fr img");
    var m=img&&/\/vi\/([\w-]{6,})\//.exec(img.getAttribute("src")||"");
    if(!m)return;
    v.__lk=true;
    var meta=v.querySelector(".meta")||v;
    var a=document.createElement("a");
    a.className="vid-link"; a.href="https://www.youtube.com/watch?v="+m[1];
    a.target="_blank"; a.rel="noopener";
    a.textContent="Voir le résumé sur YouTube ↗";
    meta.appendChild(a);
  });
  var n=document.querySelector(".vid-note");
  if(n&&!n.__lk){n.__lk=true;
    var s=document.createElement("span");
    s.innerHTML=' Chaîne officielle : <a href="'+CH+'" target="_blank" rel="noopener">Ligue 1 McDonald’s</a>.';
    n.appendChild(s);}
}
go();
new MutationObserver(go).observe(document.body,{childList:true,subtree:true});
})();
