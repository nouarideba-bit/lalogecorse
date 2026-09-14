/* --- Ajouts : fond stade, fiches joueurs, vidéos --- */
(function(){
var API="https://www.thesportsdb.com/api/v1/json/3/",PFC="135465";
var STADE="https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Nouveau_Stade_Jean_Bouin%2C_Paris_%28panoramique%29_2014.JPG/1920px-Nouveau_Stade_Jean_Bouin%2C_Paris_%28panoramique%29_2014.JPG";
function e(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML;}

/* 1. Fond d'écran : stade Jean-Bouin */
var st=document.createElement("style");
st.textContent=':root{--hero-img:url("'+STADE+'")}'
+'.hero::before{background-position:50% 62%;opacity:.42}'
+'.credit-photo{font-size:11px;color:var(--on-navy-soft);margin-top:14px}'
+'.credit-photo a{color:inherit;text-decoration:underline}'
+'ul.squad li{cursor:pointer}ul.squad li:hover{background:rgba(84,199,238,.10)}'
+'.pl-modal{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(7,31,75,.55);backdrop-filter:blur(3px)}'
+'.pl-card{background:var(--paper);border-radius:16px;max-width:520px;width:100%;max-height:86vh;overflow:auto;box-shadow:0 24px 60px -20px rgba(7,31,75,.6)}'
+'.pl-hd{display:flex;gap:16px;align-items:center;padding:22px;border-bottom:1px solid var(--line)}'
+'.pl-hd img{width:84px;height:84px;border-radius:50%;object-fit:cover;background:var(--line);flex:0 0 auto}'
+'.pl-hd h3{font-family:"Barlow Condensed";font-weight:800;font-size:26px;text-transform:uppercase;color:var(--navy)}'
+'.pl-hd .sub{font-family:"DM Mono";font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--coral);margin-top:4px}'
+'.pl-close{margin-left:auto;background:none;border:1px solid var(--line);border-radius:999px;width:32px;height:32px;cursor:pointer;color:var(--ink-soft);font-size:16px;line-height:1;flex:0 0 auto}'
+'.pl-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;padding:20px 22px}'
+'.pl-f .k{font-family:"DM Mono";font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-soft)}'
+'.pl-f .v{font-size:14.5px;font-weight:600;color:var(--navy);margin-top:3px}'
+'.pl-bio{padding:0 22px 22px;font-size:13.5px;line-height:1.6;color:var(--ink-soft)}'
+'.vids{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:28px}'
+'.vid{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff}'
+'.vid .fr{position:relative;aspect-ratio:16/9;background:var(--navy);cursor:pointer;max-width:100%}'
+'.vid .fr img{width:100%;height:100%;object-fit:cover}'
+'.vid .fr iframe{width:100%;height:100%;border:0;display:block}'
+'.vid .play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}'
+'.vid .play span{width:54px;height:54px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;color:var(--navy);font-size:19px;padding-left:4px}'
+'.vid .meta{padding:14px 16px}'
+'.vid .meta .t{font-family:"Barlow Condensed";font-weight:700;font-size:18px;text-transform:uppercase;color:var(--navy)}'
+'.vid .meta .d{font-size:12.5px;color:var(--ink-soft);margin-top:2px}'
+'.vid-note{font-size:12.5px;color:var(--ink-soft);margin-top:16px}';
document.head.appendChild(st);

var fb=document.querySelector("footer.site .foot-brand");
if(fb){var cr=document.createElement("p");cr.className="credit-photo";
cr.innerHTML='Photo du Stade Jean-Bouin : Liondartois, <a href="https://creativecommons.org/licenses/by-sa/4.0" target="_blank" rel="noopener">CC BY-SA 4.0</a>, via Wikimedia Commons.';
fb.appendChild(cr);}

/* Postes en français */
var POSFR={"Goalkeeper":"Gardien","Goalkeeping Coach":"Entraîneur des gardiens","Defender":"Défenseur","Centre-Back":"Défenseur central","Center-Back":"Défenseur central","Right-Back":"Arrière droit","Left-Back":"Arrière gauche","Sweeper":"Libéro","Midfielder":"Milieu","Defensive Midfield":"Milieu défensif","Central Midfield":"Milieu central","Attacking Midfield":"Milieu offensif","Left Midfield":"Milieu gauche","Right Midfield":"Milieu droit","Left Wing":"Ailier gauche","Right Wing":"Ailier droit","Left Winger":"Ailier gauche","Right Winger":"Ailier droit","Forward":"Attaquant","Attacker":"Attaquant","Centre-Forward":"Avant-centre","Center-Forward":"Avant-centre","Striker":"Buteur","Second Striker":"Second attaquant","Coach":"Entraîneur","Assistant Coach":"Entraîneur adjoint","Manager":"Manager"};
function POS(v){v=(v||"").trim();return POSFR[v]||v;}
function trPos(){document.querySelectorAll(".pl-pos").forEach(function(el){var t=el.textContent.trim();if(POSFR[t])el.textContent=POSFR[t];});}
if(document.body)new MutationObserver(trPos).observe(document.body,{childList:true,subtree:true});
trPos();

/* 2. Fiche joueur au clic */
var PL={};
function detail(id){
if(PL[id])return Promise.resolve(PL[id]);
return fetch(API+"lookup_all_players.php?id="+id).then(function(r){return r.json();}).then(function(j){
var m={};(j.player||[]).forEach(function(p){m[p.strPlayer]=p;});PL[id]=m;return m;});}
function modal(p){
var w=document.createElement("div");w.className="pl-modal";
var card=document.createElement("div");card.className="pl-card";
var bio=(p.strDescriptionFR||p.strDescriptionEN||"").slice(0,900);
var born=p.dateBorn?new Date(p.dateBorn):null;
var age=born?Math.floor((Date.now()-born.getTime())/31557600000):null;
var fields=[["Poste",POS(p.strPosition)],["Numéro",p.strNumber],["Nationalité",p.strNationality],
["Né le",born?born.toLocaleDateString("fr-FR")+(age?" ("+age+" ans)":""):null],
["Lieu de naissance",p.strBirthLocation],["Taille",p.strHeight],["Poids",p.strWeight],["Statut",p.strStatus]];
var h='<div class="pl-hd">'+(p.strCutout||p.strThumb?'<img src="'+e(p.strCutout||p.strThumb)+'" alt="">':'')
+'<div><h3>'+e(p.strPlayer)+'</h3><div class="sub">'+e(p.strTeam||"")+'</div></div>'
+'<button class="pl-close" aria-label="Fermer">&times;</button></div><div class="pl-grid">';
fields.forEach(function(f){if(f[1])h+='<div class="pl-f"><div class="k">'+e(f[0])+'</div><div class="v">'+e(f[1])+'</div></div>';});
h+='</div>'+(bio?'<div class="pl-bio">'+e(bio)+'</div>':'');
card.innerHTML=h;w.appendChild(card);document.body.appendChild(w);
function close(){w.remove();document.removeEventListener("keydown",esc);}
function esc(ev){if(ev.key==="Escape")close();}
card.querySelector(".pl-close").addEventListener("click",close);
w.addEventListener("click",function(ev){if(ev.target===w)close();});
document.addEventListener("keydown",esc);}
document.addEventListener("click",function(ev){
var li=ev.target.closest?ev.target.closest("ul.squad li"):null;
if(!li)return;
var col=li.closest(".squad-col");if(!col)return;
var nm=li.querySelector(".pl-name");if(!nm)return;
var title=col.querySelector("h4").textContent;
var ids=[PFC];document.querySelectorAll("tr[data-team]").forEach(function(t){var v=t.getAttribute("data-team");if(ids.indexOf(v)<0)ids.push(v);});
(function tryAll(k){
if(k>=ids.length)return;
detail(ids[k]).then(function(m){
if(m[nm.textContent]){modal(m[nm.textContent]);}else{tryAll(k+1);}
}).catch(function(){tryAll(k+1);});
})(title.indexOf("Paris FC")===0?0:1);
});

/* 3. Vidéos des matchs */
var sec=document.createElement("section");
sec.className="section-cream";sec.id="videos";
sec.innerHTML='<div class="wrap section-pad" style="padding-top:0">'
+'<div class="section-head"><span class="eyebrow eyebrow-coral">Temps forts</span>'
+'<h2>Les vidéos<br><span class="accent">des rencontres.</span></h2>'
+'<p>Les résumés officiels des matchs à domicile du Paris FC, publiés après chaque rencontre.</p></div>'
+'<div class="vids" id="vidGrid"><p class="squads-status">Chargement des vidéos…</p></div>'
+'<p class="vid-note">Vidéos publiées par les diffuseurs officiels ; elles apparaissent ici dès leur mise en ligne.</p></div>';
var anchor=document.getElementById("reserver");
if(anchor)anchor.insertAdjacentElement("beforebegin",sec);
var navb=document.querySelector("nav.primary");
if(navb){var a=document.createElement("a");a.className="navlink";a.href="#videos";a.textContent="Vidéos";
var ref=navb.querySelector('a[href="#reserver"]');if(ref)navb.insertBefore(a,ref);else navb.appendChild(a);}
var sty=document.createElement("style");sty.textContent="#videos{scroll-margin-top:96px}";document.head.appendChild(sty);

function ytId(u){var m=/[?&]v=([\w-]{6,})/.exec(u||"")||/youtu\.be\/([\w-]{6,})/.exec(u||"");return m?m[1]:null;}
fetch(API+"eventslast.php?id="+PFC).then(function(r){return r.json();}).then(function(j){
var g=document.getElementById("vidGrid");
var list=(j.results||[]).filter(function(ev){return ytId(ev.strVideo);});
if(!list.length){g.innerHTML='<p class="squads-status">Aucune vidéo disponible pour le moment. Les résumés sont ajoutés après chaque rencontre.</p>';return;}
g.innerHTML="";
list.forEach(function(ev){
var id=ytId(ev.strVideo);
var d=ev.dateEvent?new Date(ev.dateEvent).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):"";
var sc=(ev.intHomeScore!=null&&ev.intAwayScore!=null)?" · "+ev.intHomeScore+"–"+ev.intAwayScore:"";
var card=document.createElement("div");card.className="vid";
card.innerHTML='<div class="fr"><img src="https://i.ytimg.com/vi/'+id+'/hqdefault.jpg" alt="" loading="lazy">'
+'<span class="play"><span>&#9654;</span></span></div>'
+'<div class="meta"><div class="t">'+e(ev.strEvent||"")+'</div><div class="d">'+e(d+sc)+'</div></div>';
var fr=card.querySelector(".fr");
fr.addEventListener("click",function(){
fr.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1" allow="accelerometer;autoplay;clipboard-write;encrypted-media;picture-in-picture" allowfullscreen title="'+e(ev.strEvent||"")+'"></iframe>';});
g.appendChild(card);});
}).catch(function(){
var g=document.getElementById("vidGrid");
if(g)g.innerHTML='<p class="squads-status">Les vidéos ne sont pas accessibles pour le moment.</p>';});
})();
