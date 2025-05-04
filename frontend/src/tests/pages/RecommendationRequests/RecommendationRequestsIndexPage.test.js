import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RecommendationRequestsIndexPage from "main/pages/RecommendationRequests/RecommendationRequestsIndexPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import mockConsole from "jest-mock-console";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("RecommendationRequestsIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "RecommendationRequestTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const queryClient = new QueryClient();

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/recommendationrequest/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Create Recommendation Request/),
      ).toBeInTheDocument();
    });
    const button = screen.getByText(/Create Recommendation Request/);
    expect(button).toHaveAttribute("href", "/recommendationrequests/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three recommendation requests correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/recommendationrequest/all")
      .reply(200, recommendationRequestFixtures.threeRecommendationRequests);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    // requesterEmails
    expect(screen.getByText("hungkhuu@ucsb.edu")).toBeInTheDocument();
    expect(screen.getByText("benjaminconte@ucsb.edu")).toBeInTheDocument();
    expect(screen.getByText("samuelzhu@ucsb.edu")).toBeInTheDocument();

    // professorEmails
    expect(screen.getAllByText("phtcon@ucsb.edu").length).toBe(3); // used in all 3 rows

    // explanation
    expect(
      screen.getAllByText(
        "I am a good student who really enjoyed your class on Advanced Application Development.",
      ).length,
    ).toBe(3);

    // dateRequested and dateNeeded (same in all 3)
    expect(screen.getAllByText("2025-05-02 08:00:00").length).toBe(3);
    expect(screen.getAllByText("2025-09-26 08:00:00").length).toBe(3);

    // done: two ❌ and one ✅
    expect(screen.getAllByText("❌").length).toBe(2);
    expect(screen.getAllByText("✅").length).toBe(1);

    // Admin-only buttons shouldn't be visible
    expect(
      screen.queryByText("Create Recommendation Request"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(
        "RecommendationRequestTable-cell-row-0-col-Edit-button",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(
        "RecommendationRequestTable-cell-row-0-col-Delete-button",
      ),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/recommendationrequest/all").timeout();
    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/recommendationrequest/all",
    );
    restoreConsole();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/recommendationrequest/all")
      .reply(200, recommendationRequestFixtures.threeRecommendationRequests);
    axiosMock
      .onDelete("/api/recommendationrequest")
      .reply(200, "RecommendationRequest with id 1 was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest with id 1 was deleted",
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
