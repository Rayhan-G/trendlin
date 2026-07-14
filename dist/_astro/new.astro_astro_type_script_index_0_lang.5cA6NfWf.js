const u=document.getElementById("cover_image"),g=document.getElementById("coverPreview"),y=document.getElementById("coverPreviewImg"),w=document.getElementById("removeCoverBtn"),c=document.getElementById("uploadBtn");function E(){const n=u.value.trim();n?(y.src=n,g.classList.remove("hidden")):g.classList.add("hidden")}w.addEventListener("click",()=>{u.value="",g.classList.add("hidden")});c.addEventListener("click",()=>{const n=document.createElement("input");n.type="file",n.accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml",n.onchange=async r=>{const t=r.target.files[0];if(!t)return;c.disabled=!0,c.textContent="⏳ Uploading...";const o=document.getElementById("statusMessage");o.className="p-4 rounded-xl bg-blue-50 text-blue-700",o.textContent=`⏳ Uploading ${t.name}...`,o.classList.remove("hidden");try{const s=new FormData;s.append("image",t);const a=await fetch("/api/upload",{method:"POST",body:s});if(!a.ok){const d=await a.json();throw new Error(d.error||"Upload failed")}const e=await a.json();if(e.success)u.value=e.url,E(),o.className="p-4 rounded-xl bg-green-50 text-green-700",o.textContent="✅ Image uploaded successfully!",setTimeout(()=>{o.classList.add("hidden")},3e3);else throw new Error(e.error||"Upload failed")}catch(s){console.error("Upload error:",s),o.className="p-4 rounded-xl bg-red-50 text-red-700",o.textContent=`❌ Upload failed: ${s.message}`}finally{c.disabled=!1,c.textContent="📤 Upload"}},n.click()});document.getElementById("mediaLibraryBtn").addEventListener("click",async function(){try{const r=await(await fetch("/api/admin/media")).json();if(!r.success){alert("Failed to load media library");return}const t=r.media||[],o=r.folders||[];if(t.length===0&&o.length===0){alert("No media found. Please upload some images first.");return}const s=document.createElement("div");s.className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",s.innerHTML=`
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
              ${f(t,o,"")}
            </div>
          </div>
          <div class="p-3 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
            Click on any image to insert it into your content
          </div>
        </div>
      `,document.body.appendChild(s),window.modalData={mediaItems:t,folders:o,currentFolder:""}}catch(n){console.error("Error opening media library:",n),alert("Failed to open media library: "+n.message)}});function f(n,r,t){const o=r.filter(e=>t?e.startsWith(t+"/")&&e.split("/").length===t.split("/").length+1:!e.includes("/")),s=n.filter(e=>t?e.folder===t:!e.folder||e.folder==="");let a="";return o.forEach(e=>{const d=e.split("/").pop();a+=`
        <div class="cursor-pointer hover:ring-2 hover:ring-blue-500 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200" onclick="renderModalFolder('${e}')">
          <div class="aspect-square flex flex-col items-center justify-center p-4">
            <div class="text-5xl mb-2">📁</div>
            <p class="text-sm font-semibold text-gray-700 text-center truncate w-full">${d}</p>
          </div>
        </div>
      `}),s.forEach(e=>{const d=e.mime_type&&e.mime_type.startsWith("video/"),l=e.url||"",i=e.alt_text||e.original_name||"Image",h=e.original_name||e.filename.split("/").pop()||"Unknown";a+=`
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
              ${h}
            </div>
          </div>
        </div>
      `}),a===""&&(a=`
        <div class="col-span-full text-center py-8 text-gray-500">
          <p>📂 This folder is empty</p>
        </div>
      `),a}window.renderModalFolder=function(n){const{mediaItems:r,folders:t}=window.modalData,o=document.getElementById("modalMediaGrid"),s=document.getElementById("modalFolderPath");if(window.modalData.currentFolder=n,o.innerHTML=f(r,t,n),n){const a=n.split("/");let e=' <span class="text-gray-400 mx-1">/</span> ',d="";a.forEach((l,i)=>{d+=(i>0?"/":"")+l,e+=`<button onclick="renderModalFolder('${d}')" class="text-blue-600 hover:text-blue-800 font-medium">${l}</button>`,i<a.length-1&&(e+=' <span class="text-gray-400 mx-1">/</span> ')}),s.innerHTML=e}else s.innerHTML=""};window.insertMedia=function(n,r){const t=document.getElementById("content"),o=`<img src="${n}" alt="${r||"Image"}" />`,s=t.selectionStart,a=t.selectionEnd,e=t.value;t.value=e.substring(0,s)+o+e.substring(a),t.dispatchEvent(new Event("input")),t.focus(),p();const d=document.querySelector(".fixed.bg-black\\/50");d&&d.remove();const l=document.getElementById("statusMessage");l.className="p-4 rounded-xl bg-green-50 text-green-700",l.textContent="✅ Image inserted into content!",l.classList.remove("hidden"),setTimeout(()=>{l.classList.add("hidden")},2e3)};const x=document.getElementById("content"),b=document.getElementById("preview"),I=document.getElementById("charCount"),v=document.getElementById("togglePreview");let m=!0;function p(){const n=x.value;b.innerHTML=n||'<p class="text-gray-400 italic">Start writing HTML to see the preview...</p>',I.textContent=n.length}v.addEventListener("click",()=>{m=!m,b.style.display=m?"block":"none",v.textContent=m?"Hide Preview":"Show Preview"});x.addEventListener("input",p);p();document.getElementById("postForm").addEventListener("submit",async function(n){n.preventDefault();const r=document.getElementById("submitBtn"),t=document.getElementById("statusMessage");r.textContent="Publishing...",r.disabled=!0,t.className="p-4 rounded-xl bg-blue-50 text-blue-700",t.textContent="⏳ Publishing post...",t.classList.remove("hidden");try{let o=document.getElementById("slug").value.trim();const s=document.getElementById("title").value.trim();!o&&s&&(o=s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""));const a={title:s,slug:o,content:document.getElementById("content").value,category:document.getElementById("category").value,tags:document.getElementById("tags").value,cover_image:document.getElementById("cover_image").value.trim(),is_draft:document.getElementById("is_draft").checked?"1":"0",is_published:document.getElementById("is_published").checked?"1":"0"};console.log("📤 Sending:",a);const e=await fetch("/api/admin/posts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)}),d=await e.json();if(console.log("📥 Response:",d),!e.ok)throw new Error(d.error||"Failed to create post");t.className="p-4 rounded-xl bg-green-50 text-green-700",t.textContent="✅ Post published successfully! Redirecting...",r.textContent="Published!",setTimeout(()=>{window.location.href=d.redirect||"/admin/dashboard?success=post-created"},1e3)}catch(o){console.error("❌ Error:",o),t.className="p-4 rounded-xl bg-red-50 text-red-700",t.textContent="❌ "+o.message,r.textContent="Publish Post",r.disabled=!1}});
