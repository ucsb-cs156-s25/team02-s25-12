import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import RecommendationRequestForm from "main/components/RecommendationRequests/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("RecommendationRequestForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeadersRegex = [
    /Requester Email/,
    /Professor Email/,
    /Explanation/,
    /Date Requested/,
    /Date Needed/,
    /Done\?/,
  ];

  const testId = "RecommendationRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
      "",
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeadersRegex.forEach((labelRegex) => {
      const header = screen.getByLabelText(labelRegex);
      expect(header).toBeInTheDocument();
    });
  });
  test("submitAction is called with correct data on valid input", async () => {
    const mockSubmitAction = jest.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Requester Email/), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText(/Professor Email/), {
      target: { value: "prof@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText(/Explanation/), {
      target: { value: "Strong recommendation please!" },
    });
    fireEvent.change(screen.getByLabelText(/Date Requested/), {
      target: { value: "2025-05-01T08:00" },
    });
    fireEvent.change(screen.getByLabelText(/Date Needed/), {
      target: { value: "2025-06-01T08:00" },
    });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(mockSubmitAction).toHaveBeenCalledWith({
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Strong recommendation please!",
      dateRequested: "2025-05-01T08:00",
      dateNeeded: "2025-06-01T08:00",
      done: false,
    });
  });
  test("shows error when datetime fields do not match ISO pattern", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText(/Requester Email/), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText(/Professor Email/), {
      target: { value: "prof@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText(/Explanation/), {
      target: { value: "Needs recommendation" },
    });

    fireEvent.change(screen.getByLabelText(/Date Requested/), {
      target: { value: "not-a-date" },
    });
    fireEvent.change(screen.getByLabelText(/Date Needed/), {
      target: { value: "also-wrong" },
    });

    fireEvent.click(screen.getByText("Create"));

    const isoErrors = await screen.findAllByText(
      "Date must be in ISO format (YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS)",
    );

    expect(isoErrors).toHaveLength(2);
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm
            initialContents={
              recommendationRequestFixtures.oneRecommendationRequest
            }
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeadersRegex.forEach((labelRegex) => {
      const header = screen.getByLabelText(labelRegex);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Requester Email is required/);
    expect(screen.getByText(/Professor Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Requested is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Needed is required/)).toBeInTheDocument();
  });
});
