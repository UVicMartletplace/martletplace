import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useStyles } from "../styles/pageStyles";
import AccountSidebarItem from "./AccountSidebarItem";
import SearchBar from "./searchBar";

const AccountSidebar = ({ selectedItem }: { selectedItem: string }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <>
      <SearchBar />
      <Box sx={{ display: "flex" }}>
        <Drawer variant="permanent" sx={styles.drawer}>
          <Divider />
          <List>
            <ListItem onClick={() => navigate(`/user/${id}`)}>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                Account
              </Typography>
            </ListItem>
            <Divider />
            <AccountSidebarItem
              path={`/user/${id}`}
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
          </List>
        </Drawer>
      </Box>
    </>
  );
};

export default AccountSidebar;
