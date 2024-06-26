import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";
import ListingCard, { ListingObject } from "../components/listingCard";
import { useState, useEffect } from "react";
import SearchBar from "../components/searchBar";
import _axios_instance from "../_axios_instance";

interface ImageUrls {
  url: string;
}

interface MyListing {
  listingID: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: string;
  dateCreated: string;
  dateModified: string;
  images: ImageUrls[];
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
            imageUrl: listing.images.length > 0 ? listing.images[0].url : "",
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
        textAlign: "center",
      }}
    >
      {isDesktop ? (
        <AccountSidebar selectedItem="My Listings" />
      ) : (
        <SearchBar />
      )}
      <Box sx={{ paddingLeft: isDesktop ? "250px" : "0" }}>
        <Typography variant="h4" sx={{ marginTop: 2 }}>
          My Listings
        </Typography>
        <Grid
          container
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{ width: "100%", maxWidth: "1000px" }}
        >
          {listingObjects.map((listing) => (
            <Grid item xs={12} sm={6} md={4} key={listing.listingID}>
              <ListingCard
                searchPerformed={false}
                listing={listing}
                canEdit={true}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default MyListings;
