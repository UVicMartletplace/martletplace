import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useStyles } from "../styles/pageStyles";

const AccountSidebar = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string>("");

  useEffect(() => {
    // Set the selected item based on the current path
    switch (location.pathname) {
      case "/user":
        setSelectedItem("My Profile");
        break;
      case "/user/listings":
        setSelectedItem("My Listings");
        break;
      case "/user/reviews":
        setSelectedItem("My Reviews");
        break;
      default:
        setSelectedItem("My Profile");
        break;
    }
  }, [location.pathname]);

  const handleListItemClick = (path: string, itemName: string) => {
    navigate(path);
    setSelectedItem(itemName);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer variant="permanent" sx={styles.drawer}>
        <Divider />
        <List>
          <ListItem onClick={() => handleListItemClick("/user", "My Profile")}>
            <ListItemText
              primary={
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  Account
                </Typography>
              }
            />
          </ListItem>
          <Divider />
          <ListItemButton
            onClick={() => handleListItemClick("/user", "My Profile")}
            sx={{
              ...styles.listItemButton,
              backgroundColor:
                selectedItem === "My Profile"
                  ? styles.listItemText.backgroundColor
                  : "transparent",
            }}
          >
            <ListItemText
              primary={<Typography variant="h5">My Profile</Typography>}
            />
          </ListItemButton>
          <Divider />
          <ListItemButton
            onClick={() => handleListItemClick("/user/listings", "My Listings")}
            sx={{
              ...styles.listItemButton,
              backgroundColor:
                selectedItem === "My Listings"
                  ? styles.listItemText.backgroundColor
                  : "transparent",
            }}
          >
            <ListItemText
              primary={<Typography variant="h5">My Listings</Typography>}
            />
          </ListItemButton>
          <Divider />
          <ListItemButton
            onClick={() => handleListItemClick("/user/reviews", "My Reviews")}
            sx={{
              ...styles.listItemButton,
              backgroundColor:
                selectedItem === "My Reviews"
                  ? styles.listItemText.backgroundColor
                  : "transparent",
            }}
          >
            <ListItemText
              primary={<Typography variant="h5">My Reviews</Typography>}
            />
          </ListItemButton>
          <Divider />
        </List>
      </Drawer>
    </Box>
  );
};

export default AccountSidebar;
