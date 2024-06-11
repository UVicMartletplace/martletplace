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
import { useState } from "react";
import YourProfile from "../components/Account/YourProfile";
import YourListings from "../components/Account/YourListings";
import YourReviews from "../components/Account/YourReviews";
import { useStyles } from "../styles/pageStyles";

const Account = () => {
  const [selectedComponent, setSelectedComponent] = useState<JSX.Element>(
    <YourProfile />,
  );
  const [selectedItem, setSelectedItem] = useState<string>("Your Profile");
  const styles = useStyles();

  const handleListItemClick = (component: JSX.Element, itemName: string) => {
    setSelectedComponent(component);
    setSelectedItem(itemName);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer variant="permanent" sx={styles.drawer}>
        <Divider />
        <List>
          <ListItem
            onClick={() => handleListItemClick(<YourProfile />, "Your Profile")}
          >
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
            onClick={() => handleListItemClick(<YourProfile />, "Your Profile")}
            sx={{
              ...styles.listItemButton,
              backgroundColor:
                selectedItem === "Your Profile"
                  ? styles.listItemText.backgroundColor
                  : "transparent",
            }}
          >
            <ListItemText
              primary={<Typography variant="h5">Your Profile</Typography>}
            />
          </ListItemButton>
          <Divider />
          <ListItemButton
            onClick={() =>
              handleListItemClick(<YourListings />, "Your Listings")
            }
            sx={{
              ...styles.listItemButton,
              backgroundColor:
                selectedItem === "Your Listings"
                  ? styles.listItemText.backgroundColor
                  : "transparent",
            }}
          >
            <ListItemText
              primary={<Typography variant="h5">Your Listings</Typography>}
            />
          </ListItemButton>
          <Divider />
          <ListItemButton
            onClick={() => handleListItemClick(<YourReviews />, "Your Reviews")}
            sx={{
              ...styles.listItemButton,
              backgroundColor:
                selectedItem === "Your Reviews"
                  ? styles.listItemText.backgroundColor
                  : "transparent",
            }}
          >
            <ListItemText
              primary={<Typography variant="h5">Your Reviews</Typography>}
            />
          </ListItemButton>
          <Divider />
        </List>
      </Drawer>
      <Box component="main" sx={styles.mainContent}>
        {selectedComponent}
      </Box>
    </Box>
  );
};

export default Account;
