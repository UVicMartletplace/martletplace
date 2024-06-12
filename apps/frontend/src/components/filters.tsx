import {
  Grid,
  Button,
  Box,
  FormControl,
  OutlinedInput,
  InputAdornment,
  MenuItem,
  SelectChangeEvent,
  Select,
  Typography,
  FormHelperText,
  useMediaQuery,
} from "@mui/material";
import { useStyles } from "../styles/pageStyles";
import * as React from "react";
import { colors } from "../styles/colors";
import { ChangeEvent } from "react";

interface SearchObject {
  query: string;
  minPrice: number;
  maxPrice: number;
  status: string;
  searchType: string;
  latitude: number;
  longitude: number;
  sort: string;
  page: number;
  limit: number;
}

interface FiltersProps {
  onFilterChange: (filters: Partial<SearchObject>) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const classes = useStyles();

  const [minPrice, setMinPrice] = React.useState<number | "">("");
  const [maxPrice, setMaxPrice] = React.useState<number | "">("");
  const [status, setStatus] = React.useState<string>("");
  const [type, setType] = React.useState<string>("LISTING");

  const handleMinPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMinPrice(
      event.target.value === "" ? "" : parseFloat(event.target.value)
    );
  };

  const handleMaxPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(
      event.target.value === "" ? "" : parseFloat(event.target.value)
    );
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value);
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setType(event.target.value);
  };

  const handleApplyFilters = () => {
    // Pass the current filter values to the parent component only when "Apply Filters" button is clicked
    onFilterChange({
      minPrice: minPrice === "" ? undefined : minPrice,
      maxPrice: maxPrice === "" ? undefined : maxPrice,
      status,
      searchType: type,
    });
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setStatus("");
    setType("LISTING");
    onFilterChange({
      minPrice: undefined,
      maxPrice: undefined,
      status: "",
      searchType: "",
    });
  };

  const isDesktop = useMediaQuery("(min-width:850px)");

  return (
    <Grid container xs={isDesktop ? 5 : 10}>
      <Typography variant="h6" component="h3" m={1}>
        Filters
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <FormControl fullWidth sx={{ m: 1 }}>
          <FormHelperText>Min</FormHelperText>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            placeholder="Min"
            value={minPrice}
            onChange={handleMinPriceChange}
            type="number"
          />
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <FormHelperText>Max</FormHelperText>
          <OutlinedInput
            id="outlined-adornment-amount"
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            placeholder="Max"
            value={maxPrice}
            onChange={handleMaxPriceChange}
            type="number"
          />
        </FormControl>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <FormControl fullWidth sx={{ m: 1 }}>
          <FormHelperText>Status</FormHelperText>
          <Select
            value={status}
            onChange={handleStatusChange}
            displayEmpty
            id="status-select"
          >
            <MenuItem disabled value="">
              <em>Status</em>
            </MenuItem>
            <MenuItem value={"AVAILABLE"}>Available</MenuItem>
            <MenuItem value={"SOLD"}>Not Available</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ m: 1 }}>
          <FormHelperText>Type</FormHelperText>
          <Select
            value={type}
            onChange={handleTypeChange}
            displayEmpty
            id="type-select"
          >
            <MenuItem value={"LISTING"}>Listing</MenuItem>
            <MenuItem value={"USER"}>User</MenuItem>
          </Select>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            m: 1,
            backgroundColor: colors.martletplaceNavyBlue,
            "&:hover": { backgroundColor: colors.martletplaceBlueHover },
            textTransform: "none",
            fontSize: "16px",
            padding: "13px 0",
            align: "center",
            margin: "22px 0px 0px 0px",
            width: "100%",
          }}
        >
          Update Location
        </Button>
      </Box>

      <Box
        sx={{
          width: "60%",
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          marginBottom: "2vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          type="submit"
          variant="contained"
          sx={classes.button}
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
        <Button
          type="submit"
          variant="contained"
          sx={classes.buttonOutline}
          onClick={handleClearFilters}
        >
          Clear Filter
        </Button>
      </Box>
    </Grid>
  );
};

export default Filters;
