import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

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

describe("ArticlesEditPage tests", () => {
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Articles");
      expect(screen.queryByTestId("Articles-title")).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/articles", { params: { id: 1 } }).reply(200, {
        id: 1,
        title: "Using testing-playground with React Testing Library",
        url: "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7",
        explanation: "Helpful when we get to front end development",
        email: "phtcon@ucsb.edu",
        dateAdded: "2022-04-20T00:00:00",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: "1",
        title: "Handy Spring Utility Classes",
        url: "https://twitter.com/maciejwalkowiak/status/1511736828369719300?t=gGXpmBH4y4eY9OBSUInZEg&s=09",
        explanation: "A lot of really useful classes are built into Spring",
        email: "phtcon@ucsb.edu",
        dateAdded: "2022-04-19T00:00:00",
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      const idField = screen.getByLabelText("Id");
      const titleField = screen.getByLabelText("Title");
      const urlField = screen.getByLabelText("Url");
      const explanationField = screen.getByLabelText("Explanation");
      const emailField = screen.getByLabelText("Email");
      const dateAddedField = screen.getByLabelText("Date Added (iso format)");

      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("1");
      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue(
        "Using testing-playground with React Testing Library",
      );
      expect(urlField).toBeInTheDocument();
      expect(urlField).toHaveValue(
        "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7",
      );
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue(
        "Helpful when we get to front end development",
      );
      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveValue("phtcon@ucsb.edu");
      expect(dateAddedField).toBeInTheDocument();
      expect(dateAddedField).toHaveValue("2022-04-20T00:00");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: "Handy Spring Utility Classes" },
      });
      fireEvent.change(urlField, {
        target: {
          value:
            "https://twitter.com/maciejwalkowiak/status/1511736828369719300?t=gGXpmBH4y4eY9OBSUInZEg&s=09",
        },
      });
      fireEvent.change(explanationField, {
        target: {
          value: "A lot of really useful classes are built into Spring",
        },
      });
      fireEvent.change(emailField, {
        target: { value: "phtcon@ucsb.edu" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2022-04-19T00:00:00" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Articles Updated - id: 1 title: Handy Spring Utility Classes",
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "Handy Spring Utility Classes",
          url: "https://twitter.com/maciejwalkowiak/status/1511736828369719300?t=gGXpmBH4y4eY9OBSUInZEg&s=09",
          explanation: "A lot of really useful classes are built into Spring",
          email: "phtcon@ucsb.edu",
          dateAdded: "2022-04-19T00:00",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-id");

      const idField = screen.getByLabelText("Id");
      const titleField = screen.getByLabelText("Title");
      const urlField = screen.getByLabelText("Url");
      const explanationField = screen.getByLabelText("Explanation");
      const emailField = screen.getByLabelText("Email");
      const dateAddedField = screen.getByLabelText("Date Added (iso format)");

      const submitButton = screen.getByText("Update");

      expect(idField).toHaveValue("1");
      expect(titleField).toHaveValue(
        "Using testing-playground with React Testing Library",
      );
      expect(urlField).toHaveValue(
        "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7",
      );
      expect(explanationField).toHaveValue(
        "Helpful when we get to front end development",
      );
      expect(emailField).toHaveValue("phtcon@ucsb.edu");
      expect(dateAddedField).toHaveValue("2022-04-20T00:00");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(titleField, {
        target: { value: "Handy Spring Utility Classes" },
      });
      fireEvent.change(urlField, {
        target: {
          value:
            "https://twitter.com/maciejwalkowiak/status/1511736828369719300?t=gGXpmBH4y4eY9OBSUInZEg&s=09",
        },
      });
      fireEvent.change(explanationField, {
        target: {
          value: "A lot of really useful classes are built into Spring",
        },
      });
      fireEvent.change(emailField, { target: { value: "phtcon@ucsb.edu" } });
      fireEvent.change(dateAddedField, {
        target: { value: "2022-04-19T00:00:00" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Articles Updated - id: 1 title: Handy Spring Utility Classes",
      );
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });
    });
  });
});
