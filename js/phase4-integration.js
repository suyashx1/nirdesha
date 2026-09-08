/**
 * Nirdesha Phase 4
 * Context-Aware AI Study Mentor
 *
 * Does NOT replace public.js.
 *
 * Adds:
 * - live context status panel
 * - dynamic context suggestions
 * - employee ID injection into mentor requests
 * - preferred-language sync
 * - automatic live context refresh
 */

(function () {
  'use strict';


  const API_BASE =
    window.NirdeshaPhase1?.API_BASE
    ||
    'http://127.0.0.1:8001';


  const EMPLOYEE_ID =
    window.NirdeshaPhase1?.EMPLOYEE_ID
    ||
    1;


  const REFRESH_MS =
    12000;


  const state = {

    summary:
      null,

    lastLoadedAt:
      0

  };


  // ==============================================================
  // HELPERS
  // ==============================================================

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


  async function api(
    path,
    options = {}
  ) {

    const response =
      await fetch(
        `${API_BASE}${path}`,
        {

          headers: {

            'Accept':
              'application/json',

            ...(
              options.body
              &&
              !(
                options.body
                instanceof FormData
              )

                ? {
                    'Content-Type':
                      'application/json'
                  }

                : {}
            ),

            ...(
              options.headers
              || {}
            )

          },

          ...options

        }
      );


    const data =
      await response
        .json()
        .catch(
          () => null
        );


    if (!response.ok) {

      throw new Error(

        data?.detail

        ||

        `Phase 4 API request failed (${response.status}).`

      );
    }


    return data;
  }


  // ==============================================================
  // ENRICH EXISTING MENTOR REQUESTS
  // ==============================================================

  /**
   * public.js already sends messages to:
   *
   * http://127.0.0.1:8000/api/chat/stream
   *
   * We do NOT rewrite public.js.
   *
   * Instead this bridge adds:
   *
   * employee_id = 1
   * context_version = 4
   *
   * only when role == mentor.
   */

  function installMentorFetchBridge() {

    if (
      window
        .__nirdeshaPhase4FetchInstalled
    ) {

      return;
    }


    window
      .__nirdeshaPhase4FetchInstalled =
        true;


    const originalFetch =
      window.fetch.bind(
        window
      );


    window.fetch = function (
      input,
      init = {}
    ) {

      try {

        const url =

          typeof input
          === 'string'

            ? input

            : (
                input?.url
                || ''
              );


        const isMentorEndpoint = (

          url.includes(
            '/api/chat/stream'
          )

          ||

          url.includes(
            '/api/chat'
          )

        );


        if (
          isMentorEndpoint
          &&
          init?.body
          &&
          typeof init.body
          === 'string'
        ) {

          const payload =
            JSON.parse(
              init.body
            );


          if (
            payload?.role
            === 'mentor'
          ) {

            payload.employee_id =

              Number(
                payload.employee_id
              )

              ||

              EMPLOYEE_ID;


            payload.context_version =
              4;


            init = {

              ...init,

              body:
                JSON.stringify(
                  payload
                )

            };
          }
        }

      } catch (_) {

        /*
         * If enrichment ever fails,
         * never break the original mentor request.
         */

      }


      return originalFetch(
        input,
        init
      );
    };
  }


  // ==============================================================
  // STYLE
  // ==============================================================

  function installStyles() {

    if (
      document.getElementById(
        'phase4-mentor-style'
      )
    ) {

      return;
    }


    const style =
      document.createElement(
        'style'
      );


    style.id =
      'phase4-mentor-style';


    style.textContent = `

      #phase4-mentor-context {

        margin:
          0 0 .75rem;

        padding:
          .8rem .9rem;

        border:
          1px solid #dbe5ec;

        border-radius:
          11px;

        background:
          linear-gradient(
            135deg,
            #f8fbfd,
            #f4fbf7
          );

        font-family:
          "Segoe UI",
          sans-serif;

      }


      .p4-context-head {

        display:
          flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap:
          .65rem;

        flex-wrap:
          wrap;

        margin-bottom:
          .55rem;

      }


      .p4-context-title {

        color:
          #002b49;

        font-size:
          .78rem;

        font-weight:
          850;

      }


      .p4-context-title small {

        display:
          block;

        margin-top:
          .15rem;

        color:
          #64748b;

        font-size:
          .59rem;

        font-weight:
          600;

      }


      .p4-live-pill {

        display:
          inline-flex;

        align-items:
          center;

        gap:
          .28rem;

        padding:
          .24rem .5rem;

        border:
          1px solid #bbf7d0;

        border-radius:
          999px;

        background:
          #ecfdf5;

        color:
          #15803d;

        font-size:
          .56rem;

        font-weight:
          850;

      }


      .p4-live-pill.offline {

        border-color:
          #fed7aa;

        background:
          #fff7ed;

        color:
          #9a3412;

      }


      .p4-context-grid {

        display:
          grid;

        grid-template-columns:
          repeat(
            4,
            minmax(0,1fr)
          );

        gap:
          .42rem;

      }


      .p4-context-item {

        min-height:
          55px;

        padding:
          .48rem .55rem;

        border:
          1px solid #e2e8f0;

        border-radius:
          8px;

        background:
          #fff;

      }


      .p4-context-item small {

        display:
          block;

        color:
          #64748b;

        font-size:
          .52rem;

        font-weight:
          800;

        text-transform:
          uppercase;

        letter-spacing:
          .025em;

      }


      .p4-context-item strong {

        display:
          block;

        margin-top:
          .2rem;

        color:
          #0f2742;

        font-size:
          .66rem;

        line-height:
          1.3;

      }


      .p4-context-item span {

        display:
          block;

        margin-top:
          .14rem;

        color:
          #64748b;

        font-size:
          .55rem;

        line-height:
          1.3;

      }


      .p4-prompt-row {

        display:
          flex;

        gap:
          .35rem;

        flex-wrap:
          wrap;

        margin-top:
          .55rem;

      }


      .p4-prompt-chip {

        border:
          1px solid #cbd5e1;

        border-radius:
          999px;

        background:
          #fff;

        color:
          #0369a1;

        padding:
          .31rem .55rem;

        font:
          700 .57rem
          "Segoe UI",
          sans-serif;

        cursor:
          pointer;

      }


      .p4-prompt-chip:hover {

        border-color:
          #0ea5e9;

        background:
          #f0f9ff;

      }


      .p4-refresh-btn {

        border:
          0;

        background:
          transparent;

        color:
          #0369a1;

        font:
          750 .56rem
          "Segoe UI",
          sans-serif;

        cursor:
          pointer;

      }


      @media(
        max-width:900px
      ) {

        .p4-context-grid {

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

        }

      }


      @media(
        max-width:560px
      ) {

        .p4-context-grid {

          grid-template-columns:
            1fr;

        }

      }

    `;


    document.head.appendChild(
      style
    );
  }


  // ==============================================================
  // CONTEXT PANEL
  // ==============================================================

  function ensureContextPanel() {

    const view =
      document.getElementById(
        'view-ai-mentor'
      );


    const heading =
      document.getElementById(
        'mentor-page-heading'
      );


    if (
      !view
      ||
      !heading
    ) {

      return null;
    }


    let root =
      document.getElementById(
        'phase4-mentor-context'
      );


    if (!root) {

      root =
        document.createElement(
          'div'
        );


      root.id =
        'phase4-mentor-context';


      heading.insertAdjacentElement(

        'afterend',

        root

      );
    }


    return root;
  }


  function renderLoading() {

    const root =
      ensureContextPanel();


    if (!root) {
      return;
    }


    root.innerHTML = `

      <div class="p4-context-head">

        <div class="p4-context-title">

          Live Learning Context

          <small>

            Loading your current competency,
            assessment and roadmap state...

          </small>

        </div>


        <span class="p4-live-pill">

          ● Syncing

        </span>

      </div>

    `;
  }


  function renderOffline(
    errorMessage = ''
  ) {

    const root =
      ensureContextPanel();


    if (!root) {
      return;
    }


    root.innerHTML = `

      <div class="p4-context-head">

        <div class="p4-context-title">

          Live Learning Context

          <small>

            The mentor can still explain concepts,
            but personal live metrics are temporarily unavailable.

          </small>

        </div>


        <span
          class="
            p4-live-pill
            offline
          "
        >

          ● Context Offline

        </span>

      </div>


      <div
        style="
          font-size:.58rem;
          color:#9a3412;
          line-height:1.4;
        "
      >

        ${
          escapeHtml(

            errorMessage

            ||

            'Check that the Phase-4 FastAPI backend is running on port 8001.'

          )
        }

      </div>

    `;
  }


  function renderSummary(
    summary
  ) {

    const root =
      ensureContextPanel();


    if (!root) {
      return;
    }


    const gap =
      summary.top_gap;


    const course =
      summary.active_course;


    const assessment =
      summary.recent_assessment;


    const promptButtons = (

      summary.suggested_prompts
      || []

    )
    .slice(
      0,
      4
    )
    .map(
      (
        prompt,
        index
      ) => `

        <button

          type="button"

          class="p4-prompt-chip"

          data-p4-prompt="${
            escapeHtml(
              prompt
            )
          }"

          title="Ask the mentor using live context"

        >

          ${
            index === 0

              ? 'What should I focus on?'

              : index === 1

                ? 'Explain my top gap'

                : index === 2

                  ? 'Current course guidance'

                  : 'Review latest assessment'
          }

        </button>

      `
    )
    .join('');


    root.innerHTML = `

      <div class="p4-context-head">

        <div class="p4-context-title">

          Context-Aware AI Mentor

          <small>

            Uses fresh Nirdesha database context
            on every mentor request —
            not hardcoded officer metrics.

          </small>

        </div>


        <div
          style="
            display:flex;
            align-items:center;
            gap:.35rem;
          "
        >

          <button

            type="button"

            class="p4-refresh-btn"

            id="p4-refresh-context"

          >

            ↻ Refresh

          </button>


          <span class="p4-live-pill">

            ● Live Context Synced

          </span>

        </div>

      </div>


      <div class="p4-context-grid">


        <div class="p4-context-item">

          <small>
            Role Journey
          </small>

          <strong>

            ${
              escapeHtml(

                summary.current_role

                ||
                'Current role unavailable'

              )
            }

          </strong>

          <span>

            →

            ${
              escapeHtml(

                summary.target_role

                ||
                'No target role selected'

              )
            }

          </span>

        </div>


        <div class="p4-context-item">

          <small>
            Role Readiness
          </small>

          <strong>

            ${
              Number(
                summary.readiness_pct
                || 0
              ).toFixed(1)
            }%

          </strong>

          <span>

            Updates only when competency
            evidence changes readiness.

          </span>

        </div>


        <div class="p4-context-item">

          <small>
            Top Live Gap
          </small>

          <strong>

            ${
              escapeHtml(

                gap?.skill_name

                ||
                'No active competency gap'

              )
            }

          </strong>

          <span>

            ${
              gap

                ? `

                  ${
                    Number(
                      gap.confidence_score
                      || 0
                    ).toFixed(1)
                  }% confidence

                  •

                  ${
                    gap.current_proficiency
                  }/5

                  →

                  ${
                    gap.required_proficiency
                  }/5

                `

                : (
                    'Current evaluated role '
                    +
                    'requirements are met.'
                  )
            }

          </span>

        </div>


        <div class="p4-context-item">

          <small>

            Current Learning /
            Latest Evidence

          </small>

          <strong>

            ${
              escapeHtml(

                course?.title

                ||

                assessment?.title

                ||

                'No active module'

              )
            }

          </strong>

          <span>

            ${
              course

                ? `

                  ${
                    Number(
                      course.progress_pct
                      || 0
                    ).toFixed(0)
                  }%

                  learning progress

                `

                : assessment

                  ? `

                    ${
                      Number(
                        assessment.score
                        || 0
                      ).toFixed(0)
                    }%

                    •

                    ${
                      escapeHtml(
                        assessment.skill_name
                      )
                    }

                  `

                  : (
                      'Start a recommended module '
                      +
                      'or take an assessment.'
                    )
            }

          </span>

        </div>


      </div>


      ${
        promptButtons

          ? `

            <div class="p4-prompt-row">

              ${promptButtons}

            </div>

          `

          : ''
      }

    `;
  }


  // ==============================================================
  // FETCH LIVE SUMMARY
  // ==============================================================

  async function loadSummary() {

    const summary =
      await api(

        `/api/mentor/context/${EMPLOYEE_ID}/summary`

      );


    state.summary =
      summary;


    state.lastLoadedAt =
      Date.now();


    renderSummary(
      summary
    );


    return summary;
  }


  // ==============================================================
  // PREFERRED LANGUAGE SYNC
  // ==============================================================

  function installLanguageSync() {

    const select =
      document.getElementById(
        'mentor-lang-select'
      );


    if (
      !select
      ||
      select.dataset
        .p4LanguageSync
      === '1'
    ) {

      return;
    }


    select.dataset
      .p4LanguageSync =
        '1';


    select.addEventListener(

      'change',

      async () => {

        try {

          await api(

            `/api/profile/${EMPLOYEE_ID}`,

            {

              method:
                'PUT',

              body:
                JSON.stringify({

                  preferred_language:
                    select.value

                })

            }

          );


          await loadSummary();

        } catch (error) {

          console.warn(

            'Could not sync mentor preferred language:',

            error

          );

        }

      }

    );
  }


  // ==============================================================
  // EVENTS
  // ==============================================================

  function installEvents() {

    document.addEventListener(

      'click',

      event => {

        const prompt =
          event.target.closest(
            '[data-p4-prompt]'
          );


        if (prompt) {

          const query =

            prompt.getAttribute(
              'data-p4-prompt'
            )

            || '';


          const input =
            document.getElementById(
              'trainee-chat-input'
            );


          const send =
            document.getElementById(
              'trainee-chat-send'
            );


          if (
            input
            &&
            send
            &&
            query
          ) {

            input.value =
              query;


            send.click();

          }


          return;
        }


        if (
          event.target.closest(
            '#p4-refresh-context'
          )
        ) {

          renderLoading();


          loadSummary()
            .catch(
              error =>
                renderOffline(
                  error.message
                )
            );
        }

      }

    );


    window.addEventListener(

      'hashchange',

      () => {

        if (
          window.location.hash
          === '#ai-mentor'
        ) {

          setTimeout(
            () => {

              loadSummary()
                .catch(
                  error =>
                    renderOffline(
                      error.message
                    )
                );

            },
            100
          );

        }

      }

    );
  }


  // ==============================================================
  // INITIALIZE
  // ==============================================================

  function init() {

    installStyles();

    installMentorFetchBridge();

    ensureContextPanel();

    installLanguageSync();

    installEvents();


    renderLoading();


    loadSummary()
      .catch(
        error => {

          console.error(

            'Phase 4 mentor context failed:',

            error

          );


          renderOffline(
            error.message
          );

        }
      );


    /*
     * While mentor is visible,
     * refresh the context panel every 12 seconds.
     *
     * Actual LLM context is fetched fresh
     * by server.py on EVERY mentor question.
     */

    setInterval(

      () => {

        const mentorView =
          document.getElementById(
            'view-ai-mentor'
          );


        const isVisible = (

          mentorView

          &&

          getComputedStyle(
            mentorView
          ).display
          !== 'none'

        );


        if (isVisible) {

          loadSummary()
            .catch(
              () => {}
            );

        }

      },

      REFRESH_MS

    );
  }


  if (
    document.readyState
    === 'loading'
  ) {

    document.addEventListener(

      'DOMContentLoaded',

      init

    );

  } else {

    init();

  }


  window.NirdeshaPhase4 = {

    API_BASE,

    EMPLOYEE_ID,

    state,

    refresh:
      loadSummary

  };

})();