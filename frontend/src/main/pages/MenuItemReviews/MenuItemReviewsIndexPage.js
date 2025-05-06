import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import MenuItemReviewTable from "main/components/MenuItemReviews/MenuItemReviewTable";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import { Button } from "react-bootstrap";

export default function MenuItemReviewsIndexPage() {
  const currentUser = useCurrentUser();

  const {
    data: menuitemreviews,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/menuitemreviews/all"],
    { method: "GET", url: "/api/menuitemreviews/all" },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/menuitemreviews/create"
          style={{ float: "right" }}
        >
          Create Review
        </Button>
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>Menu Item Reviews</h1>
        <MenuItemReviewTable
          menuItemReviews={menuitemreviews}
          currentUser={currentUser}
        />
      </div>
    </BasicLayout>
  );
}
