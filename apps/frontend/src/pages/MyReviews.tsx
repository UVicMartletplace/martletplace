import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import AccountSidebar from "../components/AccountSidebar";

const MyReviews = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <>
      {isDesktop && <AccountSidebar selectedItem="My Reviews" />}
      <Box
        sx={{
          display: "flex",
          position: "relative",
          zIndex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingLeft: isDesktop ? "250px" : "0",
        }}
      >
        <Typography variant="h4" sx={{ marginTop: 2 }}>
          My Reviews
        </Typography>
      </Box>
    </>
  );
};

export default MyReviews;
