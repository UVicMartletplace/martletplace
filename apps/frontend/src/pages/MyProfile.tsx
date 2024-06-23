import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";
import SearchBar from "../components/searchBar";

const MyProfile = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <>
      <SearchBar />
      {isDesktop && <AccountSidebar selectedItem="My Profile" />}
      <Box
        sx={{
          paddingLeft: isDesktop ? "400px" : "0",
          display: "flex",
          height: "100vh",
        }}
      >
        <Typography variant="h5" component="h1">
          My Profile
        </Typography>
      </Box>
    </>
  );
};

export default MyProfile;
