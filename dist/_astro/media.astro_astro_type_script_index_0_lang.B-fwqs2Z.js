let y=[],k=[],d="",a=new Set,M="grid",B=null,$=!1;document.addEventListener("DOMContentLoaded",function(){const n=new URLSearchParams(window.location.search).get("folder")||"";n&&(d=n),h(),V(),U()});function V(){document.getElementById("uploadBtn").addEventListener("click",K),document.getElementById("createFolderBtn").addEventListener("click",R),document.getElementById("rootBtn").addEventListener("click",function(){navigateToFolder("")}),document.getElementById("refreshBtn").addEventListener("click",h),document.getElementById("gridViewBtn").addEventListener("click",function(){M="grid",document.getElementById("gridViewBtn").className="view-btn view-btn-active",document.getElementById("listViewBtn").className="view-btn",document.getElementById("mediaGrid").style.display="grid",document.getElementById("mediaList").style.display="none",f()}),document.getElementById("listViewBtn").addEventListener("click",function(){M="list",document.getElementById("listViewBtn").className="view-btn view-btn-active",document.getElementById("gridViewBtn").className="view-btn",document.getElementById("mediaGrid").style.display="none",document.getElementById("mediaList").style.display="block",f()}),document.getElementById("selectAllBtn").addEventListener("click",function(){const e=I();a.size===e.filter(n=>!n.isFolder).length?a.clear():e.forEach(n=>{n.isFolder||a.add(n.id)}),f(),b()}),document.getElementById("selectAllCheckbox").addEventListener("change",function(){const e=I();this.checked?e.forEach(n=>{n.isFolder||a.add(n.id)}):a.clear(),f(),b()}),document.getElementById("deleteSelectedBtn").addEventListener("click",function(){a.size!==0&&confirm(`Delete ${a.size} selected files?`)&&W()}),document.getElementById("previewModal").addEventListener("click",function(e){e.target===this&&closePreviewModal()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&closePreviewModal(),(e.ctrlKey||e.metaKey)&&e.key==="a"&&(e.target.closest("input")||(e.preventDefault(),document.getElementById("selectAllBtn").click()))})}function U(){let e=0;document.addEventListener("dragenter",function(n){n.preventDefault(),e++}),document.addEventListener("dragleave",function(n){n.preventDefault(),e--,e===0&&document.body.classList.remove("drag-over")}),document.addEventListener("dragover",function(n){n.preventDefault(),document.body.classList.add("drag-over")}),document.addEventListener("drop",function(n){n.preventDefault(),document.body.classList.remove("drag-over"),e=0;const t=n.dataTransfer.files;t.length>0&&_(t)})}async function h(){try{document.getElementById("loadingState").style.display="block",document.getElementById("mediaGrid").style.display="none",document.getElementById("mediaList").style.display="none",document.getElementById("emptyState").style.display="none";const n=await(await fetch("/api/admin/media")).json();n.success?(y=n.media||[],k=n.folders||[],document.querySelector(".media-count").textContent=y.length,document.querySelector(".folder-count").textContent=k.length,f()):s("Failed to load media: "+n.error,"error")}catch(e){console.error("Error loading media:",e),s("Failed to load media","error")}finally{document.getElementById("loadingState").style.display="none"}}function I(){const e=O(),n=A();return[...e.map(t=>({isFolder:!0,name:t})),...n]}function O(){return d?k.filter(e=>e.startsWith(d+"/")&&e.split("/").length===d.split("/").length+1).sort():k.filter(e=>!e.includes("/")).sort()}function A(){return d?y.filter(e=>e.folder===d).sort((e,n)=>new Date(n.created_at)-new Date(e.created_at)):y.filter(e=>!e.folder||e.folder==="").sort((e,n)=>new Date(n.created_at)-new Date(e.created_at))}window.navigateToFolder=function(e){d=e||"",a.clear(),f(),b();const n=new URL(window.location);n.searchParams.set("folder",e||""),window.history.pushState({folder:e},"",n)};function f(){const e=document.getElementById("mediaGrid");document.getElementById("mediaListBody");const n=document.getElementById("emptyState"),t=I(),o=document.querySelector(".page-subtitle");if(o){const i=d?`📁 ${d}`:"📁 Root",l=t.length;o.innerHTML=`<span class="media-count">${l}</span> items in <span class="folder-count">${i}</span>`}if(J(),t.length===0){e.style.display="none",document.getElementById("mediaList").style.display="none",n.style.display="block";return}n.style.display="none",M==="grid"?(e.style.display="grid",document.getElementById("mediaList").style.display="none",q(t)):(e.style.display="none",document.getElementById("mediaList").style.display="block",G(t)),b()}function q(e){const n=document.getElementById("mediaGrid");n.innerHTML=e.map((t,o)=>{if(t.isFolder){const c=t.name.split("/").pop(),m=y.filter(g=>g.folder===t.name).length;return`
          <div class="media-grid-item media-folder" onclick="navigateToFolder('${t.name}')">
            <div class="media-grid-item-content">
              <div class="media-grid-item-icon media-grid-item-icon-folder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span class="media-grid-item-name">${p(c)}</span>
              <span class="media-grid-item-meta">${m} files</span>
            </div>
          </div>
        `}const i=t.mime_type&&t.mime_type.startsWith("image/"),l=t.mime_type&&t.mime_type.startsWith("video/"),r=a.has(t.id),u=t.original_name||t.filename.split("/").pop()||"Unknown";return`
        <div class="media-grid-item ${r?"media-grid-item-selected":""}" onclick="toggleSelect(${t.id})" ondblclick="window.openPreview(${JSON.stringify(t).replace(/"/g,"&quot;")})">
          <div class="media-grid-item-thumb">
            ${i?`
              <img 
                src="${t.url}" 
                alt="${p(t.alt_text||u)}" 
                class="media-grid-item-img"
                loading="lazy"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-size=%2216%22%3ENo Image%3C/text%3E%3C/svg%3E'"
              />
            `:l?`
              <video class="media-grid-item-video" muted>
                <source src="${t.url}" type="${t.mime_type}">
              </video>
              <div class="media-grid-item-overlay-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            `:`
              <div class="media-grid-item-file-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            `}
            <div class="media-grid-item-checkbox">
              <input type="checkbox" ${r?"checked":""} class="checkbox" onclick="event.stopPropagation(); toggleSelect(${t.id})" />
            </div>
            <div class="media-grid-item-overlay">
              <button onclick="event.stopPropagation(); window.openPreview(${JSON.stringify(t).replace(/"/g,"&quot;")})" class="btn-action btn-action-sm">Preview</button>
              <button onclick="event.stopPropagation(); window.copyLink('${t.url}')" class="btn-action btn-action-sm">Copy Link</button>
              <button onclick="event.stopPropagation(); window.deleteMedia(${t.id}, '${t.filename}')" class="btn-action btn-action-sm btn-action-danger">Delete</button>
            </div>
          </div>
          <div class="media-grid-item-info">
            <span class="media-grid-item-name">${p(u)}</span>
            <span class="media-grid-item-meta">${F(t.file_size)}</span>
          </div>
        </div>
      `}).join("")}function G(e){const n=document.getElementById("mediaListBody");n.innerHTML=e.map(t=>{if(t.isFolder){const u=t.name.split("/").pop(),c=y.filter(m=>m.folder===t.name).length;return`
          <tr class="media-list-row media-list-folder" onclick="navigateToFolder('${t.name}')">
            <td class="col-select"></td>
            <td class="col-file">
              <div class="media-list-file">
                <div class="media-list-icon media-list-icon-folder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span class="media-list-name">${p(u)}</span>
              </div>
            </td>
            <td class="col-name">Folder</td>
            <td class="col-size">${c} files</td>
            <td class="col-date">—</td>
            <td class="col-actions"></td>
          </tr>
        `}const o=t.mime_type&&t.mime_type.startsWith("image/"),i=t.mime_type&&t.mime_type.startsWith("video/"),l=a.has(t.id),r=t.original_name||t.filename.split("/").pop()||"Unknown";return`
        <tr class="media-list-row ${l?"media-list-row-selected":""}" onclick="toggleSelect(${t.id})" ondblclick="window.openPreview(${JSON.stringify(t).replace(/"/g,"&quot;")})">
          <td class="col-select">
            <input type="checkbox" ${l?"checked":""} class="checkbox" onclick="event.stopPropagation(); toggleSelect(${t.id})" />
          </td>
          <td class="col-file">
            <div class="media-list-file">
              ${o?`
                <img src="${t.url}" alt="${p(r)}" class="media-list-thumb" />
              `:i?`
                <div class="media-list-icon media-list-icon-video">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              `:`
                <div class="media-list-icon media-list-icon-file">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
              `}
              <span class="media-list-name">${p(r)}</span>
            </div>
          </td>
          <td class="col-name">${p(t.alt_text||"—")}</td>
          <td class="col-size">${F(t.file_size)}</td>
          <td class="col-date">${P(t.created_at)}</td>
          <td class="col-actions">
            <div class="media-list-actions">
              <button onclick="event.stopPropagation(); window.openPreview(${JSON.stringify(t).replace(/"/g,"&quot;")})" class="btn-action btn-action-sm" title="Preview">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <button onclick="event.stopPropagation(); window.copyLink('${t.url}')" class="btn-action btn-action-sm" title="Copy Link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
              <button onclick="event.stopPropagation(); window.deleteMedia(${t.id}, '${t.filename}')" class="btn-action btn-action-sm btn-action-danger" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `}).join("")}function J(){const e=document.getElementById("folderPath");if(d){const n=d.split("/");let t="",o="";n.forEach((i,l)=>{o+=(l>0?"/":"")+i,t+=`
          <span class="breadcrumb-separator">/</span>
          <button onclick="navigateToFolder('${o}')" class="breadcrumb-item breadcrumb-link">${p(i)}</button>
        `}),e.innerHTML=t}else e.innerHTML=""}window.toggleSelect=function(e){a.has(e)?a.delete(e):a.add(e),f(),b()};function b(){const e=a.size;document.getElementById("selectedCount").textContent=`${e} selected`;const n=document.getElementById("deleteSelectedBtn");e>0?(n.style.display="inline-flex",n.textContent=`Delete ${e}`):n.style.display="none";const o=I().filter(l=>!l.isFolder),i=o.length>0&&o.every(l=>a.has(l.id));document.getElementById("selectAllCheckbox").checked=i&&o.length>0}async function W(){const e=Array.from(a);let n=0;for(const t of e)try{const o=y.find(l=>l.id===t);if(!o)continue;(await fetch("/api/admin/media",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:t,filename:o.filename})})).ok&&n++}catch(o){console.error("Error deleting file:",o)}a.clear(),s(`Deleted ${n} files successfully`,"success"),h()}window.openPreview=function(e){const n=document.getElementById("previewModal"),t=document.getElementById("previewContent"),o=document.getElementById("previewFileType"),i=document.getElementById("previewFileName"),l=document.getElementById("previewFileSize"),r=document.getElementById("previewFileDate"),u=e.mime_type&&e.mime_type.startsWith("image/"),c=e.mime_type&&e.mime_type.startsWith("video/");o.textContent=e.mime_type||"File",i.textContent=e.original_name||e.filename.split("/").pop()||"Unknown",l.textContent=F(e.file_size),r.textContent=e.created_at?P(e.created_at):"—",u?t.innerHTML=`<img src="${e.url}" alt="${p(e.alt_text||"")}" class="preview-image" />`:c?t.innerHTML=`
        <video controls class="preview-video">
          <source src="${e.url}" type="${e.mime_type}">
          Your browser does not support the video tag.
        </video>
      `:t.innerHTML=`
        <div class="preview-file">
          <div class="preview-file-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p class="preview-file-message">Preview not available for this file type</p>
          <a href="${e.url}" target="_blank" class="btn btn-primary">Download</a>
        </div>
      `,document.getElementById("previewCopyLink").onclick=function(){v(e.url,"Link copied to clipboard!")},document.getElementById("previewCopyMarkdown").onclick=function(){v(`![${e.alt_text||"Image"}](${e.url})`,"Markdown copied!")},document.getElementById("previewCopyHTML").onclick=function(){v(`<img src="${e.url}" alt="${e.alt_text||"Image"}" />`,"HTML copied!")},document.getElementById("previewDeleteBtn").onclick=function(){confirm("Delete this file?")&&(closePreviewModal(),deleteMedia(e.id,e.filename))},n.style.display="flex"};window.closePreviewModal=function(){document.getElementById("previewModal").style.display="none"};window.copyLink=function(e){v(e,"Link copied to clipboard!")};window.copyMarkdown=function(e,n){v(`![${n||"Image"}](${e})`,"Markdown copied!")};window.copyHTML=function(e,n){v(`<img src="${e}" alt="${n||"Image"}" />`,"HTML copied!")};async function v(e,n){try{if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(e);else{const t=document.createElement("textarea");t.value=e,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t)}s(n||"Copied to clipboard!","success")}catch{s("Failed to copy","error")}}window.deleteMedia=async function(e,n){if(confirm("Delete this file?"))try{const o=await(await fetch("/api/admin/media",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e,filename:n})})).json();o.success?(s("Deleted successfully","success"),h()):s("Failed to delete: "+o.error,"error")}catch{s("Failed to delete","error")}};async function R(){const e=prompt("Enter folder name:");if(!e)return;const n=e.trim().replace(/[^a-zA-Z0-9-_]/g,"-").toLowerCase();if(!n){s("Invalid folder name. Use letters, numbers, hyphens, and underscores.","error");return}const t=d?`${d}/${n}`:n;if(k.includes(t)){s("Folder already exists!","error");return}try{const i=await(await fetch("/api/admin/media/folders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({folder:t,name:n})})).json();i.success?(s(`Folder "${n}" created!`,"success"),h(),setTimeout(()=>{navigateToFolder(t)},500)):s("Failed to create folder: "+i.error,"error")}catch(o){console.error("Error creating folder:",o),s("Failed to create folder","error")}}function K(){const e=document.createElement("input");e.type="file",e.accept="image/*,video/*,.pdf,.doc,.docx,.txt",e.multiple=!0,e.onchange=function(n){this.files.length>0&&_(this.files)},e.click()}async function _(e){if($){s("Upload already in progress","error");return}$=!0;const n=document.getElementById("uploadProgress"),t=document.getElementById("uploadFileName"),o=document.getElementById("uploadPercent"),i=document.getElementById("progressBar"),l=document.getElementById("uploadSpeed"),r=document.getElementById("uploadRemaining"),u=document.getElementById("cancelUploadBtn");n.style.display="block";let c=!1;u.onclick=function(){c=!0,B&&B.abort(),s("Upload cancelled","error"),$=!1,n.style.display="none"};const m=e.length;let g=0,N=Date.now();for(let E=0;E<m&&!c;E++){const w=e[E],H=d?` → ${d}`:" → Root";t.textContent=`Uploading ${w.name}${H} (${E+1}/${m})`;const x=new FormData;x.append("image",w),d&&x.append("folder",d),B=new AbortController;try{const S=await(await fetch("/api/upload",{method:"POST",body:x,signal:B.signal})).json();if(S.success){g++;const D=g/m*100;i.style.width=`${D}%`,o.textContent=`${Math.round(D)}%`;const T=(Date.now()-N)/1e3,j=w.size/T/1024;l.textContent=`${j.toFixed(1)} KB/s`;const C=(m-g)*(T/g);C>60?r.textContent=`${Math.round(C/60)} min remaining`:r.textContent=`${Math.round(C)}s remaining`}else s(`Failed to upload ${w.name}: ${S.error}`,"error")}catch(L){L.name!=="AbortError"&&(console.error("Upload error:",L),s(`Failed to upload ${w.name}`,"error"))}}$=!1,n.style.display="none",c||(s(`Uploaded ${g} of ${m} files`,"success"),h())}function F(e){if(!e)return"0 B";const n=["B","KB","MB","GB"],t=Math.floor(Math.log(e)/Math.log(1024));return`${(e/Math.pow(1024,t)).toFixed(1)} ${n[t]}`}function P(e){return e?new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}function p(e){if(!e)return"";const n=document.createElement("div");return n.textContent=e,n.innerHTML}function s(e,n="success"){const t=document.getElementById("toast");t.textContent=e,t.className=`toast toast-${n}`,t.classList.add("toast-visible"),clearTimeout(t._timeout),t._timeout=setTimeout(()=>{t.classList.remove("toast-visible")},3e3)}window.addEventListener("popstate",function(e){d=e.state?.folder||"",f()});const z=document.createElement("style");z.textContent=`
    body.drag-over::before {
      content: '';
      position: fixed;
      inset: 0;
      background: rgba(59, 130, 246, 0.05);
      backdrop-filter: blur(4px);
      z-index: 9999;
      border: 4px dashed #3b82f6;
      margin: 20px;
      border-radius: 20px;
      pointer-events: none;
    }
    
    body.drag-over::after {
      content: 'Drop files here';
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      font-size: 2rem;
      font-weight: 600;
      color: #3b82f6;
      pointer-events: none;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  `;document.head.appendChild(z);
