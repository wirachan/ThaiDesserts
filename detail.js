// Script for detail.html - Thai Desserts Detail & Ingredients Page

let currentDessert = null;
let currentMultiplier = 1;
const checkedIngredients = new Set();
const checkedSteps = new Set();

document.addEventListener('DOMContentLoaded', () => {
  // 1. Get Dessert ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const idParam = parseInt(urlParams.get('id'), 10);

  // Find dessert or default to ID 1 (ทองหยิบ)
  currentDessert = dessertsData.find(d => d.id === idParam) || dessertsData[0];

  // 2. Initialize Page
  populateDessertSelect();
  renderDessertDetails();
  setupEventListeners();
});

// ================= RENDER DESSERT DETAILS =================
function renderDessertDetails() {
  if (!currentDessert) return;

  const d = currentDessert;
  const recipe = d.recipe || {
    servings: "4 ที่",
    prepTime: "25 นาที",
    cookTime: "25 นาที",
    difficulty: "ปานกลาง",
    ingredientsList: (d.ingredients || []).map(ing => ({ name: ing, amount: "ตามชอบ", unit: "", note: "" })),
    steps: [{ step: 1, title: "วิธีทำเบื้องต้น", desc: d.fullDesc }],
    tips: "ใช้วัตถุดิบสดใหม่เพื่อรสชาติที่ดีที่สุด",
    pairings: "ทานคู่กับชาร้อน"
  };

  // Update Page Title
  document.getElementById('pageTitle').textContent = `${d.nameTh} (${d.nameEn}) - ส่วนประกอบและสูตรวิธีทำ | เสน่ห์ขนมไทย`;

  // Breadcrumbs
  document.getElementById('breadcrumbCategory').textContent = d.categoryName;
  document.getElementById('breadcrumbCurrent').textContent = d.nameTh;

  // Pagination & Prev/Next Navigation
  const currentIndex = dessertsData.findIndex(item => item.id === d.id);
  const total = dessertsData.length;
  document.getElementById('dessertPagination').textContent = `เมนูที่ ${currentIndex + 1} / ${total}`;

  const prevItem = dessertsData[(currentIndex - 1 + total) % total];
  const nextItem = dessertsData[(currentIndex + 1) % total];

  const prevBtn = document.getElementById('prevDessertBtn');
  prevBtn.href = `detail.html?id=${prevItem.id}`;
  document.getElementById('prevDessertName').textContent = prevItem.nameTh;

  const nextBtn = document.getElementById('nextDessertBtn');
  nextBtn.href = `detail.html?id=${nextItem.id}`;
  document.getElementById('nextDessertName').textContent = nextItem.nameTh;

  // Visuals
  const dessertImg = document.getElementById('dessertImage');
  dessertImg.src = d.image;
  dessertImg.alt = d.nameTh;
  dessertImg.onerror = function() {
    this.onerror = null;
    this.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  };

  document.getElementById('dessertIcon').className = `${d.icon} mr-1.5`;
  document.getElementById('dessertCategoryText').textContent = d.categoryName;
  document.getElementById('dessertOriginText').textContent = d.origin ? d.origin.split('(')[0].trim() : 'ตำรับไทยโบราณ';

  // Tags
  const tagsContainer = document.getElementById('dessertTags');
  tagsContainer.innerHTML = (d.tags || []).map(tag => `
    <span class="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-amber-300 font-medium">
      #${tag}
    </span>
  `).join('');

  // Main Info
  document.getElementById('dessertNameTh').textContent = d.nameTh;
  document.getElementById('dessertNameEn').textContent = d.nameEn;
  document.getElementById('dessertShortDesc').textContent = d.shortDesc;
  document.getElementById('dessertMeaning').textContent = d.meaning;

  // 4-Grid Specs
  document.getElementById('recipeTime').textContent = recipe.prepTime ? `${recipe.prepTime}` : '-';
  document.getElementById('recipeDifficulty').textContent = recipe.difficulty || 'ปานกลาง';
  document.getElementById('dessertCalories').textContent = d.calories || '-';

  // Sweetness dots
  let sweetDots = '';
  for (let i = 1; i <= 5; i++) {
    sweetDots += `<span class="sweetness-dot ${i <= d.sweetness ? 'sweetness-active' : 'sweetness-inactive'}"></span>`;
  }
  document.getElementById('recipeSweetness').innerHTML = sweetDots;

  // Servings Base Text
  document.getElementById('servingsBaseText').textContent = `สูตรมาตรฐาน: ${recipe.servings || 'สำหรับ 4 ที่'}`;

  // Render Ingredients with current multiplier
  renderIngredients();

  // Chef Tip
  document.getElementById('chefTipText').textContent = recipe.tips || 'ควบคุมไฟและความร้อนให้สม่ำเสมอขณะปรุง เพื่อเนื้อสัมผัสที่เนียนนุ่มตามตำรับโบราณ';

  // Render Steps
  renderSteps();

  // Cultural History & Pairing
  document.getElementById('dessertFullDesc').textContent = d.fullDesc;
  document.getElementById('originFootnote').textContent = d.origin || 'ภูมิปัญญาชาวสยาม';
  document.getElementById('pairingText').textContent = recipe.pairings || 'รับประทานคู่กับชาสมุนไพร ชาอู่หลง หรือชามะลิร้อน';

  // Related Category
  document.getElementById('relatedCategoryTitle').textContent = d.categoryName;
  renderRelatedDesserts();

  // Sync Dropdown
  const select = document.getElementById('dessertSelect');
  if (select) select.value = d.id;
}

