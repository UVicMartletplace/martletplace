import {
  Grid,
  Box,
  Typography,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  InputLabel,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material";
import { useStyles } from "../styles/pageStyles";
import ListingCard, { ListingObject } from "../components/listingCard.tsx";
import { useState, useEffect, useRef } from "react";
import * as React from "react";
import _axios_instance from "../_axios_instance.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "../components/searchBar.tsx";
import Spinner from "../components/Spinner.tsx";
import listingCharityFlair from "../images/large-banner.png";
import listingCharityFlairSm from "../images/listing-charity-flair-small.png";

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

const Homepage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const screenWidth = window.innerWidth;

  // Listings per page
  const [listingObjects, setListingObjects] = useState<ListingObject[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [sortBy, setSortBy] = React.useState<string>("RELEVANCE");
  const [totalItems, setTotalItems] = useState(0);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [charityEvent, setCharityEvent] = useState("");
  const [searchObject, setSearchObject] = useState<SearchObject>({
    query: "",
    minPrice: null,
    maxPrice: null,
    status: "AVAILABLE",
    searchType: "LISTINGS",
    latitude: 48.463302,
    longitude: -123.3108,
    sort: "RELEVANCE",
    page: 1,
    limit: 8,
  });
  const initialRender = useRef(true);
  const location = useLocation();

  const handleSortBy = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value as string);
    navigate(
      `/query=${searchObject.query}&minPrice=${searchObject.minPrice}&maxPrice=${searchObject.maxPrice}&status=${searchObject.status}&searchType=${searchObject.searchType}&latitude=${searchObject.latitude}&longitude=${searchObject.longitude}&sort=${event.target.value}&page=${searchObject.page}&limit=${searchObject.limit}`
    );
    setSearchObject({ ...searchObject, sort: event.target.value });
  };

  // Calculate the total number of pages
  const [totalPages, setTotalPages] = useState(0);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    currentPage: number
  ) => {
    setCurrentPage(currentPage);
    navigate(
      `/query=${searchObject.query}&minPrice=${searchObject.minPrice}&maxPrice=${searchObject.maxPrice}&status=${searchObject.status}&searchType=${searchObject.searchType}&latitude=${searchObject.latitude}&longitude=${searchObject.longitude}&sort=${searchObject.sort}&page=${currentPage}&limit=${searchObject.limit}`
    );
    setSearchObject({ ...searchObject, page: currentPage });
  };

  const handleSearch = (searchObject: SearchObject) => {
    setSearchCompleted(false);
    setSearchObject(searchObject);
    _axios_instance
      .get("/search", { params: { ...searchObject } })
      .then((response) => {
        setListingObjects(response.data.items);
        setTotalPages(Math.ceil(response.data.totalItems / 8));
        setTotalItems(response.data.totalItems);
      })
      .catch((error) => {
        console.error("Error fetching listings:", error);
      });
    setSearchPerformed(true);
    setSearchCompleted(true);
  };

  useEffect(() => {
    //called on page load
    if (initialRender.current) {
      initialRender.current = false;
      if (location.pathname === "/") {
        // nothing is being searched
        _axios_instance
          .get("/recommendations", { params: { page: 1, limit: 24 } })
          .then((response) => {
            setListingObjects(response.data);
          })
          .catch((error) => {
            console.error("Error fetching listings:", error);
          });
        setSearchPerformed(false);
        _axios_instance
          .get("/charities/current")
          .then((response) => {
            setCharityEvent(response.data.name);
          })
          .catch((error) => {
            console.error("Error getting charity event:", error);
          });
      }
    } else {
      console.log("searching");
      console.log(location);
      let match;
      const regex = /([^&=]+)=([^&]*)/g;
      const searchString = location.search.slice(1);
      while ((match = regex.exec(searchString)) !== null) {
        const key = decodeURIComponent(match[1]); // Decode key
        const value = decodeURIComponent(match[2]); // Decode value

        // Assign key-value pair to searchObject based on the key
        switch (key) {
          case "query":
            searchObject.query = value;
            break;
          case "minPrice":
            searchObject.minPrice = isNaN(+value) ? null : +value;
            if (value === "") searchObject.minPrice = null;
            break;
          case "maxPrice":
            searchObject.maxPrice = isNaN(+value) ? null : +value;
            if (value === "") searchObject.maxPrice = null;
            break;
          case "status":
            searchObject.status = value;
            break;
          case "searchType":
            searchObject.searchType = value;
            break;
          case "latitude":
            searchObject.latitude = +value;
            break;
          case "longitude":
            searchObject.longitude = +value;
            break;
          case "sort":
            searchObject.sort = value;
            break;
          case "page":
            searchObject.page = +value;
            break;
          case "limit":
            searchObject.limit = +value;
            break;
          default:
            break;
        }
      }
      setSearchObject(searchObject);
      handleSearch(searchObject);
    }
  }, [location]);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <>
      {charityEvent != "" && (
        <Paper
          sx={{
            overflow: "hidden",
            position: "relative",
            top: -10,
            "&:hover": { cursor: "pointer" },
            height: "80px",
          }}
          onClick={() => {
            navigate("/charities");
          }}
        >
          <Box
            sx={{
              zIndex: 2,
              position: "absolute",
              top: 10,
              left: 2,
              width: "100%",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                textShadow: "inherit",
                color: "inherit",
                fontWeight: "bold",
                height: "23px",
                paddingLeft: "14px",
              }}
            >
              Charity
            </Typography>
            <Box
              sx={{
                display: "flex",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  textShadow: "inherit",
                  color: "inherit",
                  fontWeight: "bold",
                  paddingLeft: "14px",
                }}
              >
                Events:
              </Typography>
              <Typography
                variant="h5"
                sx={{ textShadow: "inherit", color: "inherit", paddingLeft: 1 }}
              >
                {charityEvent}
              </Typography>
            </Box>
          </Box>
          <Box
            id="image1"
            sx={{
              zIndex: 1,
              position: "relative",
              width: "100%",
              overflow: "visible",
            }}
          >
            <img
              src={
                screenWidth > 768 ? listingCharityFlair : listingCharityFlairSm
              }
              alt="Charity Flair"
              style={{
                height: "100%",
                float: "right",
              }}
            />
          </Box>
        </Paper>
      )}
      <SearchBar />
      <Box sx={classes.HomePageBox}>
        {searchPerformed ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
          >
            <Typography
              variant="h5"
              component="h3"
              gutterBottom
              sx={{ margin: "10px" }}
            >
              Results ({totalItems})
            </Typography>
            <FormControl sx={{ minWidth: "25%" }}>
              <InputLabel sx={{ background: "white" }}>Sort By</InputLabel>
              <Select value={sortBy} onChange={handleSortBy}>
                <MenuItem value={"RELEVANCE"}>Relevance</MenuItem>
                <MenuItem value={"PRICE_ASC"}>Price Ascending</MenuItem>
                <MenuItem value={"PRICE_DESC"}>Price Descending</MenuItem>
                <MenuItem value={"LISTED_TIME_ASC"}>
                  Listed Time Ascending
                </MenuItem>
                <MenuItem value={"LISTED_TIME_DESC"}>
                  Listed Time Descending
                </MenuItem>
                <MenuItem value={"DISTANCE_ASC"}>Distance Ascending</MenuItem>
                <MenuItem value={"DISTANCE_DESC"}>Distance Descending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                borderBottom: "1px solid #808080",
              }}
            >
              <Typography variant="h6" component="h3" gutterBottom>
                Welcome!
              </Typography>
            </Box>
            <Typography variant="h5" component="h3" gutterBottom>
              Recommended for you
            </Typography>
          </>
        )}
        {!searchCompleted && listingObjects.length === 0 && (
          <Spinner text="Loading listings..." />
        )}
        {searchCompleted && listingObjects.length === 0 && (
          <Typography variant="h6" component="h3" gutterBottom>
            No Results Found
          </Typography>
        )}
        <Grid
          container
          direction="row"
          spacing={4}
          key="grid-listings"
          justifyContent="center"
          alignContent="flex-end"
          sx={{
            gap: 8,
            paddingTop: "40px",
            paddingLeft: isDesktop ? "0px" : "20px",
          }}
        >
          {Array.isArray(listingObjects) &&
            listingObjects.map((listing: ListingObject) => (
              <ListingCard
                key={listing.listingID}
                searchPerformed={searchPerformed}
                listing={listing}
              />
            ))}
        </Grid>
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
        >
          <Pagination
            count={totalPages}
            shape="rounded"
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
      </Box>
    </>
  );
};

export default Homepage;
