document.addEventListener("DOMContentLoaded",function(){const m=document.getElementById("name"),p=document.getElementById("slug");m&&p&&m.addEventListener("input",function(){if(!p.value){const e=this.value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");p.value=e}});const l=document.getElementById("uploadBtn"),u=document.getElementById("cover_image"),d=document.getElementById("coverPreview"),f=document.getElementById("coverPreviewImg"),v=document.getElementById("removeCoverBtn");l&&l.addEventListener("click",function(){const e=document.createElement("input");e.type="file",e.accept="image/*",e.onchange=async function(i){const s=i.target.files[0];if(!s)return;const c=l.textContent;l.textContent="⏳ Uploading...",l.disabled=!0;try{const o=new FormData;o.append("image",s);const n=await(await fetch("/api/upload",{method:"POST",body:o})).json();n.success?(u.value=n.url,f.src=n.url,d.classList.remove("hidden")):alert("Upload failed: "+(n.error||"Unknown error"))}catch(o){console.error("Upload error:",o),alert("Upload failed: "+o.message)}finally{l.textContent=c,l.disabled=!1}},e.click()}),v&&v.addEventListener("click",function(){u.value="",d.classList.add("hidden")}),u&&u.addEventListener("input",function(){const e=this.value.trim();e?(f.src=e,d.classList.remove("hidden")):d.classList.add("hidden")}),document.querySelectorAll(".resource-platform").forEach(function(e){e.addEventListener("change",function(){const s=this.closest(".resource-row").querySelector(".shop-name-group");this.value==="shop"?s.style.display="block":s.style.display="none"})});let r=4;const h=document.getElementById("addResourceRow"),a=document.getElementById("resourcesContainer");h&&a&&h.addEventListener("click",function(){const e=document.createElement("div");e.className="resource-row",e.innerHTML=`
          <div class="resource-header">
            <span class="resource-number">#${r+1}</span>
            <button type="button" class="remove-resource-btn">✕</button>
          </div>
          <div class="resource-fields">
            <div class="form-group">
              <label>Platform *</label>
              <select name="resource_platform_${r}" class="resource-platform form-select">
                <option value="">Select</option>
                <option value="reddit">Reddit</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="shop">Shop</option>
              </select>
            </div>
            <div class="form-group">
              <label>URL *</label>
              <input type="url" name="resource_url_${r}" placeholder="https://..." class="form-input" />
            </div>
            <div class="form-group">
              <label>Title *</label>
              <input type="text" name="resource_title_${r}" placeholder="Resource title" class="form-input" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <input type="text" name="resource_description_${r}" placeholder="Optional description" class="form-input" />
            </div>
            <div class="form-group">
              <label>Author</label>
              <input type="text" name="resource_author_${r}" placeholder="u/username" class="form-input" />
            </div>
            <div class="form-group shop-name-group" style="display:none;">
              <label>Shop Name</label>
              <input type="text" name="resource_shop_name_${r}" placeholder="e.g. Amazon" class="form-input" />
            </div>
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" name="resource_featured_${r}" />
                <span>⭐ Featured</span>
              </label>
            </div>
          </div>
        `,a.appendChild(e),r++,a.querySelectorAll(".resource-row").forEach(function(o,t){const n=o.querySelector(".remove-resource-btn");n&&(t>=4?n.style.display="block":n.style.display="none")});const s=e.querySelector(".resource-platform");s&&s.addEventListener("change",function(){const t=this.closest(".resource-row").querySelector(".shop-name-group");this.value==="shop"?t.style.display="block":t.style.display="none"});const c=e.querySelector(".remove-resource-btn");c&&c.addEventListener("click",function(){confirm("Remove this resource?")&&(e.remove(),a.querySelectorAll(".resource-row").forEach(function(t,n){const y=t.querySelector(".resource-number");y&&(y.textContent="#"+(n+1))}))})}),document.querySelectorAll(".remove-resource-btn").forEach(function(e){e.addEventListener("click",function(){const i=this.closest(".resource-row");confirm("Remove this resource?")&&(i.remove(),a.querySelectorAll(".resource-row").forEach(function(c,o){const t=c.querySelector(".resource-number");t&&(t.textContent="#"+(o+1))}))})})});
