import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Card,
  Slide,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export interface props {
  imageURLs: string[];
}
const Carousel = ({ imageURLs }: props) => {
  const [cards, setCards] = useState<React.ReactElement[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [slideDirection, setSlideDirection] = useState<
    "right" | "left" | undefined
  >("left");

  const images: React.ReactElement[] = useMemo(() => {
    return Array.from({ length: imageURLs.length }, (_, i) => <Card key={i} />);
  }, [imageURLs]);

  const handleNextPage = () => {
    setSlideDirection("left");
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setSlideDirection("left");
    setCurrentPage((prevPage) => prevPage - 1);
  };

  useEffect(() => {
    setCards(images);
  }, [images]);

  return (
    <Paper sx={{
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      padding: "5%",
      margin: "5%",
      width: "85%"
    }}
    >
      <Grid
        container
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "center",
          width: "100%",
          height: "50vh",
          my: "1vh",
        }}
      >
        <Grid item sm={12} sx={{ height: "100%", width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              alignContent: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            {cards.map((_card, index) => (
              <Box
                key={"card-" + index}
                sx={{
                  height: "98%",
                  width: "98%",
                  textAlign: "center",
                  display: currentPage === index ? "block" : "none",
                  p: "10px",
                }}
                id={"carousel_img_box"}
              >
                <Slide direction={slideDirection} in={currentPage === index}>
                  <img
                    src={imageURLs[index]}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    alt={"Listing image index:" + index}
                  />
                </Slide>
              </Box>
            ))}
          </Box>
        </Grid>
        <Grid item sm={3}></Grid>
        <Grid item sm={2} sx={{textAlign: "center", alignItems: "center" }}>
          <IconButton
            onClick={handlePrevPage}
            sx={{
              zIndex: 1,
            }}
            disabled={currentPage === 0}
            id={"carousel_left"}
          >
            <ArrowLeftIcon />
          </IconButton>
        </Grid>
        <Grid
          item
          sm={2}
          sx={{ textAlign: "center", alignItems: "center" }}
        >
          <Typography id={"carousel_index"}>{currentPage + 1}</Typography>
        </Grid>
        <Grid item sm={2} sx={{ textAlign: "center", alignItems: "center" }}>
          <IconButton
            onClick={handleNextPage}
            sx={{
              zIndex: 1,
            }}
            disabled={currentPage === images.length - 1}
            id={"carousel_right"}
          >
            <ArrowRightIcon />
          </IconButton>
        </Grid>
        <Grid item sm={3}></Grid>
      </Grid>
    </Paper>
  );
};

export default Carousel;
