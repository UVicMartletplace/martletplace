import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import _axios_instance from "../_axios_instance.tsx";
import Carousel from "../listing_components/Carousel.tsx";

const ViewListing = () => {
  const { id } = useParams();
  const [listingObject, setListingObject] = useState({
    title: "Sample Title",
    description: "Sample Description",
    price: 0,
    seller_profile: { name: "John Smith" },
    dateCreated: "2024-05-23T15:30:00Z",
    images: [
      { url: "https://picsum.photos/200/300" },
      { url: "https://picsum.photos/200/400" },
      { url: "https://picsum.photos/200/300" },
      { url: "https://picsum.photos/200/230" },
      { url: "https://picsum.photos/200/100" },
    ],
  });

  useEffect(() => {
    _axios_instance
      .get("/listing/" + id)
      .then((response) => {
        setListingObject(response.data);
        console.log(response);
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

  return (
    <Container>
      <Card sx={{ height: "100%", width: "100%" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item sm={12} md={6}>
              <Typography variant={"h2"}>
                {listingObject !== null
                  ? listingObject.title
                  : "Title not received"}
              </Typography>
              <Typography variant={"body1"}>
                {listingObject.description}
              </Typography>
              <hr />
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
              <Button>Message Seller</Button>
            </Grid>
            <Grid item sm={12} md={6}>
              <Carousel
                imageURLs={listingObject.images.map((image) => image.url)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ViewListing;
