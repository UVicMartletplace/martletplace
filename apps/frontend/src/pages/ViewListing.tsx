import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import _axios_instance from "../_axios_instance.tsx";
import Carousel from "../components/Carousel.tsx";
import { useStyles } from "../styles/pageStyles.tsx";
import { colors } from "../styles/colors.tsx";
import SearchBar from "../components/searchBar.tsx";
import Reviews, { Review } from "../components/Reviews.tsx";
import useUser from "../hooks/useUser.ts";

interface ListingObject {
  title: string;
  description: string;
  price: number;
  seller_profile: {
    userID: string;
    name: string;
  };
  dateCreated: string;
  distance: number;
  images: { url: string }[];
  reviews?: Review[];
  status: string;
}

const ViewListing = () => {
  const classes = useStyles();

  const user = useUser().user;
  const [listingReceived, setListingReceived] = useState<boolean>(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [listingObject, setListingObject] = useState<ListingObject>({
    title: "Sorry This Listing Cannot Be Loaded",
    description: "Please Try again Later",
    price: 0,
    seller_profile: { name: "John Smith", userID: "" },
    dateCreated: "2024-05-23T15:30:00Z",
    distance: 0,
    images: [{ url: "https://picsum.photos/1200/400" }],
    status: "AVAILABLE",
  });

  // Load the listing from the api given an ID
  useEffect(() => {
    _axios_instance
      .get("/listing/" + id)
      .then((response) => {
        setListingObject(response.data);
        setListingReceived(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  // Convert price to string
  const priceFormatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  });

  // Convert date to string
  const convertDate = (dateString: string) => {
    const dateTimeObject = new Date(dateString);
    return dateTimeObject.toDateString();
  };

  const handleNavToMessagesAndEdit = () => {
    console.log("User ID", user?.id);
    console.log("Seller ID", listingObject.seller_profile.userID);
    if (user?.id === listingObject.seller_profile.userID) {
      navigate("/listing/edit/${id}");
    } else {
      //TODO Add a path for id
      navigate("/messages");
    }
  };

  return (
    <>
      <SearchBar />
      <Container>
        {!listingReceived ? <Typography>No Listing Received</Typography> : null}
        <Card
          sx={{
            height: "100%",
            width: "100%",
            display: listingReceived ? "block" : "none",
            marginTop: "32px",
          }}
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid item sm={12} md={12} lg={6}>
                <Typography variant={"h5"}>
                  {listingObject?.title ?? "Title not received"}
                </Typography>
                <Typography variant={"body1"}>
                  {listingObject.description}
                </Typography>
                <hr
                  style={{
                    border: "none",
                    height: "1px",
                    backgroundColor: colors.martletplaceGrey,
                  }}
                />
                <Typography variant={"body1"}>
                  Price:{" "}
                  {listingObject.price !== 0
                    ? priceFormatter.format(listingObject.price)
                    : "Free"}
                </Typography>
                <Typography variant={"body1"}>
                  Sold by: {listingObject.seller_profile.name}
                </Typography>
                <Typography variant={"body1"}>
                  Posted on: {convertDate(listingObject.dateCreated)}
                </Typography>
                {listingObject.status === "SOLD" ? (
                  <Typography variant="h1" sx={{ color: "red" }}>
                    SOLD
                  </Typography>
                ) : null}
                <Button
                  type="button"
                  variant="contained"
                  fullWidth
                  sx={classes.button}
                  onClick={handleNavToMessagesAndEdit}
                  id={"message_button"}
                >
                  {user?.id === listingObject.seller_profile.userID
                    ? "Edit Listing"
                    : "Message Seller"}
                </Button>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={6}>
                {listingObject.images.length !== 0 ? (
                  <Carousel
                    imageURLs={listingObject.images.map((image) => image.url)}
                  />
                ) : null}
              </Grid>
            </Grid>
            <Reviews reviews={listingObject.reviews ?? []} />
          </CardContent>
        </Card>
      </Container>
    </>
  );
};
export default ViewListing;