// ================= POPULATE SELECT DROPDOWN =================
function populateDessertSelect() {
  const select = document.getElementById('dessertSelect');
  if (!select) return;

  select.innerHTML = dessertsData.map(item => `
    <option value="${item.id}" ${item.id === currentDessert.id ? 'selected' : ''}>
      ${item.nameTh} (${item.categoryName})
    </option>
  `).join('');

  select.addEventListener('change', (e) => {
    const chosenId = parseInt(e.target.value, 10);
    window.location.href = `detail.html?id=${chosenId}`;
  });
}

// ================= MULTIPLIER & INGREDIENTS =================
function setMultiplier(multiplier) {
  currentMultiplier = multiplier;

  // Update button styles
  const btn05 = document.getElementById('btnMul05');
  const btn1 = document.getElementById('btnMul1');
  const btn2 = document.getElementById('btnMul2');

  [btn05, btn1, btn2].forEach(btn => {
    btn.className = "px-3 py-1.5 rounded-xl text-xs font-semibold transition text-slate-400 hover:text-white";
  });

  if (multiplier === 0.5) {
    btn05.className = "px-3 py-1.5 rounded-xl text-xs font-semibold transition bg-amber-400 text-slate-950 shadow";
  } else if (multiplier === 1) {
    btn1.className = "px-3 py-1.5 rounded-xl text-xs font-semibold transition bg-amber-400 text-slate-950 shadow";
  } else if (multiplier === 2) {
    btn2.className = "px-3 py-1.5 rounded-xl text-xs font-semibold transition bg-amber-400 text-slate-950 shadow";
  }

  renderIngredients();
}

function scaleAmount(amountStr, multiplier) {
  if (!amountStr) return '';
  const num = parseFloat(amountStr);
  if (isNaN(num)) return amountStr;

  const scaled = num * multiplier;
  // Format clean decimals
  return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
}

function toggleIngredientCheck(index) {
  if (checkedIngredients.has(index)) {
    checkedIngredients.delete(index);
  } else {
    checkedIngredients.add(index);
  }
  renderIngredients();
}

function resetIngredientChecks() {
  checkedIngredients.clear();
  renderIngredients();
}

