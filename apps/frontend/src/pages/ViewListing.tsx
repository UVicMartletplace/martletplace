import {
  Box,
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
import Spinner from "../components/Spinner.tsx";

interface ListingObject {
  title: string;
  description: string;
  price: number;
  seller_profile: {
    userID: string;
    name: string;
    username: string;
  };
  dateCreated: string;
  distance: number;
  images: { url: string }[];
  reviews?: Review[];
  status: string;
  charityId: string;
}

interface CharityObject {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  organizations: {
    name: string;
    logoUrl: string;
    donated: number;
    receiving: boolean;
  }[];
  funds: number;
  listingsCount: number;
}

const ViewListing = () => {
  const classes = useStyles();

  const user = useUser().user;
  const [listingReceived, setListingReceived] = useState<boolean>(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [listingObject, setListingObject] = useState<ListingObject>({
    title: "Sorry This Listing Cannot Be Loaded",
    description: "Please Try again Later",
    price: 0,
    seller_profile: { name: "John Smith", userID: "", username: "" },
    dateCreated: "2024-05-23T15:30:00Z",
    distance: 0,
    images: [{ url: "https://picsum.photos/1200/400" }],
    status: "AVAILABLE",
    charityId: "1",
  });

  const [currentCharity, setCurrentCharity] = useState<CharityObject>();

  // Load the listing from the api given an ID
  useEffect(() => {
    _axios_instance
      .get("/listing/" + id)
      .then((response) => {
        setListingObject(response.data);
        setListingReceived(true);
        if (response.data.charityId) {
          _axios_instance
            .get("/charities/current")
            .then((response) => {
              setCurrentCharity(response.data);
              setListingReceived(true);
            })
            .catch((error) => {
              console.error(error);
            });
        }
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
    if (user?.userID === listingObject.seller_profile.userID) {
      navigate(`/listing/edit/${id}`);
    } else {
      _axios_instance
        .post("/messages", {
          receiver_id: listingObject.seller_profile.userID,
          listing_id: id,
          content: "Hi I'm messaging about " + listingObject.title,
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
      navigate("/messages");
    }
  };

  if (!id) {
    return <Typography variant="h5">Invalid Listing ID</Typography>;
  }

  return (
    <>
      <SearchBar />
      <Container>
        {!listingReceived ? (
          <Spinner text="While we get your listing..." />
        ) : (
          <Card
            sx={{
              height: "100%",
              width: "100%",
              display: listingReceived ? "block" : "none",
              marginTop: "32px",
            }}
          >
            <CardContent>
              {listingObject.charityId ? (
                <Box
                  sx={{ borderRadius: "20px", overflow: "hidden" }}
                  onClick={() => {
                    navigate("/charities");
                  }}
                >
                  <Typography variant="h6">
                    This Listing Contributes to:
                  </Typography>
                  <Typography variant="h5">{currentCharity?.name}</Typography>
                </Box>
              ) : (
                ""
              )}
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
                    {user?.userID === listingObject.seller_profile.userID
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
              <Reviews listingID={id} reviews={listingObject.reviews ?? []} />
            </CardContent>
          </Card>
        )}
      </Container>
    </>
  );
};
export default ViewListing;
