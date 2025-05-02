import React from "react";
import MenuItemReviewTable from "main/components/MenuItemReviews/MenuItemReviewTable";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/MenuItemReviews/MenuItemReviewTable",
  component: MenuItemReviewTable,
};

const Template = (args) => {
  return <MenuItemReviewTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  menuItemReviews: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  menuItemReviews: menuItemReviewFixtures.threeReviews,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  menuItemReviews: menuItemReviewFixtures.threeReviews,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/menuitemreviews", () => {
      return HttpResponse.json(
        { message: "Review deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
