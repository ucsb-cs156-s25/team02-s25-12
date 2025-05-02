import React from "react";
import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItems/UCSBDiningCommonsMenuItemTable";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/UCSBDiningCommonsMenuItems/UCSBDiningCommonsMenuItemTable",
  component: UCSBDiningCommonsMenuItemTable,
};

const Template = (args) => {
  return <UCSBDiningCommonsMenuItemTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  ucsbdiningcommonsmenuitems: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  ucsbdiningcommonsmenuitems:
    ucsbDiningCommonsMenuItemFixtures.threeUCSBDiningCommonsMenuItems,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  ucsbdiningcommonsmenuitems:
    ucsbDiningCommonsMenuItemFixtures.threeUCSBDiningCommonsMenuItems,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/ucsbdiningcommonsmenuitems", () => {
      return HttpResponse.json(
        { message: "Menu Item deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
