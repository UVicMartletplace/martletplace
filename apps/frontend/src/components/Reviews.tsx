import { useState } from "react";
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  IconButton,
  FormHelperText,
  Card,
  CardContent,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useStyles } from "../styles/pageStyles";
import _axios_instance from "../_axios_instance";
import { colors } from "../styles/colors";

export interface Review {
  listing_review_id: string;
  reviewerName: string;
  stars: number;
  comment: string;
  userID: string;
  listingID: string;
  dateCreated: string;
  dateModified: string;
}

const Reviews = ({ reviews }: { reviews: Review[] }) => {
  const classes = useStyles();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [reviewError, setReviewError] = useState("");
  const starRatings = [1, 2, 3, 4, 5];

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handlePostReview = async () => {
    if (!rating) {
      setReviewError("Please provide a star rating");
      return;
    }

    const newReviewObject = {
      listing_rating_id: rating,
      stars: rating,
      comment: reviewText,
      listingId: reviews[0].listingID,
    };

    try {
      await _axios_instance.post("/review", newReviewObject);
    } catch (error) {
      console.error("Error posting review:", error);
      alert("Error posting review, please try again later");
      return;
    }
    setReviewError("");
  };

  return (
    <Container>
      <Typography variant="h6">Reviews</Typography>
      <Grid item>
        {starRatings.map((star) => (
          <IconButton
            key={star}
            id="stars"
            onClick={() => handleRatingChange(star)}
          >
            {rating && rating >= star ? (
              <StarIcon style={{ color: colors.martletplaceStarYellow }} />
            ) : (
              <StarBorderIcon
                style={{ color: colors.martletplaceStarYellow }}
              />
            )}
          </IconButton>
        ))}
      </Grid>
      <TextField
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        value={reviewText}
        onChange={(event) => setReviewText(event.target.value)}
        placeholder="Write your review here..."
        id="review_text"
        sx={{ marginBottom: 2 }}
      />
      <Grid container alignItems="center" spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePostReview}
            sx={classes.button}
            id="post_review"
          >
            Post
          </Button>
          {reviewError && <FormHelperText error>{reviewError}</FormHelperText>}
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {reviews.map((review) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={review.listing_review_id}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Typography variant="h6">
                  {review.reviewerName || "Anonymous"}
                </Typography>
                <Grid container alignItems="center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <IconButton key={index} disabled>
                      {index < review.stars ? (
                        <StarIcon
                          style={{ color: colors.martletplaceStarYellow }}
                        />
                      ) : (
                        <StarBorderIcon
                          style={{ color: colors.martletplaceStarYellow }}
                        />
                      )}
                    </IconButton>
                  ))}
                </Grid>
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  {review.comment}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Reviews;
