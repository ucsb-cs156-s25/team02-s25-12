import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import * as useBackend from "main/utils/useBackend";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UCSBOrganizationTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "OrgCode",
    "OrgTranslationShort",
    "OrgTranslation",
    "Inactive",
  ];
  const expectedFields = [
    "orgCode",
    "orgTranslationShort",
    "orgTranslation",
    "inactive",
  ];
  const testId = "UCSBOrganizationTable";

  test("renders empty table correctly", () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={[]}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(
        `${testId}-cell-row-0-col-${field}`,
      );
      expect(fieldElement).not.toBeInTheDocument();
    });
  });

  test("renders empty table when ucsborganizations is null", () => {
    const currentUser = {
      root: {
        user: {
          roles: ["ROLE_USER"],
        },
      },
    };

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={null}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const table = screen.getByTestId("UCSBOrganizationTable");
    expect(table).toBeInTheDocument();
    const tbody = screen.getByRole("rowgroup");
    expect(tbody).toBeEmpty();
  });

  test("Has the expected column headers, content and buttons for admin user", () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={ucsbOrganizationFixtures.threeOrganizations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("ACM");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`),
    ).toHaveTextContent("ASSOC COMPUTING MACH");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslation`),
    ).toHaveTextContent("ASSOCIATION FOR COMPUTING MACHINERY AT UCSB");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-inactive`),
    ).toHaveTextContent("false");

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgCode`),
    ).toHaveTextContent("IEEE");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgTranslationShort`),
    ).toHaveTextContent("IEEE STUDENT BRANCH");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgTranslation`),
    ).toHaveTextContent(
      "INSTITUTE OF ELECTRICAL & ELECTRONICS ENGINEERS STUDENT BRANCH",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-inactive`),
    ).toHaveTextContent("false");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgCode`),
    ).toHaveTextContent("GRSA");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgTranslationShort`),
    ).toHaveTextContent("GAUCHO RACING SA");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgTranslation`),
    ).toHaveTextContent("GAUCHO RACING STUDENT ASSOCIATION");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-inactive`),
    ).toHaveTextContent("false");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Has the expected column headers, content for ordinary user", () => {
    // arrange
    const currentUser = currentUserFixtures.userOnly;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={ucsbOrganizationFixtures.threeOrganizations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("ACM");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`),
    ).toHaveTextContent("ASSOC COMPUTING MACH");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslation`),
    ).toHaveTextContent("ASSOCIATION FOR COMPUTING MACHINERY AT UCSB");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-inactive`),
    ).toHaveTextContent("false");

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgCode`),
    ).toHaveTextContent("IEEE");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgTranslationShort`),
    ).toHaveTextContent("IEEE STUDENT BRANCH");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgTranslation`),
    ).toHaveTextContent(
      "INSTITUTE OF ELECTRICAL & ELECTRONICS ENGINEERS STUDENT BRANCH",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-inactive`),
    ).toHaveTextContent("false");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgCode`),
    ).toHaveTextContent("GRSA");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgTranslationShort`),
    ).toHaveTextContent("GAUCHO RACING SA");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgTranslation`),
    ).toHaveTextContent("GAUCHO RACING STUDENT ASSOCIATION");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-inactive`),
    ).toHaveTextContent("false");

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={ucsbOrganizationFixtures.threeOrganizations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("ACM");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgTranslationShort`),
    ).toHaveTextContent("ASSOC COMPUTING MACH");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    // act - click the edit button
    fireEvent.click(editButton);

    // assert - check that the navigate function was called with the expected path
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/ucsborganizations/edit/ACM",
      ),
    );
  });

  test("Delete button calls delete callback", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/ucsborganizations")
      .reply(200, { message: "UCSBOrganization deleted" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={ucsbOrganizationFixtures.threeOrganizations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("ACM");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called
    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ orgCode: "ACM" });
  });
});

describe("UCSBOrganizationTable mutation and edge case tests", () => {
  const queryClient = new QueryClient();
  const testId = "UCSBOrganizationTable";

  test("Delete button calls useBackendMutation's mutate", () => {
    const currentUser = currentUserFixtures.adminUser;
    const mutateMock = jest.fn();
    jest
      .spyOn(useBackend, "useBackendMutation")
      .mockReturnValue({ mutate: mutateMock });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={ucsbOrganizationFixtures.threeOrganizations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    fireEvent.click(deleteButton);
    expect(mutateMock).toHaveBeenCalled();
  });

  test("No edit/delete buttons for null currentUser", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={ucsbOrganizationFixtures.threeOrganizations}
            currentUser={null}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("No edit/delete buttons for user with no roles", () => {
    const currentUser = { root: { rolesList: [] } };
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={ucsbOrganizationFixtures.threeOrganizations}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("Handles malformed ucsborganizations data", () => {
    const currentUser = currentUserFixtures.adminUser;
    const malformedData = [{}, { orgCode: "X" }];
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={malformedData}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getAllByRole("row").length).toBeGreaterThan(0);
  });

  test("Renders with undefined currentUser", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable
            ucsborganizations={ucsbOrganizationFixtures.threeOrganizations}
            currentUser={undefined}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });
});
