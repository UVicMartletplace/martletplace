import { Grid, Button, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import _axios_instance from "../_axios_instance.tsx";
import { colors } from "../styles/colors.tsx";

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
  searchPerformed: boolean;
  listing: ListingObject;
}

const ListingCard = ({ searchPerformed, listing }: ListingCardProps) => {
  const navigate = useNavigate();
  const [notInterested, setNotInterested] = useState(false);

  const handleListingClick = () => {
    navigate(`/listing/${listing.listingID}`);
  };

  const priceFormatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  });

  const convertDate = (dateString: string) => {
    const dateTimeObject = new Date(dateString);
    return dateTimeObject.toDateString();
  };

  const handleNotInterested = () => {
    setNotInterested(true);
    _axios_instance
      .post("/recommendations/stop", { id: listing.listingID })
      .catch((error) => {
        console.error("Error stopping recommendations:", error);
      });
  };

  return (
    <Grid
      container
      direction="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      spacing={3}
      maxWidth="29vw"
      sx={{
        margin: "1.5%",
        cursor: "pointer",
        background: notInterested ? colors.martletplaceNotInterested : "none",
        pointerEvents: notInterested ? "none" : "auto",
        borderRadius: "8px",
        paddingBottom: "8px",
      }}
      className="listing-card"
      onClick={handleListingClick}
    >
      <Grid
        item
        xs={12}
        sx={{
          width: "90%",
          maxHeight: "40vh",
          display: "flex",
          justifyContent: "center",
          alignSelf: "left",
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
            margin: "0px",
          }}
        />
      </Grid>
      {!searchPerformed && (
        <Grid item xs={12} sx={{ width: "100%" }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: notInterested
                ? colors.martletplaceGrey
                : "white",
              color: "black",
              outline: "1px solid #808080",
              "&:hover": { backgroundColor: colors.martletplaceGrey },
              textTransform: "none",
              width: "calc(100% - 20px)",
            }}
            onClick={handleNotInterested}
          >
            Not interested
          </Button>
        </Grid>
      )}
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
