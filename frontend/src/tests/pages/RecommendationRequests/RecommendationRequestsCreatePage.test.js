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
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("RecommendationRequestsCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /recommendationrequests", async () => {
    // arrange
    const newReq = {
      id: 4,
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Letter for grad school",
      dateRequested: "2025-05-01T08:00:00",
      dateNeeded: "2025-06-01T08:00:00",
      done: false,
    };

    axiosMock.onPost("/api/recommendationrequest/post").reply(202, newReq);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument(),
    );

    // act – fill in and submit form
    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Professor Email"), {
      target: { value: "prof@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Letter for grad school" },
    });
    fireEvent.change(screen.getByLabelText(/Date Requested/i), {
      target: { value: "2025-05-01T08:00" },
    });
    fireEvent.change(screen.getByLabelText(/Date Needed/i), {
      target: { value: "2025-06-01T08:00" },
    });

    const submitButton = screen.getByText("Create");
    fireEvent.click(submitButton);

    // assert – backend called
    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Letter for grad school",
      dateRequested: "2025-05-01T08:00",
      dateNeeded: "2025-06-01T08:00",
      done: false,
    });

    // assert – toast and redirect
    expect(mockToast).toBeCalledWith(
      "New recommendation request Created - id: 4 requesterEmail: student@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequests" });
  });
});
