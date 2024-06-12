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
import { useState, ChangeEvent, useEffect } from "react";
import Filters from "./filters";
import { useNavigate } from "react-router-dom";
import * as React from "react";

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
    minPrice: 0,
    maxPrice: 100000,
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

  const handleSearch = () => {
    const searchObject: SearchObject = {
      ...filters,
      query: searchInput,
      sort: sortBy,
    };
    console.log("Search Object:", searchObject);
    onSearch();
    // API CALL HERE???
  };
  useEffect(() => {
    if (sortBy !== "") {
      handleSearch();
    }
  }, [sortBy]);

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
        {isSmallPage ? (
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
        ) : (
          <></>
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
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
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
