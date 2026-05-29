// FWISD Principal List — sample data drawn from the 2026–27 Principal
// Requirements workbook (June + July tabs). Schema mirrors the workbook so
// it could be exported back to Sheets.
//
// Field key:
//   ownership: who does the work (the "Tab" column)
//   bucket:    principal-facing classification (the "Principal Bucket" column)
//   sender:    central-office team that pushed the item
//   delegate:  who the principal can delegate to
//   action:    "action" | "fyi"  (Action Required vs read-only)

window.LIST_DATA = {
  meta: {
    weekOf: "Jun 15 – 19, 2026",
    monthOf: "June 2026",
    schoolYear: "2026–27",
    district: "Fort Worth ISD",
    audienceNote: "Your personal weekly checklist — check off as you go. Saves to this device only."
  },

  // Ownership states. Order is "on the principal's plate" → "off the plate".
  ownershipStates: [
    { id: "principal-do",     label: "Principal DO",                  short: "P-DO",  onPlate: true,  weight: 4 },
    { id: "principal-verify", label: "Principal VERIFY",              short: "P-VRF", onPlate: true,  weight: 2 },
    { id: "campus-do",        label: "Campus Staff DO/VERIFY",        short: "CAMP",  onPlate: false, weight: 1 },
    { id: "central-do",       label: "Central Office DO/VERIFY/PM",   short: "CO",    onPlate: false, weight: 0 }
  ],

  buckets: [
    { id: "action",    label: "Action Required",        accent: "var(--accent-red)" },
    { id: "oversight", label: "Oversight & Monitoring", accent: "var(--accent-amber)" },
    { id: "awareness", label: "Awareness",              accent: "var(--accent-blue)" },
    { id: "events",    label: "Events",                 accent: "var(--accent-violet)" },
    { id: "assess",    label: "Assessments",            accent: "var(--accent-teal)" }
  ],

  departments: [
    "Assessment", "State Reporting & Compliance", "Talent Management",
    "Performance Management", "Multilingual", "Interventions",
    "Counseling", "CTE", "Early Childhood", "GT", "Fine Arts",
    "Health & Medical", "Finance", "Attendance & Enrollment",
    "Post-Secondary", "Governance & Board", "Operations", "HR / Legal",
    "Accountability", "Evaluation"
  ],

  // ============ ITEMS — June + July 2026 ===========================
  items: [
    // ---------- WEEK OF JUN 15 – 19, 2026 ----------
    { id: 1, scope: "week",
      title: "Summer Testing Completion — June EOC Re-Testers (HS)",
      dept: "Assessment", senderName: "Lowry — SED Assessment",
      bucket: "assess", ownership: "campus-do",
      delegate: "CTC", due: "Jun 16 – 26",
      action: "action", priority: "high",
      success: "CTC and campus staff complete testing of all eligible re-testers.",
      resource: "EOC Re-Tester One-Pager", division: "Curriculum Design & Assessment" },

    { id: 2, scope: "week",
      title: "Monitor PEIMS Summer First Submission",
      dept: "State Reporting & Compliance", senderName: "Perette",
      bucket: "awareness", ownership: "central-do",
      delegate: "AP / SIR / Clerk", due: "Jun 19",
      action: "fyi", priority: "med",
      success: "SIR/Clerk corrects errors in a timely manner; principal monitors.",
      resource: "PEIMS QRG", division: "ACER" },

    { id: 3, scope: "week",
      title: "CCMR Verifier Window — close-out",
      dept: "Accountability", senderName: "Perette",
      bucket: "action", ownership: "principal-do",
      delegate: "Counselor / AP", due: "Jun 20",
      action: "action", priority: "high",
      success: "Principal completes CCMR verifier window with counselor/AP support.",
      resource: "CCMR Verifier Guide", division: "Accountability" },

    { id: 4, scope: "week",
      title: "Monitor IGC Process & Approvals (Spring Graduates)",
      dept: "State Reporting & Compliance", senderName: "Perette",
      bucket: "oversight", ownership: "central-do",
      delegate: "IGC Coordinator / AP", due: "Jun 30",
      action: "fyi", priority: "med",
      success: "IGC approvals processed; spring graduates' records finalized.",
      resource: "IGC One-Pager", division: "Accountability" },

    { id: 5, scope: "week",
      title: "Monthly AED Inspection",
      dept: "Health & Medical", senderName: "Kyna",
      bucket: "awareness", ownership: "campus-do",
      delegate: "Campus Nurse", due: "Ongoing monthly",
      action: "fyi", priority: "low",
      success: "Campus nurse completes June AED inspection and logs results.",
      resource: "AED Inspection Form", division: "Academic Solutions" },

    { id: 6, scope: "week",
      title: "Lead SDMC Meeting — Quarter 4",
      dept: "Evaluation", senderName: "Nwosu",
      bucket: "action", ownership: "principal-do",
      delegate: "Principal", due: "May 1 – Jul 31",
      action: "action", priority: "high",
      success: "Principal leads Q4 SDMC meeting; minutes filed.",
      resource: "SDMC Q4 Agenda Template", division: "Performance Management" },

    { id: 7, scope: "week",
      title: "LPAC Administrator end-of-year training documentation",
      dept: "Multilingual", senderName: "Perette",
      bucket: "oversight", ownership: "central-do",
      delegate: "LPAC Administrator", due: "Jun 12",
      action: "fyi", priority: "low",
      success: "LPAC Administrator has attended trainings and required documentation is complete.",
      resource: "LPAC Annual Training Tracker", division: "Curriculum & Instruction" },

    { id: 8, scope: "week",
      title: "Monthly LPAC virtual meeting attendance",
      dept: "Multilingual", senderName: "Perette",
      bucket: "awareness", ownership: "central-do",
      delegate: "LPAC Administrator", due: "Jun 5 (final of cycle)",
      action: "fyi", priority: "low",
      success: "100% of campus LPAC members attend final monthly meeting.",
      resource: "Virtual Mini PDs.pptx", division: "Curriculum & Instruction" },

    // ---------- REST OF JUNE (monthly view) ----------
    { id: 10, scope: "month",
      title: "Spring Graduation Information Parent Letters",
      dept: "State Reporting & Compliance", senderName: "Perette",
      bucket: "awareness", ownership: "central-do",
      delegate: "AP", due: "Apr 1 – Jun 1",
      action: "fyi", priority: "low",
      success: "AP confirms parent letters were sent; complaints logged centrally.",
      resource: "Parent Letter Template", division: "ACER" },

    { id: 11, scope: "month",
      title: "ELDI duties verification — EOY",
      dept: "Multilingual", senderName: "Perette",
      bucket: "oversight", ownership: "principal-verify",
      delegate: "ELDIs", due: "Jun 12",
      action: "action", priority: "med",
      success: "Principal verifies ELDIs have completed assigned duties and were not assigned non-allowable tasks.",
      resource: "ELDI Responsibilities", division: "Curriculum & Instruction" },

    { id: 12, scope: "month",
      title: "At-Risk meeting cycle close-out — EOY",
      dept: "Multilingual", senderName: "Perette",
      bucket: "oversight", ownership: "campus-do",
      delegate: "LPAC Administrator", due: "Jun 5",
      action: "fyi", priority: "low",
      success: "LPAC Administrator final attendance logged at At-Risk meetings.",
      resource: "At-Risk Meeting Log", division: "Curriculum & Instruction" },

    { id: 13, scope: "month",
      title: "Middle school career exploration visit — BJCC / select HS",
      dept: "CTE", senderName: "Kyna",
      bucket: "awareness", ownership: "central-do",
      delegate: "CTE Administrator", due: "Ongoing",
      action: "fyi", priority: "low",
      success: "CTE administrator coordinates visit; CTE department covers field trip cost.",
      resource: "CTE Field Trip Guide", division: "CCMR" },

    { id: 14, scope: "month",
      title: "Host 9th-grade career exploration recruitment events",
      dept: "CTE", senderName: "Kyna",
      bucket: "oversight", ownership: "campus-do",
      delegate: "CTE Administrator", due: "Ongoing",
      action: "fyi", priority: "low",
      success: "Campus hosts recruitment event for incoming 9th graders showing CTE interest.",
      resource: "Recruitment Toolkit", division: "CCMR" },

    // ---------- JULY 2026 PREVIEW (monthly view extends into July) ----------
    { id: 20, scope: "month",
      title: "Continue SDMC Q4 lead — final deadline",
      dept: "Evaluation", senderName: "Nwosu",
      bucket: "action", ownership: "principal-do",
      delegate: "Principal", due: "Jul 31",
      action: "action", priority: "high",
      success: "Q4 SDMC meeting closed out; minutes archived.",
      resource: "SDMC Q4 Agenda Template", division: "Performance Management" },

    { id: 21, scope: "month",
      title: "Monitor PEIMS Child Find Submission (HS only)",
      dept: "State Reporting & Compliance", senderName: "Perette",
      bucket: "awareness", ownership: "central-do",
      delegate: "AP / SIR / Clerk", due: "Jul 31",
      action: "fyi", priority: "med",
      success: "Child Find Submission completed for HS by July 31.",
      resource: "PEIMS Child Find Guide", division: "ACER" },

    { id: 22, scope: "month",
      title: "Summer Testing Completion — final EOC re-tester window",
      dept: "Assessment", senderName: "Lowry",
      bucket: "assess", ownership: "campus-do",
      delegate: "CTC", due: "Jun 16 – 26",
      action: "action", priority: "high",
      success: "All eligible re-testers tested by end of window.",
      resource: "EOC Re-Tester One-Pager", division: "Curriculum Design & Assessment" }
  ],

  // ============ OFF-PLATE LOG — first month of rollout ====================
  offPlateLog: [
    { id: "op1", date: "Jun 2, 2026",
      item: "Section 504 service plan navigating-laws cascade training",
      from: "principal-do", to: "central-do",
      approver: "Sr ED School Operations",
      sender: "Interventions",
      timeSaved: "~1 hr / principal",
      note: "Central team delivers PD directly to 504 Coordinators — principal informed only." },

    { id: "op2", date: "Jun 5, 2026",
      item: "Monthly LPAC meeting attendance tracking",
      from: "principal-verify", to: "central-do",
      approver: "ED of Instruction",
      sender: "Multilingual",
      timeSaved: "~1.5 hrs / principal / cycle",
      note: "Central Multilingual team now tracks LPAC attendance via PowerSchool; principal sees exception reports only." },

    { id: "op3", date: "Jun 10, 2026",
      item: "Frontline RtI/MTSS training scheduling",
      from: "principal-do", to: "central-do",
      approver: "Sr ED School Operations",
      sender: "Interventions",
      timeSaved: "~2 hrs / principal / cycle",
      note: "Central Interventions team schedules + tracks attendance instead of asking each principal." },

    { id: "op4", date: "Jun 12, 2026",
      item: "Refugee Document SharePoint upload",
      from: "principal-verify", to: "campus-do",
      approver: "ED of Instruction",
      sender: "Multilingual",
      timeSaved: "~45 min / principal / month",
      note: "Delegated to LPAC Administrator or Campus Registrar/SIR." },

    { id: "op5", date: "Jun 15, 2026",
      item: "PEIMS Summer First Submission monitoring",
      from: "principal-verify", to: "central-do",
      approver: "Regional Chief",
      sender: "State Reporting & Compliance",
      timeSaved: "~1.5 hrs / principal",
      note: "SIR/Clerk owns it with central oversight; principal removed from the chain." }
  ]
};
