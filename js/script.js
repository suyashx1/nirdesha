/**
 * Nirdesha — Government Portal Boilerplate Client Script
 * Accessible, Lightweight Vanilla JavaScript with Regional Translation Engine
 */

// Global list of prominent Indian languages (8th Schedule + Official public sector use)
const INDIAN_LANGUAGES = [
  { code: 'en', native: 'English', english: 'English (Default)', region: 'National / Administrative' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', region: 'Union Official (Central Administration)' },
  { code: 'mr', native: 'मराठी', english: 'Marathi', region: 'Maharashtra, Goa & Western Zone' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu', region: 'Andhra Pradesh & Telangana' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil', region: 'Tamil Nadu & Puducherry' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali', region: 'West Bengal, Tripura & North East' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati', region: 'Gujarat, Daman & Diu' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada', region: 'Karnataka & Southern Zone' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam', region: 'Kerala & Lakshadweep' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi', region: 'Punjab, Chandigarh, Delhi, Haryana' },
  { code: 'or', native: 'ଓଡ଼ିଆ', english: 'Odia', region: 'Odisha & Eastern Zone' },
  { code: 'ur', native: 'اردو', english: 'Urdu', region: 'Telangana, Delhi, UP, Bihar' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese', region: 'Assam & North Eastern Zone' }
];

/**
 * =========================================================================
 * OFFICIAL UPDATES & NOTIFICATIONS REGISTRY (MANUALLY UPDATEABLE)
 * Add, edit, or remove notification items below.
 * The ticker automatically cycles through them in a continuous rotational sequence.
 * 
 * Fields:
 * - badge: Label shown on the pill (e.g. 'CIRCULAR', 'NEW', 'IMPORTANT', 'TRAINING')
 * - badgeType: Color scheme -> 'danger' (red), 'warning' (amber), 'info' (blue), 'success' (green)
 * - text: The headline / announcement message
 * - link: Destination anchor or URL (e.g. '#circulars', '#training')
 * - date: Date stamp shown at the end
 * =========================================================================
 */
const OFFICIAL_NOTIFICATIONS = [
  {
    id: 1,
    badge: "CIRCULAR",
    badgeType: "danger",
    text: "Circular No. MoSPI/2026/08: Annual Competency Mapping Cycle 2026-27 initiated for field statistical officers.",
    link: "#circulars",
    date: "02 Sep 2026"
  },
  {
    id: 2,
    badge: "IMPORTANT",
    badgeType: "warning",
    text: "Office Memorandum: Mandatory profile verification of all designated nodal officers before Sep 15.",
    link: "#circulars",
    date: "31 Aug 2026"
  },
  {
    id: 3,
    badge: "TRAINING",
    badgeType: "info",
    text: "NSSTA Modules: New specialized statistical training curriculum published for Q3 cadre development.",
    link: "#training",
    date: "28 Aug 2026"
  },
  {
    id: 4,
    badge: "NEW SYSTEM",
    badgeType: "success",
    text: "Diagnostic Assessment Engine v2.4 released with fixed-time evaluation safeguards & instant gap analysis.",
    link: "#assessments",
    date: "24 Aug 2026"
  },
  {
    id: 5,
    badge: "GAZETTE",
    badgeType: "danger",
    text: "Empanelment Notice: Call for national statistical survey experts & external competency evaluators.",
    link: "#circulars",
    date: "18 Aug 2026"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Accessibility: Font Size Adjustment (A- / A / A+)
  let currentFontSize = 16;
  const minFontSize = 13;
  const maxFontSize = 20;

  const btnDecFont = document.getElementById('font-decrease');
  const btnResetFont = document.getElementById('font-reset');
  const btnIncFont = document.getElementById('font-increase');

  if (btnDecFont) {
    btnDecFont.addEventListener('click', () => {
      if (currentFontSize > minFontSize) {
        currentFontSize -= 1;
        document.documentElement.style.fontSize = `${currentFontSize}px`;
      }
    });
  }

  if (btnResetFont) {
    btnResetFont.addEventListener('click', () => {
      currentFontSize = 16;
      document.documentElement.style.fontSize = '16px';
    });
  }

  if (btnIncFont) {
    btnIncFont.addEventListener('click', () => {
      if (currentFontSize < maxFontSize) {
        currentFontSize += 1;
        document.documentElement.style.fontSize = `${currentFontSize}px`;
      }
    });
  }

  // ==========================================================================
  // 3. THEME MODE SYSTEM (System / Bright / Dark - Hover Menu)
  // ==========================================================================
  const themeWrapper = document.getElementById('theme-menu-wrapper');
  const themeBtn = document.getElementById('theme-btn');
  const themeActiveIcon = document.getElementById('theme-active-icon');
  const themeActiveLabel = document.getElementById('theme-active-label');
  const themeOptions = document.querySelectorAll('.theme-option-btn');

  const THEME_ICONS = {
    system: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    light: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    dark: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
  };

  const THEME_LABELS = {
    system: 'System',
    light: 'Bright',
    dark: 'Dark'
  };

  const systemMedia = window.matchMedia('(prefers-color-scheme: dark)');

  function resolveEffectiveTheme(mode) {
    if (mode === 'system') {
      return systemMedia.matches ? 'dark' : 'light';
    }
    return mode;
  }

  function applyThemeMode(mode, save = true) {
    const effective = resolveEffectiveTheme(mode);
    if (effective === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    if (themeActiveIcon && THEME_ICONS[mode]) {
      themeActiveIcon.innerHTML = THEME_ICONS[mode];
    }
    if (themeActiveLabel && THEME_LABELS[mode]) {
      themeActiveLabel.textContent = THEME_LABELS[mode];
    }

    // Update active visual state across menu options
    themeOptions.forEach(btn => {
      const btnMode = btn.getAttribute('data-theme-mode');
      if (btnMode === mode) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    if (save) {
      localStorage.setItem('nirdesha_theme_mode', mode);
    }
  }

  // Real-time listener for OS color-scheme preference changes
  systemMedia.addEventListener('change', () => {
    const currentMode = localStorage.getItem('nirdesha_theme_mode') || 'system';
    if (currentMode === 'system') {
      applyThemeMode('system', false);
    }
  });

  // Attach click listener on theme options
  themeOptions.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedMode = btn.getAttribute('data-theme-mode');
      if (selectedMode) {
        applyThemeMode(selectedMode);
        if (themeWrapper) themeWrapper.classList.remove('is-open');
      }
    });
  });

  // Accessible click/tap toggle for theme dropdown
  if (themeBtn && themeWrapper) {
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeWrapper.classList.toggle('is-open');
      const isOpen = themeWrapper.classList.contains('is-open');
      themeBtn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!themeWrapper.contains(e.target)) {
        themeWrapper.classList.remove('is-open');
        themeBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Initialize theme mode on page start (Default: 'system')
  const savedThemeMode = localStorage.getItem('nirdesha_theme_mode') || 'system';
  applyThemeMode(savedThemeMode, false);

  // ==========================================================================
  // 4. MULTI-LINGUAL TRANSLATION & MODAL SYSTEM
  // ==========================================================================
  const langModal = document.getElementById('lang-modal');
  const langGrid = document.getElementById('lang-grid');
  const langSearchInput = document.getElementById('lang-search');
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langModalClose = document.getElementById('lang-modal-close');
  const langCancelBtn = document.getElementById('lang-cancel-btn');
  const langApplyBtn = document.getElementById('lang-apply-btn');
  const currentLangLabel = document.getElementById('current-lang-label');
  const floatingPrompt = document.getElementById('lang-floating-prompt');
  const promptChooseBtn = document.getElementById('prompt-choose-btn');
  const promptDismissBtn = document.getElementById('prompt-dismiss-btn');

  // Read saved language (default is English)
  let selectedLangCode = localStorage.getItem('nirdesha_selected_lang') || 'en';
  let tempSelectedLangCode = selectedLangCode;

  // Render language selection cards
  function renderLanguageCards(filterQuery = '') {
    if (!langGrid) return;
    langGrid.innerHTML = '';

    const q = filterQuery.toLowerCase().trim();
    const filtered = INDIAN_LANGUAGES.filter(item => 
      item.native.toLowerCase().includes(q) ||
      item.english.toLowerCase().includes(q) ||
      item.region.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      langGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #64748b;">No matching languages found. Try searching by language name or region.</div>`;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = `lang-card notranslate ${item.code === tempSelectedLangCode ? 'is-active' : ''}`;
      card.setAttribute('translate', 'no');
      card.dataset.code = item.code;
      card.innerHTML = `
        <div class="lang-badge-active notranslate" translate="no" title="Selected language">✓</div>
        <div class="lang-native notranslate" translate="no">${item.native}</div>
        <div class="lang-english notranslate" translate="no">${item.english}</div>
        <div class="notranslate" translate="no" style="font-size: 0.7rem; color: #94a3b8; margin-top: 0.35rem;">${item.region}</div>
      `;

      card.addEventListener('click', () => {
        tempSelectedLangCode = item.code;
        document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');
      });

      langGrid.appendChild(card);
    });
  }

  // Open & Close Modal Handlers
  function openLanguageModal() {
    tempSelectedLangCode = selectedLangCode;
    renderLanguageCards();
    if (langSearchInput) langSearchInput.value = '';
    if (langModal) {
      langModal.classList.add('is-open');
      langModal.setAttribute('aria-hidden', 'false');
    }
    // Dismiss floating prompt when modal opens
    dismissFloatingPrompt();
  }

  function closeLanguageModal() {
    if (langModal) {
      langModal.classList.remove('is-open');
      langModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', openLanguageModal);
  }

  if (langModalClose) {
    langModalClose.addEventListener('click', closeLanguageModal);
  }

  if (langCancelBtn) {
    langCancelBtn.addEventListener('click', closeLanguageModal);
  }

  // Close modal on click outside dialog
  if (langModal) {
    langModal.addEventListener('click', (e) => {
      if (e.target === langModal) {
        closeLanguageModal();
      }
    });
  }

  // Search filter inside modal
  if (langSearchInput) {
    langSearchInput.addEventListener('input', (e) => {
      renderLanguageCards(e.target.value);
    });
  }

  // Apply Language & Trigger Auto-Translation
  function applyLanguage(langCode) {
    selectedLangCode = langCode;
    localStorage.setItem('nirdesha_selected_lang', langCode);

    const langObj = INDIAN_LANGUAGES.find(l => l.code === langCode) || INDIAN_LANGUAGES[0];

    // Update Header Button Label (Protected from auto-translation)
    if (currentLangLabel) {
      currentLangLabel.textContent = `${langObj.native} (${langObj.english.split(' ')[0]})`;
      currentLangLabel.className = 'notranslate';
      currentLangLabel.setAttribute('translate', 'no');
    }

    // Google Translate integration
    executeGoogleTranslation(langCode);
    closeLanguageModal();
  }

  if (langApplyBtn) {
    langApplyBtn.addEventListener('click', () => {
      applyLanguage(tempSelectedLangCode);
    });
  }

  // Translation dispatch using Google Translate Element
  function executeGoogleTranslation(langCode) {
    if (langCode === 'en') {
      // Clear translation cookie for default English
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = 'en';
        select.dispatchEvent(new Event('change'));
      }
      return;
    }

    // Set Google Translate cookie
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      // If element is still loading, wait and retry or reload
      setTimeout(() => {
        const retrySelect = document.querySelector('.goog-te-combo');
        if (retrySelect) {
          retrySelect.value = langCode;
          retrySelect.dispatchEvent(new Event('change'));
        }
      }, 800);
    }
  }

  // 5. Floating Regional Language Welcome Prompt / Popup (First-time visitor)
  function dismissFloatingPrompt() {
    if (floatingPrompt) {
      floatingPrompt.style.display = 'none';
      localStorage.setItem('nirdesha_lang_prompt_seen', 'true');
    }
  }

  const promptSeen = localStorage.getItem('nirdesha_lang_prompt_seen');
  if (!promptSeen && floatingPrompt) {
    setTimeout(() => {
      floatingPrompt.style.display = 'flex';
    }, 1200);
  }

  if (promptChooseBtn) {
    promptChooseBtn.addEventListener('click', () => {
      openLanguageModal();
    });
  }

  if (promptDismissBtn) {
    promptDismissBtn.addEventListener('click', dismissFloatingPrompt);
  }

  // Check and apply stored language on initial load
  if (selectedLangCode && selectedLangCode !== 'en') {
    const langObj = INDIAN_LANGUAGES.find(l => l.code === selectedLangCode);
    if (langObj && currentLangLabel) {
      currentLangLabel.textContent = `${langObj.native} (${langObj.english.split(' ')[0]})`;
      currentLangLabel.className = 'notranslate';
      currentLangLabel.setAttribute('translate', 'no');
    }
    // Defer translation execution slightly to allow Google script to mount
    setTimeout(() => {
      executeGoogleTranslation(selectedLangCode);
    }, 600);
  }

  // ==========================================================================
  // 6. Circulars & Notifications Tabs
  // ==========================================================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTabId = button.getAttribute('data-tab');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      button.classList.add('active');
      const targetPane = document.getElementById(targetTabId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // ==========================================================================
  // 7. ROTATING CYCLICAL NOTIFICATIONS CAROUSEL ENGINE
  // ==========================================================================
  const tickerTrack = document.getElementById('ticker-track');
  const tickerViewport = document.getElementById('ticker-viewport');
  const tickerCounter = document.getElementById('ticker-counter');
  const tickerPrevBtn = document.getElementById('ticker-prev-btn');
  const tickerNextBtn = document.getElementById('ticker-next-btn');
  const tickerToggleBtn = document.getElementById('ticker-toggle-btn');

  let currentTickerIndex = 0;
  let tickerTimer = null;
  let isTickerPaused = false;
  const ROTATION_INTERVAL = 4500; // 4.5 seconds per notification cycle

  // Initialize and render notifications into the track
  function initNotificationCarousel() {
    if (!tickerTrack || OFFICIAL_NOTIFICATIONS.length === 0) return;
    tickerTrack.innerHTML = '';

    OFFICIAL_NOTIFICATIONS.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = `ticker-item ${index === 0 ? 'active' : ''}`;
      itemEl.dataset.index = index;
      itemEl.setAttribute('role', 'article');
      itemEl.innerHTML = `
        <span class="ticker-badge-pill ${item.badgeType || 'info'}">${item.badge}</span>
        <a href="${item.link}">${item.text}</a>
        <span class="ticker-date-tag">[${item.date}]</span>
      `;
      tickerTrack.appendChild(itemEl);
    });

    updateTickerCounter();
    startTickerTimer();
  }

  function updateTickerCounter() {
    if (tickerCounter) {
      tickerCounter.textContent = `${currentTickerIndex + 1} / ${OFFICIAL_NOTIFICATIONS.length}`;
    }
  }

  // Smooth circular rotation transition
  function rotateTo(nextIndex, direction = 'next') {
    const items = tickerTrack.querySelectorAll('.ticker-item');
    if (items.length <= 1) return;

    const currentItem = items[currentTickerIndex];
    const nextItem = items[nextIndex];

    // Reset previous animation classes
    items.forEach(el => {
      el.classList.remove('exit-up', 'exit-down', 'enter-up', 'active');
    });

    if (direction === 'next') {
      currentItem.classList.add('exit-up');
      nextItem.classList.add('active');
    } else {
      currentItem.classList.add('exit-down');
      nextItem.classList.add('enter-up');
      // Trigger reflow to apply enter-up positioning before transitioning to active
      void nextItem.offsetWidth;
      nextItem.classList.add('active');
    }

    currentTickerIndex = nextIndex;
    updateTickerCounter();
  }

  function nextTicker() {
    const nextIndex = (currentTickerIndex + 1) % OFFICIAL_NOTIFICATIONS.length;
    rotateTo(nextIndex, 'next');
  }

  function prevTicker() {
    const prevIndex = (currentTickerIndex - 1 + OFFICIAL_NOTIFICATIONS.length) % OFFICIAL_NOTIFICATIONS.length;
    rotateTo(prevIndex, 'prev');
  }

  function startTickerTimer() {
    stopTickerTimer();
    if (!isTickerPaused) {
      tickerTimer = setInterval(nextTicker, ROTATION_INTERVAL);
    }
  }

  function stopTickerTimer() {
    if (tickerTimer) {
      clearInterval(tickerTimer);
      tickerTimer = null;
    }
  }

  // Manual Navigation Button Handlers
  if (tickerNextBtn) {
    tickerNextBtn.addEventListener('click', () => {
      nextTicker();
      startTickerTimer(); // Reset rotation timer
    });
  }

  if (tickerPrevBtn) {
    tickerPrevBtn.addEventListener('click', () => {
      prevTicker();
      startTickerTimer();
    });
  }

  // Pause / Resume Toggle Button
  if (tickerToggleBtn) {
    tickerToggleBtn.addEventListener('click', () => {
      isTickerPaused = !isTickerPaused;
      if (isTickerPaused) {
        stopTickerTimer();
        tickerToggleBtn.textContent = '▶';
        tickerToggleBtn.setAttribute('aria-label', 'Resume update rotation');
        tickerToggleBtn.title = 'Resume rotation';
      } else {
        tickerToggleBtn.textContent = '❚❚';
        tickerToggleBtn.setAttribute('aria-label', 'Pause update rotation');
        tickerToggleBtn.title = 'Pause rotation';
        startTickerTimer();
      }
    });
  }

  // Smart Hover Pause: reading or clicking pauses the rotation automatically
  if (tickerViewport) {
    tickerViewport.addEventListener('mouseenter', () => {
      stopTickerTimer();
    });

    tickerViewport.addEventListener('mouseleave', () => {
      if (!isTickerPaused) {
        startTickerTimer();
      }
    });
  }

  // Initialize rotational carousel
  initNotificationCarousel();

  // ==========================================================================
  // 8. FRAMER-MOTION STYLE DROPDOWN NAVIGATION & SLIDING HOVER PILL
  // ==========================================================================
  const navMenu = document.getElementById('nav-menu');
  const navHoverPill = document.getElementById('nav-hover-pill');
  const mobileToggleBtn = document.getElementById('mobile-toggle');

  if (navMenu && navHoverPill) {
    const navItems = navMenu.querySelectorAll('.nav-item');

    // Smooth sliding pill effect (replicating Framer Motion layoutId="hover-bg")
    navItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        navHoverPill.style.width = `${item.offsetWidth}px`;
        navHoverPill.style.height = `${item.offsetHeight}px`;
        navHoverPill.style.transform = `translateX(${item.offsetLeft}px) translateY(${item.offsetTop}px)`;
        navHoverPill.style.opacity = '1';
      });
    });

    navMenu.addEventListener('mouseleave', () => {
      navHoverPill.style.opacity = '0';
    });

    // Click / Touch toggle for dropdowns (desktop & touch devices)
    navItems.forEach(item => {
      const button = item.querySelector('button.nav-link');
      if (button) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const isCurrentlyOpen = item.classList.contains('is-open');

          // Close other open menus
          navItems.forEach(other => {
            if (other !== item) {
              other.classList.remove('is-open');
              const otherBtn = other.querySelector('button.nav-link');
              if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
            }
          });

          // Toggle current
          if (!isCurrentlyOpen) {
            item.classList.add('is-open');
            button.setAttribute('aria-expanded', 'true');
          } else {
            item.classList.remove('is-open');
            button.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });

    // Close open dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target)) {
        navItems.forEach(item => {
          item.classList.remove('is-open');
          const btn = item.querySelector('button.nav-link');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        navItems.forEach(item => {
          item.classList.remove('is-open');
          const btn = item.querySelector('button.nav-link');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  // Mobile menu toggle
  if (mobileToggleBtn && navMenu) {
    mobileToggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileToggleBtn.setAttribute('aria-expanded', isOpen);
    });
  }

  // ==========================================================================
  // 9. Back to Top Button
  // ==========================================================================
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================================================
  // 10. Portal Search Form Handler
  // ==========================================================================
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput && searchInput.value.trim() !== '') {
        alert(`Searching government portal for: "${searchInput.value.trim()}"`);
      }
    });
  }

  // ==========================================================================
  // 11. EASED STOPWATCH COUNTER ANIMATION (SCROLL / VIEWPORT TRIGGERED)
  // ==========================================================================
  function initStopwatchCounters() {
    const metricsSection = document.getElementById('metrics') || document.querySelector('.metrics-section');
    const counters = document.querySelectorAll('.metric-stopwatch');
    if (!counters.length) return;

    const DURATION_MS = 3600;      // 3.6 seconds total
    const FAST_TIME_RATIO = 0.72;  // First 72% of time (~2.6s) is high-speed surge
    const FAST_VAL_RATIO = 0.97;   // Surges rapidly to 97% of target (e.g. 18,400 of 18,500)

    // Initialize all counters to start at 1
    counters.forEach(counter => {
      const startVal = parseFloat(counter.getAttribute('data-start')) || 1;
      const suffix = counter.getAttribute('data-suffix') || '';
      counter.textContent = startVal.toLocaleString('en-IN') + suffix;
    });

    let hasStarted = false;

    function startAnimation() {
      if (hasStarted) return;
      hasStarted = true;

      counters.forEach(counter => {
        const targetVal = parseFloat(counter.getAttribute('data-target')) || 0;
        const startVal = parseFloat(counter.getAttribute('data-start')) || 1;
        const suffix = counter.getAttribute('data-suffix') || '';
        const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);

        let startTime = null;

        function stepStopwatch(timestamp) {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / DURATION_MS, 1);

          let currentVal;

          if (progress < FAST_TIME_RATIO) {
            // Phase 1: High speed surge to 97% of target with cubic deceleration
            const normP1 = progress / FAST_TIME_RATIO;
            const easeOutCubic = 1 - Math.pow(1 - normP1, 3);
            currentVal = startVal + (targetVal * FAST_VAL_RATIO - startVal) * easeOutCubic;
          } else {
            // Phase 2: Measured stopwatch cadence for remaining 3%
            const normP2 = (progress - FAST_TIME_RATIO) / (1 - FAST_TIME_RATIO);
            const easeOutQuad = 1 - Math.pow(1 - normP2, 2);
            currentVal = (targetVal * FAST_VAL_RATIO) + (targetVal * (1 - FAST_VAL_RATIO)) * easeOutQuad;
          }

          if (progress >= 1) {
            currentVal = targetVal;
          }

          // Format with Indian numerical groupings (e.g., 18,500+)
          if (decimals > 0) {
            counter.textContent = currentVal.toLocaleString('en-IN', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            }) + suffix;
          } else {
            counter.textContent = Math.round(currentVal).toLocaleString('en-IN') + suffix;
          }

          if (progress < 1) {
            requestAnimationFrame(stepStopwatch);
          }
        }

        // Launch stopwatch counter
        requestAnimationFrame(stepStopwatch);
      });
    }

    // Trigger only when user scrolls down and the metrics section enters view
    if ('IntersectionObserver' in window && metricsSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.unobserve(entry.target); // Runs once per page load until reload
          }
        });
      }, {
        threshold: 0.25, // Trigger when 25% of the section is visible
        rootMargin: '0px 0px -40px 0px' // Ensures section is clearly inside the viewport
      });

      observer.observe(metricsSection);
    } else {
      // Fallback for browsers without IntersectionObserver
      startAnimation();
    }
  }

  // Initialize scroll-triggered stopwatch counters
  initStopwatchCounters();
});

// Google Translate Initialization Callback
window.googleTranslateElementInit = function() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'hi,mr,te,ta,bn,gu,kn,ml,pa,or,ur,as,en',
    autoDisplay: false
  }, 'google_translate_element');
};
