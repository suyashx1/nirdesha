/**
 * Nirdesha Phase 3
 * Personalized Learning & Recommendation Intelligence
 *
 * Connects:
 *
 * Competency Gap
 *      ↓
 * Recommendation Engine
 *      ↓
 * Prototype iGOT / NSSTA Catalogue
 *      ↓
 * Adaptive Roadmap
 *      ↓
 * Learning Progress
 *      ↓
 * Course Completion Evidence
 *      ↓
 * Competency Engine
 */

(function () {
  'use strict';


  const API_BASE =
    window.NirdeshaPhase1?.API_BASE
    ||
    ((window.location.protocol === 'http:' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? 'http://127.0.0.1:8001' : '');


  const EMPLOYEE_ID =
    window.NirdeshaPhase1?.EMPLOYEE_ID
    ||
    1;


  const state = {

    recommendations:
      [],

    roadmap:
      null,

    progress:
      [],

    sourceFilter:
      'all'

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

        `Phase 3 API request failed (${response.status}).`

      );
    }


    return data;
  }


  function showToast(
    message,
    type = 'success'
  ) {

    document
      .getElementById(
        'phase3-toast'
      )
      ?.remove();


    const toast =
      document.createElement(
        'div'
      );


    toast.id =
      'phase3-toast';


    const background =

      type === 'error'

        ? '#991b1b'

        : type === 'warning'

          ? '#9a3412'

          : '#14532d';


    toast.style.cssText = `

      position:fixed;

      right:20px;

      bottom:20px;

      z-index:999999;

      max-width:430px;

      padding:12px 16px;

      border-radius:10px;

      background:${background};

      color:#fff;

      font:
        600 13px/1.45
        "Segoe UI",
        sans-serif;

      box-shadow:
        0 14px 35px
        rgba(0,0,0,.25);

    `;


    toast.textContent =
      message;


    document.body.appendChild(
      toast
    );


    setTimeout(

      () =>
        toast.remove(),

      type === 'error'
        ? 6500
        : 4200

    );
  }


  function progressByCourseCode() {

    return new Map(

      (
        state.progress
        || []
      )
      .map(
        item => [

          item.course_code,

          item

        ]
      )

    );
  }


  // ==============================================================
  // CSS
  // ==============================================================

  function installStyles() {

    if (
      document.getElementById(
        'phase3-learning-styles'
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        'style'
      );


    style.id =
      'phase3-learning-styles';


    style.textContent = `

      #phase3-learning-root {
        font-family:
          "Segoe UI",
          sans-serif;
      }

      .p3-banner {
        display:grid;
        grid-template-columns:
          1.25fr .75fr;
        gap:14px;
        padding:17px;
        margin-bottom:16px;
        border:1px solid #dbe5ec;
        border-radius:15px;
        background:
          linear-gradient(
            135deg,
            #f8fbfd 0%,
            #eef8f3 100%
          );
      }

      .p3-eyebrow {
        color:#ea580c;
        font-size:10px;
        font-weight:800;
        letter-spacing:.07em;
        text-transform:uppercase;
      }

      .p3-title {
        margin:4px 0 5px;
        color:#002b49;
        font-size:20px;
        font-weight:850;
      }

      .p3-subtitle {
        margin:0;
        color:#64748b;
        font-size:12px;
        line-height:1.5;
      }

      .p3-metrics {
        display:grid;
        grid-template-columns:
          repeat(
            2,
            minmax(0,1fr)
          );
        gap:8px;
      }

      .p3-metric {
        padding:10px;
        border:1px solid #dbe5ec;
        border-radius:10px;
        background:#fff;
      }

      .p3-metric small {
        display:block;
        color:#64748b;
        font-size:9px;
        font-weight:800;
        text-transform:uppercase;
      }

      .p3-metric strong {
        display:block;
        margin-top:4px;
        color:#0f2742;
        font-size:15px;
      }

      .p3-section {
        margin-bottom:18px;
        padding:15px;
        border:1px solid #dfe7ee;
        border-radius:14px;
        background:#fff;
        box-shadow:
          0 5px 18px
          rgba(15,23,42,.04);
      }

      .p3-section-head {
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
        flex-wrap:wrap;
        margin-bottom:12px;
      }

      .p3-section-head h3 {
        margin:0;
        color:#002b49;
        font-size:16px;
      }

      .p3-section-head p {
        margin:3px 0 0;
        color:#64748b;
        font-size:11px;
      }

      .p3-prototype-pill {
        display:inline-flex;
        align-items:center;
        gap:5px;
        padding:4px 8px;
        border:1px solid #fdba74;
        border-radius:999px;
        background:#fff7ed;
        color:#9a3412;
        font-size:9px;
        font-weight:800;
      }


      /* ROADMAP */

      .p3-roadmap {
        display:flex;
        flex-direction:column;
        gap:0;
      }

      .p3-step {
        display:grid;
        grid-template-columns:
          38px 1fr;
        gap:10px;
        position:relative;
      }

      .p3-step:not(:last-child)::before {
        content:"";
        position:absolute;
        left:18px;
        top:34px;
        bottom:-2px;
        width:2px;
        background:#dbe5ec;
      }

      .p3-node {
        position:relative;
        z-index:2;
        width:36px;
        height:36px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        border:2px solid #cbd5e1;
        background:#fff;
        color:#64748b;
        font-size:11px;
        font-weight:900;
      }

      .p3-step.current .p3-node {
        border-color:#ea580c;
        background:#fff7ed;
        color:#c2410c;
      }

      .p3-step.completed .p3-node,
      .p3-step.mastered .p3-node {
        border-color:#16a34a;
        background:#ecfdf5;
        color:#15803d;
      }

      .p3-step.locked .p3-node {
        background:#f1f5f9;
        color:#94a3b8;
      }

      .p3-step-card {
        margin-bottom:10px;
        padding:10px 12px;
        border:1px solid #e2e8f0;
        border-radius:10px;
        background:#fafcfd;
      }

      .p3-step.current .p3-step-card {
        border-color:#fdba74;
        background:#fffaf5;
      }

      .p3-step.completed .p3-step-card,
      .p3-step.mastered .p3-step-card {
        border-color:#bbf7d0;
        background:#f5fff8;
      }

      .p3-step-top {
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:8px;
      }

      .p3-step-title {
        color:#0f2742;
        font-size:12px;
        font-weight:800;
      }

      .p3-step-sub {
        margin-top:2px;
        color:#64748b;
        font-size:10px;
      }

      .p3-step-reason {
        margin-top:6px;
        color:#475569;
        font-size:10.5px;
        line-height:1.45;
      }

      .p3-status {
        flex:0 0 auto;
        padding:3px 7px;
        border-radius:999px;
        background:#eef2f7;
        color:#64748b;
        font-size:8px;
        font-weight:850;
        text-transform:uppercase;
      }

      .p3-status.current {
        background:#fff7ed;
        color:#c2410c;
      }

      .p3-status.completed,
      .p3-status.mastered {
        background:#ecfdf5;
        color:#15803d;
      }

      .p3-status.locked {
        background:#f1f5f9;
        color:#94a3b8;
      }


      /* RECOMMENDATIONS */

      .p3-filter-row {
        display:flex;
        gap:6px;
        flex-wrap:wrap;
      }

      .p3-filter-btn {
        padding:6px 10px;
        border:1px solid #cbd5e1;
        border-radius:999px;
        background:#fff;
        color:#475569;
        font:
          700 10px
          "Segoe UI",
          sans-serif;
        cursor:pointer;
      }

      .p3-filter-btn.active {
        border-color:#0369a1;
        background:#eff8ff;
        color:#0369a1;
      }

      .p3-recommend-grid {
        display:grid;
        grid-template-columns:
          repeat(
            2,
            minmax(0,1fr)
          );
        gap:12px;
      }

      .p3-course {
        display:flex;
        flex-direction:column;
        min-height:280px;
        border:1px solid #dfe7ee;
        border-radius:12px;
        background:#fff;
        overflow:hidden;
      }

      .p3-course.locked {
        opacity:.78;
      }

      .p3-course-main {
        flex:1;
        padding:13px;
      }

      .p3-course-topline {
        display:flex;
        justify-content:space-between;
        gap:8px;
        align-items:flex-start;
      }

      .p3-source {
        display:inline-block;
        padding:3px 7px;
        border-radius:999px;
        background:#eef6fb;
        color:#0369a1;
        font-size:8.5px;
        font-weight:850;
      }

      .p3-score {
        color:#15803d;
        font-size:10px;
        font-weight:850;
      }

      .p3-course h4 {
        margin:8px 0 5px;
        color:#0f2742;
        font-size:14px;
        line-height:1.3;
      }

      .p3-course-desc {
        margin:0;
        color:#64748b;
        font-size:10.5px;
        line-height:1.45;
      }

      .p3-course-meta {
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-top:9px;
        color:#475569;
        font-size:9.5px;
        font-weight:700;
      }

      .p3-why {
        margin-top:10px;
        border-top:
          1px solid #eef2f6;
        padding-top:8px;
      }

      .p3-why summary {
        cursor:pointer;
        color:#0369a1;
        font-size:10px;
        font-weight:800;
      }

      .p3-why ul {
        margin:7px 0 0 16px;
        padding:0;
        color:#475569;
        font-size:9.5px;
        line-height:1.45;
      }

      .p3-progress-wrap {
        margin-top:10px;
      }

      .p3-progress-label {
        display:flex;
        justify-content:space-between;
        margin-bottom:4px;
        color:#475569;
        font-size:9px;
        font-weight:750;
      }

      .p3-progress-bar {
        height:7px;
        border-radius:999px;
        background:#e2e8f0;
        overflow:hidden;
      }

      .p3-progress-fill {
        height:100%;
        border-radius:999px;
        background:#0ea5e9;
      }

      .p3-course-footer {
        display:flex;
        gap:6px;
        flex-wrap:wrap;
        align-items:center;
        padding:10px 12px;
        border-top:
          1px solid #eef2f6;
        background:#fafcfd;
      }

      .p3-btn {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        padding:7px 10px;
        border:0;
        border-radius:7px;
        background:#00324d;
        color:#fff;
        font:
          750 10px
          "Segoe UI",
          sans-serif;
        cursor:pointer;
      }

      .p3-btn.secondary {
        border:
          1px solid #cbd5e1;
        background:#fff;
        color:#334155;
      }

      .p3-btn.success {
        background:#15803d;
      }

      .p3-btn:disabled {
        opacity:.5;
        cursor:not-allowed;
      }


      /* MODAL */

      .p3-modal {
        position:fixed;
        inset:0;
        z-index:999999;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        background:
          rgba(15,23,42,.65);
      }

      .p3-dialog {
        width:
          min(
            620px,
            95vw
          );
        max-height:88vh;
        overflow:auto;
        border-radius:14px;
        background:#fff;
        box-shadow:
          0 24px 70px
          rgba(0,0,0,.3);
      }

      .p3-dialog-head {
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:center;
        padding:14px 16px;
        border-radius:
          14px 14px 0 0;
        background:#00324d;
        color:#fff;
      }

      .p3-dialog-head h3 {
        margin:0;
        font-size:15px;
      }

      .p3-dialog-body {
        padding:16px;
      }

      .p3-dialog-footer {
        display:flex;
        justify-content:flex-end;
        gap:7px;
        padding:12px 16px;
        border-top:
          1px solid #e2e8f0;
      }

      @media(
        max-width:850px
      ) {

        .p3-banner {
          grid-template-columns:1fr;
        }

        .p3-recommend-grid {
          grid-template-columns:1fr;
        }

      }

    `;


    document.head.appendChild(
      style
    );
  }


  // ==============================================================
  // ROOT
  // ==============================================================

  function ensureRoot() {

    const view =
      document.getElementById(
        'view-courses'
      );


    if (!view) {
      return null;
    }


    const heading =
      view.querySelector(
        'h2'
      );


    const subtitle =
      heading
        ?.parentElement
        ?.querySelector(
          'p'
        );


    if (heading) {

      heading.textContent =

        'Personalized Learning Pathways — iGOT & NSSTA Prototype Integration';

    }


    if (subtitle) {

      subtitle.textContent =

        'Live competency gaps are converted into explainable, prerequisite-aware learning recommendations. Catalogue records below are prototype integration data.';

    }


    // Hide old static cards.
    // They remain in HTML for easy rollback.

    const oldGrid =
      view.querySelector(
        '.courses-catalog-grid'
      );


    if (oldGrid) {

      oldGrid.style.display =
        'none';


      oldGrid.setAttribute(

        'data-phase3-static-hidden',

        '1'

      );
    }


    let root =
      document.getElementById(
        'phase3-learning-root'
      );


    if (!root) {

      root =
        document.createElement(
          'div'
        );


      root.id =
        'phase3-learning-root';


      if (oldGrid) {

        oldGrid
          .parentElement
          .insertBefore(

            root,
            oldGrid,

          );

      } else {

        view.appendChild(
          root
        );

      }
    }


    return root;
  }


  // ==============================================================
  // LOAD LIVE DATA
  // ==============================================================

  async function loadPhase3() {

    const [

      recommendationResponse,
      roadmap,
      progress,

    ] = await Promise.all([

      api(
        `/api/recommendations/${EMPLOYEE_ID}?limit=12`
      ),

      api(
        `/api/roadmap/${EMPLOYEE_ID}`
      ),

      api(
        `/api/learning-progress/${EMPLOYEE_ID}`
      ),

    ]);


    state.recommendations = (

      recommendationResponse
        .recommendations

      || []

    );


    state.roadmap =
      roadmap;


    state.progress =
      progress || [];


    render();


    return {

      recommendations:
        state.recommendations,

      roadmap:
        state.roadmap,

      progress:
        state.progress,

    };
  }


  // ==============================================================
  // ROADMAP
  // ==============================================================

  function roadmapIcon(
    step
  ) {

    if (
      step.status
      === 'mastered'
    ) {

      return '★';

    }


    if (
      step.status
      === 'completed'
    ) {

      return '✓';

    }


    if (
      step.status
      === 'locked'
    ) {

      return '🔒';

    }


    if (
      step.step_type
      === 'assessment'
    ) {

      return 'Q';

    }


    if (
      step.step_type
      === 'reinforcement'
    ) {

      return '↻';

    }


    return String(
      step.step_number
    );
  }


  function roadmapHtml() {

    const roadmap =
      state.roadmap;


    if (!roadmap) {

      return `
        <div class="p3-section">
          Roadmap unavailable.
        </div>
      `;
    }


    const steps = (

      roadmap.steps || []

    )
    .map(
      step => `

        <div
          class="
            p3-step
            ${escapeHtml(step.status)}
          "
        >

          <div class="p3-node">

            ${escapeHtml(
              roadmapIcon(step)
            )}

          </div>


          <div class="p3-step-card">

            <div class="p3-step-top">

              <div>

                <div
                  class="p3-step-title"
                >

                  ${escapeHtml(
                    step.title
                  )}

                </div>


                <div
                  class="p3-step-sub"
                >

                  ${escapeHtml(
                    step.subtitle
                  )}

                </div>

              </div>


              <span
                class="
                  p3-status
                  ${escapeHtml(step.status)}
                "
              >

                ${escapeHtml(
                  step.status
                )}

              </span>

            </div>


            <div
              class="p3-step-reason"
            >

              ${escapeHtml(
                step.reason
              )}

            </div>


            ${
              step.course_code

                ? `

                  <div
                    style="
                      margin-top:8px;
                      display:flex;
                      gap:6px;
                      flex-wrap:wrap;
                    "
                  >

                    <button
                      type="button"
                      class="p3-btn secondary"
                      data-p3-course-details="${escapeHtml(step.course_code)}"
                    >

                      View Module

                    </button>

                  </div>

                `

                : `

                  <div
                    style="
                      margin-top:8px;
                    "
                  >

                    <button
                      type="button"
                      class="p3-btn secondary"
                      data-p3-go-quiz="${escapeHtml(step.skill_code)}"
                      ${
                        step.status
                        === 'locked'

                          ? 'disabled'

                          : ''
                      }
                    >

                      Open AI Quiz / Reassessment

                    </button>

                  </div>

                `
            }

          </div>

        </div>

      `
    )
    .join('');


    return `

      <section class="p3-section">

        <div class="p3-section-head">

          <div>

            <h3>
              Adaptive Learning Roadmap
            </h3>

            <p>

              Ordered from live gaps,
              role criticality,
              course level and prerequisites.

            </p>

          </div>


          <span
            class="p3-prototype-pill"
          >

            Dynamic • Recalculates from evidence

          </span>

        </div>


        <div class="p3-roadmap">

          ${
            steps

            ||

            '<p>No current learning gaps require a roadmap.</p>'
          }

        </div>

      </section>

    `;
  }


  // ==============================================================
  // RECOMMENDATION CARD
  // ==============================================================

  function recommendationCard(
    rec,
    progressMap
  ) {

    const course =
      rec.course;


    const progress =
      progressMap.get(
        course.course_code
      );


    const progressPct =
      Number(
        progress?.progress_pct
        || 0
      );


    const status =
      progress?.status
      || 'not_started';


    const sourceClass =

      course.source_type
      === 'igot'

        ? 'iGOT'

        : 'NSSTA';


    let actions = '';


    if (rec.locked) {

      actions = `

        <button
          type="button"
          class="p3-btn secondary"
          disabled
        >

          🔒 Prerequisite Required

        </button>

      `;

    } else if (
      status === 'completed'
    ) {

      actions = `

        <button
          type="button"
          class="p3-btn success"
          data-p3-go-quiz="${escapeHtml(rec.driver_skill_code)}"
        >

          Take Mastery Check

        </button>

      `;

    } else if (
      status === 'in_progress'
    ) {

      actions = `

        <button
          type="button"
          class="p3-btn"
          data-p3-progress="${escapeHtml(course.course_code)}"
        >

          Update Progress

        </button>


        <button
          type="button"
          class="p3-btn secondary"
          data-p3-complete="${escapeHtml(course.course_code)}"
        >

          Mark Complete

        </button>

      `;

    } else {

      actions = `

        <button
          type="button"
          class="p3-btn"
          data-p3-start="${escapeHtml(course.course_code)}"
        >

          Start Learning

        </button>

      `;

    }


    return `

      <article
        class="
          p3-course
          ${rec.locked ? 'locked' : ''}
        "
        data-p3-source="${escapeHtml(course.source_type)}"
      >

        <div class="p3-course-main">

          <div class="p3-course-topline">

            <span class="p3-source">

              ${escapeHtml(sourceClass)}
              • Prototype Catalogue

            </span>


            <span class="p3-score">

              Match
              ${Number(rec.score).toFixed(1)}
              /100

            </span>

          </div>


          <h4>

            ${escapeHtml(
              course.title
            )}

          </h4>


          <p class="p3-course-desc">

            ${escapeHtml(
              course.description
            )}

          </p>


          <div class="p3-course-meta">

            <span>
              ${escapeHtml(course.difficulty)}
            </span>

            <span>
              ${Number(course.duration_hours).toFixed(1)}h
            </span>

            <span>
              ${escapeHtml(course.delivery_mode)}
            </span>

            <span>
              Skill:
              ${escapeHtml(rec.driver_skill_name)}
            </span>

          </div>


          ${
            rec.locked

              ? `

                <div
                  style="
                    margin-top:8px;
                    padding:7px;
                    border-radius:7px;
                    background:#fff7ed;
                    color:#9a3412;
                    font-size:9.5px;
                  "
                >

                  Prerequisite:
                  ${escapeHtml(
                    rec.missing_prerequisites
                      .join(', ')
                  )}

                </div>

              `

              : ''
          }


          <div class="p3-progress-wrap">

            <div class="p3-progress-label">

              <span>
                Learning Progress
              </span>

              <span>
                ${Math.round(progressPct)}%
              </span>

            </div>


            <div class="p3-progress-bar">

              <div
                class="p3-progress-fill"
                style="
                  width:
                  ${Math.max(
                    0,
                    Math.min(
                      100,
                      progressPct
                    )
                  )}%;
                "
              ></div>

            </div>

          </div>


          <details class="p3-why">

            <summary>
              Why recommended?
            </summary>


            <ul>

              ${
                (
                  rec.reasons
                  || []
                )
                .map(
                  reason => `

                    <li>

                      ${escapeHtml(reason)}

                    </li>

                  `
                )
                .join('')
              }

            </ul>

          </details>

        </div>


        <div class="p3-course-footer">

          <button
            type="button"
            class="p3-btn secondary"
            data-p3-course-details="${escapeHtml(course.course_code)}"
          >

            Details

          </button>


          ${actions}

        </div>

      </article>

    `;
  }


  function recommendationsHtml() {

    const progressMap =
      progressByCourseCode();


    const filtered = (

      state.recommendations
      || []

    )
    .filter(
      rec => {

        if (
          state.sourceFilter
          === 'all'
        ) {

          return true;

        }


        return (

          rec.course.source_type
          === state.sourceFilter

        );
      }
    );


    const cards = filtered

      .map(
        rec =>
          recommendationCard(
            rec,
            progressMap
          )
      )

      .join('');


    return `

      <section class="p3-section">

        <div class="p3-section-head">

          <div>

            <h3>

              Explainable Course Recommendations

            </h3>

            <p>

              Ranked deterministically from
              gap size,
              role criticality,
              priority,
              level fit and prerequisite readiness.

            </p>

          </div>


          <div class="p3-filter-row">

            <button
              class="
                p3-filter-btn
                ${
                  state.sourceFilter
                  === 'all'
                    ? 'active'
                    : ''
                }
              "
              data-p3-filter="all"
            >
              All
            </button>


            <button
              class="
                p3-filter-btn
                ${
                  state.sourceFilter
                  === 'igot'
                    ? 'active'
                    : ''
                }
              "
              data-p3-filter="igot"
            >
              iGOT Prototype
            </button>


            <button
              class="
                p3-filter-btn
                ${
                  state.sourceFilter
                  === 'nssta'
                    ? 'active'
                    : ''
                }
              "
              data-p3-filter="nssta"
            >
              NSSTA Prototype
            </button>

          </div>

        </div>


        <div class="p3-recommend-grid">

          ${
            cards

            ||

            '<p style="color:#64748b;font-size:11px;">No recommendations for this filter.</p>'
          }

        </div>

      </section>

    `;
  }


  // ==============================================================
  // RENDER
  // ==============================================================

  function render() {

    const root =
      ensureRoot();


    if (
      !root
      || !state.roadmap
    ) {

      return;
    }


    const roadmap =
      state.roadmap;


    const topRecommendation =
      state.recommendations?.[0];


    root.innerHTML = `

      <div class="p3-banner">

        <div>

          <div class="p3-eyebrow">

            Phase 3 • Personalized Learning Intelligence

          </div>


          <div class="p3-title">

            ${escapeHtml(
              roadmap.employee_name
            )}'s Learning Journey

          </div>


          <p class="p3-subtitle">

            Target role:

            <strong>
              ${escapeHtml(
                roadmap.target_role
                || 'Not selected'
              )}
            </strong>.

            Current top gap:

            <strong>
              ${escapeHtml(
                roadmap.top_gap
                || 'No major gap'
              )}
            </strong>.

            The path adapts whenever new assessment
            or course-completion evidence changes
            competency confidence.

          </p>


          <div
            style="
              margin-top:8px;
            "
          >

            <span
              class="p3-prototype-pill"
            >

              Prototype iGOT + NSSTA catalogue
              • No live official API claim

            </span>

          </div>

        </div>


        <div class="p3-metrics">

          <div class="p3-metric">

            <small>
              Role Readiness
            </small>

            <strong>

              ${
                Number(
                  roadmap
                    .readiness_pct
                  || 0
                )
                .toFixed(1)
              }%

            </strong>

          </div>


          <div class="p3-metric">

            <small>
              Roadmap Progress
            </small>

            <strong>

              ${
                Number(
                  roadmap
                    .roadmap_progress_pct
                  || 0
                )
                .toFixed(1)
              }%

            </strong>

          </div>


          <div class="p3-metric">

            <small>
              Top Match
            </small>

            <strong>

              ${
                topRecommendation

                  ? Number(
                      topRecommendation
                        .score
                    )
                    .toFixed(1)

                  : '—'
              }

              /100

            </strong>

          </div>


          <div class="p3-metric">

            <small>
              Current Focus
            </small>

            <strong
              style="
                font-size:12px;
              "
            >

              ${escapeHtml(
                roadmap.top_gap
                || 'Maintain mastery'
              )}

            </strong>

          </div>

        </div>

      </div>


      ${roadmapHtml()}

      ${recommendationsHtml()}

    `;
  }


  // ==============================================================
  // COURSE DETAILS
  // ==============================================================

  async function openCourseDetails(
    courseCode
  ) {

    const course =
      await api(

        `/api/courses/${encodeURIComponent(courseCode)}`

      );


    document
      .getElementById(
        'phase3-modal'
      )
      ?.remove();


    const modal =
      document.createElement(
        'div'
      );


    modal.id =
      'phase3-modal';


    modal.className =
      'p3-modal';


    modal.innerHTML = `

      <div class="p3-dialog">

        <div class="p3-dialog-head">

          <div>

            <h3>

              ${escapeHtml(
                course.title
              )}

            </h3>

            <div
              style="
                font-size:9px;
                color:#cbd5e1;
                margin-top:2px;
              "
            >

              ${escapeHtml(
                course.source_label
              )}

              •

              ${escapeHtml(
                course.catalog_status
              )}

            </div>

          </div>


          <button
            type="button"
            class="p3-btn secondary"
            data-p3-close-modal
          >
            Close
          </button>

        </div>


        <div class="p3-dialog-body">

          <p
            style="
              margin-top:0;
              color:#475569;
              font-size:11px;
              line-height:1.55;
            "
          >

            ${escapeHtml(
              course.description
            )}

          </p>


          <div
            class="p3-course-meta"
            style="
              margin-bottom:12px;
            "
          >

            <span>
              ${escapeHtml(course.difficulty)}
            </span>

            <span>
              ${Number(course.duration_hours).toFixed(1)}
              hours
            </span>

            <span>
              ${escapeHtml(course.language)}
            </span>

            <span>
              ${escapeHtml(course.delivery_mode)}
            </span>

          </div>


          <strong
            style="
              color:#0f2742;
              font-size:11px;
            "
          >

            Learning outcomes

          </strong>


          <ul
            style="
              color:#475569;
              font-size:10.5px;
              line-height:1.55;
            "
          >

            ${
              (
                course.learning_outcomes
                || []
              )
              .map(
                value => `

                  <li>
                    ${escapeHtml(value)}
                  </li>

                `
              )
              .join('')
            }

          </ul>


          <strong
            style="
              color:#0f2742;
              font-size:11px;
            "
          >

            Competency mapping

          </strong>


          <ul
            style="
              color:#475569;
              font-size:10.5px;
              line-height:1.55;
            "
          >

            ${
              (
                course.skills
                || []
              )
              .map(
                skill => `

                  <li>

                    ${escapeHtml(
                      skill.skill_name
                    )}

                    • suitable around proficiency

                    ${skill.target_proficiency_min}/5
                    –
                    ${skill.target_proficiency_max}/5

                  </li>

                `
              )
              .join('')
            }

          </ul>


          ${
            course
              .prerequisites
              ?.length

              ? `

                <div
                  style="
                    padding:8px;
                    border-radius:8px;
                    background:#fff7ed;
                    color:#9a3412;
                    font-size:10px;
                  "
                >

                  Prerequisite course(s):

                  ${escapeHtml(
                    course.prerequisites
                      .join(', ')
                  )}

                </div>

              `

              : ''
          }

        </div>

      </div>

    `;


    document.body.appendChild(
      modal
    );
  }


  // ==============================================================
  // PROGRESS MODAL
  // ==============================================================

  function openProgressModal(
    courseCode
  ) {

    const progress =
      progressByCourseCode()
        .get(
          courseCode
        );


    const current =
      Math.round(

        Number(
          progress?.progress_pct
          || 5
        )

      );


    document
      .getElementById(
        'phase3-modal'
      )
      ?.remove();


    const modal =
      document.createElement(
        'div'
      );


    modal.id =
      'phase3-modal';


    modal.className =
      'p3-modal';


    const safeCurrent =
      Math.max(

        5,

        Math.min(
          95,
          current
        )

      );


    modal.innerHTML = `

      <div class="p3-dialog">

        <div class="p3-dialog-head">

          <h3>
            Record Learning Progress
          </h3>

          <button
            type="button"
            class="p3-btn secondary"
            data-p3-close-modal
          >
            Close
          </button>

        </div>


        <div class="p3-dialog-body">

          <p
            style="
              color:#475569;
              font-size:11px;
            "
          >

            Update your progress for

            <strong>
              ${escapeHtml(courseCode)}
            </strong>.

            Saving progress does not change
            competency until learning evidence
            is completed/assessed.

          </p>


          <input
            type="range"
            id="p3-progress-range"
            min="5"
            max="95"
            step="5"
            value="${safeCurrent}"
            style="
              width:100%;
            "
          >


          <div
            style="
              text-align:center;
              margin-top:8px;
              color:#0f2742;
              font-weight:800;
            "
          >

            <span
              id="p3-progress-value"
            >
              ${safeCurrent}
            </span>%

          </div>

        </div>


        <div class="p3-dialog-footer">

          <button
            type="button"
            class="p3-btn secondary"
            data-p3-close-modal
          >
            Cancel
          </button>


          <button
            type="button"
            class="p3-btn"
            id="p3-save-progress"
          >
            Save Progress
          </button>

        </div>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    const range =
      modal.querySelector(
        '#p3-progress-range'
      );


    const value =
      modal.querySelector(
        '#p3-progress-value'
      );


    range.addEventListener(
      'input',
      () => {

        value.textContent =
          range.value;

      }
    );


    modal
      .querySelector(
        '#p3-save-progress'
      )
      .addEventListener(
        'click',
        async () => {

          try {

            await api(

              `/api/learning-progress/${EMPLOYEE_ID}/courses/${encodeURIComponent(courseCode)}`,

              {

                method:
                  'PUT',

                body:
                  JSON.stringify({

                    progress_pct:
                      Number(
                        range.value
                      )

                  })

              }

            );


            modal.remove();


            showToast(
              'Learning progress updated.'
            );


            await loadPhase3();

          } catch (error) {

            showToast(

              error.message,

              'error'

            );

          }

        }
      );
  }


  // ==============================================================
  // START COURSE
  // ==============================================================

  async function startCourse(
    courseCode
  ) {

    try {

      await api(

        `/api/learning-progress/${EMPLOYEE_ID}/courses/${encodeURIComponent(courseCode)}/start`,

        {
          method:
            'POST'
        }

      );


      showToast(

        'Course started. Your personalized roadmap has been refreshed.'

      );


      await loadPhase3();

    } catch (error) {

      showToast(

        error.message,

        'error'

      );

    }
  }


  // ==============================================================
  // COMPLETE COURSE
  // ==============================================================

  async function completeCourse(
    courseCode
  ) {

    const confirmed =
      window.confirm(

        'Mark this prototype learning module as completed?\n\n'

        +

        'Completion will add course-completion evidence, but it will NOT mark the skill as mastered. A follow-up assessment is still required.'

      );


    if (!confirmed) {

      return;

    }


    try {

      const result =
        await api(

          `/api/learning-progress/${EMPLOYEE_ID}/courses/${encodeURIComponent(courseCode)}/complete`,

          {
            method:
              'POST'
          }

        );
              if (
        window.NirdeshaPhase1
          ?.applyEmployeeSnapshot
      ) {

        const profile =

          window
            .NirdeshaPhase1
            .state
            ?.profile

          ||

          await window
            .NirdeshaPhase1
            .api(

              `/api/profile/${EMPLOYEE_ID}`

            );


        window
          .NirdeshaPhase1
          .applyEmployeeSnapshot(

            profile,

            result.competency

          );
      }


      showToast(

        result
          .course_completion_evidence_added

          ? (
              'Course completed. Course-completion evidence was added; take the mastery quiz next.'
            )

          : (
              'Course was already completed. No duplicate competency evidence was added.'
            )

      );


      await loadPhase3();

    } catch (error) {

      showToast(

        error.message,

        'error'

      );

    }
  }


  // ==============================================================
  // GO TO QUIZ
  // ==============================================================

  function goToQuiz(
    skillCode
  ) {

    sessionStorage.setItem(

      'nirdesha_phase3_quiz_skill',

      skillCode || ''

    );


    const nav =
      document.querySelector(
        '[data-tab="quiz"]'
      );


    if (nav) {

      nav.click();

    } else {

      window.location.hash =
        '#quiz';

    }


    showToast(

      'Open or generate a quiz for the highlighted competency. Assessment evidence will update the roadmap automatically.'

    );
  }


  // ==============================================================
  // EVENTS
  // ==============================================================

  function installEvents() {

    document.addEventListener(
      'click',
      async event => {

        const filter =
          event.target.closest(
            '[data-p3-filter]'
          );


        if (filter) {

          state.sourceFilter =

            filter.getAttribute(
              'data-p3-filter'
            )

            || 'all';


          render();

          return;
        }


        const details =
          event.target.closest(
            '[data-p3-course-details]'
          );


        if (details) {

          try {

            await openCourseDetails(

              details.getAttribute(
                'data-p3-course-details'
              )

            );

          } catch (error) {

            showToast(

              error.message,

              'error'

            );

          }

          return;
        }


        const start =
          event.target.closest(
            '[data-p3-start]'
          );


        if (start) {

          await startCourse(

            start.getAttribute(
              'data-p3-start'
            )

          );

          return;
        }


        const progress =
          event.target.closest(
            '[data-p3-progress]'
          );


        if (progress) {

          openProgressModal(

            progress.getAttribute(
              'data-p3-progress'
            )

          );

          return;
        }


        const complete =
          event.target.closest(
            '[data-p3-complete]'
          );


        if (complete) {

          await completeCourse(

            complete.getAttribute(
              'data-p3-complete'
            )

          );

          return;
        }


        const quiz =
          event.target.closest(
            '[data-p3-go-quiz]'
          );


        if (quiz) {

          goToQuiz(

            quiz.getAttribute(
              'data-p3-go-quiz'
            )

          );

          return;
        }


        if (
          event.target.closest(
            '[data-p3-close-modal]'
          )
        ) {

          document
            .getElementById(
              'phase3-modal'
            )
            ?.remove();

        }

      }
    );


    document.addEventListener(
      'click',
      event => {

        if (
          event.target?.id
          === 'phase3-modal'
        ) {

          event.target.remove();

        }

      }
    );


    window.addEventListener(
      'hashchange',
      () => {

        if (
          window.location.hash
          === '#courses'
        ) {

          setTimeout(
            () => {

              loadPhase3()
                .catch(
                  error => {

                    console.error(

                      'Phase 3 refresh failed:',

                      error

                    );

                  }
                );

            },
            100
          );

        }

      }
    );
  }


  // ==============================================================
  // INIT
  // ==============================================================

  function init() {

    installStyles();

    ensureRoot();

    installEvents();


    setTimeout(
      () => {

        loadPhase3()
          .catch(
            error => {

              console.error(

                'Phase 3 learning intelligence failed:',

                error

              );


              showToast(

                'Personalized learning could not load. Confirm the Phase-3 backend is running on port 8001.',

                'error'

              );

            }
          );

      },
      250
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


  window.NirdeshaPhase3 = {

    API_BASE,

    EMPLOYEE_ID,

    state,

    load:
      loadPhase3,

    startCourse,

    completeCourse

  };

})();