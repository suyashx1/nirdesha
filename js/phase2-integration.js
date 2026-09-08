/**
 * Nirdesha Phase 2 Frontend Bridge
 * --------------------------------
 * 1. Real resume upload + parsing
 * 2. Human review before evidence is stored
 * 3. Uploaded material -> source-grounded quiz generation
 */

(function () {
  'use strict';

  const API_BASE =
    window.NirdeshaPhase1?.API_BASE ||
    ((window.location.protocol === 'http:' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? 'http://127.0.0.1:8001' : '');

  const EMPLOYEE_ID =
    window.NirdeshaPhase1?.EMPLOYEE_ID ||
    1;

  let currentResumeAnalysis = null;
  let currentMaterial = null;


  function escapeHtml(value) {

    return String(
      value ?? ''
    )

      .replace(
        /&/g,
        '&amp;'
      )

      .replace(
        /</g,
        '&lt;'
      )

      .replace(
        />/g,
        '&gt;'
      )

      .replace(
        /"/g,
        '&quot;'
      )

      .replace(
        /'/g,
        '&#039;'
      );
  }


  async function fetchJson(
    path,
    options = {}
  ) {

    const response =
      await fetch(
        `${API_BASE}${path}`,
        options
      );


    const isJson = (

      response.headers.get(
        'content-type'
      ) || ''

    ).includes(
      'application/json'
    );


    const data = isJson

      ? await response.json()

      : await response.text();


    if (!response.ok) {

      const detail = (

        data &&
        typeof data === 'object'

      )

        ? (
            data.detail ||
            JSON.stringify(data)
          )

        : String(data);


      throw new Error(

        detail ||
        `HTTP ${response.status}`

      );
    }


    return data;
  }


  function showToast(
    message,
    isError = false
  ) {

    const existing =
      document.getElementById(
        'phase2-toast'
      );


    if (existing) {
      existing.remove();
    }


    const toast =
      document.createElement(
        'div'
      );


    toast.id =
      'phase2-toast';


    toast.textContent =
      message;


    toast.style.cssText = `

      position: fixed;

      right: 20px;

      bottom: 20px;

      z-index: 999999;

      max-width: 440px;

      padding: 12px 16px;

      border-radius: 10px;

      background:
        ${
          isError
            ? '#991b1b'
            : '#14532d'
        };

      color: #fff;

      font:
        600 13px/1.4
        "Segoe UI",
        sans-serif;

      box-shadow:
        0 12px 32px
        rgba(0,0,0,.22);

    `;


    document.body.appendChild(
      toast
    );


    setTimeout(

      () =>
        toast.remove(),

      isError
        ? 6500
        : 4000

    );
  }


  function installStyles() {

    if (
      document.getElementById(
        'phase2-styles'
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        'style'
      );


    style.id =
      'phase2-styles';


    style.textContent = `

      .p2-card{
        border:1px solid #dbe3ec;
        border-radius:14px;
        background:#fff;
        padding:16px;
        margin:0 0 18px;
        box-shadow:0 5px 18px rgba(15,23,42,.05);
        font-family:"Segoe UI",sans-serif
      }

      .p2-card h3{
        margin:0 0 5px;
        color:#0f2742;
        font-size:16px
      }

      .p2-card p{
        margin:0;
        color:#64748b;
        font-size:12.5px;
        line-height:1.5
      }

      .p2-row{
        display:flex;
        gap:10px;
        align-items:center;
        flex-wrap:wrap;
        margin-top:12px
      }

      .p2-btn{
        border:0;
        border-radius:9px;
        padding:9px 13px;
        font:700 12px "Segoe UI",sans-serif;
        cursor:pointer;
        background:#0f6cab;
        color:#fff
      }

      .p2-btn.secondary{
        background:#eef4f8;
        color:#17415f;
        border:1px solid #cfdde8
      }

      .p2-btn:disabled{
        opacity:.55;
        cursor:not-allowed
      }

      .p2-drop{
        margin-top:12px;
        border:1.5px dashed #93a9bd;
        border-radius:12px;
        padding:16px;
        text-align:center;
        background:#f8fbfd;
        color:#37556f;
        font-size:12px;
        cursor:pointer
      }

      .p2-drop.drag{
        border-color:#ea580c;
        background:#fff7ed
      }

      .p2-status{
        font-size:12px;
        margin-top:10px;
        color:#475569
      }

      .p2-status strong{
        color:#0f2742
      }

      .p2-select{
        height:36px;
        border:1px solid #cfd8e3;
        border-radius:8px;
        background:#fff;
        padding:0 9px;
        font:12px "Segoe UI",sans-serif;
        color:#334155
      }

      .p2-modal{
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.6);
        z-index:999998;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px
      }

      .p2-dialog{
        width:min(900px,96vw);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:16px;
        padding:20px;
        box-shadow:0 25px 70px rgba(0,0,0,.3);
        font-family:"Segoe UI",sans-serif
      }

      .p2-dialog h2{
        margin:0 0 5px;
        color:#0f2742
      }

      .p2-note{
        font-size:12px;
        color:#64748b;
        margin:0 0 14px
      }

      .p2-grid{
        display:grid;
        grid-template-columns:
          repeat(2,minmax(0,1fr));
        gap:10px
      }

      .p2-field{
        border:1px solid #e0e7ef;
        border-radius:9px;
        padding:9px
      }

      .p2-field label{
        display:block;
        font-size:10px;
        color:#64748b;
        font-weight:700;
        text-transform:uppercase;
        margin-bottom:4px
      }

      .p2-field input{
        width:100%;
        border:0;
        outline:none;
        font:13px "Segoe UI",sans-serif;
        color:#0f2742
      }

      .p2-skill{
        display:flex;
        align-items:flex-start;
        gap:8px;
        padding:9px;
        border-bottom:1px solid #eef2f6
      }

      .p2-skill small{
        display:block;
        color:#64748b;
        margin-top:2px
      }

      .p2-warning{
        background:#fff7ed;
        border:1px solid #fed7aa;
        color:#9a3412;
        border-radius:9px;
        padding:9px;
        font-size:11px;
        margin:10px 0
      }

      .p2-preview{
        white-space:pre-wrap;
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:9px;
        padding:10px;
        font-size:11px;
        color:#475569;
        max-height:120px;
        overflow:auto
      }

      .p2-source-badge{
        display:inline-block;
        background:#ecfdf5;
        color:#166534;
        border:1px solid #bbf7d0;
        border-radius:999px;
        padding:2px 7px;
        font-size:10px;
        font-weight:700
      }

      @media(max-width:700px){

        .p2-grid{
          grid-template-columns:1fr
        }

      }

    `;


    document.head.appendChild(
      style
    );
  }


  // ============================================================
  // RESUME
  // ============================================================

  async function parseResumeFile(
    file
  ) {

    if (!file) return;


    const shimmer =
      document.getElementById(
        'public-pdf-shimmer'
      );


    const statusText =
      document.getElementById(
        'public-shimmer-status-text'
      );


    if (shimmer) {

      shimmer.style.display =
        'block';

    }


    if (statusText) {

      statusText.textContent =
        `Extracting selectable text from "${file.name}"...`;

    }


    const form =
      new FormData();


    form.append(
      'employee_id',
      String(
        EMPLOYEE_ID
      )
    );


    form.append(
      'file',
      file
    );


    try {

      if (statusText) {

        statusText.textContent =
          'Parsing document and mapping skills to the Nirdesha competency catalog...';

      }


      const result =
        await fetchJson(

          '/api/resume/parse',

          {
            method:
              'POST',

            body:
              form
          }

        );


      currentResumeAnalysis =
        result;


      if (shimmer) {

        shimmer.style.display =
          'none';

      }


      openResumeReview(
        result
      );

    } catch (error) {

      if (shimmer) {

        shimmer.style.display =
          'none';

      }


      showToast(

        `Resume analysis failed: ${error.message}`,

        true

      );
    }
  }


  function openResumeReview(
    result
  ) {

    document
      .getElementById(
        'phase2-resume-modal'
      )
      ?.remove();


    const fields = [

      'name',
      'email',
      'designation',
      'division',
      'cadre',
      'ministry',
      'station',
      'education',
      'experience_years'

    ];


    const fieldHtml =
      fields.map(
        key => {

          const item =
            result.profile?.[
              key
            ] || {};


          return `

            <div class="p2-field">

              <label>

                ${
                  escapeHtml(
                    key.replace(
                      /_/g,
                      ' '
                    )
                  )
                }

                •

                ${
                  Math.round(
                    (
                      item.confidence
                      || 0
                    ) * 100
                  )
                }% confidence

              </label>

              <input
                data-p2-profile="${key}"
                value="${
                  escapeHtml(
                    item.value ?? ''
                  )
                }"
              >

              <small
                style="
                  font-size:10px;
                  color:#94a3b8
                "
              >

                ${
                  escapeHtml(
                    item.evidence
                    ||
                    'No direct source phrase captured'
                  )
                }

              </small>

            </div>

          `;

        }

      ).join('');


    const skillHtml =
      (
        result.skills
        || []
      )
      .map(
        (
          skill,
          index
        ) => `

          <div class="p2-skill">

            <input
              type="checkbox"
              data-p2-skill-check="${index}"
              checked
              style="margin-top:3px"
            >

            <div style="flex:1">

              <strong>
                ${escapeHtml(
                  skill.skill_name
                )}
              </strong>

              <span class="p2-source-badge">

                ${
                  Math.round(
                    skill.confidence
                    * 100
                  )
                }%

                extraction confidence

              </span>

              <small>

                ${
                  escapeHtml(
                    skill.evidence
                    ||
                    'Mention detected in uploaded document'
                  )
                }

              </small>

            </div>

            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value="${
                Math.round(
                  skill.suggested_score
                )
              }"
              data-p2-skill-score="${index}"
              class="p2-select"
              style="width:76px"
              title="Preliminary evidence score"
            >

          </div>

        `

      ).join('')

      ||

      '<p class="p2-note">No supported competency-catalog skills were confidently detected. You can still confirm the profile fields.</p>';


    const warnings =
      (
        result.warnings
        || []
      )
      .map(
        warning => `

          <div class="p2-warning">

            ${
              escapeHtml(
                warning
              )
            }

          </div>

        `
      )
      .join('');


    const modal =
      document.createElement(
        'div'
      );


    modal.id =
      'phase2-resume-modal';


    modal.className =
      'p2-modal';


    modal.innerHTML = `

      <div class="p2-dialog">

        <h2>
          Review AI-Extracted Profile
        </h2>

        <p class="p2-note">

          Nothing becomes trusted competency evidence
          until you confirm it.

          Parser mode:

          <strong>
            ${
              escapeHtml(
                result.parser_mode
              )
            }
          </strong>.

        </p>

        ${warnings}

        <div class="p2-grid">

          ${fieldHtml}

        </div>

        <h3
          style="
            margin:18px 0 6px;
            color:#0f2742
          "
        >

          Detected Competencies

        </h3>

        <p class="p2-note">

          Resume mentions are stored only as
          low-weight self-assessment evidence after
          human confirmation; they are not treated
          as proof of mastery.

        </p>

        <div>

          ${skillHtml}

        </div>

        <details style="margin-top:12px">

          <summary
            style="
              cursor:pointer;
              font-size:12px;
              font-weight:700;
              color:#334155
            "
          >

            Source preview

          </summary>

          <div class="p2-preview">

            ${
              escapeHtml(
                result.preview || ''
              )
            }

          </div>

        </details>

        <div
          class="p2-row"
          style="
            justify-content:flex-end;
            margin-top:18px
          "
        >

          <button
            class="p2-btn secondary"
            id="p2-resume-cancel"
          >
            Cancel
          </button>

          <button
            class="p2-btn"
            id="p2-resume-confirm"
          >
            Confirm & Update Competency Profile
          </button>

        </div>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    modal.querySelector(
      '#p2-resume-cancel'
    ).onclick = () =>
      modal.remove();


    modal.querySelector(
      '#p2-resume-confirm'
    ).onclick =
      confirmResumeReview;
  }


  async function confirmResumeReview() {

    const modal =
      document.getElementById(
        'phase2-resume-modal'
      );


    if (
      !modal
      || !currentResumeAnalysis
    ) {
      return;
    }


    const button =
      modal.querySelector(
        '#p2-resume-confirm'
      );


    button.disabled =
      true;


    button.textContent =
      'Saving confirmed evidence...';


    const profile = {};


    modal
      .querySelectorAll(
        '[data-p2-profile]'
      )
      .forEach(
        input => {

          const key =
            input.getAttribute(
              'data-p2-profile'
            );


          const value =
            input.value.trim();


          if (value !== '') {

            profile[key] = (

              key ===
              'experience_years'

                ? Number(value)

                : value

            );
          }
        }
      );


    const skills = [];


    (
      currentResumeAnalysis.skills
      || []
    )
    .forEach(
      (
        skill,
        index
      ) => {

        const checked =
          modal.querySelector(

            `[data-p2-skill-check="${index}"]`

          )?.checked;


        if (!checked) {
          return;
        }


        const score =
          Number(

            modal.querySelector(

              `[data-p2-skill-score="${index}"]`

            )?.value

            ||

            skill.suggested_score

            ||

            50

          );


        skills.push({

          skill_code:
            skill.skill_code,

          score:
            Math.max(
              0,
              Math.min(
                100,
                score
              )
            ),

          evidence:
            skill.evidence
            || null

        });
      }
    );


    try {

      const result =
        await fetchJson(

          `/api/resume/${currentResumeAnalysis.analysis_id}/confirm`,

          {

            method:
              'POST',

            headers: {

              'Content-Type':
                'application/json'

            },

            body:
              JSON.stringify({
                profile,
                skills
              })

          }

        );


      if (
        window.NirdeshaPhase1
        ?.applyEmployeeSnapshot
      ) {

        window.NirdeshaPhase1
          .applyEmployeeSnapshot(

            result.profile,

            result.competency

          );
      }


      modal.remove();


      showToast(

        `Profile confirmed. ${result.evidence_added} competency evidence item(s) added.`

      );

    } catch (error) {

      button.disabled =
        false;


      button.textContent =
        'Confirm & Update Competency Profile';


      showToast(

        `Could not confirm profile: ${error.message}`,

        true

      );
    }
  }


  function installResumeInterception() {

    const input =
      document.getElementById(
        'public-pdf-input'
      );


    const zone =
      document.getElementById(
        'public-pdf-drop-zone'
      );


    if (
      !input
      || !zone
    ) {
      return;
    }


    input.setAttribute(

      'accept',

      '.pdf,.docx,.txt,' +
      'application/pdf,' +
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
      'text/plain'

    );


    /*
     * Capture phase executes before
     * public.js' old simulated handler.
     */

    input.addEventListener(

      'change',

      event => {

        if (
          !event.target.files
          ?.length
        ) {
          return;
        }


        event.stopImmediatePropagation();


        parseResumeFile(
          event.target.files[0]
        );


        event.target.value =
          '';

      },

      true

    );


    zone.addEventListener(

      'drop',

      event => {

        const file =
          event.dataTransfer
          ?.files?.[0];


        if (!file) {
          return;
        }


        event.preventDefault();

        event.stopImmediatePropagation();


        zone.classList.remove(
          'dragover'
        );


        parseResumeFile(
          file
        );

      },

      true

    );
  }


  // ============================================================
  // LEARNING MATERIAL -> QUIZ
  // ============================================================

  function injectMaterialQuizCard() {

    const panel =
      document.getElementById(
        'quiz-panel-available'
      );


    if (
      !panel
      ||
      document.getElementById(
        'phase2-material-card'
      )
    ) {
      return;
    }


    const card =
      document.createElement(
        'div'
      );


    card.id =
      'phase2-material-card';


    card.className =
      'p2-card';


    card.innerHTML = `

      <div
        style="
          display:flex;
          justify-content:space-between;
          gap:12px;
          align-items:flex-start;
          flex-wrap:wrap
        "
      >

        <div>

          <h3>

            Generate Quiz from Uploaded Learning Material

            <span class="p2-source-badge">

              REAL PHASE-2 PIPELINE

            </span>

          </h3>

          <p>

            Upload PDF, DOCX, PPTX, TXT/MD or transcript text.
            Nirdesha extracts the source, creates grounded MCQs,
            then your existing assessment engine sends the result
            back to the competency engine.

          </p>

        </div>

      </div>

      <input
        type="file"
        id="p2-material-input"
        hidden
        accept=".pdf,.docx,.pptx,.txt,.md,.srt,.vtt"
      >

      <div
        id="p2-material-drop"
        class="p2-drop"
      >

        <strong>
          Drop learning material here
        </strong>

        <br>

        or click to browse • max 10 MB

      </div>

      <div
        id="p2-material-status"
        class="p2-status"
      >

        No material uploaded yet.

      </div>

      <div class="p2-row">

        <select
          id="p2-skill-select"
          class="p2-select"
        >

          <option value="">
            Auto-detect competency
          </option>

        </select>

        <select
          id="p2-difficulty"
          class="p2-select"
        >

          <option>
            Beginner
          </option>

          <option selected>
            Intermediate
          </option>

          <option>
            Advanced
          </option>

        </select>

        <select
          id="p2-count"
          class="p2-select"
        >

          <option value="3">
            3 questions
          </option>

          <option
            value="5"
            selected
          >
            5 questions
          </option>

          <option value="7">
            7 questions
          </option>

          <option value="10">
            10 questions
          </option>

        </select>

        <button
          id="p2-generate-quiz"
          class="p2-btn"
          disabled
        >

          Generate Source-Grounded Quiz

        </button>

      </div>

    `;


    const list =
      document.getElementById(
        'custom-quizzes-list'
      );


    if (
      list
      &&
      list.parentElement === panel
    ) {

      panel.insertBefore(
        card,
        list
      );

    } else {

      panel.prepend(
        card
      );

    }


    const input =
      card.querySelector(
        '#p2-material-input'
      );


    const drop =
      card.querySelector(
        '#p2-material-drop'
      );


    drop.onclick =
      () =>
        input.click();


    drop.addEventListener(

      'dragover',

      event => {

        event.preventDefault();

        drop.classList.add(
          'drag'
        );

      }

    );


    drop.addEventListener(

      'dragleave',

      () =>
        drop.classList.remove(
          'drag'
        )

    );


    drop.addEventListener(

      'drop',

      event => {

        event.preventDefault();


        drop.classList.remove(
          'drag'
        );


        const file =
          event.dataTransfer
          ?.files?.[0];


        if (file) {

          uploadLearningMaterial(
            file
          );

        }

      }

    );


    input.onchange =
      () => {

        const file =
          input.files?.[0];


        if (file) {

          uploadLearningMaterial(
            file
          );

        }


        input.value =
          '';

      };


    card.querySelector(
      '#p2-generate-quiz'
    ).onclick =
      generateSourceQuiz;


    populateSkillSelect();
  }


  async function populateSkillSelect() {

    const selectElement =
      document.getElementById(
        'p2-skill-select'
      );


    if (!selectElement) {
      return;
    }


    try {

      const skills = (

        window.NirdeshaPhase1
        ?.api

          ? await window
              .NirdeshaPhase1
              .api(
                '/api/skills'
              )

          : await fetchJson(
              '/api/skills'
            )

      );


      skills.forEach(
        skill => {

          const option =
            document.createElement(
              'option'
            );


          option.value =
            skill.code;


          option.textContent =

            `${skill.name} • ${skill.domain}`;


          selectElement.appendChild(
            option
          );

        }

      );

    } catch (_) {

      /*
       * Auto-detect remains available
       * even if the skill catalog
       * cannot be loaded.
       */

    }
  }


  async function uploadLearningMaterial(
    file
  ) {

    const status =
      document.getElementById(
        'p2-material-status'
      );


    const generateButton =
      document.getElementById(
        'p2-generate-quiz'
      );


    generateButton.disabled =
      true;


    status.innerHTML =

      `Uploading and extracting ` +
      `<strong>${escapeHtml(file.name)}</strong>...`;


    const form =
      new FormData();


    form.append(

      'employee_id',

      String(
        EMPLOYEE_ID
      )

    );


    form.append(

      'title',

      file.name.replace(
        /\.[^.]+$/,
        ''
      )

    );


    form.append(
      'file',
      file
    );


    try {

      currentMaterial =
        await fetchJson(

          '/api/materials/upload',

          {

            method:
              'POST',

            body:
              form

          }

        );


      status.innerHTML =

        `<strong>${escapeHtml(currentMaterial.title)}</strong> ` +
        `ready • ${currentMaterial.word_count} words • ` +
        `Material ID ${currentMaterial.id}`;


      generateButton.disabled =
        false;


      showToast(
        'Learning material extracted successfully.'
      );

    } catch (error) {

      currentMaterial =
        null;


      status.textContent =
        'Upload failed.';


      showToast(

        `Learning material upload failed: ${error.message}`,

        true

      );
    }
  }


  async function generateSourceQuiz() {

    if (!currentMaterial) {

      showToast(

        'Upload a learning material first.',

        true

      );

      return;
    }


    const button =
      document.getElementById(
        'p2-generate-quiz'
      );


    const status =
      document.getElementById(
        'p2-material-status'
      );


    button.disabled =
      true;


    button.textContent =
      'Generating grounded MCQs...';


    const payload = {

      question_count:
        Number(
          document.getElementById(
            'p2-count'
          ).value || 5
        ),

      difficulty:
        document.getElementById(
          'p2-difficulty'
        ).value
        || 'Intermediate',

      skill_code:
        document.getElementById(
          'p2-skill-select'
        ).value
        || null,

      question_time_seconds:
        45

    };


    try {

      const quiz =
        await fetchJson(

          `/api/materials/${currentMaterial.id}/generate-quiz`,

          {

            method:
              'POST',

            headers: {

              'Content-Type':
                'application/json'

            },

            body:
              JSON.stringify(
                payload
              )

          }

        );


      let quizzes = [];


      try {

        quizzes =
          JSON.parse(

            localStorage.getItem(
              'nirdesha_custom_quizzes'
            )

            || '[]'

          );


        if (
          !Array.isArray(
            quizzes
          )
        ) {

          quizzes = [];
        }

      } catch (_) {

        quizzes = [];

      }


      quizzes =
        quizzes.filter(

          existing =>
            existing.id
            !== quiz.id

        );


      quizzes.unshift(
        quiz
      );


      localStorage.setItem(

        'nirdesha_custom_quizzes',

        JSON.stringify(
          quizzes
        )

      );


      if (
        typeof
        window.renderCustomQuizzesGrid
        === 'function'
      ) {

        window
          .renderCustomQuizzesGrid();

      }


      if (
        typeof
        window.updateQuizBadges
        === 'function'
      ) {

        window
          .updateQuizBadges();

      }


      status.innerHTML =

        `<strong>Quiz ready:</strong> ` +
        `${escapeHtml(quiz.title)} • ` +
        `${quiz.questions.length} questions • ` +
        `generator mode: ` +
        `<strong>${escapeHtml(quiz.generatorMode)}</strong>`;


      showToast(

        `Source-grounded quiz generated (${quiz.generatorMode} mode).`

      );

    } catch (error) {

      showToast(

        `Quiz generation failed: ${error.message}`,

        true

      );

    } finally {

      button.disabled =
        false;


      button.textContent =
        'Generate Source-Grounded Quiz';

    }
  }


  document.addEventListener(

    'DOMContentLoaded',

    () => {

      installStyles();

      installResumeInterception();

      injectMaterialQuizCard();

    }

  );


  window.NirdeshaPhase2 = {

    parseResumeFile,

    uploadLearningMaterial,

    generateSourceQuiz

  };

})();