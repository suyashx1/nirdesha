/**
 * Nirdesha — Officer / Public Trainee Learning Dashboard Script
 * Manages Heatmap Rendering, Elo Rating Simulator, Fixed-Time Quiz, NotebookLM Cards, & AI Mentor
 */

document.addEventListener('DOMContentLoaded', () => {
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

  // 3. Render GitHub-Style Contribution Heatmap
  const heatmapGrid = document.getElementById('heatmap-grid');
  if (heatmapGrid) {
    // Generate 12 weeks of activity (84 days)
    const levels = ['lvl-0', 'lvl-1', 'lvl-2', 'lvl-3', 'lvl-4'];
    for (let i = 0; i < 84; i++) {
      const day = document.createElement('div');
      day.className = 'heatmap-day';
      // Pseudo-random activity distribution biased towards active consistency
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
