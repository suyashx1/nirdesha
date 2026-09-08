/**
 * Nirdesha Phase 1 Integration Bridge
 * Connects the existing public/admin UI to the FastAPI competency backend.
 */
(function () {
  'use strict';

  const API_BASE = (window.location.protocol === 'http:' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://127.0.0.1:8001'
    : '';
  const EMPLOYEE_ID = 1;
  const ADMIN_REFRESH_MS = 8000;

  const state = {
    profile: null,
    competency: null
  };


  // =========================================================================
  // GENERIC API HELPER
  // =========================================================================

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    const isJson = (
      response.headers.get('content-type') || ''
    ).includes('application/json');

    const data = isJson
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const detail =
        data && typeof data === 'object'
          ? (data.detail || JSON.stringify(data))
          : String(data);

      throw new Error(
        `Phase 1 API ${response.status}: ${detail}`
      );
    }

    return data;
  }


  // =========================================================================
  // MAP EXISTING QUIZ TOPICS → BACKEND SKILL CODES
  // =========================================================================

  function inferSkillCode(topic = '', answers = []) {
    const answerText = Array.isArray(answers)
      ? answers
          .map(
            a =>
              `${a.prompt || ''} ${a.explanation || ''}`
          )
          .join(' ')
      : '';

    const text = `${topic} ${answerText}`.toLowerCase();

    const rules = [
      [
        ['python', 'pandas', 'numpy'],
        'PYTHON'
      ],

      [
        ['sql', 'relational', 'database query'],
        'SQL'
      ],

      [
        ['gis', 'geospatial', 'mapping'],
        'GIS'
      ],

      [
        ['visualization', 'data visual', 'chart'],
        'DATA_VIS'
      ],

      [
        [
          'dpdp',
          'privacy',
          'anonym',
          'k-anonym',
          'governance'
        ],
        'DPDP'
      ],

      [
        [
          'capi',
          'tablet',
          'field automation',
          'offline sync'
        ],
        'CAPI_VERIFICATION'
      ],

      [
        [
          'nss frame',
          'frame design',
          'sampling frame'
        ],
        'NSS_FRAME'
      ],

      [
        [
          'leadership',
          'communication',
          'project management'
        ],
        'LEADERSHIP'
      ],

      [
        [
          'deflator',
          'national accounts',
          'cpi',
          'wpi',
          'laspeyres',
          'paasche',
          'price index'
        ],
        'MACRO_DEFLATORS'
      ],

      [
        [
          'sampling',
          'survey',
          'horvitz',
          'hansen-hurwitz',
          'neyman',
          'pps',
          'srswor'
        ],
        'SURVEY_SAMPLING'
      ]
    ];

    for (const [keywords, code] of rules) {
      if (
        keywords.some(keyword =>
          text.includes(keyword)
        )
      ) {
        return code;
      }
    }

    // Current default quizzes are mainly
    // statistical/sampling based.
    return 'SURVEY_SAMPLING';
  }


  // =========================================================================
  // PROFILE CONVERSION
  // =========================================================================

  function readOldProfile() {
    try {
      return JSON.parse(
        localStorage.getItem(
          'nirdesha_officer_profile'
        ) || '{}'
      );
    } catch (_) {
      return {};
    }
  }


  function buildLegacyProfile(
    profile,
    competency
  ) {
    const old = readOldProfile();

    const skills = (
      competency?.skills || []
    ).map(item => item.skill_name);

    const initials = (
      profile.name || 'SK Raman'
    )
      .split(/\s+/)
      .filter(Boolean)
      .map(x => x[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      ...old,

      name:
        profile.name,

      role:
        profile.designation ||
        profile.current_role?.name ||
        'Government Statistical Official',

      division:
        profile.division ||
        profile.department?.name ||
        '',

      cadreSeal:
        'Prototype Competency Profile',

      status:
        profile.status ||
        'Competency profile synchronized with Nirdesha backend.',

      station:
        profile.station || '',

      tenure:
        profile.tenure || '',

      email:
        profile.email,

      cadre:
        profile.cadre || '',

      ministry:
        profile.ministry ||
        'MoSPI, Government of India',

      roll:
        profile.employee_code,

      skills,

      baseline:
        `${Math.round(
          competency?.readiness_pct || 0
        )}% target-role readiness`,

      avatarInitials:
        old.avatarInitials || initials,

      avatarImg:
        old.avatarImg || '',

      currentWork:
        old.currentWork || [],

      futureWork:
        old.futureWork || [],

      socialLinks:
        old.socialLinks || {}
    };
  }


  // =========================================================================
  // BACKEND SKILL GAPS → EXISTING SKILL GAP UI
  // =========================================================================

  function syncSkillGapCache(snapshot) {
    if (!snapshot?.skills) return;

    let oldGaps = [];

    try {
      oldGaps = JSON.parse(
        localStorage.getItem(
          'nirdesha_skill_gaps'
        ) || '[]'
      );

      if (!Array.isArray(oldGaps)) {
        oldGaps = [];
      }
    } catch (_) {
      oldGaps = [];
    }


    const gaps = snapshot.skills.map(skill => {

      const old =
        oldGaps.find(
          g =>
            g.id ===
            `backend_${skill.skill_code}`
        ) ||

        oldGaps.find(g => {
          const topic = String(
            g.topic || ''
          ).toLowerCase();

          const name =
            skill.skill_name.toLowerCase();

          return (
            topic.includes(name) ||
            name.includes(topic)
          );
        }) ||

        {};


      const resolved =
        skill.gap_size <= 0;


      return {
        id:
          `backend_${skill.skill_code}`,

        skillCode:
          skill.skill_code,

        topic:
          skill.skill_name,

        module:
          `${skill.domain} Competency • Target ${skill.required_proficiency}/5`,

        severity:
          resolved
            ? 'resolved'
            : (
                ['Critical', 'High'].includes(
                  skill.priority_label
                )
                  ? 'high'
                  : 'moderate'
              ),

        masteryPct:
          Math.round(
            skill.confidence_score || 0
          ),

        mistakesCount:
          old.mistakesCount ||
          (
            resolved
              ? 0
              : Math.max(
                  1,
                  skill.gap_size
                )
          ),

        lastMistakeDate:
          old.lastMistakeDate ||
          (
            skill.last_evidence_at
              ? new Date(
                  skill.last_evidence_at
                ).getTime()
              : Date.now()
          ),

        // Preserve real question mistakes
        // already recorded by public.js.
        questionsMissed:
          Array.isArray(
            old.questionsMissed
          )
            ? old.questionsMissed
            : [],


        prepRoadmap:
          old.prepRoadmap ||
          {
            diagnosis:
              skill.reason,

            formulas: [],

            routine: [
              `Review the assigned learning content for ${skill.skill_name}.`,

              `Focus on the ${skill.gap_size}-level gap against the target role.`,

              'Complete a targeted practice quiz and submit new evidence.'
            ],

            reference:
              'Nirdesha Prototype Role-Skill Mapping — demo only.'
          },


        retestQuestions:
          Array.isArray(
            old.retestQuestions
          ) &&
          old.retestQuestions.length

            ? old.retestQuestions

            : [
                {
                  prompt:
                    `Which action best helps close an identified competency gap in ${skill.skill_name}?`,

                  options: [
                    'Review targeted learning content and complete a reassessment',

                    'Ignore the gap',

                    'Increase the score manually',

                    'Use only self-assessment'
                  ],

                  correct: 0,

                  explanation:
                    'Nirdesha updates competency using learning evidence and reassessment.'
                }
              ]
      };
    });


    localStorage.setItem(
      'nirdesha_skill_gaps',
      JSON.stringify(gaps)
    );
  }


  // =========================================================================
  // UPDATE EXISTING 2D SKILL RADAR
  // =========================================================================

  function update2DRadar(snapshot) {
    const root =
      document.getElementById(
        'skill-radar-2d-view'
      );

    if (
      !root ||
      !snapshot?.skills
    ) {
      return;
    }


    const byCode = new Map(
      snapshot.skills.map(
        skill => [
          skill.skill_code,
          skill
        ]
      )
    );


    const match = [
      [
        'Survey Sampling',
        'SURVEY_SAMPLING'
      ],

      [
        'Macroeconomic',
        'MACRO_DEFLATORS'
      ],

      [
        'Python',
        'PYTHON'
      ],

      [
        'DPDP',
        'DPDP'
      ]
    ];


    root
      .querySelectorAll(
        '.radar-skill-item'
      )
      .forEach(item => {

        const label =
          item.querySelector(
            '.radar-skill-name'
          );

        if (!label) return;


        const rule =
          match.find(
            ([text]) =>
              label.textContent.includes(
                text
              )
          );

        if (!rule) return;


        const skill =
          byCode.get(
            rule[1]
          );

        if (!skill) return;


        const current =
          Math.round(
            skill.confidence_score || 0
          );


        const target =
          skill.required_proficiency * 20;


        const targetMet =
          skill.gap_size === 0;


        const color =
          targetMet
            ? '#15803d'
            : (
                current >= 50
                  ? '#ea580c'
                  : '#dc2626'
              );


        const num =
          item.querySelector(
            '.radar-bar-num'
          );

        const fill =
          item.querySelector(
            '.radar-bar-fill'
          );

        const targetEl =
          item.querySelector(
            '.radar-skill-target'
          );


        if (num) {
          num.dataset.target =
            current;

          num.textContent =
            `${current}%`;
        }


        if (fill) {
          fill.dataset.target =
            current;

          fill.style.width =
            `${current}%`;

          fill.style.background =
            color;
        }


        if (targetEl) {

          const pill =
            targetMet

              ? '<span class="exceeded-pill">Requirement Met</span>'

              : `<span class="gap-pill">${Math.max(
                  0,
                  target - current
                )}% Confidence Gap</span>`;


          targetEl.innerHTML =
            `<strong class="radar-bar-num" data-target="${current}">${current}%</strong> / ${target}% Target ${pill}`;
        }
      });


    // Highest-priority gap appears
    // in the recommendation card.
    const topGap =
      snapshot.skills.find(
        skill =>
          skill.gap_size > 0
      );


    if (topGap) {

      const title =
        root.querySelector(
          '.recom-title'
        );

      const text =
        root.querySelector(
          '.recom-text'
        );


      if (title) {
        title.textContent =
          `Focus Track: ${topGap.skill_name}`;
      }


      if (text) {
        text.textContent =
          `${topGap.reason} Current confidence: ${Math.round(
            topGap.confidence_score
          )}%.`;
      }
    }
  }


  // =========================================================================
  // UPDATE EXISTING 3D CONSTELLATION
  // =========================================================================

  function update3D(snapshot) {
    if (
      !Array.isArray(
        window.NirdeshaConstellationNodes
      ) ||
      !snapshot?.skills
    ) {
      return;
    }


    const byCode = new Map(
      snapshot.skills.map(
        skill => [
          skill.skill_code,
          skill
        ]
      )
    );


    const nodeMap = {
      sampling:
        'SURVEY_SAMPLING',

      datascience:
        'PYTHON',

      dpdp:
        'DPDP',

      accounts:
        'MACRO_DEFLATORS',

      deflators:
        'MACRO_DEFLATORS'
    };


    window
      .NirdeshaConstellationNodes
      .forEach(node => {

        const skill =
          byCode.get(
            nodeMap[node.id]
          );

        if (!skill) return;


        const pct =
          Math.round(
            skill.confidence_score || 0
          );


        const met =
          skill.gap_size === 0;


        node.score =
          `${pct}%`;


        node.title =
          skill.skill_name;


        node.domain =
          skill.domain;


        node.status =
          met

            ? `Requirement Met • ${skill.current_proficiency}/5`

            : `${skill.priority_label} Gap • ${skill.current_proficiency}/5 → ${skill.required_proficiency}/5`;


        node.statusCode =
          met
            ? 'mastered'
            : 'inprogress';


        node.color =
          met
            ? '#10b981'
            : (
                pct >= 50
                  ? '#f59e0b'
                  : '#dc2626'
              );


        node.accent =
          met
            ? '#34d399'
            : (
                pct >= 50
                  ? '#fbbf24'
                  : '#f87171'
              );


        node.prereq =
          skill.reason;
      });
  }


  // =========================================================================
  // APPLY BACKEND DATA TO EMPLOYEE DASHBOARD
  // =========================================================================

  function applyEmployeeSnapshot(
    profile,
    competency
  ) {
    state.profile = profile;
    state.competency = competency;


    const readiness =
      Math.round(
        competency?.readiness_pct || 0
      );


    localStorage.setItem(
      'nirdesha_readiness_index',
      String(readiness)
    );


    const legacy =
      buildLegacyProfile(
        profile,
        competency
      );


    localStorage.setItem(
      'nirdesha_officer_profile',
      JSON.stringify(legacy)
    );


    localStorage.setItem(
      'nirdesha_public_profile',
      JSON.stringify(legacy)
    );


    if (
      typeof
      window.setNirdeshaOfficerProfile
      === 'function'
    ) {

      window
        .setNirdeshaOfficerProfile(
          legacy
        );

    } else if (
      typeof
      window.renderPublicOfficerDossier
      === 'function'
    ) {

      window
        .renderPublicOfficerDossier(
          legacy
        );
    }


    [
      'profile-param-readiness',
      'sg-readiness-index'
    ].forEach(id => {

      const el =
        document.getElementById(id);

      if (el) {
        el.textContent =
          `${readiness}%`;
      }
    });


    syncSkillGapCache(
      competency
    );


    update2DRadar(
      competency
    );


    update3D(
      competency
    );


    if (
      typeof
      window.renderSkillGapGrid
      === 'function'
    ) {
      window.renderSkillGapGrid();
    }
  }


  // =========================================================================
  // FETCH EMPLOYEE PROFILE + COMPETENCY
  // =========================================================================

  async function refreshEmployee() {

    const [
      profile,
      competency
    ] = await Promise.all([

      api(
        `/api/profile/${EMPLOYEE_ID}`
      ),

      api(
        `/api/competency/${EMPLOYEE_ID}`
      )
    ]);


    applyEmployeeSnapshot(
      profile,
      competency
    );


    return {
      profile,
      competency
    };
  }


  // =========================================================================
  // SAVE EDITED PROFILE TO BACKEND
  // =========================================================================

  async function saveProfileFromForm() {

    const value =
      id =>
        document
          .getElementById(id)
          ?.value
          .trim() || '';


    const payload = {

      name:
        value(
          'public-profile-name'
        ),

      email:
        value(
          'public-profile-email'
        ),

      designation:
        value(
          'public-profile-role'
        ),

      division:
        value(
          'public-profile-division'
        ),

      cadre:
        value(
          'public-profile-cadre'
        ),

      ministry:
        value(
          'public-profile-ministry'
        ),

      station:
        value(
          'public-profile-station'
        ),

      tenure:
        value(
          'public-profile-tenure'
        ),

      status:
        value(
          'public-profile-status'
        )
    };


    Object
      .keys(payload)
      .forEach(key => {

        if (!payload[key]) {
          delete payload[key];
        }
      });


    await api(
      `/api/profile/${EMPLOYEE_ID}`,
      {
        method: 'PUT',
        body: JSON.stringify(
          payload
        )
      }
    );


    return refreshEmployee();
  }


  // =========================================================================
  // EXISTING QUIZ → BACKEND SKILL EVIDENCE
  // =========================================================================

  async function submitQuizEvidence({
    title,
    topic,
    accuracy,
    correct,
    total,
    answers = [],
    assessmentType = 'quiz'
  }) {

    const skillCode =
      inferSkillCode(
        topic,
        answers
      );


    const result =
      await api(
        '/api/assessment-result',
        {
          method: 'POST',

          body: JSON.stringify({
            employee_id:
              EMPLOYEE_ID,

            assessment_title:
              title ||
              'Nirdesha Competency Assessment',

            assessment_type:
              assessmentType,

            source_ref:
              `ui-${Date.now()}`,

            results: [
              {
                skill_code:
                  skillCode,

                score:
                  Number(
                    accuracy
                  ),

                correct:
                  Number(
                    correct
                  ),

                total:
                  Number(
                    total
                  ),

                metadata: {
                  topic:
                    topic || '',

                  frontend:
                    'existing-nirdesha-quiz',

                  recorded_answers:
                    answers.length
                }
              }
            ]
          })
        }
      );


    const profile =
      state.profile ||
      await api(
        `/api/profile/${EMPLOYEE_ID}`
      );


    applyEmployeeSnapshot(
      profile,
      result.competency
    );


    return result;
  }

  /**
 * Calculate the employee's continuous overall competency score.
 *
 * This is different from target-role readiness.
 *
 * Each competency's evidence-based confidence score is weighted by
 * its criticality in the employee's evaluated target role.
 *
 * Example:
 * Python confidence = 72%
 * Criticality = 4
 *
 * More important role competencies therefore contribute more strongly
 * to the overall competency score.
 */

function calculateAdminCompetencyScore(competency) {

  const skills = Array.isArray(
    competency?.skills
  )
    ? competency.skills
    : [];


  if (!skills.length) {

    return Number(
      competency?.readiness_pct || 0
    );
  }


  let weightedTotal = 0;
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


    weightedTotal +=
      confidence * weight;


    totalWeight +=
      weight;

  });


  if (!totalWeight) {

    return 0;
  }


  return (
    weightedTotal /
    totalWeight
  );
}

  // =========================================================================
  // ADMIN DASHBOARD — UPDATE LIVE DIAGNOSTIC ROW
  // =========================================================================

  /**
 * Update S. K. Raman's live row on the Admin Dashboard.
 *
 * Score displayed:
 *      Continuous Competency Score
 *
 * Secondary information:
 *      Target Role Readiness
 */
