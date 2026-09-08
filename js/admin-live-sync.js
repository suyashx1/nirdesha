(function () {
  'use strict';

  const API_BASE = 'http://127.0.0.1:8001';
  const EMPLOYEE_ID = 1;
  const REFRESH_MS = 8000;

  const state = {
    profile: null,
    competency: null,
    competencyScore: 0
  };


  // ============================================================
  // HELPERS
  // ============================================================

  function norm(v) {
    return String(v || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }


  function esc(v) {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }


  async function api(path) {
    const response = await fetch(
      `${API_BASE}${path}`,
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const data =
      await response
        .json()
        .catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        `HTTP ${response.status}`
      );
    }

    return data;
  }


  // ============================================================
  // COMPETENCY SCORE
  // ============================================================

  function calculateScore(competency) {
    const skills =
      Array.isArray(competency?.skills)
        ? competency.skills
        : [];

    if (!skills.length) {
      return Number(
        competency?.readiness_pct || 0
      );
    }

    let weighted = 0;
    let totalWeight = 0;

    skills.forEach(skill => {
      const confidence = Math.max(
        0,
        Math.min(
          100,
          Number(
            skill.confidence_score
          ) || 0
        )
      );

      const weight = Math.max(
        1,
        Number(
          skill.criticality
        ) || 1
      );

      weighted +=
        confidence * weight;

      totalWeight +=
        weight;
    });

    return totalWeight
      ? weighted / totalWeight
      : 0;
  }


  // ============================================================
  // CSS
  // ============================================================

  function installStyles() {
    if (
      document.getElementById(
        'nirdesha-admin-live-v7-style'
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        'style'
      );

    style.id =
      'nirdesha-admin-live-v7-style';

    style.textContent = `

      #view-officers .admin-table-wrap {
        overflow-x: auto !important;
      }

      #view-officers table {
        min-width: 1320px !important;
      }


      /* ACTION CELL */

      .nd-action-cell {
        min-width: 285px !important;
        width: 285px !important;
        white-space: nowrap !important;
      }

      .nd-action-row {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        align-items: center !important;
        justify-content: flex-start !important;
        gap: 7px !important;

        width: max-content !important;

        position: relative !important;
        z-index: 3 !important;
      }

      .nd-action-btn {
        appearance: none !important;
        -webkit-appearance: none !important;

        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;

        flex: 0 0 auto !important;

        min-height: 34px !important;

        padding:
          7px 10px !important;

        border-radius:
          7px !important;

        font:
          600 11px/1
          "Segoe UI",
          sans-serif !important;

        cursor:
          pointer !important;

        pointer-events:
          auto !important;

        position:
          relative !important;

        z-index:
          4 !important;

        white-space:
          nowrap !important;

        text-decoration:
          none !important;
      }

      .nd-inspect {
        border:
          1px solid #64748b !important;

        background:
          #ffffff !important;

        color:
          #0f2742 !important;
      }

      .nd-message {
        border:
          1px solid #0ea5e9 !important;

        background:
          #f0f9ff !important;

        color:
          #0369a1 !important;
      }

      .nd-ban {
        border:
          1px solid #ef4444 !important;

        background:
          #fff1f2 !important;

        color:
          #b91c1c !important;
      }

      .nd-unban {
        border:
          1px solid #16a34a !important;

        background:
          #f0fdf4 !important;

        color:
          #15803d !important;
      }


      /* LIVE COMPETENCY */

      .nd-live-cell {
        min-width:
          150px !important;

        white-space:
          nowrap !important;
      }

      .nd-live-score {
        color:
          #166534;

        font-weight:
          800;

        font-size:
          14px;
      }

      .nd-live-sub {
        color:
          #64748b;

        font-size:
          10px;

        margin-top:
          3px;

        font-weight:
          600;
      }

      .nd-live-pill {
        display:
          inline-block;

        margin-top:
          4px;

        padding:
          2px 6px;

        border-radius:
          999px;

        background:
          #ecfdf5;

        color:
          #15803d;

        border:
          1px solid #bbf7d0;

        font-size:
          8px;

        font-weight:
          800;
      }

      .nd-demo {
        color:
          #94a3b8;

        font-size:
          10px;

        font-weight:
          600;
      }


      /* MODAL */

      .nd-modal {
        position:
          fixed;

        inset:
          0;

        z-index:
          1000000;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        padding:
          20px;

        background:
          rgba(15,23,42,.68);

        backdrop-filter:
          blur(2px);
      }

      .nd-dialog {
        width:
          min(980px,96vw);

        max-height:
          90vh;

        overflow:
          auto;

        background:
          #ffffff;

        border-radius:
          15px;

        box-shadow:
          0 28px 80px
          rgba(0,0,0,.35);

        font-family:
          "Segoe UI",
          sans-serif;
      }

      .nd-dialog.small {
        width:
          min(580px,95vw);
      }

      .nd-head {
        display:
          flex;

        justify-content:
          space-between;

        align-items:
          center;

        gap:
          12px;

        padding:
          16px 19px;

        background:
          #00324d;

        color:
          white;

        border-radius:
          15px 15px 0 0;
      }

      .nd-head h2 {
        margin:
          0;

        font-size:
          17px;
      }

      .nd-head p {
        margin:
          3px 0 0;

        color:
          #cbd5e1;

        font-size:
          10px;
      }

      .nd-close {
        width:
          34px;

        height:
          34px;

        border:
          0;

        border-radius:
          7px;

        background:
          rgba(255,255,255,.12);

        color:
          white;

        font-size:
          21px;

        cursor:
          pointer;
      }

      .nd-body {
        padding:
          18px;
      }

      .nd-grid {
        display:
          grid;

        grid-template-columns:
          repeat(
            4,
            minmax(0,1fr)
          );

        gap:
          10px;

        margin-bottom:
          16px;
      }

      .nd-card {
        padding:
          11px;

        border:
          1px solid #dfe7ee;

        border-radius:
          10px;

        background:
          #f8fafc;
      }

      .nd-card small {
        display:
          block;

        color:
          #64748b;

        font-size:
          9px;

        font-weight:
          800;

        text-transform:
          uppercase;
      }

      .nd-card strong {
        display:
          block;

        margin-top:
          5px;

        color:
          #0f2742;

        font-size:
          17px;
      }

      .nd-info {
        display:
          grid;

        grid-template-columns:
          repeat(
            2,
            minmax(0,1fr)
          );

        gap:
          10px;

        margin-bottom:
          16px;
      }

      .nd-info > div {
        border-bottom:
          1px solid #e2e8f0;

        padding:
          7px 0;
      }

      .nd-info small {
        display:
          block;

        color:
          #64748b;

        font-size:
          9px;

        font-weight:
          800;

        text-transform:
          uppercase;
      }

      .nd-info strong {
        display:
          block;

        margin-top:
          3px;

        color:
          #0f172a;

        font-size:
          12px;
      }

      .nd-table {
        width:
          100%;

        border-collapse:
          collapse;

        font-size:
          10.5px;
      }

      .nd-table th {
        padding:
          8px;

        background:
          #f1f5f9;

        color:
          #475569;

        text-align:
          left;

        font-size:
          9px;

        text-transform:
          uppercase;

        border-bottom:
          1px solid #dce5ed;
      }

      .nd-table td {
        padding:
          8px;

        border-bottom:
          1px solid #edf2f7;

        color:
          #334155;
      }

      .nd-footer {
        display:
          flex;

        justify-content:
          flex-end;

        gap:
          8px;

        padding:
          13px 18px;

        border-top:
          1px solid #e2e8f0;
      }

      .nd-modal-btn {
        border:
          0;

        border-radius:
          7px;

        padding:
          8px 14px;

        font-weight:
          700;

        cursor:
          pointer;
      }

      .nd-primary {
        background:
          #00324d;

        color:
          white;
      }

      .nd-secondary {
        background:
          #e2e8f0;

        color:
          #334155;
      }

      .nd-danger {
        background:
          #b91c1c;

        color:
          white;
      }

      .nd-textarea {
        width:
          100%;

        min-height:
          130px;

        box-sizing:
          border-box;

        padding:
          10px;

        border:
          1px solid #cbd5e1;

        border-radius:
          8px;

        resize:
          vertical;

        font:
          13px
          "Segoe UI",
          sans-serif;
      }

    `;

    document.head.appendChild(
      style
    );
  }


  // ============================================================
  // FIND CURRENT DIRECTORY TABLE
  // ============================================================

  function visible(el) {
    if (!el) return false;

    const style =
      getComputedStyle(el);

    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      (
        el.offsetWidth ||
        el.offsetHeight ||
        el.getClientRects().length
      )
    );
  }


  function findDirectoryTable() {
    const tables =
      Array.from(
        document.querySelectorAll(
          'table'
        )
      );

    const candidates =
      tables.filter(
        table => {

          const text =
            norm(
              table.tHead
                ?.textContent || ''
            );

          return (
            text.includes(
              'officer identity'
            ) ||
            text.includes(
              'user name'
            ) ||
            text.includes(
              'administrative actions'
            ) ||
            text.includes(
              'read-only inspection'
            )
          );
        }
      );

    return (
      candidates.find(
        visible
      ) ||
      candidates[0] ||
      document.getElementById(
        'admin-users-table'
      ) ||
      null
    );
  }


  // ============================================================
  // OFFICER FROM TABLE ROW
  // ============================================================

  function extractOfficer(row) {
    const cells =
      Array.from(
        row.querySelectorAll(
          'td'
        )
      );

    const first =
      cells[0];

    const second =
      cells[1];

    if (!first) {
      return {
        name:
          'Unknown Officer',

        code:
          '',

        designation:
          '',

        division:
          ''
      };
    }

    const lines =
      String(
        first.innerText || ''
      )
        .split(/\n+/)
        .map(
          x => x.trim()
        )
        .filter(Boolean);

    const code =
      lines.find(
        x =>
          /[A-Z]{2,}[-–][A-Z0-9-]+/i
            .test(x)
      ) || '';

    const possibleNames =
      lines.filter(
        value => {

          if (
            value === code
          ) {
            return false;
          }

          if (
            value.length <= 3 &&
            /^[A-Z]{1,3}$/i
              .test(value)
          ) {
            return false;
          }

          return true;
        }
      );

    const secondLines =
      String(
        second?.innerText || ''
      )
        .split(/\n+/)
        .map(
          x => x.trim()
        )
        .filter(Boolean);

    return {
      name:
        possibleNames[0]
        || 'Unknown Officer',

      code,

      designation:
        secondLines[0]
        || '',

      division:
        secondLines
          .slice(1)
          .join(' • ')
    };
  }


  // ============================================================
  // BAN STATE
  // ============================================================

  function getBanMap() {
    try {
      return JSON.parse(
        localStorage.getItem(
          'nirdesha_admin_bans'
        ) || '{}'
      );
    } catch (_) {
      return {};
    }
  }


  function setBanned(
    key,
    value
  ) {
    const map =
      getBanMap();

    map[key] =
      Boolean(value);

    localStorage.setItem(
      'nirdesha_admin_bans',
      JSON.stringify(map)
    );
  }


  function officerKey(
    officer
  ) {
    return (
      officer.code ||
      officer.name
    );
  }


  function isRealEmployee(
    officer
  ) {
    if (!state.profile) {
      return (
        norm(officer.name)
        ===
        norm('S. K. Raman')
        ||
        norm(officer.code)
        ===
        norm('SSS-2024-8891')
      );
    }

    return (
      norm(officer.name)
      ===
      norm(state.profile.name)
      ||
      norm(officer.code)
      ===
      norm(
        state.profile.employee_code
      )
    );
  }


  // ============================================================
  // LIVE COMPETENCY COLUMN
  // ============================================================

  function ensureLiveColumn(
    table
  ) {
    const headerRow =
      table
        ?.tHead
        ?.rows?.[0];

    if (!headerRow) {
      return;
    }

    let header =
      headerRow.querySelector(
        '[data-nd-live-header]'
      );

    if (!header) {
      header =
        document.createElement(
          'th'
        );

      header.setAttribute(
        'data-nd-live-header',
        '1'
      );

      header.innerHTML = `
        LIVE COMPETENCY
        <div
          style="
            font-size:8px;
            color:#94a3b8;
            margin-top:2px;
            text-transform:none;
          "
        >
          Evidence-based
        </div>
      `;

      const index =
        Math.min(
          2,
          headerRow.children.length
        );

      headerRow.insertBefore(
        header,
        headerRow.children[index]
        || null
      );
    }


    Array.from(
      table.tBodies?.[0]?.rows
      || []
    ).forEach(
      row => {

        let cell =
          row.querySelector(
            '[data-nd-live-cell]'
          );

        if (!cell) {
          cell =
            document.createElement(
              'td'
            );

          cell.setAttribute(
            'data-nd-live-cell',
            '1'
          );

          cell.className =
            'nd-live-cell';

          const index =
            Math.min(
              2,
              row.children.length
            );

          row.insertBefore(
            cell,
            row.children[index]
            || null
          );
        }

        const officer =
          extractOfficer(row);

        let html;

        if (
          isRealEmployee(officer) &&
          state.competency
        ) {
          const readiness =
            Number(
              state.competency
                .readiness_pct || 0
            );

          html = `
            <div class="nd-live-score">
              ${state.competencyScore.toFixed(2)}
              / 100
            </div>

            <div class="nd-live-sub">
              Role Readiness:
              ${readiness.toFixed(1)}%
            </div>

            <span class="nd-live-pill">
              LIVE BACKEND
            </span>
          `;
        } else {
          html = `
            <span class="nd-demo">
              Demo record
            </span>
          `;
        }

        if (
          cell.innerHTML.trim()
          !==
          html.trim()
        ) {
          cell.innerHTML =
            html;
        }
      }
    );
  }


  // ============================================================
  // REPLACE ALL ACTIONS WITH REAL BUTTONS
  // ============================================================

  function repairActions(
    table
  ) {
    const rows =
      Array.from(
        table?.tBodies?.[0]?.rows
        || []
      );

    rows.forEach(
      row => {

        const cells =
          Array.from(
            row.querySelectorAll(
              'td'
            )
          );

        if (!cells.length) {
          return;
        }

        const actionCell =
          cells[
            cells.length - 1
          ];

        const officer =
          extractOfficer(row);

        const key =
          officerKey(officer);

        const banned =
          Boolean(
            getBanMap()[key]
          );

        actionCell.classList.add(
          'nd-action-cell'
        );

        const html = `

          <div class="nd-action-row">

            <button
              type="button"
              class="
                nd-action-btn
                nd-inspect
              "
              data-nd-action="inspect"
            >
              ◉ Inspect Profile
            </button>


            <button
              type="button"
              class="
                nd-action-btn
                nd-message
              "
              data-nd-action="message"
            >
              ✉ Message
            </button>


            <button
              type="button"
              class="
                nd-action-btn
                ${
                  banned
                    ? 'nd-unban'
                    : 'nd-ban'
                }
              "
              data-nd-action="ban"
            >
              ${
                banned
                  ? '✓ Unban'
                  : '⊘ Ban'
              }
            </button>

          </div>

        `;

        if (
          actionCell.innerHTML.trim()
          !==
          html.trim()
        ) {
          actionCell.innerHTML =
            html;
        }
      }
    );
  }


  // ============================================================
  // MODAL
  // ============================================================

  function closeModal() {
    document
      .getElementById(
        'nd-runtime-modal'
      )
      ?.remove();
  }


  function mountModal(
    inner,
    small = false
  ) {
    closeModal();

    const modal =
      document.createElement(
        'div'
      );

    modal.id =
      'nd-runtime-modal';

    modal.className =
      'nd-modal';

    modal.innerHTML = `

      <div
        class="
          nd-dialog
          ${small ? 'small' : ''}
        "
      >

        ${inner}

      </div>

    `;

    document.body.appendChild(
      modal
    );

    return modal;
  }


  // ============================================================
  // DEMO INSPECT
  // ============================================================

  function openDemoInspect(
    officer
  ) {
    mountModal(
      `

        <div class="nd-head">

          <div>

            <h2>
              Officer Profile Inspection
            </h2>

            <p>
              Demo roster record
            </p>

          </div>

          <button
            type="button"
            class="nd-close"
            data-nd-close
          >
            ×
          </button>

        </div>


        <div class="nd-body">

          <div class="nd-info">

            <div>
              <small>Officer</small>
              <strong>
                ${esc(officer.name)}
              </strong>
            </div>

            <div>
              <small>Employee ID</small>
              <strong>
                ${esc(
                  officer.code ||
                  'Demo'
                )}
              </strong>
            </div>

            <div>
              <small>Designation</small>
              <strong>
                ${esc(
                  officer.designation
                )}
              </strong>
            </div>

            <div>
              <small>Division</small>
              <strong>
                ${esc(
                  officer.division
                )}
              </strong>
            </div>

          </div>


          <div
            style="
              padding:11px;
              background:#fff7ed;
              color:#9a3412;
              border-radius:8px;
              font-size:11px;
            "
          >

            This officer is currently
            a demo roster record.

            Live competency APIs are
            connected to S. K. Raman.

          </div>

        </div>


        <div class="nd-footer">

          <button
            type="button"
            class="
              nd-modal-btn
              nd-primary
            "
            data-nd-close
          >
            Close
          </button>

        </div>

      `,
      true
    );
  }


  // ============================================================
  // LIVE INSPECT
  // ============================================================

  async function openInspect(
    officer
  ) {
    if (
      !isRealEmployee(officer)
    ) {
      openDemoInspect(
        officer
      );

      return;
    }

    await refreshBackend();

    const profile =
      state.profile;

    const competency =
      state.competency;

    const readiness =
      Number(
        competency.readiness_pct || 0
      );

    const skills =
      Array.isArray(
        competency.skills
      )
        ? competency.skills
        : [];

    const rows =
      skills.map(
        skill => `

          <tr>

            <td>

              <strong>
                ${esc(
                  skill.skill_name
                )}
              </strong>

              <div
                style="
                  font-size:9px;
                  color:#94a3b8;
                "
              >
                ${esc(
                  skill.domain
                )}
              </div>

            </td>

            <td>
              <strong>
                ${
                  Number(
                    skill.confidence_score
                    || 0
                  ).toFixed(2)
                }%
              </strong>
            </td>

            <td>
              ${
                Number(
                  skill.current_proficiency
                  || 0
                )
              }/5
              →
              ${
                Number(
                  skill.required_proficiency
                  || 0
                )
              }/5
            </td>

            <td>
              ${
                Number(
                  skill.gap_size
                  || 0
                )
              }
            </td>

            <td>
              ${
                Number(
                  skill.gap_size
                  || 0
                ) <= 0

                  ? 'Requirement Met'

                  : esc(
                      skill.priority_label
                    )
              }
            </td>

            <td>
              ${
                Number(
                  skill.evidence_count
                  || 0
                )
              }
            </td>

          </tr>

        `
      )
      .join('');


    mountModal(
      `

        <div class="nd-head">

          <div>

            <h2>
              Live Competency Inspection
            </h2>

            <p>
              Backend synchronized • Read-only
            </p>

          </div>

          <button
            type="button"
            class="nd-close"
            data-nd-close
          >
            ×
          </button>

        </div>


        <div class="nd-body">

          <div class="nd-grid">

            <div class="nd-card">
              <small>
                Competency Score
              </small>

              <strong
                style="color:#15803d"
              >
                ${
                  state
                    .competencyScore
                    .toFixed(2)
                }
                / 100
              </strong>
            </div>


            <div class="nd-card">
              <small>
                Role Readiness
              </small>

              <strong>
                ${readiness.toFixed(1)}%
              </strong>
            </div>


            <div class="nd-card">
              <small>
                Requirements Met
              </small>

              <strong>
                ${
                  competency
                    .requirements_met
                  || 0
                }
                /
                ${
                  competency
                    .total_required_skills
                  || 0
                }
              </strong>
            </div>


            <div class="nd-card">
              <small>
                High Priority Gaps
              </small>

              <strong
                style="color:#ea580c"
              >
                ${
                  competency
                    .high_priority_gaps
                  || 0
                }
              </strong>
            </div>

          </div>


          <div class="nd-info">

            <div>
              <small>
                Officer
              </small>

              <strong>
                ${esc(
                  profile.name
                )}
              </strong>
            </div>


            <div>
              <small>
                Employee ID
              </small>

              <strong>
                ${esc(
                  profile.employee_code
                )}
              </strong>
            </div>


            <div>
              <small>
                Current Role
              </small>

              <strong>
                ${esc(
                  profile.current_role
                    ?.name
                  ||
                  profile.designation
                  ||
                  'Not available'
                )}
              </strong>
            </div>


            <div>
              <small>
                Target Role
              </small>

              <strong>
                ${esc(
                  profile.target_role
                    ?.name
                  ||
                  'Not selected'
                )}
              </strong>
            </div>

          </div>


          <div
            style="
              overflow-x:auto;
              border:1px solid #e2e8f0;
              border-radius:9px;
            "
          >

            <table class="nd-table">

              <thead>

                <tr>
                  <th>Skill</th>
                  <th>Confidence</th>
                  <th>Current → Required</th>
                  <th>Gap</th>
                  <th>Priority</th>
                  <th>Evidence</th>
                </tr>

              </thead>

              <tbody>
                ${rows}
              </tbody>

            </table>

          </div>

        </div>


        <div class="nd-footer">

          <button
            type="button"
            class="
              nd-modal-btn
              nd-primary
            "
            data-nd-close
          >
            Close Inspection
          </button>

        </div>

      `
    );
  }


  // ============================================================
  // MESSAGE
  // ============================================================

  function openMessage(
    officer
  ) {
    const modal =
      mountModal(
        `

          <div class="nd-head">

            <div>

              <h2>
                Message Officer
              </h2>

              <p>
                ${esc(
                  officer.name
                )}
              </p>

            </div>

            <button
              type="button"
              class="nd-close"
              data-nd-close
            >
              ×
            </button>

          </div>


          <div class="nd-body">

            <textarea
              id="nd-message-text"
              class="nd-textarea"
              placeholder="Type your administrative message..."
            ></textarea>

          </div>


          <div class="nd-footer">

            <button
              type="button"
              class="
                nd-modal-btn
                nd-secondary
              "
              data-nd-close
            >
              Cancel
            </button>

            <button
              type="button"
              class="
                nd-modal-btn
                nd-primary
              "
              id="nd-send-message"
            >
              Send Message
            </button>

          </div>

        `,
        true
      );


    modal
      .querySelector(
        '#nd-send-message'
      )
      ?.addEventListener(
        'click',
        () => {

          const text =
            modal
              .querySelector(
                '#nd-message-text'
              )
              ?.value
              .trim();

          if (!text) {
            alert(
              'Please type a message first.'
            );
            return;
          }

          let messages = [];

          try {
            messages =
              JSON.parse(
                localStorage.getItem(
                  'nirdesha_admin_sent_messages'
                ) || '[]'
              );
          } catch (_) {
            messages = [];
          }

          if (
            !Array.isArray(
              messages
            )
          ) {
            messages = [];
          }

          messages.unshift({
            officerName:
              officer.name,

            officerCode:
              officer.code,

            message:
              text,

            sentAt:
              new Date()
                .toISOString()
          });

          localStorage.setItem(
            'nirdesha_admin_sent_messages',
            JSON.stringify(
              messages
            )
          );

          closeModal();

          alert(
            `Message recorded for ${officer.name}.`
          );
        }
      );
  }


  // ============================================================
  // BAN
  // ============================================================

  function openBan(
    officer
  ) {
    const key =
      officerKey(officer);

    const banned =
      Boolean(
        getBanMap()[key]
      );

    const modal =
      mountModal(
        `

          <div class="nd-head">

            <div>

              <h2>
                ${
                  banned
                    ? 'Remove Ban'
                    : 'Administrative Ban'
                }
              </h2>

              <p>
                ${esc(
                  officer.name
                )}
              </p>

            </div>

            <button
              type="button"
              class="nd-close"
              data-nd-close
            >
              ×
            </button>

          </div>


          <div class="nd-body">

            <p>
              ${
                banned

                  ? 'Restore this officer?'

                  : 'Suspend this officer in the prototype Admin Portal?'
              }
            </p>

          </div>


          <div class="nd-footer">

            <button
              type="button"
              class="
                nd-modal-btn
                nd-secondary
              "
              data-nd-close
            >
              Cancel
            </button>

            <button
              type="button"
              class="
                nd-modal-btn
                ${
                  banned
                    ? 'nd-primary'
                    : 'nd-danger'
                }
              "
              id="nd-confirm-ban"
            >
              ${
                banned
                  ? 'Confirm Unban'
                  : 'Confirm Ban'
              }
            </button>

          </div>

        `,
        true
      );


    modal
      .querySelector(
        '#nd-confirm-ban'
      )
      ?.addEventListener(
        'click',
        () => {

          setBanned(
            key,
            !banned
          );

          closeModal();

          repairPage();
        }
      );
  }


  // ============================================================
  // BUTTON CLICK HANDLER
  // ============================================================

  function installHandlers() {

    document.addEventListener(
      'click',
      async event => {

        const close =
          event.target.closest(
            '[data-nd-close]'
          );

        if (close) {
          event.preventDefault();

          closeModal();

          return;
        }


        const button =
          event.target.closest(
            '[data-nd-action]'
          );

        if (!button) {
          return;
        }


        const row =
          button.closest(
            'tr'
          );

        if (!row) {
          return;
        }


        event.preventDefault();

        event.stopPropagation();

        event.stopImmediatePropagation();


        const officer =
          extractOfficer(row);


        const action =
          button.getAttribute(
            'data-nd-action'
          );


        try {

          if (
            action === 'inspect'
          ) {
            await openInspect(
              officer
            );

          } else if (
            action === 'message'
          ) {
            openMessage(
              officer
            );

          } else if (
            action === 'ban'
          ) {
            openBan(
              officer
            );
          }

        } catch (error) {

          console.error(
            error
          );

          alert(
            `Admin action failed: ${error.message}`
          );
        }

      },

      true
    );


    document.addEventListener(
      'click',
      event => {

        if (
          event.target?.id
          ===
          'nd-runtime-modal'
        ) {
          closeModal();
        }

      }
    );
  }


  // ============================================================
  // BACKEND
  // ============================================================

  async function refreshBackend() {

    const [
      profile,
      competency
    ] =
      await Promise.all([

        api(
          `/api/profile/${EMPLOYEE_ID}`
        ),

        api(
          `/api/competency/${EMPLOYEE_ID}`
        )

      ]);


    state.profile =
      profile;


    state.competency =
      competency;


    state.competencyScore =
      calculateScore(
        competency
      );
  }


  // ============================================================
  // REPAIR PAGE
  // ============================================================

  function repairPage() {

    const table =
      findDirectoryTable();

    if (!table) {
      return;
    }

    ensureLiveColumn(
      table
    );

    repairActions(
      table
    );
  }


  async function refresh() {

    try {
      await refreshBackend();
    } catch (error) {
      console.warn(
        'Backend unavailable:',
        error
      );
    }

    repairPage();
  }


  // ============================================================
  // INITIALIZE
  // ============================================================

  function init() {

    installStyles();

    installHandlers();


    setTimeout(
      refresh,
      300
    );


    setInterval(
      refresh,
      REFRESH_MS
    );


    let pending =
      false;


    const observer =
      new MutationObserver(
        () => {

          if (pending) {
            return;
          }

          pending =
            true;

          setTimeout(
            () => {

              pending =
                false;

              repairPage();

            },
            100
          );
        }
      );


    observer.observe(
      document.body,
      {
        childList:
          true,

        subtree:
          true
      }
    );


    window.addEventListener(
      'hashchange',
      () =>
        setTimeout(
          repairPage,
          100
        )
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


  window.NirdeshaAdminActions = {
    refresh,
    state,
    openInspect
  };

})();