/**
 * Nirdesha Phase 3
 * Admin learning-plan visibility
 *
 * Adds live recommendation information to:
 * Admin → Courses & Pathways
 *
 * Full organization-wide analytics remains Phase 5.
 */

(function () {
  'use strict';


  const API_BASE =
    (window.location.protocol === 'http:' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ? 'http://127.0.0.1:8001' : '';


  const EMPLOYEE_ID =
    1;


  function esc(value) {

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


  async function api(path) {

    const response =
      await fetch(
        `${API_BASE}${path}`
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

        `HTTP ${response.status}`

      );
    }


    return data;
  }


  function installStyles() {

    if (
      document.getElementById(
        'phase3-admin-style'
      )
    ) {

      return;
    }


    const style =
      document.createElement(
        'style'
      );


    style.id =
      'phase3-admin-style';


    style.textContent = `

      .p3-admin-live {
        margin-bottom:1.25rem;
        padding:1rem;
        border:1px solid #dbe5ec;
        border-radius:12px;
        background:
          linear-gradient(
            135deg,
            #f8fbfd,
            #f3faf6
          );
      }

      .p3-admin-head {
        display:flex;
        justify-content:space-between;
        gap:1rem;
        flex-wrap:wrap;
        align-items:flex-start;
        margin-bottom:.8rem;
      }

      .p3-admin-head h3 {
        margin:0;
        color:#002b49;
        font-size:1rem;
      }

      .p3-admin-head p {
        margin:.2rem 0 0;
        color:#64748b;
        font-size:.72rem;
      }

      .p3-admin-pill {
        padding:.25rem .5rem;
        border:1px solid #fdba74;
        border-radius:999px;
        background:#fff7ed;
        color:#9a3412;
        font-size:.6rem;
        font-weight:800;
      }

      .p3-admin-summary {
        display:grid;
        grid-template-columns:
          repeat(
            4,
            minmax(0,1fr)
          );
        gap:.55rem;
        margin-bottom:.75rem;
      }

      .p3-admin-metric {
        padding:.6rem;
        border:1px solid #e2e8f0;
        border-radius:8px;
        background:#fff;
      }

      .p3-admin-metric small {
        display:block;
        color:#64748b;
        font-size:.58rem;
        font-weight:800;
        text-transform:uppercase;
      }

      .p3-admin-metric strong {
        display:block;
        margin-top:.25rem;
        color:#0f2742;
        font-size:.82rem;
      }

      .p3-admin-recs {
        display:grid;
        grid-template-columns:
          repeat(
            3,
            minmax(0,1fr)
          );
        gap:.55rem;
      }

      .p3-admin-rec {
        padding:.65rem;
        border:1px solid #e2e8f0;
        border-radius:8px;
        background:#fff;
      }

      .p3-admin-rec .source {
        color:#0369a1;
        font-size:.55rem;
        font-weight:800;
      }

      .p3-admin-rec h4 {
        margin:.3rem 0;
        color:#0f2742;
        font-size:.72rem;
        line-height:1.35;
      }

      .p3-admin-rec p {
        margin:0;
        color:#64748b;
        font-size:.62rem;
        line-height:1.45;
      }

      @media(max-width:900px) {

        .p3-admin-summary {
          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );
        }

        .p3-admin-recs {
          grid-template-columns:1fr;
        }

      }

    `;


    document.head.appendChild(
      style
    );
  }


  function ensureRoot() {

    const view =
      document.getElementById(
        'view-courses'
      );


    if (!view) {

      return null;

    }


    let root =
      document.getElementById(
        'phase3-admin-learning-root'
      );


    if (root) {

      return root;

    }


    root =
      document.createElement(
        'div'
      );


    root.id =
      'phase3-admin-learning-root';


    const filterBar =
      view.querySelector(
        '.courses-filter-bar'
      );


    if (filterBar) {

      view.insertBefore(

        root,
        filterBar,

      );

    } else {

      const oldGrid =
        view.querySelector(
          '.courses-catalog-grid'
        );


      if (oldGrid) {

        view.insertBefore(

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


  async function refresh() {

    const root =
      ensureRoot();


    if (!root) {

      return;

    }


    const [

      recommendations,
      roadmap,
      progress,

    ] = await Promise.all([

      api(
        `/api/recommendations/${EMPLOYEE_ID}?limit=3`
      ),

      api(
        `/api/roadmap/${EMPLOYEE_ID}`
      ),

      api(
        `/api/learning-progress/${EMPLOYEE_ID}`
      ),

    ]);


    const inProgress = (

      progress || []

    )
    .filter(
      item =>
        item.status
        === 'in_progress'
    )
    .length;


    const completed = (

      progress || []

    )
    .filter(
      item =>
        item.status
        === 'completed'
    )
    .length;


    const recCards = (

      recommendations
        .recommendations

      || []

    )
    .map(
      rec => `

        <div class="p3-admin-rec">

          <div class="source">

            ${esc(
              rec.course
                .source_label
            )}

            • Match

            ${
              Number(
                rec.score
              ).toFixed(1)
            }/100

          </div>


          <h4>

            ${esc(
              rec.course.title
            )}

          </h4>


          <p>

            ${esc(
              rec.summary_reason
            )}

          </p>

        </div>

      `
    )
    .join('');


    root.innerHTML = `

      <div class="p3-admin-live">

        <div class="p3-admin-head">

          <div>

            <h3>

              Live Personalized Learning Plan
              —
              ${esc(
                recommendations
                  .employee_name
              )}

            </h3>

            <p>

              Read-only view of recommendations
              generated from the same live
              competency data used by the
              employee portal.

            </p>

          </div>


          <span class="p3-admin-pill">

            Prototype iGOT + NSSTA integration

          </span>

        </div>


        <div class="p3-admin-summary">

          <div class="p3-admin-metric">

            <small>
              Target Role
            </small>

            <strong>

              ${esc(
                roadmap.target_role
                || 'Not selected'
              )}

            </strong>

          </div>


          <div class="p3-admin-metric">

            <small>
              Top Gap
            </small>

            <strong>

              ${esc(
                roadmap.top_gap
                || 'No major gap'
              )}

            </strong>

          </div>


          <div class="p3-admin-metric">

            <small>
              Learning In Progress
            </small>

            <strong>
              ${inProgress}
            </strong>

          </div>


          <div class="p3-admin-metric">

            <small>
              Completed Modules
            </small>

            <strong>
              ${completed}
            </strong>

          </div>

        </div>


        <div class="p3-admin-recs">

          ${
            recCards

            ||

            '<p style="font-size:.7rem;color:#64748b;">No active recommendations.</p>'
          }

        </div>

      </div>

    `;
  }


  function init() {

    installStyles();

    ensureRoot();


    setTimeout(
      () => {

        refresh()
          .catch(
            error => {

              console.error(

                'Phase 3 admin panel failed:',

                error

              );

            }
          );

      },
      400
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

              refresh()
                .catch(
                  () => {}
                );

            },
            100
          );

        }

      }
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


  window.NirdeshaPhase3Admin = {

    refresh

  };

})();