import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import RecommendationRequestForm from "main/components/RecommendationRequests/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("RecommendationRequestForm tests", () => {
  const queryClient = new QueryClient();
  const testId = "RecommendationRequestForm";

  // all the ids produced by the component
  const ids = [
    "requesterEmail",
    "professorEmail",
    "explanation",
    "dateRequested",
    "dateNeeded",
    "done",
    "submit",
    "cancel",
  ];

  /** asserts that every test‑id element is present */
  const expectAllTestIds = () => {
    ids.forEach((id) =>
      expect(
        screen.getByTestId(`${testId}-${id}`),
      ).toBeInTheDocument(),
    );
  };

  const renderForm = (props = {}) =>
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={() => {}} {...props} />
        </Router>
      </QueryClientProvider>,
    );

  test("renders correctly with no initialContents", async () => {
    renderForm();
    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expectAllTestIds(); // ← new line kills the mutants
  });

  test("submitAction is called with correct data on valid input", async () => {
    const mockSubmit = jest.fn();
    renderForm({ submitAction: mockSubmit });

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
      target: { value: "prof@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Strong recommendation please!" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
      target: { value: "2025-05-01T08:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
      target: { value: "2025-06-01T08:00" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-done`)); // tick the checkbox

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
    expect(mockSubmit).toHaveBeenCalledWith({
      requesterEmail: "student@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "Strong recommendation please!",
      dateRequested: "2025-05-01T08:00",
      dateNeeded: "2025-06-01T08:00",
      done: true, // checkbox was checked
    });
  });

  test("shows ISO error messages when datetime fields are invalid", async () => {
    renderForm();

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
      target: { value: "prof@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Needs recommendation" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
      target: { value: "not-a-date" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
      target: { value: "also-wrong" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    const errs = await screen.findAllByText(/must be ISO‑8601/);
    expect(errs).toHaveLength(2);
  });

  test("renders correctly with initialContents", async () => {
    renderForm({
      initialContents: recommendationRequestFixtures.oneRecommendationRequest,
    });

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toBeInTheDocument();
    expectAllTestIds(); // also guards the literals here
  });

  test("Cancel calls navigate(-1)", async () => {
    renderForm();
    fireEvent.click(await screen.findByTestId(`${testId}-cancel`));
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("required‑field validation messages appear", async () => {
    renderForm();
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await screen.findByText(/Requester Email is required/);
    expect(
      screen.getByText(/Professor Email is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
    expect(
      screen.getByText(/Date Requested is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Date Needed is required/)).toBeInTheDocument();
  });
});