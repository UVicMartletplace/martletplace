import { Grid, Button, Typography } from "@mui/material";
import PropTypes from "prop-types";

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

interface ListingCardProps {
  listing: ListingObject;
}

const priceFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

const convertDate = (dateString: string) => {
  const dateTimeObject = new Date(dateString);
  return dateTimeObject.toDateString();
};

const ListingCard = ({ listing }: ListingCardProps) => {
  return (
    <Grid
      container
      direction="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      spacing={3}
      maxWidth={"29vw"}
      sx={{ margin: "1.5%" }}
    >
      <Grid
        item
        xs={12}
        sx={{
          width: "90%",
          maxHeight: "40vh",
          display: "flex",
          justifyContent: "center",
          alignSelf: "center",
          overflow: "hidden",
          borderRadius: "8px",
        }}
      >
        <img
          src={listing.imageUrl}
          alt={listing.title}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      </Grid>
      <Grid item xs={12} sx={{ width: "100%" }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "white",
            color: "black",
            outline: "1px solid #808080",
            "&:hover": { backgroundColor: "#808080" },
            textTransform: "none",
            width: "calc(100% - 20px)",
          }}
        >
          Not interested
        </Button>
      </Grid>
      <Grid item xs={12} sx={{ width: "100%" }}>
        <Typography variant="body1" gutterBottom>
          {listing.title}
        </Typography>
        <Typography variant="body2" gutterBottom>
          {listing.price !== 0 ? priceFormatter.format(listing.price) : "Free"}
        </Typography>
        <Typography variant="body2" gutterBottom>
          For Sale By: {listing.sellerName}
        </Typography>
        <Typography variant="body2" gutterBottom sx={{ color: "#616161" }}>
          Posted: {convertDate(listing.dateCreated)}
        </Typography>
      </Grid>
    </Grid>
  );
};

ListingCard.propTypes = {
  listing: PropTypes.shape({
    listingID: PropTypes.string.isRequired,
    sellerID: PropTypes.string.isRequired,
    sellerName: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    dateCreated: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
  }).isRequired,
};

export default ListingCard;
