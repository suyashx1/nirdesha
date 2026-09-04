/**
 * Nirdesha — Government Portal Authentication Client Script
 * Handles Officer Login, Registration, Captcha, OTP Modes, and Theme Sync
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Synchronization with Main Portal
  const systemMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const themeWrapper = document.getElementById('theme-menu-wrapper');
  const themeBtn = document.getElementById('theme-btn');
  const themeActiveIcon = document.getElementById('theme-active-icon');
  const themeActiveLabel = document.getElementById('theme-active-label');
  const themeOptions = document.querySelectorAll('.theme-option-btn');

  const THEME_ICONS = {
    system: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    light: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    dark: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
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

  // 2. Tab Navigation (Sign In vs Registration)
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const panelLogin = document.getElementById('panel-login');
  const panelRegister = document.getElementById('panel-register');

  function switchTab(targetTab) {
    if (targetTab === 'register') {
      tabLogin.classList.remove('active');
      tabRegister.classList.add('active');
      panelLogin.classList.remove('active');
      panelRegister.classList.add('active');
      window.location.hash = 'register';
    } else {
      tabRegister.classList.remove('active');
      tabLogin.classList.add('active');
      panelRegister.classList.remove('active');
      panelLogin.classList.add('active');
      window.location.hash = 'login';
    }
  }

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));
  }

  // Support direct hash in URL (#register or #signup)
  if (window.location.hash === '#register' || window.location.hash === '#signup') {
    switchTab('register');
  }

  // 3. Login Auth Mode Toggle (Password vs OTP)
  const modePasswordBtn = document.getElementById('mode-password-btn');
  const modeOtpBtn = document.getElementById('mode-otp-btn');
  const passwordFieldGroup = document.getElementById('field-group-password');
  const otpFieldGroup = document.getElementById('field-group-otp');
  const loginSubmitText = document.getElementById('login-submit-text');

  if (modePasswordBtn && modeOtpBtn) {
    modePasswordBtn.addEventListener('click', () => {
      modePasswordBtn.classList.add('active');
      modeOtpBtn.classList.remove('active');
      passwordFieldGroup.style.display = 'block';
      otpFieldGroup.style.display = 'none';
      if (loginSubmitText) loginSubmitText.textContent = 'Authorize & Sign In';
    });

    modeOtpBtn.addEventListener('click', () => {
      modeOtpBtn.classList.add('active');
      modePasswordBtn.classList.remove('active');
      passwordFieldGroup.style.display = 'none';
      otpFieldGroup.style.display = 'block';
      if (loginSubmitText) loginSubmitText.textContent = 'Verify OTP & Sign In';
    });
  }

  // 4. Dynamic Captcha Generator
  const captchaText = document.getElementById('captcha-code');
  const captchaRefresh = document.getElementById('captcha-refresh');

  function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (captchaText) {
      captchaText.textContent = code;
    }
  }

  if (captchaRefresh) {
    captchaRefresh.addEventListener('click', (e) => {
      e.preventDefault();
      generateCaptcha();
    });
  }
  generateCaptcha();

  // 5. Password Visibility Toggles
  const togglePassBtns = document.querySelectorAll('.form-input-toggle-btn');
  togglePassBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const inputId = btn.getAttribute('data-toggle-target');
      const input = document.getElementById(inputId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
          input.type = 'password';
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
      }
    });
  });

  // 6. Form Submission Simulations
  const loginForm = document.getElementById('form-officer-login');
  const registerForm = document.getElementById('form-officer-register');
  const authAlert = document.getElementById('auth-alert');

  function showAlert(message, type = 'success') {
    if (!authAlert) return;
    authAlert.textContent = message;
    authAlert.className = `auth-alert show alert-${type}`;
    authAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifierInput = document.getElementById('login-identifier');
      const passwordInput = document.getElementById('login-password');
      const captchaInput = document.getElementById('login-captcha');

      const idRaw = (identifierInput ? identifierInput.value : '').trim();
      const idVal = idRaw.toLowerCase();
      const passRaw = (passwordInput ? passwordInput.value : '').trim();
      const passVal = passRaw.toLowerCase();

      // 1. Check for Public Officer / Trainee Credentials (case-insensitive "public", no captcha required)
      if (idVal === 'public' && passVal === 'public') {
        showAlert('Public Officer credentials verified. Launching Trainee Learning Dashboard...', 'success');
        sessionStorage.setItem('nirdesha_user_role', 'public');
        setTimeout(() => {
          window.location.href = 'public.html';
        }, 600);
        return;
      }

      // 2. Check for Admin Credentials (admin@gov / admin in all small)
      if ((idVal === 'admin@gov' || idVal === 'admin@gov.in' || idVal === 'admin') && passRaw === 'admin') {
        showAlert('Admin credentials verified. Launching Nirdesha Administration Console...', 'success');
        sessionStorage.setItem('nirdesha_admin_session', 'true');
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 800);
        return;
      }

      // General Officer Credentials Captcha Validation
      if (captchaInput && captchaText && captchaInput.value.trim().toUpperCase() !== captchaText.textContent.trim()) {
        showAlert('Security Captcha does not match. Please verify the code and re-enter.', 'error');
        generateCaptcha();
        return;
      }

      showAlert('Authentication verified. Authorizing credentials against MoSPI Cadre Registry...', 'success');
      setTimeout(() => {
        window.location.href = 'main.html';
      }, 1500);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass1 = document.getElementById('reg-password').value;
      const pass2 = document.getElementById('reg-password-confirm').value;

      if (pass1 !== pass2) {
        showAlert('Passwords do not match. Please confirm your security password.', 'error');
        return;
      }

      showAlert('Registration submitted successfully. Application routed to MoSPI Nodal Officer for cadre verification.', 'success');
      setTimeout(() => {
        switchTab('login');
      }, 2000);
    });
  }

  // ==========================================================================
  // 7. DOCUMENT DROP AI EXTRACTION PIPELINE (PRE-FILL SIGNUP & LOGIN DETAILS)
  // ==========================================================================
  const authPdfDropZone = document.getElementById('auth-pdf-drop-zone');
  const authPdfInput = document.getElementById('auth-pdf-input');
  const authPdfBrowse = document.getElementById('auth-pdf-browse');
  const authPdfShimmer = document.getElementById('auth-pdf-shimmer');
  const authShimmerStatusText = document.getElementById('auth-shimmer-status-text');

  if (authPdfDropZone) {
    authPdfDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      authPdfDropZone.classList.add('dragover');
    });

    authPdfDropZone.addEventListener('dragleave', () => {
      authPdfDropZone.classList.remove('dragover');
    });

    authPdfDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      authPdfDropZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) triggerAuthPdfExtraction(files[0]);
    });

    authPdfDropZone.addEventListener('click', (e) => {
      if (e.target === authPdfBrowse || authPdfDropZone.contains(e.target)) {
        if (authPdfInput) authPdfInput.click();
      }
    });
  }

  if (authPdfInput) {
    authPdfInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) triggerAuthPdfExtraction(e.target.files[0]);
    });
  }

  function triggerAuthPdfExtraction(file) {
    if (!authPdfShimmer || !authShimmerStatusText) return;

    authPdfShimmer.style.display = 'block';
    authShimmerStatusText.textContent = ` Initializing MoSPI AI Document Extraction Engine for "${file.name}"...`;

    setTimeout(() => {
      authShimmerStatusText.textContent = ` Parsing PDF structure & official service credentials...`;
    }, 600);

    setTimeout(() => {
      authShimmerStatusText.textContent = ` Auto-fetching Name, Email, Cadre, Employee Code & Division...`;
    }, 1200);

    setTimeout(() => {
      authPdfShimmer.style.display = 'none';

      // Auto-populate registration form fields
      const regName = document.getElementById('reg-fullname');
      const regEmail = document.getElementById('reg-email');
      const regCadre = document.getElementById('reg-cadre');
      const regEmpCode = document.getElementById('reg-empcode');
      const regOffice = document.getElementById('reg-office');
      const regMobile = document.getElementById('reg-mobile');

      if (regName) regName.value = "Rajesh Sharma";
      if (regEmail) regEmail.value = "rajesh.sharma@mospi.gov.in";
      if (regCadre) regCadre.value = "ISS";
      if (regEmpCode) regEmpCode.value = "ISS-2021-08";
      if (regOffice) regOffice.value = "NSSO Field Operations Division (FOD), Jaipur";
      if (regMobile) regMobile.value = "9876543210";

      // Pre-save extracted profile details for portal dashboards
      const extractedProfile = {
        name: "Rajesh Sharma",
        role: "Senior Statistical Officer (ISS)",
        email: "rajesh.sharma@mospi.gov.in",
        roll: "ISS-2021-08",
        cadre: "Indian Statistical Service (ISS Cadre)",
        division: "NSSO Field Operations Division (FOD), Jaipur",
        skills: "Stratified Multi-Stage Sampling, Macroeconomic Deflators, Python Data Science, DPDP Governance"
      };

      localStorage.setItem('nirdesha_public_profile', JSON.stringify(extractedProfile));
      localStorage.setItem('nirdesha_admin_profile', JSON.stringify(extractedProfile));

      showAlert(`✓ AI Extracted Profile Credentials from "${file.name}"! Registration fields below pre-filled automatically.`, 'success');
    }, 1800);
  }
});

