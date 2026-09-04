/**
 * Nirdesha Universal Regional Translation & Language Selector Engine
 * Powers multi-lingual capability across landing page, public dashboard, and admin portal.
 */

const NIRDESHA_LANGUAGES = [
  { code: 'en', native: 'English', english: 'English (Default)', region: 'National / Administrative' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi', region: 'Union Official (Central Administration)' },
  { code: 'mr', native: 'मराठी', english: 'Marathi', region: 'Maharashtra, Goa & Western Zone' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu', region: 'Andhra Pradesh & Telangana' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil', region: 'Tamil Nadu & Puducherry' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali', region: 'West Bengal, Tripura & North East' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati', region: 'Gujarat, Daman & Diu' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada', region: 'Karnataka & Southern Zone' },
  { code: 'ml', native: 'മലയാളം', english: 'Malayalam', region: 'Kerala & Lakshadweep' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi', region: 'Punjab, Chandigarh, Delhi, Haryana' },
  { code: 'or', native: 'ଓଡ଼ିଆ', english: 'Odia', region: 'Odisha & Eastern Zone' },
  { code: 'ur', native: 'اردو', english: 'Urdu', region: 'Telangana, Delhi, UP, Bihar' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese', region: 'Assam & North Eastern Zone' }
];

// Global callback for Google Translate
window.googleTranslateElementInit = function() {
  if (window.google && window.google.translate) {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'hi,mr,te,ta,bn,gu,kn,ml,pa,or,ur,as,en',
      autoDisplay: false
    }, 'google_translate_element');
  }
};

(function () {
  function initTranslationEngine() {
    // 1. Ensure Google Translate hidden element exists
    if (!document.getElementById('google_translate_element')) {
      const gtDiv = document.createElement('div');
      gtDiv.id = 'google_translate_element';
      gtDiv.style.display = 'none';
      gtDiv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(gtDiv);
    }

    // 2. Ensure Google Translate script is loaded
    if (!document.getElementById('google-translate-script')) {
      const gtScript = document.createElement('script');
      gtScript.id = 'google-translate-script';
      gtScript.type = 'text/javascript';
      gtScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      gtScript.defer = true;
      document.head.appendChild(gtScript);
    }

    // 3. Ensure Language Selection Modal Markup exists
    if (!document.getElementById('lang-modal')) {
      const modal = document.createElement('div');
      modal.className = 'lang-modal-backdrop notranslate';
      modal.id = 'lang-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('translate', 'no');
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="lang-modal-dialog notranslate" translate="no">
          <div class="lang-modal-header notranslate" translate="no">
            <div class="lang-modal-title-group notranslate" translate="no">
              <h3 id="lang-modal-title" class="notranslate" translate="no">
                <span></span> Select Your Regional Language | अपनी भाषा चुनें
              </h3>
              <p class="lang-modal-subtitle notranslate" translate="no">
                National Competency Intelligence & Guidance Platform — MoSPI, Government of India
              </p>
            </div>
            <button class="lang-modal-close-btn notranslate" id="lang-modal-close" translate="no" aria-label="Close language selector">&times;</button>
          </div>

          <div class="lang-modal-search notranslate" translate="no">
            <div class="lang-search-wrap notranslate" translate="no">
              <svg class="lang-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" class="lang-search-input notranslate" id="lang-search" translate="no" placeholder="Search language (e.g. Marathi, Telugu, Tamil, Hindi, বাংলা)..." aria-label="Search Indian language">
            </div>
          </div>

          <div class="lang-modal-body notranslate" translate="no">
            <div class="lang-grid notranslate" id="lang-grid" translate="no">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <div class="lang-modal-footer notranslate" translate="no">
            <div class="lang-footer-hint notranslate" translate="no">
              Default language is English. Selection auto-translates the entire portal and saves your preference.
            </div>
            <div class="lang-actions-group notranslate" translate="no">
              <button class="btn-lang-cancel notranslate" id="lang-cancel-btn" translate="no">Cancel</button>
              <button class="btn-lang-apply notranslate" id="lang-apply-btn" translate="no">Apply Language</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Modal elements
    const langModal = document.getElementById('lang-modal');
    const langGrid = document.getElementById('lang-grid');
    const langSearchInput = document.getElementById('lang-search');
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const langModalClose = document.getElementById('lang-modal-close');
    const langCancelBtn = document.getElementById('lang-cancel-btn');
    const langApplyBtn = document.getElementById('lang-apply-btn');
    const currentLangLabel = document.getElementById('current-lang-label');

    let selectedLangCode = localStorage.getItem('nirdesha_selected_lang') || 'en';
    let tempSelectedLangCode = selectedLangCode;

    function renderLanguageCards(filterQuery = '') {
      if (!langGrid) return;
      langGrid.innerHTML = '';

      const q = filterQuery.toLowerCase().trim();
      const filtered = NIRDESHA_LANGUAGES.filter(item => 
        item.native.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q)
      );

      if (filtered.length === 0) {
        langGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #64748b;">No matching languages found. Try searching by language name or region.</div>`;
        return;
      }

      filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = `lang-card notranslate ${item.code === tempSelectedLangCode ? 'is-active' : ''}`;
        card.setAttribute('translate', 'no');
        card.dataset.code = item.code;
        card.innerHTML = `
          <div class="lang-badge-active notranslate" translate="no" title="Selected language">✓</div>
          <div class="lang-native notranslate" translate="no">${item.native}</div>
          <div class="lang-english notranslate" translate="no">${item.english}</div>
          <div class="notranslate" translate="no" style="font-size: 0.7rem; color: #94a3b8; margin-top: 0.35rem;">${item.region}</div>
        `;

        card.addEventListener('click', () => {
          tempSelectedLangCode = item.code;
          document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('is-active'));
          card.classList.add('is-active');
        });

        langGrid.appendChild(card);
      });
    }

    function openLanguageModal() {
      tempSelectedLangCode = selectedLangCode;
      renderLanguageCards();
      if (langSearchInput) langSearchInput.value = '';
      if (langModal) {
        langModal.style.display = 'flex';
        requestAnimationFrame(() => {
          langModal.classList.add('is-open');
          langModal.setAttribute('aria-hidden', 'false');
        });
      }
    }

    function closeLanguageModal() {
      if (langModal) {
        langModal.classList.remove('is-open');
        langModal.setAttribute('aria-hidden', 'true');
        setTimeout(() => {
          if (!langModal.classList.contains('is-open')) {
            langModal.style.display = 'none';
          }
        }, 250);
      }
    }

    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openLanguageModal();
      });
    }

    if (langModalClose) langModalClose.addEventListener('click', closeLanguageModal);
    if (langCancelBtn) langCancelBtn.addEventListener('click', closeLanguageModal);

    if (langModal) {
      langModal.addEventListener('click', (e) => {
        if (e.target === langModal) closeLanguageModal();
      });
    }

    if (langSearchInput) {
      langSearchInput.addEventListener('input', (e) => {
        renderLanguageCards(e.target.value);
      });
    }

    function executeGoogleTranslation(langCode) {
      if (langCode === 'en') {
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
        const select = document.querySelector('.goog-te-combo');
        if (select) {
          select.value = 'en';
          select.dispatchEvent(new Event('change'));
        }
        return;
      }

      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname};`;

      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      } else {
        setTimeout(() => {
          const retry = document.querySelector('.goog-te-combo');
          if (retry) {
            retry.value = langCode;
            retry.dispatchEvent(new Event('change'));
          }
        }, 600);
      }
    }

    function applyLanguage(langCode) {
      selectedLangCode = langCode;
      localStorage.setItem('nirdesha_selected_lang', langCode);

      const langObj = NIRDESHA_LANGUAGES.find(l => l.code === langCode) || NIRDESHA_LANGUAGES[0];

      if (currentLangLabel) {
        currentLangLabel.textContent = `${langObj.native} (${langObj.english.split(' ')[0]})`;
        currentLangLabel.className = 'notranslate';
        currentLangLabel.setAttribute('translate', 'no');
      }

      executeGoogleTranslation(langCode);
      closeLanguageModal();
    }

    if (langApplyBtn) {
      langApplyBtn.addEventListener('click', () => {
        applyLanguage(tempSelectedLangCode);
      });
    }

    // Apply stored language on load
    if (selectedLangCode && selectedLangCode !== 'en') {
      const langObj = NIRDESHA_LANGUAGES.find(l => l.code === selectedLangCode);
      if (langObj && currentLangLabel) {
        currentLangLabel.textContent = `${langObj.native} (${langObj.english.split(' ')[0]})`;
        currentLangLabel.className = 'notranslate';
        currentLangLabel.setAttribute('translate', 'no');
      }
      setTimeout(() => executeGoogleTranslation(selectedLangCode), 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslationEngine);
  } else {
    initTranslationEngine();
  }
})();
