// เสน่ห์ขนมไทย - Main Application Script (Enhanced Search & Multi-faceted Filter System)
document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSweetness = 'all'; // 'all' | 'low' | 'medium' | 'high'
  let selectedTag = 'all';
  let currentSort = 'default'; // 'default' | 'name-asc' | 'sweetness-asc' | 'sweetness-desc' | 'calories-asc'

  // DOM Elements
  const dessertGrid = document.getElementById('dessertGrid');
  const dessertCountBadge = document.getElementById('dessertCountBadge');
  const emptyState = document.getElementById('emptyState');
  const categoryFilters = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const sweetnessFilter = document.getElementById('sweetnessFilter');
  const sortFilter = document.getElementById('sortFilter');
  const quickTags = document.getElementById('quickTags');
  const activeFiltersContainer = document.getElementById('activeFiltersContainer');
  const resetFilterBtn = document.getElementById('resetFilterBtn');
  const randomizeBtn = document.getElementById('randomizeBtn');
  const randomResult = document.getElementById('randomResult');
  const randomizerHint = document.getElementById('randomizerHint');
  const cultureCardsContainer = document.getElementById('cultureCardsContainer');
  const dessertModal = document.getElementById('dessertModal');
  const modalBody = document.getElementById('modalBody');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // ================= 1. HELPER: TEXT HIGHLIGHTING =================
  function highlightText(text, query) {
    if (!text) return '';
    if (!query || query.trim() === '') return text;
    
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // ================= 2. HELPER: PARSE CALORIES =================
  function parseCalories(calStr) {
    if (!calStr) return 0;
    const match = calStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  // ================= 3. RENDER CATEGORY PILLS =================
  function renderCategories() {
    categoryFilters.innerHTML = categories.map(cat => {
      const isActive = cat.id === currentCategory;
      const count = cat.id === 'all' 
        ? dessertsData.length 
        : dessertsData.filter(d => d.category === cat.id).length;

      return `
        <button 
          data-category="${cat.id}"
          class="category-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border ${
            isActive 
              ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold shadow-md shadow-amber-400/20 scale-105' 
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-amber-400/60 hover:text-white'
          }">
          <i class="${cat.icon} ${isActive ? 'text-slate-950' : 'text-amber-400'}"></i>
          <span>${cat.name}</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] ${
            isActive ? 'bg-slate-900 text-amber-300' : 'bg-slate-800 text-slate-400'
          }">${count}</span>
        </button>
      `;
    }).join('');

    // Attach click events
    categoryFilters.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-category');
        renderCategories();
        filterAndRenderDesserts();
      });
    });
  }

  // ================= 4. RENDER QUICK TAGS =================
  function renderQuickTags() {
    // Select curated popular tags
    const popularTags = [
      'ขนมมงคล', 'ชาววัง', 'กะทิสด', 'หอมใบเตย', 
      'หาทานยาก', 'งานแต่งงาน', 'น้ำตาลโตนด', 'เหนียวนุ่ม'
    ];

    quickTags.innerHTML = popularTags.map(tag => {
      const isSelected = selectedTag === tag;
      return `
        <button 
          onclick="filterByTag('${tag}')"
          class="tag-chip px-2.5 py-1 rounded-lg text-[11px] border transition ${
            isSelected 
              ? 'bg-amber-400/25 border-amber-400 text-amber-300 font-semibold shadow-sm shadow-amber-400/20' 
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-amber-400/60 hover:text-amber-200'
          }">
          #${tag}
        </button>
      `;
    }).join('');
  }

  // ================= 5. RENDER ACTIVE FILTER CHIPS =================
  function renderActiveFilters() {
    const activeChips = [];

    // Category chip
    if (currentCategory !== 'all') {
      const catObj = categories.find(c => c.id === currentCategory);
      const catName = catObj ? catObj.name : currentCategory;
      activeChips.push(`
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-400/15 border border-amber-400/40 text-amber-200">
          <span>หมวด: <strong>${catName}</strong></span>
          <button onclick="removeFilter('category')" class="hover:text-white ml-0.5" aria-label="ลบตัวกรองหมวดหมู่">
            <i class="fa-solid fa-xmark text-[11px]"></i>
          </button>
        </span>
      `);
    }

    // Sweetness chip
    if (currentSweetness !== 'all') {
      let sweetLabel = '';
      if (currentSweetness === 'low') sweetLabel = 'หวานน้อย (1-2)';
      else if (currentSweetness === 'medium') sweetLabel = 'หวานปานกลาง (3)';
      else if (currentSweetness === 'high') sweetLabel = 'หวานฉ่ำ (4-5)';

      activeChips.push(`
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-400/15 border border-amber-400/40 text-amber-200">
          <span>ความหวาน: <strong>${sweetLabel}</strong></span>
          <button onclick="removeFilter('sweetness')" class="hover:text-white ml-0.5" aria-label="ลบตัวกรองความหวาน">
            <i class="fa-solid fa-xmark text-[11px]"></i>
          </button>
        </span>
      `);
    }

    // Tag chip
    if (selectedTag !== 'all') {
      activeChips.push(`
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-400/15 border border-amber-400/40 text-amber-200">
          <span>แท็ก: <strong>#${selectedTag}</strong></span>
          <button onclick="removeFilter('tag')" class="hover:text-white ml-0.5" aria-label="ลบตัวกรองแท็ก">
            <i class="fa-solid fa-xmark text-[11px]"></i>
          </button>
        </span>
      `);
    }

    // Search query chip
    if (searchQuery.trim() !== '') {
      activeChips.push(`
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-amber-400/15 border border-amber-400/40 text-amber-200">
          <span>ค้นหา: "<strong>${searchQuery.trim()}</strong>"</span>
          <button onclick="removeFilter('search')" class="hover:text-white ml-0.5" aria-label="ล้างคำค้นหา">
            <i class="fa-solid fa-xmark text-[11px]"></i>
          </button>
        </span>
      `);
    }

    // Clear all button if any filter active
    if (activeChips.length > 0) {
      activeChips.push(`
        <button 
          onclick="clearAllFilters()" 
          class="text-xs text-amber-400 hover:text-amber-300 underline font-medium ml-1 flex items-center gap-1">
          <i class="fa-solid fa-rotate-left text-[11px]"></i> ล้างตัวกรองทั้งหมด
        </button>
      `);
      activeFiltersContainer.innerHTML = activeChips.join('');
      activeFiltersContainer.classList.remove('hidden');
    } else {
      activeFiltersContainer.innerHTML = '';
      activeFiltersContainer.classList.add('hidden');
    }
  }

  // ================= 6. SWEETNESS DOTS GENERATOR =================
  function renderSweetnessDots(level) {
    let dots = '';
    for (let i = 1; i <= 5; i++) {
      dots += `<span class="sweetness-dot ${i <= level ? 'sweetness-active' : 'sweetness-inactive'}"></span>`;
    }
    return dots;
  }

  // ================= 7. RENDER DESSERT CARDS =================
  function renderDessertCards(items) {
    if (items.length === 0) {
      dessertGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      dessertCountBadge.textContent = '0 เมนู';
      return;
    }

    emptyState.classList.add('hidden');
    dessertCountBadge.textContent = `${items.length} เมนู`;

    dessertGrid.innerHTML = items.map(dessert => {
      const highlightedNameTh = highlightText(dessert.nameTh, searchQuery);
      const highlightedNameEn = highlightText(dessert.nameEn, searchQuery);
      const highlightedDesc = highlightText(dessert.shortDesc, searchQuery);

      return `
        <div class="dessert-card glass-panel rounded-2xl overflow-hidden border border-slate-800/90 flex flex-col group">
          <!-- Card Image Container -->
          <div class="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-800">
            <img 
              src="${dessert.image}" 
              alt="${dessert.nameTh}" 
              loading="lazy"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            
            <!-- Category Tag -->
            <span class="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-950/70 backdrop-blur-md text-amber-300 border border-amber-400/20">
              <i class="${dessert.icon} mr-1"></i> ${dessert.categoryName}
            </span>

            <!-- Sweetness Indicator -->
            <div class="absolute bottom-2.5 right-3 flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-md text-[11px] text-amber-200">
              <span>หวาน:</span>
              <div class="flex items-center ml-1">
                ${renderSweetnessDots(dessert.sweetness)}
              </div>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-5 flex-grow flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">${highlightedNameTh}</h3>
              </div>
              <p class="text-xs text-amber-200/60 font-light mb-2.5">${highlightedNameEn}</p>
              
              <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                ${highlightedDesc}
              </p>
            </div>

            <!-- Tags & Meaning Preview -->
            <div class="pt-2 border-t border-slate-800/80 space-y-3">
              <div class="flex flex-wrap gap-1.5">
                ${dessert.tags.map(tag => {
                  const isCurrent = selectedTag === tag;
                  return `
                    <button 
                      onclick="filterByTag('${tag}')" 
                      class="text-[10px] px-2 py-0.5 rounded-full border transition ${
                        isCurrent 
                          ? 'bg-amber-400/30 text-amber-200 border-amber-400 font-semibold' 
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:border-amber-400/50 hover:text-amber-300'
                      }">
                      #${tag}
                    </button>
                  `;
                }).join('')}
              </div>

              <!-- Action button -->
              <button 
                onclick="openModalById(${dessert.id})"
                class="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-gradient-to-r hover:from-amber-500 hover:to-yellow-400 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-amber-400 transition-all flex items-center justify-center gap-2">
                <i class="fa-solid fa-book-open text-xs"></i>
                <span>ดูประวัติ & ส่วนผสม</span>
              </button>
            </div>

          </div>
        </div>
      `;
    }).join('');
  }

  // ================= 8. MULTI-FACETED FILTER & SORT PIPELINE =================
  function filterAndRenderDesserts() {
    let results = [...dessertsData];

    // 1. Filter by Category
    if (currentCategory !== 'all') {
      results = results.filter(item => item.category === currentCategory);
    }

    // 2. Filter by Sweetness Level
    if (currentSweetness === 'low') {
      results = results.filter(item => item.sweetness <= 2);
    } else if (currentSweetness === 'medium') {
      results = results.filter(item => item.sweetness === 3);
    } else if (currentSweetness === 'high') {
      results = results.filter(item => item.sweetness >= 4);
    }

    // 3. Filter by Selected Tag
    if (selectedTag !== 'all') {
      results = results.filter(item => item.tags && item.tags.includes(selectedTag));
    }

    // 4. Filter by Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      results = results.filter(item => {
        return item.nameTh.toLowerCase().includes(q) ||
               item.nameEn.toLowerCase().includes(q) ||
               item.shortDesc.toLowerCase().includes(q) ||
               item.fullDesc.toLowerCase().includes(q) ||
               item.meaning.toLowerCase().includes(q) ||
               item.tags.some(tag => tag.toLowerCase().includes(q)) ||
               item.ingredients.some(ing => ing.toLowerCase().includes(q));
      });
    }

    // 5. Sort Results
    if (currentSort === 'name-asc') {
      results.sort((a, b) => a.nameTh.localeCompare(b.nameTh, 'th'));
    } else if (currentSort === 'sweetness-asc') {
      results.sort((a, b) => a.sweetness - b.sweetness);
    } else if (currentSort === 'sweetness-desc') {
      results.sort((a, b) => b.sweetness - a.sweetness);
    } else if (currentSort === 'calories-asc') {
      results.sort((a, b) => parseCalories(a.calories) - parseCalories(b.calories));
    }

    // Render components
    renderDessertCards(results);
    renderActiveFilters();
    renderQuickTags();
  }

  // ================= 9. FILTER & SORT EVENT LISTENERS =================
  // Search input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.classList.toggle('hidden', searchQuery === '');
    filterAndRenderDesserts();
  });

  // Clear search button
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    filterAndRenderDesserts();
    searchInput.focus();
  });

  // Sweetness dropdown
  sweetnessFilter.addEventListener('change', (e) => {
    currentSweetness = e.target.value;
    filterAndRenderDesserts();
  });

  // Sort dropdown
  sortFilter.addEventListener('change', (e) => {
    currentSort = e.target.value;
    filterAndRenderDesserts();
  });

  // Empty state reset button
  resetFilterBtn.addEventListener('click', () => {
    clearAllFilters();
  });

  // ================= 10. GLOBAL ACTIONS (EXPOSED TO WINDOW) =================
  window.filterByTag = function(tag) {
    if (selectedTag === tag) {
      selectedTag = 'all'; // toggle off if already active
    } else {
      selectedTag = tag;
    }
    filterAndRenderDesserts();
  };

  window.removeFilter = function(type) {
    if (type === 'category') {
      currentCategory = 'all';
      renderCategories();
    } else if (type === 'sweetness') {
      currentSweetness = 'all';
      sweetnessFilter.value = 'all';
    } else if (type === 'tag') {
      selectedTag = 'all';
    } else if (type === 'search') {
      searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
    }
    filterAndRenderDesserts();
  };

  window.clearAllFilters = function() {
    currentCategory = 'all';
    searchQuery = '';
    currentSweetness = 'all';
    selectedTag = 'all';
    currentSort = 'default';

    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    sweetnessFilter.value = 'all';
    sortFilter.value = 'default';

    renderCategories();
    filterAndRenderDesserts();
  };

  // ================= 11. RANDOMIZER =================
  let isRandomizing = false;

  randomizeBtn.addEventListener('click', () => {
    if (isRandomizing) return;
    isRandomizing = true;
    randomizeBtn.disabled = true;

    randomResult.classList.remove('hidden');
    randomizerHint.classList.add('hidden');

    let count = 0;
    const interval = setInterval(() => {
      const tempPick = dessertsData[Math.floor(Math.random() * dessertsData.length)];
      randomResult.innerHTML = `
        <div class="py-6 flex flex-col items-center justify-center animate-pulse">
          <i class="${tempPick.icon} text-4xl text-amber-400 mb-2"></i>
          <p class="text-xl font-bold text-amber-300">${tempPick.nameTh}</p>
          <p class="text-xs text-slate-400">กำลังสุ่มสำรับหวาน...</p>
        </div>
      `;
      count++;

      if (count > 8) {
        clearInterval(interval);
        finalizeRandomSelection();
      }
    }, 80);
  });

  function finalizeRandomSelection() {
    const chosen = dessertsData[Math.floor(Math.random() * dessertsData.length)];
    
    randomResult.innerHTML = `
      <div class="mt-4 p-5 rounded-xl bg-slate-900/90 border border-amber-400/40 text-left animate-modal shadow-2xl">
        <div class="flex flex-col sm:flex-row items-center gap-5">
          <img 
            src="${chosen.image}" 
            alt="${chosen.nameTh}" 
            class="w-full sm:w-36 h-36 object-cover rounded-xl border border-amber-400/30"
          />
          <div class="space-y-2 flex-grow">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] bg-amber-400/20 text-amber-300 font-medium">
                ${chosen.categoryName}
              </span>
              <span class="text-xs text-slate-400">${chosen.calories}</span>
            </div>
            <h3 class="text-2xl font-bold text-white">${chosen.nameTh}</h3>
            <p class="text-xs text-amber-200/70">${chosen.nameEn}</p>
            <p class="text-xs text-slate-300 leading-relaxed">${chosen.shortDesc}</p>
            
            <div class="pt-2 flex flex-wrap items-center gap-3">
              <button 
                onclick="openModalById(${chosen.id})" 
                class="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 shadow hover:scale-105 transition">
                <i class="fa-solid fa-sparkles mr-1"></i> ดูเรื่องราว & ส่วนผสม
              </button>
              <span class="text-xs text-amber-300/80 italic font-light">
                <i class="fa-solid fa-quote-left mr-1"></i> ${chosen.meaning.slice(0, 45)}...
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    isRandomizing = false;
    randomizeBtn.disabled = false;
  }

  // ================= 12. CULTURE SECTION CARDS =================
  function renderCultureSection() {
    cultureCardsContainer.innerHTML = thaiDessertFacts.map(fact => {
      return `
        <div class="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-amber-400/40 transition group">
          <div class="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
            <i class="${fact.icon}"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">${fact.title}</h3>
          <p class="text-xs text-amber-400/80 mb-3">${fact.subtitle}</p>
          <p class="text-xs text-slate-300 leading-relaxed">${fact.desc}</p>
        </div>
      `;
    }).join('');
  }

  // ================= 13. MODAL LOGIC =================
  window.openModalById = function(id) {
    const item = dessertsData.find(d => d.id === id);
    if (!item) return;

    modalBody.innerHTML = `
      <!-- Modal Header Banner -->
      <div class="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-800">
        <img 
          src="${item.image}" 
          alt="${item.nameTh}" 
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

        <div class="absolute bottom-4 left-6 right-6">
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-slate-950">
              ${item.categoryName}
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs bg-slate-900/80 text-slate-300 border border-slate-700">
              ${item.calories}
            </span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-bold text-white">${item.nameTh}</h2>
          <p class="text-xs sm:text-sm text-amber-300/80">${item.nameEn}</p>
        </div>
      </div>

      <!-- Modal Content Body -->
      <div class="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        
        <!-- Auspicious Meaning Box -->
        <div class="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-yellow-950/20 border border-amber-500/30">
          <div class="flex items-center gap-2 text-amber-300 text-sm font-semibold mb-1.5">
            <i class="fa-solid fa-award"></i>
            <span>ความหมายมงคล</span>
          </div>
          <p class="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            "${item.meaning}"
          </p>
        </div>

        <!-- Sweetness & Origin Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span class="text-xs text-slate-400 block mb-1">ระดับความหวาน</span>
            <div class="flex items-center gap-1.5">
              ${renderSweetnessDots(item.sweetness)}
              <span class="text-xs text-amber-300 ml-2 font-medium">ระดับ ${item.sweetness}/5</span>
            </div>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span class="text-xs text-slate-400 block mb-1">ยุคสมัย & ถิ่นกำเนิด</span>
            <p class="text-xs text-slate-200 font-medium">${item.origin}</p>
          </div>
        </div>

        <!-- Full Story -->
        <div>
          <h4 class="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-feather text-amber-400"></i> ประวัติและตำรับขนม
          </h4>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ${item.fullDesc}
          </p>
        </div>

        <!-- Ingredients List -->
        <div>
          <h4 class="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-kitchen-set text-amber-400"></i> วัตถุดิบสำคัญ
          </h4>
          <div class="flex flex-wrap gap-2">
            ${item.ingredients.map(ing => `
              <span class="px-3 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700/70">
                • ${ing}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Tags -->
        <div class="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
          ${item.tags.map(t => `
            <button onclick="closeModal(); filterByTag('${t}')" class="text-xs text-amber-400/80 hover:text-amber-300 hover:underline">
              #${t}
            </button>
          `).join('')}
        </div>

      </div>
    `;

    dessertModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  };

  function closeModal() {
    dessertModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  closeModalBtn.addEventListener('click', closeModal);
  dessertModal.addEventListener('click', (e) => {
    if (e.target === dessertModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dessertModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // ================= 14. MOBILE MENU TOGGLE =================
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });

  // ================= 15. BACK TO TOP =================
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
    } else {
      backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ================= 16. INITIALIZATION =================
  renderCategories();
  renderQuickTags();
  filterAndRenderDesserts();
  renderCultureSection();
});
