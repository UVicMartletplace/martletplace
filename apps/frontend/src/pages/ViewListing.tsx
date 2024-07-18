import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
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
import listingCharityFlair from "../images/listing-charity-flair.png";
import listingCharityFlairSm from "../images/listing-charity-flair-small.png";

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
  charityId: string | null | undefined;
}

interface CharityObject {
  name: string;
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
    charityId: null,
  });

  const [currentCharity, setCurrentCharity] = useState<CharityObject>();

  const [screenWidth, setScreenSize] = useState<number>(window.innerWidth);

  // Load the listing from the api given an ID
  useEffect(() => {
    const getListing = async () => {
      try {
        const response = await _axios_instance.get("/listing/" + id);
        setListingObject(response.data);
        setListingReceived(true);
        if (response.data.charityId) {
          try {
            const responseCharity =
              await _axios_instance.get("/charities/current");
            setCurrentCharity(responseCharity.data);
            setListingReceived(true);
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    //Linter is upset if I don't have this
    getListing().then();
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
                <Paper
                  sx={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    position: "relative",
                    "&:hover": { cursor: "pointer" },
                    marginBottom: "20px",
                  }}
                  onClick={() => {
                    navigate("/charities");
                  }}
                >
                  <Box
                    id="text1"
                    sx={{
                      zIndex: 2,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      padding: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ textShadow: "inherit", color: "inherit" }}
                    >
                      This Listing Contributes to:
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ textShadow: "inherit", color: "inherit" }}
                    >
                      {currentCharity?.name}
                    </Typography>
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
                        screenWidth > 768
                          ? listingCharityFlair
                          : listingCharityFlairSm
                      }
                      alt="Charity Flair"
                      style={{
                        height: "100%",
                        float: "right",
                      }}
                    />
                  </Box>
                </Paper>
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
