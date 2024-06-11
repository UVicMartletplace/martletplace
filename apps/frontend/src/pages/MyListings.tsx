import { Box, Typography } from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";

const MyListings = () => {
  return (
    <>
      <AccountSidebar />
      <Box>
        <Typography variant="h5" component="h1" paddingLeft="600px">
          My Listings
        </Typography>
      </Box>
    </>
  );
};

export default MyListings;
