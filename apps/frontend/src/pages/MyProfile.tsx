import { Box, Typography } from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";

const MyProfile = () => {
  return (
    <>
      <AccountSidebar />
      <Box>
        <Typography variant="h5" component="h1" paddingLeft="600px">
          My Profile
        </Typography>
      </Box>
    </>
  );
};

export default MyProfile;
