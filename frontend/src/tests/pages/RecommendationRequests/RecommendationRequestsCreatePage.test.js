import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationRequestsCreatePage from "main/pages/RecommendationRequests/RecommendationRequestsCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("RecommendationRequestsCreatePage", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly)
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders form", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(
      await screen.findByLabelText(/Requester Email/i),
    ).toBeInTheDocument();
  });

  test("submits, sends ALL fields, shows toast, navigates", async () => {
    /* ---------- arrange ---------- */
    const created = {
      id: 4,
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Letter for grad school",
      dateRequested: "2025-05-01T08:00:00",
      dateNeeded: "2025-06-01T08:00:00",
      done: false,
    };
    axiosMock.onPost("/api/recommendationrequest/post").reply(202, created);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findByLabelText(/Requester Email/i);

    /* ---------- act ---------- */
    fireEvent.change(screen.getByLabelText(/Requester Email/i), {
      target: { value: created.requesterEmail },
    });
    fireEvent.change(screen.getByLabelText(/Professor Email/i), {
      target: { value: created.professorEmail },
    });
    fireEvent.change(screen.getByLabelText(/Explanation/i), {
      target: { value: created.explanation },
    });
    fireEvent.change(screen.getByLabelText(/Date Requested/i), {
      target: { value: "2025-05-01T08:00" }, // value before backend normalisation
    });
    fireEvent.change(screen.getByLabelText(/Date Needed/i), {
      target: { value: "2025-06-01T08:00" },
    });
    fireEvent.click(screen.getByText("Create"));

    /* ---------- assert ---------- */
    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: created.requesterEmail,
      professorEmail: created.professorEmail,
      explanation: created.explanation,
      dateRequested: "2025-05-01T08:00",
      dateNeeded: "2025-06-01T08:00",
      done: false,
    });

    expect(mockToast).toHaveBeenCalledWith(
      "New recommendation request Created - id: 4 requesterEmail: student@ucsb.edu",
    );
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/recommendationrequests",
    });
  });
});
