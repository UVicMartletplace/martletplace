import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";

const MyReviews = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <>
      {isDesktop && <AccountSidebar />}
      <Box sx={{}}>
        <Typography
          variant="h5"
          component="h1"
          paddingLeft={isDesktop ? "600px" : "0"}
        >
          My Reviews
        </Typography>
      </Box>
    </>
  );
};

export default MyReviews;
