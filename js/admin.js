/**
 * Nirdesha — Administration Console Client Script
 * Manages Sidebar Navigation, User Directory Roster, Clickable Header Sorting,
 * Admin Inspect & Access Control Modal, Dynamic Topbar Search, Interactive Profile,
 * Avatar Upload Handler, and Document Drop AI Extraction Pipeline (Phase 2).
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
    system: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="16" x2="16" y2="16"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
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

  const initialTheme = localStorage.getItem('nirdesha_theme_mode') || 'system';
  applyThemeMode(initialTheme, false);

  // 1. SIDEBAR COLLAPSE TOGGLE & TAB NAVIGATION
  // ==========================================================================
  const navItems = document.querySelectorAll('.admin-nav-item[data-tab]');
  const viewTabs = document.querySelectorAll('.admin-view-tab');
  const sidebar = document.getElementById('admin-sidebar');
  const mobileToggle = document.getElementById('admin-mobile-toggle');
  const sidebarToggleBtn = document.getElementById('admin-sidebar-toggle');
  const MENU_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
  const CLOSE_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  function updateAdminSidebarToggleIcon(isCollapsed) {
    if (!sidebarToggleBtn) return;
    sidebarToggleBtn.innerHTML = isCollapsed ? MENU_SVG : CLOSE_SVG;
    sidebarToggleBtn.setAttribute('title', isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar');
  }

  const initialCollapsed = localStorage.getItem('nirdesha_sidebar_collapsed') === 'true';
  if (initialCollapsed) {
    document.body.classList.add('sidebar-collapsed');
  }
  updateAdminSidebarToggleIcon(initialCollapsed);

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      const isCollapsed = document.body.classList.contains('sidebar-collapsed');
      localStorage.setItem('nirdesha_sidebar_collapsed', isCollapsed ? 'true' : 'false');
      updateAdminSidebarToggleIcon(isCollapsed);
    });
  }

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
        view.style.animation = 'none';
        view.offsetHeight; // trigger reflow
        view.style.animation = 'tabFadeInUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      } else {
        view.classList.remove('active');
      }
    });

    window.location.hash = tabId;

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

  if (window.location.hash) {
    const hashTab = window.location.hash.replace('#', '');
    const validTab = document.getElementById(`view-${hashTab}`);
    if (validTab) switchTab(hashTab);
  }

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Sign Out Action
  const signoutBtn = document.getElementById('admin-signout-btn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('nirdesha_admin_session');
      window.location.href = 'login.html';
    });
  }

  // ==========================================================================
  // 2. USER DIRECTORY ROSTER DATA STATE & DYNAMIC RENDER
  // ==========================================================================
  let USER_ROSTER = [
    { id: "ISS-2021-08", name: "Rajesh Sharma", cadre: "Indian Statistical Service", department: "NSSO Field Operations (FOD)", jurisdiction: "Rajasthan", score: 92, status: "Active Duty" },
    { id: "SSS-2023-41", name: "Priyanka Deshmukh", cadre: "Subordinate Statistical Service", department: "Central Statistics Office (CSO)", jurisdiction: "New Delhi", score: 84, status: "Active Duty" },
    { id: "DES-TN-109", name: "K. Sundaram", cadre: "State DES Cadre", department: "Directorate of Economics & Statistics", jurisdiction: "Tamil Nadu", score: 78, status: "In Progress" },
    { id: "SSS-2024-88", name: "S. K. Raman", cadre: "Subordinate Statistical Service", department: "Field Operations Division (NSSO / FOD)", jurisdiction: "New Delhi", score: 88, status: "Nirdesha Verified" },
    { id: "ISS-2019-12", name: "Dr. Ananya Roy", cadre: "Indian Statistical Service", department: "National Accounts Division (NAD)", jurisdiction: "New Delhi", score: 95, status: "Nirdesha Verified" },
    { id: "DES-MH-204", name: "Vikram Patil", cadre: "State DES Cadre", department: "Directorate of Economics & Statistics", jurisdiction: "Maharashtra", score: 71, status: "Under Review" }
  ];

  let currentSortKey = 'name';
  let sortAscending = true;
  let currentSearchQuery = '';

  const userTbody = document.getElementById('admin-user-directory-tbody');

  function renderUserDirectory() {
    if (!userTbody) return;

    // Filter roster by query
    let filtered = USER_ROSTER.filter(user => {
      if (!currentSearchQuery) return true;
      const q = currentSearchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q) ||
        user.cadre.toLowerCase().includes(q) ||
        user.department.toLowerCase().includes(q) ||
        user.status.toLowerCase().includes(q) ||
        String(user.score).includes(q)
      );
    });

    // Sort roster
    filtered.sort((a, b) => {
      let valA = a[currentSortKey];
      let valB = b[currentSortKey];

      if (typeof valA === 'number') {
        return sortAscending ? valA - valB : valB - valA;
      }
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
      if (valA < valB) return sortAscending ? -1 : 1;
      if (valA > valB) return sortAscending ? 1 : -1;
      return 0;
    });

    userTbody.innerHTML = '';

    if (filtered.length === 0) {
      userTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748b;">No matching users found for query "${currentSearchQuery}".</td></tr>`;
      return;
    }

    filtered.forEach((user, idx) => {
      const tr = document.createElement('tr');
      
      const badgeClass = user.status === 'In Progress' || user.status === 'Under Review' 
        ? 'badge-status-prog' 
        : 'badge-status-cert';

      // Find original index in USER_ROSTER for edit mapping
      const originalIndex = USER_ROSTER.findIndex(u => u.id === user.id);

      tr.innerHTML = `
        <td><strong>${user.id}</strong></td>
        <td><strong>${user.name}</strong></td>
        <td>${user.cadre}</td>
        <td>${user.department}</td>
        <td><strong>${user.score} / 100</strong></td>
        <td><span class="${badgeClass}">${user.status}</span></td>
        <td>
          <button type="button" class="btn-admin-action btn-inspect-user" data-index="${originalIndex}" style="padding: 0.25rem 0.55rem; font-size: 0.7rem;">
            Inspect Record 🔍
          </button>
        </td>
      `;
      userTbody.appendChild(tr);
    });

    // Attach inspect click handlers
    document.querySelectorAll('.btn-inspect-user').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        openInspectModal(index);
      });
    });
  }

  // Initial render
  renderUserDirectory();

  // ==========================================================================
  // 3. CLICKABLE TABLE HEADER SORTING
  // ==========================================================================
  const sortableHeaders = document.querySelectorAll('.sortable-header');
  sortableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-sort');
      if (currentSortKey === key) {
        sortAscending = !sortAscending;
      } else {
        currentSortKey = key;
        sortAscending = true;
      }

      // Update header icons
      sortableHeaders.forEach(h => {
        const icon = h.querySelector('.sort-icon');
        if (h.getAttribute('data-sort') === currentSortKey) {
          icon.textContent = sortAscending ? '▲' : '▼';
        } else {
          icon.textContent = '↕';
        }
      });

      renderUserDirectory();
    });
  });

  // ==========================================================================
  // 4. TOPBAR DYNAMIC SEARCH FILTER
  // ==========================================================================
  const topSearch = document.getElementById('admin-top-search');
  const courseCards = document.querySelectorAll('.course-card-gov');

  if (topSearch) {
    topSearch.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();

      // If user directory view is active or search is entered, re-render directory
      renderUserDirectory();

      // Also filter course cards if on course catalog
      if (currentSearchQuery) {
        const q = currentSearchQuery.toLowerCase();
        courseCards.forEach(card => {
          const title = card.querySelector('.course-card-title')?.textContent.toLowerCase() || '';
          if (title.includes(q)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      } else {
        courseCards.forEach(card => card.style.display = 'flex');
      }
    });
  }

  // ==========================================================================
  // 5. ADMIN INSPECT MODAL (READ-ONLY INSPECTION)
  // ==========================================================================
  const inspectModal = document.getElementById('admin-inspect-modal');
  const inspectCloseBtn = document.getElementById('admin-inspect-close');
  const inspectCancelBtn = document.getElementById('admin-inspect-cancel');

  const inspectIndexInput = document.getElementById('inspect-user-index');
  const inspectRollInput = document.getElementById('inspect-roll-id');
  const inspectNameInput = document.getElementById('inspect-user-name');
  const inspectCadreSelect = document.getElementById('inspect-user-cadre');
  const inspectDeptInput = document.getElementById('inspect-user-dept');
  const inspectScoreInput = document.getElementById('inspect-user-score');
  const inspectStatusSelect = document.getElementById('inspect-user-status');
  const inspectTitleEl = document.getElementById('inspect-modal-title');

  function openInspectModal(index) {
    const user = USER_ROSTER[index];
    if (!user || !inspectModal) return;

    inspectIndexInput.value = index;
    inspectRollInput.value = user.id;
    inspectNameInput.value = user.name;
    inspectCadreSelect.value = user.cadre;
    inspectDeptInput.value = user.department;
    inspectScoreInput.value = `${user.score} / 100`;
    inspectStatusSelect.value = user.status;
    inspectTitleEl.textContent = `Inspect User Record: ${user.name} (${user.id})`;

    inspectModal.style.display = 'flex';
  }

  function closeInspectModal() {
    if (inspectModal) inspectModal.style.display = 'none';
  }

  if (inspectCloseBtn) inspectCloseBtn.addEventListener('click', closeInspectModal);
  if (inspectCancelBtn) inspectCancelBtn.addEventListener('click', closeInspectModal);

  // ==========================================================================
  // 6. INTERACTIVE PROFILE & AVATAR UPLOAD HANDLER
  // ==========================================================================
  const profileName = document.getElementById('admin-profile-name');
  const profileRole = document.getElementById('admin-profile-role');
  const profileEmail = document.getElementById('admin-profile-email');
  const profileRoll = document.getElementById('admin-profile-roll');
  const profileCadre = document.getElementById('admin-profile-cadre');
  const profileDivision = document.getElementById('admin-profile-division');
  const profileSkills = document.getElementById('admin-profile-skills');
  const profileAvatar = document.getElementById('admin-profile-avatar');
  const sidebarAvatar = document.getElementById('admin-sidebar-avatar');
  const sidebarName = document.getElementById('admin-sidebar-name');
  const sidebarRole = document.getElementById('admin-sidebar-role');
  const saveProfileBtn = document.getElementById('admin-save-profile-btn');
  const profileToast = document.getElementById('admin-profile-toast');

  const avatarBtn = document.getElementById('admin-avatar-btn');
  const avatarFileInput = document.getElementById('admin-avatar-file-input');

  // Load saved profile on load
  function loadSavedProfile() {
    const saved = localStorage.getItem('nirdesha_admin_profile');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (profileName && data.name) profileName.value = data.name;
        if (profileRole && data.role) profileRole.value = data.role;
        if (profileEmail && data.email) profileEmail.value = data.email;
        if (profileRoll && data.roll) profileRoll.value = data.roll;
        if (profileCadre && data.cadre) profileCadre.value = data.cadre;
        if (profileDivision && data.division) profileDivision.value = data.division;
        if (profileSkills && data.skills) profileSkills.value = data.skills;

        if (sidebarName && data.name) sidebarName.textContent = data.name;
        if (sidebarRole && data.role) sidebarRole.textContent = data.role;

        if (data.avatarImg) {
          setAvatarImage(data.avatarImg);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    }
  }

  function setAvatarImage(src) {
    if (profileAvatar) {
      profileAvatar.style.backgroundImage = `url(${src})`;
      profileAvatar.style.backgroundSize = 'cover';
      profileAvatar.style.backgroundPosition = 'center';
      profileAvatar.textContent = '';
    }
    if (sidebarAvatar) {
      sidebarAvatar.style.backgroundImage = `url(${src})`;
      sidebarAvatar.style.backgroundSize = 'cover';
      sidebarAvatar.style.backgroundPosition = 'center';
      sidebarAvatar.textContent = '';
    }
  }

  loadSavedProfile();

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const data = {
        name: profileName ? profileName.value : '',
        role: profileRole ? profileRole.value : '',
        email: profileEmail ? profileEmail.value : '',
        roll: profileRoll ? profileRoll.value : '',
        cadre: profileCadre ? profileCadre.value : '',
        division: profileDivision ? profileDivision.value : '',
        skills: profileSkills ? profileSkills.value : '',
        avatarImg: localStorage.getItem('nirdesha_admin_avatar') || ''
      };

      localStorage.setItem('nirdesha_admin_profile', JSON.stringify(data));

      if (sidebarName) sidebarName.textContent = data.name;
      if (sidebarRole) sidebarRole.textContent = data.role;

      if (profileToast) {
        profileToast.style.display = 'block';
        setTimeout(() => { profileToast.style.display = 'none'; }, 3000);
      }
    });
  }

  // Avatar upload trigger
  if (avatarBtn && avatarFileInput) {
    avatarBtn.addEventListener('click', () => avatarFileInput.click());

    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setAvatarImage(dataUrl);
        localStorage.setItem('nirdesha_admin_avatar', dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }

  // ==========================================================================
  // 7. DOCUMENT DROP AI EXTRACTION PIPELINE (PHASE 2 PARSER)
  // ==========================================================================
  const pdfDropZone = document.getElementById('admin-pdf-drop-zone');
  const pdfInput = document.getElementById('admin-pdf-input');
  const pdfBrowseLink = document.getElementById('admin-pdf-browse');
  const pdfShimmer = document.getElementById('admin-pdf-shimmer');
  const shimmerStatusText = document.getElementById('admin-shimmer-status-text');

  if (pdfDropZone) {
    pdfDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      pdfDropZone.classList.add('dragover');
    });

    pdfDropZone.addEventListener('dragleave', () => {
      pdfDropZone.classList.remove('dragover');
    });

    pdfDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      pdfDropZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) triggerPdfExtraction(files[0]);
    });

    pdfDropZone.addEventListener('click', (e) => {
      if (e.target === pdfBrowseLink || pdfDropZone.contains(e.target)) {
        if (pdfInput) pdfInput.click();
      }
    });
  }

  if (pdfInput) {
    pdfInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) triggerPdfExtraction(e.target.files[0]);
    });
  }

  function triggerPdfExtraction(file) {
    if (!pdfShimmer || !shimmerStatusText) return;

    pdfShimmer.style.display = 'block';
    shimmerStatusText.textContent = `⚡ Initializing MoSPI AI Document Extraction Engine for "${file.name}"...`;

    setTimeout(() => {
      shimmerStatusText.textContent = `📄 Parsing PDF structure & service credentials...`;
    }, 600);

    setTimeout(() => {
      shimmerStatusText.textContent = `🤖 Auto-populating Cadre, Division & Baseline Skills...`;
    }, 1200);

    setTimeout(() => {
      pdfShimmer.style.display = 'none';

      // Auto-populate extracted data
      if (profileCadre) profileCadre.value = "Indian Statistical Service (ISS Cadre)";
      if (profileDivision) profileDivision.value = "National Accounts Division (NAD), New Delhi";
      if (profileSkills) profileSkills.value = "Stratified Multi-Stage Sampling, Macroeconomic Deflators, Python Data Science, DPDP Governance";

      // Display review alert
      if (profileToast) {
        profileToast.textContent = `✓ AI Extracted Profile Data from "${file.name}" — Review & Click Save!`;
        profileToast.style.display = 'block';
        setTimeout(() => { profileToast.style.display = 'none'; }, 4000);
      }
    }, 1800);
  }

  // ==========================================================================
  // 8. INTERACTIVE AI MENTOR CHAT
  // ==========================================================================
  const chatLog = document.getElementById('ai-chat-log');
  const chatInput = document.getElementById('ai-chat-input');
  const chatSendBtn = document.getElementById('btn-ai-send');
  const promptChips = document.querySelectorAll('.prompt-chip-btn');

  const KNOWLEDGE_RESPONSES = {
    "gdp": "In India's National Accounts (base year 2011-12), the GDP deflator reflects price changes across all domestically produced goods and services. Unlike CPI (Consumer Price Index) which relies on household consumption baskets, the GDP deflator accounts for capital goods, government expenditures, and exports. For SSS/ISS personnel, we recommend the NSSTA Module: 'National Accounts Statistics & Macro Deflator Analytics'.",
    "cpi": "Consumer Price Index (CPI-Combined) is compiled by MoSPI with base year 2012=100 across 299 items. Food and beverages hold a 45.86% weighting. Field Operations Division (FOD) enumerators collect price data from 1,181 village markets and 1,114 urban blocks weekly.",
    "jso": "For Junior Statistical Officers (JSO) transitioning to Senior Statistical Officers (SSO), mandatory competency baselines include: 1. Survey Sampling Theory (Stratified Multi-stage), 2. MoSPI CAPI Tablet Software Operations, 3. Administrative Grievance Protocols under DPDP Act 2023. You can enroll the user into Course NSSTA-302.",
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
      switchTab('ai-mentor');
      setTimeout(() => handleAiQuery(text), 300);
    });
  });



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