function updateAdminRecentRow(
  profile,
  competency
) {

  const dashboard =
    document.getElementById(
      'view-dashboard'
    );


  if (!dashboard) {
    return;
  }


  const competencyScore =
    calculateAdminCompetencyScore(
      competency
    );


  const readiness =
    Number(
      competency.readiness_pct || 0
    );


  dashboard
    .querySelectorAll(
      'table tbody tr'
    )
    .forEach(row => {

      const text =
        row.textContent || '';


      if (
        !text.includes(
          profile.name
        ) &&
        !text.includes(
          profile.employee_code
        )
      ) {

        return;
      }


      const cells =
        row.querySelectorAll(
          'td'
        );


      if (
        cells.length < 5
      ) {

        return;
      }


      // ------------------------------------------------------------
      // LIVE COMPETENCY SCORE
      // ------------------------------------------------------------

      cells[3].innerHTML = `

        <strong>
          ${competencyScore.toFixed(2)} / 100
        </strong>

        <div
          style="
            margin-top:2px;
            font-size:10px;
            font-weight:600;
            color:#64748b;
          "
        >

          Role Readiness:
          ${readiness.toFixed(1)}%

        </div>

      `;


      // ------------------------------------------------------------
      // STATUS
      // ------------------------------------------------------------

      const status =

        competency.high_priority_gaps === 0

          ? 'Requirements Met'

          : (
              competency.high_priority_gaps <= 2

                ? 'In Progress'

                : 'Needs Attention'
            );


      const badgeClass =

        competency.high_priority_gaps === 0

          ? 'badge-status-cert'

          : 'badge-status-prog';


      cells[4].innerHTML = `

        <span class="${badgeClass}">

          ${status}

        </span>

      `;

    });
}


  // =========================================================================
  // ADMIN DASHBOARD REFRESH
  // =========================================================================

  /**
 * Refresh the Admin Dashboard from the same competency database
 * used by the employee portal.
 */
