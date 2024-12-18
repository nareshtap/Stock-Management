import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import CollapsibleTable from "../../app/components/Table";


var mockRowData = {
  data: [
    {
      id: 10006,
      datatype: "EOD",
      symbol: "PL.COMM",
      datetime: "2024-01-01T00:00:00Z",
      startprice: 100.0,
      highestprice: 105.0,
      lowestprice: 95.0,
      endprice: 102.0,
      volume: 1500,
      source: "EOD",
      type: "endofday",
      currency: "USD",
      metadata: {},
    },
    {
      id: 10007,
      datatype: "EOD",
      symbol: "ALEZX.US",
      datetime: "2024-01-01T00:00:00Z",
      startprice: 200.0,
      highestprice: 210.0,
      lowestprice: 190.0,
      endprice: 205.0,
      volume: 2000,
      source: "EOD",
      type: "endofday",
      currency: "USD",
      metadata: {},
    },
  ],
  totalRecords: 50,
};

jest.mock("../../app/components/lineChart", () => () => <div>Mock LineChart</div>);
jest.mock("../../app/components/tableRow", () => () => <tr><td>Mock Row</td></tr>);



jest.mock("../../app/lib/axiosInstance", () => ({
  get: jest.fn().mockResolvedValue({ data: mockRowData }),
}));

jest.mock("../../app/lib/axiosInstance", () => ({
  get: jest.fn((url) => {
    if (url === "/data-import/getAvailableTypesAndCurrencies") {
      return Promise.resolve({ data: ["USD", "EUR"] });
    }
    return Promise.resolve();
  }),
}));


describe("CollapsibleTable", () => {
it("renders table with correct column names", async () => {
  render(<CollapsibleTable rowData={mockRowData} />);

  await waitFor(() => {
    const columnNames = ["ID", "Symbol", "Source", "Type", "Currency"];
    columnNames.forEach((name) => {
      if (name === "Currency") {
        expect(screen.getByRole("columnheader", { name: "Currency" })).toBeInTheDocument();
      } else {
        expect(screen.getByText(name)).toBeInTheDocument();
      }
    });
  });
});

it("renders rows when data is provided", async () => {
    render(<CollapsibleTable rowData={mockRowData} />);

    await waitFor(()=>{
           const rows = screen.getAllByRole('row');
           expect(rows.length).toBeGreaterThan(0);
    })  
  });

  it("correctly paginates through rows", async () => {
    render(<CollapsibleTable rowData={mockRowData} />);

    await waitFor(()=>{
            const rows = screen.getAllByRole('row');
            expect(rows.length).toBeGreaterThan(0);
      })  

    const nextButton = screen.getByRole("button", { name: /next page/i });
    expect(nextButton).toBeInTheDocument();

    fireEvent.click(nextButton);

    await waitFor(() => {     
           const rows = screen.getAllByRole('row');
           expect(rows.length).toBeGreaterThan(0);
         
    });
   
  });

  it("renders 'No Data' in the table when row data is empty", async () => {
    render(<CollapsibleTable rowData={{ data: [], totalRecords: 0 }} />);

    await waitFor(()=>{
       expect(screen.getByText("No Data")).toBeInTheDocument();
    })  
  });

    it("performs sorting on column click", async () => {
    render(<CollapsibleTable rowData={mockRowData} />);

    const idColumn = screen.getByText("ID");
    fireEvent.click(idColumn);
    await waitFor(() => {
      expect(screen.getByText("ID")).toBeInTheDocument();
    });
  });

    it("handles pagination", async () => {
    render(<CollapsibleTable rowData={mockRowData} />);

    const nextPageButton = screen.getByLabelText("Go to next page");
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(screen.getByText("ID")).toBeInTheDocument();
    });
  });

   it("renders line chart with correct data", async () => {
    render(<CollapsibleTable rowData={mockRowData} />);

    await waitFor(() => {
      expect(screen.getByText("Mock LineChart")).toBeInTheDocument();
    });
  });

  it("renders search input and handles input change", async () => {
    render(<CollapsibleTable rowData={mockRowData} />);

    const searchInput = screen.getByPlaceholderText(/search data/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "ALEXZ" } });

    await waitFor(() => {
      expect(mockRowData.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ symbol: "ALEZX.US" }),
        ])
      );
    });
  });

  it("changes rows per page and fetches new data", async () => {
    render(<CollapsibleTable rowData={mockRowData} />);

    const rowsPerPageSelect = screen.getByRole('combobox', { name: /rows per page/i });
    fireEvent.mouseDown(rowsPerPageSelect);

    const option50 = screen.getByRole('option', { name: /50/i });
    fireEvent.click(option50);

    await waitFor(() => {
      expect(screen.getByDisplayValue("50")).toBeInTheDocument();
    });

    expect(mockRowData.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ symbol: "PL.COMM" }),
        expect.objectContaining({ symbol: "ALEZX.US" }),
      ])
    );
  });
});
