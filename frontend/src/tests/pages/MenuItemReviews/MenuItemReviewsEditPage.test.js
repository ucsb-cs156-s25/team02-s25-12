import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import MenuItemReviewsEditPage from "main/pages/MenuItemReviews/MenuItemReviewsEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

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
    useParams: () => ({
      id: 1,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("MenuItemReviewsEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/menuitemreviews", { params: { id: 1 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Review");
      expect(screen.queryByTestId("Review-itemId")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/menuitemreviews", { params: { id: 1 } })
        .reply(200, {
          id: 1,
          itemId: 6,
          reviewerEmail: "simonryan@ucsb.edu",
          stars: 5,
          comments: "amazing",
          dateReviewed: "3020-01-20T01:02:00",
        });
      axiosMock.onPut("/api/menuitemreviews").reply(200, {
        id: 1,
        itemId: 6,
        reviewerEmail: "simonryan@ucsb.edu",
        stars: 1,
        comments: "terrible",
        dateReviewed: "3020-01-20T01:02:00",
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByLabelText("Id");
      const itemIdField = screen.getByLabelText("Item Id");
      const reviewerEmailField = screen.getByLabelText("Reviewer Email");
      const starsField = screen.getByLabelText("Stars");
      const commentsField = screen.getByLabelText("Comments");
      const dateReviewedField = screen.getByLabelText("Date (iso format)");

      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("1");
      expect(itemIdField).toBeInTheDocument();
      expect(itemIdField).toHaveValue("6");
      expect(reviewerEmailField).toBeInTheDocument();
      expect(reviewerEmailField).toHaveValue("simonryan@ucsb.edu");
      expect(starsField).toBeInTheDocument();
      expect(starsField).toHaveValue("5");
      expect(commentsField).toBeInTheDocument();
      expect(commentsField).toHaveValue("amazing");
      expect(dateReviewedField).toBeInTheDocument();
      expect(dateReviewedField).toHaveValue("3020-01-20T01:02");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(starsField, {
        target: { value: "1" },
      });
      fireEvent.change(commentsField, {
        target: { value: "terrible" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Review Updated - id: 1 reviewerEmail: simonryan@ucsb.edu",
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/menuitemreviews" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: 6,
          reviewerEmail: "simonryan@ucsb.edu",
          stars: "1",
          comments: "terrible",
          dateReviewed: "3020-01-20T01:02:00",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByLabelText("Id");
      const itemIdField = screen.getByLabelText("Item Id");
      const reviewerEmailField = screen.getByLabelText("Reviewer Email");
      const starsField = screen.getByLabelText("Stars");
      const commentsField = screen.getByLabelText("Comments");
      const dateReviewedField = screen.getByLabelText("Date (iso format)");

      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("1");
      expect(itemIdField).toBeInTheDocument();
      expect(itemIdField).toHaveValue("6");
      expect(reviewerEmailField).toBeInTheDocument();
      expect(reviewerEmailField).toHaveValue("simonryan@ucsb.edu");
      expect(starsField).toBeInTheDocument();
      expect(starsField).toHaveValue("5");
      expect(commentsField).toBeInTheDocument();
      expect(commentsField).toHaveValue("amazing");
      expect(dateReviewedField).toBeInTheDocument();
      expect(dateReviewedField).toHaveValue("3020-01-20T01:02");

      fireEvent.change(starsField, {
        target: { value: "5" },
      });
      fireEvent.change(commentsField, {
        target: { value: "terrible" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Review Updated - id: 1 reviewerEmail: simonryan@ucsb.edu",
      );
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/menuitemreviews" });
    });
  });
});
