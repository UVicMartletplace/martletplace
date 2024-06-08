import React, { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Card, Slide, Typography } from "@mui/material";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export interface props {
  imageURLs: string[];
}
const Carousel = ({ imageURLs }: props) => {
  const [cards, setCards] = useState<React.ReactElement[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        height: "400px",
      }}
    >
      <IconButton
        onClick={handlePrevPage}
        sx={{ margin: 5 }}
        disabled={currentPage === 0}
      >
        <ArrowLeftIcon />
      </IconButton>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "center",
          height: "400px",
        }}
      >
        {cards.map((_card, index) => (
          <Box
            key={"card-" + index}
            sx={{
              width: "100%",
              height: "100%",
              display: currentPage === index ? "block" : "none",
            }}
          >
            <Box></Box>
            <Slide direction={slideDirection} in={currentPage === index}>
              <img src={imageURLs[index]} style={{ height: "100%" }} />
            </Slide>
            <Typography variant={"body2"} sx={{ textAlign: "center" }}>
              Image: {index}
            </Typography>
          </Box>
        ))}
      </Box>
      <IconButton
        onClick={handleNextPage}
        sx={{ margin: 5 }}
        disabled={currentPage === images.length - 1}
      >
        <ArrowRightIcon />
      </IconButton>
    </Box>
  );
};

export default Carousel;
