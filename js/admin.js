/**
 * Nirdesha — Administration Console Client Script
 * Manages Sidebar Navigation, User Directory Roster, Clickable Header Sorting,
 * Admin Inspect & Access Control Modal, Dynamic Topbar Search, Interactive Profile,
 * Avatar Upload Handler, and Document Drop AI Extraction Pipeline (Phase 2).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global HTML escaping utility for safe DOM injection
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  window.escapeHtml = escapeHtml;
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
  const BANNER_PRESETS = [
    {
      id: 'default',
      name: '0. MoSPI Central Cadre',
      badge: 'Official Cadre',
      desc: 'Official Navy with microdot matrix and tricolor ribbon',
      swatchStyle: 'background: linear-gradient(135deg, #002b49 0%, #00172c 55%, #0c3e66 100%);',
      getHtml: () => '<div class="cover-gradient-overlay"></div>'
    },
    {
      id: '1',
      name: '1. Cyber Rain',
      badge: 'Neon Glow',
      desc: 'Cyan and rainbow neon light streaks with animated hue rotation',
      swatchStyle: 'background: #030712; background-image: radial-gradient(#00d2ff 1.5px, transparent 1.5px), radial-gradient(#ec4899 1.5px, transparent 1.5px); background-size: 8px 8px;',
      getHtml: () => '<div class="container"></div>'
    },
    {
      id: '2',
      name: '2. Geometric Blue Chevrons',
      badge: 'Animated',
      desc: 'Sliding angled geometric chevrons in dynamic royal blue',
      swatchStyle: 'background: #0a192f; background-image: linear-gradient(135deg, transparent 25%, #0284c7 25% 50%, transparent 50%); background-size: 14px 14px;',
      getHtml: () => '<div class="container"></div>'
    },
    {
      id: '3',
      name: '3. Carbon Fiber Stripes',
      badge: 'Dark Modern',
      desc: 'Deep carbon diagonal stripes with continuous translation',
      swatchStyle: 'background: #0f172a; background-image: linear-gradient(135deg, #1e293b 25%, transparent 25% 50%, #1e293b 50% 75%, transparent 75%); background-size: 10px 10px;',
      getHtml: () => '<div class="container"></div>'
    },
    {
      id: '4',
      name: '4. Golden Sovereign Rings',
      badge: 'Luxury Cadre',
      desc: 'Concentric golden radial ring gradients on deep noir',
      swatchStyle: 'background: #0f172a; background-image: radial-gradient(circle, #f59e0b 25%, transparent 30%); background-size: 16px 16px;',
      getHtml: () => '<div class="container"></div>'
    },
    {
      id: '5',
      name: '5. Hexagonal Olive Prism',
      badge: 'Conic Geometry',
      desc: 'Precision hexagonal multi-angle conic gradient lattice',
      swatchStyle: 'background: #1a2e05; background-image: conic-gradient(#65a30d 120deg, #4d7c0f 120deg 240deg, #1a2e05 240deg); background-size: 16px 16px;',
      getHtml: () => '<div class="container"></div>'
    },
    {
      id: '6',
      name: '6. Volcanic Cracked Earth',
      badge: 'Magma & Basalt',
      desc: 'Molten magma cracks beneath dark volcanic plates',
      swatchStyle: 'background: #110502; background-image: linear-gradient(135deg, #ea580c 0%, #7f1d1d 100%);',
      getHtml: () => '<div class="cracked-earth"></div>'
    },
    {
      id: '7',
      name: '7. Archipelago Ocean Atoll',
      badge: 'Tropical Azure',
      desc: 'Topographical island contours with golden sand and azure lagoons',
      swatchStyle: 'background: #0c4a6e; background-image: radial-gradient(circle at 35% 50%, #65a30d 30%, #38bdf8 65%, transparent 70%);',
      getHtml: () => '<div class="ocean-backdrop"><div class="island-backdrop"></div></div>'
    },
    {
      id: '8',
      name: '8. Isometric Gold Lattice',
      badge: '3D Wireframe',
      desc: '30°/60°/150° geometric wireframe lattice with golden inner glow',
      swatchStyle: 'background: #09090b; background-image: linear-gradient(60deg, rgba(234, 179, 8, 0.45) 25%, transparent 25%); background-size: 14px 14px;',
      getHtml: () => '<div class="container"></div>'
    },
    {
      id: '9',
      name: '9. Matrix Digital Code Rain',
      badge: 'Phosphor Rain',
      desc: '-25° angled digital green phosphor rain stream',
      swatchStyle: 'background: #020617; background-image: radial-gradient(#22c55e 1.5px, transparent 1.5px); background-size: 8px 8px;',
      getHtml: () => '<div class="container"><div class="container-inner"></div></div>'
    },
    {
      id: '10',
      name: '10. Statistical & Quantum Matrix',
      badge: 'Math Symbols',
      desc: 'Dynamic matrix of calculus, Greek, and set theory symbols with glowing pulse',
      swatchStyle: 'background: #030712; background-image: linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px); background-size: 10px 10px;',
      getHtml: () => {
        const symbols = ['+','−','×','÷','=','≠','≈','∞','√','∑','∏','∫','∂','∆','π','θ','λ','μ','σ','ω','α','β','γ','δ','ε','ζ','η','ι','κ','ν','ξ','ρ','τ','φ','χ','ψ','∈','∉','∩','∪','⊂','⊃','⊆','⊇','∧','∨','¬','⇒','⇔','∀','∃','ℕ','ℤ','ℚ','ℝ','ℂ','|','∥','∠','⊥','≅','∝','∴','∵','⊕','⊗','⊥','⊢','⊨','∇'];
        let str = '<div class="jp-matrix">';
        for (let i = 0; i < 10; i++) {
          symbols.forEach(s => { str += `<span>${s}</span>`; });
        }
        str += '</div>';
        return str;
      }
    },
    {
      id: '11',
      name: '11. Midnight City Patrol',
      badge: 'City Spotlight',
      desc: 'Urban skyline with sweeping flashlight beam and glowing eyes',
      swatchStyle: 'background: #09090b; background-image: linear-gradient(to top, #ca8a04 25%, #18181b 26% 50%, transparent 50%);',
      getHtml: () => '<div class="container"></div>'
    }
  ];

// update the real backend-backed employee row
// while keeping other users as demo data.
//
// Matching is done by employee ID OR name.
window.NirdeshaAdminUpsertUser = function (user) {
    if (!user || !user.id || !user.name) {
      return;
    }

    const index =
      USER_ROSTER.findIndex(
        existing =>
          existing.id === user.id ||
          String(existing.name)
            .toLowerCase()
            ===
          String(user.name)
            .toLowerCase()
      );

    if (index >= 0) {
      USER_ROSTER[index] = {
        ...USER_ROSTER[index],
        ...user
      };
    } else {
      USER_ROSTER.unshift(user);
    }

    renderUserDirectory();
  };

  let currentSortKey = 'name';
  let sortAscending = true;
  let currentSearchQuery = '';

  function renderAdminBannerIntoStage(targetEl, mode, value) {
    if (!targetEl) return;
    let baseClass = 'profile-banner-stage';
    if (targetEl.id === 'admin-banner-preview-viewport' || targetEl.classList.contains('banner-preview-viewport')) {
      baseClass = 'banner-preview-viewport';
    }

    targetEl.className = baseClass;
    targetEl.style.backgroundImage = '';

    if (mode === 'custom' && value) {
      targetEl.classList.add('is-custom-image');
      targetEl.style.backgroundImage = `url(${value})`;
      targetEl.innerHTML = '';
      return;
    }

    const patternId = String(value || 'default');
    const preset = BANNER_PRESETS.find(p => p.id === patternId) || BANNER_PRESETS[0];
    targetEl.classList.add(preset.id === 'default' ? 'banner-pattern-default' : `banner-pattern-${preset.id}`);
    targetEl.innerHTML = preset.getHtml ? preset.getHtml() : '';
  }

  // Admin Profile Elements
  const profileName = document.getElementById('admin-profile-name');
  const profileRole = document.getElementById('admin-profile-role');
  const profileEmail = document.getElementById('admin-profile-email');
  const profileRoll = document.getElementById('admin-profile-roll');
  const profileCadre = document.getElementById('admin-profile-cadre');
  const profileDivision = document.getElementById('admin-profile-division');
  const profileSecurity = document.getElementById('admin-profile-security');
  const profilePhone = document.getElementById('admin-profile-phone');
  const profileSkills = document.getElementById('admin-profile-skills');
  const saveProfileBtn = document.getElementById('admin-save-profile-btn');
  const profileToast = document.getElementById('admin-profile-toast');

  // Display Header Elements
  const displayHeaderName = document.getElementById('admin-display-name');
  const displayHeaderRole = document.getElementById('admin-display-role');
  const displayHeaderCadre = document.getElementById('admin-display-cadre');
  const displayHeaderEmpcode = document.getElementById('admin-display-empcode');
  const sidebarName = document.getElementById('admin-sidebar-name');
  const sidebarRole = document.getElementById('admin-sidebar-role');

  // Avatar Elements
  const avatarBox = document.getElementById('admin-profile-avatar-box');
  const avatarImg = document.getElementById('admin-profile-avatar-img');
  const avatarInitials = document.getElementById('admin-profile-avatar-initials');
  const avatarQuickBtn = document.getElementById('admin-avatar-quick-btn');
  const avatarFileInput = document.getElementById('admin-avatar-file-input');
  const resetAvatarBtn = document.getElementById('admin-reset-avatar-btn');
  const sidebarAvatar = document.getElementById('admin-sidebar-avatar');


  // ==========================================================================
  // 2. USER DIRECTORY, PROFILES DATABASE & BAN SYSTEM
  // ==========================================================================
  const INITIAL_USERS = [
    {
      id: "SSS-2024-8891",
      name: "S. K. Raman",
      cadre: "Junior Statistical Officer (JSO)",
      department: "NSSO Field Operations Division",
      division: "Western Zone",
      jurisdiction: "New Delhi",
      score: 94,
      elo: 1485,
      streak: 14,
      status: "Active Duty",
      isBanned: false,
      banReason: "",
      bannedAt: null,
      bannedBy: null,
      createdAt: "2026-08-15T09:30:00.000Z",
      email: "s.raman@mospi.gov.in",
      phone: "+91-98765-43210",
      wing: "Subordinate Statistical Service (SSS)",
      clearance: "Tier 2 Verified Cadre",
      bannerPreset: "default",
      avatarUrl: "",
      initials: "SR",
      bio: "Officer serving under NSSO Field Operations Division (Western Zone). Specialized in stratified multi-stage household survey schedules, CAPI field tablet audits, and DPDP Act compliance.",
      skills: [
        "Multi-Stage Stratified Sampling",
        "CAPI Tablet Schedules",
        "DPDP Act 2023 Compliance",
        "PLFS Field Validation",
        "Household Consumption Expenditure"
      ],
      courses: [
        {
          title: "Advanced Survey Sampling & Quality Assurance (ASQA-401)",
          platform: "iGOT Karmayogi",
          status: "Completed • 94%",
          certifiedDate: "12 Aug 2026"
        },
        {
          title: "National Accounts Statistics & GDP Deflator Mechanics",
          platform: "NSSO FOD Academy",
          status: "In Progress • 78%",
          certifiedDate: "Active"
        },
        {
          title: "Data Protection & Security in Digital Surveys (DPDP Act)",
          platform: "Swayam Plus",
          status: "Completed • 98%",
          certifiedDate: "28 Jul 2026"
        }
      ]
    },
    {
      id: "ISS-2021-0842",
      name: "Rajesh Sharma",
      cadre: "Senior Statistical Officer (SSO)",
      department: "NSSO Field Operations (FOD)",
      division: "Northern Zone",
      jurisdiction: "Rajasthan",
      score: 92,
      elo: 1520,
      streak: 21,
      status: "Active Duty",
      isBanned: false,
      banReason: "",
      bannedAt: null,
      bannedBy: null,
      createdAt: "2026-07-10T11:15:00.000Z",
      email: "rajesh.sharma@mospi.gov.in",
      phone: "+91-98112-23344",
      wing: "Indian Statistical Service (ISS)",
      clearance: "Tier 1 Executive Cadre",
      bannerPreset: "2",
      avatarUrl: "",
      initials: "RS",
      bio: "Senior Statistical Officer supervising regional NSSO survey schedules, price collection indices, and supervisory validation.",
      skills: [
        "Consumer Price Index (CPI)",
        "Index of Industrial Production (IIP)",
        "Annual Survey of Industries (ASI)"
      ],
      courses: [
        {
          title: "Macroeconomic Aggregates & System of National Accounts (SNA 2008)",
          platform: "iGOT Karmayogi",
          status: "Completed • 92%",
          certifiedDate: "01 Jul 2026"
        },
        {
          title: "Industrial Production Analytics & Factory Audit Protocols",
          platform: "MOSPI e-Learning",
          status: "Completed • 88%",
          certifiedDate: "14 Jun 2026"
        },
        {
          title: "Advanced Statistical Quality Control in Census Operations",
          platform: "iGOT Karmayogi",
          status: "In Progress • 65%",
          certifiedDate: "Active"
        }
      ]
    },
    {
      id: "SSS-2023-4105",
      name: "Priyanka Deshmukh",
      cadre: "Junior Statistical Officer (JSO)",
      department: "Central Statistics Office (CSO)",
      division: "Economic Statistics Wing",
      jurisdiction: "New Delhi",
      score: 84,
      elo: 1390,
      streak: 9,
      status: "Active Duty",
      isBanned: false,
      banReason: "",
      bannedAt: null,
      bannedBy: null,
      createdAt: "2026-06-20T14:45:00.000Z",
      email: "priyanka.deshmukh@mospi.gov.in",
      phone: "+91-97234-56789",
      wing: "Subordinate Statistical Service (SSS)",
      clearance: "Tier 2 Verified Cadre",
      bannerPreset: "4",
      avatarUrl: "",
      initials: "PD",
      bio: "Handling Economic Census data consolidation, service sector enterprise registry, and microdata anonymization.",
      skills: [
        "Economic Census Protocols",
        "Enterprise Registry Validation",
        "R Statistical Computing"
      ],
      courses: [
        {
          title: "Python & R for Official Microdata Harmonization",
          platform: "MOSPI e-Learning",
          status: "Completed • 85%",
          certifiedDate: "19 May 2026"
        },
        {
          title: "Data Governance Frameworks for Official Statistics",
          platform: "iGOT Karmayogi",
          status: "Completed • 90%",
          certifiedDate: "02 Apr 2026"
        },
        {
          title: "Time Series Econometrics in Price Indices",
          platform: "Swayam Plus",
          status: "In Progress • 50%",
          certifiedDate: "Active"
        }
      ]
    },
    {
      id: "DES-TN-1099",
      name: "K. Sundaram",
      cadre: "State Statistical Officer",
      department: "Directorate of Economics & Statistics",
      division: "State Statistical Bureau",
      jurisdiction: "Tamil Nadu",
      score: 78,
      elo: 1280,
      streak: 5,
      status: "Active Duty",
      isBanned: false,
      banReason: "",
      bannedAt: null,
      bannedBy: null,
      createdAt: "2026-05-04T10:00:00.000Z",
      email: "k.sundaram@tn.gov.in",
      phone: "+91-94440-12345",
      wing: "State DES Cadre",
      clearance: "Tier 3 State Officer",
      bannerPreset: "7",
      avatarUrl: "",
      initials: "KS",
      bio: "Coordinating state-level Gross State Domestic Product (GSDP) estimations and district statistical handbook releases.",
      skills: [
        "GSDP Estimation Methodologies",
        "District Statistical Handbooks",
        "Agricultural Crop Cutting Experiments"
      ],
      courses: [
        {
          title: "District Statistical Aggregation Methodologies",
          platform: "iGOT Karmayogi",
          status: "Completed • 82%",
          certifiedDate: "10 Apr 2026"
        },
        {
          title: "Crop Cutting Experiments & Remote Sensing Integration",
          platform: "MOSPI e-Learning",
          status: "In Progress • 70%",
          certifiedDate: "Active"
        },
        {
          title: "Principles of Civil Registration & Vital Statistics (CRVS)",
          platform: "Swayam Plus",
          status: "Completed • 79%",
          certifiedDate: "15 Feb 2026"
        }
      ]
    },
    {
      id: "ISS-2019-1220",
      name: "Dr. Ananya Sen",
      cadre: "Director / Senior Statistical Officer",
      department: "National Accounts Division (NAD)",
      division: "Central Accounts Wing",
      jurisdiction: "New Delhi",
      score: 96,
      elo: 1610,
      streak: 30,
      status: "Active Duty",
      isBanned: false,
      banReason: "",
      bannedAt: null,
      bannedBy: null,
      createdAt: "2026-03-12T08:20:00.000Z",
      email: "ananya.sen@mospi.gov.in",
      phone: "+91-98100-99887",
      wing: "Indian Statistical Service (ISS)",
      clearance: "Tier 1 Executive Cadre",
      bannerPreset: "10",
      avatarUrl: "",
      initials: "AS",
      bio: "Leading methodological revisions for National Accounts base year update, Supply-Use Tables (SUT), and input-output coefficient matrices.",
      skills: [
        "System of National Accounts (SNA)",
        "Input-Output Modeling",
        "Quarterly GDP Forecasting",
        "Supply Use Tables"
      ],
      courses: [
        {
          title: "Global Best Practices in Base Year Revisions",
          platform: "iGOT Karmayogi",
          status: "Completed • 98%",
          certifiedDate: "15 Jan 2026"
        },
        {
          title: "Environmental-Economic Accounting (SEEA Framework)",
          platform: "MOSPI e-Learning",
          status: "Completed • 95%",
          certifiedDate: "20 Dec 2025"
        },
        {
          title: "Big Data & Satellite Imagery in Economic Nowcasting",
          platform: "Swayam Plus",
          status: "Completed • 96%",
          certifiedDate: "10 Nov 2025"
        }
      ]
    },
    {
      id: "DES-MH-2041",
      name: "Vikram Rao",
      cadre: "Statistical Investigator Grade I",
      department: "Directorate of Economics & Statistics",
      division: "Urban Statistics Wing",
      jurisdiction: "Maharashtra",
      score: 71,
      elo: 1195,
      streak: 3,
      status: "Active Duty",
      isBanned: false,
      banReason: "",
      bannedAt: null,
      bannedBy: null,
      createdAt: "2026-02-18T16:10:00.000Z",
      email: "vikram.rao@maharashtra.gov.in",
      phone: "+91-98200-55443",
      wing: "State DES Cadre",
      clearance: "Tier 3 State Officer",
      bannerPreset: "5",
      avatarUrl: "",
      initials: "VR",
      bio: "Conducting municipal data collection, urban local body infrastructure surveys, and periodic labor force enumeration in MMR region.",
      skills: [
        "Urban Local Body Surveys",
        "Field Investigator Supervision",
        "SPSS Tabulation"
      ],
      courses: [
        {
          title: "Municipal Statistical Reporting Standards",
          platform: "iGOT Karmayogi",
          status: "Completed • 74%",
          certifiedDate: "05 Jan 2026"
        },
        {
          title: "Field Data Auditing & Tablet Verification",
          platform: "MOSPI e-Learning",
          status: "In Progress • 60%",
          certifiedDate: "Active"
        },
        {
          title: "Fundamentals of Survey Dissemination",
          platform: "Swayam Plus",
          status: "Completed • 72%",
          certifiedDate: "12 Nov 2025"
        }
      ]
    }
  ];

  function loadUserDirectory() {
    try {
      const saved = localStorage.getItem('nirdesha_user_directory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading nirdesha_user_directory:', e);
    }
    localStorage.setItem('nirdesha_user_directory', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }

  function saveUserDirectory(users) {
    try {
      localStorage.setItem('nirdesha_user_directory', JSON.stringify(users));
      // Dispatch storage event for same-window / cross-window listeners
      window.dispatchEvent(new Event('nirdesha_user_directory_updated'));
    } catch (e) {
      console.error('Error saving nirdesha_user_directory:', e);
    }
  }

  let USER_ROSTER = loadUserDirectory();

  // Toolbar & State
  let currentDirectoryFilter = 'all'; // 'all' | 'banned'
  let currentSortMode = 'date-desc';
  let directorySearchQuery = '';

  const userTbody = document.getElementById('admin-user-directory-tbody');
  const dirFilterPills = document.querySelectorAll('.dir-filter-pill');
  const dirSearchInput = document.getElementById('directory-search-input');
  const dirSortSelect = document.getElementById('directory-sort-select');
  const optSortBanDate = document.getElementById('opt-sort-ban-date');
  const totalBadge = document.getElementById('user-directory-total-badge');
  const countAllEl = document.getElementById('count-all-users');
  const countBannedEl = document.getElementById('count-banned-users');

  // Format Helper
  function formatIsoDate(isoStr) {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
             d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return isoStr;
    }
  }

  function renderAdminUserDirectory() {
    USER_ROSTER = loadUserDirectory();
    if (!userTbody) return;

    const totalCount = USER_ROSTER.length;
    const bannedCount = USER_ROSTER.filter(u => u.isBanned).length;

    if (totalBadge) totalBadge.textContent = `${totalCount} Registered Officer${totalCount === 1 ? '' : 's'}`;
    if (countAllEl) countAllEl.textContent = totalCount;
    if (countBannedEl) countBannedEl.textContent = bannedCount;

    // Toggle ban date option in sort dropdown
    if (optSortBanDate) {
      if (currentDirectoryFilter === 'banned') {
        optSortBanDate.style.display = 'block';
      } else {
        optSortBanDate.style.display = 'none';
        if (currentSortMode === 'ban-date') currentSortMode = 'date-desc';
      }
    }

    // 1. Filter by category
    let filtered = USER_ROSTER.filter(user => {
      if (currentDirectoryFilter === 'banned') {
        return user.isBanned === true;
      }
      return true;
    });

    // 2. Filter by search query
    if (directorySearchQuery) {
      const q = directorySearchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q)) ||
        (u.cadre && u.cadre.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.jurisdiction && u.jurisdiction.toLowerCase().includes(q))
      );
    }

    // 3. Sort
    filtered.sort((a, b) => {
      if (currentSortMode === 'date-desc') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (currentSortMode === 'date-asc') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (currentSortMode === 'ban-date') {
        return new Date(b.bannedAt || 0) - new Date(a.bannedAt || 0);
      } else if (currentSortMode === 'roll-asc') {
        return (a.id || '').localeCompare(b.id || '');
      } else if (currentSortMode === 'score-desc') {
        return (b.score || 0) - (a.score || 0);
      } else if (currentSortMode === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    userTbody.innerHTML = '';

    if (filtered.length === 0) {
      userTbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 2.5rem 1rem; color: #64748b;">
            <div style="font-size: 1rem; font-weight: 700; color: #334155; margin-bottom: 0.25rem;">No Officers Found</div>
            <div style="font-size: 0.8rem;">No officers match the current filter or search criteria.</div>
          </td>
        </tr>`;
      return;
    }

    filtered.forEach(user => {
      const tr = document.createElement('tr');
      const isBanned = user.isBanned === true;

      const avatarMarkup = user.avatarUrl
        ? `<img src="${user.avatarUrl}" alt="${user.name}">`
        : `<span>${user.initials || user.name.slice(0, 2).toUpperCase()}</span>`;

      const statusBadge = isBanned
        ? `<span class="badge-user-status status-banned">
             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
             BANNED • Suspended
           </span>`
        : `<span class="badge-user-status status-active">
             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
             Active • Good Standing
           </span>`;

      const banOrUnbanAction = isBanned
        ? `<button type="button" class="btn-dir-action btn-dir-unban" data-action="unban" data-user-id="${user.id}" title="Restore portal access for this officer">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
             <span>Unban User</span>
           </button>`
        : `<button type="button" class="btn-dir-action btn-dir-ban" data-action="ban" data-user-id="${user.id}" title="Suspend portal access for this officer">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
             <span>Ban</span>
           </button>`;

      tr.innerHTML = `
        <td>
          <div class="user-cell-flex">
            <div class="user-cell-avatar">${avatarMarkup}</div>
            <div>
              <div class="user-cell-name">${user.name}</div>
              <span class="user-cell-roll">${user.id}</span>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight: 700; color: #1e293b; font-size: 0.82rem;">${user.cadre}</div>
          <div style="font-size: 0.73rem; color: #64748b;">${user.department}${user.division ? ' • ' + user.division : ''}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: #002b49; font-size: 0.8rem;">${formatIsoDate(user.createdAt)}</div>
          ${isBanned && user.bannedAt ? `<div style="font-size: 0.7rem; color: #dc2626; font-weight: 600;">Banned: ${formatIsoDate(user.bannedAt)}</div>` : ''}
        </td>
        <td>${statusBadge}</td>
        <td>
          <div class="actions-cell-flex">
            <button type="button" class="btn-dir-action btn-dir-inspect" data-action="inspect" data-user-id="${user.id}" title="Inspect full profile (Read-Only)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>Inspect Profile</span>
            </button>
            <button type="button" class="btn-dir-action btn-dir-msg" data-action="message" data-user-id="${user.id}" title="Send direct official message" style="color: #0284c7;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              <span>Message</span>
            </button>
            ${banOrUnbanAction}
          </div>
        </td>
      `;

      userTbody.appendChild(tr);
    });

    // Attach row button events
    userTbody.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        const userId = btn.getAttribute('data-user-id');
        if (action === 'inspect') {
          openAdminUserProfileModal(userId);
        } else if (action === 'ban') {
          openBanWarningModal(userId);
        } else if (action === 'unban') {
          executeUserUnban(userId);
        } else if (action === 'message') {
          openDirectMessageModal(userId);
        }
      });
    });
  }

  // Filter Pill Listeners
  dirFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      dirFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentDirectoryFilter = pill.getAttribute('data-dir-filter') || 'all';
      if (currentDirectoryFilter === 'banned' && dirSortSelect) {
        dirSortSelect.value = 'ban-date';
        currentSortMode = 'ban-date';
      }
      renderAdminUserDirectory();
    });
  });

  // Search Input Listener
  if (dirSearchInput) {
    dirSearchInput.addEventListener('input', (e) => {
      directorySearchQuery = e.target.value.trim();
      renderAdminUserDirectory();
    });
  }

  // Sort Select Listener
  if (dirSortSelect) {
    dirSortSelect.addEventListener('change', (e) => {
      currentSortMode = e.target.value;
      renderAdminUserDirectory();
    });
  }

  // ==========================================================================
  // 3. READ-ONLY PROFILE INSPECTION MODAL (FULL USER PROFILE PARITY)
  // ==========================================================================
  const inspectModal = document.getElementById('admin-inspect-profile-modal');
  const btnCloseInspect = document.getElementById('btn-close-inspect-profile');
  const btnCloseInspectFooter = document.getElementById('btn-close-inspect-profile-footer');
  const btnInspectBanAction = document.getElementById('btn-inspect-ban-action');
  const btnInspectMsgAction = document.getElementById('btn-inspect-message-action');

  let activeInspectedUserId = null;

  function openAdminUserProfileModal(userId) {
    USER_ROSTER = loadUserDirectory();
    const user = USER_ROSTER.find(u => u.id === userId);
    if (!user || !inspectModal) return;
    activeInspectedUserId = userId;

    let effectiveUser = { ...user };

    // DYNAMIC SYNC: For S. K. Raman (or live trainee), pull real-time customizations from public.html state!
    if (userId === 'SSS-2024-8891') {
      try {
        const rawPubProfile = localStorage.getItem('nirdesha_officer_profile') || localStorage.getItem('nirdesha_public_profile');
        if (rawPubProfile) {
          const pubProfile = JSON.parse(rawPubProfile);
          if (pubProfile.fullName) effectiveUser.name = pubProfile.fullName;
          if (pubProfile.cadreTitle) effectiveUser.cadre = pubProfile.cadreTitle;
          if (pubProfile.avatarInitials) effectiveUser.initials = pubProfile.avatarInitials;
          if (pubProfile.baselineBio) effectiveUser.bio = pubProfile.baselineBio;
          if (pubProfile.postingStation) effectiveUser.division = pubProfile.postingStation;
          if (pubProfile.officialEmail) effectiveUser.email = pubProfile.officialEmail;
          if (Array.isArray(pubProfile.skills) && pubProfile.skills.length > 0) {
            effectiveUser.skills = pubProfile.skills;
          }
        }
      } catch (err) {
        console.warn('Error syncing public profile:', err);
      }

      // Check live avatar
      const liveAvatar = localStorage.getItem('nirdesha_public_avatar');
      if (liveAvatar) {
        effectiveUser.avatarUrl = liveAvatar;
      }

      // Check live banner
      effectiveUser.bannerMode = localStorage.getItem('nirdesha_profile_banner_mode') || 'pattern';
      effectiveUser.bannerPattern = localStorage.getItem('nirdesha_profile_banner_pattern') || 'default';
      effectiveUser.bannerCustom = localStorage.getItem('nirdesha_profile_banner_custom') || '';

      // Check live score/elo
      const liveElo = localStorage.getItem('nirdesha_trainee_score');
      if (liveElo) {
        effectiveUser.elo = parseInt(liveElo, 10);
      }

      // Check live enrolled courses
      try {
        const rawEnrolled = localStorage.getItem('nirdesha_enrolled_courses');
        if (rawEnrolled) {
          const enrolledList = JSON.parse(rawEnrolled);
          if (Array.isArray(enrolledList) && enrolledList.length > 0) {
            effectiveUser.courses = enrolledList.slice(0, 3).map(c => ({
              title: c.title,
              platform: c.platformTitle || c.platform || 'iGOT Karmayogi Bharat',
              status: c.progress ? `In Progress • ${c.progress}%` : (c.status || 'Active'),
              certifiedDate: c.certifiedDate || 'Enrolled'
            }));
          }
        }
      } catch (err) {
        console.warn('Error reading enrolled courses:', err);
      }
    }

    // Check ban state from atomic flag as well
    const atomicBan = localStorage.getItem('nirdesha_banned_' + userId) === 'true';
    if (atomicBan) {
      effectiveUser.isBanned = true;
      effectiveUser.banReason = localStorage.getItem('nirdesha_ban_reason_' + userId) || effectiveUser.banReason;
      effectiveUser.bannedAt = localStorage.getItem('nirdesha_banned_at_' + userId) || effectiveUser.bannedAt;
    }

    // Header & Names
    const headerName = document.getElementById('inspect-modal-header-name');
    if (headerName) headerName.textContent = `${effectiveUser.name} (${effectiveUser.id})`;

    const fullName = document.getElementById('inspect-full-name');
    if (fullName) fullName.textContent = effectiveUser.name;

    const cadreTitle = document.getElementById('inspect-cadre-title');
    if (cadreTitle) cadreTitle.textContent = effectiveUser.cadre;

    const rollCode = document.getElementById('inspect-roll-code');
    if (rollCode) rollCode.textContent = `Roll: ${effectiveUser.id}`;

    const createdAtEl = document.getElementById('inspect-created-at');
    if (createdAtEl) createdAtEl.textContent = formatIsoDate(effectiveUser.createdAt);

    // Status Badge
    const statusBadge = document.getElementById('inspect-account-status-badge');
    if (statusBadge) {
      if (effectiveUser.isBanned) {
        statusBadge.className = 'badge-user-status status-banned';
        statusBadge.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg> BANNED • Access Suspended`;
      } else {
        statusBadge.className = 'badge-user-status status-active';
        statusBadge.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Active • Good Standing`;
      }
    }

    // Banner Stage: Render exact live pattern or custom uploaded graphic!
    const bannerStage = document.getElementById('inspect-profile-banner-stage');
    if (bannerStage) {
      if (effectiveUser.bannerMode === 'custom' && effectiveUser.bannerCustom) {
        bannerStage.className = 'profile-banner-stage';
        bannerStage.style.backgroundImage = `url("${effectiveUser.bannerCustom}")`;
        bannerStage.style.backgroundSize = 'cover';
        bannerStage.style.backgroundPosition = 'center';
        bannerStage.innerHTML = '<div class="cover-gradient-overlay"></div>';
      } else {
        const patternId = effectiveUser.bannerPattern || effectiveUser.bannerPreset || 'default';
        bannerStage.className = `profile-banner-stage ${patternId === 'default' ? 'banner-pattern-default' : `banner-pattern-${patternId}`}`;
        bannerStage.style.removeProperty('background-image');
        bannerStage.style.removeProperty('background-size');
        bannerStage.style.removeProperty('background-position');
        const preset = BANNER_PRESETS.find(p => p.id === patternId) || BANNER_PRESETS[0];
        bannerStage.innerHTML = preset.getHtml ? preset.getHtml() : '<div class="cover-gradient-overlay"></div>';
      }
    }

    // Avatar
    const avatarImg = document.getElementById('inspect-profile-avatar-img');
    const avatarInitials = document.getElementById('inspect-profile-avatar-initials');
    if (effectiveUser.avatarUrl && avatarImg && avatarInitials) {
      avatarImg.src = effectiveUser.avatarUrl;
      avatarImg.style.display = 'block';
      avatarInitials.style.display = 'none';
    } else if (avatarImg && avatarInitials) {
      avatarImg.style.display = 'none';
      avatarInitials.style.display = 'block';
      avatarInitials.textContent = effectiveUser.initials || effectiveUser.name.slice(0, 2).toUpperCase();
    }

    // Bio
    const bioEl = document.getElementById('inspect-bio');
    if (bioEl) bioEl.textContent = effectiveUser.bio || 'Official cadre officer registered under MoSPI Nirdesha.';

    // Metrics
    const eloEl = document.getElementById('inspect-elo');
    if (eloEl) eloEl.textContent = `${effectiveUser.elo ? effectiveUser.elo.toLocaleString() : '1,450'} Elo`;

    const streakEl = document.getElementById('inspect-streak');
    if (streakEl) streakEl.textContent = `${effectiveUser.streak || 0} Days`;

    const scoreEl = document.getElementById('inspect-score');
    if (scoreEl) scoreEl.textContent = `${effectiveUser.score || 85}% Certified`;

    const divisionEl = document.getElementById('inspect-division');
    if (divisionEl) divisionEl.textContent = `${effectiveUser.department}${effectiveUser.division ? ', ' + effectiveUser.division : ''}`;

    // Competencies
    const skillsContainer = document.getElementById('inspect-skills-container');
    if (skillsContainer) {
      skillsContainer.innerHTML = '';
      (effectiveUser.skills || ['Official Statistical Methods', 'Data Integrity', 'MoSPI Compliance']).forEach(skill => {
        const chip = document.createElement('span');
        chip.className = 'inspect-skill-chip';
        chip.textContent = skill;
        skillsContainer.appendChild(chip);
      });
    }

    // Courses (Latest 3)
    const coursesStack = document.getElementById('inspect-courses-stack');
    if (coursesStack) {
      coursesStack.innerHTML = '';
      (effectiveUser.courses || []).slice(0, 3).forEach(c => {
        const card = document.createElement('div');
        card.className = 'inspect-course-card';
        card.innerHTML = `
          <div>
            <div class="inspect-course-title">${escapeHtml(c.title)}</div>
            <div class="inspect-course-meta">
              <span>Platform: <strong>${escapeHtml(c.platform)}</strong></span>
              <span>•</span>
              <span>Status: <strong>${escapeHtml(c.status)}</strong></span>
            </div>
          </div>
          <span style="font-size: 0.72rem; font-weight: 700; color: #16a34a; background: #dcfce7; padding: 2px 8px; border-radius: 3px;">
            ${escapeHtml(c.certifiedDate || 'Completed')}
          </span>
        `;
        coursesStack.appendChild(card);
      });
    }

    // Contact & Credentials
    const emailEl = document.getElementById('inspect-email');
    if (emailEl) emailEl.textContent = effectiveUser.email || `${effectiveUser.id.toLowerCase()}@mospi.gov.in`;

    const phoneEl = document.getElementById('inspect-phone');
    if (phoneEl) phoneEl.textContent = effectiveUser.phone || '+91-98765-43210';

    const wingEl = document.getElementById('inspect-wing');
    if (wingEl) wingEl.textContent = effectiveUser.wing || effectiveUser.cadre;

    const securityEl = document.getElementById('inspect-security');
    if (securityEl) securityEl.textContent = effectiveUser.clearance || 'Tier 2 Verified Cadre';

    // Ban Details Box
    const banBox = document.getElementById('inspect-ban-details-box');
    const banReasonText = document.getElementById('inspect-ban-reason-text');
    const banTimestamp = document.getElementById('inspect-ban-timestamp');
    if (banBox && banReasonText && banTimestamp) {
      if (effectiveUser.isBanned) {
        banBox.style.display = 'block';
        banReasonText.textContent = effectiveUser.banReason || 'Administrative suspension applied.';
        banTimestamp.textContent = `Enacted On: ${formatIsoDate(effectiveUser.bannedAt)} by ${effectiveUser.bannedBy || 'Portal Administrator'}`;
      } else {
        banBox.style.display = 'none';
      }
    }

    // Footer Ban Action Button Toggle
    if (btnInspectBanAction) {
      if (effectiveUser.isBanned) {
        btnInspectBanAction.className = 'btn-admin-action';
        btnInspectBanAction.style.background = '#16a34a';
        btnInspectBanAction.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Unban Officer</span>
        `;
      } else {
        btnInspectBanAction.className = 'btn-admin-danger';
        btnInspectBanAction.style.background = '#dc2626';
        btnInspectBanAction.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
          <span>Ban Officer</span>
        `;
      }
    }

    inspectModal.style.display = 'flex';
  }

  function closeAdminUserProfileModal() {
    if (inspectModal) inspectModal.style.display = 'none';
    activeInspectedUserId = null;
  }

  if (btnCloseInspect) btnCloseInspect.addEventListener('click', closeAdminUserProfileModal);
  if (btnCloseInspectFooter) btnCloseInspectFooter.addEventListener('click', closeAdminUserProfileModal);

  if (btnInspectBanAction) {
    btnInspectBanAction.addEventListener('click', () => {
      if (!activeInspectedUserId) return;
      const user = USER_ROSTER.find(u => u.id === activeInspectedUserId);
      if (!user) return;

      if (user.isBanned) {
        executeUserUnban(user.id);
        openAdminUserProfileModal(user.id); // Refresh inspect view
      } else {
        closeAdminUserProfileModal();
        openBanWarningModal(user.id);
      }
    });
  }

  if (btnInspectMsgAction) {
    btnInspectMsgAction.addEventListener('click', () => {
      if (!activeInspectedUserId) return;
      const targetId = activeInspectedUserId;
      closeAdminUserProfileModal();
      openDirectMessageModal(targetId);
    });
  }

  // ==========================================================================
  // 4. ADMINISTRATIVE BAN WARNING & REASON SYSTEM
  // ==========================================================================
  const banWarningModal = document.getElementById('admin-ban-warning-modal');
  const btnCloseBanModal = document.getElementById('btn-close-ban-modal');
  const btnCancelBanAction = document.getElementById('btn-cancel-ban-action');
  const btnConfirmBanAction = document.getElementById('btn-confirm-ban-action');
  const banTargetOfficerEl = document.getElementById('ban-modal-target-officer');
  const banReasonInput = document.getElementById('admin-ban-reason-input');

  let activeBanTargetUserId = null;

  function openBanWarningModal(userId) {
    const user = USER_ROSTER.find(u => u.id === userId);
    if (!user || !banWarningModal) return;
    activeBanTargetUserId = userId;

    if (banTargetOfficerEl) {
      banTargetOfficerEl.textContent = `${user.name} (${user.cadre} • Roll: ${user.id})`;
    }
    if (banReasonInput) {
      banReasonInput.value = '';
    }
    banWarningModal.style.display = 'flex';
    if (banReasonInput) banReasonInput.focus();
  }

  function closeBanWarningModal() {
    if (banWarningModal) banWarningModal.style.display = 'none';
    activeBanTargetUserId = null;
  }

  if (btnCloseBanModal) btnCloseBanModal.addEventListener('click', closeBanWarningModal);
  if (btnCancelBanAction) btnCancelBanAction.addEventListener('click', closeBanWarningModal);

  function executeUserBan(userId, reason) {
    USER_ROSTER = loadUserDirectory();
    const userIdx = USER_ROSTER.findIndex(u => u.id === userId);
    if (userIdx === -1) return;

    const nowIso = new Date().toISOString();
    USER_ROSTER[userIdx].isBanned = true;
    USER_ROSTER[userIdx].banReason = reason.trim();
    USER_ROSTER[userIdx].bannedAt = nowIso;
    USER_ROSTER[userIdx].bannedBy = "Chief Administrative Officer (MoSPI HQ)";
    saveUserDirectory(USER_ROSTER);

    // Set atomic keys for zero-fail real-time detection
    try {
      localStorage.setItem('nirdesha_banned_' + userId, 'true');
      localStorage.setItem('nirdesha_ban_reason_' + userId, reason.trim());
      localStorage.setItem('nirdesha_banned_at_' + userId, nowIso);
    } catch (e) {
      console.warn('Error setting atomic ban keys:', e);
    }

    // Also synchronize to Messenger threads
    updateMessengerUserBanState(userId, true, reason.trim());

    renderAdminUserDirectory();
    renderChatThreadsList();
    if (activeChatUserId === userId) {
      renderActiveChatViewport(userId);
    }
  }

  function executeUserUnban(userId) {
    USER_ROSTER = loadUserDirectory();
    const userIdx = USER_ROSTER.findIndex(u => u.id === userId);
    if (userIdx === -1) return;

    USER_ROSTER[userIdx].isBanned = false;
    USER_ROSTER[userIdx].banReason = "";
    USER_ROSTER[userIdx].bannedAt = null;
    USER_ROSTER[userIdx].bannedBy = null;
    saveUserDirectory(USER_ROSTER);

    // Remove atomic keys
    try {
      localStorage.removeItem('nirdesha_banned_' + userId);
      localStorage.removeItem('nirdesha_ban_reason_' + userId);
      localStorage.removeItem('nirdesha_banned_at_' + userId);
    } catch (e) {
      console.warn('Error removing atomic ban keys:', e);
    }

    // Synchronize to Messenger threads
    updateMessengerUserBanState(userId, false, "");

    // Deliver an unban notification to the officer
    pushNotificationToUser(userId, {
      title: "Administrative Suspension Revoked",
      message: "Your portal access has been restored in full by the MoSPI Administration. All modules, assessments, and elab workspaces are now unlocked.",
      type: "achievement",
      category: "Administrative Directive",
      icon: "✅"
    });

    renderAdminUserDirectory();
    renderChatThreadsList();
    if (activeChatUserId === userId) {
      renderActiveChatViewport(userId);
    }
  }

  if (btnConfirmBanAction) {
    btnConfirmBanAction.addEventListener('click', () => {
      if (!activeBanTargetUserId) return;
      const reason = banReasonInput ? banReasonInput.value.trim() : '';
      if (!reason) {
        alert('Please enter a mandatory administrative reason for this suspension.');
        if (banReasonInput) banReasonInput.focus();
        return;
      }
      executeUserBan(activeBanTargetUserId, reason);
      closeBanWarningModal();
    });
  }

  // ==========================================================================
  // 5. DIRECT ADMINISTRATIVE MESSAGE / DIRECTIVE MODAL
  // ==========================================================================
  const directMsgModal = document.getElementById('admin-direct-message-modal');
  const btnCloseDirectMsg = document.getElementById('btn-close-direct-msg');
  const btnCancelDirectMsg = document.getElementById('btn-cancel-direct-msg');
  const btnSendDirectMsg = document.getElementById('btn-send-direct-msg');
  const directMsgRecipientEl = document.getElementById('direct-msg-recipient');
  const directMsgTextInput = document.getElementById('direct-msg-text');
  const directMsgImportantCheck = document.getElementById('direct-msg-important');

  let activeDirectMsgUserId = null;

  function openDirectMessageModal(userId) {
    const user = USER_ROSTER.find(u => u.id === userId);
    if (!user || !directMsgModal) return;
    activeDirectMsgUserId = userId;

    if (directMsgRecipientEl) {
      directMsgRecipientEl.textContent = `${user.name} (${user.id} • ${user.cadre})`;
    }
    if (directMsgTextInput) {
      directMsgTextInput.value = '';
    }
    if (directMsgImportantCheck) {
      directMsgImportantCheck.checked = true;
    }
    directMsgModal.style.display = 'flex';
    if (directMsgTextInput) directMsgTextInput.focus();
  }

  function closeDirectMessageModal() {
    if (directMsgModal) directMsgModal.style.display = 'none';
    activeDirectMsgUserId = null;
  }

  if (btnCloseDirectMsg) btnCloseDirectMsg.addEventListener('click', closeDirectMessageModal);
  if (btnCancelDirectMsg) btnCancelDirectMsg.addEventListener('click', closeDirectMessageModal);

  if (btnSendDirectMsg) {
    btnSendDirectMsg.addEventListener('click', () => {
      if (!activeDirectMsgUserId) return;
      const text = directMsgTextInput ? directMsgTextInput.value.trim() : '';
      if (!text) {
        alert('Please enter an official message.');
        return;
      }
      const isImportant = directMsgImportantCheck ? directMsgImportantCheck.checked : true;

      // Append to messenger thread
      sendAdminChatMessage(activeDirectMsgUserId, text, isImportant);

      // If marked important, dispatch directly into officer's Notifications center
      pushNotificationToUser(activeDirectMsgUserId, {
        title: "HIGH PRIORITY DIRECTIVE: MoSPI Administration",
        message: text,
        type: "directive",
        category: "Official Cadre Directive",
        icon: "🏛️",
        isPinned: true
      });

      closeDirectMessageModal();
      // Switch tab to messages and focus on this user
      switchTab('messages');
      selectChatConversation(activeDirectMsgUserId);
    });
  }

  // Helper to push into Trainee Notifications
  function pushNotificationToUser(userId, notifData) {
    try {
      const storageKey = 'nirdesha_trainee_notifications';
      const raw = localStorage.getItem(storageKey);
      let notifs = [];
      if (raw) {
        try { notifs = JSON.parse(raw); } catch (e) { notifs = []; }
      }
      if (!Array.isArray(notifs)) notifs = [];

      const newNotif = {
        id: 'notif_admin_' + Date.now(),
        type: notifData.type || 'directive',
        category: notifData.category || 'Official Cadre Directive',
        icon: notifData.icon || '🏛️',
        title: notifData.title || 'Directive from MoSPI Administration',
        message: notifData.message,
        createdAt: Date.now(),
        isPinned: notifData.isPinned !== undefined ? notifData.isPinned : true,
        humor: false,
        isDirective: true
      };

      notifs.unshift(newNotif);
      localStorage.setItem(storageKey, JSON.stringify(notifs));
      window.dispatchEvent(new Event('nirdesha_notifications_updated'));
    } catch (e) {
      console.warn('Error pushing notification to user:', e);
    }
  }

  // ==========================================================================
  // 6. TELEGRAM / WHATSAPP STYLE MESSAGES CONSOLE ENGINE
  // ==========================================================================
  const INITIAL_CONVERSATIONS = [
    {
      userId: "SSS-2024-8891",
      userName: "S. K. Raman",
      userCadre: "Junior Statistical Officer (JSO)",
      userRoll: "SSS-2024-8891",
      department: "NSSO Field Operations Division",
      division: "Western Zone",
      avatar: "",
      initials: "SR",
      isBanned: false,
      unreadCount: 0,
      lastMessage: "Understood sir. I have reviewed the Schedule 10.2 guidelines.",
      lastTimestamp: Date.now() - 1000 * 60 * 45,
      messages: [
        {
          id: "msg_1",
          sender: "admin",
          text: "Officer Raman, please ensure all Schedule 10.2 rural household consumption schedules for Western Zone are uploaded to the CAPI portal before Friday.",
          timestamp: Date.now() - 1000 * 60 * 120,
          isDirective: true
        },
        {
          id: "msg_2",
          sender: "user",
          text: "Understood sir. I have reviewed the Schedule 10.2 guidelines.",
          timestamp: Date.now() - 1000 * 60 * 45
        }
      ]
    },
    {
      userId: "ISS-2021-0842",
      userName: "Rajesh Sharma",
      userCadre: "Senior Statistical Officer (SSO)",
      userRoll: "ISS-2021-0842",
      department: "NSSO Field Operations (FOD)",
      division: "Northern Zone",
      avatar: "",
      initials: "RS",
      isBanned: false,
      unreadCount: 1,
      lastMessage: "Sir, submitted the Consumer Price Index (CPI) validation dataset.",
      lastTimestamp: Date.now() - 1000 * 60 * 18,
      messages: [
        {
          id: "msg_rs_1",
          sender: "user",
          text: "Sir, submitted the Consumer Price Index (CPI) validation dataset.",
          timestamp: Date.now() - 1000 * 60 * 18
        }
      ]
    },
    {
      userId: "SSS-2023-4105",
      userName: "Priyanka Deshmukh",
      userCadre: "Junior Statistical Officer (JSO)",
      userRoll: "SSS-2023-4105",
      department: "Central Statistics Office (CSO)",
      division: "Economic Statistics Wing",
      avatar: "",
      initials: "PD",
      isBanned: false,
      unreadCount: 0,
      lastMessage: "Under verification with Economic Census registry.",
      lastTimestamp: Date.now() - 1000 * 60 * 60 * 5,
      messages: [
        {
          id: "msg_pd_1",
          sender: "admin",
          text: "Priyanka, what is the status of the enterprise microdata reconciliation?",
          timestamp: Date.now() - 1000 * 60 * 60 * 8
        },
        {
          id: "msg_pd_2",
          sender: "user",
          text: "Under verification with Economic Census registry.",
          timestamp: Date.now() - 1000 * 60 * 60 * 5
        }
      ]
    },
    {
      userId: "DES-TN-1099",
      userName: "K. Sundaram",
      userCadre: "State Statistical Officer",
      userRoll: "DES-TN-1099",
      department: "Directorate of Economics & Statistics",
      division: "State Statistical Bureau",
      avatar: "",
      initials: "KS",
      isBanned: false,
      unreadCount: 0,
      lastMessage: "Crop cutting experiment coordinates have been synchronized.",
      lastTimestamp: Date.now() - 1000 * 60 * 60 * 24,
      messages: [
        {
          id: "msg_ks_1",
          sender: "user",
          text: "Crop cutting experiment coordinates have been synchronized.",
          timestamp: Date.now() - 1000 * 60 * 60 * 24
        }
      ]
    },
    {
      userId: "ISS-2019-1220",
      userName: "Dr. Ananya Sen",
      userCadre: "Director / Senior Statistical Officer",
      userRoll: "ISS-2019-1220",
      department: "National Accounts Division (NAD)",
      division: "Central Accounts Wing",
      avatar: "",
      initials: "AS",
      isBanned: false,
      unreadCount: 0,
      lastMessage: "Supply Use Table compilation documentation forwarded to Secretary.",
      lastTimestamp: Date.now() - 1000 * 60 * 60 * 48,
      messages: [
        {
          id: "msg_as_1",
          sender: "user",
          text: "Supply Use Table compilation documentation forwarded to Secretary.",
          timestamp: Date.now() - 1000 * 60 * 60 * 48
        }
      ]
    },
    {
      userId: "DES-MH-2041",
      userName: "Vikram Rao",
      userCadre: "Statistical Investigator Grade I",
      userRoll: "DES-MH-2041",
      department: "Directorate of Economics & Statistics",
      division: "Urban Statistics Wing",
      avatar: "",
      initials: "VR",
      isBanned: false,
      unreadCount: 0,
      lastMessage: "Municipal survey ward 14 report completed.",
      lastTimestamp: Date.now() - 1000 * 60 * 60 * 72,
      messages: [
        {
          id: "msg_vr_1",
          sender: "user",
          text: "Municipal survey ward 14 report completed.",
          timestamp: Date.now() - 1000 * 60 * 60 * 72
        }
      ]
    }
  ];

  function loadChatConversations() {
    try {
      const saved = localStorage.getItem('nirdesha_admin_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading nirdesha_admin_messages:', e);
    }
    localStorage.setItem('nirdesha_admin_messages', JSON.stringify(INITIAL_CONVERSATIONS));
    return INITIAL_CONVERSATIONS;
  }

  function saveChatConversations(convos) {
    try {
      localStorage.setItem('nirdesha_admin_messages', JSON.stringify(convos));
      window.dispatchEvent(new Event('nirdesha_admin_messages_updated'));
    } catch (e) {
      console.error('Error saving nirdesha_admin_messages:', e);
    }
  }

  let CHAT_CONVERSATIONS = loadChatConversations();
  let activeChatUserId = CHAT_CONVERSATIONS[0]?.userId || "SSS-2024-8891";
  let chatFilterMode = "all"; // "all" | "appeals" | "banned"
  let chatSearchQuery = "";

  const chatThreadsScroll = document.getElementById('chat-threads-scroll');
  const chatThreadsCountEl = document.getElementById('chat-threads-count');
  const chatThreadSearchInput = document.getElementById('chat-thread-search');
  const chatFilterBtns = document.querySelectorAll('.chat-filter-btn');
  const chatMessagesViewport = document.getElementById('chat-messages-viewport');
  const chatTextInput = document.getElementById('chat-text-input');
  const btnChatSend = document.getElementById('btn-chat-send');
  const adminMessagesBadge = document.getElementById('admin-messages-unread-badge');

  // Header Elements in Chat Main
  const chatHeaderUserClickable = document.getElementById('chat-header-user-clickable');
  const chatHeaderAvatar = document.getElementById('chat-header-avatar');
  const chatHeaderName = document.getElementById('chat-header-name');
  const chatHeaderBadge = document.getElementById('chat-header-status-badge');
  const chatHeaderCadre = document.getElementById('chat-header-cadre');
  const btnChatInspectProfile = document.getElementById('btn-chat-inspect-profile');
  const btnChatBanToggle = document.getElementById('btn-chat-ban-toggle');
  const chatBanBtnLabel = document.getElementById('chat-ban-btn-label');
  const btnChatDeleteUser = document.getElementById('btn-chat-delete-user');

  function updateMessengerUserBanState(userId, isBanned, reason) {
    CHAT_CONVERSATIONS = loadChatConversations();
    const thread = CHAT_CONVERSATIONS.find(c => c.userId === userId);
    if (thread) {
      thread.isBanned = isBanned;
      if (isBanned) {
        thread.messages.push({
          id: 'sys_' + Date.now(),
          sender: 'admin',
          text: `[ADMINISTRATIVE NOTICE]: User access suspended. Reason: ${reason}`,
          timestamp: Date.now(),
          isDirective: true
        });
        thread.lastMessage = `[SUSPENDED]: ${reason}`;
        thread.lastTimestamp = Date.now();
      }
      saveChatConversations(CHAT_CONVERSATIONS);
    }
  }

  function formatTime(timestamp) {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function renderChatThreadsList() {
    CHAT_CONVERSATIONS = loadChatConversations();
    if (!chatThreadsScroll) return;

    // Calculate total unread
    let totalUnread = 0;
    CHAT_CONVERSATIONS.forEach(c => {
      totalUnread += (c.unreadCount || 0);
    });
    if (adminMessagesBadge) {
      if (totalUnread > 0) {
        adminMessagesBadge.style.display = 'inline-block';
        adminMessagesBadge.textContent = totalUnread;
      } else {
        adminMessagesBadge.style.display = 'none';
      }
    }

    let filtered = CHAT_CONVERSATIONS.filter(c => {
      if (chatFilterMode === 'banned') return c.isBanned === true;
      if (chatFilterMode === 'appeals') {
        return c.messages && c.messages.some(m => m.isAppeal === true);
      }
      return true;
    });

    if (chatSearchQuery) {
      const q = chatSearchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.userName.toLowerCase().includes(q) ||
        c.userId.toLowerCase().includes(q) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
      );
    }

    if (chatThreadsCountEl) chatThreadsCountEl.textContent = filtered.length;
    chatThreadsScroll.innerHTML = '';

    if (filtered.length === 0) {
      chatThreadsScroll.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: #64748b; font-size: 0.8rem;">
          No conversations found.
        </div>`;
      return;
    }

    filtered.forEach(convo => {
      const item = document.createElement('div');
      item.className = `chat-thread-item ${convo.userId === activeChatUserId ? 'active' : ''}`;
      item.setAttribute('data-user-id', convo.userId);

      const avatarMarkup = convo.avatar
        ? `<img src="${convo.avatar}" alt="${convo.userName}">`
        : `<span>${convo.initials || convo.userName.slice(0, 2).toUpperCase()}</span>`;

      const bannedPill = convo.isBanned
        ? `<span class="chat-thread-ban-pill">BANNED</span>`
        : '';

      const unreadBadge = convo.unreadCount > 0
        ? `<span class="chat-unread-badge">${convo.unreadCount}</span>`
        : '';

      item.innerHTML = `
        <div class="chat-thread-avatar">${avatarMarkup}</div>
        <div class="chat-thread-info">
          <div class="chat-thread-top">
            <div class="chat-thread-name">${convo.userName}${bannedPill}</div>
            <span class="chat-thread-time">${formatTime(convo.lastTimestamp)}</span>
          </div>
          <div class="chat-thread-bottom">
            <span class="chat-thread-snippet">${convo.lastMessage || 'No messages yet'}</span>
            ${unreadBadge}
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        selectChatConversation(convo.userId);
      });

      chatThreadsScroll.appendChild(item);
    });
  }

  function selectChatConversation(userId) {
    activeChatUserId = userId;
    // Mark conversation unread as 0
    CHAT_CONVERSATIONS = loadChatConversations();
    const target = CHAT_CONVERSATIONS.find(c => c.userId === userId);
    if (target) {
      target.unreadCount = 0;
      saveChatConversations(CHAT_CONVERSATIONS);
    }

    renderChatThreadsList();
    renderActiveChatViewport(userId);
  }

  function renderActiveChatViewport(userId) {
    CHAT_CONVERSATIONS = loadChatConversations();
    const convo = CHAT_CONVERSATIONS.find(c => c.userId === userId);
    if (!convo || !chatMessagesViewport) return;

    // Header updates
    if (chatHeaderName) chatHeaderName.textContent = convo.userName;
    if (chatHeaderCadre) {
      chatHeaderCadre.textContent = `${convo.userCadre || 'Officer'} • Roll: ${convo.userId}`;
    }
    if (chatHeaderAvatar) {
      chatHeaderAvatar.innerHTML = convo.avatar
        ? `<img src="${convo.avatar}" alt="${convo.userName}">`
        : `<span>${convo.initials || convo.userName.slice(0, 2).toUpperCase()}</span>`;
    }
    if (chatHeaderBadge) {
      if (convo.isBanned) {
        chatHeaderBadge.className = 'chat-header-badge banned';
        chatHeaderBadge.textContent = 'BANNED';
      } else {
        chatHeaderBadge.className = 'chat-header-badge';
        chatHeaderBadge.textContent = 'Active';
      }
    }

    // Ban Toggle Button
    if (btnChatBanToggle && chatBanBtnLabel) {
      if (convo.isBanned) {
        btnChatBanToggle.className = 'btn-chat-action-header btn-chat-ban-toggle is-banned';
        chatBanBtnLabel.textContent = 'Unban Officer';
      } else {
        btnChatBanToggle.className = 'btn-chat-action-header btn-chat-ban-toggle';
        chatBanBtnLabel.textContent = 'Ban Officer';
      }
    }

    // Viewport messages
    chatMessagesViewport.innerHTML = `
      <div class="chat-date-divider">Official MoSPI Cadre Communications Channel</div>
    `;

    (convo.messages || []).forEach(msg => {
      const isOutgoing = msg.sender === 'admin';
      const row = document.createElement('div');
      row.className = `chat-msg-row ${isOutgoing ? 'outgoing' : 'incoming'}`;

      let flagHtml = '';
      if (msg.isDirective) {
        flagHtml = '<span class="chat-directive-flag">OFFICIAL DIRECTIVE</span><br>';
      } else if (msg.isAppeal) {
        flagHtml = '<span class="chat-appeal-flag">UNBAN APPEAL / INQUIRY</span><br>';
      }

      // User requirement: sent message must display a single tick (✓) next to timestamp
      // "because here admin cannot acknowledge whether the user have seen the message"
      const singleTick = isOutgoing ? '<span class="msg-single-tick" title="Sent ✓">&#10003;</span>' : '';

      row.innerHTML = `
        <div class="chat-bubble">
          ${flagHtml}
          <div class="chat-msg-text">${msg.text}</div>
          <div class="chat-msg-meta">
            <span>${formatTime(msg.timestamp)}</span>
            ${singleTick}
          </div>
        </div>
      `;
      chatMessagesViewport.appendChild(row);
    });

    // Auto-scroll to bottom
    chatMessagesViewport.scrollTop = chatMessagesViewport.scrollHeight;
  }

  function sendAdminChatMessage(userId, text, isDirective = false) {
    if (!text || !text.trim()) return;
    CHAT_CONVERSATIONS = loadChatConversations();
    let convo = CHAT_CONVERSATIONS.find(c => c.userId === userId);

    if (!convo) {
      const user = USER_ROSTER.find(u => u.id === userId);
      convo = {
        userId: userId,
        userName: user ? user.name : userId,
        userCadre: user ? user.cadre : 'Officer',
        userRoll: userId,
        avatar: user ? user.avatarUrl : '',
        initials: user ? user.initials : 'OF',
        isBanned: user ? user.isBanned : false,
        unreadCount: 0,
        lastMessage: text.trim(),
        lastTimestamp: Date.now(),
        messages: []
      };
      CHAT_CONVERSATIONS.unshift(convo);
    }

    const newMsg = {
      id: 'msg_' + Date.now(),
      sender: 'admin',
      text: text.trim(),
      timestamp: Date.now(),
      isDirective: isDirective
    };

    convo.messages.push(newMsg);
    convo.lastMessage = text.trim();
    convo.lastTimestamp = Date.now();
    saveChatConversations(CHAT_CONVERSATIONS);

    renderChatThreadsList();
    if (activeChatUserId === userId) {
      renderActiveChatViewport(userId);
    }
  }

  // Send Click & Enter Key Handlers (Strict Zero Media - Text Only)
  function handleSendFromInput() {
    if (!activeChatUserId || !chatTextInput) return;
    const text = chatTextInput.value.trim();
    if (!text) return;
    sendAdminChatMessage(activeChatUserId, text, false);
    chatTextInput.value = '';
    chatTextInput.focus();
  }

  if (btnChatSend) {
    btnChatSend.addEventListener('click', handleSendFromInput);
  }
  if (chatTextInput) {
    chatTextInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendFromInput();
      }
    });
  }

  // Click on Chat Header User Name or DP opens their Full Profile Inspector Modal!
  // (As requested: "when admin clicks on the profile / name of the user from the massages he can inspect his profile")
  if (chatHeaderUserClickable) {
    chatHeaderUserClickable.addEventListener('click', () => {
      if (activeChatUserId) {
        openAdminUserProfileModal(activeChatUserId);
      }
    });
  }
  if (btnChatInspectProfile) {
    btnChatInspectProfile.addEventListener('click', () => {
      if (activeChatUserId) {
        openAdminUserProfileModal(activeChatUserId);
      }
    });
  }

  // Ban Toggle from Chat Header
  if (btnChatBanToggle) {
    btnChatBanToggle.addEventListener('click', () => {
      if (!activeChatUserId) return;
      const user = USER_ROSTER.find(u => u.id === activeChatUserId);
      if (!user) return;
      if (user.isBanned) {
        executeUserUnban(user.id);
      } else {
        openBanWarningModal(user.id);
      }
    });
  }

  // Truncate / Delete User from Chats
  // (As requested: "also add an option of truncate or delete user so that admin will not recive him requset")
  if (btnChatDeleteUser) {
    btnChatDeleteUser.addEventListener('click', () => {
      if (!activeChatUserId) return;
      const convo = CHAT_CONVERSATIONS.find(c => c.userId === activeChatUserId);
      const name = convo ? convo.userName : activeChatUserId;

      const confirmed = confirm(`Are you sure you want to permanently delete user "${name}" from communications? They will be truncated from your messages console and will not be able to send you requests.`);
      if (!confirmed) return;

      CHAT_CONVERSATIONS = CHAT_CONVERSATIONS.filter(c => c.userId !== activeChatUserId);
      saveChatConversations(CHAT_CONVERSATIONS);

      // Select next available or default
      activeChatUserId = CHAT_CONVERSATIONS[0]?.userId || null;
      renderChatThreadsList();
      if (activeChatUserId) {
        renderActiveChatViewport(activeChatUserId);
      } else if (chatMessagesViewport) {
        chatMessagesViewport.innerHTML = `<div style="text-align:center; padding: 4rem 1rem; color: #64748b;">No active conversations.</div>`;
      }
    });
  }

  // Search Conversations
  if (chatThreadSearchInput) {
    chatThreadSearchInput.addEventListener('input', (e) => {
      chatSearchQuery = e.target.value.trim();
      renderChatThreadsList();
    });
  }

  // Filter Buttons (All / Appeals / Banned)
  chatFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      chatFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chatFilterMode = btn.getAttribute('data-filter') || 'all';
      renderChatThreadsList();
    });
  });

  // Cross-Tab Synchronization Listener
  window.addEventListener('storage', (e) => {
    if (e.key === 'nirdesha_user_directory') {
      USER_ROSTER = loadUserDirectory();
      renderAdminUserDirectory();
    }
    if (e.key === 'nirdesha_admin_messages') {
      CHAT_CONVERSATIONS = loadChatConversations();
      renderChatThreadsList();
      if (activeChatUserId) {
        renderActiveChatViewport(activeChatUserId);
      }
    }
  });

  window.addEventListener('nirdesha_admin_messages_updated', () => {
    renderChatThreadsList();
    if (activeChatUserId) {
      renderActiveChatViewport(activeChatUserId);
    }
  });

  window.addEventListener('nirdesha_user_directory_updated', () => {
    renderAdminUserDirectory();
  });

  // Initial Renders
  renderAdminUserDirectory();
  renderChatThreadsList();
  if (activeChatUserId) {
    renderActiveChatViewport(activeChatUserId);
  }

  // 6. ADMINISTRATOR PROFILE, BANNER ENGINE & AVATAR PARITY
  // ==========================================================================
  // Banner Elements
  const adminBannerStage = document.getElementById('admin-profile-banner-stage');
  const btnBannerEditMenu = document.getElementById('btn-admin-banner-edit-menu');
  const bannerEditDropdown = document.getElementById('admin-banner-edit-dropdown');
  const btnBannerOptUpload = document.getElementById('btn-admin-banner-opt-upload');
  const btnBannerOptLibrary = document.getElementById('btn-admin-banner-opt-library');
  const bannerFileInput = document.getElementById('admin-banner-file-input');

  const bannerModal = document.getElementById('admin-banner-library-modal');
  const bannerSelect = document.getElementById('admin-banner-library-select');
  const bannerPreviewViewport = document.getElementById('admin-banner-preview-viewport');
  const bannerPreviewName = document.getElementById('admin-banner-preview-name');
  const bannerMenuGrid = document.getElementById('admin-banner-menu-grid');
  const btnCloseBannerModal = document.getElementById('btn-admin-close-banner-library');
  const btnBannerCancel = document.getElementById('btn-admin-banner-library-cancel');
  const btnBannerApply = document.getElementById('btn-admin-banner-library-apply');
  const btnBannerReset = document.getElementById('btn-admin-banner-reset-default');
  const btnLibrarySwitchUpload = document.getElementById('btn-admin-library-switch-upload');

  // Load Saved Admin Profile
  function loadSavedAdminProfile() {
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
        if (profileSecurity && data.security) profileSecurity.value = data.security;
        if (profilePhone && data.phone) profilePhone.value = data.phone;
        if (profileSkills && data.skills) profileSkills.value = data.skills;

        // Synchronize display headers
        syncAdminDisplayHeaders(data);
      } catch (err) {
        console.error("Error loading admin profile:", err);
      }
    }

    // Load custom avatar
    const savedAvatar = localStorage.getItem('nirdesha_admin_avatar');
    if (savedAvatar) {
      setAdminAvatarImage(savedAvatar);
    }

    // Load custom banner
    applyActiveAdminBanner();
  }

  function syncAdminDisplayHeaders(data) {
    const name = (data && data.name) || (profileName ? profileName.value : 'Dr. A. K. Verma');
    const role = (data && data.role) || (profileRole ? profileRole.value : 'Director (Cadre Capacity & Training Governance)');
    const cadre = (data && data.cadre) || (profileCadre ? profileCadre.value : 'Indian Statistical Service (ISS)');
    const roll = (data && data.roll) || (profileRoll ? profileRoll.value : 'MoSPI-DIR-2016-0042');

    if (displayHeaderName) displayHeaderName.textContent = name;
    if (displayHeaderRole) displayHeaderRole.textContent = role;
    if (displayHeaderCadre) displayHeaderCadre.textContent = cadre;
    if (displayHeaderEmpcode) displayHeaderEmpcode.textContent = `Roll: ${roll}`;
    if (sidebarName) sidebarName.textContent = name;
    if (sidebarRole) sidebarRole.textContent = role;

    // Initials fallback
    if (name && avatarInitials) {
      const parts = name.trim().split(/\s+/);
      const inits = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
      avatarInitials.textContent = inits;
    }
  }

  function setAdminAvatarImage(src) {
    if (avatarImg) {
      avatarImg.src = src;
      avatarImg.style.display = 'block';
    }
    if (avatarInitials) {
      avatarInitials.style.display = 'none';
    }
    if (avatarBox) {
      avatarBox.classList.add('has-custom-avatar');
    }
    if (sidebarAvatar) {
      sidebarAvatar.style.backgroundImage = `url(${src})`;
      sidebarAvatar.style.backgroundSize = 'cover';
      sidebarAvatar.style.backgroundPosition = 'center';
      sidebarAvatar.textContent = '';
    }
  }

  function removeAdminAvatarImage() {
    localStorage.removeItem('nirdesha_admin_avatar');
    if (avatarImg) {
      avatarImg.src = '';
      avatarImg.style.display = 'none';
    }
    if (avatarInitials) {
      avatarInitials.style.display = 'block';
    }
    if (avatarBox) {
      avatarBox.classList.remove('has-custom-avatar');
    }
    if (sidebarAvatar) {
      sidebarAvatar.style.backgroundImage = '';
      sidebarAvatar.textContent = avatarInitials ? avatarInitials.textContent : 'AV';
    }
  }

  if (avatarQuickBtn && avatarFileInput) {
    avatarQuickBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      avatarFileInput.click();
    });
  }

  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Avatar photo must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        setAdminAvatarImage(dataUrl);
        localStorage.setItem('nirdesha_admin_avatar', dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }

  if (resetAvatarBtn) {
    resetAvatarBtn.addEventListener('click', () => {
      if (confirm('Remove custom profile picture and revert to official initials?')) {
        removeAdminAvatarImage();
      }
    });
  }

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const data = {
        name: profileName ? profileName.value.trim() : '',
        role: profileRole ? profileRole.value.trim() : '',
        email: profileEmail ? profileEmail.value.trim() : '',
        roll: profileRoll ? profileRoll.value.trim() : '',
        cadre: profileCadre ? profileCadre.value.trim() : '',
        division: profileDivision ? profileDivision.value.trim() : '',
        security: profileSecurity ? profileSecurity.value : 'level4',
        phone: profilePhone ? profilePhone.value.trim() : '',
        skills: profileSkills ? profileSkills.value.trim() : ''
      };

      localStorage.setItem('nirdesha_admin_profile', JSON.stringify(data));
      syncAdminDisplayHeaders(data);

      if (profileToast) {
        profileToast.style.display = 'block';
        setTimeout(() => { profileToast.style.display = 'none'; }, 3000);
      }
    });
  }

  // --------------------------------------------------------------------------
  // ADMIN BANNER CONTROLLER & MODAL
  // --------------------------------------------------------------------------
  let currentAdminBannerMode = localStorage.getItem('nirdesha_admin_banner_mode') || 'pattern';
  let currentAdminBannerPattern = localStorage.getItem('nirdesha_admin_banner_pattern') || 'default';
  let currentAdminBannerCustom = localStorage.getItem('nirdesha_admin_banner_custom') || '';
  let previewAdminPatternId = currentAdminBannerPattern;

  function applyActiveAdminBanner() {
    if (!adminBannerStage) return;
    if (currentAdminBannerMode === 'custom' && currentAdminBannerCustom) {
      renderAdminBannerIntoStage(adminBannerStage, 'custom', currentAdminBannerCustom);
    } else {
      renderAdminBannerIntoStage(adminBannerStage, 'pattern', currentAdminBannerPattern);
    }
  }

  // Toggle Edit Menu Dropdown
  if (btnBannerEditMenu && bannerEditDropdown) {
    btnBannerEditMenu.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isCurrentlyOpen = bannerEditDropdown.style.display === 'flex';
      bannerEditDropdown.style.display = isCurrentlyOpen ? 'none' : 'flex';
      btnBannerEditMenu.setAttribute('aria-expanded', String(!isCurrentlyOpen));
    });

    document.addEventListener('click', (e) => {
      if (bannerEditDropdown.style.display !== 'none') {
        if (!bannerEditDropdown.contains(e.target) && !btnBannerEditMenu.contains(e.target)) {
          bannerEditDropdown.style.display = 'none';
          btnBannerEditMenu.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }

  // Upload custom banner (<5MB GIF/Images)
  function triggerAdminBannerUpload(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (bannerEditDropdown) {
      bannerEditDropdown.style.display = 'none';
      if (btnBannerEditMenu) btnBannerEditMenu.setAttribute('aria-expanded', 'false');
    }
    if (bannerModal) bannerModal.style.display = 'none';
    if (bannerFileInput) bannerFileInput.click();
  }

  if (btnBannerOptUpload) btnBannerOptUpload.addEventListener('click', triggerAdminBannerUpload);
  if (btnLibrarySwitchUpload) btnLibrarySwitchUpload.addEventListener('click', triggerAdminBannerUpload);

  if (bannerFileInput) {
    bannerFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const isImage = file.type.startsWith('image/') || /\.(gif|png|jpe?g|webp|svg)$/i.test(file.name);
      if (!isImage) {
        alert('Invalid file format. Please upload an image or GIF file.');
        bannerFileInput.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller image or GIF.');
        bannerFileInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        currentAdminBannerMode = 'custom';
        currentAdminBannerCustom = dataUrl;
        localStorage.setItem('nirdesha_admin_banner_mode', 'custom');
        localStorage.setItem('nirdesha_admin_banner_custom', dataUrl);

        applyActiveAdminBanner();

        if (profileToast) {
          profileToast.textContent = '✓ Custom banner applied successfully!';
          profileToast.style.display = 'block';
          setTimeout(() => { profileToast.style.display = 'none'; }, 3000);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Open Banner Library Modal
  if (btnBannerOptLibrary) {
    btnBannerOptLibrary.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (bannerEditDropdown) {
        bannerEditDropdown.style.display = 'none';
        if (btnBannerEditMenu) btnBannerEditMenu.setAttribute('aria-expanded', 'false');
      }
      openAdminBannerLibraryModal();
    });
  }

  function openAdminBannerLibraryModal() {
    if (!bannerModal) return;
    previewAdminPatternId = currentAdminBannerMode === 'pattern' ? currentAdminBannerPattern : 'default';

    if (bannerSelect) bannerSelect.value = previewAdminPatternId;
    updateAdminBannerPreview(previewAdminPatternId);
    renderAdminBannerCardsGrid();

    bannerModal.style.display = 'flex';
  }

  function closeAdminBannerLibraryModal() {
    if (bannerModal) bannerModal.style.display = 'none';
  }

  if (btnCloseBannerModal) btnCloseBannerModal.addEventListener('click', closeAdminBannerLibraryModal);
  if (btnBannerCancel) btnBannerCancel.addEventListener('click', closeAdminBannerLibraryModal);

  if (bannerModal) {
    bannerModal.addEventListener('click', (e) => {
      if (e.target === bannerModal) closeAdminBannerLibraryModal();
    });
  }

  function updateAdminBannerPreview(patternId) {
    previewAdminPatternId = patternId;
    if (bannerPreviewViewport) {
      renderAdminBannerIntoStage(bannerPreviewViewport, 'pattern', patternId);
    }
    if (bannerPreviewName) {
      const preset = BANNER_PRESETS.find(p => p.id === patternId) || BANNER_PRESETS[0];
      bannerPreviewName.textContent = `${preset.name} (${preset.badge})`;
    }
    if (bannerSelect && bannerSelect.value !== patternId) {
      bannerSelect.value = patternId;
    }

    if (bannerMenuGrid) {
      bannerMenuGrid.querySelectorAll('.banner-menu-item').forEach(card => {
        const cardId = card.getAttribute('data-preset-id');
        if (cardId === patternId) {
          card.classList.add('is-active');
        } else {
          card.classList.remove('is-active');
        }
      });
    }
  }

  function renderAdminBannerCardsGrid() {
    if (!bannerMenuGrid) return;
    bannerMenuGrid.innerHTML = '';

    BANNER_PRESETS.forEach(preset => {
      const item = document.createElement('div');
      item.className = 'banner-menu-item';
      item.setAttribute('data-preset-id', preset.id);
      if (preset.id === previewAdminPatternId) item.classList.add('is-active');

      item.innerHTML = `
        <div class="banner-item-preview-thumb">
          <div class="banner-preview-viewport ${preset.id === 'default' ? 'banner-pattern-default' : `banner-pattern-${preset.id}`}">
            ${preset.getHtml ? preset.getHtml() : ''}
          </div>
        </div>
        <div class="banner-item-details">
          <div class="banner-item-header">
            <h4 class="banner-item-title">${escapeHtml(preset.name)}</h4>
            <span class="banner-item-badge">${escapeHtml(preset.badge)}</span>
          </div>
          <p class="banner-item-desc">${escapeHtml(preset.desc)}</p>
        </div>
      `;

      item.addEventListener('click', () => {
        updateAdminBannerPreview(preset.id);
      });

      item.addEventListener('dblclick', () => {
        updateAdminBannerPreview(preset.id);
        applySelectedAdminBanner();
      });

      bannerMenuGrid.appendChild(item);
    });
  }

  if (bannerSelect) {
    bannerSelect.addEventListener('change', (e) => {
      updateAdminBannerPreview(e.target.value);
    });
  }

  function applySelectedAdminBanner() {
    currentAdminBannerMode = 'pattern';
    currentAdminBannerPattern = previewAdminPatternId;
    localStorage.setItem('nirdesha_admin_banner_mode', 'pattern');
    localStorage.setItem('nirdesha_admin_banner_pattern', previewAdminPatternId);

    applyActiveAdminBanner();
    closeAdminBannerLibraryModal();

    if (profileToast) {
      profileToast.textContent = '✓ Administrator Banner Applied to Profile!';
      profileToast.style.display = 'block';
      setTimeout(() => { profileToast.style.display = 'none'; }, 3000);
    }
  }

  if (btnBannerApply) {
    btnBannerApply.addEventListener('click', applySelectedAdminBanner);
  }

  if (btnBannerReset) {
    btnBannerReset.addEventListener('click', () => {
      updateAdminBannerPreview('default');
      applySelectedAdminBanner();
    });
  }

  // Initialize Admin Profile on startup
  loadSavedAdminProfile();


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
    shimmerStatusText.textContent = ` Initializing MoSPI AI Document Extraction Engine for "${file.name}"...`;

    setTimeout(() => {
      shimmerStatusText.textContent = ` Parsing PDF structure & service credentials...`;
    }, 600);

    setTimeout(() => {
      shimmerStatusText.textContent = ` Auto-populating Cadre, Division & Baseline Skills...`;
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
