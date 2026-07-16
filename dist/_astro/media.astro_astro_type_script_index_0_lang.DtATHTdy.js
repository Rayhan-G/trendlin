let f=[],v=[],l="",s=new Set,C="grid",E=null,B=!1;document.addEventListener("DOMContentLoaded",function(){const n=new URLSearchParams(window.location.search).get("folder")||"";n&&(l=n),h(),U(),H()});function U(){document.getElementById("uploadBtn").addEventListener("click",R),document.getElementById("createFolderBtn").addEventListener("click",W),document.getElementById("rootBtn").addEventListener("click",function(){navigateToFolder("")}),document.getElementById("refreshBtn").addEventListener("click",h),document.getElementById("gridViewBtn").addEventListener("click",function(){C="grid",document.getElementById("gridViewBtn").className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg transition-all",document.getElementById("listViewBtn").className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-all",document.getElementById("mediaGrid").classList.remove("hidden"),document.getElementById("mediaList").classList.add("hidden"),m()}),document.getElementById("listViewBtn").addEventListener("click",function(){C="list",document.getElementById("listViewBtn").className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-600 rounded-lg transition-all",document.getElementById("gridViewBtn").className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-all",document.getElementById("mediaGrid").classList.add("hidden"),document.getElementById("mediaList").classList.remove("hidden"),m()}),document.getElementById("selectAllBtn").addEventListener("click",function(){const e=$();s.size===e.length?s.clear():e.forEach(n=>{n.isFolder||s.add(n.id)}),m(),w()}),document.getElementById("selectAllCheckbox").addEventListener("change",function(){const e=$();this.checked?e.forEach(n=>{n.isFolder||s.add(n.id)}):s.clear(),m(),w()}),document.getElementById("deleteSelectedBtn").addEventListener("click",function(){s.size!==0&&confirm(`Delete ${s.size} selected files?`)&&J()}),document.getElementById("previewModal").addEventListener("click",function(e){e.target===this&&closePreviewModal()}),document.addEventListener("keydown",function(e){e.key==="Escape"&&closePreviewModal(),(e.ctrlKey||e.metaKey)&&e.key==="a"&&(e.target.closest("input")||(e.preventDefault(),document.getElementById("selectAllBtn").click()))})}function H(){let e=0;document.addEventListener("dragenter",function(n){n.preventDefault(),e++}),document.addEventListener("dragleave",function(n){n.preventDefault(),e--,e===0&&document.body.classList.remove("drag-over")}),document.addEventListener("dragover",function(n){n.preventDefault(),document.body.classList.add("drag-over")}),document.addEventListener("drop",function(n){n.preventDefault(),document.body.classList.remove("drag-over"),e=0;const t=n.dataTransfer.files;t.length>0&&_(t)})}async function h(){try{document.getElementById("loadingState").classList.remove("hidden"),document.getElementById("mediaGrid").classList.add("hidden"),document.getElementById("mediaList").classList.add("hidden"),document.getElementById("emptyState").classList.add("hidden");const n=await(await fetch("/api/admin/media")).json();n.success?(f=n.media||[],v=n.folders||[],document.getElementById("mediaCount").textContent=`${f.length} files`,document.getElementById("folderCount").textContent=`${v.length} folders`,m()):d("Failed to load media: "+n.error,"error")}catch(e){console.error("Error loading media:",e),d("Failed to load media","error")}finally{document.getElementById("loadingState").classList.add("hidden")}}function $(){const e=V(),n=O();return[...e.map(t=>({isFolder:!0,name:t})),...n]}function V(){return l?v.filter(e=>e.startsWith(l+"/")&&e.split("/").length===l.split("/").length+1).sort():v.filter(e=>!e.includes("/")).sort()}function O(){return l?f.filter(e=>e.folder===l).sort((e,n)=>new Date(n.created_at)-new Date(e.created_at)):f.filter(e=>!e.folder||e.folder==="").sort((e,n)=>new Date(n.created_at)-new Date(e.created_at))}window.navigateToFolder=function(e){l=e||"",s.clear(),m(),w();const n=new URL(window.location);n.searchParams.set("folder",e||""),window.history.pushState({folder:e},"",n)};function m(){const e=document.getElementById("mediaGrid"),n=document.getElementById("mediaListBody"),t=document.getElementById("emptyState"),o=$();if(document.getElementById("currentLocationDisplay").textContent=l?`📁 ${l}`:"📁 Root",G(),o.length===0){e.classList.add("hidden"),n.parentElement?.classList.add("hidden"),t.classList.remove("hidden");return}t.classList.add("hidden"),C==="grid"?(e.classList.remove("hidden"),n.parentElement?.classList.add("hidden"),A(o)):(e.classList.add("hidden"),n.parentElement?.classList.remove("hidden"),q(o)),w()}function A(e){const n=document.getElementById("mediaGrid");n.innerHTML=e.map((t,o)=>{if(t.isFolder){const u=t.name.split("/").pop(),p=f.filter(g=>g.folder===t.name).length;return`
          <div class="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer" onclick="navigateToFolder('${t.name}')">
            <div class="aspect-square flex flex-col items-center justify-center p-4">
              <div class="text-5xl mb-2">📁</div>
              <p class="text-sm font-semibold text-gray-700 text-center truncate w-full">${u}</p>
              <p class="text-xs text-gray-500">${p} files</p>
            </div>
          </div>
        `}const r=t.mime_type&&t.mime_type.startsWith("image/"),i=t.mime_type&&t.mime_type.startsWith("video/"),a=s.has(t.id),c=t.original_name||t.filename.split("/").pop()||"Unknown";return`
        <div class="group relative bg-white rounded-xl border-2 ${a?"border-blue-500 ring-2 ring-blue-200":"border-gray-200"} overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer" onclick="toggleSelect(${t.id})" ondblclick="openPreview(${JSON.stringify(t).replace(/"/g,"&quot;")})">
          <div class="aspect-square bg-gray-100 relative overflow-hidden">
            ${r?`
              <img 
                src="${t.url}" 
                alt="${t.alt_text||c}" 
                class="w-full h-full object-cover" 
                loading="lazy"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-size=%2216%22%3ENo Image%3C/text%3E%3C/svg%3E'"
              />
            `:i?`
              <video class="w-full h-full object-cover" muted>
                <source src="${t.url}" type="${t.mime_type}">
              </video>
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span class="text-4xl">🎬</span>
              </div>
            `:`
              <div class="w-full h-full flex items-center justify-center bg-gray-100">
                <span class="text-6xl">📄</span>
              </div>
            `}
            
            <!-- Selection checkbox -->
            <div class="absolute top-2 left-2">
              <input type="checkbox" ${a?"checked":""} class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" onclick="event.stopPropagation(); toggleSelect(${t.id})" />
            </div>
            
            <!-- Quick actions overlay -->
            <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
              <button onclick="event.stopPropagation(); window.openPreview(${JSON.stringify(t).replace(/"/g,"&quot;")})" class="w-full px-2 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">👁️ Preview</button>
              <button onclick="event.stopPropagation(); window.copyLink('${t.url}')" class="w-full px-2 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">📋 Copy Link</button>
              <button onclick="event.stopPropagation(); window.copyMarkdown('${t.url}', '${t.alt_text||c}')" class="w-full px-2 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">📝 Copy MD</button>
              <button onclick="event.stopPropagation(); window.deleteMedia(${t.id}, '${t.filename}')" class="w-full px-2 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1">🗑️ Delete</button>
            </div>
          </div>
          <div class="p-2">
            <p class="text-xs font-medium text-gray-700 truncate">${c}</p>
            <p class="text-xs text-gray-400">${F(t.file_size)}</p>
          </div>
        </div>
      `}).join(""),document.getElementById("selectedCount").textContent=`${s.size} selected`}function q(e){const n=document.getElementById("mediaListBody");n.innerHTML=e.map(t=>{if(t.isFolder){const c=t.name.split("/").pop(),u=f.filter(p=>p.folder===t.name).length;return`
          <tr class="hover:bg-gray-50 cursor-pointer" onclick="navigateToFolder('${t.name}')">
            <td class="px-4 py-3"></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <span class="text-2xl">📁</span>
                <span class="font-medium text-gray-900">${c}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">Folder</td>
            <td class="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">${u} files</td>
            <td class="px-4 py-3 text-sm text-gray-500 hidden xl:table-cell">—</td>
            <td class="px-4 py-3 text-right"></td>
          </tr>
        `}const o=t.mime_type&&t.mime_type.startsWith("image/"),r=t.mime_type&&t.mime_type.startsWith("video/"),i=s.has(t.id),a=t.original_name||t.filename.split("/").pop()||"Unknown";return`
        <tr class="hover:bg-gray-50 ${i?"bg-blue-50":""}" onclick="toggleSelect(${t.id})" ondblclick="window.openPreview(${JSON.stringify(t).replace(/"/g,"&quot;")})">
          <td class="px-4 py-3">
            <input type="checkbox" ${i?"checked":""} class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" onclick="event.stopPropagation(); toggleSelect(${t.id})" />
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                ${o?`
                  <img src="${t.url}" alt="${a}" class="w-full h-full object-cover" />
                `:r?`
                  <span class="text-2xl">🎬</span>
                `:`
                  <span class="text-2xl">📄</span>
                `}
              </div>
              <span class="font-medium text-gray-900 text-sm">${a}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-sm text-gray-500 hidden md:table-cell truncate max-w-xs">${t.alt_text||"—"}</td>
          <td class="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">${F(t.file_size)}</td>
          <td class="px-4 py-3 text-sm text-gray-500 hidden xl:table-cell">${T(t.created_at)}</td>
          <td class="px-4 py-3 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <button onclick="event.stopPropagation(); window.openPreview(${JSON.stringify(t).replace(/"/g,"&quot;")})" class="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Preview">👁️</button>
              <button onclick="event.stopPropagation(); window.copyLink('${t.url}')" class="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Copy Link">📋</button>
              <button onclick="event.stopPropagation(); window.deleteMedia(${t.id}, '${t.filename}')" class="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `}).join("")}function G(){const e=document.getElementById("folderPath");if(l){const n=l.split("/");let t=' <span class="text-gray-400 mx-1">/</span> ',o="";n.forEach((r,i)=>{o+=(i>0?"/":"")+r,t+=`<button onclick="navigateToFolder('${o}')" class="text-blue-600 hover:text-blue-800 font-medium hover:underline">${r}</button>`,i<n.length-1&&(t+=' <span class="text-gray-400 mx-1">/</span> ')}),e.innerHTML=t}else e.innerHTML=""}window.toggleSelect=function(e){s.has(e)?s.delete(e):s.add(e),m(),w()};function w(){const e=s.size;document.getElementById("selectedCount").textContent=`${e} selected`;const n=document.getElementById("deleteSelectedBtn");e>0?(n.classList.remove("hidden"),n.textContent=`🗑️ Delete ${e}`):n.classList.add("hidden");const o=$().filter(i=>!i.isFolder),r=o.length>0&&o.every(i=>s.has(i.id));document.getElementById("selectAllCheckbox").checked=r&&o.length>0}async function J(){const e=Array.from(s);let n=0;for(const t of e)try{const o=f.find(i=>i.id===t);if(!o)continue;(await fetch("/api/admin/media",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:t,filename:o.filename})})).ok&&n++}catch(o){console.error("Error deleting file:",o)}s.clear(),d(`✅ Deleted ${n} files successfully`,"success"),h()}window.openPreview=function(e){const n=document.getElementById("previewModal"),t=document.getElementById("previewContent"),o=document.getElementById("previewFileType"),r=document.getElementById("previewFileName"),i=document.getElementById("previewFileSize"),a=document.getElementById("previewFileDate"),c=e.mime_type&&e.mime_type.startsWith("image/"),u=e.mime_type&&e.mime_type.startsWith("video/");o.textContent=e.mime_type||"File",r.textContent=e.original_name||e.filename.split("/").pop()||"Unknown",i.textContent=F(e.file_size),a.textContent=e.created_at?T(e.created_at):"—",c?t.innerHTML=`<img src="${e.url}" alt="${e.alt_text||""}" class="max-w-full max-h-[70vh] object-contain rounded-lg" />`:u?t.innerHTML=`
        <video controls class="max-w-full max-h-[70vh] rounded-lg">
          <source src="${e.url}" type="${e.mime_type}">
          Your browser does not support the video tag.
        </video>
      `:t.innerHTML=`
        <div class="text-center py-12">
          <span class="text-8xl mb-4 block">📄</span>
          <p class="text-gray-500">Preview not available for this file type</p>
          <a href="${e.url}" target="_blank" class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">Download</a>
        </div>
      `,document.getElementById("previewCopyLink").onclick=function(){y(e.url,"Link copied to clipboard!")},document.getElementById("previewCopyMarkdown").onclick=function(){y(`![${e.alt_text||"Image"}](${e.url})`,"Markdown copied!")},document.getElementById("previewCopyHTML").onclick=function(){y(`<img src="${e.url}" alt="${e.alt_text||"Image"}" />`,"HTML copied!")},document.getElementById("previewDeleteBtn").onclick=function(){confirm("Delete this file?")&&(closePreviewModal(),deleteMedia(e.id,e.filename))},n.classList.remove("hidden")};window.closePreviewModal=function(){document.getElementById("previewModal").classList.add("hidden")};window.copyLink=function(e){y(e,"✅ Link copied to clipboard!")};window.copyMarkdown=function(e,n){y(`![${n||"Image"}](${e})`,"✅ Markdown copied!")};window.copyHTML=function(e,n){y(`<img src="${e}" alt="${n||"Image"}" />`,"✅ HTML copied!")};async function y(e,n){try{if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(e);else{const t=document.createElement("textarea");t.value=e,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t)}d(n||"✅ Copied to clipboard!")}catch{d("❌ Failed to copy","error")}}window.deleteMedia=async function(e,n){if(confirm("Delete this file?"))try{const o=await(await fetch("/api/admin/media",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e,filename:n})})).json();o.success?(d("🗑️ Deleted successfully","success"),h()):d("Failed to delete: "+o.error,"error")}catch{d("Failed to delete","error")}};async function W(){const e=prompt("Enter folder name:");if(!e)return;const n=e.trim().replace(/[^a-zA-Z0-9-_]/g,"-").toLowerCase();if(!n){d("Invalid folder name. Use letters, numbers, hyphens, and underscores.","error");return}const t=l?`${l}/${n}`:n;if(v.includes(t)){d("Folder already exists!","error");return}try{const r=await(await fetch("/api/admin/media/folders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({folder:t,name:n})})).json();r.success?(d(`✅ Folder "${n}" created!`,"success"),h(),setTimeout(()=>{navigateToFolder(t)},500)):d("Failed to create folder: "+r.error,"error")}catch(o){console.error("Error creating folder:",o),d("Failed to create folder","error")}}function R(){const e=document.createElement("input");e.type="file",e.accept="image/*,video/*,.pdf,.doc,.docx,.txt",e.multiple=!0,e.onchange=function(n){this.files.length>0&&_(this.files)},e.click()}async function _(e){if(B){d("Upload already in progress","error");return}B=!0;const n=document.getElementById("uploadProgress"),t=document.getElementById("uploadFileName"),o=document.getElementById("uploadPercent"),r=document.getElementById("progressBar"),i=document.getElementById("uploadSpeed"),a=document.getElementById("uploadRemaining"),c=document.getElementById("cancelUploadBtn");n.classList.remove("hidden");let u=!1;c.onclick=function(){u=!0,E&&E.abort(),d("Upload cancelled","error"),B=!1,n.classList.add("hidden")};const p=e.length;let g=0,j=Date.now();for(let b=0;b<p&&!u;b++){const x=e[b],N=l?` → ${l}`:" → Root";t.textContent=`Uploading ${x.name}${N} (${b+1}/${p})`;const L=new FormData;L.append("image",x),l&&L.append("folder",l),E=new AbortController;try{const M=await(await fetch("/api/upload",{method:"POST",body:L,signal:E.signal})).json();if(M.success){g++;const S=g/p*100;r.style.width=`${S}%`,o.textContent=`${Math.round(S)}%`;const D=(Date.now()-j)/1e3,z=x.size/D/1024;i.textContent=`${z.toFixed(1)} KB/s`;const I=(p-g)*(D/g);I>60?a.textContent=`${Math.round(I/60)} min remaining`:a.textContent=`${Math.round(I)}s remaining`}else d(`❌ Failed to upload ${x.name}: ${M.error}`,"error")}catch(k){k.name!=="AbortError"&&(console.error("Upload error:",k),d(`❌ Failed to upload ${x.name}`,"error"))}}B=!1,n.classList.add("hidden"),u||(d(`✅ Uploaded ${g} of ${p} files`,"success"),h())}function F(e){if(!e)return"0 B";const n=["B","KB","MB","GB"],t=Math.floor(Math.log(e)/Math.log(1024));return`${(e/Math.pow(1024,t)).toFixed(1)} ${n[t]}`}function T(e){return e?new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}function d(e,n="success"){const t=document.getElementById("toast");t.textContent=e,t.className=`fixed bottom-6 right-6 max-w-sm p-4 rounded-xl shadow-2xl z-50 transform transition-all duration-500 ${n==="success"?"bg-green-500 text-white":n==="error"?"bg-red-500 text-white":"bg-blue-500 text-white"}`,t.classList.remove("hidden","translate-y-20","opacity-0"),t.classList.add("translate-y-0","opacity-100"),setTimeout(()=>{t.classList.add("translate-y-20","opacity-0"),setTimeout(()=>t.classList.add("hidden"),500)},3e3)}window.addEventListener("popstate",function(e){l=e.state?.folder||"",m()});const P=document.createElement("style");P.textContent=`
    body.drag-over::before {
      content: '📤 Drop files here';
      position: fixed;
      inset: 0;
      background: rgba(37, 99, 235, 0.1);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 600;
      color: #2563eb;
      z-index: 9999;
      border: 4px dashed #2563eb;
      margin: 20px;
      border-radius: 20px;
    }
    
    .aspect-square {
      aspect-ratio: 1 / 1;
    }
  `;document.head.appendChild(P);
