import {
  Grid,
  Button,
  TextField,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import martletPlaceLogo from "../images/martletplace-logo.png";
import message from "../images/message.png";
import filter from "../images/filter.png";
import { useStyles } from "../styles/pageStyles";
import { useState, ChangeEvent, useEffect, useCallback } from "react";
import Filters from "./filters";
import { useNavigate } from "react-router-dom";
import * as React from "react";

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

interface SearchBarProps {
  onSearch: () => void;
  sortBy: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, sortBy }) => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<SearchObject>({
    query: "",
    minPrice: null,
    maxPrice: null,
    status: "AVAILABLE",
    searchType: "LISTING",
    latitude: 0,
    longitude: 0,
    sort: "RELEVANCE",
    page: 1,
    limit: 20,
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleFilterChange = (newFilters: Partial<SearchObject>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const handleSearch = useCallback(() => {
    const searchObject: SearchObject = {
      ...filters,
      query: searchInput,
      sort: sortBy,
    };
    console.log("Search Object:", searchObject);
    onSearch();
    // API CALL HERE???
  }, [filters, searchInput, sortBy, onSearch]);

  useEffect(() => {
    if (sortBy !== "") {
      handleSearch();
    }
  }, [sortBy, handleSearch]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleMessageRoute = () => {
    navigate("/messages");
  };

  const handleAccountRoute = () => {
    navigate("/user");
  };

  const handleReload = () => {
    navigate("/");
    window.location.reload();
  };

  const handleListingRoute = () => {
    navigate("/listing/view");
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isDesktop = useMediaQuery("(min-width:1240px)");
  const isSmallPage = useMediaQuery("(min-width:740px)");

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{
        backgroundColor: "#f5f5f5",
        boxShadow: "0px 4px 6px #808080",
        paddingBottom: "10px",
      }}
    >
      <Grid item>
        {isSmallPage && (
          <Button
            variant="contained"
            sx={classes.homepageButton}
            onClick={handleReload}
          >
            <img
              src={martletPlaceLogo}
              alt="MartletPlace Logo"
              style={{ width: "60px", marginBottom: "9px" }}
            />
            MartletPlace
          </Button>
        )}
      </Grid>
      <Grid item xs={6}>
        <TextField
          id="outlined-basic"
          placeholder="Search"
          variant="outlined"
          fullWidth
          sx={classes.searchBar}
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={handleKeyDown}
        />
      </Grid>
      <Grid item>
        <Button
          type="submit"
          variant="contained"
          sx={{
            ...classes.button,
            ...classes.whiteButton,
            backgroundColor: showFilters ? "#808080" : "white",
          }}
          onClick={toggleFilters}
        >
          <img src={filter} alt="Filter Icon" style={{ width: "45%" }} />
        </Button>
      </Grid>
      {isDesktop ? (
        <>
          <Grid item xs={1}>
            <Button
              type="submit"
              variant="contained"
              sx={{ ...classes.button, ...classes.yellowButton }}
              onClick={handleSearch}
            >
              Search
            </Button>
          </Grid>
          <Grid item xs={0.3} />
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              sx={classes.button}
              onClick={handleMessageRoute}
            >
              <img src={message} alt="Message Icon" style={{ width: "45%" }} />
            </Button>
          </Grid>
          <Grid item xs={1}>
            <Button
              type="submit"
              variant="contained"
              sx={classes.button}
              onClick={handleAccountRoute}
            >
              Account
            </Button>
          </Grid>
        </>
      ) : (
        <>
          {/* Hamburger button */}
          <Grid item xs={1}>
            <Button
              onClick={handleClick}
              size="medium"
              sx={{
                ...classes.button,
                fontSize: "40px",
                maxHeight: "50px",
                marginTop: "8px",
                color: "white",
              }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              =
            </Button>
          </Grid>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleAccountRoute}>My Profile</MenuItem>
            <MenuItem onClick={handleListingRoute}>My Listing</MenuItem>
            <MenuItem onClick={handleMessageRoute}>Messaging</MenuItem>
          </Menu>
        </>
      )}

      {showFilters && <Filters onFilterChange={handleFilterChange} />}
    </Grid>
  );
};

export default SearchBar;