async function refreshAdmin() {

  const [
    profile,
    competency
  ] = await Promise.all([

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


  // --------------------------------------------------------------
  // CONTINUOUS COMPETENCY SCORE
  // --------------------------------------------------------------

  const competencyScore =
    calculateAdminCompetencyScore(
      competency
    );


  // --------------------------------------------------------------
  // ROLE READINESS
  // --------------------------------------------------------------

  const readiness =
    Number(
      competency.readiness_pct || 0
    );


  // Keep officer dossier synchronized.

  localStorage.setItem(

    'nirdesha_officer_profile',

    JSON.stringify(

      buildLegacyProfile(
        profile,
        competency
      )

    )

  );


  // --------------------------------------------------------------
  // USER DIRECTORY
  // --------------------------------------------------------------

  if (
    typeof
      window.NirdeshaAdminUpsertUser
      === 'function'
  ) {

    window
      .NirdeshaAdminUpsertUser({

        id:
          profile.employee_code,

        name:
          profile.name,

        cadre:
          profile.cadre
          ||
          profile.current_role?.name
          ||
          'Statistical Service',

        department:
          profile.division
          ||
          profile.department?.name
          ||
          '',

        jurisdiction:
          profile.station
          ||
          '',


        /*
         * IMPORTANT:
         *
         * This is now the evidence-based
         * continuous COMPETENCY SCORE.
         *
         * It is intentionally NOT
         * readiness_pct.
         */

        score:
          Number(
            competencyScore.toFixed(
              2
            )
          ),


        status:

          competency.high_priority_gaps
          === 0

            ? 'Requirements Met'

            : (
                competency
                  .high_priority_gaps
                <= 2

                  ? 'In Progress'

                  : 'Needs Attention'
              )

      });

  }


  // Update live dashboard diagnostic row.

  updateAdminRecentRow(
    profile,
    competency
  );


  return {profile, competency, competencyScore, readiness};
}

  // =========================================================================
  // MAKE FUNCTIONS AVAILABLE TO PUBLIC.JS AND ADMIN.JS
  // =========================================================================

  window.NirdeshaPhase1 = {

    API_BASE,

    EMPLOYEE_ID,

    state,

    api,

    inferSkillCode,

    refreshEmployee,

    refreshAdmin,

    saveProfileFromForm,

    submitQuizEvidence,

    applyEmployeeSnapshot
  };


  // =========================================================================
  // AUTO INITIALIZATION
  // =========================================================================

  document.addEventListener(
    'DOMContentLoaded',
    () => {

      // Employee/Public dashboard.
      if (
        document.getElementById(
          'skill-radar-section'
        )
      ) {

        setTimeout(
          () =>
            refreshEmployee()
              .catch(error =>
                console.error(
                  'Employee backend sync failed:',
                  error
                )
              ),
          100
        );
      }


      // Administrator dashboard.
      if (
        document.getElementById(
          'admin-user-directory-tbody'
        )
      ) {

        setTimeout(
          () =>
            refreshAdmin()
              .catch(error =>
                console.error(
                  'Admin backend sync failed:',
                  error
                )
              ),
          100
        );


        // Keep admin synchronized while
        // employee and admin windows are open.
        setInterval(
          () =>
            refreshAdmin()
              .catch(() => {}),
          ADMIN_REFRESH_MS
        );
      }
    }
  );

})();