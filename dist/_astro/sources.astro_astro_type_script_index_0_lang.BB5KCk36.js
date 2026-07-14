let a=[],F=[],H=[],i=null;const o=t=>document.getElementById(t),b=o("loading-state"),E=o("table-wrap"),k=o("empty-state"),J=o("table-body"),y=o("source-modal"),l=o("toast"),v=o("filter-type"),h=o("filter-category"),g=o("filter-state"),S=o("search-input"),U=o("source-form"),d=o("form-type"),w=o("form-state"),A=o("form-name"),D=o("form-url"),x=o("form-category"),N=o("form-desc"),B=o("form-logo"),P=o("form-source-type"),C=o("form-active"),L=o("form-featured"),p=o("form-trust"),T=o("trust-label"),$=o("form-edit-id"),M=o("modal-title"),j=o("modal-submit");function u(t,e="success"){l.textContent=t,l.className=`toast ${e}`,l.classList.add("show"),clearTimeout(l._timeout),l._timeout=setTimeout(()=>l.classList.remove("show"),3e3)}function c(){b.style.display="block",E.style.display="none",k.style.display="none",Promise.all([R(),V(),W()]).then(()=>{b.style.display="none",K(),G()}).catch(t=>{console.error("Failed to load data:",t),u("Failed to load data: "+t.message,"error"),b.style.display="none"})}function R(){const t=new URLSearchParams;return v.value&&v.value!=="all"&&t.append("type",v.value),h.value&&t.append("category",h.value),g.value&&t.append("state",g.value),S.value&&t.append("search",S.value),fetch("/api/admin/sources?"+t.toString()).then(e=>e.json()).then(e=>{e.success?a=e.data||[]:(console.error("API error:",e.error),a=[])}).catch(e=>{console.error("Error loading sources:",e),a=[]})}function V(){return fetch("/api/admin/sources/categories").then(t=>t.json()).then(t=>{t.success&&(F=t.data||[],z("category"))}).catch(t=>console.error("Error loading categories:",t))}function W(){return fetch("/api/admin/sources/states").then(t=>t.json()).then(t=>{t.success&&(H=t.data||[],z("state"))}).catch(t=>console.error("Error loading states:",t))}function z(t){t==="category"?[h,x].forEach(e=>{const s=e.value;e.innerHTML='<option value="">All Categories</option>',F.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=(r.icon||"📁")+" "+r.name,e.appendChild(n)}),e.value=s}):t==="state"&&[g,w].forEach(e=>{const s=e.value;e.innerHTML='<option value="">All States</option>',H.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=(r.code||r.abbreviation)+" - "+r.name,e.appendChild(n)}),e.value=s})}function G(){const t=a.length,e=a.filter(n=>n.source_type_actual==="master").length,s=a.filter(n=>n.source_type_actual==="state").length,r=a.filter(n=>n.is_featured).length;o("total-count").textContent=t,o("master-count").textContent=e,o("state-count").textContent=s,o("featured-count").textContent=r}function K(){if(!a||a.length===0){E.style.display="none",k.style.display="block";return}E.style.display="block",k.style.display="none";let t="";a.forEach(e=>{const s=Math.min(e.trust_score||0,100);t+=`
        <tr>
          <td>
            <div class="source-cell">
              ${e.logo_url?`<img src="${e.logo_url}" class="source-logo" />`:'<div class="source-logo" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;">📄</div>'}
              <div>
                <div class="source-name">${f(e.name)}</div>
                <span class="source-url">${f(e.url)}</span>
              </div>
            </div>
          </td>
          <td><span class="badge-category">${f(e.category_name||"Uncategorized")}</span></td>
          <td>${e.state_code?`<span class="badge-state">${f(e.state_code)}</span>`:'<span style="color:#94a3b8;font-size:0.75rem;">—</span>'}</td>
          <td><span class="badge-type ${e.source_type_actual||"master"}">${e.source_type_actual==="master"?"Universal":"State"}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <div class="trust-bar-wrap"><div class="trust-bar-fill" style="width:${s}%"></div></div>
              <span class="trust-value">${s}%</span>
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
      `}),J.innerHTML=t}function f(t){if(!t)return"";const e=document.createElement("div");return e.textContent=t,e.innerHTML}function O(t="master",e=null){U.reset(),i=null,$.value="",o("form-message").style.display="none",e?(i=e.id,M.textContent="Edit Source",j.textContent="Update Source",d.value=e.source_type_actual||"master",w.value=e.state_id||"",A.value=e.name||"",D.value=e.url||"",x.value=e.category_id||"",N.value=e.description||"",B.value=e.logo_url||"",P.value=e.source_type||"official",C.checked=e.is_active===1,L.checked=e.is_featured===1,p.value=e.trust_score||50,T.textContent=(e.trust_score||50)+"%",$.value=e.id):(M.textContent="Add Source",j.textContent="Save Source",d.value=t,C.checked=!0,L.checked=!1,p.value=50,T.textContent="50%"),q(),y.style.display="flex"}window.editSource=function(t){const e=a.find(s=>s.id===t);e&&O(e.source_type_actual||"master",e)};function q(){const t=o("state-group");t.style.display=d.value==="master"?"none":"block"}function _(){y.style.display="none"}window.deleteSource=function(t){const e=a.find(s=>s.id===t);confirm(`Delete "${e?.name}"? This cannot be undone.`)&&fetch("/api/admin/sources/"+t,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:e?.source_type_actual||"master"})}).then(s=>s.json()).then(s=>{s.success?(u("✅ Source deleted successfully","success"),c()):u("❌ "+(s.error||"Failed to delete"),"error")}).catch(s=>{u("❌ Error deleting source","error"),console.error(s)})};U.addEventListener("submit",function(t){t.preventDefault();const e={name:A.value.trim(),url:D.value.trim(),category_id:parseInt(x.value)||null,description:N.value.trim(),source_type:P.value,logo_url:B.value.trim(),is_active:C.checked?1:0,is_featured:L.checked?1:0,trust_score:parseInt(p.value)||0,source_type_actual:d.value,state_id:parseInt(w.value)||null};if(!e.name||!e.url||!e.category_id){m("Name, URL, and category are required","error");return}if(e.source_type_actual==="state"&&!e.state_id){m("State is required for state-specific sources","error");return}const s=i?"/api/admin/sources/"+i:"/api/admin/sources";fetch(s,{method:i?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}).then(n=>n.json()).then(n=>{n.success?(u(i?"✅ Source updated!":"✅ Source created!","success"),_(),c()):m(n.error||"Failed to save","error")}).catch(n=>{m("Error saving source","error"),console.error(n)})});function m(t,e){const s=o("form-message");s.textContent=t,s.className="form-message "+e,s.style.display="block"}o("add-btn").addEventListener("click",()=>O("master"));o("modal-close").addEventListener("click",_);o("modal-cancel").addEventListener("click",_);y.addEventListener("click",t=>{t.target===y&&_()});d.addEventListener("change",q);p.addEventListener("input",()=>{T.textContent=p.value+"%"});v.addEventListener("change",c);h.addEventListener("change",c);g.addEventListener("change",c);let I;S.addEventListener("input",()=>{clearTimeout(I),I=setTimeout(c,300)});document.addEventListener("DOMContentLoaded",c);
