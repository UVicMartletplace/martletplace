import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useStyles } from "../styles/pageStyles";
import AccountSidebarItems from "./AccountSidebarItems";

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

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer variant="permanent" sx={styles.drawer}>
        <Divider />
        <List>
          <ListItem onClick={() => navigate("/user")}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Account
            </Typography>
          </ListItem>
          <Divider />
          <AccountSidebarItems
            path="/user"
            itemName="My Profile"
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
          <Divider />
          <AccountSidebarItems
            path="/user/listings"
            itemName="My Listings"
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
          <Divider />
          <AccountSidebarItems
            path="/user/reviews"
            itemName="My Reviews"
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
          <Divider />
        </List>
      </Drawer>
    </Box>
  );
};

export default AccountSidebar;
