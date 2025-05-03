const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 1,
    requesterEmail: "hungkhuu@ucsb.edu",
    professorEmail: "phtcon@ucsb.edu",
    explanation:
      "I am a good student who really enjoyed your class on Advanced Application Development.",
    dateRequested: "2025-05-02T08:00:00",
    dateNeeded: "2025-09-26T08:00:00",
    done: false,
  },
  threeRecommendationRequests: [
    {
      id: 1,
      requesterEmail: "hungkhuu@ucsb.edu",
      professorEmail: "phtcon@ucsb.edu",
      explanation:
        "I am a good student who really enjoyed your class on Advanced Application Development.",
      dateRequested: "2025-05-02T08:00:00",
      dateNeeded: "2025-09-26T08:00:00",
      done: false,
    },
    {
      id: 2,
      requesterEmail: "benjaminconte@ucsb.edu",
      professorEmail: "phtcon@ucsb.edu",
      explanation:
        "I am a good student who really enjoyed your class on Advanced Application Development.",
      dateRequested: "2025-05-02T08:00:00",
      dateNeeded: "2025-09-26T08:00:00",
      done: true,
    },
    {
      id: 3,
      requesterEmail: "samuelzhu@ucsb.edu",
      professorEmail: "phtcon@ucsb.edu",
      explanation:
        "I am a good student who really enjoyed your class on Advanced Application Development.",
      dateRequested: "2025-05-02T08:00:00",
      dateNeeded: "2025-09-26T08:00:00",
      done: false,
    },
  ],
};

export { recommendationRequestFixtures };
