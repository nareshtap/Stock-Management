"use client";
import { StockDataItem, StockDataResponse } from "@app/types/stockData";
import { Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TablePagination, TableSortLabel, TextField } from "@mui/material";
import FormControl from '@mui/material/FormControl';
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { debounce } from "lodash";
import { Suspense, useEffect, useMemo, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import LineChart from "./LineChart";
import Loader from "./Loader";
import Row from "./TableRow";



const INITIAL_FILTER = {
  page: 1,
  pageSize: 10,
  searchQuery: null,
  sortBy: "",
  sortOrder: "asc",
};


interface Filter {
  page: number;
  pageSize: number;
  searchQuery: string | null;
  sortBy: string;
  sortOrder: string;
}

interface CollapsibleTableProps {
  rowData: StockDataResponse;
}

interface HeadCell {
  disablePadding: boolean;
  id: string;
  label: string;
  numeric: boolean;
}

interface CurrencyTypes {
  currencies: string[];
}

const headCells: readonly HeadCell[] = [
  {
    id: "id",
    numeric: false,
    disablePadding: true,
    label: "ID",
  },
  {
    id: "symbol",
    numeric: true,
    disablePadding: false,
    label: "Symbol",
  },
  {
    id: "source",
    numeric: true,
    disablePadding: false,
    label: "Source",
  },
  {
    id: "type",
    numeric: true,
    disablePadding: false,
    label: "Type",
  },
  {
    id: "currency",
    numeric: true,
    disablePadding: false,
    label: "Currency",
  },
];

export default function CollapsibleTable(props: CollapsibleTableProps) {
  const {
    rowData: { data, totalRecords },
  } = props;

  // State to manage the filter, rows data, available filter types, and selected currency
  const [filter, setFilter] = useState<Filter>(INITIAL_FILTER);
  const [rowsData, setRowsData] = useState<StockDataItem[]>(data);
  const [filterTypes, setFilterTypes] = useState<CurrencyTypes | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [totlePage, setTotlePage] = useState<number>(totalRecords);

  /**
 * Fetches available filter types and currencies from the backend.
 * Sets the filter types state with the response data.
 */
  const fetchType = async ()=>{
     try {
      const response = await axiosInstance.get("/data-import/getAvailableTypesAndCurrencies");
      setFilterTypes(response.data || []);
    } catch (error) {
      console.log("Error while Fetch Type",error)
    }
  }


      useEffect(()=>{
        setRowsData(data)
        setTotlePage(totalRecords)
      }, [data,totalRecords])

  /**
 * Effect hook to fetch filter types when the component mounts.
 */
  useEffect(()=>{
    fetchType()
  },[])

  /**
 * Fetches data from the backend based on the current filter parameters.
 * 
 * @param fpage - The current page number.
 * @param fpageSize - The number of items per page.
 * @param fsearchQuery - The search query string.
 * @param fsortBy - The property to sort by.
 * @param fsortOrder - The order in which to sort (asc/desc).
 */
  const fetchData = async (fpage: number, fpageSize: number, fsearchQuery?: string | null, fsortBy?: string, fsortOrder?: string) => {
    try {
      const response = await axiosInstance.get("/data-import", {
        params: { page: fpage, pageSize: fpageSize, searchQuery: fsearchQuery, sortBy: fsortBy, sortOrder: fsortOrder },
      });
     
      setRowsData(response?.data?.data || []);
      setTotlePage(response?.data?.totalRecords)
    } catch (error) {
      console.log("Erroe While Facing Data",error)
    }
  };

  /**
 * Handles page change event in the pagination component.
 * Fetches the new page's data.
 * 
 * @param event - The mouse event triggering the page change.
 * @param newPage - The new page number.
 */
  const handleChangePage = (event: React.MouseEvent | null, newPage: number) => {
    const adjustedPage = newPage + 1
    fetchData(adjustedPage, filter.pageSize, filter.searchQuery, filter.sortBy, filter.sortOrder);
    setFilter((prev) => ({ ...prev, page: adjustedPage }));
  };

  /**
 * Handles changes in the rows per page selector.
 * Fetches the new data with the updated page size.
 * 
 * @param event - The change event from the rows per page selector.
 */
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    fetchData(1, parseInt(event.target.value, 10), filter.searchQuery, filter.sortBy, filter.sortOrder);
    setFilter((prev) => ({ ...prev, page: 1, pageSize: parseInt(event.target.value, 10) }));
  };

  /**
 * Creates a sort handler for the specified property.
 * Toggles the sort order between ascending and descending.
 * 
 * @param property - The property to sort by.
 */
  const createSortHandler = (property: string) => () => {
    const isAsc = filter.sortBy === property && filter.sortOrder === "asc";
    const newOrder = isAsc ? "desc" : "asc";

    fetchData(filter.page, filter.pageSize, filter.searchQuery, property, newOrder);
    setFilter((prev) => ({ ...prev, sortBy: property, sortOrder: newOrder }));
  };

  /**
 * Debounced function to fetch data based on the search query.
 * 
 * @param searchValue - The search query string entered by the user.
 */
  const debouncedFetch = useMemo(() => debounce((searchValue: string) => {
    setFilter((prev) => ({ ...prev, searchQuery: searchValue }));
    fetchData(filter.page, filter.pageSize, searchValue, filter.sortBy, filter.sortOrder);
  }, 1000), []);

  /**
 * Handles the search input change event.
 * Initiates debounced fetch to update the data based on the search query.
 * 
 * @param event - The change event from the search input.
 */
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
   
    const searchValue = event.target.value;
    debouncedFetch(searchValue);
  };
  
  /**
 * Handles changes in the selected currency from the dropdown.
 * Fetches the data based on the selected currency.
 * 
 * @param event - The change event from the currency dropdown.
 */
  const handleChangeCurrency = (event: SelectChangeEvent) => {
    const currency = event.target.value as string;
    setSelectedCurrency(currency);
    setFilter((prev) => ({ ...prev, searchQuery: currency }));
    fetchData(filter.page, filter.pageSize, currency, filter.sortBy, filter.sortOrder);
  };

