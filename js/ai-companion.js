/**
 * Nirdesha Global AI Guidance Companion
 * Operates across all pages (main, public, admin, login) with full-screen AI study mentor routing and history synchronization.
 */

(function () {
  const COMPANION_KNOWLEDGE = {
    'sso': "A Senior Statistical Officer (SSO) is a Group 'B' Gazetted Cadre post under the Subordinate Statistical Service (SSS), MoSPI. Key tasks include supervising NSS socio-economic survey rounds, auditing CAPI microdata on field tablets, and coordinating district-level statistical operations.",
    'benchmark': "Cadre Benchmark is the standardized proficiency threshold established by MoSPI and NSSTA. It sets required mastery marks across sampling theory, macro-deflators, and data ethics before an officer is certified for promotion.",
    'sampling': "Survey Sampling design under NSSO relies on Stratified Multi-Stage Sampling where Census villages/blocks are FSUs and households are SSUs. Inverse probability weights (Horvitz-Thompson estimator) ensure design-unbiased population estimates.",
    'cpi': "Consumer Price Index (CPI-Combined) measures inflation on household consumption baskets using a modified Laspeyres formula, whereas the GDP Deflator captures domestic production price shifts.",
    'dpdp': "The Digital Personal Data Protection (DPDP) Act 2023 Section 8 mandates that official microdata releases de-identify individual personal identifiers before public publication and maintain immutable transform logs.",
    'heatmap': "The 52-Week Learning Heatmap tracks continuous daily study consistency, timed quiz evaluations, and CAPI task completions across 364 days to build sustained statistical acumen.",
    'elo': "The Competitive Skill Rating is a deterministic Elo algorithm in Nirdesha. It evaluates test accuracy, latency, and question difficulty to assign ratings from Tier 1 (Novice) to Tier 4 (Expert >1,600 Elo).",
    'streak': "The Active Learning Streak counts consecutive days of official training engagement. Reaching the Cadre Milestone target qualifies officers for accelerated career progression recognition.",
    'default': "Namaste! I am your Nirdesha AI Guidance Companion. You can ask me about MoSPI survey guidelines, statistical formulas, SSS cadre promotion requirements, or navigating this platform."
  };

  const DEFAULT_GREETING = "Namaste! I am your <strong>Nirdesha AI Guidance Companion</strong>. Do you need any help with official MoSPI guidelines, statistical methodologies, or navigating this portal?";

  // Conversation history array
  const companionHistory = [];

  function initAiCompanion() {
    if (document.getElementById('nirdesha-ai-companion-root')) return;

    // Build DOM Markup
    const root = document.createElement('div');
    root.id = 'nirdesha-ai-companion-root';
    root.innerHTML = `
      <!-- Fullscreen Backdrop for Non-Mentor Pages -->
      <div class="companion-fullscreen-backdrop" id="companion-fullscreen-backdrop"></div>

      <!-- 1. Floating Launcher (Bottom Right) -->
      <div class="nirdesha-companion-launcher" id="companion-launcher">
        <div class="companion-prompt-bubble" id="companion-prompt-bubble" title="Click to chat with AI Companion">
          <span class="companion-spark-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </span>
          <span class="companion-prompt-text">Do you need any help?</span>
        </div>

        <button type="button" class="companion-avatar-btn" id="companion-avatar-btn" title="Open AI Guidance Companion" aria-label="Open AI Guidance Assistant">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <line x1="9" y1="10" x2="15" y2="10"/>
          </svg>
          <span class="companion-online-dot"></span>
        </button>
      </div>

      <!-- 2. AI Guidance Pop-Up Chat Window -->
      <div class="companion-popup-window" id="companion-popup-window" role="dialog" aria-modal="false">
        <div class="companion-header-tricolor"></div>
        
        <div class="companion-header">
          <div class="companion-header-brand">
            <div class="companion-header-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/></svg>
            </div>
            <div class="companion-header-titles">
              <h3 class="companion-title">Nirdesha AI Guidance</h3>
              <span class="companion-status"><span class="companion-status-indicator"></span> MoSPI-StatLLM • Active</span>
            </div>
          </div>

          <div class="companion-header-actions">
            <!-- Clear / Delete Chat History Button -->
            <button type="button" class="companion-action-btn" id="companion-btn-clear" title="Clear / Delete Chat History" aria-label="Clear Chat History">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events: none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            <!-- Fullscreen / Expand Button -->
            <button type="button" class="companion-action-btn" id="companion-btn-fullscreen" title="Open Full Screen" aria-label="Fullscreen">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events: none;"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
            <!-- Close Button -->
            <button type="button" class="companion-action-btn btn-close" id="companion-btn-close" title="Close Companion" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="pointer-events: none;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Chat Scrollable Body -->
        <div class="companion-chat-body" id="companion-chat-body">
          <div class="companion-msg bot">
            ${DEFAULT_GREETING}
          </div>

          <div class="companion-chips-container">
            <button type="button" class="companion-chip" data-query="Explain SSO Cadre Benchmark">SSO Cadre Benchmark</button>
            <button type="button" class="companion-chip" data-query="How does NSS sampling work?">Sampling Design</button>
            <button type="button" class="companion-chip" data-query="Explain DPDP Act 2023 compliance">DPDP Act Rules</button>
            <button type="button" class="companion-chip" data-query="How does the 365-day streak work?">Milestone Streaks</button>
          </div>
        </div>

        <!-- Input Row -->
        <div class="companion-footer">
          <input type="text" class="companion-input" id="companion-input" placeholder="Type your question or query..." aria-label="Ask AI Companion">
          <button type="button" class="companion-send-btn" id="companion-send-btn" title="Send message">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    // Initial message tracked
    companionHistory.push({
      sender: 'bot',
      text: DEFAULT_GREETING
    });

    // Elements
    const promptBubble = document.getElementById('companion-prompt-bubble');
    const avatarBtn = document.getElementById('companion-avatar-btn');
    const popup = document.getElementById('companion-popup-window');
    const backdrop = document.getElementById('companion-fullscreen-backdrop');
    const btnClose = document.getElementById('companion-btn-close');
    const btnFullscreen = document.getElementById('companion-btn-fullscreen');
    const btnClear = document.getElementById('companion-btn-clear');
    const chatBody = document.getElementById('companion-chat-body');
    const input = document.getElementById('companion-input');
    const btnSend = document.getElementById('companion-send-btn');

    let isOpen = false;
    let isFullscreenMode = false;

    function openPopup() {
      isOpen = true;
      popup.classList.add('is-open');
      if (promptBubble) promptBubble.style.display = 'none';
      if (input) setTimeout(() => input.focus(), 150);
    }

    function closePopup() {
      isOpen = false;
      if (isFullscreenMode) {
        exitFullscreenOverlay();
      }
      popup.classList.remove('is-open');
      if (promptBubble) promptBubble.style.display = 'flex';
    }

    function enterFullscreenOverlay() {
      isFullscreenMode = true;
      popup.classList.add('is-fullscreen');
      if (backdrop) backdrop.style.display = 'block';
    }

    function exitFullscreenOverlay() {
      isFullscreenMode = false;
      popup.classList.remove('is-fullscreen');
      if (backdrop) backdrop.style.display = 'none';
    }

    if (avatarBtn) avatarBtn.addEventListener('click', () => isOpen ? closePopup() : openPopup());
    if (promptBubble) promptBubble.addEventListener('click', openPopup);
    if (btnClose) btnClose.addEventListener('click', closePopup);
    if (backdrop) backdrop.addEventListener('click', exitFullscreenOverlay);

    // BIND CHIP CLICKS
    function bindChipClicks() {
      if (!chatBody) return;
      chatBody.querySelectorAll('.companion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const q = chip.getAttribute('data-query');
          if (input) input.value = q;
          handleSend();
        });
      });
    }
    bindChipClicks();

    // CLEAR / DELETE CHAT HISTORY FUNCTION
    function executeClearChat() {
      companionHistory.length = 0;
      companionHistory.push({
        sender: 'bot',
        text: DEFAULT_GREETING
      });

      if (chatBody) {
        chatBody.innerHTML = `
          <div class="companion-msg bot">
            ${DEFAULT_GREETING}
          </div>

          <div class="companion-chips-container">
            <button type="button" class="companion-chip" data-query="Explain SSO Cadre Benchmark">SSO Cadre Benchmark</button>
            <button type="button" class="companion-chip" data-query="How does NSS sampling work?">Sampling Design</button>
            <button type="button" class="companion-chip" data-query="Explain DPDP Act 2023 compliance">DPDP Act Rules</button>
            <button type="button" class="companion-chip" data-query="How does the 365-day streak work?">Milestone Streaks</button>
          </div>
        `;
        bindChipClicks();
        chatBody.scrollTop = 0;
      }
    }

    if (btnClear) {
      btnClear.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        executeClearChat();
      });
    }

    // Delegated click listener to guarantee clear button works under all conditions
    document.addEventListener('click', (e) => {
      const clearBtn = e.target.closest('#companion-btn-clear');
      if (clearBtn) {
        e.preventDefault();
        e.stopPropagation();
        executeClearChat();
      }
    });

    // FULL SCREEN BUTTON: SYNC CHAT HISTORY TO AI STUDY MENTOR (ON PUBLIC.HTML)
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        const mentorView = document.getElementById('view-ai-mentor');
        const traineeChatLog = document.getElementById('trainee-chat-log');

        if (mentorView && traineeChatLog) {
          // Inside public portal with AI Study Mentor:
          closePopup();

          // 1. Switch to AI Study Mentor Tab
          const mentorTabBtn = document.querySelector('[data-tab="ai-mentor"]');
          if (mentorTabBtn) {
            mentorTabBtn.click();
          } else if (typeof switchTab === 'function') {
            switchTab('ai-mentor');
          }

          // 2. Transfer / Sync conversation history into AI Study Mentor
          const messagesToSync = companionHistory.filter((_, idx) => idx > 0);
          if (messagesToSync.length > 0) {
            const divider = document.createElement('div');
            divider.className = 'chat-sync-divider';
            divider.innerHTML = '<span class="sync-tag">Transferred Session • Nirdesha AI Guidance</span>';
            traineeChatLog.appendChild(divider);

            messagesToSync.forEach(item => {
              const bubble = document.createElement('div');
              bubble.className = `chat-bubble ${item.sender === 'user' ? 'user' : 'bot'}`;
              bubble.innerHTML = item.text;
              traineeChatLog.appendChild(bubble);
            });

            traineeChatLog.scrollTop = traineeChatLog.scrollHeight;
          }
        } else {
          // Non-mentor pages (admin, main, login): Expand in-page fullscreen
          if (!isFullscreenMode) {
            enterFullscreenOverlay();
          } else {
            exitFullscreenOverlay();
          }
        }
      });
    }

    // MESSAGING LOGIC
    function appendMessage(text, sender = 'bot') {
      if (!chatBody) return;
      const msg = document.createElement('div');
      msg.className = `companion-msg ${sender}`;
      msg.innerHTML = text;
      chatBody.appendChild(msg);
      chatBody.scrollTop = chatBody.scrollHeight;

      // Track in history
      companionHistory.push({ sender, text });
    }

    function handleSend() {
      const q = input.value.trim();
      if (!q) return;
      appendMessage(q, 'user');
      input.value = '';

      // Typing simulation
      setTimeout(() => {
        const queryLower = q.toLowerCase();
        let reply = COMPANION_KNOWLEDGE['default'];

        if (queryLower.includes('sso') || queryLower.includes('senior statistical')) {
          reply = COMPANION_KNOWLEDGE['sso'];
        } else if (queryLower.includes('benchmark') || queryLower.includes('target') || queryLower.includes('cadre')) {
          reply = COMPANION_KNOWLEDGE['benchmark'];
        } else if (queryLower.includes('sampling') || queryLower.includes('weight') || queryLower.includes('formula')) {
          reply = COMPANION_KNOWLEDGE['sampling'];
        } else if (queryLower.includes('cpi') || queryLower.includes('deflator') || queryLower.includes('inflation')) {
          reply = COMPANION_KNOWLEDGE['cpi'];
        } else if (queryLower.includes('dpdp') || queryLower.includes('privacy') || queryLower.includes('data protection')) {
          reply = COMPANION_KNOWLEDGE['dpdp'];
        } else if (queryLower.includes('heatmap') || queryLower.includes('calendar') || queryLower.includes('activity')) {
          reply = COMPANION_KNOWLEDGE['heatmap'];
        } else if (queryLower.includes('elo') || queryLower.includes('rating') || queryLower.includes('score')) {
          reply = COMPANION_KNOWLEDGE['elo'];
        } else if (queryLower.includes('streak') || queryLower.includes('days') || queryLower.includes('consistency') || queryLower.includes('milestone')) {
          reply = COMPANION_KNOWLEDGE['streak'];
        }

        appendMessage(reply, 'bot');
      }, 350);
    }

    if (btnSend) btnSend.addEventListener('click', handleSend);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSend();
        }
      });
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAiCompanion);
  } else {
    initAiCompanion();
  }
})();
