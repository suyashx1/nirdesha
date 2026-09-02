/**
 * Nirdesha — Administration Console Client Script
 * Manages Sidebar Navigation, Tab Views, Interactive AI Mentor, Course Filters, & Session
 */

document.addEventListener('DOMContentLoaded', () => {
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
});