function renderIngredients() {
  const container = document.getElementById('ingredientsListContainer');
  if (!container || !currentDessert) return;

  const recipe = currentDessert.recipe;
  const list = (recipe && recipe.ingredientsList) ? recipe.ingredientsList : [];

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 text-center py-6 text-slate-400 text-sm">
        ไม่มีข้อมูลส่วนผสมอย่างละเอียด
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((item, idx) => {
    const isChecked = checkedIngredients.has(idx);
    const scaledAmount = scaleAmount(item.amount, currentMultiplier);

    return `
      <div 
        onclick="toggleIngredientCheck(${idx})"
        class="cursor-pointer p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
          isChecked 
            ? 'bg-slate-900/40 border-slate-800 opacity-60' 
            : 'bg-slate-900/90 border-slate-700/80 hover:border-amber-400/50 hover:bg-slate-850 shadow-sm'
        }"
      >
        <div class="flex items-start gap-3">
          <!-- Checkbox UI -->
          <div class="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
            isChecked 
              ? 'bg-amber-400 border-amber-400 text-slate-950' 
              : 'border-slate-600 bg-slate-800 text-transparent'
          }">
            <i class="fa-solid fa-check text-[10px]"></i>
          </div>

          <!-- Name and Note -->
          <div>
            <div class="text-sm font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-white'}">
              ${item.name}
            </div>
            ${item.note ? `<div class="text-xs text-amber-200/60 mt-0.5 font-light">${item.note}</div>` : ''}
          </div>
        </div>

        <!-- Quantity Badge -->
        <div class="shrink-0 text-right">
          <span class="inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
            isChecked ? 'bg-slate-800 text-slate-400' : 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
          }">
            ${scaledAmount} ${item.unit || ''}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// ================= COOKING STEPS =================
function toggleStepCheck(stepIdx) {
  if (checkedSteps.has(stepIdx)) {
    checkedSteps.delete(stepIdx);
  } else {
    checkedSteps.add(stepIdx);
  }
  updateStepProgress();
  renderSteps();
}

function updateStepProgress() {
  const steps = (currentDessert.recipe && currentDessert.recipe.steps) ? currentDessert.recipe.steps : [];
  if (steps.length === 0) return;

  const percentage = Math.round((checkedSteps.size / steps.length) * 100);
  const progressBar = document.getElementById('stepProgressBar');
  const progressText = document.getElementById('stepProgressText');

  if (progressBar) progressBar.style.width = `${percentage}%`;
  if (progressText) progressText.textContent = `${percentage}%`;
}

function renderSteps() {
  const container = document.getElementById('stepsListContainer');
  if (!container || !currentDessert) return;

  const recipe = currentDessert.recipe;
  const steps = (recipe && recipe.steps) ? recipe.steps : [];

  if (steps.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-400 text-sm">
        กำลังรวบรวมขั้นตอนการทำอย่างละเอียด
      </div>
    `;
    return;
  }

  container.innerHTML = steps.map((st, idx) => {
    const isDone = checkedSteps.has(idx);

    return `
      <div class="glass-panel p-5 sm:p-6 rounded-2xl border transition-all ${
        isDone 
          ? 'border-emerald-500/40 bg-emerald-950/10' 
          : 'border-slate-800 hover:border-amber-400/40'
      }">
        <div class="flex items-start justify-between gap-4">
          
          <div class="flex items-start gap-4">
            <!-- Step Number Badge -->
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-md ${
              isDone 
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' 
                : 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-amber-500/20'
            }">
              ${isDone ? '<i class="fa-solid fa-check"></i>' : (st.step || idx + 1)}
            </div>

            <!-- Content -->
            <div class="space-y-1">
              <h3 class="text-base sm:text-lg font-bold ${isDone ? 'text-emerald-300 line-through' : 'text-white'}">
                ${st.title}
              </h3>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                ${st.desc}
              </p>
            </div>
          </div>

          <!-- Mark Complete Button -->
          <button 
            onclick="toggleStepCheck(${idx})"
            class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isDone 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30' 
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white hover:border-amber-400'
            }">
            ${isDone ? '✓ ทำเสร็จแล้ว' : 'ทำขั้นตอนนี้'}
          </button>

        </div>
      </div>
    `;
  }).join('');

  updateStepProgress();
}

// ================= RELATED DESSERTS =================
function renderRelatedDesserts() {
  const container = document.getElementById('relatedDessertsGrid');
  if (!container || !currentDessert) return;

  // Filter same category, excluding current
  let related = dessertsData.filter(d => d.category === currentDessert.category && d.id !== currentDessert.id);
  
  // If not enough in category, pick other desserts
  if (related.length < 3) {
    const others = dessertsData.filter(d => d.id !== currentDessert.id && !related.includes(d));
    related = related.concat(others);
  }

  related = related.slice(0, 3);

  container.innerHTML = related.map(item => `
    <a href="detail.html?id=${item.id}" class="glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-400/60 transition group flex flex-col">
      <div class="relative h-40 overflow-hidden bg-slate-900">
        <img 
          src="${item.image}" 
          alt="${item.nameTh}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
        <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950/80 text-amber-300 border border-amber-400/20">
          <i class="${item.icon} mr-1"></i> ${item.categoryName}
        </span>
      </div>
      <div class="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h4 class="text-base font-bold text-white group-hover:text-amber-300 transition">${item.nameTh}</h4>
          <p class="text-xs text-amber-200/60 font-light mb-2">${item.nameEn}</p>
          <p class="text-xs text-slate-300 line-clamp-2">${item.shortDesc}</p>
        </div>
        <div class="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-medium">
          <span>ดูส่วนผสม & วิธีทำ</span>
          <i class="fa-solid fa-arrow-right text-[11px] group-hover:translate-x-1 transition-transform"></i>
        </div>
      </div>
    </a>
  `).join('');
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast('คัดลอกลิงก์เมนูนี้สำเร็จแล้ว!');
        }).catch(() => {
          showToast('กดคัดลอกลิงก์จากแถบที่อยู่ได้เลยครับ');
        });
      } else {
        showToast('กดคัดลอกลิงก์จากแถบที่อยู่ได้เลยครับ');
      }
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2500);
}
