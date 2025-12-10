export const fallbackBppSteps = [
  {
    step: 1,
    title: "Needs assessment & planning",
    description: "Validate justification, scope, stakeholders, and risk model before market approach.",
    checkpoints: [
      "Requirement justification and feasibility",
      "Stakeholder analysis and governance",
      "Risk, ethics, and reporting expectations",
    ],
    world_bank_alignment: ["Generate Strategy", "Plan Procurement"],
  },
  {
    step: 2,
    title: "Budget / appropriation",
    description: "Stress-test cost models, approvals, and anti-corruption controls.",
    checkpoints: [
      "Model inputs, drivers, and validation",
      "Financing approvals and policy compliance",
      "Anti-corruption and ethical reviews",
    ],
    world_bank_alignment: ["Plan Procurement"],
  },
  {
    step: 3,
    title: "Advertisement",
    description: "Ensure opportunities are visible, equitable, and complete.",
    checkpoints: [
      "Publication clarity and timing",
      "Channels, language, and equity checks",
      "EOI and bidder list management",
    ],
    world_bank_alignment: ["Invite Offers"],
  },
  {
    step: 4,
    title: "Transparent prequalification",
    description: "Objective, timed, and fully documented supplier filtering.",
    checkpoints: [
      "Published criteria and schedule",
      "Evidence-backed scoring",
      "Notification and appeal paths",
    ],
    world_bank_alignment: ["Invite Offers", "Receive Offers"],
  },
  {
    step: 5,
    title: "Bid submission",
    description: "Secure, traceable, and policy-aligned submission handling.",
    checkpoints: [
      "Receipt logging and storage",
      "Security and confidentiality",
      "Late submission policy",
    ],
    world_bank_alignment: ["Receive Offers"],
  },
  {
    step: 6,
    title: "Bid opening",
    description: "Transparent opening ceremony with strict protocol adherence.",
    checkpoints: [
      "Attendance and minutes",
      "Guideline adherence",
      "Anti-bribery controls",
    ],
    world_bank_alignment: ["Evaluate Offers"],
  },
  {
    step: 7,
    title: "Bid evaluation",
    description: "Separated technical/financial reviews with evidence-based scoring.",
    checkpoints: [
      "Blind scoring discipline",
      "Notification and market disclosure",
      "Anti-corruption logging",
    ],
    world_bank_alignment: ["Evaluate Offers"],
  },
  {
    step: 8,
    title: "Authority to incur expenditure",
    description: "Approvals align with tender outcomes and are traceable.",
    checkpoints: [
      "Delegation validation",
      "Submission completeness",
      "Error remediation",
    ],
    world_bank_alignment: ["Award Contract"],
  },
  {
    step: 9,
    title: "Tender Board / FEC",
    description: "Formal approvals with quorum and decision tracking.",
    checkpoints: [
      "Process compliance",
      "Decision clarity",
      "Implementation integrity",
    ],
    world_bank_alignment: ["Award Contract"],
  },
  {
    step: 10,
    title: "Contract execution",
    description: "Monitor delivery, KPIs, risks, and lessons learned.",
    checkpoints: [
      "Performance vs plan",
      "Issue logs and RCA",
      "KPI and governance cadence",
    ],
    world_bank_alignment: ["Manage Contract"],
  },
  {
    step: 11,
    title: "Continuous review",
    description: "Post-contract reflection, deltas, and remedy tracking.",
    checkpoints: [
      "Closeout report",
      "Cost delta analysis",
      "Improvement backlog",
    ],
    world_bank_alignment: ["Manage Contract"],
  },
];
