import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStyles } from "../styles/pageStyles";
import AccountSidebarItem from "./AccountSidebarItem";
import useUser from "../hooks/useUser";
import SearchBar from "./searchBar";

const AccountSidebar = ({ selectedItem }: { selectedItem: string }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate("/user/login");
  };

  return (
    <>
      <SearchBar />
      <Box sx={{ zIndex: 1 }}>
        <Drawer variant="permanent" sx={styles.drawer}>
          <Divider />
          <List>
            <ListItem onClick={() => navigate(`/user`)}>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {user ? user.name : "Account"}
              </Typography>
            </ListItem>
            <Divider />
            <AccountSidebarItem
              path={`/user`}
              itemName="My Profile"
              selected={selectedItem === "My Profile"}
            />
            <Divider />
            <AccountSidebarItem
              path="/user/listings"
              itemName="My Listings"
              selected={selectedItem === "My Listings"}
            />
            <Divider />
            <AccountSidebarItem
              path="/user/reviews"
              itemName="My Reviews"
              selected={selectedItem === "My Reviews"}
            />
            <Divider />
            {/* Create listing Button */}
            <ListItem
              onClick={() => navigate("/listing/new")}
              sx={styles.CreateListingButton}
            >
              <Typography variant="h5">Create Listing</Typography>
            </ListItem>
            <Divider />
            {/* Logout Button */}
            <ListItem onClick={handleLogout} sx={styles.logOutButton}>
              <Typography variant="h5">Logout</Typography>
            </ListItem>
          </List>
        </Drawer>
      </Box>
    </>
  );
};

export default AccountSidebar;
