import { StockDataItem } from '@app/types/stockData';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { isEmpty } from "lodash";
import { Fragment, useCallback, useMemo, useState } from "react";



/**
 * Renders a row in a table, including an expandable section to show additional metadata.
 * The row can be expanded/collapsed based on whether metadata exists.
 * 
 * @param props - The row data passed to the component.
 * @param props.row - The row data object containing information to display.
 */
export default function Row(props: { row: StockDataItem }) {
  const { row } = props;
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const metadata = row.metadata;
  const keys = useMemo(() => Object.keys(metadata), [metadata]);
  const isMetaEmpty = isEmpty(metadata);

    /**
   * Handles the click event on the row to toggle the expanded state
   * and load metadata if it's not already loaded.
   */
  const handleRowClick = useCallback(() => {
    if (!isMetaEmpty) {
      setOpen((prevOpen) => !prevOpen);
      if (!loaded) setLoaded(true);
    }
  }, [isMetaEmpty, loaded]);

  return (
    <Fragment>
      <TableRow 
        sx={{ "& > *": { borderBottom: "unset" } }}  
        onClick={handleRowClick}
      >
        <TableCell className="cursor-pointer">
          {!isMetaEmpty && 
            <IconButton aria-label="expand row" size="small" onClick={handleRowClick}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          }
        </TableCell>
        <TableCell component="th" scope="row" align="center">
          {row.id}
        </TableCell>
        <TableCell align="center">{row.symbol}</TableCell>
        <TableCell align="center">{row.source}</TableCell>
        <TableCell align="center">{row.type}</TableCell>
        <TableCell align="center">{row.currency}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          {!isMetaEmpty && 
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Additional Data
                </Typography>
                <TableContainer style={{ maxHeight: 200 }}>
                  <Table size="small" aria-label="metadata table" className="max-h-48 overflow-auto">
                    <TableHead>
                      <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loaded && keys.map((key, index) => {
                        const value = typeof metadata[key] === "object" 
                          ? JSON.stringify(metadata[key]) 
                          : metadata[key] || "N/A";
                        return (
                          <TableRow key={index}>
                            <TableCell>{key}</TableCell>
                            <TableCell>{value as string}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Collapse>
          }
        </TableCell>
      </TableRow>
    </Fragment>
  );
}
