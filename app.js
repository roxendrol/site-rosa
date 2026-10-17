const LOGO='/logo.png',CFG={wa:'5551998894537',ig:'royalbeauty_poa'};
const S={cfg:CFG,cats:[{id:'perf',name:'Perfumaria 🌸'},{id:'acc',name:'Acessórios 🎀'},{id:'kit',name:'Kits & Buquês 💐'}],prods:[
{id:'p1',name:'Perfume Only You 30ml',price:0,promo:0,cat:'perf',img:'/img/p1.jpg'},
{id:'p2',name:'Body Splash Coração Baby Collection',price:0,promo:0,cat:'perf',img:'/img/p2.jpg'},
{id:'p3',name:'Escova Hello Kitty',price:0,promo:0,cat:'acc',img:'/img/p3.jpg'},
{id:'p4',name:'Buquê Hello Kitty',price:0,promo:0,cat:'kit',img:'/img/p4.jpg'}]};
let setup=true;
const api=async(p,o={})=>{const x=await fetch('/api/'+p,{...o,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:o.body?JSON.stringify(o.body):undefined});let j=null;try{j=await x.json()}catch{}if(!x.ok)throw new Error((j&&j.error)||'Erro de conexão');return j};
const $=s=>document.querySelector(s),app=$('#app'),modal=$('#modal');
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brl=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const uid=()=>Math.random().toString(36).slice(2,9);
let view='shop',cat='all',authed=false,dirty=false,toast='';
const waLink=t=>'https://wa.me/'+S.cfg.wa+'?text='+encodeURIComponent(t);
const WAI='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.300 1.200-1.800 1.200-.5.1-1 .2-3.300-.7-2.800-1.200-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500l.8 2c.1.200.1.400 0 .5l-.4.600-.4.400c-.1.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.100 1 2.100 1.300 2.400 1.400.3.100.5.100.6-.1l.8-1c.2-.3.400-.2.700-.1l1.900.9c.3.100.5.200.5.300.1.200.1.700-.1 1.200z"/></svg>';
function final(p){return p.promo>0&&p.promo<p.price?p.promo:p.price}
function priceHTML(p){if(!p.price)return'<span class="pr">Consulte o valor</span>';return p.promo>0&&p.promo<p.price?`<span class="pr"><s>${brl(p.price)}</s>${brl(p.promo)}</span>`:`<span class="pr">${brl(p.price)}</span>`}
function shop(){
const list=S.prods.filter(p=>cat==='all'||p.cat===cat);
app.innerHTML=`<header><div class="glass hero"><img class="logo" src="${LOGO}" alt="Royal Beauty"><h1>Bem-vinda ao seu mundo rosa 💖</h1><p>Gloss • Skin Care • Body Care</p>
<div class="row" style="justify-content:center"><a class="btn wa" style="flex:none" target="_blank" rel="noopener" href="${waLink('Oi! Vi seu site da Royal Beauty e queria saber mais sobre os produtos. Sou de ')}">${WAI} Chamar no WhatsApp</a></div></div></header>
<main><div class="chips"><button class="chip ${cat==='all'?'on':''}" data-c="all">Tudo ✨</button>${S.cats.map(c=>`<button class="chip ${cat===c.id?'on':''}" data-c="${c.id}">${esc(c.name)}</button>`).join('')}</div>
<div class="grid">${list.map((p,i)=>`<article class="glass card" style="animation-delay:${i*.07}s"><div class="ph"><img class="pi" src="${p.img}" alt="${esc(p.name)}" loading="lazy">${p.promo>0&&p.promo<p.price?`<span class="tag">-${Math.round(100-p.promo/p.price*100)}% OFF</span>`:''}</div><div class="bd"><h3>${esc(p.name)}</h3>${priceHTML(p)}<button class="btn" data-w="${p.id}">${WAI} Quero esse!</button></div></article>`).join('')||'<p>Nenhum produto nesta categoria ainda 💕</p>'}</div></main>
<footer><div class="glass" style="padding:18px"><b>Siga a gente ✦</b><p><a target="_blank" rel="noopener" href="https://instagram.com/${S.cfg.ig}">@${S.cfg.ig}</a></p><a class="btn wa sm" target="_blank" rel="noopener" href="${waLink('Oi! Vi o site da Royal Beauty e quero fazer um pedido. Sou de ')}">${WAI} Fazer pedido</a><br><button class="adm" id="adm">Área do administrador</button></div></footer>
<a class="btn wa fab" aria-label="WhatsApp" target="_blank" rel="noopener" href="${waLink('Oi! Vi seu site da Royal Beauty. Sou de ')}">${WAI}</a>`;
app.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{cat=b.dataset.c;shop()});
app.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>ask(S.prods.find(p=>p.id===b.dataset.w)));
$('#adm').onclick=()=>{view='admin';render()};}
function ask(p){modal.innerHTML=`<div class="ov"><div class="glass box"><h2>Quase lá 💕</h2><p>Você escolheu <b>${esc(p.name)}</b>. De onde você é?</p><input id="city" placeholder="Sua cidade / bairro" autocomplete="address-level2"><div class="row"><button class="btn ghost sm" id="x">Cancelar</button><button class="btn wa sm" id="go">${WAI} Enviar</button></div></div></div>`;
$('#x').onclick=()=>modal.innerHTML='';$('#go').onclick=()=>{const c=$('#city').value.trim()||'(não informado)';const pr=p.price?' ('+brl(final(p))+')':'';window.open(waLink(`Oi, vi seu site e me interessei pelo produto ${p.name}${pr}. Sou de ${c}.`),'_blank','noopener');modal.innerHTML=''}}
async function gate(){
const first=!setup;
app.innerHTML=`<main><div class="adm-wrap"><div class="glass box" style="margin:30px auto"><img class="logo" style="width:110px;display:block;margin:0 auto" src="${LOGO}" alt=""><h2>${first?'Criar acesso de administrador':'Entrar'}</h2>
<label>E-mail</label><input id="em" type="email" autocomplete="username"><label>Senha ${first?'(mín. 10 caracteres)':''}</label><input id="pw" type="password" autocomplete="${first?'new-password':'current-password'}">
${first?'<label>Código de configuração (definido na Vercel)</label><input id="ky" type="password" autocomplete="off">':''}<p class="msg" id="er"></p><button class="btn" id="ok" style="width:100%">${first?'Cadastrar e entrar':'Entrar'}</button>
<p style="text-align:center"><button class="adm" id="bk">← Voltar para a loja</button></p></div></div></main>`;
$('#bk').onclick=()=>{view='shop';render()};
$('#ok').onclick=async()=>{const er=$('#er');er.textContent='';try{await api(first?'setup':'login',{method:'POST',body:{email:$('#em').value,password:$('#pw').value,key:first?$('#ky').value:''}});authed=true;setup=true;render()}catch(e){er.textContent=e.message}}}
function img(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=async()=>{try{const m=900,s=Math.min(1,m/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);res((await api('upload',{method:'POST',body:{data:c.toDataURL('image/jpeg',.75)}})).url)}catch(e){rej(e)}};i.onerror=rej;i.src=r.result};r.onerror=rej;r.readAsDataURL(file)})}
function panel(){
app.innerHTML=`<main><div class="adm-wrap"><div class="row" style="margin-bottom:10px"><button class="btn ghost sm" id="bk">← Voltar para a loja</button><button class="btn ghost sm" id="lo">Sair</button><button class="btn sm" id="pub">${dirty?'Salvar alterações ✦':'Salvo ✓'}</button></div>${toast?`<p class="msg">${toast}</p>`:''}
<div class="glass it"><h2>Categorias</h2>${S.cats.map(c=>`<div class="row"><input data-cn="${c.id}" value="${esc(c.name)}"><button class="btn red sm" style="flex:none" data-cd="${c.id}">Excluir</button></div>`).join('')}<div class="row"><input id="nc" placeholder="Nova categoria"><button class="btn sm" style="flex:none" id="ac">Adicionar</button></div></div>
<div class="row" style="margin:14px 0"><h2 style="flex:3">Produtos</h2><button class="btn sm" id="ap">+ Produto</button></div>
${S.prods.map(p=>`<div class="glass it" data-p="${p.id}"><div class="row"><img src="${p.img}" alt=""><div><label class="btn ghost sm" style="display:block;text-align:center">📷 Trocar foto<input type="file" accept="image/*" data-f="${p.id}" hidden></label></div></div>
<label>Nome</label><input data-k="name" value="${esc(p.name)}"><div class="row"><div><label>Preço (R$)</label><input data-k="price" inputmode="decimal" value="${p.price||''}" placeholder="0,00"></div><div><label>Promoção (R$)</label><input data-k="promo" inputmode="decimal" value="${p.promo||''}" placeholder="vazio = sem promo"></div></div>
<label>Categoria</label><select data-k="cat">${S.cats.map(c=>`<option value="${c.id}" ${c.id===p.cat?'selected':''}>${esc(c.name)}</option>`).join('')}</select><button class="btn red sm" data-d="${p.id}">Excluir produto</button></div>`).join('')}</div></main>`;
const mark=()=>{dirty=true;toast='';const b=$('#pub');b.textContent='Salvar alterações ✦'};
$('#bk').onclick=()=>{view='shop';render()};
$('#pub').onclick=publish;$('#lo').onclick=async()=>{try{await api('logout',{method:'POST'})}catch{}authed=false;view='shop';render()};
app.querySelectorAll('[data-cn]').forEach(i=>i.onchange=()=>{S.cats.find(c=>c.id===i.dataset.cn).name=i.value.trim()||'Categoria';mark()});
app.querySelectorAll('[data-cd]').forEach(b=>b.onclick=()=>{if(S.cats.length<2||!confirm('Excluir categoria? Os produtos vão para outra categoria.'))return;const id=b.dataset.cd;S.cats=S.cats.filter(c=>c.id!==id);S.prods.forEach(p=>{if(p.cat===id)p.cat=S.cats[0].id});dirty=true;panel()});
$('#ac').onclick=()=>{const v=$('#nc').value.trim();if(v){S.cats.push({id:uid(),name:v});dirty=true;panel()}};
$('#ap').onclick=()=>{S.prods.unshift({id:uid(),name:'Novo produto',price:0,promo:0,cat:S.cats[0].id,img:LOGO});dirty=true;panel()};
app.querySelectorAll('[data-p]').forEach(card=>{const p=S.prods.find(x=>x.id===card.dataset.p);
card.querySelectorAll('[data-k]').forEach(i=>i.onchange=()=>{const k=i.dataset.k;p[k]=(k==='price'||k==='promo')?(parseFloat(String(i.value).replace(',','.'))||0):i.value;mark()});
card.querySelector('[data-f]').onchange=async e=>{const f=e.target.files[0];if(f){try{p.img=await img(f);dirty=true}catch(er){toast=er.message}panel()}};
card.querySelector('[data-d]').onclick=()=>{if(confirm('Excluir este produto?')){S.prods=S.prods.filter(x=>x!==p);dirty=true;panel()}}})}
async function publish(){try{await api('store',{method:'PUT',body:{cats:S.cats,prods:S.prods}});dirty=false;toast='Salvo! Já está no ar ✨'}catch(e){toast=e.message}panel()}
function render(){window.scrollTo(0,0);if(view==='shop')shop();else if(!authed)gate();else panel()}

(async()=>{view=location.hash==='#admin'?'admin':'shop';
try{const s=await api('store');if(s&&s.prods){S.cats=s.cats;S.prods=s.prods}}catch{}
try{const m=await api('me');authed=m.authed;setup=m.setup}catch{}
render()})();
