import React from "react";
import HelpRequestTable from "main/components/HelpRequests/HelpRequestTable";
import { helpRequestsFixtures } from "fixtures/helpRequestFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/HelpRequests/HelpRequestTable",
  component: HelpRequestTable,
};

const Template = (args) => {
  return <HelpRequestTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  helpRequests: [],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  helpRequests: helpRequestsFixtures.threeHelpRequests,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  helpRequests: helpRequestsFixtures.threeHelpRequests,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/helprequests", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
