/**
 * Nirdesha — Administration Console Client Script
 * Manages Sidebar Navigation, Tab Views, Interactive AI Mentor, Course Filters, & Session
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // THEME SYNCHRONIZATION & SELECTION (SYSTEM / BRIGHT / DARK)
  // ==========================================================================
  const systemMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const themeWrapper = document.getElementById('theme-menu-wrapper');
  const themeBtn = document.getElementById('theme-btn');
  const themeActiveIcon = document.getElementById('theme-active-icon');
  const themeActiveLabel = document.getElementById('theme-active-label');
  const themeOptions = document.querySelectorAll('.theme-option-btn');

  const THEME_ICONS = {
    system: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    light: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    dark: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
  };

  const THEME_LABELS = {
    system: 'System',
    light: 'Bright',
    dark: 'Dark'
  };

  function applyThemeMode(mode, save = true) {
    let effective = mode;
    if (mode === 'system') {
      effective = systemMedia.matches ? 'dark' : 'light';
    }

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

    themeOptions.forEach(btn => {
      if (btn.getAttribute('data-theme-mode') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (save) {
      localStorage.setItem('nirdesha_theme_mode', mode);
    }
  }

  systemMedia.addEventListener('change', () => {
    if ((localStorage.getItem('nirdesha_theme_mode') || 'system') === 'system') {
      applyThemeMode('system', false);
    }
  });

  themeOptions.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mode = btn.getAttribute('data-theme-mode');
      if (mode) {
        applyThemeMode(mode);
        if (themeWrapper) themeWrapper.classList.remove('is-open');
      }
    });
  });

  if (themeBtn && themeWrapper) {
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeWrapper.classList.toggle('is-open');
    });

    document.addEventListener('click', (e) => {
      if (!themeWrapper.contains(e.target)) {
        themeWrapper.classList.remove('is-open');
      }
    });
  }

  // Load saved theme
  const initialTheme = localStorage.getItem('nirdesha_theme_mode') || 'system';
  applyThemeMode(initialTheme, false);


  // 1. Sidebar Tab Switching
  const navItems = document.querySelectorAll('.admin-nav-item[data-tab]');
  const viewTabs = document.querySelectorAll('.admin-view-tab');
  const sidebar = document.getElementById('admin-sidebar');
  const mobileToggle = document.getElementById('admin-mobile-toggle');

  function switchTab(tabId) {
    navItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    viewTabs.forEach(view => {
      if (view.id === `view-${tabId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    window.location.hash = tabId;

    // Auto-close sidebar on mobile after clicking
    if (window.innerWidth <= 900 && sidebar) {
      sidebar.classList.remove('open');
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      if (tabId) switchTab(tabId);
    });
  });

  // Check URL hash on page load
  if (window.location.hash) {
    const hashTab = window.location.hash.replace('#', '');
    const validTab = document.getElementById(`view-${hashTab}`);
    if (validTab) switchTab(hashTab);
  }

  // Mobile drawer toggle
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // 2. Sign Out Action
  const signoutBtn = document.getElementById('admin-signout-btn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('nirdesha_admin_session');
      window.location.href = 'login.html';
    });
  }

  // 3. Courses Filter Pills
  const filterPills = document.querySelectorAll('.filter-pill-btn');
  const courseCards = document.querySelectorAll('.course-card-gov');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const category = pill.getAttribute('data-category');

      courseCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Interactive AI Mentor Chat
  const chatLog = document.getElementById('ai-chat-log');
  const chatInput = document.getElementById('ai-chat-input');
  const chatSendBtn = document.getElementById('btn-ai-send');
  const promptChips = document.querySelectorAll('.prompt-chip-btn');

  const KNOWLEDGE_RESPONSES = {
    "gdp": "In India's National Accounts (base year 2011-12), the GDP deflator reflects price changes across all domestically produced goods and services. Unlike CPI (Consumer Price Index) which relies on household consumption baskets, the GDP deflator accounts for capital goods, government expenditures, and exports. For SSS/ISS officers, we recommend the NSSTA Module: 'National Accounts Statistics & Macro Deflator Analytics'.",
    "cpi": "Consumer Price Index (CPI-Combined) is compiled by MoSPI with base year 2012=100 across 299 items. Food and beverages hold a 45.86% weighting. Field Operations Division (FOD) enumerators collect price data from 1,181 village markets and 1,114 urban blocks weekly.",
    "jso": "For Junior Statistical Officers (JSO) transitioning to Senior Statistical Officers (SSO), mandatory competency baselines include: 1. Survey Sampling Theory (Stratified Multi-stage), 2. MoSPI CAPI Tablet Software Operations, 3. Administrative Grievance Protocols under DPDP Act 2023. You can enroll the officer into Course NSSTA-302.",
    "default": "Based on MoSPI Competency Framework standards, this inquiry aligns with official training directives. As an Administrator, you can assign specialized NSSTA learning modules, inspect cadre baselines, or generate diagnostic assessment reports for this division."
  };

  function appendChatMessage(text, sender = 'bot') {
    if (!chatLog) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = text;
    chatLog.appendChild(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function handleAiQuery(query) {
    if (!query.trim()) return;
    appendChatMessage(query, 'user');
    if (chatInput) chatInput.value = '';

    // Simulate AI thinking and response
    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = KNOWLEDGE_RESPONSES["default"];
      if (lower.includes('gdp') || lower.includes('deflator')) {
        reply = KNOWLEDGE_RESPONSES["gdp"];
      } else if (lower.includes('cpi') || lower.includes('wpi') || lower.includes('inflation')) {
        reply = KNOWLEDGE_RESPONSES["cpi"];
      } else if (lower.includes('jso') || lower.includes('prerequisite') || lower.includes('senior')) {
        reply = KNOWLEDGE_RESPONSES["jso"];
      }
      appendChatMessage(reply, 'bot');
    }, 600);
  }

  if (chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', () => handleAiQuery(chatInput.value));
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAiQuery(chatInput.value);
    });
  }

  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const text = chip.textContent.replace('▸', '').trim();
      // If currently on dashboard, switch to AI Mentor tab
      switchTab('ai-mentor');
      setTimeout(() => {
        handleAiQuery(text);
      }, 300);
    });
  });

  // 5. Global Search in Topbar
  const topSearch = document.getElementById('admin-top-search');
  if (topSearch) {
    topSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) return;
      // Filter course titles
      courseCards.forEach(card => {
        const title = card.querySelector('.course-card-title').textContent.toLowerCase();
        if (title.includes(q)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // ==========================================================================
  // OFFICER CADRE DOSSIER INSPECTION MODAL (READ-ONLY)
  // ==========================================================================
  const adminProfileModal = document.getElementById('admin-officer-profile-modal');
  const btnCloseAdminModal = document.getElementById('btn-admin-modal-close');

  const DEFAULT_OFFICER_PROFILE = {
    name: 'S. K. Raman',
    role: 'Junior Statistical Officer (JSO)',
    division: 'Field Operations Division (NSSO / FOD)',
    status: 'Supervising NSS 80th Round socio-economic surveys & CAPI data verification in Western Zone • Preparing for Senior Statistical Officer (SSO) 2027 benchmark.',
    station: 'FOD Regional Office, Pune / New Delhi',
    tenure: '2024 Batch (2 Years Completed)',
    email: 'raman.sk@mospi.gov.in',
    skills: 'Survey Sampling, CAPI Verification, Macro Deflators, Python Computing, DPDP Act 2023, NSS Frame Design',
    currentWork: [
      { title: 'NSS 80th Round Socio-Economic Survey', desc: 'Field supervision across Western Zone sampling units, primary verification of CAPI electronic schedules, and non-response calibration.' },
      { title: 'Annual Survey of Industries (ASI) 2025-26', desc: 'Factory register audits, capital structure reporting verification, and consistency cross-checks against MCA-21 filings.' },
      { title: 'Periodic Labour Force Survey (PLFS) Validation', desc: 'Quarterly household enumeration monitoring, sampling weight verification, and preliminary data pipeline validation.' }
    ],
    futureWork: [
      { title: 'Senior Statistical Officer (SSO) Cadre Benchmark', desc: 'Achieving 100% curriculum readiness across NSSTA Module 204 (Macro Deflators) and statutory DPDP compliance protocols.' },
      { title: 'National Accounts Division (NAD) Transition Desk', desc: 'Planned deployment for supply-use table balance reconciliation and implicit price deflator benchmarking.' }
    ],
    coverTheme: 'navy-gold',
    avatarInitials: 'SR'
  };

  function loadOfficerDataForAdmin() {
    try {
      const saved = localStorage.getItem('nirdesha_officer_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read officer profile from localStorage');
    }
    return DEFAULT_OFFICER_PROFILE;
  }

  function renderAdminOfficerProfile(p) {
    const nameEl = document.getElementById('admin-profile-display-name');
    const roleEl = document.getElementById('admin-profile-display-role');
    const statusEl = document.getElementById('admin-profile-display-status');
    const initialsEl = document.getElementById('admin-profile-avatar-initials');

    if (nameEl) nameEl.textContent = p.name;
    if (roleEl) roleEl.textContent = `${p.role} • ${p.division}`;
    if (statusEl) statusEl.textContent = `"${p.status}"`;
    if (initialsEl) initialsEl.textContent = p.avatarInitials || p.name.split(' ').map(w => w[0]).join('').slice(0, 2);

    const stationEl = document.getElementById('admin-profile-info-station');
    const tenureEl = document.getElementById('admin-profile-info-tenure');
    const emailEl = document.getElementById('admin-profile-info-email');

    if (stationEl) stationEl.textContent = p.station;
    if (tenureEl) tenureEl.textContent = p.tenure;
    if (emailEl) emailEl.textContent = p.email;

    // Equal-sized competency boxes with tooltips
    const skillsWrap = document.getElementById('admin-profile-skills-grid');
    if (skillsWrap && p.skills) {
      skillsWrap.innerHTML = '';
      const skillList = typeof p.skills === 'string' ? p.skills.split(',').map(s => s.trim()).filter(Boolean) : p.skills;
      skillList.forEach(s => {
        const box = document.createElement('div');
        box.className = 'competency-box';
        box.setAttribute('data-tooltip', `Verified Competency: ${s} (MoSPI Accredited)`);
        box.innerHTML = `
          <div class="competency-box-inner">
            <span class="competency-icon-dot"></span>
            <span class="competency-box-title" title="${s}">${s}</span>
          </div>
          <span class="competency-badge-verified">✓</span>
        `;
        skillsWrap.appendChild(box);
      });
    }

    // Current work
    const currentWrap = document.getElementById('admin-profile-current-work-list');
    if (currentWrap && p.currentWork) {
      currentWrap.innerHTML = '';
      p.currentWork.forEach(item => {
        const row = document.createElement('div');
        row.className = 'work-item';
        row.innerHTML = `
          <div class="work-bullet"></div>
          <div>
            <h4 class="work-title">${item.title}</h4>
            <p class="work-desc">${item.desc}</p>
          </div>
        `;
        currentWrap.appendChild(row);
      });
    }

    // Future work
    const futureWrap = document.getElementById('admin-profile-future-work-list');
    if (futureWrap && p.futureWork) {
      futureWrap.innerHTML = '';
      p.futureWork.forEach(item => {
        const row = document.createElement('div');
        row.className = 'work-item';
        row.innerHTML = `
          <div class="work-bullet orange"></div>
          <div>
            <h4 class="work-title">${item.title}</h4>
            <p class="work-desc">${item.desc}</p>
          </div>
        `;
        futureWrap.appendChild(row);
      });
    }

    const coverWrap = document.getElementById('admin-profile-cover-wrap');
    if (coverWrap) {
      coverWrap.className = `profile-cover-wrap theme-${p.coverTheme || 'navy-gold'}`;
    }
  }

  function openAdminOfficerDossier() {
    const data = loadOfficerDataForAdmin();
    renderAdminOfficerProfile(data);
    if (adminProfileModal) adminProfileModal.style.display = 'flex';
  }

  function closeAdminOfficerDossier() {
    if (adminProfileModal) adminProfileModal.style.display = 'none';
  }

  if (btnCloseAdminModal) btnCloseAdminModal.addEventListener('click', closeAdminOfficerDossier);
  if (adminProfileModal) {
    adminProfileModal.addEventListener('click', (e) => {
      if (e.target === adminProfileModal) closeAdminOfficerDossier();
    });
  }

  // Bind click on any View Dossier / View Profile buttons in tables
  document.querySelectorAll('.btn-view-officer-dossier').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminOfficerDossier();
    });
  });

});
