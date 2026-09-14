(function(){
var C="jeromebrigato@lalogecorse.fr",PFC="135465",API="https://www.thesportsdb.com/api/v1/json/3/";
var F=[["J2","OGC Nice","2026-08-30","dim. 30 août 2026","15h00","133712"],
["J4","Olympique Lyonnais","2026-09-12","sam. 12 sept. 2026","20h45","133713"],
["J5","RC Strasbourg","2026-09-19","sam. 19 sept. 2026","17h15","133882"],
["J7","Stade Rennais FC","2026-10-18","dim. 18 oct. 2026","17h15","133719"],
["J9","AS Monaco","2026-11-01","dim. 1 nov. 2026","17h15","133823"],
["J11","Angers SCO","2026-11-22","dim. 22 nov. 2026","15h00","134709"],
["J13","Le Mans FC","2026-12-05","sam. 5 déc. 2026","18h00","133848"],
["J15","Le Havre AC","2027-01-02","sam. 2 janv. 2027","18h00","133862"],
["J16","Toulouse FC","2027-01-16","sam. 16 janv. 2027","18h00","133703"],
["J18","AJ Auxerre","2027-01-30","sam. 30 janv. 2027","18h00","134788"],
["J20","ESTAC Troyes","2027-02-13","sam. 13 févr. 2027","18h00","134789"],
["J23","Stade Brestois 29","2027-03-06","sam. 6 mars 2027","18h00","133704"],
["J24","FC Lorient","2027-03-13","sam. 13 mars 2027","18h00","133715"],
["J26","Paris Saint-Germain","2027-04-03","sam. 3 avr. 2027","18h00","133714"],
["J29","RC Lens","2027-04-24","sam. 24 avr. 2027","18h00","133822"],
["J31","LOSC Lille","2027-05-08","sam. 8 mai 2027","18h00","133711"],
["J33","Olympique de Marseille","2027-05-22","sam. 22 mai 2027","18h00","133707"]];
var D=[["ELYDAN","https://elydan.eu","",1],["City Sécurité","https://citysecurite.com","",1],
["IE Pro","https://iepro.fr","",1],["Busca (Groupe BME)","https://busca.fr","",1],
["Groupe MC","https://www.mc-groupe.com","",1],
["La Loge Corse & Kalliste Partners","https://www.kalliste-partners.com","Jérôme Brigato",1],
["BME France","https://www.bme-group.com/businesses/bme-france/","Olivier Touchais",1],
["Mederreg","https://mederreg.fr","",1],["Futur Services","https://www.futur-services.fr","",1],
["C.M.E — Climatisation Maintenance Électrique","","",1],["Zaloc","https://zaloc.fr","",1],
["Braxton Retail","https://braxton-im.com","",1],["Aspen Groupe / Marline","https://www.aspengroup.fr","",1],
["Triangul Invest","http://www.triangul.fr","Seyhan Selçuk",0],["EBPS","http://www.ebps.fr","Jean-Luc Torre",0]];
function e(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML;}
var CSS='.cal-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:#fff}table.cal{width:100%;border-collapse:collapse;min-width:640px;font-size:14.5px}table.cal th{font-family:"DM Mono";font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);text-align:left;padding:14px 18px;border-bottom:1px solid var(--line);font-weight:500}table.cal td{padding:13px 18px;border-bottom:1px solid var(--line);vertical-align:middle}table.cal tbody tr:last-child td{border-bottom:none}table.cal .md{font-family:"DM Mono";font-size:12px;color:var(--navy-3)}table.cal .opp{font-family:"Barlow Condensed";font-weight:700;font-size:19px;text-transform:uppercase;color:var(--navy)}table.cal .when{color:var(--ink-soft);font-variant-numeric:tabular-nums}table.cal td.ta-r{text-align:right}.ta-r{text-align:right}.cal-cta{font-size:13px;font-weight:700;color:var(--navy);text-decoration:none;border-bottom:1px solid var(--sky);padding-bottom:2px;white-space:nowrap;background:none;border-left:none;border-right:none;border-top:none;cursor:pointer;font-family:inherit}.cal-cta:hover{color:var(--coral)}.squads-btn{margin-right:14px}tr.is-past{opacity:.42}tr.is-past .cal-cta{display:none}tr.is-past td.ta-r::after{content:"Jouée";font-family:"DM Mono";font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft)}tr.is-next td{background:rgba(84,199,238,.1)}tr.is-next .md::after{content:" · prochaine";color:var(--coral)}.cal-note{font-size:12.5px;color:var(--ink-soft);margin-top:14px}.opp-cell{display:flex;align-items:center;gap:12px}img.crest{width:26px;height:26px;object-fit:contain;flex:0 0 auto}img.crest:not([src]){visibility:hidden}.squads{margin-top:26px;border:1px solid var(--line);border-radius:16px;background:#fff;padding:24px}.squads-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}.squads-head h3{font-family:"Barlow Condensed";font-weight:800;font-size:26px;text-transform:uppercase;color:var(--navy);margin-top:6px}.squads-close{background:none;border:1px solid var(--line);border-radius:999px;padding:7px 15px;cursor:pointer;font-family:"DM Mono";font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-soft)}.squads-body{margin-top:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px}.squad-col h4{font-family:"Barlow Condensed";font-weight:700;font-size:18px;text-transform:uppercase;color:var(--navy);display:flex;align-items:center;gap:9px;padding-bottom:10px;border-bottom:1px solid var(--line)}.squad-col h4 img{width:24px;height:24px;object-fit:contain}.squad-col h4 .cnt{margin-left:auto;font-family:"DM Mono";font-size:10.5px;color:var(--ink-soft)}ul.squad{list-style:none;margin-top:10px;padding:0}ul.squad li{display:flex;align-items:center;gap:11px;padding:7px 0;border-bottom:1px solid var(--line)}ul.squad li:last-child{border-bottom:none}.pl-num{font-family:"DM Mono";font-size:11px;color:var(--navy-3);width:24px;text-align:right;flex:0 0 auto}.pl-photo{width:34px;height:34px;border-radius:50%;object-fit:cover;background:var(--line);flex:0 0 auto}.pl-name{font-size:13.5px;font-weight:600;color:var(--ink)}.pl-pos{margin-left:auto;font-family:"DM Mono";font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-soft)}.squads-status{font-size:13.5px;color:var(--ink-soft)}.invite-form{margin-top:30px}.fs{border:1px solid var(--line);border-radius:14px;background:#fff;padding:22px;margin-bottom:18px}.fs legend{font-family:"DM Mono";font-size:10px;letter-spacing:.11em;text-transform:uppercase;color:var(--navy-3);padding:0 9px;background:#fff}.fgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:15px}.invite-form label{display:flex;flex-direction:column;gap:6px;font-size:12.5px;font-weight:600;color:var(--navy)}.invite-form label.fspan{grid-column:1/-1}.req{color:var(--coral)}.invite-form .lbl{display:inline}.invite-form input,.invite-form select,.invite-form textarea{font:inherit;font-size:14px;font-weight:400;color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:10px 12px;background:var(--paper);width:100%}.invite-form input:focus,.invite-form select:focus,.invite-form textarea:focus{outline:2px solid var(--sky);outline-offset:1px}.invite-form input:user-invalid,.invite-form select:user-invalid{border-color:var(--coral)}.guest{border:1px dashed var(--line);border-radius:12px;padding:16px;margin-bottom:14px;background:var(--paper)}.guest-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.guest-head .gt{font-family:"DM Mono";font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--navy-3)}.guest-del{background:none;border:none;cursor:pointer;font-family:"DM Mono";font-size:10.5px;text-transform:uppercase;color:var(--ink-soft)}.guest-del:hover{color:var(--coral)}.btn-ghost-navy{background:none;border:1px solid var(--navy);color:var(--navy)}label.check{display:flex;flex-direction:row;align-items:flex-start;gap:10px;margin-top:14px;font-weight:400;font-size:12.5px;color:var(--ink-soft);line-height:1.5}label.check input{width:auto;margin-top:2px;flex:0 0 auto}.form-actions{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:6px}.form-note{font-size:12.5px;color:var(--ink-soft);max-width:44ch}.form-error{margin-top:14px;font-size:13px;color:#a32018;background:rgba(233,88,76,.1);border:1px solid rgba(233,88,76,.35);border-radius:9px;padding:11px 14px}ul.dir{list-style:none;border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden;padding:0}.dir-item{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 20px;border-bottom:1px solid var(--line);flex-wrap:wrap}.dir-item:last-child{border-bottom:none}.dir-name{font-family:"Barlow Condensed";font-weight:700;font-size:19px;text-transform:uppercase;color:var(--navy)}.dir-person{display:block;font-size:12.5px;color:var(--ink-soft)}.dir-side{display:flex;align-items:center;gap:16px;margin-left:auto}.dir-link{font-size:13px;color:var(--navy);text-decoration:none;border-bottom:1px solid var(--sky);padding-bottom:2px}.dir-link.none{color:var(--ink-soft);border-bottom-color:transparent}.dir-badge{font-family:"DM Mono";font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--navy-3);background:rgba(84,199,238,.16);padding:4px 8px;border-radius:4px;white-space:nowrap}.dir-badge.pending{color:#8a5a20;background:rgba(233,88,76,.12)}#calendrier,#reserver{scroll-margin-top:96px}';
var s=document.createElement("style");s.textContent=CSS;document.head.appendChild(s);

/* 1. Supprimer l'espace "administrateur" */
document.querySelectorAll("[data-access]").forEach(function(b){b.remove();});
var an=document.getElementById("accessNote");if(an)an.remove();

/* 2. Navigation */
var nav=document.querySelector("nav.primary");
if(nav)nav.innerHTML='<a class="navlink" href="#affiche">Prochaine affiche</a><a class="navlink" href="#calendrier">Calendrier</a><a class="navlink" href="#reserver">Inviter</a><a class="navlink" href="#partenaires">Nos partenaires</a>';
var ha=document.querySelector(".header-actions");
if(ha)ha.innerHTML='<a class="btn btn-sky btn-sm" href="#reserver">Réserver</a>';
var h2=document.querySelector(".hero-ctas");
if(h2)h2.innerHTML='<a href="#calendrier" class="btn btn-sky">Suivre la saison</a><a href="#reserver" class="btn btn-white">Réserver mes invités</a>';
var h3=document.querySelector(".hero-ctas-row2");
if(h3)h3.innerHTML='<a href="#partenaires" class="btn btn-ghost-light">Nos partenaires</a>';

/* 3. Sections calendrier + formulaire */
var rows="",opts="";
F.forEach(function(f){
rows+='<tr data-date="'+f[2]+'" data-md="'+f[0]+'" data-opp="'+e(f[1])+'" data-day="'+e(f[3].replace(/ \d{4}$/,""))+'" data-time="'+f[4]+'" data-team="'+f[5]+'">'
+'<td><span class="md">'+f[0]+'</span></td>'
+'<td><span class="opp-cell"><img class="crest" data-crest="'+PFC+'" alt=""><span class="opp">Paris FC &nbsp;·&nbsp; '+e(f[1])+'</span><img class="crest" data-crest="'+f[5]+'" alt=""></span></td>'
+'<td><span class="when">'+e(f[3])+' — '+f[4]+'</span></td>'
+'<td class="ta-r"><button type="button" class="cal-cta squads-btn" data-team="'+f[5]+'" data-name="'+e(f[1])+'">Effectif</button>'
+'<a class="cal-cta book" href="#reserver" data-fix="'+f[0]+' — Paris FC / '+e(f[1])+' ('+e(f[3])+')">Réserver</a></td></tr>';
opts+='<option>'+f[0]+' — Paris FC / '+e(f[1])+' ('+e(f[3])+' — '+f[4]+')</option>';
});
var dir="";
D.forEach(function(d){
dir+='<li class="dir-item"><div><span class="dir-name">'+e(d[0])+'</span>'+(d[2]?'<span class="dir-person">'+e(d[2])+'</span>':'')+'</div>'
+'<div class="dir-side">'+(d[1]?'<a class="dir-link" href="'+e(d[1])+'" target="_blank" rel="noopener">'+e(d[1].replace(/^https?:\/\//,"").replace(/\/$/,""))+'</a>':'<span class="dir-link none">Site à confirmer</span>')
+'<span class="dir-badge'+(d[3]?'':' pending')+'">'+(d[3]?"Confirmé":"En attente")+'</span></div></li>';
});
var html='<section class="section-cream" id="calendrier"><div class="wrap section-pad" style="padding-top:0">'
+'<div class="section-head"><span class="eyebrow eyebrow-navy">Ligue 1 McDonald’s · Stade Jean-Bouin</span>'
+'<h2>Les 17 affiches<br><span class="accent">de la saison.</span></h2>'
+'<p>Toutes les rencontres à domicile du Paris FC en 2026/2027. Ouvrez un effectif ou demandez vos places.</p></div>'
+'<div class="cal-wrap"><table class="cal"><thead><tr><th>Journée</th><th>Affiche</th><th>Date</th><th class="ta-r">Invitations</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
+'<p class="cal-note">Dates et horaires communiqués par le club, susceptibles d’évoluer.</p>'
+'<div id="squads" class="squads" hidden><div class="squads-head"><div><span class="eyebrow eyebrow-coral">Groupes complets</span><h3 id="sqT">Effectifs</h3></div>'
+'<button type="button" class="squads-close" id="sqX">Fermer</button></div><div id="sqB" class="squads-body"></div>'
+'<p class="cal-note">Effectifs et photos fournis par TheSportsDB.</p></div></div></section>'
+'<section class="section-cream" id="reserver"><div class="wrap section-pad" style="padding-top:0">'
+'<div class="section-head"><span class="eyebrow eyebrow-coral">Demande d’invitation</span>'
+'<h2>Inscrivez<br><span class="accent">vos invités.</span></h2>'
+'<p>Chaque partenaire peut inviter jusqu’à 4 personnes. Le nom, le prénom, l’e-mail et le téléphone de chaque invité sont obligatoires pour pré-valider la demande.</p></div>'
+'<form class="invite-form" id="iF" method="post" action="invitation.php">'
+'<fieldset class="fs"><legend>Le partenaire</legend><div class="fgrid">'
+'<label><span class="lbl">Société <span class="req">*</span></span><input name="societe" required></label>'
+'<label><span class="lbl">Votre nom et prénom <span class="req">*</span></span><input name="referent" required></label>'
+'<label><span class="lbl">Votre e-mail <span class="req">*</span></span><input type="email" name="referent_email" required></label>'
+'<label><span class="lbl">Votre téléphone <span class="req">*</span></span><input type="tel" name="referent_tel" required></label>'
+'<label class="fspan"><span class="lbl">Match souhaité <span class="req">*</span></span><select name="match" id="mSel" required><option value="">— Choisissez une affiche —</option>'+opts+'</select></label>'
+'</div></fieldset>'
+'<fieldset class="fs"><legend>Vos invités (1 à 4)</legend><div id="gW"></div>'
+'<button type="button" class="btn btn-ghost-navy btn-sm" id="gAdd">Ajouter un invité</button></fieldset>'
+'<fieldset class="fs"><legend>Précisions</legend>'
+'<label class="fspan">Message (facultatif)<textarea name="message" rows="3"></textarea></label>'
+'<label class="check"><input type="checkbox" name="consent" required><span>J’atteste avoir l’accord de mes invités pour transmettre leurs coordonnées à La Loge Corse. <span class="req">*</span></span></label></fieldset>'
+'<div class="form-actions"><button type="submit" class="btn btn-sky">Envoyer la demande</button>'
+'<p class="form-note">Demande envoyée à <a href="mailto:'+C+'">'+C+'</a> pour pré-validation.</p></div>'
+'<p class="form-error" id="fE" hidden></p></form></div></section>';
var pt=document.getElementById("partenaires");
if(pt)pt.insertAdjacentHTML("beforebegin",html);
var pg=document.getElementById("partnersGrid");
if(pg)pg.insertAdjacentHTML("afterend",'<div class="section-head" style="margin-top:56px"><span class="eyebrow eyebrow-navy">Annuaire complet</span><h2 style="font-size:clamp(28px,3.6vw,40px)">Tous nos partenaires.</h2><p>L’ensemble des sociétés associées à La Loge Corse, avec leur site officiel.</p></div><ul class="dir">'+dir+'</ul>');

/* 4. Prochaine affiche */
var today=new Date();today.setHours(0,0,0,0),nx=null;
document.querySelectorAll("#calendrier tbody tr").forEach(function(tr){
var d=new Date(tr.getAttribute("data-date"));
if(!nx&&d>=today){nx=tr;tr.className="is-next";}else if(d<today)tr.className="is-past";});
if(nx){
var q=function(s){return document.querySelector(s);};
var o=q(".ticket .vs-word");if(o)o.textContent="vs "+nx.getAttribute("data-opp");
var eb=q(".ticket .eyebrow");if(eb)eb.textContent="Prochaine affiche · "+nx.getAttribute("data-md");
var vs=document.querySelectorAll(".ticket .meta-grid .value")[0];
if(vs){vs.textContent="";vs.appendChild(document.createTextNode(nx.getAttribute("data-day")));vs.appendChild(document.createElement("br"));vs.appendChild(document.createTextNode(nx.getAttribute("data-time")));}
var ci=document.querySelectorAll(".ticket .crest-vs img");
if(ci&&ci[1]){ci[1].className="crest";ci[1].setAttribute("data-crest",nx.getAttribute("data-team"));ci[1].removeAttribute("src");ci[1].style.width="46px";ci[1].style.height="46px";}
}

/* 5. Écussons + effectifs */
var B={},S={};
function badge(id){
if(B[id])return Promise.resolve(B[id]);
try{var h=JSON.parse(localStorage.getItem("lcb"+id)||"null");if(h&&Date.now()-h.t<864e5){B[id]=h.u;return Promise.resolve(h.u);}}catch(x){}
return fetch(API+"lookupteam.php?id="+id).then(function(r){return r.json();}).then(function(j){
var u=((j.teams||[])[0]||{}).strBadge||"";B[id]=u;
try{localStorage.setItem("lcb"+id,JSON.stringify({u:u,t:Date.now()}));}catch(x){}
return u;}).catch(function(){return"";});}
var want={};document.querySelectorAll("img.crest[data-crest]").forEach(function(i){want[i.getAttribute("data-crest")]=1;});
Object.keys(want).forEach(function(id){badge(id).then(function(u){if(u)document.querySelectorAll('img.crest[data-crest="'+id+'"]').forEach(function(i){i.src=u;});});});
function squad(id){
if(S[id])return Promise.resolve(S[id]);
return fetch(API+"lookup_all_players.php?id="+id).then(function(r){return r.json();}).then(function(j){
S[id]=(j.player||[]).map(function(p){return{n:p.strPlayer,u:p.strNumber||"",po:p.strPosition||"",im:p.strCutout||p.strThumb||""};});return S[id];});}
function col(name,id,l){
var w=document.createElement("div");w.className="squad-col";
var h=document.createElement("h4"),im=document.createElement("img");im.alt="";if(B[id])im.src=B[id];
h.appendChild(im);h.appendChild(document.createTextNode(name));
var c=document.createElement("span");c.className="cnt";c.textContent=l.length?l.length+" joueurs":"";h.appendChild(c);w.appendChild(h);
if(!l.length){var p=document.createElement("p");p.className="squads-status";p.textContent="Effectif non disponible.";w.appendChild(p);return w;}
var u=document.createElement("ul");u.className="squad";
l.forEach(function(p){var li=document.createElement("li");
var a=document.createElement("span");a.className="pl-num";a.textContent=p.u;
var b=document.createElement("img");b.className="pl-photo";b.alt="";b.loading="lazy";if(p.im)b.src=p.im;
var c2=document.createElement("span");c2.className="pl-name";c2.textContent=p.n;
var d=document.createElement("span");d.className="pl-pos";d.textContent=p.po;
li.appendChild(a);li.appendChild(b);li.appendChild(c2);li.appendChild(d);u.appendChild(li);});
w.appendChild(u);return w;}
var pn=document.getElementById("squads"),bd=document.getElementById("sqB"),tt=document.getElementById("sqT");
document.querySelectorAll(".squads-btn").forEach(function(b){
b.addEventListener("click",function(){
var id=b.getAttribute("data-team"),nm=b.getAttribute("data-name");
pn.hidden=false;tt.textContent="Paris FC · "+nm;bd.innerHTML='<p class="squads-status">Chargement…</p>';
pn.scrollIntoView({behavior:"smooth",block:"start"});
Promise.all([badge(PFC),badge(id),squad(PFC),squad(id)]).then(function(r){
bd.innerHTML="";bd.appendChild(col("Paris FC",PFC,r[2]));bd.appendChild(col(nm,id,r[3]));})
.catch(function(){bd.innerHTML='<p class="squads-status">Effectifs indisponibles pour le moment.</p>';});});});
var x=document.getElementById("sqX");if(x)x.addEventListener("click",function(){pn.hidden=true;});

/* 6. Formulaire */
var fm=document.getElementById("iF"),gw=document.getElementById("gW"),ga=document.getElementById("gAdd"),ms=document.getElementById("mSel"),fe=document.getElementById("fE"),n=0;
function fld(lb,tp,nm,i,ac){
var l=document.createElement("label");
var sp=document.createElement("span");sp.className="lbl";sp.appendChild(document.createTextNode(lb+" "));
var r=document.createElement("span");r.className="req";r.textContent="*";sp.appendChild(r);l.appendChild(sp);
var inp=document.createElement("input");inp.type=tp;inp.name="invite"+i+"_"+nm;inp.required=true;if(ac)inp.autocomplete=ac;
l.appendChild(inp);return l;}
function ren(){gw.querySelectorAll(".guest").forEach(function(g,i){g.querySelector(".gt").textContent="Invité "+(i+1);});
ga.disabled=gw.querySelectorAll(".guest").length>=4;ga.style.opacity=ga.disabled?.45:1;}
function add(){
if(gw.querySelectorAll(".guest").length>=4)return;n++;
var g=document.createElement("div");g.className="guest";
var hd=document.createElement("div");hd.className="guest-head";
var t=document.createElement("span");t.className="gt";hd.appendChild(t);
var dl=document.createElement("button");dl.type="button";dl.className="guest-del";dl.textContent="Retirer";
dl.addEventListener("click",function(){if(gw.querySelectorAll(".guest").length>1){g.remove();ren();}});
hd.appendChild(dl);g.appendChild(hd);
var gr=document.createElement("div");gr.className="fgrid";
gr.appendChild(fld("Nom","text","nom",n,"family-name"));
gr.appendChild(fld("Prénom","text","prenom",n,"given-name"));
gr.appendChild(fld("E-mail","email","email",n,"email"));
gr.appendChild(fld("Téléphone","tel","tel",n,"tel"));
g.appendChild(gr);gw.appendChild(g);ren();}
if(ga){ga.addEventListener("click",add);add();}
document.querySelectorAll(".book").forEach(function(b){b.addEventListener("click",function(){
var lb=b.getAttribute("data-fix").split(" (")[0];
for(var i=0;i<ms.options.length;i++){if(ms.options[i].value.indexOf(lb)===0){ms.selectedIndex=i;break;}}});});
if(fm)fm.addEventListener("submit",function(ev){
fe.hidden=true;
if(!fm.checkValidity()){ev.preventDefault();fe.hidden=false;
fe.textContent="Merci de compléter tous les champs obligatoires : pour chaque invité, le nom, le prénom, l’e-mail et le téléphone sont requis.";
var b=fm.querySelector(":invalid");if(b){b.focus();b.scrollIntoView({behavior:"smooth",block:"center"});}}});
})();
