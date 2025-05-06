import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import RecommendationRequestsEditPage from "main/pages/RecommendationRequests/RecommendationRequestsEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

/* ---------------- mocks ---------------- */
const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const real = jest.requireActual("react-toastify");
  return { __esModule: true, ...real, toast: (x) => mockToast(x) };
});
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const real = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...real,
    useParams: () => ({ id: 1 }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});
/* --------------------------------------- */

describe("RecommendationRequestsEditPage", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  beforeEach(() => {
    axiosMock.reset();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly)
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  describe("backend timeout", () => {
    beforeEach(() => {
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 1 } })
        .timeout();
    });

    test("renders header only and still attempted GET with {id}", async () => {
      const restore = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Edit Recommendation Request/);
      expect(
        screen.queryByLabelText(/Requester Email/i),
      ).not.toBeInTheDocument();

      await waitFor(() =>
        expect(
          axiosMock.history.get.find(
            (g) => g.url === "/api/recommendationrequest",
          )?.params,
        ).toEqual({ id: 1 }),
      );
      restore();
    });
  });

  describe("happy path", () => {
    const original = {
      id: 1,
      requesterEmail: "hungkhuu@ucsb.edu",
      professorEmail: "phtcon@ucsb.edu",
      explanation:
        "I am a good student who really enjoyed your class on Advanced Application Development.",
      dateRequested: "2025-05-02T08:00:00",
      dateNeeded: "2025-09-26T08:00:00",
      done: false,
    };

    beforeEach(() => {
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 1 } })
        .reply(200, original);

      axiosMock.onPut("/api/recommendationrequest").reply((config) => {
        return [
          200,
          {
            ...original,
            explanation: "Updated explanation",
          },
        ];
      });
    });

    test("Update sends complete PUT, toast includes id+email, navigates", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByLabelText(/Explanation/i);
      fireEvent.change(screen.getByLabelText(/Explanation/i), {
        target: { value: "Updated explanation" },
      });
      fireEvent.click(screen.getByText("Update"));

      await waitFor(() => expect(mockToast).toHaveBeenCalled());

      const put = axiosMock.history.put[0];
      expect(put.params).toEqual({ id: 1 });
      expect(JSON.parse(put.data)).toEqual({
        requesterEmail: original.requesterEmail,
        professorEmail: original.professorEmail,
        explanation: "Updated explanation",
        dateRequested: original.dateRequested,
        dateNeeded: original.dateNeeded,
        done: false,
      });

      const expectedMsg =
        "RecommendationRequest Updated - id: 1 requesterEmail: hungkhuu@ucsb.edu";
      expect(mockToast).toHaveBeenCalledWith(expectedMsg);
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/recommendationrequests",
      });
    });
  });
});
