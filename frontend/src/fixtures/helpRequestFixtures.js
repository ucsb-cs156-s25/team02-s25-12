const helpRequestsFixtures = {
  oneDate: {
    id: 1,
    requesterEmail: "foo@ucsb.edu",
    teamId: "team-12",
    tableOrBreakoutRoom: "table-12",
    requestTime: "2022-01-02T12:00:00",
    explanation: "my socks are untied.",
    solved: false,
  },
  threeDates: [
    {
      id: 1,
      requesterEmail: "foo@ucsb.edu",
      teamId: "team-12",
      tableOrBreakoutRoom: "table-12",
      requestTime: "2022-01-02T12:00:00",
      explanation: "my socks are untied.",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "bar@gmail.com",
      teamId: "team-12",
      tableOrBreakoutRoom: "breakout-room-12",
      requestTime: "2022-01-01T12:01:04",
      explanation: "foo's socks are untied.",
      solved: false,
    },
    {
      id: 3,
      requesterEmail: "baz@vercel.com",
      teamId: "team-04",
      tableOrBreakoutRoom: "table-04",
      requestTime: "2025-04-01T01:23:45",
      explanation:
        "unsure if riemann zeta function has zeros only at negative even integers and complex numbers w/ real part 1/2.",
      solved: true,
    },
  ],
};

export { helpRequestsFixtures };
