import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import RecommendationRequestsEditPage from "main/pages/RecommendationRequests/RecommendationRequestsEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const original = jest.requireActual("react-toastify");
  return { __esModule: true, ...original, toast: (x) => mockToast(x) };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...original,
    useParams: () => ({ id: 1 }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("RecommendationRequestsEditPage tests", () => {
  const queryClient = new QueryClient();

  describe("when the backend returns no data", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 1 } })
        .timeout();
    });

    test("renders header but no form fields", async () => {
      // arrange
      const restoreConsole = mockConsole();

      // act
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      // assert
      await screen.findByText("Edit Recommendation Request");
      expect(
        screen.queryByTestId("RecommendationRequestForm-id"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("when the backend returns data normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 1 } })
        .reply(200, {
          id: 1,
          requesterEmail: "hungkhuu@ucsb.edu",
          professorEmail: "phtcon@ucsb.edu",
          explanation:
            "I am a good student who really enjoyed your class on Advanced Application Development.",
          dateRequested: "2025-05-02T08:00:00",
          dateNeeded: "2025-09-26T08:00:00",
          done: false,
        });
      axiosMock.onPut("/api/recommendationrequest").reply(200, {
        id: 1,
        requesterEmail: "hungkhuu@ucsb.edu",
        professorEmail: "phtcon@ucsb.edu",
        explanation: "Updated explanation",
        dateRequested: "2025-05-02T08:00:00",
        dateNeeded: "2025-09-26T08:00:00",
        done: false,
      });
    });

    test("form is populated with the existing data", async () => {
      // arrange & act
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      // assert
      await screen.findByTestId("RecommendationRequestForm-id");
      expect(screen.getByTestId("RecommendationRequestForm-id")).toHaveValue(
        "1",
      );
      expect(screen.getByLabelText("Requester Email")).toHaveValue(
        "hungkhuu@ucsb.edu",
      );
      expect(screen.getByLabelText("Professor Email")).toHaveValue(
        "phtcon@ucsb.edu",
      );
      expect(screen.getByLabelText("Explanation")).toHaveValue(
        "I am a good student who really enjoyed your class on Advanced Application Development.",
      );
      expect(screen.getByText("Update")).toBeInTheDocument();
    });

    test("clicking Update sends PUT, shows toast and navigates", async () => {
      // arrange
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByTestId("RecommendationRequestForm-id");

      // act
      fireEvent.change(screen.getByLabelText("Explanation"), {
        target: { value: "Updated explanation" },
      });
      fireEvent.click(screen.getByText("Update"));

      // assert
      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest Updated - id: 1 requesterEmail: hungkhuu@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequests" });
      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        requesterEmail: "hungkhuu@ucsb.edu",
        professorEmail: "phtcon@ucsb.edu",
        explanation: "Updated explanation",
        dateRequested: "2025-05-02T08:00:00",
        dateNeeded: "2025-09-26T08:00:00",
        done: false,
      });
    });
  });
});
