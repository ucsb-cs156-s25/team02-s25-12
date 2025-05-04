import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import HelpRequestsEditPage from "main/pages/HelpRequests/HelpRequestsEditPage";

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
      id: 17,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("HelpRequestsEditPage tests", () => {
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
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Help Request");
      expect(
        screen.queryByTestId("HelpRequest-requesterEmail"),
      ).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/helprequests", { params: { id: 17 } }).reply(200, {
        id: 17,
        requesterEmail: "foo@ucsb.edu",
        teamId: "team-12",
        tableOrBreakoutRoom: "table-12",
        requestTime: "2022-01-02T12:00",
        explanation: "my socks are untied.",
        solved: true,
      });
      axiosMock.onPut("/api/helprequests").reply(200, {
        id: 17,
        requesterEmail: "foo2@ucsb.edu",
        teamId: "team-13",
        tableOrBreakoutRoom: "table-13",
        requestTime: "2023-02-03T13:01",
        explanation: "my socks are untied again.",
        solved: false,
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-id");

      const idField = screen.getByTestId("HelpRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "HelpRequestForm-requesterEmail",
      );
      const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
      const tableOrBreakoutRoomField = screen.getByTestId(
        "HelpRequestForm-tableOrBreakoutRoom",
      );
      const requestTimeField = screen.getByTestId(
        "HelpRequestForm-requestTime",
      );
      const explanationField = screen.getByTestId(
        "HelpRequestForm-explanation",
      );
      const solvedField = screen.getByTestId("HelpRequestForm-solved");
      const submitButton = screen.getByTestId("HelpRequestForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("foo@ucsb.edu");
      expect(teamIdField).toBeInTheDocument();
      expect(teamIdField).toHaveValue("team-12");
      expect(tableOrBreakoutRoomField).toBeInTheDocument();
      expect(tableOrBreakoutRoomField).toHaveValue("table-12");
      expect(requestTimeField).toBeInTheDocument();
      expect(requestTimeField).toHaveValue("2022-01-02T12:00");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("my socks are untied.");
      expect(solvedField).toBeInTheDocument();
      expect(solvedField).toBeChecked();

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "foo2@ucsb.edu" },
      });
      fireEvent.change(teamIdField, { target: { value: "team-13" } });
      fireEvent.change(tableOrBreakoutRoomField, {
        target: { value: "table-13" },
      });
      fireEvent.change(requestTimeField, {
        target: { value: "2023-02-03T13:01" },
      });
      fireEvent.change(explanationField, {
        target: { value: "my socks are untied again." },
      });
      // click event because solvedField is a checkbox
      fireEvent.click(solvedField);

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "HelpRequest Updated - id: 17 email: foo2@ucsb.edu",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/helprequests" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "foo2@ucsb.edu",
          teamId: "team-13",
          tableOrBreakoutRoom: "table-13",
          requestTime: "2023-02-03T13:01",
          explanation: "my socks are untied again.",
          solved: false,
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-id");

      const idField = screen.getByTestId("HelpRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "HelpRequestForm-requesterEmail",
      );
      const teamIdField = screen.getByTestId("HelpRequestForm-teamId");
      const tableOrBreakoutRoomField = screen.getByTestId(
        "HelpRequestForm-tableOrBreakoutRoom",
      );
      const requestTimeField = screen.getByTestId(
        "HelpRequestForm-requestTime",
      );
      const explanationField = screen.getByTestId(
        "HelpRequestForm-explanation",
      );
      const solvedField = screen.getByTestId("HelpRequestForm-solved");
      const submitButton = screen.getByTestId("HelpRequestForm-submit");

      expect(idField).toHaveValue("17");
      expect(requesterEmailField).toHaveValue("foo@ucsb.edu");
      expect(teamIdField).toHaveValue("team-12");
      expect(tableOrBreakoutRoomField).toHaveValue("table-12");
      expect(requestTimeField).toHaveValue("2022-01-02T12:00");
      expect(explanationField).toHaveValue("my socks are untied.");
      expect(solvedField).toBeChecked();

      expect(submitButton).toBeInTheDocument();

      fireEvent.change(requesterEmailField, {
        target: { value: "foo2@ucsb.edu" },
      });
      fireEvent.change(teamIdField, { target: { value: "team-13" } });
      fireEvent.change(tableOrBreakoutRoomField, {
        target: { value: "table-13" },
      });
      fireEvent.change(requestTimeField, {
        target: { value: "2023-02-03T13:01" },
      });
      fireEvent.change(explanationField, {
        target: { value: "my socks are untied again." },
      });
      // click event because solvedField is a checkbox
      fireEvent.click(solvedField);

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "HelpRequest Updated - id: 17 email: foo2@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/helprequests" });
    });
  });
});
