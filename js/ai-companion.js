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

  const DEFAULT_GREETING = "Namaste! I am your <strong>Nirdesha Website Guidance Assistant</strong>. I help you navigate the portal, set milestones, track learning on the heatmap, arrange courses, and configure settings. How can I guide you with the website today?";

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
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          <span class="companion-online-dot"></span>
        </button>
      </div>

      <!-- 2. AI Guidance Pop-Up Chat Window -->
      <div class="companion-popup-window" id="companion-popup-window" role="dialog" aria-modal="false">
        <div class="companion-header-tricolor"></div>
        
        <div class="companion-header">
          <div class="companion-header-brand">
            <div class="companion-header-avatar"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg></div>
            <div class="companion-header-titles">
              <h3 class="companion-title">Nirdesha AI Guidance</h3>
            </div>
          </div>

          <div class="companion-header-actions">
            <!-- Companion Language Selector -->
            <select class="companion-lang-select" id="companion-lang-select" title="Choose language for AI guidance">
              <option value="English" selected>🌐 EN</option>
              <option value="Hindi">हिंदी</option>
              <option value="Odia">ଓଡ଼ିଆ</option>
              <option value="Bengali">বাংলা</option>
              <option value="Marathi">मराठी</option>
              <option value="Gujarati">ગુજરાતી</option>
              <option value="Tamil">தமிழ்</option>
              <option value="Telugu">తెలుగు</option>
              <option value="Kannada">ಕನ್ನಡ</option>
              <option value="Malayalam">മലയാളം</option>
              <option value="Punjabi">ਪੰਜਾਬੀ</option>
            </select>
            <!-- Clear / Delete Chat History Button -->
            <button type="button" class="companion-action-btn" id="companion-btn-clear" title="Clear / Delete Chat History" aria-label="Clear Chat History">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="pointer-events: none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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
            <button type="button" class="companion-chip" data-query="How do I set my milestone streak?">Set Milestones</button>
            <button type="button" class="companion-chip" data-query="Explain the learning consistency heatmap">52-Week Heatmap</button>
            <button type="button" class="companion-chip" data-query="Where do I arrange my courses?">My Courses</button>
            <button type="button" class="companion-chip" data-query="How to change theme and profile settings?">Theme & Settings</button>
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

    
    let companionLanguage = 'English';
    const companionLangSelect = document.getElementById('companion-lang-select');

    const COMPANION_LANG_GREETINGS = {
      'English': "Namaste! I am your <strong>Nirdesha Website Guidance Assistant</strong>. I help you navigate the portal, set milestones, track learning on the heatmap, arrange courses, and configure settings. How can I guide you with the website today?",
      'Hindi': "नमस्ते! मैं आपका <strong>निर्देशा वेबसाइट मार्गदर्शन सहायक</strong> हूँ। मैं आपको पोर्टल नेविगेट करने, माइलस्टोन सेट करने, हीटमैप पर सीखने की निरंतरता देखने और सेटिंग्स बदलने में मदद करता हूँ। मैं आज वेबसाइट के लिए आपकी क्या सहायता करूँ?",
      'Odia': "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର <strong>ନିର୍ଦ୍ଦେଶା ୱେବସାଇଟ୍ ମାର୍ଗଦର୍ଶନ ସହାୟକ</strong>। ମୁଁ ଆପଣଙ୍କୁ ପୋର୍ଟାଲ୍ ବ୍ୟବହାର କରିବା, ମାଇଲଷ୍ଟୋନ୍ ସେଟ୍ କରିବା, ହିଟମ୍ୟାପ୍ ଦେଖିବା ଏବଂ ସେଟିଂସ୍ ପରିବର୍ତ୍ତନ କରିବାରେ ସାହାଯ୍ୟ କରିବି। ଆଜି ମୁଁ ୱେବସାଇଟ୍ ପାଇଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
      'Bengali': "নমস্কার! আমি আপনার <strong>নির্দেশা ওয়েবসাইট গাইডেন্স অ্যাসিস্ট্যান্ট</strong>। পোর্টাল ব্যবহার, মাইলস্টোন সেট করা এবং সেটিংস পরিবর্তনে আমি সাহায্য করি।",
      'Marathi': "नमस्ते! मी तुमचा <strong>निर्देशा संकेतस्थळ मार्गदर्शन सहाय्यक</strong> आहे. पोर्टल वापरणे आणि सेटिंग्स बदलण्यात मी मदत करतो.",
      'Gujarati': "નમસ્તે! હું તમારો <strong>નિર્દેશા વેબસાઇટ માર્ગદર્શન સહાયક</strong> છું. પોર્ટલ પર નેવિગેટ કરવા અને સેટિંગ્સ બદલવામાં હું મદદ કરીશ.",
      'Tamil': "வணக்கம்! நான் உங்கள் <strong>நிர்தேஷா வலைத்தள வழிகாட்டி</strong>. தள வழிசெலுத்தல் மற்றும் அமைப்புகளில் நான் உதவுகிறேன்.",
      'Telugu': "నమస్కారం! నేను మీ <strong>నిర్దేశ వెబ్‌సైట్ మార్గదర్శిని</strong>. పోర్టల్ నావిగేషన్ మరియు సెట్టింగ్‌లలో సహాయం చేస్తాను.",
      'Kannada': "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ <strong>ನಿರ್ದೇಶಾ ವೆಬ್‌ಸೈಟ್ ಮಾರ್ಗದರ್ಶಕ</strong>. ಪೋರ್ಟಲ್ ಬಳಕೆ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್ಸ್‌ಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
      'Malayalam': "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ <strong>നിർദ്ദേശ വെബ്സൈറ്റ് ഗൈഡൻസ് അസിസ്റ്റന്റ്</strong> ആണ്. പോർട്ടൽ ഉപയോഗത്തിൽ ഞാൻ സഹായിക്കാം.",
      'Punjabi': "ਨਮਸਤੇ! ਮੈਂ ਤੁਹਾਡਾ <strong>ਨਿਰਦੇਸ਼ਾ ਵੈੱਬਸਾਈਟ ਮਾਰਗਦਰਸ਼ਨ ਸਹਾਇਕ</strong> ਹਾਂ। ਪੋਰਟਲ ਵਰਤੋਂ ਵਿੱਚ ਮੈਂ ਮਦਦ ਕਰਾਂਗਾ।"
    };

    const COMPANION_LANG_PLACEHOLDERS = {
      'English': "Ask a website navigation question...",
      'Hindi': "वेबसाइट से जुड़ा कोई भी प्रश्न पूछें...",
      'Odia': "ୱେବସାଇଟ୍ ସମ୍ବନ୍ଧୀୟ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ...",
      'Bengali': "ওয়েবসাইট সংক্রান্ত প্রশ্ন জিজ্ঞাসা করুন...",
      'Marathi': "संकेतस्थळाबद्दल प्रश्न विचारा...",
      'Gujarati': "વેબસાઇટ વિશે પ્રશ્ન પૂછો...",
      'Tamil': "வலைத்தளம் குறித்த கேள்விகளைக் கேளுங்கள்...",
      'Telugu': "వెబ్‌సైట్ గురించిన ప్రశ్నలు అడగండి...",
      'Kannada': "ವೆಬ್‌ಸೈಟ್ ಕುರಿತ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ...",
      'Malayalam': "വെബ്സൈറ്റ് സംബന്ധമായ ചോദ്യങ്ങൾ ചോദിക്കുക...",
      'Punjabi': "ਵੈੱਬਸਾਈਟ ਬਾਰੇ ਸਵਾਲ ਪੁੱਛੋ..."
    };

    if (companionLangSelect) {
      companionLangSelect.addEventListener('change', () => {
        companionLanguage = companionLangSelect.value;
        const greeting = COMPANION_LANG_GREETINGS[companionLanguage] || COMPANION_LANG_GREETINGS['English'];
        const placeholder = COMPANION_LANG_PLACEHOLDERS[companionLanguage] || COMPANION_LANG_PLACEHOLDERS['English'];

        if (input) input.placeholder = placeholder;

        if (chatBody) {
          const langMsg = document.createElement('div');
          langMsg.className = 'companion-msg bot';
          langMsg.innerHTML = `🌐 <strong>Language set to ${companionLanguage}</strong><br>${greeting}`;
          chatBody.appendChild(langMsg);
          chatBody.scrollTop = chatBody.scrollHeight;
        }
      });
    }

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
            <button type="button" class="companion-chip" data-query="How do I set my milestone streak?">Set Milestones</button>
            <button type="button" class="companion-chip" data-query="Explain the learning consistency heatmap">52-Week Heatmap</button>
            <button type="button" class="companion-chip" data-query="Where do I arrange my courses?">My Courses</button>
            <button type="button" class="companion-chip" data-query="How to change theme and profile settings?">Theme & Settings</button>
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

    // Fullscreen option removed per user requirement

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

        async function handleSend() {
      const q = input.value.trim();
      if (!q) return;
      appendMessage(q, 'user');
      input.value = '';

      // Create bot response message immediately
      const botMsg = document.createElement('div');
      botMsg.className = 'companion-msg bot';
      botMsg.innerHTML = '<span style="color:#64748b; font-style:italic;">⚡ Thinking...</span>';
      chatBody.appendChild(botMsg);
      chatBody.scrollTop = chatBody.scrollHeight;

      let accumulatedText = '';
      let hasReceivedFirstToken = false;

      try {
        // 1. Try Ultra-Fast Streaming Endpoint (/api/chat/stream)
        const response = await fetch('http://127.0.0.1:8000/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'public', message: q, role: 'guidance', language: companionLanguage
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
                      botMsg.innerHTML = '';
                      hasReceivedFirstToken = true;
                    }
                    accumulatedText += parsed.chunk.replace(/\*/g, "");
                    
                    const now = Date.now();
                    if (now - lastRenderTime > 80) {
                      lastRenderTime = now;
                      botMsg.innerHTML = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(accumulatedText) : accumulatedText.replace(/\n/g, '<br>');
                      chatBody.scrollTop = chatBody.scrollHeight;
                    }
                  }
                } catch (e) {}
              }
            }
          }

          if (accumulatedText.trim()) {
            botMsg.innerHTML = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(accumulatedText) : accumulatedText.replace(/\n/g, '<br>');
            companionHistory.push({ sender: 'bot', text: accumulatedText });
            chatBody.scrollTop = chatBody.scrollHeight;
            return;
          }
        }
      } catch (err) {
        // Fallback
      }

      // 2. Offline fallback
      if (!hasReceivedFirstToken) {
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

        botMsg.innerHTML = window.NirdeshaFormatter ? window.NirdeshaFormatter.format(reply) : reply.replace(/\n/g, "<br>");
        companionHistory.push({ sender: 'bot', text: reply });
        chatBody.scrollTop = chatBody.scrollHeight;
      }
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

    // Expose global invoker for external triggers & text selection engine
    window.askNirdeshaGuidance = function(queryText) {
      if (!queryText || !queryText.trim()) return;
      
      // 1. Open popup window
      if (typeof openPopup === 'function') {
        openPopup();
      } else if (popup) {
        popup.classList.add('is-open');
        if (promptBubble) promptBubble.style.display = 'none';
      }

      // 2. Put query in input and send
      if (input) {
        input.value = queryText;
        setTimeout(() => {
          handleSend();
          if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
        }, 50);
      }
    };
  }

  // ==========================================================================
  // UNIVERSAL TEXT SELECTION & DOUBLE-TAP "ASK AI GUIDANCE" ENGINE
  // ==========================================================================
  function initTextSelectionEngine() {
    let selectionPopup = document.getElementById('nirdesha-text-select-popup');
    if (!selectionPopup) {
      selectionPopup = document.createElement('div');
      selectionPopup.id = 'nirdesha-text-select-popup';
      selectionPopup.className = 'selection-ask-ai-popup';
      selectionPopup.innerHTML = `
        <button type="button" class="btn-selection-ask-ai" id="btn-selection-ask-ai" title="Ask Nirdesha AI Guidance about this text">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
          <span>Ask AI Guidance</span>
        </button>
      `;
      document.body.appendChild(selectionPopup);
    }

    const btnAsk = document.getElementById('btn-selection-ask-ai');
    let currentSelectedText = '';

    function checkAndShowPopup() {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          hidePopup();
          return;
        }

        const rawText = selection.toString().trim();
        if (rawText.length < 2) {
          hidePopup();
          return;
        }

        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
          hidePopup();
          return;
        }

        currentSelectedText = rawText;

        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (!rect || (rect.width === 0 && rect.height === 0)) {
            hidePopup();
            return;
          }

          const btnWidth = 145;
          const btnHeight = 34;
          let top = rect.top - btnHeight - 8;
          let left = rect.left + (rect.width / 2) - (btnWidth / 2);

          if (top < 10) {
            top = rect.bottom + 8;
          }
          if (left < 10) left = 10;
          if (left + btnWidth > window.innerWidth - 10) {
            left = window.innerWidth - btnWidth - 10;
          }

          selectionPopup.style.top = `${top + window.scrollY}px`;
          selectionPopup.style.left = `${left + window.scrollX}px`;
          selectionPopup.style.display = 'block';
          requestAnimationFrame(() => {
            selectionPopup.classList.add('visible');
          });
        } catch (e) {
          hidePopup();
        }
      }, 40);
    }

    function hidePopup() {
      if (selectionPopup) {
        selectionPopup.classList.remove('visible');
        setTimeout(() => {
          if (!selectionPopup.classList.contains('visible')) {
            selectionPopup.style.display = 'none';
          }
        }, 150);
      }
    }

    document.addEventListener('mouseup', (e) => {
      if (e.target.closest('#nirdesha-text-select-popup')) return;
      checkAndShowPopup();
    });

    document.addEventListener('dblclick', (e) => {
      if (e.target.closest('#nirdesha-text-select-popup')) return;
      checkAndShowPopup();
    });

    document.addEventListener('touchend', (e) => {
      if (e.target.closest('#nirdesha-text-select-popup')) return;
      checkAndShowPopup();
    });

    document.addEventListener('mousedown', (e) => {
      if (!e.target.closest('#nirdesha-text-select-popup')) {
        hidePopup();
      }
    });

    function handleAskClick(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const sel = window.getSelection();
      const fallbackSel = sel ? sel.toString().trim() : '';
      const textToQuery = currentSelectedText || fallbackSel;

      hidePopup();

      if (textToQuery && typeof window.askNirdeshaGuidance === 'function') {
        const cleanSnippet = textToQuery.length > 120 ? textToQuery.slice(0, 117) + '...' : textToQuery;
        window.askNirdeshaGuidance(`Explain this Nirdesha website feature and its context: "${cleanSnippet}"`);
      }
    }

    if (btnAsk) {
      btnAsk.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      btnAsk.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });

      btnAsk.addEventListener('click', handleAskClick);
      btnAsk.addEventListener('touchend', handleAskClick);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAiCompanion();
      initTextSelectionEngine();
    });
  } else {
    initAiCompanion();
    initTextSelectionEngine();
  }
})();
