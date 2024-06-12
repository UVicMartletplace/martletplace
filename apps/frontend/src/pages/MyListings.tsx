import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";

const MyListings = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <>
      {isDesktop && <AccountSidebar selectedItem="My Listings" />}
      <Box>
        <Typography
          variant="h5"
          component="h1"
          paddingLeft={isDesktop ? "600px" : "0"}
        >
          My Listings
        </Typography>
      </Box>
    </>
  );
};

export default MyListings;
