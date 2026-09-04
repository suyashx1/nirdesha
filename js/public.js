/**
 * Nirdesha — User / Public Trainee Learning Dashboard Script
 * Manages Heatmap Rendering, Elo Rating Simulator, Fixed-Time Quiz, NotebookLM Cards,
 * Interactive Profile Persistence, Avatar Upload, and Document Drop AI Extraction.
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

  const initialTheme = localStorage.getItem('nirdesha_theme_mode') || 'system';
  applyThemeMode(initialTheme, false);

  // 1. SIDEBAR COLLAPSE TOGGLE & TAB NAVIGATION
  // ==========================================================================
  const navItems = document.querySelectorAll('.trainee-nav-item[data-tab]');
  const viewTabs = document.querySelectorAll('.trainee-view-tab');
  const sidebar = document.getElementById('trainee-sidebar');
  const mobileToggle = document.getElementById('trainee-mobile-toggle');
  const sidebarToggleBtn = document.getElementById('trainee-sidebar-toggle');
  const MENU_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
  const CLOSE_SVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  function updateSidebarToggleIcon(isCollapsed) {
    if (!sidebarToggleBtn) return;
    sidebarToggleBtn.innerHTML = isCollapsed ? MENU_SVG : CLOSE_SVG;
    sidebarToggleBtn.setAttribute('title', isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar');
  }

  const initialCollapsed = localStorage.getItem('nirdesha_sidebar_collapsed') === 'true';
  if (initialCollapsed) {
    document.body.classList.add('sidebar-collapsed');
  }
  updateSidebarToggleIcon(initialCollapsed);

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      const isCollapsed = document.body.classList.contains('sidebar-collapsed');
      localStorage.setItem('nirdesha_sidebar_collapsed', isCollapsed ? 'true' : 'false');
      updateSidebarToggleIcon(isCollapsed);
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
        view.style.display = 'block';
        view.style.animation = 'none';
        view.offsetHeight; // trigger reflow
        view.style.animation = 'tabFadeInUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      } else {
        view.style.display = 'none';
      }
    });

    window.location.hash = tabId;

    if (tabId === 'notifications' && typeof window.renderTraineeNotifications === 'function') {
      window.renderTraineeNotifications();
    }

    if (tabId === 'quiz') {
      if (typeof window.updateQuizEloScore === 'function') {
        window.updateQuizEloScore();
      }
      if (typeof window.renderCustomQuizzesGrid === 'function') {
        window.renderCustomQuizzesGrid();
      }
    }

    if (tabId === 'skill-gap' && typeof window.renderSkillGapGrid === 'function') {
      window.renderSkillGapGrid();
    }

    if (tabId === 'profile' && typeof window.renderPublicOfficerDossier === 'function') {
      window.renderPublicOfficerDossier();
    }

    if (tabId === 'revision-cards' && typeof window.renderRevisionCardsUI === 'function') {
      window.renderRevisionCardsUI();
    }

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

  // Fast jump navigation from profile cards to other tabs
  document.addEventListener('click', (e) => {
    const jumpBtn = e.target.closest('.btn-card-tab-jump[data-jump-tab]');
    if (jumpBtn) {
      e.preventDefault();
      const targetTab = jumpBtn.getAttribute('data-jump-tab');
      if (targetTab) {
        switchTab(targetTab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  });

  if (window.location.hash) {
    const hashTab = window.location.hash.replace('#', '');
    const validView = document.getElementById(`view-${hashTab}`);
    if (validView) switchTab(hashTab);
  }

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Sign Out Action
  const signoutBtn = document.getElementById('trainee-signout-btn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('nirdesha_user_role');
      window.location.href = 'login.html';
    });
  }

  // 3. Render GitHub-Style Contribution Heatmap (Full Year • 52 Weeks • 364 Days)
  const heatmapGrid = document.getElementById('heatmap-grid');
  if (heatmapGrid) {
    heatmapGrid.innerHTML = '';
    // Generate 52 weeks of activity across 7 rows (364 days total)
    for (let i = 0; i < 364; i++) {
      const day = document.createElement('div');
      day.className = 'heatmap-day';
      const rand = Math.random();
      let lvl = 'lvl-1';
      let activities = 1;
      if (rand < 0.12) {
        lvl = '';
        activities = 0;
      } else if (rand < 0.42) {
        lvl = 'lvl-1';
        activities = 1;
      } else if (rand < 0.70) {
        lvl = 'lvl-2';
        activities = 2;
      } else if (rand < 0.88) {
        lvl = 'lvl-3';
        activities = 3;
      } else {
        lvl = 'lvl-4';
        activities = 5;
      }

      if (lvl) day.classList.add(lvl);
      day.title = `Day ${i + 1}: ${activities > 0 ? `${activities} learning tasks completed` : 'Rest day (0 tasks)'}`;
      heatmapGrid.appendChild(day);
    }
  }

  // ==========================================================================
  // 3. FIXED-TIME SELF-EVALUATION QUIZ ENGINE
  // ==========================================================================
  const quizModal = document.getElementById('quiz-modal');
  const openQuizBtns = document.querySelectorAll('.btn-open-quiz');
  const closeQuizBtn = document.getElementById('quiz-close-btn');
  const quizSubmitBtn = document.getElementById('quiz-submit-btn');
  const quizTimerEl = document.getElementById('quiz-timer');
  const quizResultBox = document.getElementById('quiz-result-box');
  const quizQuestionsWrap = document.getElementById('quiz-questions-wrap');

  let timerInterval = null;
  let remainingSeconds = 300; // 5:00 minutes

  function startQuizTimer() {
    remainingSeconds = 300;
    updateTimerDisplay();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        submitQuizAssessment();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    if (!quizTimerEl) return;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    quizTimerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  openQuizBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (quizModal) {
        quizModal.classList.add('open');
        quizResultBox.style.display = 'none';
        quizQuestionsWrap.style.display = 'block';
        quizSubmitBtn.style.display = 'block';
        startQuizTimer();
      }
    });
  });

  if (closeQuizBtn && quizModal) {
    closeQuizBtn.addEventListener('click', () => {
      quizModal.classList.remove('open');
      clearInterval(timerInterval);
    });
  }

  function submitQuizAssessment() {
    clearInterval(timerInterval);
    const timeSpent = 300 - remainingSeconds;
    const correctCount = 4;
    const totalCount = 5;
    const accuracy = (correctCount / totalCount) * 100;
    const timeEfficiency = Math.round(((300 - (timeSpent / 2)) / 300) * 100);

    quizQuestionsWrap.style.display = 'none';
    quizSubmitBtn.style.display = 'none';
    quizResultBox.style.display = 'block';

    const scoreDisplay = document.getElementById('quiz-score-val');
    const eloDeltaDisplay = document.getElementById('quiz-elo-delta');
    if (scoreDisplay) scoreDisplay.textContent = `${accuracy}% Accuracy (${timeSpent}s used, ${timeEfficiency}% Speed Efficiency)`;
    if (eloDeltaDisplay) eloDeltaDisplay.textContent = `+28 Elo (Domain: Survey Sampling & Theory)`;

    const topElo = document.getElementById('trainee-top-elo');
    if (topElo) topElo.textContent = '1,513 Elo (Level 3 - Proficient)';
  }

  if (quizSubmitBtn) {
    quizSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      submitQuizAssessment();
    });
  }

  // ==========================================================================
  // 4. INTERACTIVE OFFICER CADRE PROFILE & EDIT ENGINE (MATCHING OFFICIAL DOSSIER)
  // ==========================================================================
  const DEFAULT_PUBLIC_PROFILE = {
    name: 'S. K. Raman',
    role: 'Junior Statistical Officer (JSO)',
    division: 'Field Operations Division (NSSO / FOD)',
    cadreSeal: 'Verified SSS Cadre',
    status: 'Supervising NSS 80th Round socio-economic surveys & CAPI data verification in Western Zone • Preparing for Senior Statistical Officer (SSO) 2027 benchmark.',
    station: 'FOD Regional Office, Pune / New Delhi',
    tenure: '2024 Batch (2 Years Completed)',
    email: 'raman.sk@mospi.gov.in',
    cadre: 'Subordinate Statistical Service (SSS)',
    ministry: 'MoSPI, Government of India',
    roll: 'SSS-2024-8891',
    skills: 'Survey Sampling, CAPI Verification, Macro Deflators, Python Computing, DPDP Act 2023, NSS Frame Design',
    baseline: '1,485 Elo (Level 3 - Proficient)',
    avatarInitials: 'SR',
    avatarImg: '',
    currentWork: [
      { title: 'NSS 80th Round Socio-Economic Survey', desc: 'Field supervision across Western Zone sampling units, primary verification of CAPI electronic schedules, and non-response calibration.' },
      { title: 'Annual Survey of Industries (ASI) 2025-26', desc: 'Factory register audits, capital structure reporting verification, and consistency cross-checks against MCA-21 filings.' },
      { title: 'Periodic Labour Force Survey (PLFS) Validation', desc: 'Quarterly household enumeration monitoring, sampling weight verification, and preliminary data pipeline validation.' }
    ],
    futureWork: [
      { title: 'Senior Statistical Officer (SSO) Cadre Benchmark', desc: 'Achieving 100% curriculum readiness across NSSTA Module 204 (Macro Deflators) and statutory DPDP compliance protocols.' },
      { title: 'National Accounts Division (NAD) Transition Desk', desc: 'Planned deployment for supply-use table balance reconciliation and implicit price deflator benchmarking.' }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sk-raman-mospi',
      github: 'https://github.com/sk-raman-stat',
      twitter: 'https://x.com/sk_raman_stat',
      website: 'https://raman-statistics.gov.in',
      research: 'https://igotkarmayogi.gov.in/profile/sk-raman-8891'
    }
  };

  let currentOfficerProfile = { ...DEFAULT_PUBLIC_PROFILE };

  // View Mode Elements
  const profileViewMode = document.getElementById('profile-view-mode');
  const profileEditMode = document.getElementById('profile-edit-mode');
  const btnToggleEditProfile = document.getElementById('btn-toggle-edit-profile');
  const btnCancelEdit = document.getElementById('public-cancel-edit-btn');
  const btnCancelEditBottom = document.getElementById('public-cancel-edit-btn-bottom');
  const btnSaveProfile = document.getElementById('public-save-profile-btn');
  const btnSaveProfileBottom = document.getElementById('public-save-profile-btn-bottom');
  const profileToast = document.getElementById('public-profile-toast');

  // Form Input Elements
  const inputProfileName = document.getElementById('public-profile-name');
  const inputProfileRole = document.getElementById('public-profile-role');
  const inputProfileCadreSeal = document.getElementById('public-profile-cadre-seal');
  const inputProfileDivision = document.getElementById('public-profile-division');
  const inputProfileInitials = document.getElementById('public-profile-initials');
  const inputProfileStatus = document.getElementById('public-profile-status');
  const inputProfileCadre = document.getElementById('public-profile-cadre');
  const inputProfileMinistry = document.getElementById('public-profile-ministry');
  const inputProfileStation = document.getElementById('public-profile-station');
  const inputProfileTenure = document.getElementById('public-profile-tenure');
  const inputProfileEmail = document.getElementById('public-profile-email');
  const inputProfileRoll = document.getElementById('public-profile-roll');
  const inputProfileSkills = document.getElementById('public-profile-skills');
  const inputProfileBaseline = document.getElementById('public-profile-baseline');

  // Social & Web Links Form Inputs
  const inputSocialLinkedin = document.getElementById('public-profile-social-linkedin');
  const inputSocialGithub = document.getElementById('public-profile-social-github');
  const inputSocialTwitter = document.getElementById('public-profile-social-twitter');
  const inputSocialWebsite = document.getElementById('public-profile-social-website');
  const inputSocialResearch = document.getElementById('public-profile-social-research');

  // Work & Targets Form Inputs
  const inputWork1Title = document.getElementById('public-edit-work1-title');
  const inputWork1Desc = document.getElementById('public-edit-work1-desc');
  const inputWork2Title = document.getElementById('public-edit-work2-title');
  const inputWork2Desc = document.getElementById('public-edit-work2-desc');
  const inputWork3Title = document.getElementById('public-edit-work3-title');
  const inputWork3Desc = document.getElementById('public-edit-work3-desc');
  const inputTarget1Title = document.getElementById('public-edit-target1-title');
  const inputTarget1Desc = document.getElementById('public-edit-target1-desc');
  const inputTarget2Title = document.getElementById('public-edit-target2-title');
  const inputTarget2Desc = document.getElementById('public-edit-target2-desc');

  // Dossier Display Elements
  const dossierName = document.getElementById('public-dossier-name');
  const dossierSealText = document.getElementById('public-dossier-seal-text');
  const dossierRole = document.getElementById('public-dossier-role');
  const dossierStatus = document.getElementById('public-dossier-status');
  const dossierCadre = document.getElementById('public-dossier-cadre');
  const dossierMinistry = document.getElementById('public-dossier-ministry');
  const dossierStation = document.getElementById('public-dossier-station');
  const dossierTenure = document.getElementById('public-dossier-tenure');
  const dossierEmail = document.getElementById('public-dossier-email');
  const dossierRoll = document.getElementById('public-dossier-roll');
  const dossierBaseline = document.getElementById('public-dossier-baseline');
  const dossierInitials = document.getElementById('public-profile-avatar-initials');
  const dossierAvatarBox = document.getElementById('public-profile-avatar-box');
  const skillsGrid = document.getElementById('public-profile-skills-grid');
  const currentWorkWrap = document.getElementById('public-profile-current-work-list');
  const futureWorkWrap = document.getElementById('public-profile-future-work-list');
  const dossierSocialLinksBar = document.getElementById('public-dossier-social-links');
  const profileSocialList = document.getElementById('public-profile-social-list');
  const btnQuickAttachSocial = document.getElementById('btn-quick-attach-social');

  // Sidebar Elements
  const sidebarAvatar = document.getElementById('public-sidebar-avatar');
  const sidebarName = document.getElementById('public-sidebar-name');
  const sidebarRole = document.getElementById('public-sidebar-role');

  // Avatar Upload Elements
  const avatarQuickBtn = document.getElementById('public-avatar-quick-btn');
  const avatarFileInput = document.getElementById('public-avatar-file-input');

  function loadOfficerProfileData() {
    try {
      const saved = localStorage.getItem('nirdesha_officer_profile') || localStorage.getItem('nirdesha_public_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        currentOfficerProfile = { ...DEFAULT_PUBLIC_PROFILE, ...parsed };
      }
    } catch (e) {
      console.warn('Could not read officer profile from localStorage:', e);
    }
    return currentOfficerProfile;
  }

  function setAvatarVisuals(src, initials) {
    const textInitials = initials || currentOfficerProfile.avatarInitials || 'SR';
    if (src) {
      if (dossierAvatarBox) {
        dossierAvatarBox.style.backgroundImage = `url(${src})`;
        dossierAvatarBox.style.backgroundSize = 'cover';
        dossierAvatarBox.style.backgroundPosition = 'center';
      }
      if (dossierInitials) dossierInitials.style.display = 'none';
      if (sidebarAvatar) {
        sidebarAvatar.style.backgroundImage = `url(${src})`;
        sidebarAvatar.style.backgroundSize = 'cover';
        sidebarAvatar.style.backgroundPosition = 'center';
        sidebarAvatar.textContent = '';
      }
    } else {
      if (dossierAvatarBox) {
        dossierAvatarBox.style.backgroundImage = 'none';
      }
      if (dossierInitials) {
        dossierInitials.style.display = 'block';
        dossierInitials.textContent = textInitials;
      }
      if (sidebarAvatar) {
        sidebarAvatar.style.backgroundImage = 'none';
        sidebarAvatar.textContent = textInitials;
      }
    }
  }

  function renderPublicOfficerDossier(data) {
    const p = data || currentOfficerProfile;

    // Header & Identity
    if (dossierName) dossierName.textContent = p.name;
    if (dossierSealText) dossierSealText.textContent = p.cadreSeal || 'Verified SSS Cadre';
    if (dossierRole) dossierRole.textContent = `${p.role} • ${p.division}`;
    if (dossierStatus) dossierStatus.textContent = `"${p.status}"`;

    // Service Records
    if (dossierCadre) dossierCadre.textContent = p.cadre;
    if (dossierMinistry) dossierMinistry.textContent = p.ministry;
    if (dossierStation) dossierStation.textContent = p.station;
    if (dossierTenure) dossierTenure.textContent = p.tenure;
    if (dossierEmail) dossierEmail.textContent = p.email;
    if (dossierRoll) dossierRoll.textContent = p.roll;
    if (dossierBaseline) dossierBaseline.textContent = p.baseline || '1,485 Elo (Level 3 - Proficient)';

    // Assessment Parameters Sync (Skill Gap & AI Quiz)
    const paramEloEl = document.getElementById('profile-param-elo');
    if (paramEloEl) {
      const savedElo = localStorage.getItem('nirdesha_trainee_elo');
      if (savedElo) {
        paramEloEl.textContent = parseInt(savedElo, 10).toLocaleString();
      }
    }
    const paramReadinessEl = document.getElementById('profile-param-readiness');
    if (paramReadinessEl) {
      const savedReadiness = localStorage.getItem('nirdesha_readiness_index');
      if (savedReadiness) {
        paramReadinessEl.textContent = savedReadiness + '%';
      }
    }
    const paramBonusEl = document.getElementById('profile-param-bonus');
    if (paramBonusEl) {
      const savedBonus = localStorage.getItem('nirdesha_mastery_bonus');
      if (savedBonus) {
        paramBonusEl.textContent = '+' + savedBonus + ' pts';
      }
    }

    // Avatar
    const customAvatar = p.avatarImg || localStorage.getItem('nirdesha_public_avatar') || '';
    setAvatarVisuals(customAvatar, p.avatarInitials);

    // Sidebar sync
    if (sidebarName) sidebarName.textContent = p.name;
    if (sidebarRole) sidebarRole.textContent = p.role;

    // Equal-Sized Competency Pills with Tooltips
    if (skillsGrid) {
      skillsGrid.innerHTML = '';
      const skillList = Array.isArray(p.skills)
        ? p.skills
        : (typeof p.skills === 'string' ? p.skills.split(',').map(s => s.trim()).filter(Boolean) : []);

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
        skillsGrid.appendChild(box);
      });
    }

    // Current Operational Duties
    if (currentWorkWrap && p.currentWork) {
      currentWorkWrap.innerHTML = '';
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
        currentWorkWrap.appendChild(row);
      });
    }

    // Future Transition Targets
    if (futureWorkWrap && p.futureWork) {
      futureWorkWrap.innerHTML = '';
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
        futureWorkWrap.appendChild(row);
      });
    }

    // Connected Social & Professional Profiles
    const socialPlatforms = [
      {
        key: 'linkedin',
        name: 'LinkedIn',
        class: 'chip-linkedin',
        iconBoxClass: 'icon-linkedin',
        iconSvg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9m1.39 9.74v-8.37H5.07v8.37h2.78z"/></svg>'
      },
      {
        key: 'github',
        name: 'GitHub',
        class: 'chip-github',
        iconBoxClass: 'icon-github',
        iconSvg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>'
      },
      {
        key: 'twitter',
        name: 'Twitter / X',
        class: 'chip-twitter',
        iconBoxClass: 'icon-twitter',
        iconSvg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
      },
      {
        key: 'website',
        name: 'Portfolio',
        class: 'chip-website',
        iconBoxClass: 'icon-website',
        iconSvg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
      },
      {
        key: 'research',
        name: 'iGOT / Research',
        class: 'chip-research',
        iconBoxClass: 'icon-research',
        iconSvg: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>'
      }
    ];

    const socialData = p.socialLinks || {};

    // 1. Render Header Social Links Bar
    if (dossierSocialLinksBar) {
      dossierSocialLinksBar.innerHTML = '';
      let attachedCount = 0;
      socialPlatforms.forEach(plat => {
        const rawUrl = (socialData[plat.key] || '').trim();
        if (rawUrl) {
          attachedCount++;
          const href = /^https?:\/\//i.test(rawUrl) ? rawUrl : 'https://' + rawUrl;
          const chip = document.createElement('a');
          chip.href = href;
          chip.target = '_blank';
          chip.rel = 'noopener noreferrer';
          chip.className = `profile-social-chip ${plat.class}`;
          chip.setAttribute('title', `Open ${plat.name}: ${rawUrl}`);
          chip.innerHTML = `
            ${plat.iconSvg}
            <span>${plat.name}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:0.7;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          `;
          dossierSocialLinksBar.appendChild(chip);
        }
      });

      // Quick attach button in the bar
      const attachBtn = document.createElement('button');
      attachBtn.type = 'button';
      attachBtn.className = 'profile-social-chip chip-attach';
      attachBtn.setAttribute('title', 'Attach or edit social & professional profile links');
      attachBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>${attachedCount > 0 ? '+ Attach More Links' : '+ Attach Social Links'}</span>
      `;
      attachBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openSocialLinksEdit();
      });
      dossierSocialLinksBar.appendChild(attachBtn);
    }

    // 2. Render Left Column Social List
    if (profileSocialList) {
      profileSocialList.innerHTML = '';
      socialPlatforms.forEach(plat => {
        const rawUrl = (socialData[plat.key] || '').trim();
        const row = document.createElement('div');
        row.className = 'profile-social-item';

        if (rawUrl) {
          const href = /^https?:\/\//i.test(rawUrl) ? rawUrl : 'https://' + rawUrl;
          const displayUrl = rawUrl.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
          row.innerHTML = `
            <div class="profile-social-item-left">
              <div class="profile-social-icon-box ${plat.iconBoxClass}">
                ${plat.iconSvg}
              </div>
              <div class="profile-social-info">
                <span class="profile-social-platform">${plat.name}</span>
                <span class="profile-social-url" title="${rawUrl}">${displayUrl}</span>
              </div>
            </div>
            <a href="${href}" target="_blank" rel="noopener noreferrer" class="profile-social-action-btn" title="Open ${plat.name}">
              <span>Visit</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          `;
        } else {
          row.innerHTML = `
            <div class="profile-social-item-left">
              <div class="profile-social-icon-box ${plat.iconBoxClass}" style="opacity: 0.5;">
                ${plat.iconSvg}
              </div>
              <div class="profile-social-info">
                <span class="profile-social-platform" style="color: #64748b;">${plat.name}</span>
                <span class="profile-social-url" style="font-style: italic;">Not attached yet</span>
              </div>
            </div>
            <button type="button" class="profile-social-empty-badge" data-key="${plat.key}">
              + Attach
            </button>
          `;
          const emptyBtn = row.querySelector('.profile-social-empty-badge');
          if (emptyBtn) {
            emptyBtn.addEventListener('click', () => {
              window.openSocialLinksEdit(plat.key);
            });
          }
        }
        profileSocialList.appendChild(row);
      });
    }
  }

  window.renderPublicOfficerDossier = renderPublicOfficerDossier;

  window.openSocialLinksEdit = function(fieldKey) {
    if (profileViewMode) profileViewMode.style.display = 'none';
    if (profileEditMode) profileEditMode.style.display = 'block';
    const targetSection = document.getElementById('section-edit-social-links');
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const targetInput = fieldKey ? document.getElementById(`public-profile-social-${fieldKey}`) : inputSocialLinkedin;
    if (targetInput) {
      targetInput.focus();
      targetInput.select();
    }
  };

  if (btnQuickAttachSocial) {
    btnQuickAttachSocial.addEventListener('click', (e) => {
      e.preventDefault();
      window.openSocialLinksEdit();
    });
  }

  function populateEditForm(p) {
    if (inputProfileName) inputProfileName.value = p.name || '';
    if (inputProfileRole) inputProfileRole.value = p.role || '';
    if (inputProfileCadreSeal) inputProfileCadreSeal.value = p.cadreSeal || 'Verified SSS Cadre';
    if (inputProfileDivision) inputProfileDivision.value = p.division || '';
    if (inputProfileInitials) inputProfileInitials.value = p.avatarInitials || 'SR';
    if (inputProfileStatus) inputProfileStatus.value = p.status || '';
    if (inputProfileCadre) inputProfileCadre.value = p.cadre || '';
    if (inputProfileMinistry) inputProfileMinistry.value = p.ministry || 'MoSPI, Government of India';
    if (inputProfileStation) inputProfileStation.value = p.station || '';
    if (inputProfileTenure) inputProfileTenure.value = p.tenure || '';
    if (inputProfileEmail) inputProfileEmail.value = p.email || '';
    if (inputProfileRoll) inputProfileRoll.value = p.roll || '';
    if (inputProfileSkills) {
      inputProfileSkills.value = Array.isArray(p.skills) ? p.skills.join(', ') : (p.skills || '');
    }
    if (inputProfileBaseline) inputProfileBaseline.value = p.baseline || '1,485 Elo (Level 3 - Proficient)';

    // Social & Web Links
    const s = p.socialLinks || {};
    if (inputSocialLinkedin) inputSocialLinkedin.value = s.linkedin || '';
    if (inputSocialGithub) inputSocialGithub.value = s.github || '';
    if (inputSocialTwitter) inputSocialTwitter.value = s.twitter || '';
    if (inputSocialWebsite) inputSocialWebsite.value = s.website || '';
    if (inputSocialResearch) inputSocialResearch.value = s.research || '';

    // Work items
    if (p.currentWork && p.currentWork[0]) {
      if (inputWork1Title) inputWork1Title.value = p.currentWork[0].title || '';
      if (inputWork1Desc) inputWork1Desc.value = p.currentWork[0].desc || '';
    }
    if (p.currentWork && p.currentWork[1]) {
      if (inputWork2Title) inputWork2Title.value = p.currentWork[1].title || '';
      if (inputWork2Desc) inputWork2Desc.value = p.currentWork[1].desc || '';
    }
    if (p.currentWork && p.currentWork[2]) {
      if (inputWork3Title) inputWork3Title.value = p.currentWork[2].title || '';
      if (inputWork3Desc) inputWork3Desc.value = p.currentWork[2].desc || '';
    }

    // Future items
    if (p.futureWork && p.futureWork[0]) {
      if (inputTarget1Title) inputTarget1Title.value = p.futureWork[0].title || '';
      if (inputTarget1Desc) inputTarget1Desc.value = p.futureWork[0].desc || '';
    }
    if (p.futureWork && p.futureWork[1]) {
      if (inputTarget2Title) inputTarget2Title.value = p.futureWork[1].title || '';
      if (inputTarget2Desc) inputTarget2Desc.value = p.futureWork[1].desc || '';
    }
  }

  function saveOfficerProfileData() {
    const updated = {
      ...currentOfficerProfile,
      name: inputProfileName ? inputProfileName.value.trim() : currentOfficerProfile.name,
      role: inputProfileRole ? inputProfileRole.value.trim() : currentOfficerProfile.role,
      cadreSeal: inputProfileCadreSeal ? inputProfileCadreSeal.value.trim() : currentOfficerProfile.cadreSeal,
      division: inputProfileDivision ? inputProfileDivision.value.trim() : currentOfficerProfile.division,
      avatarInitials: inputProfileInitials ? inputProfileInitials.value.trim().toUpperCase() : currentOfficerProfile.avatarInitials,
      status: inputProfileStatus ? inputProfileStatus.value.trim() : currentOfficerProfile.status,
      cadre: inputProfileCadre ? inputProfileCadre.value.trim() : currentOfficerProfile.cadre,
      ministry: inputProfileMinistry ? inputProfileMinistry.value.trim() : currentOfficerProfile.ministry,
      station: inputProfileStation ? inputProfileStation.value.trim() : currentOfficerProfile.station,
      tenure: inputProfileTenure ? inputProfileTenure.value.trim() : currentOfficerProfile.tenure,
      email: inputProfileEmail ? inputProfileEmail.value.trim() : currentOfficerProfile.email,
      roll: inputProfileRoll ? inputProfileRoll.value.trim() : currentOfficerProfile.roll,
      skills: inputProfileSkills ? inputProfileSkills.value.trim() : currentOfficerProfile.skills,
      baseline: inputProfileBaseline ? inputProfileBaseline.value.trim() : currentOfficerProfile.baseline,
      socialLinks: {
        linkedin: inputSocialLinkedin ? inputSocialLinkedin.value.trim() : (currentOfficerProfile.socialLinks?.linkedin || ''),
        github: inputSocialGithub ? inputSocialGithub.value.trim() : (currentOfficerProfile.socialLinks?.github || ''),
        twitter: inputSocialTwitter ? inputSocialTwitter.value.trim() : (currentOfficerProfile.socialLinks?.twitter || ''),
        website: inputSocialWebsite ? inputSocialWebsite.value.trim() : (currentOfficerProfile.socialLinks?.website || ''),
        research: inputSocialResearch ? inputSocialResearch.value.trim() : (currentOfficerProfile.socialLinks?.research || '')
      },
      currentWork: [
        {
          title: inputWork1Title ? inputWork1Title.value.trim() : (currentOfficerProfile.currentWork[0]?.title || ''),
          desc: inputWork1Desc ? inputWork1Desc.value.trim() : (currentOfficerProfile.currentWork[0]?.desc || '')
        },
        {
          title: inputWork2Title ? inputWork2Title.value.trim() : (currentOfficerProfile.currentWork[1]?.title || ''),
          desc: inputWork2Desc ? inputWork2Desc.value.trim() : (currentOfficerProfile.currentWork[1]?.desc || '')
        },
        {
          title: inputWork3Title ? inputWork3Title.value.trim() : (currentOfficerProfile.currentWork[2]?.title || ''),
          desc: inputWork3Desc ? inputWork3Desc.value.trim() : (currentOfficerProfile.currentWork[2]?.desc || '')
        }
      ],
      futureWork: [
        {
          title: inputTarget1Title ? inputTarget1Title.value.trim() : (currentOfficerProfile.futureWork[0]?.title || ''),
          desc: inputTarget1Desc ? inputTarget1Desc.value.trim() : (currentOfficerProfile.futureWork[0]?.desc || '')
        },
        {
          title: inputTarget2Title ? inputTarget2Title.value.trim() : (currentOfficerProfile.futureWork[1]?.title || ''),
          desc: inputTarget2Desc ? inputTarget2Desc.value.trim() : (currentOfficerProfile.futureWork[1]?.desc || '')
        }
      ]
    };

    currentOfficerProfile = updated;

    try {
      localStorage.setItem('nirdesha_officer_profile', JSON.stringify(updated));
      localStorage.setItem('nirdesha_public_profile', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save profile to localStorage:', e);
    }

    renderPublicOfficerDossier(updated);

    // Switch view
    if (profileEditMode) profileEditMode.style.display = 'none';
    if (profileViewMode) profileViewMode.style.display = 'block';

    // Show toast
    if (profileToast) {
      profileToast.textContent = '✓ Profile & Cadre Dossier Updated Successfully!';
      profileToast.style.display = 'block';
      setTimeout(() => { profileToast.style.display = 'none'; }, 3500);
    }
  }

  // Toggle View <-> Edit mode
  if (btnToggleEditProfile) {
    btnToggleEditProfile.addEventListener('click', () => {
      populateEditForm(currentOfficerProfile);
      if (profileViewMode) profileViewMode.style.display = 'none';
      if (profileEditMode) profileEditMode.style.display = 'block';
      window.scrollTo({ top: profileEditMode.offsetTop - 80, behavior: 'smooth' });
    });
  }

  const cancelEditHandler = () => {
    if (profileEditMode) profileEditMode.style.display = 'none';
    if (profileViewMode) profileViewMode.style.display = 'block';
  };

  if (btnCancelEdit) btnCancelEdit.addEventListener('click', cancelEditHandler);
  if (btnCancelEditBottom) btnCancelEditBottom.addEventListener('click', cancelEditHandler);

  if (btnSaveProfile) btnSaveProfile.addEventListener('click', saveOfficerProfileData);
  if (btnSaveProfileBottom) btnSaveProfileBottom.addEventListener('click', saveOfficerProfileData);

  // Quick Avatar upload
  if (avatarQuickBtn && avatarFileInput) {
    avatarQuickBtn.addEventListener('click', () => avatarFileInput.click());

    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        currentOfficerProfile.avatarImg = dataUrl;
        setAvatarVisuals(dataUrl, currentOfficerProfile.avatarInitials);
        try {
          localStorage.setItem('nirdesha_public_avatar', dataUrl);
          localStorage.setItem('nirdesha_officer_profile', JSON.stringify(currentOfficerProfile));
          localStorage.setItem('nirdesha_public_profile', JSON.stringify(currentOfficerProfile));
        } catch (err) {
          console.warn('Could not persist avatar to localStorage:', err);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Initial load & render
  loadOfficerProfileData();
  renderPublicOfficerDossier(currentOfficerProfile);

  // ==========================================================================
  // 4.5. FULL PARAGRAPH & TEXT EDITOR POP-UP ENGINE FOR PROFILE FIELDS
  // ==========================================================================
  const profileExpandModal = document.getElementById('profile-text-expand-modal');
  const profileExpandTitle = document.getElementById('profile-expand-modal-title');
  const profileExpandTextarea = document.getElementById('profile-expand-textarea');
  const profileExpandCounts = document.getElementById('profile-expand-counts');
  const btnProfileExpandClose = document.getElementById('profile-expand-close-btn');
  const btnProfileExpandCancel = document.getElementById('profile-expand-cancel-btn');
  const btnProfileExpandApply = document.getElementById('profile-expand-apply-btn');
  const toggleClickToPopup = document.getElementById('toggle-click-to-popup');

  let activeExpandInput = null;
  let originalExpandContent = '';

  function updateExpandCounts(val) {
    if (!profileExpandCounts) return;
    const len = val ? val.length : 0;
    const words = (val && val.trim()) ? val.trim().split(/\s+/).length : 0;
    profileExpandCounts.textContent = `${len} characters • ${words} words`;
  }

  function openProfileExpandModal(inputEl) {
    if (!profileExpandModal || !inputEl) return;
    activeExpandInput = inputEl;
    const label = inputEl.getAttribute('data-label') || 
                  (inputEl.closest('.profile-form-group')?.querySelector('.profile-field-label span')?.textContent) || 
                  'Field';

    if (profileExpandTitle) {
      profileExpandTitle.textContent = `Editing: ${label}`;
    }

    const currentVal = inputEl.value || '';
    originalExpandContent = currentVal;

    if (profileExpandTextarea) {
      profileExpandTextarea.value = currentVal;
      updateExpandCounts(currentVal);
    }

    profileExpandModal.style.display = 'flex';

    setTimeout(() => {
      if (profileExpandTextarea) {
        profileExpandTextarea.focus();
        profileExpandTextarea.setSelectionRange(profileExpandTextarea.value.length, profileExpandTextarea.value.length);
      }
    }, 60);
  }

  function closeProfileExpandModal(checkDirty = true) {
    if (!profileExpandModal) return;

    if (checkDirty && profileExpandTextarea && profileExpandTextarea.value !== originalExpandContent) {
      const discard = confirm("You have unsaved edits in this pop-up dialog. Discard changes and exit?");
      if (!discard) return;
    }

    profileExpandModal.style.display = 'none';
    if (activeExpandInput) {
      activeExpandInput.focus();
    }
  }

  function applyProfileExpandModal() {
    if (!activeExpandInput || !profileExpandTextarea) return;
    const newVal = profileExpandTextarea.value;
    activeExpandInput.value = newVal;

    // Trigger synthetic input & change events
    activeExpandInput.dispatchEvent(new Event('input', { bubbles: true }));
    activeExpandInput.dispatchEvent(new Event('change', { bubbles: true }));

    // Visual pulse feedback
    activeExpandInput.classList.add('field-just-applied');
    setTimeout(() => activeExpandInput.classList.remove('field-just-applied'), 1300);

    profileExpandModal.style.display = 'none';
  }

  if (profileExpandTextarea) {
    profileExpandTextarea.addEventListener('input', () => {
      updateExpandCounts(profileExpandTextarea.value);
    });

    profileExpandTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        applyProfileExpandModal();
      }
    });
  }

  if (btnProfileExpandApply) {
    btnProfileExpandApply.addEventListener('click', applyProfileExpandModal);
  }

  if (btnProfileExpandClose) {
    btnProfileExpandClose.addEventListener('click', () => closeProfileExpandModal(true));
  }

  if (btnProfileExpandCancel) {
    btnProfileExpandCancel.addEventListener('click', () => closeProfileExpandModal(true));
  }

  // Backdrop click auto-dismiss with unsaved warning
  if (profileExpandModal) {
    profileExpandModal.addEventListener('click', (e) => {
      if (e.target === profileExpandModal) {
        closeProfileExpandModal(true);
      }
    });
  }

  // Global ESC key listener for pop-up modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileExpandModal && profileExpandModal.style.display === 'flex') {
      closeProfileExpandModal(true);
    }
  });

  // Wire all input / textarea clicks & expand buttons
  function initProfileExpandTriggers() {
    const editContainer = document.getElementById('profile-edit-mode');
    if (!editContainer) return;

    // Expand two-arrow icon buttons [ ⤢ ]
    editContainer.querySelectorAll('.btn-field-expand').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetId = btn.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        if (targetEl) openProfileExpandModal(targetEl);
      });
    });

    // Clicking any input or textarea in the form
    editContainer.querySelectorAll('.profile-input-field').forEach(inputEl => {
      inputEl.addEventListener('click', () => {
        if (!toggleClickToPopup || toggleClickToPopup.checked) {
          openProfileExpandModal(inputEl);
        }
      });
    });
  }

  initProfileExpandTriggers();

  // ==========================================================================
  // 5. DOCUMENT DROP AI EXTRACTION PIPELINE (PHASE 2 PARSER)
  // ==========================================================================
  const pdfDropZone = document.getElementById('public-pdf-drop-zone');
  const pdfInput = document.getElementById('public-pdf-input');
  const pdfBrowseLink = document.getElementById('public-pdf-browse');
  const pdfShimmer = document.getElementById('public-pdf-shimmer');
  const shimmerStatusText = document.getElementById('public-shimmer-status-text');

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
    shimmerStatusText.textContent = `Initializing MoSPI AI Document Extraction Engine for "${file.name}"...`;

    setTimeout(() => {
      shimmerStatusText.textContent = `Parsing PDF structure & service credentials...`;
    }, 600);

    setTimeout(() => {
      shimmerStatusText.textContent = `Auto-populating Cadre, Division & Baseline Skills...`;
    }, 1200);

    setTimeout(() => {
      pdfShimmer.style.display = 'none';

      currentOfficerProfile.cadre = "Subordinate Statistical Service (SSS Cadre)";
      currentOfficerProfile.division = "NSSO Field Operations Division (FOD), Regional Office";
      currentOfficerProfile.skills = "Survey Sampling Theory, CAPI Tablet Operations, Python Computing, DPDP Compliance";

      try {
        localStorage.setItem('nirdesha_officer_profile', JSON.stringify(currentOfficerProfile));
        localStorage.setItem('nirdesha_public_profile', JSON.stringify(currentOfficerProfile));
      } catch (e) {
        console.warn('Could not persist extracted profile:', e);
      }

      renderPublicOfficerDossier(currentOfficerProfile);
      populateEditForm(currentOfficerProfile);

      if (profileToast) {
        profileToast.textContent = `✓ AI Extracted Profile Data from "${file.name}" — Service Dossier Updated!`;
        profileToast.style.display = 'block';
        setTimeout(() => { profileToast.style.display = 'none'; }, 4000);
      }
    }, 1800);
  }

  // ==========================================================================
  // 6. INTERACTIVE AI STUDY MENTOR CHAT & MULTILINGUAL ENGINE
  // ==========================================================================
  const traineeChatLog = document.getElementById('trainee-chat-log');
  const traineeChatInput = document.getElementById('trainee-chat-input');
  const traineeChatSend = document.getElementById('trainee-chat-send');
  const btnClearMentorChat = document.getElementById('btn-clear-mentor-chat');
  const mentorLangSelect = document.getElementById('mentor-lang-select');

  let currentMentorLang = 'English';

  const MENTOR_DEFAULT_GREETINGS = {
    'English': "Namaste Officer Raman! I am your <strong>Nirdesha AI Study Mentor</strong>. I specialize exclusively in statistical theory, MoSPI syllabus, formulas, and closing your 17% promotional gap in Macro Deflators. What would you like to study?",
    'Hindi': "नमस्ते अधिकारी रमन! मैं आपका <strong>निर्देशा एआई स्टडी मेंटर</strong> हूँ। मैं विशेष रूप से सांख्यिकी सिद्धांतों, MoSPI पाठ्यक्रम, सूत्रों और मैक्रो डिफ्लेटर में आपके 17% अंतर को पूरा करने में सहायता करता हूँ। आज क्या पढ़ना चाहेंगे?",
    'Odia': "ନମସ୍କାର ଅଧିକାରୀ ରମଣ! ମୁଁ ଆପଣଙ୍କର <strong>ନିର୍ଦ୍ଦେଶା ଏଆଇ ଷ୍ଟଡି ମେଣ୍ଟର</strong>। ମୁଁ ପରିସଂଖ୍ୟାନ ତତ୍ତ୍ୱ, MoSPI ପାଠ୍ୟକ୍ରମ, ସୂତ୍ର ଏବଂ ମ୍ୟାକ୍ରୋ ଡିଫ୍ଲେଟରରେ ଥିବା ୧୭% ପଦୋନ୍ନତି ବ୍ୟବଧାନ ପୂରଣ କରିବାରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିବି। ଆଜି ଆପଣ କ’ଣ ପଢ଼ିବାକୁ ଚାହାଁନ୍ତି?",
    'Bengali': "নমস্কার অফিসার রমন! আমি আপনার <strong>নির্দেশা এআই স্টাডি মেন্টর</strong>। আমি পরিসংখ্যান তত্ত্ব, MoSPI পাঠ্যক্রম এবং আপনার ম্যাক্রো ডিফ্লেটরের ১৭% ঘাটতি পূরণে সাহায্য করব। আজ কি পড়তে চান?",
    'Marathi': "नमस्ते अधिकारी रमण! मी तुमचा <strong>निर्देशा एआय स्टडी मेंटॉर</strong> आहे. सांख्यिकी सिद्धांत, MoSPI अभ्यासक्रम आणि मॅक्रो डिफ्लेटरमधील तुमची १७% तूट भरून काढण्यात मी मदत करतो. आज काय अभ्यास करायचा आहे?",
    'Gujarati': "નમસ્તે અધિકારી રમણ! હું તમારો <strong>નિર્દેશા એઆઈ સ્ટડી મેન્ટર</strong> છું. આંકડાશાસ્ત્ર, MoSPI અભ્યાસક્રમ અને મેક્રો ડિફ્લેટર્સમાં તમારી ૧૭% ગેપ ઘટાડવામાં મદદ કરીશ. આજે શું શીખવું છે?",
    'Tamil': "வணக்கம் அதிகாரி ராமன்! நான் உங்கள் <strong>நிர்தேஷா AI படிப்பு வழிகாட்டி</strong>. புள்ளியியல் கோட்பாடுகள், MoSPI பாடத்திட்டம் மற்றும் மேக்ரோ குறைப்பான்களில் உங்கள் 17% இடைவெளியை நிரப்ப உதவ தயாராக உள்ளேன்.",
    'Telugu': "నమస్కారం అధికாரி రామన్! నేను మీ <strong>నిర్దేశ AI స్టడీ మెంటార్</strong>ని. గణాంక సిద్ధాಂತాలు, MoSPI సిలబస్ మరియు స్థూల ద్రవ్యోల్బణ లోటును తగ్గించడంలో మీకు సహాయం చేస్తాను.",
    'Kannada': "ನಮಸ್ಕಾರ ಅಧಿಕಾರಿ ರಾಮನ್! ನಾನು ನಿಮ್ಮ <strong>ನಿರ್ದೇಶಾ AI ಅಧ್ಯಯನ ಮಾರ್ಗದರ್ಶಿ</strong>. ಸಂಖ್ಯಾಶಾಸ್ತ್ರ ಸಿದ್ಧಾಂತಗಳು ಮತ್ತು MoSPI ಪರೀಕ್ಷಾ ಸಿದ್ಧತೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
    'Malayalam': "നമസ്കാരം ഓഫീസർ രാമൻ! ഞാൻ നിങ്ങളുടെ <strong>നിർദ്ദേശ AI സ്റ്റഡി മെന്റർ</strong> ആണ്. സ്റ്റാറ്റിസ്റ്റിക്കൽ സിദ്ധാന്തങ്ങളിലും പരീക്ഷാ തയ്യാറെടുപ്പിലും ഞാൻ സഹായിക്കാം.",
    'Punjabi': "ਨਮਸਤੇ ਅਧਿਕਾਰੀ ਰਮਨ! ਮੈਂ ਤੁਹਾਡਾ <strong>ਨਿਰਦੇਸ਼ਾ AI ਸਟੱਡੀ ਮੈਂਟਰ</strong> ਹਾਂ। ਮੈਂ ਅੰਕੜਾ ਸਿਧਾਂਤਾਂ ਅਤੇ MoSPI ਸਿਲੇਬਸ ਦੀ ਤਿਆਰੀ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ।"
  };

  const MENTOR_INPUT_PLACEHOLDERS = {
    'English': "Ask a study question (e.g., Explain Horvitz-Thompson formula or CPI deflator)...",
    'Hindi': "हिंदी में अध्ययन का प्रश्न पूछें (उदा. हॉरविट्ज़-थॉम्पसन सूत्र समझाइए)...",
    'Odia': "ଓଡ଼ିଆରେ ଅଧ୍ୟୟନ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ (ଯଥା: ହର୍ଭିଟ୍ଜ୍-ଥମ୍ପସନ୍ ସୂତ୍ର ବୁଝାନ୍ତୁ)...",
    'Bengali': "বাংলায় পড়াশোনার প্রশ্ন জিজ্ঞাসা করুন...",
    'Marathi': "मराठीत अभ्यासाचा प्रश्न विचारा...",
    'Gujarati': "ગુજરાતીમાં અભ્યાસનો પ્રશ્ન પૂછો...",
    'Tamil': "தமிழில் படிப்பு கேள்விகளைக் கேளுங்கள்...",
    'Telugu': "తెలుగులో అధ్యయన ప్రశ్నలను అడగండి...",
    'Kannada': "ಕನ್ನಡದಲ್ಲಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ...",
    'Malayalam': "മലയാളത്തിൽ ചോദ്യങ്ങൾ ചോദിക്കുക...",
    'Punjabi': "ਪੰਜਾਬੀ ਵਿੱਚ ਸਵਾਲ ਪੁੱਛੋ..."
  };

  function appendResponseActions(bubble, query = '') {
    if (!bubble || bubble.querySelector('.ai-msg-actions')) return;
    if (query) bubble.setAttribute('data-query', query);

    const actionRow = document.createElement('div');
    actionRow.className = 'ai-msg-actions';
    actionRow.innerHTML = `
      <button type="button" class="btn-ai-action btn-copy-response" title="Copy response" aria-label="Copy response">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
      <button type="button" class="btn-ai-action btn-save-notes" title="Save in Notes" aria-label="Save in Notes">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
      </button>
    `;
    bubble.appendChild(actionRow);
  }

  function sendTraineeChatMessage(text, sender = 'bot', query = '') {
    if (!traineeChatLog) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = (sender === "bot" && window.NirdeshaFormatter) ? window.NirdeshaFormatter.format(text) : text.replace(/\n/g, "<br>");
    if (sender === 'bot') {
      appendResponseActions(bubble, query);
    }
    traineeChatLog.appendChild(bubble);
    traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
    return bubble;
  }

  // Language selector listener for AI Study Mentor
  if (mentorLangSelect) {
    mentorLangSelect.addEventListener('change', () => {
      currentMentorLang = mentorLangSelect.value;
      const placeholder = MENTOR_INPUT_PLACEHOLDERS[currentMentorLang] || MENTOR_INPUT_PLACEHOLDERS['English'];
      const greeting = MENTOR_DEFAULT_GREETINGS[currentMentorLang] || MENTOR_DEFAULT_GREETINGS['English'];

      if (traineeChatInput) {
        traineeChatInput.placeholder = placeholder;
      }

      if (traineeChatLog) {
        const langNotice = document.createElement('div');
        langNotice.className = 'chat-bubble bot';
        langNotice.innerHTML = `<strong>Language set to ${currentMentorLang}</strong><br>${greeting}`;
        traineeChatLog.appendChild(langNotice);
        traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
      }
    });
  }

  // Clear chat listener for AI Study Mentor
  if (btnClearMentorChat) {
    btnClearMentorChat.addEventListener('click', () => {
      if (traineeChatLog) {
        traineeChatLog.innerHTML = '';
        sessionStorage.removeItem('nirdesha_mentor_chat_log');
        const greeting = MENTOR_DEFAULT_GREETINGS[currentMentorLang] || MENTOR_DEFAULT_GREETINGS['English'];
        sendTraineeChatMessage(greeting, 'bot');
      }
    });
  }

  // Save entire conversation to active notebook
  const btnSaveChatNotes = document.getElementById('btn-save-chat-notes');
  if (btnSaveChatNotes) {
    btnSaveChatNotes.addEventListener('click', (e) => {
      e.preventDefault();
      if (!traineeChatLog) return;

      const bubbles = Array.from(traineeChatLog.querySelectorAll('.chat-bubble'));
      const qaPairs = [];
      let currentQuestion = null;

      bubbles.forEach(bubble => {
        if (bubble.classList.contains('user')) {
          const qText = bubble.textContent.trim();
          if (qText) {
            currentQuestion = qText;
          }
        } else if (bubble.classList.contains('bot') && currentQuestion) {
          // Clone and clean bot bubble
          const clone = bubble.cloneNode(true);
          const actions = clone.querySelector('.ai-msg-actions');
          if (actions) actions.remove();
          
          const ansHtml = clone.innerHTML.trim();
          const ansText = clone.textContent.trim();
          
          if (ansHtml && !ansHtml.includes('Thinking...')) {
            qaPairs.push({
              q: currentQuestion,
              aHtml: ansHtml,
              aText: ansText
            });
            currentQuestion = null; // Paired
          }
        }
      });

      if (qaPairs.length === 0) {
        // Flash tooltip warning if no actual conversation exists
        const origTooltip = btnSaveChatNotes.getAttribute('data-tooltip') || 'Save Chat to Notes';
        btnSaveChatNotes.setAttribute('data-tooltip', 'No conversation to save yet!');
        setTimeout(() => {
          btnSaveChatNotes.setAttribute('data-tooltip', origTooltip);
        }, 2200);
        return;
      }

      // Build structured session note
      const firstQ = qaPairs[0].q;
      const cleanFirstQ = firstQ.length > 40 ? firstQ.substring(0, 40) + '...' : firstQ;
      const noteTitle = `AI Mentor Session: ${cleanFirstQ} (${qaPairs.length} ${qaPairs.length === 1 ? 'Q&A' : 'Q&As'})`;

      let sessionItemsHtml = '';
      qaPairs.forEach((pair, idx) => {
        sessionItemsHtml += `
          <div class="session-qa-item">
            <div class="session-q-box"><strong>Q${idx + 1}:</strong> ${pair.q.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <div class="session-a-box">${pair.aHtml}</div>
          </div>
        `;
      });

      const fullHtml = `
        <div class="saved-chat-session">
          <div class="session-meta-banner">
            <span class="session-tag">AI Mentor Cadre Session</span>
            <span class="session-date">${new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
          <div class="session-qa-list">
            ${sessionItemsHtml}
          </div>
        </div>
      `;

      const fullText = qaPairs.map((p, idx) => `Q${idx + 1}: ${p.q}\n\nA: ${p.aText}`).join('\n\n----------------\n\n');

      if (window.NirdeshaNotes && typeof window.NirdeshaNotes.saveSnippet === 'function') {
        window.NirdeshaNotes.saveSnippet({
          title: noteTitle,
          html: fullHtml,
          text: fullText,
          source: 'AI Study Mentor (Full Session)'
        });

        // Flash checkmark and success state
        btnSaveChatNotes.classList.add('saved-success');
        const origTooltip = btnSaveChatNotes.getAttribute('data-tooltip') || 'Save Chat to Notes';
        btnSaveChatNotes.setAttribute('data-tooltip', 'Saved Conversation to Notes!');
        
        const origSvg = btnSaveChatNotes.innerHTML;
        btnSaveChatNotes.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

        setTimeout(() => {
          btnSaveChatNotes.classList.remove('saved-success');
          btnSaveChatNotes.setAttribute('data-tooltip', origTooltip);
          btnSaveChatNotes.innerHTML = origSvg;
        }, 2500);
      }
    });
  }

  // Restore persistent chat history if page was refreshed
  try {
    const savedChat = sessionStorage.getItem('nirdesha_mentor_chat_log');
    if (savedChat && traineeChatLog) {
      traineeChatLog.innerHTML = savedChat;
    }
  } catch (e) {}

  function persistTraineeChatLog() {
    try {
      if (traineeChatLog) {
        sessionStorage.setItem('nirdesha_mentor_chat_log', traineeChatLog.innerHTML);
      }
    } catch (e) {}
  }

  let isMentorStreaming = false;

  // Send message with real-time streaming
  async function handleTraineeChat(query) {
    if (!query || !query.trim() || isMentorStreaming) return;

    // Check if query is asking to create a custom quiz
    const isQuizIntent = query === 'CMD_CREATE_CUSTOM_QUIZ' || /(create|make|build|generate|setup|start)\s*(a\s*)?(custom\s*)?quiz/i.test(query.trim());
    if (isQuizIntent) {
      if (query !== 'CMD_CREATE_CUSTOM_QUIZ') {
        sendTraineeChatMessage(query, 'user');
        if (traineeChatInput) traineeChatInput.value = '';
        persistTraineeChatLog();
      }

      // Check if user provided parameters directly in the prompt
      const text = query.toLowerCase();
      let detectedCount = 5;
      const countMatch = text.match(/(\d+)\s*(questions?|qs?)/);
      if (countMatch) detectedCount = parseInt(countMatch[1], 10);

      let detectedDiff = 'Hard (SSO Standard)';
      if (text.includes('easy')) detectedDiff = 'Easy';
      else if (text.includes('medium') || text.includes('moderate')) detectedDiff = 'Medium';

      let detectedTopic = '';
      if (text.includes('sampling') || text.includes('horvitz') || text.includes('ssrw')) {
        detectedTopic = 'Survey Sampling Theory & Estimation';
      } else if (text.includes('deflator') || text.includes('national accounts') || text.includes('gdp')) {
        detectedTopic = 'National Accounts & Macroeconomic Deflators';
      } else if (text.includes('price') || text.includes('cpi') || text.includes('wpi') || text.includes('index')) {
        detectedTopic = 'Price Index Numbers (CPI / WPI Methodology)';
      } else if (text.includes('dpdp') || text.includes('privacy') || text.includes('anonymiz')) {
        detectedTopic = 'DPDP Act 2023 & Field Anonymization Protocols';
      } else if (text.includes('capi') || text.includes('tablet') || text.includes('fod')) {
        detectedTopic = 'CAPI Tablet Field Automation';
      }

      // If user typed specific detailed parameters, generate directly!
      if (detectedTopic || countMatch) {
        const finalTopic = detectedTopic || 'Survey Sampling & Estimation';
        const quizId = 'custom_quiz_' + Date.now();
        const newQuiz = generateCustomQuizObject(quizId, finalTopic, 'Exam Prep (SSO/JSO Cadre)', 'Multiple Choice (MCQ)', 'Balanced', detectedDiff, detectedCount, 'per_45');
        
        const allQuizzes = getCustomQuizzes();
        allQuizzes.unshift(newQuiz);
        saveCustomQuizzes(allQuizzes);

        const confirmBubble = document.createElement('div');
        confirmBubble.className = 'chat-bubble bot';
        const uniqueBtnId = 'btn-jump-to-quiz-' + quizId;
        confirmBubble.innerHTML = `
          <div style="border-left: 3px solid #ea580c; padding-left: 0.75rem;">
            <strong style="color: #002b49; font-size: 0.95rem; display: block; margin-bottom: 4px;">
              Custom Quiz Generated: "${escapeHtml(newQuiz.title)}"
            </strong>
            <p style="font-size: 0.82rem; color: #334155; margin: 0 0 0.75rem 0;">
              Generated with parameters: <strong>${newQuiz.questions.length} Questions</strong> • <strong>${detectedDiff}</strong> • <strong>${newQuiz.topic}</strong>.
              <br>Active in <strong>AI Quiz section</strong> with a <span class="quiz-new-badge" style="position: static; display: inline-block;">NEW</span> badge!
            </p>
            <button type="button" class="btn-confirm-milestone" id="${uniqueBtnId}" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;">
              ▶ Launch Quiz in AI Quiz Tab
            </button>
          </div>
        `;

        const jumpBtn = confirmBubble.querySelector('#' + uniqueBtnId);
        if (jumpBtn) {
          jumpBtn.addEventListener('click', () => {
            if (typeof switchTab === 'function') {
              switchTab('quiz');
              const pillAvailable = document.getElementById('pill-quiz-available');
              if (pillAvailable) pillAvailable.click();
              renderCustomQuizzesGrid();
            }
          });
        }

        traineeChatLog.appendChild(confirmBubble);
        traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
        persistTraineeChatLog();
        updateQuizBadges();
        if (typeof renderCustomQuizzesGrid === 'function') {
          renderCustomQuizzesGrid();
        }
        return;
      }

      // Otherwise render the interactive wizard
      if (typeof renderClaudeQuizWizardInChat === 'function') {
        renderClaudeQuizWizardInChat();
      }
      return;
    }
    isMentorStreaming = true;
    sendTraineeChatMessage(query, 'user');
    if (traineeChatInput) traineeChatInput.value = '';
    persistTraineeChatLog();

    const botBubble = document.createElement('div');
    botBubble.className = 'chat-bubble bot';
    botBubble.innerHTML = '<span style="color:#64748b; font-style:italic;">Thinking...</span>';
    traineeChatLog.appendChild(botBubble);
    traineeChatLog.scrollTop = traineeChatLog.scrollHeight;

    let accumulatedText = '';
    let hasReceivedFirstToken = false;

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'public',
          message: query,
          role: 'mentor',
          language: currentMentorLang,
          personalization: typeof getAiPersonalizationSettings === 'function' ? getAiPersonalizationSettings() : {}
        })
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        let isStreamDone = false;
        let lastRenderTime = 0;

        while (!isStreamDone) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop();

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === 'data: [DONE]') {
              isStreamDone = true;
              break;
            }
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                if (parsed.chunk) {
                  if (!hasReceivedFirstToken) {
                    botBubble.innerHTML = '';
                    hasReceivedFirstToken = true;
                  }
                  accumulatedText += parsed.chunk;
                  
                  // Throttled fast rendering during stream to prevent DOM freeze
                  const now = Date.now();
                  if (now - lastRenderTime > 80) {
                    lastRenderTime = now;
                    botBubble.innerHTML = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(accumulatedText) : accumulatedText.replace(/\n/g, '<br>');
                    traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
                  }
                }
              } catch (e) {}
            }
          }
        }

        // Finalize formatting on complete response
        if (accumulatedText.trim()) {
          botBubble.innerHTML = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(accumulatedText) : accumulatedText.replace(/\n/g, '<br>');
          appendResponseActions(botBubble, query);
          traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
          persistTraineeChatLog();
          if (typeof window.recordMentorTurn === 'function') {
            window.recordMentorTurn(query, botBubble.innerHTML, accumulatedText);
          }
          isMentorStreaming = false;
          return;
        }
      }
    } catch (err) {
      console.warn('AI Mentor server stream error:', err);
    } finally {
      isMentorStreaming = false;
    }

    if (!hasReceivedFirstToken) {
      botBubble.innerHTML = "I am ready to assist your statistical studies. What specific concept or formula would you like to review?";
      appendResponseActions(botBubble, query);
      traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
      if (typeof window.recordMentorTurn === 'function') {
        window.recordMentorTurn(query, botBubble.innerHTML, botBubble.textContent);
      }
    }
    persistTraineeChatLog();
  }

  if (traineeChatSend && traineeChatInput) {
    traineeChatSend.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTraineeChat(traineeChatInput.value);
    });
    traineeChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleTraineeChat(traineeChatInput.value);
      }
    });
  }

  // Quick Chips in AI Study Mentor
  document.querySelectorAll('.mentor-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const q = chip.getAttribute('data-query');
      if (q) handleTraineeChat(q);
    });
  });


  // 6. 2D SKILL RADAR PROGRESS ANIMATION (0 to Target over 1.8 seconds)
  function initRadarProgressAnimation() {
    const radarSection = document.getElementById('skill-radar-section');
    if (!radarSection) return;

    const fills = radarSection.querySelectorAll('.radar-bar-fill');
    const counters = radarSection.querySelectorAll('.radar-bar-num');

    function runAnimation() {
      // 1. Animate bar widths
      fills.forEach(fill => {
        const target = parseInt(fill.getAttribute('data-target') || '0', 10);
        fill.style.width = '0%';
        fill.style.transition = 'none';

        requestAnimationFrame(() => {
          fill.style.transition = 'width 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
          fill.style.width = target + '%';
        });
      });

      // 2. Animate counter numbers in sync with bar width
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target') || '0', 10);
        counter.textContent = '0%';
        let startTimestamp = null;
        const duration = 1800; // 1.8 seconds

        function step(timestamp) {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          // Ease-out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.floor(easeOut * target);
          counter.textContent = currentVal + '%';

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            counter.textContent = target + '%';
          }
        }
        requestAnimationFrame(step);
      });
    }

    // Trigger on intersection or immediately
    let hasAnimated = false;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            runAnimation();
          }
        });
      }, { threshold: 0.15 });
      observer.observe(radarSection);
    } else {
      runAnimation();
    }
  }

  initRadarProgressAnimation();


  // ==========================================================================
  // 7. REALISTIC 3D SCIENTIFIC TOPOLOGY ENGINE (PRECISION OPTICS & DEPTH FOG)
  // ==========================================================================
  const btnView2d = document.getElementById('btn-view-2d');
  const btnView3d = document.getElementById('btn-view-3d');
  const view2d = document.getElementById('skill-radar-2d-view');
  const view3d = document.getElementById('skill-constellation-view');
  const canvas = document.getElementById('constellation-canvas');
  const tooltip = document.getElementById('constellation-tooltip');

  // Competency Nodes in 3D Space (Calibrated Physical Coordinates & Subdued Colors)
  const CONSTELLATION_NODES = [
    {
      id: 'sampling',
      code: 'NSS-01',
      title: 'Multi-Stage Sampling & Survey Design',
      domain: 'Field Methodology',
      desc: 'Stratified sampling, cluster frames, variance formulation, and Horvitz-Thompson unbiased estimators.',
      score: '94%',
      status: 'Level 3 Proficient',
      statusCode: 'mastered',
      color: '#10b981', // Refined Emerald
      accent: '#34d399',
      x: -150, y: -60, z: 35,
      radius: 9,
      prereq: 'Core SSS Cadre Requirement: Met'
    },
    {
      id: 'datascience',
      code: 'DAT-02',
      title: 'Public Data Science & Python Analytics',
      domain: 'Computing & Analytics',
      desc: 'Pandas data pipelines, automated statistical imputation, anomaly detection, and validation scripts.',
      score: '90%',
      status: 'Level 3 Proficient',
      statusCode: 'mastered',
      color: '#10b981',
      accent: '#34d399',
      x: -85, y: 100, z: -45,
      radius: 9,
      prereq: 'Cadre Benchmark: Met'
    },
    {
      id: 'dpdp',
      code: 'LAW-03',
      title: 'DPDP Act 2023 & Field Data Governance',
      domain: 'Legal & Governance',
      desc: 'Microdata de-identification, CAPI tablet encryption protocols, and Section 8 consent logging.',
      score: '98%',
      status: 'Level 3 Proficient',
      statusCode: 'mastered',
      color: '#10b981',
      accent: '#34d399',
      x: -35, y: -120, z: -25,
      radius: 9,
      prereq: 'Statutory Compliance: Certified'
    },
    {
      id: 'accounts',
      code: 'NAS-04',
      title: 'National Accounts & SUT 2008 Matrix',
      domain: 'Macroeconomics',
      desc: 'Supply and Use Tables, GSDP aggregation, and intermediate input deflation methodology.',
      score: '68%',
      status: 'Developing Baseline (17% Gap)',
      statusCode: 'inprogress',
      color: '#f59e0b', // Warm Amber
      accent: '#fbbf24',
      x: 65, y: -45, z: 65,
      radius: 10,
      prereq: 'Promotion Prerequisite: NSSTA Module 204'
    },
    {
      id: 'deflators',
      code: 'PRC-05',
      title: 'Inflation Modeling & CPI vs GDP Deflator',
      domain: 'Price Statistics',
      desc: 'Paasche implicit deflators versus Laspeyres consumer expenditure fixed basket weighting.',
      score: '65%',
      status: 'Developing Baseline (20% Gap)',
      statusCode: 'inprogress',
      color: '#f59e0b',
      accent: '#fbbf24',
      x: 135, y: 35, z: 20,
      radius: 9,
      prereq: 'Assigned: NSSTA Module 205'
    },
    {
      id: 'plfs',
      code: 'LAB-06',
      title: 'PLFS Rotational Panel Operations',
      domain: 'Labour & Industry',
      desc: 'Quarterly rotational sampling frames and usual principal status (UPS) estimation algorithms.',
      score: 'Target Cadre',
      status: 'Cadre Benchmark (SSO)',
      statusCode: 'locked',
      color: '#0ea5e9', // Precision Cobalt
      accent: '#38bdf8',
      x: 200, y: -90, z: -75,
      radius: 8,
      prereq: 'SSO Cadre Elevation Required'
    },
    {
      id: 'asi',
      code: 'IND-07',
      title: 'Annual Survey of Industries (ASI)',
      domain: 'Industrial Statistics',
      desc: 'Gross value added (GVA) estimation in factory sectors and NIC classification audit.',
      score: 'Target Cadre',
      status: 'Cadre Benchmark (SSO)',
      statusCode: 'locked',
      color: '#0ea5e9',
      accent: '#38bdf8',
      x: 75, y: 140, z: -85,
      radius: 8,
      prereq: 'SSO Cadre Elevation Required'
    },
    {
      id: 'bigdata',
      code: 'DIR-08',
      title: 'Machine Learning for Big Data',
      domain: 'Directorate Specialization',
      desc: 'High-frequency GST data integration, web price indicators, and time-series econometric forecasting.',
      score: 'Senior Track',
      status: 'Senior Cadre (ISS)',
      statusCode: 'locked',
      color: '#a855f7', // Deep Amethyst
      accent: '#c084fc',
      x: 220, y: 110, z: 55,
      radius: 8,
      prereq: 'ISS Directorate Officer Track'
    }
  ];

  // Dependency Edges between Competency Standards
  const CONSTELLATION_EDGES = [
    { from: 'sampling', to: 'accounts' },
    { from: 'sampling', to: 'plfs' },
    { from: 'dpdp', to: 'sampling' },
    { from: 'dpdp', to: 'datascience' },
    { from: 'datascience', to: 'asi' },
    { from: 'datascience', to: 'bigdata' },
    { from: 'accounts', to: 'deflators' },
    { from: 'deflators', to: 'plfs' },
    { from: 'asi', to: 'bigdata' }
  ];

  // Fine ambient dust / micro-particles (Not cartoon stars)
  const AMBIENT_PARTICLES = [];
  for (let i = 0; i < 75; i++) {
    AMBIENT_PARTICLES.push({
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 600,
      z: (Math.random() - 0.5) * 600,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.35 + 0.1
    });
  }

  // Laser pulse signals traveling along edges
  const SIGNAL_PULSES = CONSTELLATION_EDGES.map(() => ({
    progress: Math.random(),
    speed: Math.random() * 0.005 + 0.003
  }));

  // Camera State
  let rotX = 0.22;
  let rotY = -0.38;
  let targetRotX = 0.22;
  let targetRotY = -0.38;
  let zoom = 1.0;
  let targetZoom = 1.0;
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let hoveredNode = null;
  let animFrameId = null;

  // 3D Perspective Projection Function
  function project3D(x, y, z, cx, cy, fov = 480) {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY + z * sinY;
    const y1 = y;
    const z1 = -x * sinY + z * cosY;

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;

    const cameraDist = 600 / zoom;
    const zEff = z2 + cameraDist;
    if (zEff <= 10) return null;

    const scale = fov / zEff;
    return {
      x: cx + x2 * scale,
      y: cy + y2 * scale,
      z: z2,
      scale: scale,
      depth: zEff,
      // Depth fog factor (0 = far away in fog, 1 = close to camera)
      fogFactor: Math.max(0.2, Math.min(1.0, 1.0 - (zEff - 350) / 600))
    };
  }

  function renderConstellation() {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Smooth camera inertia
    rotX += (targetRotX - rotX) * 0.1;
    rotY += (targetRotY - rotY) * 0.1;
    zoom += (targetZoom - zoom) * 0.1;

    if (!isDragging) {
      targetRotY += 0.0018; // Very subtle, realistic slow orbit
    }

    // Clear Canvas: Deep obsidian with high-end photographic vignette
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#050911';
    ctx.fillRect(0, 0, width, height);

    const vignette = ctx.createRadialGradient(cx, cy, 40, cx, cy, width * 0.68);
    vignette.addColorStop(0, '#0a1220');
    vignette.addColorStop(0.65, '#050a13');
    vignette.addColorStop(1, '#020408');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 1. Render Realistic 3D Perspective Ground Plane (Radar Telemetry Grid)
    ctx.save();
    const planeY = 80;
    const gridRange = 260;
    const gridSteps = 6;
    ctx.lineWidth = 0.75;

    // Concentric coordinate rings
    for (let r = 80; r <= gridRange; r += 70) {
      ctx.beginPath();
      let first = true;
      for (let angle = 0; angle <= Math.PI * 2; angle += Math.PI / 32) {
        const px = Math.cos(angle) * r;
        const pz = Math.sin(angle) * r;
        const pt = project3D(px, planeY, pz, cx, cy);
        if (pt) {
          if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
          else { ctx.lineTo(pt.x, pt.y); }
        }
      }
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.04 * (1 - r / (gridRange + 40))})`;
      ctx.stroke();
    }

    // Cross-axis coordinate lines
    const axes = [
      [[-gridRange, planeY, 0], [gridRange, planeY, 0]],
      [[0, planeY, -gridRange], [0, planeY, gridRange]]
    ];
    for (const [start, end] of axes) {
      const p1 = project3D(start[0], start[1], start[2], cx, cy);
      const p2 = project3D(end[0], end[1], end[2], cx, cy);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.stroke();
      }
    }
    ctx.restore();

    // 2. Render Ambient Micro-Particles (Defocused depth drift)
    for (const p of AMBIENT_PARTICLES) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > 400) p.x = -400;
      if (p.x < -400) p.x = 400;
      if (p.y > 300) p.y = -300;
      if (p.y < -300) p.y = 300;

      const pt = project3D(p.x, p.y, p.z, cx, cy);
      if (pt) {
        ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha * pt.fogFactor * 0.4})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.6 * pt.scale, 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Project Nodes
    const projectedNodes = {};
    for (const node of CONSTELLATION_NODES) {
      projectedNodes[node.id] = project3D(node.x, node.y, node.z, cx, cy);
    }

    // 4. Render Hairline Laser Telemetry Filaments with Tapered Laser Pulse
    CONSTELLATION_EDGES.forEach((edge, idx) => {
      const pA = projectedNodes[edge.from];
      const pB = projectedNodes[edge.to];
      if (pA && pB) {
        const nodeA = CONSTELLATION_NODES.find(n => n.id === edge.from);
        const nodeB = CONSTELLATION_NODES.find(n => n.id === edge.to);
        const isHighlighted = (hoveredNode && (hoveredNode.id === edge.from || hoveredNode.id === edge.to));
        const edgeFog = Math.min(pA.fogFactor, pB.fogFactor);

        // Precision hairline edge
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);

        if (isHighlighted) {
          ctx.strokeStyle = nodeA.accent;
          ctx.lineWidth = 1.6;
          ctx.shadowColor = nodeA.accent;
          ctx.shadowBlur = 8;
          ctx.stroke();
        } else {
          ctx.strokeStyle = `rgba(71, 85, 105, ${0.45 * edgeFog})`;
          ctx.lineWidth = Math.max(0.85 * Math.min(pA.scale, pB.scale), 0.6);
          ctx.stroke();
        }
        ctx.restore();

        // Tapered Laser Signal Pulse
        const pulse = SIGNAL_PULSES[idx];
        if (pulse) {
          pulse.progress = (pulse.progress + pulse.speed) % 1.0;
          const headX = pA.x + (pB.x - pA.x) * pulse.progress;
          const headY = pA.y + (pB.y - pA.y) * pulse.progress;
          const tailProgress = Math.max(0, pulse.progress - 0.12);
          const tailX = pA.x + (pB.x - pA.x) * tailProgress;
          const tailY = pA.y + (pB.y - pA.y) * tailProgress;

          const pulseGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
          pulseGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          pulseGrad.addColorStop(1, isHighlighted ? '#ffffff' : 'rgba(56, 189, 248, 0.85)');

          ctx.save();
          ctx.strokeStyle = pulseGrad;
          ctx.lineWidth = isHighlighted ? 2.2 : 1.2;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.stroke();
          ctx.restore();
        }
      }
    });

    // 5. Depth Sorting (Painter's Algorithm)
    const sortedNodes = [...CONSTELLATION_NODES]
      .map(node => ({ node, proj: projectedNodes[node.id] }))
      .filter(item => item.proj !== null)
      .sort((a, b) => b.proj.depth - a.proj.depth);

    // 6. Draw Realistic Optical Competency Sensor Nodes (PBR-Style Micro-Sensors)
    for (const { node, proj } of sortedNodes) {
      const isHovered = (hoveredNode && hoveredNode.id === node.id);
      const r = node.radius * proj.scale * (isHovered ? 1.2 : 1.0);
      const fog = proj.fogFactor;

      ctx.save();

      // Optical Bloom Halo (Tight exponential falloff, not cartoon smudge)
      const bloom = ctx.createRadialGradient(proj.x, proj.y, r * 0.4, proj.x, proj.y, r * 2.2);
      bloom.addColorStop(0, `${node.color}${Math.round(fog * 90).toString(16).padStart(2, '0')}`);
      bloom.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Metallic Outer Precision Ring Bezel
      ctx.strokeStyle = isHovered ? '#ffffff' : node.color;
      ctx.lineWidth = isHovered ? 1.8 : 1.2;
      ctx.globalAlpha = fog;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, r + 2.5, 0, Math.PI * 2);
      ctx.stroke();

      // Graphite/Obsidian Optical Core (Subtle 3D Curvature)
      const coreGrad = ctx.createRadialGradient(
        proj.x - r * 0.3, proj.y - r * 0.3, r * 0.1,
        proj.x, proj.y, r
      );
      coreGrad.addColorStop(0, '#1e293b');
      coreGrad.addColorStop(0.7, '#0f172a');
      coreGrad.addColorStop(1, '#020617');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Precision Sensor Center (Luminous LED Core)
      ctx.fillStyle = node.accent;
      ctx.shadowColor = node.color;
      ctx.shadowBlur = isHovered ? 12 : 5;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, Math.max(r * 0.38, 2.0), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // If hovered, render precision HUD brackets / reticle
      if (isHovered) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 1.0;
        const bSize = r + 8;
        const bLen = 4;

        // 4 corner brackets
        ctx.beginPath();
        // Top-left
        ctx.moveTo(proj.x - bSize, proj.y - bSize + bLen);
        ctx.lineTo(proj.x - bSize, proj.y - bSize);
        ctx.lineTo(proj.x - bSize + bLen, proj.y - bSize);
        // Top-right
        ctx.moveTo(proj.x + bSize - bLen, proj.y - bSize);
        ctx.lineTo(proj.x + bSize, proj.y - bSize);
        ctx.lineTo(proj.x + bSize, proj.y - bSize + bLen);
        // Bottom-left
        ctx.moveTo(proj.x - bSize, proj.y + bSize - bLen);
        ctx.lineTo(proj.x - bSize, proj.y + bSize);
        ctx.lineTo(proj.x - bSize + bLen, proj.y + bSize);
        // Bottom-right
        ctx.moveTo(proj.x + bSize - bLen, proj.y + bSize);
        ctx.lineTo(proj.x + bSize, proj.y + bSize);
        ctx.lineTo(proj.x + bSize, proj.y + bSize - bLen);
        ctx.stroke();
        ctx.restore();
      }

      // High-Precision Technical Typography Label
      ctx.save();
      ctx.globalAlpha = isHovered ? 1.0 : Math.max(fog * 0.9, 0.4);
      ctx.fillStyle = isHovered ? '#ffffff' : '#cbd5e1';
      ctx.font = `${isHovered ? '700 ' : '600 '}${Math.max(Math.round(10.5 * proj.scale), 9)}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'center';

      // Clean single line label
      const words = node.title.split(' ');
      const conciseLabel = words.length > 3 ? `${words[0]} ${words[1]}` : node.title;
      ctx.fillText(conciseLabel, proj.x, proj.y + r + 15);

      // Micro code prefix
      ctx.fillStyle = '#64748b';
      ctx.font = `700 ${Math.max(Math.round(8.5 * proj.scale), 7.5)}px monospace`;
      ctx.fillText(node.code, proj.x, proj.y - r - 7);
      ctx.restore();
    }

    animFrameId = requestAnimationFrame(renderConstellation);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  // Orbit Drag Controls
  if (canvas) {
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.006;
        targetRotX += deltaY * 0.006;
        targetRotX = Math.max(-1.35, Math.min(1.35, targetRotX));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }

      // Hit-Detection on 3D Projected Nodes
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      let found = null;

      for (const node of CONSTELLATION_NODES) {
        const p = project3D(node.x, node.y, node.z, cx, cy);
        if (p) {
          const dist = Math.hypot(mouseX - p.x, mouseY - p.y);
          if (dist <= (node.radius * p.scale) + 8) {
            found = { node, proj: p };
            break;
          }
        }
      }

      hoveredNode = found ? found.node : null;

      // Update Tooltip Card
      if (found && tooltip) {
        tooltip.style.display = 'block';
        tooltip.style.left = `${found.proj.x}px`;
        tooltip.style.top = `${found.proj.y}px`;

        const titleEl = document.getElementById('tooltip-title');
        const domainEl = document.getElementById('tooltip-domain');
        const descEl = document.getElementById('tooltip-desc');
        const scoreEl = document.getElementById('tooltip-score');
        const statusEl = document.getElementById('tooltip-status');
        const prereqEl = document.getElementById('tooltip-prereq');

        if (titleEl) titleEl.textContent = `${found.node.code} • ${found.node.title}`;
        if (domainEl) domainEl.textContent = found.node.domain;
        if (descEl) descEl.textContent = found.node.desc;
        if (scoreEl) scoreEl.textContent = found.node.score;
        if (prereqEl) prereqEl.textContent = found.node.prereq;

        if (statusEl) {
          statusEl.textContent = found.node.status;
          statusEl.className = `tooltip-status-badge ${found.node.statusCode}`;
        }
      } else if (tooltip) {
        tooltip.style.display = 'none';
      }
    });

    // Zoom on Mouse Wheel
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      targetZoom += e.deltaY * -0.0015;
      targetZoom = Math.max(0.7, Math.min(1.9, targetZoom));
    }, { passive: false });
  }

  // View Switcher (2D <-> 3D strictly)
  if (btnView2d && btnView3d && view2d && view3d) {
    btnView2d.addEventListener('click', () => {
      btnView2d.classList.add('active');
      btnView3d.classList.remove('active');
      view2d.style.display = 'grid';
      view3d.style.display = 'none';
      if (tooltip) tooltip.style.display = 'none';
      if (animFrameId) cancelAnimationFrame(animFrameId);
    });

    btnView3d.addEventListener('click', () => {
      btnView3d.classList.add('active');
      btnView2d.classList.remove('active');
      view2d.style.display = 'none';
      view3d.style.display = 'block';

      resizeCanvas();
      if (!animFrameId) {
        renderConstellation();
      }
    });

    window.addEventListener('resize', () => {
      if (view3d.style.display !== 'none') {
        resizeCanvas();
      }
    });
  }

  // ==========================================================================
  // 8. CIRCULAR STREAK GRAPH ANIMATION (0 to 14 DAYS OVER 1.8s)
  // ==========================================================================
    function initCircularStreakAnimation() {
    const ring = document.getElementById('streak-progress-ring');
    const counter = document.getElementById('streak-animated-counter');

    if (!ring || !counter) return;

    const targetDays = 14;
    const targetPercentage = 0.70; // 14 / 20 days milestone target = 70%
    const circumference = 238.76;  // 2 * PI * 38
    const targetOffset = circumference * (1 - targetPercentage);

    function runAnimation() {
      // Reset transition and position
      ring.style.transition = 'none';
      ring.style.strokeDasharray = `${circumference}`;
      ring.style.strokeDashoffset = `${circumference}`;
      counter.textContent = '0';

      // Force synchronous layout reflow so browser registers the starting point
      void ring.getBoundingClientRect();

      // Trigger smooth transition
      requestAnimationFrame(() => {
        ring.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)';
        ring.style.strokeDashoffset = `${targetOffset}`;
      });

      // Animate numeric counter from 0 to targetDays
      let startTimestamp = null;
      const duration = 1800; // 1.8 seconds

      function step(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentDays = Math.floor(easeOut * targetDays);
        counter.textContent = currentDays;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = targetDays;
        }
      }
      requestAnimationFrame(step);
    }

    runAnimation();
  }

  // Trigger on load
  initCircularStreakAnimation();
  window.addEventListener('load', initCircularStreakAnimation);


  // ==========================================================================
  // 9. TRANSLUCENT 3D DATE WHEEL PICKER & MILESTONE HISTORY ENGINE (MAX 365 DAYS)
  // ==========================================================================
  const modal = document.getElementById('milestone-modal');
  const btnOpenMilestone = document.getElementById('btn-open-milestone');
  const btnCloseMilestone = document.getElementById('btn-close-milestone');
  const btnCancelMilestone = document.getElementById('btn-cancel-milestone');
  const btnConfirmMilestone = document.getElementById('btn-confirm-milestone');
  const btnToggleHistory = document.getElementById('btn-toggle-milestone-history');
  const btnBackToPicker = document.getElementById('btn-back-to-picker');
  const btnHistoryClose = document.getElementById('btn-history-close');
  const sliderTrack = document.getElementById('milestone-slider-track');
  const historyToggleLabel = document.getElementById('history-toggle-label');

  const cylinderDays = document.getElementById('cylinder-days');
  const cylinderMonths = document.getElementById('cylinder-months');
  const cylinderYears = document.getElementById('cylinder-years');
  const wheelDays = document.getElementById('wheel-days');
  const wheelMonths = document.getElementById('wheel-months');
  const wheelYears = document.getElementById('wheel-years');

  const summaryTargetDate = document.getElementById('summary-target-date');
  const summaryDaysCount = document.getElementById('summary-days-count');
  const summaryStreakDiff = document.getElementById('summary-streak-diff');
  const streakMilestoneDesc = document.getElementById('streak-milestone-desc');
  const historyActivePeriod = document.getElementById('history-active-period');
  const historyActivePct = document.getElementById('history-active-pct');
  const historyActiveBar = document.getElementById('history-active-bar');

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const TODAY = new Date(2026, 8, 2); // 2 September 2026
  let selectedDay = 22;
  let selectedMonth = 8; // September
  let selectedYear = 2026;
  const ITEM_HEIGHT = 40;

  // Build 3D Wheel Elements (Restricted to 2026-2027 to enforce 1-year / 365-day boundary)
  function buildWheels() {
    if (!cylinderDays || !cylinderMonths || !cylinderYears) return;

    // 1. Days 1 to 31
    cylinderDays.innerHTML = '';
    for (let d = 1; d <= 31; d++) {
      const item = document.createElement('div');
      item.className = `wheel-item ${d === selectedDay ? 'selected' : ''}`;
      item.textContent = d < 10 ? `0${d}` : `${d}`;
      item.dataset.value = d;
      item.addEventListener('click', () => {
        scrollWheelTo(wheelDays, d - 1);
        selectedDay = d;
        updateCalculation();
      });
      cylinderDays.appendChild(item);
    }

    // 2. Months January to December
    cylinderMonths.innerHTML = '';
    MONTH_NAMES.forEach((mName, idx) => {
      const item = document.createElement('div');
      item.className = `wheel-item ${idx === selectedMonth ? 'selected' : ''}`;
      item.textContent = mName;
      item.dataset.value = idx;
      item.addEventListener('click', () => {
        scrollWheelTo(wheelMonths, idx);
        selectedMonth = idx;
        updateCalculation();
      });
      cylinderMonths.appendChild(item);
    });

    // 3. Years strictly 2026 to 2027 (Max 365 days from 2 Sep 2026 is 2 Sep 2027)
    cylinderYears.innerHTML = '';
    for (let y = 2026; y <= 2027; y++) {
      const item = document.createElement('div');
      item.className = `wheel-item ${y === selectedYear ? 'selected' : ''}`;
      item.textContent = y;
      item.dataset.value = y;
      item.addEventListener('click', () => {
        scrollWheelTo(wheelYears, y - 2026);
        selectedYear = y;
        updateCalculation();
      });
      cylinderYears.appendChild(item);
    }

    setTimeout(() => {
      scrollWheelTo(wheelDays, selectedDay - 1);
      scrollWheelTo(wheelMonths, selectedMonth);
      scrollWheelTo(wheelYears, selectedYear - 2026);
      updateCalculation();
    }, 40);
  }

  function scrollWheelTo(container, index) {
    if (!container) return;
    container.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: 'smooth'
    });
  }

  // Enhanced Drag & Scroll Handler
  function setupInteractiveWheel(container, callback) {
    if (!container) return;

    let isDown = false;
    let startY = 0;
    let scrollTop = 0;
    let scrollTimeout = null;

    container.addEventListener('mousedown', (e) => {
      isDown = true;
      startY = e.pageY - container.offsetTop;
      scrollTop = container.scrollTop;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        const nearestIndex = Math.round(container.scrollTop / ITEM_HEIGHT);
        scrollWheelTo(container, nearestIndex);
        callback(nearestIndex);
      }
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const y = e.pageY - container.offsetTop;
      const walk = (y - startY) * 1.2;
      container.scrollTop = scrollTop - walk;
    });

    container.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const index = Math.round(container.scrollTop / ITEM_HEIGHT);
        callback(index);
      }, 80);
    });
  }

  // Calculation with STRICT 365-day cap
  function updateCalculation() {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    if (selectedDay > daysInMonth) {
      selectedDay = daysInMonth;
      scrollWheelTo(wheelDays, selectedDay - 1);
    }

    // Visual selection highlighting
    if (cylinderDays) {
      Array.from(cylinderDays.children).forEach((child, i) => {
        child.classList.toggle('selected', (i + 1) === selectedDay);
      });
    }
    if (cylinderMonths) {
      Array.from(cylinderMonths.children).forEach((child, i) => {
        child.classList.toggle('selected', i === selectedMonth);
      });
    }
    if (cylinderYears) {
      Array.from(cylinderYears.children).forEach((child, i) => {
        child.classList.toggle('selected', (i + 2026) === selectedYear);
      });
    }

    // Days difference calculation
    const targetDate = new Date(selectedYear, selectedMonth, selectedDay);
    const diffTime = targetDate.getTime() - TODAY.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (summaryTargetDate) {
      summaryTargetDate.textContent = `${selectedDay} ${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    }

    // ENFORCE 365-DAY LIMIT
    if (diffDays > 365) {
      if (summaryDaysCount) {
        summaryDaysCount.textContent = `${diffDays} Days (Exceeds 365-Day Cap)`;
        summaryDaysCount.style.color = '#dc2626';
      }
      if (summaryStreakDiff) {
        summaryStreakDiff.textContent = 'Milestone cannot exceed 365 days (1 year maximum allowed).';
        summaryStreakDiff.style.color = '#dc2626';
      }
      if (btnConfirmMilestone) {
        btnConfirmMilestone.disabled = true;
        btnConfirmMilestone.style.opacity = '0.45';
        btnConfirmMilestone.style.cursor = 'not-allowed';
        btnConfirmMilestone.style.background = '#94a3b8';
        btnConfirmMilestone.style.borderColor = '#64748b';
        btnConfirmMilestone.title = 'Milestones cannot exceed 365 days (1 year)';
      }
    } else if (diffDays <= 0) {
      if (summaryDaysCount) {
        summaryDaysCount.textContent = 'Invalid Target Date';
        summaryDaysCount.style.color = '#dc2626';
      }
      if (summaryStreakDiff) {
        summaryStreakDiff.textContent = 'Target date must be at least 1 day in the future.';
        summaryStreakDiff.style.color = '#dc2626';
      }
      if (btnConfirmMilestone) {
        btnConfirmMilestone.disabled = true;
        btnConfirmMilestone.style.opacity = '0.45';
        btnConfirmMilestone.style.cursor = 'not-allowed';
        btnConfirmMilestone.style.background = '#94a3b8';
        btnConfirmMilestone.style.borderColor = '#64748b';
        btnConfirmMilestone.title = 'Select a future date';
      }
    } else {
      // Valid Range (1 to 365 Days)
      if (summaryDaysCount) {
        summaryDaysCount.textContent = `${diffDays} Days Target`;
        summaryDaysCount.style.color = '#ea580c';
      }
      if (summaryStreakDiff) {
        const currentStreak = 14;
        if (diffDays >= currentStreak) {
          summaryStreakDiff.textContent = `(+${diffDays - currentStreak} Days beyond current 14-day streak • Max 365 allowed)`;
          summaryStreakDiff.style.color = '#475569';
        } else {
          summaryStreakDiff.textContent = `(Target is ${diffDays} days • Max 365 allowed)`;
          summaryStreakDiff.style.color = '#d97706';
        }
      }
      if (btnConfirmMilestone) {
        btnConfirmMilestone.disabled = false;
        btnConfirmMilestone.style.opacity = '1';
        btnConfirmMilestone.style.cursor = 'pointer';
        btnConfirmMilestone.style.background = '#ea580c';
        btnConfirmMilestone.style.borderColor = '#c2410c';
        btnConfirmMilestone.title = '';
      }
    }
  }

  // Bind interactive wheels
  setupInteractiveWheel(wheelDays, (idx) => {
    selectedDay = idx + 1;
    updateCalculation();
  });

  setupInteractiveWheel(wheelMonths, (idx) => {
    selectedMonth = idx;
    updateCalculation();
  });

  setupInteractiveWheel(wheelYears, (idx) => {
    selectedYear = 2026 + idx;
    updateCalculation();
  });

  // Modal Open/Close Controls
  function openModal() {
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    buildWheels();
  }

  function closeModal(force) {
    if (!modal) return;
    if (!force) {
      const descInput = document.getElementById('streak-milestone-desc');
      if (descInput && descInput.value && descInput.value.trim().length > 0) {
        if (!confirm("You have unsaved milestone target notes. Discard changes and exit?")) {
          return;
        }
      }
    }
    modal.style.display = 'none';
    document.body.style.overflow = '';
    if (sliderTrack) {
      sliderTrack.classList.remove('show-history');
    }
    if (historyToggleLabel) {
      historyToggleLabel.textContent = 'Show History';
    }
  }


  // Bulletproof Milestone Modal Trigger (Direct + Delegated)
  function handleOpenMilestone(e) {
    if (e) e.preventDefault();
    openModal();
  }

  if (btnOpenMilestone) {
    btnOpenMilestone.addEventListener('click', handleOpenMilestone);
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('#btn-open-milestone, .streak-milestone-link');
    if (trigger) {
      e.preventDefault();
      openModal();
    }
  });


  if (btnCloseMilestone) btnCloseMilestone.addEventListener('click', closeModal);
  if (btnCancelMilestone) btnCancelMilestone.addEventListener('click', closeModal);
  if (btnHistoryClose) btnHistoryClose.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeModal();
    }
  });

  // Toggle Sliding Panes without arrows
  if (btnToggleHistory && sliderTrack) {
    btnToggleHistory.addEventListener('click', () => {
      const isHistory = sliderTrack.classList.toggle('show-history');
      if (historyToggleLabel) {
        historyToggleLabel.textContent = isHistory ? 'Date Picker' : 'Show History';
      }
    });
  }

  if (btnBackToPicker && sliderTrack) {
    btnBackToPicker.addEventListener('click', () => {
      sliderTrack.classList.remove('show-history');
      if (historyToggleLabel) {
        historyToggleLabel.textContent = 'Show History';
      }
    });
  }

  // Confirm Milestone Target (Guaranteed <= 365 Days)
  if (btnConfirmMilestone) {
    btnConfirmMilestone.addEventListener('click', () => {
      const targetDate = new Date(selectedYear, selectedMonth, selectedDay);
      const diffTime = targetDate.getTime() - TODAY.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 365 || diffDays <= 0) {
        alert("Milestone cannot exceed 365 days (1 year maximum allowed). Please select a valid date within 365 days.");
        return;
      }

      const currentStreak = 14;
      const pct = Math.min(100, Math.round((currentStreak / diffDays) * 100));

      if (streakMilestoneDesc) {
        streakMilestoneDesc.textContent = `${pct}% of ${diffDays}-Day Target Milestone`;
      }
      if (historyActivePeriod) {
        historyActivePeriod.textContent = `Target: ${selectedDay} ${MONTH_NAMES[selectedMonth]} ${selectedYear} • 14 of ${diffDays} Days`;
      }
      if (historyActivePct) {
        historyActivePct.textContent = `${pct}%`;
      }
      if (historyActiveBar) {
        historyActiveBar.style.width = `${pct}%`;
      }

      // Re-animate Radial Gauge Ring to new milestone ratio
      const ring = document.getElementById('streak-progress-ring');
      if (ring) {
        const circumference = 238.76;
        const targetOffset = circumference * (1 - pct / 100);
        ring.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        ring.style.strokeDashoffset = `${targetOffset}`;
      }

      closeModal();
    });
  }

  // ==========================================================================
  // 10. 2-SECOND HOVER "ASK AI" BUTTON ENGINE & AI STUDY MENTOR ROUTING
  // ==========================================================================
  const TERM_DEFINITIONS = {
    'senior-statistical-officer': {
      title: 'Senior Statistical Officer (SSO)',
      question: 'What is the role of a Senior Statistical Officer (SSO) in MoSPI and how is promotion eligibility determined?',
      answer: "A Senior Statistical Officer (SSO) is a Group 'B' Gazetted Cadre post under the Subordinate Statistical Service (SSS), Ministry of Statistics & Programme Implementation (MoSPI).\n\nKey Mandates & Operations:\n1. Field Operations Supervision: Direct oversight of NSS socio-economic rounds, Annual Survey of Industries (ASI), and Agricultural Census field teams.\n2. Data Quality & CAPI Audit: Validation of digital survey schedules on tablet devices, scrutinizing non-sampling errors and outlier weights.\n3. Cadre Promotion Criteria: Junior Statistical Officers (JSOs) qualify for SSO promotion after completing mandatory qualifying service years and attaining verified proficiency benchmarks across sampling theory, national accounts, and data governance."
    },
    'cadre-benchmark': {
      title: 'Cadre Benchmark',
      question: 'Can you explain what a Cadre Benchmark is in the Subordinate Statistical Service?',
      answer: "A Cadre Benchmark is an official competency threshold and qualification syllabus mandated by MoSPI and the National Statistical Systems Training Academy (NSSTA).\n\nPurpose:\n- Standardizes minimum technical proficiency across all service domains.\n- Ensures officers possess verified mastery in survey design, inflation deflators, and statutory protocols (such as DPDP Act 2023) before career advancement or overseas statistical postings."
    },
    'officer-annual-learning-consistency-heat-map': {
      title: 'Officer Annual Learning Consistency Heatmap',
      question: 'What is the purpose of the Officer Annual Learning Consistency Heatmap?',
      answer: "The Officer Annual Learning Consistency Heatmap is a 52-week (364-day) telemetry grid designed to track consistent, sustained learning throughout the operational year.\n\nMetrics Tracked:\n- Daily survey methodology exercises and timed micro-evaluations.\n- CAPI field verification task completions.\n- NSSTA and iGOT Karmayogi course progression.\nContinuous streaks demonstrate operational reliability and statistical acumen."
    },
    'competitive-skill-rating': {
      title: 'Competitive Skill Rating (Per-Domain Elo)',
      question: 'How is the Competitive Skill Rating (Per-Domain Elo) calculated?',
      answer: "Competitive Skill Rating is an algorithmic scoring framework derived from the Elo rating formula. Rather than a static exam mark, it continuously updates based on:\n1. Assessment Accuracy: Score percentage on timed multiple-choice evaluations.\n2. Solution Speed: Efficiency in completing survey and formula calculations.\n3. Question Difficulty Weighting: High-difficulty questions yield larger rating gains.\nRatings range from Tier 1 (Novice) to Tier 4 (Expert >1,600 Elo)."
    },
    'skill-architecture-and-role-alignment': {
      title: 'Skill Architecture & Role Alignment',
      question: 'What does Skill Architecture & Role Alignment represent in Nirdesha?',
      answer: "Skill Architecture & Role Alignment provides a structured map connecting official statutory responsibilities (sampling theory, national accounts, computing, data governance) directly with an officer's personal capability baseline.\n\nIt identifies exact percentage gaps against the Senior Statistical Officer benchmark, highlighting priority areas for rapid progression."
    },
    'focus-track': {
      title: 'Focus Track',
      question: 'What is a Focus Track and how does it help my promotion?',
      answer: "A Focus Track is a personalized, high-priority learning pathway prescribed by Nirdesha's analytical engine. By detecting an officer's greatest competency gap (e.g., Macroeconomic Deflators), the Focus Track recommends specific NSSTA modules to close the gap rapidly and achieve 100% promotion readiness."
    },
    'ai-guidance-recommendation': {
      title: 'AI Guidance Recommendation',
      question: 'How does the AI Guidance Recommendation engine analyze my performance?',
      answer: "The AI Guidance Recommendation engine analyzes diagnostic test results, timed quiz latencies, and daily practice consistency. It cross-references your current scores with cadre promotion requirements to generate actionable, targeted study recommendations."
    },
    'cadre-capability-architecture': {
      title: 'Cadre Capability Architecture',
      question: 'What is the Cadre Capability Architecture?',
      answer: "The Cadre Capability Architecture is the official competency taxonomy detailing statistical, analytical, computational, and ethical governance capabilities expected across each rank (JSO -> SSO -> Director) in the Indian Statistical Service framework."
    },
    'subordinate-statistical-service': {
      title: 'Subordinate Statistical Service (SSS)',
      question: 'What is the Subordinate Statistical Service (SSS)?',
      answer: "The Subordinate Statistical Service (SSS) is a central civil service cadre constituted in 2002 under MoSPI. It comprises Junior Statistical Officers (JSO) and Senior Statistical Officers (SSO) deployed across more than 40 Central Ministries, Departments, and field directorates to manage India's statistical infrastructure."
    }
  };

  const btnAskAi = document.getElementById('btn-ask-ai-floating');
  let hoverTimer = null;
  let hideTimer = null;
  let currentTargetEl = null;
  let currentTermKey = null;

  function showAskAiButton(el, termKey) {
    if (!btnAskAi) return;

    currentTargetEl = el;
    currentTermKey = termKey;

    btnAskAi.style.display = 'inline-flex';
    btnAskAi.style.visibility = 'hidden';

    const rect = el.getBoundingClientRect();
    const btnWidth = btnAskAi.offsetWidth || 90;
    const btnHeight = btnAskAi.offsetHeight || 30;

    // Position above the term, or below if near top of viewport
    let top = rect.top - btnHeight - 8;
    if (top < 10) {
      top = rect.bottom + 8;
    }

    let left = rect.left + (rect.width / 2) - (btnWidth / 2);
    if (left < 10) left = 10;
    if (left + btnWidth > window.innerWidth - 10) {
      left = window.innerWidth - btnWidth - 10;
    }

    btnAskAi.style.left = `${left}px`;
    btnAskAi.style.top = `${top}px`;
    btnAskAi.style.visibility = 'visible';

    requestAnimationFrame(() => {
      btnAskAi.classList.add('visible');
    });
  }

  function hideAskAiButton() {
    clearTimeout(hoverTimer);
    hoverTimer = null;

    if (btnAskAi) {
      btnAskAi.classList.remove('visible');
      setTimeout(() => {
        if (!btnAskAi.classList.contains('visible')) {
          btnAskAi.style.display = 'none';
          currentTargetEl = null;
          currentTermKey = null;
        }
      }, 180);
    }
  }

  // Bind 2-second hover on all marked terms
  function initAskAiHoverEngine() {
    const termElements = document.querySelectorAll('.gov-term-explain');

    termElements.forEach((el) => {
      const termKey = el.dataset.term;
      if (!termKey) return;

      el.addEventListener('mouseenter', () => {
        clearTimeout(hideTimer);
        clearTimeout(hoverTimer);

        // Hover for 2 seconds before Ask AI button appears
        hoverTimer = setTimeout(() => {
          showAskAiButton(el, termKey);
        }, 2000);
      });

      el.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        // Short grace period so user can move mouse onto the Ask AI button
        hideTimer = setTimeout(() => {
          hideAskAiButton();
        }, 300);
      });
    });

    if (btnAskAi) {
      // Keep button active when mouse enters button itself
      btnAskAi.addEventListener('mouseenter', () => {
        clearTimeout(hideTimer);
      });

      btnAskAi.addEventListener('mouseleave', () => {
        hideTimer = setTimeout(() => {
          hideAskAiButton();
        }, 200);
      });

      // On Click: Route to AI Study Mentor and submit tailored question
      btnAskAi.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const termData = TERM_DEFINITIONS[currentTermKey];
        const termName = termData ? termData.title : (currentTargetEl ? currentTargetEl.textContent.trim() : 'Statistical Cadre Concept');
        const questionText = termData ? termData.question : `Can you explain the official concept and role of "${termName}" in MoSPI and the statistical cadre?`;

        hideAskAiButton();

        // 1. Switch to AI Study Mentor Tab
        switchTab('ai-mentor');

        // 2. Post question and response in AI Study Mentor Chat
        setTimeout(() => {
          if (typeof sendTraineeChatMessage === 'function') {
            sendTraineeChatMessage(questionText, 'user');
            
            // Generate tailored answer
            setTimeout(() => {
              const answerText = termData ? termData.answer : `Regarding "${termName}": This is an official statistical cadre standard governed under MoSPI guidelines. Refer to your NSSTA module syllabus for comprehensive study benchmarks.`;
              sendTraineeChatMessage(answerText, 'bot');
            }, 600);
          }
        }, 300);
      });
    }

    window.addEventListener('scroll', () => {
      hideAskAiButton();
    }, { passive: true });
  }

  // ==========================================================================
  // eLab HANDS-ON PROJECT PRACTICE ENVIRONMENT MODULE
  // ==========================================================================
  const DEFAULT_ELAB_PROJECTS = [
    {
      id: 'proj-portfolio',
      title: 'Build a Personal Portfolio',
      category: 'Web Development',
      difficulty: 'Beginner',
      estimatedTime: '2 Hours',
      description: 'Create a clean, responsive personal portfolio website showcasing your government project contributions, statistics skills, and certificates.',
      objectives: [
        'Master semantic HTML5 page layout structure',
        'Implement responsive CSS flexbox/grid system',
        'Deploy personal showcase page'
      ],
      requirements: [
        'Modern web browser (Chrome, Edge, or Firefox)',
        'Basic understanding of HTML and CSS syntax'
      ],
      resources: [
        'MDN Web Docs: HTML & CSS Fundamentals',
        'Nirdesha Component Style Guidelines'
      ],
      tasks: [
        { id: 't1', text: 'Set up semantic HTML layout (Header, Nav, Projects, Footer)', done: true },
        { id: 't2', text: 'Style hero section and project card grid using CSS flexbox', done: true },
        { id: 't3', text: 'Add interactive hover animations and responsive media queries', done: false },
        { id: 't4', text: 'Integrate contact form and deploy portfolio site', done: false },
        { id: 't5', text: 'Verify cross-browser compatibility and responsive layout', done: false }
      ]
    },
    {
      id: 'proj-cpi-pipeline',
      title: 'National CPI Data Processing Pipeline',
      category: 'Data Analysis',
      difficulty: 'Intermediate',
      estimatedTime: '4 Hours',
      description: 'Build a Python statistics script to clean, validate, and compute Consumer Price Index (CPI) weights from raw state survey samples.',
      objectives: [
        'Clean noisy survey microdata using pandas',
        'Apply Laspeyres price index formula',
        'Export verified JSON reports for MoSPI database'
      ],
      requirements: [
        'Python 3.10+ runtime environment',
        'pandas & numpy Python packages'
      ],
      resources: [
        'MoSPI CPI Calculation Methodology Whitepaper (2024)',
        'NSS Microdata Processing Guide'
      ],
      tasks: [
        { id: 't1', text: 'Load raw state survey CSV dataset into Pandas DataFrame', done: true },
        { id: 't2', text: 'Identify and remove outlier price quotations across urban/rural sectors', done: false },
        { id: 't3', text: 'Calculate weighted price relative indices per commodity group', done: false },
        { id: 't4', text: 'Generate summary CSV and JSON diagnostic reports', done: false }
      ]
    },
    {
      id: 'proj-sampling-calc',
      title: 'Sample Survey Sampling Calculator',
      category: 'MoSPI Statistics',
      difficulty: 'Beginner',
      estimatedTime: '3 Hours',
      description: 'Develop an interactive sampling error and sample size calculator based on NSS survey stratification guidelines.',
      objectives: [
        'Calculate simple random sampling error bounds',
        'Implement Horvitz-Thompson estimator formula',
        'Visualize confidence intervals'
      ],
      requirements: [
        'Basic probability & statistics knowledge'
      ],
      resources: [
        'NSSTA Sampling Methodology Manual',
        'Horvitz-Thompson Estimator Reference'
      ],
      tasks: [
        { id: 't1', text: 'Implement standard error calculation formula for SRSWOR', done: false },
        { id: 't2', text: 'Add sample size estimation calculator for fixed margin of error', done: false },
        { id: 't3', text: 'Create UI control inputs for confidence level selection (90%, 95%, 99%)', done: false }
      ]
    },
    {
      id: 'proj-budget-dash',
      title: 'Government Budget Analytics Dashboard',
      category: 'Web Development',
      difficulty: 'Advanced',
      estimatedTime: '6 Hours',
      description: 'Design and render an executive spending dashboard with interactive charts, departmental allocations, and breakdown filters.',
      objectives: [
        'Build dynamic gauge and bar charts',
        'Process multi-year budget allocation JSON files',
        'Implement high-contrast dark theme mode'
      ],
      requirements: [
        'JavaScript ES6+ and SVG basics'
      ],
      resources: [
        'Union Budget Sector Dataset',
        'Nirdesha SVG Data Viz Guide'
      ],
      tasks: [
        { id: 't1', text: 'Structure dashboard header and metric summary cards', done: true },
        { id: 't2', text: 'Render SVG bar charts for departmental budget allocations', done: true },
        { id: 't3', text: 'Add interactive year and sector filter dropdowns', done: true },
        { id: 't4', text: 'Implement dark/bright high-contrast accessibility mode', done: true }
      ]
    }
  ];

  function loadElabProjects() {
    const saved = localStorage.getItem('nirdesha_elab_projects');
    if (!saved) return DEFAULT_ELAB_PROJECTS;
    try {
      return JSON.parse(saved);
    } catch(e) {
      return DEFAULT_ELAB_PROJECTS;
    }
  }

  function saveElabProjects(projects) {
    localStorage.setItem('nirdesha_elab_projects', JSON.stringify(projects));
  }

  let elabProjects = loadElabProjects();
  let currentCatFilter = 'all';
  let currentDiffFilter = 'all';

  const elabGrid = document.getElementById('elab-projects-grid');
  const elabCompletedStat = document.getElementById('elab-stats-completed');
  const elabModal = document.getElementById('elab-workspace-modal');
  const elabModalTitle = document.getElementById('elab-modal-title');
  const elabModalCat = document.getElementById('elab-modal-cat');
  const elabModalBody = document.getElementById('elab-modal-body');
  const elabModalClose = document.getElementById('elab-modal-close');

  function calculateProjectProgress(project) {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(t => t.done).length;
    return Math.round((completed / project.tasks.length) * 100);
  }

  function renderElabProjects() {
    if (!elabGrid) return;

    let completedCount = 0;
    elabProjects.forEach(p => {
      if (calculateProjectProgress(p) === 100) completedCount++;
    });

    if (elabCompletedStat) {
      elabCompletedStat.textContent = `${completedCount} / ${elabProjects.length}`;
    }

    const filtered = elabProjects.filter(p => {
      const matchCat = currentCatFilter === 'all' || p.category === currentCatFilter;
      const matchDiff = currentDiffFilter === 'all' || p.difficulty === currentDiffFilter;
      return matchCat && matchDiff;
    });

    elabGrid.innerHTML = '';

    if (filtered.length === 0) {
      elabGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:#94a3b8;">No projects match the selected filters.</div>';
      return;
    }

    filtered.forEach(project => {
      const progress = calculateProjectProgress(project);
      const diffClass = project.difficulty.toLowerCase();

      const card = document.createElement('div');
      card.className = 'elab-project-card';
      card.innerHTML = `
        <div>
          <div class="elab-card-tags">
            <span class="elab-tag-cat">${project.category}</span>
            <span class="elab-tag-diff elab-diff-${diffClass}">${project.difficulty}</span>
          </div>
          <h3 class="elab-project-title">${project.title}</h3>
          <p class="elab-project-desc">${project.description}</p>
        </div>

        <div>
          <div class="elab-progress-wrapper">
            <div class="elab-progress-label">
              <span>Progress: ${progress}%</span>
              <span>${project.estimatedTime}</span>
            </div>
            <div class="elab-progress-bar">
              <div class="elab-progress-fill" style="width: ${progress}%;"></div>
            </div>
          </div>

          <div class="elab-card-actions">
            <button class="btn-elab-action btn-elab-primary" data-open-workspace="${project.id}">
              ${progress === 100 ? 'Review Project' : (progress > 0 ? 'Continue Project' : 'Start Project')}
            </button>
            <button class="btn-elab-action btn-elab-secondary" data-open-workspace="${project.id}">
              View Instructions
            </button>
          </div>
        </div>
      `;

      elabGrid.appendChild(card);
    });

    elabGrid.querySelectorAll('[data-open-workspace]').forEach(btn => {
      btn.addEventListener('click', () => {
        const projId = btn.getAttribute('data-open-workspace');
        openElabWorkspace(projId);
      });
    });
  }

  function openElabWorkspace(projId) {
    const project = elabProjects.find(p => p.id === projId);
    if (!project || !elabModal) return;

    if (elabModalTitle) elabModalTitle.textContent = project.title;
    if (elabModalCat) elabModalCat.textContent = `${project.category} • ${project.difficulty}`;

    const progress = calculateProjectProgress(project);

    if (elabModalBody) {
      elabModalBody.innerHTML = `
        <div style="background: rgba(0,43,73,0.04); padding: 1rem 1.25rem; border-left: 4px solid var(--trainee-saffron);">
          <p style="margin:0 0 0.5rem 0; font-size:0.9rem; line-height:1.5; color:#334155;">${project.description}</p>
          <div style="display:flex; justify-content:space-between; gap: 1rem; font-size: 0.8rem; font-weight: 700; color: #64748b;">
            <span>Estimated Duration: ${project.estimatedTime}</span>
            <span>Overall Progress: ${progress}%</span>
          </div>
        </div>

        <div>
          <h4 style="font-size:0.95rem; font-weight:800; color:#002b49; margin:0 0 0.5rem 0;">Learning Objectives</h4>
          <ul style="margin:0; padding-left:1.25rem; font-size:0.85rem; color:#475569; line-height:1.6;">
            ${project.objectives.map(obj => `<li>${obj}</li>`).join('')}
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.95rem; font-weight:800; color:#002b49; margin:0 0 0.5rem 0;">Prerequisites & Requirements</h4>
          <ul style="margin:0; padding-left:1.25rem; font-size:0.85rem; color:#475569; line-height:1.6;">
            ${project.requirements.map(req => `<li>${req}</li>`).join('')}
          </ul>
        </div>

        <div>
          <h4 style="font-size:0.95rem; font-weight:800; color:#002b49; margin:0 0 0.75rem 0;">Step-by-Step Checkpoints</h4>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            ${project.tasks.map((task, idx) => `
              <label class="elab-task-item">
                <input type="checkbox" data-task-id="${task.id}" ${task.done ? 'checked' : ''}>
                <div>
                  <span style="font-size:0.85rem; font-weight:700; color:#0f172a; ${task.done ? 'text-decoration: line-through; opacity: 0.7;' : ''}">
                    Step ${idx + 1}: ${task.text}
                  </span>
                </div>
              </label>
            `).join('')}
          </div>
        </div>

        <div>
          <h4 style="font-size:0.95rem; font-weight:800; color:#002b49; margin:0 0 0.5rem 0;">Resources & Help</h4>
          <ul style="margin:0; padding-left:1.25rem; font-size:0.85rem; color:#0284c7; line-height:1.6;">
            ${project.resources.map(res => `<li><a href="#" style="color:#0284c7; font-weight:600;">${res}</a></li>`).join('')}
          </ul>
        </div>
      `;

      elabModalBody.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', () => {
          const taskId = chk.getAttribute('data-task-id');
          const task = project.tasks.find(t => t.id === taskId);
          if (task) {
            task.done = chk.checked;
            saveElabProjects(elabProjects);
            renderElabProjects();
            openElabWorkspace(project.id);
          }
        });
      });
    }

    elabModal.classList.add('is-open');
  }

  if (elabModalClose && elabModal) {
    elabModalClose.addEventListener('click', () => {
      elabModal.classList.remove('is-open');
    });

    elabModal.addEventListener('click', (e) => {
      if (e.target === elabModal) {
        elabModal.classList.remove('is-open');
      }
    });
  }

  document.querySelectorAll('[data-filter-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCatFilter = btn.getAttribute('data-filter-cat');
      renderElabProjects();
    });
  });

  document.querySelectorAll('[data-filter-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-diff]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDiffFilter = btn.getAttribute('data-filter-diff');
      renderElabProjects();
    });
  });

  renderElabProjects();

  initAskAiHoverEngine();


  // ==========================================================================
  // AI STUDY MENTOR FULLSCREEN & SHRINK SCREEN TOGGLE (SAME BUTTON)
  // ==========================================================================
  const btnFullscreenMentor = document.getElementById('btn-fullscreen-mentor');
  const aiChatContainer = document.querySelector('.ai-chat-container');

  if (aiChatContainer && btnFullscreenMentor) {
    function toggleMentorFullscreen(forceState) {
      const isFs = typeof forceState === 'boolean' ? forceState : !aiChatContainer.classList.contains('is-fullscreen');

      if (isFs) {
        aiChatContainer.classList.add('is-fullscreen');
        document.body.classList.add('mentor-fullscreen-active');
        try { sessionStorage.setItem('nirdesha_mentor_fs', 'true'); } catch (e) {}
      } else {
        aiChatContainer.classList.remove('is-fullscreen');
        document.body.classList.remove('mentor-fullscreen-active');
        try { sessionStorage.setItem('nirdesha_mentor_fs', 'false'); } catch (e) {}
      }

      const iconExpand = btnFullscreenMentor.querySelector('.icon-expand');
      const iconCompress = btnFullscreenMentor.querySelector('.icon-compress');
      if (iconExpand && iconCompress) {
        iconExpand.style.display = isFs ? 'none' : 'block';
        iconCompress.style.display = isFs ? 'block' : 'none';
      }
      btnFullscreenMentor.setAttribute('data-tooltip', isFs ? 'Shrink Screen' : 'Full Screen');
      btnFullscreenMentor.setAttribute('title', isFs ? 'Shrink Screen' : 'Full Screen');

      if (traineeChatLog) traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
      if (isFs && traineeChatInput) {
        setTimeout(() => traineeChatInput.focus(), 60);
      }
    }

    btnFullscreenMentor.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMentorFullscreen();
    });

    // Escape key exits fullscreen / shrinks back
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && aiChatContainer.classList.contains('is-fullscreen')) {
        toggleMentorFullscreen(false);
      }
    });

    // Restore persistent fullscreen state if preserved in session
    try {
      if (sessionStorage.getItem('nirdesha_mentor_fs') === 'true') {
        toggleMentorFullscreen(true);
      }
    } catch (e) {}
  }

  // ==========================================================================
  // DELEGATED COPY & SAVE IN NOTES LISTENERS FOR CHAT BUBBLES
  // ==========================================================================
  document.addEventListener('click', async (e) => {
    // 1. COPY BUTTON
    const copyBtn = e.target.closest('.btn-copy-response');
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      const bubble = copyBtn.closest('.chat-bubble');
      if (bubble) {
        const clone = bubble.cloneNode(true);
        const actions = clone.querySelector('.ai-msg-actions');
        if (actions) actions.remove();
        const textToCopy = clone.innerText.replace('Thinking...', '').trim();
        try {
          await navigator.clipboard.writeText(textToCopy);
          copyBtn.classList.add('is-copied');
          copyBtn.title = 'Copied!';
          copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          setTimeout(() => {
            copyBtn.classList.remove('is-copied');
            copyBtn.title = 'Copy response';
            copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          }, 1800);
        } catch (err) {
          console.warn('Clipboard write error:', err);
        }
      }
      return;
    }

    // 2. SAVE IN NOTES BUTTON
    const saveBtn = e.target.closest('.btn-save-notes');
    if (saveBtn) {
      e.preventDefault();
      e.stopPropagation();
      const bubble = saveBtn.closest('.chat-bubble');
      if (bubble && window.NirdeshaNotes) {
        const clone = bubble.cloneNode(true);
        const actions = clone.querySelector('.ai-msg-actions');
        if (actions) actions.remove();
        const formattedHtml = clone.innerHTML;
        const plainText = clone.innerText.replace('Thinking...', '').trim();

        let noteTitle = bubble.getAttribute('data-query') || '';
        if (!noteTitle) {
          const firstLine = plainText.split('\n')[0].replace(/<[^>]+>/g, '').trim();
          noteTitle = firstLine.slice(0, 60) || 'Study Note Snippet';
        }

        window.NirdeshaNotes.saveSnippet({
          title: noteTitle,
          html: formattedHtml,
          text: plainText,
          source: 'AI Study Mentor'
        });

        saveBtn.classList.add('is-saved');
        saveBtn.title = 'Saved in Notes!';
        saveBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
        setTimeout(() => {
          saveBtn.classList.remove('is-saved');
          saveBtn.title = 'Save in Notes';
          saveBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`;
        }, 2200);
      }
      return;
    }
  });

  // ==========================================================================
  // TRAINEE NOTES & NOTEBOOKS SYSTEM (FOLDERS, SNIPPETS, PINNING, MOVING)
  // ==========================================================================

  function initNotesEngine() {
    const STORAGE_KEY = 'nirdesha_trainee_notebooks';

    function loadNotesData() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          if (data && data.notebooks && data.notebooks.length > 0) {
            return data;
          }
        }
      } catch (e) {}

      return {
        activeNotebookId: 'nb_1',
        notebooks: [
          { id: 'nb_1', name: 'Field Operations & CAPI Protocol', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7 },
          { id: 'nb_2', name: 'National Accounts & GDP Deflators', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
          { id: 'nb_3', name: 'Survey Sampling & Variance Proofs', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 }
        ],
        notes: [
          {
            id: 'note_101',
            notebookId: 'nb_1',
            title: 'CAPI Tablet Field Verification Rules & Tolerances',
            content: `**Field Operations Division (NSSO / FOD) Verification Standard:**\n\n1. **GPS Geo-Fencing:** Primary Sampling Unit (PSU) coordinates must lie within **50 meters** of the census enumeration block boundary.\n2. **Schedule 10.2 Listing:** All residential households in selected hamlets must have complete multiplier listing before drawing the sample.\n3. **Battery & Offline Caching:** Field tablets must sync cryptographic hashes daily even when offline.`,
            tags: ['CAPI', 'GPS', 'Field Audit'],
            isPinned: true,
            createdAt: Date.now() - 1000 * 60 * 60 * 48,
            updatedAt: Date.now() - 1000 * 60 * 60 * 12
          },
          {
            id: 'note_102',
            notebookId: 'nb_1',
            title: 'Non-Response Imputation Guidelines (NSS 79th Round)',
            content: `For item non-response in household consumer expenditure, the NSSO applies **Hot-Deck Imputation** matching on:\n- Rural/Urban stratum\n- Household size decile\n- Principal occupation code (NCO-2015)`,
            tags: ['Imputation', 'Non-Response'],
            isPinned: false,
            createdAt: Date.now() - 1000 * 60 * 60 * 72,
            updatedAt: Date.now() - 1000 * 60 * 60 * 72
          },
          {
            id: 'note_201',
            notebookId: 'nb_2',
            title: 'Paasche vs Laspeyres Index Aggregation Formulas',
            content: `### Mathematical Formulations:\n\n- **Laspeyres Price Index (Base Period Quantities):**\n  \\( P_L = \\frac{\\sum p_t q_0}{\\sum p_0 q_0} \\times 100 \\)\n  *(Suffers from upward substitution bias)*\n\n- **Paasche Price Index (Current Period Quantities):**\n  \\( P_P = \\frac{\\sum p_t q_t}{\\sum p_0 q_t} \\times 100 \\)\n  *(Suffers from downward substitution bias)*\n\n- **Fisher's Ideal Index:**\n  \\( P_F = \\sqrt{P_L \\times P_P} \\)\n  *(Satisfies Time and Factor Reversal tests)*`,
            tags: ['Deflators', 'Indices', 'Formula'],
            isPinned: true,
            createdAt: Date.now() - 1000 * 60 * 60 * 36,
            updatedAt: Date.now() - 1000 * 60 * 60 * 6
          },
          {
            id: 'note_202',
            notebookId: 'nb_2',
            title: 'Gross Value Added (GVA) Basic Prices Accounting Identity',
            content: `National Accounts Division benchmark relation:\n\n\\( \\text{GDP at Market Prices} = \\text{GVA at Basic Prices} + \\text{Product Taxes} - \\text{Product Subsidies} \\)\n\nStructural weights derived from 2011-12 Supply-Use Tables (SUT).`,
            tags: ['GVA', 'National Accounts'],
            isPinned: false,
            createdAt: Date.now() - 1000 * 60 * 60 * 60,
            updatedAt: Date.now() - 1000 * 60 * 60 * 60
          },
          {
            id: 'note_301',
            notebookId: 'nb_3',
            title: 'Sen-Yates-Grundy Non-Negativity Proof & Theorem',
            content: `Under Horvitz-Thompson unequal probability sampling without replacement (\\(\\pi\\)PS):\n\n\\( V_{SYG}(\\hat{Y}_{HT}) = -\\frac{1}{2} \\sum_{i=1}^n \\sum_{j \\neq i}^n \\frac{\\pi_{ij} - \\pi_i \\pi_j}{\\pi_{ij}} \\left( \\frac{y_i}{\\pi_i} - \\frac{y_j}{\\pi_j} \\right)^2 \\)\n\n**Theorem:** Guaranteed non-negative for all samples if and only if sample size n is fixed and \\(\\pi_{ij} \\le \\pi_i \\pi_j\\) for all pairs (i, j).`,
            tags: ['Horvitz-Thompson', 'Variance', 'Proof'],
            isPinned: true,
            createdAt: Date.now() - 1000 * 60 * 60 * 24,
            updatedAt: Date.now() - 1000 * 60 * 60 * 2
          },
          {
            id: 'note_302',
            notebookId: 'nb_3',
            title: 'Neyman Optimum Stratification Allocation Rule',
            content: `When sampling cost per unit is equal across strata, optimal stratum sample size:\n\n\\( n_h = n \\frac{N_h S_h}{\\sum_{k=1}^L N_k S_k} \\)\n\nMinimizes sample variance of the estimated stratified mean.`,
            tags: ['Stratification', 'Neyman', 'Allocation'],
            isPinned: false,
            createdAt: Date.now() - 1000 * 60 * 60 * 50,
            updatedAt: Date.now() - 1000 * 60 * 60 * 50
          }
        ]
      };
    }

    let notesState = loadNotesData();

    function persistNotesData() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notesState));
      } catch (e) {}
      updateNotesBadge();
    }

    function updateNotesBadge() {
      const badge = document.getElementById('notes-sidebar-badge');
      if (badge) {
        const total = notesState.notes.length;
        badge.textContent = total;
        badge.style.display = total > 0 ? 'inline-block' : 'none';
      }
    }

    const notebooksListEl = document.getElementById('notebooks-list');
    const activeNotebookNameEl = document.getElementById('active-notebook-name');
    const activeNotebookCountEl = document.getElementById('active-notebook-count');
    const btnRenameActiveNb = document.getElementById('btn-rename-active-notebook');
    const btnDeleteActiveNb = document.getElementById('btn-delete-active-notebook');
    const btnCreateNb = document.getElementById('btn-create-notebook');
    const notesSearchInput = document.getElementById('notes-search-input');
    const notesGridEl = document.getElementById('notes-snippets-grid');

    let currentSearchTerm = '';
    let notesSortMode = 'pinned_hierarchy'; // 'pinned_hierarchy' | 'date_asc' | 'date_desc'

    function escapeHtml(str) {
      return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function getActiveNotebook() {
      return notesState.notebooks.find(nb => nb.id === notesState.activeNotebookId) || notesState.notebooks[0];
    }

    function renderNotebooksList() {
      if (!notebooksListEl) return;
      notebooksListEl.innerHTML = '';

      notesState.notebooks.forEach(nb => {
        const count = notesState.notes.filter(n => n.notebookId === nb.id).length;
        const isActive = nb.id === notesState.activeNotebookId;

        const item = document.createElement('div');
        item.className = `notebook-tab-item ${isActive ? 'active' : ''}`;
        item.setAttribute('data-id', nb.id);
        item.innerHTML = `
          <div class="notebook-tab-name">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <span title="${escapeHtml(nb.name)}">${escapeHtml(nb.name)}</span>
          </div>
          <span class="notebook-tab-count">${count}</span>
        `;

        item.addEventListener('click', () => {
          notesState.activeNotebookId = nb.id;
          persistNotesData();
          renderNotesUI();
        });

        notebooksListEl.appendChild(item);
      });
    }

    function renderNotesGrid() {
      if (!notesGridEl) return;
      notesGridEl.innerHTML = '';

      const activeNb = getActiveNotebook();
      let notesInNb = notesState.notes.filter(n => n.notebookId === activeNb.id);

      if (currentSearchTerm) {
        const lower = currentSearchTerm.toLowerCase();
        notesInNb = notesInNb.filter(n => (n.title && n.title.toLowerCase().includes(lower)) || (n.text && n.text.toLowerCase().includes(lower)));
      }

      // Sort: based on notesSortMode
      if (notesSortMode === 'pinned_hierarchy') {
        // Pinned notes first based on hierarchy, then remaining saved notes based on first saved first come
        notesInNb.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (a.createdAt || 0) - (b.createdAt || 0);
        });
      } else if (notesSortMode === 'date_asc') {
        // Pure chronological (first saved, first come), irrespective of pin
        notesInNb.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      } else {
        // Pure newest first, irrespective of pin
        notesInNb.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }

      if (notesInNb.length === 0) {
        notesGridEl.innerHTML = `
          <div class="empty-notes-prompt">
            <div class="empty-notes-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>
            <h4 style="margin: 0 0 0.5rem 0; font-weight: 800; color: #002b49;">No Notes Saved Yet</h4>
            <p style="margin: 0; font-size: 0.85rem;">
              ${currentSearchTerm ? 'No notes matched your search query.' : 'Click the <strong>Save in Notes</strong> icon below any AI Study Mentor response to store formulas and explanations here.'}
            </p>
          </div>
        `;
        return;
      }

      notesInNb.forEach(note => {
        const card = document.createElement('div');
        card.className = `note-card ${note.isPinned ? 'is-pinned' : ''}`;
        card.setAttribute('data-note-id', note.id);

        const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Saved Note';

        let moveOptionsHtml = '';
        notesState.notebooks.forEach(nb => {
          const selected = nb.id === note.notebookId ? 'selected' : '';
          moveOptionsHtml += `<option value="${nb.id}" ${selected}>${escapeHtml(nb.name)}</option>`;
        });

        card.innerHTML = `
          <div>
            <div class="note-card-header">
              <h4 class="note-card-title" title="${escapeHtml(note.title || 'Study Note')}">
                ${escapeHtml(note.title || 'Study Note')}
              </h4>
              <div class="note-card-controls">
                <button type="button" class="btn-note-gen-flashcard" title="Convert important parts into Revision Flashcard" aria-label="Convert into Revision Flashcard">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M12 4v16"></path></svg>
                  <span>Flashcard</span>
                </button>
                <button type="button" class="btn-pin-note ${note.isPinned ? 'active' : ''}" title="${note.isPinned ? 'Unpin note' : 'Pin note'}" aria-label="${note.isPinned ? 'Unpin note' : 'Pin note'}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="${note.isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                </button>
                <button type="button" class="btn-copy-note" title="Copy note" aria-label="Copy note">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button type="button" class="btn-del-note" title="Delete note" aria-label="Delete note">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
            <div class="note-card-body">
              ${note.html || note.text || ''}
            </div>
          </div>
          <div class="note-card-footer">
            <span>${dateStr}</span>
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-size:0.68rem; color:#94a3b8;">Move:</span>
              <select class="note-move-select" title="Move to another notebook">
                ${moveOptionsHtml}
              </select>
            </div>
          </div>
        `;

        const btnGenFc = card.querySelector('.btn-note-gen-flashcard');
        if (btnGenFc) {
          btnGenFc.addEventListener('click', () => {
            const activeNb = getActiveNotebook();
            const flashcard = extractRevisionFlashcard(note, activeNb ? activeNb.name : 'Study Notes');
            if (typeof window.addFlashcardToRevisionDeck === 'function') {
              window.addFlashcardToRevisionDeck(flashcard);
            }
            btnGenFc.innerHTML = '✓ Added!';
            btnGenFc.style.background = '#16a34a';
            btnGenFc.style.color = '#ffffff';
            btnGenFc.style.borderColor = '#16a34a';
            setTimeout(() => {
              btnGenFc.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M12 4v16"></path></svg><span>Flashcard</span>`;
              btnGenFc.style.background = '';
              btnGenFc.style.color = '';
              btnGenFc.style.borderColor = '';
            }, 1800);

            showNirdeshaToast(`✓ High-Yield Revision Flashcard created for "${escapeHtml(note.title || 'Note')}"! <a href="#revision-cards" class="toast-tab-link" style="color:#fdba74;text-decoration:underline;font-weight:700;margin-left:6px;">View in Revision Cards →</a>`);
          });
        }

        const btnPin = card.querySelector('.btn-pin-note');
        if (btnPin) {
          btnPin.addEventListener('click', () => {
            note.isPinned = !note.isPinned;
            persistNotesData();
            renderNotesUI();
          });
        }

        const btnCopy = card.querySelector('.btn-copy-note');
        if (btnCopy) {
          btnCopy.addEventListener('click', async () => {
            try {
              await navigator.clipboard.writeText(note.text || card.querySelector('.note-card-body').innerText);
              btnCopy.title = 'Copied!';
              setTimeout(() => btnCopy.title = 'Copy note', 1500);
            } catch (err) {}
          });
        }

        const btnDel = card.querySelector('.btn-del-note');
        if (btnDel) {
          btnDel.addEventListener('click', () => {
            if (confirm('Delete this note snippet? It will be moved to Recycle Notes.')) {
              moveToRecycleNotes(note);
              notesState.notes = notesState.notes.filter(n => n.id !== note.id);
              persistNotesData();
              renderNotesUI();
            }
          });
        }

        const moveSelect = card.querySelector('.note-move-select');
        if (moveSelect) {
          moveSelect.addEventListener('change', (e) => {
            const targetNbId = e.target.value;
            if (targetNbId && targetNbId !== note.notebookId) {
              note.notebookId = targetNbId;
              persistNotesData();
              renderNotesUI();
            }
          });
        }

        notesGridEl.appendChild(card);
      });
    }

    function renderNotesUI() {
      const activeNb = getActiveNotebook();
      if (activeNotebookNameEl) activeNotebookNameEl.textContent = activeNb.name;

      const count = notesState.notes.filter(n => n.notebookId === activeNb.id).length;
      if (activeNotebookCountEl) activeNotebookCountEl.textContent = `${count} ${count === 1 ? 'Note' : 'Notes'}`;

      if (btnDeleteActiveNb) {
        btnDeleteActiveNb.style.display = notesState.notebooks.length > 1 ? 'inline-flex' : 'none';
      }

      renderNotebooksList();
      renderNotesGrid();
      updateNotesBadge();
    }

    function openNotebookModal(mode, currentVal, onConfirm) {
      const modal = document.getElementById('notebook-modal');
      const heading = document.getElementById('notebook-modal-heading');
      const eyebrow = document.getElementById('notebook-modal-eyebrow');
      const input = document.getElementById('notebook-name-input');
      const confirmBtn = document.getElementById('btn-confirm-notebook');
      const cancelBtn = document.getElementById('btn-cancel-notebook');
      const closeBtn = document.getElementById('btn-close-notebook-modal');
      if (!modal || !input || !confirmBtn) return;

      if (mode === 'create') {
        heading.textContent = 'Create New Notebook';
        eyebrow.textContent = 'Trainee Knowledge Base';
        confirmBtn.textContent = 'Create Notebook';
        confirmBtn.style.background = '';
        input.style.display = 'block';
        input.value = currentVal || `Notebook ${notesState.notebooks.length + 1}`;
      } else {
        heading.textContent = 'Rename Notebook Folder';
        eyebrow.textContent = 'Trainee Knowledge Base';
        confirmBtn.textContent = 'Save Changes';
        confirmBtn.style.background = '';
        input.style.display = 'block';
        input.value = currentVal;
      }

      modal.style.display = 'flex';
      setTimeout(() => {
        input.focus();
        input.select();
      }, 50);

      function closeModal() {
        modal.style.display = 'none';
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        closeBtn.onclick = null;
        modal.onclick = null;
        input.onkeydown = null;
      }

      function handleConfirm() {
        const val = input.value.trim();
        if (val) {
          closeModal();
          onConfirm(val);
        }
      }

      function attemptCloseNotebook() {
        const val = input.value.trim();
        if (val && val !== currentVal) {
          if (!confirm("You have an unsaved notebook folder name. Discard changes and exit?")) {
            return;
          }
        }
        closeModal();
      }

      confirmBtn.onclick = (e) => { e.preventDefault(); handleConfirm(); };
      cancelBtn.onclick = (e) => { e.preventDefault(); attemptCloseNotebook(); };
      closeBtn.onclick = (e) => { e.preventDefault(); attemptCloseNotebook(); };
      modal.onclick = (e) => { if (e.target === modal) attemptCloseNotebook(); };
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirm();
        } else if (e.key === 'Escape') {
          closeModal();
        }
      };
    }

    if (btnCreateNb) {
      btnCreateNb.addEventListener('click', (e) => {
        e.preventDefault();
        const nextNum = notesState.notebooks.length + 1;
        openNotebookModal('create', `Notebook ${nextNum}`, (name) => {
          const newId = `nb_${Date.now()}`;
          notesState.notebooks.push({
            id: newId,
            name: name,
            createdAt: Date.now()
          });
          notesState.activeNotebookId = newId;
          persistNotesData();
          renderNotesUI();
        });
      });
    }

    if (btnRenameActiveNb) {
      btnRenameActiveNb.addEventListener('click', (e) => {
        e.preventDefault();
        const activeNb = getActiveNotebook();
        openNotebookModal('rename', activeNb.name, (newName) => {
          activeNb.name = newName;
          persistNotesData();
          renderNotesUI();
        });
      });
    }

    if (btnDeleteActiveNb) {
      btnDeleteActiveNb.addEventListener('click', (e) => {
        e.preventDefault();
        if (notesState.notebooks.length <= 1) return;
        const activeNb = getActiveNotebook();
        const modal = document.getElementById('notebook-modal');
        const heading = document.getElementById('notebook-modal-heading');
        const eyebrow = document.getElementById('notebook-modal-eyebrow');
        const input = document.getElementById('notebook-name-input');
        const confirmBtn = document.getElementById('btn-confirm-notebook');
        const cancelBtn = document.getElementById('btn-cancel-notebook');
        const closeBtn = document.getElementById('btn-close-notebook-modal');
        if (!modal || !confirmBtn) return;

        heading.textContent = `Delete "${activeNb.name}"?`;
        eyebrow.textContent = 'Confirm Notebook Removal';
        confirmBtn.textContent = 'Delete Folder';
        confirmBtn.style.background = '#dc2626';
        input.style.display = 'none';
        const label = modal.querySelector('label[for="notebook-name-input"]');
        const originalLabelText = label ? label.textContent : 'Notebook Folder Name';
        if (label) label.textContent = 'Any notes inside will be preserved and moved to your primary notebook.';

        modal.style.display = 'flex';

        function closeModal() {
          modal.style.display = 'none';
          input.style.display = 'block';
          confirmBtn.style.background = '';
          if (label) label.textContent = originalLabelText;
          confirmBtn.onclick = null;
          cancelBtn.onclick = null;
          closeBtn.onclick = null;
          modal.onclick = null;
        }

        confirmBtn.onclick = (ev) => {
          ev.preventDefault();
          const fallbackNb = notesState.notebooks.find(nb => nb.id !== activeNb.id);
          notesState.notes.forEach(n => {
            if (n.notebookId === activeNb.id) {
              n.notebookId = fallbackNb.id;
            }
          });
          notesState.notebooks = notesState.notebooks.filter(nb => nb.id !== activeNb.id);
          notesState.activeNotebookId = fallbackNb.id;
          persistNotesData();
          renderNotesUI();
          closeModal();
        };

        cancelBtn.onclick = closeModal;
        closeBtn.onclick = closeModal;
        modal.onclick = (ev) => { if (ev.target === modal) closeModal(); };
      });
    }

    if (notesSearchInput) {
      notesSearchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.trim();
        renderNotesGrid();
      });
    }

    // Sort Button Toggle (Hierarchy vs Date & Time irrespective of pin)
    const btnSortNotes = document.getElementById('btn-sort-notes');
    const sortLabel = document.getElementById('notes-sort-label');
    if (btnSortNotes) {
      btnSortNotes.addEventListener('click', (e) => {
        e.preventDefault();
        if (notesSortMode === 'pinned_hierarchy') {
          notesSortMode = 'date_asc';
          if (sortLabel) sortLabel.textContent = 'Date: 1st Saved';
          btnSortNotes.setAttribute('data-tooltip', 'Sort: First Saved (Click for Pinned Hierarchy)');
        } else if (notesSortMode === 'date_asc') {
          notesSortMode = 'date_desc';
          if (sortLabel) sortLabel.textContent = 'Date: Newest';
          btnSortNotes.setAttribute('data-tooltip', 'Sort: Newest First (Click for Pinned Hierarchy)');
        } else {
          notesSortMode = 'pinned_hierarchy';
          if (sortLabel) sortLabel.textContent = 'Hierarchy';
          btnSortNotes.setAttribute('data-tooltip', 'Sort: Pinned Hierarchy (Click for Date & Time)');
        }
        renderNotesGrid();
      });
    }

    // ==========================================================================
    // EXPORT NOTEBOOK DOSSIER (PDF / PRINT, MARKDOWN, DOCX, JSON, TXT)
    // ==========================================================================
    const btnExportNb = document.getElementById('btn-export-notebook');
    const exportModal = document.getElementById('export-notes-modal');
    const btnCloseExportModal = document.getElementById('btn-close-export-modal');
    const btnCancelExport = document.getElementById('btn-cancel-export-notes');
    const btnConfirmExport = document.getElementById('btn-confirm-export-notes');

    let exportScope = 'whole'; // 'whole' | 'pinned'
    let exportFormat = 'pdf';  // 'pdf' | 'md' | 'docx' | 'json' | 'txt'

    function openExportModal() {
      if (!exportModal) return;
      const activeNb = getActiveNotebook();
      const notesInNb = notesState.notes.filter(n => n.notebookId === activeNb.id);
      const pinnedCount = notesInNb.filter(n => n.isPinned).length;

      const titleEl = document.getElementById('export-modal-notebook-title');
      const nameDisp = document.getElementById('export-nb-name-display');
      const countDisp = document.getElementById('export-nb-count-display');
      const pinnedDisp = document.getElementById('export-nb-pinned-display');

      if (titleEl) titleEl.textContent = `Export: ${activeNb.name}`;
      if (nameDisp) nameDisp.textContent = activeNb.name;
      if (countDisp) countDisp.textContent = `${notesInNb.length} ${notesInNb.length === 1 ? 'Note' : 'Notes'}`;
      if (pinnedDisp) pinnedDisp.textContent = `${pinnedCount} Pinned`;

      // Reset options to default
      exportScope = 'whole';
      exportFormat = 'pdf';

      document.querySelectorAll('#export-scope-options .export-scope-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-scope') === 'whole');
      });

      document.querySelectorAll('#export-format-options .export-format-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-format') === 'pdf');
      });

      exportModal.style.display = 'flex';
    }

    function closeExportModal() {
      if (exportModal) exportModal.style.display = 'none';
    }

    if (btnExportNb) {
      btnExportNb.addEventListener('click', (e) => {
        e.preventDefault();
        openExportModal();
      });
    }

    if (btnCloseExportModal) btnCloseExportModal.addEventListener('click', closeExportModal);
    if (btnCancelExport) btnCancelExport.addEventListener('click', closeExportModal);
    if (exportModal) {
      exportModal.addEventListener('click', (e) => {
        if (e.target === exportModal) closeExportModal();
      });
    }

    // Scope selection listeners
    document.querySelectorAll('#export-scope-options .export-scope-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        exportScope = btn.getAttribute('data-scope') || 'whole';
        document.querySelectorAll('#export-scope-options .export-scope-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Format selection listeners
    document.querySelectorAll('#export-format-options .export-format-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        exportFormat = btn.getAttribute('data-format') || 'pdf';
        document.querySelectorAll('#export-format-options .export-format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Helper to download text file as blob
    function triggerDownload(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 250);
    }

    if (btnConfirmExport) {
      btnConfirmExport.addEventListener('click', (e) => {
        e.preventDefault();
        const activeNb = getActiveNotebook();
        let notesInNb = notesState.notes.filter(n => n.notebookId === activeNb.id);

        if (notesInNb.length === 0) {
          alert('This notebook is currently empty. Save some mentor answers or sessions first!');
          closeExportModal();
          return;
        }

        let targetNotes = [];
        if (exportScope === 'pinned') {
          targetNotes = notesInNb.filter(n => n.isPinned);
          if (targetNotes.length === 0) {
            alert('No pinned notes found in this notebook. Please select "Whole Notebook" or pin key formulas first.');
            return;
          }
          // Sort pinned notes by creation timestamp (first saved, first come)
          targetNotes.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        } else {
          // Whole Notebook: FIRST pinned notes based on their hierarchy, then remaining notes by timestamp (first saved first come)
          targetNotes = [...notesInNb].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return (a.createdAt || 0) - (b.createdAt || 0);
          });
        }

        const safeNbName = activeNb.name.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const timestampStr = new Date().toISOString().slice(0, 10);
        const fileNameBase = `NIRDESHA_${safeNbName}_${timestampStr}`;

        closeExportModal();

        // 1. PDF / PRINT EXPORT WITH TRANSLUCENT COPYRIGHT WATERMARK
        if (exportFormat === 'pdf') {
          const printContainer = document.getElementById('nirdesha-printable-dossier');
          if (!printContainer) return;

          let notesHtml = '';
          targetNotes.forEach((note, idx) => {
            const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Saved Note';
            const pinnedBadge = note.isPinned ? `<div class="print-pinned-badge">★ PINNED CADRE HIGHLIGHT • HIGH-YIELD FORMULA</div>` : '';
            
            notesHtml += `
              <div class="print-note-block ${note.isPinned ? 'is-pinned' : ''}">
                ${pinnedBadge}
                <div class="print-note-title">#${idx + 1}. ${escapeHtml(note.title || 'Study Note')}</div>
                <div class="print-note-meta">
                  <span>Saved: ${dateStr}</span> • <span>Source: ${escapeHtml(note.source || 'AI Study Mentor')}</span>
                </div>
                <div class="print-note-content">
                  ${note.html || note.text || ''}
                </div>
              </div>
            `;
          });

          printContainer.innerHTML = `
            <div class="print-watermark-overlay">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="margin: 0 auto 0.4rem auto; opacity: 0.12;"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              NIRDESHA © 2026<br>
              <span style="font-size: 1.5rem; letter-spacing: 0.2em;">MoSPI CADRE STUDY MATERIAL • CONFIDENTIAL</span>
            </div>

            <div class="print-dossier-header">
              <div class="print-gov-banner">
                <div class="print-emblem-title">
                  <h1>Ministry of Statistics & Programme Implementation (MoSPI)</h1>
                  <h2>National Integrated Repositories for Data & Statistical Higher Adaptive Learning (NIRDESHA)</h2>
                </div>
                <div style="text-align: right; font-size: 0.72rem; color: #475569;">
                  <strong>OFFICIAL CADRE DOSSIER</strong><br>
                  Doc Ref: SSS-ND-${Date.now().toString().slice(-6)}
                </div>
              </div>

              <div class="print-meta-grid">
                <div class="print-meta-item">
                  <strong>Trainee Officer:</strong>
                  S. K. Raman (Junior Statistical Officer)
                </div>
                <div class="print-meta-item">
                  <strong>Roll Code & Cadre:</strong>
                  SSS-2024-8891 • Subordinate Statistical Service
                </div>
                <div class="print-meta-item">
                  <strong>Division:</strong>
                  Field Operations Division (NSSO / FOD)
                </div>
                <div class="print-meta-item">
                  <strong>Notebook Dossier:</strong>
                  ${escapeHtml(activeNb.name)}
                </div>
                <div class="print-meta-item">
                  <strong>Export Date & Time:</strong>
                  ${new Date().toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
                </div>
                <div class="print-meta-item">
                  <strong>Total Snippets Included:</strong>
                  ${targetNotes.length} Notes (${targetNotes.filter(n => n.isPinned).length} Pinned)
                </div>
              </div>
            </div>

            <div class="print-dossier-body">
              ${notesHtml}
            </div>

            <div class="print-footer-notice">
              NIRDESHA © 2026 • Ministry of Statistics and Programme Implementation • Confidential Examination Revision Dossier
            </div>
          `;

          printContainer.style.display = 'block';

          // Trigger print dialog for Save-as-PDF
          setTimeout(() => {
            window.print();
            setTimeout(() => {
              printContainer.style.display = 'none';
              printContainer.innerHTML = '';
            }, 600);
          }, 200);

        // 2. MARKDOWN (.md) EXPORT
        } else if (exportFormat === 'md') {
          let md = `---
title: "NIRDESHA Study Dossier - ${activeNb.name}"
officer: "S. K. Raman (JSO)"
roll: "SSS-2024-8891"
cadre: "Subordinate Statistical Service (SSS Cadre), NSSO FOD"
export_date: "${new Date().toISOString()}"
total_notes: ${targetNotes.length}
copyright: "NIRDESHA © 2026 MoSPI Government of India - Confidential Cadre Revision Material"
---

# NIRDESHA CADRE STUDY DOSSIER: ${activeNb.name.toUpperCase()}
**Trainee Officer:** S. K. Raman (JSO) | **Roll:** SSS-2024-8891 | **Date:** ${new Date().toLocaleDateString()}
*NIRDESHA © 2026 MoSPI Government of India - For Official Cadre Revision Only*

================================================================================

`;

          targetNotes.forEach((note, idx) => {
            const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleString() : 'N/A';
            md += `## ${idx + 1}. ${note.isPinned ? '[★ PINNED HIGHLIGHT] ' : ''}${note.title || 'Study Note'}\n`;
            md += `- **Date:** ${dateStr}\n`;
            md += `- **Source:** ${note.source || 'AI Study Mentor'}\n`;
            md += `\n${note.text || note.html || ''}\n\n---\n\n`;
          });

          triggerDownload(md, `${fileNameBase}.md`, 'text/markdown;charset=utf-8');

        // 3. WORD / RICH HTML (.doc) EXPORT
        } else if (exportFormat === 'docx') {
          let docHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>NIRDESHA Study Dossier - ${escapeHtml(activeNb.name)}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; margin: 2rem; color: #0f172a; }
  h1 { color: #002b49; border-bottom: 2px solid #ea580c; padding-bottom: 5px; }
  .note-box { border: 1px solid #cbd5e1; padding: 12px; margin-bottom: 15px; border-radius: 4px; }
  .pinned { border-left: 4px solid #ea580c; }
  .meta { font-size: 0.8rem; color: #64748b; margin-bottom: 8px; }
  .watermark { text-align: center; color: #94a3b8; font-size: 0.75rem; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
</style>
</head>
<body>
<h1>NIRDESHA CADRE STUDY DOSSIER: ${escapeHtml(activeNb.name)}</h1>
<p><strong>Officer:</strong> S. K. Raman (JSO) | <strong>Roll:</strong> SSS-2024-8891 | <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<hr>
`;
          targetNotes.forEach((note, idx) => {
            const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleString() : 'N/A';
            docHtml += `
              <div class="note-box ${note.isPinned ? 'pinned' : ''}">
                <h3>${idx + 1}. ${note.isPinned ? '[★ PINNED] ' : ''}${escapeHtml(note.title || 'Study Note')}</h3>
                <div class="meta">Saved: ${dateStr} • Source: ${escapeHtml(note.source || 'AI Study Mentor')}</div>
                <div>${note.html || note.text || ''}</div>
              </div>
            `;
          });
          docHtml += `
<div class="watermark">NIRDESHA © 2026 • MoSPI Cadre Training Division • Confidential Study Material</div>
</body>
</html>`;
          triggerDownload(docHtml, `${fileNameBase}.doc`, 'application/msword;charset=utf-8');

        // 4. JSON EXPORT
        } else if (exportFormat === 'json') {
          const exportData = {
            metadata: {
              system: "NIRDESHA",
              copyright: "NIRDESHA © 2026 MoSPI Government of India",
              officer: "S. K. Raman",
              role: "Junior Statistical Officer (JSO)",
              cadre: "Subordinate Statistical Service (SSS Cadre)",
              notebook: activeNb.name,
              exportDate: new Date().toISOString(),
              totalNotes: targetNotes.length
            },
            notes: targetNotes
          };
          triggerDownload(JSON.stringify(exportData, null, 2), `${fileNameBase}.json`, 'application/json;charset=utf-8');

        // 5. PLAIN TEXT (.txt) EXPORT
        } else if (exportFormat === 'txt') {
          let txt = `NIRDESHA STATISTICAL CADRE STUDY DOSSIER: ${activeNb.name.toUpperCase()}\n`;
          txt += `Officer: S. K. Raman (JSO) | Roll: SSS-2024-8891 | Division: NSSO FOD\n`;
          txt += `Export Date: ${new Date().toLocaleString()}\n`;
          txt += `NIRDESHA © 2026 MoSPI Government of India - Confidential Cadre Revision Material\n`;
          txt += `================================================================================\n\n`;

          targetNotes.forEach((note, idx) => {
            const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleString() : 'N/A';
            txt += `[${idx + 1}] ${note.isPinned ? '★ PINNED HIGHLIGHT: ' : ''}${note.title || 'Study Note'}\n`;
            txt += `Date: ${dateStr} | Source: ${note.source || 'AI Study Mentor'}\n`;
            txt += `--------------------------------------------------------------------------------\n`;
            txt += `${note.text || (note.html ? note.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '')}\n\n\n`;
          });

          triggerDownload(txt, `${fileNameBase}.txt`, 'text/plain;charset=utf-8');
        }
      });
    }

    // ========================================================================
    // RECYCLE NOTES (LAST 10 DELETED SNIPPETS & WHOLE CHATS)
    // ========================================================================
    const btnViewRecycle = document.getElementById('btn-view-recycle-bin');
    const recycleView = document.getElementById('recycle-bin-view');
    const normalToolbar = document.getElementById('notes-toolbar-normal');
    const btnCloseRecycle = document.getElementById('btn-close-recycle-bin');
    const btnEmptyRecycle = document.getElementById('btn-empty-recycle-bin');
    const recycleGridEl = document.getElementById('recycle-notes-grid');
    const recycleCountBadge = document.getElementById('recycle-notes-count');

    function getRecycledNotes() {
      try {
        const saved = localStorage.getItem('nirdesha_recycled_notes');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
      return [
        {
          id: 'recycle_demo_1',
          title: 'Draft note on CPI urban cloth basket weights (Old Base 2012)',
          text: 'Old reference weights for sub-group 3 (Clothing and Footwear) prior to recent splicing revision.',
          tags: ['Draft', 'CPI', 'Deprecated'],
          deletedAt: Date.now() - 1000 * 60 * 60 * 36,
          originalNotebookId: 'nb_2'
        },
        {
          id: 'recycle_demo_2',
          title: 'Temporary scratch note on NSSO FOD inspector travel allowance schedule',
          text: 'Field mileage allowance calculation notes for remote village enumeration blocks.',
          tags: ['Scratch', 'Travel', 'Admin'],
          deletedAt: Date.now() - 1000 * 60 * 60 * 18,
          originalNotebookId: 'nb_1'
        }
      ];
    }

    function saveRecycledNotes(list) {
      // Strictly maintain at most 10 deleted notes!
      if (list.length > 10) list = list.slice(0, 10);
      try {
        localStorage.setItem('nirdesha_recycled_notes', JSON.stringify(list));
      } catch (e) {}
      updateRecycleCount();
    }

    function updateRecycleCount() {
      const list = getRecycledNotes();
      if (recycleCountBadge) {
        recycleCountBadge.textContent = list.length;
      }
    }

    function moveToRecycleNotes(note) {
      const list = getRecycledNotes();
      const activeNb = getActiveNotebook();
      const recycledItem = {
        id: note.id || ('rec_' + Date.now()),
        notebookId: note.notebookId || (activeNb ? activeNb.id : 'default'),
        notebookName: activeNb ? activeNb.name : 'Study Notebook',
        title: note.title || 'Saved Note',
        html: note.html || '',
        text: note.text || '',
        createdAt: note.createdAt || Date.now(),
        deletedAt: Date.now()
      };
      list.unshift(recycledItem);
      saveRecycledNotes(list);
    }

    function showRecycleBin() {
      if (normalToolbar) normalToolbar.style.display = 'none';
      if (notesGridEl) notesGridEl.style.display = 'none';
      if (recycleView) recycleView.style.display = 'flex';
      renderRecycleNotesGrid();
    }

    function hideRecycleBin() {
      if (recycleView) recycleView.style.display = 'none';
      if (normalToolbar) normalToolbar.style.display = 'flex';
      if (notesGridEl) notesGridEl.style.display = 'grid';
      renderNotesUI();
    }

    function renderRecycleNotesGrid() {
      if (!recycleGridEl) return;
      recycleGridEl.innerHTML = '';
      updateRecycleCount();

      const list = getRecycledNotes();
      if (list.length === 0) {
        recycleGridEl.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: #fffafa; border: 1.5px dashed #fca5a5; border-radius: 6px;">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #991b1b;"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#991b1b" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></div>
            <h4 style="margin: 0 0 0.35rem 0; font-weight: 800; color: #991b1b;">Recycle Bin is Empty</h4>
            <p style="margin: 0; font-size: 0.82rem; color: #64748b;">
              Deleted notes and saved chat sessions will appear here (retains up to 10 latest deleted items).
            </p>
          </div>
        `;
        return;
      }

      list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'recycle-note-card';
        const dateStr = new Date(item.deletedAt || Date.now()).toLocaleDateString('en-GB', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        card.innerHTML = `
          <div>
            <div class="recycle-card-meta">
              <span>From: ${escapeHtml(item.notebookName || 'Notebook')}</span>
              <span>Deleted: ${dateStr}</span>
            </div>
            <h4 class="recycle-card-title">${escapeHtml(item.title || 'Saved Note')}</h4>
            <div class="recycle-card-snippet">${item.html || item.text || ''}</div>
          </div>
          <div class="recycle-card-actions">
            <button type="button" class="btn-restore-note">↺ Restore Note</button>
            <button type="button" class="btn-purge-note">✕ Delete Forever</button>
          </div>
        `;

        // Restore handler
        card.querySelector('.btn-restore-note').addEventListener('click', () => {
          const activeNb = getActiveNotebook();
          notesState.notes.unshift({
            id: item.id || ('note_' + Date.now()),
            notebookId: activeNb ? activeNb.id : 'default',
            title: item.title,
            html: item.html,
            text: item.text,
            createdAt: item.createdAt || Date.now(),
            isPinned: false
          });
          persistNotesData();

          const updatedList = getRecycledNotes().filter(r => r.id !== item.id);
          saveRecycledNotes(updatedList);
          renderRecycleNotesGrid();
          updateRecycleCount();
        });

        // Purge handler
        card.querySelector('.btn-purge-note').addEventListener('click', () => {
          if (confirm('Permanently delete this note? It cannot be recovered.')) {
            const updatedList = getRecycledNotes().filter(r => r.id !== item.id);
            saveRecycledNotes(updatedList);
            renderRecycleNotesGrid();
            updateRecycleCount();
          }
        });

        recycleGridEl.appendChild(card);
      });
    }

    if (btnViewRecycle) btnViewRecycle.addEventListener('click', showRecycleBin);
    if (btnCloseRecycle) btnCloseRecycle.addEventListener('click', hideRecycleBin);
    if (btnEmptyRecycle) {
      btnEmptyRecycle.addEventListener('click', () => {
        if (confirm('Empty entire Recycle Bin? All deleted notes will be permanently purged.')) {
          saveRecycledNotes([]);
          renderRecycleNotesGrid();
          updateRecycleCount();
        }
      });
    }

    updateRecycleCount();

    window.NirdeshaNotes = {
      moveToRecycleNotes: moveToRecycleNotes,
      saveSnippet: function({ title, html, text, source }) {
        const activeNb = getActiveNotebook();
        const newNote = {
          id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          notebookId: activeNb.id,
          title: title || 'Study Note Snippet',
          html: html || '',
          text: text || '',
          source: source || 'AI Study Mentor',
          isPinned: false,
          createdAt: Date.now()
        };
        notesState.notes.unshift(newNote);
        persistNotesData();
        renderNotesUI();
      }
    };

    // ----------------------------------------------------------------------
    // NOTEBOOK FLASHCARDS GENERATION MODAL
    // ----------------------------------------------------------------------
    const btnGenNbFlashcards = document.getElementById('btn-gen-notebook-flashcards');
    const genModal = document.getElementById('generate-flashcards-modal');
    const genModalClose = document.getElementById('btn-close-flashcard-modal');
    const genModalCancel = document.getElementById('btn-cancel-flashcard-modal');
    const genModalConfirm = document.getElementById('btn-confirm-generate-flashcards');
    const genModalNbName = document.getElementById('flashcard-modal-notebook-name');
    const genModalScopeAll = document.getElementById('scope-all-notes');
    const genModalScopeSelected = document.getElementById('scope-selected-notes');
    const genModalChecklist = document.getElementById('flashcard-notes-checklist');
    const genModalCount = document.getElementById('flashcard-modal-selection-count');

    function openFlashcardGenModal() {
      if (!genModal) return;
      const activeNb = getActiveNotebook();
      const notesInNb = notesState.notes.filter(n => n.notebookId === activeNb.id);

      if (genModalNbName) genModalNbName.textContent = activeNb.name;
      if (genModalScopeAll) genModalScopeAll.checked = true;

      renderFlashcardChecklist(notesInNb);
      updateFlashcardSelectionCount(notesInNb);
      genModal.style.display = 'flex';
    }

    function closeFlashcardGenModal() {
      if (genModal) genModal.style.display = 'none';
    }

    function renderFlashcardChecklist(notesInNb) {
      if (!genModalChecklist) return;
      genModalChecklist.innerHTML = '';

      if (notesInNb.length === 0) {
        genModalChecklist.innerHTML = '<div style="font-size:0.8rem; color:#64748b; padding:0.5rem;">No notes in this notebook yet to convert into flashcards.</div>';
        return;
      }

      notesInNb.forEach((note, idx) => {
        const row = document.createElement('label');
        row.style.cssText = 'display:flex; align-items:center; gap:0.5rem; font-size:0.82rem; color:#0f172a; padding:0.35rem 0.4rem; border-radius:4px; cursor:pointer; transition:background 0.12s ease;';
        row.addEventListener('mouseenter', () => row.style.background = '#f1f5f9');
        row.addEventListener('mouseleave', () => row.style.background = 'transparent');

        row.innerHTML = `
          <input type="checkbox" class="chk-flashcard-note" data-note-id="${note.id}" checked style="accent-color:#ea580c; width:15px; height:15px;">
          <span style="font-weight:700; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(note.title || 'Note')}">
            ${idx + 1}. ${escapeHtml(note.title || 'Untitled Note')}
          </span>
          <span style="font-size:0.68rem; color:#64748b; background:#f1f5f9; padding:2px 6px; border-radius:3px;">
            ${(note.tags && note.tags[0]) || 'Revision'}
          </span>
        `;
        genModalChecklist.appendChild(row);
      });

      genModalChecklist.querySelectorAll('.chk-flashcard-note').forEach(chk => {
        chk.addEventListener('change', () => {
          updateFlashcardSelectionCount(notesInNb);
        });
      });
    }

    function updateFlashcardSelectionCount(notesInNb) {
      if (!genModalCount) return;
      const checkedBoxes = genModalChecklist ? genModalChecklist.querySelectorAll('.chk-flashcard-note:checked') : [];
      genModalCount.textContent = `${checkedBoxes.length} of ${notesInNb.length} Notes Selected`;
    }

    if (btnGenNbFlashcards) {
      btnGenNbFlashcards.addEventListener('click', openFlashcardGenModal);
    }
    if (genModalClose) genModalClose.addEventListener('click', closeFlashcardGenModal);
    if (genModalCancel) genModalCancel.addEventListener('click', closeFlashcardGenModal);

    if (genModal) {
      genModal.addEventListener('click', (e) => {
        if (e.target === genModal) closeFlashcardGenModal();
      });
    }

    if (genModalScopeAll && genModalScopeSelected) {
      genModalScopeAll.addEventListener('change', () => {
        if (genModalScopeAll.checked && genModalChecklist) {
          genModalChecklist.querySelectorAll('.chk-flashcard-note').forEach(c => c.checked = true);
          const activeNb = getActiveNotebook();
          const notesInNb = notesState.notes.filter(n => n.notebookId === activeNb.id);
          updateFlashcardSelectionCount(notesInNb);
        }
      });
    }

    if (genModalConfirm) {
      genModalConfirm.addEventListener('click', () => {
        const activeNb = getActiveNotebook();
        const notesInNb = notesState.notes.filter(n => n.notebookId === activeNb.id);

        let selectedNotes = [];
        if (genModalScopeAll && genModalScopeAll.checked) {
          selectedNotes = notesInNb;
        } else {
          const checkedIds = new Set(
            Array.from(genModalChecklist.querySelectorAll('.chk-flashcard-note:checked'))
              .map(c => c.getAttribute('data-note-id'))
          );
          selectedNotes = notesInNb.filter(n => checkedIds.has(n.id));
        }

        if (selectedNotes.length === 0) {
          alert('Please select at least one note to generate flashcards.');
          return;
        }

        const generatedCards = selectedNotes.map(n => extractRevisionFlashcard(n, activeNb.name));
        if (typeof window.addFlashcardsBatchToRevisionDeck === 'function') {
          window.addFlashcardsBatchToRevisionDeck(generatedCards);
        }

        closeFlashcardGenModal();
        showNirdeshaToast(`✓ ${generatedCards.length} Revision Flashcard${generatedCards.length > 1 ? 's' : ''} generated from "${escapeHtml(activeNb.name)}"! <a href="#revision-cards" class="toast-tab-link" style="color:#fdba74;text-decoration:underline;font-weight:700;margin-left:6px;">View in Revision Cards →</a>`);
      });
    }

    renderNotesUI();
  }

  initNotesEngine();

  // ==========================================================================
  // AI STUDY MENTOR PERSONALIZATION SETTINGS ENGINE
  // ==========================================================================
  const AI_PERSONA_STORAGE_KEY = 'nirdesha_ai_persona_settings';
  const DEFAULT_AI_PERSONA = {
    format: 'detailed',       // 'detailed' | 'bullets' | 'numbered' | 'table' | 'notes'
    length: 'standard',       // 'concise' | 'standard' | 'comprehensive'
    tone: 'mentor',           // 'mentor' | 'formal' | 'direct' | 'simplified'
    includeMath: true,
    includeFieldExamples: true,
    includeExamTips: true
  };

  function getAiPersonalizationSettings() {
    try {
      const saved = localStorage.getItem(AI_PERSONA_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_AI_PERSONA, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return { ...DEFAULT_AI_PERSONA };
  }

  function saveAiPersonalizationSettings(settings) {
    try {
      localStorage.setItem(AI_PERSONA_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}
  }

  function initAiPersonalizationEngine() {
    const btnOpenPersona = document.getElementById('btn-personalize-mentor');
    const modal = document.getElementById('ai-persona-modal');
    const btnClose = document.getElementById('btn-close-persona-modal');
    const btnSave = document.getElementById('btn-save-persona');
    const btnReset = document.getElementById('btn-reset-persona');
    if (!btnOpenPersona || !modal) return;

    let currentSettings = getAiPersonalizationSettings();

    function updateModalUI() {
      // 1. Format options
      document.querySelectorAll('#persona-format-options .persona-chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-format') === currentSettings.format);
      });

      // 2. Length options
      document.querySelectorAll('#persona-length-options .persona-chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-length') === currentSettings.length);
      });

      // 3. Tone options
      document.querySelectorAll('#persona-tone-options .persona-chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tone') === currentSettings.tone);
      });

      // 4. Checkboxes
      const chkMath = document.getElementById('persona-toggle-math');
      const chkNss = document.getElementById('persona-toggle-nss');
      const chkExam = document.getElementById('persona-toggle-exam');
      if (chkMath) chkMath.checked = !!currentSettings.includeMath;
      if (chkNss) chkNss.checked = !!currentSettings.includeFieldExamples;
      if (chkExam) chkExam.checked = !!currentSettings.includeExamTips;
    }

    let originalPersonaSnapshot = '';
    function openPersonaModal() {
      currentSettings = getAiPersonalizationSettings();
      originalPersonaSnapshot = JSON.stringify(currentSettings);
      updateModalUI();
      modal.style.display = 'flex';
    }

    function closePersonaModal() {
      if (originalPersonaSnapshot && JSON.stringify(currentSettings) !== originalPersonaSnapshot) {
        if (!confirm("You have unsaved AI Study Mentor preference changes. Discard changes and exit?")) {
          return;
        }
        currentSettings = JSON.parse(originalPersonaSnapshot);
        updateModalUI();
      }
      modal.style.display = 'none';
    }

    btnOpenPersona.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPersonaModal();
    });

    if (btnClose) btnClose.addEventListener('click', closePersonaModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePersonaModal();
    });

    // Chip selections
    document.querySelectorAll('#persona-format-options .persona-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSettings.format = btn.getAttribute('data-format');
        updateModalUI();
      });
    });

    document.querySelectorAll('#persona-length-options .persona-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSettings.length = btn.getAttribute('data-length');
        updateModalUI();
      });
    });

    document.querySelectorAll('#persona-tone-options .persona-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSettings.tone = btn.getAttribute('data-tone');
        updateModalUI();
      });
    });

    // Save button
    if (btnSave) {
      btnSave.addEventListener('click', (e) => {
        e.preventDefault();
        const chkMath = document.getElementById('persona-toggle-math');
        const chkNss = document.getElementById('persona-toggle-nss');
        const chkExam = document.getElementById('persona-toggle-exam');
        currentSettings.includeMath = chkMath ? chkMath.checked : true;
        currentSettings.includeFieldExamples = chkNss ? chkNss.checked : true;
        currentSettings.includeExamTips = chkExam ? chkExam.checked : true;

        saveAiPersonalizationSettings(currentSettings);
        btnSave.textContent = 'Saved Preferences!';
        setTimeout(() => {
          btnSave.textContent = 'Apply & Save Preferences';
          closePersonaModal();
        }, 600);
      });
    }

    // Reset button
    if (btnReset) {
      btnReset.addEventListener('click', (e) => {
        e.preventDefault();
        currentSettings = { ...DEFAULT_AI_PERSONA };
        saveAiPersonalizationSettings(currentSettings);
        updateModalUI();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        closePersonaModal();
      }
    });
  }

  initAiPersonalizationEngine();

  // ==========================================================================
  // PAST 10 CONVERSATIONS DRAWER ENGINE (CHATGPT STYLE) FOR AI STUDY MENTOR
  // ==========================================================================
  function initMentorHistoryEngine() {
    const btnHistoryToggle = document.getElementById('btn-mentor-history-toggle');
    const drawer = document.getElementById('mentor-history-drawer');
    const btnCloseDrawer = document.getElementById('btn-close-mentor-history');
    const btnNewConvo = document.getElementById('btn-new-mentor-convo');
    const historyList = document.getElementById('history-convos-list');
    const countBadge = document.getElementById('history-convo-count');
    const reminderBanner = document.getElementById('mentor-save-reminder-banner');
    const btnReminderSave = document.getElementById('btn-reminder-save-notes');
    const btnReminderDismiss = document.getElementById('btn-reminder-dismiss');

    let mentorConvos = [];
    let activeConvoId = null;

    try {
      const saved = localStorage.getItem('nirdesha_mentor_convos');
      if (saved) {
        mentorConvos = JSON.parse(saved);
        if (!Array.isArray(mentorConvos)) mentorConvos = [];
      }
    } catch (e) {
      mentorConvos = [];
    }

    if (mentorConvos.length === 0) {
      mentorConvos = [
        {
          id: 'convo_demo_1',
          tag: 'Horvitz-Thompson Variance Estimator Proof & SYG Formulation',
          firstQuestion: 'Can you explain why the Sen-Yates-Grundy variance estimator avoids negative values in unequal probability sampling?',
          updatedAt: Date.now() - 1000 * 60 * 60 * 2,
          qaPairsCount: 4,
          messages: [
            { sender: 'user', text: 'Can you explain why the Sen-Yates-Grundy variance estimator avoids negative values in unequal probability sampling?' },
            { sender: 'bot', text: 'The Sen-Yates-Grundy (SYG) variance estimator is an algebraic rearrangement of the Horvitz-Thompson variance: \\( V_{SYG}(\\hat{Y}_{HT}) = -\\frac{1}{2} \\sum_{i=1}^n \\sum_{j \\neq i}^n \\frac{\\pi_{ij} - \\pi_i \\pi_j}{\\pi_{ij}} \\left( \\frac{y_i}{\\pi_i} - \\frac{y_j}{\\pi_j} \\right)^2 \\). When sample size n is fixed and \\(\pi_{ij} \\le \\pi_i \\pi_j\\), the multiplier is strictly non-negative, completely eliminating negative estimates!' }
          ]
        },
        {
          id: 'convo_demo_2',
          tag: 'GDP Deflator Splicing Across 2011-12 and 2004-05 Base Years',
          firstQuestion: 'How does the CSO link two historical series of GDP deflators with different base years?',
          updatedAt: Date.now() - 1000 * 60 * 60 * 22,
          qaPairsCount: 3,
          messages: [
            { sender: 'user', text: 'How does the CSO link two historical series of GDP deflators with different base years?' },
            { sender: 'bot', text: 'Splicing uses the common overlapping period linking factor: \\( \\text{Splicing Factor} = \\frac{\\text{Index in new base year}}{\\text{Index in old base year}} \\). Historical values are multiplied by this ratio to establish unbroken macroeconomic time series.' }
          ]
        },
        {
          id: 'convo_demo_3',
          tag: 'CAPI Schedule 10.2 Field Verification & Geo-Fencing Rules',
          firstQuestion: 'What are the field inspection criteria for GPS tolerance in rural NSSO survey listing?',
          updatedAt: Date.now() - 1000 * 60 * 60 * 48,
          qaPairsCount: 2,
          messages: [
            { sender: 'user', text: 'What are the field inspection criteria for GPS tolerance in rural NSSO survey listing?' },
            { sender: 'bot', text: 'In CAPI tablet execution, enumerator GPS fix must fall within a strict 50-meter radius of the census enumeration block centroid. Discrepancies beyond 50m trigger an administrative flag for supervisory inspection.' }
          ]
        },
        {
          id: 'convo_demo_4',
          tag: 'DPDP Act 2023 Microdata Masking & K-Anonymity Rules',
          firstQuestion: 'What anonymization threshold applies to socio-economic public release data under Section 8?',
          updatedAt: Date.now() - 1000 * 60 * 60 * 96,
          qaPairsCount: 5,
          messages: [
            { sender: 'user', text: 'What anonymization threshold applies to socio-economic public release data under Section 8?' },
            { sender: 'bot', text: 'The MoSPI data governance protocol mandates k-anonymity (k >= 5) and suppression of microdata records where district-level cell frequency is less than 3 to eliminate deductive disclosure risks.' }
          ]
        },
        {
          id: 'convo_demo_5',
          tag: 'Neyman Allocation for Multi-Stratum Village Listing Samples',
          firstQuestion: 'Derive the Neyman formula for allocating sample sizes when stratum variances differ.',
          updatedAt: Date.now() - 1000 * 60 * 60 * 140,
          qaPairsCount: 3,
          messages: [
            { sender: 'user', text: 'Derive the Neyman formula for allocating sample sizes when stratum variances differ.' },
            { sender: 'bot', text: 'Under fixed total sample size n and equal sampling costs: \\( n_h = n \\frac{N_h S_h}{\\sum N_k S_k} \\). This guarantees minimum variance of the stratified estimator.' }
          ]
        }
      ];
    }

    function saveConvos() {
      // Strictly maintain at most 10 past conversations! Oldest auto-rotate out.
      if (mentorConvos.length > 10) {
        mentorConvos = mentorConvos.slice(0, 10);
      }
      try {
        localStorage.setItem('nirdesha_mentor_convos', JSON.stringify(mentorConvos));
      } catch (e) {}
      updateCountBadge();
    }

    function updateCountBadge() {
      if (countBadge) {
        countBadge.textContent = `${mentorConvos.length}/10`;
      }
    }

    function formatRelativeTime(ts) {
      if (!ts) return 'Just now';
      const diff = Date.now() - ts;
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    }

    function renderHistoryList() {
      if (!historyList) return;
      historyList.innerHTML = '';
      updateCountBadge();

      if (mentorConvos.length === 0) {
        historyList.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem; color: #64748b; font-size: 0.8rem;">
            <div style="margin-bottom: 0.5rem;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
            <strong style="color: #002b49; display: block; margin-bottom: 4px;">No Past Conversations</strong>
            <span>Ask any question to your AI Mentor to begin recording up to 10 past sessions.</span>
          </div>
        `;
        return;
      }

      mentorConvos.forEach(convo => {
        const item = document.createElement('div');
        item.className = `history-convo-item ${convo.id === activeConvoId ? 'is-active' : ''}`;
        
        const qCount = Math.ceil((convo.messages ? convo.messages.length : 0) / 2);
        
        item.innerHTML = `
          <div class="convo-tag-title" title="${(convo.tag || 'Study Conversation').replace(/"/g, '&quot;')}">
            ${(convo.tag || 'Study Conversation').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>
          <div class="convo-meta-row">
            <span>${qCount} ${qCount === 1 ? 'Q&A' : 'Q&As'}</span>
            <span>${formatRelativeTime(convo.updatedAt || convo.createdAt)}</span>
          </div>
          <button type="button" class="btn-del-convo" title="Delete conversation" aria-label="Delete conversation">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        `;

        // Click on convo card to restore
        item.addEventListener('click', () => {
          restoreConvo(convo.id);
        });

        // Click delete button
        const delBtn = item.querySelector('.btn-del-convo');
        if (delBtn) {
          delBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            mentorConvos = mentorConvos.filter(c => c.id !== convo.id);
            saveConvos();
            if (activeConvoId === convo.id) {
              startNewConvo();
            } else {
              renderHistoryList();
            }
          });
        }

        historyList.appendChild(item);
      });
    }

    function restoreConvo(convoId) {
      const convo = mentorConvos.find(c => c.id === convoId);
      if (!convo || !traineeChatLog) return;

      activeConvoId = convo.id;
      traineeChatLog.innerHTML = '';

      if (convo.messages && Array.isArray(convo.messages)) {
        convo.messages.forEach(msg => {
          const bubble = document.createElement('div');
          bubble.className = `chat-bubble ${msg.sender}`;
          if (msg.sender === 'user') {
            bubble.textContent = msg.text;
          } else {
            bubble.innerHTML = msg.html || (window.NirdeshaFormatter ? window.NirdeshaFormatter.format(msg.text) : msg.text.replace(/\n/g, '<br>'));
            appendResponseActions(bubble, '');
          }
          traineeChatLog.appendChild(bubble);
        });
      }

      traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
      persistTraineeChatLog();

      if (drawer) drawer.style.display = 'none';
      renderHistoryList();
    }

    function startNewConvo() {
      activeConvoId = null;
      if (traineeChatLog) {
        traineeChatLog.innerHTML = '';
        sessionStorage.removeItem('nirdesha_mentor_chat_log');
        const greeting = MENTOR_DEFAULT_GREETINGS[currentMentorLang] || MENTOR_DEFAULT_GREETINGS['English'];
        sendTraineeChatMessage(greeting, 'bot');
      }
      if (drawer) drawer.style.display = 'none';
      if (reminderBanner) reminderBanner.style.display = 'none';
      renderHistoryList();
    }

    // Exposed hook called when AI response completes
    window.recordMentorTurn = function(userQuery, botHtml, botText) {
      if (!activeConvoId) {
        activeConvoId = 'convo_' + Date.now();
      }

      let convo = mentorConvos.find(c => c.id === activeConvoId);
      if (!convo) {
        const cleanTag = userQuery.trim().replace(/\s+/g, ' ');
        const tagTitle = cleanTag.length > 44 ? cleanTag.substring(0, 44) + '...' : cleanTag;
        convo = {
          id: activeConvoId,
          tag: tagTitle,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: []
        };
        mentorConvos.unshift(convo);
      } else {
        convo.updatedAt = Date.now();
        // Move to top of stack
        mentorConvos = [convo, ...mentorConvos.filter(c => c.id !== convo.id)];
      }

      convo.messages.push({ sender: 'user', text: userQuery });
      convo.messages.push({ sender: 'bot', html: botHtml, text: botText });

      saveConvos();

      // Show reminder banner if conversation reaches 4+ messages (2+ Q&As)
      if (convo.messages.length >= 4 && reminderBanner) {
        const dismissedKey = 'nirdesha_reminder_dismissed_' + convo.id;
        if (!sessionStorage.getItem(dismissedKey)) {
          reminderBanner.style.display = 'flex';
        }
      }
    };

    // Toggle drawer
    if (btnHistoryToggle && drawer) {
      btnHistoryToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = drawer.style.display === 'flex';
        drawer.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
          renderHistoryList();
        }
      });
    }

    if (btnCloseDrawer && drawer) {
      btnCloseDrawer.addEventListener('click', () => {
        drawer.style.display = 'none';
      });
    }

    if (btnNewConvo) {
      btnNewConvo.addEventListener('click', (e) => {
        e.preventDefault();
        startNewConvo();
      });
    }

    // Save reminder banner interactions
    if (btnReminderSave) {
      btnReminderSave.addEventListener('click', (e) => {
        e.preventDefault();
        const btnSaveChat = document.getElementById('btn-save-chat-notes');
        if (btnSaveChat) btnSaveChat.click();
        if (reminderBanner) reminderBanner.style.display = 'none';
        if (activeConvoId) sessionStorage.setItem('nirdesha_reminder_dismissed_' + activeConvoId, 'true');
      });
    }

    if (btnReminderDismiss && reminderBanner) {
      btnReminderDismiss.addEventListener('click', () => {
        reminderBanner.style.display = 'none';
        if (activeConvoId) sessionStorage.setItem('nirdesha_reminder_dismissed_' + activeConvoId, 'true');
      });
    }

    updateCountBadge();
  }

  initMentorHistoryEngine();

  // ==========================================================================
  // TRAINEE NOTIFICATIONS & SMART CADRE REMINDERS ENGINE
  // ==========================================================================
  function initTraineeNotificationsEngine() {
    const notifsContainer = document.getElementById('notif-cards-list');
    const filterPillsContainer = document.getElementById('notif-filter-pills');
    const btnClearAll = document.getElementById('btn-clear-all-notifs');
    const topNotifBadge = document.getElementById('notif-badge-count');
    const sidebarNotifBadge = document.getElementById('notif-sidebar-badge');
    const btnTopNotifs = document.getElementById('btn-top-notifications');

    // Remind Modal elements
    const remindModal = document.getElementById('remind-modal');
    const btnCloseRemindModal = document.getElementById('btn-close-remind-modal');
    const btnCancelRemind = document.getElementById('btn-cancel-remind');
    const btnConfirmRemind = document.getElementById('btn-confirm-remind');
    const remindTitleEl = document.getElementById('remind-target-title');
    const remindDescEl = document.getElementById('remind-target-desc');
    const remindSpecificFields = document.getElementById('remind-specific-fields');
    const remindDailyFields = document.getElementById('remind-daily-fields');

    let currentFilter = 'all'; // 'all' | 'pinned' | 'humor' | 'reminders'
    let activeRemindNotifId = null;
    let currentRemindType = 'specific'; // 'specific' | 'daily'

    const DEFAULT_NOTIFICATIONS = [
      {
        id: 'notif_1',
        type: 'course',
        category: 'Course Inactivity',
        icon: '📖',
        title: 'Course Ghosting Alert: Survey Sampling Theory',
        message: "Legend says someone started 'Survey Sampling Theory & Estimation' and ghosted it at 40%... Was that you, Officer Raman? Module 3 is feeling lonely — let's knock out 10 minutes today!",
        createdAt: Date.now() - 1000 * 60 * 60 * 2,
        isPinned: true,
        humor: true
      },
      {
        id: 'notif_2',
        type: 'gap',
        category: 'Cadre Benchmark',
        icon: '⚠️',
        title: '17% Deflator Gap Warning: SSO Benchmark',
        message: "Officer Raman, your Macroeconomic Deflators rating sits at 1,385 Elo (68%) — exactly 17% below the 85% Senior Statistical Officer promotion benchmark. The deflators won't calculate themselves!",
        createdAt: Date.now() - 1000 * 60 * 60 * 5,
        isPinned: true,
        humor: false
      },
      {
        id: 'notif_3',
        type: 'quiz',
        category: 'Exam Drill',
        icon: '⏳',
        title: 'The SSO Promotion Committee is Watching...',
        message: "It's been 4 days since your last timed assessment. Rumor has it Paasche price indices are planning an exam ambush. Take a quick 5-minute AI Quiz to defend your honor!",
        createdAt: Date.now() - 1000 * 60 * 60 * 18,
        isPinned: false,
        humor: true
      },
      {
        id: 'notif_4',
        type: 'streak',
        category: 'Cadre Achievement',
        icon: '🔥',
        title: '14-Day Streak is Flexing!',
        message: "You're 70% toward your 20-Day Cadre Target Milestone. Only 6 days left. Don't let your streak break today — keep the statistical fire burning!",
        createdAt: Date.now() - 1000 * 60 * 60 * 26,
        isPinned: false,
        humor: false
      },
      {
        id: 'notif_5',
        type: 'ai_mentor',
        category: 'Self-Study Coach',
        icon: '🤖',
        title: 'Horvitz-Thompson Misses You!',
        message: "Your AI Study Mentor has been waiting with a fresh batch of unequal probability sampling proofs. Ask a quick study question or review CPI weight formulas today!",
        createdAt: Date.now() - 1000 * 60 * 60 * 48,
        isPinned: false,
        humor: true
      },
      {
        id: 'notif_6',
        type: 'field',
        category: 'NSSO Guidelines',
        icon: '📋',
        title: 'NSSO FOD CAPI Multiplier Update',
        message: "Reminder to review Section 8 DPDP Act anonymization safeguards for multi-stage household schedule uploads before next week's district audit.",
        createdAt: Date.now() - 1000 * 60 * 60 * 72,
        isPinned: false,
        humor: false
      },
      {
        id: 'notif_7',
        type: 'quiz',
        category: 'Skill Decay Warning',
        icon: '🕸️',
        title: 'Mock Assessment Cobwebs Detected',
        message: "Zero assessments taken in the last 6 days! The Paasche-Laspeyres price elasticity index requires your immediate attention to prevent rating decay.",
        createdAt: Date.now() - 1000 * 60 * 60 * 85,
        isPinned: false,
        humor: true
      },
      {
        id: 'notif_8',
        type: 'course',
        category: 'Incomplete Lab',
        icon: '⚡',
        title: 'Unfinished Symphony: CAPI Tablet Field Automation',
        message: "Officer Raman, you left the 'CAPI Offline Multi-Stage Synchronization' lab halfway through. Two quick steps remain to unlock full competency certification!",
        createdAt: Date.now() - 1000 * 60 * 60 * 96,
        isPinned: false,
        humor: true
      },
      {
        id: 'notif_9',
        type: 'achievement',
        category: 'Milestone Unlocked',
        icon: '🎖️',
        title: 'Cadre Level 3 Achieved: Sampling Prodigy',
        message: "Congratulations! You have completed 12 hours of field sampling & variance modeling modules. Official MoSPI competency recognition logged in your dossier.",
        createdAt: Date.now() - 1000 * 60 * 60 * 110,
        isPinned: false,
        humor: false
      },
      {
        id: 'notif_10',
        type: 'ai_mentor',
        category: 'Concept Challenge',
        icon: '🧠',
        title: 'Paasche vs. Laspeyres Showdown',
        message: "Can you derive why the Laspeyres index tends to overstate inflation while Paasche understates it? Ask your AI Mentor to challenge your derivation right now!",
        createdAt: Date.now() - 1000 * 60 * 60 * 125,
        isPinned: false,
        humor: true
      },
      {
        id: 'notif_11',
        type: 'field',
        category: 'Field Operations',
        icon: '📍',
        title: 'All-India Household Round 81 Upload Ready',
        message: "Sample enumeration block rosters for the 81st NSS round have been loaded into the eLab practice database. Validate multipliers before district deployment.",
        createdAt: Date.now() - 1000 * 60 * 60 * 140,
        isPinned: false,
        humor: false
      },
      {
        id: 'notif_12',
        type: 'gap',
        category: 'Accuracy Recalibration',
        icon: '🎯',
        title: 'Multiplier Variance Dip: Attention Required',
        message: "Your last 2 quiz sessions encountered variance traps in Two-Stage Stratified Sampling. Review the second-stage expansion multiplier before your SSO exam!",
        createdAt: Date.now() - 1000 * 60 * 60 * 160,
        isPinned: false,
        humor: false
      }
    ];

    // Dynamic pool for generating infinite test demo notifications on demand
    const DYNAMIC_DEMO_POOL = [
      {
        type: 'humor',
        category: 'Chai Break Wisdom',
        icon: '☕',
        title: 'Statistical Chai Break Trivia',
        message: "Did you know? P. C. Mahalanobis used to say: 'Statistics is the key technology of the modern world.' Time to honor the Father of Indian Statistics with 5 mins of practice!",
        humor: true
      },
      {
        type: 'gap',
        category: 'Cadre Alert',
        icon: '🚨',
        title: 'Multi-Stage Stratification Trap Detected',
        message: "Watch out, Officer Raman! Non-sampling error tolerances in Schedule 10.2 were exceeded in your last mock simulation. Recalibrate your weights!",
        humor: true
      },
      {
        type: 'quiz',
        category: 'Speed Drill',
        icon: '⚡',
        title: 'Lightning AI Quiz: 3 Questions in 3 Minutes',
        message: "Test your immediate recall on GDP Deflator formulas, Fisher's Ideal Index, and SRSWOR variance. Ready when you are!",
        humor: false
      },
      {
        type: 'ai_mentor',
        category: 'Study Nudge',
        icon: '📚',
        title: 'AI Study Mentor is Ready for Your Questions',
        message: "Got questions on Base Year Splicing or Consumer Food Price Index (CFPI) weights? Your AI Study Mentor is online with LaTeX math support!",
        humor: true
      },
      {
        type: 'achievement',
        category: 'Rank Surge',
        icon: '🚀',
        title: 'Leaderboard Climb: Top 5% in FOD Division',
        message: "Your recent score on Multi-Stage Probability Sampling pushed your ranking into the 95th percentile among JSO candidates!",
        humor: false
      }
    ];
    let demoPoolIndex = 0;

    let notifications = [];
    try {
      const saved = localStorage.getItem('nirdesha_trainee_notifications');
      if (saved) {
        notifications = JSON.parse(saved);
        if (!Array.isArray(notifications) || notifications.length < 12) {
          notifications = DEFAULT_NOTIFICATIONS;
          localStorage.setItem('nirdesha_trainee_notifications', JSON.stringify(notifications));
        }
      } else {
        notifications = DEFAULT_NOTIFICATIONS;
      }
    } catch (e) {
      notifications = DEFAULT_NOTIFICATIONS;
    }

    function saveNotifications() {
      try {
        localStorage.setItem('nirdesha_trainee_notifications', JSON.stringify(notifications));
      } catch (e) {}
      updateBadges();
    }

    function updateBadges() {
      const unreadCount = notifications.length;
      if (topNotifBadge) {
        topNotifBadge.textContent = unreadCount;
        topNotifBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
      }
      if (sidebarNotifBadge) {
        sidebarNotifBadge.textContent = unreadCount;
        sidebarNotifBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
      }

      // Update pill count labels
      const countAll = document.getElementById('count-notif-all');
      const countPinned = document.getElementById('count-notif-pinned');
      const countHumor = document.getElementById('count-notif-humor');
      const countReminders = document.getElementById('count-notif-reminders');

      if (countAll) countAll.textContent = notifications.length;
      if (countPinned) countPinned.textContent = notifications.filter(n => n.isPinned).length;
      if (countHumor) countHumor.textContent = notifications.filter(n => n.humor).length;
      if (countReminders) countReminders.textContent = notifications.filter(n => n.scheduledReminder).length;
    }

    function formatRelativeTime(ts) {
      if (!ts) return 'Earlier';
      const diff = Date.now() - ts;
      const mins = Math.floor(diff / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    }

    function renderNotifications() {
      if (!notifsContainer) return;
      notifsContainer.innerHTML = '';
      updateBadges();

      // Filter
      let list = [...notifications];
      if (currentFilter === 'pinned') {
        list = list.filter(n => n.isPinned);
      } else if (currentFilter === 'humor') {
        list = list.filter(n => n.humor);
      } else if (currentFilter === 'reminders') {
        list = list.filter(n => n.scheduledReminder);
      }

      // Sort: pinned first, then by createdAt desc
      list.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      if (list.length === 0) {
        notifsContainer.innerHTML = `
          <div style="text-align: center; padding: 3.5rem 1.5rem; background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 6px;">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🎉</div>
            <h4 style="margin: 0 0 0.4rem 0; font-weight: 800; color: #002b49;">All Caught Up!</h4>
            <p style="margin: 0; font-size: 0.82rem; color: #64748b;">
              No alerts matching the selected filter. Stay disciplined with your daily statistical studies!
            </p>
          </div>
        `;
        return;
      }

      list.forEach(notif => {
        const card = document.createElement('div');
        card.className = `notif-card ${notif.isPinned ? 'is-pinned' : ''}`;
        card.setAttribute('data-notif-id', notif.id);

        let scheduledBadgeHtml = '';
        if (notif.scheduledReminder) {
          const rem = notif.scheduledReminder;
          const text = rem.type === 'daily' 
            ? `⏰ Daily at ${rem.time}` 
            : `⏰ Scheduled: ${rem.date} at ${rem.time}`;
          scheduledBadgeHtml = `<span class="notif-scheduled-badge">${text}</span>`;
        }

        card.innerHTML = `
          <div class="notif-card-icon">${notif.icon || '🔔'}</div>
          <div class="notif-card-content">
            <div class="notif-card-top-row">
              <span class="notif-tag-badge ${notif.humor ? 'humor' : ''}">${(notif.category || 'Cadre Alert').replace(/</g, '&lt;')}</span>
            </div>
            <h4 class="notif-card-title">${(notif.title || '').replace(/</g, '&lt;')}</h4>
            <p class="notif-card-msg">${(notif.message || '').replace(/</g, '&lt;')}</p>
            <div class="notif-card-bottom">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span>${formatRelativeTime(notif.createdAt)}</span>
                ${scheduledBadgeHtml}
              </div>
              <button type="button" class="btn-notif-remind" data-tooltip="Remind Me Later" aria-label="Remind Me Later">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Remind Me Later</span>
              </button>
            </div>
          </div>

          <!-- Top-Right Corner Actions: Pin & Cross -->
          <div class="notif-corner-actions">
            <button type="button" class="btn-notif-corner btn-notif-pin ${notif.isPinned ? 'is-pinned' : ''}" data-tooltip="${notif.isPinned ? 'Unpin Alert' : 'Pin Alert'}" aria-label="Pin alert">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="${notif.isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>
            <button type="button" class="btn-notif-corner btn-notif-dismiss" data-tooltip="Clear Alert" aria-label="Dismiss alert">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        `;

        // Pin Button handler
        const pinBtn = card.querySelector('.btn-notif-pin');
        if (pinBtn) {
          pinBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            notif.isPinned = !notif.isPinned;
            saveNotifications();
            renderNotifications();
          });
        }

        // Dismiss (Cross) Button handler
        const dismissBtn = card.querySelector('.btn-notif-dismiss');
        if (dismissBtn) {
          dismissBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            card.style.transform = 'scale(0.95)';
            card.style.opacity = '0';
            setTimeout(() => {
              notifications = notifications.filter(n => n.id !== notif.id);
              saveNotifications();
              renderNotifications();
            }, 180);
          });
        }

        // Remind Me Later Button handler
        const remindBtn = card.querySelector('.btn-notif-remind');
        if (remindBtn) {
          remindBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            openRemindModal(notif);
          });
        }

        notifsContainer.appendChild(card);
      });
    }

    // Filter pills listeners
    if (filterPillsContainer) {
      filterPillsContainer.querySelectorAll('.notif-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          filterPillsContainer.querySelectorAll('.notif-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          currentFilter = pill.getAttribute('data-filter') || 'all';
          renderNotifications();
        });
      });
    }

    // Clear All Unpinned Notifications
    if (btnClearAll) {
      btnClearAll.addEventListener('click', (e) => {
        e.preventDefault();
        const pinnedOnly = notifications.filter(n => n.isPinned);
        notifications = pinnedOnly;
        saveNotifications();
        renderNotifications();
      });
    }

    // Add Demo Notification on demand
    const btnAddDemo = document.getElementById('btn-add-demo-notif');
    if (btnAddDemo) {
      btnAddDemo.addEventListener('click', (e) => {
        e.preventDefault();
        const demoTemplate = DYNAMIC_DEMO_POOL[demoPoolIndex % DYNAMIC_DEMO_POOL.length];
        demoPoolIndex++;

        const newDemoNotif = {
          id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type: demoTemplate.type,
          category: demoTemplate.category,
          icon: demoTemplate.icon,
          title: demoTemplate.title,
          message: demoTemplate.message,
          createdAt: Date.now(),
          isPinned: false,
          humor: demoTemplate.humor
        };

        notifications.unshift(newDemoNotif);
        saveNotifications();
        renderNotifications();

        // Visual flash feedback on button
        const origText = btnAddDemo.innerHTML;
        btnAddDemo.innerHTML = `<span>✓ Added Alert!</span>`;
        setTimeout(() => {
          btnAddDemo.innerHTML = origText;
        }, 1200);
      });
    }

    // Reset Demo Set to default 12 notifications
    const btnResetDemo = document.getElementById('btn-reset-demo-notifs');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', (e) => {
        e.preventDefault();
        notifications = JSON.parse(JSON.stringify(DEFAULT_NOTIFICATIONS));
        saveNotifications();
        renderNotifications();

        const origText = btnResetDemo.innerHTML;
        btnResetDemo.innerHTML = `<span>✓ Restored 12 Alerts!</span>`;
        setTimeout(() => {
          btnResetDemo.innerHTML = origText;
        }, 1400);
      });
    }

    // Topbar Notification Bell click opens Notifications View
    if (btnTopNotifs) {
      btnTopNotifs.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof switchTab === 'function') {
          switchTab('notifications');
        }
      });
    }

    // ========================================================================
    // REMIND ME LATER MODAL ENGINE
    // ========================================================================
    function openRemindModal(notif) {
      activeRemindNotifId = notif.id;
      if (!remindModal) return;

      if (remindTitleEl) remindTitleEl.textContent = notif.title;
      if (remindDescEl) remindDescEl.textContent = notif.message;

      // Set default dates
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const dateInput = document.getElementById('remind-date-input');
      if (dateInput) dateInput.value = tomorrowStr;

      const dailyStart = document.getElementById('remind-daily-start-input');
      const dailyEnd = document.getElementById('remind-daily-end-input');
      if (dailyStart) dailyStart.value = tomorrowStr;
      if (dailyEnd) dailyEnd.value = nextWeekStr;

      // Reset frequency radio
      currentRemindType = 'specific';
      document.querySelectorAll('#remind-type-options .export-scope-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-remind-type') === 'specific');
      });
      if (remindSpecificFields) remindSpecificFields.style.display = 'block';
      if (remindDailyFields) remindDailyFields.style.display = 'none';

      remindModal.style.display = 'flex';
    }

    function closeRemindModal() {
      const customNote = document.getElementById('remind-custom-note');
      if (customNote && customNote.value.trim().length > 0) {
        if (!confirm("You have an unsaved reminder note. Discard changes and exit?")) {
          return;
        }
        customNote.value = '';
      }
      if (remindModal) remindModal.style.display = 'none';
      activeRemindNotifId = null;
    }

    if (btnCloseRemindModal) btnCloseRemindModal.addEventListener('click', closeRemindModal);
    if (btnCancelRemind) btnCancelRemind.addEventListener('click', closeRemindModal);
    if (remindModal) {
      remindModal.addEventListener('click', (e) => {
        if (e.target === remindModal) closeRemindModal();
      });
    }

    // Radio selection for reminder type
    document.querySelectorAll('#remind-type-options .export-scope-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentRemindType = btn.getAttribute('data-remind-type') || 'specific';
        document.querySelectorAll('#remind-type-options .export-scope-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (currentRemindType === 'specific') {
          if (remindSpecificFields) remindSpecificFields.style.display = 'block';
          if (remindDailyFields) remindDailyFields.style.display = 'none';
        } else {
          if (remindSpecificFields) remindSpecificFields.style.display = 'none';
          if (remindDailyFields) remindDailyFields.style.display = 'block';
        }
      });
    });

    // Save scheduled reminder
    if (btnConfirmRemind) {
      btnConfirmRemind.addEventListener('click', (e) => {
        e.preventDefault();
        const notif = notifications.find(n => n.id === activeRemindNotifId);
        if (!notif) return;

        if (currentRemindType === 'specific') {
          const dateVal = document.getElementById('remind-date-input').value;
          const timeVal = document.getElementById('remind-time-input').value || '18:00';
          if (!dateVal) {
            alert('Please select a reminder date.');
            return;
          }
          notif.scheduledReminder = {
            type: 'specific',
            date: dateVal,
            time: timeVal,
            timestamp: Date.now()
          };
        } else {
          const startVal = document.getElementById('remind-daily-start-input').value;
          const endVal = document.getElementById('remind-daily-end-input').value;
          const timeVal = document.getElementById('remind-daily-time-input').value || '09:00';
          if (!startVal || !endVal) {
            alert('Please select starting and ending dates for the daily reminder.');
            return;
          }
          notif.scheduledReminder = {
            type: 'daily',
            startDate: startVal,
            endDate: endVal,
            time: timeVal,
            timestamp: Date.now()
          };
        }

        saveNotifications();
        closeRemindModal();
        renderNotifications();
      });
    }

    window.renderTraineeNotifications = renderNotifications;
    renderNotifications();
  }

  initTraineeNotificationsEngine();

  // ==========================================================================
  // CLAUDE-STYLE CUSTOM QUIZ BUILDER & PROCTORED ETHICAL EXAM ENGINE
  // ==========================================================================
  
  // Default Sample Custom Quizzes
  const DEFAULT_CUSTOM_QUIZZES = [
    {
      id: 'quiz_sampling_variance',
      title: 'Horvitz-Thompson Variance & Unequal Probability Sampling',
      topic: 'Survey Sampling Theory & Estimation',
      mode: 'Exam Prep (SSO/JSO Cadre)',
      format: 'Multiple Choice (MCQ)',
      focus: 'Numerical & Theory',
      difficulty: 'Hard (SSO Standard)',
      timerMode: 'per_question',
      questionTime: 45,
      isNew: true,
      createdAt: Date.now() - 1000 * 60 * 30,
      questions: [
        {
          id: 'q1',
          prompt: 'In Horvitz-Thompson estimation for a finite population total, under what condition is the Sen-Yates-Grundy variance estimator guaranteed to be non-negative?',
          type: 'mcq',
          options: [
            'Fixed sample size n and \(\pi_{ij} \le \pi_i \pi_j\) for all pairs (i, j)',
            'Any arbitrary sample size and \(\pi_{ij} \ge \pi_i \pi_j\)',
            'Strictly under Simple Random Sampling without Replacement',
            'When inclusion probability \(\pi_i = 1/N\) for all units'
          ],
          correct: 0,
          explanation: 'The Sen-Yates-Grundy (SYG) variance estimator is guaranteed non-negative when the sample design has a fixed sample size n and the joint inclusion probabilities satisfy \(\pi_{ij} \le \pi_i \pi_j\) for all i != j.'
        },
        {
          id: 'q2',
          prompt: 'A sample of 2 primary sampling units is selected using PPS with Hansen-Hurwitz estimator. The unit values are Y1 = 240 (p1 = 0.4) and Y2 = 180 (p2 = 0.3). What is the Hansen-Hurwitz estimate of the population total Y?',
          type: 'mcq',
          options: [
            '600',
            '580',
            '620',
            '700'
          ],
          correct: 0,
          explanation: 'Estimated total = (1/n) * sum(Yi / pi) = (1/2) * [(240/0.4) + (180/0.3)] = (1/2) * [600 + 600] = 600.'
        },
        {
          id: 'q3',
          prompt: 'Which sampling technique provides the minimum variance unbiased estimator among all linear estimators when the selection probability is proportional to unit size?',
          type: 'mcq',
          options: [
            'Midzuno-Sen Sampling Strategy',
            'Horvitz-Thompson Estimator with optimal \(\pi_i \propto Y_i\)',
            'Lahiri-Midzuno Systematic Sampling',
            'Equal Probability Cluster Sampling'
          ],
          correct: 1,
          explanation: 'If \(\pi_i\) is strictly proportional to the study variable \(Y_i\), the Horvitz-Thompson estimator achieves zero variance in total estimation.'
        },
        {
          id: 'q4',
          prompt: 'In Two-Stage Stratified Cluster Sampling, how does increasing cluster size M while keeping total sample units nM fixed affect the design effect (Deff)?',
          type: 'mcq',
          options: [
            'Deff increases due to positive intra-cluster correlation \(\rho\)',
            'Deff decreases proportionally to \(1/M\)',
            'Deff remains strictly invariant',
            'Deff drops to 0.5'
          ],
          correct: 0,
          explanation: 'Deff = 1 + (M - 1) * \rho. Since intra-cluster correlation \(\rho\) is typically positive in socio-economic surveys, larger cluster sizes increase Deff and reduce sampling efficiency.'
        },
        {
          id: 'q5',
          prompt: 'Under NSSO 80th Round CAPI guidelines, what is the statutory treatment for household records flagged with extreme multiplier weights exceeding 5 times the stratum median?',
          type: 'mcq',
          options: [
            'Mandatory district supervisor verification audit before central FOD upload',
            'Automatic deletion from the primary analytical database',
            'Downweighting by replacing with simple average of remaining units',
            'Exemption from Section 8 DPDP Act anonymization'
          ],
          correct: 0,
          explanation: 'CAPI validation rules mandate that multiplier weights exceeding 5x the stratum median require dual-tier district supervisor verification to safeguard against non-sampling typographical errors.'
        }
      ]
    },
    {
      id: 'quiz_deflators_macro',
      title: 'Paasche vs. Laspeyres & GDP Deflator Splicing',
      topic: 'National Accounts & Macroeconomic Deflators',
      mode: 'Exam Prep (SSO/JSO Cadre)',
      format: 'Mixed Format',
      focus: 'Numerical Calculation',
      difficulty: 'Hard (SSO Standard)',
      timerMode: 'per_question',
      questionTime: 45,
      isNew: true,
      createdAt: Date.now() - 1000 * 60 * 15,
      questions: [
        {
          id: 'q1',
          prompt: 'If Nominal GDP grows from Rs 100 Lakh Cr to Rs 115 Lakh Cr while Real GDP at base prices increases from Rs 80 Lakh Cr to Rs 86 Lakh Cr, what is the implicit GDP Deflator index for the current year (Base = 100)?',
          type: 'mcq',
          options: [
            '133.72',
            '128.50',
            '143.75',
            '115.00'
          ],
          correct: 0,
          explanation: 'GDP Deflator = (Nominal GDP / Real GDP) * 100 = (115 / 86) * 100 = 133.72.'
        },
        {
          id: 'q2',
          prompt: 'Why does the Laspeyres price index typically exhibit an upward substitution bias compared to the true cost-of-living index (COLI)?',
          type: 'mcq',
          options: [
            'It assumes a fixed base-year consumption basket, ignoring consumer substitution toward cheaper relative goods',
            'It uses current-period quantity weights that overvalue luxury items',
            'It fails the time reversal test by understating price ratios',
            'It applies arithmetic means to negative geometric margins'
          ],
          correct: 0,
          explanation: 'The Laspeyres formula holds base-period consumption weights constant. When relative prices change, consumers substitute away from expensive goods, making Laspeyres overstate inflation.'
        },
        {
          id: 'q3',
          prompt: 'Which index number satisfies both the Time Reversal Test and the Factor Reversal Test simultaneously?',
          type: 'mcq',
          options: [
            "Fisher's Ideal Index",
            'Laspeyres Index',
            'Paasche Index',
            'Marshall-Edgeworth Index'
          ],
          correct: 0,
          explanation: "Fisher's Ideal Index (the geometric mean of Laspeyres and Paasche) satisfies both the Time Reversal Test and Factor Reversal Test, which is why it is termed 'Ideal'."
        }
      ]
    }
  ];

  function getCustomQuizzes() {
    try {
      const saved = localStorage.getItem('nirdesha_custom_quizzes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_CUSTOM_QUIZZES));
  }

  function saveCustomQuizzes(quizzes) {
    try {
      localStorage.setItem('nirdesha_custom_quizzes', JSON.stringify(quizzes));
    } catch (e) {}
    updateQuizBadges();
    if (typeof renderCustomQuizzesGrid === 'function') {
      renderCustomQuizzesGrid();
    }
  }

  function getQuizHistory() {
    try {
      const saved = localStorage.getItem('nirdesha_quiz_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'hist_1',
        title: 'Survey Sampling & Socio-Economic Survey Methodology',
        topic: 'Survey Sampling Theory',
        totalQ: 5,
        correctQ: 4,
        accuracy: 80,
        speedBonus: 82,
        status: 'Completed (Merit)',
        date: Date.now() - 1000 * 60 * 60 * 24 * 2
      },
      {
        id: 'hist_2',
        title: 'Price Indices & Base Year Splicing Review',
        topic: 'Price Index Numbers',
        totalQ: 3,
        correctQ: 3,
        accuracy: 100,
        speedBonus: 74,
        status: 'Completed (Distinction)',
        date: Date.now() - 1000 * 60 * 60 * 24 * 5
      },
      {
        id: 'hist_3',
        title: 'CAPI Protocol & Field Inspection Standards',
        topic: 'Field Survey Automation',
        totalQ: 5,
        correctQ: 5,
        accuracy: 100,
        speedBonus: 60,
        status: 'Completed (Distinction)',
        date: Date.now() - 1000 * 60 * 60 * 24 * 8
      },
      {
        id: 'hist_4',
        title: 'DPDP Act 2023 Digital Anonymization Audit',
        topic: 'Data Governance & Legal Compliance',
        totalQ: 4,
        correctQ: 3,
        accuracy: 75,
        speedBonus: 40,
        status: 'Completed (Merit)',
        date: Date.now() - 1000 * 60 * 60 * 24 * 12
      }
    ];
  }

  function saveQuizHistory(history) {
    try {
      localStorage.setItem('nirdesha_quiz_history', JSON.stringify(history));
    } catch (e) {}
  }

  function updateQuizBadges() {
    const quizzes = getCustomQuizzes();
    const hasNew = quizzes.some(q => q.isNew);
    const navBadge = document.getElementById('quiz-sidebar-badge');
    if (navBadge) {
      navBadge.style.display = hasNew ? 'inline-block' : 'none';
    }
  }

  // --------------------------------------------------------------------------
  // 1. CLAUDE-STYLE INTERACTIVE QUIZ WIZARD (INSIDE AI MENTOR CHAT)
  // --------------------------------------------------------------------------
  function renderClaudeQuizWizardInChat() {
    if (!traineeChatLog) return;

    const wizardBubble = document.createElement('div');
    wizardBubble.className = 'chat-bubble bot';
    wizardBubble.style.padding = '0';
    wizardBubble.style.background = 'transparent';
    wizardBubble.style.border = 'none';

    wizardBubble.innerHTML = `
      <div class="claude-quiz-wizard-card" id="active-quiz-wizard">
        <div class="wizard-header-title">
          <span class="wizard-icon" style="display:inline-flex; align-items:center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg></span>
          <span>Interactive Cadre Quiz Architect</span>
        </div>
        <p style="font-size: 0.8rem; color: #64748b; margin: 0;">
          Configure your evaluation parameters. Once created, the quiz will be pushed to the <strong>AI Quiz</strong> section marked with a <strong>NEW</strong> badge!
        </p>

        <!-- 1. Purpose / Goal -->
        <div>
          <div class="wizard-section-title">1. Assessment Objective</div>
          <div class="wizard-pill-grid" id="wiz-goal-grid">
            <button type="button" class="wizard-pill-opt selected" data-val="Exam Prep (SSO/JSO Cadre)">Exam Prep (SSO/JSO)</button>
            <button type="button" class="wizard-pill-opt" data-val="Interview Prep">Interview Drill</button>
            <button type="button" class="wizard-pill-opt" data-val="Practical Evaluation">Practical Evaluation</button>
            <button type="button" class="wizard-pill-opt" data-val="Random Fast Drill">Random Fast Drill</button>
          </div>
        </div>

        <!-- 2. Course / Topic Source -->
        <div>
          <div class="wizard-section-title">2. Topic / Course Module</div>
          <select class="wizard-select-input" id="wiz-course-select" style="margin-bottom: 6px;">
            <option value="Survey Sampling Theory & Estimation" selected>Course 1: Survey Sampling Theory & Estimation (Module 1)</option>
            <option value="National Accounts & Macroeconomic Deflators">Course 2: National Accounts & Macroeconomic Deflators (Module 2)</option>
            <option value="Price Index Numbers (CPI / WPI Methodology)">Course 3: Price Index Numbers & Base Year Splicing (Module 3)</option>
            <option value="DPDP Act 2023 & Field Anonymization Protocols">Course 4: DPDP Act 2023 & Field Anonymization (Module 4)</option>
            <option value="CAPI Tablet Field Automation">Course 5: CAPI Tablet Field Automation & Offline Sync (Module 5)</option>
          </select>
          <input type="text" class="wizard-select-input" id="wiz-custom-topic" placeholder="Or enter specific custom topic (e.g. SRSWOR variance, Paasche bias)...">
        </div>

        <!-- 3. Question Format -->
        <div>
          <div class="wizard-section-title">3. Question Format</div>
          <div class="wizard-pill-grid" id="wiz-format-grid">
            <button type="button" class="wizard-pill-opt selected" data-val="Multiple Choice (MCQ)">Multiple Choice (MCQs)</button>
            <button type="button" class="wizard-pill-opt" data-val="Numerical / One Word">Numerical / Calculation</button>
            <button type="button" class="wizard-pill-opt" data-val="Data-Based Tabular">Data-Based (Tabular/Matrix)</button>
            <button type="button" class="wizard-pill-opt" data-val="Mixed Format">Mixed Format</button>
          </div>
        </div>

        <!-- 4. Focus & Difficulty -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <div class="wizard-section-title">4. Question Focus</div>
            <div class="wizard-pill-grid" id="wiz-focus-grid">
              <button type="button" class="wizard-pill-opt" data-val="Pure Theory">Theory</button>
              <button type="button" class="wizard-pill-opt" data-val="Numerical Calculation">Calculations</button>
              <button type="button" class="wizard-pill-opt selected" data-val="Balanced">Balanced</button>
            </div>
          </div>
          <div>
            <div class="wizard-section-title">5. Difficulty</div>
            <div class="wizard-pill-grid" id="wiz-diff-grid">
              <button type="button" class="wizard-pill-opt" data-val="Easy">Easy</button>
              <button type="button" class="wizard-pill-opt" data-val="Medium">Medium</button>
              <button type="button" class="wizard-pill-opt selected" data-val="Hard (SSO Standard)">Hard (SSO)</button>
            </div>
          </div>
        </div>

        <!-- 6. Number of Questions & Timing Mode -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <div class="wizard-section-title">6. Questions Count</div>
            <div class="wizard-pill-grid" id="wiz-count-grid">
              <button type="button" class="wizard-pill-opt" data-val="3">3 Qs</button>
              <button type="button" class="wizard-pill-opt selected" data-val="5">5 Qs</button>
              <button type="button" class="wizard-pill-opt" data-val="10">10 Qs</button>
            </div>
          </div>
          <div>
            <div class="wizard-section-title">7. Timing Mode</div>
            <div class="wizard-pill-grid" id="wiz-timer-grid">
              <button type="button" class="wizard-pill-opt selected" data-val="per_45">45s / Question</button>
              <button type="button" class="wizard-pill-opt" data-val="per_60">60s / Question</button>
              <button type="button" class="wizard-pill-opt" data-val="total_5">5m Total</button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="wizard-actions-row">
          <button type="button" class="btn-wizard-random" id="btn-wizard-random">
            Random Smart Fill
          </button>
          <button type="button" class="btn-wizard-submit" id="btn-wizard-submit">
            Create & Push to AI Quiz
          </button>
        </div>
      </div>
    `;

    // Interactive selection handlers for pill grids
    function setupPillGroup(containerId) {
      const cont = wizardBubble.querySelector('#' + containerId);
      if (!cont) return;
      cont.querySelectorAll('.wizard-pill-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          cont.querySelectorAll('.wizard-pill-opt').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        });
      });
    }

    setupPillGroup('wiz-goal-grid');
    setupPillGroup('wiz-format-grid');
    setupPillGroup('wiz-focus-grid');
    setupPillGroup('wiz-diff-grid');
    setupPillGroup('wiz-count-grid');
    setupPillGroup('wiz-timer-grid');

    // Random Smart Fill handler
    wizardBubble.querySelector('#btn-wizard-random').addEventListener('click', () => {
      const randomSelect = (gridId) => {
        const grid = wizardBubble.querySelector('#' + gridId);
        if (!grid) return;
        const btns = grid.querySelectorAll('.wizard-pill-opt');
        btns.forEach(b => b.classList.remove('selected'));
        const pick = btns[Math.floor(Math.random() * btns.length)];
        pick.classList.add('selected');
      };

      randomSelect('wiz-goal-grid');
      randomSelect('wiz-format-grid');
      randomSelect('wiz-focus-grid');
      randomSelect('wiz-diff-grid');
      randomSelect('wiz-count-grid');
      randomSelect('wiz-timer-grid');

      const courseSelect = wizardBubble.querySelector('#wiz-course-select');
      if (courseSelect) {
        courseSelect.selectedIndex = Math.floor(Math.random() * courseSelect.options.length);
      }
    });

    // Create & Push handler
    wizardBubble.querySelector('#btn-wizard-submit').addEventListener('click', (e) => {
      e.preventDefault();
      try {
        const getVal = (gridId) => {
          const sel = wizardBubble.querySelector('#' + gridId + ' .wizard-pill-opt.selected');
          return sel ? sel.getAttribute('data-val') : '';
        };

        const goal = getVal('wiz-goal-grid') || 'Exam Prep (SSO/JSO Cadre)';
        const format = getVal('wiz-format-grid') || 'Multiple Choice (MCQ)';
        const focus = getVal('wiz-focus-grid') || 'Balanced';
        const diff = getVal('wiz-diff-grid') || 'Hard (SSO Standard)';
        const qCount = parseInt(getVal('wiz-count-grid') || '5', 10);
        const timerMode = getVal('wiz-timer-grid') || 'per_45';

        const customTopicInput = wizardBubble.querySelector('#wiz-custom-topic');
        const courseSelect = wizardBubble.querySelector('#wiz-course-select');
        const topicName = (customTopicInput && customTopicInput.value.trim()) 
          ? customTopicInput.value.trim() 
          : (courseSelect ? courseSelect.value : 'Survey Sampling & Estimation');

        const quizId = 'custom_quiz_' + Date.now();
        const newQuiz = generateCustomQuizObject(quizId, topicName, goal, format, focus, diff, qCount, timerMode);

        const allQuizzes = getCustomQuizzes();
        allQuizzes.unshift(newQuiz);
        saveCustomQuizzes(allQuizzes);

        // Disable wizard button
        const submitBtn = wizardBubble.querySelector('#btn-wizard-submit');
        if (submitBtn) {
          submitBtn.textContent = '✓ Created & Pushed!';
          submitBtn.style.background = '#059669';
          submitBtn.disabled = true;
        }

        // Re-render custom quizzes in DOM immediately!
        if (typeof renderCustomQuizzesGrid === 'function') {
          renderCustomQuizzesGrid();
        }

        // Append confirmation bubble
        const confirmBubble = document.createElement('div');
        confirmBubble.className = 'chat-bubble bot';
        const uniqueBtnId = 'btn-jump-to-quiz-' + quizId;
        confirmBubble.innerHTML = `
          <div style="border-left: 3px solid #ea580c; padding-left: 0.75rem;">
            <strong style="color: #002b49; font-size: 0.95rem; display: block; margin-bottom: 4px;">
              Custom Quiz Ready: "${escapeHtml(newQuiz.title)}"
            </strong>
            <p style="font-size: 0.82rem; color: #334155; margin: 0 0 0.75rem 0;">
              ${newQuiz.questions.length} Questions • ${diff} • Timing: ${newQuiz.questionTime ? newQuiz.questionTime + 's/Q' : 'Total Exam Timer'}.
              <br>The quiz has been pushed to the <strong>AI Quiz section</strong> with a <span class="quiz-new-badge" style="position: static; display: inline-block;">NEW</span> badge!
            </p>
            <button type="button" class="btn-confirm-milestone" id="${uniqueBtnId}" style="padding: 0.45rem 0.85rem; font-size: 0.78rem;">
              ▶ Launch Quiz in AI Quiz Tab
            </button>
          </div>
        `;

        const jumpBtn = confirmBubble.querySelector('#' + uniqueBtnId);
        if (jumpBtn) {
          jumpBtn.addEventListener('click', () => {
            if (typeof switchTab === 'function') {
              switchTab('quiz');
              const pillAvailable = document.getElementById('pill-quiz-available');
              if (pillAvailable) pillAvailable.click();
              renderCustomQuizzesGrid();
            }
          });
        }

        traineeChatLog.appendChild(confirmBubble);
        traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
        persistTraineeChatLog();
        updateQuizBadges();
      } catch (err) {
        console.error('Error generating custom quiz:', err);
        alert('Could not generate quiz: ' + err.message);
      }
    });

    traineeChatLog.appendChild(wizardBubble);
    traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
    persistTraineeChatLog();
  }

  // Hook trigger button in mentor header
  const btnMentorQuizChip = document.getElementById('btn-mentor-quiz-chip');
  if (btnMentorQuizChip) {
    btnMentorQuizChip.addEventListener('click', (e) => {
      e.preventDefault();
      renderClaudeQuizWizardInChat();
    });
  }

  // Hook trigger button in AI Quiz view
  const btnTriggerMentorQuiz = document.getElementById('btn-trigger-mentor-quiz');
  if (btnTriggerMentorQuiz) {
    btnTriggerMentorQuiz.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof switchTab === 'function') {
        switchTab('ai-mentor');
        setTimeout(() => renderClaudeQuizWizardInChat(), 200);
      }
    });
  }

  // Question generation utility
  function generateCustomQuizObject(id, topic, goal, format, focus, diff, count, timerMode) {
    const isPerQ = timerMode.startsWith('per_');
    const qTime = isPerQ ? parseInt(timerMode.replace('per_', ''), 10) : 45;

    const questionsPool = [
      {
        prompt: `Under ${topic}, when the correlation coefficient \(\rho\) between auxiliary variable X and study variable Y is strictly greater than \(C_x / (2 C_y)\), which estimation methodology provides lower Mean Squared Error than the simple mean estimator?`,
        options: [
          'Ratio Estimator \(\hat{Y}_R = (\bar{y}/\bar{x}) X\)',
          'Difference Estimator with parameter \(k = 0\)',
          'Regression Estimator without intercept',
          'Linear Systematic Expansion'
        ],
        correct: 0,
        explanation: 'The Ratio estimator has lower MSE than the SRSWOR mean estimator if and only if \(\rho > C_x / (2 C_y)\).'
      },
      {
        prompt: `In evaluating ${topic}, what is the fundamental difference between the Hansen-Hurwitz estimator and the Horvitz-Thompson estimator?`,
        options: [
          'Hansen-Hurwitz applies to sampling with replacement (PPSWR), whereas Horvitz-Thompson applies to sampling without replacement (\(\pi\)PS)',
          'Hansen-Hurwitz requires cluster sizes to be invariant',
          'Horvitz-Thompson cannot handle auxiliary size variables',
          'Hansen-Hurwitz is guaranteed zero variance under all finite populations'
        ],
        correct: 0,
        explanation: 'Hansen-Hurwitz is formulated for probability proportional to size with replacement (PPSWR), whereas Horvitz-Thompson is general for unequal probability without replacement designs.'
      },
      {
        prompt: `Consider a sample of 100 enumeration blocks under ${topic}. The total survey cost is Rs 50,000, with fixed overhead of Rs 10,000 and cost per primary unit of Rs 400. If optimum Neyman allocation is applied, which factor determines the stratum sample size \(n_h\)?`,
        options: [
          'Proportional to \(N_h S_h\) (stratum size multiplied by stratum standard deviation)',
          'Strictly proportional to \(N_h / S_h\)',
          'Invariant across all strata',
          'Proportional to \(N_h^2 S_h^2\)'
        ],
        correct: 0,
        explanation: 'Under Neyman optimum allocation with equal sampling cost across strata, the stratum sample size is allocated proportional to \(N_h S_h\).'
      },
      {
        prompt: `Under Section 8 DPDP Act 2023 safeguards applied in ${topic}, what anonymization standard must be satisfied before public microdata dissemination?`,
        options: [
          'K-anonymity (k >= 5) and elimination of direct personal identifiers (UIDAI, phone, geo-coordinates)',
          'Only removal of candidate name',
          'Quarterly encryption of field multipliers',
          'Retention of raw coordinates for district audits'
        ],
        correct: 0,
        explanation: 'National statistical data release mandates k-anonymity (k>=5) and striping of direct identifying attributes to prevent indirect re-identification attacks.'
      },
      {
        prompt: `For national accounting deflators under ${topic}, which property ensures that the price index multiplied by the quantity index equals the nominal value ratio?`,
        options: [
          'Factor Reversal Test',
          'Time Reversal Test',
          'Circular Transitivity Test',
          'Proportionality Test'
        ],
        correct: 0,
        explanation: 'The Factor Reversal Test requires \(P(0,1) \times Q(0,1) = V_1 / V_0\), fully decomposing nominal growth into real output and price effects.'
      }
    ];

    const finalQuestions = [];
    for (let i = 0; i < count; i++) {
      const template = questionsPool[i % questionsPool.length];
      finalQuestions.push({
        id: `q_${i + 1}`,
        prompt: `[Question ${i + 1}] ${template.prompt}`,
        type: 'mcq',
        options: template.options,
        correct: template.correct,
        explanation: template.explanation,
        allocatedSeconds: qTime
      });
    }

    return {
      id: id,
      title: `${topic} (${goal.split(' ')[0]} Drill)`,
      topic: topic,
      mode: goal,
      format: format,
      focus: focus,
      difficulty: diff,
      timerMode: isPerQ ? 'per_question' : 'total_exam',
      questionTime: qTime,
      totalExamMinutes: isPerQ ? Math.ceil((qTime * count) / 60) : 5,
      isNew: true,
      createdAt: Date.now(),
      questions: finalQuestions
    };
  }

  // --------------------------------------------------------------------------
  // 2. AI QUIZ SECTION: SUB-NAV TABS & CUSTOM QUIZZES RENDERING
  // --------------------------------------------------------------------------
  function initQuizSubnav() {
    const pills = document.querySelectorAll('#quiz-subnav-pills .notif-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const tab = pill.getAttribute('data-quiz-tab');

        const pAvailable = document.getElementById('quiz-panel-available');
        const pHistory = document.getElementById('quiz-panel-history');
        const pQuarterly = document.getElementById('quiz-panel-quarterly');

        if (pAvailable) pAvailable.style.display = tab === 'available' ? 'block' : 'none';
        if (pHistory) pHistory.style.display = tab === 'history' ? 'block' : 'none';
        if (pQuarterly) pQuarterly.style.display = tab === 'quarterly' ? 'block' : 'none';

        if (tab === 'available') renderCustomQuizzesGrid();
        if (tab === 'history') renderQuizHistoryGrid();
        if (tab === 'quarterly') renderQuarterlyReportMetrics();
      });
    });
  }

  function updateQuizEloScore() {
    try {
      const savedScore = localStorage.getItem('nirdesha_trainee_score') || '1420';
      const el = document.getElementById('quiz-view-elo-score');
      if (el) el.textContent = savedScore;
    } catch (e) {}
  }
  window.updateQuizEloScore = updateQuizEloScore;

  function renderCustomQuizzesGrid() {
    updateQuizEloScore();
    const grid = document.getElementById('custom-quizzes-list');
    if (!grid) return;
    grid.innerHTML = '';

    const quizzes = getCustomQuizzes();
    if (quizzes.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 6px;">
          <strong style="color: #002b49;">No Custom Quizzes Created Yet</strong>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0.85rem 0;">Ask your AI Study Mentor to generate a custom exam drill or interview test!</p>
        </div>
      `;
      return;
    }

    quizzes.forEach(quiz => {
      const card = document.createElement('div');
      card.className = 'custom-quiz-card';

      const newBadgeHtml = quiz.isNew ? `<span class="quiz-new-badge">NEW</span>` : '';
      const timeLabel = quiz.timerMode === 'per_question' 
        ? `${quiz.questionTime}s per question` 
        : `${quiz.totalExamMinutes}m total`;

      card.innerHTML = `
        ${newBadgeHtml}
        <div>
          <h4 class="custom-quiz-card-title">${escapeHtml(quiz.title)}</h4>
          <div class="custom-quiz-card-meta">
            <span class="custom-quiz-tag" style="color: #ea580c; background: #fff7ed;">${escapeHtml(quiz.difficulty || 'Standard')}</span>
            <span class="custom-quiz-tag">${quiz.questions ? quiz.questions.length : 5} Questions</span>
            <span class="custom-quiz-tag">${timeLabel}</span>
            <span class="custom-quiz-tag">Speed Bonus Active</span>
          </div>
        </div>
        <button type="button" class="btn-launch-custom-quiz">
          Launch Proctored Quiz ▶
        </button>
      `;

      card.querySelector('.btn-launch-custom-quiz').addEventListener('click', () => {
        // Clear NEW badge on click!
        quiz.isNew = false;
        saveCustomQuizzes(quizzes);
        renderCustomQuizzesGrid();
        launchProctoredQuiz(quiz);
      });

      grid.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 3. PROCTORED ETHICAL EXAM RUNNER & ANTI-CHEATING WATCHDOG
  // --------------------------------------------------------------------------
  let activeQuizSession = null;
  let proctorTimerInterval = null;
  let qSecondsRemaining = 45;
  let totalSpeedPointsEarned = 0;
  let currentQuestionIndex = 0;
  let userAnswersRecord = [];

  const proctorModal = document.getElementById('proctored-quiz-modal');
  const proctorViolationOverlay = document.getElementById('proctor-violation-overlay');
  const proctorTimerValEl = document.getElementById('proctor-timer-val');
  const proctorSpeedPtsEl = document.getElementById('proctor-speed-pts');
  const proctorQCounterEl = document.getElementById('proctor-q-counter');
  const proctorQTextEl = document.getElementById('proctor-q-text');
  const proctorQOptionsEl = document.getElementById('proctor-q-options');
  const proctorProgressFillEl = document.getElementById('proctor-progress-fill');
  const btnProctorNext = document.getElementById('btn-proctor-next');
  const btnProctorSubmit = document.getElementById('btn-proctor-submit');
  const btnProctorAbort = document.getElementById('btn-proctor-abort');
  const btnCloseViolation = document.getElementById('btn-close-violation');

  function launchProctoredQuiz(quiz) {
    if (!proctorModal) return;
    activeQuizSession = quiz;
    currentQuestionIndex = 0;
    totalSpeedPointsEarned = 0;
    userAnswersRecord = [];

    document.getElementById('proctor-quiz-title').textContent = quiz.title;
    if (proctorSpeedPtsEl) proctorSpeedPtsEl.textContent = '+0 pts';
    if (proctorViolationOverlay) proctorViolationOverlay.style.display = 'none';

    proctorModal.style.display = 'flex';
    renderProctorQuestion(0);

    // Activate Anti-Cheating Ethical Watchdog
    activateProctorWatchdog();
  }

  function renderProctorQuestion(idx) {
    if (!activeQuizSession || !activeQuizSession.questions) return;
    const q = activeQuizSession.questions[idx];
    if (!q) return;

    if (proctorQCounterEl) {
      proctorQCounterEl.textContent = `Question ${idx + 1} of ${activeQuizSession.questions.length}`;
    }
    if (proctorProgressFillEl) {
      const pct = Math.round(((idx + 1) / activeQuizSession.questions.length) * 100);
      proctorProgressFillEl.style.width = pct + '%';
    }
    if (proctorQTextEl) {
      proctorQTextEl.innerHTML = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(q.prompt) : q.prompt;
    }

    if (proctorQOptionsEl) {
      proctorQOptionsEl.innerHTML = '';
      if (q.options && Array.isArray(q.options)) {
        q.options.forEach((optText, optIdx) => {
          const optDiv = document.createElement('div');
          optDiv.className = 'proctor-option-item';
          optDiv.setAttribute('data-opt-idx', optIdx);
          optDiv.innerHTML = `
            <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; border:1.5px solid #cbd5e1; font-size:0.75rem; font-weight:800;">${String.fromCharCode(65 + optIdx)}</span>
            <span>${window.NirdeshaFormatter ? window.NirdeshaFormatter.format(optText) : optText}</span>
          `;
          optDiv.addEventListener('click', () => {
            proctorQOptionsEl.querySelectorAll('.proctor-option-item').forEach(el => el.classList.remove('selected'));
            optDiv.classList.add('selected');
          });
          proctorQOptionsEl.appendChild(optDiv);
        });
      }
    }

    // Controls button visibility
    const isLast = idx === activeQuizSession.questions.length - 1;
    if (btnProctorNext) btnProctorNext.style.display = isLast ? 'none' : 'inline-block';
    if (btnProctorSubmit) btnProctorSubmit.style.display = isLast ? 'inline-block' : 'none';

    // Start Question Timer
    startQuestionTimer(q.allocatedSeconds || activeQuizSession.questionTime || 45);
  }

  function startQuestionTimer(seconds) {
    clearInterval(proctorTimerInterval);
    qSecondsRemaining = seconds;
    updateProctorTimerUI();

    proctorTimerInterval = setInterval(() => {
      qSecondsRemaining--;
      updateProctorTimerUI();
      if (qSecondsRemaining <= 0) {
        clearInterval(proctorTimerInterval);
        // Time expired for this question: auto advance
        advanceQuestion(true);
      }
    }, 1000);
  }

  function updateProctorTimerUI() {
    if (!proctorTimerValEl) return;
    const mins = Math.floor(qSecondsRemaining / 60);
    const secs = qSecondsRemaining % 60;
    proctorTimerValEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function advanceQuestion(autoExpired = false) {
    if (!activeQuizSession) return;
    const q = activeQuizSession.questions[currentQuestionIndex];
    const selectedOpt = proctorQOptionsEl ? proctorQOptionsEl.querySelector('.proctor-option-item.selected') : null;
    const selectedIdx = selectedOpt ? parseInt(selectedOpt.getAttribute('data-opt-idx'), 10) : -1;

    const isCorrect = selectedIdx === q.correct;
    let earnedSpeedBonus = 0;

    // Convert remaining seconds into Speed Bonus Points!
    if (isCorrect && !autoExpired && qSecondsRemaining > 0) {
      earnedSpeedBonus = qSecondsRemaining;
      totalSpeedPointsEarned += earnedSpeedBonus;
      if (proctorSpeedPtsEl) {
        proctorSpeedPtsEl.textContent = `+${totalSpeedPointsEarned} pts`;
      }
    }

    const optTextSelected = (selectedIdx >= 0 && q.options && q.options[selectedIdx]) ? q.options[selectedIdx] : 'No answer (Time expired)';
    const optTextCorrect = (q.options && q.options[q.correct]) ? q.options[q.correct] : 'Option ' + String.fromCharCode(65 + q.correct);

    userAnswersRecord.push({
      questionIndex: currentQuestionIndex,
      prompt: q.prompt,
      selected: selectedIdx,
      selectedText: optTextSelected,
      correct: q.correct,
      correctText: optTextCorrect,
      isCorrect: isCorrect,
      speedBonus: earnedSpeedBonus,
      explanation: q.explanation,
      topic: activeQuizSession ? activeQuizSession.topic : 'General Statistical Methodology',
      assessmentTitle: activeQuizSession ? activeQuizSession.title : 'Cadre Assessment'
    });

    // Automatically ingest mistake into Skill Gap Radar!
    if (!isCorrect && typeof recordSkillGapMistake === 'function') {
      recordSkillGapMistake({
        topic: activeQuizSession ? activeQuizSession.topic : 'General Statistical Methodology',
        assessmentTitle: activeQuizSession ? activeQuizSession.title : 'Cadre Assessment',
        prompt: q.prompt,
        userChoice: optTextSelected,
        correctChoice: optTextCorrect,
        explanation: q.explanation
      });
    }

    if (currentQuestionIndex < activeQuizSession.questions.length - 1) {
      currentQuestionIndex++;
      renderProctorQuestion(currentQuestionIndex);
    } else {
      finalizeProctorQuizAssessment();
    }
  }

  if (btnProctorNext) {
    btnProctorNext.addEventListener('click', () => {
      advanceQuestion(false);
    });
  }

  if (btnProctorSubmit) {
    btnProctorSubmit.addEventListener('click', () => {
      advanceQuestion(false);
    });
  }

  if (btnProctorAbort) {
    btnProctorAbort.addEventListener('click', () => {
      if (confirm('Abort this proctored evaluation? Your progress will be discarded.')) {
        closeProctorModal();
      }
    });
  }

  function closeProctorModal() {
    clearInterval(proctorTimerInterval);
    deactivateProctorWatchdog();
    if (proctorModal) proctorModal.style.display = 'none';
    activeQuizSession = null;
  }

  // --------------------------------------------------------------------------
  // ANTI-CHEATING PROCTORING ENGINE (ETHICAL ENFORCEMENT)
  // --------------------------------------------------------------------------
  let watchdogActive = false;

  function onProctorViolationTrigger(reason) {
    if (!watchdogActive || !activeQuizSession) return;
    clearInterval(proctorTimerInterval);
    deactivateProctorWatchdog();

    // Show Red Violation Overlay
    if (proctorViolationOverlay) {
      proctorViolationOverlay.style.display = 'flex';
    }

    // Record Disqualification in Quiz History!
    const history = getQuizHistory();
    history.unshift({
      id: 'viol_' + Date.now(),
      title: activeQuizSession.title,
      topic: activeQuizSession.topic,
      totalQ: activeQuizSession.questions.length,
      correctQ: 0,
      accuracy: 0,
      speedBonus: 0,
      status: 'Disqualified (Ethical Violation: ' + reason + ')',
      date: Date.now()
    });
    saveQuizHistory(history);
  }

  function onVisibilityChange() {
    if (document.hidden && watchdogActive) {
      onProctorViolationTrigger('Tab Switch Detected');
    }
  }

  function onWindowBlur() {
    if (watchdogActive) {
      onProctorViolationTrigger('Window Focus Lost');
    }
  }

  function onKeyDownProctor(e) {
    if (!watchdogActive) return;
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J'))) {
      e.preventDefault();
      onProctorViolationTrigger('Developer Tools Shortcut');
    }
  }

  function activateProctorWatchdog() {
    watchdogActive = true;
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('keydown', onKeyDownProctor);
  }

  function deactivateProctorWatchdog() {
    watchdogActive = false;
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('blur', onWindowBlur);
    window.removeEventListener('keydown', onKeyDownProctor);
  }

  if (btnCloseViolation) {
    btnCloseViolation.addEventListener('click', () => {
      closeProctorModal();
      if (typeof switchTab === 'function') switchTab('quiz');
    });
  }

  // Finalize Quiz
  function finalizeProctorQuizAssessment() {
    clearInterval(proctorTimerInterval);
    deactivateProctorWatchdog();

    const correctCount = userAnswersRecord.filter(a => a.isCorrect).length;
    const totalCount = activeQuizSession.questions.length;
    const accuracy = Math.round((correctCount / totalCount) * 100);

    const historyItem = {
      id: 'hist_' + Date.now(),
      title: activeQuizSession.title,
      topic: activeQuizSession.topic,
      totalQ: totalCount,
      correctQ: correctCount,
      accuracy: accuracy,
      speedBonus: totalSpeedPointsEarned,
      status: accuracy >= 80 ? 'Completed (Distinction)' : (accuracy >= 50 ? 'Completed (Passed)' : 'Completed (Needs Revision)'),
      date: Date.now(),
      answers: userAnswersRecord
    };

    const history = getQuizHistory();
    history.unshift(historyItem);
    saveQuizHistory(history);

    // Award Points to Trainee Profile Elo
    try {
      let profileScore = parseInt(localStorage.getItem('nirdesha_trainee_score') || '1420', 10);
      profileScore += (accuracy * 2) + totalSpeedPointsEarned;
      localStorage.setItem('nirdesha_trainee_score', profileScore.toString());
      const scoreEl = document.getElementById('public-elo-score');
      if (scoreEl) scoreEl.textContent = profileScore;
    } catch (e) {}

    // Show summary inside modal
    if (proctorQTextEl) {
      proctorQTextEl.innerHTML = `
        <div style="text-align:center; padding: 1.5rem 0;">
          
          <h2 style="font-size: 1.45rem; font-weight: 900; color: #002b49; margin: 0 0 4px 0;">Assessment Completed!</h2>
          <p style="font-size: 0.85rem; color: #64748b; margin: 0 0 1.25rem 0;">
            Accuracy: <strong>${accuracy}% (${correctCount}/${totalCount})</strong> • Speed Bonus: <strong style="color:#0284c7;">+${totalSpeedPointsEarned} pts</strong>
          </p>
          <div style="display:inline-block; padding: 0.75rem 1.5rem; background:#f0fdf4; border: 1.5px solid #86efac; border-radius: 6px; margin-bottom: 1.25rem;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #166534;">✓ Result logged in Academic Marksheet Record</span>
          </div>
        </div>
      `;
    }

    if (proctorQOptionsEl) proctorQOptionsEl.innerHTML = '';
    if (btnProctorNext) btnProctorNext.style.display = 'none';
    if (btnProctorSubmit) {
      btnProctorSubmit.textContent = 'View Quiz History & Reports ▶';
      btnProctorSubmit.style.display = 'inline-block';
      btnProctorSubmit.onclick = () => {
        closeProctorModal();
        const tabBtn = document.getElementById('pill-quiz-history');
        if (tabBtn) tabBtn.click();
      };
    }
  }

  // --------------------------------------------------------------------------
  // 4. QUIZ HISTORY & MULTI-SELECT ACADEMIC MARKSHEET (PDF / PNG / JPG)
  // --------------------------------------------------------------------------
  function renderQuizHistoryGrid() {
    const container = document.getElementById('quiz-history-cards-container');
    if (!container) return;
    container.innerHTML = '';

    const history = getQuizHistory();
    if (history.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 6px;">
          <h4 style="color: #002b49; margin: 0 0 4px 0;">No Assessment Records Found</h4>
          <p style="font-size: 0.82rem; color: #64748b; margin: 0;">Complete standard or custom evaluations to generate official academic grade records.</p>
        </div>
      `;
      return;
    }

    history.forEach(item => {
      const card = document.createElement('div');
      card.className = 'custom-quiz-card';
      const isViol = item.status && item.status.includes('Disqualified');
      const dateStr = new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <input type="checkbox" class="quiz-history-check" data-id="${item.id}" style="margin-top: 4px; width: 16px; height: 16px; cursor: pointer;">
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
              <span style="font-size: 0.7rem; font-weight: 700; color: #64748b;">${dateStr} • ${escapeHtml(item.topic || 'MoSPI Cadre')}</span>
              <span style="font-size: 0.7rem; font-weight: 800; padding: 2px 6px; border-radius: 3px; background: ${isViol ? '#fee2e2' : '#dcfce7'}; color: ${isViol ? '#991b1b' : '#166534'};">
                ${escapeHtml(item.status || 'Completed')}
              </span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 800; color: #002b49; margin: 0 0 6px 0;">${escapeHtml(item.title)}</h4>
            <div style="display: flex; gap: 0.75rem; font-size: 0.78rem;">
              <span>Score: <strong>${item.correctQ || 0}/${item.totalQ || 5} (${item.accuracy || 0}%)</strong></span>
              <span style="color: #0284c7;">Speed Bonus: <strong>+${item.speedBonus || 0} pts</strong></span>
            </div>
          </div>
        </div>
      `;

      card.querySelector('.quiz-history-check').addEventListener('change', updateSelectedHistoryCount);
      container.appendChild(card);
    });

    updateSelectedHistoryCount();
  }

  function updateSelectedHistoryCount() {
    const checkedBoxes = document.querySelectorAll('.quiz-history-check:checked');
    const count = checkedBoxes.length;
    const badge = document.getElementById('badge-selected-count');
    const btnDownload = document.getElementById('btn-download-marksheet');

    if (badge) badge.textContent = `${count} selected`;
    if (btnDownload) {
      btnDownload.disabled = count === 0;
    }
  }

  // Select All Quizzes toggle
  const checkSelectAll = document.getElementById('check-select-all-quizzes');
  if (checkSelectAll) {
    checkSelectAll.addEventListener('change', () => {
      const isChecked = checkSelectAll.checked;
      document.querySelectorAll('.quiz-history-check').forEach(chk => {
        chk.checked = isChecked;
      });
      updateSelectedHistoryCount();
    });
  }

  // Academic Marksheet Modal Handling
  const marksheetModal = document.getElementById('marksheet-modal');
  const btnDownloadMarksheet = document.getElementById('btn-download-marksheet');
  const btnCloseMarksheet = document.getElementById('btn-close-marksheet');
  const btnCancelMarksheet = document.getElementById('btn-cancel-marksheet');
  const btnExecuteDownloadMarksheet = document.getElementById('btn-execute-download-marksheet');

  let selectedExportFormat = 'pdf'; // 'pdf' | 'png' | 'jpg'

  if (btnDownloadMarksheet) {
    btnDownloadMarksheet.addEventListener('click', () => {
      openMarksheetModal();
    });
  }

  if (btnCloseMarksheet) btnCloseMarksheet.addEventListener('click', () => marksheetModal.style.display = 'none');
  if (btnCancelMarksheet) btnCancelMarksheet.addEventListener('click', () => marksheetModal.style.display = 'none');

  // Format selection toggle
  document.querySelectorAll('#marksheet-format-options .export-scope-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#marksheet-format-options .export-scope-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedExportFormat = btn.getAttribute('data-format') || 'pdf';
    });
  });

  function openMarksheetModal() {
    if (!marksheetModal) return;
    const checkedBoxes = document.querySelectorAll('.quiz-history-check:checked');
    const history = getQuizHistory();
    const selectedQuizzes = [];

    checkedBoxes.forEach(cb => {
      const id = cb.getAttribute('data-id');
      const item = history.find(h => h.id === id);
      if (item) selectedQuizzes.push(item);
    });

    if (selectedQuizzes.length === 0) {
      alert('Please select at least 1 quiz to generate a marksheet.');
      return;
    }

    // Populate Table Rows
    const tbody = document.getElementById('ms-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    let grandTotalQ = 0;
    let grandCorrectQ = 0;
    let grandSpeedPts = 0;

    selectedQuizzes.forEach((item, idx) => {
      grandTotalQ += (item.totalQ || 5);
      grandCorrectQ += (item.correctQ || 0);
      grandSpeedPts += (item.speedBonus || 0);

      const tr = document.createElement('tr');
      const acc = item.accuracy || 0;
      let grade = 'A';
      if (acc >= 90) grade = 'O (Outstanding)';
      else if (acc >= 80) grade = 'A+ (Excellent)';
      else if (acc >= 70) grade = 'A (Very Good)';
      else if (acc >= 60) grade = 'B+ (Good)';
      else grade = 'C (Passed)';

      tr.innerHTML = `
        <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
        <td><strong>${escapeHtml(item.title)}</strong><br><span style="font-size: 0.68rem; color: #64748b;">${escapeHtml(item.topic || 'MoSPI')}</span></td>
        <td style="text-align: center;">${item.totalQ || 5}</td>
        <td style="text-align: center; font-weight: 700;">${item.correctQ || 0}</td>
        <td style="text-align: center; color: #0284c7; font-weight: 700;">+${item.speedBonus || 0} pts</td>
        <td style="text-align: center;">${item.accuracy || 0}%</td>
        <td style="text-align: center; font-weight: 800; color: #002b49;">${grade}</td>
      `;
      tbody.appendChild(tr);
    });

    const grandAccuracy = grandTotalQ > 0 ? Math.round((grandCorrectQ / grandTotalQ) * 100) : 0;
    let grandGrade = 'Grade A (Distinction)';
    if (grandAccuracy >= 90) grandGrade = 'Grade O (First Class with Distinction)';
    else if (grandAccuracy >= 80) grandGrade = 'Grade A+ (Distinction)';
    else if (grandAccuracy >= 60) grandGrade = 'Grade A (First Class)';

    const cumScoreEl = document.getElementById('ms-cumulative-score');
    const cumSpeedEl = document.getElementById('ms-cumulative-speed');
    const cumGradeEl = document.getElementById('ms-cumulative-grade');

    if (cumScoreEl) cumScoreEl.textContent = `${grandCorrectQ} / ${grandTotalQ} (${grandAccuracy}%)`;
    if (cumSpeedEl) cumSpeedEl.textContent = `+${grandSpeedPts} pts`;
    if (cumGradeEl) cumGradeEl.textContent = grandGrade;

    marksheetModal.style.display = 'flex';
  }

  // Execute Marksheet Download (PDF / PNG / JPG)
  if (btnExecuteDownloadMarksheet) {
    btnExecuteDownloadMarksheet.addEventListener('click', () => {
      const candidateName = 'Officer_Raman';
      const fileName = `MoSPI_NSSTA_Marksheet_${candidateName}_${new Date().toISOString().split('T')[0]}`;

      if (selectedExportFormat === 'pdf') {
        // PDF / Print Layout
        const canvasEl = document.getElementById('official-marksheet-canvas');
        if (!canvasEl) return;

        const printWin = window.open('', '_blank');
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${fileName}</title>
            <style>
              body { font-family: 'Times New Roman', serif; margin: 2rem; color: #0f172a; }
              table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 11pt; }
              th, td { border: 1px solid #334155; padding: 6px 8px; }
              th { background: #002b49; color: #ffffff; }
              .ms-header { text-align: center; border-bottom: 2px solid #002b49; padding-bottom: 10px; margin-bottom: 15px; }
              .ms-gov { font-size: 10pt; font-weight: bold; color: #ea580c; }
              .ms-doc-title { display: inline-block; font-weight: bold; border: 1px solid #002b49; padding: 2px 8px; margin-top: 5px; }
              .ms-meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 10pt; }
              .ms-summary-strip { display: flex; justify-content: space-between; padding: 8px; background: #f1f5f9; border: 1.5px solid #002b49; margin: 15px 0; font-weight: bold; }
              .ms-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; }
              @media print { body { margin: 1cm; } }
            </style>
          </head>
          <body>
            ${canvasEl.innerHTML}
          </body>
          </html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          printWin.print();
          printWin.close();
        }, 300);

      } else {
        // PNG or JPG Image Export via HTML Canvas Rendering
        const canvasEl = document.getElementById('official-marksheet-canvas');
        if (!canvasEl) return;

        // Render clean SVG/HTML data to an offscreen Canvas
        const svgData = `
          <svg xmlns="http://www.w3.org/2000/svg" width="800" height="900">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; background: #ffffff; padding: 20px; color: #0f172a;">
                ${canvasEl.outerHTML}
              </div>
            </foreignObject>
          </svg>
        `;

        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function() {
          const offCanvas = document.createElement('canvas');
          offCanvas.width = 800;
          offCanvas.height = 900;
          const ctx = offCanvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 800, 900);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          const mime = selectedExportFormat === 'png' ? 'image/png' : 'image/jpeg';
          const ext = selectedExportFormat === 'png' ? 'png' : 'jpg';
          const dataUrl = offCanvas.toDataURL(mime, 0.95);

          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `${fileName}.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
        img.src = url;
      }
    });
  }

  // --------------------------------------------------------------------------
  // 5. QUARTERLY CONSOLIDATED REPORT DISPATCH (WHATSAPP & EMAIL)
  // --------------------------------------------------------------------------
  function renderQuarterlyReportMetrics() {
    const history = getQuizHistory();
    const totalQuizzes = history.length;
    let totalAcc = 0;
    let totalSpeed = 0;

    history.forEach(h => {
      totalAcc += (h.accuracy || 0);
      totalSpeed += (h.speedBonus || 0);
    });

    const avgAcc = totalQuizzes > 0 ? Math.round(totalAcc / totalQuizzes) : 0;

    const elTotal = document.getElementById('qtr-total-quizzes');
    const elAvg = document.getElementById('qtr-avg-accuracy');
    const elSpeed = document.getElementById('qtr-speed-pts');

    if (elTotal) elTotal.textContent = totalQuizzes;
    if (elAvg) elAvg.textContent = `${avgAcc}%`;
    if (elSpeed) elSpeed.textContent = `+${totalSpeed} pts`;
  }

  const btnDispatchQuarterly = document.getElementById('btn-dispatch-quarterly-report');
  const quarterlyModal = document.getElementById('quarterly-dispatch-modal');
  const btnCloseQuarterly = document.getElementById('btn-close-quarterly-dispatch');

  if (btnDispatchQuarterly) {
    btnDispatchQuarterly.addEventListener('click', () => {
      openQuarterlyDispatchModal();
    });
  }

  if (btnCloseQuarterly) btnCloseQuarterly.addEventListener('click', () => quarterlyModal.style.display = 'none');

  // Preview tab toggle
  document.querySelectorAll('#dispatch-preview-toggle .export-scope-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#dispatch-preview-toggle .export-scope-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-dispatch-tab');
      const viewWa = document.getElementById('dispatch-view-whatsapp');
      const viewEmail = document.getElementById('dispatch-view-email');
      if (viewWa) viewWa.style.display = tab === 'whatsapp' ? 'block' : 'none';
      if (viewEmail) viewEmail.style.display = tab === 'email' ? 'block' : 'none';
    });
  });

  function openQuarterlyDispatchModal() {
    if (!quarterlyModal) return;

    const history = getQuizHistory();
    const totalQuizzes = history.length;
    let totalAcc = 0;
    let totalSpeed = 0;
    history.forEach(h => {
      totalAcc += (h.accuracy || 0);
      totalSpeed += (h.speedBonus || 0);
    });
    const avgAcc = totalQuizzes > 0 ? Math.round(totalAcc / totalQuizzes) : 85;

    const waText = `*MoSPI NSSTA — Quarterly Cadre Performance Digest*
*Candidate:* Officer Raman (Roll: MoSPI/2026/SSS-4821)
*Cycle:* Q3 2026 (July - September)
────────────────────────────
*Assessments Completed:* ${totalQuizzes} Quizzes
*Overall Accuracy:* ${avgAcc}%
*Total Speed Bonus:* +${totalSpeed} pts
*SSS Cadre Standing:* Top 5% (Promotion Benchmark Cleared)
*Strongest Competency:* Survey Sampling & Variance Estimation
────────────────────────────
Official digital marksheet archived in Nirdesha Competency Cloud.`;

    const waBody = document.getElementById('whatsapp-message-body');
    if (waBody) waBody.textContent = waText;

    const btnWaLink = document.getElementById('btn-open-whatsapp-web');
    if (btnWaLink) {
      btnWaLink.href = `https://wa.me/?text=${encodeURIComponent(waText)}`;
    }

    const btnCopyWa = document.getElementById('btn-copy-whatsapp-text');
    if (btnCopyWa) {
      btnCopyWa.addEventListener('click', () => {
        navigator.clipboard.writeText(waText);
        btnCopyWa.textContent = 'Copied!';
        setTimeout(() => btnCopyWa.textContent = 'Copy Text', 1500);
      });
    }

    const emailBody = document.getElementById('email-message-body');
    if (emailBody) {
      emailBody.innerHTML = `
        <div style="font-family: Arial, sans-serif; color: #0f172a;">
          <div style="border-bottom: 2px solid #002b49; padding-bottom: 8px; margin-bottom: 12px;">
            <strong style="color: #ea580c; font-size: 0.75rem; text-transform: uppercase;">Ministry of Statistics & Programme Implementation (MoSPI)</strong>
            <h3 style="margin: 3px 0 0 0; color: #002b49;">Quarterly Competency & Evaluation Performance Record</h3>
          </div>
          <p><strong>To:</strong> Officer Raman (officer.raman@mospi.gov.in)</p>
          <p><strong>Subject:</strong> Official Q3 2026 Consolidated Examination & Skill-Speed Transcript</p>
          <p>Dear Officer Raman,</p>
          <p>Your performance synthesis for the 3rd Quarter (July - September 2026) has been compiled. You completed <strong>${totalQuizzes} evaluations</strong> with an overall accuracy rating of <strong>${avgAcc}%</strong> and accumulated <strong>+${totalSpeed} speed bonus points</strong>.</p>
          <p>Based on your assessment trajectory in Survey Sampling Theory and Macroeconomic Deflators, you remain on the expedited Senior Statistical Officer (SSO) cadre promotion track.</p>
          <div style="margin-top: 15px; font-size: 0.75rem; color: #64748b;">
            National Statistical Systems Training Academy (NSSTA), Greater Noida, Uttar Pradesh.<br>
            Official digital record hash: <code>SHA256-NSSTA-Q3-2026-RAMAN</code>
          </div>
        </div>
      `;
    }

    const btnSimEmail = document.getElementById('btn-simulate-email-sent');
    if (btnSimEmail) {
      btnSimEmail.addEventListener('click', () => {
        btnSimEmail.textContent = '✓ Dispatched to officer.raman@mospi.gov.in';
        btnSimEmail.style.background = '#059669';
      });
    }

    quarterlyModal.style.display = 'flex';
  }

  // ==========================================================================
  // TRAINEE SKILL GAP RADAR & REMEDIATION ENGINE
  // ==========================================================================
  const DEFAULT_SKILL_GAPS = [
    {
      id: 'sg_horvitz_thompson',
      topic: 'Horvitz-Thompson Variance & Unequal Probability Sampling',
      module: 'Survey Sampling Theory & Estimation (Module 1)',
      severity: 'high', // 'high' | 'moderate' | 'resolved'
      masteryPct: 40,
      mistakesCount: 2,
      lastMistakeDate: Date.now() - 1000 * 60 * 60 * 3,
      questionsMissed: [
        {
          id: 'qm_1',
          date: Date.now() - 1000 * 60 * 60 * 3,
          assessmentTitle: 'Horvitz-Thompson Variance & Unequal Probability Sampling',
          prompt: 'In Horvitz-Thompson estimation for a finite population total, under what condition is the Sen-Yates-Grundy variance estimator guaranteed to be non-negative?',
          userChoice: 'Any arbitrary sample size and \\(\\pi_{ij} \\ge \\pi_i \\pi_j\\)',
          correctChoice: 'Fixed sample size n and \\(\\pi_{ij} \\le \\pi_i \\pi_j\\) for all pairs (i, j)',
          explanation: 'The Sen-Yates-Grundy (SYG) variance estimator is guaranteed non-negative when the sample design has a fixed sample size n and the joint inclusion probabilities satisfy \\(\\pi_{ij} \\le \\pi_i \\pi_j\\) for all i != j.'
        },
        {
          id: 'qm_2',
          date: Date.now() - 1000 * 60 * 60 * 24,
          assessmentTitle: 'SSS Cadre Selection Mock Drill',
          prompt: 'Which sampling technique provides the minimum variance unbiased estimator among all linear estimators when selection probability is proportional to unit size?',
          userChoice: 'Midzuno-Sen Sampling Strategy',
          correctChoice: 'Horvitz-Thompson Estimator with optimal \\(\\pi_i \\propto Y_i\\)',
          explanation: 'If \\(\\pi_i\\) is strictly proportional to the study variable \\(Y_i\\), the Horvitz-Thompson estimator achieves zero variance in finite population total estimation.'
        }
      ],
      prepRoadmap: {
        diagnosis: 'Trainees frequently confuse Hansen-Hurwitz (PPSWR) with Horvitz-Thompson (\\(\\pi\\)PS without replacement) variance equations and fail to remember the fixed sample size n condition required for the Sen-Yates-Grundy non-negativity proof.',
        formulas: [
          '\\hat{Y}_{HT} = \\sum_{i=1}^n \\frac{y_i}{\\pi_i}',
          'V_{SYG}(\\hat{Y}_{HT}) = -\\frac{1}{2} \\sum_{i=1}^n \\sum_{j \\neq i}^n \\frac{\\pi_{ij} - \\pi_i \\pi_j}{\\pi_{ij}} \\left( \\frac{y_i}{\\pi_i} - \\frac{y_j}{\\pi_j} \\right)^2'
        ],
        routine: [
          'Review NSSTA Module 1 Lecture Notes on Unequal Probability Without Replacement designs.',
          'Derive the Sen-Yates-Grundy algebraic formulation from the Horvitz-Thompson double summation formula on paper.',
          'Solve 2 numerical problems where n=2 and compute joint inclusion probabilities \\(\\pi_{12}\\).'
        ],
        reference: 'NSSO Field Operations Division (FOD) Training Manual — Volume II, Section 4.3 (Pages 88–94).'
      },
      retestQuestions: [
        {
          prompt: 'Under what theoretical condition does the Horvitz-Thompson estimator \\(\hat{Y}_{HT}\\) achieve zero variance?',
          options: [
            'When inclusion probability \\(\pi_i\\) is strictly proportional to the study variable \\(Y_i\\)',
            'When the population variance \\(S^2\\) equals zero',
            'When sample size n equals N/2',
            'Under Simple Random Sampling with replacement'
          ],
          correct: 0,
          explanation: 'If \\(\pi_i \propto Y_i\\), then \\(Y_i / \pi_i\\) is constant across all units, resulting in zero variance.'
        },
        {
          prompt: 'What is the primary operational advantage of the Sen-Yates-Grundy variance estimator over the basic Horvitz-Thompson formulation?',
          options: [
            'It prevents negative variance estimates and is guaranteed non-negative when \\(\pi_{ij} \le \pi_i \pi_j\\) with fixed sample size n',
            'It does not require joint inclusion probabilities \\(\pi_{ij}\\)',
            'It applies to arbitrary and varying sample sizes without constraint',
            'It requires only first-order inclusion probabilities'
          ],
          correct: 0,
          explanation: 'The SYG formulation avoids negative variance estimates for designs satisfying \\(\pi_{ij} \le \pi_i \pi_j\\) with fixed n.'
        },
        {
          prompt: 'In a sample of 2 primary sampling units under PPSWR with \\(p_1 = 0.2\\) and \\(p_2 = 0.3\\), the values are \\(Y_1 = 100\\) and \\(Y_2 = 150\\). What is the Hansen-Hurwitz estimated total?',
          options: [
            '500',
            '450',
            '550',
            '600'
          ],
          correct: 0,
          explanation: '(1/2) * [(100/0.2) + (150/0.3)] = (1/2) * [500 + 500] = 500.'
        }
      ]
    },
    {
      id: 'sg_deflator_splicing',
      topic: 'Paasche vs. Laspeyres Splicing & Macro Deflator Bias',
      module: 'National Accounts & Macroeconomic Deflators (Module 2)',
      severity: 'high',
      masteryPct: 50,
      mistakesCount: 1,
      lastMistakeDate: Date.now() - 1000 * 60 * 60 * 6,
      questionsMissed: [
        {
          id: 'qm_3',
          date: Date.now() - 1000 * 60 * 60 * 6,
          assessmentTitle: 'Paasche vs. Laspeyres & GDP Deflator Splicing',
          prompt: 'Why does the Laspeyres price index typically exhibit an upward substitution bias compared to the true cost-of-living index (COLI)?',
          userChoice: 'It uses current-period quantity weights that overvalue luxury items',
          correctChoice: 'It assumes a fixed base-year consumption basket, ignoring consumer substitution toward cheaper relative goods',
          explanation: 'The Laspeyres formula holds base-period consumption weights constant. When relative prices change, consumers substitute away from expensive goods, making Laspeyres overstate inflation.'
        }
      ],
      prepRoadmap: {
        diagnosis: 'Trainees frequently mix up base-period weights (Laspeyres) with current-period weights (Paasche) and the direction of consumer substitution bias in price index numbers.',
        formulas: [
          'P_L = \\frac{\\sum p_t q_0}{\\sum p_0 q_0} \\times 100',
          'P_P = \\frac{\\sum p_t q_t}{\\sum p_0 q_t} \\times 100',
          'P_F = \\sqrt{P_L \\times P_P}'
        ],
        routine: [
          'Review the National Accounts Division (NAD) briefing note on implicit price deflators vs CPI.',
          'Verify by numerical proof why Fisher Ideal Index satisfies the Time and Factor Reversal tests.',
          'Practice splicing two historical index series using arithmetic proportionality linking.'
        ],
        reference: 'Central Statistics Office (CSO) Manual on Consumer Price Index Numbers — Chapter 5 (Index Aggregation).'
      },
      retestQuestions: [
        {
          prompt: 'Which index number formula satisfies both the Time Reversal Test and the Factor Reversal Test simultaneously?',
          options: [
            "Fisher's Ideal Index",
            'Laspeyres Index',
            'Paasche Index',
            'Marshall-Edgeworth Index'
          ],
          correct: 0,
          explanation: "Fisher's index is the geometric mean of Laspeyres and Paasche and satisfies both reversal criteria."
        },
        {
          prompt: 'If Nominal GDP is Rs 115 Lakh Cr and Real GDP at constant base prices is Rs 86 Lakh Cr, what is the implicit GDP Deflator?',
          options: [
            '133.72',
            '128.50',
            '143.75',
            '115.00'
          ],
          correct: 0,
          explanation: '(115 / 86) * 100 = 133.72.'
        },
        {
          prompt: 'When base-year weights are updated during index series rebasing, which method links the new series to the historical series?',
          options: [
            'Splicing (Overlapping period linking factor)',
            'Additive trend extrapolation',
            'Direct geometric trimming',
            'Simple arithmetic subtraction'
          ],
          correct: 0,
          explanation: 'Splicing uses the ratio of indices in the common overlapping base year to join the two series.'
        }
      ]
    },
    {
      id: 'sg_dpdp_anonymization',
      topic: 'DPDP Act 2023 Field Microdata Anonymization & K-Anonymity Standard',
      module: 'Data Governance & Legal Compliance (Module 4)',
      severity: 'moderate',
      masteryPct: 65,
      mistakesCount: 1,
      lastMistakeDate: Date.now() - 1000 * 60 * 60 * 18,
      questionsMissed: [
        {
          id: 'qm_4',
          date: Date.now() - 1000 * 60 * 60 * 18,
          assessmentTitle: 'DPDP Governance & Field Security Audit Drill',
          prompt: 'What mathematical criterion defines k-anonymity for public socio-economic microdata dissemination?',
          userChoice: 'At least k attributes must be encrypted with 256-bit AES keys',
          correctChoice: 'Each combination of quasi-identifiers in the released dataset must be shared by at least k distinct individuals',
          explanation: 'A release satisfies k-anonymity if each unique combination of quasi-identifying variables (e.g. age, gender, PIN code) matches at least k individual respondents, preventing re-identification.'
        }
      ],
      prepRoadmap: {
        diagnosis: 'Trainees frequently confuse cryptographic encryption with algorithmic privacy techniques like k-anonymity, l-diversity, and differential privacy.',
        formulas: [
          '\\forall QID = q, \\quad |\\{ r \\in D : QID(r) = q \\}| \\ge k'
        ],
        routine: [
          'Review MoSPI Data Governance Guidelines (2024 Gazette Notification on Microdata Release).',
          'Practice identifying direct identifiers vs quasi-identifiers on NSS Schedule 10 data.',
          'Verify cell suppression threshold (cell count < 3) on district tabular outputs.'
        ],
        reference: 'MoSPI National Data Sharing and Accessibility Policy (NDSAP) Implementation Guide — Section 7.'
      },
      retestQuestions: [
        {
          prompt: 'Under Section 8 of DPDP Act 2023, which of the following is classified as a direct identifier that MUST be stripped prior to public release?',
          options: [
            'Aadhaar / UIDAI number and respondent telephone number',
            'Broad occupation category (NCO 2-digit code)',
            'Household monthly consumer expenditure quintile',
            'District of residence'
          ],
          correct: 0,
          explanation: 'Direct identifiers uniquely distinguish an individual and must be permanently stripped.'
        },
        {
          prompt: 'If a dataset satisfies 5-anonymity, what is the maximum probability that an adversary can uniquely link a known individual to a sensitive attribute without other background knowledge?',
          options: [
            '20% (1/5)',
            '50%',
            '0%',
            '100%'
          ],
          correct: 0,
          explanation: 'With k=5, each equivalence class contains at least 5 records, so the probability of guessing the correct record is at most 1/5 = 20%.'
        },
        {
          prompt: 'What privacy enhancement addresses the flaw in k-anonymity where all individuals in an equivalence class share the exact same sensitive value?',
          options: [
            'l-Diversity',
            'Double-blind hashing',
            'Symmetric key rotation',
            'Proportional cluster sampling'
          ],
          correct: 0,
          explanation: 'l-diversity requires that each equivalence class contains at least l well-represented sensitive values, preventing homogeneity attacks.'
        }
      ]
    },
    {
      id: 'sg_cluster_deff',
      topic: 'Multistage Cluster Sampling: Intra-Class Correlation & Design Effect (Deff)',
      module: 'Survey Sampling Theory & Complex Designs (Module 1)',
      severity: 'resolved',
      masteryPct: 100,
      mistakesCount: 0,
      lastMistakeDate: Date.now() - 1000 * 60 * 60 * 72,
      questionsMissed: [],
      prepRoadmap: {
        diagnosis: 'Mastered! Excellent comprehension of cluster homogeneity and Kish design effect.',
        formulas: [
          '\\text{Deff} = 1 + (m - 1) \\rho',
          'n_{eff} = \\frac{n}{\\text{Deff}}'
        ],
        routine: [
          'Topic has been successfully remediated and verified through targeted retesting.'
        ],
        reference: 'Leslie Kish: Survey Sampling (Chapter 5, Cluster Sampling).'
      },
      retestQuestions: [
        {
          prompt: 'What happens to the Design Effect (Deff) when the intra-cluster correlation coefficient \\(\rho\\) increases for a cluster size m?',
          options: [
            'Deff increases, meaning cluster sampling becomes less efficient relative to SRS',
            'Deff decreases toward zero',
            'Effective sample size increases',
            'Sampling variance decreases'
          ],
          correct: 0,
          explanation: 'Deff = 1 + (m-1)*rho. Higher intra-cluster correlation increases variance, inflating Deff.'
        }
      ]
    }
  ];

  function getSkillGaps() {
    try {
      const saved = localStorage.getItem('nirdesha_skill_gaps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return DEFAULT_SKILL_GAPS;
  }

  function saveSkillGaps(gaps) {
    try {
      localStorage.setItem('nirdesha_skill_gaps', JSON.stringify(gaps));
    } catch (e) {}
    updateSkillGapBadges();
  }

  function updateSkillGapBadges() {
    const gaps = getSkillGaps();
    const activeCount = gaps.filter(g => g.severity !== 'resolved').length;
    const resolvedCount = gaps.filter(g => g.severity === 'resolved').length;

    const badge = document.getElementById('skill-gap-sidebar-badge');
    if (badge) {
      badge.textContent = activeCount;
      badge.style.display = activeCount > 0 ? 'inline-block' : 'none';
    }

    const elActive = document.getElementById('sg-active-count');
    const elResolved = document.getElementById('sg-resolved-count');
    const elReadiness = document.getElementById('sg-readiness-index');
    const elBonus = document.getElementById('sg-mastery-bonus');

    if (elActive) elActive.textContent = `${activeCount} Topics`;
    if (elResolved) elResolved.textContent = `${resolvedCount} Topics`;
    if (elReadiness) {
      const total = gaps.length || 1;
      const rate = Math.round((resolvedCount / total) * 100);
      elReadiness.textContent = `${Math.max(65, rate)}%`;
    }
    if (elBonus) elBonus.textContent = `+${resolvedCount * 50} pts`;
  }

  function recordSkillGapMistake({ topic, assessmentTitle, prompt, userChoice, correctChoice, explanation }) {
    const gaps = getSkillGaps();
    let gap = gaps.find(g => g.topic.toLowerCase() === topic.toLowerCase() || topic.toLowerCase().includes(g.topic.toLowerCase()));

    const mistakeEntry = {
      id: 'qm_' + Date.now(),
      date: Date.now(),
      assessmentTitle: assessmentTitle || 'Assessment',
      prompt: prompt,
      userChoice: userChoice,
      correctChoice: correctChoice,
      explanation: explanation
    };

    if (gap) {
      gap.severity = 'high';
      gap.masteryPct = Math.max(25, gap.masteryPct - 15);
      gap.mistakesCount = (gap.mistakesCount || 0) + 1;
      gap.lastMistakeDate = Date.now();
      if (!gap.questionsMissed) gap.questionsMissed = [];
      gap.questionsMissed.unshift(mistakeEntry);
    } else {
      gap = {
        id: 'sg_' + Date.now(),
        topic: topic,
        module: topic + ' Module',
        severity: 'high',
        masteryPct: 35,
        mistakesCount: 1,
        lastMistakeDate: Date.now(),
        questionsMissed: [mistakeEntry],
        prepRoadmap: {
          diagnosis: `Identified conceptual deficit in ${topic}. Trainee should review core theorems and practice standard MoSPI field derivations.`,
          formulas: [
            '\\text{Relative Variance } = \\frac{Var(\\hat{\\theta})}{\\theta^2}'
          ],
          routine: [
            `Review lecture notes on ${topic}.`,
            'Solve standard numerical practice problems.',
            'Consult the MoSPI National Statistical Training reference module.'
          ],
          reference: 'MoSPI National Statistical Systems Training Academy (NSSTA) Cadre Handbook.'
        },
        retestQuestions: [
          {
            prompt: `Remediation Check: In reviewing ${topic}, what is the fundamental requirement for consistency and asymptotic unbiasedness?`,
            options: [
              'Sample size n increases to infinity while estimator variance tends to zero',
              'Fixed stratum weights without replacement',
              'Non-negative second order multipliers',
              'Zero covariance between auxiliary variables'
            ],
            correct: 0,
            explanation: 'An estimator is consistent if its Mean Squared Error approaches zero as n tends to infinity.'
          }
        ]
      };
      gaps.unshift(gap);
    }

    saveSkillGaps(gaps);
  }

  let currentSkillGapFilter = 'all';

  function renderSkillGapGrid() {
    const grid = document.getElementById('skill-gaps-list');
    if (!grid) return;
    grid.innerHTML = '';
    updateSkillGapBadges();

    const gaps = getSkillGaps();
    const filtered = gaps.filter(g => {
      if (currentSkillGapFilter === 'active') return g.severity !== 'resolved';
      if (currentSkillGapFilter === 'resolved') return g.severity === 'resolved';
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 6px;">
          <h4 style="color: #002b49; margin: 0 0 4px 0;">No Deficits Found in this Filter</h4>
          <p style="font-size: 0.82rem; color: #64748b; margin: 0;">Keep up the great work! Complete evaluations to continuously monitor your cadre competencies.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(gap => {
      const card = document.createElement('div');
      const isResolved = gap.severity === 'resolved';
      card.className = `skill-gap-card ${isResolved ? 'is-resolved' : ''}`;

      const sevClass = isResolved ? 'severity-resolved' : (gap.severity === 'high' ? 'severity-high' : 'severity-mod');
      const sevText = isResolved ? '✓ Cleared & Mastered' : (gap.severity === 'high' ? 'High Attention Required' : 'Moderate Gap');
      const progressColor = isResolved ? '#16a34a' : (gap.severity === 'high' ? '#dc2626' : '#ea580c');
      const dateStr = new Date(gap.lastMistakeDate || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

      card.innerHTML = `
        <div>
          <div class="sg-card-header">
            <div>
              <span class="sg-module-label">${escapeHtml(gap.module || 'Statistical Methodology')}</span>
              <h4 class="sg-topic-title">${escapeHtml(gap.topic)}</h4>
            </div>
            <span class="severity-badge ${sevClass}">${sevText}</span>
          </div>

          <div style="margin: 0.85rem 0;">
            <div class="sg-metrics-strip" style="margin-bottom: 4px;">
              <span>Mastery / Retention Index:</span>
              <strong style="color: ${progressColor};">${gap.masteryPct || 40}%</strong>
            </div>
            <div class="sg-progress-track">
              <div class="sg-progress-fill" style="width: ${gap.masteryPct || 40}%; background: ${progressColor};"></div>
            </div>
          </div>

          <div style="font-size: 0.72rem; color: #64748b; margin-bottom: 0.5rem;">
            <span>${gap.mistakesCount || 1} mistake(s) logged</span> • <span>Last recorded: ${dateStr}</span>
          </div>
        </div>

        <div class="sg-actions-row">
          <button type="button" class="btn-why-gap" data-gap-id="${gap.id}">
            Why?
          </button>
          <button type="button" class="btn-prep-gap" data-gap-id="${gap.id}">
            Suggest Preparation
          </button>
          <button type="button" class="btn-retest-gap" data-gap-id="${gap.id}">
            Retest Topic
          </button>
        </div>
      `;

      card.querySelector('.btn-why-gap').addEventListener('click', () => openWhyMistakeModal(gap));
      card.querySelector('.btn-prep-gap').addEventListener('click', () => openPrepRoadmapModal(gap));
      card.querySelector('.btn-retest-gap').addEventListener('click', () => openRetestModal(gap));

      grid.appendChild(card);
    });
  }

  // Filter pills handler
  document.querySelectorAll('#skill-gap-filter-pills .notif-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#skill-gap-filter-pills .notif-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentSkillGapFilter = pill.getAttribute('data-sg-filter') || 'all';
      renderSkillGapGrid();
    });
  });

  const btnRetestAll = document.getElementById('btn-retest-all-trigger');
  if (btnRetestAll) {
    btnRetestAll.addEventListener('click', () => {
      const gaps = getSkillGaps().filter(g => g.severity !== 'resolved');
      if (gaps.length > 0) {
        openRetestModal(gaps[0]);
      } else {
        alert('All identified skill gaps are currently mastered! Excellent performance.');
      }
    });
  }

  // --------------------------------------------------------------------------
  // "WHY?" HISTORICAL MISTAKE AUDIT MODAL
  // --------------------------------------------------------------------------
  const whyModal = document.getElementById('skill-gap-why-modal');
  const btnCloseWhy = document.getElementById('btn-close-why-modal');
  const btnCancelWhy = document.getElementById('btn-cancel-why-modal');
  const btnWhySuggestPrep = document.getElementById('btn-why-suggest-prep');
  let currentAuditedGap = null;

  if (btnCloseWhy) btnCloseWhy.addEventListener('click', () => whyModal.style.display = 'none');
  if (btnCancelWhy) btnCancelWhy.addEventListener('click', () => whyModal.style.display = 'none');

  if (btnWhySuggestPrep) {
    btnWhySuggestPrep.addEventListener('click', () => {
      whyModal.style.display = 'none';
      if (currentAuditedGap) openPrepRoadmapModal(currentAuditedGap);
    });
  }

  function openWhyMistakeModal(gap) {
    if (!whyModal) return;
    currentAuditedGap = gap;

    const titleEl = document.getElementById('why-modal-topic-title');
    const sumEl = document.getElementById('why-modal-summary-text');
    const qListEl = document.getElementById('why-modal-questions-list');

    if (titleEl) titleEl.textContent = gap.topic;
    if (sumEl) {
      sumEl.textContent = `You have missed ${gap.mistakesCount || 1} question(s) in this topic across recent cadre assessments. Below is the exact historical audit showing what you answered, the correct formulation, and the conceptual reason for the gap.`;
    }

    if (qListEl) {
      qListEl.innerHTML = '';
      const questions = gap.questionsMissed || [];
      if (questions.length === 0) {
        qListEl.innerHTML = '<p style="color:#64748b; font-size:0.85rem;">No historical question logs found for this topic.</p>';
      } else {
        questions.forEach((item, idx) => {
          const card = document.createElement('div');
          card.className = 'audit-question-card';
          const dateStr = new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

          const promptFmt = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(item.prompt) : item.prompt;
          const userFmt = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(item.userChoice) : item.userChoice;
          const correctFmt = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(item.correctChoice) : item.correctChoice;
          const expFmt = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(item.explanation) : item.explanation;

          card.innerHTML = `
            <div class="audit-meta-row">
              <span>Assessment: <strong>${escapeHtml(item.assessmentTitle || 'Mock Assessment')}</strong></span>
              <span>Attempted: ${dateStr}</span>
            </div>
            <div class="audit-prompt-text">${promptFmt}</div>

            <div class="audit-answer-box audit-ans-wrong">
              <strong>✗ Your Answer:</strong> ${userFmt}
            </div>

            <div class="audit-answer-box audit-ans-correct">
              <strong>✓ Correct Answer:</strong> ${correctFmt}
            </div>

            <div class="audit-explanation-box">
              <strong>Conceptual Analysis:</strong> ${expFmt}
            </div>
          `;
          qListEl.appendChild(card);
        });
      }
    }

    whyModal.style.display = 'flex';
  }

  // --------------------------------------------------------------------------
  // AI STUDY PREPARATION ROADMAP MODAL
  // --------------------------------------------------------------------------
  const prepModal = document.getElementById('skill-gap-prep-modal');
  const btnClosePrep = document.getElementById('btn-close-prep-modal');
  const btnCancelPrep = document.getElementById('btn-cancel-prep-modal');
  const btnPrepStudyMentor = document.getElementById('btn-prep-study-mentor');
  const btnPrepLaunchRetest = document.getElementById('btn-prep-launch-retest');
  let currentPrepGap = null;

  if (btnClosePrep) btnClosePrep.addEventListener('click', () => prepModal.style.display = 'none');
  if (btnCancelPrep) btnCancelPrep.addEventListener('click', () => prepModal.style.display = 'none');

  if (btnPrepStudyMentor) {
    btnPrepStudyMentor.addEventListener('click', () => {
      prepModal.style.display = 'none';
      if (typeof switchTab === 'function') {
        switchTab('ai-mentor');
        if (currentPrepGap) {
          setTimeout(() => {
            const query = `I have a skill gap in "${currentPrepGap.topic}". Please explain the underlying theoretical foundation, formulas, common traps, and practical calculation steps so I can pass my retest.`;
            if (typeof handleTraineeChat === 'function') handleTraineeChat(query);
          }, 300);
        }
      }
    });
  }

  if (btnPrepLaunchRetest) {
    btnPrepLaunchRetest.addEventListener('click', () => {
      prepModal.style.display = 'none';
      if (currentPrepGap) openRetestModal(currentPrepGap);
    });
  }

  function openPrepRoadmapModal(gap) {
    if (!prepModal) return;
    currentPrepGap = gap;

    const titleEl = document.getElementById('prep-modal-topic-title');
    const contentEl = document.getElementById('prep-modal-content');

    if (titleEl) titleEl.textContent = `Remediation Roadmap: ${gap.topic}`;

    const roadmap = gap.prepRoadmap || {
      diagnosis: 'Review standard formulation and practice problem sets.',
      formulas: ['\\hat{Y} = \\sum y_i / \\pi_i'],
      routine: ['10m reading', '10m derivation', '10m practice'],
      reference: 'MoSPI Training Guide'
    };

    let formulasHtml = '';
    (roadmap.formulas || []).forEach(f => {
      const formattedF = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(f) : f;
      formulasHtml += `<div class="prep-formula-box">${formattedF}</div>`;
    });

    let routineHtml = '';
    (roadmap.routine || []).forEach((r, idx) => {
      routineHtml += `
        <div class="prep-checklist-item">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:50%; background:#0284c7; color:#fff; font-size:0.7rem; font-weight:800; flex-shrink:0;">${idx + 1}</span>
          <span>${escapeHtml(r)}</span>
        </div>
      `;
    });

    if (contentEl) {
      contentEl.innerHTML = `
        <!-- Section 1: Diagnosis -->
        <div class="prep-section-block" style="border-left: 3.5px solid #0284c7;">
          <h5 class="prep-block-title">Diagnostic Root-Cause Analysis</h5>
          <p style="font-size: 0.83rem; color: #334155; line-height: 1.5; margin: 0;">
            ${escapeHtml(roadmap.diagnosis || '')}
          </p>
        </div>

        <!-- Section 2: Formulas -->
        <div class="prep-section-block" style="border-left: 3.5px solid #ea580c;">
          <h5 class="prep-block-title">Key Mathematical Formulas & Theorems to Memorize</h5>
          <p style="font-size: 0.78rem; color: #64748b; margin: 0 0 0.5rem 0;">
            Commit these exact expressions to memory before attempting your topic retest:
          </p>
          ${formulasHtml}
        </div>

        <!-- Section 3: 30-Min Sprint -->
        <div class="prep-section-block" style="border-left: 3.5px solid #16a34a;">
          <h5 class="prep-block-title">30-Minute High-Yield Study Sprint Checklist</h5>
          ${routineHtml}
        </div>

        <!-- Section 4: Official Manual Citation -->
        <div class="prep-section-block" style="border-left: 3.5px solid #002b49; background: #f8fafc;">
          <h5 class="prep-block-title">Official MoSPI Training Reference</h5>
          <p style="font-size: 0.8rem; color: #002b49; font-weight: 700; margin: 0;">
            ${escapeHtml(roadmap.reference || 'MoSPI Cadre Training Material')}
          </p>
        </div>
      `;
    }

    prepModal.style.display = 'flex';
  }

  // --------------------------------------------------------------------------
  // TARGETED RETEST MODAL & GAP RESOLUTION
  // --------------------------------------------------------------------------
  const retestModal = document.getElementById('skill-gap-retest-modal');
  const btnCloseRetest = document.getElementById('btn-close-retest-modal');
  const btnCancelRetest = document.getElementById('btn-cancel-retest-modal');
  const btnRetestNext = document.getElementById('btn-retest-next');
  const btnRetestSubmit = document.getElementById('btn-retest-submit');
  const retestBodyEl = document.getElementById('retest-modal-body');

  let currentRetestGap = null;
  let retestQuestionIndex = 0;
  let retestUserAnswers = [];

  let isRetestActive = false;

  function closeRetestModal() {
    if (isRetestActive) {
      if (!confirm("Retest is currently in progress. Exit without completing? Your retest progress will not be saved.")) {
        return;
      }
    }
    isRetestActive = false;
    if (retestModal) retestModal.style.display = 'none';
    renderSkillGapGrid();
  }

  if (btnCloseRetest) btnCloseRetest.onclick = closeRetestModal;
  if (btnCancelRetest) btnCancelRetest.onclick = closeRetestModal;
  if (retestModal) {
    retestModal.addEventListener('click', (e) => {
      if (e.target === retestModal) closeRetestModal();
    });
  }

  function openRetestModal(gap) {
    if (!retestModal) return;
    currentRetestGap = gap;
    retestQuestionIndex = 0;
    retestUserAnswers = [];

    const titleEl = document.getElementById('retest-modal-topic-title');
    if (titleEl) titleEl.textContent = `Topic Retest: ${gap.topic}`;

    isRetestActive = true;
    retestModal.style.display = 'flex';
    renderRetestQuestion(0);
  }

  function renderRetestQuestion(idx) {
    if (!currentRetestGap || !currentRetestGap.retestQuestions) return;
    const questions = currentRetestGap.retestQuestions;
    const q = questions[idx];
    if (!q || !retestBodyEl) return;

    const isLast = idx === questions.length - 1;
    if (btnRetestNext) btnRetestNext.style.display = isLast ? 'none' : 'inline-block';
    if (btnRetestSubmit) btnRetestSubmit.style.display = isLast ? 'inline-block' : 'none';

    let optionsHtml = '';
    q.options.forEach((opt, optIdx) => {
      const optFmt = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(opt) : opt;
      optionsHtml += `
        <div class="proctor-option-item retest-opt-item" data-opt-idx="${optIdx}">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; border:1.5px solid #cbd5e1; font-size:0.75rem; font-weight:800;">${String.fromCharCode(65 + optIdx)}</span>
          <span>${optFmt}</span>
        </div>
      `;
    });

    const promptFmt = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(q.prompt) : q.prompt;

    retestBodyEl.innerHTML = `
      <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; font-weight: 700;">
        <span>Question ${idx + 1} of ${questions.length}</span>
        <span>Topic: <strong>${escapeHtml(currentRetestGap.topic)}</strong></span>
      </div>
      <div class="proctor-q-text" style="margin-bottom: 1.25rem;">
        ${promptFmt}
      </div>
      <div id="retest-options-container">
        ${optionsHtml}
      </div>
    `;

    retestBodyEl.querySelectorAll('.retest-opt-item').forEach(el => {
      el.addEventListener('click', () => {
        retestBodyEl.querySelectorAll('.retest-opt-item').forEach(b => b.classList.remove('selected'));
        el.classList.add('selected');
      });
    });
  }

  function advanceRetest() {
    if (!currentRetestGap) return;
    const q = currentRetestGap.retestQuestions[retestQuestionIndex];
    const selectedEl = retestBodyEl ? retestBodyEl.querySelector('.retest-opt-item.selected') : null;
    const selectedIdx = selectedEl ? parseInt(selectedEl.getAttribute('data-opt-idx'), 10) : -1;

    retestUserAnswers.push({
      questionIndex: retestQuestionIndex,
      selected: selectedIdx,
      correct: q.correct,
      isCorrect: selectedIdx === q.correct
    });

    if (retestQuestionIndex < currentRetestGap.retestQuestions.length - 1) {
      retestQuestionIndex++;
      renderRetestQuestion(retestQuestionIndex);
    } else {
      finalizeRetest();
    }
  }

  if (btnRetestNext) btnRetestNext.addEventListener('click', advanceRetest);
  if (btnRetestSubmit) btnRetestSubmit.addEventListener('click', advanceRetest);

  function finalizeRetest() {
    const totalQ = currentRetestGap.retestQuestions.length;
    const correctQ = retestUserAnswers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctQ / totalQ) * 100);
    isRetestActive = false;
    const passed = accuracy >= 66; // 2 out of 3 or higher

    if (passed) {
      // Mark gap as Mastered!
      currentRetestGap.severity = 'resolved';
      currentRetestGap.masteryPct = 100;
      const gaps = getSkillGaps();
      const targetIdx = gaps.findIndex(g => g.id === currentRetestGap.id);
      if (targetIdx >= 0) {
        gaps[targetIdx] = currentRetestGap;
        saveSkillGaps(gaps);
      }

      // Award +50 Elo Mastery Bonus
      try {
        let profileScore = parseInt(localStorage.getItem('nirdesha_trainee_score') || '1420', 10);
        profileScore += 50;
        localStorage.setItem('nirdesha_trainee_score', profileScore.toString());
        const scoreEl = document.getElementById('public-elo-score');
        if (scoreEl) scoreEl.textContent = profileScore;
      } catch (e) {}
    }

    if (retestBodyEl) {
      retestBodyEl.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
          
          <h3 style="font-size: 1.35rem; font-weight: 900; color: #002b49; margin: 0 0 6px 0;">
            ${passed ? 'Weak Area Cleared & Mastered!' : 'Retest Completed — Needs Further Review'}
          </h3>
          <p style="font-size: 0.85rem; color: #64748b; margin: 0 0 1.25rem 0;">
            Accuracy: <strong>${accuracy}% (${correctQ} / ${totalQ} correct)</strong>
          </p>
          <div style="display: inline-block; padding: 0.75rem 1.5rem; background: ${passed ? '#f0fdf4' : '#fff7ed'}; border: 1.5px solid ${passed ? '#86efac' : '#fdba74'}; border-radius: 6px; margin-bottom: 1.25rem;">
            <strong style="color: ${passed ? '#166534' : '#c2410c'}; font-size: 0.85rem;">
              ${passed ? '✓ Competency status updated to Mastered (+50 Elo awarded)' : 'Continue reviewing formulas before re-attempting.'}
            </strong>
          </div>
        </div>
      `;
    }

    if (btnRetestNext) btnRetestNext.style.display = 'none';
    if (btnRetestSubmit) {
      btnRetestSubmit.textContent = 'Close & View Skill Radar ▶';
      btnRetestSubmit.style.display = 'inline-block';
      btnRetestSubmit.onclick = () => {
        retestModal.style.display = 'none';
        renderSkillGapGrid();
      };
    }
  }

  // --------------------------------------------------------------------------
  // SKILL GAP METRIC DOCUMENTATION MODAL ("HOW IT WORKS")
  // --------------------------------------------------------------------------
  const metricDocModal = document.getElementById('metric-doc-modal');
  const btnCloseMetricDoc = document.getElementById('btn-close-metric-doc');
  const btnDoneMetricDoc = document.getElementById('btn-done-metric-doc');
  const metricDocPills = document.querySelectorAll('#metric-doc-pills .notif-pill');

  function openMetricDoc(metricKey) {
    if (!metricDocModal) return;
    const key = metricKey || 'active';

    if (metricDocPills) {
      metricDocPills.forEach(p => {
        const isTarget = p.getAttribute('data-doc-target') === key;
        p.classList.toggle('active', isTarget);
      });
    }

    document.querySelectorAll('.metric-doc-pane').forEach(pane => {
      pane.style.display = pane.id === `doc-pane-${key}` ? 'block' : 'none';
    });

    metricDocModal.style.display = 'flex';
  }

  if (metricDocPills) {
    metricDocPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = pill.getAttribute('data-doc-target');
        openMetricDoc(target);
      });
    });
  }

  if (btnCloseMetricDoc) btnCloseMetricDoc.addEventListener('click', () => metricDocModal.style.display = 'none');
  if (btnDoneMetricDoc) btnDoneMetricDoc.addEventListener('click', () => metricDocModal.style.display = 'none');

  document.querySelectorAll('.btn-metric-how').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-metric') || 'active';
      openMetricDoc(key);
    });
  });

  document.querySelectorAll('.metric-interactive-box').forEach(box => {
    box.addEventListener('click', () => {
      const key = box.getAttribute('data-metric-key') || 'active';
      openMetricDoc(key);
    });
  });


  // --------------------------------------------------------------------------
  // AI QUIZ METRIC DOCUMENTATION MODAL ("HOW IT WORKS")
  // --------------------------------------------------------------------------
  const quizMetricDocModal = document.getElementById('quiz-metric-doc-modal');
  const btnCloseQuizMetricDoc = document.getElementById('btn-close-quiz-metric-doc');
  const btnDoneQuizMetricDoc = document.getElementById('btn-done-quiz-metric-doc');
  const quizMetricDocPills = document.querySelectorAll('#quiz-metric-doc-pills .notif-pill');

  function openQuizMetricDoc(metricKey) {
    if (!quizMetricDocModal) return;
    const key = metricKey || 'elo';

    if (quizMetricDocPills) {
      quizMetricDocPills.forEach(p => {
        const isTarget = p.getAttribute('data-quiz-doc-target') === key;
        p.classList.toggle('active', isTarget);
      });
    }

    document.querySelectorAll('#quiz-metric-doc-content .metric-doc-pane').forEach(pane => {
      pane.style.display = pane.id === `doc-pane-quiz-${key}` ? 'block' : 'none';
    });

    quizMetricDocModal.style.display = 'flex';
  }

  if (quizMetricDocPills) {
    quizMetricDocPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = pill.getAttribute('data-quiz-doc-target');
        openQuizMetricDoc(target);
      });
    });
  }

  if (btnCloseQuizMetricDoc) btnCloseQuizMetricDoc.addEventListener('click', () => quizMetricDocModal.style.display = 'none');
  if (btnDoneQuizMetricDoc) btnDoneQuizMetricDoc.addEventListener('click', () => quizMetricDocModal.style.display = 'none');

  document.querySelectorAll('.btn-metric-how[data-quiz-metric]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-quiz-metric') || 'elo';
      openQuizMetricDoc(key);
    });
  });

  document.querySelectorAll('.metric-interactive-box[data-quiz-metric-key]').forEach(box => {
    box.addEventListener('click', () => {
      const key = box.getAttribute('data-quiz-metric-key') || 'elo';
      openQuizMetricDoc(key);
    });
  });

  window.openQuizMetricDoc = openQuizMetricDoc;

  // Expose on window
  window.openMetricDoc = openMetricDoc;
  window.renderSkillGapGrid = renderSkillGapGrid;
  window.recordSkillGapMistake = recordSkillGapMistake;

  // Initialize Skill Gap Grid
  renderSkillGapGrid();
  updateSkillGapBadges();


  // Expose on window for cross-component invocations
  window.renderCustomQuizzesGrid = renderCustomQuizzesGrid;
  window.updateQuizBadges = updateQuizBadges;
  window.renderClaudeQuizWizardInChat = renderClaudeQuizWizardInChat;

  // Initialize Quiz Sub-Nav and Default Lists
  initQuizSubnav();
  renderCustomQuizzesGrid();
  updateQuizBadges();

});


  // --------------------------------------------------------------------------
  // UNIVERSAL BACKDROP CLICK DISMISS FOR ALL GUIDANCE & PREVIEW MODALS
  // --------------------------------------------------------------------------
  const allGuidanceModals = [
    document.getElementById('skill-gap-why-modal'),
    document.getElementById('skill-gap-prep-modal'),
    document.getElementById('marksheet-modal'),
    document.getElementById('quarterly-dispatch-modal'),
    document.getElementById('metric-doc-modal'),
    document.getElementById('quiz-metric-doc-modal'),
    document.getElementById('export-notes-modal'),
    document.getElementById('banner-library-modal')
  ];

  allGuidanceModals.forEach(m => {
    if (!m) return;
    m.addEventListener('click', (e) => {
      // If user clicked the side blank space (the backdrop container itself)
      if (e.target === m) {
        m.style.display = 'none';
      }
    });
  });

  // Past Conversations Flyout Drawer Outside-Click Auto-Close
  document.addEventListener('click', (e) => {
    const drawer = document.getElementById('mentor-history-drawer');
    const burger = document.getElementById('btn-mentor-burger-history');
    if (drawer && drawer.style.display !== 'none') {
      if (!drawer.contains(e.target) && (!burger || !burger.contains(e.target))) {
        drawer.style.display = 'none';
      }
    }
  });

  // Global ESC key to close active guidance or popups
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      allGuidanceModals.forEach(m => {
        if (m && m.style.display !== 'none') m.style.display = 'none';
      });
      const drawer = document.getElementById('mentor-history-drawer');
      if (drawer && drawer.style.display !== 'none') drawer.style.display = 'none';
      const bannerDropdown = document.getElementById('banner-edit-dropdown');
      if (bannerDropdown && bannerDropdown.style.display !== 'none') {
        bannerDropdown.style.display = 'none';
        const btnBannerEdit = document.getElementById('btn-banner-edit-menu');
        if (btnBannerEdit) btnBannerEdit.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // --------------------------------------------------------------------------
  // PROFILE BANNER LIBRARY & CUSTOM UPLOAD CONTROLLER
  // --------------------------------------------------------------------------
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
      desc: 'Glowing molten magma cracks beneath dark volcanic plates',
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
        const symbols = [
          '+','−','×','÷','=','≠','≈','∞','√','∑','∏','∫','∂','∆','π','θ','λ','μ','σ','ω',
          'α','β','γ','δ','ε','ζ','η','ι','κ','ν','ξ','ρ','τ','φ','χ','ψ','∈','∉','∩','∪',
          '⊂','⊃','⊆','⊇','∧','∨','¬','⇒','⇔','∀','∃','ℕ','ℤ','ℚ','ℝ','ℂ','|','∥','∠','⊥',
          '≅','∝','∴','∵','⊕','⊗','⊥','⊢','⊨','∇'
        ];
        let str = '<div class="jp-matrix">';
        for (let i = 0; i < 10; i++) {
          symbols.forEach(s => {
            str += `<span>${s}</span>`;
          });
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

  function renderBannerIntoStage(targetEl, mode, value) {
    if (!targetEl) return;

    let baseClass = 'profile-banner-stage';
    if (targetEl.id === 'banner-preview-viewport' || targetEl.classList.contains('banner-preview-viewport')) {
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

  function initProfileBannerEngine() {
    try {
      const bannerStage = document.getElementById('public-profile-banner-stage');
      const btnBannerEditMenu = document.getElementById('btn-banner-edit-menu');
      const bannerEditDropdown = document.getElementById('banner-edit-dropdown');
      const btnBannerOptUpload = document.getElementById('btn-banner-opt-upload');
      const btnBannerOptLibrary = document.getElementById('btn-banner-opt-library');
      const bannerFileInput = document.getElementById('public-banner-file-input');

      const bannerLibraryModal = document.getElementById('banner-library-modal');
      const bannerLibrarySelect = document.getElementById('banner-library-select');
      const bannerPreviewViewport = document.getElementById('banner-preview-viewport');
      const bannerPreviewName = document.getElementById('banner-preview-name');
      const bannerMenuGrid = document.getElementById('banner-menu-grid') || document.getElementById('banner-cards-grid');
      const btnCloseBannerLibrary = document.getElementById('btn-close-banner-library');
      const btnBannerLibraryCancel = document.getElementById('btn-banner-library-cancel');
      const btnBannerLibraryApply = document.getElementById('btn-banner-library-apply');
      const btnBannerResetDefault = document.getElementById('btn-banner-reset-default');
      const btnLibrarySwitchUpload = document.getElementById('btn-library-switch-upload');

      // Load active banner from localStorage
      let currentBannerMode = localStorage.getItem('nirdesha_profile_banner_mode') || 'pattern';
      let currentBannerPattern = localStorage.getItem('nirdesha_profile_banner_pattern') || 'default';
      let currentBannerCustom = localStorage.getItem('nirdesha_profile_banner_custom') || '';

      function applyActiveBannerToProfile() {
        const stage = document.getElementById('public-profile-banner-stage');
        if (!stage) return;
        if (currentBannerMode === 'custom' && currentBannerCustom) {
          renderBannerIntoStage(stage, 'custom', currentBannerCustom);
        } else {
          renderBannerIntoStage(stage, 'pattern', currentBannerPattern);
        }
      }
      applyActiveBannerToProfile();

      // Dropdown menu toggling & dismissal
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

      // Upload from computer option (< 5MB, GIF & images)
      function triggerBannerUpload(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (bannerEditDropdown) {
          bannerEditDropdown.style.display = 'none';
          if (btnBannerEditMenu) btnBannerEditMenu.setAttribute('aria-expanded', 'false');
        }
        if (bannerLibraryModal) bannerLibraryModal.style.display = 'none';
        if (bannerFileInput) bannerFileInput.click();
      }

      if (btnBannerOptUpload) {
        btnBannerOptUpload.addEventListener('click', triggerBannerUpload);
      }
      if (btnLibrarySwitchUpload) {
        btnLibrarySwitchUpload.addEventListener('click', triggerBannerUpload);
      }

      if (bannerFileInput) {
        bannerFileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;

          // Check format: GIF & image
          const isImage = file.type.startsWith('image/') || /\.(gif|png|jpe?g|webp|svg)$/i.test(file.name);
          if (!isImage) {
            alert('Invalid file format. Please upload an image or GIF file.');
            bannerFileInput.value = '';
            return;
          }

          // Check size: < 5MB
          const MAX_SIZE = 5 * 1024 * 1024;
          if (file.size > MAX_SIZE) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
            alert(`File size (${sizeMb} MB) exceeds the 5MB limit. Please upload an image or GIF less than 5MB.`);
            bannerFileInput.value = '';
            return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            currentBannerMode = 'custom';
            currentBannerCustom = dataUrl;
            localStorage.setItem('nirdesha_profile_banner_mode', 'custom');
            localStorage.setItem('nirdesha_profile_banner_custom', dataUrl);
            applyActiveBannerToProfile();
            bannerFileInput.value = '';

            const toast = document.getElementById('public-profile-toast');
            if (toast) {
              toast.textContent = '✓ Custom Cover Banner Applied Successfully!';
              toast.style.display = 'block';
              setTimeout(() => { toast.style.display = 'none'; }, 3500);
            }
          };
          reader.readAsDataURL(file);
        });
      }

      // Banner Library Modal handling
      let previewPatternId = currentBannerPattern;

      function updateLibraryPreview(patternId) {
        previewPatternId = String(patternId);
        const preset = BANNER_PRESETS.find(p => p.id === previewPatternId) || BANNER_PRESETS[0];
        if (bannerPreviewName) bannerPreviewName.textContent = preset.name;
        if (bannerLibrarySelect) bannerLibrarySelect.value = preset.id;
        if (bannerPreviewViewport) renderBannerIntoStage(bannerPreviewViewport, 'pattern', preset.id);

        // Highlight active item in menu grid
        if (bannerMenuGrid) {
          bannerMenuGrid.querySelectorAll('.banner-menu-item').forEach(item => {
            if (item.getAttribute('data-pattern-id') === preset.id) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });
        }
      }

      // Populate visual menu items (clean, contained, zero-glitch)
      if (bannerMenuGrid) {
        bannerMenuGrid.innerHTML = '';
        BANNER_PRESETS.forEach(preset => {
          const item = document.createElement('button');
          item.type = 'button';
          item.className = 'banner-menu-item';
          item.setAttribute('data-pattern-id', preset.id);
          item.innerHTML = `
            <div class="banner-menu-swatch" style="${preset.swatchStyle || ''}"></div>
            <div class="banner-menu-info">
              <div class="banner-menu-title">${preset.name}</div>
              <div class="banner-menu-badge">${preset.badge}</div>
            </div>
            <div class="banner-menu-check">✓</div>
          `;
          item.addEventListener('click', () => {
            updateLibraryPreview(preset.id);
          });
          item.addEventListener('dblclick', () => {
            updateLibraryPreview(preset.id);
            applyBannerSelection();
          });
          bannerMenuGrid.appendChild(item);
        });
      }

      function openBannerLibraryModal() {
        if (bannerEditDropdown) bannerEditDropdown.style.display = 'none';
        if (btnBannerEditMenu) btnBannerEditMenu.setAttribute('aria-expanded', 'false');
        if (bannerLibraryModal) {
          bannerLibraryModal.style.display = 'flex';
          updateLibraryPreview(currentBannerMode === 'pattern' ? currentBannerPattern : 'default');
        }
      }

      if (btnBannerOptLibrary) {
        btnBannerOptLibrary.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openBannerLibraryModal();
        });
      }

      if (bannerLibrarySelect) {
        bannerLibrarySelect.addEventListener('change', (e) => {
          updateLibraryPreview(e.target.value);
        });
      }

      function applyBannerSelection() {
        currentBannerMode = 'pattern';
        currentBannerPattern = previewPatternId;
        localStorage.setItem('nirdesha_profile_banner_mode', 'pattern');
        localStorage.setItem('nirdesha_profile_banner_pattern', currentBannerPattern);
        applyActiveBannerToProfile();
        if (bannerLibraryModal) bannerLibraryModal.style.display = 'none';

        const toast = document.getElementById('public-profile-toast');
        if (toast) {
          toast.textContent = '✓ Profile Cover Banner Updated Successfully!';
          toast.style.display = 'block';
          setTimeout(() => { toast.style.display = 'none'; }, 3500);
        }
      }

      if (btnBannerLibraryApply) {
        btnBannerLibraryApply.addEventListener('click', applyBannerSelection);
      }

      if (btnBannerResetDefault) {
        btnBannerResetDefault.addEventListener('click', () => {
          updateLibraryPreview('default');
        });
      }

      function closeLibraryModal() {
        if (bannerLibraryModal) bannerLibraryModal.style.display = 'none';
      }

      if (btnCloseBannerLibrary) btnCloseBannerLibrary.addEventListener('click', closeLibraryModal);
      if (btnBannerLibraryCancel) btnBannerLibraryCancel.addEventListener('click', closeLibraryModal);

      if (bannerLibraryModal) {
        bannerLibraryModal.addEventListener('click', (e) => {
          if (e.target === bannerLibraryModal) {
            closeLibraryModal();
          }
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bannerLibraryModal && bannerLibraryModal.style.display !== 'none') {
          closeLibraryModal();
        }
      });
    } catch (err) {
      console.error('Error in initProfileBannerEngine:', err);
    }
  }
  // Initialize Profile Banner Engine
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileBannerEngine);
  } else {
    initProfileBannerEngine();
  }


  // ==========================================================================
  // NIRDESHA FLOATING NOTIFICATION TOAST HELPER
  // ==========================================================================
  function showNirdeshaToast(htmlMessage) {
    let toastEl = document.getElementById('nirdesha-floating-toast');
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'nirdesha-floating-toast';
      toastEl.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 999999; background: #002b49; color: #ffffff; padding: 0.75rem 1.25rem; border-radius: 6px; border-left: 4px solid #ea580c; box-shadow: 0 8px 24px rgba(0,0,0,0.35); font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.75rem; animation: tabFadeInUp 0.2s ease forwards;';
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = htmlMessage;
    toastEl.style.display = 'flex';
    const tabLink = toastEl.querySelector('.toast-tab-link');
    if (tabLink) {
      tabLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('revision-cards');
        toastEl.style.display = 'none';
      });
    }
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      if (toastEl) toastEl.style.display = 'none';
    }, 5000);
  }

  // ==========================================================================
  // INTELLIGENT REVISION FLASHCARD EXTRACTION ALGORITHM
  // (Extracts ONLY important revision formulas, proofs, definitions & rules)
  // ==========================================================================
  function extractRevisionFlashcard(note, notebookName) {
    const rawText = (note.content || note.text || (note.html ? note.html.replace(/<[^>]+>/g, ' ') : '')).trim();
    const title = (note.title || 'Study Note').trim();

    // 1. Subject / Topic Detection
    let topic = (note.tags && note.tags[0]) || '';
    if (!topic) {
      if (/sampling|variance|estimator|neyman|horvitz/i.test(title + ' ' + rawText)) topic = 'Sampling Design';
      else if (/deflator|gva|gdp|paasche|laspeyres|sut/i.test(title + ' ' + rawText)) topic = 'National Accounts';
      else if (/capi|gps|imputation|field|listing/i.test(title + ' ' + rawText)) topic = 'CAPI Protocol';
      else if (/dpdp|anonymization|microdata|privacy/i.test(title + ' ' + rawText)) topic = 'Data Governance';
      else if (/plfs|activity status|labour/i.test(title + ' ' + rawText)) topic = 'Labour Statistics';
      else topic = notebookName || 'Cadre Revision';
    }

    // 2. Active Recall Question Formulation (Front of Flashcard)
    let question = `What are the core principles, formulas, and operational rules governing "${title}"?`;
    if (/formula|identity|equation|estimator/i.test(title)) {
      question = `State the mathematical formulation, estimators, and underlying assumptions for ${title}.`;
    } else if (/rule|protocol|guideline|tolerance|capi/i.test(title)) {
      question = `What are the mandatory tolerances, verification criteria, and protocols for ${title}?`;
    } else if (/proof|theorem|variance/i.test(title)) {
      question = `State the theorem condition, non-negativity parameters, and variance formulation for ${title}.`;
    }

    // 3. Filter out conversational pleasantries & extract high-yield revision items
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const bullets = [];
    let summary = '';

    lines.forEach(line => {
      // Strip pleasantries and conversational filler
      if (/^(certainly|here is|hello|sure|let me|in this note|hope this|as discussed|note that|please note|welcome|in summary)/i.test(line)) return;

      const hasMath = /\\\(|\\\|E\[|V_|P_L|P_P|GVA|GDP|\\frac|\\sum|\\sqrt|\\times|=|\+|-|\\pi|\\hat/i.test(line);
      const hasTheorem = /theorem:|rule:|unbiasedness:|variance:|identity:|definition:|tolerance:|geo-fencing:|imputation:/i.test(line);
      const hasThreshold = /\d+(\.\d+)?\s*(meters?|days?|percent|%|round|decile|tolerance|boundary|hours?)/i.test(line);
      const isBullet = /^[▸•\-\*]|\b\d+\.\s+\*\*/.test(line);

      const cleanLine = line.replace(/^[▸•\-\*#\d\.]+\s*/, '').replace(/\*\*/g, '').trim();

      if (!summary && (hasTheorem || (hasMath && line.includes('=')))) {
        summary = cleanLine;
      } else if (hasMath || hasTheorem || hasThreshold || isBullet) {
        if (cleanLine.length > 8 && cleanLine.length < 240 && !bullets.some(b => b.text === cleanLine)) {
          let label = 'Core Takeaway';
          if (/formula|estimator|equation|identity/i.test(cleanLine)) label = 'Formula / Identity';
          else if (/variance|unbiasedness|proof|theorem/i.test(cleanLine)) label = 'Theorem / Variance';
          else if (/tolerance|gps|meter|listing|protocol/i.test(cleanLine)) label = 'Field Protocol';
          else if (/imputation|matching|stratum/i.test(cleanLine)) label = 'Imputation Rule';
          else if (/bias|substitution/i.test(cleanLine)) label = 'Index Bias';
          bullets.push({ label, text: cleanLine });
        }
      }
    });

    if (!summary) {
      if (bullets.length > 0) {
        summary = bullets.shift().text;
      } else {
        summary = rawText.slice(0, 140) + '...';
      }
    }

    const finalBullets = bullets.slice(0, 3);
    if (finalBullets.length === 0) {
      finalBullets.push({ label: 'Revision Rule', text: summary });
    }

    return {
      id: 'fc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      sourceNoteId: note.id,
      sourceNotebookId: note.notebookId,
      sourceNotebookName: notebookName,
      sourceNoteTitle: title,
      topic: topic,
      title: title,
      question: question,
      summary: summary,
      bullets: finalBullets,
      sourceLabel: `From Note: ${title.slice(0, 24)}${title.length > 24 ? '...' : ''}`,
      isCustom: true,
      isPinned: false, // Can be pinned in revision card area!
      isFlipped: false,
      createdAt: Date.now()
    };
  }

  // ==========================================================================
  // REVISION CARDS & FLASHCARDS DECK ENGINE
  // ==========================================================================
  const SEED_CADRE_REVISION_CARDS = [
    {
      id: 'cadre_rc_1',
      topic: 'Sampling Design',
      title: 'Horvitz-Thompson Estimator & Multipliers',
      question: 'What are the formulation, unbiasedness guarantee, and fixed sample size variance of the Horvitz-Thompson estimator?',
      summary: 'Y_HT = ∑(y_i / π_i) — Design-unbiased for arbitrary sampling designs.',
      bullets: [
        { label: 'Unbiasedness', text: 'E[Y_HT] = Y is guaranteed regardless of sampling structure.' },
        { label: 'Variance Formulation', text: 'Sen-Yates-Grundy variance formulation applies when sample size is fixed.' },
        { label: 'Multiplier Rule', text: 'Inverse sampling probabilities ensure design-unbiased estimates in NSS frames.' }
      ],
      sourceLabel: 'MoSPI Cadre Standard',
      isCustom: false,
      isPinned: false,
      isFlipped: false,
      createdAt: 1700000000000
    },
    {
      id: 'cadre_rc_2',
      topic: 'National Accounts',
      title: 'Supply and Use Tables (SUT) Balance',
      question: 'State the benchmark accounting identity and base year structural weights for Supply and Use Tables (SUT).',
      summary: 'Total Supply at Purchasers\' Prices = Total Use at Purchasers\' Prices.',
      bullets: [
        { label: 'Accounting Identity', text: 'Total Supply at Purchasers\' Prices = Total Use at Purchasers\' Prices.' },
        { label: 'Base Year', text: '2011-12 benchmark tables provide structural weights for GDP deflators.' },
        { label: 'Deflator Splicing', text: 'Double deflation methodology requires balanced SUT frameworks.' }
      ],
      sourceLabel: 'MoSPI Cadre Standard',
      isCustom: false,
      isPinned: false,
      isFlipped: false,
      createdAt: 1700000001000
    },
    {
      id: 'cadre_rc_3',
      topic: 'CAPI Protocol',
      title: 'GPS Verification & Non-Response Imputation',
      question: 'What are the CAPI geo-fencing tolerances and donor matching rules for household non-response?',
      summary: 'GPS coordinates must match census enumeration block within 50-meter tolerance.',
      bullets: [
        { label: 'Validation', text: 'GPS coordinates must match census enumeration block within 50-meter tolerance.' },
        { label: 'Imputation', text: 'Hot-deck donor imputation is applied for item non-response.' },
        { label: 'Matching Cells', text: 'Matches by rural/urban stratum, household size decile, and NCO occupation.' }
      ],
      sourceLabel: 'MoSPI Cadre Standard',
      isCustom: false,
      isPinned: false,
      isFlipped: false,
      createdAt: 1700000002000
    },
    {
      id: 'cadre_rc_4',
      topic: 'Price Index Numbers',
      title: 'CPI Basket Splicing & Substitution Bias',
      question: 'How do Laspeyres and Paasche substitution biases differ, and how does overlapping base year splicing operate?',
      summary: 'Ratio of indices during overlapping base year links old and rebased series.',
      bullets: [
        { label: 'Laspeyres Bias', text: 'Fixed base quantities overestimate inflation due to consumer price substitution.' },
        { label: 'Splicing Method', text: 'Ratio of indices during overlapping base year links old and rebased series.' },
        { label: 'Aggregation Rule', text: 'Modified Laspeyres with geometric mean aggregation at elementary levels.' }
      ],
      sourceLabel: 'MoSPI Cadre Standard',
      isCustom: false,
      isPinned: false,
      isFlipped: false,
      createdAt: 1700000003000
    },
    {
      id: 'cadre_rc_5',
      topic: 'Data Governance',
      title: 'DPDP Act 2023 Microdata Anonymization',
      question: 'What are the k-anonymity parameters and cell suppression thresholds mandated for statistical release under DPDP 2023?',
      summary: 'K-Anonymity (k ≥ 5): Every quasi-identifier combination must share at least 5 respondent records.',
      bullets: [
        { label: 'K-Anonymity (k ≥ 5)', text: 'Every quasi-identifier combination must share at least 5 respondent records.' },
        { label: 'Suppression', text: 'Cell counts < 3 in small district aggregates must be suppressed or perturbed.' },
        { label: 'Direct Identifiers', text: 'Names, Aadhaar tokens, and telephone numbers must be removed or hashed.' }
      ],
      sourceLabel: 'MoSPI Cadre Standard',
      isCustom: false,
      isPinned: false,
      isFlipped: false,
      createdAt: 1700000004000
    },
    {
      id: 'cadre_rc_6',
      topic: 'Labour Statistics',
      title: 'PLFS Usual vs Current Weekly Activity Status',
      question: 'Define the reference period differences between Usual Status (ps+ss) and Current Weekly Status (CWS) in PLFS.',
      summary: 'Usual Status reference period is 365 days; CWS reference period is 7 preceding days.',
      bullets: [
        { label: 'Usual Status (ps+ss)', text: 'Activity pursued for a relatively long time during reference 365 days.' },
        { label: 'CWS Status', text: 'Activity status determined with reference period of last 7 preceding days.' },
        { label: 'Priority Criterion', text: 'Employed precedes Unemployed, which precedes Out of Labour Force.' }
      ],
      sourceLabel: 'MoSPI Cadre Standard',
      isCustom: false,
      isPinned: false,
      isFlipped: false,
      createdAt: 1700000005000
    }
  ];

  function initRevisionCardsDeckEngine() {
    const STORAGE_KEY = 'nirdesha_revision_flashcards';

    function loadRevisionDeck() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const existingIds = new Set(parsed.map(c => c.id));
            SEED_CADRE_REVISION_CARDS.forEach(seed => {
              if (!existingIds.has(seed.id)) {
                parsed.push({ ...seed });
              }
            });
            return parsed;
          }
        }
      } catch (e) {}
      return SEED_CADRE_REVISION_CARDS.map(c => ({ ...c }));
    }

    let revisionDeck = loadRevisionDeck();

    function saveRevisionDeck() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(revisionDeck));
      } catch (e) {}
      updateCounts();
    }

    let activeFilter = 'all';
    let activeSearch = '';
    let allFlipped = false;

    function updateCounts() {
      const elAll = document.getElementById('count-filter-all');
      const elPinned = document.getElementById('count-filter-pinned');
      const elNotes = document.getElementById('count-filter-notes');
      const elCadre = document.getElementById('count-filter-cadre');

      if (elAll) elAll.textContent = revisionDeck.length;
      if (elPinned) elPinned.textContent = revisionDeck.filter(c => c.isPinned).length;
      if (elNotes) elNotes.textContent = revisionDeck.filter(c => c.isCustom).length;
      if (elCadre) elCadre.textContent = revisionDeck.filter(c => !c.isCustom).length;
    }

    function renderRevisionCardsUI() {
      const grid = document.getElementById('revision-cards-grid');
      if (!grid) return;
      grid.innerHTML = '';
      updateCounts();

      let filtered = [...revisionDeck];

      if (activeFilter === 'pinned') {
        filtered = filtered.filter(c => c.isPinned);
      } else if (activeFilter === 'notes') {
        filtered = filtered.filter(c => c.isCustom);
      } else if (activeFilter === 'cadre') {
        filtered = filtered.filter(c => !c.isCustom);
      }

      if (activeSearch) {
        const q = activeSearch.toLowerCase();
        filtered = filtered.filter(c =>
          (c.title && c.title.toLowerCase().includes(q)) ||
          (c.topic && c.topic.toLowerCase().includes(q)) ||
          (c.question && c.question.toLowerCase().includes(q)) ||
          (c.summary && c.summary.toLowerCase().includes(q)) ||
          (c.bullets && c.bullets.some(b => b.text && b.text.toLowerCase().includes(q)))
        );
      }

      // PINNED CARDS HIERARCHY: Pinned cards ALWAYS float to the top
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 6px;">
            <h4 style="margin: 0 0 0.35rem 0; font-weight: 800; color: #002b49;">No Revision Cards Match This Filter</h4>
            <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: #64748b;">
              ${activeFilter === 'pinned' ? 'You have not pinned any cards for exam revision yet. Click the pin icon on any card to prioritize it!' : 'Generate flashcards from your study notes to see them here.'}
            </p>
            <button type="button" class="btn-admin-action" id="btn-empty-jump-notes" style="padding: 0.45rem 1rem;">Go to Study Notes →</button>
          </div>
        `;
        const jumpBtn = grid.querySelector('#btn-empty-jump-notes');
        if (jumpBtn) {
          jumpBtn.addEventListener('click', () => {
            switchTab('notes');
          });
        }
        return;
      }

      filtered.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = `notebook-card ${card.isPinned ? 'is-pinned-card' : ''}`;
        cardEl.setAttribute('data-card-id', card.id);

        const bulletsHtml = (card.bullets || []).map(b => `
          <div class="notebook-card-bullet">
            <span>▸</span>
            <div><strong>${escapeHtml(b.label || 'Takeaway')}:</strong> ${escapeHtml(b.text || '')}</div>
          </div>
        `).join('');

        cardEl.innerHTML = `
          <div>
            <div class="flashcard-header">
              <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                <span class="notebook-topic">${escapeHtml(card.topic || 'Revision')}</span>
                <span class="flashcard-source-badge ${card.isCustom ? 'badge-from-note' : ''}">
                  ${escapeHtml(card.sourceLabel || (card.isCustom ? 'From Notes' : 'Cadre Standard'))}
                </span>
                ${card.isPinned ? `
                  <span class="flashcard-pinned-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                    PINNED
                  </span>
                ` : ''}
              </div>
              <div class="flashcard-actions">
                <button type="button" class="btn-pin-flashcard ${card.isPinned ? 'active' : ''}" title="${card.isPinned ? 'Unpin from priority revision' : 'Pin for urgent exam revision'}" aria-label="${card.isPinned ? 'Unpin from priority revision' : 'Pin for urgent exam revision'}">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="${card.isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
                </button>
                ${card.isCustom ? `
                  <button type="button" class="btn-del-flashcard" title="Delete Flashcard" aria-label="Delete Flashcard">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                ` : ''}
              </div>
            </div>

            <h4 class="notebook-card-title">${escapeHtml(card.title || 'Revision Concept')}</h4>

            <!-- Front / Question Box -->
            <div class="flashcard-question-box">
              <span class="flashcard-question-label">Active Recall Challenge:</span>
              ${escapeHtml(card.question || '')}
            </div>

            <!-- Back / Key Takeaways & Formulas (toggled on flip) -->
            <div class="flashcard-back-content" style="${card.isFlipped ? 'display: block;' : 'display: none;'}">
              <div class="flashcard-key-rule">
                <span class="flashcard-rule-label">CRITICAL REVISION TAKEAWAY &amp; FORMULA:</span>
                <div class="flashcard-rule-text">${escapeHtml(card.summary || '')}</div>
              </div>
              <div class="flashcard-bullets-wrap">
                ${bulletsHtml}
              </div>
            </div>
          </div>

          <div class="flashcard-footer">
            <button type="button" class="btn-flip-flashcard">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span>${card.isFlipped ? 'Hide Key' : 'Reveal Revision Key & Formulas'}</span>
            </button>
            <span style="font-size: 0.68rem; color: #94a3b8;">
              ${card.isPinned ? 'Priority Deck' : 'Standard Deck'}
            </span>
          </div>
        `;

        // Pin Handler: ALLOW ANY FLASHCARD TO BE PINNED IN REVISION CARD AREA
        const btnPin = cardEl.querySelector('.btn-pin-flashcard');
        if (btnPin) {
          btnPin.addEventListener('click', (e) => {
            e.stopPropagation();
            card.isPinned = !card.isPinned;
            saveRevisionDeck();
            renderRevisionCardsUI();
            showNirdeshaToast(card.isPinned ? `✓ Pinned "${escapeHtml(card.title)}" for exam revision priority!` : `Unpinned "${escapeHtml(card.title)}".`);
          });
        }

        // Flip Handler
        const btnFlip = cardEl.querySelector('.btn-flip-flashcard');
        if (btnFlip) {
          btnFlip.addEventListener('click', (e) => {
            e.stopPropagation();
            card.isFlipped = !card.isFlipped;
            const backEl = cardEl.querySelector('.flashcard-back-content');
            const btnText = btnFlip.querySelector('span');
            if (backEl) backEl.style.display = card.isFlipped ? 'block' : 'none';
            if (btnText) btnText.textContent = card.isFlipped ? 'Hide Key' : 'Reveal Revision Key & Formulas';
          });
        }

        // Delete Handler
        const btnDel = cardEl.querySelector('.btn-del-flashcard');
        if (btnDel) {
          btnDel.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Remove "${card.title}" from Revision Cards?`)) {
              revisionDeck = revisionDeck.filter(c => c.id !== card.id);
              saveRevisionDeck();
              renderRevisionCardsUI();
              showNirdeshaToast(`Removed "${escapeHtml(card.title)}" from Revision Cards.`);
            }
          });
        }

        grid.appendChild(cardEl);
      });
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.revision-filter-btn[data-filter]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        renderRevisionCardsUI();
      });
    });

    // Search input
    const searchInput = document.getElementById('revision-cards-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        activeSearch = e.target.value.trim();
        renderRevisionCardsUI();
      });
    }

    // Toggle all cards reveal/hide
    const btnToggleAll = document.getElementById('btn-revision-toggle-all');
    const toggleLabel = document.getElementById('btn-revision-toggle-label');
    if (btnToggleAll) {
      btnToggleAll.addEventListener('click', () => {
        allFlipped = !allFlipped;
        revisionDeck.forEach(c => c.isFlipped = allFlipped);
        if (toggleLabel) toggleLabel.textContent = allFlipped ? 'Hide All Keys' : 'Reveal All Keys';
        renderRevisionCardsUI();
      });
    }

    // Jump to notes button
    const btnJumpNotes = document.getElementById('btn-revision-jump-notes');
    if (btnJumpNotes) {
      btnJumpNotes.addEventListener('click', () => {
        switchTab('notes');
      });
    }

    // Global APIs
    window.addFlashcardToRevisionDeck = function(card) {
      revisionDeck.unshift(card);
      saveRevisionDeck();
      renderRevisionCardsUI();
    };

    window.addFlashcardsBatchToRevisionDeck = function(cards) {
      cards.forEach(c => revisionDeck.unshift(c));
      saveRevisionDeck();
      renderRevisionCardsUI();
    };

    window.renderRevisionCardsUI = renderRevisionCardsUI;

    // Initial render
    renderRevisionCardsUI();
  }

  // Initialize Revision Cards Deck Engine
  initRevisionCardsDeckEngine();
