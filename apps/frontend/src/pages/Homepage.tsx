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
} from "@mui/material";
import { useStyles } from "../styles/pageStyles";
import SearchBar from "../components/searchBar.tsx";
import ListingCard from "../components/listingCard.tsx";
import { useState, useEffect, useRef } from "react";
import * as React from "react";
import _axios_instance from "../_axios_instance.tsx";

interface ListingObject {
  listingID: string;
  sellerID: string;
  sellerName: string;
  title: string;
  description: string;
  price: number;
  dateCreated: string;
  imageUrl: string;
}

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

  // Listings per page
  const [listingObjects, setListingObjects] = useState<ListingObject[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [sortBy, setSortBy] = React.useState<string>("RELEVANCE");
  const [totalItems, setTotalItems] = useState(0);
  const [searchObject, setSearchObject] = useState<SearchObject>({
    query: "",
    minPrice: null,
    maxPrice: null,
    status: "AVAILABLE",
    searchType: "LISTING",
    latitude: 0,
    longitude: 0,
    sort: "RELEVANCE",
    page: 1,
    limit: 6,
  });
  const initialRender = useRef(true);

  const handleSortBy = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value as string);
  };

  // Calculate the total number of pages
  const [totalPages, setTotalPages] = useState(10);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    currentPage: number
  ) => {
    setCurrentPage(currentPage);
    console.log("Page:", currentPage);
    const tempSearchObejct = { ...searchObject, page: currentPage };
    handleSearch(tempSearchObejct);
  };

  const handleSearch = (searchObject: SearchObject) => {
    setSearchObject(searchObject);
    console.log("Search Object:", searchObject);
    _axios_instance
      .get("/search", { params: { searchObject } })
      .then((response) => {
        setListingObjects(response.data.listings);
        setTotalPages(Math.ceil(response.data.totalListings / 6));
        setTotalItems(response.data.totalListings);
      })
      .catch((error) => {
        console.error("Error fetching listings:", error);
      });
    setSearchPerformed(true);
  };

  useEffect(() => {
    //called on page load
    if (initialRender.current) {
      initialRender.current = false;
      console.log("Fetching Recomendations...");
      _axios_instance
        .get("/recomendations", { params: { page: 1, limit: 24 } })
        .then((response) => {
          setListingObjects(response.data);
        })
        .catch((error) => {
          console.error("Error fetching listings:", error);
        });
      setSearchPerformed(false);
    }
  }, []);

  return (
    <Box sx={classes.HomePageBox}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backgroundColor: "white",
          padding: "10px 0",
        }}
      >
        <SearchBar onSearch={handleSearch} sortBy={sortBy} />
      </Box>
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
      <Grid
        container
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={0}
        key="grid-listings"
      >
        {listingObjects.map((listing) => (
          <ListingCard key={listing.listingID} listing={listing} />
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
  );
};

export default Homepage;
