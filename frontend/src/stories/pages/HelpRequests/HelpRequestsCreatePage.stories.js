import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import HelpRequestsCreatePage from "main/pages/HelpRequests/HelpRequestsCreatePage";

export default {
  title: "pages/HelpRequests/HelpRequestsCreatePage",
  component: HelpRequestsCreatePage,
};

const Template = () => <HelpRequestsCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.post("/api/helprequests/post", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
