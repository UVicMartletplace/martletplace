import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";

const MyProfile = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <>
      {isDesktop && <AccountSidebar selectedItem="My Profile" />}
      <Box>
        <Typography
          variant="h5"
          component="h1"
          paddingLeft={isDesktop ? "600px" : "0"}
        >
          My Profile
        </Typography>
      </Box>
    </>
  );
};

export default MyProfile;
