import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import {useEffect, useState} from "react";
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
                <Box sx={{borderRadius: "20px", overflow: "hidden"}}> <svg  id="visual" viewBox="0 0 1080 100" width="100%" xmlns="http://www.w3.org/2000/svg" version="1.1">
                  <text x="5" y="15" fill="black">{currentCharity?.name}</text>
                  <path
                    d="M849 100L853.8 94.5C858.7 89 868.3 78 871.3 66.8C874.3 55.7 870.7 44.3 866.3 33.2C862 22 857 11 854.5 5.5L852 0L1080 0L1080 5.5C1080 11 1080 22 1080 33.2C1080 44.3 1080 55.7 1080 66.8C1080 78 1080 89 1080 94.5L1080 100Z"
                    fill="#ffb32e"></path>
                  <path
                    d="M959 100L953.5 94.5C948 89 937 78 941.7 66.8C946.3 55.7 966.7 44.3 968.2 33.2C969.7 22 952.3 11 943.7 5.5L935 0L1080 0L1080 5.5C1080 11 1080 22 1080 33.2C1080 44.3 1080 55.7 1080 66.8C1080 78 1080 89 1080 94.5L1080 100Z"
                    fill="#001647"></path>
                </svg></Box> ) : ""}
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
