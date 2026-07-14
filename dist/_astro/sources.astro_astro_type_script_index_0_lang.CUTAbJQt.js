let a=[],D=[],F=[],i=null;const o=t=>document.getElementById(t),E=o("loading-state"),k=o("table-wrap"),S=o("empty-state"),J=o("table-body"),p=o("source-modal"),l=o("toast"),h=o("filter-type"),g=o("filter-category"),_=o("filter-state"),b=o("search-input"),H=o("source-form"),f=o("form-type"),w=o("form-state"),U=o("form-name"),A=o("form-url"),x=o("form-category"),N=o("form-desc"),B=o("form-logo"),P=o("form-source-type"),C=o("form-active"),L=o("form-featured"),m=o("form-trust"),T=o("trust-label"),$=o("form-edit-id"),M=o("modal-title"),j=o("modal-submit");function d(t,e="success"){l.textContent=t,l.className=`toast ${e}`,l.classList.add("show"),clearTimeout(l._timeout),l._timeout=setTimeout(()=>l.classList.remove("show"),3e3)}function c(){E.style.display="block",k.style.display="none",S.style.display="none",Promise.all([K(),R(),V()]).then(()=>{E.style.display="none",G(),W()}).catch(t=>{console.error("Failed to load data:",t),d("Failed to load data: "+t.message,"error"),E.style.display="none"})}function K(){const t=new URLSearchParams;return h.value&&h.value!=="all"&&t.append("type",h.value),g.value&&t.append("category",g.value),_.value&&t.append("state",_.value),b.value&&t.append("search",b.value),fetch("/api/admin/sources?"+t.toString()).then(e=>e.json()).then(e=>{e.success?a=e.data||[]:(console.error("API error:",e.error),a=[])}).catch(e=>{console.error("Error loading sources:",e),a=[]})}function R(){return fetch("/api/admin/sources/categories").then(t=>t.json()).then(t=>{t.success&&(D=t.data||[],z("category"))}).catch(t=>console.error("Error loading categories:",t))}function V(){return fetch("/api/admin/sources/states").then(t=>t.json()).then(t=>{t.success&&(F=t.data||[],z("state"))}).catch(t=>console.error("Error loading states:",t))}function z(t){t==="category"?[g,x].forEach(e=>{const n=e.value;e.innerHTML='<option value="">All Categories</option>',D.forEach(r=>{const s=document.createElement("option");s.value=r.id,s.textContent=r.name,e.appendChild(s)}),e.value=n}):t==="state"&&[_,w].forEach(e=>{const n=e.value;e.innerHTML='<option value="">All States</option>',F.forEach(r=>{const s=document.createElement("option");s.value=r.id,s.textContent=(r.code||r.abbreviation)+" - "+r.name,e.appendChild(s)}),e.value=n})}function W(){const t=a.length,e=a.filter(s=>s.source_type_actual==="master").length,n=a.filter(s=>s.source_type_actual==="state").length,r=a.filter(s=>s.is_featured).length;o("total-count").textContent=t,o("master-count").textContent=e,o("state-count").textContent=n,o("featured-count").textContent=r}function G(){if(!a||a.length===0){k.style.display="none",S.style.display="block";return}k.style.display="block",S.style.display="none";let t="";a.forEach(e=>{const n=Math.min(e.trust_score||0,100);t+=`
        <tr>
          <td>
            <div class="source-cell">
              ${e.logo_url?`<img src="${e.logo_url}" class="source-logo" alt="${u(e.name)}" />`:'<div class="source-logo" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#6b7280;">📄</div>'}
              <div>
                <div class="source-name">${u(e.name)}</div>
                <span class="source-url">${u(e.url)}</span>
              </div>
            </div>
          </td>
          <td><span class="badge-category">${u(e.category_name||"Uncategorized")}</span></td>
          <td>${e.state_code?`<span class="badge-state">${u(e.state_code)}</span>`:'<span style="color:#6b7280;font-size:0.75rem;">—</span>'}</td>
          <td><span class="badge-type ${e.source_type_actual||"master"}">${e.source_type_actual==="master"?"Universal":"State"}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <div class="trust-bar-wrap"><div class="trust-bar-fill" style="width:${n}%"></div></div>
              <span class="trust-value">${n}%</span>
            </div>
          </td>
          <td>
            <span class="badge-status ${e.is_active?"active":"inactive"}">${e.is_active?"Active":"Inactive"}</span>
            ${e.is_featured?`<span class="badge-featured">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </span>`:""}
          </td>
          <td>
            <div class="actions-cell">
              <button class="btn-sm btn-sm-edit" onclick="editSource(${e.id})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
              <button class="btn-sm btn-sm-delete" onclick="deleteSource(${e.id})">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `}),J.innerHTML=t}function u(t){if(!t)return"";const e=document.createElement("div");return e.textContent=t,e.innerHTML}function O(t="master",e=null){H.reset(),i=null,$.value="",o("form-message").style.display="none",e?(i=e.id,M.textContent="Edit Source",j.textContent="Update Source",f.value=e.source_type_actual||"master",w.value=e.state_id||"",U.value=e.name||"",A.value=e.url||"",x.value=e.category_id||"",N.value=e.description||"",B.value=e.logo_url||"",P.value=e.source_type||"official",C.checked=e.is_active===1,L.checked=e.is_featured===1,m.value=e.trust_score||50,T.textContent=(e.trust_score||50)+"%",$.value=e.id):(M.textContent="Add Source",j.textContent="Save Source",f.value=t,C.checked=!0,L.checked=!1,m.value=50,T.textContent="50%"),q(),p.style.display="flex"}window.editSource=function(t){const e=a.find(n=>n.id===t);e&&O(e.source_type_actual||"master",e)};function q(){const t=o("state-group");t.style.display=f.value==="master"?"none":"block"}function v(){p.style.display="none"}window.deleteSource=function(t){const e=a.find(n=>n.id===t);confirm(`Delete "${e?.name}"? This cannot be undone.`)&&fetch("/api/admin/sources/"+t,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:e?.source_type_actual||"master"})}).then(n=>n.json()).then(n=>{n.success?(d("Source deleted successfully","success"),c()):d(n.error||"Failed to delete","error")}).catch(n=>{d("Error deleting source","error"),console.error(n)})};H.addEventListener("submit",function(t){t.preventDefault();const e={name:U.value.trim(),url:A.value.trim(),category_id:parseInt(x.value)||null,description:N.value.trim(),source_type:P.value,logo_url:B.value.trim(),is_active:C.checked?1:0,is_featured:L.checked?1:0,trust_score:parseInt(m.value)||0,source_type_actual:f.value,state_id:parseInt(w.value)||null};if(!e.name||!e.url||!e.category_id){y("Name, URL, and category are required","error");return}if(e.source_type_actual==="state"&&!e.state_id){y("State is required for state-specific sources","error");return}const n=i?"/api/admin/sources/"+i:"/api/admin/sources";fetch(n,{method:i?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).then(s=>s.json()).then(s=>{s.success?(d(i?"Source updated!":"Source created!","success"),v(),c()):y(s.error||"Failed to save","error")}).catch(s=>{y("Error saving source","error"),console.error(s)})});function y(t,e){const n=o("form-message");n.textContent=t,n.className="form-message "+e,n.style.display="block"}o("add-btn").addEventListener("click",()=>O("master"));o("modal-close").addEventListener("click",v);o("modal-cancel").addEventListener("click",v);p.addEventListener("click",t=>{t.target===p&&v()});f.addEventListener("change",q);m.addEventListener("input",()=>{T.textContent=m.value+"%"});h.addEventListener("change",c);g.addEventListener("change",c);_.addEventListener("change",c);let I;b.addEventListener("input",()=>{clearTimeout(I),I=setTimeout(c,300)});document.addEventListener("keydown",t=>{t.key==="Escape"&&p.style.display==="flex"&&v(),(t.ctrlKey||t.metaKey)&&t.key==="k"&&(t.preventDefault(),b.focus())});document.addEventListener("DOMContentLoaded",c);
