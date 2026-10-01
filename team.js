/* La Doña Santa company map: the ecosystem diagram (brochure p.43), each entity's team, and full profiles.
   Used by contact.html (clients) and private-contact.html (business-card access).
   Mount: <div class="eco" id="eco" data-mode="client|card"></div> then load team-data.js and team.js.
   In "card" mode each profile offers "Write to ..." which fills the Executive Inquiry form (#inqRecipient). */
(()=>{
  const T=window.LDS_TEAM, root=document.getElementById('eco'); if(!T||!root) return;
  const mode=root.dataset.mode||'client';
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const initials=n=>n.split(/\s+/).filter(w=>/^[A-ZÀ-Ž]/.test(w)).slice(0,2).map(w=>w[0]).join('');
  const ent=k=>T.entities.find(e=>e.key===k);

  /* ---------- diagram ---------- */
  const node=(e,top)=>`
    <button type="button" class="eco-ent${top?' eco-top':''}" role="tab" id="eco-tab-${e.key}" data-ent="${e.key}" aria-controls="eco-panel" aria-selected="false" tabindex="-1">
      <img src="${e.logo}" alt="${esc(e.name)}" width="440" height="330">
      ${top?'':`<span class="eco-tag">${e.tag.map(esc).join(' · ')}</span><span class="eco-desc">${esc(e.desc)}</span>`}
      <span class="eco-see">View ${esc(e.team.toLowerCase())}</span>
    </button>`;
  const g=ent('group');
  root.innerHTML=`
    <h2 class="eco-title">La Doña Santa Ecosystem</h2>
    <div class="eco-diagram" role="tablist" aria-label="La Doña Santa ecosystem">
      <p class="eco-place">Dubai</p>
      <div class="eco-groupwrap">
        <p class="eco-tag eco-side">${g.tag.map(esc).join(' · ')}</p>
        ${node(g,true)}
        <p class="eco-desc eco-side">${esc(g.desc)}</p>
      </div>
      <div class="eco-branch" aria-hidden="true"><span></span></div>
      <p class="eco-place">Thailand</p>
      <div class="eco-row">${['guardian','ark','holding'].map(k=>node(ent(k))).join('')}</div>
    </div>
    <div class="eco-panel" id="eco-panel" role="tabpanel" aria-live="polite"></div>`;

  /* ---------- team panel ---------- */
  function personCard(k,role,abbr){ const p=T.people[k];
    const av=p.avatar?`<img class="eco-av" src="${p.avatar}" alt="" loading="lazy" width="120" height="120">`:`<span class="eco-av eco-mono">${initials(p.name)}</span>`;
    return `<button type="button" class="eco-person" data-person="${k}" data-role="${esc(role)}">${av}
      <span class="eco-pt"><span class="eco-pn">${esc(p.name)}</span><span class="eco-pr">${esc(role)}</span>${abbr?`<span class="eco-ab">${esc(abbr)}</span>`:''}</span></button>`; }
  function orgCard(k){ const o=T.orgs[k];
    const mark=o.logo?`<img class="eco-av eco-logo" src="${o.logo}" alt="" loading="lazy">`:`<span class="eco-av eco-mono">${esc(o.mono||o.name[0])}</span>`;
    return `<button type="button" class="eco-person eco-org" data-org="${k}">${mark}
      <span class="eco-pt"><span class="eco-pn">${esc(o.name)}</span><span class="eco-pr">${esc(o.kind)}</span></span></button>`; }
  function showEntity(key, focus){
    T.entities.forEach(e=>{ const b=root.querySelector(`[data-ent="${e.key}"]`); const on=e.key===key;
      b.setAttribute('aria-selected',on); b.tabIndex=on?0:-1; if(on&&focus) b.focus(); });
    const e=ent(key), panel=document.getElementById('eco-panel');
    panel.setAttribute('aria-labelledby','eco-tab-'+key);
    panel.innerHTML=`
      <div class="eco-phead"><p class="eco-kicker">${esc(e.name)}${e.key==='group'?'':' Co., Ltd.'}</p><h3>${esc(e.team)}</h3></div>
      <div class="eco-grid">${e.people.map(([k,r,a])=>personCard(k,r,a)).join('')}</div>
      ${e.orgs.length?`<p class="eco-sub">${e.key==='guardian'?'Clinical network':e.key==='ark'?'Exclusive partnership':'Departments & partners'}</p>
        <div class="eco-grid">${e.orgs.map(orgCard).join('')}</div>`:''}
      ${e.units.length?`<p class="eco-sub">${e.key==='holding'?'Responsibilities':'Teams'}</p>
        <ul class="eco-units">${e.units.map(u=>`<li>${esc(u)}</li>`).join('')}</ul>`:''}`;
    panel.classList.remove('eco-in'); void panel.offsetWidth; panel.classList.add('eco-in');
  }
  root.querySelectorAll('[data-ent]').forEach((b,i,all)=>{
    b.addEventListener('click',()=>{ showEntity(b.dataset.ent); if(innerWidth<860) document.getElementById('eco-panel').scrollIntoView({behavior:'smooth',block:'start'}); });
    b.addEventListener('keydown',ev=>{ const order=['group','guardian','ark','holding']; const i=order.indexOf(b.dataset.ent);
      const step={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[ev.key];
      if(step){ ev.preventDefault(); showEntity(order[(i+step+order.length)%order.length],true); } });
  });
  showEntity('group');

  /* ---------- profile ---------- */
  const modal=document.createElement('div');
  modal.className='eco-modal'; modal.hidden=true;
  modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-labelledby','eco-m-name');
  modal.innerHTML=`<div class="eco-sheet"><button type="button" class="eco-x" aria-label="Close profile">&#x2715;</button>
    <div class="eco-photo"></div><div class="eco-body"></div></div>`;
  document.body.appendChild(modal);
  const sheet=modal.querySelector('.eco-sheet'), photo=modal.querySelector('.eco-photo'), body=modal.querySelector('.eco-body');
  let back=null;
  function rolesOf(k){ return T.entities.flatMap(e=>e.people.filter(p=>p[0]===k).map(p=>({ent:e.short, role:p[1]}))); }
  function open(html, img, wide){
    back=document.activeElement;
    photo.innerHTML=img||''; photo.hidden=!img; sheet.classList.toggle('eco-noimg',!img); sheet.classList.toggle('eco-wide',!!wide);
    body.innerHTML=html; sheet.scrollTop=0; body.scrollTop=0;
    modal.hidden=false; document.documentElement.classList.add('eco-lock');
    requestAnimationFrame(()=>modal.classList.add('on')); modal.querySelector('.eco-x').focus();
    const w=body.querySelector('.eco-write'); if(w) w.addEventListener('click',ev=>{ ev.preventDefault(); close();
      const sel=document.getElementById('inqRecipient'); if(sel){ sel.value=w.dataset.to; sel.dispatchEvent(new Event('change',{bubbles:true})); }
      const f=document.getElementById('inquiry'); if(f){ f.scrollIntoView({behavior:'smooth',block:'start'}); setTimeout(()=>{ const n=document.getElementById('inqName'); if(n) n.focus({preventScroll:true}); },700); } });
  }
  function close(){ modal.classList.remove('on'); document.documentElement.classList.remove('eco-lock');
    setTimeout(()=>{ modal.hidden=true; },300); if(back&&back.focus) back.focus({preventScroll:true}); }
  function openPerson(k, role){ const p=T.people[k], roles=rolesOf(k);
    const writeTo=mode==='card'?`<a class="eco-write" href="#inquiry" data-to="${esc(p.name)}">Write to ${esc(k==='ic'?'the Investment Committee':p.name.split(' ')[0])}</a>`:'';
    open(`
      <p class="eco-kicker">${roles.map(r=>esc(r.ent)).filter((v,i,a)=>a.indexOf(v)===i).join(' · ')}</p>
      <h3 id="eco-m-name">${esc(p.name)}</h3>
      <p class="eco-role">${esc(p.title||role||roles[0].role)}</p>
      ${new Set(roles.map(r=>r.role)).size>1?`<ul class="eco-roles">${roles.map(r=>`<li><b>${esc(r.ent)}</b>${esc(r.role)}</li>`).join('')}</ul>`:''}
      ${p.resp.length?`<ul class="eco-resp">${p.resp.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>`:''}
      ${p.bio.length?`<div class="eco-bio">${p.bio.map(t=>`<p>${esc(t)}</p>`).join('')}</div>`:'<p class="eco-pending">Full profile to follow.</p>'}
      ${writeTo}`,
      p.photo?`<img src="${p.photo}" alt="${esc(p.name)}">`:'', k==='luca');
  }
  function openOrg(k){ const o=T.orgs[k];
    open(`
      <p class="eco-kicker">${esc(o.kind)}</p><h3 id="eco-m-name">${esc(o.name)}</h3>
      ${o.facts?`<dl class="eco-facts">${o.facts.map(([a,b])=>`<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>`:''}
      ${o.body.length?`<div class="eco-bio">${o.body.map(t=>`<p>${esc(t)}</p>`).join('')}</div>`:''}
      ${o.people?`<p class="eco-sub">Key people</p><ul class="eco-roles">${o.people.map(([n,t])=>`<li><b>${esc(n)}</b>${esc(t)}</li>`).join('')}</ul>`:''}
      ${o.list?`<p class="eco-sub">${esc(o.listTitle)}</p><ul class="eco-resp">${o.list.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
      ${mode==='card'?`<a class="eco-write" href="#inquiry" data-to="${esc(o.name)}">Write to ${esc(o.name)}</a>`:''}`,
      o.logo?`<img class="eco-orglogo" src="${o.logo}" alt="${esc(o.name)}">`:'');
  }
  root.addEventListener('click',ev=>{ const b=ev.target.closest('[data-person],[data-org]'); if(!b) return;
    if(b.dataset.person) openPerson(b.dataset.person,b.dataset.role); else openOrg(b.dataset.org); });
  modal.querySelector('.eco-x').addEventListener('click',close);
  modal.addEventListener('click',ev=>{ if(ev.target===modal) close(); });
  addEventListener('keydown',ev=>{ if(modal.hidden) return;
    if(ev.key==='Escape') close();
    if(ev.key==='Tab'){ const f=[...modal.querySelectorAll('button,a[href]')]; const i=f.indexOf(document.activeElement);
      ev.preventDefault(); f[(i+(ev.shiftKey?-1:1)+f.length)%f.length].focus(); } });

  /* recipients for the Executive Inquiry select (card mode) */
  const sel=document.getElementById('inqRecipient');
  if(sel){ const seen=new Set();
    T.entities.forEach(e=>{ const og=document.createElement('optgroup'); og.label=e.name;
      e.people.forEach(([k,r])=>{ const n=T.people[k].name; if(seen.has(n)) return; seen.add(n);
        const o=document.createElement('option'); o.value=n; o.textContent=`${n}, ${r}`; og.appendChild(o); });
      e.orgs.forEach(k=>{ const n=T.orgs[k].name; if(seen.has(n)) return; seen.add(n);
        const o=document.createElement('option'); o.value=n; o.textContent=`${n}, ${T.orgs[k].kind}`; og.appendChild(o); });
      if(og.children.length) sel.insertBefore(og, sel.querySelector('optgroup[data-static]')); }); }
})();
