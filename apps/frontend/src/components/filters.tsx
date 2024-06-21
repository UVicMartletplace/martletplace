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
import { useState, ChangeEvent, useEffect } from "react";
import { colors } from "../styles/colors";

interface SearchObject {
  query: string;
  minPrice: number | null;
  maxPrice: number | null;
  status: string;
  searchType: string;
  latitude: number;
  longitude: number;
  sort: string;
  page: number;
  limit: number;
}

interface FiltersProps {
  filters: SearchObject;
  onFilterChange: (filters: Partial<SearchObject>) => void;
}

const Filters = ({ filters, onFilterChange }: FiltersProps) => {
  const classes = useStyles();

  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("LISTING");
  const [latitude, setLatitude] = useState<number>(48.463302);
  const [longitude, setLongitude] = useState<number>(-123.3108);

  const handleMinPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMinPrice(
      event.target.value === "" ? null : parseFloat(event.target.value),
    );
  };

  const handleMaxPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(
      event.target.value === "" ? null : parseFloat(event.target.value),
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
      minPrice: minPrice,
      maxPrice: maxPrice,
      status: status,
      searchType: type,
      latitude: latitude,
      longitude: longitude,
    });
  };

  const handleClearFilters = () => {
    setMinPrice(null);
    setMaxPrice(null);
    setStatus("");
    setType("LISTING");
    onFilterChange({
      minPrice: null,
      maxPrice: null,
      status: "",
      searchType: "",
      latitude: 48.463302,
      longitude: -123.3108,
    });
  };

  // Gets the user location, returns false on failure, defaults to uvic
  const getLocation = () => {
    try {
      navigator.geolocation.getCurrentPosition((position) => {
        const currentLatitude = position.coords.latitude;
        const currentLongitude = position.coords.longitude;
        if (currentLatitude !== 0 && currentLongitude !== 0) {
          setLatitude(currentLatitude);
          setLongitude(currentLongitude);
          handleApplyFilters();
          return true;
        }
      });
      return false;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
    setStatus(filters.status);
    setType(filters.searchType);
    setLatitude(filters.latitude);
    setLongitude(filters.longitude);
  }, [filters]);

  const isDesktop = useMediaQuery("(min-width:850px)");

  return (
    <Grid item container xs={isDesktop ? 5 : 10}>
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
            value={minPrice !== null ? minPrice : ""}
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
            value={maxPrice !== null ? maxPrice : ""}
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
          onClick={getLocation}
          sx={{
            m: 1,
            backgroundColor: colors.martletplaceNavyBlue,
            "&:hover": { backgroundColor: colors.martletplaceBlueHover },
            textTransform: "none",
            fontSize: "16px",
            padding: "13px 0",
            align: "center",
            marginTop: "30px",
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
          marginBottom: "15px",
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
