export const EVENT_TITLE = "Mini CTF";

export const CHALLENGES = [
  {
    id: "ch1",
    title: "Challenge 01 — Warmup",
    category: "Intermediate",
    pointsMax: 150,
    description: "A gentle first flag. Focus on reading the page carefully.",
    comingSoon: false,
  },

  {
    id: "ch2",
    title: "Challenge 2 — Employee Profiles",
    category: "Easy",
    pointsMax: 100,
    comingSoon: false,

    // This is what shows on the challenge page
    description:
      "The company recently launched a simple internal employee profile viewer. Employees can browse profiles using the provided interface. Management believes profile access is properly restricted.",

    // Scenario content (for Challenge2.jsx page)
    scenario: [
      "You are assigned to test the new employee profile feature.",
      "Each employee has a public-facing profile page.",
      "The development team insists there are no access issues.",
      "Your objective is to review the implementation and identify any exposed sensitive information."
    ],

    // Metadata for your routing logic
    metadata: {
      totalProfiles: 12,
      profileRoute: "/challenge/ch2/profile",
      flagProfileId: 8
    }
  },

  {
    id: "ch3",
    title: "Challenge 3 — Client-Side Trust",
    category: "Easy",
    difficulty: "Easy–Medium",
    pointsMax: 100,
    comingSoon: false,
    description:
      "A portal stores session state in the browser. Find a way to access the restricted admin area and unlock the flag.",
  },

  {
    id: "ch4",
    title: "Challenge 04 — Coming Soon",
    category: "TBA",
    pointsMax: 250,
    description: "More fun incoming.",
    comingSoon: true
  },
];
