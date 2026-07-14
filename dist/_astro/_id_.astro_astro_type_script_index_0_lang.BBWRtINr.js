const f=document.getElementById("cover_image"),u=document.getElementById("coverPreview"),E=document.getElementById("coverPreviewImg"),I=document.getElementById("removeCoverBtn"),c=document.getElementById("uploadBtn");function B(){const n=f.value.trim();n?(E.src=n,u.classList.remove("hidden")):u.classList.add("hidden")}I.addEventListener("click",()=>{f.value="",u.classList.add("hidden")});c.addEventListener("click",()=>{const n=document.createElement("input");n.type="file",n.accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml",n.onchange=async a=>{const t=a.target.files[0];if(!t)return;c.disabled=!0,c.textContent="⏳ Uploading...";const o=document.getElementById("statusMessage");o.className="p-4 rounded-xl bg-blue-50 text-blue-700",o.textContent=`⏳ Uploading ${t.name}...`,o.classList.remove("hidden");try{const s=new FormData;s.append("image",t);const r=await fetch("/api/upload",{method:"POST",body:s});if(!r.ok){const d=await r.json();throw new Error(d.error||"Upload failed")}const e=await r.json();if(e.success)f.value=e.url,B(),o.className="p-4 rounded-xl bg-green-50 text-green-700",o.textContent="✅ Image uploaded successfully!",setTimeout(()=>{o.classList.add("hidden")},3e3);else throw new Error(e.error||"Upload failed")}catch(s){console.error("Upload error:",s),o.className="p-4 rounded-xl bg-red-50 text-red-700",o.textContent=`❌ Upload failed: ${s.message}`}finally{c.disabled=!1,c.textContent="📤 Upload"}},n.click()});document.getElementById("mediaLibraryBtn").addEventListener("click",async function(){try{const a=await(await fetch("/api/admin/media")).json();if(!a.success){alert("Failed to load media library");return}const t=a.media||[],o=a.folders||[];if(t.length===0&&o.length===0){alert("No media found. Please upload some images first.");return}const s=document.createElement("div");s.className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",s.innerHTML=`
        <div class="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Media Library</h2>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">&times;</button>
          </div>
          <div class="p-4 overflow-y-auto flex-1" id="mediaModalContent">
            <div id="modalFolderNav" class="flex items-center gap-2 mb-4 text-sm">
              <button onclick="renderModalFolder('')" class="text-blue-600 hover:text-blue-800 font-medium">📁 Root</button>
              <span id="modalFolderPath" class="text-gray-400"></span>
            </div>
            <div id="modalMediaGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              ${h(t,o,"")}
            </div>
          </div>
          <div class="p-3 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
            Click on any image to insert it into your content
          </div>
        </div>
      `,document.body.appendChild(s),window.modalData={mediaItems:t,folders:o,currentFolder:""}}catch(n){console.error("Error opening media library:",n),alert("Failed to open media library: "+n.message)}});function h(n,a,t){const o=a.filter(e=>t?e.startsWith(t+"/")&&e.split("/").length===t.split("/").length+1:!e.includes("/")),s=n.filter(e=>t?e.folder===t:!e.folder||e.folder==="");let r="";return o.forEach(e=>{const d=e.split("/").pop();r+=`
        <div class="cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200" onclick="renderModalFolder('${e}')">
          <div class="aspect-square flex flex-col items-center justify-center p-4">
            <div class="text-5xl mb-2">📁</div>
            <p class="text-sm font-semibold text-gray-700 text-center truncate w-full">${d}</p>
          </div>
        </div>
      `}),s.forEach(e=>{const d=e.mime_type&&e.mime_type.startsWith("video/"),l=e.url||"",i=e.alt_text||e.original_name||"Image",w=e.original_name||e.filename.split("/").pop()||"Unknown";r+=`
        <div class="cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700" onclick="insertMedia('${l}', '${i}')">
          <div class="aspect-square bg-gray-100 dark:bg-gray-600 relative">
            ${d?`
              <div class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                <span class="text-4xl">🎬</span>
              </div>
            `:`
              <img src="${l}" alt="${i}" class="w-full h-full object-cover" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%239ca3af%22 font-size=%2216%22%3ENo Image%3C/text%3E%3C/svg%3E'" />
            `}
            <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
              ${w}
            </div>
          </div>
        </div>
      `}),r===""&&(r=`
        <div class="col-span-full text-center py-8 text-gray-500">
          <p>📂 This folder is empty</p>
        </div>
      `),r}window.renderModalFolder=function(n){const{mediaItems:a,folders:t}=window.modalData,o=document.getElementById("modalMediaGrid"),s=document.getElementById("modalFolderPath");if(window.modalData.currentFolder=n,o.innerHTML=h(a,t,n),n){const r=n.split("/");let e=' <span class="text-gray-400 mx-1">/</span> ',d="";r.forEach((l,i)=>{d+=(i>0?"/":"")+l,e+=`<button onclick="renderModalFolder('${d}')" class="text-blue-600 hover:text-blue-800 font-medium">${l}</button>`,i<r.length-1&&(e+=' <span class="text-gray-400 mx-1">/</span> ')}),s.innerHTML=e}else s.innerHTML=""};window.insertMedia=function(n,a){const t=document.getElementById("content"),o=`<img src="${n}" alt="${a||"Image"}" />`,s=t.selectionStart,r=t.selectionEnd,e=t.value;t.value=e.substring(0,s)+o+e.substring(r),t.dispatchEvent(new Event("input")),t.focus(),v();const d=document.querySelector(".fixed.bg-black\\/50");d&&d.remove();const l=document.getElementById("statusMessage");l.className="p-4 rounded-xl bg-green-50 text-green-700",l.textContent="✅ Image inserted into content!",l.classList.remove("hidden"),setTimeout(()=>{l.classList.add("hidden")},2e3)};const p=document.getElementById("content"),b=document.getElementById("preview"),x=document.getElementById("charCount"),g=document.getElementById("togglePreview");let m=!0;function v(){const n=p.value;b.innerHTML=n||'<p class="text-gray-400 italic">Start writing HTML to see the preview...</p>',x&&(x.textContent=n.length)}g&&g.addEventListener("click",()=>{m=!m,b.style.display=m?"block":"none",g.textContent=m?"Hide Preview":"Show Preview"});p&&(p.addEventListener("input",v),v());const y=document.getElementById("editForm");y&&y.addEventListener("submit",async function(n){n.preventDefault();const a=document.getElementById("submitBtn"),t=document.getElementById("statusMessage");a.textContent="Updating...",a.disabled=!0,t.className="p-4 rounded-xl bg-blue-50 text-blue-700",t.textContent="⏳ Updating post...",t.classList.remove("hidden");try{const o=window.location.pathname.split("/").pop(),s={title:document.getElementById("title").value.trim(),slug:document.getElementById("slug").value.trim(),content:document.getElementById("content").value,category:document.getElementById("category").value,tags:document.getElementById("tags").value,cover_image:document.getElementById("cover_image").value.trim(),is_draft:document.getElementById("is_draft").checked?"1":"0",is_published:document.getElementById("is_published").checked?"1":"0"};console.log("📤 Updating post",o,":",s);const r=await fetch(`/api/admin/posts/${o}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)}),e=await r.json();if(console.log("📥 Response:",e),!r.ok)throw new Error(e.error||"Failed to update post");t.className="p-4 rounded-xl bg-green-50 text-green-700",t.textContent="✅ Post updated successfully! Redirecting...",a.textContent="Updated!",setTimeout(()=>{window.location.href="/admin/dashboard?success=post-updated"},1e3)}catch(o){console.error("❌ Error:",o),t.className="p-4 rounded-xl bg-red-50 text-red-700",t.textContent="❌ "+o.message,a.textContent="Update Post",a.disabled=!1}});
