/**
 * Nirdesha — User / Public Trainee Learning Dashboard Script
 * Manages Heatmap Rendering, Elo Rating Simulator, Fixed-Time Quiz, NotebookLM Cards,
 * Interactive Profile Persistence, Avatar Upload, and Document Drop AI Extraction.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // 1. SIDEBAR TAB NAVIGATION & MOBILE DRAWER
  // ==========================================================================
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

  // Sign Out Action
  const signoutBtn = document.getElementById('trainee-signout-btn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('nirdesha_user_role');
      window.location.href = 'login.html';
    });
  }

  // ==========================================================================
  // 2. GITHUB-STYLE CONTRIBUTION HEATMAP
  // ==========================================================================
  const heatmapGrid = document.getElementById('heatmap-grid');
  if (heatmapGrid) {
    for (let i = 0; i < 84; i++) {
      const day = document.createElement('div');
      day.className = 'heatmap-day';
      const rand = Math.random();
      let lvl = 'lvl-1';
      if (rand < 0.2) lvl = '';
      else if (rand < 0.5) lvl = 'lvl-1';
      else if (rand < 0.75) lvl = 'lvl-2';
      else if (rand < 0.92) lvl = 'lvl-3';
      else lvl = 'lvl-4';

      if (lvl) day.classList.add(lvl);
      day.title = `Day ${i + 1}: ${lvl ? 'Learning Activity Completed' : 'Rest Day'}`;
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
    if (topElo) topElo.textContent = '⚡ 1,513 Elo (Level 3 - Proficient)';
  }

  if (quizSubmitBtn) {
    quizSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      submitQuizAssessment();
    });
  }

  // ==========================================================================
  // 4. INTERACTIVE PROFILE & AVATAR UPLOAD HANDLER
  // ==========================================================================
  const profileName = document.getElementById('public-profile-name');
  const profileRole = document.getElementById('public-profile-role');
  const profileEmail = document.getElementById('public-profile-email');
  const profileRoll = document.getElementById('public-profile-roll');
  const profileCadre = document.getElementById('public-profile-cadre');
  const profileDivision = document.getElementById('public-profile-division');
  const profileSkills = document.getElementById('public-profile-skills');
  const profileAvatar = document.getElementById('public-profile-avatar');
  const sidebarAvatar = document.getElementById('public-sidebar-avatar');
  const sidebarName = document.getElementById('public-sidebar-name');
  const sidebarRole = document.getElementById('public-sidebar-role');
  const saveProfileBtn = document.getElementById('public-save-profile-btn');
  const profileToast = document.getElementById('public-profile-toast');

  const avatarBtn = document.getElementById('public-avatar-btn');
  const avatarFileInput = document.getElementById('public-avatar-file-input');

  function loadSavedProfile() {
    const saved = localStorage.getItem('nirdesha_public_profile');
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
        console.error("Error loading public profile:", err);
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
        avatarImg: localStorage.getItem('nirdesha_public_avatar') || ''
      };

      localStorage.setItem('nirdesha_public_profile', JSON.stringify(data));

      if (sidebarName) sidebarName.textContent = data.name;
      if (sidebarRole) sidebarRole.textContent = data.role;

      if (profileToast) {
        profileToast.style.display = 'block';
        setTimeout(() => { profileToast.style.display = 'none'; }, 3000);
      }
    });
  }

  if (avatarBtn && avatarFileInput) {
    avatarBtn.addEventListener('click', () => avatarFileInput.click());

    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setAvatarImage(dataUrl);
        localStorage.setItem('nirdesha_public_avatar', dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }

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
    shimmerStatusText.textContent = `⚡ Initializing MoSPI AI Document Extraction Engine for "${file.name}"...`;

    setTimeout(() => {
      shimmerStatusText.textContent = `📄 Parsing PDF structure & service credentials...`;
    }, 600);

    setTimeout(() => {
      shimmerStatusText.textContent = `🤖 Auto-populating Cadre, Division & Baseline Skills...`;
    }, 1200);

    setTimeout(() => {
      pdfShimmer.style.display = 'none';

      if (profileCadre) profileCadre.value = "Subordinate Statistical Service (SSS Cadre)";
      if (profileDivision) profileDivision.value = "NSSO Field Operations Division (FOD), Regional Office";
      if (profileSkills) profileSkills.value = "Survey Sampling Theory, CAPI Tablet Operations, Python Computing, DPDP Compliance";

      if (profileToast) {
        profileToast.textContent = `✓ AI Extracted Profile Data from "${file.name}" — Review & Click Save!`;
        profileToast.style.display = 'block';
        setTimeout(() => { profileToast.style.display = 'none'; }, 4000);
      }
    }, 1800);
  }

  // ==========================================================================
  // 6. INTERACTIVE AI STUDY MENTOR CHAT
  // ==========================================================================
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

  function handleTraineeChat(query) {
    if (!query.trim()) return;
    sendTraineeChatMessage(query, 'user');
    if (traineeChatInput) traineeChatInput.value = '';

    setTimeout(() => {
      const q = query.toLowerCase();
      let reply = TRAINEE_RESPONSES["default"];
      if (q.includes('formula') || q.includes('sampling') || q.includes('weight')) {
        reply = TRAINEE_RESPONSES["formula"];
      } else if (q.includes('cpi') || q.includes('inflation')) {
        reply = TRAINEE_RESPONSES["cpi"];
      } else if (q.includes('dpdp') || q.includes('privacy')) {
        reply = TRAINEE_RESPONSES["dpdp"];
      }
      sendTraineeChatMessage(reply, 'bot');
    }, 500);
  }

  if (traineeChatSend && traineeChatInput) {
    traineeChatSend.addEventListener('click', () => handleTraineeChat(traineeChatInput.value));
    traineeChatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleTraineeChat(traineeChatInput.value);
    });
  }
});
