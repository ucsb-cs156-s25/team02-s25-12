import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

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
      id: "ACM",
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("UCSBOrganizationEditPage tests", () => {
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
      axiosMock
        .onGet("/api/ucsborganizations", { params: { orgCode: "ACM" } })
        .timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Organization");
      expect(
        screen.queryByTestId("UCSBOrganizationForm-orgCode"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();

      // Load the page first
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);

      // Mock the specific API call
      axiosMock
        .onGet("/api/ucsborganizations", { params: { orgCode: "ACM" } })
        .reply(200, {
          orgCode: "ACM",
          orgTranslationShort: "ASSOC COMPUTING MACH",
          orgTranslation: "ASSOCIATION FOR COMPUTING MACHINERY AT UCSB",
          inactive: "false",
        });

      // The PUT request needs to be set up for success
      axiosMock.onPut("/api/ucsborganizations").reply(200, {
        orgCode: "ACM",
        orgTranslationShort: "ASSOC COMPUTING MACH1",
        orgTranslation: "ASSOCIATION FOR COMPUTING MACHINERY AT UCSB1",
        inactive: "true",
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const orgTranslationShortField = screen.getByLabelText(
        "OrgTranslationShort",
      );
      const orgTranslationField = screen.getByLabelText("OrgTranslation");
      const inactiveField = screen.getByLabelText("Inactive");

      const submitButton = screen.getByText("Update");

      expect(orgCodeField).toBeInTheDocument();
      expect(orgCodeField).toHaveValue("ACM");
      expect(orgTranslationShortField).toBeInTheDocument();
      expect(orgTranslationShortField).toHaveValue("ASSOC COMPUTING MACH");
      expect(orgTranslationField).toBeInTheDocument();
      expect(orgTranslationField).toHaveValue(
        "ASSOCIATION FOR COMPUTING MACHINERY AT UCSB",
      );
      expect(inactiveField).toBeInTheDocument();
      expect(inactiveField).toHaveValue("false");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(orgTranslationShortField, {
        target: { value: "ASSOC COMPUTING MACH1" },
      });
      fireEvent.change(orgTranslationField, {
        target: { value: "ASSOCIATION FOR COMPUTING MACHINERY AT UCSB1" },
      });
      fireEvent.change(inactiveField, {
        target: { value: "true" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Organization Updated - id: ACM orgCode: ACM",
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/ucsborganizations" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: "ACM" });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          orgCode: "ACM",
          orgTranslationShort: "ASSOC COMPUTING MACH1",
          orgTranslation: "ASSOCIATION FOR COMPUTING MACHINERY AT UCSB1",
          inactive: "true",
        }),
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const orgTranslationShortField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslationShort",
      );
      const orgTranslationField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslation",
      );
      const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
      const submitButton = screen.getByText("Update");

      expect(orgCodeField).toHaveValue("ACM");
      expect(orgTranslationShortField).toHaveValue("ASSOC COMPUTING MACH");
      expect(orgTranslationField).toHaveValue(
        "ASSOCIATION FOR COMPUTING MACHINERY AT UCSB",
      );
      expect(inactiveField).toHaveValue("false");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(orgCodeField, {
        target: { value: "ACM" },
      });
      fireEvent.change(orgTranslationShortField, {
        target: { value: "ASSOC COMPUTING MACH1" },
      });
      fireEvent.change(orgTranslationField, {
        target: { value: "ASSOCIATION FOR COMPUTING MACHINERY AT UCSB1" },
      });
      fireEvent.change(inactiveField, {
        target: { value: "true" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toHaveBeenCalledWith(
        "Organization Updated - id: ACM orgCode: ACM",
      );
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/ucsborganizations" });
    });
  });
});
