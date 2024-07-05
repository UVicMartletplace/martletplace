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
import useUser from "../hooks/useUser";

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

interface ReviewsProps {
  listingID: string;
  reviews: Review[];
}

interface NewReview {
  listing_review_id: string;
  stars: number;
  comment: string;
  listingID: string;
}

const Reviews = ({ reviews, listingID }: ReviewsProps) => {
  const classes = useStyles();
  const { user } = useUser();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [reviewList, setReviewList] = useState(reviews);
  const starRatings = [1, 2, 3, 4, 5];

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handlePostReview = async () => {
    if (!rating) {
      setReviewError("Please provide a star rating");
      return;
    }

    const newReviewObject: NewReview = {
      listing_review_id: new Date().getTime().toString(), // Temporary ID for client-side only
      stars: rating,
      comment: reviewText,
      listingID: listingID,
    };

    try {
      await _axios_instance.post("/review", newReviewObject);
      const fullReviewObject: Review = {
        ...newReviewObject,
        reviewerName: user?.name || "Anonymous",
        userID: user?.id || "CurrentUser",
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      };
      setReviewList([...reviewList, fullReviewObject]);
      setReviewText("");
      setRating(null);
      setReviewError("");
    } catch (error) {
      console.error("Error posting review:", error);
      alert("Error posting review, please try again later");
    }
  };

  return (
    <Container>
      <Typography variant="h6" sx={{ paddingTop: "10px" }}>
        Reviews
      </Typography>
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
        {reviewList.map((review) => (
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