return (
<div className="flex flex-col gap-3 p-4">
    <h5 className="text-lg font-bold flex justify-center">Stockes Analysis</h5>
    <Grid container>
      <Suspense fallback={<Loader />}>
        <LineChart data={rowsData} />
      </Suspense>
    </Grid>

    <div className="w-[100%] flex justify-end">
      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="currency-select-label">Currency</InputLabel>
        <Select
          labelId="currency-select-label"
          id="currency-select"
          value={selectedCurrency}
          onChange={handleChangeCurrency}
          label={"Currency Filter"}
          className="w-[200px]"
        >
          {filterTypes?.currencies?.map((currency, index) => (
            <MenuItem value={currency} key={index}>
              {currency}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>

    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell className="w-[20%] min-w-[200px]">
              <TextField
                label="Search Data"
                placeholder="Search Data"
                onChange={handleSearch}
              />
            </TableCell>
            {headCells?.map((headCell) => (
              <TableCell
                align="center"
                key={headCell.id}
                sortDirection={
                  filter.sortBy === headCell.id
                    ? (filter.sortOrder as "asc" | "desc")
                    : undefined
                }
              >
                <TableSortLabel
                  active={filter.sortBy === headCell.id}
                  direction={
                    filter.sortBy === headCell.id
                      ? (filter.sortOrder as "asc" | "desc")
                      : "asc"
                  }
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rowsData?.length > 0 ? (
            rowsData?.map((row, index) => (
              <Suspense
                key={index}
                fallback={
                  <TableRow>
                    <TableCell colSpan={headCells.length}>
                      Loading row
                    </TableCell>
                  </TableRow>
                }
              >
                <Row row={row} />
              </Suspense>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={headCells.length}>No Data</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

    {totlePage > 0 && (
      <TablePagination
        rowsPerPageOptions={[10, 50, 100, 200]}
        component="div"
        count={totlePage}
        rowsPerPage={filter.pageSize}
        page={filter.page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    )}
  </div>
);
}
