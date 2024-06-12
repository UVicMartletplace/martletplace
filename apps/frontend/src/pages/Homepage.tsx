import {
  Grid,
  Box,
  Typography,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
} from "@mui/material";
import { useStyles } from "../styles/pageStyles";
import SearchBar from "../components/searchBar.tsx";
import ListingCard from "../components/listingCard.tsx";
import { useState, useEffect } from "react";
import * as React from "react";

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

const Homepage = () => {
  const classes = useStyles();

  // Listings per page
  const listingsPerPage = 6;

  const [listingObjects, setListingObjects] = useState<ListingObject[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [sortBy, setSortBy] = React.useState<string>(""); // Add this state

  const handleSortBy = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value as string);
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(listingObjects.length / listingsPerPage);

  // Get the listings for the current page
  const displayedListings = listingObjects.slice(
    (currentPage - 1) * listingsPerPage,
    currentPage * listingsPerPage
  );

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    //FETCH API DATA??
    // UPDATE LISTING OBJECTS
    setSearchPerformed(true);
  };

  const fetchListings = async () => {
    setListingObjects([
      {
        listingID: "A23F29039B23",
        sellerID: "A23F29039B23",
        sellerName: "Amy Santiago",
        title: "Used Calculus Textbook",
        description: "No wear and tear, drop-off available.",
        price: 50,
        dateCreated: "2024-05-23T15:30:00Z",
        imageUrl: "https://picsum.photos/200/300",
      },
      {
        listingID: "B34G67039C24",
        sellerID: "B34G67039C24",
        sellerName: "Jake Peralta",
        title: "Advanced Physics Textbook",
        description: "Slightly worn, no markings inside.",
        price: 60,
        dateCreated: "2024-04-15T14:30:00Z",
        imageUrl: "https://picsum.photos/200/301",
      },
      {
        listingID: "C45H89049D25",
        sellerID: "C45H89049D25",
        sellerName: "Rosa Diaz",
        title: "Organic Chemistry Textbook",
        description: "Brand new, still in original packaging.",
        price: 70,
        dateCreated: "2024-03-20T13:30:00Z",
        imageUrl: "https://picsum.photos/200/302",
      },
      {
        listingID: "D56I90159E26",
        sellerID: "D56I90159E26",
        sellerName: "Terry Jeffords",
        title: "Microeconomics Textbook",
        description: "Like new, hardly used.",
        price: 65,
        dateCreated: "2024-02-10T12:30:00Z",
        imageUrl: "https://picsum.photos/200/303",
      },
      {
        listingID: "E67J01269F27",
        sellerID: "E67J01269F27",
        sellerName: "Gina Linetti",
        title: "Introduction to Psychology",
        description: "A few highlights, otherwise perfect.",
        price: 55,
        dateCreated: "2024-01-05T11:30:00Z",
        imageUrl: "https://picsum.photos/200/304",
      },
      {
        listingID: "F78K12379G28",
        sellerID: "F78K12379G28",
        sellerName: "Charles Boyle",
        title: "Anthropology 101 Textbook",
        description: "Some dog-eared pages, but very usable.",
        price: 45,
        dateCreated: "2023-12-15T10:30:00Z",
        imageUrl: "https://picsum.photos/200/305",
      },
      {
        listingID: "G89L23489H29",
        sellerID: "G89L23489H29",
        sellerName: "Hitchcock",
        title: "World History Textbook",
        description: "Good condition, minimal notes inside.",
        price: 50,
        dateCreated: "2023-11-20T09:30:00Z",
        imageUrl: "https://picsum.photos/200/306",
      },
      {
        listingID: "H90M34599I30",
        sellerID: "H90M34599I30",
        sellerName: "Scully",
        title: "Basic Algebra Textbook",
        description: "Cover slightly damaged, content intact.",
        price: 40,
        dateCreated: "2023-10-18T08:30:00Z",
        imageUrl: "https://picsum.photos/200/307",
      },
    ]);
  };

  useEffect(() => {
    fetchListings();
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
            Results ({listingObjects.length})
          </Typography>
          <FormControl sx={{ minWidth: "20vw" }}>
            <Select onChange={handleSortBy} displayEmpty>
              <FormHelperText>Sort By</FormHelperText>
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
              fontSize: "1.3em",
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
        {displayedListings.map((listing) => (
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
