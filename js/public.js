/**
 * Nirdesha — Officer / Public Trainee Learning Dashboard Script
 * Manages Heatmap Rendering, Elo Rating Simulator, Fixed-Time Quiz, NotebookLM Cards, & AI Mentor
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
  const navItems = document.querySelectorAll('.trainee-nav-item[data-tab]');
  const viewTabs = document.querySelectorAll('.trainee-view-tab');
  const sidebar = document.getElementById('trainee-sidebar');
  const mobileToggle = document.getElementById('trainee-mobile-toggle');

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
      } else {
        view.style.display = 'none';
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
    const validView = document.getElementById(`view-${hashTab}`);
    if (validView) switchTab(hashTab);
  }

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // 2. Sign Out Action
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
      // Pseudo-random activity distribution biased towards active consistency
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

  // 4. Fixed-Total-Time Self-Evaluation Quiz Engine
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
    // Calculate simulated score
    const correctCount = 4; // Mock 4 out of 5
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

    // Update the live Elo badge on the topbar
    const topElo = document.getElementById('trainee-top-elo');
    if (topElo) topElo.textContent = '⚡ 1,513 Elo (Level 3 - Proficient)';
  }

  if (quizSubmitBtn) {
    quizSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      submitQuizAssessment();
    });
  }

  // 5. Interactive Trainee AI Study Mentor Chat
  const traineeChatLog = document.getElementById('trainee-chat-log');
  const traineeChatInput = document.getElementById('trainee-chat-input');
  const traineeChatSend = document.getElementById('trainee-chat-send');

  const TRAINEE_RESPONSES = {
    "formula": "The formula for the Horvitz-Thompson Estimator for a population total is: Y_HT = Sum(y_i / pi_i), where pi_i is the inclusion probability of the i-th sampling unit. In NSSO stratified multi-stage designs, inverse inclusion probabilities represent multiplier weights.",
    "cpi": "Consumer Price Index (CPI-Combined) base 2012=100 uses Laspeyres modified formulation. Price relatives are aggregated with weighting diagrams derived from Consumer Expenditure Surveys (CES).",
    "dpdp": "Under DPDP Act 2023 Section 8, public survey records must anonymize individual identifiable tokens (Aadhaar/Phone) before statistical dataset release.",
    "default": "Based on the NSSTA Training Syllabus, this topic is covered under Module 101. Review your NotebookLM summary cards for quick revision before attempting the timed assessment."
  };

  function sendTraineeChatMessage(text, sender = 'bot') {
    if (!traineeChatLog) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.textContent = text;
    traineeChatLog.appendChild(bubble);
    traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
  }

    async function handleTraineeChat(query) {
    if (!query.trim()) return;
    sendTraineeChatMessage(query, 'user');
    if (traineeChatInput) traineeChatInput.value = '';

    // Create bot response bubble immediately
    const botBubble = document.createElement('div');
    botBubble.className = 'chat-bubble bot';
    botBubble.innerHTML = '<span style="color:#64748b; font-style:italic;">⚡ Thinking...</span>';
    traineeChatLog.appendChild(botBubble);
    traineeChatLog.scrollTop = traineeChatLog.scrollHeight;

    let accumulatedText = '';
    let hasReceivedFirstToken = false;

    try {
      // 1. Try Ultra-Fast Streaming Endpoint (/api/chat/stream)
      const response = await fetch('http://127.0.0.1:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'public',
          message: query,
          role: 'mentor'
        })
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop(); // keep partial line

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed === 'data: [DONE]') break;
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                if (parsed.chunk) {
                  if (!hasReceivedFirstToken) {
                    botBubble.innerHTML = '';
                    hasReceivedFirstToken = true;
                  }
                  accumulatedText += parsed.chunk;
                  botBubble.innerHTML = accumulatedText.replace(/\n/g, '<br>');
                  traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
                }
              } catch (e) {}
            }
          }
        }

        if (accumulatedText.trim()) {
          return;
        }
      }
    } catch (err) {
      // Server offline - fallback
    }

    // 2. Offline instant fallback if server is unreachable
    if (!hasReceivedFirstToken) {
      const q = query.toLowerCase();
      let reply = TRAINEE_RESPONSES["default"];
      if (q.includes('formula') || q.includes('sampling') || q.includes('weight')) {
        reply = TRAINEE_RESPONSES["formula"];
      } else if (q.includes('cpi') || q.includes('inflation') || q.includes('deflator')) {
        reply = TRAINEE_RESPONSES["cpi"];
      } else if (q.includes('dpdp') || q.includes('privacy') || q.includes('law')) {
        reply = TRAINEE_RESPONSES["dpdp"];
      }
      botBubble.innerHTML = reply.replace(/\n/g, '<br>');
      traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
    }
  }

  if (traineeChatSend && traineeChatInput) {
    traineeChatSend.addEventListener('click', () => handleTraineeChat(traineeChatInput.value));
    traineeChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleTraineeChat(traineeChatInput.value);
    });
  }
  // Clear AI Study Mentor Chat Handler
  const btnClearMentorChat = document.getElementById('btn-clear-mentor-chat');
  if (btnClearMentorChat && traineeChatLog) {
    btnClearMentorChat.addEventListener('click', () => {
      traineeChatLog.innerHTML = `
        <div class="chat-bubble bot">
          Namaste Officer Raman! I am your <strong>Nirdesha AI Study Mentor</strong>. I can clarify statistical formulas, explain NSS survey concepts, or help you prepare for the upcoming SSO cadre transition test. What would you like to explore?
        </div>
      `;
    });
  }


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
        summaryStreakDiff.textContent = '⚠️ Milestone cannot exceed 365 days (1 year maximum allowed).';
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

  function closeModal() {
    if (!modal) return;
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

  initAskAiHoverEngine();
});
