import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";
import ListingCard, { ListingObject } from "../components/listingCard";
import { useState, useEffect } from "react";
import SearchBar from "../components/searchBar";
import _axios_instance from "../_axios_instance";

interface MyListing {
  listingID: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: string;
  dateCreated: string;
  dateModified: string;
  imageUrl: string[];
}

const MyListings = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [listingObjects, setListingObjects] = useState<ListingObject[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await _axios_instance.get("/listings");
        const modifiedListings = response.data.map((listing: MyListing) => {
          return {
            listingID: listing.listingID,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            dateCreated: listing.dateCreated,
            imageUrl: listing.imageUrl.length > 0 ? listing.imageUrl[0] : "",
          };
        });
        setListingObjects(modifiedListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isDesktop ? (
        <AccountSidebar selectedItem="My Listings" />
      ) : (
        <SearchBar />
      )}
      <Typography variant="h4">My Listings</Typography>
      <Grid
        container
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={2}
        key="grid-listings"
        paddingLeft={isDesktop ? "250px" : undefined}
      >
        {listingObjects.map((listing) => (
          <ListingCard
            key={listing.listingID}
            searchPerformed={false}
            listing={listing}
            canEdit={true}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default MyListings;
